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
