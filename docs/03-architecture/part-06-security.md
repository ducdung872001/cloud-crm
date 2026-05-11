# Part 06 — Security Architecture

## 1. Threat model

### 1.1. Threats applicable

| Threat | Severity | Mitigation |
|---|---|---|
| **PII data leak** (3M phone, name, dob) | 🔴 Critical | Encryption at rest + in transit + PII masking in logs |
| **Point manipulation by insider** | 🔴 Critical | Audit log, 2-level approval, point cap per adjust |
| **API key theft** | 🔴 Critical | IP whitelist, key rotation, revoke flow, scope per key |
| **SQL injection** | 🟠 High | Parameterized queries, JPA, input validation |
| **XSS in admin UI** | 🟠 High | React auto-escape, CSP, no innerHTML |
| **CSRF** | 🟠 High | SameSite cookies, CSRF tokens for non-GET |
| **Brute force OTP** | 🟠 High | Rate limit 5/5min/phone, lockout 30min |
| **Webhook replay** | 🟡 Medium | HMAC + timestamp tolerance |
| **DoS / DDoS** | 🟡 Medium | CDN, WAF, rate limit, auto-scale |
| **Privilege escalation** | 🟡 Medium | RBAC tight, no implicit grants, audit |
| **Insecure direct object reference (IDOR)** | 🟡 Medium | tenant_id filter ở mọi query, scope check |
| **Data exfiltration via bulk export** | 🟡 Medium | Audit + rate limit + Supervisor approval for export > 10k rows |
| **Cross-brand data leak** | 🟠 High | Scope filter mandatory, integration test |

### 1.2. Threats NOT in scope

- Physical security của data center (delegate to cloud provider)
- Social engineering employee (HR + training, không phải code)
- Quantum computing crack RSA (10+ years horizon)

## 2. AuthN architecture

### 2.1. Admin authentication (qua SSO)

> **Auth host:** `https://reborn.vn/authenticator/*` (legacy domain — KHÔNG migrate sang `biz.reborn.vn`)

```
1. User → admin.loyalty.reborn.vn → redirect to SSO
2. SSO (Reborn central tại reborn.vn) authenticate → issue OIDC code
3. Browser → https://reborn.vn/authenticator/callback?code=...
4. Backend exchange code → JWT (RS256, 1h TTL)
5. JWT stored in HttpOnly+Secure+SameSite=Lax cookie (scope: .reborn.vn)
6. Refresh token (30d TTL) in separate cookie
7. Subsequent API calls tới biz.reborn.vn/<service>/* gửi JWT trong cookie/header
```

JWT claims:
```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "email": "user@company.vn",
  "roles": ["marketing_mgr"],
  "permissions": ["campaign.create", "member.view", ...],
  "scope_ids": ["brand-a-uuid"],
  "iat": ..., "exp": ...,
  "iss": "auth.reborn.vn"
}
```

### 2.2. Member authentication (KH cuối)

```
1. KH → app/web → nhập phone
2. POST /v1/auth/register-otp {phone}
3. Send OTP via SMS/Zalo (rate limited)
4. KH → POST /v1/auth/verify-otp {phone, code}
5. Issue JWT (7d TTL) + refresh (30d)
```

### 2.3. External POS authentication (API key)

```
Header: X-API-Key: rk_live_<base64>
        Idempotency-Key: <UUID>
        X-Reborn-Signature: sha256=<hex>  (optional, recommended)
        X-Reborn-Timestamp: <unix>         (with signature)

Server:
1. Lookup API key in DB (cached Redis 5min)
2. Check status = active, not expired
3. Check IP in whitelist (if configured)
4. Check rate limit (Redis counter)
5. (If signed) verify HMAC + timestamp window
6. Check scope (key allowed for endpoint?)
7. Process request
8. Log audit
```

## 3. AuthZ — RBAC + Scope

### 3.1. RBAC model

```
User ──many-to-many── Role ──many-to-many── Permission

Examples:
- Permission: member.view, member.edit, points.adjust, ...
- Role: marketing_manager = [member.view, campaign.*, segment.*]
- User: alice@... = roles: [marketing_manager, brand_a_manager]
```

Permission check (pseudocode):
```python
def check_permission(user, action, resource):
    perms = aggregate_permissions(user.roles)
    if action not in perms:
        raise Forbidden
    # Scope check
    if resource.scope_id not in user.allowed_scopes:
        raise Forbidden
    # Tenant check (multi-tenant safety)
    if resource.tenant_id != user.tenant_id:
        raise Forbidden  # IDOR protection
```

### 3.2. Scope-aware permission

User có thể được assign `scope_ids = ["brand-a-uuid"]` → chỉ access dữ liệu thuộc Brand A. Service enforce trong WHERE clause:

```sql
SELECT * FROM member
WHERE tenant_id = :tenant_id
  AND home_brand_id IN (:scope_ids)
```

### 3.3. Permission matrix

Xem [`../02-requirements/part-01-actors-roles.md#2-permission-matrix-ma-trận-quyền`](../02-requirements/part-01-actors-roles.md)

## 4. Data protection

### 4.1. In transit

- TLS 1.3 mandatory, ciphers limited
- HSTS preload header, max-age 1 year
- Certificate pinning cho external POS integration (optional)

### 4.2. At rest

| Data | Encryption | Key mgmt |
|---|---|---|
| Database | AES-256 (TDE — Transparent Data Encryption) | Managed via KMS / Vault |
| Object storage (S3) | SSE-S3 hoặc SSE-KMS | Per-tenant prefix isolation |
| Backups | AES-256 + compression | Separate key from primary |
| Secrets (DB pass, API key) | HashiCorp Vault / SOPS | Rotation 90 days |

### 4.3. PII handling

PII fields require special handling:

| Field | Storage | Display | Logging |
|---|---|---|---|
| phone | Plaintext (indexed) | Masked except for own/admin: `+849***1234` | Hashed |
| name | Plaintext | Plaintext | Plaintext (low sensitivity) |
| email | Plaintext (indexed) | Masked: `a***@example.com` | Hashed |
| national_id | Encrypted at app layer | Masked except admin: `0**********345` | Never logged |
| dob | Plaintext | Plaintext | Plaintext |
| address | Plaintext | Plaintext | Plaintext |

Implementation: column-level encryption với key wrapped by KMS; decrypt on-the-fly khi authorized read.

## 5. Application security controls

### 5.1. Input validation

- All API: JSON schema validation (jakarta validation / Joi)
- Phone: E.164 format strict
- Email: RFC 5322
- Numeric: bounded ranges
- Strings: max length + character whitelist
- File upload: magic number check + size limit + virus scan

### 5.2. Output encoding

- React: auto-escape JSX (avoid `dangerouslySetInnerHTML`)
- API: JSON serialization (no string concat)
- PDF voucher: server-side rendering, sanitize variables

### 5.3. CSRF

- SameSite=Lax cookies
- Custom header `X-CSRF-Token` for POST/PUT/DELETE
- Token rotation per session

### 5.4. CSP

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'sha256-...';
  img-src 'self' https://cdn.reborn.vn data:;
  frame-ancestors 'none';
  base-uri 'self';
```

### 5.5. Security headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

## 6. Audit & accountability

- Mọi action sensitive → `audit_log` entry
- Audit log **append-only**, retention 7 năm
- SIEM integration (optional): forward audit → SIEM (Splunk, ELK)
- Alert on suspicious patterns:
  - 1 admin adjust > 50 KH/giờ
  - Failed login 10+ trong 5 phút
  - API key dùng từ IP mới
  - Export > 10k rows

## 7. Compliance

### 7.1. NĐ 13/2023 (Vietnam PDPA)

- **Consent management:** opt-in cho marketing (separate from service consent)
- **Right to access:** export data của KH < 30 ngày
- **Right to erasure:** soft-delete + anonymize, hard-delete sau 5 năm
- **Breach notification:** < 72 giờ kể từ phát hiện đến cơ quan
- **Data Protection Officer (DPO):** tenant đăng ký với cơ quan

### 7.2. NĐ 91/2020 (anti-spam)

- Opt-out link mandatory in email
- Frequency cap 3 msg/tuần/KH
- SMS gửi trong 7h–22h (whitelist)

Chi tiết: [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)

## 8. Security testing

| Test | Frequency | Tool |
|---|---|---|
| SAST (static analysis) | Mỗi PR | SonarQube, Semgrep |
| SCA (dependency scan) | Hàng ngày | Dependabot, Snyk |
| DAST (dynamic) | Trước release | OWASP ZAP, Burp |
| Pen-test | Hàng năm | External vendor |
| Bug bounty | Continuous (year 2+) | Public program |
| Security review (PR) | Critical changes | Senior + Security team |

## 9. Incident response

```
Detection (SIEM/alert)
   ▼
Triage (15 phút) — Severity P1/P2/P3
   ▼
Containment (P1: 30 phút)
   ├─ Disable affected API key
   ├─ Block IP at WAF
   ├─ Rotate secrets if leaked
   └─ Engage Reborn security team
   ▼
Eradication & Recovery (2–24h)
   ▼
Post-mortem within 5 days
   └─ Update runbook, add detection rule
```

## 10. Tham chiếu

- NFR security requirements: [`../02-requirements/part-12-nfr.md#4-security`](../02-requirements/part-12-nfr.md)
- Fraud prevention specifics: [`../06-analysis/fraud-prevention.md`](../06-analysis/fraud-prevention.md)
- PDPA compliance details: [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)
- Risk register: [`../08-operations/risk-register.md`](../08-operations/risk-register.md)
