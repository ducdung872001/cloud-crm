# Seed spec — `contract` service (TNPM)

## Datasets (5 master)

| # | Dataset | Source | Records | Maps to BE table |
|---|---|---|---|---|
| 1 | `MOCK_LEASE_CONTRACTS` | snapshot L85–146 | 4 | `contract` (type=lease) |
| 2 | `MOCK_SERVICE_CONTRACTS` | snapshot L148–152 | 3 | `contract` (type=service) |
| 3 | `MOCK_VENDOR_CONTRACTS` | snapshot L170–175 | 4 | `contract` (type=vendor) |
| 4 | `MOCK_PARTNER_CONTRACTS` | snapshot L726–841 | ~10 | `contract` (type=partner) |
| 5 | `MOCK_B2G_BUDGETS` | snapshot L948–968 | 1 | `contract` extension hoặc bảng riêng `b2g_budget` |

## Shape tóm tắt

**Lease contracts (4 mẫu)** — phức tạp nhất, có nested fields:
- `escalationSchedule[]`: array các kỳ tăng giá (period, effectiveDate, rentAmount, rate, status)
- `depositPaid, depositPaidAt, depositPaidMethod, depositRefundable, depositHeldBy` — deposit ledger
- `autoRenew, renewalNoticeDays, renewalStatus, renewalNotifiedAt`
- `turnoverRentRate` (chỉ retail) — % doanh thu tính phí thuê
- `camFee, marketingLevy, overtimeRate` — extras
- Loại: residential / office / industrial / retail (4 mẫu = 4 loại)

**Service contracts (3 mẫu)** — phí quản lý/dịch vụ định kỳ, services array.

**Vendor contracts (4 mẫu)** — SLA, đơn giá theo project + serviceType. Cross-ref `vendorId` → customer.

**Partner contracts (~10 mẫu)** — operator vận hành, bonus, commission.

**B2G budgets (1 mẫu)** — ngân sách dự án hành chính cả năm, breakdown theo categories (maintenance/utilities/security/cleaning/admin).

## Schema notes

- `contract` service master table tên `contract`, polymorphic theo `contract_type`. Phụ lục → `contract_appendix`. Bảo lãnh → `guarantee`. Payment schedule → `contract_payment`.
- Escalation schedule có thể store JSON column hoặc tách bảng `contract_escalation`.
- Multi-tenant `bsn_id`.

## Cross-service deps

- `lease/service.customerId` → customer
- `lease/service.projectId/unitId` → operation
- `vendor.vendorId` → customer
- `partner.partnerId` → customer
- `B2G_budget.projectId` → operation (project HC Ba Đình)

→ Dispatch SAU customer + operation.

## Ready-to-dispatch body

```
service=contract
slug=seed-contracts-tnpm
goal="Seed lease/service/vendor/partner contracts + B2G budgets cho tenant <tnpm-tenant>"
scope="5 dataset (~22 records). Yêu cầu customer + operation đã seed xong để map FK."
```
