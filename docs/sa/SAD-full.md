# Tài liệu Kiến trúc Giải pháp — Reborn CRM

**Solution Architecture Document (SAD)** — tài liệu kỹ thuật mô tả kiến trúc tổng thể và chi tiết của hệ thống Reborn CRM (biến thể Cửa hàng / Spa / Cộng đồng).

> **Trạng thái:** Bản thảo (Draft) — biên soạn ngược từ codebase frontend + best practice cho stack tương đương. Các phần được đánh dấu rõ mức độ tự tin.

## Mục đích tài liệu

SAD trả lời câu hỏi **"Hệ thống được xây như thế nào?"** từ góc độ kỹ thuật, bổ sung cho:
- **HDSD** (`docs/userguides/`) — *"dùng thế nào?"* (góc nhìn người dùng cuối)
- **URD** (`docs/urd/`) — *"phải làm được gì?"* (góc nhìn yêu cầu nghiệp vụ)

## Cấu trúc tài liệu

| Part | Tiêu đề | Tự tin | Mô tả ngắn |
|------|---------|:------:|------------|
| [Part 00](part-00-tong-quan.md) | Tổng quan & Đối tượng đọc | 🟢 | Mục đích, scope, độc giả, conventions |
| [Part 01](part-01-kien-truc-tong-the.md) | Kiến trúc tổng thể (4+1 views) | 🟢 | Logical / Process / Development / Deployment / Scenario |
| [Part 02](part-02-frontend-architecture.md) | Frontend Architecture | 🟢 | React + TypeScript + Vite, structure, patterns |
| [Part 03](part-03-tech-stack.md) | Tech Stack & Dependencies | 🟢 | Toàn bộ thư viện + lý do dùng |
| [Part 04](part-04-routing-navigation.md) | Routing & Navigation | 🟢 | react-router, sidebar config, lazy load, tenant variants |
| [Part 05](part-05-component-module.md) | Component & Module Architecture | 🟢 | 167 page modules, 78 components, contexts, hooks |
| [Part 06](part-06-service-api.md) | Service Layer & API Contract | 🟡 | 240 service files, fetch interceptor, conventions |
| [Part 07](part-07-data-architecture.md) | Data Architecture | 🟡 | ERD, multi-tenant, soft delete, audit trail |
| [Part 08](part-08-backend-architecture.md) | Backend Architecture (suy luận) | 🔴 | Microservices, bounded contexts, gateway pattern |
| [Part 09](part-09-integration.md) | Integration Architecture | 🟡 | SSO, payment, e-invoice, SMS/email, webhook |
| [Part 10](part-10-security.md) | Security Architecture | 🟡 | AuthN/AuthZ, tenant isolation, encryption, OWASP |
| [Part 11](part-11-cross-cutting.md) | Cross-cutting Concerns | 🟡 | Logging, monitoring, error handling, i18n, config |
| [Part 12](part-12-deployment.md) | Deployment & Infrastructure | 🔴 | Environments, CI/CD, network, DR |
| [Part 13](part-13-adr.md) | Architectural Decisions (ADRs) | 🟢🟡 | 18 quyết định kiến trúc quan trọng |
| [Part 14](part-14-quality-risks.md) | Performance, Quality, Risks | 🟡 | NFR mapping, test strategy, risk register |

## Quy ước

### Mức độ tự tin

| Ký hiệu | Ý nghĩa |
|---------|---------|
| 🟢 **Cao** | Quan sát trực tiếp từ source code đang chạy. Có thể trích dẫn file/dòng cụ thể |
| 🟡 **Trung bình** | Suy luận từ frontend / model / service interface. Có thể đúng về bản chất nhưng chi tiết cần backend xác nhận |
| 🔴 **Thấp** | Suy luận theo best practice cho stack tương tự. Đội backend / DevOps cần xác nhận hoặc thay bằng thông tin thực tế |

Mỗi mục có mức độ ≠ 🟢 sẽ có **box cảnh báo** ở đầu nội dung.

### Mã định danh ADR

`ADR-NN` — Architectural Decision Record số NN. Format theo Michael Nygard:
- **Trạng thái** (Proposed / Accepted / Deprecated / Superseded by)
- **Bối cảnh** (Context)
- **Quyết định** (Decision)
- **Hậu quả** (Consequences)

### Đối tượng đọc

| Vai trò | Sử dụng SAD để |
|---------|----------------|
| **Tech Lead / Architect** | Hiểu toàn bộ kiến trúc, ra quyết định nâng cấp |
| **Senior Developer** | Onboarding, hiểu lý do design pattern |
| **DevOps / SRE** | Cấu hình hạ tầng, monitoring, troubleshoot |
| **Security Reviewer** | Audit bảo mật, kiểm tra threat model |
| **Đối tác triển khai** | Hiểu để build add-on / tích hợp |

### Tài liệu liên quan

- HDSD: `docs/userguides/HDSD-full-final.md`
- URD: `docs/urd/URD-full.md`
- Codebase: thư mục root của repository này

## Lịch sử phiên bản

| Phiên bản | Ngày | Người soạn | Mô tả |
|-----------|------|------------|-------|
| 0.1 (Draft) | 2026-04-14 | Reborn (reverse-engineered) | Bản thảo đầu tiên, biên soạn ngược |

---

# Toàn bộ nội dung SAD

---

# Part 00 — Tổng quan & Đối tượng đọc

## 1. Mục đích tài liệu

Tài liệu **Solution Architecture Document (SAD)** mô tả **kiến trúc kỹ thuật toàn diện** của Reborn CRM — biến thể *Cửa hàng / Spa / Cộng đồng*. Đây là **tài liệu kỹ thuật chính** dành cho đội phát triển, vận hành, và các bên liên quan kỹ thuật khác.

SAD KHÔNG hướng dẫn người dùng cuối (đó là HDSD), KHÔNG mô tả nghiệp vụ ở mức yêu cầu (đó là URD). SAD trả lời các câu hỏi:

- Hệ thống được **xây bằng công nghệ gì**?
- Các **module/service** tổ chức ra sao?
- **Dữ liệu** chảy như thế nào trong hệ thống?
- **Tích hợp** với bên ngoài qua giao thức gì?
- Làm sao đảm bảo **bảo mật, hiệu năng, độ tin cậy**?
- Triển khai ở đâu, **scale** thế nào?
- Tại sao quyết định **A** thay vì **B**? (ADR)

## 2. Phạm vi tài liệu

### 2.1. Trong phạm vi (In-scope)

- **Frontend**: codebase React/TypeScript trong thư mục `src/` của repository `cloud-crm` (167 page modules, 78 components, 240 service files, 5 contexts, 30+ custom hooks).
- **Build & Bundling**: cấu hình Vite (sau khi migration từ Webpack), tooling.
- **API contract** (góc nhìn frontend): convention gọi API, các URL prefix, fetch interceptor, header chuẩn, error handling.
- **Routing & Navigation**: react-router-dom v6 với 167 route, sidebar config theo tenant.
- **State management**: Context API (5 context), local state, custom hooks pattern.
- **Authentication flow**: SSO redirect, token cookie, role selection.
- **Multi-tenant strategy** (góc nhìn frontend): sử dụng `Hostname` header, `branchId`, `tenantId`.
- **Integration interfaces**: SSO, payment gateway, e-invoice, SMS, email, Zalo, Facebook, vận chuyển, webhook outbound.
- **Suy luận về Backend**: các bounded context backend dựa trên URL prefix (`/sale`, `/finance`, `/inventory`...).
- **Kiến trúc deployment đề xuất** dựa trên best practice cho stack tương đương.
- **Các quyết định kiến trúc** (ADR) quan sát được hoặc đề xuất.

### 2.2. Ngoài phạm vi (Out-of-scope)

- **Source code backend** chi tiết (không có trong repository này).
- **Database physical schema** (không có file migration, chỉ có thể suy từ TypeScript model).
- **Infrastructure-as-code** thực tế (không có Terraform/Pulumi/CloudFormation trong repo này).
- **CI/CD pipeline** thực tế (không có file `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile` trong repo này).
- **Monitoring & alerting cụ thể** (không có cấu hình Prometheus/Grafana).
- **Performance benchmark thực tế** (không có file load test, kết quả profiling).
- **Network topology nội bộ** (firewall, VPN, security groups).
- **Đặc tả kỹ thuật của BPM engine** (`prefixBpm` được tham chiếu nhưng nằm ở repository khác).

## 3. Đối tượng đọc

Tài liệu được viết cho **đội ngũ kỹ thuật**, không phải khách hàng cuối.

| Đối tượng | Điều cần biết | Phần ưu tiên đọc |
|-----------|---------------|------------------|
| **Tech Lead / Architect** | Toàn bộ kiến trúc, ADR, trade-offs | Tất cả các Part |
| **New Developer** | Onboarding, code structure, conventions | Part 02, 03, 04, 05, 06 |
| **DevOps / SRE** | Deployment, monitoring, scaling | Part 09, 11, 12, 14 |
| **Security Reviewer** | Threat model, AuthN/AuthZ, encryption | Part 10, 11 |
| **QA Engineer** | Test strategy, quality attributes | Part 14 |
| **Đối tác bên ngoài** | Cách tích hợp với CRM qua API/webhook | Part 06, 09 |
| **Project Manager** | Tổng quan, risk register | Part 00, 01, 14 |

> **Lưu ý:** Mỗi Part có **Executive Summary** ở đầu (≤ 5 dòng) để PM/Tech Lead đọc nhanh không cần đi vào chi tiết.

## 4. Kiến trúc mức cao — 3 câu mô tả

> Reborn CRM là **multi-tenant SaaS** xây trên **kiến trúc microservices** với **frontend SPA** (React/TypeScript/Vite) duy nhất gọi tới **nhiều backend service** qua **API gateway** (URL prefix routing).
>
> **Mỗi tenant** được cô lập dữ liệu qua trường `tenantId` + header `Hostname`, **xác thực** qua **SSO trung tâm** của Reborn (OAuth/OIDC), **phân quyền** theo role-based với cây quyền chi tiết.
>
> Hệ thống tích hợp với **10+ dịch vụ bên ngoài** (payment, e-invoice, SMS, email, Zalo, Facebook, shipping, BPM engine) qua REST API và webhook hai chiều, hỗ trợ **deploy multi-environment** (dev/staging/production) trên hạ tầng cloud với khả năng **scale ngang**.

## 5. Architectural Drivers (Chất lượng mục tiêu)

Các yêu cầu phi chức năng chính (chi tiết ở [URD Part 13](../urd/part-13-phi-chuc-nang.md)) định hướng kiến trúc:

| Driver | Yêu cầu | Hậu quả kiến trúc |
|--------|---------|-------------------|
| **Multi-tenancy** | 1.000+ tenant, dữ liệu cô lập | Tenant ID column + row-level filter ở mọi query |
| **Performance** | Page load ≤ 3s, POS ≤ 500ms add-to-cart | SPA + lazy loading + cache + indexed DB |
| **Availability** | ≥ 99.5% uptime, RTO ≤ 4h, RPO ≤ 1h | Stateless API + load balancer + read replicas + backup hourly |
| **Scalability** | 50 concurrent users / tenant trung bình | Horizontal scaling, stateless API, queue cho heavy job |
| **Security** | Cô lập tenant, OWASP top 10, audit | RBAC, encryption, HMAC webhook, hash password |
| **Maintainability** | Onboarding dev mới ≤ 1 tuần | Clear folder structure, naming conventions, ADR |
| **Localization** | VI/EN, định dạng locale-aware | i18next, locale config per tenant |
| **Compliance** | Luật ANM, NĐ 13/2023, TT78 (e-invoice) | Data tại VN, audit log ≥ 2 năm, integration với CA |

## 6. Tổng quan công nghệ

> ⚠️ **Lưu ý:** Tóm tắt nhanh — chi tiết đầy đủ ở [Part 03](part-03-tech-stack.md).

```
┌──────────────────────────────────────────────────┐
│  CLIENT                                          │
│  ├─ Browser SPA (Chrome/Edge/Safari/Firefox)    │
│  └─ POS Terminal (+máy in nhiệt, quét mã, RFID) │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS
┌──────────────────────────────────────────────────┐
│  FRONTEND APPLICATION                            │
│  ├─ React 17.0.2 + TypeScript 4.5               │
│  ├─ Vite 8.0 (đã migrate từ Webpack)             │
│  ├─ react-router-dom v6                          │
│  ├─ Context API (5 contexts)                    │
│  ├─ ag-grid 30 (bảng lớn)                       │
│  ├─ Swiper 11 (carousel)                        │
│  ├─ react-i18next                               │
│  ├─ react-toastify                              │
│  └─ ~120+ thư viện khác (xem package.json)      │
└────────────────────┬─────────────────────────────┘
                     │ REST + JSON
┌──────────────────────────────────────────────────┐
│  API GATEWAY (URL prefix routing)               │
│  ├─ /api      → Main API                         │
│  ├─ /adminapi → Admin API                        │
│  ├─ /bizapi   → Business APIs                    │
│  │   ├─ /sales, /finance, /inventory             │
│  │   ├─ /warehouse, /care, /billing              │
│  │   ├─ /logistics, /integration                 │
│  │   ├─ /market, /notification                   │
│  ├─ /bpmapi   → BPM Engine                       │
│  ├─ /authenticator → Auth/SSO                    │
└────────────────────┬─────────────────────────────┘
                     │
┌──────────────────────────────────────────────────┐
│  MICROSERVICES (suy luận)                        │
│  ├─ Sales Service                                │
│  ├─ Finance Service                              │
│  ├─ Inventory Service                            │
│  ├─ Warehouse Service                            │
│  ├─ Customer Care Service                        │
│  ├─ Billing Service (e-invoice)                  │
│  ├─ Logistics Service (vận chuyển)               │
│  ├─ Integration Service (3rd party)              │
│  ├─ Market Service (marketing)                   │
│  ├─ Notification Service                         │
│  ├─ Auth Service (SSO)                           │
│  ├─ BPM Service (workflow engine)                │
│  └─ Application Service                          │
└────────────────────┬─────────────────────────────┘
                     │
┌──────────────────────────────────────────────────┐
│  DATA LAYER                                      │
│  ├─ PostgreSQL (master + read replicas)          │
│  ├─ Redis (cache + queue)                        │
│  ├─ S3-compatible Object Storage (file/ảnh)      │
│  └─ Search index (suy luận: Elasticsearch?)     │
└──────────────────────────────────────────────────┘
```

## 7. Quy ước trong tài liệu

### 7.1. Trích dẫn code

Khi tham chiếu đến file/dòng cụ thể trong codebase:

```
[file: src/configs/fetchConfig.ts:42]  → Hostname header hardcode
[file: src/services/CustomerService.ts:32] → method filter
[file: vite.config.ts:93] → base URL
```

### 7.2. Box mức độ tự tin

Phần nào không phải 🟢 sẽ có box ngay đầu mục:

> ⚠️ **Mức độ tự tin: Trung bình** — phần này được suy luận từ \<nguồn\>, đội backend cần xác nhận.

### 7.3. Ký hiệu sơ đồ

| Ký hiệu | Ý nghĩa |
|---------|---------|
| Hộp chữ nhật | Component / Service |
| Hộp tròn (cylinder) | Database / Storage |
| Mũi tên đậm | Đồng bộ (sync) |
| Mũi tên nét đứt | Bất đồng bộ (async) / event |
| 🌐 | External system |
| 👤 | Actor (user) |
| ⚙️ | Background job / cron |

## 8. Lịch sử phiên bản

| Version | Ngày | Tác giả | Thay đổi |
|---------|------|---------|----------|
| 0.1 (Draft) | 2026-04-14 | Reborn (reverse-engineered) | Bản thảo đầu tiên |

## 9. Phê duyệt

| Vai trò | Họ tên | Chữ ký | Ngày |
|---------|--------|--------|------|
| Architect | | | |
| Tech Lead Frontend | | | |
| Tech Lead Backend | | | |
| DevOps Lead | | | |
| Security Lead | | | |

---

*Hết Part 00.*

---

# Part 01 — Kiến trúc tổng thể (4+1 Architectural Views)

## Executive Summary

Reborn CRM được mô tả qua **mô hình 4+1 view của Kruchten**: Logical (cấu trúc module), Process (tương tác runtime), Development (tổ chức source), Physical (deploy), và **+1 Scenario** (use case xuyên suốt). Hệ thống là **multi-tenant SaaS với frontend SPA + backend microservices** giao tiếp qua REST API gateway, cô lập tenant ở mức row-level.

---

## 1. Mô hình 4+1

```
                ┌──────────────────┐
                │   Logical View   │ (cấu trúc tĩnh — module/class)
                └──────────────────┘
                         ▲
                         │
┌──────────────────┐     │     ┌──────────────────┐
│ Development View │◄────┼────►│   Process View   │
│ (cấu trúc code)  │     │     │ (runtime/concur) │
└──────────────────┘     │     └──────────────────┘
                         │
                ┌──────────────────┐
                │   Physical View  │ (deployment/topology)
                └──────────────────┘
                         ▲
                         │
              ┌──────────────────────┐
              │   Scenario (+1)      │ (use case xuyên view)
              └──────────────────────┘
```

Mỗi view phục vụ một bộ stakeholder khác nhau:

| View | Trả lời câu hỏi | Đối tượng |
|------|-----------------|-----------|
| **Logical** | Có những module/component gì? Quan hệ giữa chúng? | Architect, Senior Dev |
| **Process** | Khi chạy thì các process tương tác thế nào? | Tech Lead, DevOps |
| **Development** | Source code tổ chức ra sao? Quy ước? | Developer (mới + cũ) |
| **Physical** | Deploy ở đâu, chạy trên gì, network thế nào? | DevOps, SRE |
| **Scenario** | Một luồng cụ thể chạy qua các view ra sao? | Mọi stakeholder |

---

## 2. Logical View — Kiến trúc logic

### 2.1. Sơ đồ tổng thể logic

Hệ thống được chia thành **các bounded context** theo Domain-Driven Design. Mỗi bounded context là một nhóm chức năng nghiệp vụ độc lập tương đối, có thể trở thành 1 microservice riêng (xem [Part 08](part-08-backend-architecture.md)).

![Sơ đồ Logical — Bounded contexts của Reborn CRM](./diagrams/01-logical-view.png)

### 2.2. Các bounded context

| Context | Module liên quan trong code | Backend prefix (suy luận) |
|---------|----------------------------|---------------------------|
| **Identity & Access** | `pages/Login`, `contexts/authContext`, `userContext` | `/authenticator` |
| **Customer (CRM Core)** | `pages/CustomerPerson`, `services/CustomerService`, `services/ContactService` | `/api`, `/bizapi/care` |
| **Sales (POS)** | `pages/CounterSales`, `pages/Sell`, `services/InvoiceService`, `services/BoughtProductService`, `services/BoughtServiceService`, `services/BoughtCardService` | `/bizapi/sales` |
| **Membership / Loyalty** | `pages/LoyaltyWallet`, `pages/MembershipClass`, `pages/CommunityHub/Checkin`, `services/CardService`, `services/LoyaltyPointService` | `/bizapi/care` |
| **Inventory & Warehouse** | `pages/ProductImport`, `pages/Sell/SaleInventory`, `services/WarehouseService`, `services/InventoryService` | `/bizapi/inventory`, `/bizapi/warehouse` |
| **Finance** | `pages/Finance`, `pages/CashBook`, `services/CashbookService`, `services/FundService`, `services/DebtService` | `/bizapi/finance` |
| **Marketing** | `pages/CrmCampaign`, `pages/MarketingAutomation`, `pages/Email`, `pages/SMSMarketting`, `pages/ZaloMarketting`, `services/CampaignService`, `services/MarketingAutomationService` | `/bizapi/market` |
| **Customer Care** | `pages/CustomerCarePage`, `pages/CustomerCare`, `pages/CareHistory`, `services/CustomerCareService` | `/bizapi/care` |
| **Ticket / Feedback** | `pages/Ticket`, `pages/FeedbackCustomer`, `services/TicketService` | `/bizapi/cs` |
| **Reporting** | `pages/CommunityHub/Reports`, `pages/JobReport`, `services/ReportService` | `/bizapi/sales` (nhiều endpoint) |
| **Workflow / BPM** | `pages/BPM`, `pages/SettingProcess`, `services/BusinessProcessService` | `/bpmapi` (riêng) |
| **Integration & Webhook** | `pages/IntegratedMonitoring`, `pages/SettingIntegrations`, `services/IntegrationService` | `/bizapi/integration` |
| **Settings & Config** | `pages/Setting*` (~30 trang), `services/Setting*Service` | nhiều prefix tùy module |
| **Notification** | `pages/AppNotifications`, `pages/NotificationList`, `services/NotificationService` | `/bizapi/notification` |
| **HR & Organization** | `pages/SettingOrg`, `pages/User`, `pages/ShiftManagement`, `services/EmployeeService`, `services/RoleService`, `services/ShiftService` | `/api` (đoán) hoặc `/bizapi/hr` |
| **Application Marketplace** | `pages/InstallApplication`, `pages/Extension`, `services/ApplicationService` | `/application` |

### 2.3. Layer phân tầng trong frontend

Mỗi tính năng đi qua các layer theo thứ tự:

```
┌─────────────────────────────────────────────────┐
│  Pages (src/pages/)                             │  ← UI + business logic
│  167 page modules                               │
└────────────────────────┬────────────────────────┘
                         │ uses
┌─────────────────────────────────────────────────┐
│  Components (src/components/)                   │  ← reusable UI
│  78 component folders                           │
└────────────────────────┬────────────────────────┘
                         │ uses
┌─────────────────────────────────────────────────┐
│  Hooks (src/hooks/)                             │  ← logic tái dụng
│  ~30 custom hooks                               │
└────────────────────────┬────────────────────────┘
                         │ uses
┌─────────────────────────────────────────────────┐
│  Contexts (src/contexts/)                       │  ← global state
│  5 contexts: auth, user, ui, call, common       │
└────────────────────────┬────────────────────────┘
                         │ uses
┌─────────────────────────────────────────────────┐
│  Services (src/services/)                       │  ← API call layer
│  240 service files                              │
└────────────────────────┬────────────────────────┘
                         │ uses
┌─────────────────────────────────────────────────┐
│  apiHelper (src/services/apiHelper.ts)          │  ← DRY wrapper for fetch
└────────────────────────┬────────────────────────┘
                         │ wraps
┌─────────────────────────────────────────────────┐
│  fetch + fetch-intercept                        │  ← HTTP layer
│  configs/fetchConfig.ts                         │
└─────────────────────────────────────────────────┘
```

> **Quy ước:** Page **không bao giờ** gọi `fetch()` trực tiếp — luôn qua Service. Service **không bao giờ** ghép URL — luôn lấy từ `urlsApi`. Layer này giúp dễ dàng đổi backend hoặc thêm interceptor mà không phải sửa từng page.

---

## 3. Process View — View runtime/process

### 3.1. Sơ đồ process

![Process View — Tương tác runtime giữa SPA, browser, API gateway, services](./diagrams/02-process-view.png)

### 3.2. Các process chính

#### Frontend (browser-side)

- **Main thread**: React render + event handling
- **Service Worker**: `firebase-messaging-sw.js` — push notification (Firebase Cloud Messaging)
- **Web Worker** (nếu có): xử lý task nặng như parse file Excel, render PDF
- **HTTP requests**: parallel qua fetch, có interceptor

#### Backend (server-side)

> ⚠️ **Mức độ tự tin: Thấp** — phần này được suy luận từ pattern phổ biến.

- **API Server processes**: stateless, scaled horizontally
- **Background workers**: xử lý job dài (gửi mass message, generate report, sync data)
- **Cron scheduler**: chạy job định kỳ (sinh nhật khách, sắp hết hạn gói, đối soát thanh toán)
- **Webhook receiver**: nhận callback từ payment gateway, shipping, e-invoice
- **Webhook dispatcher**: gửi event ra ngoài qua HTTP POST

### 3.3. Communication patterns

| Pattern | Dùng cho | Ví dụ |
|---------|----------|-------|
| **Sync HTTP REST** | Mọi tương tác client ↔ server | Gọi API danh sách khách |
| **Long polling / Server-Sent Events** | Notification real-time | Chuông thông báo trên header |
| **WebSocket** | Call center, chat | Module CallCenter, Chat |
| **Async webhook** | Tích hợp 3rd party | Payment callback, shipping update |
| **Message queue** (suy luận) | Heavy job, retry | Gửi mass SMS, sync e-invoice |

---

## 4. Development View — Tổ chức source code

### 4.1. Cây thư mục chính

```
cloud-crm/
├── docs/                       # Tài liệu
│   ├── userguides/             # HDSD
│   ├── urd/                    # URD
│   └── sa/                     # SAD (this file)
├── public/                     # Static assets
├── src/                        # Frontend source
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point (Vite)
│   ├── index.html              # HTML template
│   ├── assets/                 # Images, fonts, sounds
│   ├── components/             # Reusable UI components (78)
│   ├── configs/                # App configuration
│   │   ├── routes.tsx          # Sidebar + routes (1179 dòng)
│   │   ├── urls.ts             # API endpoint catalog (3757 dòng)
│   │   ├── fetchConfig.ts      # HTTP interceptor
│   │   ├── authConfig.js       # SSO config
│   │   └── firebaseConfig.js   # FCM config
│   ├── contexts/               # React Context (5)
│   │   ├── authContext.ts
│   │   ├── userContext.ts
│   │   ├── uiContext.ts
│   │   ├── callContext.ts
│   │   └── index.ts
│   ├── exports/                # Excel/PDF export utils
│   ├── hooks/                  # Custom hooks (30+)
│   ├── i18n.ts                 # i18next setup
│   ├── locales/                # Translation files
│   ├── mocks/                  # Mock data (cho dev/demo)
│   ├── model/                  # TypeScript interfaces
│   ├── pages/                  # Page modules (167)
│   ├── services/               # API service files (240)
│   ├── styles/                 # Global SCSS
│   ├── template/               # Email/print templates
│   ├── types/                  # Global type defs
│   ├── utils/                  # Helper functions
│   └── webrtc/                 # SIP/WebRTC (call center)
├── vite.config.ts              # Vite build config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies + scripts
└── yarn.lock
```

### 4.2. Quy ước đặt tên

| Loại | Convention | Ví dụ |
|------|------------|-------|
| **Page module** | PascalCase folder | `CustomerPerson/`, `CounterSales/` |
| **Component** | PascalCase folder + `index.tsx` | `Sidebar/sidebar.tsx` |
| **Service** | `<Domain>Service.ts` | `CustomerService.ts`, `InvoiceService.ts` |
| **Hook** | `use<Name>.ts` | `useCustomerList.ts`, `useDebounce.ts` |
| **Context** | `<name>Context.ts` | `userContext.ts`, `authContext.ts` |
| **Model** | `I<Name>RequestModel.ts` / `I<Name>ResponseModel.ts` | `ICustomerRequest`, `IInvoiceResponse` |
| **SCSS** | `.scss` cùng tên file | `Sidebar/sidebar.scss` |
| **Style class** | kebab-case | `.page-shift-tabs`, `.os-banner-icon` |

### 4.3. Phân tích phụ thuộc giữa layer

> Một quy luật vàng: **luồng phụ thuộc đi 1 chiều từ trên xuống dưới** (Page → Component → Hook → Context → Service → apiHelper → fetch). Vi phạm sẽ gây cyclic dependency và khó test.

### 4.4. Sơ đồ phát triển

![Development View — Cây thư mục + dependency direction](./diagrams/03-development-view.png)

---

## 5. Physical View — Triển khai vật lý

### 5.1. Sơ đồ deployment tổng quan

> ⚠️ **Mức độ tự tin: Thấp** — sơ đồ dưới là **đề xuất** dựa trên best practice, không phải topology thực tế. Đội DevOps cần xác nhận / bổ sung.

![Physical View — Topology deploy 5-tier](./diagrams/04-physical-view.png)

### 5.2. Các tier deploy

| Tier | Thành phần | Số instance đề xuất |
|------|-----------|---------------------|
| **Edge / CDN** | CDN cho static, WAF | 1 (managed service) |
| **Load Balancer** | Nginx / HAProxy / ALB | 2 (HA pair) |
| **API Server** | Container chạy backend stateless | ≥ 3 (auto-scale) |
| **Background Worker** | Container xử lý job dài | ≥ 2 |
| **Database (Master)** | PostgreSQL primary | 1 |
| **Database (Read Replicas)** | PostgreSQL replica | 2-3 (tùy load) |
| **Cache** | Redis cluster | 3 nodes |
| **Object Storage** | S3-compatible | managed |
| **Logging** | ELK / Loki | managed hoặc 3 nodes |
| **Monitoring** | Prometheus + Grafana | managed |

### 5.3. Network topology

> ⚠️ **Phần này hoàn toàn là đề xuất.**

```
Internet
   │
   ▼
[Cloud Provider — Public Subnet]
   │
   ├─ CDN (CloudFlare/CloudFront)
   ├─ WAF
   └─ Load Balancer
   │
   ▼
[Private Subnet — App tier]
   │
   ├─ API Server pods (k8s)
   ├─ Worker pods
   └─ Bastion (SSH access)
   │
   ▼
[Private Subnet — Data tier]
   │
   ├─ PostgreSQL master
   ├─ PostgreSQL replicas
   ├─ Redis cluster
   └─ Backup volume
```

---

## 6. Scenarios (+1) — Use case xuyên view

Để minh họa cách 4 view tương tác, mô tả 3 scenario quan trọng:

### 6.1. Scenario A — Đăng nhập qua SSO

Một nhân viên mở browser, truy cập `https://hub.reborn.vn/crm/`, đăng nhập, được chuyển vào Dashboard.

![Sequence — Đăng nhập SSO end-to-end](./diagrams/05-scenario-sso-login.png)

**Các view tham gia:**

- **Logical**: Identity & Access bounded context, Page `Login`, Context `authContext`
- **Process**: Browser ↔ CRM SPA ↔ SSO server ↔ API server
- **Physical**: Browser → CDN → LB → API → SSO → DB
- **Development**: `pages/Login/`, `contexts/authContext.ts`, `services/EmployeeService.ts`, `configs/authConfig.js`

### 6.2. Scenario B — Bán hàng tại quầy (POS)

Lễ tân tạo đơn cho khách: chọn sản phẩm → chọn khách → áp khuyến mãi → thanh toán → in hóa đơn.

![Sequence — Tạo đơn POS end-to-end](./diagrams/06-scenario-pos-sale.png)

**Các view tham gia:**

- **Logical**: Sales context + Customer context + Marketing (KM) context + Inventory context (trừ tồn) + Finance context (sinh phiếu thu)
- **Process**: Browser fetches sản phẩm → user thao tác → submit → API gateway routes → multiple services + DB transaction → response → in hóa đơn
- **Physical**: Browser → LB → API → 4 services song song → DB → response
- **Development**: `pages/CounterSales/index.tsx`, `services/InvoiceService.ts`, `services/BoughtProductService.ts`, `WarehouseService.ts`, `CashbookService.ts`

### 6.3. Scenario C — Phát hành hóa đơn VAT

Kế toán xuất hóa đơn điện tử cho khách doanh nghiệp.

![Sequence — Phát hành VAT qua nhà cung cấp E-invoice](./diagrams/07-scenario-vat.png)

**Các view tham gia:**

- **Logical**: Billing context + Integration context
- **Process**: SPA → Billing API → Integration service → External CA + E-invoice provider → Tax authority → callback → store
- **Physical**: Cần outbound HTTPS sang nhà cung cấp, cần lưu chứng thư số ở vault
- **Development**: `pages/Sell/InvoiceVat/`, `services/InvoiceVatService.ts`

---

## 7. Bảng truy vết view ↔ Part SAD

| View | Chi tiết ở Part |
|------|-----------------|
| **Logical** | Part 02 (Frontend), Part 05 (Components), Part 08 (Backend) |
| **Process** | Part 06 (Service), Part 09 (Integration), Part 11 (Cross-cutting) |
| **Development** | Part 02 (Frontend), Part 03 (Stack), Part 04 (Routing) |
| **Physical** | Part 12 (Deployment) |
| **Scenario** | Phụ thuộc nội dung — tham chiếu theo từng Part |

---

*Hết Part 01.*

---

# Part 02 — Frontend Architecture

## Executive Summary

Frontend là **Single Page Application** xây bằng **React 17 + TypeScript 4.5**, build bằng **Vite 8.0** (vừa migrate từ Webpack). Cấu trúc theo **layered pattern** (Pages → Components → Hooks → Contexts → Services → API Helper → fetch). Có **167 page module**, **78 component**, **240 service file**, sử dụng **Context API** (5 contexts) cho global state thay vì Redux. **Lazy load** mọi page qua `React.lazy()`. Routing qua **react-router-dom v6** với cấu hình tập trung trong `configs/routes.tsx` (1179 dòng).

---

## 1. Tech stack chính

| Lớp | Công nghệ | Phiên bản | Vai trò |
|-----|-----------|-----------|---------|
| **Language** | TypeScript | 4.5.4 | Static typing |
| **Framework UI** | React | 17.0.2 | Rendering |
| **Routing** | react-router-dom | 6.x | Client-side routing |
| **Build tool** | Vite | 8.0.7 | Dev server + bundler |
| **Bundler** | Rollup (qua Vite) | — | Production bundle |
| **CSS** | SCSS + global stylesheets | — | Styling |
| **State** | Context API + custom hooks | — | Không dùng Redux |
| **HTTP** | fetch + fetch-intercept | — | API calls |
| **Form** | Custom form pattern + reborn-validation | 1.0.5 | Validation |
| **Date** | moment + date-fns | 2.29 + 4.x | Xử lý ngày giờ |
| **i18n** | react-i18next | 14.x | Đa ngôn ngữ |
| **Notification** | react-toastify | 8.x | Toast |

> Toàn bộ ~120 dependencies xem chi tiết ở [Part 03](part-03-tech-stack.md).

---

## 2. Cấu trúc thư mục `src/`

```
src/
├── App.tsx                  # Root component, setup providers + router
├── main.tsx                 # Vite entry point
├── index.html               # HTML template (Vite injects script)
├── i18n.ts                  # i18next config
├── firebase-config.ts       # FCM client setup
├── firebase-messaging-sw.js # Service worker for FCM
├── serviceWorker.js         # PWA service worker (legacy?)
├── type.d.ts                # Global type declarations
│
├── assets/                  # Static images, fonts, sounds
├── components/              # 78 reusable components
├── configs/                 # 9 config files
├── contexts/                # 5 React contexts
├── exports/                 # Export to Excel/PDF utilities
├── hooks/                   # 30+ custom hooks
├── locales/                 # i18n JSON files
├── mocks/                   # Mock data (community-hub demos)
├── model/                   # 200+ TypeScript interface files
├── pages/                   # 167 page modules
├── services/                # 240 service files
├── styles/                  # Global SCSS + variables
├── template/                # Email/print templates
├── types/                   # Domain type aliases
├── utils/                   # Helper functions
└── webrtc/                  # SIP.js + WebRTC for call center
```

### 2.1. Số lượng từng loại

| Folder | Số lượng | Ghi chú |
|--------|---------|---------|
| `pages/` | **167** modules | Mỗi mục là 1 nghiệp vụ chính |
| `components/` | **78** components | Reusable UI |
| `services/` | **240** services | API call layer |
| `hooks/` | ~30 custom hooks | Logic tái dụng |
| `contexts/` | 5 | Global state |
| `model/` | 200+ interface files | Request/Response shapes |
| `configs/` | 9 | App config |

---

## 3. Layer pattern chi tiết

### 3.1. Page layer (`src/pages/`)

**Trách nhiệm:** Compose UI hoàn chỉnh cho 1 trang nghiệp vụ. Mỗi page là 1 folder gồm `index.tsx` + style + sub-components.

**Quy ước:**
- Mỗi page có `document.title = "..."` ở đầu để set tab browser title
- Page **không** gọi `fetch()` trực tiếp
- Page sử dụng `useContext()` để lấy global state
- Page có thể chia thành nhiều sub-component trong cùng folder (`partials/`)

**Ví dụ cấu trúc 1 page lớn — `CustomerPerson/`:**

```
pages/CustomerPerson/
├── CustomerPersonList.tsx       # Trang chính (3824 dòng)
├── CustomerPersonList.scss
├── partials/                    # Sub-components
│   ├── DetailPerson/
│   ├── AddCustomerPersonModal.tsx
│   ├── AddCustomerCompanyModal.tsx
│   ├── AddBTwoBModal/
│   ├── FilterAdvanceModal/
│   ├── ModalImportCustomer/
│   ├── SplitDataCustomerModal/
│   ├── UpdateCommon.tsx
│   └── ViewOpportunityBTwoB/
├── CustomerSourceAnalysis/
├── ModalAddMA/
└── ModalExportCustomer/
```

**Ví dụ page nhỏ — `CommunityHub/Checkin/`:**

```
pages/CommunityHub/Checkin/
├── index.tsx        # 147 dòng
└── index.scss
```

### 3.2. Component layer (`src/components/`)

**Trách nhiệm:** Cung cấp các UI element tái sử dụng được giữa nhiều page.

**Loại component phổ biến:**

| Nhóm | Ví dụ |
|------|-------|
| **Form controls** | `input/`, `selectCustom/`, `datePicker/`, `numericInput/`, `radioBox/` |
| **Layout** | `sidebar/`, `header/`, `titleAction/`, `breadcrumb/` |
| **Data display** | `table/`, `pagination/`, `card/`, `agGridTable/` |
| **Feedback** | `modal/`, `confirm/`, `loading/`, `tour/` |
| **Specialized** | `icon/`, `avatar/`, `badge/`, `chip/` |

**Quy ước:**
- Component nhận props rõ ràng có TypeScript interface
- Component **không gọi API** trực tiếp (trừ component đặc biệt như `TabMenuList` dùng common API)
- Component **không** đụng vào global context (trừ component layout như Sidebar)

### 3.3. Hooks layer (`src/hooks/`)

**Trách nhiệm:** Đóng gói logic tái sử dụng (data fetching, state, side effect).

**Ví dụ các hook quan sát được:**

| Hook | Mục đích |
|------|---------|
| `useCustomerList` | Load + paginate danh sách khách |
| `useDebounce` | Debounce input |
| `useDashBoard` | Load số liệu Dashboard |
| `useGetDetailInvoice` | Load chi tiết đơn |
| `useGetDetailProduct` | Load chi tiết sản phẩm |
| `useReconciliationList` | Load danh sách đối soát |
| `useOnboarding` | Quản lý tour overlay onboarding |
| `useLA` | Liquidity Analysis (?) |
| `useOmniCXM` | Omni-channel customer experience |
| `useCustomerEnrich` | Bổ sung thông tin khách từ data ngoài |

> **Pattern chuẩn:** Hook trả về `{ data, loading, error, refetch }` để page consume. Tránh để page tự call API + manage loading state.

### 3.4. Context layer (`src/contexts/`)

**Trách nhiệm:** Lưu state toàn cục cho toàn bộ app.

| Context | Loại data | Lý do dùng |
|---------|-----------|------------|
| **userContext** | User hiện tại + dataBranch + permissions + organizationInfo | Mọi page cần info user, tránh prop drilling |
| **authContext** | Token + login state + auth helpers | Toàn bộ app phụ thuộc auth |
| **uiContext** | Sidebar collapsed, theme, modal stack | Cấu hình UI toàn cục |
| **callContext** | Call center session, current call | Module CallCenter chỉ vài page nhưng cần state cross-component |
| **index.ts** | Aggregate / re-export | Convenience |

**Pattern setup ở `App.tsx`:**

```tsx
<AuthContext.Provider value={authState}>
  <UserContext.Provider value={userState}>
    <UIContext.Provider value={uiState}>
      <CallContext.Provider value={callState}>
        <Routes>
          {routes.map(...)}
        </Routes>
      </CallContext.Provider>
    </UIContext.Provider>
  </UserContext.Provider>
</AuthContext.Provider>
```

> **Trade-off:** Context API không tối ưu cho data thay đổi nhiều (mỗi update re-render mọi consumer). Với app này, data trong context tương đối tĩnh (user info, role, ui flags) nên chấp nhận được. Nếu data có throughput cao (vd realtime call state), nên cân nhắc Zustand/Jotai. Xem [ADR-04](part-13-adr.md#adr-04--không-dùng-redux-mà-dùng-context-api).

### 3.5. Service layer (`src/services/`)

**Trách nhiệm:** Đóng gói mọi API call, không có business logic.

**Quy ước cố định:**

```ts
// src/services/CustomerService.ts
import { apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";

export default {
  filter: (params?: ICustomerFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.customer.filter, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.customer.detail}?id=${id}`, { method: "GET" })
      .then((res) => res.json());
  },
  update: (body: ICustomerRequest) => {
    return apiPost(urlsApi.customer.update, body);
  },
  // ...
};
```

**Nguyên tắc:**
1. **Endpoint URL** luôn lấy từ `urlsApi` (không hardcode)
2. **Request body type** luôn là interface trong `model/`
3. **Response** trả về raw JSON (không transform — page tự xử lý)
4. **Cancellable** qua `AbortSignal` parameter
5. **Service không** ném exception — page tự kiểm tra `response.code === 0`

### 3.6. apiHelper layer (`src/services/apiHelper.ts`)

**Trách nhiệm:** DRY wrapper cho fetch — loại bỏ pattern lặp lại `fetch + JSON.stringify + .then(res => res.json())`.

```ts
// Pseudocode
export const apiGet = (url: string, params?: Record<string, any>, signal?: AbortSignal) => {
  const queryString = convertParamsToString(params);
  return fetch(`${url}${queryString}`, { method: "GET", signal })
    .then((res) => res.json());
};

export const apiPost = (url: string, body: any) => {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((res) => res.json());
};

// Tương tự apiPut, apiDelete...
```

### 3.7. Fetch interceptor (`src/configs/fetchConfig.ts`)

**Trách nhiệm:** Tự động thêm header (Authorization, Selectedrole, Hostname, Content-Type) và rewrite URL theo prefix.

**Logic chính:**

1. **Trước khi gửi request:**
   - Đọc `token` từ cookie → set `Authorization: Bearer <token>`
   - Đọc `SelectedRole` từ localStorage → set header `Selectedrole`
   - Set `Hostname` header (hiện đang **hardcode** `kcn.reborn.vn` cho dev — flag risk!)
   - Set `Content-Type: application/json` (nếu không phải FormData)
   - Rewrite URL prefix:
     - `/bizapi` → `process.env.APP_BIZ_URL + ...`
     - `/api` / `/adminapi` → `process.env.APP_API_URL + ...`
     - Khác → `process.env.APP_AUTHENTICATOR_URL + ...`

2. **Sau khi nhận response:**
   - Nếu `status === 401`:
     - Xóa cookie `user`, `token`
     - Xóa localStorage `permissions`, `user.root`
     - (User sẽ được redirect về login ở lần render tiếp theo)

> ⚠️ **Risk note:** Dòng `config.headers["Hostname"] = "kcn.reborn.vn"` trong [`fetchConfig.ts:42`](../../src/configs/fetchConfig.ts#L42) đang hardcode tenant cho dev. Cần wire lại để lấy từ `location.hostname` trong production. Đây là **bug tiềm ẩn** nếu deploy nhầm.

---

## 4. Build & Bundling

### 4.1. Cấu hình Vite

> Vừa migrate từ Webpack → Vite. Chi tiết quá trình migration ở [ADR-02](part-13-adr.md#adr-02--migrate-từ-webpack-sang-vite).

**File cấu hình:** [`vite.config.ts`](../../vite.config.ts)

**Các điểm quan trọng:**

| Cấu hình | Giá trị | Ý nghĩa |
|----------|---------|---------|
| `base` | `/` | Asset URLs absolute từ root |
| `outDir` | `bundle` | Output folder |
| `entryFileNames` | `crm/js/[name].[hash].js` | Bundle output structure |
| `chunkFileNames` | `crm/js/[name].[hash].js` | Code-split chunks |
| `assetFileNames` | `crm/css/...` / `crm/assets/...` | CSS + assets riêng folder |
| `manualChunks` | `vendor: [react, react-dom]`, `router: [react-router-dom]`, `ui: [emotion, react-toastify, react-select]` | Vendor splitting |
| `minify` | `terser` (production) | Code minification |
| `terserOptions.compress.drop_console` | `true` | Bỏ console.log production |
| `sourcemap` | `true` (dev), `false` (prod) | Debug |

**Dev server:** port 4000, có HMR.

### 4.2. Resolve alias (path mapping)

Vite + tsconfig đều cấu hình alias để import gọn:

```ts
resolve: {
  alias: {
    "@": "src",
    "src": "src",
    "pages": "src/pages",
    "components": "src/components",
    "services": "src/services",
    "configs": "src/configs",
    "contexts": "src/contexts",
    "hooks": "src/hooks",
    "model": "src/model",
    "utils": "src/utils",
    "assets": "src/assets",
    "styles": "src/styles",
    "template": "src/template",
    // ...
  }
}
```

> Cho phép viết `import CustomerService from "services/CustomerService"` thay vì `"../../services/CustomerService"`. Mọi file đều dùng pattern này.

### 4.3. Biến môi trường

- **Vite env**: tiền tố `VITE_*` được expose qua `import.meta.env.VITE_*`
- **Process env**: `process.env.APP_*` được map qua `define` trong vite.config.ts
- **File env**: `.env`, `.env.development`, `.env.production`, `.env.staging`

```ts
define: createProcessEnvDefinitions(env)  // expose APP_API_URL, APP_BIZ_URL, ...
```

> Chi tiết các env var ở [Part 12 — Deployment](part-12-deployment.md).

### 4.4. Output structure

```
bundle/
├── index.html              # HTML chính
└── crm/
    ├── js/
    │   ├── index.<hash>.js     # Entry bundle
    │   ├── vendor.<hash>.js    # React vendor chunk
    │   ├── router.<hash>.js
    │   ├── ui.<hash>.js
    │   └── <PageName>.<hash>.js  # Lazy-loaded page chunks
    ├── css/
    │   └── index.<hash>.css
    └── assets/
        ├── images...
        ├── fonts...
        └── sounds/...
```

> Nginx config phải có fallback `try_files $uri $uri/ /index.html` để SPA routing hoạt động khi user refresh trang sâu.

---

## 5. Module dependency graph

![Frontend Module Dependency — Pages → Components → Hooks → Contexts → Services](./diagrams/08-frontend-module-dependency.png)

---

## 6. Anti-patterns cần tránh

Quan sát quá codebase, đây là một số pattern **không tốt** cần xử lý dần:

| Anti-pattern | Vị trí ví dụ | Cải thiện |
|--------------|--------------|-----------|
| **Page > 3000 dòng** | `CustomerPersonList.tsx` (3824 dòng) | Tách thành nhiều container/sub-component |
| **Hardcode hostname** | `fetchConfig.ts:42` | Đọc từ env hoặc location.hostname |
| **Service vừa fetch raw vừa qua apiHelper** | `CustomerService.detail` | Dùng nhất quán apiHelper |
| **Comment-out import** | `routes.tsx:933 // CreateOrderSales` | Xóa hẳn nếu không dùng |
| **Mock data trộn vào production** | `mocks/community-hub/*` | Tách mock vào storybook hoặc dev-only |
| **Locale trộn trong bundle** | `locales/*.json` | Có thể lazy load khi đổi ngôn ngữ |
| **CSS conflict tiềm ẩn** | Global SCSS với class name dài giống nhau | Migrate dần sang CSS modules / styled-components |

> Đây là **technical debt list ngắn** — chi tiết ở [Part 14 — Risks](part-14-quality-risks.md).

---

## 7. Performance considerations

### 7.1. Lazy loading pages

Mọi page đều dùng `React.lazy()`:

```ts
const CustomerPersonList = React.lazy(() => import("pages/CustomerPerson/CustomerPersonList"));
```

→ Mỗi page tạo 1 chunk JS riêng, chỉ tải khi user vào URL đó.

### 7.2. Vendor splitting

Vite config có `manualChunks` tách `vendor`, `router`, `ui` ra chunk riêng → lần đầu tải chậm nhưng các lần sau cache hit cao.

### 7.3. Image optimization

- Static assets dùng tên có hash → cache vĩnh viễn
- Ảnh khách hàng upload lưu trên S3 → cấu hình CloudFront/CDN
- Webp/AVIF chưa có (could improve)

### 7.4. ag-grid cho danh sách lớn

Các page có bảng > 100 dòng dùng **ag-grid** thay vì HTML table — virtual scrolling, không re-render mọi cell. Xem [ADR-08](part-13-adr.md#adr-08--ag-grid-cho-bảng-lớn).

### 7.5. Debounce search

Mọi ô tìm kiếm dùng `useDebounce` 300ms để giảm số call API.

---

## 8. Test strategy frontend

> ⚠️ **Mức độ tự tin: Trung bình** — không thấy file test trong repo này. Phần dưới là **đề xuất** dựa trên best practice.

| Loại test | Tool đề xuất | Phạm vi |
|-----------|--------------|---------|
| **Unit** | Vitest | utils, hooks, services |
| **Component** | React Testing Library | Components đơn lẻ |
| **Integration** | RTL + MSW (mock API) | Pages với data fetching |
| **E2E** | Playwright (đã có cho HDSD!) | Critical user flows |
| **Visual regression** | Percy / Chromatic | Pixel-level |

> Hiện tại đã có **Playwright setup trong `docs/userguides/tooling/`** dùng cho việc capture screenshot HDSD. Có thể tái sử dụng infrastructure này cho E2E test thật.

---

*Hết Part 02.*

---

# Part 03 — Tech Stack & Dependencies

## Executive Summary

Reborn CRM frontend dùng **React 17 + TypeScript 4.5 + Vite 8.0**. Quản lý dependency qua **yarn**. Có **~120 production dependencies** và **15+ devDependencies**. Stack chia thành 7 nhóm: Core (React/TS/Vite), Routing & State, UI library, Form & Input, Data viz & Tables, Communication (call, chat, email, SMS), và Integration (Firebase, MS, Facebook, Highcharts...).

---

## 1. Core stack

### 1.1. Language & Framework

| Package | Version | Vai trò |
|---------|---------|---------|
| `react` | 17.0.2 | Framework UI chính |
| `react-dom` | 17.0.2 | Render React vào DOM |
| `typescript` | 4.5.4 | Static typing |
| `@types/react` | 17.0.37 | Type definitions |
| `@types/react-dom` | 17.0.11 | Type definitions |

> ⚠️ **React 17 vs 18**: Đang dùng React 17 — không có concurrent features (Suspense for data, automatic batching nâng cao, transitions). Nâng cấp lên 18 là technical debt cần cân nhắc. Xem [Part 14 — Risks](part-14-quality-risks.md).

### 1.2. Build tool

| Package | Version | Vai trò |
|---------|---------|---------|
| `vite` | 8.0.7 | Dev server + production bundler |
| `@vitejs/plugin-react` | 6.0.1 | React fast refresh + JSX |
| `vite-plugin-svgr` | 5.2.0 | Import SVG as React component |

> Vừa migrate từ Webpack 5 sang Vite — xem [ADR-02](part-13-adr.md#adr-02--migrate-từ-webpack-sang-vite) cho lý do và hậu quả.

---

## 2. Routing & State Management

| Package | Version | Vai trò |
|---------|---------|---------|
| `react-router-dom` | 6.2.1 | Client-side routing |

**Không dùng:** Redux, MobX, Zustand, Jotai, Recoil. State management qua React Context API và custom hooks. Xem [ADR-04](part-13-adr.md#adr-04--không-dùng-redux-mà-dùng-context-api).

---

## 3. UI Library & Styling

### 3.1. Styling

| Package | Version | Vai trò |
|---------|---------|---------|
| `sass` | 1.45 | SCSS preprocessor |
| `@emotion/css` | 11.10 | CSS-in-JS (cho dynamic styles) |
| `material-icons` | 1.13 | Icon font |

### 3.2. UI Components

| Package | Version | Vai trò |
|---------|---------|---------|
| `react-overlays` | 5.1 | Modal/popover primitives |
| `react-popper-tooltip` | 4.3 | Tooltip positioning |
| `@tippyjs/react` | 4.2 | Tooltip ready-to-use |
| `react-toastify` | 8.1 | Toast notification |
| `react-circular-progressbar` | 2.1 | Progress circle |
| `rc-slider` | 10.5 | Slider control |

### 3.3. Form & Input

| Package | Version | Vai trò |
|---------|---------|---------|
| `react-select` | 5.2 | Select dropdown nâng cao |
| `react-select-async-paginate` | 0.7 | Select với pagination + lazy load |
| `react-datepicker` | 8.10 | Date picker |
| `react-text-mask` | 5.4 | Input masking (SĐT, CMND...) |
| `text-mask-addons` | 3.8 | Mask helpers |
| `react-number-format` | 4.9 | Number input formatting |
| `react-color` | 2.19 | Color picker (cho cấu hình badge nhóm) |
| `react-colorful` | 5.6 | Color picker thay thế |
| `react-cookie` | 4.1 | Đọc/ghi cookie |
| `universal-cookie` | 4.0 | Cookie helper SSR-friendly |

### 3.4. Layout & Drag-drop

| Package | Version | Vai trò |
|---------|---------|---------|
| `react-grid-layout` | 1.4 | Drag-drop dashboard |
| `react-beautiful-dnd` | 13.1 | Drag-drop list (kanban) |
| `react-custom-scrollbars` | 4.2 | Custom scrollbar |
| `react-resizable` | (transitive) | Resizable panels |

---

## 4. Data Visualization & Tables

### 4.1. Tables

| Package | Version | Vai trò |
|---------|---------|---------|
| `ag-grid-community` | 30.2.1 | Bảng dữ liệu lớn (virtual scroll) |
| `ag-grid-react` | 30.2.1 | React wrapper cho ag-grid |

> Dùng cho mọi page có bảng > 100 dòng (Customer list, Invoice list, Inventory). Xem [ADR-08](part-13-adr.md#adr-08--ag-grid-cho-bảng-lớn).

### 4.2. Charts

| Package | Version | Vai trò |
|---------|---------|---------|
| `highcharts` | 9.3 | Chart library chính (line/bar/pie/heatmap) |
| `highcharts-react-official` | 3.1 | React wrapper |
| `react-google-charts` | 4.0 | Backup chart library |
| `react-funnel-pipeline` | 0.2 | Funnel chart cho sales pipeline |
| `gantt-task-react` | 0.3 | Gantt chart cho project mgmt |

### 4.3. Carousel & Slider

| Package | Version | Vai trò |
|---------|---------|---------|
| `swiper` | 11.2.10 | Carousel chính |
| `react-big-calendar` | 1.6 | Lịch tháng/tuần (booking, event) |

---

## 5. Specialized Modules

### 5.1. Workflow / BPM

| Package | Version | Vai trò |
|---------|---------|---------|
| `bpmn-js` | 17.8 | BPMN diagram editor |
| `bpmn-js-properties-panel` | 5.17 | Properties editor cho BPMN |
| `@bpmn-io/form-js` | 1.13 | Form builder |
| `@bpmn-io/form-js-editor` | 1.13 | Form editor visual |
| `@bpmn-io/properties-panel` | 3.25 | Form properties panel |
| `camunda-bpmn-moddle` | 7.0 | Camunda BPMN extensions |
| `react-bpmn` | 0.2 | React wrapper |
| `reactflow` | 11.10 | Flow diagram (alternative cho BPMN) |
| `formula-functionizer` | 1.0 | Eval formula trong form |

> Module **BPM** (`pages/BPM/`) là một sub-app khá lớn dùng Camunda BPMN engine. Backend tương ứng ở `/bpmapi`.

### 5.2. Rich Text Editor (Slate)

| Package | Version | Vai trò |
|---------|---------|---------|
| `slate` | 0.91 | Rich text core |
| `slate-react` | 0.91 | React bindings |
| `slate-history` | 0.86 | Undo/redo |
| `slate-html-serializer` | 0.8 | Serialize ↔ HTML |
| `slate-hyperscript` | 0.77 | DSL helpers |

> Dùng cho email marketing, mô tả sản phẩm, ghi chú dài.

### 5.3. Call Center & Communication

| Package | Version | Vai trò |
|---------|---------|---------|
| `jssip` | 3.10 | SIP signaling cho VoIP |
| `sip.js` | 0.8 | SIP alternative |

> Module `pages/CallCenter/` + `src/webrtc/` dùng để tích hợp tổng đài ảo (Viettel / VoIP). Xem [Part 09 — Integration](part-09-integration.md).

### 5.4. File handling

| Package | Version | Vai trò |
|---------|---------|---------|
| `xlsx` | 0.18 | Đọc/ghi Excel (cho import/export) |
| `exceljs` | 4.3 | Excel nâng cao (style, formula) |
| `file-saver` | 2.0 | Trigger download file |
| `react-doc-viewer` | 0.1.5 | Xem PDF/Word/Excel inline |
| `react-to-print` | 2.14 | In hóa đơn |
| `qrcode.react` | 3.1 | Generate QR |
| `exif-js` | 2.3 | Đọc metadata ảnh |
| `image-extensions` | 1.1 | List image MIME types |
| `is-url` | 1.2 | URL validation |
| `escape-html` | 1.0 | XSS escape |

### 5.5. Date & Time

| Package | Version | Vai trò |
|---------|---------|---------|
| `moment` | 2.29 | Date library cũ |
| `date-fns` | 4.1 | Date library mới (đang migrate?) |

> Đang có **2 date library cùng tồn tại** — đây là technical debt nhỏ. Nên thống nhất về `date-fns` (lighter, modular, immutable). Xem [Part 14 — Risks](part-14-quality-risks.md).

---

## 6. Authentication & Security

| Package | Version | Vai trò |
|---------|---------|---------|
| `@azure/msal-browser` | 3.7 | Microsoft auth (Outlook integration) |
| `@azure/msal-react` | 2.0 | React wrapper |
| `@fingerprintjs/fingerprintjs` | 5.0 | Browser fingerprint (anti-fraud) |
| `fingerprintjs` | 0.5 | Legacy fingerprint |
| `react-facebook-login` | 4.1 | Facebook OAuth |

> Lưu ý: **không thấy library OAuth/OIDC chuyên dụng** — đăng nhập SSO của Reborn dùng cookie + redirect manual qua `pages/Login/index.tsx`.

---

## 7. Integration Libraries

### 7.1. Firebase (Push Notification)

| Package | Version | Vai trò |
|---------|---------|---------|
| `firebase` | 9.16 | Firebase Cloud Messaging cho push notification |

**File config:** `src/firebase-config.ts`, `src/firebase-messaging-sw.js`

### 7.2. Reborn internal libraries

| Package | Version | Vai trò |
|---------|---------|---------|
| `reborn-util` | 1.1.3 | Helpers nội bộ Reborn (formatCurrency, getDomain, getCookie, getSearchParameters...) |
| `reborn-validation` | 1.0.5 | Validation framework nội bộ (Validate function, IValidation type) |

> 2 package này được publish riêng bởi đội Reborn và dùng chung cho các sản phẩm Reborn khác. Xem code trong `node_modules/reborn-util/` để hiểu API.

---

## 8. Testing & Quality

### 8.1. Linting & Formatting

| Package | Version | Vai trò |
|---------|---------|---------|
| `eslint` | 8.5 | Linter |
| `@typescript-eslint/eslint-plugin` | 5.8 | TS rules |
| `@typescript-eslint/parser` | 5.8 | TS parser |
| `eslint-plugin-react` | 7.27 | React rules |
| `eslint-plugin-react-hooks` | 4.3 | Hooks rules |
| `eslint-config-prettier` | 8.3 | Prettier integration |
| `eslint-plugin-prettier` | 4.0 | Prettier as ESLint |
| `prettier` | 2.5 | Code formatter |

### 8.2. Pre-commit

| Package | Version | Vai trò |
|---------|---------|---------|
| `husky` | 7.0 | Git hooks |
| `lint-staged` | 12.1 | Run lint on staged files |

**Pre-commit hook:**
```json
"lint-staged": {
  "*.{js,ts,tsx}": ["npm run lint:fix"]
}
```

### 8.3. Test (chưa có)

> ⚠️ **Quan sát:** Không có `vitest`, `jest`, `@testing-library/react`, hoặc `playwright` trong `devDependencies`. Có Playwright nhưng cài tách trong `docs/userguides/tooling/` cho mục đích chụp ảnh HDSD, không phải production test suite. Đây là **gap lớn** cần xử lý — xem [Part 14](part-14-quality-risks.md).

---

## 9. Polyfill & Compatibility

| Package | Version | Vai trò |
|---------|---------|---------|
| `whatwg-fetch` | 3.6 | fetch polyfill cho browser cũ |
| `fetch-intercept` | 2.4 | Interceptor cho fetch (dùng cho auth header) |
| `core-js` | (transitive) | ES polyfills |

---

## 10. Build & dev scripts

`package.json`:

```json
"scripts": {
  "dev": "vite --mode development",
  "build": "vite build --mode production",
  "build-beta": "vite build --mode staging",
  "preview": "vite preview",
  "lint": "eslint --ext js,jsx,ts,tsx src/",
  "lint:fix": "eslint --fix --ext js,jsx,ts,tsx src/",
  "prettier": "prettier --check ...",
  "prettier:fix": "prettier --write ..."
}
```

**Mode triggers env file:**

- `development` → `.env.development`
- `staging` → `.env.staging`
- `production` → `.env.production`

---

## 11. Phân tích bundle size

> ⚠️ **Quan sát hiện tại:** Sau khi build production:
>
> - `bundle/crm/js/index.<hash>.js` ≈ **20.7 MB raw / 5 MB gzip** ❗
> - `bundle/crm/css/index.<hash>.css` ≈ **4.6 MB raw / 446 KB gzip**
>
> Đây là bundle **cực lớn** so với mức acceptable cho web app (thường < 1 MB raw). Lý do:
>
> 1. Quá nhiều thư viện UI (highcharts + ag-grid + bpmn-js + reactflow + slate + ...)
> 2. **Chưa lazy load** đủ — manualChunks chỉ tách 3 vendor
> 3. Một số module nặng (bpmn-js, slate, exceljs) không cần load trừ khi user vào page tương ứng

**Đề xuất tối ưu** (chi tiết ở [Part 14](part-14-quality-risks.md)):

1. Lazy load **bpmn-js** chỉ khi vào page BPM
2. Lazy load **slate** chỉ khi mở rich text editor
3. Lazy load **exceljs/xlsx** chỉ khi user bấm Export
4. Lazy load **highcharts** chỉ khi vào trang báo cáo
5. Tách thêm `manualChunks`: `editor`, `chart`, `bpmn`, `excel`
6. Cân nhắc dynamic import cho route-level

---

## 12. Bảng tổng hợp dependencies theo nhóm

| Nhóm | Số package | Tỷ lệ |
|------|:----------:|:-----:|
| Core (React/TS/Vite) | 6 | 5% |
| Routing | 1 | 1% |
| UI components | 15 | 13% |
| Form & input | 12 | 10% |
| Data viz & tables | 8 | 7% |
| BPM | 9 | 8% |
| Slate (rich text) | 5 | 4% |
| Communication (SIP) | 2 | 2% |
| File handling | 11 | 9% |
| Date/time | 2 | 2% |
| Auth/Security | 5 | 4% |
| Firebase + Reborn util | 3 | 3% |
| Lint/format | 8 | 7% |
| Polyfill/compat | 3 | 3% |
| Khác | ~30 | 25% |
| **Tổng** | **~120** | **100%** |

---

## 13. Phụ thuộc vào dịch vụ Reborn nội bộ

Ngoài npm package, frontend còn phụ thuộc các API/service nội bộ:

| Service Reborn | Vai trò | URL prefix |
|---------------|---------|-----------|
| **SSO Reborn** | Đăng nhập, OAuth | `process.env.APP_AUTHENTICATOR_URL` |
| **Cloud API** | Main backend | `process.env.APP_API_URL` |
| **Biz API** | Microservices nghiệp vụ | `process.env.APP_BIZ_URL` |
| **BPM Engine** | Workflow | `process.env.APP_BPM_URL` |
| **Connect Service** | Tích hợp 3rd party | `process.env.APP_CONNECT_URL` |
| **Upload Service** | Upload file | `process.env.APP_UPLOAD_URL` |
| **Athena** | Analytics | `process.env.APP_ATHENA_URL` |

---

*Hết Part 03.*

---

# Part 04 — Routing & Navigation

## Executive Summary

Routing dùng **react-router-dom v6** với cấu hình tập trung trong [`src/configs/routes.tsx`](../../src/configs/routes.tsx) (1179 dòng). Có **167 route**, mỗi page được **lazy load** qua `React.lazy()`. **Sidebar menu** cũng được định nghĩa trong cùng file dưới dạng object tree. Hệ thống hỗ trợ **biến thể tenant** — sidebar có thể khác nhau giữa các dòng sản phẩm (vd biến thể *Cửa hàng / Spa* với prefix `ch_*` so với biến thể CRM B2B truyền thống).

---

## 1. Tổng quan kiến trúc routing

### 1.1. File chính

[`src/configs/routes.tsx`](../../src/configs/routes.tsx) chứa **2 export**:

```ts
// 1) Sidebar menu config (tree)
export const menu = [
  {
    title: "dashboard",
    path: urls.dashboard,
    icon: <Icon name="DashboardMenu" />,
    code: "DASHBOARD",
  },
  {
    title: "chReception",
    path: urls.create_sale_add,
    icon: <Icon name="CounterMenu" />,
    children: [
      { title: "createSalesOrder", path: urls.create_sale_add, ... },
      { title: "chCheckin", path: "/ch_checkin", ... },
      // ...
    ],
  },
  // ... 12 mục lớn
];

// 2) Route table (flat array)
export const routes = [
  { path: urls.dashboard, component: <Dashboard /> },
  { path: "/ch_checkin", component: <CHCheckinPage /> },
  // ... 167 routes
];
```

### 1.2. Nguyên tắc

- **Tách menu khỏi route table**: menu dùng cho sidebar (có icon, children, code), route table dùng cho react-router. Một path có thể xuất hiện ở route table nhưng không xuất hiện ở menu (deep link, modal page).
- **Lazy load mọi page**: dùng `React.lazy(() => import("..."))`
- **URL constants**: mọi path đều lấy từ [`src/configs/urls.ts`](../../src/configs/urls.ts) thay vì hardcode
- **Permission code**: mỗi mục menu có `code` (vd `CUSTOMER`, `SALE_INVOICE`) để khớp với quyền RBAC

---

## 2. Cấu trúc menu sidebar

### 2.1. Hierarchy mặc định (biến thể Cửa hàng & Spa — Community Hub)

Menu hiện tại có **12 nhóm chính** với prefix `ch*`:

```
1. Tổng quan (dashboard)
2. Lễ tân (chReception)
   ├─ Bán hàng tại quầy (createSalesOrder → /create_sale_add)
   ├─ Check-in / Cửa vào (chCheckin → /ch_checkin)
   ├─ Trừ quota dịch vụ (chDeductQuota → /ch_services)
   └─ Quản lý ca làm việc (shiftManagement → /shift_management)
3. Thành viên (customer)
   ├─ Danh sách thành viên (customerList → /customer_list)
   └─ Cài đặt thành viên (settingCustomer → /setting_customer)
4. Giao dịch (chOrders)
   ├─ Hóa đơn bán hàng (salesInvoice → /sale_invoice)
   └─ Hóa đơn VAT (invoiceVAT → /invoiceVAT)
5. Lưu trú (chAccommodation → /ch_accommodation)
6. Tài chính & Thanh toán (financeManagement)
   ├─ Tổng quan (financeDashboard → /finance_management/dashboard)
   ├─ Sổ thu chi (financeCashbook → /finance_management/cashbook)
   ├─ Quản lý quỹ (fundManagement → /finance_management/fund_management)
   ├─ Khoản mục (categoryManagement → /finance_management/category_management)
   ├─ Công nợ (debtManagement → /finance_management/debt_management)
   └─ Đối soát thanh toán (paymentControl → /payment_control)
7. Đối tác (chPartners → /ch_partners)
8. Phản hồi (chFeedback → /ch_feedback)
9. Báo cáo (chReports)
   ├─ Doanh thu (chReportRevenue → /ch_report_revenue)
   ├─ Thành viên (chReportMembers → /ch_report_members)
   ├─ Check-in (chReportCheckin → /ch_report_checkin)
   ├─ Dịch vụ (chReportServices → /ch_report_services)
   ├─ Đối tác (chReportPartners → /ch_report_partners)
   └─ Tài chính (chReportFinance → /ch_report_finance)
10. Marketing (Tiếp thị & Chăm sóc)
    ├─ Khuyến mãi & Voucher (promotionalProgram → /promotional_program)
    ├─ Tích điểm hội viên (loyaltyPoints → /member_list)
    ├─ Chiến dịch marketing (marketingCampaign → /marketing_campaign)
    └─ Chăm sóc thành viên (customerCare → /customer_care_page)
11. Kho & Nguyên vật liệu (warehouse)
    ├─ NVL (managementMaterial → /material)
    ├─ Nhà cung cấp (supplierList → /supplier_list)
    ├─ Danh sách kho (warehouseList → /warehouse)
    ├─ Quản lý kho (warehouseManagement → /inventory)
    ├─ Kiểm kê (warehouseChecking → /inventory_checking)
    └─ Báo cáo kho (reportWarhouse → /report_warehouse)
12. Cài đặt (settings)
    ├─ Cấu hình toàn cục (chTenantConfig → /ch_tenant_config)
    ├─ Danh mục dịch vụ (chServiceCatalogSetting → /setting_sell)
    ├─ Gói thành viên (chMembershipPlans → /ch_membership_plans)
    ├─ Vận hành cơ sở (settingBasis → /setting_basis)
    ├─ Tổ chức & phân quyền (settingOrg → /setting_org)
    ├─ Kênh liên lạc (multiChannelCommunication → /setting_channels)
    ├─ Tích hợp (settingIntegrations → /setting_integrations)
    ├─ Tài khoản & bảo mật (settingPersonal → /setting_account)
    └─ Hỗ trợ thành viên (settingTicket → /setting_ticket)
```

### 2.2. Biến thể tenant

> **Quan sát quan trọng:** Codebase chứa **nhiều biến thể** menu khác nhau cho các loại tenant khác nhau. Ngoài Community Hub (CH), còn thấy các route khác cho biến thể B2B/B2C truyền thống (campaign, opportunity, sales pipeline, contact, project...).

Cấu trúc menu **chỉ kích hoạt theo gói SaaS** mà tenant đang thuê. Ví dụ:

| Biến thể | Menu prefix điển hình | Đối tượng |
|----------|----------------------|-----------|
| **Community Hub** (đang phân tích) | `ch*`, `chReception`, `chOrders`, `chPartners` | Spa, gym, co-working, homestay |
| **B2B Sales** | `campaign`, `opportunity`, `pipeline`, `contact` | Doanh nghiệp B2B |
| **Retail** | `pos`, `inventory`, `barcode` | Cửa hàng bán lẻ |
| **Field Service** | `dispatch`, `route`, `field_management` | Công ty dịch vụ tại nhà |

> **Cơ chế switch biến thể:** Frontend tự đọc cấu hình từ backend (qua API như `getTenantConfig` hoặc gói SaaS) và chỉ render menu items mà tenant này được phép thấy. Code logic chính nằm trong [`src/components/sidebar/sidebar.tsx`](../../src/components/sidebar/sidebar.tsx).

---

## 3. Route table

### 3.1. Pattern 1 route entry

```tsx
{
  path: urls.dashboard,           // "/dashboard"
  component: <Dashboard />,       // lazy-loaded React.lazy()
}
```

### 3.2. Lazy loading

```tsx
const CustomerPersonList = React.lazy(() => import("pages/CustomerPerson/CustomerPersonList"));
const Dashboard = React.lazy(() => import("pages/Dashboard"));
const CounterSales = React.lazy(() => import("pages/CounterSales"));
// ... 167 dòng tương tự
```

→ Mỗi import tạo 1 chunk JS riêng.

### 3.3. Sub-routes (nested routing)

Một số page lớn có **nested routing** trong chính nó (vd `pages/Finance/` có Dashboard / Cashbook / Fund / Category / Debt / Payment Control). Pattern phổ biến:

```tsx
// pages/Finance/index.tsx
<Routes>
  <Route path="/dashboard" element={<FinanceDashboard />} />
  <Route path="/cashbook" element={<Cashbook />} />
  <Route path="/fund_management" element={<FundManagement />} />
  // ...
</Routes>
```

Hoặc dùng tab pattern (như `ShiftTabsPage` ở Part 02 HDSD):

```tsx
const [tab, setTab] = useState<TabKey>("preopen");

return (
  <div>
    <ul className="menu-list">
      <li onClick={() => setTab("preopen")}>Chưa vào ca</li>
      <li onClick={() => setTab("open")}>Vào ca</li>
      // ...
    </ul>
    <div className="tab-body">
      {tab === "preopen" && <NotOpenShiftTab />}
      {tab === "open" && <OpenShiftTab />}
      // ...
    </div>
  </div>
);
```

### 3.4. Dynamic route params

Các route có ID động dùng cú pháp react-router v6:

```
/detail_person/customerId/:customerId
/detail_person/customerId/:customerId/:tab
/detail_invoice/:invoiceId
/edit_marketing_automation/:id
```

Page đọc params qua `useParams()` hoặc helper `getSearchParameters()` từ `reborn-util`.

---

## 4. Sidebar component

### 4.1. File

[`src/components/sidebar/sidebar.tsx`](../../src/components/sidebar/sidebar.tsx)

### 4.2. Logic chính

```tsx
import { menu } from "configs/routes";
import { Navigation } from "./Navigation";

export default function Sidebar() {
  const { permissions } = useContext(UserContext);
  const filteredMenu = filterMenuByPermission(menu, permissions);
  
  return (
    <div className="sidebar">
      <CustomScrollbar>
        <Navigation menuItemList={filteredMenu} />
      </CustomScrollbar>
    </div>
  );
}
```

### 4.3. Nguyên tắc lọc menu

1. Lấy menu config gốc
2. Với mỗi item, kiểm tra `code` có nằm trong `permissions` của user không
3. Với group có `children`, recursive filter các children — group bị ẩn nếu không có child nào còn lại
4. Render bằng `Navigation` component (custom) hỗ trợ collapsed state, active highlight, hover dropdown

### 4.4. State sidebar

| State | Lưu ở | Mục đích |
|-------|-------|----------|
| **Collapsed/Expanded** | UIContext | Toggle khi user bấm `«` / `»` |
| **Active item** | useLocation() | Tự highlight theo URL hiện tại |
| **Open groups** | localStorage | Nhớ những nhóm user đã mở |

---

## 5. Routing trong App.tsx

```tsx
// App.tsx (giản lược)
import { Routes, Route } from "react-router-dom";
import { routes } from "./configs/routes";
import LayoutPage from "pages/layout";
import Login from "./pages/Login/index";

function App() {
  // ...auth setup, contexts, fetch interceptor...
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <LayoutPage>
          <Routes>
            {routes.map(({ path, component }) => (
              <Route key={path} path={path} element={
                <Suspense fallback={<Loading />}>
                  {component}
                </Suspense>
              } />
            ))}
          </Routes>
        </LayoutPage>
      } />
    </Routes>
  );
}
```

> **Suspense** wrap mỗi route để hiển thị loading khi chunk JS đang tải. Layout chung chứa Sidebar + Header.

---

## 6. URL constants (`src/configs/urls.ts`)

File này chứa **2 nhóm**:

### 6.1. Frontend URLs

```ts
const urls = {
  dashboard: "/dashboard",
  customer: "/customer",
  customer_list: "/customer_list",
  create_sale_add: "/create_sale_add",
  shift_management: "/shift_management",
  // ... ~200 URL
};
```

### 6.2. Backend API URLs

```ts
export const urlsApi = {
  customer: {
    filter: prefixApi + "/customer/filter",
    detail: prefixApi + "/customer/detail",
    update: prefixApi + "/customer/update",
    delete: prefixApi + "/customer/delete",
    // ...
  },
  invoice: {
    create: prefixSales + "/invoice/create",
    filter: prefixSales + "/invoice/filter",
    cancel: prefixSales + "/invoice/cancel",
    // ...
  },
  shift: {
    open: prefixSales + "/shift/open",
    close: prefixSales + "/shift/close",
    // ...
  },
  // ... hàng nghìn endpoint
};
```

> File này có **3757 dòng** — là single source of truth cho mọi URL backend. Service files chỉ reference vào `urlsApi.<domain>.<method>`, không bao giờ ghép URL trực tiếp.

### 6.3. Prefix routing

```ts
const prefixApi = "/api";              // Main API
const prefixAdmin = "/adminapi";       // Admin API
const prefixBiz = "/bizapi";           // Business APIs (root)
const prefixSales = prefixBiz + "/sales";       // Sales microservice
const prefixFinance = prefixBiz + "/finance";   // Finance microservice
const prefixInventory = prefixBiz + "/inventory";
const prefixWarehouse = prefixBiz + "/warehouse";
const prefixCare = prefixBiz + "/care";          // Customer Care
const prefixBilling = prefixBiz + "/billing";    // E-invoice
const prefixLogistics = prefixBiz + "/logistics";
const prefixIntegration = prefixBiz + "/integration";
const prefixMarket = prefixBiz + "/market";      // Marketing
const prefixNotification = prefixBiz + "/notification";
const prefixCs = "/cs";                          // Customer service / Ticket
const prefixHr = "/hr";                          // HR
const prefixSystem = "/system";
const prefixApplication = "/application";
const prefixBpm = process.env.APP_BPM_URL + "/bpmapi";  // BPM (external service)
const prefixAuthenticator = "/authenticator";    // Auth/SSO
```

> **Backend là microservices** — mỗi prefix tương ứng 1 service riêng. Frontend routes traffic đến đúng service qua interceptor (xem [Part 06](part-06-service-api.md)).

---

## 7. Sơ đồ routing

![Routing & Navigation — Cấu trúc menu + URL prefix → Microservices](./diagrams/09-routing-prefix-routing.png)

---

## 8. Edge cases

### 8.1. Public routes (không cần auth)

Các route public thường có URL chứa `/public/`. Fetch interceptor không thêm `Authorization` header:

```ts
const isPublic = url.includes("/public/");
if (token && !isPublic) {
  config.headers["Authorization"] = `Bearer ${token}`;
}
```

### 8.2. 404 handling

```tsx
const Page404 = React.lazy(() => import("pages/404"));
// ...
{ path: "*", component: <Page404 /> }
```

### 8.3. Redirect sau login

Khi login thành công, redirect về URL ban đầu user yêu cầu (lưu trong query param `redirect_uri`):

```
http://localhost:8080/?redirect_uri=http://localhost:4000/crm/login
```

Sau khi xác thực, SSO redirect ngược về `/crm/login`, frontend đọc query param và navigate đến URL gốc.

### 8.4. Deep link

Một số page có thể được mở từ link bên ngoài (email notification, SMS với link):

```
https://hub.reborn.vn/crm/detail_invoice/12345
```

Frontend phải:
1. Check auth → nếu chưa login, redirect tới SSO với `redirect_uri` chứa URL này
2. Sau auth, restore URL gốc

---

## 9. Permission gating

Mỗi route lý tưởng nên có guard kiểm tra quyền truy cập:

```tsx
function PrivateRoute({ requiredPermission, children }) {
  const { permissions } = useContext(UserContext);
  if (!permissions.includes(requiredPermission)) {
    return <Page403 />;
  }
  return children;
}

// Sử dụng
<Route path="/customer_list" element={
  <PrivateRoute requiredPermission="CUSTOMER">
    <CustomerPersonList />
  </PrivateRoute>
} />
```

> ⚠️ **Quan sát hiện tại:** Codebase **chưa có** explicit `PrivateRoute` wrapper cho mọi route. Phân quyền chủ yếu dựa vào việc **ẩn menu item** trong sidebar. Người dùng có thể type URL trực tiếp để bypass — đây là **security gap nhỏ**, cần fix bằng cách thêm permission check ở mỗi page hoặc middle layout.

---

## 10. Best practice & quy ước

| Quy tắc | Lý do |
|---------|-------|
| Mọi page mới **phải** lazy load qua `React.lazy()` | Giảm bundle initial |
| Mọi URL **phải** lấy từ `urls` / `urlsApi` | Tránh hardcode, dễ maintain |
| Mọi menu item **phải** có `code` permission | Để phân quyền hoạt động |
| Page test mở deep link **phải** không bị blank | Đảm bảo SSR-safe |
| Sub-routes trong page phức tạp **nên** dùng tab thay vì nested Routes | Đơn giản hơn |
| **Không** dùng `<a href>` cho nội bộ | Dùng `<Link to>` của react-router |

---

*Hết Part 04.*

---

# Part 05 — Component & Module Architecture

## Executive Summary

Frontend Reborn CRM tổ chức theo **layered architecture** với 78 component tái sử dụng + 167 page module + 30+ custom hooks + 5 React Context. Pattern chính: **Page = Container** (gọi service, quản lý local state), **Component = Presentational** (nhận props, không biết về API), **Hook = Logic encapsulation** (tái dụng giữa các page), **Context = Global state** (auth, user, ui).

---

## 1. Phân loại component

### 1.1. Sơ đồ phân loại 78 component

![Component categories — 78 reusable UI components](./diagrams/10-component-categories.png)

### 1.2. Bảng phân loại

| Nhóm | Số component | Ví dụ |
|------|:------------:|-------|
| **Form Controls** | ~15 | `input/`, `selectCustom/`, `datePicker/`, `numericInput/`, `radioBox/`, `checkbox/`, `textarea/`, `slider/`, `colorPicker/`, `fileUpload/` |
| **Layout & Navigation** | ~10 | `sidebar/`, `header/`, `breadcrumb/`, `titleAction/`, `tabs/`, `slidePanel/` |
| **Data Display** | ~12 | `table/`, `agGridTable/`, `pagination/`, `card/`, `list/`, `kanbanBpm/`, `treeView/`, `timeline/`, `avatar/`, `badge/`, `chip/`, `statistic/` |
| **Feedback** | ~10 | `modal/`, `confirm/`, `loading/`, `spinner/`, `progressBar/`, `toast/`, `tooltip/`, `alert/`, `empty/`, `skeleton/` |
| **Media & Visualization** | ~8 | `chart/`, `image/`, `videoPlayer/`, `audioPlayer/`, `qrcode/`, `barcode/`, `map/`, `signature/` |
| **Specialized** | ~15 | `tourOverlay/`, `richTextEditor/`, `bpmnViewer/`, `formBuilder/`, `phoneCall/`, `chat/`, `comment/`, `attachment/` |
| **Icon set** | ~3 | `icon/` (1 component, render hàng trăm icon name) |
| **Utility wrappers** | ~5 | `errorBoundary/`, `lazyLoad/`, `printArea/`, `permissionGuard/` |

---

## 2. Pattern: Container vs Presentational

### 2.1. Container component (Page)

**Trách nhiệm:**
- Gọi service để lấy data
- Quản lý state (loading, error, data)
- Xử lý event business
- Truyền data + callbacks xuống presentational components

**Ví dụ:**

```tsx
// pages/CustomerPerson/CustomerPersonList.tsx
function CustomerPersonList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  
  useEffect(() => {
    setLoading(true);
    CustomerService.filter(filter)
      .then(res => setCustomers(res.result.items))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <Layout>
      <FilterBar value={filter} onChange={setFilter} />
      <Loading active={loading}>
        <Table data={customers} columns={columns} />
      </Loading>
    </Layout>
  );
}
```

### 2.2. Presentational component (Component)

**Trách nhiệm:**
- Nhận props
- Render UI
- Gọi callback prop khi user tương tác
- **Không biết** về API, không gọi context, không có business logic

**Ví dụ:**

```tsx
// components/table/Table.tsx
interface TableProps {
  data: any[];
  columns: ColumnDef[];
  onRowClick?: (row: any) => void;
}

export default function Table({ data, columns, onRowClick }: TableProps) {
  return (
    <table>
      <thead>{/* render columns */}</thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} onClick={() => onRowClick?.(row)}>
            {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 2.3. Khi nào break rule

Một số presentational component **được phép** truy cập context vì lý do practical:

- **Sidebar, Header**: cần `UserContext` để biết user đang login
- **PermissionGuard**: cần `UserContext.permissions`
- **TabMenuList**: tự load data từ API common (không qua page)

---

## 3. Custom hooks pattern

### 3.1. Mục đích

- **DRY**: Logic load data dùng ở nhiều page → đóng gói thành hook
- **Separation of concerns**: Page chỉ render UI, hook lo logic
- **Testable**: Hook test độc lập với UI

### 3.2. Anatomy của 1 hook

```ts
// hooks/useCustomerList.ts
export function useCustomerList(initialFilter: ICustomerFilterRequest) {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState(initialFilter);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CustomerService.filter(filter);
      if (res.code === 0) {
        setData(res.result);
      } else {
        setError(new Error(res.message));
      }
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, filter, setFilter, refetch };
}

// Sử dụng trong page:
const { data, loading, filter, setFilter, refetch } = useCustomerList({ branchId });
```

### 3.3. Bảng hook quan sát được

| Hook | File | Phạm vi sử dụng |
|------|------|-----------------|
| `useCustomerList` | `hooks/useCustomerList.ts` | Mọi page list khách |
| `useCustomerEnrich` | `hooks/useCustomerEnrich.ts` | Bổ sung thông tin khách |
| `useDashBoard` | `hooks/useDashBoard.ts` | Dashboard page |
| `useDebounce` | `hooks/useDebounce.ts` | Mọi ô search có debounce |
| `useGetDetailInvoice` | `hooks/useGetDetailInvoice.ts` | Detail invoice modal |
| `useGetDetailProduct` | `hooks/useGetDetailProduct.ts` | Detail product modal |
| `useLA` | `hooks/useLA.ts` | Liquidity Analysis |
| `useOmniCXM` | `hooks/useOmniCXM.ts` | Omni-channel customer experience |
| `useOnboarding` | `hooks/useOnboarding.ts` | Tour overlay first-time user |
| `useReconciliationList` | `hooks/useReconciliationList.ts` | Đối soát thanh toán |
| ... | | |

---

## 4. Context API: Global State

### 4.1. Sơ đồ context tree

```
<AuthProvider>           ← contexts/authContext.ts
  <UserProvider>         ← contexts/userContext.ts
    <UIProvider>         ← contexts/uiContext.ts
      <CallProvider>     ← contexts/callContext.ts
        <App />
      </CallProvider>
    </UIProvider>
  </UserProvider>
</AuthProvider>
```

### 4.2. Chi tiết từng context

#### authContext

```ts
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (credentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

- **Khi nào set:** Sau khi user login thành công, sau khi refresh token
- **Persist:** Token lưu vào cookie (đọc lại khi reload)
- **Side effect:** Khi logout, xóa cookie + localStorage + redirect login

#### userContext

```ts
interface UserContextType {
  id: number | null;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];           // ['CUSTOMER', 'INVOICE', 'SHIFT_OPEN', ...]
  dataBranch: { value: number, label: string } | null;  // cơ sở đang chọn
  organizationInfo: any;            // tenant info
  setDataBranch: (branch) => void;
  // ...
}
```

> **Đây là context được consume nhiều nhất** — gần như mọi page lấy `dataBranch.value` để filter dữ liệu theo cơ sở.

#### uiContext

```ts
interface UIContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (t: string) => void;
  modalStack: ModalDescriptor[];
  pushModal: (m: ModalDescriptor) => void;
  popModal: () => void;
}
```

#### callContext

```ts
interface CallContextType {
  currentCall: ActiveCall | null;
  startCall: (phone: string) => void;
  endCall: () => void;
  callHistory: CallRecord[];
  isInCall: boolean;
}
```

> Riêng biệt khỏi `userContext` vì call state cập nhật liên tục (mỗi giây) — tránh re-render toàn bộ app.

### 4.3. Pattern truy cập context

```tsx
import { useContext } from "react";
import { UserContext, ContextType } from "contexts/userContext";

function MyPage() {
  const { dataBranch, permissions, name } = useContext(UserContext) as ContextType;
  // ...
}
```

> **Cast type** cần thiết vì `createContext()` mặc định trả về `T | undefined`. Pattern `as ContextType` được dùng nhất quán trong codebase.

---

## 5. Module dependencies — Ai gọi ai?

### 5.1. Quy tắc 1 chiều

```
                ┌─────────┐
                │  Pages  │
                └────┬────┘
                     │ uses
              ┌──────┴──────┐
              ▼             ▼
     ┌──────────────┐  ┌──────────┐
     │  Components  │  │  Hooks   │
     └──────┬───────┘  └─────┬────┘
            │                │
            └────┬───────────┘
                 ▼
          ┌────────────┐
          │  Contexts  │
          └─────┬──────┘
                │
                ▼
          ┌────────────┐
          │  Services  │
          └─────┬──────┘
                │
                ▼
          ┌────────────┐
          │ apiHelper  │
          └─────┬──────┘
                │
                ▼
          ┌────────────┐
          │   fetch    │
          └────────────┘
```

> Vi phạm chiều này = code smell. Ví dụ: Service không được gọi Component, Component không được gọi Page.

### 5.2. Cross-cutting modules

Một số module được phép cross-cutting (mọi nơi đều gọi):

| Module | Phạm vi |
|--------|---------|
| `utils/common.ts` | Mọi nơi (helper format, parse, helper chung) |
| `configs/urls.ts` | Mọi service |
| `model/*` | Mọi service + page (vì là TypeScript interface, không có runtime) |
| `i18n.ts` (`useTranslation`) | Mọi component có text |
| `react-toastify` (`showToast`) | Mọi page (qua wrapper `utils/common`) |

---

## 6. Page module patterns

### 6.1. Pattern A — Single-file page

Page nhỏ, ≤ 500 dòng, không có sub-component đáng kể:

```
pages/Dashboard/
├── index.tsx
└── index.scss
```

### 6.2. Pattern B — Multi-file page với partials

Page vừa, có vài sub-component dùng riêng:

```
pages/CustomerCarePage/
├── index.tsx                    # Container
├── index.scss
└── partials/
    ├── CareList.tsx
    ├── CareDetailModal.tsx
    └── CareFilterBar.tsx
```

### 6.3. Pattern C — Mega page

Page lớn, có nhiều tab, modal, sub-pages:

```
pages/CustomerPerson/
├── CustomerPersonList.tsx       # Main page (3824 dòng ❗)
├── CustomerPersonList.scss
├── partials/
│   ├── DetailPerson/            # Tab chi tiết
│   ├── AddCustomerPersonModal.tsx
│   ├── AddCustomerCompanyModal.tsx
│   ├── FilterAdvanceModal/
│   ├── ModalImportCustomer/
│   └── ... (10+ sub-components)
├── CustomerSourceAnalysis/      # Sub-page riêng
├── ModalAddMA/
└── ModalExportCustomer/
```

> **Anti-pattern:** Pattern C với main file > 1000 dòng. Cần refactor — xem [Part 14 — Risks](part-14-quality-risks.md).

### 6.4. Pattern D — Page với nội dung tabs (multi-screen trong 1 URL)

```
pages/ShiftManagement/
├── ShiftTabsPage.tsx            # Chứa tab switcher
├── ShiftTabsPage.scss
└── partials/
    ├── NotOpenShift/NotOpenShiftTab.tsx
    ├── OpenShift/OpenShiftTab.tsx
    ├── OnShift/OnShiftTab.tsx
    ├── OrdersInShift/OrdersInShiftTab.tsx
    ├── CloseShift/CloseShiftTab.tsx
    ├── ReportShift/ReportShiftTab.tsx
    └── ReportOverview/OverviewTab.tsx
```

> Page này có **7 tabs** trong cùng 1 URL `/shift_management`. Tab state trong local React state, không phản ánh vào URL (nhược điểm: F5 mất tab).

---

## 6. Component dependency graph (ví dụ)

Khi một page render, cây component có thể như sau (ví dụ POS):

```
<CounterSales>                                          ← Page
├── <Topbar>                                           ← Component
│   ├── <TabSwitcher>
│   ├── <SearchBar> ◄── useDebounce ◄── (hook)
│   └── <BranchSwitcher> ◄── UserContext ◄── (context)
├── <ProductGrid>                                       ← Component
│   ├── <CategoryFilter>
│   ├── <ProductCard /> × N
│   └── <PaginationLite>
├── <Cart>                                              ← Component
│   ├── <CartCustomer> ◄── CustomerService.search ◄── (service)
│   ├── <CartItem /> × N
│   ├── <PromotionBox>
│   └── <CartTotal>
└── <Modals>                                            ← Components
    ├── <PayModal>
    ├── <ReceiptModal>
    ├── <QuickAddModal>
    ├── <CustomerModal>
    ├── <PromotionModal>
    └── <VariantModal>
```

---

## 7. Reusability metrics

Để biết component có thật sự "reusable" hay không, đo:

| Metric | Ngưỡng "tốt" | Phương pháp đo |
|--------|--------------|----------------|
| **Số nơi import** | ≥ 3 | grep `import .* from "components/<name>"` |
| **Số props** | ≤ 10 | Đếm trong interface |
| **Số dependency context** | 0 (lý tưởng) | Xem `useContext` trong code |
| **Tuổi code không bị sửa** | càng cũ càng tốt | git log |

> **Audit suggestion**: Chạy script đếm số nơi import từng component. Component < 3 nơi → cân nhắc inline lại vào page nó được dùng.

---

## 8. Testing component (đề xuất)

> ⚠️ **Mức độ tự tin: Thấp** — chưa có test trong repo.

| Loại component | Test gì |
|----------------|--------|
| **Form control** | Render → fill → onChange callback fired |
| **Modal** | Mở → đóng → callback `onClose` |
| **Table** | Render N rows, sort, pagination |
| **Page** | Mock service → assert UI render đúng data |
| **Hook** | renderHook + assert state updates |

Tool: **Vitest** (vì đã dùng Vite) + **React Testing Library** + **MSW** (mock API).

---

*Hết Part 05.*

---

# Part 06 — Service Layer & API Contract

## Executive Summary

Frontend có **240 service files** trong `src/services/`, mỗi file đóng gói các API call cho 1 domain. Tất cả service đều dùng **`apiHelper` wrapper** trên `fetch`, lấy URL từ **`urlsApi` catalog** (3757 dòng), và đi qua **fetch interceptor** để tự động thêm `Authorization: Bearer`, `Selectedrole`, `Hostname`, và route URL theo prefix sang đúng microservice. **API contract**: REST + JSON, response dạng `{ code, result, message }`, `code === 0` = success.

---

## 1. Tổng quan service layer

### 1.1. Sơ đồ luồng request

![Service Layer — Flow Page → Service → apiHelper → fetch → interceptor → Backend](./diagrams/11-service-layer-flow.png)

### 1.2. Các bước khi page gọi 1 API

1. **Page** import service: `import CustomerService from "services/CustomerService"`
2. **Page** gọi method: `CustomerService.filter({ branchId: 23 })`
3. **Service** lookup URL: `urlsApi.customer.filter` → `"/api/customer/filter"`
4. **Service** gọi `apiGet(url, params)` từ `apiHelper`
5. **apiHelper** tạo `fetch(url + queryString)`
6. **fetch-intercept** middleware:
   - Đọc cookie `token` → set `Authorization: Bearer <token>`
   - Đọc localStorage `SelectedRole` → set header `Selectedrole`
   - Set `Hostname` header (định danh tenant)
   - Rewrite URL: `/api/...` → `https://cloud.reborn.vn/api/...`
7. **Browser** gửi HTTP request đến API gateway
8. **API gateway** routes đến đúng microservice (Sales/Finance/Inventory/...)
9. **Microservice** xử lý → trả JSON về
10. **fetch-intercept** check status code: nếu 401 → clear cookie, redirect login
11. **apiHelper** parse JSON → trả về service caller
12. **Service** trả về Promise<response> cho page
13. **Page** check `response.code === 0` → render hoặc show error

---

## 2. apiHelper (`src/services/apiHelper.ts`)

### 2.1. Mục đích

DRY wrapper cho fetch, eliminates lặp lại `fetch + JSON.stringify + .then(res => res.json())` ở 240 service file.

### 2.2. API

```ts
// GET request
apiGet(url: string, params?: Record<string, any>, signal?: AbortSignal): Promise<any>

// POST request (JSON body)
apiPost(url: string, body: any): Promise<any>

// PUT request
apiPut(url: string, body: any): Promise<any>

// DELETE request
apiDelete(url: string, params?: Record<string, any>): Promise<any>
```

### 2.3. Implementation pattern

```ts
// (giản lược)
import { convertParamsToString } from "reborn-util";

export const apiGet = (url, params, signal) => {
  const queryString = params ? convertParamsToString(params) : "";
  return fetch(`${url}${queryString ? "?" + queryString : ""}`, {
    method: "GET",
    signal,
  }).then(res => res.json());
};

export const apiPost = (url, body) => {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  }).then(res => res.json());
};
```

> **Note:** `apiHelper` **không tự** thêm header `Content-Type` hay `Authorization` — đó là việc của `fetch-intercept`. Mỗi layer có 1 trách nhiệm rõ ràng.

### 2.4. Cancellation

Một số service hỗ trợ cancel request qua `AbortSignal`:

```ts
filter: (params, signal?: AbortSignal) => apiGet(urlsApi.customer.filter, params, signal)

// Page sử dụng:
useEffect(() => {
  const controller = new AbortController();
  CustomerService.filter(params, controller.signal).then(...);
  return () => controller.abort();  // Cancel khi unmount
}, [params]);
```

---

## 3. Fetch interceptor (`src/configs/fetchConfig.ts`)

### 3.1. Mục đích

Xử lý các **cross-cutting concerns** ở mức HTTP: authentication, multi-tenant, URL rewrite, 401 handling.

### 3.2. Sơ đồ flow

```
   ┌──────────────────────────────────────────────┐
   │   fetch(url, config)                         │
   └──────────────────┬───────────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────────┐
   │   fetch-intercept REQUEST handler            │
   │                                              │
   │   if (token && !isPublic):                   │
   │      headers.Authorization = Bearer <token>  │
   │                                              │
   │   if (selectedRole && !isPublic):            │
   │      headers.Selectedrole = <role>           │
   │                                              │
   │   headers.Hostname = "kcn.reborn.vn"         │
   │   headers["Content-Type"] = application/json │
   │                                              │
   │   if (url.startsWith("/bizapi")):            │
   │      url = APP_BIZ_URL + url.replace(...)    │
   │   else if (url.startsWith("/api")):          │
   │      url = APP_API_URL + url                 │
   │   else:                                       │
   │      url = APP_AUTHENTICATOR_URL + url       │
   └──────────────────┬───────────────────────────┘
                      │
                      ▼
                  [Network]
                      │
                      ▼
   ┌──────────────────────────────────────────────┐
   │   fetch-intercept RESPONSE handler           │
   │                                              │
   │   if (status === 401):                       │
   │      removeCookie("token", "user")           │
   │      localStorage.removeItem("permissions")  │
   │      // → user redirect to login next render │
   │                                              │
   │   return response                            │
   └──────────────────────────────────────────────┘
```

### 3.3. Headers chuẩn

| Header | Nguồn | Mục đích |
|--------|-------|----------|
| `Authorization: Bearer <token>` | Cookie `token` | Xác thực user |
| `Selectedrole: <role>` | localStorage `SelectedRole` | Multi-role support |
| `Hostname: <tenant.domain>` | Hardcode `kcn.reborn.vn` (⚠️) | Multi-tenant routing |
| `Content-Type: application/json` | Mặc định | Body type |
| `Accept: application/json` | Mặc định | Response type |

> ⚠️ **Critical bug:** [`fetchConfig.ts:42`](../../src/configs/fetchConfig.ts#L42) hardcode `Hostname = "kcn.reborn.vn"` — đây là dev override. Nếu đẩy lên production mà chưa wire lại để đọc từ `location.hostname`, **mọi tenant sẽ load data của tenant kcn**.

### 3.4. URL rewriting

```ts
const prefixAdmin = "/adminapi";
const prefixApi = "/api";
const prefixBiz = "/bizapi";

// /bizapi/sales/invoice/create
//   → process.env.APP_BIZ_URL + "/sales/invoice/create"
//   → https://biz.reborn.vn/sales/invoice/create

// /api/customer/filter
//   → process.env.APP_API_URL + "/api/customer/filter"
//   → https://cloud.reborn.vn/api/customer/filter

// /authenticator/oauth/token
//   → process.env.APP_AUTHENTICATOR_URL + "/authenticator/oauth/token"
//   → https://sso.reborn.vn/authenticator/oauth/token
```

> Đây là **API Gateway pattern thực hiện ở client-side** (thay vì có 1 nginx/Kong gateway centralize). Trade-off: đơn giản, không cần thêm hop, nhưng client phải biết đầy đủ URL của mọi service. Xem [ADR-06](part-13-adr.md#adr-06--client-side-api-gateway).

---

## 4. URL catalog (`src/configs/urls.ts`)

### 4.1. Cấu trúc

File 3757 dòng, là **single source of truth** cho mọi endpoint backend.

```ts
export const urlsApi = {
  customer: {
    filter: prefixApi + "/customer/filter",
    detail: prefixApi + "/customer/detail",
    update: prefixApi + "/customer/update",
    delete: prefixApi + "/customer/delete",
    listshared: prefixApi + "/customer/listshared",
    viewPhone: prefixApi + "/customer/viewPhone",
    viewEmail: prefixApi + "/customer/viewEmail",
    serviceSuggestionsv2: prefixApi + "/customer/serviceSuggestionsv2",
    // ... ~50 endpoint cho customer
  },
  invoice: {
    create: prefixSales + "/invoice/create",
    filter: prefixSales + "/invoice/filter",
    cancel: prefixSales + "/invoice/cancel",
    refund: prefixSales + "/invoice/refund",
    detail: prefixSales + "/invoice/detail",
    tabCounts: prefixSales + "/invoice/tabCounts",
    // ...
  },
  shift: {
    open: prefixSales + "/shift/open",
    close: prefixSales + "/shift/close",
    current: prefixSales + "/shift/current",
    list: prefixSales + "/shift/list",
    // ...
  },
  // ... ~50 domain
};
```

### 4.2. Lợi ích

- **Đổi prefix** chỉ ở 1 nơi (ví dụ migrate từ `/sales` sang `/sale-v2`)
- **Tìm kiếm dễ**: grep `urlsApi.customer.filter` để biết endpoint nào dùng
- **Type-safe**: TypeScript autocomplete

### 4.3. Best practice

| Quy tắc | Lý do |
|---------|-------|
| **Mọi service** lấy URL từ `urlsApi.<domain>.<method>` | Tránh hardcode |
| **Tên method** trùng với tên action (filter/detail/create/update/delete) | Dễ guess |
| **Phân nhóm theo domain**, không theo HTTP verb | Đọc dễ hơn |
| **Không** ghép URL trong service (`urlsApi.customer.detail + "?id=..."`) | Dùng query string param qua apiHelper |

---

## 5. Convention cho service file

### 5.1. Anatomy chuẩn

```ts
// src/services/InvoiceService.ts
import { apiGet, apiPost, apiDelete } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import {
  IInvoiceCreateRequest,
  IInvoiceFilterRequest,
  IInvoiceCancelRequest,
} from "model/invoice/InvoiceRequestModel";

export default {
  // Read
  filter: (params?: IInvoiceFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.invoice.filter, params, signal);
  },
  detail: (id: number) => {
    return apiGet(urlsApi.invoice.detail, { id });
  },
  tabCounts: (params: { branchId: number }) => {
    return apiGet(urlsApi.invoice.tabCounts, params);
  },
  
  // Write
  create: (body: IInvoiceCreateRequest) => {
    return apiPost(urlsApi.invoice.create, body);
  },
  cancel: (body: IInvoiceCancelRequest) => {
    return apiPost(urlsApi.invoice.cancel, body);
  },
  refund: (id: number, body: IRefundRequest) => {
    return apiPost(`${urlsApi.invoice.refund}?id=${id}`, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.invoice.delete}?id=${id}`);
  },
};
```

### 5.2. Quy ước

| Quy ước | Áp dụng | Ví dụ |
|---------|---------|-------|
| **Default export** | Mọi service file | `export default { filter, detail, ... }` |
| **Method tên ngắn** | filter / detail / create / update / delete | `CustomerService.filter()` |
| **Param luôn là object** | Cho pagination, filter, body | `{ page, limit, keyword, branchId }` |
| **Return raw response** | Không transform | Page tự check `response.code === 0` |
| **Không** ném exception | Trả về `{ code, message }` | Page handle error qua `code` |
| **Có signal cho list call** | Cho cancel khi unmount | `filter(params, signal)` |

---

## 6. Response format chuẩn

### 6.1. Success response

```json
{
  "code": 0,
  "message": "OK",
  "result": {
    "items": [
      { "id": 1, "name": "..." },
      { "id": 2, "name": "..." }
    ],
    "total": 250,
    "page": 1,
    "limit": 10,
    "loadMoreAble": true
  }
}
```

### 6.2. Error response

```json
{
  "code": 400,
  "message": "Số điện thoại đã tồn tại",
  "error": "DUPLICATE_PHONE",
  "result": null
}
```

### 6.3. Quy ước code

| `code` | Ý nghĩa |
|--------|---------|
| `0` | Success |
| `400` | Validation error / Bad request / Quyền không đủ |
| `401` | Chưa xác thực (interceptor xử lý → logout) |
| `403` | Forbidden |
| `404` | Not found |
| `500` | Server error |

> **Pattern check ở page:**
>
> ```ts
> const res = await CustomerService.filter(params);
> if (res.code === 0) {
>   setData(res.result.items);
> } else {
>   showToast(res.error || res.message || "Có lỗi xảy ra", "error");
> }
> ```

### 6.4. Pagination format

```ts
interface PaginatedResponse<T> {
  code: 0;
  result: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    loadMoreAble: boolean;  // Có còn page tiếp không
  };
}
```

> **Quy ước page bắt đầu từ 1**, không phải 0.

---

## 7. Mapping service → backend microservice (suy luận)

> 🟡 **Mức độ tự tin: Trung bình** — suy từ URL prefix trong `urlsApi`.

| Domain (Service) | Prefix | Microservice (suy luận) |
|------------------|--------|-------------------------|
| Customer, Contact | `/api` | Main API service |
| Invoice (sale), Shift, BoughtProduct, BoughtService, BoughtCard | `/bizapi/sales` | Sales Service |
| Cashbook, Fund, Debt, FinanceCategory, PaymentControl | `/bizapi/finance` | Finance Service |
| Material, NCC | `/bizapi/inventory` | Inventory Service |
| Warehouse, StockReceipt, StockIssue, InventoryChecking | `/bizapi/warehouse` | Warehouse Service |
| CustomerCare, CareHistory, Ticket | `/bizapi/care` + `/cs` | Care Service + CS Service |
| InvoiceVAT | `/bizapi/billing` | Billing Service |
| Shipping, Logistics | `/bizapi/logistics` | Logistics Service |
| Integration, Webhook | `/bizapi/integration` | Integration Service |
| Campaign, Promotion, MarketingAutomation | `/bizapi/market` | Marketing Service |
| Notification, AppNotification | `/bizapi/notification` | Notification Service |
| Auth, OAuth, RefreshToken | `/authenticator` | Auth Service (SSO) |
| BPM, BusinessProcess, Form | `/bpmapi` (external) | BPM Service (Camunda) |
| User, Role, Permission, Department | `/api` (đoán) hoặc `/bizapi/hr` | HR Service |
| ApplicationService, Extension | `/application` | Application Marketplace |
| File upload | external `process.env.APP_UPLOAD_URL` | Upload Service |
| Analytics | external `process.env.APP_ATHENA_URL` | Athena Analytics |

---

## 8. Sequence — Cuộc gọi API tiêu biểu

### 8.1. GET danh sách khách

![Sequence — Frontend gọi GET /api/customer/filter](./diagrams/12-sequence-customer-filter.png)

### 8.2. POST tạo đơn (POS)

```
Page CounterSales      Service Invoice    apiHelper       Interceptor      Backend Sales
      │                       │              │                │                │
      │ create(body)          │              │                │                │
      ├──────────────────────►│              │                │                │
      │                       │ apiPost(url, body)            │                │
      │                       ├─────────────►│                │                │
      │                       │              │ fetch(url)     │                │
      │                       │              ├───────────────►│                │
      │                       │              │                │ + Auth header  │
      │                       │              │                │ + Selectedrole │
      │                       │              │                │ + Hostname     │
      │                       │              │                │ + URL rewrite  │
      │                       │              │                ├───────────────►│
      │                       │              │                │                │ Validate
      │                       │              │                │                │ Save DB
      │                       │              │                │                │ Trừ kho
      │                       │              │                │                │ Sinh phiếu thu
      │                       │              │                │ {code:0, result}
      │                       │              │                │◄───────────────┤
      │                       │              │ JSON parse     │                │
      │                       │              │◄───────────────┤                │
      │                       │ Promise<res> │                │                │
      │                       │◄─────────────┤                │                │
      │ res.code === 0?       │              │                │                │
      │ setInvoiceId(...)     │              │                │                │
      │ openReceiptModal()    │              │                │                │
```

---

## 9. Error handling chuẩn

### 9.1. Network error

```ts
try {
  const res = await CustomerService.filter(params);
  // ...
} catch (e) {
  // Network error, không có response
  showToast("Lỗi kết nối mạng. Vui lòng thử lại.", "error");
}
```

### 9.2. Business error (code !== 0)

```ts
const res = await CustomerService.update(body);
if (res.code === 0) {
  showToast("Cập nhật thành công", "success");
} else if (res.code === 400) {
  showToast(res.error || res.message || "Dữ liệu không hợp lệ", "error");
} else {
  showToast("Có lỗi xảy ra. Vui lòng thử lại sau.", "error");
}
```

### 9.3. Auth error (401)

Tự động xử lý ở interceptor — không cần code ở page. User sẽ được redirect về login ở next render.

### 9.4. Permission error (403)

```ts
if (res.code === 400 && res.message?.includes("không có quyền")) {
  showToast("Bạn không có quyền thực hiện thao tác này", "error");
}
```

> ⚠️ **Anti-pattern:** Một số service đang check 403 bằng `code === 400` + parse message. Nên có code error rõ ràng (vd `code === 403`) thay vì parse text.

---

## 10. Public API (cho 3rd party tích hợp)

> ⚠️ **Mức độ tự tin: Trung bình** — không có public API documentation chính thức trong repo.

Frontend dùng các URL chứa `/public/` để gọi API không cần auth (vd public lookup, share link). Backend có thể có **public API surface** cho 3rd party tích hợp:

- **Endpoint pattern:** `/public/api/v1/...`
- **Auth:** API Key header thay vì Bearer token
- **Rate limit:** chặt hơn endpoint nội bộ
- **Versioning:** trong URL path

> Đề xuất: Tách riêng OpenAPI spec cho public API và publish thành portal (Swagger UI / Redoc) cho đối tác tích hợp.

---

## 11. API versioning strategy

> ⚠️ **Quan sát:** Frontend dùng URL không có version (vd `/api/customer/filter`, không phải `/api/v1/customer/filter`). Đây là **single-version implicit**.

**Hậu quả:**
- Backend đổi response format → break frontend ngay
- Không có gradual rollout

**Đề xuất:**
- Áp dụng URL versioning: `/api/v1/...`, `/api/v2/...`
- Khi đổi shape, deprecate v1 dần
- Frontend dùng env var để switch version

Xem [ADR-15](part-13-adr.md#adr-15--api-versioning).

---

## 12. Best practice service layer

| Quy tắc | Lý do |
|---------|-------|
| **Page không gọi `fetch()` trực tiếp** | Tránh duplicate logic + bypass interceptor |
| **Service không hardcode URL** | Đổi backend dễ, dùng `urlsApi` |
| **Không transform response trong service** | Service "trong suốt", page tự xử lý |
| **Cancellable cho list call** | Tránh race condition khi user gõ search nhanh |
| **Error message bằng tiếng Việt** từ backend | UX nhất quán |
| **Tránh gọi service trong useEffect không dependency** | Vô hạn loop |
| **Wrap service trong custom hook** nếu dùng > 2 nơi | Tái dụng |

---

*Hết Part 06.*

---

# Part 07 — Data Architecture

## Executive Summary

Mô hình dữ liệu Reborn CRM là **multi-tenant với row-level isolation** — mọi entity có cột `tenantId` + `branchId`. Cấu trúc đa tầng phân cấp: `Tenant → Branch → (Shift, Customer, Invoice, Warehouse, ...)`. Áp dụng **soft delete** cho hầu hết entity nghiệp vụ. **Audit trail** ghi mọi thay đổi quan trọng. Dữ liệu chính lưu **PostgreSQL** (suy luận), file/ảnh lưu **S3-compatible**, cache + queue dùng **Redis**.

---

## 1. Mô hình ERD chi tiết

> Tái sử dụng ERD đã làm cho URD Part 14, mở rộng thêm các entity quan trọng.

![Entity-Relationship Diagram — Mô hình dữ liệu cốt lõi](../urd/diagrams/15-erd.png)

### 1.1. Phân nhóm entity

| Nhóm | Entity chính | Phân hệ |
|------|-------------|---------|
| **Tenancy & Org** | Tenant, Branch, Department, Role, Permission, User | Identity & Org |
| **Customer** | Customer, CustomerExtraInfo, Card, LoyaltyWallet, CheckinLog, CustomerSource, CustomerGroup | CRM Core |
| **Catalog** | Category, Product, ProductVariant, MembershipPlan, PlanService, Combo | Catalog |
| **Sales** | Invoice, InvoiceItem, BoughtProduct, BoughtService, BoughtCard, ReturnInvoice, Shift, ShiftConfig, OrderRequest | Sales |
| **Inventory** | Material, Supplier, Warehouse, StockReceipt, StockIssue, InventoryChecking, AdjustmentSlip, DestroySlip | Warehouse |
| **Finance** | Cashbook, Fund, FinanceCategory, DebtCustomer, DebtSupplier, PaymentControl | Finance |
| **Marketing** | Promotion, Voucher, Campaign, CampaignDelivery, MarketingAutomation, Coupon | Marketing |
| **Care & Support** | Feedback, Ticket, CareTask, CareHistory, Note | Care |
| **Workflow** | BusinessProcess, BpmForm, FormArtifact, ProcessInstance | BPM |
| **Integration** | Webhook, IntegrationConfig, ExternalToken | Integration |

### 1.2. Số lượng entity ước tính

- **Tổng**: ~120-150 entity (suy từ `model/` directory + service file count)
- **Top 10 entity quan trọng nhất**: Customer, Invoice, Product, Shift, Material, Cashbook, MembershipPlan, Promotion, User, Branch

---

## 2. Multi-tenant strategy

### 2.1. Lựa chọn mô hình

Có 4 mô hình multi-tenant phổ biến:

| Mô hình | Mô tả | Ưu | Nhược |
|---------|-------|----|-------|
| **Database per tenant** | Mỗi tenant 1 DB riêng | Cô lập tuyệt đối, scale dễ | Tốn tài nguyên, phức tạp ops |
| **Schema per tenant** | Mỗi tenant 1 schema trong cùng DB | Cô lập tốt, chia sẻ tài nguyên | Số schema giới hạn |
| **Row-level (shared schema)** | Mọi tenant chung table, phân biệt qua `tenantId` | Đơn giản, scale tốt | Dễ leak nếu code lỗi |
| **Hybrid** | Tenant lớn dùng DB riêng, tenant nhỏ shared | Linh hoạt | Ops phức tạp |

> 🟡 **Suy luận:** Reborn CRM dùng **Row-level isolation** vì:
>
> - Mọi response/request đều có `branchId`/`tenantId`
> - Header `Hostname` để định danh tenant ở mức request
> - Có hàng nghìn tenant → nếu mỗi tenant 1 DB sẽ không scale

### 2.2. Cơ chế cô lập

```sql
-- Mọi query phải có WHERE tenant_id = :current_tenant_id
SELECT * FROM customer 
WHERE tenant_id = $1 
  AND branch_id = $2 
  AND deleted_at IS NULL;
```

> ⚠️ **Critical risk:** Nếu **một query nào đó** quên `WHERE tenant_id`, tenant A có thể đọc data tenant B. Đây là **lỗi bảo mật nghiêm trọng**. Backend phải có middleware/ORM-level enforcement.

### 2.3. Đề xuất chống leak

| Pattern | Mô tả |
|---------|-------|
| **Row Level Security (RLS)** | PostgreSQL native — mỗi connection set `SET app.current_tenant = ...`, query tự inject WHERE |
| **ORM scope global** | Override default scope của ORM (vd Sequelize `defaultScope`, Hibernate `@Filter`) |
| **Code review checklist** | Mọi query mới phải có review tenant_id |
| **Test tenant isolation** | E2E test với 2 tenant, đảm bảo không thấy data của nhau |

---

## 3. Soft delete

### 3.1. Áp dụng cho

Hầu hết entity nghiệp vụ:

- Customer
- Invoice (CN-03: đơn đã thanh toán không thể xóa)
- Product, Material
- User (nghỉ việc → status="inactive" thay vì xóa)
- Promotion (kết thúc → status="finished")

### 3.2. Schema chuẩn

```sql
CREATE TABLE customer (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     BIGINT NOT NULL,
  branch_id     BIGINT NOT NULL,
  -- ... business columns
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by    BIGINT,
  updated_at    TIMESTAMPTZ,
  updated_by    BIGINT,
  deleted_at    TIMESTAMPTZ,                  -- soft delete
  deleted_by    BIGINT
);

CREATE INDEX idx_customer_tenant_branch ON customer (tenant_id, branch_id) WHERE deleted_at IS NULL;
```

### 3.3. Hard delete áp dụng cho

- Notification > 90 ngày
- Session log > 6 tháng
- Audit log > 5 năm (theo retention)
- Temp file upload chưa attach vào entity

---

## 4. Audit trail

### 4.1. Audit log table

```sql
CREATE TABLE audit_log (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     BIGINT NOT NULL,
  user_id       BIGINT NOT NULL,
  action        VARCHAR(50) NOT NULL,    -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, CANCEL, REFUND
  entity_type   VARCHAR(50) NOT NULL,    -- 'customer', 'invoice', 'shift', ...
  entity_id     BIGINT,
  before_data   JSONB,                    -- snapshot trước
  after_data    JSONB,                    -- snapshot sau
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant_entity ON audit_log (tenant_id, entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log (user_id, created_at DESC);
```

### 4.2. Action cần audit

Theo URD NFR-SEC-04:

- Đăng nhập / đăng xuất
- Đổi mật khẩu / quyền
- Tạo / sửa / xóa khách / nhân viên
- Thanh toán / hoàn / hủy đơn
- Phát hành / hủy hóa đơn VAT
- Mở / đóng ca
- Đối soát thanh toán
- Điều chỉnh điểm thủ công

### 4.3. Retention

- **Audit log**: ≥ 2 năm (theo NFR-LEGAL-02)
- **Đặc biệt**: log liên quan tài chính giữ ≥ 5 năm

---

## 5. Indexing strategy

### 5.1. Tenant + Branch index

Mọi entity nghiệp vụ nên có composite index:

```sql
CREATE INDEX idx_<table>_tenant_branch ON <table> (tenant_id, branch_id);
```

### 5.2. Soft delete partial index

```sql
CREATE INDEX idx_customer_tenant_branch_active 
  ON customer (tenant_id, branch_id) 
  WHERE deleted_at IS NULL;
```

> Partial index nhỏ hơn (chỉ cover row chưa xóa), query fast hơn.

### 5.3. Search field

```sql
-- Full-text search cho tên khách
CREATE INDEX idx_customer_name_trgm 
  ON customer USING gin (lower(name) gin_trgm_ops);

-- Hoặc cho phone
CREATE UNIQUE INDEX idx_customer_phone_branch 
  ON customer (tenant_id, branch_id, phone) 
  WHERE deleted_at IS NULL;
```

### 5.4. Foreign key indexes

PostgreSQL **không tự** index FK → phải tạo manual:

```sql
CREATE INDEX idx_invoice_customer ON invoice (customer_id);
CREATE INDEX idx_invoice_shift ON invoice (shift_id);
```

---

## 6. Storage tiers

### 6.1. Hot storage — PostgreSQL chính

- Toàn bộ dữ liệu nghiệp vụ
- Index đầy đủ
- Read replica cho query report (không hit master)

### 6.2. Cold storage — Object storage (S3)

- Ảnh upload (avatar khách, ảnh sản phẩm, ảnh chứng từ)
- File CMND/CCCD scan (cho lưu trú)
- Excel xuất ra
- Backup PostgreSQL dạng dump
- Log archive

### 6.3. Cache layer — Redis

- Session data
- Permission cache (lookup quyền)
- Filter dropdown options (categories, sources...)
- Rate limit counter
- Queue cho background job

### 6.4. Search index — Elasticsearch (đề xuất)

> 🔴 **Suy luận** — không quan sát được trong codebase, nhưng với 100k+ khách/tenant lớn cần full-text search nhanh, ES là lựa chọn phổ biến.

- Full-text search khách hàng
- Search sản phẩm theo nhiều field
- Aggregation cho báo cáo

---

## 7. Data flow chính

### 7.1. Sơ đồ data flow — Bán hàng

![Data Flow — Quá trình tạo đơn POS chạm vào nhiều entity](./diagrams/13-data-flow-pos.png)

### 7.2. Các transaction quan trọng

#### Tạo đơn POS

Đây là **transaction phức tạp nhất** vì chạm nhiều entity:

```
BEGIN;
  -- 1. Insert invoice header
  INSERT INTO invoice (...) RETURNING id;
  
  -- 2. Insert invoice items
  INSERT INTO invoice_item (invoice_id, ...) VALUES ...;
  
  -- 3. Trừ tồn kho cho từng sản phẩm
  UPDATE warehouse_stock 
    SET quantity = quantity - :qty 
    WHERE product_id = :pid AND warehouse_id = :wid;
  
  -- 4. Sinh phiếu xuất kho
  INSERT INTO stock_issue (...);
  
  -- 5. Sinh phiếu thu trong sổ thu chi
  INSERT INTO cashbook (type, amount, ...) VALUES ('INCOME', :total, ...);
  
  -- 6. Cộng điểm tích lũy cho khách (nếu có)
  UPDATE loyalty_wallet 
    SET points = points + :earnedPoints 
    WHERE customer_id = :cid;
  
  -- 7. Ghi log
  INSERT INTO audit_log (...) VALUES (...);
  
  -- 8. Cập nhật ca làm việc
  UPDATE shift 
    SET total_revenue = total_revenue + :total 
    WHERE id = :shiftId;
COMMIT;
```

> ⚠️ Đây là 8 thao tác trong 1 transaction. Cần **timeout phù hợp** và **isolation level** cẩn thận để tránh lock contention khi đông khách.

#### Đóng ca

```
BEGIN;
  UPDATE shift 
    SET status = 'closed', closing_cash = :cash, closed_at = NOW() 
    WHERE id = :shiftId;
  
  INSERT INTO shift_report (shift_id, ...) VALUES (...);
  
  INSERT INTO audit_log (...);
COMMIT;
```

---

## 8. Backup & Disaster Recovery

### 8.1. Backup strategy

> 🔴 **Đề xuất** — chi tiết ở [Part 12](part-12-deployment.md).

| Loại | Tần suất | Lưu giữ |
|------|---------|---------|
| **Full backup** | Hằng đêm 02:00 | 30 bản gần nhất |
| **Incremental** | Mỗi giờ | 7 ngày |
| **WAL archive** | Continuous | 30 ngày |
| **Snapshot S3** | Hằng tuần | 12 tuần |
| **Off-site copy** | Hằng tuần | 1 năm |

### 8.2. RTO / RPO

- **RTO** (Recovery Time Objective): ≤ 4 giờ
- **RPO** (Recovery Point Objective): ≤ 1 giờ

### 8.3. Test restore

- **Hằng tháng**: restore staging từ backup mới nhất, verify integrity
- **Hằng quý**: full DR drill với failover sang region phụ

---

## 9. Data retention

| Loại data | Thời gian giữ | Lý do |
|-----------|---------------|-------|
| **Customer master** | Vĩnh viễn (soft delete) | Audit + analytics |
| **Invoice + items** | Vĩnh viễn | Pháp luật + audit |
| **Cashbook** | Vĩnh viễn | Pháp luật |
| **Audit log** | ≥ 2 năm | NFR-SEC-04 |
| **Audit log tài chính** | ≥ 5 năm | TT78 e-invoice |
| **CMND/CCCD lưu trú** | ≥ 5 năm | TT06/2017 |
| **Notification** | 90 ngày, archive sau | UX |
| **Session log** | 6 tháng | Debug |
| **Tempfile upload** | 24 giờ chưa attach → xóa | Cleanup |

---

## 10. Mã hóa dữ liệu

### 10.1. At rest

- **DB column-level**: API key, secret key, refresh token (AES-256)
- **DB whole**: PostgreSQL có thể bật transparent disk encryption (TDE)
- **S3**: Server-side encryption (SSE-S3 hoặc SSE-KMS)
- **Backup file**: encrypt trước khi đưa lên S3

### 10.2. In transit

- **Client ↔ API**: TLS 1.2+
- **API ↔ DB**: TLS bắt buộc trong production
- **API ↔ external (payment, e-invoice)**: TLS + (nếu có) VPN/IPsec

### 10.3. Hashing

- **Password**: bcrypt (cost factor ≥ 10)
- **Webhook signature**: HMAC-SHA256
- **Idempotency key**: SHA-256 của payload + timestamp

---

## 11. Migration & Schema versioning

> 🔴 **Mức độ tự tin: Thấp** — không thấy folder migration trong frontend repo.

Đề xuất:

- **Tool**: Liquibase / Flyway / alembic / Prisma migrate
- **File migration** trong backend repo: `migrations/V001__init.sql`, `V002__add_customer_extra.sql`, ...
- **Mỗi migration** chỉ thực hiện 1 thay đổi
- **Up + Down**: rollback được
- **Schema version table**: lưu version hiện tại
- **Áp dụng ở pipeline CD**: tự run migration trước khi deploy

---

## 12. Reporting database (đề xuất)

Với báo cáo phức tạp hằng ngày (top dịch vụ, MRR, retention...), việc query trên DB transactional có thể chậm. Đề xuất:

- **Read replica chuyên cho báo cáo** — không lock master
- **Hoặc OLAP DB riêng** (ClickHouse / BigQuery) sync từ master mỗi giờ qua CDC
- **Hoặc materialized view** refresh định kỳ

> Hiện tại frontend gọi vào `/bizapi/sales` cho cả OLTP và OLAP — cần verify backend phân biệt được.

---

*Hết Part 07.*

---

# Part 08 — Backend Architecture (suy luận)

> ⚠️ **Mức độ tự tin: THẤP** — Toàn bộ Part này là **suy luận** dựa trên:
> - URL prefix trong [`src/configs/urls.ts`](../../src/configs/urls.ts)
> - Pattern HTTP request/response qua [`src/configs/fetchConfig.ts`](../../src/configs/fetchConfig.ts)
> - Naming convention của 240 service files
> - Best practice cho stack tương đương
>
> **Đội backend cần xác nhận hoặc cập nhật từng mục.** Có những phần đoán hoàn toàn (vd ngôn ngữ backend, database engine, message queue) — đánh dấu rõ.

## Executive Summary

Backend của Reborn CRM được suy luận là **kiến trúc microservices** với ~14 bounded context, mỗi context là 1 service riêng. Frontend giao tiếp qua **API gateway pattern** (URL prefix routing, có thể implement client-side hoặc server-side). Auth tập trung qua **SSO Reborn**. Multi-tenant qua **header `Hostname` + cột `tenantId`**. Các microservice giao tiếp với nhau qua **HTTP REST hoặc message queue** (đoán). Có một **BPM engine** (Camunda?) deploy riêng cho workflow.

---

## 1. Bằng chứng từ codebase

### 1.1. URL prefix → suy ra service

```ts
// configs/urls.ts
const prefixApi = "/api";                    // → API service chính
const prefixAdmin = "/adminapi";              // → Admin service
const prefixBiz = "/bizapi";                  // → Business gateway
const prefixSales = prefixBiz + "/sales";     // → Sales service
const prefixFinance = prefixBiz + "/finance"; // → Finance service
const prefixInventory = prefixBiz + "/inventory";
const prefixWarehouse = prefixBiz + "/warehouse";
const prefixCare = prefixBiz + "/care";
const prefixBilling = prefixBiz + "/billing";
const prefixLogistics = prefixBiz + "/logistics";
const prefixIntegration = prefixBiz + "/integration";
const prefixMarket = prefixBiz + "/market";
const prefixNotification = prefixBiz + "/notification";
const prefixCs = "/cs";                       // → Customer service
const prefixHr = "/hr";                       // → HR service
const prefixSystem = "/system";               // → System service
const prefixApplication = "/application";     // → App marketplace
const prefixBpm = process.env.APP_BPM_URL + "/bpmapi";  // → BPM (external host)
const prefixAuthenticator = "/authenticator"; // → Auth/SSO
```

→ **Suy ra ít nhất 14 service riêng biệt**.

### 1.2. Header gửi từ client

```ts
config.headers["Authorization"] = `Bearer <token>`;
config.headers["Selectedrole"] = <selectedRole>;
config.headers["Hostname"] = "kcn.reborn.vn";
```

→ Backend phải:
- Validate JWT
- Đọc `Selectedrole` để áp quyền
- Đọc `Hostname` để biết tenant nào

### 1.3. Response format

```json
{ "code": 0, "result": {...}, "message": "OK" }
```

→ Quy ước response chuẩn cho mọi service (likely shared library hoặc API gateway transform).

---

## 2. Sơ đồ kiến trúc backend (đề xuất)

![Backend Architecture — Microservices + API Gateway + Shared infra](./diagrams/14-backend-architecture.png)

---

## 3. Bounded contexts (microservices)

> 🟡 **Suy luận** — mỗi bounded context có thể là 1 service hoặc gộp vài context vào 1 service tùy quy mô đội.

### 3.1. Auth Service (`/authenticator`)

| Trách nhiệm | Endpoint điển hình |
|------------|-------------------|
| OAuth/OIDC flow | `/oauth/authorize`, `/oauth/token`, `/oauth/userinfo` |
| Refresh token | `/oauth/refresh` |
| Logout | `/oauth/logout` |
| Password reset | `/auth/forgot-password`, `/auth/reset-password` |
| 2FA | `/auth/2fa/enable`, `/auth/2fa/verify` |
| User session management | `/auth/sessions` |

**Đặc điểm:**
- Stateless với JWT
- Có refresh token rotation
- Kết nối với database User
- Có thể là OpenID Connect provider

### 3.2. Main API Service (`/api`)

| Trách nhiệm |
|------------|
| Customer CRUD |
| Contact CRUD |
| User management |
| Department / Role / Permission |
| Tenant config |
| Generic catalog |

**Đoán:** Có thể là **API gateway + thin business logic** routes vào các service nhỏ hơn, hoặc là **service core** chứa shared concerns.

### 3.3. Sales Service (`/bizapi/sales`)

| Trách nhiệm | Endpoint |
|------------|----------|
| POS invoice CRUD | `invoice/create`, `invoice/filter`, `invoice/cancel`, `invoice/refund` |
| Shift management | `shift/open`, `shift/close`, `shift/current` |
| Bought items (product/service/card) | `boughtProduct/*`, `boughtService/*`, `boughtCard/*` |
| Order tracking | `order/list`, `order/tracking` |
| Sales report | `report/revenue`, `report/topProducts` |

### 3.4. Finance Service (`/bizapi/finance`)

| Trách nhiệm |
|------------|
| Cashbook (sổ thu chi) |
| Fund management |
| Finance category |
| Debt management (cả phải thu + phải trả) |
| Payment control / reconciliation |
| Internal transfer giữa quỹ |

### 3.5. Inventory Service (`/bizapi/inventory`)

| Trách nhiệm |
|------------|
| Material catalog (CRUD NVL) |
| Supplier catalog |
| Stock balance per warehouse |

### 3.6. Warehouse Service (`/bizapi/warehouse`)

| Trách nhiệm |
|------------|
| Warehouse master |
| Stock receipt (phiếu nhập) |
| Stock issue (phiếu xuất) |
| Stock transfer giữa kho |
| Inventory checking (kiểm kê) |
| Adjustment slip |
| Destroy slip |
| Warehouse report |

### 3.7. Care Service (`/bizapi/care`)

| Trách nhiệm |
|------------|
| Customer Care task |
| Care history log |
| Loyalty wallet (ví điểm) |
| Card service (thẻ thành viên) |
| Membership plan + quota tracking |
| Check-in log |

### 3.8. Billing Service (`/bizapi/billing`)

| Trách nhiệm |
|------------|
| E-invoice issuing |
| Tích hợp với CA + nhà cung cấp e-invoice (Viettel, VNPT, Misa) |
| Lookup hóa đơn đã phát hành |
| Cancel hóa đơn |

### 3.9. Logistics Service (`/bizapi/logistics`)

| Trách nhiệm |
|------------|
| Tích hợp shipping carriers (GHN, GHTK, J&T, Viettel Post, ShopeeExpress) |
| Tạo đơn giao |
| Track trạng thái |
| Webhook callback từ carriers |

### 3.10. Integration Service (`/bizapi/integration`)

| Trách nhiệm |
|------------|
| Tích hợp 3rd party generic |
| Webhook outbound dispatcher |
| External API credentials vault |
| Monitoring tích hợp |

### 3.11. Market Service (`/bizapi/market`)

| Trách nhiệm |
|------------|
| Promotion / Voucher |
| Marketing campaign (SMS / Email / Zalo / Push) |
| Marketing automation rules |
| Coupon |
| Lead management |

### 3.12. Notification Service (`/bizapi/notification`)

| Trách nhiệm |
|------------|
| In-app notification |
| Push notification (Firebase) |
| Email transactional |
| SMS transactional |

### 3.13. Customer Service (CS) Service (`/cs`)

| Trách nhiệm |
|------------|
| Ticket management |
| Feedback intake |
| SLA tracking |

### 3.14. BPM Service (`/bpmapi` — external)

| Trách nhiệm |
|------------|
| Camunda BPMN engine |
| Process instance management |
| Form rendering |
| Task assignment |
| Workflow execution |

> Đây là **service riêng biệt host trên domain khác** (`process.env.APP_BPM_URL`). Frontend gọi trực tiếp vào BPM API thay vì proxy qua main API.

### 3.15. HR Service (`/hr`)

| Trách nhiệm |
|------------|
| Employee profile |
| Department |
| Shift schedule |
| Attendance / timekeeping |

### 3.16. Application Marketplace (`/application`)

| Trách nhiệm |
|------------|
| Danh sách app/extension có thể cài |
| Cài / gỡ extension cho tenant |
| Permission cho extension |

---

## 4. Tech stack backend (suy luận)

### 4.1. Đoán ngôn ngữ + framework

> 🔴 **Hoàn toàn đoán** — không có evidence cứng.

Khả năng cao:

| Khả năng | Đặc điểm gợi ý |
|----------|---------------|
| **Java + Spring Boot** | Camunda BPM (`/bpmapi`) thường đi với Java; pattern endpoint `/api/customer/filter` rất Java-style |
| **Node.js + Express/NestJS** | Cũng phổ biến cho microservices; phù hợp với ecosystem JS Reborn |
| **Hybrid** | BPM service Java, các service khác Node.js |

**Cách verify**: hỏi đội backend hoặc xem header `Server` của response.

### 4.2. Database

> 🔴 **Đoán**

- **PostgreSQL** rất khả năng (open-source, mature, support JSON, RLS)
- Hoặc **MySQL/MariaDB**
- Mỗi microservice **có thể có DB riêng** (database-per-service pattern), hoặc **shared DB** với schema riêng

### 4.3. Cache + Queue

> 🔴 **Đoán**

- **Redis**: cache + queue
- **RabbitMQ** hoặc **Kafka**: message broker giữa các service (nếu có async pattern)
- **Bull/BullMQ**: nếu Node.js

### 4.4. Search

> 🔴 **Đoán**

- **Elasticsearch** cho full-text search khách hàng / sản phẩm
- Hoặc **PostgreSQL full-text search** (`tsvector`) nếu chưa cần ES

### 4.5. File storage

- **S3-compatible** (AWS S3 / DigitalOcean Spaces / MinIO)
- Có thể có **CDN** trước (CloudFlare / CloudFront)
- Service `process.env.APP_UPLOAD_URL` riêng cho file upload

---

## 5. Communication patterns giữa các service

### 5.1. Sync REST (HTTP)

Phổ biến nhất. Mỗi service expose REST API, các service khác gọi qua HTTP:

```
Sales Service → calls → Inventory Service (kiểm tra tồn trước khi tạo đơn)
Sales Service → calls → Care Service (cộng điểm khách)
Sales Service → calls → Finance Service (sinh phiếu thu)
```

### 5.2. Async event/message

> 🔴 **Đoán**

Cho các luồng không cần response ngay:

- **Webhook outbound**: tạo invoice xong → emit `invoice.created` → service Integration push tới webhook đăng ký
- **Marketing campaign**: queue gửi 10000 SMS — Marketing service đẩy job vào queue → Worker xử lý
- **Notification**: send email không block business logic → push vào queue → Notification worker

### 5.3. Synchronous chained calls

⚠️ **Risk**: nếu Sales gọi Inventory, Inventory gọi Catalog, Catalog gọi DB → chain 3 service. Lỗi 1 mắt xích → toàn bộ fail. Nên có:

- **Circuit breaker** (Hystrix / Resilience4j)
- **Retry với backoff**
- **Timeout** chặt
- **Fallback** khi service down

---

## 6. API Gateway pattern

### 6.1. Hai cách implement

#### Cách A — Client-side gateway (hiện tại)

```
Browser → Cloud A.com/api/... → Cloud A backend
       → Cloud B.com/bizapi/... → Cloud B backend (Sales)
       → Cloud C.com/bpmapi/... → Cloud C backend (BPM)
```

Frontend tự routing qua các URL khác nhau. Đơn giản nhưng:
- ❌ CORS phải config nhiều subdomain
- ❌ Browser phải open nhiều TCP connection
- ❌ Khó áp common policy (rate limit, logging)

#### Cách B — Server-side gateway

```
Browser → gateway.reborn.vn/api/...      ─┐
       → gateway.reborn.vn/bizapi/...     │   1 entry point
       → gateway.reborn.vn/bpmapi/...     ─┘
              │
              ▼
         [API Gateway: Kong/nginx/Traefik]
              │
              ├─→ Sales Service
              ├─→ Finance Service
              └─→ BPM Service
```

Frontend chỉ cần 1 host. Gateway xử lý:
- Authentication
- Rate limit
- Logging
- CORS
- SSL termination

### 6.2. Đề xuất: Migrate sang Cách B

Vì Reborn có hàng chục service, không scale với client-side. **Đề xuất** triển khai gateway centralize. Xem [ADR-06](part-13-adr.md#adr-06--client-side-api-gateway).

---

## 7. Authentication chi tiết

### 7.1. SSO flow (đoán OAuth 2.0 Authorization Code)

```
1. User → CRM frontend (hub.reborn.vn/crm/)
2. CRM phát hiện chưa login → redirect:
   sso.reborn.vn/oauth/authorize?
     client_id=crm
     redirect_uri=hub.reborn.vn/crm/login
     response_type=code
     state=<random>
3. User nhập email + password
4. SSO redirect về:
   hub.reborn.vn/crm/login?code=<authcode>&state=<random>
5. CRM gửi POST sso.reborn.vn/oauth/token với code
6. SSO trả về { access_token, refresh_token, expires_in }
7. CRM lưu access_token vào cookie `token`
8. CRM gọi GET sso.reborn.vn/oauth/userinfo với Bearer token
9. SSO trả về { id, name, email, roles, ... }
10. CRM redirect user vào Dashboard
```

### 7.2. Token refresh

Khi access_token hết hạn (401):
1. Frontend interceptor catch 401
2. Gọi POST `/oauth/refresh` với `refresh_token`
3. Nếu thành công → retry original request
4. Nếu thất bại → logout + redirect login

> ⚠️ Hiện tại interceptor chưa có logic refresh — chỉ logout. Đây là **UX gap** — user bị logout giữa chừng phải login lại.

---

## 8. Multi-tenant routing trong backend

Khi backend nhận request với header `Hostname: kcn.reborn.vn`:

```python
# pseudocode middleware
def tenant_middleware(request):
    hostname = request.headers["Hostname"]
    tenant = Tenant.query.filter_by(domain=hostname).first()
    if not tenant:
        return 404
    request.tenant_id = tenant.id
    # Set DB session to RLS context
    db.execute(f"SET app.current_tenant = {tenant.id}")
```

Sau đó mọi query trong request scope đều tự động filter theo `tenant_id`.

---

## 9. Background workers (đề xuất)

Service nào cần background worker?

| Service | Job worker |
|---------|-----------|
| **Marketing** | Gửi mass SMS/Email/Zalo (queue based) |
| **Notification** | Push notification batches |
| **Care** | Cron sinh task chăm sóc tự động (sinh nhật, sắp hết hạn gói) |
| **Sales** | Đối soát thanh toán end-of-day |
| **Finance** | Tính số dư cuối ngày, generate báo cáo |
| **Integration** | Webhook outbound dispatcher với retry |
| **Billing** | Retry phát hành VAT khi nhà cung cấp e-invoice down |

### 9.1. Pattern background job

```
Service API → push job to Redis queue (key: "queue:sms")
                         │
                         ▼
              [Worker pool subscribe queue]
                         │
                         ▼
                  Process job (call SMS gateway)
                         │
                         ▼
                  Update job status
                         │
                         ▼
                  If fail → exponential backoff → retry up to 5 times
                         │
                         ▼
                  If still fail → dead letter queue
```

---

## 10. Service discovery (đề xuất)

> 🔴 **Đoán**

Với nhiều microservice, cần cách để biết "Sales service đang chạy ở IP nào, port nào". Lựa chọn:

| Cách | Mô tả |
|------|-------|
| **DNS** | Mỗi service có domain `sales.internal.reborn.vn` |
| **Kubernetes service** | `sales-service.default.svc.cluster.local` |
| **Consul** | Service registry + health check |
| **Eureka** | Java-based service discovery |
| **Hardcode IP** | Trong env var (đơn giản nhưng không scale) |

---

## 11. Database per service vs shared DB

### 11.1. Database per service

- Mỗi microservice 1 DB riêng
- Pros: cô lập, scale độc lập, đổi schema không ảnh hưởng service khác
- Cons: cross-service join phải qua API, eventual consistency, distributed transaction phức tạp

### 11.2. Shared DB

- Mọi service connect cùng 1 DB (có thể schema riêng)
- Pros: query join dễ, transaction đơn giản
- Cons: coupling, scale chung, schema change ảnh hưởng nhiều service

### 11.3. Reborn dùng cách nào?

> 🔴 **Đoán** — không biết chắc.

Có thể là **shared DB với schema-per-service** hoặc **database per service** với một số shared "common" schema (vd User, Tenant).

---

## 12. Risks & gaps

| Risk | Mức | Mô tả |
|------|-----|-------|
| **Distributed transaction** | High | Tạo đơn POS chạm 8 entity ở nhiều service — rất khó đảm bảo ACID. Cần dùng **Saga pattern** |
| **Circular dependency** | Med | Sales gọi Inventory, Inventory gọi Catalog... có thể dẫn đến cycle nếu không kiểm soát |
| **Network latency** | Med | Mỗi cross-service call thêm ~50-200ms |
| **Cascading failure** | High | Service core (Auth, Customer) down → mọi service khác fail |
| **Data consistency** | High | Eventual consistency giữa các service — phải design cẩn thận |
| **Versioning** | Med | Backend đổi shape → frontend break — cần API versioning |
| **Monitoring complexity** | High | Trace 1 request qua nhiều service cần distributed tracing (Jaeger/Zipkin) |

---

## 13. Đề xuất cho đội backend xác nhận

Để Part này chính xác, đội backend trả lời:

1. **Số lượng service thực tế** là bao nhiêu? Service nào shared DB?
2. **Ngôn ngữ + framework** chính của mỗi service?
3. **Database engine** (PostgreSQL? MySQL?)
4. **Cache + queue** dùng gì?
5. **Service discovery** ra sao?
6. **API Gateway** hiện có chưa?
7. **Distributed tracing** đã setup?
8. **Saga pattern** đã áp dụng cho transaction phức tạp?
9. **Circuit breaker** đã có?
10. **Multi-tenant isolation** dùng RLS hay app-level filter?

Sau khi có câu trả lời → cập nhật Part 08 với mức tự tin 🟢.

---

*Hết Part 08.*

---

# Part 09 — Integration Architecture

## Executive Summary

Reborn CRM tích hợp với **10+ hệ thống bên ngoài**: SSO Reborn, payment gateway (VNPay/MoMo/ZaloPay/OnePay), e-invoice provider (Viettel/VNPT/Misa), shipping carrier (GHN/GHTK/J&T/Viettel Post), SMS gateway (Viettel/eSMS), email (SMTP/SendGrid), Zalo OA, Facebook Messenger, Microsoft (Outlook/Teams) qua MSAL, Firebase Cloud Messaging, BPM engine (Camunda). Hỗ trợ **webhook hai chiều** — inbound từ payment/shipping/e-invoice + outbound cho tenant tự đăng ký nhận event.

---

## 1. Sơ đồ tổng quan integration

![Integration Architecture — Reborn CRM với 10+ external systems](./diagrams/15-integration-overview.png)

---

## 2. Phân loại tích hợp

| Loại | Hướng | Ví dụ |
|------|-------|-------|
| **AuthN/AuthZ** | Inbound (SSO) | SSO Reborn (OAuth/OIDC) |
| **Payment** | Bi-directional | VNPay, MoMo, ZaloPay, OnePay |
| **Invoicing** | Outbound (call API) | Viettel E-invoice, VNPT eInvoice |
| **Logistics** | Bi-directional | GHN, GHTK, J&T, Viettel Post |
| **Messaging** | Outbound | SMS, Email, Zalo OA, Facebook Messenger |
| **Push notification** | Outbound | Firebase Cloud Messaging |
| **Communication (VoIP)** | Bi-directional | SIP gateway (jssip, sip.js) |
| **Productivity** | Outbound | Microsoft Outlook (qua MSAL), Google Calendar |
| **Workflow** | Internal external | BPM (Camunda) |
| **Webhook outbound** | Outbound | Tenant tự đăng ký URL |
| **Analytics** | Outbound | Athena (process.env.APP_ATHENA_URL) |

---

## 3. SSO (Identity & Access)

> Đã mô tả chi tiết ở [Part 08 §7](part-08-backend-architecture.md#7-authentication-chi-tiết). Tóm tắt sequence:

![Sequence — SSO OAuth Authorization Code flow](./diagrams/05-scenario-sso-login.png)

**Tóm lược:**
- Frontend redirect tới SSO khi chưa có token
- SSO trả `code` sau khi user login
- Frontend exchange `code` → `access_token`
- Token lưu trong cookie, dùng cho mọi request về sau
- 401 → clear cookie + redirect login

---

## 4. Payment Gateway

### 4.1. Sơ đồ flow tổng quan

![Sequence — Thanh toán qua cổng online (VNPay/MoMo/ZaloPay)](./diagrams/16-sequence-payment.png)

### 4.2. Pattern integration

#### Cách A — Redirect-based (truyền thống)

```
1. User bấm Thanh toán ở POS
2. Frontend → API: createPayment(orderId, amount, method)
3. API → Payment Gateway: createTransaction → trả paymentUrl
4. API → Frontend: redirect tới paymentUrl
5. User nhập thông tin thanh toán trên trang gateway
6. Gateway redirect ngược về Reborn (return URL) với status
7. Gateway gọi webhook IPN tới API → API verify chữ ký → update DB
```

#### Cách B — Inline (modal/iframe)

Một số gateway hỗ trợ inline qua SDK JS — embed vào trang Reborn không phải redirect.

#### Cách C — QR code

```
1. POS yêu cầu tạo QR
2. Backend gọi gateway → trả QR string
3. POS hiển thị QR
4. Khách quét bằng app → thanh toán
5. Gateway gọi webhook IPN → backend update
6. POS poll status → hiển thị "Đã thanh toán"
```

### 4.3. Webhook IPN handling

```
Payment Gateway → POST /webhook/payment/<gateway_name>
                  Headers: signature, timestamp
                  Body: { orderId, amount, status, ... }

Backend:
  1. Verify HMAC signature với secret
  2. Verify timestamp không quá cũ (replay attack)
  3. Lookup order trong DB
  4. Update status invoice + sinh phiếu thu trong cashbook
  5. Trả 200 (gateway sẽ retry nếu khác)
```

### 4.4. Ví dụ gateway hỗ trợ

| Gateway | Loại | API doc |
|---------|------|---------|
| **VNPay** | Bank gateway | sandbox.vnpayment.vn |
| **MoMo** | E-wallet | developers.momo.vn |
| **ZaloPay** | E-wallet | developers.zalopay.vn |
| **OnePay** | Bank gateway | onepay.vn |
| **Stripe** | International (cho tenant quốc tế) | stripe.com |

### 4.5. Reconciliation

Không phải lúc nào IPN cũng đến. Cần đối soát định kỳ:

- **Daily reconciliation job**: pull sao kê từ gateway → so với cashbook → flag mismatch
- **Manual reconciliation page**: [`/payment_control`](../../src/pages/PaymentControl/) — kế toán xử lý các dòng lệch

---

## 5. E-invoice (Hóa đơn điện tử VAT)

### 5.1. Sequence

> Đã có ở URD: [`urd/diagrams/14-sequence-vat.png`](../urd/diagrams/14-sequence-vat.png).

### 5.2. Nhà cung cấp

| Provider | Đặc điểm |
|----------|----------|
| **Viettel E-invoice** | Phổ biến, tích hợp REST API |
| **VNPT eInvoice** | Tích hợp Web Service (SOAP cũ) hoặc REST mới |
| **Misa meInvoice** | Tích hợp REST API, có sandbox |
| **EasyInvoice** | |

### 5.3. Yêu cầu tích hợp

1. **Chứng thư số CA** — file `.pfx` hoặc HSM
2. **API credentials** từ provider
3. **Mã số doanh nghiệp** đã đăng ký với cơ quan thuế
4. **Template hóa đơn** đã được duyệt

### 5.4. Lưu trữ chữ ký số

> 🔴 **Critical**: Chứng thư số là tài sản pháp lý — phải lưu trong **vault** (HashiCorp Vault, AWS KMS, hoặc HSM), KHÔNG phải file system thường.

### 5.5. Retry strategy

E-invoice provider có thể down. Backend cần:
- Lưu hóa đơn ở trạng thái "pending"
- Background job retry mỗi 5 phút × 12 lần
- Sau 1 giờ vẫn fail → thông báo admin

---

## 6. Shipping carriers

### 6.1. Carriers hỗ trợ

| Carrier | API |
|---------|-----|
| **GHN** (Giao Hàng Nhanh) | `api.ghn.vn` |
| **GHTK** (Giao Hàng Tiết Kiệm) | `services.giaohangtietkiem.vn` |
| **J&T Express** | API doc của J&T |
| **Viettel Post** | `partner.viettelpost.vn` |
| **ShopeeExpress** | API Shopee |
| **Ahamove** | `api.ahamove.com` (cho intra-city) |

### 6.2. Flow tạo đơn giao

```
1. POS thanh toán xong, khách chọn "Giao tận nơi"
2. Frontend → Logistics Service: createShipment(invoiceId, address, carrier)
3. Logistics → Carrier API: createOrder
4. Carrier trả về: trackingNumber, estimatedDeliveryDate, fee
5. Logistics lưu vào DB → trả về frontend
6. Frontend hiển thị mã vận đơn
```

### 6.3. Tracking via webhook

```
Carrier → POST /webhook/shipping/<carrier_name>
          Body: { trackingNumber, status, location, timestamp }

Backend:
  1. Verify signature
  2. Update shipment status
  3. (Optional) Gửi notification cho khách
```

### 6.4. Sync polling fallback

Nếu carrier không có webhook, backend phải poll status:

```
Cron job mỗi 30 phút:
  for each shipment with status != 'delivered':
    GET carrier.api/track/{trackingNumber}
    update local status
```

---

## 7. SMS Gateway

### 7.1. Providers

| Provider | Đặc điểm |
|----------|----------|
| **Viettel SMS Brand** | Phổ biến VN, có brandname |
| **VinaSMS** | Alternative |
| **eSMS.vn** | API REST đơn giản |
| **Twilio** | International |

### 7.2. Use cases

| Use case | Loại |
|----------|------|
| **OTP login** | Transactional |
| **Booking confirm** | Transactional |
| **Marketing campaign** | Marketing (cần đăng ký brandname) |
| **Nhắc gia hạn gói** | Reminder |
| **Xác minh check-in** | Transactional |

### 7.3. Pattern gửi

```
Marketing Service → push job vào queue:sms
                  │
                  ▼
              [SMS Worker]
                  │
                  ▼
            Get next batch (vd 100 SMS/phút theo throttle)
                  │
                  ▼
              For each SMS:
                Try gateway A → if fail → try gateway B (failover)
                  │
                  ▼
              Update delivery status
                  │
                  ▼
              Webhook callback từ gateway → update final status
```

### 7.4. Cost optimization

- **Tin tiếng Việt có dấu** = 70 ký tự → quá thì chia nhiều part = đắt hơn
- **Tin không dấu** = 160 ký tự
- Cần **template engine** giúp marketer biết tin sẽ chiếm bao nhiêu part

---

## 8. Email service

### 8.1. SMTP providers

| Provider | Đặc điểm |
|----------|----------|
| **Gmail SMTP** | Free 500 email/day, app password |
| **Office365 SMTP** | Doanh nghiệp |
| **SendGrid** | API + SMTP, tracking, template |
| **Mailgun** | Tương tự |
| **AWS SES** | Rẻ nhất cho volume lớn |

### 8.2. Use cases

- Hóa đơn điện tử
- Xác nhận đặt phòng
- Email marketing campaign
- Reset password
- Báo cáo định kỳ

### 8.3. Email template

> Frontend có folder `src/template/` — có thể chứa email HTML template. Backend cần template engine (Handlebars, Nunjucks, Jinja...) render với dữ liệu.

### 8.4. Bounce + complaint handling

- **Bounce**: email trả về (sai địa chỉ, mailbox full) → đánh dấu `email_invalid` trên customer
- **Complaint**: user mark spam → đánh dấu `email_unsubscribed` → không gửi marketing nữa

---

## 9. Zalo OA

### 9.1. API

Zalo Open API: `openapi.zalo.me`

### 9.2. Setup

1. Doanh nghiệp đăng ký Zalo Official Account
2. Cấp quyền cho ứng dụng Reborn qua OAuth Zalo
3. Lấy `access_token` (long-lived)
4. Cấu hình webhook URL trên Zalo Developer

### 9.3. Use cases

- Gửi tin nhắn cá nhân hóa cho khách đã follow OA
- Notification booking, đơn hàng
- Marketing campaign (theo policy Zalo — chỉ gửi cho follower)

### 9.4. Hạn chế

- Chỉ gửi được cho khách đã follow OA
- Có quota daily message
- Một số loại tin (vd promotion) cần Zalo duyệt template

---

## 10. Facebook Messenger

### 10.1. API

Facebook Graph API + Send API

### 10.2. Setup

1. Tạo Facebook App
2. Connect Fanpage với app
3. Lấy Page Access Token (long-lived)
4. Cấu hình webhook subscribe events: `messages`, `messaging_postbacks`, `messaging_optins`
5. Verify webhook với token tự đặt

### 10.3. Use cases

- Inbox từ Fanpage → hiển thị trong Reborn CRM
- Auto reply
- Bot conversation flow
- Đẩy notification (theo policy 24+1 giờ)

---

## 11. Firebase Cloud Messaging (FCM)

### 11.1. File config

- `src/firebase-config.ts`: client SDK setup
- `src/firebase-messaging-sw.js`: service worker nhận push background

### 11.2. Use case

- Push notification vào browser desktop khi có:
  - Đơn hàng mới
  - Thông báo hệ thống
  - Nhắc lịch
  - Chat message

### 11.3. Setup

1. Tạo Firebase project
2. Enable Cloud Messaging
3. Lấy `apiKey`, `authDomain`, `projectId`, `messagingSenderId`, `appId`
4. Frontend init Firebase + request permission
5. Đăng ký device token với backend
6. Backend dùng FCM Admin SDK để push

---

## 12. Microsoft Integration (Outlook, Teams)

### 12.1. Library

`@azure/msal-browser` + `@azure/msal-react`

### 12.2. Use cases

- Đăng nhập bằng Microsoft account
- Sync calendar Outlook (đặt lịch hẹn 2 chiều)
- Gửi email qua Outlook
- Collaboration trong Teams

### 12.3. Auth flow

OAuth 2.0 Authorization Code with PKCE.

---

## 13. Call Center / VoIP

### 13.1. Library

- `jssip` (SIP signaling)
- `sip.js` (alternative)

### 13.2. Use cases

- Click-to-call từ hồ sơ khách hàng
- Hiển thị popup khi có cuộc gọi đến (caller ID + match khách)
- Ghi âm cuộc gọi
- Auto log call vào CareHistory

### 13.3. Backend phụ thuộc

- **SIP Server** (FreeSWITCH, Asterisk, hoặc dịch vụ Viettel/FPT)
- **WebRTC gateway** để browser kết nối SIP
- **Recording storage** trên S3

---

## 14. BPM Engine (Camunda)

### 14.1. URL

`process.env.APP_BPM_URL` → service riêng biệt

### 14.2. Library frontend

- `bpmn-js` 17.x (BPMN diagram editor + viewer)
- `bpmn-js-properties-panel` 5.x
- `@bpmn-io/form-js` 1.x (form builder)
- `camunda-bpmn-moddle` 7.x

### 14.3. Pattern

```
Frontend (BPM page)
  ↓ REST
BPM Engine (Camunda)
  ↓ Internal API call
Reborn CRM Services
  - Sales (tạo đơn từ workflow)
  - Care (gán task chăm sóc)
  - Notification (gửi tin)
```

> Một workflow điển hình: *"Phê duyệt chiết khấu lớn"* — Sales user tạo đơn → BPM sinh task gán Manager → Manager duyệt → Sales user nhận thông báo → in hóa đơn.

---

## 15. Webhook outbound (cho tenant)

### 15.1. Mục đích

Tenant tự đăng ký URL nhận event từ CRM để tích hợp với app riêng (vd app khách hàng, dashboard tự build, công cụ kế toán).

### 15.2. Sequence

![Sequence — Webhook outbound dispatch + retry](./diagrams/17-sequence-webhook-outbound.png)

### 15.3. Implementation

```
Sales Service: tạo invoice xong
   │
   ▼
Emit event "invoice.created" with payload
   │
   ▼
Integration Service: subscribe events
   │
   ▼
Lookup webhook subscriptions for tenant
   │
   ▼
For each subscription:
   Push job to queue:webhook
   │
   ▼
[Webhook Worker]
   POST <url> with payload
   Header: X-Reborn-Signature: HMAC-SHA256(secret, body)
   Header: X-Reborn-Event: invoice.created
   Header: X-Reborn-Delivery: <uuid>
   │
   ▼
   if response.status in [200..299]:
       mark delivered
   else:
       retry with exponential backoff (1m, 5m, 30m, 2h, 12h)
       after 5 fails → mark failed → notify admin
```

### 15.4. Events publish

Theo URD IR-09:

- `customer.created`, `customer.updated`
- `invoice.created`, `invoice.paid`, `invoice.cancelled`, `invoice.refunded`
- `checkin.created`, `checkin.completed`
- `shift.opened`, `shift.closed`
- `member.tier_changed`
- `payment.received`

### 15.5. Security

- **HMAC signature** — tenant verify để chắc message từ Reborn
- **HTTPS only** — không cho HTTP
- **Replay protection** — header `X-Reborn-Timestamp`, tenant check delta
- **Rate limit** — không spam tenant

### 15.6. Monitoring

Trang `/integrated_monitoring` cho admin tenant:
- Số webhook đã gửi thành công / thất bại
- Log từng request
- Manual retry

---

## 16. Webhook inbound (từ external services)

CRM nhận webhook từ:

| Source | Endpoint pattern |
|--------|------------------|
| **VNPay IPN** | `/api/webhook/payment/vnpay` |
| **MoMo IPN** | `/api/webhook/payment/momo` |
| **ZaloPay** | `/api/webhook/payment/zalopay` |
| **GHN tracking** | `/api/webhook/shipping/ghn` |
| **GHTK tracking** | `/api/webhook/shipping/ghtk` |
| **Viettel E-invoice status** | `/api/webhook/billing/viettel` |
| **Zalo OA messages** | `/api/webhook/zalo` |
| **Facebook Page** | `/api/webhook/facebook` |
| **SMS delivery report** | `/api/webhook/sms/<provider>` |

### Common pattern

```python
def webhook_handler(request):
    # 1. Verify source
    if not verify_signature(request):
        return 401
    
    # 2. Parse payload
    payload = request.json
    
    # 3. Idempotency check (đã xử lý request này chưa)
    if redis.get(f"webhook:{payload['id']}"):
        return 200  # already processed
    
    # 4. Process (in transaction)
    process_event(payload)
    
    # 5. Mark processed
    redis.setex(f"webhook:{payload['id']}", 86400, "1")
    
    return 200
```

---

## 17. Integration testing strategy

### 17.1. Unit test

- Mock external API trong unit test (vd dùng `nock` cho Node.js, `WireMock` cho Java)

### 17.2. Integration test

- Provider có **sandbox environment** → test thật ở sandbox
- Verify webhook flow end-to-end

### 17.3. Contract testing

Sử dụng **Pact** hoặc **OpenAPI Schema validation** để đảm bảo:
- Provider không break consumer
- Consumer dùng đúng schema provider expose

### 17.4. Health check

Mỗi tích hợp có endpoint `/health/integration/<name>` ping provider để biết status. Hiển thị trên trang Monitoring.

---

## 18. Failure modes & mitigation

| Failure | Mitigation |
|---------|-----------|
| **Provider down** | Circuit breaker + queue retry + fallback provider |
| **Provider rate limit** | Throttle local, queue, batch requests |
| **Webhook signature invalid** | Reject 401 + alert |
| **Replay attack** | Idempotency key + timestamp window |
| **Slow response** | Timeout 30s + async processing |
| **Schema change** | Version pinning + monitoring schema diff |
| **Credentials leak** | Vault + rotation + audit log |
| **Cost overrun** (SMS/email) | Daily budget + alert khi vượt |

---

*Hết Part 09.*

---

# Part 10 — Security Architecture

## Executive Summary

Bảo mật Reborn CRM xây trên 6 trụ cột: **(1) Authentication** qua SSO Reborn (OAuth/OIDC); **(2) Authorization** RBAC theo cây quyền chi tiết với `Selectedrole` header; **(3) Multi-tenant isolation** qua header `Hostname` + cột `tenantId`/`branchId` mọi entity; **(4) Encryption** in-transit (TLS) + at-rest (AES-256 cho secret, bcrypt cho password); **(5) Audit trail** mọi thao tác nhạy cảm; **(6) OWASP defenses** chống XSS/CSRF/SQLi/SSRF. Có một số **gap đã quan sát được** cần fix sớm.

---

## 1. Threat model

### 1.1. Tài sản cần bảo vệ

| Asset | Sensitivity | Lý do |
|-------|-------------|-------|
| **Mật khẩu user** | Critical | Truy cập tài khoản |
| **Token phiên** | Critical | Bypass auth |
| **Credentials tích hợp** (API key payment, e-invoice) | Critical | Tài chính |
| **Chữ ký số CA** | Critical | Pháp lý + tài chính |
| **Dữ liệu khách hàng** (SĐT, email, CMND) | High | PII, tuân thủ NĐ 13 |
| **Dữ liệu giao dịch** (đơn, hóa đơn) | High | Pháp luật + audit |
| **Dữ liệu tài chính** (tiền, công nợ) | High | Trực tiếp tài chính |
| **Audit log** | High | Bằng chứng pháp lý |
| **Mã nguồn** | Med | Lộ logic + lỗ hổng |
| **Backup** | High | Phải mã hóa |

### 1.2. Đối tượng tấn công (threat actors)

| Actor | Động cơ | Khả năng |
|-------|---------|----------|
| **External attacker** | Tài chính (ransomware), reputation | Cao — nhiều tool tự động |
| **Disgruntled employee (nhân viên cũ)** | Trả thù, ăn cắp data | Medium — biết hệ thống |
| **Competitor** | Lấy data khách hàng | Medium |
| **Tenant A → Tenant B** | Đọc data tenant khác | Low (nếu RLS đúng), High (nếu lỗi) |
| **Insider (admin Reborn)** | Lạm dụng quyền | Medium — cần audit |

### 1.3. Threat scenarios chính

| Scenario | Nguy cơ | Đối phó hiện tại |
|----------|---------|------------------|
| Brute force đăng nhập | Đột nhập tài khoản | ⚠️ Chưa có rate limit explicit |
| SQL Injection | Đọc data tùy ý | ✓ ORM/parameterized query (giả định) |
| XSS qua input khách hàng | Chiếm session admin | ⚠️ Cần escape mọi user input render |
| CSRF | Thay mặt user thực hiện action | ✓ Bearer token (không dùng cookie session) |
| IDOR (Insecure Direct Object Reference) | Đọc/sửa entity của user khác | ⚠️ Cần check ownership ở mọi endpoint |
| Tenant leak | Đọc data tenant khác | ⚠️ Phụ thuộc backend implement RLS đúng |
| Stolen token | Dùng token người khác | Cookie HttpOnly + Secure + SameSite |
| Replay webhook | Gọi 2 lần action | Idempotency key |
| Credential leak (commit token vào git) | Lộ key | ✓ Env var + .gitignore + secret scan (đề xuất) |

---

## 2. Authentication

### 2.1. Cơ chế

> Đã mô tả ở [Part 08 §7](part-08-backend-architecture.md#7-authentication-chi-tiết).

Tóm tắt: **OAuth 2.0 Authorization Code** qua SSO Reborn, frontend lưu access_token trong cookie, gửi mỗi request qua header `Authorization: Bearer`.

### 2.2. Mật khẩu

- **Lưu trữ**: bcrypt hash (cost factor ≥ 10)
- **Validation**: ≥ 8 ký tự, có hoa + thường + số (URD NFR-SEC-02)
- **History**: không trùng 5 mật khẩu gần nhất
- **Lockout**: sai 5 lần → khóa 15 phút (URD NFR-SEC-03)

### 2.3. 2FA (Two-Factor Authentication)

- **Optional cho user thường**, **bắt buộc cho admin tenant** (đề xuất)
- **TOTP** qua Google Authenticator / Authy
- **Backup codes** 10 mã

### 2.4. Token lifecycle

| Token | Lifetime | Rotation |
|-------|----------|----------|
| **Access token** | 1 giờ | Mỗi lần refresh |
| **Refresh token** | 30 ngày (Ghi nhớ) hoặc 7 ngày | Rotate khi dùng |
| **Session cookie** | Cùng access token | — |

> ⚠️ **Quan sát**: Frontend interceptor hiện tại **chưa có refresh token logic**. Khi access token hết hạn → 401 → logout. Cần thêm refresh logic.

### 2.5. Logout

- Xóa cookie `token`, `user`
- Clear `localStorage`: `permissions`, `user.root`, `SelectedRole`
- (Tốt hơn) Gọi API `/oauth/logout` để invalidate token ở server

---

## 3. Authorization (RBAC)

### 3.1. Mô hình

```
User
  └─ Has many → Role
                  └─ Has many → Permission

Permission là chuỗi định danh: 'CUSTOMER', 'INVOICE.CREATE', 'SHIFT.OPEN', ...
```

### 3.2. Cây quyền (suy luận từ codebase)

```
.
├── CUSTOMER
│   ├── CUSTOMER.VIEW
│   ├── CUSTOMER.CREATE
│   ├── CUSTOMER.UPDATE
│   ├── CUSTOMER.DELETE
│   ├── CUSTOMER.VIEW_PHONE        ← nhạy cảm
│   ├── CUSTOMER.VIEW_EMAIL        ← nhạy cảm
│   └── CUSTOMER.IMPORT
├── INVOICE
│   ├── INVOICE.VIEW
│   ├── INVOICE.CREATE
│   ├── INVOICE.CANCEL
│   ├── INVOICE.REFUND             ← nhạy cảm
│   └── INVOICE.VAT
├── SHIFT
│   ├── SHIFT.OPEN
│   ├── SHIFT.CLOSE
│   └── SHIFT.VIEW_ALL
├── FINANCE
│   ├── FINANCE.VIEW
│   ├── FINANCE.CREATE_RECEIPT
│   ├── FINANCE.CREATE_PAYMENT
│   ├── FINANCE.CANCEL
│   └── FINANCE.RECONCILIATION
├── INVENTORY
│   └── ...
├── MARKETING
│   ├── MARKETING.CAMPAIGN
│   └── MARKETING.PROMOTION
├── REPORT
│   ├── REPORT.SALES
│   ├── REPORT.MEMBER
│   └── REPORT.FINANCE
├── SETTING
│   ├── SETTING.TENANT             ← chỉ Tenant Admin
│   ├── SETTING.PERMISSION         ← chỉ Tenant Admin
│   └── SETTING.INTEGRATION
└── ADMIN_TENANT (super)
```

### 3.3. Frontend permission check

```ts
// userContext có permissions: string[]
const { permissions } = useContext(UserContext);

// Component-level guard
{permissions.includes('CUSTOMER.CREATE') && <Button>Thêm khách</Button>}

// Page-level guard
function CustomerPersonList() {
  const { permissions } = useContext(UserContext);
  if (!permissions.includes('CUSTOMER')) {
    return <Forbidden403 />;
  }
  // ...
}

// Sidebar filter
filterMenuByPermission(menu, permissions)  // ẩn item user không có quyền
```

### 3.4. Backend permission check (bắt buộc!)

> ⚠️ **Critical**: Frontend permission check **chỉ là UX** — không thay được backend check. Backend phải verify quyền ở mỗi endpoint. Nếu chỉ frontend → user có thể bypass bằng cách type URL hoặc gọi API trực tiếp qua Postman.

```python
# pseudocode middleware
@require_permission('CUSTOMER.DELETE')
def delete_customer(request, customer_id):
    customer = Customer.objects.get(id=customer_id, tenant_id=request.tenant_id)
    customer.soft_delete()
```

### 3.5. Selectedrole header

Header `Selectedrole` cho phép user có nhiều role chọn role nào dùng trong phiên hiện tại. Backend dùng để limit permission.

```
User có roles: ['admin_branch_a', 'staff_branch_b']
                     ↓
Selectedrole: 'admin_branch_a'
                     ↓
Backend chỉ áp permission của 'admin_branch_a' (không phải union)
```

---

## 4. Multi-tenant isolation

### 4.1. Layer 1 — HTTP header

Mọi request gửi `Hostname: <tenant_domain>`:

```
Hostname: kcn.reborn.vn       → tenant KCN
Hostname: viettelstore.reborn.vn  → tenant Viettel Store
```

> ⚠️ **Critical bug:** [`fetchConfig.ts:42`](../../src/configs/fetchConfig.ts#L42) hardcode `Hostname = "kcn.reborn.vn"`. Cần fix lấy từ `location.hostname` trước khi production.

### 4.2. Layer 2 — Backend middleware

```python
def tenant_middleware(request):
    hostname = request.headers.get("Hostname")
    tenant = Tenant.lookup_by_domain(hostname)
    if not tenant:
        return 404
    request.tenant_id = tenant.id
```

### 4.3. Layer 3 — Database query

```sql
-- Mọi query phải có:
WHERE tenant_id = :current_tenant_id
```

Cách enforce:

| Cách | Mô tả | Mức an toàn |
|------|-------|-------------|
| **Code review** | Dev tự đảm bảo | Thấp |
| **ORM scope** | Override default scope | Trung bình |
| **Row Level Security** (PostgreSQL) | DB tự inject filter | Cao |
| **Database per tenant** | Tách hoàn toàn | Tuyệt đối |

> **Đề xuất**: dùng PostgreSQL RLS — đặt connection-level `SET app.current_tenant = X` mỗi request. Mọi query không cần `WHERE tenant_id` nữa, DB tự lo.

### 4.4. Test isolation

E2E test bắt buộc:

```
Test "tenant_isolation":
  1. Create tenant A, tenant B
  2. Tạo khách trong tenant A (id=1)
  3. Login user của tenant B
  4. GET /api/customer/detail?id=1
  5. Assert: 404 (không tìm thấy)
  6. Assert: NOT 200 với data của A
```

---

## 5. Encryption

### 5.1. In transit

| Hop | Encryption |
|-----|------------|
| **Browser ↔ CDN** | TLS 1.2+ (managed by CDN) |
| **CDN ↔ LB** | TLS 1.2+ |
| **LB ↔ API** | TLS in production (mTLS đề xuất) |
| **API ↔ DB** | TLS bắt buộc, không trust internal network |
| **API ↔ external (payment, e-invoice)** | TLS + (đôi khi) mTLS |
| **API ↔ Redis** | TLS hoặc VPN |

### 5.2. At rest

| Data | Method |
|------|--------|
| **Database disk** | LUKS / cloud provider encryption |
| **Backup** | AES-256 trước khi đẩy lên S3 |
| **S3 bucket** | SSE-S3 hoặc SSE-KMS |
| **Sensitive columns** (api_key, refresh_token) | Column-level AES-256 |
| **Password** | bcrypt (one-way hash) |
| **Webhook secret** | AES-256 |
| **Certificate (PFX)** | HSM hoặc Vault |

### 5.3. Key management

Đề xuất dùng **AWS KMS** / **HashiCorp Vault** / **Azure Key Vault**:

- Mỗi tenant có encryption key riêng (envelope encryption)
- Rotation định kỳ (mỗi 90 ngày)
- Audit truy cập key

---

## 6. Sensitive data masking

### 6.1. Nguyên tắc

Dữ liệu nhạy cảm (SĐT, email, CMND, STK) **mặc định ẩn**, chỉ hiện cho user có quyền.

### 6.2. Backend implementation

```python
def serialize_customer(customer, user):
    data = {...}
    if not user.has_permission('CUSTOMER.VIEW_PHONE'):
        data['phone'] = mask_phone(customer.phone)  # "090***1234"
    if not user.has_permission('CUSTOMER.VIEW_EMAIL'):
        data['email'] = mask_email(customer.email)
    return data
```

### 6.3. Frontend hiển thị

```tsx
// Field "Số điện thoại" có icon con mắt
// Bấm con mắt → gọi API customer/viewPhone với id
// API check quyền → trả về số đầy đủ hoặc lỗi 403

const handleShowPhone = async (id) => {
  const res = await CustomerService.viewPhone(id);
  if (res.code === 0) {
    setFormData({...formData, phone: res.result});
  } else if (res.code === 400) {
    showToast("Bạn không có quyền xem số điện thoại !", "error");
  }
};
```

> Pattern này quan sát được trong [`AddCustomerPersonModal.tsx`](../../src/pages/CustomerPerson/partials/AddCustomerPersonModal.tsx).

### 6.4. Audit khi xem

Mỗi lần user bấm "xem SĐT đầy đủ" → ghi audit log: ai, khi nào, xem khách nào. Để truy vết khi nghi ngờ ăn cắp data.

---

## 7. OWASP Top 10 defenses

### 7.1. A01: Broken Access Control

| Mitigation |
|-----------|
| RBAC + Selectedrole header |
| Backend check ownership ở mọi endpoint (IDOR prevention) |
| Test isolation tenant tự động |

### 7.2. A02: Cryptographic Failures

| Mitigation |
|-----------|
| TLS bắt buộc |
| Bcrypt cho password |
| AES-256 cho secret |
| Không log mật khẩu, token |

### 7.3. A03: Injection

| Mitigation |
|-----------|
| ORM hoặc parameterized query (cấm string concat) |
| Validate + sanitize input ở mọi entry point |
| Escape output (XSS) |

### 7.4. A04: Insecure Design

| Mitigation |
|-----------|
| Threat modeling từ đầu (Part này) |
| ADR cho các quyết định bảo mật |
| Code review checklist |

### 7.5. A05: Security Misconfiguration

| Mitigation |
|-----------|
| Disable debug mode production |
| Tắt directory listing |
| Header bảo mật: HSTS, CSP, X-Frame-Options |
| Rotate default credentials |

### 7.6. A06: Vulnerable & Outdated Components

| Mitigation |
|-----------|
| Dependabot / Snyk scan dependencies |
| Update dependency định kỳ |
| Remove unused dependencies |

> ⚠️ **Quan sát**: React 17 (đã ra React 19), nhiều dependency phiên bản cũ. Cần audit định kỳ.

### 7.7. A07: Identification & Authentication Failures

| Mitigation |
|-----------|
| Strong password policy |
| 2FA optional + bắt buộc cho admin |
| Lockout sau N lần sai |
| Session timeout |

### 7.8. A08: Software & Data Integrity Failures

| Mitigation |
|-----------|
| Verify chữ ký webhook (HMAC) |
| Signed releases |
| SBOM (Software Bill of Materials) |
| CI/CD pipeline có code signing |

### 7.9. A09: Security Logging & Monitoring Failures

| Mitigation |
|-----------|
| Centralized logging |
| Alert khi có pattern khả nghi (login failed nhiều) |
| Audit log truy cập sensitive data |

### 7.10. A10: SSRF (Server-Side Request Forgery)

| Mitigation |
|-----------|
| Whitelist URL khi user nhập (vd webhook URL) |
| Block private IP range (10.x, 192.168.x, 169.254.x) |
| Egress firewall |

---

## 8. Header bảo mật HTTP

### 8.1. Content-Security-Policy (CSP)

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.reborn.vn;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.reborn.vn https://sso.reborn.vn;
  frame-ancestors 'none';
```

### 8.2. Other headers

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

> **Đề xuất**: Setup ở nginx hoặc CDN/WAF level để áp cho mọi response.

---

## 9. Rate limiting

### 9.1. Cần có ở các endpoint:

| Endpoint | Limit |
|----------|-------|
| `/oauth/token` (login) | 10/phút/IP |
| `/oauth/forgot-password` | 5/giờ/email |
| Public API endpoint | 100/phút/API key |
| Authenticated API | 600/phút/user |
| Webhook receiver | 1000/phút/source |
| Mass marketing send | tùy gateway throttle |

### 9.2. Implementation

- **Nginx limit_req** module
- **Cloud provider WAF**
- **Application-level**: Redis-based counter (vd `express-rate-limit`)

---

## 10. Audit log chi tiết

> Đã mô tả ở [Part 07 §4](part-07-data-architecture.md#4-audit-trail).

### 10.1. Quy ước event

```json
{
  "tenant_id": 123,
  "user_id": 456,
  "action": "INVOICE.REFUND",
  "entity_type": "invoice",
  "entity_id": 789,
  "before": { "status": "paid", "amount": 500000 },
  "after": { "status": "refunded", "amount": 500000 },
  "ip": "1.2.3.4",
  "user_agent": "Mozilla/...",
  "timestamp": "2026-04-14T10:23:45Z",
  "request_id": "uuid-..."
}
```

### 10.2. Storage

- **Hot storage**: 90 ngày trong PostgreSQL (query nhanh)
- **Cold storage**: > 90 ngày archive sang S3 + Athena cho query
- **Total retention**: ≥ 2 năm (≥ 5 năm cho audit tài chính)

### 10.3. Tamper-resistance

- **Append-only**: không UPDATE / DELETE
- **Hash chain** (optional): mỗi entry chứa hash của entry trước → phát hiện tampering
- **External backup** đến storage không có quyền ghi

---

## 11. Secret management

### 11.1. Cấm

- ❌ Commit secret vào git
- ❌ Lưu secret trong code source
- ❌ Lưu secret trong env file commit lên repo (.env.example OK, .env không OK)
- ❌ Hardcode secret trong frontend (đi vào bundle public)

### 11.2. Đề xuất

- ✅ Vault (HashiCorp / cloud KMS)
- ✅ Env var inject lúc deploy
- ✅ Rotate định kỳ
- ✅ Audit truy cập

### 11.3. Secret scanning

Pre-commit hook + CI scan với:

- **git-secrets** (AWS Labs)
- **truffleHog**
- **GitGuardian**

---

## 12. Compliance

### 12.1. Luật An ninh mạng VN 2018

- Dữ liệu công dân VN lưu tại VN
- Có cơ chế cung cấp data cho cơ quan chức năng khi yêu cầu
- Lưu nhật ký đăng nhập tối thiểu 12 tháng

### 12.2. Nghị định 13/2023/NĐ-CP (Bảo vệ DLCN)

- Có cam kết bảo mật dữ liệu cho khách
- Cho khách yêu cầu xem/sửa/xóa data của họ
- Thông báo khi thu thập data
- Đăng ký xử lý DLCN (đối với organization)

### 12.3. TT78/2021/TT-BTC (Hóa đơn điện tử)

- Phát hành đúng quy định
- Lưu trữ ≥ 10 năm
- Có chữ ký số CA hợp lệ

### 12.4. TT06/2017/TT-BVHTTDL (Lưu trú)

- Lưu CMND/CCCD ít nhất 5 năm
- Báo cáo cho công an khi yêu cầu

---

## 13. Security gaps quan sát được

| ID | Gap | Mức nghiêm trọng | Action |
|----|-----|:---------------:|--------|
| SG-01 | Hardcode `Hostname` trong fetchConfig | 🔴 **Critical** | Fix ngay trước production |
| SG-02 | Không có refresh token logic — user bị logout giữa chừng | 🟡 Medium | Implement refresh + queue retry |
| SG-03 | Không có explicit `PrivateRoute` wrapper — user có thể bypass URL | 🟡 Medium | Add route guard |
| SG-04 | React 17 + nhiều dep cũ — có CVE chưa patch | 🟡 Medium | Audit + upgrade |
| SG-05 | Không có CSP/HSTS header (giả định) | 🟡 Medium | Setup ở nginx/CDN |
| SG-06 | Không có rate limit explicit ở frontend (chống click spam) | 🟢 Low | Debounce button submit |
| SG-07 | Sensitive log (vd console.log token) | 🟡 Medium | Audit code, drop_console production (đã có) |
| SG-08 | Không có security test trong CI | 🟡 Medium | Add Snyk/Dependabot |

> Chi tiết action plan ở [Part 14](part-14-quality-risks.md).

---

## 14. Security checklist cho dev

Trước khi merge PR, dev tự check:

- [ ] Endpoint mới có check authentication?
- [ ] Endpoint mới có check authorization (permission)?
- [ ] Query DB có scope theo `tenant_id`?
- [ ] Input có validate + sanitize?
- [ ] Output có escape (XSS)?
- [ ] Không log token/password?
- [ ] Không hardcode secret?
- [ ] Action nhạy cảm có audit log?
- [ ] Có test cho authorization?
- [ ] Dependencies mới có audit security?

---

*Hết Part 10.*

---

# Part 11 — Cross-cutting Concerns

## Executive Summary

Cross-cutting concerns là các mối quan tâm **xuyên suốt mọi feature**, không thuộc về một bounded context cụ thể. Bao gồm: **logging**, **monitoring & metrics**, **error handling**, **caching**, **i18n**, **configuration management**, **feature flags**, **time/timezone**, **search**. Một số đã có trong codebase (i18n, error handling), một số là **đề xuất** dựa trên best practice.

---

## 1. Logging

### 1.1. Frontend logging

> 🟢 **Quan sát hiện tại:** Frontend dùng `console.log` rải rác. Production build có `terserOptions.compress.drop_console = true` → strip toàn bộ console.

**Vấn đề:** Khi user gặp lỗi production, không có log để debug.

**Đề xuất:**

| Mục đích | Tool |
|----------|------|
| **Error tracking** | Sentry / Datadog RUM |
| **User session replay** | LogRocket / Sentry Replay |
| **Performance monitoring** | Web Vitals (CLS/FID/LCP) → analytics |
| **Custom event** | Mixpanel / Amplitude (analytics) |

**Pattern:**

```ts
// utils/logger.ts
import * as Sentry from "@sentry/react";

export const logger = {
  info: (msg: string, ctx?: any) => {
    if (process.env.NODE_ENV === "development") console.log(msg, ctx);
    // production: silent unless Sentry breadcrumb
    Sentry.addBreadcrumb({ message: msg, data: ctx });
  },
  warn: (msg: string, ctx?: any) => {
    Sentry.captureMessage(msg, "warning");
  },
  error: (err: Error, ctx?: any) => {
    Sentry.captureException(err, { extra: ctx });
  }
};
```

### 1.2. Backend logging

> 🔴 **Đề xuất** — không thấy được trong frontend repo.

**Structured logging** với JSON:

```json
{
  "timestamp": "2026-04-14T10:23:45.123Z",
  "level": "INFO",
  "service": "sales",
  "request_id": "req-uuid",
  "user_id": 456,
  "tenant_id": 123,
  "message": "Invoice created",
  "invoice_id": 789,
  "duration_ms": 245
}
```

**Tools:**

- **Logger library**: Winston (Node.js), Logback (Java), structlog (Python)
- **Aggregation**: ELK (Elasticsearch + Logstash + Kibana) hoặc Loki + Grafana hoặc Datadog
- **Sampling**: log INFO 10%, log ERROR 100%

### 1.3. Log levels

| Level | Khi nào dùng |
|-------|--------------|
| **DEBUG** | Chi tiết flow, chỉ bật khi debug |
| **INFO** | Sự kiện bình thường (request started/completed, job processed) |
| **WARN** | Bất thường nhưng chưa fail (retry, fallback) |
| **ERROR** | Exception, request fail |
| **FATAL** | Service crash |

### 1.4. Không log

- ❌ Mật khẩu
- ❌ Access token, refresh token
- ❌ Credit card, CVV
- ❌ Mã PIN
- ❌ Dữ liệu sức khỏe
- ❌ CMND/CCCD đầy đủ

---

## 2. Monitoring & Metrics

### 2.1. Pillars of observability

| Pillar | Mô tả | Tool |
|--------|-------|------|
| **Logs** | Sự kiện chi tiết | ELK / Loki / Datadog |
| **Metrics** | Số liệu thời gian | Prometheus + Grafana |
| **Traces** | Distributed tracing | Jaeger / Zipkin / Datadog APM |

### 2.2. Metrics quan trọng

#### Service metrics

- **Request rate** (requests per second)
- **Error rate** (% requests fail)
- **Latency** (p50, p95, p99)
- **Saturation** (CPU, RAM, disk, connection pool)

#### Business metrics

- Số đơn POS/giờ/tenant
- Doanh thu/giờ/tenant
- Số user active concurrent
- Tỷ lệ thanh toán thành công
- Tỷ lệ webhook delivery thành công

### 2.3. Alerts

| Alert | Threshold | Action |
|-------|-----------|--------|
| **Error rate** > 5% trong 5 phút | Page on-call |
| **Latency p99** > 3s | Slack channel |
| **Service down** | Page on-call |
| **DB connection pool** > 80% | Slack |
| **Disk** > 85% | Slack |
| **SMS budget** > 90% daily | Email manager |
| **Webhook fail rate** > 10% | Slack |
| **Cron job stuck** > 1h | Page on-call |

### 2.4. Dashboard đề xuất

- **System Overview**: services up/down, error rate, latency
- **Business Overview**: orders/min, revenue, active users per tenant
- **Database**: connection pool, query time, replication lag
- **Integration**: webhook success rate, payment gateway response time
- **Per-tenant**: top 20 tenant by load (giúp phát hiện noisy tenant)

---

## 3. Error handling

### 3.1. Frontend error boundary

```tsx
// components/errorBoundary/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return <Page500 onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

> ⚠️ **Quan sát**: Codebase **không có** `ErrorBoundary` rõ ràng — nếu 1 page crash, toàn bộ app trắng. Cần thêm.

### 3.2. API error handling

```ts
const res = await CustomerService.update(body);
if (res.code === 0) {
  showToast("Thành công", "success");
} else if (res.code === 401) {
  // interceptor đã handle
} else if (res.code === 403) {
  showToast("Bạn không có quyền", "error");
} else if (res.code >= 500) {
  showToast("Lỗi hệ thống. Vui lòng thử lại.", "error");
  Sentry.captureMessage(`API 5xx: ${res.message}`);
} else {
  showToast(res.error || res.message || "Có lỗi xảy ra", "error");
}
```

### 3.3. User-facing message convention

| Trường hợp | Message |
|------------|---------|
| Validation fail | Cụ thể: *"Số điện thoại không đúng định dạng"* |
| Permission denied | *"Bạn không có quyền thực hiện thao tác này"* |
| Not found | *"Không tìm thấy dữ liệu"* |
| Conflict (đã tồn tại) | *"Số điện thoại đã tồn tại"* |
| Server error | *"Có lỗi xảy ra. Vui lòng thử lại sau."* |
| Network error | *"Lỗi kết nối. Vui lòng kiểm tra mạng."* |

> Quy tắc: **bằng tiếng Việt** + **gợi ý hành động** + **không expose stack trace**.

---

## 4. Caching strategy

### 4.1. Frontend caching

| Loại | Lưu ở | TTL | Ví dụ |
|------|-------|-----|-------|
| **Static asset** | Browser cache + CDN | 1 năm (immutable hash) | JS/CSS/font |
| **API response cache** | React state hoặc memory | 5 phút | Dropdown options |
| **Local storage** | localStorage | đến khi clear | User preferences, draft form |
| **IndexedDB** | IndexedDB | tùy | Offline data (nếu có) |
| **Cookie** | Cookie | session/persistent | Token, user meta |

### 4.2. Backend caching

| Layer | Tool | Use case |
|-------|------|----------|
| **L1 — In-process** | LRU cache | Hot data per service |
| **L2 — Distributed** | Redis | Shared cache giữa instances |
| **L3 — Database** | DB query cache | Materialized view |
| **L4 — CDN** | CloudFlare/CloudFront | Public API response |

### 4.3. Cache invalidation patterns

- **TTL**: cache hết hạn tự động (đơn giản)
- **Write-through**: update DB → update cache cùng lúc
- **Write-behind**: update cache trước → async update DB (rủi ro mất data)
- **Cache-aside**: app tự quản (read miss → query DB → set cache)
- **Pub/sub invalidation**: 1 service update → publish event → các service khác clear cache liên quan

### 4.4. Cache key convention

```
<service>:<entity>:<id>:<version>

vd: customer:detail:12345:v1
    invoice:list:tenant=123:branch=45:page=1:v2
```

### 4.5. Cache cần tránh

- ❌ Cache data nhạy cảm (token, password)
- ❌ Cache rất ngắn (< 1s) — overhead cao hơn benefit
- ❌ Cache quá dài → stale data

---

## 5. Internationalization (i18n)

### 5.1. Library

`react-i18next` 14.x

### 5.2. Setup

> Quan sát file [`src/i18n.ts`](../../src/i18n.ts).

```ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./locales/vi.json";
import en from "./locales/en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: localStorage.getItem("language") || "vi",
    fallbackLng: "vi",
    interpolation: { escapeValue: false },
  });
```

### 5.3. Usage trong component

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <button onClick={() => i18n.changeLanguage("en")}>EN</button>
    </div>
  );
}
```

### 5.4. Locale files

```
src/locales/
├── vi.json       # Tiếng Việt
└── en.json       # English
```

### 5.5. Format numbers, dates, currency

> Quan sát: codebase đang dùng **moment** + **date-fns** lẫn nhau (cần thống nhất). Format số/tiền dùng `formatCurrency` từ `reborn-util`.

**Đề xuất chuẩn**:

```ts
// Date: dùng date-fns + locale
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";

format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi });

// Number: dùng Intl
new Intl.NumberFormat("vi-VN").format(1234567);  // "1.234.567"

// Currency:
new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(1234567);
// "1.234.567 ₫"
```

---

## 6. Configuration management

### 6.1. Frontend config

#### Build-time

`vite.config.ts` define:

```ts
define: {
  "process.env.APP_API_URL": JSON.stringify(env.APP_API_URL),
  "process.env.APP_BIZ_URL": JSON.stringify(env.APP_BIZ_URL),
  // ...
}
```

→ Inject lúc build, không đổi runtime.

#### Runtime config

Một số config phải fetch lúc app start:

```ts
// App.tsx
useEffect(() => {
  TenantConfigService.get().then(config => {
    setTenantConfig(config);
  });
}, []);
```

→ Cấu hình **per tenant** (logo, theme, feature flags) lấy từ backend.

### 6.2. Env files

```
.env                # Default (commit to git)
.env.development    # Dev (commit)
.env.staging        # Staging (commit)
.env.production     # Production (KHÔNG commit, inject lúc deploy)
.env.local          # Local override (KHÔNG commit)
```

### 6.3. Backend config

> 🔴 **Đề xuất**

- **Per-environment**: file YAML/JSON inject lúc deploy
- **Secret**: từ Vault, không commit
- **Per-tenant**: lưu trong DB table `tenant_config`
- **Hot reload**: feature flag thay đổi runtime không cần restart

---

## 7. Feature flags

### 7.1. Mục đích

- Bật/tắt tính năng cho một số tenant (gradual rollout)
- A/B test
- Kill switch (tắt nhanh feature đang fail)

### 7.2. Pattern

```ts
const { features } = useContext(UserContext);

if (features.includes("new_pos_ui")) {
  return <NewPOSPage />;
} else {
  return <OldPOSPage />;
}
```

### 7.3. Tool đề xuất

- **LaunchDarkly** / **Unleash** (managed)
- **Tự build**: table `feature_flag` trong DB, frontend fetch lúc init

### 7.4. Hiện tại

Codebase có vẻ dùng **gói SaaS-based features** (mỗi tenant thuê gói nào → có feature đó), không dùng feature flag động. Đây cũng là 1 cách hợp lý.

---

## 8. Time & Timezone

### 8.1. Quy ước

- **DB**: lưu UTC (timestamp with timezone)
- **API**: trả ISO 8601 với timezone
- **Frontend**: convert sang local time của user khi hiển thị

### 8.2. Cấu hình per-tenant

Tenant có thể có múi giờ khác nhau (vd tenant ở Singapore: GMT+8). Cài ở [`UR-SETUP-02`](../urd/part-11-cai-dat-co-ban.md#ur-setup-02--cấu-hình-định-dạng-hệ-thống).

```ts
// Lúc hiển thị
const tenantTimezone = userContext.tenantConfig.timezone || "Asia/Ho_Chi_Minh";
format(toZonedTime(date, tenantTimezone), "dd/MM/yyyy HH:mm");
```

### 8.3. Cron job timezone

Background job (vd "Báo cáo ngày") chạy theo timezone tenant, không phải UTC. Backend phải xử lý.

---

## 9. Search

### 9.1. Frontend search

- **Local search**: filter array trong memory (nhanh, < 100 items)
- **API search**: gọi backend với query string
- **Debounce**: mọi search input dùng `useDebounce` 300ms

### 9.2. Backend search

| Loại | Implementation |
|------|----------------|
| **Exact match** | DB index |
| **Prefix** | `LIKE 'foo%'` + index |
| **Full-text** | PostgreSQL tsvector hoặc Elasticsearch |
| **Fuzzy** | pg_trgm hoặc ES |
| **Multi-field** | ES với boost weight |

### 9.3. Tìm kiếm toàn cục (global search)

Trong header có ô search match:
- Khách hàng (theo tên, SĐT, mã)
- Đơn hàng (mã)
- Sản phẩm (tên, mã, barcode)

Backend cần có endpoint `/api/global-search?q=...` truy vấn nhiều entity song song.

---

## 10. Notification

### 10.1. Loại notification

| Loại | Ví dụ | Channel |
|------|-------|---------|
| **In-app** | Đơn hàng mới | Chuông trên header |
| **Push (browser)** | Sự kiện realtime | Firebase FCM |
| **Push (mobile)** | Khi có app riêng | FCM / APNs |
| **Email** | Báo cáo định kỳ | SMTP |
| **SMS** | OTP, gia hạn | SMS gateway |
| **Zalo** | Khuyến mãi | Zalo OA |

### 10.2. Notification service

> Đã mô tả ở [Part 08 §3.12](part-08-backend-architecture.md#312-notification-service-bizapinotification).

### 10.3. Quy ước payload

```json
{
  "id": "notif-uuid",
  "type": "INVOICE_CREATED",
  "title": "Đơn hàng mới",
  "body": "Đơn #INV001 đã được tạo bởi Nguyễn A",
  "data": {
    "invoiceId": 123,
    "url": "/sale_invoice?id=123"
  },
  "createdAt": "2026-04-14T10:23:45Z",
  "read": false
}
```

---

## 11. Background jobs

### 11.1. Loại job

| Loại | Tần suất | Ví dụ |
|------|---------|-------|
| **Real-time** | Trigger by event | Send notification, dispatch webhook |
| **Scheduled** | Cron | Daily report, reconciliation |
| **Batch** | One-off, lớn | Marketing campaign 10k SMS |
| **Cleanup** | Cron | Xóa file temp, archive log |

### 11.2. Pattern

Đã mô tả ở [Part 08 §9](part-08-backend-architecture.md#9-background-workers-đề-xuất).

### 11.3. Monitoring

- Mỗi job có metric: started, completed, failed, duration
- Dead letter queue cho job fail nhiều lần
- Dashboard hiển thị job đang chạy, queue depth

---

## 12. Idempotency

### 12.1. Tại sao cần

Network có thể fail giữa chừng → client retry → backend xử lý 2 lần → đơn duplicate.

### 12.2. Pattern

Client gửi header `Idempotency-Key: <uuid>` với mỗi POST quan trọng:

```
POST /sales/invoice/create
Idempotency-Key: req-abc-123
Body: { ... }
```

Backend:

```python
def create_invoice(request):
    key = request.headers.get("Idempotency-Key")
    cached = redis.get(f"idempotency:{key}")
    if cached:
        return cached  # Trả lại response cũ
    
    response = process_create()
    redis.setex(f"idempotency:{key}", 3600, response)
    return response
```

> ⚠️ **Quan sát**: Codebase **chưa có** idempotency key. POST tạo đơn nếu user double-click hoặc mạng kém → có thể tạo 2 đơn. Cần fix.

---

## 13. Distributed tracing

### 13.1. Mục đích

Khi 1 request đi qua nhiều microservice, debug rất khó nếu không trace được full chain.

### 13.2. Tool

- **Jaeger** (open-source)
- **Zipkin** (open-source)
- **Datadog APM** (managed)
- **AWS X-Ray** (managed)

### 13.3. Pattern

Mỗi request có:
- `trace_id`: định danh toàn bộ request chain
- `span_id`: định danh 1 hop
- `parent_span_id`: hop cha

Frontend gửi header `traceparent` (W3C standard), backend pass tiếp qua các service.

> 🔴 **Đề xuất** — không thấy trong codebase hiện tại.

---

## 14. Rate limiting (client-side)

Để tránh user click spam tạo nhiều request:

```ts
// Disable button khi đang submit
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  if (submitting) return;
  setSubmitting(true);
  try {
    await CustomerService.update(body);
  } finally {
    setSubmitting(false);
  }
};

return <Button disabled={submitting}>Lưu</Button>;
```

Pattern này quan sát thấy trong nhiều form ([`AddCustomerPersonModal`](../../src/pages/CustomerPerson/partials/AddCustomerPersonModal.tsx) → `isSubmit` state).

---

## 15. Cross-cutting concerns checklist

Khi build feature mới, check:

- [ ] Có log đủ event quan trọng?
- [ ] Có metric để track usage?
- [ ] Có error handling rõ ràng?
- [ ] Có cache nếu data tĩnh?
- [ ] Có i18n cho UI text?
- [ ] Có timezone-aware nếu liên quan ngày giờ?
- [ ] Có idempotency cho POST critical?
- [ ] Có rate limit protection?
- [ ] Có audit log nếu nhạy cảm?
- [ ] Có notification cho user nếu cần?

---

*Hết Part 11.*

---

# Part 12 — Deployment & Infrastructure

> ⚠️ **Mức độ tự tin: THẤP** — Toàn bộ Part này là **đề xuất** dựa trên best practice. Đội DevOps cần thay bằng infrastructure thực tế.

## Executive Summary

Đề xuất triển khai Reborn CRM theo mô hình **multi-environment** (dev/staging/production) trên hạ tầng cloud, sử dụng **container orchestration** (Kubernetes hoặc Docker Swarm), với **API gateway**, **load balancer**, **multiple API instances stateless**, **PostgreSQL HA** (master + read replicas), **Redis cluster**, **S3-compatible object storage**, và **CI/CD pipeline tự động**. Có **3 môi trường** với strategy promote code dần dần.

---

## 1. Sơ đồ deployment đề xuất

![Deployment Architecture — Multi-tier topology with HA components](./diagrams/18-deployment-architecture.png)

---

## 2. Environments

### 2.1. Strategy 3 môi trường

| Env | Mục đích | URL pattern | Data |
|-----|---------|-------------|------|
| **Development** | Dev tự test | `dev.reborn.vn` hoặc localhost | Mock + sample |
| **Staging** | QA + UAT | `staging.reborn.vn` | Realistic, có thể anonymize từ prod |
| **Production** | Customer thật | `*.reborn.vn` (tenant subdomain) | Live |

### 2.2. Build pipeline

```
┌─────────────┐   git push    ┌─────────────┐
│  Developer  ├──────────────►│   GitHub    │
└─────────────┘   (feature)   │   GitLab    │
                              └──────┬──────┘
                                     │ webhook
                                     ▼
                              ┌─────────────┐
                              │     CI      │
                              │  (Actions/  │
                              │  GitLab CI) │
                              └──────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
       ┌───────────┐         ┌──────────────┐       ┌─────────────┐
       │   Lint    │         │  Unit test   │       │  Build prod │
       └─────┬─────┘         └──────┬───────┘       └──────┬──────┘
             │                      │                       │
             └──────────┬───────────┴───────────┬──────────┘
                        │                       │
                        ▼                       ▼
                ┌──────────────┐         ┌──────────────┐
                │ Pass? Merge  │         │ Build Docker │
                │ to develop   │         │ image        │
                └──────┬───────┘         └──────┬───────┘
                       │                        │
                       ▼                        ▼
                ┌──────────────┐         ┌──────────────┐
                │ Auto deploy  │         │ Push to ECR  │
                │ to dev env   │         │ /Harbor      │
                └──────────────┘         └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │ Manual deploy│
                                         │ to staging/  │
                                         │ production   │
                                         └──────────────┘
```

### 2.3. Branch strategy

- **`main`** (hoặc `master`): luôn deployable, là code đang chạy production
- **`develop`**: integration branch, auto deploy to dev env
- **`feature/*`**: feature branch, merge vào develop qua PR
- **`release/*`**: chuẩn bị release, deploy lên staging để UAT
- **`hotfix/*`**: bug fix khẩn cấp, branch từ main

### 2.4. Promote code

```
feature → develop → release/v1.2.0 → main → tag v1.2.0
   ↓         ↓             ↓           ↓
  CI       Dev env      Staging    Production
```

---

## 3. Container strategy

### 3.1. Dockerfile (đề xuất frontend)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/bundle /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.2. nginx.conf

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  
  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
    
    # Cache control
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
  
  # Static assets - cache aggressive
  location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff|woff2|ttf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  
  # Security headers
  add_header X-Frame-Options "DENY";
  add_header X-Content-Type-Options "nosniff";
  add_header Referrer-Policy "strict-origin-when-cross-origin";
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
  
  # Gzip
  gzip on;
  gzip_types text/css application/javascript application/json;
}
```

### 3.3. Image registry

- **Self-hosted**: Harbor, GitLab Registry
- **Managed**: AWS ECR, Docker Hub Pro, GCR

---

## 4. Kubernetes deployment (đề xuất)

### 4.1. Deployment YAML (frontend)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloud-crm-frontend
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cloud-crm-frontend
  template:
    metadata:
      labels:
        app: cloud-crm-frontend
    spec:
      containers:
      - name: frontend
        image: harbor.reborn.vn/cloud-crm:v1.2.0
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: cloud-crm-frontend
spec:
  type: ClusterIP
  selector:
    app: cloud-crm-frontend
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cloud-crm-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/proxy-body-size: "100m"
spec:
  tls:
  - hosts:
    - "*.reborn.vn"
    secretName: reborn-tls
  rules:
  - host: hub.reborn.vn
    http:
      paths:
      - path: /crm
        pathType: Prefix
        backend:
          service:
            name: cloud-crm-frontend
            port:
              number: 80
```

### 4.2. Auto-scaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cloud-crm-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cloud-crm-frontend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 5. Database HA

### 5.1. PostgreSQL topology

```
                    ┌─────────────────┐
                    │     Master      │
                    │   (read-write)  │
                    └────────┬────────┘
                             │ streaming
                             │ replication
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ Replica1 │   │ Replica2 │   │ Replica3 │
       │ (R/O)    │   │ (R/O)    │   │ (Reports)│
       └──────────┘   └──────────┘   └──────────┘
```

- **Master**: chỉ nhận write
- **Replica 1+2**: read replicas cho query bình thường
- **Replica 3**: dành cho query report (heavy, không ảnh hưởng OLTP)

### 5.2. Failover

- **Manual**: DBA promote replica thành master khi master fail
- **Auto**: dùng tool như Patroni / repmgr để auto failover

### 5.3. Connection pool

App dùng connection pool (PgBouncer) để tránh exhaust connection:

```
App pods → PgBouncer (transaction mode) → PostgreSQL
```

### 5.4. Backup

- **pgBackRest** hoặc **wal-g** cho continuous archiving
- Snapshot lên S3 hằng đêm
- Test restore hằng tháng

---

## 6. Redis cluster

### 6.1. Topology

```
        ┌────────┐
        │ Sentinel│ × 3 (HA)
        └────┬───┘
             │
        ┌────▼────┐
        │ Master  │
        └────┬────┘
             │
       ┌─────┴─────┐
       ▼           ▼
   ┌───────┐   ┌───────┐
   │Slave 1│   │Slave 2│
   └───────┘   └───────┘
```

- **3 Sentinel** quản lý failover
- **1 Master + 2 Slave** cho HA

### 6.2. Use case

- Cache session, permission
- Queue cho background job
- Rate limit counter
- Pub/sub cho real-time event

---

## 7. Object storage

### 7.1. Lựa chọn

| Option | Pros | Cons |
|--------|------|------|
| **AWS S3** | Most mature, ecosystem | Vendor lock-in |
| **MinIO** (self-hosted) | Free, S3-compatible | Phải tự ops |
| **DigitalOcean Spaces** | Rẻ, S3-compatible | Limited region |
| **Cloudflare R2** | Không tính egress | Mới, ít feature |

### 7.2. Bucket structure

```
reborn-crm-files/
├── tenants/
│   ├── <tenant_id>/
│   │   ├── customer-avatars/
│   │   ├── product-images/
│   │   ├── invoice-attachments/
│   │   ├── id-card-scans/        ← nhạy cảm, encrypt
│   │   └── exports/
├── public/
│   └── shared-assets/
└── backups/
    ├── db-daily/
    └── db-weekly/
```

### 7.3. Access control

- **Bucket policy**: deny public access by default
- **Pre-signed URL**: cho download tạm thời (1h)
- **CDN**: CloudFront/CloudFlare in front cho static asset
- **Encryption**: SSE-S3 mặc định, SSE-KMS cho file nhạy cảm

---

## 8. CI/CD pipeline

### 8.1. Tools

| Stage | Tool |
|-------|------|
| **CI** | GitHub Actions / GitLab CI / Jenkins |
| **Build** | Docker / Buildah |
| **Registry** | Harbor / ECR / GCR |
| **Deploy** | ArgoCD / FluxCD / Helm |
| **Secret** | Vault / Sealed Secrets / AWS Secrets Manager |

### 8.2. Pipeline stages

```yaml
stages:
  - lint           # ESLint + Prettier
  - test           # Unit + integration tests
  - security_scan  # Snyk / Trivy / SonarQube
  - build          # vite build
  - dockerize      # docker build
  - push           # docker push to registry
  - deploy_dev     # auto deploy to dev
  - e2e_test       # Playwright E2E on dev
  - deploy_staging # manual approval → staging
  - smoke_test     # quick health check
  - deploy_prod    # manual approval → production
  - smoke_test_prod
  - notify         # Slack notification
```

### 8.3. Rollback strategy

- **Blue-green deployment**: deploy version mới → switch traffic → giữ bản cũ standby
- **Rolling update**: từng pod update, có thể pause/rollback
- **Canary**: 5% traffic → 25% → 50% → 100%, monitor error rate
- **Helm rollback**: `helm rollback cloud-crm <prev-version>`

---

## 9. Network topology

### 9.1. Public + Private subnet

```
Internet
    │
    ▼
[ Cloud Provider ]
    │
    ├── Public subnet (10.0.1.0/24)
    │   ├── ALB / Cloud Load Balancer
    │   └── NAT Gateway
    │
    ├── Private subnet (10.0.2.0/24) — App tier
    │   ├── K8s worker nodes
    │   ├── API server pods
    │   └── Worker pods
    │
    ├── Private subnet (10.0.3.0/24) — Data tier
    │   ├── PostgreSQL master + replicas
    │   ├── Redis cluster
    │   └── ElasticSearch
    │
    └── Private subnet (10.0.4.0/24) — Bastion / VPN
        └── Bastion host (SSH access)
```

### 9.2. Security groups

| Tier | Inbound | Outbound |
|------|---------|----------|
| **Public** | 80, 443 from 0.0.0.0/0 | All to private |
| **App** | 80 from public LB | 5432 to data tier; 443 to internet |
| **Data** | 5432 from app tier | None (or via NAT) |
| **Bastion** | 22 from office IP | 22 to private |

### 9.3. CDN

```
User → CloudFlare (edge) → Origin (LB)
       ├── Cache static: 1 year
       ├── Cache HTML: 5 minutes
       ├── WAF rules
       └── DDoS protection
```

---

## 10. Domain & DNS

### 10.1. Domain structure

```
*.reborn.vn       → tenant subdomain (vd: kcn.reborn.vn, viettelstore.reborn.vn)
hub.reborn.vn     → main hub
sso.reborn.vn     → SSO
api.reborn.vn     → API gateway
admin.reborn.vn   → admin portal
status.reborn.vn  → status page
```

### 10.2. SSL certificate

- **Let's Encrypt** (free, auto-renew via cert-manager)
- **Wildcard cert** cho `*.reborn.vn`
- Renew tự động 60 ngày trước expiry

---

## 11. Monitoring & Alerting infra

### 11.1. Stack đề xuất

```
[App] → emit metrics → [Prometheus] → [Grafana dashboard]
         emit logs   → [Loki/ELK]   → [Grafana/Kibana]
         emit traces → [Jaeger]     → [Jaeger UI]
                                          │
                                          ▼
                                   [Alertmanager]
                                          │
                                          ▼
                                  [Slack/PagerDuty/Email]
```

### 11.2. Health check endpoints

Mỗi service expose:

```
GET /health            → 200 OK if alive
GET /health/ready      → 200 OK if ready to serve
GET /health/dependencies → check DB, Redis, external APIs
GET /metrics           → Prometheus format
```

K8s liveness/readiness probe gọi vào.

---

## 12. Disaster Recovery

### 12.1. RTO + RPO

- **RTO** (Recovery Time): ≤ 4h
- **RPO** (Recovery Point): ≤ 1h

### 12.2. DR site

- **Hot standby**: replica region đồng bộ liên tục, switch sang trong vài phút (đắt)
- **Warm standby**: snapshot mỗi 1h, restore trong 1-2h (cân bằng)
- **Cold standby**: backup off-site, restore trong 4-8h (rẻ)

### 12.3. DR drill

- **Hằng quý**: full failover sang DR site
- **Document runbook**: ai làm gì khi có sự cố
- **Post-mortem**: sau mỗi drill / incident → cập nhật runbook

---

## 13. Cost optimization

### 13.1. Reserved instances

Cho các VM/DB chạy 24/7 → mua reserved 1-3 năm để giảm 30-60% chi phí.

### 13.2. Spot instances

Cho background worker không critical → dùng spot/preemptible instance để giảm 60-90%.

### 13.3. Right-sizing

- Monitor CPU/RAM thực tế
- Down-size nếu < 30% utilization

### 13.4. Object storage tier

- **Hot**: file < 30 ngày
- **Warm**: 30-90 ngày → S3 IA
- **Cold**: > 90 ngày → S3 Glacier

### 13.5. Database

- Upgrade chỉ khi cần (storage, IOPS, CPU)
- Periodic vacuum, cleanup old data
- Archive cold data sang S3

---

## 14. Compliance & Data sovereignty

### 14.1. Data location

Theo Luật ANM VN 2018: dữ liệu công dân VN **lưu tại VN**.

→ **Đề xuất**: deploy ở Việt Nam (VNPT/Viettel/FPT cloud) hoặc AWS/GCP region Singapore với contract có cam kết.

### 14.2. Audit log

- Lưu nơi không thể tamper (write-once storage hoặc block chain)
- Retention ≥ 12 tháng (Luật ANM)

---

## 15. Deployment runbook (template)

### 15.1. Pre-deploy

- [ ] Code merged to main
- [ ] CI all green
- [ ] Migration scripts reviewed
- [ ] Backup taken
- [ ] On-call notified
- [ ] Status page updated

### 15.2. Deploy

- [ ] Run migration (downtime ≤ 0)
- [ ] Deploy new image (rolling)
- [ ] Monitor error rate (Grafana)
- [ ] Smoke test critical flows

### 15.3. Post-deploy

- [ ] Verify business metrics OK
- [ ] Update changelog
- [ ] Notify team
- [ ] Tag release in git

### 15.4. Rollback

- [ ] Identify issue
- [ ] Decide: rollback or fix forward
- [ ] If rollback: helm rollback or revert image tag
- [ ] Verify back to stable
- [ ] Post-mortem

---

## 16. Câu hỏi cho đội DevOps xác nhận

1. Cloud provider hiện dùng?
2. Container orchestration: K8s? Docker Swarm? VM?
3. Database engine + version?
4. Backup strategy hiện tại + RTO/RPO thực tế?
5. CI/CD tool?
6. Monitoring stack?
7. Domain/DNS provider?
8. CDN provider?
9. Số env hiện có (dev/staging/prod)?
10. DR plan đã có chưa?

---

*Hết Part 12.*

---

# Part 13 — Architectural Decision Records (ADRs)

## Executive Summary

Part này ghi lại **18 quyết định kiến trúc** quan trọng đã/đang áp dụng trong Reborn CRM. Mỗi ADR theo template Michael Nygard: **Trạng thái, Bối cảnh, Quyết định, Hậu quả**. Một số ADR phản ánh quyết định **đã có** trong code (vd dùng React, dùng Vite, dùng Context thay Redux); một số là **đề xuất** dựa trên phân tích — đánh dấu rõ.

---

## Format ADR

```
## ADR-NN — Tiêu đề

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | Proposed / Accepted / Deprecated / Superseded by ADR-XX |
| **Ngày** | YYYY-MM-DD |
| **Tác giả** | Tên |
| **Bối cảnh** | Tại sao cần quyết định? Vấn đề gì? |
| **Quyết định** | Chọn cái gì? |
| **Lựa chọn khác** | Đã cân nhắc gì khác? Tại sao không chọn? |
| **Hậu quả** | Gì tốt lên? Gì tệ đi? Cần chuẩn bị gì? |
```

---

## ADR-01 — Dùng React 17 + TypeScript làm framework frontend

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted (đã triển khai) |
| **Ngày** | 2021-2022 (estimated) |
| **Bối cảnh** | Cần SPA framework cho enterprise CRM với hàng trăm trang, tích hợp nhiều thư viện UI, ecosystem mature, TypeScript hỗ trợ tốt. |
| **Quyết định** | Dùng **React 17** + **TypeScript 4.5**. |
| **Lựa chọn khác** | Vue 3 (ecosystem nhỏ hơn cho enterprise), Angular 13 (quá cồng kềnh), Svelte (chưa mature đủ thời điểm 2021). |
| **Hậu quả** | ✅ Ecosystem cực lớn, dễ tuyển dev<br>✅ TypeScript tích hợp tốt<br>⚠️ React 17 đã cũ (hiện tại đã có React 19), thiếu concurrent features<br>📋 **Action**: lên kế hoạch upgrade React 18+ |

---

## ADR-02 — Migrate từ Webpack sang Vite

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted (vừa hoàn thành 2026-04) |
| **Ngày** | 2026-04 |
| **Tác giả** | Đội Reborn |
| **Bối cảnh** | Webpack dev server cold start mất hơn 30s. HMR chậm. Build production nặng. Vite dùng ESM native + esbuild → faster. |
| **Quyết định** | Migrate toàn bộ build sang **Vite 8** + Rollup. |
| **Lựa chọn khác** | Tiếp tục Webpack 5 (status quo), Turbopack (chưa ổn định), esbuild thuần (thiếu plugin). |
| **Hậu quả** | ✅ Dev cold start < 3s<br>✅ HMR < 200ms<br>✅ Build production nhanh hơn ~3x<br>⚠️ Một số plugin Webpack không có equivalent → phải tìm thay thế (vd swiper module imports phải sửa)<br>⚠️ Bundle output cấu trúc khác → cần update nginx config |

> **Migration log**: Quá trình migration đã được thực hiện trong session này (2026-04-14), bao gồm sửa Vite config nhiều lần để khớp với layout webpack cũ, fix lỗi Swiper v11 import, xử lý nginx fallback `try_files`.

---

## ADR-03 — Dùng react-router-dom v6 (single Route table)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | App có 167 page module cần URL routing client-side. |
| **Quyết định** | Dùng **react-router-dom v6** với 1 file [`configs/routes.tsx`](../../src/configs/routes.tsx) chứa cả menu config + route table flat. |
| **Lựa chọn khác** | Next.js (file-based routing, SSR — nhưng đây không phải Next, Reborn dùng SPA pure), TanStack Router (mới, chưa mature). |
| **Hậu quả** | ✅ Centralized routing dễ maintain<br>✅ Permission filter trên menu dễ implement<br>⚠️ File 1179 dòng đang phình to → cân nhắc tách theo bounded context<br>⚠️ Không có file-based routing — phải nhớ thêm route khi tạo page mới |

---

## ADR-04 — Không dùng Redux mà dùng Context API

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Cần global state cho user, auth, UI flags, call session. |
| **Quyết định** | Dùng **React Context API** với 5 contexts (`auth`, `user`, `ui`, `call`, `index`) + custom hooks cho data fetching. |
| **Lựa chọn khác** | Redux (boilerplate nhiều, learning curve), MobX (magic), Zustand (nhỏ nhưng mới với team), Recoil (Facebook bỏ rơi). |
| **Hậu quả** | ✅ Đơn giản, dev mới dễ hiểu<br>✅ Không cần action/reducer/selector boilerplate<br>⚠️ Re-render mọi consumer khi context value đổi → hiệu năng kém với data thay đổi nhiều<br>⚠️ Không có dev tool tốt như Redux DevTools<br>📋 **Mitigation**: Tách `callContext` riêng vì call state thay đổi liên tục, không trộn vào userContext |

---

## ADR-05 — Multi-tenant qua row-level isolation (`tenantId` column)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted (suy luận) |
| **Bối cảnh** | Reborn có hàng nghìn tenant. Cần cô lập dữ liệu nhưng không thể có nghìn DB. |
| **Quyết định** | Mọi entity có cột `tenant_id` + `branch_id`. Mọi query filter qua. Header `Hostname` xác định tenant ở mức request. |
| **Lựa chọn khác** | Database per tenant (đắt, ops phức tạp), Schema per tenant (giới hạn ~1000 schema), Hybrid. |
| **Hậu quả** | ✅ Scale tốt, dùng chung tài nguyên<br>✅ Đơn giản query<br>⚠️ Lỗi query thiếu `WHERE tenant_id` → leak data tenant<br>📋 **Mitigation**: Đề xuất dùng **PostgreSQL Row Level Security** để DB tự enforce |

---

## ADR-06 — Client-side API Gateway (URL prefix routing)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ⚠️ Accepted hiện tại, đề xuất review |
| **Bối cảnh** | Backend là microservices (sales, finance, inventory...). Frontend cần biết gọi service nào. |
| **Quyết định** | Frontend tự routing qua URL prefix (`/bizapi/sales`, `/bizapi/finance`...) trong [`fetchConfig.ts`](../../src/configs/fetchConfig.ts). Mỗi prefix map sang env var khác nhau. |
| **Lựa chọn khác** | Server-side API Gateway (Kong, Nginx, Traefik, Apigee). |
| **Hậu quả** | ✅ Đơn giản, không cần thêm hop<br>⚠️ Frontend phải biết tất cả service URLs<br>⚠️ CORS phải config nhiều subdomain<br>⚠️ Khó áp common policy (rate limit, logging) ở 1 chỗ<br>📋 **Đề xuất**: Migrate sang server-side gateway khi scale > 20 services |

---

## ADR-07 — Service layer pattern với apiHelper wrapper

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | 240 service file gọi API. Cần tránh duplicate code fetch + JSON parse. |
| **Quyết định** | Mọi service dùng `apiGet`/`apiPost`/`apiPut`/`apiDelete` từ `services/apiHelper.ts`. Không gọi `fetch()` trực tiếp. |
| **Hậu quả** | ✅ DRY, dễ maintain<br>✅ Có 1 chỗ duy nhất để add interceptor, retry, cache<br>⚠️ Một số service legacy còn dùng `fetch()` trực tiếp → cần audit và migrate |

---

## ADR-08 — ag-grid cho bảng lớn

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Một số trang (Customer list, Invoice list) có hàng nghìn dòng. HTML table render chậm. |
| **Quyết định** | Dùng **ag-grid-community 30** (free version) với React wrapper. Virtual scrolling, không re-render mọi cell. |
| **Lựa chọn khác** | TanStack Table (headless, phải tự style), MUI DataGrid (đẹp nhưng cần MUI ecosystem), react-table (cũ). |
| **Hậu quả** | ✅ Render mượt với 10k+ dòng<br>✅ Built-in sort, filter, pagination<br>⚠️ Bundle size lớn (~500KB)<br>⚠️ Style customization khó<br>⚠️ Một số feature bị paywall (Enterprise version) |

---

## ADR-09 — Không có refresh token logic ở frontend (gap)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ⚠️ Accepted nhưng có technical debt |
| **Bối cảnh** | Khi access token hết hạn, frontend nhận 401 → interceptor xóa cookie → user bị đẩy về login. UX kém vì user đang gõ form bị mất hết. |
| **Quyết định** (hiện tại) | Khi 401: clear cookie, để user redirect login ở next render. |
| **Đề xuất tương lai** | Implement refresh token rotation: catch 401 → call `/oauth/refresh` → retry original request → user không bị logout. |
| **Hậu quả hiện tại** | ❌ UX kém với session dài<br>📋 **Action**: implement trong sprint tới |

---

## ADR-10 — Soft delete cho hầu hết entity

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Cần audit trail. Khách hàng / đơn hàng / hóa đơn không được mất. Pháp luật yêu cầu giữ. |
| **Quyết định** | Mọi entity nghiệp vụ có cột `deleted_at TIMESTAMPTZ NULL`. Query mặc định filter `deleted_at IS NULL`. |
| **Lựa chọn khác** | Hard delete + audit log table. |
| **Hậu quả** | ✅ Recover dễ (chỉ set lại `deleted_at = NULL`)<br>✅ Audit trail tự nhiên<br>⚠️ Index phải có `WHERE deleted_at IS NULL` (partial index)<br>⚠️ Query không cẩn thận → return cả deleted row |

---

## ADR-11 — Lazy load mọi page qua React.lazy()

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | 167 page → bundle initial sẽ rất nặng nếu load hết. |
| **Quyết định** | Mọi page trong [`routes.tsx`](../../src/configs/routes.tsx) đều dùng `React.lazy(() => import("..."))`. Mỗi page = 1 chunk JS. |
| **Hậu quả** | ✅ Initial bundle nhỏ hơn nhiều<br>✅ Cache hit cao (trang user không vào không cần load)<br>⚠️ Lần đầu load page chậm hơn (cần download chunk)<br>📋 **Mitigation**: Suspense fallback hiển thị loading; preload chunks khi hover menu |

---

## ADR-12 — Camunda BPM Engine cho workflow phức tạp

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Có nghiệp vụ cần workflow approval (phê duyệt giảm giá, hợp đồng, quy trình duyệt khách VIP). Hardcode if-else không scale. |
| **Quyết định** | Tích hợp **Camunda BPMN Engine** chạy ở service riêng (`process.env.APP_BPM_URL`). Frontend dùng **bpmn-js** + **@bpmn-io/form-js** để thiết kế workflow trực quan. |
| **Lựa chọn khác** | Hardcode Java/Node logic, n8n (lighter), Temporal (code-first), Zeebe (Camunda Cloud). |
| **Hậu quả** | ✅ Business analyst tự thiết kế workflow không cần code<br>✅ Visual diagram dễ hiểu<br>⚠️ Camunda nặng (Java), thêm 1 service phải maintain<br>⚠️ Bundle frontend lớn vì bpmn-js (~2MB) |

---

## ADR-13 — Custom field model cho hồ sơ khách hàng

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Khách hàng Reborn có nhiều ngành (spa, gym, co-working, homestay) — mỗi ngành cần trường data khác nhau cho khách. Không thể có 1 schema cứng. |
| **Quyết định** | Có core fields cố định (name, phone, email, gender) + **custom fields động** lưu trong table `customer_extra_info` với cấu trúc EAV (Entity-Attribute-Value). Tenant tự định nghĩa fields ở [`SettingCustomer → Định nghĩa trường bổ sung`](../urd/part-03-thanh-vien.md#ur-member-15--định-nghĩa-trường-thông-tin-bổ-sung). |
| **Lựa chọn khác** | JSON column (Postgres JSONB) — query khó, không index theo field cụ thể. |
| **Hậu quả** | ✅ Linh hoạt cho mọi ngành<br>⚠️ Query phức tạp (cần JOIN extra table)<br>⚠️ Performance kém với khách có nhiều custom field<br>⚠️ `fieldCode` không được đổi sau khi tạo (CN-07) — gây ràng buộc UX |

---

## ADR-14 — Hardcode Hostname header (BUG, sẽ fix)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ⚠️ Bug — cần fix trước production |
| **Bối cảnh** | Trong [`fetchConfig.ts:42`](../../src/configs/fetchConfig.ts#L42), header `Hostname` đang hardcode `"kcn.reborn.vn"` cho dev. |
| **Quyết định** (đề xuất) | Đọc từ `location.hostname` runtime, không hardcode. |
| **Hậu quả nếu không fix** | 🔴 **Critical**: deploy production sẽ load nhầm tenant<br>📋 **Action**: fix trong sprint tới, ưu tiên cao |

---

## ADR-15 — API Versioning (chưa có, đề xuất)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | 📋 Proposed |
| **Bối cảnh** | Hiện tại API URL không có version (`/api/customer/filter`). Khi backend đổi shape → frontend break ngay. Không có gradual rollout. |
| **Đề xuất** | URL versioning: `/api/v1/customer/filter`, `/api/v2/customer/filter`. Frontend bind vào version cụ thể qua env var. |
| **Lựa chọn khác** | Header versioning (`Accept: application/vnd.reborn.v2+json`), Query param (`?version=2`). |
| **Hậu quả** | ✅ Backend có thể deploy v2 song song v1 → migrate dần frontend<br>⚠️ Phải maintain 2 version song song một thời gian<br>📋 **Cần**: tài liệu rõ deprecation policy |

---

## ADR-16 — Không có refresh token rotation (đề xuất)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | 📋 Proposed |
| **Bối cảnh** | Refresh token nếu bị steal có thể dùng vô thời hạn. Best practice là rotate mỗi lần dùng. |
| **Đề xuất** | Khi frontend gọi `/oauth/refresh` với refresh_token A → backend trả về access_token mới + refresh_token B. A bị invalidate. Nếu attacker dùng A → biết là leak → revoke toàn bộ session user. |
| **Hậu quả** | ✅ Bảo mật cao hơn<br>⚠️ Phức tạp hơn — phải store toàn bộ refresh token<br>📋 **Cần**: thiết kế DB schema cho token rotation |

---

## ADR-17 — Bundle size optimization (đề xuất action)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | 📋 Proposed |
| **Bối cảnh** | Bundle production hiện ~20MB raw / 5MB gzip — quá lớn so với best practice. Lý do: bpmn-js, ag-grid, slate, exceljs đều load eager. |
| **Đề xuất** | Lazy load các module nặng:<br>1. **bpmn-js** chỉ load khi vào page BPM<br>2. **slate** chỉ khi mở rich text editor<br>3. **exceljs/xlsx** chỉ khi user export<br>4. **highcharts** chỉ khi vào trang báo cáo<br>5. Tách thêm `manualChunks`: `editor`, `chart`, `bpmn`, `excel`<br>6. Cân nhắc dynamic import |
| **Lợi ích dự kiến** | Initial bundle giảm 60-70%, page load lần đầu ≤ 3s |
| **Effort** | 1-2 sprint |

---

## ADR-18 — Chuẩn hóa date library (đề xuất)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | 📋 Proposed |
| **Bối cảnh** | Codebase đang dùng **đồng thời** `moment` 2.29 và `date-fns` 4.1. Tăng bundle size, gây nhầm lẫn. |
| **Đề xuất** | Thống nhất về **date-fns** (lighter, modular, immutable, treeshakable). Migrate dần các chỗ dùng moment. |
| **Lựa chọn khác** | Day.js (API tương tự moment, 2KB), Temporal API (proposal, chưa stable). |
| **Hậu quả** | ✅ Bundle nhỏ hơn ~70KB<br>✅ API nhất quán<br>⚠️ Effort migration lớn vì moment dùng khắp nơi |

---

## Bảng tổng hợp ADR

| ID | Tiêu đề | Trạng thái | Mức ưu tiên |
|----|---------|:----------:|:-----------:|
| ADR-01 | React 17 + TypeScript | ✅ Accepted | — |
| ADR-02 | Migrate Webpack → Vite | ✅ Accepted | Done |
| ADR-03 | react-router-dom v6 | ✅ Accepted | — |
| ADR-04 | Context API thay Redux | ✅ Accepted | — |
| ADR-05 | Multi-tenant row-level | ✅ Accepted | — |
| ADR-06 | Client-side API Gateway | ⚠️ Review | Med |
| ADR-07 | Service layer + apiHelper | ✅ Accepted | — |
| ADR-08 | ag-grid cho bảng lớn | ✅ Accepted | — |
| ADR-09 | Không có refresh token logic | ⚠️ Bug | High |
| ADR-10 | Soft delete | ✅ Accepted | — |
| ADR-11 | Lazy load page | ✅ Accepted | — |
| ADR-12 | Camunda BPM Engine | ✅ Accepted | — |
| ADR-13 | Custom field EAV model | ✅ Accepted | — |
| ADR-14 | Hardcode Hostname (BUG) | 🔴 Bug | **Critical** |
| ADR-15 | API versioning | 📋 Proposed | High |
| ADR-16 | Refresh token rotation | 📋 Proposed | Med |
| ADR-17 | Bundle size optimization | 📋 Proposed | High |
| ADR-18 | Chuẩn hóa date library | 📋 Proposed | Low |

**Thống kê:**
- ✅ Accepted: 12
- ⚠️ Review/Bug: 2
- 🔴 Critical bug: 1
- 📋 Proposed: 4

---

## Cách viết ADR mới

Khi đội cần ra quyết định kiến trúc mới:

1. **Tạo file** `docs/sa/adr/ADR-NN-<title>.md`
2. **Format** theo template trên
3. **Submit PR** để team review
4. **Sau khi merge**: cập nhật bảng tổng hợp này
5. **Trạng thái thay đổi**: thay vì sửa ADR cũ, tạo ADR mới với link `Superseded by ADR-XX`

---

*Hết Part 13.*

---

# Part 14 — Performance, Quality, Risks

## Executive Summary

Part cuối cùng tổng hợp **performance targets** (mapping với URD NFR), **quality strategy** (test pyramid, tooling), **risk register** với mức nghiêm trọng và mitigation plan, và **technical debt** đã quan sát được trong codebase. Đề xuất **action plan** ngắn hạn (1-3 tháng) và dài hạn (6-12 tháng).

---

## 1. Performance — Map với URD NFR

### 1.1. Bảng performance targets

| NFR ID | Yêu cầu | Trạng thái | Cách đạt |
|--------|---------|:----------:|----------|
| NFR-PERF-01 | Page load ≤ 3s | ⚠️ Cần đo | Lazy load + CDN + cache + DB index |
| NFR-PERF-01 | POS add to cart ≤ 500ms | ⚠️ Cần đo | Local state + debounce + optimistic UI |
| NFR-PERF-01 | Báo cáo 1 tháng ≤ 5s | ⚠️ Cần đo | Read replica + materialized view + cache |
| NFR-PERF-01 | Form CRUD submit ≤ 1s | ⚠️ Cần đo | Async UI + skeleton loader |
| NFR-PERF-02 | POS 60 đơn/giờ/staff | ⚠️ Cần test | Tối ưu render + ít re-render |
| NFR-PERF-03 | 50 user concurrent/tenant | ⚠️ Cần load test | Backend horizontal scale |
| NFR-PERF-04 | Báo cáo > 10k bản ghi chạy nền | ⚠️ Cần verify | Background job + queue |

### 1.2. Performance budget

| Metric | Target | Tool đo |
|--------|--------|---------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse, Web Vitals |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Lighthouse |
| **Time to Interactive (TTI)** | < 5s | Lighthouse |
| **Bundle size (gzip)** | < 1MB initial | Webpack analyzer / vite bundle visualizer |

### 1.3. Quan sát hiện tại

| Metric | Hiện tại (estimated) | Target | Gap |
|--------|---------------------|--------|-----|
| **Initial bundle gzip** | ~5 MB | < 1 MB | ❌ 5x |
| **Initial bundle raw** | ~20 MB | < 3 MB | ❌ 7x |
| **CSS bundle** | ~4.6 MB raw / 446 KB gzip | < 200 KB | ❌ 2x |

> **Conclusion**: Bundle hiện tại **vượt budget 5-7 lần**. Cần ưu tiên optimization (xem [ADR-17](part-13-adr.md#adr-17--bundle-size-optimization-đề-xuất-action)).

### 1.4. Performance test plan

| Test | Tool | Tần suất |
|------|------|----------|
| **Lighthouse CI** | Lighthouse | Mỗi PR |
| **Bundle size check** | `vite-bundle-visualizer` | Mỗi PR |
| **Load test** | k6 / Artillery | Trước release lớn |
| **Stress test** | k6 | Hằng quý |
| **Real User Monitoring** | Sentry / Datadog RUM | Production liên tục |

---

## 2. Quality strategy

### 2.1. Test pyramid

```
                    ▲
                   ╱ ╲
                  ╱   ╲       E2E (Playwright) — 5%
                 ╱─────╲      Critical user flows
                ╱       ╲
               ╱─────────╲    Integration — 15%
              ╱           ╲   Page với mock API
             ╱─────────────╲
            ╱               ╲  Unit (Vitest) — 80%
           ╱─────────────────╲ utils, services, hooks, components
          ───────────────────
```

### 2.2. Test coverage targets

| Layer | Coverage target |
|-------|----------------|
| **Utils** | ≥ 90% |
| **Services** | ≥ 80% |
| **Hooks** | ≥ 80% |
| **Components** | ≥ 60% |
| **Pages** | ≥ 40% |
| **Overall** | ≥ 70% |

### 2.3. Tools đề xuất

| Tool | Vai trò |
|------|---------|
| **Vitest** | Unit + integration test runner (đã có Vite, dùng Vitest tự nhiên) |
| **React Testing Library** | Render component trong test |
| **MSW** (Mock Service Worker) | Mock API calls |
| **Playwright** | E2E test (đã có infrastructure cho HDSD!) |
| **Lighthouse CI** | Performance regression |
| **vite-bundle-visualizer** | Bundle analysis |
| **Sentry** | Error tracking + RUM |
| **SonarQube** | Code quality + smell |
| **Snyk** / **Dependabot** | Dependency vulnerability |

### 2.4. Quality gate

PR không merge được nếu:

- ❌ Lint fail
- ❌ Test fail
- ❌ Coverage giảm > 1%
- ❌ Bundle size tăng > 5%
- ❌ Lighthouse score giảm > 5 điểm
- ❌ Có high/critical security vulnerability
- ❌ Chưa có review approve

### 2.5. Test hiện trạng

> 🔴 **Quan sát**: Codebase **không có** test file (`*.test.tsx`, `*.spec.ts`). Có Playwright nhưng cài tách trong `docs/userguides/tooling/` chỉ để chụp ảnh HDSD.

→ **Test coverage hiện tại ước tính: 0%**.

→ Đây là **technical debt lớn nhất** cần action.

---

## 3. Technical debt register

### 3.1. Bảng technical debt

| ID | Mục | Mô tả | Ưu tiên | Effort | Tác động |
|----|-----|-------|:-------:|:------:|---------|
| TD-01 | Bundle size 5-7x quá lớn | Phải lazy load module nặng | 🔴 High | M | Page load chậm, mất khách |
| TD-02 | Hardcode `Hostname` header | Bug critical, leak data tenant nếu lên prod | 🔴 Critical | XS | Security incident |
| TD-03 | Không có test suite | 0% coverage, dễ break | 🔴 High | XL | Regression bug, slow release |
| TD-04 | Refresh token logic thiếu | UX kém, user logout giữa chừng | 🟡 Med | S | UX |
| TD-05 | Page lớn > 3000 dòng (CustomerPersonList) | Khó maintain | 🟡 Med | L | Dev velocity |
| TD-06 | Dùng moment + date-fns lẫn lộn | Bundle phình + nhầm lẫn | 🟢 Low | L | Bundle size |
| TD-07 | React 17 cũ | Thiếu concurrent features | 🟡 Med | L | Innovation |
| TD-08 | Dependency cũ (1-2 năm) | Có CVE chưa patch | 🟡 Med | M | Security |
| TD-09 | Không có ErrorBoundary | 1 page crash → toàn app trắng | 🟡 Med | XS | UX |
| TD-10 | Không có PrivateRoute wrapper | User bypass URL được | 🟡 Med | S | Security |
| TD-11 | Không có CSP/HSTS header | OWASP gap | 🟡 Med | XS | Security |
| TD-12 | Không có distributed tracing | Debug khó với microservices | 🟢 Low | L | Ops |
| TD-13 | Không có idempotency key | Có thể tạo đơn duplicate | 🟡 Med | M | Data integrity |
| TD-14 | API không có versioning | Backend break frontend ngay | 🟡 Med | L | Release flexibility |
| TD-15 | Service vừa fetch raw vừa dùng apiHelper | Inconsistent | 🟢 Low | S | Code quality |
| TD-16 | Mock data trong production bundle | Bloat | 🟢 Low | S | Bundle |
| TD-17 | Comment-out code chưa xóa | Code smell | 🟢 Low | XS | Code quality |
| TD-18 | i18n chỉ có VI/EN, locale files lớn | Locale eager load | 🟢 Low | S | Bundle |

**Effort scale:**
- **XS**: < 1 ngày
- **S**: 1-3 ngày
- **M**: 1-2 tuần
- **L**: 2-4 tuần
- **XL**: > 1 tháng

---

## 4. Risk register

### 4.1. Phân loại risk

| Loại | Mô tả |
|------|-------|
| **Technical** | Liên quan code, kiến trúc, công nghệ |
| **Operational** | Liên quan vận hành, deployment, monitoring |
| **Security** | Liên quan bảo mật, compliance |
| **Business** | Liên quan business model, scope creep, vendor |
| **People** | Liên quan đội ngũ, knowledge, turnover |

### 4.2. Risk register

| ID | Loại | Risk | Likelihood | Impact | Score | Mitigation |
|----|------|------|:----------:|:------:|:-----:|------------|
| R-01 | Security | Hardcode Hostname → tenant leak | High | Critical | 🔴 9 | Fix ngay (TD-02) |
| R-02 | Operational | Backend microservice down → cascade fail | Med | High | 🔴 6 | Circuit breaker, fallback, monitoring |
| R-03 | Performance | Bundle quá lớn → user bỏ | High | High | 🔴 9 | Bundle optimization (TD-01) |
| R-04 | Technical | 0% test coverage → regression | High | High | 🔴 9 | Setup test suite (TD-03) |
| R-05 | Security | Dependency CVE chưa patch | Med | High | 🟡 6 | Snyk + auto update |
| R-06 | Security | Audit log bị tamper | Low | Critical | 🟡 5 | Append-only + offsite backup |
| R-07 | Operational | Database down → toàn bộ system fail | Low | Critical | 🟡 5 | HA cluster, backup, DR |
| R-08 | Business | Vendor lock-in (CDN, cloud, e-invoice) | Med | Med | 🟡 4 | Multi-vendor strategy |
| R-09 | People | Single dev biết toàn bộ codebase | Med | High | 🟡 6 | Documentation (HDSD/URD/SAD), pair programming |
| R-10 | Technical | Migration to React 18+ delayed → stuck với React 17 | Low | Med | 🟢 3 | Plan migration roadmap |
| R-11 | Operational | Backup không restore được khi cần | Low | Critical | 🟡 5 | Test restore monthly |
| R-12 | Security | Token leak qua console.log | Med | High | 🟡 6 | drop_console + audit log |
| R-13 | Performance | DB query không index → slow query | Med | Med | 🟡 4 | Query monitoring + index review |
| R-14 | Operational | DevOps single point of failure | Med | High | 🟡 6 | Cross-train, runbook |
| R-15 | Business | Camunda BPM license/maintain | Low | Med | 🟢 3 | Self-host community edition |
| R-16 | Compliance | Quên backup data > 12 tháng (Luật ANM) | Low | High | 🟡 4 | Automated retention check |
| R-17 | Operational | Cron job stuck → không sinh task chăm sóc | Med | Med | 🟡 4 | Job monitoring + alert |
| R-18 | Security | SQL injection nếu backend không dùng ORM | Low | Critical | 🟡 5 | Code review + SAST tool |

**Score formula:** Likelihood (1-3) × Impact (1-3)

| Score | Mức |
|-------|-----|
| 7-9 | 🔴 Critical |
| 4-6 | 🟡 Medium |
| 1-3 | 🟢 Low |

---

## 5. Action plan

### 5.1. Sprint hiện tại (Critical fix — 2 tuần)

| Action | TD/Risk | Effort | Owner |
|--------|---------|:------:|-------|
| Fix hardcode Hostname header | TD-02, R-01 | XS | Frontend |
| Setup Snyk + Dependabot | TD-08, R-05 | S | DevOps |
| Add ErrorBoundary | TD-09 | XS | Frontend |
| Fix nginx headers (CSP, HSTS) | TD-11 | XS | DevOps |

### 5.2. Q2 2026 (3 tháng)

| Action | TD/Risk | Effort |
|--------|---------|:------:|
| Setup test suite (Vitest + RTL + MSW) | TD-03, R-04 | XL |
| Implement refresh token logic | TD-04 | S |
| Bundle size optimization phase 1 (lazy load bpmn-js, slate, exceljs) | TD-01, R-03 | M |
| Add PrivateRoute wrapper | TD-10 | S |
| Add idempotency key cho POST critical | TD-13 | M |
| Refactor CustomerPersonList page | TD-05 | L |
| Setup distributed tracing | TD-12 | L |

### 5.3. Q3-Q4 2026 (6-12 tháng)

| Action | TD/Risk | Effort |
|--------|---------|:------:|
| Migrate React 17 → 18 | TD-07, R-10 | L |
| API versioning (v1, v2) | TD-14 | L |
| Migrate moment → date-fns | TD-06 | L |
| Server-side API Gateway (Kong/Traefik) | ADR-06 review | XL |
| Performance test + Lighthouse CI | NFR-PERF | M |
| Multi-tenant RLS (PostgreSQL) | R-01 long-term | M |

---

## 6. Quality metrics dashboard (đề xuất)

Setup dashboard hiển thị real-time:

### 6.1. Code quality

- Lines of code (LoC)
- Cyclomatic complexity
- Code duplication %
- Technical debt ratio (theo SonarQube)
- Test coverage trend

### 6.2. Bundle size

- Initial bundle size (gzip)
- Per-page chunk size
- Trend theo thời gian

### 6.3. Build time

- CI duration
- Vite dev cold start
- HMR latency

### 6.4. Production health

- Error rate (Sentry)
- API latency p95/p99
- Uptime (UptimeRobot)

### 6.5. Security

- Open vulnerabilities (Snyk)
- Day since last security incident
- Mean time to patch (MTTP)

---

## 7. Knowledge management

### 7.1. Tài liệu cần có

- ✅ HDSD (đã có) — `docs/userguides/`
- ✅ URD (đã có) — `docs/urd/`
- ✅ SAD (đang viết — Part này) — `docs/sa/`
- 📋 **API documentation** (Swagger/OpenAPI) — chưa có
- 📋 **Onboarding doc** cho dev mới — chưa có
- 📋 **Runbook ops** cho on-call — chưa có
- 📋 **ADR file riêng** trong `docs/sa/adr/` — chưa có

### 7.2. Best practice

- Tài liệu **viết khi quyết định**, không viết hồi tố
- ADR nhẹ (≤ 1 trang) nhưng có
- Code comment chỉ cho **tại sao** (why), không phải **làm gì** (what)
- README mỗi folder lớn

---

## 8. Kết luận & Đề xuất

### 8.1. Strengths của hệ thống

✅ Architecture rõ ràng (layered, microservices)
✅ Code organization tốt (167 page, 240 service, 78 component có pattern nhất quán)
✅ TypeScript đầy đủ
✅ i18n có sẵn
✅ Multi-tenant đã thiết kế từ đầu
✅ Service layer DRY với apiHelper
✅ Vừa hoàn thành migration Vite — modern toolchain

### 8.2. Top 5 gap quan trọng nhất

1. 🔴 **Hardcode Hostname** — fix ngay
2. 🔴 **0% test coverage** — investment lớn nhất
3. 🔴 **Bundle size 5-7x quá lớn** — tối ưu lazy load
4. 🟡 **Refresh token logic thiếu** — fix UX
5. 🟡 **Backend không có document** — đội backend cần xác nhận Part 08 + 12

### 8.3. Priority matrix

```
            Impact High            Impact Low
         ┌─────────────────────┬──────────────────┐
Easy     │ TD-02 Fix hardcode  │ TD-09 Boundary   │
         │ TD-11 Headers       │ TD-15 Service    │
         │ TD-09 Boundary      │ TD-17 Cleanup    │
         ├─────────────────────┼──────────────────┤
Hard     │ TD-01 Bundle opt    │ TD-06 Date lib   │
         │ TD-03 Test suite    │ TD-12 Tracing    │
         │ TD-07 React 18      │ TD-18 Locales    │
         └─────────────────────┴──────────────────┘
```

→ Bắt đầu với góc trên-trái (high impact, easy).

### 8.4. Khuyến nghị final

1. **Tuần 1-2**: Fix Critical gap (TD-02, TD-09, TD-11)
2. **Tháng 1**: Setup test infrastructure (TD-03 phase 1)
3. **Tháng 2**: Bundle optimization phase 1 (TD-01)
4. **Tháng 3**: Refresh token + PrivateRoute (TD-04, TD-10)
5. **Q2-Q3**: Test coverage > 50%, refactor mega pages
6. **Q4**: React 18 migration, API versioning

---

## 9. Câu hỏi mở cho stakeholder

1. **Backend team**: xác nhận Part 08 + Part 12. Có thông tin cụ thể về stack, infra?
2. **DevOps**: có monitoring/logging/alerting hiện tại không? Tool gì?
3. **Security**: có audit/pentest gần đây không? Kết quả?
4. **Product**: có roadmap nào đụng đến scaling lớn (1000+ tenant) trong 6 tháng tới?
5. **QA**: hiện test thủ công thế nào? Sẵn sàng đầu tư automation?
6. **Business**: SLA cam kết với khách hàng là gì? (uptime, response time)

---

## 10. Đánh giá tổng quan

| Khía cạnh | Điểm | Ghi chú |
|-----------|:----:|---------|
| **Architecture clarity** | 8/10 | Rõ ràng, có pattern |
| **Code organization** | 8/10 | Layered tốt, một số mega file |
| **Test coverage** | 1/10 | Critical gap |
| **Documentation** | 7/10 | HDSD/URD/SAD đầy đủ, code comment thiếu |
| **Performance** | 5/10 | Bundle quá lớn |
| **Security** | 6/10 | Có thiết kế nhưng có gap |
| **Scalability** | 7/10 | Multi-tenant + microservices đúng hướng |
| **Maintainability** | 6/10 | Cần refactor mega page + test |
| **DevOps maturity** | ?/10 | Chưa đủ data — đội DevOps trả lời |
| **Compliance** | 7/10 | Có thiết kế cho ANM, NĐ 13, TT78 |
| **TỔNG** | **6.5/10** | Solid foundation, cần đầu tư test + perf + security gap |

---

*Hết Part 14 — Hết SAD bản thảo.*

---

## Bảng tổng kết toàn bộ SAD

| Part | Tiêu đề | Số dòng (ước) | Mức tự tin |
|------|---------|:-------------:|:----------:|
| 00 | Tổng quan | ~250 | 🟢 |
| 01 | Kiến trúc tổng thể | ~300 | 🟢🟡 |
| 02 | Frontend Architecture | ~400 | 🟢 |
| 03 | Tech Stack & Dependencies | ~400 | 🟢 |
| 04 | Routing & Navigation | ~350 | 🟢 |
| 05 | Component & Module | ~350 | 🟢 |
| 06 | Service Layer & API | ~450 | 🟡 |
| 07 | Data Architecture | ~350 | 🟡 |
| 08 | Backend Architecture | ~400 | 🔴 |
| 09 | Integration | ~500 | 🟡 |
| 10 | Security | ~400 | 🟡 |
| 11 | Cross-cutting Concerns | ~400 | 🟡 |
| 12 | Deployment & Infrastructure | ~450 | 🔴 |
| 13 | ADRs (18 records) | ~350 | 🟢🟡 |
| 14 | Performance, Quality, Risks | ~400 | 🟡 |
| **Total** | | **~5,350 dòng** | |

**Phần cần đội backend/DevOps xác nhận** (mức 🔴): Part 08, Part 12
**Phần cần backend xác nhận chi tiết** (🟡): Part 06, 07, 09, 10, 11, 14
**Phần đã verify từ codebase** (🟢): Part 00, 02, 03, 04, 05, 13 (ADR Accepted)

Sau khi đội backend/DevOps cung cấp thông tin, Part 08 và 12 sẽ được rewrite từ 🔴 → 🟢.
