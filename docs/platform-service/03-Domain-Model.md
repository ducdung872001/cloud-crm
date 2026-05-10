# 03 — Domain Model

## 3.1. Ubiquitous Language

| Thuật ngữ tiếng Việt | Code identifier | Nghĩa | Tránh nhầm với |
|---|---|---|---|
| Tổ chức (tenant) | `tenant` | Đơn vị thuê bao SaaS — 1 doanh nghiệp khách hàng | "organization" trong Org service (= tenant nhưng góc nhìn orgchart) |
| Đăng ký app | `tenant_app` | Tenant đăng ký dùng 1 app cụ thể với 1 gói trong 1 chu kỳ | "subscription" (term billing dùng sau) |
| Thành viên tenant | `tenant_membership` | Liên kết user ↔ tenant với vai trò ở mức platform | Role trong Org (per-tenant detailed) |
| Gói dịch vụ | `package` | Sản phẩm bán cho tenant: tên, giá, chu kỳ | "plan" (chưa dùng để tránh nhầm code) |
| Quyền theo gói | `package_permission` | Ma trận `package × resource × action` — entitlement | `role_permission` (Org, per-tenant) |
| Lĩnh vực kinh doanh | `industry` | Spa, Y tế, Giáo dục… — phân loại tenant | "field" (cũ — dễ nhầm form field) |
| Đơn vị hành chính | `area` | Tỉnh/huyện/xã VN — tree | "region" (geo wider) |
| Phân hệ | `module` | CRM, BPM, POS… — bundle các tài nguyên | "app" (= tenant_app, level instance) |
| Tài nguyên phân quyền | `resource` | CUSTOMER, INVOICE… — đối tượng kiểm soát truy cập kèm actions | "file resource" (storage) |
| Hành động | `action` | VIEW, CREATE, UPDATE, DELETE, EXPORT, APPROVE… | "method" (HTTP) |
| File metadata | `file_metadata` | Thông tin file upload (không lưu blob) | "attachment" (per-app context) |

## 3.2. Aggregates

Theo DDD, Platform có 5 aggregate roots:

```
┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│ Aggregate: Tenant                   │  │ Aggregate: Package                  │
│ ─────────────────────────────────── │  │ ─────────────────────────────────── │
│ ROOT: tenant                        │  │ ROOT: package                       │
│   children: tenant_app[]            │  │   children: package_permission[]    │
│             tenant_membership[]     │  │   refs:    resource_id, action      │
│   refs:    industry_id, area_id     │  │                                     │
│            user_id (created_by)     │  │ Invariant:                          │
│                                     │  │   - 1 row mỗi (package, resource,   │
│ Invariant:                          │  │     action) — UNIQUE                │
│   - alias UNIQUE toàn hệ thống      │  │   - resource phải tồn tại + active  │
│   - subdomain UNIQUE                │  │                                     │
│   - admin_email UNIQUE per tenant   │  │ Lifecycle:                          │
│                                     │  │   draft → active → archived         │
│ Lifecycle:                          │  │                                     │
│   pending → active → suspended →    │  └─────────────────────────────────────┘
│   expired → terminated              │
└─────────────────────────────────────┘
                                                                              
┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│ Aggregate: Module                   │  │ Aggregate: Industry                 │
│ ─────────────────────────────────── │  │ ─────────────────────────────────── │
│ ROOT: module                        │  │ ROOT: industry                      │
│   children: module_resource[]       │  │   (flat, không có child)            │
│   refs:    resource_id              │  │                                     │
│                                     │  │ Invariant:                          │
│ Invariant:                          │  │   - code UNIQUE                     │
│   - code UNIQUE (vd "CRM", "BPM")   │  │                                     │
│   - 1 resource có thể thuộc nhiều   │  └─────────────────────────────────────┘
│     module                          │                                          
└─────────────────────────────────────┘  ┌─────────────────────────────────────┐
                                          │ Aggregate: Area                     │
┌─────────────────────────────────────┐  │ ─────────────────────────────────── │
│ Aggregate: Resource (independent)   │  │ ROOT: area                          │
│ ─────────────────────────────────── │  │   self-ref: parent_area_id (tree)   │
│ ROOT: resource                      │  │                                     │
│   children: resource_action[]       │  │ Invariant:                          │
│                                     │  │   - level: 1=tỉnh, 2=huyện, 3=xã    │
│ Invariant:                          │  │   - parent.level = self.level - 1   │
│   - code UNIQUE (vd "CUSTOMER")     │  └─────────────────────────────────────┘
│   - tối thiểu 1 action                                                         
└─────────────────────────────────────┘
```

## 3.3. Entity Relationship (logical)

```
                ┌──────────┐
                │ industry │
                └────┬─────┘
                     │ 1:N
                     │
   ┌─────────────────▼──────────────────┐
   │              tenant                │ 1:N ┌──────────────────┐
   │  id, name, alias, subdomain,       ├────►│ tenant_app       │
   │  industry_id, area_id, status,     │     │ tenant_id        │
   │  created_by, created_at, ...       │     │ app_code (CRM…)  │
   └────┬───────────────────────────────┘     │ package_id ──┐   │
        │ 1:N                                 │ start_date   │   │
        │                                     │ end_date     │   │
   ┌────▼──────────────┐                      │ status       │   │
   │ tenant_membership │                      └──────────────┼───┘
   │ tenant_id         │                                     │
   │ user_id (Identity)│                              N:1    │
   │ membership_role   │                                     │
   │ status            │              ┌──────────────────────▼┐
   │ joined_at         │              │       package         │
   └───────────────────┘              │ id, code, name, price,│
                                      │ cycle_months, status  │
                                      └────────┬──────────────┘
                                               │ 1:N
                                      ┌────────▼─────────────────┐
                                      │  package_permission      │
                                      │ package_id               │
                                      │ resource_id ──┐          │
                                      │ action        │          │
                                      │ allowed: bool │          │
                                      └───────────────┼──────────┘
                                                      │ N:1
   ┌─────────────────┐         M:N         ┌──────────▼──────┐
   │     module      │◄────────────────────┤    resource     │
   │ id, code, name, │   module_resource   │ id, code, name, │
   │ status          │  (module_id,        │ description,    │
   └─────────────────┘   resource_id)      │ status          │
                                            └────────┬────────┘
                                                     │ 1:N
                                            ┌────────▼─────────┐
                                            │ resource_action  │
                                            │ (resource_id,    │
                                            │  action_code)    │
                                            └──────────────────┘

   ┌─────────────────┐
   │      area       │ self-ref tree (parent_area_id)
   │ id, code, name, │
   │ level, parent_id│
   └─────────────────┘

   ┌─────────────────────────────┐
   │      file_metadata          │
   │ id, owner_type (TENANT|     │
   │     USER|PACKAGE), owner_id,│
   │ original_name, mime_type,   │
   │ size_bytes, bucket, key,    │
   │ checksum_sha256, created_by │
   └─────────────────────────────┘

   ┌─────────────────────────────┐  ┌────────────────────────┐
   │       help_video            │  │     help_article       │
   │ id, title, video_url,       │  │ id, slug, title,       │
   │ module_code (FK), ordinal   │  │ content_md, module_code│
   └─────────────────────────────┘  └────────────────────────┘
```

## 3.4. Domain Events

Events được phát ra mỗi khi state thay đổi (sẽ implement bằng outbox pattern — chi tiết `06-Integration.md`).

| Event | Trigger | Payload chính | Subscriber |
|---|---|---|---|
| `tenant.created` | INSERT tenant | `{tenant_id, alias, admin_email}` | Notification (gửi welcome email) |
| `tenant.activated` | status: pending→active | `{tenant_id}` | CRM tenant (init data), Notification |
| `tenant.suspended` | status: active→suspended | `{tenant_id, reason}` | CRM tenant (block login) |
| `tenant.expired` | status: active→expired | `{tenant_id, expired_at}` | CRM tenant (read-only mode), Notification (gửi cảnh báo) |
| `tenant.terminated` | status: *→terminated (final) | `{tenant_id}` | All apps (data archival) |
| `tenant.package_changed` | tenant_app.package_id thay đổi | `{tenant_id, app_code, old_package_id, new_package_id}` | CRM tenant (recompute permissions) |
| `tenant.renewed` | tenant_app.end_date pushed | `{tenant_id, app_code, new_end_date, cycle_months}` | Notification (gửi confirmation) |
| `tenant.membership_added` | INSERT tenant_membership | `{tenant_id, user_id, role}` | Org (init employee record) |
| `tenant.membership_removed` | DELETE/soft-delete membership | `{tenant_id, user_id}` | Org (revoke employee), Notification |
| `package.permission_updated` | UPDATE package_permission | `{package_id, changes[]}` | All apps có tenant đang dùng package này |
| `module.activated` | INSERT module hoặc unarchive | `{module_id, code}` | All apps (refresh resource list) |
| `resource.activated` | INSERT resource hoặc unarchive | `{resource_id, code, actions[]}` | All apps (refresh permission catalog) |

## 3.5. State Machines

### 3.5.1. Tenant Status

```
                ┌─────────┐
        create  │         │  activate
        ───────►│ pending │─────────────►┌────────┐
                │         │              │        │ ─── manual suspend ────┐
                └─────────┘              │ active │                        │
                                         │        │ ─── time-based ───┐    │
                                         └───┬────┘                   │    │
                                             │ unsuspend              ▼    ▼
                                             │            ┌─────────┐   ┌───────────┐
                                             └────────────│ expired │   │ suspended │
                                                          └────┬────┘   └─────┬─────┘
                                                               │              │
                                                               │ renew        │ unsuspend
                                                               ▼              │
                                                            ┌──────┐          │
                                                            │active│◄─────────┘
                                                            └──────┘
                                                              │ terminate (manual final)
                                                              ▼
                                                       ┌────────────┐
                                                       │ terminated │ (frozen, archive)
                                                       └────────────┘
```

| Trạng thái | Cho phép login? | Cho phép API? | Hiển thị trên dashboard? |
|---|---|---|---|
| `pending` | ❌ | ❌ | ✅ (chờ kích hoạt) |
| `active` | ✅ | ✅ | ✅ |
| `suspended` | ❌ | ❌ (trừ admin Reborn) | ✅ (alert) |
| `expired` | ✅ (chỉ đọc) | ✅ GET only | ✅ (alert) |
| `terminated` | ❌ | ❌ | ❌ (chỉ admin Reborn xem) |

### 3.5.2. Tenant_app Status

Tương tự nhưng cấp độ "đăng ký app", tenant có thể có nhiều tenant_app cùng lúc (CRM active, BPM expired).

```
pending → active → expired → renewed (back to active)
                ↘ cancelled (final)
```

### 3.5.3. Package Status

```
draft → active → archived
```

- `draft`: chưa publish, không bán được
- `active`: bán được, hiển thị trên catalog
- `archived`: ẩn khỏi catalog mới nhưng tenant đang dùng vẫn ok

### 3.5.4. Membership Status

```
invited → active → revoked
       ↘ declined (terminal, có thể re-invite)
```

## 3.6. Invariants & Business Rules

### Tenant
- INV-T1: `tenant.alias` UNIQUE toàn hệ thống (case-insensitive). VD `rebornjsc`.
- INV-T2: `tenant.subdomain` UNIQUE, chỉ chứa `[a-z0-9-]`, length 3–63.
- INV-T3: 1 tenant phải có ≥1 `tenant_membership` với `membership_role = 'OWNER'`. Không cho xoá owner cuối cùng.
- INV-T4: Không cho terminate tenant nếu vẫn có `tenant_app` status `active`.

### Tenant_app
- INV-A1: `(tenant_id, app_code)` UNIQUE — mỗi tenant chỉ có 1 subscription cho 1 app cùng lúc. Renew = update `end_date`, không insert row mới.
- INV-A2: `end_date > start_date`.
- INV-A3: `package_id` phải point vào package có status `active`.

### Package
- INV-P1: `code` UNIQUE (vd `BASIC_CRM`, `PREMIUM_BPM`).
- INV-P2: Không cho archive package khi vẫn còn `tenant_app` đang reference (status active).
- INV-P3: `cycle_months` ∈ {1, 3, 6, 12, 24, 36, 999} (999 = vĩnh viễn).

### Package_permission
- INV-PP1: `(package_id, resource_id, action)` UNIQUE.
- INV-PP2: `action` phải có trong `resource_action` của resource đó.
- INV-PP3: Khi update package_permission → emit event để Org/Apps recompute (không break tenant đang dùng).

### Module
- INV-M1: `code` UNIQUE (vd `CRM`, `BPM`).
- INV-M2: Không cho delete module khi vẫn có `module_resource` link.

### Resource
- INV-R1: `code` UNIQUE.
- INV-R2: Mỗi resource phải có ≥1 action (default: VIEW).

### Industry
- INV-I1: `code` UNIQUE (vd `SPA`, `EDU`, `HEALTHCARE`).

### Area
- INV-AR1: `code` theo chuẩn của Bộ Nội vụ Việt Nam (mã tỉnh/huyện/xã).
- INV-AR2: `parent_area_id` không được tạo cycle.
- INV-AR3: `level = parent.level + 1`.

## 3.7. Bounded Context Map (Context Mapping)

```
┌─────────────────┐                  ┌─────────────────┐
│   Identity      │ ◄── conformist ──┤    Platform     │
│                 │                  │                 │
│ /users/{id}     │                  │ tenant_member.  │
│                 │                  │   user_id       │
└─────────────────┘                  └────┬────────────┘
                                          │ partnership
                                          │ (catalog ↔ assignment)
                                          ▼
                                     ┌─────────────────┐
                                     │      Org        │
                                     │ tenant_role,    │
                                     │ role_permission │
                                     └─────────────────┘
                                          ▲
                                          │ partnership
                                          │
┌─────────────────┐    open host         ┌┴────────────────┐
│  Notification   │ ◄── service ─────────┤  Business Apps  │
│ device_token,   │   (publish event)    │  CRM, BPM, …    │
│ email_account   │                      │                 │
└─────────────────┘                      └─────────────────┘
       ▲                                          ▲
       │ customer-supplier                        │
       │ (Platform publishes events)              │
       └──────────────────────────────────────────┘
```

**Pattern dùng:**
- **Conformist**: Platform conform Identity API contract (không sửa được).
- **Partnership**: Platform ↔ Org (cùng team Reborn JSC, evolve cùng nhau).
- **Open Host Service**: Platform expose REST + outbox events cho mọi app consume.
- **Customer-Supplier**: Notification + Apps là customer của Platform events.

## 3.8. Anti-corruption Layer (ACL)

Khi Platform cần data từ Identity (vd hiển thị `name + email` của user trong membership list), KHÔNG truy thẳng DB Identity. Thay vào đó:

1. Platform expose endpoint `GET /api/membership/{id}/with-user` 
2. BE Platform call `GET https://auth.reborn.vn/users/{user_id}` 
3. Nếu Identity down → return cached data (TTL 1h) hoặc partial response (`user: {id: X, _stale: true}`)
4. Anti-corruption: tự định nghĩa DTO `UserSummary {id, name, email, avatar}` — không bị coupled khi Identity thêm/bớt field

## 3.9. Glossary nội bộ

- **Entitlement**: quyền được phép dùng (theo gói). Khác permission (cấp cụ thể trong tenant).
- **Tenant Owner**: người tạo tenant đầu tiên hoặc được transfer ownership. 1 tenant = 1 owner.
- **Suspended vs Expired**: suspended = manual khóa (vd vi phạm); expired = hết hạn theo time. Khác nhau ở UI/UX.
- **Catalog**: data do Reborn JSC định nghĩa, ít thay đổi (industry, module, resource).
- **Assignment**: data do tenant config (role, permission của user) — thuộc Org.
- **Self-onboard** (Phase 5): luồng đăng ký tự động từ `ecosystem.reborn.vn` không qua Sales — dùng gói Trial / Free.
- **Trial package**: gói dùng thử có thời hạn (vd 14 ngày), hết hạn auto-suspend.
- **Free package**: gói miễn phí vô thời hạn nhưng giới hạn tính năng (max_users, max_storage, package_permission ít).

## 3.9b. Aggregate: App + App Edition (variants theo lĩnh vực)

### Bối cảnh

**Mọi app trong hệ sinh thái Reborn** (CRM hôm nay, BPM, POS, Social, và bất kỳ app nào ra mắt sau này) đều có khả năng phát hành **nhiều edition** (variant) theo lĩnh vực kinh doanh. Đây là design pattern **chung**, không phải đặc thù CRM.

Ví dụ minh hoạ (snapshot 2026-05, sẽ mở rộng theo thời gian):

| App | Edition | URL suffix | Git branch (FE) | Industry mặc định |
|---|---|---|---|---|
| **CRM** | `CRM-SPA` | `/crm-spa` | `reborn-tech` | Spa |
| CRM | `CRM-HEALTHCARE` | `/crm-health` | TBD | Y tế |
| CRM | `CRM-EDUCATION` | `/crm-edu` | `mentorhub` | Giáo dục |
| CRM | `CRM-LOYALTY` | `/crm-loyalty` | `reborn-loyalty` | Bán lẻ chuỗi |
| CRM | `CRM-REALTY` | `/crm-realty` | TBD | Bất động sản |
| CRM | `CRM-GENERIC` | `/crm` | `reborn-tech` | (neutral, default) |
| **BPM** | `BPM-HEALTHCARE` | `/bpm-health` | TBD | Y tế (quy trình khám) |
| BPM | `BPM-FINANCE` | `/bpm-finance` | TBD | Tài chính (approval flow) |
| BPM | `BPM-GENERIC` | `/bpm` | TBD | (neutral, default) |
| **CXM** | `CXM-GENERIC` | `/cxm` | TBD | (neutral) |
| **POS** | `POS-FNB` | `/pos-fnb` | TBD | F&B (table, kitchen) |
| POS | `POS-RETAIL` | `/pos-retail` | TBD | Bán lẻ (barcode) |
| POS | `POS-GENERIC` | `/pos` | TBD | (neutral) |
| **SOCIAL** | `SOCIAL-SPA` | `/social-spa` | TBD | Spa (treatment timeline) |
| **SUPERADMIN** | `SUPERADMIN-GENERIC` | `/superadmin` | `reborn-superadmin` | (Reborn JSC nội bộ) |

→ Khi tenant onboard, chọn edition phù hợp với industry **cho mỗi app** mà tenant subscribe. Ghi nhận trong `tenant_app.app_edition_id`. Khi user truy cập, Platform trả về URL routing chính xác.

**Quan trọng**: pattern này áp dụng đồng nhất cho mọi app — schema `app` + `app_edition` không hardcode CRM. App mới ra mắt sau này (vd `MARKETING`, `WAREHOUSE`, `ACCOUNTING`) chỉ cần INSERT vào bảng `app` + ≥1 row trong `app_edition`, không cần code change ở Platform.

### Aggregate

```
┌─────────────────────────────────────────────────────────┐
│ Aggregate: App                                          │
│ ─────────────────────────────────────────────────────── │
│ ROOT: app                                               │
│   children: app_edition[]                               │
│                                                         │
│ Invariant:                                              │
│   - app.code UNIQUE (vd 'CRM', 'BPM')                   │
│   - 1 app phải có ≥1 edition active                     │
│   - 1 (app, industry) chỉ có 1 edition is_default=1     │
│                                                         │
│ Lifecycle: active → archived                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Entity: AppEdition                                      │
│ ─────────────────────────────────────────────────────── │
│   refs: app_code, industry_id (NULL = neutral)          │
│   field: url_suffix, visibility                         │
│   children: app_edition_allowed_tenant[] (chỉ exclusive)│
│                                                         │
│ Invariant:                                              │
│   - code UNIQUE toàn hệ thống                           │
│   - url_suffix UNIQUE, regex ^/[a-z0-9-]+$              │
│   - is_default_for_industry=1 ⟹ industry_id NOT NULL    │
│   - visibility=public chỉ valid khi industry_id IS NULL │
│     hoặc tenant cùng industry (mở subscribe rộng)       │
│   - visibility=exclusive ⟹ phải có ≥1 row trong         │
│     app_edition_allowed_tenant trước khi cho subscribe  │
│                                                         │
│ Lifecycle: beta → active → deprecated → archived        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Entity: AppEditionAllowedTenant (junction)              │
│ ─────────────────────────────────────────────────────── │
│   composite PK: (app_edition_id, tenant_id)             │
│   field: granted_by, granted_at, notes                  │
│                                                         │
│ Invariant:                                              │
│   - parent edition phải có visibility = 'exclusive'     │
│     (trigger reject nếu khác)                           │
└─────────────────────────────────────────────────────────┘
```

### Visibility — 3 mức truy cập

| visibility | Hiện trong public catalog | Subscribe được khi | Use case |
|---|---|---|---|
| **`public`** (default) | ✅ Có | Tenant cùng industry hoặc edition neutral | CRM-SPA, CRM-REALTY, BPM-GENERIC, … |
| **`private`** | ❌ Không | Bất kỳ tenant — nếu biết edition_code (Sales chia sẻ) | Beta sớm, sales-led deal đặc biệt |
| **`exclusive`** | ❌ Không | Chỉ tenant có row trong `app_edition_allowed_tenant` | Custom dev cho 1 khách VIP |

**Tránh leak**: Endpoint `GET /api/v1/app/{code}/edition` (public) chỉ trả `visibility=public`. Tenant khác không thấy `private`/`exclusive` editions tồn tại trong catalog.

**Bảo vệ runtime**: ngay cả khi guess đúng URL (`https://other-tenant.reborn.vn/x-abc-7f2e1`), FE call Platform `/access-url` để check membership → trả 403 nếu không có subscription.

### Routing pattern (1 quy luật chung)

**Quy ước Reborn — chốt 1 pattern duy nhất** cho mọi tenant không thuộc danh sách reserved:

```
https://{tenant.subdomain}.reborn.vn{edition.url_suffix}/{app-internal-path}
└────── 1 cấp ───────┘ └─ root ─┘ └─── xác định app + edition ──┘
        multi-tenant      domain          (path prefix)
```

**Formula tính ở Platform**:
```
redirect_url = `https://${tenant.subdomain}.${platform.root-domain}${edition.url_suffix}`
```

Ví dụ:
- TNPM (subdomain `tnpm`, industry Bất động sản, app CRM) → `https://tnpm.reborn.vn/crm-realty`
- Reborn JSC (subdomain `rebornjsc`, industry Spa, app CRM) → `https://rebornjsc.reborn.vn/crm-spa`
- Reborn JSC, app SUPERADMIN → `https://rebornjsc.reborn.vn/superadmin`
- Cty X (subdomain `cty-x`, app BPM Generic) → `https://cty-x.reborn.vn/bpm`

### Reserved subdomain (ngoại lệ — nginx route custom)

Một số subdomain dành cho **infrastructure / system service**, không thuộc tenant pool, nginx có rule riêng (KHÔNG đi qua wildcard route + path suffix):

| Subdomain reserved | Phục vụ |
|---|---|
| `auth` | Identity Service (SSO) |
| `platform` | Platform Service API |
| `org` | Org Service |
| `notification` | Notification Service |
| `ecosystem` | Corporate site + self-signup |
| `cdn`, `static` | Static asset CDN |
| `api` | API gateway |
| `admin` | Superadmin gateway alternative |
| `www`, `m`, `mail`, `mx`, `ftp`, `vpn` | Marketing / infrastructure |
| `status`, `docs`, `help` | Public ops/docs |
| `dev`, `staging`, `test`, `preview`, `demo` | Environment-specific |

**Invariant**:
- INV-T5: `tenant.subdomain` NOT IN `reserved_subdomain`. Validate khi POST `/tenant` và POST `/public/signup`.

Danh sách quản trong bảng `reserved_subdomain` (xem `04-DB § 4.5c`). Có thể CRUD qua superadmin (Phase 2+).

### Liên kết với Tenant App

```
tenant_app
├── tenant_id            → tenant
├── app_code             → app.code (denormalized cho query nhanh)
├── app_edition_id       → app_edition.id (NEW)
├── package_id           → package
├── ...
```

### Liên kết với Package

Package vẫn gắn với `app_code` (generic), KHÔNG gắn cứng với 1 edition cụ thể. Lý do:
- Cùng gói "Premium CRM" có thể bán cho mọi edition (Spa/Healthcare/Edu) với cùng giá + entitlement
- Edition khác nhau ở UI/feature flavor, KHÔNG khác về quyền truy cập business resource
- Nếu sau cần price khác per edition → thêm field `package.eligible_app_edition_codes JSON` (whitelist)

### Routing API

```
GET /api/v1/internal/tenant/{tenant_id}/app/{app_code}/access-url
→ {
    "tenant_id": 1,
    "tenant_subdomain": "rebornjsc",
    "app_code": "CRM",
    "edition_code": "CRM-SPA",
    "edition_name": "CRM Thẩm mỹ",
    "redirect_url": "https://rebornjsc.crm-spa.reborn.vn",
    "routing_pattern": "subdomain"
  }
```

Caller (SSO sau login, hoặc App Switcher trong các app khác) gọi endpoint này để biết URL chính xác cần redirect.

### Quy trình chọn edition

**Khi onboard manual (UC-01 — Sales)**:
1. Sales chọn industry → Platform suggest edition default
2. Sales có thể override (vd tenant Spa muốn CRM-GENERIC)
3. Submit → INSERT `tenant_app(app_edition_id = X)`

**Khi self-onboard (UC-11 — Phase 5)**:
1. Form `ecosystem.reborn.vn` chọn industry → auto-pick edition default
2. User KHÔNG override (tránh nhầm; có thể đổi edition sau qua admin)

**Đổi edition sau khi đã active (rare)**:
- Có UI riêng "Migrate to edition X" — đặc biệt vì đổi edition = đổi data structure (vd CRM-SPA có treatment_history table mà CRM-HEALTHCARE không có)
- Cần data migration job per case
- Phase tương lai, không MVP

### Domain event

| Event | Trigger | Payload | Subscriber |
|---|---|---|---|
| `app.created` | INSERT app | `{code, name}` | (info, low priority) |
| `app_edition.activated` | INSERT/status→active | `{edition_code, app_code, frontend_base_url}` | App Switcher cache invalidate |
| `app_edition.deprecated` | status→deprecated | `{edition_code}` | UI hiển thị warning, không cho subscribe mới |
| `tenant_app.edition_changed` | UPDATE app_edition_id | `{tenant_id, app_code, old_edition, new_edition}` | Notification + edition app cleanup data legacy |

## 3.10. Aggregate: Signup Request (Phase 5 — forward compat ở MVP)

**Tóm tắt**: Tách thành aggregate riêng để xử lý luồng self-onboarding. KHÔNG ghép vào `tenant` vì:
- Signup có thể fail (email không verify, abandoned) — không nên tạo `tenant` rỗng
- Anti-abuse logic (rate limit, CAPTCHA, fraud check) tập trung ở 1 nơi
- Khi verified → atomically tạo `tenant` + `tenant_app` + `tenant_membership` (saga)

```
┌─────────────────────────────────────────────────────────┐
│ Aggregate: Signup Request                               │
│ ─────────────────────────────────────────────────────── │
│ ROOT: signup_request                                    │
│   refs: industry_id, package_id (selected)              │
│   refs: tenant_id (sau khi activate)                    │
│                                                         │
│ Invariant:                                              │
│   - email UNIQUE trong rows alive (1 email = 1 signup)  │
│   - chỉ chấp nhận package có is_trial=1 hoặc is_free=1  │
│   - verify_token UNIQUE                                 │
│   - expires_at = created_at + 24h                       │
│                                                         │
│ Lifecycle:                                              │
│   submitted → pending_email_verify → activated          │
│              ↘ expired (24h không verify)               │
│              ↘ rejected (anti-abuse)                    │
└─────────────────────────────────────────────────────────┘
```

### State machine signup_request

```
                       ┌──────────────────┐
                       │    submitted     │ (POST /public/signup)
                       └────────┬─────────┘
                                │ send verify email
                                ▼
                       ┌──────────────────────────┐
                       │ pending_email_verify     │
                       └────────┬─────────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        │ verify token OK       │ 24h timeout             │ admin reject (fraud)
        ▼                       ▼                         ▼
 ┌──────────────┐       ┌──────────────┐         ┌──────────────┐
 │  activated   │       │   expired    │         │   rejected   │
 │ (tenant_id   │       │              │         │              │
 │  được fill)  │       │              │         │              │
 └──────────────┘       └──────────────┘         └──────────────┘
```

### Trường mở rộng cho Package (forward compat ở MVP)

Bảng `package` thêm 3 cột để hỗ trợ trial/free (chi tiết DDL ở `04 § 4.6`):

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `is_trial` | BOOLEAN | TRUE → gói trial dùng thử, hết `trial_days` auto-suspend |
| `is_free` | BOOLEAN | TRUE → gói miễn phí vô thời hạn, max_users + max_storage giới hạn |
| `trial_days` | SMALLINT NULL | Số ngày trial (chỉ có giá trị khi `is_trial=1`, vd 14) |
| `is_self_signup_eligible` | BOOLEAN | TRUE → cho phép xuất hiện trong dropdown self-signup ở `ecosystem.reborn.vn`. Mặc định FALSE — chỉ Trial + Free là TRUE. |

**Invariant bổ sung**:
- INV-P4: `is_trial=1` ⟹ `trial_days IS NOT NULL` AND `trial_days BETWEEN 1 AND 90`
- INV-P5: `is_free=1` ⟹ `base_price = 0` AND `sale_price = 0`
- INV-P6: 1 package KHÔNG đồng thời `is_trial=1` AND `is_free=1`
- INV-P7: `is_self_signup_eligible=1` ⟹ `is_trial=1` HOẶC `is_free=1`

### Domain event mới (Phase 5)

| Event | Trigger | Payload chính | Subscriber |
|---|---|---|---|
| `signup_request.submitted` | INSERT signup_request | `{request_id, email, package_id}` | Notification (gửi verify email) |
| `signup_request.email_verified` | UPDATE status = verifying | `{request_id, tenant_id_pending}` | Internal: trigger saga create tenant |
| `tenant.self_onboarded` | Self-signup tạo tenant thành công | `{tenant_id, signup_request_id, package_id, owner_user_id}` | Notification (welcome email + setup guide), Analytics |
| `signup_request.expired` | Cron sau 24h | `{request_id, email}` | Notification (gửi reminder "đăng ký lại"), Analytics |
| `signup_request.rejected` | Admin manual hoặc fraud detect | `{request_id, reason}` | Notification (email từ chối nếu cần) |
