# 06 — Integration với các Service khác

## 6.1. Integration map

```
                              ┌──────────────────────┐
                              │  Reborn Super Admin  │
                              │  (FE — nhánh này)    │
                              └─────────┬────────────┘
                                        │ JWT Bearer
                                        ▼
       ┌────────────────────────────────────────────────────┐
       │           Platform Service (this)                   │
       │           platform.reborn.vn/api/v1                 │
       └──┬─────────────────┬──────────────────┬────────┬───┘
          │ sync REST       │ sync REST         │ async   │ async
          │ (verify JWT,    │ (load role,       │ outbox  │ webhook
          │  enrich user)   │  check perm)      │ events  │ outbound
          ▼                 ▼                   ▼         ▼
     ┌─────────┐       ┌─────────┐       ┌──────────┐  ┌──────────┐
     │Identity │       │   Org   │       │ Notif.   │  │ Apps     │
     │         │       │         │       │ Service  │  │ (CRM,BPM)│
     └─────────┘       └─────────┘       └──────────┘  └──────────┘
```

## 6.2. Integration với Identity Service

### 6.2.1. Verify JWT (sync — mọi request)

Mọi request vào Platform có header `Authorization: Bearer <jwt>`. Platform verify như sau:

1. Lấy `kid` từ JWT header
2. Lookup public key trong cache JWKS (TTL 1h)
3. Nếu cache miss → GET `https://auth.reborn.vn/.well-known/jwks.json` (đã chuẩn hoá OIDC)
4. Verify signature, expiry, audience, issuer
5. Extract claims `sub`, `email`, `roles`

Implementation: dùng **Spring Security Resource Server** (Spring Boot 3.2.3 + Java 21) với JWT support.

```yaml
# application.yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: https://auth.reborn.vn/.well-known/jwks.json
          issuer-uri: https://auth.reborn.vn
```

**Failure mode**: nếu Identity down >1 phút và cache JWKS hết hạn → trả 503. Mitigation: cache TTL dài (24h grace) + alert.

### 6.2.2. Enrich user profile (sync — on-demand)

Khi cần hiển thị `name + email + avatar` trong response (vd `GET /api/v1/tenant/{id}/membership`):

```java
// Pseudocode (jOOQ DSL — match cloud-sales pattern)
List<Membership> memberships = dsl
    .selectFrom(TENANT_MEMBERSHIP)
    .where(TENANT_MEMBERSHIP.TENANT_ID.eq(tenantId))
      .and(TENANT_MEMBERSHIP.DELETED_AT.isNull())
    .fetchInto(Membership.class);

Set<Long> userIds = memberships.stream().map(Membership::userId).collect(toSet());

// Batch call Identity
Map<Long, UserSummary> users = identityClient.getUsersBatch(userIds);

// Merge via MapStruct mapper
return memberships.stream()
    .map(m -> membershipMapper.toResponse(m, users.get(m.userId())))
    .toList();
```

**Identity API contract** (cần confirm với team Identity):
```
GET https://auth.reborn.vn/api/v1/users/batch?ids=1,2,3
Authorization: Bearer <service-account-token>

200 OK
{
  "users": [
    { "id": 1, "name": "...", "email": "...", "avatar": "...", "phone": "..." },
    ...
  ]
}
```

**Resilience**: 
- Timeout 2s
- Circuit breaker (Resilience4j): 50% fail trong 10s → open 30s
- Fallback: trả `{ "id": X, "_stale": true }` (FE hiển thị placeholder)
- Cache user summary local: 5 phút TTL trong Caffeine

### 6.2.3. Subscribe Identity events

Identity publish events sang broker chung (vd Kafka topic `identity.events`):
- `user.created`
- `user.updated` (name, email, avatar, status)
- `user.deleted`
- `user.login.success` (chứa user_id, login_at)

Platform consume:
- `user.deleted` → soft-delete tất cả `tenant_membership` của user
- `user.login.success` → update `tenant_membership.last_login_at` (trên membership của tenant đang dùng — xác định qua `tenant_id` claim trong session)

Subscribe pattern: Spring Kafka consumer với consumer group `platform-service`.

## 6.3. Integration với Org Service

### 6.3.1. Catalog → Assignment chain

Org cần biết:
- Package nào tenant đang dùng → để biết tenant được phép quyền gì
- Resource catalog → để hiển thị form gán quyền

Platform expose endpoint cho Org:

#### `GET /api/v1/internal/tenant/{id}/entitlement`
Trả ma trận entitlement tổng hợp của tenant (gộp permission của tất cả tenant_apps active):
```json
{
  "tenant_id": 1,
  "computed_at": "2026-05-10T03:00:00Z",
  "entitlements": [
    { "resource_code": "CUSTOMER", "actions": ["VIEW","CREATE","UPDATE"], "limits": {"CREATE": 1000} },
    { "resource_code": "INVOICE",  "actions": ["VIEW","CREATE","UPDATE","DELETE","APPROVE"] },
    ...
  ]
}
```

Org gọi endpoint này khi:
- Render UI gán quyền cho role/department (chỉ hiện resource × action mà tenant được phép)
- Validate trước khi insert `role_permission` (nếu user gán quyền không có trong entitlement → reject)

**Caching**: Org cache result 5 phút. Khi Platform emit `tenant.package_changed`, Org invalidate cache.

#### `GET /api/v1/internal/resource?include_actions=true`
Catalog full resource + actions. Cache 1h.

### 6.3.2. Org → Platform (membership trigger)

Khi Org tạo employee mới (vd add nhân viên vào tenant), gọi:

```
POST https://platform.reborn.vn/api/v1/tenant/{tenant_id}/membership
{
  "user_id": 123,
  "membership_role": "MEMBER"
}
```

Lý do: tất cả membership phải qua Platform (single source of truth). Org chỉ lưu chi tiết role/department nội bộ.

### 6.3.3. Webhook từ Platform → Org

Org subscribe các event:
- `tenant.created` → init org_chart mặc định (1 phòng ban "Ban giám đốc")
- `tenant.terminated` → archive toàn bộ org data của tenant

## 6.4. Integration với Notification Service

### 6.4.1. Outbox pattern

Mọi event domain ghi vào bảng `outbox_event` cùng transaction:

```java
@Transactional
public Tenant createTenant(CreateTenantRequest req) {
    Long tenantId = dsl.insertInto(TENANT)
        .set(TENANT.NAME, req.name())
        .set(TENANT.ALIAS, req.alias())
        // ...
        .returning(TENANT.ID)
        .fetchOne()
        .getId();

    dsl.insertInto(OUTBOX_EVENT)
        .set(OUTBOX_EVENT.AGGREGATE_TYPE, "tenant")
        .set(OUTBOX_EVENT.AGGREGATE_ID, tenantId)
        .set(OUTBOX_EVENT.EVENT_TYPE, "tenant.created")
        .set(OUTBOX_EVENT.PAYLOAD, JSON.valueOf(gson.toJson(Map.of(
            "tenant_id", tenantId,
            "admin_email", req.email()
        ))))
        .execute();

    return tenantRepo.findById(tenantId);
}
```

Background worker (`OutboxPublisher`) chạy mỗi 1s:
1. SELECT outbox_event WHERE published_at IS NULL ORDER BY occurred_at LIMIT 100
2. Publish lên Kafka topic `platform.events`
3. UPDATE published_at = NOW()
4. Nếu fail: increment publish_attempts, retry với backoff

### 6.4.2. Notification subscribe

Notification consume `platform.events`:

| Event | Notification action |
|---|---|
| `tenant.created` | Gửi email "Welcome + activation link" cho admin_email |
| `tenant.activated` | Gửi email confirmation |
| `tenant.expired` | Gửi email cảnh báo 7 ngày trước, ngày hết hạn, sau 3/7/14 ngày |
| `tenant.suspended` | Gửi email + push noti cho admin |
| `tenant.membership_added` | Gửi invite email + in-app noti |
| `tenant.renewed` | Gửi email confirmation + invoice |

Notification service tự quản template (Notification có bảng `email_template`).

### 6.4.3. Email integration (Gmail/Outlook OAuth)

Khi user (super admin) cần gửi email từ tài khoản cá nhân (vd reply ticket khách hàng):
1. User mở `/setting_account` → click "Connect Gmail" / "Connect Outlook"
2. FE redirect tới OAuth URL của Notification Service: `https://notification.reborn.vn/oauth/google/start?return_url=...`
3. Notification handle OAuth flow, lưu token trong bảng `user_email_account` của chính nó
4. Khi cần gửi email: app/superadmin gọi `POST https://notification.reborn.vn/api/v1/email/send` với `from_account_id`
5. Notification check token, refresh nếu cần, gọi Gmail/Graph API gửi mail

**Platform KHÔNG lưu OAuth token** — đây là decision quan trọng để giảm blast radius nếu Platform bị compromise.

## 6.5. Integration với Business Apps (CRM, BPM…)

### 6.5.1. Apps gọi Platform (sync)

Mỗi request vào CRM tenant (vd `GET /customer/list`), CRM cần biết:
- Tenant này đang dùng gói nào? Còn hạn không?
- User caller có membership trong tenant này không?
- Resource CUSTOMER × VIEW có trong entitlement của gói không?

Cache strategy:
- CRM cache `entitlement` per tenant 5 phút (Redis)
- CRM cache `membership` per user_id 1 phút
- Invalidate khi nhận event `tenant.package_changed` / `membership_removed`

### 6.5.2. Apps subscribe events (async)

Apps subscribe `platform.events` với các topic phù hợp:

| App | Subscribe events | Action |
|---|---|---|
| CRM | tenant.* | Sync local cache, lock/unlock UI |
| CRM | package.permission_updated | Recompute role_permission cho tenant đang dùng |
| BPM | tenant.* | Tương tự CRM |
| Mobile App | tenant.expired | Show banner "tài khoản hết hạn" |

### 6.5.3. Apps query Platform — endpoint mở

Public read-only endpoints (cho apps gọi):

```
GET /api/v1/internal/tenant/{id}                     ← detail meta
GET /api/v1/internal/tenant/{id}/entitlement         ← matrix quyền
GET /api/v1/internal/tenant/by-subdomain/{subdomain} ← lookup từ subdomain
GET /api/v1/internal/membership/{user_id}            ← list tenant của user
GET /api/v1/internal/package/{id}                    ← detail package
GET /api/v1/internal/resource?include_actions=true   ← catalog
GET /api/v1/internal/module                          ← catalog
```

**Auth**: dùng **service-to-service token** (Identity phát hành cho mỗi app, scope `internal:read`).

## 6.6. Message broker

**Quyết định**: dùng **Kafka** (hoặc **RabbitMQ** nếu chưa có) cho event bus.

| Topic | Producer | Consumer | Partition |
|---|---|---|---|
| `platform.events` | Platform | Notification, Org, CRM, BPM, Mobile | by tenant_id |
| `identity.events` | Identity | Platform, Org, CRM | by user_id |
| `org.events` | Org | Platform (membership update), Apps | by tenant_id |

**Schema registry**: dùng Avro hoặc JSON Schema để đảm bảo backward compatibility. Spec ở `docs/platform-service/events/platform-v1.json-schema.json` (sẽ tạo trong implementation).

## 6.7. Service Discovery

Hosts production:
- `platform.reborn.vn` → Platform
- `auth.reborn.vn` → Identity
- `org.reborn.vn` → Org
- `notification.reborn.vn` → Notification
- `connect.reborn.vn` → đã có (OAuth connectors)

Service-to-service traffic đi qua internal load balancer (vd `platform.internal:8090`) khi cùng K8s cluster, fallback DNS public.

## 6.8. Failure modes & SLO

| Dependency | Failure impact | SLO yêu cầu |
|---|---|---|
| Identity down | Platform không verify được JWT mới (token cũ vẫn ok đến hết expiry) | 99.95% (Identity là dependency hard) |
| Org down | Platform vẫn hoạt động, Org-related field hiển thị placeholder | 99.5% |
| Notification down | Email không gửi được, retry queue | 99% |
| Kafka down | Outbox không publish được, ghi tạm DB, replay khi up | 99.5% |
| `prod_platformdb` down | Platform return 503 toàn bộ | 99.95% (HA cluster) |

## 6.9. Cross-service transaction → Saga pattern

Khi 1 use case cần thay đổi nhiều service (vd "Create tenant + create owner user + send welcome email"), không dùng 2-phase commit. Dùng **orchestrated saga**:

```
1. Platform: INSERT tenant (status=pending)
2. Platform: call Identity POST /users (tạo owner) → user_id
3. Platform: INSERT tenant_membership (user_id, OWNER, status=invited)
4. Platform: emit tenant.created event
5. Platform: UPDATE tenant.status = active
6. Notification consume: send invite email

Compensation (nếu step 2 fail):
- DELETE tenant (vẫn ở pending, chưa published)
- Return error to FE

Compensation (nếu step 6 fail):
- Tenant vẫn active, retry send email từ Notification queue
- Manual reset password link nếu retry thất bại sau 24h
```

## 6.9b. Self-service signup integration (Phase 5)

### 6.9b.1. Sequence diagram — luồng end-to-end

```
┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│ Visitor  │  │ ecosystem.   │  │ Platform │  │ Identity │  │ Notification │
│          │  │ reborn.vn    │  │          │  │          │  │              │
└────┬─────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘
     │ open page     │                │              │                │
     │──────────────►│                │              │                │
     │               │ GET /public/   │              │                │
     │               │  package/      │              │                │
     │               │  self-signup   │              │                │
     │               │───────────────►│              │                │
     │               │ ◄──────────────│  list trial+free pkg          │
     │ fill form     │                │              │                │
     │──────────────►│                │              │                │
     │               │ POST /public/  │              │                │
     │               │  signup        │              │                │
     │               │ {captcha,…}    │              │                │
     │               │───────────────►│              │                │
     │               │                │ verify       │                │
     │               │                │ captcha+rate │                │
     │               │                │ INSERT       │                │
     │               │                │ signup_request │              │
     │               │                │              │                │
     │               │                │ outbox event │                │
     │               │                │ signup.submitted              │
     │               │                │─────────────────────────────►│
     │               │                │              │                │
     │               │                │              │                │ send verify email
     │               │ ◄──────────────│  201 + signup_id              │
     │ "check email" │                │              │                │
     │ ◄─────────────│                │              │                │
     │                                │              │                │
     │ Receive email + click link "Verify"           │                │
     │──────────────────────────────────────────────►│                │
     │                                │              │                │
     │ POST /public/signup/verify-email              │                │
     │  {token}                       │              │                │
     │ ──────────────────────────────►│              │                │
     │                                │ check token  │                │
     │                                │ recheck alias│                │
     │                                │              │                │
     │                                │ POST /users  │                │
     │                                │─────────────►│                │
     │                                │              │ create user    │
     │                                │ ◄────────────│  return user_id│
     │                                │ INSERT tenant│                │
     │                                │ INSERT tenant_app             │
     │                                │ INSERT tenant_membership      │
     │                                │ UPDATE signup_request.status=activated
     │                                │              │                │
     │                                │ outbox event │                │
     │                                │ tenant.self_onboarded         │
     │                                │─────────────────────────────►│
     │                                │              │                │ send welcome
     │                                │              │                │ email + setup
     │                                │              │                │ guide
     │ ◄──────────────────────────────│  200 + tenant_url             │
     │                                │              │                │
     │ Open https://{alias}.reborn.vn/crm + đặt password + bắt đầu dùng
     │
```

### 6.9b.2. Tích hợp với `ecosystem.reborn.vn`

`ecosystem.reborn.vn` là Next.js / React static site (không có backend riêng). 2 cách tích hợp:

**Option A — JS SDK** (preferred):
- Reborn publish 1 SDK NPM `@reborn/platform-signup-sdk`
- ecosystem.reborn.vn dùng SDK gọi public API
- SDK handle: CAPTCHA, debounce check-availability, error mapping, i18n

**Option B — Embed iframe**:
- Platform host form tại `https://platform.reborn.vn/embed/signup` (HTML đơn giản)
- ecosystem nhúng `<iframe src="..." />`
- Nhanh hơn nhưng UX kém (limited styling, tracking khó)

→ Quyết định: **Option A** (xem ADR-021)

### 6.9b.3. Saga: Email verification → Tenant creation

Khi user click verify link, đây là 1 distributed transaction qua 3 service:

```
Step | Service   | Action                          | Compensation if fail
─────┼───────────┼─────────────────────────────────┼────────────────────────
  1  | Platform  | Lock signup_request row          | -
  2  | Platform  | Re-check alias availability      | UPDATE status='conflict_alias'
  3  | Identity  | POST /users (create or get)      | Skip if user exists
  4  | Platform  | INSERT tenant                    | DELETE tenant if step 5+ fail
  5  | Platform  | INSERT tenant_app                | DELETE tenant_app + tenant
  6  | Platform  | INSERT tenant_membership         | DELETE all 3
  7  | Platform  | UPDATE signup_request=activated  | -
  8  | Platform  | Emit tenant.self_onboarded       | -  (outbox handles retry)
  9  | Notif.    | Send welcome email               | Retry queue (best-effort)
```

**Atomicity**: Steps 4-7 trong cùng DB transaction (Platform). Step 3 là remote call → compensation:
- Nếu user mới tạo bị orphan (Identity tạo, Platform fail) → cron sweep daily, gọi Identity DELETE user nếu chưa có membership

**Idempotency**: Verify endpoint chấp nhận `Idempotency-Key` header, nhưng do `verify_token` đã unique 1-shot, không cần.

### 6.9b.4. Email verification — chống lạm dụng

- Mỗi `verify_token` chỉ dùng 1 lần (set status=`activated` sau khi dùng)
- Token expire sau 24h
- Cron mỗi 5 phút mark expired:
  ```sql
  UPDATE signup_request
     SET status = 'expired'
   WHERE status = 'pending_email_verify'
     AND expires_at < NOW();
  ```
- Anti-fraud: nếu IP có >10 signup expired không verify trong 7 ngày → block IP 30 ngày

### 6.9b.5. Welcome email content (template)

Subject: `[Reborn] Tài khoản {tenant_name} đã sẵn sàng — Bắt đầu trong 5 phút`

Body:
```
Xin chào {full_name},

Cảm ơn bạn đã đăng ký dùng thử {package_name} của Reborn!

🌐 URL truy cập: https://{alias}.reborn.vn/crm
👤 Tài khoản: {email}
🔑 Đặt mật khẩu lần đầu: {set_password_link}    (link Identity, hết hạn 7 ngày)
⏰ Trial hết hạn: {trial_ends_at}                (chỉ với gói Trial)

🚀 5 bước đầu tiên:
1. Đặt mật khẩu cho tài khoản
2. Hoàn thiện thông tin doanh nghiệp
3. Mời thành viên team
4. Import danh sách khách hàng đầu tiên
5. Khám phá báo cáo dashboard

📚 Hướng dẫn chi tiết: https://help.reborn.vn/quickstart
💬 Cần hỗ trợ? support@reborn.vn

— Đội ngũ Reborn JSC
```

### 6.9b.6. Trial expiry handling

Cron daily 02:00:
```sql
-- Mark expired trial
UPDATE tenant_app
   SET status = 'expired'
 WHERE status = 'active'
   AND end_date < CURDATE()
   AND deleted_at IS NULL;

-- Emit event tenant.expired cho mỗi row
```

Notification:
- T-3 ngày: gửi email "Trial sắp hết, nâng cấp ngay nhận ưu đãi 30%"
- T-1 ngày: gửi reminder
- T+0: gửi "Trial đã hết, dữ liệu được giữ 30 ngày, click để nâng cấp"
- T+30: cron auto-suspend tenant nếu chưa nâng cấp

## 6.9c. App Edition routing — luồng từ login đến đúng FE

### 6.9c.1. Vấn đề
1 user của tenant Spa "Reborn JSC" sau khi login vào `auth.reborn.vn` cần được redirect tới `https://rebornjsc.reborn.vn/crm-spa` (KHÔNG `/crm-edu` hay `/crm-realty`). Tương tự tenant BĐS "TNPM" → `https://tnpm.reborn.vn/crm-realty`. Khi click "App Switcher" trong CRM để qua BPM, phải đi đúng edition của BPM mà tenant đó đăng ký.

→ Routing là chức năng cốt lõi của Platform: cho biết user X của tenant Y nếu muốn dùng app Z thì đi đâu.

### 6.9c.2. URL pattern (chốt — 1 quy luật chung)

```
https://{tenant.subdomain}.reborn.vn{edition.url_suffix}/{app-internal-path}
```

Ví dụ:
- TNPM (BĐS) + CRM → `https://tnpm.reborn.vn/crm-realty`
- Reborn JSC (Spa) + CRM → `https://rebornjsc.reborn.vn/crm-spa`
- Reborn JSC + SUPERADMIN → `https://rebornjsc.reborn.vn/superadmin`
- Cty X + BPM → `https://cty-x.reborn.vn/bpm`

Ngoại lệ — reserved subdomain (`auth`, `platform`, `org`, `notification`, `ecosystem`, ...) đi nginx custom route (xem `09-Deployment § 9.9`).

### 6.9c.3. Sequence — sau khi user login

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐
│ Browser  │  │   SSO    │  │ Platform │  │  CRM-Realty FE   │
│          │  │ (auth.   │  │          │  │  (qua nginx      │
│          │  │ reborn.  │  │          │  │   wildcard route)│
│          │  │ vn)      │  │          │  │                  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────────┘
     │ login        │              │                │
     │─────────────►│              │                │
     │              │ verify       │                │
     │              │              │                │
     │              │ GET /me/access-urls           │
     │              │─────────────►│                │
     │              │              │ query memberships + tenant_app + app_edition
     │              │ ◄────────────│  list apps + redirect_urls (đã tính)
     │              │              │                │
     │              │ pick default app (CRM)        │
     │              │ redirect_url = first matched in response
     │              │              │                │
     │ 302 → https://tnpm.reborn.vn/crm-realty      │
     │ ◄────────────│              │                │
     │                                              │
     │ GET https://tnpm.reborn.vn/crm-realty        │
     │  ──── nginx server *.reborn.vn ──────────────│
     │  ──── location ^/crm-realty/ → CRM-Realty FE │
     │─────────────────────────────────────────────►│
     │                                              │ extract tenant từ subdomain (tnpm)
     │                                              │ check subscription valid
     │                                              │  (gọi Platform internal/tenant/{id}/app/CRM)
     │                                              │ render dashboard
     │ ◄────────────────────────────────────────────│
```

### 6.9c.4. App Switcher widget — chuyển giữa các app

Mỗi app FE (CRM, BPM, ...) có 1 widget "App Switcher" ở góc trên, cho user nhảy giữa các app/tenant:

```
┌──────────────────────────────────────┐
│ Reborn JSC ▼                          │  ← Tenant switcher (multi-tenant user)
├──────────────────────────────────────┤
│ ✓ Reborn JSC      → rebornjsc.reborn.vn
│   Spa Dr.Lena     → drlena.reborn.vn
│   Cty BĐS TNPM    → tnpm.reborn.vn
└──────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Apps ▼                                          │  ← Theo tenant đang chọn
├────────────────────────────────────────────────┤
│ ● CRM (CRM-SPA)     /crm-spa    [đang ở]       │
│ ○ BPM (BPM-GENERIC) /bpm                       │
│ ○ POS (POS-FNB)     /pos-fnb                   │
└────────────────────────────────────────────────┘
```

**Implementation**: FE app chỉ cần:
1. Khi load: gọi `GET https://platform.reborn.vn/api/v1/me/access-urls`
2. Hiển thị list, click → `window.location = redirect_url` (đã tính sẵn `https://{tenant}.reborn.vn{suffix}`)

KHÔNG cần FE biết tenant subdomain, root domain, hay url_suffix — Platform tính tất cả.

### 6.9c.5. Nginx routing — 2 lớp

```
Lớp 1: Reserved subdomain (custom route)
─────────────────────────────────────────────────────────
auth.reborn.vn           → Identity Service
platform.reborn.vn       → Platform Service (this)
org.reborn.vn            → Org Service
notification.reborn.vn   → Notification Service
ecosystem.reborn.vn      → Corporate site + self-signup form
cdn.reborn.vn            → CDN
... (xem 03-Domain § reserved subdomain table)

Lớp 2: Wildcard tenant (*.reborn.vn) — route theo path suffix
─────────────────────────────────────────────────────────
*.reborn.vn/crm-spa/*       → crm-spa-fe deployment
*.reborn.vn/crm-realty/*    → crm-realty-fe
*.reborn.vn/crm-edu/*       → crm-edu-fe
*.reborn.vn/crm/*           → crm-generic-fe
*.reborn.vn/bpm/*           → bpm-fe
*.reborn.vn/cxm/*           → cxm-fe
*.reborn.vn/pos-fnb/*       → pos-fnb-fe
*.reborn.vn/superadmin/*    → superadmin-fe
*.reborn.vn/                → tenant-landing-fe (chọn app khi user không vào URL cụ thể)
```

Sample nginx config đầy đủ ở `09-Deployment § 9.9`.

### 6.9c.4. Tenant subscribe app mới — flow chọn edition

Khi superadmin (UC-01) hoặc tenant admin add app mới cho tenant:

1. UI hiển thị list app (`GET /api/v1/app`)
2. Chọn app (vd CRM) → UI gọi `GET /api/v1/app/CRM/edition?industry_id={tenant.industry_id}`
3. Hiển thị list edition, highlight default
4. User chọn edition → submit `POST /api/v1/tenant/{id}/app` với `app_edition_id`
5. Platform INSERT `tenant_app(app_edition_id = X)`
6. Emit event `tenant.app_subscribed` (kèm edition info)
7. FE edition (vd CRM-SPA) consume event → init data riêng cho tenant

### 6.9c.6. Edge case — đổi edition của tenant đã active

Vd tenant Spa muốn đổi sang Healthcare → đổi `tenant_app.app_edition_id` từ `CRM-SPA` → `CRM-HEALTHCARE`.

Vấn đề:
- Data structure của 2 edition khác nhau (CRM-SPA có `treatment_history`, CRM-HEALTHCARE có `medical_record`)
- User đang dùng bookmark URL `https://rebornjsc.reborn.vn/crm-spa/customer/123` → URL cũ chết (path đổi sang `/crm-health/`)

Giải pháp:
1. Schedule `change_edition` (POST `/tenant_app/{id}/change_edition`)
2. Platform: ghi nhận thời điểm switch (`schedule_at`)
3. Trước switch 24h: gửi email cảnh báo cho admin tenant
4. Đến `schedule_at`:
   - UPDATE `tenant_app.app_edition_id`
   - Emit `tenant_app.edition_changed`
5. CRM-SPA FE consume event → mark tenant data archive, redirect users sang URL mới (path mới)
6. CRM-HEALTHCARE FE consume → init data structure mới
7. Optional: data migration job (do team riêng viết per case)
8. Bonus: nginx có thể setup redirect cũ → mới trong 30 ngày để bookmark còn dùng được:
   ```nginx
   location ^/crm-spa/ { return 302 https://$host/crm-health/$1; }
   ```

→ Cực kỳ rare event. UI chỉ SUPER_ADMIN mới thấy nút đổi edition.

### 6.9c.7. URL routing tính sẵn vs runtime

**Lựa chọn**: tính `redirect_url` ở **server side** (Platform) thay vì để FE concat.

Lý do:
- Logic routing (`{subdomain}.{root}{suffix}`) ẩn khỏi FE → nếu sau này đổi pattern (vd thêm version path `/v2/`) chỉ cần update Platform code
- Root domain (`reborn.vn` prod / `staging.reborn.vn` staging) là config Platform, FE không cần biết
- Centralized — 1 nơi sửa nếu domain thay đổi
- Test dễ — mock 1 endpoint cho mọi case

## 6.10. API contract testing

- **Provider tests** (Platform): verify response match OpenAPI spec
- **Consumer tests** (Apps): Pact contracts — Apps publish expected request/response, Platform CI verify trước khi deploy
- Tools: Pact, Spring Cloud Contract
- Test framework: JUnit 5 + spring-boot-starter-test + javafaker (test data) — match cloud-sales
