# [inventory] Audit tenant isolation toàn microservice

**Severity:** 🔴 CRITICAL (data leak giữa các tenant)
**Service:** `cloud-inventory-master`
**Phát hiện:** 2026-04-21, quan sát trên nhánh community-hub (tenant mới tạo, chưa khai báo bất kỳ dữ liệu nào)
**Liên quan:** [billing/reconciliation-tenant-isolation.md](../billing/reconciliation-tenant-isolation.md) — cùng root cause

---

## Hiện tượng

Tenant mới provisioning (ví dụ `hub.reborn.vn`), **chưa nhập gì** (0 kho, 0 sản phẩm, 0 phiếu chuyển kho) — nhưng trang `/crm/inventory_checking` tab **Chuyển kho** hiển thị 6 phiếu chuyển kho không thuộc tenant này:

```
STT | Mã phiếu | Kho nguồn             | Kho đích    | Ngày tạo           | Ghi chú         | Trạng thái
1   | #6       | Kho hàng mẫu          | Kho Hà Nội  | 08/04/2026 13:55   | —               | Hoàn thành
2   |          | Kho hàng mẫu          | Test        | 02/04/2026 10:23   | thừa hơi nhiều  | Hoàn thành
3   | #4       | Kho hàng mẫu          | Test        | 30/03/2026 22:35   | thừa ở kho mẫu  | Hoàn thành
4   | #3       | Kho hàng mẫu          | Kho Hà Nội  | 25/03/2026 11:24   | —               | Chờ duyệt
5   | #2       | Kho hàng tổng trực tuyến | Kho hàng mẫu | 25/03/2026 11:24 | hqhq            | Chờ duyệt
6   | …        | …                     | …           | …                  | …               | …
```

Stats card: `Tổng phiếu: 6`, `Chờ duyệt: 3`, `Hoàn thành: 3`, `Đã hủy: 0`.

**Đáng lẽ** tenant mới → `items: []`, `total: 0`.

## Endpoint liên quan

`GET https://biz.reborn.vn/inventory/stockTransfer/list?page=0&size=20`

Toàn bộ 7 endpoint của trang cần audit cùng lúc:

| # | Endpoint | Owner (FE service) |
|---|---|---|
| 1 | `GET /inventory/inventoryBalance/stockProduct/list` | InventoryService.stockProductList |
| 2 | `GET /inventory/invoice/import/list` | InventoryService.importList |
| 3 | `GET /inventory/inventoryTransaction/sale/list` | InventoryService.saleList |
| 4 | `GET /inventory/stockTransfer/list` | InventoryService.stockTransferList |
| 5 | `GET /inventory/inventoryTransaction/destroy/list` | InventoryService.destroyList |
| 6 | `GET /inventory/stockAdjust/list` | AdjustmentSlipService.list |
| 7 | `GET /inventory/inventoryBalance/variant/list` | InventoryService.variantList |

## Nguyên nhân nghi ngờ

Cùng root cause với [billing/reconciliation-tenant-isolation.md](../billing/reconciliation-tenant-isolation.md):

1. Query không filter theo `tenantId` / `bsnId` (business ID) lấy từ `X-Tenant-ID` / `Hostname` header.
2. Data seed demo được INSERT không gán `tenant_id` / `bsnId` → mọi tenant thấy.
3. Gateway không inject `X-Tenant-ID` cho endpoint này.

## Việc cần làm

### 1. Audit query

Mọi repository/DAO đọc các bảng sau phải có `WHERE tenant_id = :tenantId` (hoặc `bsnId`):

- `stock_transfer`, `stock_transfer_detail`
- `inventory_balance`, `inventory_balance_variant`
- `invoice_import`, `invoice_import_detail`
- `inventory_transaction` (sale + destroy)
- `stock_adjust`, `stock_adjust_detail`
- `warehouse`, `product`, `variant`, `category`, `unit` (list endpoints)

### 2. Chuẩn hoá tenant extraction

- Middleware BE inject `tenantId` từ header `X-Tenant-ID` / `Hostname` hoặc JWT claim.
- Helper `TenantContext.current().id` dùng chung — cấm đọc header trực tiếp trong handler.
- Request thiếu tenant → reject `403 MISSING_TENANT`, không silent fallback.

### 3. Dọn data seed

Kiểm tra mọi bảng inventory, nếu có record `tenant_id IS NULL` (hoặc `bsnId IS NULL`) → gán lại về tenant sandbox riêng. **KHÔNG** để NULL ra prod.

### 4. Test regression

- Tenant A tạo 2 kho + 3 phiếu chuyển kho.
- Tenant B (mới tạo) query 7 endpoint trên → **tất cả** phải trả `items: []`, `total: 0`.
- Tenant A query → thấy đúng 2 kho + 3 phiếu của mình.
- Thiếu header tenant → `403 MISSING_TENANT`.

## Acceptance Criteria

- [ ] 7 endpoint liệt kê ở trên đều filter theo tenant
- [ ] Tenant mới (0 data) → response rỗng cho tất cả 7 endpoint
- [ ] Stats card trả `total: 0`, `pending: 0`, `completed: 0`, `cancelled: 0` khi tenant trống
- [ ] Request thiếu `X-Tenant-ID` → `403 MISSING_TENANT`
- [ ] Data seed `tenant_id IS NULL` được xử lý (xoá hoặc gán tenant sandbox)

## Lưu ý không phá ngành khác

- Neutral theo ngành: retail (có kho) / spa (ít kho) / tnpm (kho vật tư) / banking (không dùng) / community-hub (mới dùng)
- Không hardcode business rule ngành
- Không đổi response shape để FE không cần sửa

## Reference

- FE page: [src/pages/ProductImport/InventoryChecking/index.tsx](../../../src/pages/ProductImport/InventoryChecking/index.tsx)
- FE service: [src/services/InventoryService.ts](../../../src/services/InventoryService.ts)
- URL map: [src/configs/urls.ts:629-636](../../../src/configs/urls.ts#L629-L636)
