# 05 — API Spec

> REST + JSON. Base URL production: `https://platform.reborn.vn/api/v1`. Staging: `https://platform-staging.reborn.vn/api/v1`. Local: `http://localhost:8090/api/v1`.

## 5.1. Convention

### Versioning
- Path versioning: `/api/v1/...`. Bump v2 khi breaking change.
- Backward compat: v1 sống ≥1 năm sau khi v2 release.

### Auth
- Mọi endpoint (trừ `/health`, `/openapi.json`) yêu cầu **JWT Bearer**:
  ```
  Authorization: Bearer <jwt>
  ```
- JWT do Identity Service phát hành, Platform verify qua JWKS endpoint của Identity (cache JWKS 1h).
- Claims yêu cầu trong JWT:
  - `sub` (user_id)
  - `email`
  - `roles` (array của platform_role.code, vd `["SUPER_ADMIN"]`) — Platform tự load lại từ DB nếu claim thiếu.

### Authorization
- Platform check `platform_user_role` của caller với action yêu cầu (vd `tenant.create` → role có permission `tenant.create` hoặc `*`).
- 403 Forbidden nếu thiếu quyền.

### Headers (mọi request)
```
Authorization: Bearer <jwt>           ← required
X-Request-Id: <uuid>                  ← optional, server gen nếu thiếu
Accept-Language: vi-VN | en-US        ← optional, default vi-VN
```

### Response wrapper

**Success**:
```json
{
  "code": 0,
  "message": "OK",
  "result": { ... }
}
```

**Error**:
```json
{
  "code": 4001,
  "message": "Tenant alias đã tồn tại",
  "errors": [
    { "field": "alias", "code": "DUPLICATE", "message": "alias 'rebornjsc' already exists" }
  ],
  "request_id": "..."
}
```

**Pagination response**:
```json
{
  "code": 0,
  "result": {
    "items": [ ... ],
    "total": 252,
    "page": 1,
    "limit": 10,
    "has_more": true
  }
}
```

### Error code map
| HTTP | code range | Ý nghĩa |
|---|---|---|
| 200/201 | 0 | Success |
| 400 | 4000–4099 | Validation error |
| 401 | 4101 | Unauthenticated |
| 403 | 4103 | Forbidden |
| 404 | 4104 | Not found |
| 409 | 4109 | Conflict (state machine, unique) |
| 422 | 4122 | Business rule violation |
| 429 | 4129 | Rate limit |
| 500 | 5000+ | Server error |

### Pagination params
- `?page=1&limit=10` (1-indexed)
- `?sort=created_at:desc,name:asc`
- `?filter[status]=active&filter[industry_id]=1`

### Date format
- All `TIMESTAMPTZ` returned as ISO 8601 UTC: `2026-05-10T03:00:00Z`
- Date only: `2026-05-10`

## 5.2. Tenancy endpoints

### `GET /api/v1/tenant`
List tenant.

**Query**: `page, limit, sort, filter[status], filter[industry_id], filter[area_id], q (search name/alias)`

**Required role**: `tenant.read`

**Response 200**: pagination wrapper of:
```json
{
  "id": 1,
  "code": "TNT-2026-0001",
  "alias": "rebornjsc",
  "subdomain": "rebornjsc",
  "name": "Reborn JSC",
  "industry": { "id": 1, "code": "SPA", "name": "Spa & Thẩm mỹ" },
  "area": { "id": 1, "code": "01", "name": "Hà Nội" },
  "status": "active",
  "tenant_apps_count": 3,
  "members_count": 42,
  "created_at": "2024-01-15T08:00:00Z"
}
```

### `GET /api/v1/tenant/{id}`
Detail.

### `POST /api/v1/tenant`
Tạo tenant mới.

**Required role**: `tenant.create`

**Body**:
```json
{
  "name": "Công ty TNHH X",
  "alias": "company-x",
  "subdomain": "company-x",
  "industry_id": 1,
  "area_id": 12,
  "address": "...",
  "phone": "...",
  "email": "admin@company-x.com",
  "tax_code": "...",
  "owner_user_id": 123,            // optional — nếu user đã tồn tại
  "owner_email": "admin@company-x.com",  // hoặc tạo mới
  "tenant_apps": [
    { "app_code": "CRM", "package_id": 5, "start_date": "2026-05-10" }
  ]
}
```

**Response 201**: tenant detail + tenant_apps được tạo. Trigger event `tenant.created`.

### `PUT /api/v1/tenant/{id}`
Update.

### `POST /api/v1/tenant/{id}/suspend`
Body: `{ "reason": "..." }`. Status active → suspended. Event `tenant.suspended`.

### `POST /api/v1/tenant/{id}/unsuspend`

### `DELETE /api/v1/tenant/{id}` (soft)

### `POST /api/v1/tenant/{id}/terminate`
Hard final. Cảnh báo confirm.

## 5.3. Tenant App (subscription) endpoints

### `GET /api/v1/tenant/{tenant_id}/app`
List apps đăng ký của 1 tenant.

### `POST /api/v1/tenant/{tenant_id}/app`
Đăng ký app mới cho tenant.
```json
{
  "app_code": "BPM",
  "package_id": 8,
  "start_date": "2026-05-10",
  "auto_renew": true
}
```

### `POST /api/v1/tenant_app/{id}/renew`
```json
{
  "cycle_months": 12,
  "amount": 199000
}
```
→ Update `end_date += cycle_months + bonus_months`. Insert `tenant_app_history`. Event `tenant.renewed`.

### `POST /api/v1/tenant_app/{id}/change_package`
```json
{ "new_package_id": 10, "effective_date": "2026-06-01", "prorate": true }
```

### `POST /api/v1/tenant_app/{id}/cancel`

### `GET /api/v1/tenant_app/expiring?within_days=30`
Báo cáo subscription sắp hết hạn (cho Billing).

## 5.4. Tenant Membership endpoints

### `GET /api/v1/tenant/{tenant_id}/membership`
List members của tenant. Enrich `name + email + avatar` từ Identity (batch call).

### `POST /api/v1/tenant/{tenant_id}/membership`
```json
{
  "user_id": 123,                   // hoặc
  "email": "new@member.com",        // tự tạo user nếu chưa có
  "membership_role": "MEMBER"
}
```
→ Status `invited`. Gửi email invite. Event `tenant.membership_added`.

### `POST /api/v1/membership/{id}/accept`
User accept invite.

### `DELETE /api/v1/membership/{id}` (revoke)

### `GET /api/v1/user/{user_id}/membership`
Cross-tenant: list tất cả tenant của 1 user (cho Tech Support).

### `GET /api/v1/membership?q={search}&filter[tenant_id]=...`
Search tổng hợp.

## 5.5. Package endpoints

### `GET /api/v1/package`
List package. Filter `?filter[app_code]=CRM&filter[industry_id]=1&filter[status]=active`.

### `GET /api/v1/package/{id}`
Detail kèm `permissions[]` (full matrix).

### `POST /api/v1/package`
```json
{
  "code": "PREMIUM_CRM",
  "name": "Gói Premium CRM",
  "app_code": "CRM",
  "industry_id": 1,
  "base_price": 299000,
  "sale_price": 199000,
  "cycle_months": 12,
  "bonus_months": 2,
  "max_users": 50,
  "max_storage_mb": 10240,
  "features": ["CRM nâng cao", "Báo cáo thông minh", "API access"],
  "permissions": [
    { "resource_code": "CUSTOMER", "action_code": "VIEW", "allowed": true },
    { "resource_code": "CUSTOMER", "action_code": "CREATE", "allowed": true, "limit_value": 1000 },
    ...
  ]
}
```

### `PUT /api/v1/package/{id}`

### `PUT /api/v1/package/{id}/permissions` (bulk update matrix)
```json
{
  "permissions": [
    { "resource_code": "INVOICE", "action_code": "CREATE", "allowed": false },
    ...
  ]
}
```
→ Event `package.permission_updated`.

### `POST /api/v1/package/{id}/archive`

## 5.6. Catalog endpoints

### Industry — `GET|POST|PUT|DELETE /api/v1/industry`
CRUD đơn giản.

### Area — `GET /api/v1/area`
- `?level=1` → list tỉnh
- `?parent_area_id=1` → list huyện của tỉnh 1
- `?q=hà+nội` → search

### Module — `GET|POST|PUT|DELETE /api/v1/module`

### Resource — `GET|POST|PUT|DELETE /api/v1/resource`
Body POST có thêm `actions[]`:
```json
{
  "code": "CONTRACT",
  "name": "Hợp đồng",
  "category": "data",
  "actions": [
    { "code": "VIEW", "name": "Xem", "is_default": true },
    { "code": "CREATE", "name": "Tạo" },
    { "code": "UPDATE", "name": "Sửa" },
    { "code": "DELETE", "name": "Xoá" },
    { "code": "APPROVE", "name": "Phê duyệt" }
  ]
}
```

### `PUT /api/v1/module/{id}/resources` (gán resources vào module)
```json
{ "resource_ids": [1, 2, 5, 8] }
```

## 5.7. File Storage endpoints

### `POST /api/v1/file/presigned-upload`
```json
{
  "owner_type": "TENANT",
  "owner_id": 1,
  "original_name": "logo.png",
  "mime_type": "image/png",
  "size_bytes": 12345
}
```
**Response**:
```json
{
  "file_id": "uuid-...",
  "upload_url": "https://s3.../bucket/key?signature=...",
  "expires_in": 600,
  "fields": { ... }   // for S3 form upload
}
```

FE upload trực tiếp lên `upload_url`, KHÔNG qua BE. Sau upload → call `POST /api/v1/file/{id}/confirm` để xác nhận.

### `GET /api/v1/file/{id}` 
Trả metadata + signed download URL.

### `DELETE /api/v1/file/{id}` (soft)

## 5.8. Help Center endpoints (Phase 2)

### `GET /api/v1/help/video?module_code=CRM&industry_id=1&language=vi`

### `GET /api/v1/help/article?q=...&tag=...`

### `GET /api/v1/help/article/{slug}`

CRUD admin endpoints: `POST|PUT|DELETE /api/v1/help/video|article`.

## 5.9. Platform Admin endpoints (vận hành Reborn JSC)

### `GET /api/v1/me`
Profile của caller (sau khi join Identity + platform_user_role).
```json
{
  "user": { "id": 66, "name": "...", "email": "...", "avatar": "..." },
  "platform_roles": ["SUPER_ADMIN"],
  "permissions": ["*"],
  "memberships": [
    { "tenant_id": 1, "tenant_name": "Reborn JSC", "membership_role": "OWNER" }
  ]
}
```

### `GET /api/v1/platform_role` 
List vai trò vận hành.

### `POST /api/v1/platform_user_role`
Gán role cho nhân viên Reborn JSC.

### `DELETE /api/v1/platform_user_role/{id}`

## 5.9b. Public Self-Signup endpoints (Phase 5)

> Endpoints **KHÔNG yêu cầu auth** — gọi từ form trên `ecosystem.reborn.vn`. Phải có anti-abuse: CAPTCHA token + rate limit per IP. Chi tiết NFR ở `08 § 8.3.10`.

### `GET /api/v1/public/package/self-signup-eligible`
List các gói cho phép self-signup (Trial + Free) — dùng cho dropdown trên form `ecosystem.reborn.vn`.

**Auth**: none

**Response 200**:
```json
{
  "code": 0,
  "result": [
    {
      "id": 1,
      "code": "TRIAL_14D_CRM",
      "name": "Dùng thử CRM 14 ngày",
      "description": "Trải nghiệm đầy đủ tính năng trong 14 ngày",
      "is_trial": true,
      "trial_days": 14,
      "is_free": false,
      "max_users": 5,
      "features": ["Quản lý khách hàng", "Báo cáo cơ bản", "Email marketing"]
    },
    {
      "id": 2,
      "code": "FREE_LIMITED_CRM",
      "name": "Gói Free CRM",
      "description": "Miễn phí vô thời hạn, giới hạn 1 user và 100 khách hàng",
      "is_trial": false,
      "is_free": true,
      "max_users": 1,
      "max_customers": 100,
      "features": ["Quản lý khách hàng cơ bản"]
    }
  ]
}
```

### `POST /api/v1/public/signup/check-availability`
Kiểm tra alias/subdomain có sẵn không — gọi khi user gõ tên doanh nghiệp.

**Auth**: none. Rate limit: 60 req/min/IP.

**Body**:
```json
{ "suggested_alias": "company-x" }
```

**Response 200**:
```json
{
  "code": 0,
  "result": {
    "available": false,
    "alternatives": ["company-x-1", "company-x-vn", "companyx-2026"]
  }
}
```

### `POST /api/v1/public/signup`
Submit form đăng ký. Tạo `signup_request` (status `pending_email_verify`) + gửi email xác minh.

**Auth**: none. **Required headers**:
- `X-Captcha-Token: <reCAPTCHA v3 token>` (verify với Google reCAPTCHA API)
- `X-Forwarded-For: <client IP>` (từ Cloudflare/nginx)

**Rate limit**: 3 req/giờ/IP, 1 req/giờ/email.

**Body**:
```json
{
  "email": "founder@company-x.com",
  "phone": "0901234567",
  "full_name": "Nguyễn Văn A",
  "company_name": "Công ty TNHH X",
  "suggested_alias": "company-x",
  "industry_id": 1,
  "area_id": 12,
  "package_id": 1,
  "captcha_token": "...",
  "utm_source": "google_ads",
  "utm_campaign": "spring2026",
  "referrer_url": "https://ecosystem.reborn.vn/pricing"
}
```

**Validation**:
- `email`: format hợp lệ + chưa bị block
- `package_id`: phải có `is_self_signup_eligible = 1`
- `suggested_alias`: 3-63 ký tự, regex `^[a-z0-9][a-z0-9-]+[a-z0-9]$`, chưa tồn tại trong `tenant.alias` HOẶC trong `signup_request` đang `pending_email_verify`
- `captcha_token`: verify với Google API → score ≥ 0.5
- `email`: chưa có `signup_request` đang `pending_email_verify` (1 email = 1 active signup)

**Response 201**:
```json
{
  "code": 0,
  "message": "Đã gửi email xác minh tới founder@company-x.com. Vui lòng kiểm tra hộp thư trong vòng 24h.",
  "result": {
    "signup_request_id": 12345,
    "email": "founder@company-x.com",
    "expires_at": "2026-05-11T10:00:00Z"
  }
}
```

**Side effect**:
- INSERT `signup_request`
- Emit event `signup_request.submitted` → Notification gửi email với link `https://ecosystem.reborn.vn/verify?token={verify_token}`

**Response 422** (validation fail):
```json
{
  "code": 4122,
  "message": "Tên truy cập đã được sử dụng",
  "errors": [
    { "field": "suggested_alias", "code": "DUPLICATE", "alternatives": ["company-x-1", "company-x-vn"] }
  ]
}
```

**Response 429** (rate limit):
```
Retry-After: 3600
```

### `POST /api/v1/public/signup/verify-email`
Verify token từ email link → atomically tạo tenant + tenant_app + tenant_membership + (Identity user nếu mới).

**Auth**: none.

**Body**:
```json
{ "verify_token": "a1b2c3d4..." }
```

**Logic** (saga, transaction):
1. Lookup `signup_request` theo `verify_token`, check `status = pending_email_verify` và `expires_at > NOW()`
   - Nếu không hợp lệ → 410 Gone với message phù hợp
2. Re-check alias availability (vì có thể bị chiếm trong khi user đợi verify)
   - Nếu không còn → return suggestions, status giữ `pending_email_verify`, user phải submit lại
3. Gọi Identity `POST /users` tạo user mới (nếu email chưa có), nhận `user_id`
4. INSERT `tenant` (status = `active`, alias từ `suggested_alias`)
5. INSERT `tenant_app` (package_id, start = NOW, end = NOW + trial_days hoặc 999 năm cho Free)
6. INSERT `tenant_membership` (user_id, OWNER, status = `active`, joined_at = NOW)
7. UPDATE `signup_request.status = activated`, `tenant_id = X`, `user_id = Y`
8. Emit event `tenant.self_onboarded`

**Response 200**:
```json
{
  "code": 0,
  "message": "Tạo tài khoản thành công. Vui lòng kiểm tra email để đặt mật khẩu.",
  "result": {
    "tenant_id": 999,
    "tenant_alias": "company-x",
    "tenant_url": "https://company-x.reborn.vn/crm",
    "owner_email": "founder@company-x.com",
    "package_name": "Dùng thử CRM 14 ngày",
    "trial_ends_at": "2026-05-25T10:00:00Z"
  }
}
```

**Side effect**:
- Notification subscribe `tenant.self_onboarded` → gửi email welcome (với link đặt password + URL tenant + 5 bước hướng dẫn đầu tiên)

### `POST /api/v1/public/signup/resend-verify`
Gửi lại email verification (nếu mất email). Rate limit 1 req/5 phút/email.

**Body**: `{ "email": "founder@company-x.com" }`

### Admin endpoints (yêu cầu role)

#### `GET /api/v1/signup_request` 
Super Admin xem list signup. Filter theo status, source_ip (anti-abuse), date range.

**Required role**: `signup_request.read`

#### `POST /api/v1/signup_request/{id}/reject`
Admin reject 1 signup (vd phát hiện fraud).

**Required role**: `signup_request.reject`

**Body**: `{ "reason": "..." }`

## 5.10. Webhook (outbound) — Phase 3

Apps đăng ký webhook để nhận event:

### `POST /api/v1/webhook/subscription`
```json
{
  "url": "https://crm.reborn.vn/internal/platform-events",
  "event_types": ["tenant.created", "tenant.expired", "package.permission_updated"],
  "secret": "shared-secret-for-hmac"
}
```

Mỗi event POST tới URL với body:
```json
{
  "event_id": "uuid",
  "event_type": "tenant.expired",
  "occurred_at": "2026-05-10T03:00:00Z",
  "payload": { "tenant_id": 1, "expired_at": "..." }
}
```
Header `X-Reborn-Signature: sha256=...` (HMAC body với secret).

Subscriber phải trả 2xx trong 5s, ngược lại Platform retry với exponential backoff (5 lần, max 24h).

## 5.11. Health & Ops endpoints

| Endpoint | Auth | Mục đích |
|---|---|---|
| `GET /health/live` | none | Liveness probe (k8s) |
| `GET /health/ready` | none | Readiness probe — check DB + Identity reachable |
| `GET /metrics` | basic | Prometheus metrics |
| `GET /openapi.json` | none | OpenAPI 3 spec auto-generated |
| `GET /actuator/info` | basic | Build info (commit, version) |

## 5.12. Rate limits (production)

| Endpoint group | Limit |
|---|---|
| `GET /api/v1/*` (read) | 1000 req/min/user |
| `POST/PUT/DELETE /api/v1/*` (write) | 100 req/min/user |
| `POST /api/v1/file/presigned-upload` | 30 req/min/user |
| Anonymous (no auth) | 60 req/min/IP |

429 với header `Retry-After: <seconds>`.

## 5.13. OpenAPI source location

Spec OpenAPI 3.0 đầy đủ: `docs/platform-service/openapi/platform-v1.yaml` (sẽ được generate từ Spring annotations + maintain manually cho documentation phụ).

```
docs/platform-service/openapi/
├── platform-v1.yaml         (main spec)
├── components/
│   ├── tenant.yaml
│   ├── package.yaml
│   ├── module-resource.yaml
│   └── ...
└── examples/
    ├── tenant-create.json
    └── ...
```

→ Sẽ tạo trong giai đoạn implementation. Spec hiện tại trong file này là **tóm tắt** đủ để duyệt.

## 5.14. Idempotency

Endpoint write-side hỗ trợ `Idempotency-Key` header:
```
Idempotency-Key: <uuid>
```
Server lưu key + response trong 24h. Nếu request trùng key → trả response cũ, không làm lại.

Áp dụng bắt buộc cho: `POST /tenant`, `POST /tenant_app`, `POST /tenant_app/{id}/renew`, `POST /membership/{id}/accept`.
