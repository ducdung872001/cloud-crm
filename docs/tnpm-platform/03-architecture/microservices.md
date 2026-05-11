# 03. Kiến trúc — Microservice map, data model, integration

## 1. Tổng quan kiến trúc layer

```
                  ┌─────────────────────────────────────────────────┐
                  │                Web Admin (React)                │
                  │  31 page TNPM + Owner Portal + Vendor Portal    │
                  └────────────────────┬────────────────────────────┘
                                       │ HTTPS / JWT (Bearer + X-Tenant-ID)
                  ┌────────────────────▼────────────────────────────┐
                  │         API Gateway / BFF (per client)          │
                  │   rate limit · TLS 1.3 · tenant claim inject    │
                  └────────────────────┬────────────────────────────┘
        ┌──────────────────┬───────────┴───────────┬──────────────────┐
        │                  │                       │                  │
   ┌────▼────┐      ┌──────▼─────┐         ┌───────▼──────┐    ┌──────▼──────┐
   │  IAM    │      │ Portfolio  │   ...   │  Vendor      │    │  Compliance │
   │ service │      │  service   │         │  service     │    │  service    │
   └─────────┘      └────────────┘         └──────────────┘    └─────────────┘
        │                  │                       │                  │
        └──────────────────┴───────────┬───────────┴──────────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │  Event Bus (RabbitMQ →   │
                          │   Kafka khi scale)      │
                          └────────────┬────────────┘
                                       │
        ┌──────────────────┬───────────┴───────────┬──────────────────┐
        │                  │                       │                  │
   ┌────▼────┐       ┌─────▼─────┐          ┌──────▼─────┐      ┌─────▼────┐
   │ MySQL/  │       │  Redis    │          │  Elastic-  │      │   S3     │
   │ Postgres│       │  Streams  │          │  Search    │      │ Archive  │
   │ (per    │       │           │          │            │      │          │
   │ tenant) │       │           │          │            │      │          │
   └─────────┘       └───────────┘          └────────────┘      └──────────┘

External Integration (qua Integration Bus):
  ├─ MSB Pay (QR/VA/Debit, webhook)
  ├─ App Timi (webhook công nợ + notification cư dân)
  ├─ VNPay / MoMo (Payment Gateway abstraction)
  ├─ SMS Gateway (OTP, nhắc hạn)
  ├─ Email SMTP
  └─ sInvoice (hoá đơn điện tử)
```

## 2. 12 microservice — Trách nhiệm + Reuse map

| # | Service | Trách nhiệm chính | REUSE từ retail | Build mới |
|---|---|---|---|---|
| 1 | `iam-service` | Auth, multi-tenant, RBAC, Owner/Vendor portal SSO | Auth/RBAC core | Tenant claim resolver, portal SSO |
| 2 | `portfolio-service` | Portfolio → Project → Building → Floor → Space → Unit hierarchy | — | Full mới (8 endpoint) |
| 3 | `customer-service` | KH cư dân/doanh nghiệp/đơn vị HC + segment | CRM core | Segment cho property |
| 4 | `contract-service` | Service contract + Lease + Vendor + Partner contract | Contract base + appendix + guarantee | Lease escalation, deposit ledger, auto-renew |
| 5 | `billing-service` | Fee types, rates, meter reading (điện/nước), CAM, Turnover Rent, invoice batch | Cashbook, fund, reconciliation | EVN bậc thang, CAM allocation, turnover formula |
| 6 | `payment-service` | Payment recording, debt ledger, gateway abstraction | Payment + debt + deposit ledger | MSB/Timi/VNPay/MoMo gateway adapter, auto-debit |
| 7 | `vendor-service` | Vendor master, KPI, 3-way match, blacklist | Customer extend | Toàn bộ vendor lifecycle (12 endpoint NEW) |
| 8 | `partner-service` | Partner referral, partner contract | Partner retail | — |
| 9 | `operations-service` | Service Request, Complaint, Maintenance Plan, SLA | Care ticket | Maintenance Plan domain, SLA escalation |
| 10 | `notification-service` | SMS/Email/Zalo/FCM template, campaign manual + auto rule | Notification core | Auto rule engine (12 NEW), campaign manual |
| 11 | `compliance-service` | B2G workflow kho bạc, Audit Log, Tenant isolation scan | — | Full mới (10 endpoint) |
| 12 | `report-service` | P&L per project, portfolio aggregate, vendor KPI, export | Report base | P&L formula, portfolio aggregate |

**Shared infra services** (cross-cutting, không tính vào 12):
- `file-service` (REUSE) — upload/download tài liệu HĐ, biên bản, invoice scan.
- `bpm-core` (REUSE branch `cloud`) — workflow engine generic cho vendor invoice 3-way + B2G + lease auto-renew.
- `integration-service` (REUSE) — gateway MSB/Timi/VNPay/MoMo + sInvoice + Zalo OA + webhook.
- `search-service` (NEW) — ElasticSearch cluster sync workers.
- `messaging-bus` (NEW) — RabbitMQ → Kafka khi scale.

## 3. Data model high-level

```
PORTFOLIO ──┬── PROJECT ──┬── BUILDING ──┬── FLOOR ──┬── SPACE ──┬── SPACE_CUSTOMER
            │             │              │           │           │
            │             │              │           │           ├── METER (điện/nước/khác)
            │             │              │           │           │     └── METER_INDEX (chỉ số tháng)
            │             │              │           │           │
            │             │              │           │           └── CONTRACT (service/lease)
            │             │              │           │                 ├── CONTRACT_APPENDIX
            │             │              │           │                 ├── LEASE_ESCALATION_SCHEDULE *(NEW)*
            │             │              │           │                 ├── DEPOSIT_LEDGER *(NEW)*
            │             │              │           │                 └── INVOICE
            │             │              │           │                       └── PAYMENT
            │             │              │           │                              └── DEBT_TRANSACTION
            │             │              │           │
            │             │              │           └── CAM_ALLOCATION *(NEW)*
            │             │              │
            │             │              └── (mặt bằng chung)
            │             │
            │             ├── SERVICE_REQUEST ── TICKET ── ASSIGNMENT (KST/NCC)
            │             │
            │             ├── MAINTENANCE_PLAN *(NEW)*
            │             │     └── MAINTENANCE_TASK ── MAINTENANCE_HISTORY
            │             │
            │             └── B2G_BUDGET *(NEW, chỉ khu HC)*
            │                   └── B2G_WORKFLOW (4 bước: QLDA → KT → GĐ → KBNN)
            │
            └── PORTFOLIO_AGGREGATE_REPORT

VENDOR ─── VENDOR_CONTRACT ─── VENDOR_INVOICE *(3-way match)*
                                  │
                                  ├── PURCHASE_ORDER
                                  ├── ACCEPTANCE_RECORD (biên bản nghiệm thu)
                                  └── APPROVAL_FLOW (KST → QLDA → KT)

AUDIT_LOG *(append-only, 2y hot + S3 archive)*
TENANT_ISOLATION_SCAN_RESULT *(NEW — kiểm tra row-level security violation)*
```

Mọi entity có `project_id FK` (hoặc `tenant_id` đối với shared schema model) để đảm bảo isolation.

## 4. Multi-tenant strategy

| Approach | Khi nào dùng | Trade-off |
|---|---|---|
| **Schema-per-tenant** | Dự án lớn (>5000 cư dân, hoặc CĐT yêu cầu) | Strong isolation, dễ backup riêng. Tốn DB resource, migration phức tạp khi >50 tenant. |
| **Shared schema + RLS** | Dự án nhỏ-vừa | Tiết kiệm resource, migration đơn giản. Cần PostgreSQL RLS hoặc enforce qua application layer. |
| **Hybrid (đề xuất)** | Mặc định | Default shared schema + RLS; promote tenant lên schema-per-tenant khi đạt threshold. |

API Gateway inject `X-Tenant-ID` từ JWT claims → mỗi service tự enforce filter. Audit periodic scan để phát hiện violation.

## 5. Integration map

### 5.1 MSB Pay
- **Flow**: QR / VA / Debit. Customer thanh toán → MSB callback webhook → `payment-service` ghi nhận + gạch nợ auto.
- **Security**: HMAC signature, IP whitelist, idempotency key dedupe `(gateway_txn_ref)`.
- **SLA**: callback < 30s, retry exponential nếu fail.

### 5.2 App Timi
- **Flow**: Cư dân xem công nợ + nhận noti push qua Timi. TNPM push công nợ → Timi sync xuống device.
- **Webhook**: Timi push confirm payment → `payment-service` gạch nợ.

### 5.3 VNPay / MoMo
- **Flow**: thông qua Payment Gateway abstraction trong `payment-service`. Adapter per provider.

### 5.4 sInvoice
- **Flow**: phát hành hoá đơn điện tử qua `sales` (REUSE retail).

### 5.5 SMS / Email / Zalo OA
- **Flow**: `notification-service` template-driven. Channel switch theo cost + preference.

## 6. Tech stack đề xuất

| Layer | Stack | Lý do |
|---|---|---|
| Web Admin | **React + TypeScript + Vite** | Đồng bộ retail CRM, FE team đã thông thuộc |
| Mobile (out-of-scope cost này) | React Native | Cross-platform, share code FE |
| BE Microservice | **Java 21 + Spring Boot 3.2 + Vert.x + jOOQ** | Stack hiện tại của Reborn operation, đã chạy production |
| DB | **MySQL / PostgreSQL** (RLS) | PostgreSQL preferred do hỗ trợ RLS native |
| Cache | Redis | Standard |
| Search | ElasticSearch | Full-text customer/invoice/vendor |
| Message Bus | **RabbitMQ → Kafka** (khi scale) | HLD đề xuất, đã có infra |
| Workflow | BPM core (branch `cloud`) | REUSE engine |
| Monitor | Prometheus + Grafana + ELK | Standard observability |
| CI/CD | GitLab CI / GitHub Actions + ArgoCD | K8s deploy |
| Container | Kubernetes (managed) | HA + auto scale |
| Cloud | AWS hoặc Vietnam-resident (Viettel/VNG) | Tuỳ compliance NHNN |

## 7. Risk kỹ thuật

| # | Risk | Mức | Hành động |
|---|---|---|---|
| 1 | Permission blocker P0 với test user — chưa cấp `/management/ VIEW` | CAO | Cần ops grant trước khi wire FE→BE thật |
| 2 | Schema-per-tenant không scale > 50 tenant | CAO | Chốt hybrid model trước Phase 1 |
| 3 | Batch invoice ngày mồng 1 nghẽn | CAO | Distributed queue + idempotency + DLQ |
| 4 | Webhook MSB/Timi double-process | TRUNG | Dedupe bằng `gateway_txn_ref` unique |
| 5 | 3-way match tolerance chưa quyết (5%?) | TRUNG | Config-able tolerance |
| 6 | Vendor portal auth: magic link vs username/pass | TRUNG | HLD đề xuất magic link + OTP SMS |
| 7 | Owner portal SSO/SAML cho CĐT lớn | TRUNG | Case-by-case, không gồm trong cost mặc định |
| 8 | Audit retention 2 năm đủ NHNN compliance? | TRUNG | Cần legal review |
| 9 | Maintenance Plan ERD thiếu trong operation | THẤP | Handoff bổ sung, cost đã reserve |
| 10 | NHNN payment compliance impl details | TRUNG | Cần security engineer + legal |
