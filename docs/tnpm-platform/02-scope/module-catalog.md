# 02. Catalog module nghiệp vụ + NFR

## 1. 8 module nghiệp vụ chính

Mỗi module gồm: mô tả nghiệp vụ + service BE chịu trách nhiệm + số trang FE đã prototype.

### 1.1 CRM & Hồ sơ KH
- **Nghiệp vụ**: quản lý cư dân (B2C), doanh nghiệp thuê (B2B), đơn vị HC (B2G). 1 KH có thể có nhiều hợp đồng cùng lúc.
- **BE service**: `customer-service` (REUSE 6 + EXTEND 2 endpoint).
- **FE**: tái sử dụng `CustomerPersonList` của retail.

### 1.2 Hợp đồng dịch vụ
- **Nghiệp vụ**: HĐ dịch vụ định kỳ (phí QL, gửi xe, điện, nước, rác).
- **BE service**: `contract-service` (EXTEND 2 + NEW 12 endpoint, dùng chung với lease/vendor/partner contract).
- **FE**: `ServiceContractList`.

### 1.3 Billing Engine (3 nhóm công thức)
- **Nghiệp vụ**:
  - Service-based: phí dịch vụ định kỳ.
  - Lease-based: tiền thuê mặt bằng + escalation.
  - **Turnover Rent (NEW)**: MAX(Base, % doanh thu) — riêng TTTM, tenant submit doanh thu hoặc POS integration.
- Hỗ trợ **EVN bậc thang điện**, đơn giá nước, **CAM charges allocation** theo diện tích.
- **BE service**: `billing-service` (REUSE 1 + EXTEND 5 + NEW 17 endpoint).
- **FE**: `BillingEngineList`, `MeterReadingList`, `TurnoverRentList`, `SettingCAMCharges`.

### 1.4 Lease / Rent Management *(MỚI)*
- **Nghiệp vụ**: HĐ thuê mặt bằng VP/TTTM/KCN, lịch tăng giá CPI, tiền cọc, gia hạn tự động, escalation clause.
- **BE service**: extend `contract-service` + bảng `lease_escalation_schedule`.
- **FE**: `LeaseContractList` (detail 4 tab: General / Escalation / Deposit / Renewal).

### 1.5 Payment + Debt
- **Nghiệp vụ**: tích hợp **App Timi** (webhook công nợ/noti), **MSB Pay** (QR/VA/Debit), tiền mặt, NET30 invoice, gạch nợ auto, **VNPay/MoMo** qua Payment Gateway abstraction.
- **BE service**: `payment-service` (REUSE 11 + EXTEND 3 + NEW 5 endpoint).
- **FE**: `DebtManagementList`, `DebtTransactionList`, `SettingPaymentMethods`.

### 1.6 Vendor Management *(CORE cho TNPM, MỚI)*
- **Nghiệp vụ**: toàn chu kỳ NCC — danh mục → HĐ → SLA → KPI → **3-way match (PO – Biên bản nghiệm thu – Invoice)** → phê duyệt đa cấp (KST → QLDA → KT) → thanh toán → Vendor Portal cho NCC submit invoice.
- **BE service**: `vendor-service` (NEW 12 endpoint, đề xuất extend `customer` + `contract` + `sales` + `bpm`).
- **FE**: `VendorManagementList` (5 tab detail), `VendorContractList`, `VendorInvoiceList` (workflow 4 bước), `VendorKPIDashboard`, `VendorPortalPreview`.

### 1.7 Operations / Service Request
- **Nghiệp vụ**: tiếp nhận yêu cầu cư dân/tenant, ticket khiếu nại, phân công KST/NCC, Maintenance Plan định kỳ.
- **BE service**: `operations-service` (EXTEND 4 + NEW 8 endpoint).
- **FE**: `ServiceRequestList`, `ComplaintTicketList`, `MaintenancePlanList`, `StaffScheduleList`.

### 1.8 Cross-cutting modules
- **Multi-tenant Core** — `iam-service`: OAuth2/JWT + tenant claims, schema-per-tenant hoặc RLS.
- **Notification Engine** — `notification-service`: SMS, Email, Zalo, FCM, template, campaign manual + auto rule (NEW 12 endpoint).
- **Audit Log** — `compliance-service`: append-only, 2 năm hot + S3 archive.
- **B2G Compliance** *(MỚI)* — `compliance-service`: workflow kho bạc 4 bước, ngân sách năm HC.
- **Reports / BI** — `report-service`: P&L per project, portfolio aggregate, vendor KPI, export Excel/PDF.
- **Owner Dashboard / Vendor Portal** — separate auth domain (P4 theo HLD nhưng đã được kéo lên scope hiện tại).
- **Portfolio Hierarchy** — `portfolio-service`: Portfolio → Project → Building → Floor → Space → Unit (NEW 8 endpoint).

## 2. Tổng số endpoint backend cần delivery

| Service | REUSE | EXTEND | NEW | Tổng |
|---|---:|---:|---:|---:|
| iam-service | 6 | 1 | 4 | 11 |
| portfolio-service | 0 | 0 | 8 | 8 |
| customer-service | 6 | 2 | 0 | 8 |
| contract-service | 0 | 2 | 12 | 14 |
| billing-service | 1 | 5 | 17 | 23 |
| payment-service | 11 | 3 | 5 | 19 |
| vendor-service | 0 | 0 | 12 | 12 |
| partner-service | 4 | 0 | 0 | 4 |
| operations-service | 0 | 4 | 8 | 12 |
| notification-service | 5 | 5 | 12 | 22 |
| compliance-service | 0 | 0 | 10 | 10 |
| report-service | 1 | 2 | 6 | 9 |
| **Tổng** | **34** | **24** | **94** | **152** |

> **Đếm thực tế: ~22% REUSE / ~16% EXTEND / ~62% NEW** — chú ý: spec gốc ghi tỉ lệ 35/40/25, nhưng đó là tỉ lệ "tính chất service" chứ không phải đếm dòng endpoint. Khi estimate cost, dùng tỉ lệ đếm thực tế.

## 3. Non-Functional Requirements

| Hạng mục | Yêu cầu | Implementation |
|---|---|---|
| **Uptime** | ≥ 99.5% | HA load balancer + auto failover |
| **Performance — payment** | < 3s end-to-end | Async webhook, idempotency, cache |
| **Performance — batch invoice** | Portfolio 10 dự án < 5 phút | Distributed queue per project, horizontal scale workers, idempotency key `(projectId, period)` |
| **Multi-tenant isolation** | Strong tenant boundary | Schema-per-tenant cho tenant lớn + RLS hybrid cho tenant nhỏ |
| **API Gateway** | inject `X-Tenant-ID` từ JWT claims | OAuth2/JWT, rate limit, TLS 1.3 |
| **Encryption** | AES-256 at rest, TLS 1.3 in transit | Standard cloud KMS |
| **Audit log retention** | 2 năm hot + archive | PostgreSQL hot tier + S3 cold tier |
| **Webhook security** | HMAC signature, IP whitelist, idempotency dedupe | Critical cho MSB/Timi |
| **Compliance** | NHNN payment compliance | Đối soát hàng ngày, báo cáo NHNN |
| **DR** | RTO 4h, RPO 1h | Daily backup, 30 days retention |
| **Search** | full-text customer/invoice/vendor/SR | ElasticSearch cluster |
| **Event bus** | Async giữa service | RabbitMQ (P1-2), Kafka khi > 10k msg/s |
| **Monitoring** | health-check, KPI metrics | Prometheus + Grafana |
| **Mobile responsive** | Web admin responsive desktop/tablet | Phase 1 |

## 4. Out-of-scope của bộ cost estimate này

Các hạng mục **không** nằm trong cost 7.9 tỷ đã chốt — sẽ tính riêng nếu TNPM muốn:

1. **Mobile app cư dân Timi-like** (React Native, HLD p.14) — ước tính riêng ~1.2–1.8 tỷ.
2. **AI phân tích công nợ** (Phase 4) — cần ML engineer + data pipeline, ~600M–1 tỷ.
3. **Hotline call center integration** (Phase 1 theo HLD nhưng cần thiết bị + đối tác viễn thông riêng).
4. **POS integration cho TTTM tenant** (turnover rent — chỉ cần khi tenant đủ lớn).
5. **Migrate dữ liệu lịch sử** từ hệ thống cũ TNPM (ước riêng theo độ phức tạp data source).
6. **On-premise deployment** nếu TNPM yêu cầu (mặc định cloud-managed).
