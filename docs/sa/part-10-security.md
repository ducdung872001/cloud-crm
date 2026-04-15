# Part 10 — Security Architecture

> **Executive Summary**: Reborn Retail CRM dùng mô hình **auth tập trung qua SSO Reborn** (cookie token tại `.reborn.vn`), **authZ theo permission code** (mảng permission lưu `localStorage`), **multi-tenant isolation** qua header `Hostname` + filter `tenantId` ở BE. Mitigation OWASP Top 10 quan sát được: DOMPurify cho XSS trong RebornEditor, cookie HttpOnly (cần xác nhận), HTTPS only. Điểm yếu lớn: không có 2FA rõ ràng, hardcode `Hostname` lúc dev, localStorage permissions có thể bị giả mạo nếu BE không verify lại. Tuân thủ NĐ 13/2023 về dữ liệu cá nhân và TT78 về hoá đơn điện tử là bắt buộc khi deploy prod.

## 1. Authentication

### 1.1. Flow SSO

🟢 Xem [Part 06 §6](part-06-service-api.md#6-authentication-flow).

Cookie sau khi login thành công:

| Cookie | Scope | Flags (kỳ vọng) |
|--------|-------|-----------------|
| `token` | `.reborn.vn` | `HttpOnly`, `Secure`, `SameSite=Lax` |
| `user`  | `.reborn.vn` | `HttpOnly`, `Secure` |

🔴 **Quan sát ngược**: `fetchConfig.ts` đọc `getCookie("token")` trong JS → chứng tỏ cookie **KHÔNG HttpOnly** (vì JS đọc được). Điều này đi ngược best practice — token có thể bị XSS đánh cắp.

**Khuyến nghị**: chuyển sang `HttpOnly` cookie + BE tự gắn `Authorization` qua gateway, hoặc dùng `sessionStorage` có MutationObserver + CSP rất chặt.

### 1.2. JWT vs session

🟡 Không rõ token là JWT hay opaque session ID. Interceptor gửi `Bearer <token>` nên format chấp nhận cả hai.

### 1.3. 2FA

🔴 **Thấp** — không thấy UI 2FA trong codebase (không có `OtpModal`, `TwoFactorSetup`). Có thể BE hỗ trợ ở tầng SSO nhưng chưa integrate FE.

**Gợi ý**: TOTP (Google Authenticator) hoặc OTP SMS cho user role cao.

### 1.4. Role switching

🟢 `SelectedRole` lưu `localStorage`. Request gắn header `Selectedrole`. BE phải **verify** user thực sự có role này — không được tin client.

## 2. Authorization — RBAC

### 2.1. Permission code

🟢 `localStorage.permissions` chứa mảng mã như:

```
EVENTS_VIEW
EVENTS_CREATE
POS_CREATE_ORDER
CUSTOMER_EXPORT
INVENTORY_ADJUSTMENT
FINANCE_CASHBOOK_VIEW
...
```

Component check:

```ts
const canCreateOrder = permissions.includes("POS_CREATE_ORDER");
```

### 2.2. Rủi ro quan sát

⚠️ **User có thể mở devtools, sửa localStorage để thêm permission**. Điều này chỉ ảnh hưởng UI — nhưng BE **BẮT BUỘC** phải verify lại permission trên mọi endpoint, không tin client.

🔴 **Cần BE xác nhận**: mỗi endpoint có annotation / filter kiểm tra permission không?

### 2.3. Hierarchical role

🟡 Từ cấu trúc `department_employee` (dept_empId làm `Selectedrole`), suy luận có mô hình:

```
Tenant
  └── Department
        └── Employee
              └── Role (set of permissions)
```

## 3. Multi-tenant isolation

### 3.1. Cơ chế

🟢 **Cao** — [Part 01 §4](part-01-kien-truc-tong-the.md#4-chiến-lược-multi-tenant-frontend-view):

1. Header `Hostname: <tenant>.reborn.vn` gửi kèm mọi request.
2. BE resolve `tenantId` từ `Hostname`.
3. Mọi query thêm `WHERE tenant_id = :tenantId` (row-level security).

### 3.2. Rủi ro

| Rủi ro | Mức | Mitigation |
|--------|-----|------------|
| **Header spoofing** — user tự set `Hostname` khác để đọc data tenant khác | 🔴 **Critical** | Gateway phải xác thực `Hostname` khớp với domain origin request, KHÔNG tin header từ client |
| **Hardcode dev** `"kcn.reborn.vn"` còn trong code | 🔴 | CI check, env var gate trước prod build |
| **Missing tenant filter** — dev quên thêm `WHERE tenant_id` | 🔴 | Row-level security PostgreSQL hoặc ORM global filter |

### 3.3. Khuyến nghị mạnh

Chuyển từ **soft isolation** (row filter) sang **PostgreSQL RLS policy**:

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id')::bigint);
```

Gateway set `SET app.tenant_id = <id>` đầu mỗi connection.

## 4. OWASP Top 10 mitigation

| OWASP | Biện pháp quan sát | Trạng thái |
|-------|---------------------|------------|
| **A01 Broken access control** | RBAC permission code | 🟡 FE ok, BE cần verify |
| **A02 Crypto failures** | HTTPS (kỳ vọng), bcrypt password (🔴) | 🟡 |
| **A03 Injection** | ORM ở BE (🔴), React auto-escape HTML | 🟡 |
| **A04 Insecure design** | Hardcode Hostname, localStorage perms | 🔴 |
| **A05 Security misconfig** | Env var, CSP header chưa quan sát | 🔴 |
| **A06 Vuln components** | `npm audit` — có vài advisory cũ | 🟡 |
| **A07 Auth failures** | SSO ok, nhưng cookie không HttpOnly | 🔴 |
| **A08 Data integrity** | Không có SRI cho CDN assets (🔴) | 🔴 |
| **A09 Logging & monitoring** | Không có Sentry/Datadog integration | 🔴 |
| **A10 SSRF** | BE responsibility | 🔴 |

### 4.1. XSS

🟢 **Mitigation**: React tự escape JSX. RebornEditor dùng Slate (không `dangerouslySetInnerHTML` trực tiếp). **Điểm nguy hiểm**: nếu có chỗ render HTML từ API (vd: mô tả sản phẩm có `<img>`), phải dùng **DOMPurify**.

Grep khuyến nghị:

```bash
grep -r "dangerouslySetInnerHTML" src/
```

Mọi match phải có DOMPurify bọc ngoài.

### 4.2. CSRF

🟡 Nếu cookie `token` dùng `SameSite=Lax` + BE chấp nhận `Authorization: Bearer`, CSRF tự động bị chặn (vì fetch cross-origin phải add header, trigger preflight).

### 4.3. SQL Injection

🔴 BE responsibility — kỳ vọng dùng ORM (JPA/Hibernate/TypeORM/GORM) với prepared statement.

## 5. Data at rest

### 5.1. Password hash

🔴 BE — khuyến nghị **bcrypt cost 12** hoặc **argon2id**. Không bao giờ SHA-256 trần.

### 5.2. DB encryption

🟡 PostgreSQL + TDE (transparent data encryption) hoặc cloud managed DB (AWS RDS encryption, GCP CloudSQL encryption).

### 5.3. PII masking

FE hiển thị SĐT/CMND đã che (vd `0901***567`) cho vai trò không có quyền `CUSTOMER_VIEW_PII`. 🔴 Cần implement nếu chưa có.

### 5.4. Backup encryption

Backup pg_dump phải encrypt (GPG hoặc cloud KMS) trước khi upload object store.

## 6. Data in transit

| Yêu cầu | Trạng thái |
|---------|------------|
| HTTPS only | 🟢 (prod) |
| TLS 1.2+ | 🟡 kỳ vọng |
| HSTS header | 🔴 chưa xác nhận |
| Certificate pinning | N/A (web) |
| WSS cho WebRTC signaling | 🟡 cần xác nhận |

**HSTS**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## 7. Secrets management

### 7.1. Frontend

🟢 Env var Vite `APP_API_URL`, `APP_BIZ_URL` — **không chứa secret**, chỉ URL.

⚠️ **Cảnh báo**: Firebase API key, FCM VAPID public key nhúng trong bundle — chấp nhận được vì đó là public key.

### 7.2. Backend

🔴 Khuyến nghị:

- **Vault**: HashiCorp Vault hoặc AWS Secrets Manager / GCP Secret Manager.
- **Kubernetes secret** + external-secrets operator.
- KHÔNG commit `.env` vào git (có thể đã OK vì `.gitignore`).
- Rotate database password định kỳ 90 ngày.

## 8. Audit log

🔴 **Thấp** — không thấy `AuditLogService` FE. BE kỳ vọng có bảng `audit_log`:

```
id | tenant_id | user_id | action | resource_type | resource_id | old_value | new_value | ip | user_agent | at
```

### Events nên log

- Login success/fail
- Role switch
- Create/update/delete nghiệp vụ nhạy cảm (xoá đơn, điều chỉnh tồn, đóng sổ quỹ)
- Export data (customer list, invoice list)
- Permission grant/revoke
- Config change

### Retention

- Audit log: **2 năm** tối thiểu (theo TT78 cho hoá đơn).
- Access log: **6 tháng**.

## 9. Session management

| Yêu cầu | Giá trị khuyến nghị |
|---------|---------------------|
| Idle timeout | 30 phút |
| Absolute timeout | 12 giờ |
| Concurrent sessions | 1 per user (hoặc cho phép N với list) |
| Logout everywhere | Invalidate tất cả token của user |

🔴 **Chưa quan sát** FE có xử lý idle timeout không — chỉ redirect khi 401. Nên thêm `IdleTimerProvider`.

## 10. Compliance

### 10.1. NĐ 13/2023 — Bảo vệ dữ liệu cá nhân VN

Bắt buộc:

- **Thông báo xử lý PII**: trang chính sách riêng tư.
- **Đồng ý rõ ràng**: checkbox khi tạo customer.
- **Quyền của chủ thể**: export, xoá, sửa dữ liệu cá nhân.
- **Đánh giá tác động (DPIA)**: cho tenant xử lý > 10.000 người.
- **DPO**: bổ nhiệm người phụ trách nếu đạt ngưỡng.
- **Báo cáo vi phạm**: 72h cho Cục An ninh mạng.

### 10.2. TT78/2021 + TT32/2011 — Hoá đơn điện tử

- Hoá đơn phải ký số.
- Lưu trữ **10 năm**.
- Truyền nhận với cơ quan thuế qua gateway GDT.

### 10.3. Audit retention

- Audit log: 2 năm.
- Financial record: 10 năm (Luật kế toán).
- User action log: 1 năm.

## 11. Incident response

🔴 Khuyến nghị xây runbook:

1. **Detection**: alert từ SIEM (vd login fail 100 lần/10 phút → alert).
2. **Triage**: on-call SRE đánh giá severity.
3. **Containment**: block IP, disable user, rotate secret.
4. **Eradication**: patch lỗi, clean backdoor.
5. **Recovery**: restore từ backup sạch.
6. **Post-mortem**: RCA + action item.

## 12. Security checklist trước prod

- [ ] Cookie `token` đặt `HttpOnly`, `Secure`, `SameSite=Lax`.
- [ ] Xoá hardcode `"kcn.reborn.vn"` trong `fetchConfig.ts`.
- [ ] CSP header strict.
- [ ] HSTS enabled.
- [ ] Bcrypt/argon2 cho password hash.
- [ ] PostgreSQL RLS enabled.
- [ ] Audit log bật cho nghiệp vụ nhạy cảm.
- [ ] Rate limit trên gateway (IP + user).
- [ ] Pen test 1 lần trước GA.
- [ ] Dependency scan (Snyk / Dependabot) bật.
- [ ] SAST (SonarQube / Semgrep) trong CI.

## Tham chiếu

- Files:
  - `src/configs/fetchConfig.ts`
  - `src/App.tsx`
  - `src/utils/navigate.ts`
- [Part 06 — Service & API §6](part-06-service-api.md#6-authentication-flow)
- [Part 01 §4 Multi-tenant](part-01-kien-truc-tong-the.md)
- [ADR-04](part-13-adr.md#adr-04) Multi-tenant Hostname
- [ADR-06](part-13-adr.md#adr-06) SSO centralized

---
*Hết Part 10. Xem tiếp [Part 11 — Cross-cutting concerns](part-11-cross-cutting.md).*
