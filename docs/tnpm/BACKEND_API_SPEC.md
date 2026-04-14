# TNPM Backend API Specification

**Version**: 1.0 (2026-04-14)
**Scope**: Backend microservice decomposition for TNPM — TN Property Management platform
**Source**: HLD v2.0 (`docs/urd/TNPM_HLD_v2.pdf`) + 20 prototype pages on `reborn-tnpm` branch
**Frontend status**: All pages built as mock-data prototypes — no live API calls yet

---

## 0. Tổng quan kiến trúc

Theo HLD p.14, mỗi **business service deploy độc lập**, giao tiếp qua **Message Bus (Kafka/RabbitMQ)**, có **API Gateway** chung tiêm `X-Tenant-ID` header cho multi-tenant.

Phân chia **11 microservice** sau đây đã gom nhóm các nghiệp vụ TNPM theo domain-driven design, đồng thời **tái sử dụng tối đa** các service đã có trên nhánh `reborn-retail`/`master`.

```
┌─────────────────────────────────────────────────────┐
│ API Gateway (X-Tenant-ID, OAuth2/JWT, rate limit)   │
└─────────────────────────────────────────────────────┘
         │
  ┌──────┼──────┬───────┬──────┬──────┬─────┬──────┬──────┐
  ▼      ▼      ▼       ▼      ▼      ▼     ▼      ▼      ▼
iam   portfolio customer contract billing payment vendor partner
 │         │        │       │       │       │      │      │
 └──── operations ── notification ── compliance ── report ─┘
```

### Legend trạng thái API
- 🟢 **REUSE**: Dùng nguyên service đã có (retail/master)
- 🟡 **EXTEND**: Extend service hiện có, thêm fields/endpoints cho TNPM
- 🔴 **NEW**: Tạo mới từ đầu — TNPM specific

### Legend độ ưu tiên (bám Phase HLD p.15)
- **P1**: Phase 1 Foundation (Tuần 1-8) — CRM, Contract, Billing cơ bản, Multi-tenant
- **P2**: Phase 2 Payment+Vendor (Tuần 8-10) — Gateway, Vendor Mgmt, Báo cáo
- **P3**: Phase 3 Lease+Retail (Tuần 11-16) — Lease, Turnover, B2G, CAM
- **P4**: Phase 4 Optimize+Scale (Tuần 17-20) — BI, AI debt, Vendor KPI, Owner API

---

## 1. `iam-service` (Identity, Auth, Multi-tenant)

**Owner**: Platform team
**Tech**: OAuth2 Authorization Server + Keycloak hoặc custom JWT
**Mục tiêu**: Multi-tenant isolation qua header `X-Tenant-ID`, RBAC cho 3 vai trò chính (TNPM admin, Chủ đầu tư, NCC)

### 1.1 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| POST | `/auth/login` | Login email/password → JWT + refresh | 🟢 REUSE `UserService` | P1 |
| POST | `/auth/refresh` | Refresh JWT | 🟢 REUSE | P1 |
| POST | `/auth/logout` | Revoke token | 🟢 REUSE | P1 |
| GET | `/users/me` | Current user + roles + tenant | 🟢 REUSE `UserService.getCurrentUser` | P1 |
| GET | `/users?role=&tenantId=` | List users by tenant | 🟢 REUSE | P1 |
| POST | `/users` | Create user + assign role | 🟢 REUSE | P1 |
| PATCH | `/users/{id}/role` | Update RBAC role | 🟡 EXTEND — thêm role enum TNPM: `tnpm_admin`, `tnpm_bql`, `tnpm_ketoan`, `tnpm_kst`, `owner`, `vendor` | P1 |
| GET | `/tenants` | List projects/tenants user có quyền | 🔴 NEW — cần multi-tenant middleware | P1 |
| GET | `/tenants/{id}/permissions` | Permissions theo tenant/project | 🔴 NEW | P1 |
| POST | `/auth/vendor-portal/login` | Separate auth cho NCC portal | 🔴 NEW — endpoint riêng domain vendor.tnpm.vn | P4 |
| POST | `/auth/owner-portal/login` | Separate auth cho CĐT portal | 🔴 NEW — endpoint riêng domain owner.tnpm.vn | P4 |

**Cross-cutting**: API Gateway phải inject `X-Tenant-ID` vào mọi downstream request dựa trên JWT claims. Row-level security trong database cần scope theo `tenant_id` và `project_id`.

**Frontend pages cần API này**:
- `VendorPortalPreview.tsx` (separate auth)
- `OwnerDashboard.tsx` (role-based projects filter)
- All TNPM admin pages (JWT Bearer in headers)

---

## 2. `portfolio-service` (Portfolio → Project → Unit)

**Owner**: Platform team (có thể merge với iam-service nếu nhỏ)
**Mục tiêu**: Quản lý cấu trúc Portfolio → Project → Unit (HLD p.9, p.12 data model)

### 2.1 Data model
```
portfolio { id, name, owner_company, created_at }
project { id, portfolio_id, code, name, type, location, total_units, status, investor_id }
unit { id, project_id, code, floor, block, area_m2, bedrooms, status, unit_type, rent_price }
```

### 2.2 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/portfolios` | List portfolio TNPM quản lý | 🔴 NEW | P1 |
| GET | `/portfolios/{id}` | Detail + các project con | 🔴 NEW | P1 |
| POST | `/portfolios` | Tạo mới | 🔴 NEW | P1 |
| GET | `/projects?portfolioId=&type=&status=` | List projects (filter theo portfolio) | 🔴 NEW — stub có ở [`src/services/tnpm/PropertyProjectService.ts`](../../src/services/tnpm/PropertyProjectService.ts) | P1 |
| GET | `/projects/{id}` | Detail + KPI | 🔴 NEW | P1 |
| POST/PATCH/DELETE | `/projects/{id}` | CRUD | 🔴 NEW | P1 |
| GET | `/projects/{id}/units?status=&block=` | List unit | 🔴 NEW — stub ở [`src/services/tnpm/PropertyUnitService.ts`](../../src/services/tnpm/PropertyUnitService.ts) | P1 |
| POST/PATCH/DELETE | `/units/{id}` | CRUD unit | 🔴 NEW | P1 |
| GET | `/portfolio/dashboard` | Aggregated KPI: tổng dự án, DT, lấp đầy, công nợ | 🔴 NEW | P2 |

**Frontend pages cần**: `PropertyProjectList`, `PropertyUnitList`, `PortfolioDashboardList`, `DashboardTNPM`, `OwnerDashboard`.

---

## 3. `customer-service` (CRM + Segments)

**Owner**: CRM team
**Mục tiêu**: Hồ sơ khách hàng B2C/B2B/B2G + segmentation cho notification

### 3.1 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/customers?projectId=&type=&keyword=` | List với filter | 🟢 REUSE `CustomerService.filter` ở retail | P1 |
| GET | `/customers/{id}` | Detail hồ sơ | 🟢 REUSE `CustomerService.detail` | P1 |
| POST/PATCH/DELETE | `/customers` | CRUD | 🟢 REUSE | P1 |
| GET | `/customers/{id}/relationships` | Mối quan hệ KH (hộ, gia đình) | 🟢 REUSE `RelationShipService` | P2 |
| POST | `/customers/import` | Bulk import CSV/Excel | 🟢 REUSE | P1 |
| GET | `/customer-segments` | List segment đã lưu | 🟢 REUSE `customerSegment` page ở retail | P4 |
| POST | `/customer-segments` | Tạo segment với filter rules | 🟡 EXTEND — cần thêm TNPM-specific filters: `debtStatus`, `overdueDays`, `leaseStatus`, `daysToExpire` | P4 |
| POST | `/customer-segments/{id}/preview` | Preview danh sách KH match | 🟡 EXTEND | P4 |

**Frontend pages cần**: `CustomerPersonList`, `FeeNotificationList` (segment builder).

**Extension cần cho TNPM**: Thêm các field filter nâng cao phục vụ notification segment builder trong `FeeNotificationList.tsx`. Cụ thể backend cần hiểu các filter key sau khi persist segment:
```json
{
  "filters": {
    "debtStatus": "overdue",
    "overdueDays": { "min": 1, "max": 7 },
    "dueDays": { "min": 0, "max": 7 },
    "projectId": 1,
    "projectType": "retail",
    "customerType": "b2c|b2b|b2g",
    "leaseStatus": "active",
    "daysToExpire": { "min": 0, "max": 60 }
  }
}
```

---

## 4. `contract-service` (Service Contract + Lease Contract + Partner Contract)

**Owner**: Contract team
**Mục tiêu**: Quản lý toàn bộ hợp đồng — dịch vụ, thuê mặt bằng, đối tác. Nhấn mạnh các tính năng Lease nâng cao (HLD p.11): escalation, deposit, auto-renew, CAM.

### 4.1 Data model
```
lease_contract {
  id, code, customer_id, project_id, unit_id, contract_type,
  start_date, end_date, rent_amount, deposit_amount,
  payment_terms, review_clause_years, escalation_rate_pct,
  deposit_paid, deposit_paid_at, deposit_refunded_at, deposit_held_by,
  auto_renew, renewal_notice_days, renewal_status, renewal_notified_at,
  cam_fee, marketing_levy_pct, overtime_rate, turnover_rent_rate_pct,
  status, note
}
lease_escalation_schedule {
  id, contract_id, period, effective_date, rent_amount, rate_pct,
  status (scheduled|applied|skipped), applied_at, note
}
service_contract { ... services[] list, parking_slots, ... }
partner_contract {
  id, code, partner_id, contract_type (strategic|referral|consultancy|distribution|service_purchase),
  title, description, value, payment_terms, start_date, end_date,
  auto_renew, renewal_notice_days, signed_by, partner_signer,
  attachments, status
}
```

### 4.2 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/lease-contracts?projectId=&status=&expiringIn=` | List | 🔴 NEW — stub ở [`tnpm/LeaseContractService.ts`](../../src/services/tnpm/LeaseContractService.ts) | P3 |
| GET | `/lease-contracts/{id}` | Detail (bao gồm escalation schedule, deposit info) | 🔴 NEW | P3 |
| POST/PATCH/DELETE | `/lease-contracts` | CRUD | 🔴 NEW | P3 |
| **POST** | `/lease-contracts/{id}/escalation/{period}/apply` | Áp dụng 1 kỳ escalation → cập nhật `rent_amount` hiện tại | 🔴 NEW | P3 |
| **POST** | `/lease-contracts/{id}/deposit/refund` | Hoàn cọc khi HĐ kết thúc | 🔴 NEW | P3 |
| **POST** | `/lease-contracts/{id}/renewal/notify` | Gửi thông báo gia hạn (tích hợp notification-service) | 🔴 NEW | P3 |
| **POST** | `/lease-contracts/{id}/renewal/confirm` | Xác nhận gia hạn — extend endDate | 🔴 NEW | P3 |
| GET | `/lease-contracts/expiring-soon?days=60` | Danh sách HĐ sắp hết hạn (cron job trigger) | 🔴 NEW | P3 |
| GET | `/service-contracts` | List HĐ dịch vụ | 🟡 EXTEND `ContractPaymentService` | P1 |
| POST/PATCH/DELETE | `/service-contracts` | CRUD | 🟡 EXTEND | P1 |
| GET | `/partner-contracts?partnerId=&contractType=&status=` | List HĐ đối tác | 🔴 NEW | P2 |
| POST/PATCH/DELETE | `/partner-contracts` | CRUD | 🔴 NEW | P2 |
| GET | `/partner-contracts/expiring-soon?days=60` | HĐ đối tác sắp hết hạn | 🔴 NEW | P2 |

**Frontend pages cần**: `LeaseContractList` (+ detail modal 4 tab), `ServiceContractList`, `PartnerContractList`.

**Event bus messages** (emit khi state thay đổi):
- `contract.escalation.applied` → notification-service lắng nghe → gửi TB cho tenant
- `contract.renewal.notified` → audit-log
- `contract.deposit.refunded` → payment-service tạo transaction chi
- `contract.expiring.soon` → cron job daily phát hiện + emit → notification-service

---

## 5. `billing-service` (Invoice + Meter Reading + Fee Types + CAM + Turnover Rent)

**Owner**: Billing team
**Mục tiêu**: Core billing engine — tính phí định kỳ theo công thức linh hoạt (HLD p.11). Là service **xử lý batch lớn** vào ngày mồng 1 hàng tháng (HLD p.16 risk performance).

### 5.1 Data model
```
fee_type { id, code, name, category, calc_type, unit_price, unit, apply_to[], taxable }
billing_rate { id, project_id, effective_from, electric_formula, electric_unit_price,
                water_formula, water_unit_price, mgmt_formula, ...parking, tiered }
meter_reading { id, project_id, unit_id, period, water_prev, water_curr,
                electric_prev, electric_curr, management_fee, parking_fee, other_fees[],
                total_amount, status (draft|invoiced), input_by }
invoice { id, code, contract_id, customer_id, project_id, period, due_date,
          total_amount, paid_amount, items[], status, paid_at }
cam_charge {
  id, project_id, effective_from, total_common_area_m2, total_leasable_area_m2,
  total_monthly_cost_vnd, price_per_m2, distribution_method,
  included_items[] (code, label, monthly_cost), status
}
turnover_report {
  id, contract_id, customer_id, unit_code, period,
  reported_revenue, calculated_fee, status, submitted_at, verified_at
}
```

### 5.2 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/fee-types?category=&applyTo=` | List loại phí | 🔴 NEW | P1 |
| POST/PATCH/DELETE | `/fee-types` | CRUD | 🔴 NEW | P1 |
| GET | `/billing-rates?projectId=&status=` | Biểu giá theo dự án | 🔴 NEW | P1 |
| POST/PATCH | `/billing-rates` | Config mới | 🔴 NEW | P1 |
| GET | `/meter-readings?projectId=&period=&unitId=` | List chỉ số tháng | 🔴 NEW | P1 |
| POST | `/meter-readings` | Nhập chỉ số 1 unit | 🔴 NEW | P1 |
| POST | `/meter-readings/batch-import` | Import Excel chỉ số toàn dự án | 🔴 NEW | P1 |
| POST | `/meter-readings/{id}/generate-invoice` | Sinh hóa đơn từ chỉ số | 🔴 NEW | P1 |
| POST | `/invoices/batch-generate` | **Batch job**: tạo HĐ hàng loạt cho 1 dự án/period | 🔴 NEW — chạy distributed queue per project (HLD p.16) | P1 |
| GET | `/invoices?projectId=&status=&period=&contractId=` | List HĐ | 🟡 EXTEND `InvoiceService.list` ở retail | P1 |
| GET | `/invoices/{id}` | Detail + items | 🟡 EXTEND `InvoiceService.detail` | P1 |
| POST/PATCH/DELETE | `/invoices` | CRUD thủ công | 🟡 EXTEND | P1 |
| POST | `/invoices/{id}/mark-paid` | Ghi nhận đã TT | 🟡 EXTEND | P1 |
| GET | `/invoices/export?filter=` | Export Excel theo filter | 🟢 REUSE `InvoiceService.exportExcel` | P1 |
| GET | `/cam-charges?projectId=` | Cấu hình CAM | 🔴 NEW | P3 |
| POST/PATCH | `/cam-charges` | CRUD cấu hình | 🔴 NEW | P3 |
| POST | `/cam-charges/{id}/preview-allocation` | Preview phân bổ cho tenant theo diện tích | 🔴 NEW | P3 |
| GET | `/turnover-reports?contractId=&period=` | List báo cáo doanh thu tenant | 🔴 NEW — stub ở `tnpm/TurnoverRentService.ts` | P3 |
| POST | `/turnover-reports` | Tenant tự submit doanh thu | 🔴 NEW | P3 |
| POST | `/turnover-reports/{id}/verify` | Kế toán xác minh | 🔴 NEW | P3 |
| POST | `/turnover-reports/{id}/calculate-fee` | Tính phí `MAX(base, %×DT)` | 🔴 NEW | P3 |

**Frontend pages cần**: `BillingEngineList`, `MeterReadingList`, `SettingFeeTypes`, `SettingBillingRates`, `SettingCAMCharges`, `TurnoverRentList`.

**Batch job specification** (critical per HLD p.16):
- **Trigger**: Cron daily 00:05 ngày 1 hàng tháng
- **Scope**: Một batch per project → dùng queue riêng (Redis Streams/Kafka partition per project)
- **Idempotency**: Key = `(projectId, period)` để re-run không tạo trùng
- **Scaling**: Horizontal scaling billing workers; target < 5 phút cho portfolio 10 dự án
- **Error handling**: Failed invoice đưa vào DLQ, admin manually retry qua `/invoices/batch-generate/retry?batchId=`

**Event bus emit**:
- `invoice.generated` → notification-service lắng nghe → gửi TB phí
- `invoice.overdue` → daily cron → notification-service gửi nhắc nợ
- `meter_reading.imported` → audit-log

---

## 6. `payment-service` (Payment + Debt + Fund + Gateway integration)

**Owner**: Payment team
**Mục tiêu**: Tích hợp MSB Pay, App Timi, quản lý quỹ, công nợ, gạch nợ auto (HLD p.10, p.13)

### 6.1 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/payment-methods?enabled=true` | List phương thức | 🟢 REUSE `PaymentMethodService` ở retail | P1 |
| POST/PATCH | `/payment-methods` | CRUD | 🟢 REUSE | P1 |
| PATCH | `/payment-methods/{id}/toggle` | Bật/tắt | 🟢 REUSE | P1 |
| GET | `/payment-gateways` | List cấu hình gateway | 🟡 EXTEND — thêm gateway config (apiBaseUrl, merchantId, apiKey, webhookUrl, environment) | P2 |
| POST/PATCH | `/payment-gateways/{id}` | Cập nhật config gateway | 🟡 EXTEND | P2 |
| POST | `/payment-gateways/{id}/test-connection` | Test kết nối API key | 🔴 NEW | P2 |
| GET | `/payment-gateways/{id}/metrics` | Success rate, latency, sync trạng thái | 🔴 NEW | P4 |
| GET | `/funds` | List quỹ | 🟢 REUSE `FundManagementService` | P1 |
| POST/PATCH/DELETE | `/funds` | CRUD | 🟢 REUSE | P1 |
| GET | `/payments?invoiceId=&method=&period=` | Lịch sử thanh toán | 🟢 REUSE `PaymentHistoryService` | P1 |
| POST | `/payments` | Ghi nhận thanh toán thủ công | 🟢 REUSE | P1 |
| GET | `/debts?kind=&status=&counterpartyId=` | List công nợ | 🟢 REUSE `DebtManagementService.list` ở retail | P1 |
| GET | `/debts/{id}` | Detail 1 công nợ | 🟢 REUSE | P1 |
| POST | `/debts/{id}/pay` | Ghi nhận thu/chi nợ | 🟢 REUSE `DebtManagementService.pay` | P1 |
| POST | `/debts/{id}/schedule` | Cập nhật hạn + nhắc nhở | 🟢 REUSE `DebtManagementService.updateSchedule` | P1 |
| GET | `/debt-transactions?type=&period=` | Lịch sử GD công nợ | 🟡 EXTEND — thêm type: `collect_debt`, `pay_debt`, `create_receivable`, `create_payable` | P1 |
| POST | `/debt-transactions` | Tạo 1 giao dịch mới | 🟡 EXTEND | P1 |
| **POST** | `/webhooks/msb-pay` | MSB webhook — nhận callback → tự động gạch nợ | 🔴 NEW | P2 |
| **POST** | `/webhooks/app-timi` | Timi webhook — nhận callback | 🔴 NEW | P2 |
| POST | `/qr/generate` | Sinh QR thanh toán | 🟢 REUSE `QrCodeProService.generate` ở retail | P2 |
| GET | `/reconciliation/run` | Chạy đối soát manual | 🔴 NEW | P4 |

**Frontend pages cần**: `DebtManagementList`, `DebtTransactionList`, `SettingPaymentMethods`, `PaymentHistoryList`, `BillingEngineList` (pay button).

**Event bus**:
- Consume `invoice.generated` → notification "invoice sắp đến hạn"
- Emit `payment.received` → billing-service update `invoice.status = paid`
- Emit `debt.reminder.due` → daily cron → notification-service

**Webhook security** (HLD p.16 risk):
- HTTPS + whitelist IP của MSB/Timi
- HMAC signature verification
- Idempotency key từ gateway để tránh double-process

---

## 7. `vendor-service` (Vendor + Vendor Contract + Vendor Invoice + 3-way Match + KPI)

**Owner**: Vendor team (NEW per HLD — trọng tâm của TNPM)
**Mục tiêu**: Toàn bộ vòng đời NCC (HLD p.5, p.6): Danh mục → HĐ → Task → Nghiệm thu → Invoice → Thanh toán

### 7.1 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/vendors?serviceType=&status=` | List NCC | 🔴 NEW — stub ở `tnpm/VendorService.ts` | P2 |
| GET | `/vendors/{id}` | Detail + stats tích hợp | 🔴 NEW | P2 |
| POST/PATCH/DELETE | `/vendors` | CRUD | 🔴 NEW | P2 |
| POST | `/vendors/{id}/blacklist` | Đưa vào blacklist | 🔴 NEW | P2 |
| GET | `/vendors/{id}/kpi` | KPI 1 vendor: SLA met, rating, completion, approve days, 3-way OK | 🔴 NEW | P4 |
| GET | `/vendors/kpi/dashboard` | KPI tổng tất cả vendor + ranking | 🔴 NEW | P4 |
| GET | `/vendor-contracts?vendorId=&projectId=` | List HĐ NCC | 🔴 NEW | P2 |
| POST/PATCH/DELETE | `/vendor-contracts` | CRUD | 🔴 NEW | P2 |
| GET | `/vendor-invoices?vendorId=&approvalStatus=&period=` | List HĐ NCC | 🔴 NEW | P2 |
| POST | `/vendor-invoices` | Kế toán nhập OR vendor portal submit | 🔴 NEW | P2 |
| **POST** | `/vendor-invoices/{id}/3-way-match/check` | Kiểm tra tự động 3-way match (PO → BB → Invoice) | 🔴 NEW | P2 |
| **POST** | `/vendor-invoices/{id}/approvals/{step}` | Advance workflow bước N (approve/reject) | 🔴 NEW — 4 bước KST → KT → QLDA → TT | P2 |
| GET | `/vendor-invoices/{id}/approval-history` | Lịch sử audit các bước | 🔴 NEW | P2 |

**Frontend pages cần**: `VendorManagementList` (+ 5-tab detail), `VendorContractList`, `VendorInvoiceList` (+ 3-way match modal), `VendorKPIDashboard`, `VendorPortalPreview`.

**3-way match algorithm**:
```python
def check_3way_match(invoice):
    po = get_po(invoice.vendor_contract_id)
    acceptance = get_acceptance_minutes(invoice.vendor_id, invoice.period)

    match_po = (
        po.service_type == invoice.service_type
        and po.status == "active"
        and abs(po.value_remaining - invoice.amount) <= po.value * 0.05  # 5% tolerance
    )

    match_acceptance = (
        acceptance is not None
        and acceptance.status == "signed"
        and acceptance.vendor_id == invoice.vendor_id
        and acceptance.signed_by_kst is not None
    )

    return match_po and match_acceptance
```

**Approval workflow state machine**:
```
pending → (step 1: KST ký BB) → kst_approved
       → (step 2: Kế toán check 3-way + số tiền) → accountant_approved
       → (step 3: QLDA phê duyệt cuối) → qlda_approved
       → (step 4: Chi kho bạc/ngân hàng) → paid
       any step → rejected → END
```

---

## 8. `partner-service` (Partner Mgmt + Partner Contracts)

**Owner**: Business Dev team (lightweight — có thể merge vào vendor-service nếu BE team nhỏ)

### 8.1 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/partners?type=&status=` | List đối tác (strategic/referrer/consultant/distributor/other) | 🟢 REUSE `PartnerService` ở retail | P2 |
| POST/PATCH/DELETE | `/partners` | CRUD | 🟢 REUSE | P2 |
| GET | `/partners/{id}` | Detail | 🟢 REUSE | P2 |
| POST | `/partners/import` | Bulk import | 🟢 REUSE | P2 |

**Partner Contracts** đã cover ở contract-service (section 4.2).

**Frontend pages cần**: `PartnerList` (TNPM version), `PartnerContractList`.

---

## 9. `operations-service` (Service Request + Maintenance Plan + SLA)

**Owner**: Operations team
**Mục tiêu**: Yêu cầu dịch vụ từ cư dân/tenant, phân công NCC/KST, kế hoạch bảo trì định kỳ

### 9.1 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/service-requests?projectId=&status=&assignedVendorId=` | List SR | 🟡 EXTEND `WorkOrderService` ở retail | P2 |
| POST | `/service-requests` | Tạo SR từ cư dân hoặc BQL | 🟡 EXTEND | P2 |
| PATCH | `/service-requests/{id}` | Update status | 🟡 EXTEND — `WorkOrderService.updateStatus` | P2 |
| POST | `/service-requests/{id}/assign-vendor` | Phân công NCC | 🔴 NEW | P2 |
| POST | `/service-requests/{id}/assign-employee` | Phân công KST nội bộ | 🟡 EXTEND | P2 |
| POST | `/service-requests/{id}/progress-update` | Cập nhật tiến độ (từ vendor portal) | 🔴 NEW | P4 |
| POST | `/service-requests/{id}/acceptance-sign` | Ký biên bản nghiệm thu | 🔴 NEW | P2 |
| GET | `/maintenance-plans?projectId=&vendorId=` | Kế hoạch bảo trì | 🔴 NEW — stub ở `tnpm/MaintenancePlanService.ts` | P3 |
| POST/PATCH/DELETE | `/maintenance-plans` | CRUD | 🔴 NEW | P3 |
| POST | `/maintenance-plans/{id}/execute` | Chuyển plan → SR thực tế | 🔴 NEW | P3 |
| GET | `/sla-rules?category=&priority=` | Config SLA | 🔴 NEW | P3 |
| POST/PATCH | `/sla-rules` | CRUD | 🔴 NEW | P3 |

**Frontend pages cần**: `ServiceRequestList`, `MaintenancePlanList`, `VendorPortalPreview` (task list).

**Cron job**: Daily check SLA compliance → emit `sr.sla.breached` → notification-service alert QLDA.

---

## 10. `notification-service` (Templates + Segments + Campaigns + Auto Rules + Delivery)

**Owner**: Notification team (có thể nhiều providers nội bộ: SMS gateway, Email SMTP, Zalo OA, FCM)
**Mục tiêu**: Engine gửi đa kênh, segment-based, scheduled + auto-triggered (HLD p.10, p.13, KPI p.17)

### 10.1 Data model
```
notification_template {
  id, code, name, category (fee_notice|debt_reminder|debt_overdue|renewal|operational),
  channels[], subject, content, sms_content, enabled
}
notification_segment {
  id, name, description, filters (JSON), estimated_count, last_used_at, created_by
}
notification_campaign {
  id, code, name, template_id, segment_id, channels[],
  schedule_type (now|once|recurring), scheduled_at, recurring_rule,
  status (draft|scheduled|sending|sent|failed),
  recipient_count, success_count, fail_count, open_count, click_count
}
notification_rule {
  id, name, trigger (fee_due_N_days|debt_overdue_N_days|lease_expire_N_days),
  template_id, channels[], enabled, last_run_at, total_sent
}
notification_history {
  id, campaign_id, recipient_name, recipient_contact, channel,
  template_id, content, status (pending|delivered|failed),
  sent_at, opened_at, clicked_at, gateway_ref
}
```

### 10.2 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/notification-templates?category=` | List mẫu | 🟡 EXTEND `TemplateSMSService` + `TemplateZaloService` | P2 |
| POST/PATCH/DELETE | `/notification-templates` | CRUD | 🟡 EXTEND | P2 |
| POST | `/notification-templates/{id}/preview` | Render với biến sample | 🔴 NEW | P2 |
| GET | `/notification-segments` | List | 🟡 EXTEND `customerSegment` service | P4 |
| POST/PATCH/DELETE | `/notification-segments` | CRUD | 🟡 EXTEND | P4 |
| POST | `/notification-segments/{id}/preview` | Preview recipients | 🟡 EXTEND | P4 |
| GET | `/notification-campaigns?status=&templateId=` | List | 🔴 NEW | P2 |
| POST | `/notification-campaigns` | Tạo campaign | 🔴 NEW | P2 |
| POST | `/notification-campaigns/{id}/launch` | Kích hoạt ngay | 🔴 NEW | P2 |
| POST | `/notification-campaigns/{id}/schedule` | Lên lịch | 🔴 NEW | P2 |
| POST | `/notification-campaigns/{id}/cancel` | Hủy | 🔴 NEW | P2 |
| GET | `/notification-campaigns/{id}/stats` | Số liệu: sent, open, click | 🔴 NEW | P2 |
| GET | `/notification-rules` | List auto rules | 🔴 NEW | P3 |
| POST/PATCH | `/notification-rules` | CRUD | 🔴 NEW | P3 |
| PATCH | `/notification-rules/{id}/toggle` | Bật/tắt | 🔴 NEW | P3 |
| POST | `/notification-rules/{id}/execute` | Chạy thử | 🔴 NEW | P3 |
| GET | `/notification-history?campaignId=&channel=&status=` | Log gửi | 🟢 REUSE `NotificationService` | P2 |
| POST | `/channels/sms/send` | Send SMS 1 message | 🟢 REUSE `SendSMSService` | P1 |
| POST | `/channels/email/send` | Send email | 🟢 REUSE `EmailService` | P1 |
| POST | `/channels/zalo/send` | Send Zalo OA | 🟢 REUSE `ZaloOAService` | P1 |
| POST | `/channels/fcm/push` | Push FCM | 🟢 REUSE | P1 |

**Frontend pages cần**: `FeeNotificationList` (4 tab).

**Scheduler workers** (cần 1 worker riêng):
- Polls `notification_rule WHERE enabled = true AND (last_run_at + 24h) < NOW()`
- Execute: resolve segment → generate campaign → gửi tới delivery workers
- Throttle: max 1000 msg/phút per channel để tránh gateway rate limit

**Event bus consume**:
- `invoice.generated` → render template fee_notice → gửi auto
- `debt.reminder.due` → render template debt_reminder → gửi
- `contract.expiring.soon` → render template renewal → gửi

---

## 11. `compliance-service` (B2G + Audit Log + Tenant Isolation Scan)

**Owner**: Compliance team (nhỏ)
**Mục tiêu**: B2G workflow thanh toán kho bạc (HLD p.16), audit log đầy đủ, kiểm tra cô lập tenant định kỳ

### 11.1 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/b2g-budgets?projectId=&year=` | Ngân sách năm HC | 🔴 NEW | P3 |
| POST/PATCH | `/b2g-budgets` | Config ngân sách | 🔴 NEW | P3 |
| GET | `/b2g-payments?projectId=&status=` | List đề nghị thanh toán | 🔴 NEW | P3 |
| POST | `/b2g-payments` | Tạo đề nghị mới | 🔴 NEW | P3 |
| POST | `/b2g-payments/{id}/advance-step` | Advance workflow (QLDA → KT → GĐ → KBNN) | 🔴 NEW | P3 |
| POST | `/b2g-payments/{id}/upload-document` | Upload chứng từ kho bạc | 🔴 NEW | P3 |
| GET | `/audit-logs?userId=&category=&severity=&from=&to=` | Query audit log | 🔴 NEW | P1 |
| POST | `/audit-logs` | Internal — receive event từ bus, persist | 🔴 NEW | P1 |
| GET | `/tenant-isolation/scan` | Kiểm tra row-level security violations | 🔴 NEW | P4 |
| POST | `/tenant-isolation/scan/run-now` | Trigger manual scan | 🔴 NEW | P4 |

**Frontend pages cần**: `B2GComplianceList`, `AuditLogList`.

**Audit log implementation**:
- **Write path**: Tất cả services emit event `*.created|updated|deleted|approved` → Kafka → audit-log worker consume → persist
- **Retention**: 2 năm hot storage (PostgreSQL), archive S3 sau đó
- **Compliance**: Không cho phép xóa/sửa audit entry (append-only)
- **Before/After state**: Capture toàn bộ entity snapshot before + after nếu là update

---

## 12. `report-service` (BI + P&L + Export)

**Owner**: BI team
**Mục tiêu**: Báo cáo đa chiều per-project, per-portfolio, export PDF/Excel cho CĐT

### 12.1 Endpoints

| Method | Path | Mô tả | Status | Priority |
|---|---|---|---|---|
| GET | `/reports/p-and-l?projectId=&period=` | P&L 1 dự án | 🟡 EXTEND `ReportService` | P2 |
| GET | `/reports/p-and-l/portfolio?ownerId=&period=` | P&L tổng hợp portfolio | 🔴 NEW | P4 |
| GET | `/reports/occupancy?projectId=&period=` | Tỷ lệ lấp đầy | 🟡 EXTEND | P2 |
| GET | `/reports/revenue-chart?projectIds=&months=6` | Chart DT 6 tháng | 🔴 NEW | P2 |
| GET | `/reports/vendor-performance?period=` | KPI vendor tổng hợp | 🔴 NEW | P4 |
| GET | `/reports/operational-kpi?projectId=` | SR SLA, response time | 🔴 NEW | P4 |
| POST | `/reports/generate-pdf` | Generate PDF report cho CĐT | 🔴 NEW | P2 |
| POST | `/reports/email-to-owner` | Gửi email báo cáo tự động | 🔴 NEW — tích hợp notification-service | P2 |
| GET | `/reports/export/{type}?format=xlsx` | Export Excel/PDF | 🟢 REUSE `InvoiceService.exportExcel` pattern | P1 |

**Frontend pages cần**: `ReportTNPM`, `PortfolioDashboardList`, `OwnerDashboard`, `VendorKPIDashboard`.

---

## 13. Shared / Cross-cutting

### 13.1 `file-service`
- 🟢 REUSE `FileService` ở retail
- Đủ cho upload attachments (HĐ, BB nghiệm thu, chứng từ kho bạc, bank statement)

### 13.2 `search-service`
- ElasticSearch (HLD p.14)
- Index: customers, invoices, vendors, SRs, audit logs
- 🔴 NEW — cần setup ES cluster + sync workers

### 13.3 `messaging-bus`
- Kafka hoặc RabbitMQ (HLD p.14)
- Topics đề xuất:
  ```
  tnpm.billing.*
  tnpm.payment.*
  tnpm.contract.*
  tnpm.vendor.*
  tnpm.operations.*
  tnpm.notification.*
  tnpm.audit.*
  ```

---

## 14. Roadmap gợi ý cho BE teams

### Sprint Phase 1 (T1-T8) — Foundation
**Blocking cho front-end dev thật**: Auth, Customer, Project/Unit, ServiceContract, FeeType, BillingRate, Invoice, MeterReading, Payment, Debt, PaymentMethod

- iam-service team: 1.1 tất cả P1
- portfolio-service team: 2.2 tất cả P1
- customer-service team: 3.2 tất cả P1 (mostly REUSE)
- contract-service team: 4.2 service-contract (P1)
- billing-service team: 5.2 fee-types, billing-rates, meter-readings, invoices (P1)
- payment-service team: 6.2 payment-methods, funds, payments, debts (P1, mostly REUSE)

### Sprint Phase 2 (T8-T10) — Vendor + Payment Gateway
- vendor-service team: 7.2 full (P2)
- payment-service team: 6.2 gateway + webhook MSB/Timi (P2)
- operations-service team: 9.2 SR CRUD + assign (P2)
- notification-service team: 10.2 templates + campaigns manual (P2)
- report-service team: 12.1 P&L + occupancy (P2)
- compliance-service team: 11.1 audit log skeleton (P1)

### Sprint Phase 3 (T11-T16) — Lease + Retail + B2G
- contract-service team: 4.2 lease-contracts + escalation + deposit + renewal (P3)
- billing-service team: 5.2 cam-charges + turnover-reports (P3)
- compliance-service team: 11.1 b2g-budgets + b2g-payments workflow (P3)
- operations-service team: 9.2 maintenance-plans + sla-rules (P3)
- notification-service team: 10.2 auto rules (P3)

### Sprint Phase 4 (T17-T20) — Optimize + Scale
- report-service team: 12.1 portfolio P&L + vendor KPI dashboard (P4)
- vendor-service team: 7.2 KPI + portal auth (P4)
- iam-service team: 1.1 vendor-portal-login + owner-portal-login (P4)
- compliance-service team: 11.1 tenant isolation scan (P4)
- AI Debt team (new): ML service phân tích khả năng trả nợ (P4 — ngoài scope core)

---

## 15. Non-Functional Requirements (HLD p.14)

| NFR | Target | Service chịu trách nhiệm chính |
|---|---|---|
| Uptime platform | ≥ 99.5% | Toàn bộ — cần HA + health-check |
| Transaction response | < 3s | payment-service, billing-service |
| Multi-tenant isolation | 100% | iam-service + tất cả (row-level security in DB) |
| Encrypted at rest | AES-256 | Infrastructure (DB encryption) |
| Encrypted in transit | TLS 1.3 | API Gateway |
| Full audit log | Mọi write op | compliance-service |
| NHNN payment compliance | 100% | payment-service (đối soát, báo cáo NHNN) |
| Backup | Daily + 30 days retention | Infrastructure |
| Disaster recovery | RTO 4h, RPO 1h | Infrastructure |

---

## 16. Open questions cho BE teams

1. **Schema-per-tenant vs row-level**: HLD p.9 nói "schema-per-tenant" nhưng với 50+ dự án sau này sẽ có vấn đề migrations. Đề xuất **hybrid**: shared schema với `tenant_id` + `project_id` + row-level security (PostgreSQL RLS), schema-per-tenant chỉ cho các tenant lớn cần cô lập cao.

2. **Event bus**: Kafka (horizontal scale tốt, phức tạp hơn) vs RabbitMQ (đơn giản, sẵn có). Đề xuất **RabbitMQ cho Phase 1-2**, migrate Kafka khi volume > 10k msg/s.

3. **3-way match**: Tolerance bao nhiêu % cho giá trị? Đề xuất 5% (có thể config).

4. **Vendor portal auth**: Dùng magic link (password-less) hay username/password? Đề xuất magic link + OTP SMS cho vendor (đơn giản hơn, ít support).

5. **Owner portal SSO**: Có cần SAML integration với hệ thống CĐT không? Case-by-case (Vinhomes, AEON có IT riêng).

6. **Webhook idempotency**: MSB/Timi có gửi trùng callback không? Cần lưu `gateway_txn_ref` unique index để dedupe.

7. **Audit log retention**: 2 năm hot + S3 archive có đủ cho NHNN compliance không? Cần check regulation.

---

## 17. Appendix — Mapping Frontend Page → Microservice

| Frontend Page | Primary Service | Secondary Services |
|---|---|---|
| DashboardTNPM | portfolio + report | customer, billing, vendor |
| PropertyProjectList, PropertyUnitList | portfolio | — |
| CustomerPersonList | customer | — |
| LeaseContractList + detail 4 tab | contract | billing, notification, payment (cọc) |
| ServiceContractList | contract | — |
| PartnerList, PartnerContractList | partner + contract | — |
| BillingEngineList | billing | contract, customer |
| MeterReadingList | billing | — |
| SettingFeeTypes, SettingBillingRates, SettingCAMCharges | billing | — |
| TurnoverRentList | billing | contract |
| DebtManagementList, DebtTransactionList | payment | billing, vendor |
| SettingPaymentMethods | payment | — |
| PaymentHistoryList | payment | — |
| VendorManagementList + 5-tab detail | vendor | payment (debt), operations (SR), billing |
| VendorContractList | vendor + contract | — |
| VendorInvoiceList + 3-way match modal | vendor | payment, compliance (audit) |
| VendorKPIDashboard | vendor + report | operations |
| VendorPortalPreview | iam + vendor | operations |
| ServiceRequestList | operations | vendor, customer |
| MaintenancePlanList | operations | vendor |
| PortfolioDashboardList | portfolio + report | billing, payment |
| B2GComplianceList | compliance | payment, vendor |
| FeeNotificationList (4 tab) | notification | customer (segment), billing (debt) |
| ReportTNPM | report | billing, payment |
| AuditLogList | compliance | — |
| OwnerDashboard | iam + report | portfolio, billing |

---

## 18. Tóm tắt

- **11 microservice domains** gom nhóm đủ 20+ trang TNPM
- **~35% endpoints REUSE** từ retail branch (customer, payment base, notification channels, file, auth)
- **~40% endpoints EXTEND** (billing, service contract, reports, work order)
- **~25% endpoints NEW** (lease, cam, turnover, vendor full, b2g, partner-contract, portfolio, audit)
- **4 phase roadmap** khớp với HLD p.15: Foundation → Vendor+Payment → Lease+Retail → Optimize

**Next step cho BE teams**: Mỗi team owner của 1 service đọc section tương ứng, mở TODO checklist cho từng endpoint, estimate effort theo priority, đồng bộ với FE team để thay dần mock data → real API calls (pattern: tạo `src/services/tnpm/*Service.ts` theo stub có sẵn, điền base URL từ `src/configs/tnpmUrls.ts`).

**Contact FE team**: Khi BE endpoint sẵn sàng, FE sẽ thay `MOCK_*` import bằng service call + loading state. Toàn bộ pages hiện tại đã structured để swap dễ dàng.
