# Part 08 — Backend Architecture (suy luận)

> **Executive Summary**: Backend Reborn Retail CRM **không có trong repo** này — toàn bộ phần dưới đây là **suy luận ngược từ frontend** (URL prefix, service call, response shape). Kiến trúc quan sát được là mô hình **microservices theo bounded context**, sau một **API gateway** dạng prefix routing (`/bizapi/<domain>`), tách tối thiểu 11 dịch vụ nghiệp vụ (`sales`, `finance`, `inventory`, `warehouse`, `care`, `billing`, `logistics`, `integration`, `market`, `notification`) cộng BPM và Auth. Cách giao tiếp service-to-service, mô hình dữ liệu (database-per-service vs shared DB), và công nghệ nền (Spring/Node/Go) **chưa xác minh được** — được gắn 🔴 và đưa vào danh sách câu hỏi cần BE xác nhận.

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
     ├── finance      ├── billing
     ├── inventory    ├── logistics
     ├── warehouse    ├── integration
     ├── market       ├── notification
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

### 3.1. Sales — `/bizapi/sales`

🟢 Xác nhận qua `OrderSalesService`, `InvoiceService`, `QuotationService`.

- Aggregate: `Order`, `OrderLine`, `Invoice`, `Receipt`, `Quotation`.
- Use case: tạo đơn POS, báo giá, công nợ phải thu, đơn hàng return.
- Outbound event (🔴): `order.created`, `order.paid`, `invoice.issued`.

### 3.2. Finance — `/bizapi/finance`

🟢 `CashBookService`, `FinanceService`, `DebtService`, `FundService`.

- Aggregate: `CashBookEntry`, `Receipt`, `Payment`, `Fund`, `DebtNote`.
- Tích hợp bank: Athena (`APP_ATHENA_URL`).

### 3.3. Inventory — `/bizapi/inventory`

🟢 `InventoryService`, `StockMovementService`.

- Aggregate: `StockItem`, `StockMovement`, `StockCard`.
- Event: `stock.decreased`, `stock.increased` (🔴).

### 3.4. Warehouse — `/bizapi/warehouse`

🟢 `WarehouseService`, `TransferOrderService`, `ImportInvoiceService`, `AdjustmentSlipService`.

- Aggregate: `Warehouse`, `TransferSlip`, `ImportSlip`, `AdjustmentSlip`, `StockTake`.
- **Phân biệt** với `inventory`: `warehouse` quản danh mục kho + nghiệp vụ xuất/nhập/chuyển, `inventory` quản số dư tồn tức thời.

### 3.5. Care — `/bizapi/care`

🟡 `TicketService`, `WarrantyService`, `FeedbackService`.

- Customer care, ticket, warranty tracking.

### 3.6. Billing — `/bizapi/billing`

🟢 `BillingService`. Hoá đơn điện tử VAT theo TT78/TT32.

- Adapter: VNPT, M-Invoice, MISA MeInvoice (xem [Part 09](part-09-integration.md)).

### 3.7. Logistics — `/bizapi/logistics`

🟢 `LogisticsService`, `ShipmentService`.

- Adapter: GHN, GHTK, VNPost, J&T.

### 3.8. Integration — `/bizapi/integration`

🟡 `IntegrationService`. Hub trung tâm cho 3rd party (marketplace, webhook inbound).

### 3.9. Market — `/bizapi/market`

🟢 `CampaignService`, `SegmentService`, `MarketingAutomationService`, `PromotionService`.

### 3.10. Notification — `/bizapi/notification`

🟢 `NotificationService`. FCM push, SMS, email, Zalo ZNS.

### 3.11. BPM — `/bpmapi`

🟢 `BpmService`. Workflow engine riêng — có UI reactflow/bpmn-js để vẽ quy trình.

### 3.12. Auth — `/authenticator`

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
│    ├── finance-svc     (N pods)            │
│    ├── inventory-svc   (N pods)            │
│    ├── warehouse-svc   (N pods)            │
│    ├── care-svc        (N pods)            │
│    ├── billing-svc     (N pods)            │
│    ├── logistics-svc   (N pods)            │
│    ├── integration-svc (N pods)            │
│    ├── market-svc      (N pods)            │
│    └── notification-svc(N pods)            │
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
