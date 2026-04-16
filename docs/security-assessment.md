# Đánh giá Bảo mật — Reborn-Tech B2B CRM

> Dự án: CRM doanh nghiệp lớn / công ty công nghệ (B2B)
> Ngày đánh giá: 2026-04-16
> Phiên bản: 1.0
> Phương pháp: OWASP Top 10 (2021) + kiểm tra thủ công

---

## 1. Bối cảnh

Hệ thống B2B CRM xử lý dữ liệu nhạy cảm bao gồm:
- **Thông tin khách hàng doanh nghiệp:** tên công ty, MST, địa chỉ, người liên hệ (PII)
- **Hợp đồng & tài chính:** giá trị hợp đồng, điều khoản, hóa đơn, công nợ, hoa hồng
- **Dữ liệu kinh doanh:** pipeline bán hàng, chiến lược giá, forecast doanh thu
- **Thông tin nội bộ:** KPI nhân viên, cấu trúc phân quyền, quy trình phê duyệt

Việc rò rỉ hoặc truy cập trái phép có thể gây thiệt hại tài chính, mất khách hàng, và vi phạm pháp luật.

---

## 2. OWASP Top 10 Checklist (2021)

| # | Hạng mục | Trạng thái | Mô tả đánh giá |
|---|----------|------------|-----------------|
| A01 | Broken Access Control | :warning: **Có finding** | Phát hiện lỗi permission bypass và cross-tenant (xem Finding #1, #2) |
| A02 | Cryptographic Failures | :white_check_mark: Đạt | Password bcrypt, JWT RS256, HTTPS enforced, DB connection TLS |
| A03 | Injection | :white_check_mark: Đạt | ORM parameterized query, input sanitization, no raw SQL |
| A04 | Insecure Design | :warning: **Có finding** | Thiếu 2FA cho admin/finance role (xem Finding #3) |
| A05 | Security Misconfiguration | :warning: **Có finding** | Hostname forgery, CORS wildcard ở staging (xem Finding #4) |
| A06 | Vulnerable & Outdated Components | :white_check_mark: Đạt | npm audit clean, dependencies updated monthly |
| A07 | Identification & Authentication Failures | :warning: **Có finding** | Brute-force protection có nhưng thiếu 2FA (xem Finding #3) |
| A08 | Software & Data Integrity Failures | :white_check_mark: Đạt | CI/CD pipeline secure, dependency lock file, signed releases |
| A09 | Security Logging & Monitoring Failures | :warning: **Có finding** | Audit log có nhưng thiếu alert real-time (xem Finding #7) |
| A10 | Server-Side Request Forgery (SSRF) | :white_check_mark: Đạt | URL validation, whitelist external services |

---

## 3. Danh sách Finding

### Finding #1 — Permission Bypass qua API trực tiếp

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **CRITICAL** |
| **OWASP** | A01 — Broken Access Control |
| **Mô tả** | Một số API endpoint kiểm tra quyền ở frontend (ẩn button) nhưng không enforce ở backend middleware. Người dùng có thể gọi API trực tiếp (Postman/curl) để thực hiện hành động không được phép: xóa hợp đồng, sửa hoa hồng, export danh sách khách hàng. |
| **Bước tái hiện** | 1. Đăng nhập tài khoản Sales. 2. Copy JWT token. 3. Gọi `DELETE /api/contracts/:id` bằng curl → thành công dù Sales không có quyền xóa. |
| **Ảnh hưởng** | Nhân viên cấp thấp có thể xóa/sửa dữ liệu quan trọng. Rủi ro mất dữ liệu hợp đồng, sai lệch tài chính. |
| **Khắc phục** | Implement permission middleware ở tất cả API endpoint. Áp dụng decorator `@RequirePermission('contract.delete')` cho mọi route. Viết integration test verify RBAC ở API layer. |
| **Ưu tiên** | Fix ngay — trước khi go-live |

### Finding #2 — Cross-Tenant Data Access

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **CRITICAL** |
| **OWASP** | A01 — Broken Access Control |
| **Mô tả** | Trong kiến trúc multi-tenant, một số query không tự động filter theo `tenant_id`. Bằng cách thay đổi ID trong URL (`/api/customers/123` → `/api/customers/456`), user tenant A có thể xem dữ liệu tenant B. |
| **Bước tái hiện** | 1. Đăng nhập tenant A. 2. Lấy customer ID từ tenant B (qua API list nếu bị lộ, hoặc brute-force ID). 3. Gọi `GET /api/customers/{id_tenant_B}` → trả về dữ liệu. |
| **Ảnh hưởng** | Rò rỉ toàn bộ dữ liệu khách hàng, hợp đồng, tài chính giữa các tenant. Vi phạm nghiêm trọng NĐ 13/2023 về bảo vệ dữ liệu cá nhân. |
| **Khắc phục** | Implement global middleware tự động inject `WHERE tenant_id = ?` cho mọi query. Row-level security ở DB layer. Penetration test cross-tenant cho tất cả entity. UUID thay vì auto-increment ID. |
| **Ưu tiên** | Fix ngay — trước khi go-live |

### Finding #3 — Thiếu xác thực 2 yếu tố (2FA)

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **HIGH** |
| **OWASP** | A04, A07 — Insecure Design / Authentication Failures |
| **Mô tả** | Hệ thống chỉ xác thực bằng email + password. Không có 2FA (OTP, TOTP, SMS). Tài khoản Admin và Finance có quyền truy cập toàn bộ dữ liệu nhạy cảm chỉ với 1 lớp bảo vệ. |
| **Ảnh hưởng** | Nếu password bị lộ (phishing, credential stuffing), attacker truy cập được toàn bộ hệ thống bao gồm hợp đồng, tài chính, và dữ liệu khách hàng. |
| **Khắc phục** | Implement TOTP 2FA (Google Authenticator) bắt buộc cho Admin, Finance, Manager role. Optional cho Sales. Hỗ trợ recovery code. |
| **Ưu tiên** | Fix trước go-live |

### Finding #4 — Host Header Injection / Hostname Forgery

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **HIGH** |
| **OWASP** | A05 — Security Misconfiguration |
| **Mô tả** | Server không validate Host header. Attacker có thể inject hostname giả trong request, khiến link reset password, email notification chứa URL độc hại trỏ về server attacker. |
| **Bước tái hiện** | 1. Gửi request reset password với header `Host: evil.com`. 2. Email reset password chứa link `https://evil.com/reset?token=xxx`. |
| **Ảnh hưởng** | Chiếm đoạt tài khoản qua phishing link trong email chính thống của hệ thống. |
| **Khắc phục** | Whitelist allowed hostnames trong config. Validate Host header ở middleware. Hardcode base URL trong email template thay vì dùng request host. |
| **Ưu tiên** | Fix trước go-live |

### Finding #5 — VoIP Credentials lưu plaintext trong config

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **HIGH** |
| **OWASP** | A02 — Cryptographic Failures |
| **Mô tả** | Thông tin kết nối VoIP (SIP username, password, API key) được lưu plaintext trong file `.env` và database `settings` table. Ai có quyền đọc DB hoặc file config đều thấy credentials. |
| **Ảnh hưởng** | Lộ credentials VoIP → attacker thực hiện cuộc gọi giả danh công ty, nghe lén cuộc gọi, phát sinh chi phí. |
| **Khắc phục** | Encrypt credentials trong DB bằng AES-256. Dùng secret manager (Vault, AWS Secrets Manager) cho production. Rotate credentials hàng quý. |
| **Ưu tiên** | Fix trước go-live |

### Finding #6 — Rate limiting thiếu cho API xuất dữ liệu

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **MEDIUM** |
| **OWASP** | A04 — Insecure Design |
| **Mô tả** | API export (Excel/PDF) và báo cáo không có rate limit. Attacker hoặc script có thể gọi liên tục gây DoS và extract toàn bộ dữ liệu. |
| **Ảnh hưởng** | Denial of Service, data exfiltration hàng loạt. |
| **Khắc phục** | Rate limit: 10 export/phút/user. Queue cho export lớn. Log và alert khi export bất thường (> 1000 records). |
| **Ưu tiên** | Sprint tiếp theo |

### Finding #7 — Thiếu alerting real-time cho sự kiện bảo mật

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **MEDIUM** |
| **OWASP** | A09 — Security Logging & Monitoring Failures |
| **Mô tả** | Hệ thống có audit log nhưng không có alert real-time khi xảy ra sự kiện bất thường: đăng nhập sai 5 lần, truy cập cross-tenant, export dữ liệu lớn, thay đổi permission. |
| **Ảnh hưởng** | Tấn công xảy ra mà không được phát hiện kịp thời. Thời gian response kéo dài. |
| **Khắc phục** | Implement alert rules cho 5 sự kiện quan trọng. Gửi notification Telegram/email cho security team. Dashboard monitoring real-time. |
| **Ưu tiên** | Sprint tiếp theo |

### Finding #8 — Session không expire khi thay đổi password/role

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **MEDIUM** |
| **OWASP** | A07 — Identification & Authentication Failures |
| **Mô tả** | Khi admin thay đổi password hoặc thu hồi quyền của user, JWT token cũ vẫn valid cho đến khi hết hạn (24h). User bị khóa vẫn truy cập được hệ thống. |
| **Ảnh hưởng** | Nhân viên bị sa thải vẫn truy cập CRM trong tối đa 24h. Quyền mới không áp dụng ngay. |
| **Khắc phục** | Implement token blacklist (Redis). Invalidate tất cả session khi đổi password/role. Giảm JWT expiry xuống 1h + refresh token. |
| **Ưu tiên** | Sprint tiếp theo |

### Finding #9 — Thiếu Content Security Policy header

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **LOW** |
| **OWASP** | A05 — Security Misconfiguration |
| **Mô tả** | Response headers thiếu CSP, X-Content-Type-Options, X-Frame-Options. Tăng rủi ro XSS và clickjacking. |
| **Ảnh hưởng** | Rủi ro XSS stored/reflected cao hơn nếu có input chưa sanitize. |
| **Khắc phục** | Thêm security headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`. |
| **Ưu tiên** | Backlog |

### Finding #10 — Error message lộ thông tin hệ thống

| Thuộc tính | Chi tiết |
|-----------|----------|
| **Mức độ** | **LOW** |
| **OWASP** | A05 — Security Misconfiguration |
| **Mô tả** | Một số API trả về stack trace, tên bảng DB, đường dẫn file server trong error response (production mode). |
| **Ảnh hưởng** | Attacker thu thập thông tin hệ thống để lên kế hoạch tấn công chính xác hơn. |
| **Khắc phục** | Global error handler trả về generic message ở production. Log chi tiết ở server-side. Custom error codes cho frontend. |
| **Ưu tiên** | Backlog |

---

## 4. Tổng hợp Finding

| Mức độ | Số lượng | Finding |
|--------|----------|---------|
| Critical | 2 | #1 Permission Bypass, #2 Cross-Tenant |
| High | 3 | #3 Thiếu 2FA, #4 Hostname Forgery, #5 VoIP Credentials |
| Medium | 3 | #6 Rate Limiting, #7 Alert Real-time, #8 Session Expiry |
| Low | 2 | #9 CSP Headers, #10 Error Messages |

---

## 5. Top 5 ưu tiên xử lý

| Thứ tự | Finding | Deadline | Người phụ trách |
|--------|---------|----------|-----------------|
| 1 | **#2 Cross-Tenant Data Access** — Row-level security + tenant middleware | Trước go-live | Tech Lead + Backend Lead |
| 2 | **#1 Permission Bypass** — Backend permission middleware cho tất cả endpoint | Trước go-live | Backend Lead |
| 3 | **#3 2FA cho Admin/Finance** — TOTP implementation | Trước go-live | Backend Lead |
| 4 | **#4 Hostname Forgery** — Whitelist + hardcode base URL | Trước go-live | Backend Lead |
| 5 | **#5 VoIP Credentials** — Encrypt + secret manager | Trước go-live | DevOps + Backend Lead |

---

## 6. Tuân thủ pháp luật

### 6.1. Nghị định 13/2023/NĐ-CP — Bảo vệ dữ liệu cá nhân

| Yêu cầu | Trạng thái | Ghi chú |
|----------|------------|---------|
| Thông báo mục đích thu thập dữ liệu | Cần bổ sung | Thêm privacy notice khi tạo khách hàng/liên hệ |
| Đồng ý của chủ thể dữ liệu | Cần bổ sung | Consent checkbox cho contact (người liên hệ cá nhân) |
| Quyền truy cập/chỉnh sửa/xóa dữ liệu cá nhân | Đạt một phần | CRUD có, nhưng chưa có self-service portal cho chủ thể |
| Biện pháp bảo mật kỹ thuật | Đạt một phần | Encryption, access control có — cần fix Finding #1, #2 |
| Thông báo khi xảy ra vi phạm dữ liệu | Chưa có | Cần incident response procedure + notification template |
| Đánh giá tác động xử lý dữ liệu (DPIA) | Chưa có | Cần thực hiện DPIA cho dữ liệu hợp đồng + tài chính |

### 6.2. Bảo mật hợp đồng (Contract Confidentiality)

| Biện pháp | Trạng thái |
|-----------|------------|
| Mã hóa file hợp đồng khi lưu trữ (at-rest encryption) | Cần implement |
| Phân quyền đọc hợp đồng theo cấp bậc | Có — cần strengthen sau khi fix Finding #1 |
| Watermark khi xuất PDF hợp đồng | Chưa có |
| Audit log mọi lượt xem/tải hợp đồng | Có |
| Chữ ký số Viettel CA đảm bảo tính toàn vẹn | Có (Phase 2) |
| Retention policy — tự động archive hợp đồng hết hạn | Chưa có |

---

## 7. Kế hoạch hành động

| Giai đoạn | Thời gian | Hành động |
|-----------|-----------|-----------|
| Khẩn cấp | Tuần 1 | Fix Finding #1, #2 (Critical) |
| Trước go-live | Tuần 2-3 | Fix Finding #3, #4, #5 (High) |
| Sprint tiếp | Tuần 4-6 | Fix Finding #6, #7, #8 (Medium) |
| Backlog | Tháng 2-3 | Fix Finding #9, #10 (Low), hoàn thiện NĐ 13 compliance |
| Định kỳ | Hàng quý | Penetration test, vulnerability scan, review security config |

---

## 8. Lịch sử cập nhật

| Ngày | Người cập nhật | Nội dung |
|------|----------------|----------|
| 2026-04-16 | Team Reborn | Đánh giá bảo mật lần 1 — 10 finding, OWASP Top 10 |
