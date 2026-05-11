# Part 08 — Backend Architecture (suy luận)

> **Executive Summary**: Backend Reborn Retail CRM **không có trong repo** này — toàn bộ phần dưới đây là **suy luận ngược từ frontend** (URL prefix, service call, response shape). Kiến trúc quan sát được là mô hình **microservices theo bounded context**, sau một **API gateway** dạng prefix routing (`/bizapi/<domain>`). Bộ canonical gồm **11 microservices** nghiệp vụ; **Reborn Retail dùng 9/11**: `sales` (POS, order, shift, invoice lifecycle), `billing` (cashbook, debt, fund, payment, settlement, VAT e-invoice), `inventory` (stock + warehouse + PO + NCC), `care`, `logistics`, `integration`, `market` (campaign + loyalty), `notification`, và `finance` (⚠ banking-only — Athena, retail thường KHÔNG dùng). Hai service `contract` và `operation` chỉ thuộc TNPM, retail không bật. Platform: `/authenticator` (SSO) và `/bpmapi` (BPM engine). Cách giao tiếp service-to-service, mô hình dữ liệu (database-per-service vs shared DB), và công nghệ nền (Spring/Node/Go) **chưa xác minh được** — được gắn 🔴 và đưa vào danh sách câu hỏi cần BE xác nhận.

## 1. Bối cảnh & nguồn suy luận

Phần này dựa **hoàn toàn** vào các artefact sau trong repo:

- `src/configs/urls.ts` — 3600 dòng endpoint, nhóm theo prefix.
- `src/configs/fetchConfig.ts` — interceptor rewrite URL.
- `src/services/*Service.ts` — ~230 class service.
- Response shape ở `App.tsx` (`{ code, message, result }`).

**Không có** mã nguồn BE, file `docker-compose.yml`, `helm chart`, hay `openapi.yaml` trong repo này.

## 2. Pattern: Microservices sau API Gateway

🟡 **Trung bình** — quan sát URL prefix rõ ràng và env var `APP_BIZ_URL`, `APP_API_URL`, `APP_BPM_URL`, `APP_AUTHENTICATOR_URL` cho thấy **ít nhất 4 cụm deploy tách biệt**:

```
                    ┌─────────────────────┐
                    │   Browser / SPA     │
                    └──────────┬──────────┘
                               │ HTTPS
                               ▼
              ┌────────────────────────────────┐
              │      API GATEWAY (L7)          │
              │  - TLS termination             │
              │  - Route by URL prefix         │
              │  - Inject tenantId từ Hostname │
              │  - Rate limit (🔴)             │
              └───┬──────────┬──────────┬──────┘
                  │          │          │
     ┌────────────┘          │          └────────────┐
     ▼                       ▼                       ▼
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│ /bizapi/*│         │  /bpmapi/*   │         │/authenticator│
│  Biz     │         │  BPM engine  │         │  SSO / IAM   │
│  cluster │         │              │         │              │
└────┬─────┘         └──────────────┘         └──────────────┘
     │
     ├── sales        ├── care
     ├── inventory    ├── billing
     ├── logistics    ├── integration
     ├── market       ├── notification
     └── finance (⚠ banking only)
```

Các gateway ngoại quan sát được (từ `urls.ts`):

| Env var | Mục đích suy luận |
|---------|-------------------|
| `APP_API_URL` | Main API (dashboard, `/api/*`) |
| `APP_BIZ_URL` | Biz cluster (`/bizapi/*`) |
| `APP_ADMIN_URL` | Admin API (`/adminapi/*`) |
| `APP_BPM_URL` | BPM engine |
| `APP_AUTHENTICATOR_URL` | SSO (`reborn.vn`) |
| `APP_CONNECT_URL` | Messaging connect (Zalo/FB?) |
| `APP_UPLOAD_URL` | File upload gateway |
| `APP_ATHENA_URL` | Banking/transaction gateway (Athena) |

## 3. Bounded contexts

### 3.1. Sales — `/bizapi/sales` ✅ CORE

🟢 Xác nhận qua `OrderSalesService`, `InvoiceService`, `QuotationService`.

- Aggregate: `Order`, `OrderLine`, `Invoice`, `Receipt`, `Quotation`, `Shift`, `Cart`.
- Use case: tạo đơn POS, báo giá, mở/đóng ca, giỏ hàng, **invoice lifecycle (draft → confirm → cancel)**, dashboard sale, báo cáo POS.
- Outbound event (🔴): `sales.order.created`, `sales.order.paid`, `sales.invoice.issued`, `sales.invoice.paid`, `sales.invoice.cancelled`, `sales.shift.closed`.

⚠️ **Sales KHÔNG owns cashbook/debt/fund/payment** — những thứ đó thuộc `billing` service (xem §3.5). Khi POS thanh toán, `sales` emit event `sales.invoice.paid` → `billing` consume → ghi cashbook entry.

### 3.2. Finance — `/bizapi/finance` ⚠ BANKING ONLY

🟡 `FinanceService` (FE class — đây là legacy naming, không nên hiểu nhầm với cashbook).

- **Phạm vi thực**: chỉ phục vụ **hồ sơ tài chính của khách hàng** (banking integration qua **Athena** — `APP_ATHENA_URL`). Sản phẩm này thuộc dòng dịch vụ tài chính/banking (KYC, hồ sơ vay, tài khoản).
- ⚠️ **Reborn Retail thường KHÔNG dùng** service này. Nếu thấy `/bizapi/finance/*` xuất hiện trong code path retail → flag là bug, chuyển sang `/bizapi/billing/*`.
- KHÔNG chứa cashbook/debt/fund — những thứ đó nằm ở `billing` (xem §3.5).

### 3.3. Inventory — `/bizapi/inventory` ✅ CORE

🟢 `InventoryService`, `StockMovementService`, `WarehouseService`, `TransferOrderService`, `ImportInvoiceService`, `AdjustmentSlipService`, `PurchaseOrderService`, `SupplierService`.

- Aggregate: `StockItem`, `StockMovement`, `StockCard`, `Warehouse`, `TransferSlip`, `ImportSlip`, `AdjustmentSlip`, `StockTake`, **`PurchaseOrder`**, **`Supplier`**.
- Event: `stock.decreased`, `stock.increased`, `stock.transferred` (🔴).

#### 3.3.1. Warehouse (sub-domain của Inventory)

⚠️ Warehouse **KHÔNG phải service riêng** — là sub-domain của `inventory`. Quản danh mục kho + nghiệp vụ xuất/nhập/chuyển, song song với số dư tồn tức thời. Prefix `/bizapi/warehouse` xuất hiện trong `urls.ts` chỉ là **legacy URL**, gateway thực tế route về cùng pod `inventory-svc`.

#### 3.3.2. Purchase / NCC (sub-domain của Inventory) 🟡

🟡 Purchase order và nhà cung cấp được gộp vào `inventory` (chưa xác nhận tuyệt đối — có thể là service riêng `purchase` ở phiên bản backend cũ; cần BE confirm).

### 3.4. Care — `/bizapi/care`

🟡 `TicketService`, `WarrantyService`, `FeedbackService`.

- Customer care, ticket, warranty, feedback, CSKH.
- ⚠️ KHÔNG chứa loyalty (loyalty thuộc `market`). KHÔNG chứa MSAL (MSAL thuộc `integration`).

### 3.5. Billing — `/bizapi/billing` ✅ CORE (financial settlement hub)

🟢 Xác nhận qua `BillingService`, `CashBookService`, `DebtService`, `FundService`, `FinanceService` (legacy tên), `PaymentService`.

Billing service **owns toàn bộ dòng tiền và financial settlement** của retail:

- **Cashbook (sổ thu chi)** — phiếu thu, phiếu chi, sổ quỹ tiền mặt/ngân hàng.
- **Debt (công nợ)** — công nợ khách hàng (phải thu), công nợ NCC (phải trả).
- **Fund (quỹ)** — quỹ tiền mặt, quỹ ngân hàng, số dư tức thời.
- **Payment** — thanh toán đa phương thức (tiền mặt, thẻ, chuyển khoản, QR, ví), payment allocation.
- **Settlement** — đối soát cuối ca, cuối ngày.
- **VAT e-invoice** — hoá đơn điện tử TT78/NĐ123.

⚠️ **Quan trọng**: FE classes `CashBookService.ts`, `DebtService.ts`, `FundService.ts`, `FinanceService.ts` (legacy tên), `PaymentService.ts` đều gọi xuống `/bizapi/billing/...`. Permission code chuẩn: `BILLING_CASHBOOK_VIEW`, `BILLING_DEBT_VIEW`, `BILLING_FUND_VIEW`, `BILLING_PAYMENT_VIEW` (KHÔNG phải `SALES_*` hay `FINANCE_*`).

#### 3.5.1. Cashbook (sub-domain của Billing)

- Aggregate: `CashBookEntry`, `CashBookCategory`.
- Event in: `sales.invoice.paid` → auto-generate cashbook entry (thu tiền).
- Event out: `billing.cashbook.entry.created`.

#### 3.5.2. Debt (sub-domain của Billing)

- Aggregate: `DebtNote`, `DebtPayment`, `DebtAging`.
- Quản lý công nợ KH (AR) + NCC (AP), aging report, nhắc nợ.

#### 3.5.3. Fund (sub-domain của Billing)

- Aggregate: `Fund`, `FundTransaction`, `FundBalance`.
- Quỹ tiền mặt + ngân hàng, chuyển quỹ nội bộ.

#### 3.5.4. Payment (sub-domain của Billing)

- Aggregate: `Payment`, `PaymentMethod`, `PaymentAllocation`.
- Thanh toán đa phương thức, allocation vào invoice/debt, refund.

#### 3.5.5. VAT e-invoice (sub-domain của Billing)

- Hoá đơn điện tử VAT theo TT78/NĐ123.
- Adapter: VNPT, M-Invoice, MISA MeInvoice (xem [Part 09](part-09-integration.md)).

### 3.6. Logistics — `/bizapi/logistics`

🟢 `LogisticsService`, `ShipmentService`.

- Adapter: GHN, GHTK, VNPost, J&T. COD, tracking.

### 3.7. Integration — `/bizapi/integration`

🟡 `IntegrationService`. Hub trung tâm cho **mọi 3rd party connector**: marketplace sync (Shopee/Lazada/Tiki/TikTok), MSAL (Microsoft 365), payment gateway, e-invoice, SMS/Email provider, shipping partner adapter, webhook inbound/outbound.

### 3.8. Market — `/bizapi/market`

🟢 `CampaignService`, `SegmentService`, `MarketingAutomationService`, `PromotionService`, **`LoyaltyService`**, **`VoucherService`**.

- Aggregate: `Campaign`, `Segment`, `Promotion`, `Voucher`, **`LoyaltyPoint`**, **`LoyaltyTier`**, **`LoyaltyWallet`**.
- ⚠️ **Loyalty là sub-domain của `market`**, không phải service riêng. Marketplace sync KHÔNG ở đây — đã chuyển sang `integration`.

### 3.9. Notification — `/bizapi/notification`

🟢 `NotificationService`. FCM push, SMS, email, Zalo ZNS, Facebook.

### 3.10. BPM — `/bpmapi` (Platform)

🟢 `BpmService`. Workflow engine riêng — có UI reactflow/bpmn-js để vẽ quy trình. Không nằm trong 11 microservices nghiệp vụ.

### 3.11. Auth — `/authenticator` (Platform)

🟢 `EmployeeService.takeRoles`, SSO OAuth callback.

## 4. Service-to-service communication

🔴 **Thấp** — chưa xác nhận được. Giả thuyết hợp lý:

| Loại | Khả năng dùng | Dấu hiệu |
|------|---------------|----------|
| **Sync REST** | Cao | URL prefix gộp trên cùng base `APP_BIZ_URL` gợi ý gateway chung, trong cluster service có thể gọi nhau qua REST internal. |
| **Event bus (Kafka/RabbitMQ)** | Trung bình | Các nghiệp vụ POS → inventory → finance đan nhau, khả năng có event async. |
| **Shared DB** | Trung bình | Một số aggregate có tham chiếu chéo (order↔stock↔customer) — nếu database-per-service thì phải dùng saga hoặc event, nếu shared DB thì đơn giản hơn nhưng coupling cao. |

**Đề xuất hỏi BE**:

1. Có event bus không? Nếu có, công nghệ gì, topic naming?
2. Giao dịch xuyên service (order → stock) xử lý qua saga hay distributed tx?
3. DB-per-service hay shared DB?

## 5. API gateway pattern

🟡 Gateway chịu trách nhiệm:

1. **TLS termination** và HTTPS redirect.
2. **Prefix routing** — ánh xạ `/bizapi/sales/*` → upstream `sales-service:8080`.
3. **Header propagation** — đẩy `Authorization`, `Selectedrole`, `Hostname` xuống downstream.
4. **Tenant resolve** (🔴) — có thể parse `Hostname` ra `tenantId` rồi inject header `X-Tenant-Id` cho service (best practice).
5. **Rate limit** (🔴) — chưa xác nhận.
6. **CORS** — phải cho phép origin `*.reborn.vn`.

Công nghệ gateway khả dĩ: **Nginx + Lua**, **Kong**, **Traefik**, **Spring Cloud Gateway**, **APISIX**. Không có cách xác minh từ frontend.

## 6. Database pattern

🔴 **Thấp** — chỉ phỏng đoán:

### Kịch bản A — Shared DB (1 schema lớn)

- Dễ join, dễ dev, ACID mạnh.
- Coupling cao, scale khó, deploy phụ thuộc.

### Kịch bản B — Database per service

- Decoupling tốt, scale độc lập.
- Cần saga/event cho cross-service tx.
- Join phải qua BFF/aggregator.

### Kịch bản C — Hybrid (khả năng cao nhất)

- Các domain "nóng" (sales, inventory) có DB riêng.
- Các domain "config" (user, role, catalog) shared.

**Đề xuất BE xác nhận** bằng sơ đồ ER.

## 7. Recommended tech stack (nếu greenfield)

| Lớp | Khuyến nghị | Lý do |
|-----|-------------|-------|
| Ngôn ngữ | **Java Spring Boot 3 / Kotlin** hoặc **Go** | Phổ biến VN, ecosystem mạnh cho ERP/CRM |
| API gateway | **Spring Cloud Gateway** hoặc **Kong** | Prefix routing native |
| Service mesh | **Istio** (optional) | mTLS, tracing |
| Event bus | **Kafka** (Confluent / Redpanda) | Retention cho event sourcing |
| Database | **PostgreSQL 15+** (primary), **Redis** (cache/queue) | Proven VN |
| Search | **OpenSearch / Elasticsearch** | Tìm sản phẩm, đơn hàng |
| Object store | **MinIO / S3** | Ảnh SP, file đính kèm |
| Observability | **OpenTelemetry + Grafana Tempo/Loki/Prometheus** | Full stack |
| CI/CD | **GitLab CI** hoặc **GitHub Actions** + **ArgoCD** | GitOps |

Alternative: **Node.js (NestJS)** nếu team FE fullstack, **Go** nếu hiệu năng cao hơn.

## 8. Deployment topology (suy luận)

🔴 Giả thuyết:

```
┌────────────────────────────────────────────┐
│         Kubernetes cluster (VN)            │
│                                            │
│  Namespace: gateway                        │
│    └── api-gateway (3 pods)                │
│                                            │
│  Namespace: biz                            │
│    ├── sales-svc       (N pods)            │
│    │     POS+order+shift+invoice           │
│    ├── billing-svc     (N pods)            │
│    │     cashbook+debt+fund+payment+       │
│    │     settlement+VAT e-invoice          │
│    ├── inventory-svc   (N pods)            │
│    │     stock+warehouse+PO+NCC            │
│    ├── care-svc        (N pods)            │
│    ├── logistics-svc   (N pods)            │
│    ├── integration-svc (N pods)            │
│    │     marketplace+MSAL+payment+         │
│    │     e-invoice+SMS/Email adapters      │
│    ├── market-svc      (N pods)            │
│    │     campaign+voucher+loyalty          │
│    ├── notification-svc(N pods)            │
│    └── finance-svc     (banking only,      │
│          retail thường KHÔNG bật)          │
│                                            │
│  Namespace: platform                       │
│    ├── authenticator                       │
│    ├── bpm-engine                          │
│    ├── kafka (3 broker)                    │
│    ├── redis (cluster)                     │
│    └── postgres (primary + 2 replica)      │
└────────────────────────────────────────────┘
```

## 9. Câu hỏi cần BE xác nhận

| # | Câu hỏi | Priority |
|---|---------|----------|
| Q1 | Tech stack cụ thể BE dùng? | High |
| Q2 | Database-per-service hay shared? | High |
| Q3 | Event bus có không? Loại nào? | High |
| Q4 | Cross-service tx pattern (saga? tx script?) | High |
| Q5 | Gateway công nghệ gì? | Medium |
| Q6 | Tenant resolve ở gateway hay service? | High |
| Q7 | Có service mesh không? | Low |
| Q8 | Schedule job (cron) ở đâu? | Medium |
| Q9 | File storage (S3, MinIO, local)? | Medium |
| Q10 | Search engine riêng hay dùng SQL? | Low |

## Tham chiếu

- Files:
  - `src/configs/urls.ts`
  - `src/configs/fetchConfig.ts`
  - `src/services/*Service.ts`
- [Part 06 — Service & API](part-06-service-api.md)
- [Part 09 — Integration](part-09-integration.md)
- [ADR-05](part-13-adr.md#adr-05) Multi-tenant via Hostname

---
*Hết Part 08. Xem tiếp [Part 09 — Integration](part-09-integration.md).*
