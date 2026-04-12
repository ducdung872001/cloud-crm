# BACKEND TASK — `/invoice/create` & `/invoice/get-for-vat` thiếu thông tin khách hàng

**Discovered:** 2026-04-12 — E2E test `test-e2e-sales-vat-flow.mjs` (S5, S6)
**Re-tested:** 2026-04-12 (after BE round 1 fix) — ⚠️ **CHƯA XONG**: BE đã thêm field vào response schema nhưng giá trị vẫn `null`. Cần JOIN customer table để populate.
**Severity:** 🟡 MEDIUM — Trang xuất HĐ VAT không prefill được tên/MST/địa chỉ KH → user phải gõ tay
**Module:** `cloud-sales-master`

---

## Mô tả bug

### Bug 1: `POST /sales/invoice/create` không trả `customerName` trong response

FE gửi body có `customerName: "Test CRUD 2n8i"` và `customerId: 8642533`, BE response:
```json
{
  "code":0,
  "result":{
    "id":3863,
    "invoiceCode":"HD003863",
    "customerId":8642533,
    /* customerName: MISSING */
    ...
  }
}
```

→ FE không thể hiển thị/log lại tên KH ngay sau tạo đơn.

### Bug 2 (chính): `GET /sales/invoice/get-for-vat?code=HD003863` trả về thiếu KH info

Trang `invoiceVAT?tab=issue&code=HD003863` gọi endpoint này để prefill form xuất HĐ VAT. FE expect các field:
- `customerName` → fill vào "Tên người mua"
- `taxCode` → fill vào "Mã số thuế"
- `customerAddress` → fill vào "Địa chỉ"
- `customerEmail` → fill vào "Email"

Hiện tại response thiếu các field trên (hoặc toàn null), kể cả khi đơn được tạo bằng KH thật (customerId > 0). Kết quả: form prefill chỉ có items, các field thông tin người mua **hoàn toàn trống** → user phải gõ lại bằng tay → khó dùng và dễ sai sót.

## Hard evidence sau BE round 1 (2026-04-12)

BE đã update response schema (đã có các field), NHƯNG values vẫn null:

```
GET /sales/invoice/get-for-vat?code=HD003891
→ status=200, code=0
→ result: {
    customerId: 4917368,
    customerName: null,        ← VAN NULL
    customerPhone: null,       ← VAN NULL
    customerEmail: null,       ← VAN NULL
    customerAddress: null,     ← VAN NULL
    taxCode: null,             ← VAN NULL
    invoiceId: 3891, invoiceCode: "HD003891", ...
    boughtProducts: [{ ... }]
  }
```

**Cross-check: customer 4917368 thực sự tồn tại trong DB:**

```
GET /adminapi/customer/get?id=4917368
→ status=200, code=0, name="KH Test qveht"

GET /adminapi/customer/get?id=4918496
→ status=200, code=0, name="KH Test sqiy4"

GET /adminapi/customer/get?id=4917083
→ status=200, code=0, name="KH Test qknul"
```

→ KH có tên đầy đủ trong DB. `/invoice/get-for-vat` đang **trả thẳng null** thay vì JOIN với customer table.

**Likely root cause**: BE có thể đã thêm field vào DTO `InvoiceForVatResponse` nhưng quên `JOIN customer c ON c.id = i.customer_id` trong query SQL, hoặc đã JOIN nhưng không SELECT các cột customer (vẫn null).

## Hard evidence (E2E 2026-04-12 — round 1, trước fix)

```
1. POS: chọn "Test CRUD 2n8i" (customerId=8642533) → bán → invoice/create OK (HD003863)
   → response.customerName = MISSING
2. Click "📩 Gửi HĐ điện tử" → /invoiceVAT?tab=issue&code=HD003863
   → FE call GET /sales/invoice/get-for-vat?code=HD003863
   → response.customerName = NULL/MISSING
   → Form "Tên người mua" = "" (placeholder "Nhập tên người mua...")
```

Test assertion FE expect: trang VAT phải prefill name/phone/address/MST từ đơn hàng — fail vì BE trả null.

## Action BE

### Fix 1: `/invoice/get-for-vat` phải JOIN customer table

```sql
-- pseudo
SELECT i.*, c.name AS customer_name, c.tax_code, c.address, c.email
FROM invoice i
LEFT JOIN customer c ON c.id = i.customer_id
WHERE i.invoice_code = :code
```

Sau đó response bao gồm:
```json
{
  "result": {
    "id": 3863,
    "invoiceCode": "HD003863",
    "customerId": 8642533,
    "customerName": "Test CRUD 2n8i",       // ← từ customer.name
    "taxCode": "0312345678",                 // ← từ customer.tax_code
    "customerAddress": "123 Lê Lợi, ...",    // ← từ customer.address
    "customerEmail": "test@example.com",     // ← từ customer.email
    "boughtProducts": [...]
  }
}
```

### Fix 2: `/invoice/create` echo `customerName` trong response

Đơn giản: trong response của POST /invoice/create, thêm field `customerName` (lấy từ DB sau khi insert hoặc echo từ request body).

### Edge case: Khách vãng lai (customerId = -1)

- Khi customerId = -1, customer table không có record → các field name/tax/address/email ở response phải là `null` hoặc empty string
- FE đã handle case này (khi rỗng thì để user nhập tay)
- Hoặc BE lấy `customerName` từ field invoice table (nếu BE có lưu lúc create)

### Edge case: KH cá nhân (custType=1) không có MST

- `taxCode` = null là OK, FE để input trống (hợp lệ với cá nhân không kinh doanh)
- Vẫn có thể xuất HĐ VAT theo quy định Nghị định 123/2020

## Re-test

```bash
node tests/test-e2e-sales-vat-flow.mjs
# S5-07 (prefill name on VAT page) FAIL hiện tại — sẽ PASS sau khi BE fix
# S5-08 (field name ≠ vãng lai) FAIL hiện tại — sẽ PASS sau khi BE fix
# S5-05/S6-05 (response.customerName) FAIL hiện tại — sẽ PASS sau Fix 2
```

## Files FE liên quan (chỉ tham khảo)

- [IssueInvoice/index.tsx:117-156](src/pages/Sell/InvoiceVAT/partials/IssueInvoice/index.tsx#L117-L156) — `handleLoadOrder` đọc `inv.customerName`, `inv.taxCode`, `inv.customerAddress`, `inv.customerEmail`
- [VatInvoiceService.ts:133-137](src/services/VatInvoiceService.ts#L133-L137) — endpoint `GET /sales/invoice/get-for-vat?code=`
- [ReceiptModal/index.tsx:148-182](src/pages/CounterSales/components/modals/ReceiptModal/index.tsx#L148-L182) — body của POST `/invoice/create` có `customerName`
