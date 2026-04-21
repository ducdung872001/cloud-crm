# [billing] Reconciliation trả dữ liệu cross-tenant

**Severity:** 🔴 CRITICAL (data leak giữa các tenant)
**Service:** `cloud-billing-master`
**Endpoint:** `GET /billing/reconciliation/list`
**Phát hiện:** 2026-04-21, quan sát trên nhánh community-hub (tenant mới tạo)

---

## Hiện tượng

FE gọi `GET /billing/reconciliation/list?limit=10&page=1` với header `Hostname: <tenant-mới>` — BE trả về 2 giao dịch **không thuộc tenant đó** (data của tenant khác hoặc seed demo):

```
21/03/2026 21:37:56 | N/A | VQR39fb857fee THANH TOAN DON HANG | +100.000 VND | Đã khớp
21/03/2026 21:33:25 | N/A | abc                               |   -1.000 VND | Đã khớp
```

Tenant vừa được provisioning, chưa phát sinh bất kỳ giao dịch nào → đáng lẽ phải trả `items: []`.

## Nguyên nhân nghi ngờ

Một hoặc kết hợp các case:

1. **Query không filter theo `tenantId`** lấy từ `X-Tenant-ID` / `Hostname` header → đọc nguyên bảng `reconciliation_statement` (hoặc tương đương).
2. **Data seed demo** được INSERT vào DB mà không gán `tenant_id`, → mọi tenant đều thấy.
3. **Gateway không inject `X-Tenant-ID`** cho endpoint này → BE nhận request thiếu tenant context, fallback về "all tenants".

## Việc cần làm

### 1. Audit query

Tìm mọi query đọc `reconciliation_statement` (hoặc bảng tương đương) trong `cloud-billing-master`. Mọi query phải có điều kiện `WHERE tenant_id = :tenantId`. Liệt kê các endpoint cùng domain để kiểm tra đồng bộ:

- `GET /billing/reconciliation/list`
- `GET /billing/reconciliation/get?id=…`
- `GET /billing/reconciliation/summary` (nếu có)
- `POST /billing/reconciliation/manual-match`
- Mọi endpoint `/billing/payment/*`, `/billing/debt/*`, `/billing/cashbook/*`, `/billing/fund/*` cùng pattern

### 2. Chuẩn hoá tenant extraction

- Đảm bảo **gateway** (hoặc middleware BE) inject `X-Tenant-ID` đúng từ header `Hostname` (domain tenant) hoặc JWT claim.
- Trong service, có helper `TenantContext.current().id` dùng chung — **cấm** đọc header trực tiếp trong từng handler.
- Nếu `tenantId` null/missing → reject với `403 MISSING_TENANT` thay vì fallback silent.

### 3. Dọn data seed

Kiểm tra bảng `reconciliation_statement` (và các bảng liên quan: `payment`, `bank_transaction`, `cashbook_entry`, …) — nếu có record `tenant_id IS NULL` → gán lại về tenant sandbox thuộc riêng, **KHÔNG** để NULL lan ra prod.

### 4. Test regression

Verify trên **≥ 2 tenant** thuộc **≥ 2 ngành** khác nhau:

- Tenant A (ví dụ `kcn.reborn.vn`) tạo 3 giao dịch.
- Tenant B (ví dụ `hub.reborn.vn`) query `/billing/reconciliation/list` → phải thấy `items: []`.
- Tenant A query → phải thấy đúng 3 giao dịch của mình.

### 5. Áp dụng pattern cho cross-service

Sau khi fix billing, **audit cùng pattern** cho 11 microservice khác. Có thể có lỗ hổng tương tự ở:

- `/customer/customer/list` (nếu chưa filter)
- `/sales/invoice/list`
- `/inventory/warehouse/list`
- `/notification/feedbackHistory/list`
- …

Làm task riêng cho từng service nếu phát hiện.

## Acceptance Criteria

- [ ] Query `reconciliation_statement` có `WHERE tenant_id = :ctx.tenantId` 100%
- [ ] Request thiếu `X-Tenant-ID` → response `403 MISSING_TENANT` (không silent fallback)
- [ ] Test 2 tenant khác ngành: không thấy data của nhau
- [ ] Regression test cho mọi endpoint `/billing/*` cùng pattern (checklist)
- [ ] Data seed `tenant_id IS NULL` được xử lý (xoá hoặc gán tenant sandbox)

## Lưu ý không phá ngành khác

- Fix này là **cross-cutting** (multi-tenant hardening) — áp cho mọi ngành.
- Không hardcode business rule của một ngành.
- Không đổi shape response (vẫn trả `{ items, page, total, totalPage }`) để FE không cần sửa.

## Reference

- FE caller: [src/hooks/useReconciliationList.ts](../../../src/hooks/useReconciliationList.ts)
- FE page: [src/pages/Reconcile/index.tsx](../../../src/pages/Reconcile/index.tsx)
- URL map: `prefixBilling + "/reconciliation/list"` trong [src/configs/urls.ts:854](../../../src/configs/urls.ts#L854)
