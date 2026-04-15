# Backend Tasks — Phân theo Microservice

Tài liệu này được tổ chức theo **ranh giới DDD** — mỗi microservice tự quản task domain của mình. Backend là **code dùng chung** cho mọi ngành (retail, community-hub, tech, vận hành TNPM, …), vì vậy mỗi fix phải **neutral theo ngành**: không hardcode business rule của một ngành cụ thể, phải config hóa hoặc extend qua feature flag / tenant setting.

## ⚠️ Lưu ý trước khi fix

1. **Không phá ngành khác** — test regression trên ít nhất 2 tenant thuộc 2 ngành khác nhau trước khi merge.
2. **API contract stable** — nếu thay đổi breaking, bump version endpoint (`/v2/…`) và giữ legacy cho tới khi mọi FE ngành migrate xong.
3. **Config > hardcode** — rule khác nhau giữa các ngành (ví dụ: VAT 8% vs 10%, voucher stacking, return window) phải đọc từ bảng config/tenant setting, không if/else theo tenant.
4. **Outbox pattern** cho cross-service writes — tránh inconsistency khi sale/market/inventory không share DB.

---

## 📁 Thư mục theo microservice

### [sales/](./sales/) — `cloud-sales-master`
Sale transactions, shift, invoice, cancel flow, dashboard.

| File | Severity | Tóm tắt |
|------|----------|---------|
| [invoice-list-cancelled-filter.md](./sales/invoice-list-cancelled-filter.md) | 🟡 MEDIUM | `/invoice/list?status=3` và filter date không trả cancelled invoices (round 2, 2/6 còn open) |
| [shift-close-cash-diff.md](./sales/shift-close-cash-diff.md) | 🔴 CRITICAL | `/shift/close` tính `cashDifference` sai công thức |
| [invoice-create-voucher-promotion-fields.md](./sales/invoice-create-voucher-promotion-fields.md) | 🔴 CRITICAL | Mở rộng `/invoice/create` nhận `couponCode` + `promotionId` → link usage record |

### [inventory/](./inventory/) — `cloud-inventory-master`
Warehouse, product, unit, stock ledger, import/export.

| File | Severity | Tóm tắt |
|------|----------|---------|
| [stock-product-list-NA.md](./inventory/stock-product-list-NA.md) | 🔴 HIGH | `/inventoryBalance/stockProduct/list` trả `"N/A"` cho `productName`, `batchNo`, `expiryDate` |
| [import-invoice-error-response.md](./inventory/import-invoice-error-response.md) | 🟡 MEDIUM | Error response của `/invoice/import/update` mơ hồ + stock ledger không tạo khi approve |
| [warehouse-create-api.md](./inventory/warehouse-create-api.md) | 🟡 MEDIUM | Các bug nhỏ phát hiện từ Playwright (warehouse create, unit_type, barcode) |
| [warehouse-list-code-missing.md](./inventory/warehouse-list-code-missing.md) | 🔴 CRITICAL | `GET /warehouse/list` không trả field `code` dù create đã lưu |
| [product-delete-safety.md](./inventory/product-delete-safety.md) | 🟡 MEDIUM | Validate safe-delete cho product khi có transaction |
| [unit-delete-safety.md](./inventory/unit-delete-safety.md) | 🟡 MEDIUM | Validate safe-delete cho unit khi đang được tham chiếu |

### [market/](./market/) — `cloud-market-master`
Voucher, promotion (CTKM), campaign, marketing.

| File | Severity | Tóm tắt |
|------|----------|---------|
| [voucher-promotion-unified.md](./market/voucher-promotion-unified.md) | 🔴 CRITICAL | **Unified design** cho voucher + promotion: schema `*_usage`, reverse flow, reports, audit log, budget enforcement, alerting |

---

## 🔗 Cross-service tasks

Một số task yêu cầu phối hợp nhiều microservice:

| Task | Sales | Market | Inventory |
|------|:-:|:-:|:-:|
| Voucher/Promotion tracking per invoice | ✅ [sales](./sales/invoice-create-voucher-promotion-fields.md) | ✅ [market](./market/voucher-promotion-unified.md) | — |
| Cancel via return (IV2) reverse usage | ✅ sales (reverse call) | ✅ market (reverse service) | ✅ inventory (restock) |
| Import invoice approve → stock ledger | ✅ sales (call approve) | — | ✅ inventory (ledger write) |

**Nguyên tắc:** mỗi doc sống ở microservice **chủ** (nơi có business logic chính). Các microservice khác chỉ có doc ngắn pointer.

---

## 📋 Quy ước viết task mới

Mỗi file task phải có frontmatter:

```markdown
# BACKEND TASK — <tên ngắn>

**Discovered:** YYYY-MM-DD — <source: test script / bug report / incident>
**Severity:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW
**Module:** `cloud-<name>-master`
**Endpoints affected:** <list>
```

Sau đó các section: Mô tả → Hard evidence → Root cause → Action → Re-test → Files FE liên quan.

**Tên file:** kebab-case, không prefix `BACKEND-TASK-` (thư mục đã nói rồi).

**Delete policy:** khi task **fully done** (BE deploy + FE retest pass), xóa file khỏi đây. Nếu done một phần, strip phần done chỉ giữ phần còn lại.
