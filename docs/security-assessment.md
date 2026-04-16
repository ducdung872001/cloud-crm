# Security Assessment Report — Reborn Retail CRM

**Phiên bản:** 1.0  
**Ngày đánh giá:** 2026-04-16  
**Đánh giá bởi:** Reborn Security Team  
**Hệ thống:** Reborn Retail CRM (cloud-crm) — Quản lý chuỗi bán lẻ  
**Chuẩn áp dụng:** OWASP Top 10 — 2021 Edition

---

## 1. Tóm tắt

### 1.1 Phạm vi đánh giá (Scope)

| Hạng mục | Chi tiết |
|---|---|
| Ứng dụng | Reborn Retail CRM — Frontend SPA (React 18 + Vite) |
| Backend | 11 microservices (API Gateway, CRM, HRM, Inventory, Invoice, Cashbook, Loyalty, Tax, Notification, Report, Settings) |
| Hạ tầng | Multi-tenant SaaS, hostname-based tenant isolation |
| Xác thực | SSO Reborn (cookie-based) + JWT token |
| Phân quyền | RBAC — role/permission per tenant + branch |

### 1.2 Phương pháp đánh giá (Methodology)

- **Code review** — Source code frontend (React/TypeScript), cấu hình Vite, dependency audit
- **Architecture review** — Kiến trúc multi-tenant, luồng xác thực, phân quyền
- **OWASP Top 10 mapping** — Đánh giá từng hạng mục theo OWASP 2021
- **Dependency analysis** — `package.json`, lockfile, known vulnerabilities

### 1.3 Thang đánh giá rủi ro

| Mức độ | Mô tả |
|---|---|
| **Critical** | Có thể bị khai thác ngay, ảnh hưởng toàn hệ thống hoặc rò rỉ dữ liệu nghiêm trọng |
| **High** | Rủi ro cao, cần khắc phục trong sprint tiếp theo |
| **Medium** | Rủi ro trung bình, cần lên kế hoạch khắc phục trong 1-2 tháng |
| **Low** | Rủi ro thấp hoặc cải thiện best practice |
| **Info** | Ghi nhận, không ảnh hưởng trực tiếp |

### 1.4 Tổng quan kết quả

| Mức độ | Số lượng |
|---|---|
| Critical | 2 |
| High | 3 |
| Medium | 3 |
| Low | 2 |
| **Tổng** | **10** |

---

## 2. Kiến trúc bảo mật hiện tại

### 2.1 Xác thực (Authentication)

- **SSO Reborn** — Xác thực tập trung qua cookie-based SSO. User đăng nhập một lần, cookie session được set cho domain `*.reborn.vn`.
- **JWT Token** — Sau khi SSO xác thực, backend cấp JWT token cho các API call giữa microservices.
- **Azure MSAL** — Tích hợp `@azure/msal-browser` cho xác thực Microsoft (tuỳ chọn).
- **Firebase Auth** — Tích hợp Firebase cho push notification, không dùng cho auth chính.
- **Fingerprint** — Sử dụng `@fingerprintjs/fingerprintjs` để nhận diện thiết bị.

### 2.2 Phân quyền (Authorization)

- **RBAC** — Role-Based Access Control với permission granular theo từng chức năng (view, create, edit, delete).
- **Multi-tenant isolation** — Mỗi tenant được xác định qua hostname (ví dụ: `tenant1.reborn.vn`). Backend resolve tenant từ header `Hostname`.
- **Branch-level** — Permission có thể phân theo chi nhánh (branch) trong cùng một tenant.
- **Frontend enforcement** — Permission list được lưu tại `localStorage` và kiểm tra trên UI để ẩn/hiện chức năng.

### 2.3 Bảo vệ dữ liệu

- **HTTPS** — Enforced cho tất cả môi trường production.
- **DOMPurify** — Sanitize HTML input trong RebornEditor (Slate-based rich text editor) để chống XSS.
- **Cookie token** — Session token lưu trong cookie, không lưu JWT trong localStorage.

### 2.4 Kiến trúc Multi-tenant

```
[Browser] → hostname: tenant1.reborn.vn
    ↓
[CDN / Load Balancer] → HTTPS termination
    ↓
[API Gateway] → Extract hostname header → Resolve tenant_id
    ↓
[Microservice] → Query WHERE tenant_id = ? AND ...
```

---

## 3. OWASP Top 10 — 2021 Checklist

| # | Hạng mục | Trạng thái | Phát hiện | Khuyến nghị |
|---|---|---|---|---|
| **A01** | Broken Access Control | **Một phần** | RBAC được triển khai nhưng permission list lưu tại `localStorage` trên frontend. Frontend chỉ ẩn/hiện UI — nếu attacker thay đổi localStorage hoặc gọi API trực tiếp, cần đảm bảo backend verify lại toàn bộ permission. | Backend **BẮT BUỘC** verify permission trên mỗi API call. Không tin tưởng frontend enforcement. Implement middleware `checkPermission(resource, action)` trên API Gateway. |
| **A02** | Cryptographic Failures | **Một phần** | HTTPS enforced. Session token lưu cookie. Tuy nhiên cần xác nhận cookie có flags `HttpOnly`, `Secure`, `SameSite=Strict`. Chưa rõ password hashing algorithm phía SSO. | Audit cookie flags trên production. Xác nhận SSO dùng bcrypt/argon2 cho password hash. Đảm bảo không có sensitive data trong JWT payload. |
| **A03** | Injection | **Đạt** | Frontend sử dụng `dompurify@3.3.3` để sanitize HTML trong RebornEditor — chống Stored XSS. Backend sử dụng parameterized queries (ORM) — chống SQL Injection. `escape-html` package có mặt trong dependencies. | Tiếp tục duy trì. Review các điểm render `dangerouslySetInnerHTML` nếu có. Đảm bảo tất cả user input qua API đều được validate + sanitize phía backend. |
| **A04** | Insecure Design | **Một phần** | Multi-tenant isolation dựa vào `WHERE tenant_id = ?` trong query. Nếu developer quên thêm điều kiện → cross-tenant data leak. Không có Row-Level Security (RLS) tại database level. | Triển khai **RLS (Row-Level Security)** tại PostgreSQL hoặc **ORM global scope** tự động inject `tenant_id` vào mọi query. Thêm integration test kiểm tra cross-tenant isolation. |
| **A05** | Security Misconfiguration | **Một phần** | Header `Hostname` được hardcode trong dev mode. Nếu production không wire dynamic → attacker có thể forge hostname header để truy cập tenant khác. Vite config có thể expose source map ở production. | Đảm bảo `Hostname` header được set từ reverse proxy (Nginx/ALB), không cho client tự set. Tắt source map trong `vite build --mode prod`. Review CORS policy. |
| **A06** | Vulnerable & Outdated Components | **Một phần** | Không dùng `moment.js` (đã migrate sang `date-fns@4`). Tuy nhiên có các dependencies nặng và có thể outdated: `xlsx@0.18.5`, `sip.js@0.8.3` (rất cũ), `react-json-view@1.21.3`. Nhiều duplicate libs (`react-color` + `react-colorful`). | Chạy `npm audit` / `yarn audit` định kỳ. Loại bỏ duplicate packages. Upgrade `sip.js` lên bản mới nhất. Xem xét thay `xlsx` bằng `exceljs` (đã có). |
| **A07** | Identification & Authentication Failures | **Một phần** | SSO Reborn hoạt động tốt. Tuy nhiên không thấy 2FA/MFA được triển khai. Không có rate limiting rõ ràng cho login endpoint. Session timeout policy chưa rõ. | Triển khai **TOTP** (Google Authenticator) hoặc **SMS OTP** cho 2FA. Implement rate limiting (5 lần/phút) cho login. Thiết lập session timeout (30 phút idle). |
| **A08** | Software & Data Integrity Failures | **Một phần** | Sử dụng `yarn.lock` (yarn 4.12) để lock dependencies. Có `husky` + `lint-staged` cho pre-commit hooks. Tuy nhiên không có artifact signing cho build output, không có SBOM. | Tạo **SBOM** (Software Bill of Materials) cho mỗi release. Xem xét sign Docker images. Verify integrity của CI/CD pipeline (GitHub Actions). |
| **A09** | Security Logging & Monitoring Failures | **Một phần** | Có `audit_log` table ghi lại các thao tác quan trọng (CRUD). Tuy nhiên không có SIEM hoặc centralized logging. Không có alerting cho suspicious activities. | Triển khai centralized logging (ELK Stack hoặc Grafana Loki). Setup alert cho: nhiều login fail, cross-tenant attempt, bulk data export. Retain logs tối thiểu 12 tháng. |
| **A10** | Server-Side Request Forgery (SSRF) | **Chưa đánh giá** | Cần review backend code cho các endpoint webhook, integration, file upload URL. Frontend có `fetch-intercept` — cần kiểm tra không có open redirect. | Review tất cả backend endpoints nhận URL input. Whitelist allowed domains cho webhook/callback. Chặn internal IP ranges (10.x, 172.16.x, 192.168.x). |

---

## 4. Phát hiện theo mức độ

| ID | Mức độ | Mô tả | Vị trí | Khuyến nghị | Trạng thái |
|---|---|---|---|---|---|
| SEC-001 | **Critical** | Permission chỉ enforce phía frontend (localStorage). Backend API có thể bị gọi trực tiếp mà bypass RBAC nếu thiếu middleware verify. | Frontend: localStorage permission cache; Backend: API endpoints | Implement backend permission middleware trên mọi API endpoint. Không dựa vào frontend check. | Mở |
| SEC-002 | **Critical** | Multi-tenant isolation chỉ dựa vào application-level `WHERE tenant_id = ?`. Một query thiếu điều kiện → cross-tenant data leak cho toàn bộ dữ liệu. | Backend: tất cả microservices, database queries | Triển khai PostgreSQL RLS hoặc ORM global scope. Thêm automated test kiểm tra tenant isolation. | Mở |
| SEC-003 | **High** | Hostname header có thể bị forge nếu không được set bởi reverse proxy. Attacker gửi `Hostname: victim-tenant.reborn.vn` → truy cập tenant khác. | Backend: API Gateway, hostname resolution | Reverse proxy (Nginx/ALB) phải override `Hostname` header. Backend reject request nếu hostname không match. | Mở |
| SEC-004 | **High** | Không có 2FA/MFA. Nếu credential bị lộ (phishing, credential stuffing) → attacker truy cập toàn bộ dữ liệu tenant. | SSO Reborn authentication flow | Triển khai TOTP hoặc SMS OTP. Bắt buộc 2FA cho admin roles. | Mở |
| SEC-005 | **High** | Chưa xác nhận cookie flags (`HttpOnly`, `Secure`, `SameSite`). Nếu thiếu `HttpOnly` → XSS có thể đánh cắp session token. | SSO cookie configuration | Audit và enforce: `HttpOnly=true`, `Secure=true`, `SameSite=Strict`. | Cần xác nhận |
| SEC-006 | **Medium** | `sip.js@0.8.3` rất cũ (phiên bản hiện tại 0.21.x). Có thể chứa known vulnerabilities. Tương tự `react-doc-viewer@0.1.5`. | `package.json` dependencies | Upgrade hoặc loại bỏ nếu không sử dụng. Chạy `yarn audit` để xác nhận. | Mở |
| SEC-007 | **Medium** | Không có centralized logging hoặc SIEM. Khó phát hiện và response khi có security incident. | Infrastructure / Operations | Triển khai ELK Stack hoặc Grafana Loki. Setup alerting rules cho suspicious patterns. | Mở |
| SEC-008 | **Medium** | Source map có thể bị expose trong production build nếu Vite config không tắt. Attacker có thể đọc source code gốc. | `vite.config.ts`, build configuration | Đảm bảo `build.sourcemap = false` cho production mode. Kiểm tra deployed assets. | Cần xác nhận |
| SEC-009 | **Low** | Duplicate dependencies (`react-color` + `react-colorful`, `xlsx` + `exceljs`) tăng attack surface không cần thiết. | `package.json` | Loại bỏ duplicate. Giữ một package cho mỗi chức năng. | Mở |
| SEC-010 | **Low** | Không có SBOM (Software Bill of Materials) hoặc artifact signing cho release builds. | CI/CD pipeline | Tạo SBOM tự động trong CI. Xem xét Sigstore cho container signing. | Mở |

---

## 5. Khuyến nghị ưu tiên

### Top 5 hành động cần thực hiện ngay

| # | Hành động | Mức độ | Effort | Timeline |
|---|---|---|---|---|
| 1 | **Backend permission middleware** — Implement middleware verify RBAC trên mọi API endpoint. Không tin tưởng frontend localStorage. | Critical | Medium | Sprint 1 (2 tuần) |
| 2 | **Database RLS / ORM tenant scope** — Triển khai Row-Level Security hoặc ORM global scope để tự động inject `tenant_id`. Thêm integration test cross-tenant. | Critical | High | Sprint 1-2 (4 tuần) |
| 3 | **Hostname header hardening** — Reverse proxy override hostname, backend reject mismatched requests. Audit cookie flags (`HttpOnly`, `Secure`, `SameSite`). | High | Low | Sprint 1 (1 tuần) |
| 4 | **2FA cho admin accounts** — Triển khai TOTP (Google Authenticator) cho vai trò admin/manager. SMS OTP cho user thường (phase 2). | High | Medium | Sprint 2-3 (4 tuần) |
| 5 | **Dependency audit & cleanup** — Chạy `yarn audit`, upgrade `sip.js`, loại bỏ duplicate packages, tắt source map production. | Medium | Low | Sprint 1 (3 ngày) |

---

## 6. Tuân thủ pháp luật

### 6.1 Nghị định 13/2023/NĐ-CP — Bảo vệ dữ liệu cá nhân (PDPA Việt Nam)

| Yêu cầu | Hiện trạng | Hành động cần thiết |
|---|---|---|
| Thu thập dữ liệu có đồng ý | Chưa rõ consent mechanism | Thêm checkbox đồng ý khi thu thập thông tin khách hàng (tên, SĐT, email, địa chỉ) |
| Quyền truy cập / xoá dữ liệu | Có API delete customer nhưng chưa có self-service portal | Xây dựng tính năng "yêu cầu xoá dữ liệu cá nhân" cho end-customer |
| Thông báo khi xảy ra sự cố | Không có incident response plan | Xây dựng quy trình thông báo trong 72 giờ khi phát hiện rò rỉ dữ liệu |
| Chỉ định người phụ trách BVDLCN | Chưa có DPO | Chỉ định Data Protection Officer cho tổ chức |
| Đánh giá tác động xử lý DLCN | Chưa thực hiện DPIA | Thực hiện Data Protection Impact Assessment cho module Customer, Loyalty |

### 6.2 Thông tư 78/2021/TT-BTC — Hoá đơn điện tử

| Yêu cầu | Hiện trạng | Hành động cần thiết |
|---|---|---|
| Ký số hoá đơn | Tích hợp qua tax microservice | Đảm bảo private key lưu trữ an toàn (HSM hoặc KMS) |
| Lưu trữ hoá đơn 10 năm | Database retention | Thiết lập backup policy, archive strategy cho dữ liệu hoá đơn |
| Truyền dữ liệu lên CQT | API integration với Tổng cục Thuế | Đảm bảo TLS 1.2+ cho kết nối, validate certificate CQT |

### 6.3 PCI DSS — Thanh toán thẻ (nếu áp dụng)

| Yêu cầu | Hiện trạng | Khuyến nghị |
|---|---|---|
| Không lưu trữ PAN/CVV | CRM không xử lý thanh toán thẻ trực tiếp | Nếu tích hợp payment gateway — KHÔNG lưu card data. Dùng tokenization (Stripe, VNPay). |
| PCI SAQ phù hợp | Chưa đánh giá | Nếu có redirect sang payment gateway → SAQ A. Nếu có iframe → SAQ A-EP. |
| Mã hoá dữ liệu thẻ | N/A hiện tại | Đảm bảo không bao giờ log hoặc lưu card number trong hệ thống CRM. |

---

## Phụ lục

### A. Công cụ đánh giá
- Manual code review (React/TypeScript source)
- `yarn audit` — dependency vulnerability scan
- OWASP Top 10 2021 checklist
- Architecture diagram review

### B. Tài liệu tham khảo
- [OWASP Top 10 — 2021](https://owasp.org/Top10/)
- [Nghị định 13/2023/NĐ-CP](https://thuvienphapluat.vn/van-ban/Cong-nghe-thong-tin/Nghi-dinh-13-2023-ND-CP-bao-ve-du-lieu-ca-nhan-357107.aspx)
- [Thông tư 78/2021/TT-BTC](https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Thong-tu-78-2021-TT-BTC-huong-dan-Luat-Quan-ly-thue-va-Nghi-dinh-123-2020-ND-CP-488978.aspx)
- [PCI DSS v4.0](https://www.pcisecuritystandards.org/)

---

*Tài liệu này cần được review và cập nhật mỗi quý hoặc sau mỗi thay đổi kiến trúc lớn.*
