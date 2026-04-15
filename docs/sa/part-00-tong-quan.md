# Part 00 — Tổng quan & Đối tượng đọc

## 1. Mục đích tài liệu

Tài liệu **Solution Architecture Document (SAD)** mô tả **kiến trúc kỹ thuật toàn diện** của Reborn Retail CRM — biến thể *Cửa hàng bán lẻ / Chuỗi / Multi-channel POS*. Đây là **tài liệu kỹ thuật chính** dành cho đội phát triển, vận hành, và các bên liên quan kỹ thuật khác.

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

- **Frontend**: codebase React/TypeScript trong thư mục `src/` của `cloud-crm` branch `reborn-retail` (167+ page modules, 78 components, 240+ service files, 5 contexts, 30+ custom hooks).
- **Build & Bundling**: cấu hình Vite (sau khi migration từ Webpack), tooling.
- **API contract** (góc nhìn frontend): convention gọi API, các URL prefix, fetch interceptor, header chuẩn, error handling.
- **Routing & Navigation**: react-router-dom v6 với 100+ route, sidebar config theo tenant retail.
- **State management**: Context API (5 context), local state, custom hooks pattern.
- **Authentication flow**: SSO redirect, token cookie, role selection.
- **Multi-tenant strategy** (góc nhìn frontend): sử dụng `Hostname` header, `branchId`, `tenantId`.
- **Integration interfaces**: SSO, payment gateway, e-invoice (VNPay, VNPT, M-Invoice), SMS, email, Zalo, Facebook, vận chuyển (GHN, GHTK, VNPost), marketplace (Shopee/Lazada), webhook outbound.
- **Suy luận về Backend**: các bounded context backend dựa trên URL prefix (`/sales`, `/inventory`, `/logistics`, `/care`, `/market`, `/billing`, `/integration`, `/notification`, ...). Lưu ý: `/finance` chỉ phục vụ banking (Athena) — cashbook/debt/fund nằm trong `sales`; warehouse là sub-domain của `inventory`.
- **Kiến trúc deployment đề xuất** dựa trên best practice cho stack tương đương.
- **Các quyết định kiến trúc** (ADR) quan sát được hoặc đề xuất.

### 2.2. Ngoài phạm vi (Out-of-scope)

- **Source code backend** chi tiết (không có trong repository này).
- **Database physical schema** (không có file migration, chỉ có thể suy từ TypeScript model).
- **Infrastructure-as-code** thực tế (không có Terraform/Pulumi/CloudFormation trong repo).
- **CI/CD pipeline** thực tế (không có `.github/workflows/`, `.gitlab-ci.yml` trong repo).
- **Monitoring & alerting cụ thể** (không có cấu hình Prometheus/Grafana).
- **Performance benchmark thực tế** (không có file load test).
- **Network topology nội bộ** (firewall, VPN, security groups).
- **Đặc tả kỹ thuật của BPM engine** (tham chiếu prefix `/bpmapi` nhưng engine nằm ở repo khác).
- **POS hardware integration** chi tiết (máy in nhiệt, két tiền, scanner) — chỉ có driver layer.

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

> Reborn Retail CRM là **multi-tenant SaaS** xây trên **kiến trúc microservices** với **frontend SPA** (React/TypeScript/Vite) duy nhất gọi tới **nhiều backend service** qua **API gateway** (URL prefix routing).
>
> **Mỗi tenant** được cô lập dữ liệu qua trường `tenantId` + header `Hostname`, **xác thực** qua **SSO trung tâm** của Reborn (OAuth/OIDC), **phân quyền** theo role-based với cây quyền chi tiết.
>
> Hệ thống tích hợp với **15+ dịch vụ bên ngoài** (payment gateway, e-invoice VN, SMS, email, Zalo, Facebook, logistics, marketplace Shopee/Lazada, BPM engine) qua REST API và webhook hai chiều, hỗ trợ **deploy multi-environment** (dev/staging/production) trên hạ tầng cloud với khả năng **scale ngang** theo tải POS peak giờ.

## 5. Architectural Drivers (Chất lượng mục tiêu)

Các yêu cầu phi chức năng chính (chi tiết ở [URD Part 13](../urd/part-13-bpm-automation.md) và SAD Part 14) định hướng kiến trúc:

| Driver | Yêu cầu | Hậu quả kiến trúc |
|--------|---------|-------------------|
| **Multi-tenancy** | 1.000+ tenant, dữ liệu cô lập | Tenant ID column + row-level filter ở mọi query |
| **POS Performance** | Add-to-cart ≤ 200ms, tạo đơn ≤ 500ms | SPA cache giỏ hàng, chỉ gọi BE khi submit |
| **High Concurrency** | 50+ POS terminal cùng lúc/tenant peak | Horizontal scaling, stateless API, queue cho heavy job |
| **Availability** | ≥ 99.5% uptime, RTO ≤ 4h, RPO ≤ 1h | Stateless API + load balancer + read replicas + backup hourly |
| **Inventory Consistency** | Tồn kho không được âm, đồng bộ đa kênh | Optimistic lock + reserved qty + marketplace sync queue |
| **Security** | Cô lập tenant, OWASP top 10, audit | RBAC, encryption, HMAC webhook, hash password |
| **Maintainability** | Onboarding dev mới ≤ 1 tuần | Clear folder structure, naming conventions, ADR |
| **Localization** | VI/EN, định dạng locale-aware | i18next, locale config per tenant |
| **Compliance** | Luật ANM, NĐ 13/2023, TT78 (e-invoice) | Data tại VN, audit log ≥ 2 năm, integration với CA |
| **Offline tolerance** | POS có thể cache giỏ hàng khi mất mạng ngắn | Local state + retry queue (không đầy đủ offline mode) |

## 6. Tổng quan công nghệ

> ⚠️ **Lưu ý:** Tóm tắt nhanh — chi tiết đầy đủ ở [Part 03](part-03-tech-stack.md).

```
┌──────────────────────────────────────────────────┐
│  CLIENT                                          │
│  ├─ Browser SPA (Chrome/Edge/Safari/Firefox)    │
│  ├─ POS Terminal (+máy in nhiệt, scanner, két)  │
│  └─ Mobile warehouse (PWA scanner quét SKU)     │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS
┌──────────────────────────────────────────────────┐
│  FRONTEND APPLICATION                            │
│  ├─ React 17.0.2 + TypeScript 4.5               │
│  ├─ Vite 5.x (đã migrate từ Webpack)            │
│  ├─ react-router-dom v6 (100+ routes)           │
│  ├─ Context API (5 contexts)                    │
│  ├─ ag-grid 30 (bảng lớn — POS, kho)            │
│  ├─ react-i18next (VI/EN)                       │
│  ├─ react-toastify (notifications)              │
│  └─ ~120+ thư viện khác (xem package.json)      │
└────────────────────┬─────────────────────────────┘
                     │ REST + JSON
┌──────────────────────────────────────────────────┐
│  API GATEWAY (URL prefix routing)               │
│  ├─ /api      → Main API                         │
│  ├─ /adminapi → Admin API                        │
│  ├─ /bizapi   → Business APIs                    │
│  │   ├─ /sales (POS, cashbook, debt, fund)       │
│  │   ├─ /inventory (kho, warehouse, PO, NCC)     │
│  │   ├─ /care (ticket, warranty, feedback)       │
│  │   ├─ /billing (VAT e-invoice)                 │
│  │   ├─ /logistics (shipping, COD)               │
│  │   ├─ /integration (marketplace, MSAL, ...)    │
│  │   ├─ /market (campaign, voucher, loyalty)     │
│  │   ├─ /notification (SMS/Email/Zalo/FB)        │
│  │   └─ /finance (banking only — Athena)         │
│  ├─ /bpmapi   → BPM Engine                       │
│  └─ /authenticator → Auth/SSO                    │
└────────────────────┬─────────────────────────────┘
                     │
┌──────────────────────────────────────────────────┐
│  MICROSERVICES (9/11 dùng cho retail)            │
│  ├─ sales (POS, order, shift, cashbook,          │
│  │         payment, debt, fund, invoice)         │
│  ├─ inventory (stock, warehouse ops, PO, NCC)    │
│  ├─ logistics (shipping, COD, tracking)          │
│  ├─ billing (VAT e-invoice TT78/NĐ123)           │
│  ├─ care (ticket, warranty, feedback, CSKH)      │
│  ├─ market (campaign, voucher, loyalty,          │
│  │           marketing automation)               │
│  ├─ integration (marketplace sync, MSAL,         │
│  │               payment, e-invoice, SMS/Email)  │
│  ├─ notification (SMS/Email/push/Zalo OA/FB)     │
│  ├─ finance (BANKING ONLY — Athena)              │
│  │           ⚠ retail thường không dùng          │
│  ├─ Platform: /authenticator (SSO)               │
│  └─ Platform: /bpmapi (BPM workflow engine)      │
└────────────────────┬─────────────────────────────┘
                     │
┌──────────────────────────────────────────────────┐
│  DATA LAYER                                      │
│  ├─ PostgreSQL (master + read replicas)          │
│  ├─ Redis (cache + queue + session)              │
│  ├─ S3-compatible Object Storage (ảnh SP, file)  │
│  └─ Search index (Elasticsearch?) cho tìm SKU    │
└──────────────────────────────────────────────────┘
```

## 7. Điểm khác biệt với biến thể Community Hub

Reborn có nhiều biến thể dùng chung codebase. So với biến thể **Community Hub** (spa, cộng đồng, co-working):

| Aspect | Community Hub | Retail |
|---|---|---|
| **Ưu tiên cốt lõi** | Check-in, quota dịch vụ, booking | POS, tồn kho, đa chi nhánh |
| **Menu chính** | Lễ tân, dịch vụ, lưu trú | Bán hàng, kho, mua hàng, vận chuyển |
| **Đơn hàng trung bình** | Gói thành viên, 1-3 món/đơn | 5-20 món/đơn, nhiều biến thể |
| **Tồn kho** | Đơn giản, ít SKU | Phức tạp, nhiều kho, chuyển kho |
| **Tích hợp ngoại** | Zalo, SMS, loyalty | + Marketplace, Logistics, e-invoice |
| **Khác biệt data** | `service_quota`, `checkin` | `stock_movement`, `po_line`, `shipment` |

Cả 2 biến thể cùng core: auth SSO, tenant, customer, sales (cashbook/debt/fund), reporting. Khác biệt nằm ở **module active** (qua routes.tsx + permission code) và **default dashboard**.

## 8. Quy ước trong tài liệu

### 8.1. Trích dẫn code

```
[file: src/configs/fetchConfig.ts:42]  → Hostname header hardcode
[file: src/services/OrderSalesService.ts] → tạo đơn bán
[file: vite.config.ts:93] → base URL
```

### 8.2. Box mức độ tự tin

Phần nào không phải 🟢 sẽ có box ngay đầu mục:

> ⚠️ **Mức độ tự tin: Trung bình** — phần này được suy luận từ \<nguồn\>, đội backend cần xác nhận.

### 8.3. Ký hiệu sơ đồ

(Đã mô tả ở README.)

## 9. Lịch sử phiên bản

| Version | Ngày | Tác giả | Thay đổi |
|---------|------|---------|----------|
| 0.1 (Draft) | 2026-04-15 | Reborn (reverse-engineered từ branch reborn-retail) | Bản thảo đầu tiên |

## 10. Phê duyệt

| Vai trò | Họ tên | Chữ ký | Ngày |
|---------|--------|--------|------|
| Architect | | | |
| Tech Lead Frontend | | | |
| Tech Lead Backend | | | |
| DevOps Lead | | | |
| Security Lead | | | |

---

*Hết Part 00.*
