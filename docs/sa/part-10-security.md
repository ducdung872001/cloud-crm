# Part 10 — Security Architecture

> Mô tả kiến trúc bảo mật toàn diện: authentication, authorization,
> multi-tenant isolation, OWASP mitigations, bảo vệ dữ liệu, và VoIP security.

---

## 1. Executive Summary

Reborn CRM áp dụng mô hình bảo mật nhiều lớp: **SSO + JWT** cho
authentication, **RBAC** với permission code cho authorization,
**row-level tenant isolation** ngăn rò rỉ dữ liệu giữa tenant.
Tuân thủ OWASP Top 10 với các biện pháp cụ thể cho XSS, SQLi, CSRF.
Dữ liệu cá nhân tuân thủ **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu
cá nhân. VoIP bảo mật bằng SIP TLS + SRTP.

---

## 2. Authentication

### 2.1. Luồng xác thực

```
+----------+                  +-----------+                 +-----------+
|  Browser |                  | SSO Server|                 |  Backend  |
+----+-----+                  +-----+-----+                 +-----+-----+
     |                              |                             |
     | 1. GET /login                |                             |
     +----------------------------->|                             |
     |                              |                             |
     | 2. Login form (or Azure AD)  |                             |
     |<-----------------------------+                             |
     |                              |                             |
     | 3. Credentials               |                             |
     +----------------------------->|                             |
     |                              | 4. Validate + issue code    |
     |                              |                             |
     | 5. Redirect + auth_code      |                             |
     |<-----------------------------+                             |
     |                              |                             |
     | 6. POST /auth/token          |                             |
     |   { code, client_id }        |                             |
     +-------------------------------------------------------------->
     |                              |                             |
     | 7. { access_token,           |                             |
     |      refresh_token }         |                             |
     |<--------------------------------------------------------------+
```

### 2.2. Token Lifecycle

| Token          | Format      | TTL       | Lưu trữ            | Refresh         |
|----------------|-------------|-----------|--------------------|-----------------|
| Access token   | JWT (RS256) | 15 phút   | Memory (JS var)    | Dùng refresh    |
| Refresh token  | Opaque      | 7 ngày    | HttpOnly cookie    | Rotate mỗi lần  |
| SSO cookie     | Session ID  | 8 giờ     | HttpOnly, Secure   | Re-login        |
| API key        | UUID v4     | Vô hạn    | DB (hashed)        | Revoke + re-gen |

### 2.3. API Key (External Integration)

- Dùng cho hệ thống bên ngoài gọi API (webhook, partner)
- Truyền qua header `X-API-Key`
- Lưu hash (bcrypt) trong DB, không lưu plain text
- Mỗi key gán với 1 tenant và tập permission giới hạn

---

## 3. Authorization — RBAC

### 3.1. Mô hình

```
+--------+     +---------+     +------------+
|  User  |---->|  Role   |---->| Permission |
+--------+  N  +---------+  N  +------------+
                                |
                          +-----+------+
                          |            |
                     +----+---+  +-----+-----+
                     | Menu   |  | Data Scope |
                     | Filter |  | (own/dept/ |
                     +--------+  |  branch/   |
                                 |  all)      |
                                 +-----------+
```

### 3.2. Permission Code Convention

Format: `<module>:<resource>:<action>`

| Ví dụ                    | Mô tả                          |
|--------------------------|--------------------------------|
| sales:lead:create        | Tạo lead mới                   |
| sales:lead:read          | Xem lead                       |
| sales:lead:update        | Sửa lead                       |
| sales:lead:delete        | Xóa lead                       |
| contract:approval:approve| Phê duyệt hợp đồng             |
| finance:invoice:export   | Xuất hóa đơn                   |
| admin:role:manage        | Quản lý vai trò                |

### 3.3. Menu Filtering

Frontend nhận danh sách permission từ JWT claims.
Route guard kiểm tra permission trước khi render menu item
và trước khi navigate. Menu bị ẩn nếu user không có quyền.

### 3.4. Data Scope

| Scope      | Mô tả                                | SQL Filter                    |
|------------|--------------------------------------|-------------------------------|
| OWN        | Chỉ thấy dữ liệu mình tạo            | `created_by = :userId`        |
| DEPARTMENT | Thấy dữ liệu phòng ban               | `dept_id = :userDeptId`       |
| BRANCH     | Thấy dữ liệu chi nhánh               | `branch_id = :userBranchId`   |
| ALL        | Thấy toàn bộ dữ liệu trong tenant    | (không filter thêm)           |

BE tự động inject filter dựa trên data_scope của role.

---

## 4. Multi-tenant Isolation

### 4.1. Enforcement Chain

```
Request --> API Gateway --> Middleware --> Service --> Repository
                              |             |            |
                        [1] Resolve    [2] Validate  [3] Inject
                        hostname ->    tenant_id     tenant_id
                        tenant_id      trong JWT     vào query
                                       khớp với
                                       hostname
```

### 4.2. Các lớp bảo vệ

| Lớp          | Kiểm tra                                         |
|--------------|--------------------------------------------------|
| API Gateway  | Hostname hợp lệ, tenant tồn tại                  |
| Middleware   | JWT tenant_id == hostname tenant_id               |
| Service      | Business logic không cho phép cross-tenant access |
| Repository   | Mọi query tự động có `WHERE tenant_id = ?`        |
| Database     | Index composite (tenant_id, ...) đảm bảo filter   |

---

## 5. OWASP Mitigations

### 5.1. XSS (Cross-Site Scripting)

- Frontend: **DOMPurify** sanitize mọi HTML input trước khi render
- React default escape JSX — tránh dùng `dangerouslySetInnerHTML`
- CSP header: `script-src 'self'` ngăn inline script injection

### 5.2. SQL Injection

- Backend: **Parameterized queries** (JPA / MyBatis prepared statements)
- Không bao giờ nối chuỗi SQL từ user input
- ORM (JPA) tự động escape

### 5.3. CSRF (Cross-Site Request Forgery)

- SPA pattern: JWT trong header (không tự động gửi như cookie)
- CSRF token cho các form truyền thống (nếu có)
- SameSite=Strict cho cookie

### 5.4. Các biện pháp khác

| Threat                  | Mitigation                                    |
|-------------------------|-----------------------------------------------|
| Broken Authentication   | Rate limit login (5 lần / 15 phút)            |
| Sensitive Data Exposure | HTTPS everywhere, no sensitive data in URL     |
| Broken Access Control   | Permission check ở cả FE + BE                 |
| Security Misconfiguration| Hardened Spring Boot, disable actuator public |
| Insecure Deserialization| Jackson whitelist, không dùng Java serialize   |
| Insufficient Logging    | Structured log + audit trail mọi action        |

---

## 6. Data Protection

### 6.1. Encryption

| Lớp           | Phương pháp                              |
|---------------|------------------------------------------|
| In Transit    | TLS 1.2+ (HTTPS) cho mọi kết nối         |
| At Rest       | AES-256 cho file upload trên S3           |
| Database      | MySQL TDE (Transparent Data Encryption)   |
| Backup        | Encrypted backup với key rotation 90 ngày |

### 6.2. PII Handling — Nghị định 13/2023/NĐ-CP

- Dữ liệu cá nhân (tên, email, SĐT, CCCD) được đánh dấu là PII
- Truy cập PII ghi audit log
- Export PII cần quyền `data:pii:export`
- Xóa PII theo yêu cầu chủ thể dữ liệu (Right to Erasure)
- Lưu trữ PII tối đa theo mục đích thu thập (configurable per tenant)

```
+----------------+     +----------------+     +----------------+
| PII Request    |     | Compliance     |     | Audit          |
| (Delete/Export)|---->| Service Check  |---->| Log + Notify   |
+----------------+     +----------------+     +----------------+
```

---

## 7. VoIP Security

### 7.1. SIP Credentials

- Mỗi agent có SIP account riêng (username + password)
- Credentials lưu encrypted trong DB, giải mã khi cần
- Session timeout: 30 phút không hoạt động -> re-register

### 7.2. Transport Security

| Layer       | Protocol     | Mô tả                              |
|-------------|--------------|------------------------------------|
| Signaling   | SIP over WSS | WebSocket Secure (TLS)             |
| Media       | SRTP         | Secure RTP — encrypted audio       |
| SRTP Key    | DTLS-SRTP    | Key exchange qua DTLS handshake    |

### 7.3. Call Security

- Recording: chỉ lưu khi tenant bật, encrypted at rest
- CDR: chỉ ghi metadata (thời gian, số, duration), không ghi nội dung
- Access CDR: cần quyền `care:call:view-cdr`

---

## 8. Security Checklist — Deployment

| Hạng mục                | Trạng thái | Ghi chú                        |
|-------------------------|------------|--------------------------------|
| HTTPS everywhere        | BẮT BUỘC   | Cert từ Let's Encrypt / ACM    |
| JWT RS256 key rotation  | BẮT BUỘC   | Rotation mỗi 90 ngày           |
| Rate limiting           | BẮT BUỘC   | Nginx + Redis token bucket     |
| WAF (Web App Firewall)  | KHUYẾN NGHỊ| AWS WAF hoặc Cloudflare        |
| Penetration test        | KHUYẾN NGHỊ| Mỗi 6 tháng                    |
| Dependency audit        | BẮT BUỘC   | `npm audit` + `mvn dependency-check` |
| Log retention           | BẮT BUỘC   | 1 năm minimum                  |
| Backup encryption       | BẮT BUỘC   | AES-256 + off-site backup      |
