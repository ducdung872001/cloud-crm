# BACKEND TASK — `insertBatch` HTTP 500 khi hoàn thành từ đơn tạm

**Discovered:** 2026-04-12 — E2E test `test-e2e-sales-vat-flow.mjs` (S2)
**Status (2026-04-12):** ✅ **Root cause là FE — đã fix.** BE chỉ cần cải thiện error handling.
**Severity:** 🟡 MEDIUM (BE side) — chỉ còn vấn đề ergonomics: BE leak SQL stacktrace ra response thay vì trả validation error.
**Module:** `cloud-sales-master` — endpoint `POST /sales/boughtProduct/insertBatch`

---

## Tóm tắt

Bug chính (FE): khi "Tiếp tục xử lý" từ đơn tạm, FE drop mất `unitId` của sản phẩm khi map từ API response (`/invoice/draft/list-with-products`) về `CartItemForDraft`. Khi click "Tạo hoá đơn" trong PayModal, FE gửi `insertBatch` thiếu `unitId` → BE INSERT vào `bought_product` (cột `unit_id`) bị vi phạm constraint → SQLException → 500.

→ **Đã fix FE** (commit chuẩn bị): bổ sung `unitId` vào `CartItemForDraft` và copy `p.unitId` trong `mapRawToDraftOrder`.

## Phần BE cần làm

Mặc dù root cause ở FE, BE vẫn cần fix 2 điểm:

### 1. KHÔNG leak SQL stacktrace ra response

Hiện tại response body là raw `SQLException.getMessage()`:

```json
{
  "error": "SQL [insert into `bought_product` (`id`, `product_id`, `variant_id`, `batch_no`, `unit_id`, `price`, `price_discount`, `quantity`, `expiry_date`, `discount`, `discount_unit`, `vat`, `fee`, ..."
}
```

→ Lộ schema bảng (`bought_product`, tên cột) ra FE/log + đẩy stacktrace về client. Risk: information disclosure.

**Cần sửa**: catch `DataIntegrityViolationException` / SQLException ở `BoughtProductService.insertBatch`, log full stacktrace ở BE, return `{code: -1, message: "Sản phẩm thiếu đơn vị tính (unitId)"}` hoặc tương tự.

### 2. Validate `unitId` ở DTO trước khi vào DB

Hiện tại endpoint accept request mà không validate `unitId` not null → đẩy xuống tầng SQL mới phát hiện. Nên thêm `@NotNull` (hoặc check trong service layer) cho field `unitId` của `BoughtProductInsertItem` để fail-fast với 400 Bad Request kèm message rõ ràng.

```java
// pseudo
public class BoughtProductInsertItem {
  @NotNull(message = "unitId is required")
  Long unitId;
  // ...
}
```

### 3. (Optional) Kiểm tra schema constraint

Confirm xem `bought_product.unit_id` là `NOT NULL` hay là FK ràng buộc — để chắc rằng business rule đúng (mỗi bought_product phải có 1 đơn vị tính).

## Hard evidence (E2E 2026-04-12)

```
Draft invoice #3842 (saved) → Continue → New invoice #3843
POST /sales/boughtProduct/insertBatch?invoiceId=3843&paid=100000&debt=0&fundId=1
Body: [{ productId: 341, variantId: 438, price: 100000, quantity: 1, name: ..., /* unitId MISSING */ }]
→ HTTP 500
→ {"error": "SQL [insert into `bought_product` ..."}
```

Cùng product/variant ở luồng POS bình thường (load từ catalog) → INSERT thành công vì `unitId` được set từ Product.unitId.

## Re-test sau khi BE fix

```bash
# Sau khi FE fix unitId:
node tests/test-e2e-sales-vat-flow.mjs
# Expected: S2-06 "Xac nhan thanh toan" PASS

# Sau khi BE fix error response:
# Manually gửi insertBatch không có unitId → BE phải trả 400 + message rõ ràng (không leak SQL)
```

## Files FE đã fix

- [DraftOrders/types.ts:26-37](src/pages/CounterSales/components/DraftOrders/types.ts#L26-L37) — thêm `unitId?: number` vào `CartItemForDraft`
- [DraftOrders/types.ts:102-114](src/pages/CounterSales/components/DraftOrders/types.ts#L102-L114) — `mapRawToDraftOrder` copy `p.unitId` khi build cartItems
