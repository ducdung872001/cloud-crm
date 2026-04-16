# Part 10 — Security Architecture

> Mo ta kien truc bao mat toan dien: authentication, authorization,
> multi-tenant isolation, OWASP mitigations, bao ve du lieu, va VoIP security.

---

## 1. Executive Summary

Reborn CRM ap dung mo hinh bao mat nhieu lop: **SSO + JWT** cho
authentication, **RBAC** voi permission code cho authorization,
**row-level tenant isolation** ngan ro ri du lieu giua tenant.
Tuan thu OWASP Top 10 voi cac bien phap cu the cho XSS, SQLi, CSRF.
Du lieu ca nhan tuan thu **Nghi dinh 13/2023/ND-CP** ve bao ve du lieu
ca nhan. VoIP bao mat bang SIP TLS + SRTP.

---

## 2. Authentication

### 2.1. Luong xac thuc

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

| Token          | Format      | TTL       | Luu tru            | Refresh         |
|----------------|-------------|-----------|--------------------|-----------------|
| Access token   | JWT (RS256) | 15 phut   | Memory (JS var)    | Dung refresh    |
| Refresh token  | Opaque      | 7 ngay    | HttpOnly cookie    | Rotate moi lan  |
| SSO cookie     | Session ID  | 8 gio     | HttpOnly, Secure   | Re-login        |
| API key        | UUID v4     | Vo han    | DB (hashed)        | Revoke + re-gen |

### 2.3. API Key (External Integration)

- Dung cho he thong ben ngoai goi API (webhook, partner)
- Truyen qua header `X-API-Key`
- Luu hash (bcrypt) trong DB, khong luu plain text
- Moi key gan voi 1 tenant va tap permission gioi han

---

## 3. Authorization — RBAC

### 3.1. Mo hinh

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

| Vi du                    | Mo ta                          |
|--------------------------|--------------------------------|
| sales:lead:create        | Tao lead moi                   |
| sales:lead:read          | Xem lead                       |
| sales:lead:update        | Sua lead                       |
| sales:lead:delete        | Xoa lead                       |
| contract:approval:approve| Phe duyet hop dong             |
| finance:invoice:export   | Xuat hoa don                   |
| admin:role:manage        | Quan ly vai tro                |

### 3.3. Menu Filtering

Frontend nhan danh sach permission tu JWT claims.
Route guard kiem tra permission truoc khi render menu item
va truoc khi navigate. Menu bi an neu user khong co quyen.

### 3.4. Data Scope

| Scope      | Mo ta                                | SQL Filter                    |
|------------|--------------------------------------|-------------------------------|
| OWN        | Chi thay du lieu minh tao            | `created_by = :userId`        |
| DEPARTMENT | Thay du lieu phong ban               | `dept_id = :userDeptId`       |
| BRANCH     | Thay du lieu chi nhanh               | `branch_id = :userBranchId`   |
| ALL        | Thay toan bo du lieu trong tenant    | (khong filter them)           |

BE tu dong inject filter dua tren data_scope cua role.

---

## 4. Multi-tenant Isolation

### 4.1. Enforcement Chain

```
Request --> API Gateway --> Middleware --> Service --> Repository
                              |             |            |
                        [1] Resolve    [2] Validate  [3] Inject
                        hostname ->    tenant_id     tenant_id
                        tenant_id      trong JWT     vao query
                                       khop voi
                                       hostname
```

### 4.2. Cac lop bao ve

| Lop          | Kiem tra                                         |
|--------------|--------------------------------------------------|
| API Gateway  | Hostname hợp le, tenant ton tai                  |
| Middleware   | JWT tenant_id == hostname tenant_id               |
| Service      | Business logic khong cho phep cross-tenant access |
| Repository   | Moi query tu dong co `WHERE tenant_id = ?`        |
| Database     | Index composite (tenant_id, ...) dam bao filter   |

---

## 5. OWASP Mitigations

### 5.1. XSS (Cross-Site Scripting)

- Frontend: **DOMPurify** sanitize moi HTML input truoc khi render
- React default escape JSX — tranh dung `dangerouslySetInnerHTML`
- CSP header: `script-src 'self'` ngan inline script injection

### 5.2. SQL Injection

- Backend: **Parameterized queries** (JPA / MyBatis prepared statements)
- Khong bao gio noi chuoi SQL tu user input
- ORM (JPA) tu dong escape

### 5.3. CSRF (Cross-Site Request Forgery)

- SPA pattern: JWT trong header (khong tu dong gui nhu cookie)
- CSRF token cho cac form truyen thong (nếu co)
- SameSite=Strict cho cookie

### 5.4. Cac bien phap khac

| Threat                  | Mitigation                                    |
|-------------------------|-----------------------------------------------|
| Broken Authentication   | Rate limit login (5 lan / 15 phut)            |
| Sensitive Data Exposure | HTTPS everywhere, no sensitive data in URL     |
| Broken Access Control   | Permission check o ca FE + BE                 |
| Security Misconfiguration| Hardened Spring Boot, disable actuator public |
| Insecure Deserialization| Jackson whitelist, khong dung Java serialize   |
| Insufficient Logging    | Structured log + audit trail moi action        |

---

## 6. Data Protection

### 6.1. Encryption

| Lop           | Phuong phap                              |
|---------------|------------------------------------------|
| In Transit    | TLS 1.2+ (HTTPS) cho moi ket noi         |
| At Rest       | AES-256 cho file upload tren S3           |
| Database      | MySQL TDE (Transparent Data Encryption)   |
| Backup        | Encrypted backup voi key rotation 90 ngay |

### 6.2. PII Handling — Nghi dinh 13/2023/ND-CP

- Du lieu ca nhan (ten, email, SDT, CCCD) duoc danh dau la PII
- Truy cap PII ghi audit log
- Export PII can quyen `data:pii:export`
- Xoa PII theo yeu cau chu the du lieu (Right to Erasure)
- Luu tru PII toi da theo muc dich thu thap (configurable per tenant)

```
+----------------+     +----------------+     +----------------+
| PII Request    |     | Compliance     |     | Audit          |
| (Delete/Export)|---->| Service Check  |---->| Log + Notify   |
+----------------+     +----------------+     +----------------+
```

---

## 7. VoIP Security

### 7.1. SIP Credentials

- Moi agent co SIP account rieng (username + password)
- Credentials luu encrypted trong DB, giai ma khi can
- Session timeout: 30 phut khong hoat dong -> re-register

### 7.2. Transport Security

| Layer       | Protocol     | Mo ta                              |
|-------------|--------------|------------------------------------|
| Signaling   | SIP over WSS | WebSocket Secure (TLS)             |
| Media       | SRTP         | Secure RTP — encrypted audio       |
| SRTP Key    | DTLS-SRTP    | Key exchange qua DTLS handshake    |

### 7.3. Call Security

- Recording: chi luu khi tenant bat, encrypted at rest
- CDR: chi ghi metadata (thoi gian, so, duration), khong ghi noi dung
- Access CDR: can quyen `care:call:view-cdr`

---

## 8. Security Checklist — Deployment

| Hang muc                | Trang thai | Ghi chu                        |
|-------------------------|------------|--------------------------------|
| HTTPS everywhere        | BAT BUOC   | Cert tu Let's Encrypt / ACM    |
| JWT RS256 key rotation  | BAT BUOC   | Rotation moi 90 ngay           |
| Rate limiting           | BAT BUOC   | Nginx + Redis token bucket     |
| WAF (Web App Firewall)  | KHUYEN NGHI| AWS WAF hoac Cloudflare        |
| Penetration test        | KHUYEN NGHI| Moi 6 thang                    |
| Dependency audit        | BAT BUOC   | `npm audit` + `mvn dependency-check` |
| Log retention           | BAT BUOC   | 1 nam minimum                  |
| Backup encryption       | BAT BUOC   | AES-256 + off-site backup      |
