# Seed Spec — TNPM Mock Data Backup

> **Mục đích:** Backup toàn bộ mock data đang chạy trên FE tnpm để khi switch sang submain mới (hostname `tnpm.reborn.vn` thay vì `kcn.reborn.vn`) — mất dữ liệu thật — vẫn có spec đầy đủ để BE seed lại theo đúng business shape FE đang giả định.
>
> **Nguồn gốc:** Snapshot mock TS verbatim tại [mock-snapshot-tnpm.ts](mock-snapshot-tnpm.ts) (1653 dòng, 44 exports), copy từ `src/assets/mock/TNPMData.ts` ngày 2026-05-12.
>
> **Quy trình dispatch:** Khi cần seed 1 service, mở file tương ứng trong [services/](services/), copy body vào skill `/handoff-out-ms` (đã có sẵn 1 issue mẫu: [cloud-customer-master#14](https://github.com/ducdung872001/cloud-customer-master/issues/14) — vendor master).

## Catalog (44 exports)

### Master entities (cần BE seed)

| Dataset | Lines | Records | Service | Page using |
|---|---|---|---|---|
| `MOCK_PORTFOLIOS` | 6–10 | 3 | `operation` | Portfolio dashboard |
| `MOCK_PROJECTS` | 12–55 | 6 | `operation` | PropertyProjectList |
| `MOCK_UNITS` | 57–74 | 12 | `operation` | PropertyUnitList |
| `MOCK_CUSTOMERS` | 76–83 | 6 | `customer` | CustomerPerson (KH/Tenant) |
| `MOCK_LEASE_CONTRACTS` | 85–146 | 4 | `contract` | LeaseContractList |
| `MOCK_SERVICE_CONTRACTS` | 148–152 | 3 | `contract` | Service contract list |
| `MOCK_INVOICES` | 154–159 | 5 | `sales` | InvoiceList (kỳ phí cư dân) |
| `MOCK_VENDORS` ✅ | 162–168 | 5 | `customer` | VendorManagementList — **handoff dispatched** [#14](https://github.com/ducdung872001/cloud-customer-master/issues/14) |
| `MOCK_VENDOR_CONTRACTS` | 170–175 | 4 | `contract` | VendorContractList |
| `MOCK_VENDOR_INVOICES` | 177–181 | 3 | `sales` | VendorInvoiceList |
| `MOCK_SERVICE_REQUESTS` | 183–188 | 4 | `care` | ServiceRequestList |
| `MOCK_MAINTENANCE_PLANS` | 190–195 | 4 | `care` | MaintenancePlanList |
| `MOCK_TURNOVER_REPORTS` | 197–200 | 2 | `sales` | TurnoverRentList |
| `MOCK_PAYMENTS` | 202–206 | 3 | `billing` | PaymentHistory |
| `MOCK_METER_READINGS` | 310–344 | 6 | `operation` | MeterReadingList |
| `MOCK_UTILITY_RATES` | 346–403 | ~10 | `operation` | UtilityRateList |
| `MOCK_DEBTS` | 405–475 | ~10 | `billing` | DebtManagement |
| `MOCK_DEBT_TRANSACTIONS` | 477–519 | ~7 | `billing` | DebtTransaction |
| `MOCK_PAYMENT_METHODS` | 521–562 | ~6 | `billing` | SettingPaymentMethods |
| `MOCK_PAYMENT_GATEWAYS` | 564–607 | ~5 | `integration` | SettingPaymentGateways (MSB/Timi/VNPay/MoMo) |
| `MOCK_PARTNERS` | 609–724 | ~10 | `customer` | PartnerList |
| `MOCK_PARTNER_CONTRACTS` | 726–841 | ~10 | `contract` | PartnerContractList |
| `MOCK_PROJECT_FINANCIALS` | 843–935 | ~6 | `billing` | ProjectFinancialReport (P&L) |
| `MOCK_B2G_BUDGETS` | 948–968 | 1 | `contract` | B2GComplianceList |
| `MOCK_B2G_PAYMENTS` | 970–1046 | ~5 | `sales` | B2GPaymentList |
| `MOCK_CAM_CHARGES` | 1048–1101 | ~5 | `operation` | CAMAllocationList |
| `MOCK_NOTIFICATION_TEMPLATES` | 1103–1161 | ~5 | `notification` | FeeNotificationEngine |
| `MOCK_NOTIFICATION_SEGMENTS` | 1163–1196 | ~4 | `notification` | Segment config |
| `MOCK_NOTIFICATION_CAMPAIGNS` | 1198–1253 | ~5 | `notification` | Campaign wizard |
| `MOCK_NOTIFICATION_RULES` | 1255–1297 | ~4 | `notification` | Rule auto |
| `MOCK_NOTIFICATION_HISTORY` | 1299–1343 | ~5 | `notification` | Notification history |
| `MOCK_AUDIT_LOGS` | 1345–1471 | ~10 | `customer` (or Kafka `log-capture`) | AuditLog |
| `MOCK_COMPLAINT_TICKETS` | 1473–1563 | ~7 | `care` | ComplaintList |
| `MOCK_STAFF_SCHEDULES` | 1565–1647 | ~7 | `customer` | StaffScheduleList |
| `MOCK_FUNDS` | 1649–end | 4 | `billing` | Fund/cashbook |

### Enum/lookup (cần BE seed như reference data)

| Dataset | Lines | Values | Service | Ghi chú |
|---|---|---|---|---|
| `PROJECT_TYPE_OPTIONS` | 245–253 | 7 | `operation` | apartment / office / industrial / retail / villa / government / service |
| `SERVICE_REQUEST_CATEGORIES` | 255–266 | 10 | `care` | maintenance / electrical / plumbing / elevator / fire_protection / security / cleaning / air_conditioning / pest_control / other |
| `VENDOR_SERVICE_TYPES` ✅ | 268–279 | 10 (+2) | `customer` | Đã handoff #14 |

### Derived / UI-only (KHÔNG seed)

| Dataset | Lines | Why skip |
|---|---|---|
| `MOCK_DASHBOARD_STATS` | 209–224 | Tổng hợp từ master tables, BE compute tại runtime |
| `MOCK_REVENUE_CHART` | 226–233 | Aggregation, không phải master |
| `MOCK_SR_CHART` | 235–242 | Aggregation |
| `MOCK_PORTFOLIO_REVENUE_CHART` | 937–946 | Aggregation |
| `STATUS_LABELS` | 281–298 | i18n FE-side, không lưu DB |
| `STATUS_COLORS` | 300–307 | UI theme FE-side |

## Tổng quan service mapping

| Service | Datasets count | Tổng records (approx) | Trạng thái handoff |
|---|---|---|---|
| `operation` | 7 (6 master + 1 enum) | ~50 | chưa |
| `customer` | 6 (5 master + 1 enum) | ~40 | 1/6 đã dispatch (vendor) |
| `contract` | 6 | ~25 | chưa |
| `sales` | 4 | ~15 | chưa |
| `billing` | 6 | ~40 | chưa |
| `care` | 3 (2 master + 1 enum) | ~15 | chưa |
| `notification` | 5 | ~23 | chưa |
| `integration` | 1 | ~5 | chưa |

## Convention seed (cho mọi service)

1. **Multi-tenant:** mọi record gắn `bsn_id` của tenant đích (sau khi switch: `tnpm.reborn.vn` — BE lookup từ bảng `business`).
2. **Owner user fallback:** dùng user `0971234599` (role "Ban giám đốc") cho mọi field creator/owner ref.
3. **Idempotent:** seed chạy lại không tạo duplicate (unique key theo `(bsn_id, code)` hoặc `(bsn_id, natural_key)`).
4. **Format:** SQL hoặc liquibase changeset tuỳ convention từng service.
5. **Foreign key:** seed theo thứ tự dependency — `portfolios → projects → units → customers → contracts → invoices → debts/payments` để FK không vỡ.

## Cross-service dependencies

Một số dataset reference id chéo service:

- `MOCK_LEASE_CONTRACTS.customerId` → `customer.MOCK_CUSTOMERS.id`
- `MOCK_LEASE_CONTRACTS.projectId/unitId` → `operation.MOCK_PROJECTS.id / MOCK_UNITS.id`
- `MOCK_INVOICES.contractId` → `contract.MOCK_LEASE_CONTRACTS.id`
- `MOCK_VENDOR_CONTRACTS.vendorId` → `customer.MOCK_VENDORS.id`
- `MOCK_DEBTS.counterpartyId` → `customer.MOCK_VENDORS.id` (nếu kind=payable) hoặc `customer.MOCK_CUSTOMERS.id` (nếu kind=receivable)
- `MOCK_SERVICE_REQUESTS.assignedVendorId` → `customer.MOCK_VENDORS.id`
- `MOCK_MAINTENANCE_PLANS.vendorId` → `customer.MOCK_VENDORS.id`

→ Khi dispatch handoff, BE cần biết id map: best practice là **gửi handoff theo thứ tự dependency**, mỗi reply trả về ID thật BE đã tạo để FE chuyển sang BE kế tiếp.

Order đề xuất:
1. `customer` (vendors, customers, partners, employees) — không phụ thuộc ai
2. `operation` (portfolios, projects, units, meter, utility_rate, CAM) — chỉ phụ thuộc customer cho owner
3. `contract` (lease, service contract, vendor contract, partner contract, B2G budget) — phụ thuộc customer + operation
4. `sales` (invoice, vendor invoice, turnover, B2G payment) — phụ thuộc contract + customer
5. `billing` (debts, debt_tx, payments, payment_methods, project_financials, funds) — phụ thuộc sales + customer
6. `care` (SR, maintenance, complaint) — phụ thuộc customer + operation + vendor
7. `notification` (template, segment, campaign, rule, history) — gần như độc lập
8. `integration` (payment gateways) — độc lập

## File trong thư mục này

- [INDEX.md](INDEX.md) — this file
- [mock-snapshot-tnpm.ts](mock-snapshot-tnpm.ts) — verbatim copy của `src/assets/mock/TNPMData.ts`
- [services/customer.md](services/customer.md) — spec seed cho `customer` (vendors ✅ đã dispatch + customers + partners + staff schedule + audit log)
- [services/operation.md](services/operation.md) — portfolios, projects, units, meter readings, utility rates, CAM charges, project type enum
- [services/contract.md](services/contract.md) — lease, service, vendor, partner contracts + B2G budgets
- [services/sales.md](services/sales.md) — invoices, vendor invoices, turnover, B2G payments
- [services/billing.md](services/billing.md) — debts, transactions, payment methods, project financials, funds
- [services/care.md](services/care.md) — service requests, maintenance plans, complaint tickets + SR category enum
- [services/notification.md](services/notification.md) — templates, segments, campaigns, rules, history
- [services/integration.md](services/integration.md) — payment gateways (MSB/Timi/VNPay/MoMo)
