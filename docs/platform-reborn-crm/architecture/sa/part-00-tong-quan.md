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
