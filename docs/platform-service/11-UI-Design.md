# 11 — UI Design (Mockups & Component Specs)

> Mockup ASCII cho các UI cốt lõi do Platform định hướng. Mỗi UI gồm: layout, behavior, API call, edge case. KHÔNG cố định pixel/color — frontend team tự pick design system.

## 11.1. Inventory các UI Frontend trong hệ sinh thái

| FE | Repo | Người dùng | Domain truy cập |
|---|---|---|---|
| **Reborn Super Admin Console** | `reborn-platform-frontend` (nhánh `reborn-superadmin`) | Nhân viên Reborn JSC | `https://{tenant-rebornjsc}.reborn.vn/superadmin` |
| **Tenant Landing Page** | `reborn-platform-frontend` (cùng repo, route khác) | End-user của tenant (sau login, chưa pick app) | `https://{tenant}.reborn.vn/` |
| **App Switcher widget** | NPM lib `@reborn/app-switcher-react` | Embed trong CRM/BPM/POS/... | (component, không URL) |
| **Ecosystem corporate site** | `reborn-ecosystem-frontend` (repo riêng) | Khách tiềm năng + self-signup | `https://ecosystem.reborn.vn` |
| **Tenant Admin Console** (Phase 6+) | `reborn-platform-frontend` (cùng repo, role-based) | Admin của từng tenant | `https://{tenant}.reborn.vn/admin` |
| **CRM-SPA / CRM-REALTY / BPM / ...** | Repo riêng per app | End-user nghiệp vụ | `https://{tenant}.reborn.vn/{url_suffix}` |

→ Tài liệu này tập trung vào 4 UI thuộc Platform service quản: Super Admin Console (App Mgmt), Tenant Landing, App Switcher widget, Tenant Admin (outline).

---

## 11.2. Tenant Landing Page

**URL**: `https://{tenant.subdomain}.reborn.vn/` (root path)

**Trigger**: User truy cập subdomain tenant mà không có path cụ thể (vd vừa nhận welcome email click vào, hoặc gõ tay subdomain).

**nginx route**: trong sample config (`09 § 9.9`), `location /` fallback vào `tenant-landing-fe` upstream.

### Mockup desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Reborn logo]   Công ty BĐS TNPM         🌐 vi  🔔(3)  👤 Phan Đức Dũng ▼│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Chào buổi sáng, Phan Đức Dũng 👋                                       │
│  Bạn thuộc tenant: Công ty BĐS TNPM (gói Trial 14 ngày — còn 9 ngày)    │
│                                                                          │
│  ┌─ Ứng dụng đang dùng ──────────────────────────────────────────────┐  │
│  │                                                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                  │  │
│  │  │  [icon]    │  │  [icon]    │  │  + Thêm    │                  │  │
│  │  │            │  │            │  │            │                  │  │
│  │  │  CRM       │  │  Help      │  │  Khám phá  │                  │  │
│  │  │  Bất động  │  │  Center    │  │  ứng dụng  │                  │  │
│  │  │  sản       │  │            │  │  mới       │                  │  │
│  │  │            │  │            │  │            │                  │  │
│  │  │  Mở →      │  │  Mở →      │  │  Xem →     │                  │  │
│  │  └────────────┘  └────────────┘  └────────────┘                  │  │
│  │                                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ Bắt đầu nhanh (5 bước onboarding) ──────────────────────────────┐  │
│  │  ✓ Đặt mật khẩu                                                  │  │
│  │  ✓ Hoàn thiện thông tin doanh nghiệp                             │  │
│  │  ○ Mời thành viên team                                           │  │
│  │  ○ Import danh sách khách hàng đầu tiên                          │  │
│  │  ○ Khám phá báo cáo dashboard                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ Bạn cũng thuộc tenant khác ─────────────────────────────────────┐  │
│  │  • Reborn JSC (Spa) → rebornjsc.reborn.vn                        │  │
│  │  • Spa Dr.Lena (Spa) → drlena.reborn.vn                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Mockup mobile (<768px)

```
┌────────────────────────────┐
│ ☰  TNPM        🔔  👤      │
├────────────────────────────┤
│                            │
│  Chào, Phan Đức Dũng 👋    │
│  Trial 14d (còn 9 ngày)    │
│                            │
│  ━━━ Ứng dụng ━━━          │
│  ┌──────────────────────┐  │
│  │ [icon] CRM Bất động   │  │
│  │ sản              Mở →│  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ [icon] Help    Mở → │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ + Khám phá ứng dụng  │  │
│  └──────────────────────┘  │
│                            │
│  ━━━ Bắt đầu nhanh ━━━     │
│  ✓ Đặt mật khẩu            │
│  ✓ Hoàn thiện thông tin    │
│  ○ Mời thành viên          │
│  ...                       │
│                            │
└────────────────────────────┘
```

### Behavior

| Sự kiện | Action |
|---|---|
| Page load | `GET /api/v1/me/access-urls` → render list app + chọn tenant context theo subdomain |
| Click card "CRM Bất động sản" | `window.location = redirect_url` (tức `https://tnpm.reborn.vn/crm-realty`) |
| Click "+ Khám phá ứng dụng mới" | Modal hiện list app `visibility=public` mà tenant chưa subscribe + nút "Subscribe" hoặc "Liên hệ Sales" tuỳ gói |
| Click "Mời thành viên team" | Mở modal `POST /api/v1/tenant/{id}/membership` với form invite email |
| Click tenant khác (multi-tenant user) | Navigate sang `https://{other-tenant}.reborn.vn/` |
| Tenant Trial sắp hết hạn (≤3 ngày) | Banner đỏ trên đầu: "Trial hết hạn trong 3 ngày — Nâng cấp ngay" |
| Tenant Free hết quota | Banner cam: "Bạn đã dùng 95/100 KH — nâng cấp để mở rộng" |

### API endpoints used

```
GET /api/v1/me                                 → user profile + memberships
GET /api/v1/me/access-urls                     → list apps redirect_urls
GET /api/v1/tenant/{id}                        → tenant detail (gói, hạn dùng)
GET /api/v1/tenant/{id}/onboarding-checklist   → 5 bước progress (NEW endpoint Phase 5)
POST /api/v1/tenant/{id}/membership            → mời member
GET /api/v1/app/by-industry/{industry_id}      → list app available cho subscribe (filter visibility=public)
```

### Edge cases

- **User chưa thuộc tenant nào**: redirect về `https://ecosystem.reborn.vn` để self-signup
- **Tenant terminated**: hiển thị "Tổ chức này đã ngừng hoạt động — liên hệ support"
- **Tenant suspended**: hiển thị "Tài khoản tạm khoá — lý do: {reason} — liên hệ Reborn"
- **Subdomain không khớp tenant nào**: nginx 404 (KHÔNG fallback vào landing)

---

## 11.3. App Management — Super Admin Console (UC-12)

**URL**: `https://{tenant-rebornjsc}.reborn.vn/superadmin/app_management`

**Sidebar menu** (cập nhật từ thiết kế cũ):

```
🏠 Trang chủ
🏢 Danh sách tổ chức
👥 Quản trị người dùng
📦 Quản lý ứng dụng        ← MỚI
🎁 Quản lý gói dịch vụ
📅 Danh sách gia hạn
⚙️ Cấu hình hệ thống
   ├ Lĩnh vực
   └ Tài nguyên
👤 Cài đặt cá nhân
```

### 11.3.1. Trang App List

```
┌──────────────────────────────────────────────────────────────────────────┐
│ QUẢN LÝ ỨNG DỤNG                                          [+ Thêm App]   │
├──────────────────────────────────────────────────────────────────────────┤
│ [🔍 Tìm theo tên / code]  [Status: Tất cả ▼]  [Sắp xếp: Thứ tự ▼]      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌─ CRM ──────────────────────────────────────────────────────────────┐ │
│ │ [icon]  Quản lý khách hàng (CRM)                  [✏️] [archive]  │ │
│ │         5 editions: SPA, EDU, LOYALTY, REALTY, GENERIC             │ │
│ │         48 tenant đang dùng • Status: active • Order: 1            │ │
│ │         [Xem editions →]                                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ ┌─ BPM ──────────────────────────────────────────────────────────────┐ │
│ │ [icon]  Quản lý quy trình (BPM)                   [✏️] [archive]  │ │
│ │         1 edition: GENERIC                                          │ │
│ │         12 tenant đang dùng • Status: active • Order: 2            │ │
│ │         [Xem editions →]                                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ ┌─ CXM ──────────────────────────────────────────────────────────────┐ │
│ │ [icon]  CXM (mới)                                  [✏️] [archive]  │ │
│ │         1 edition: GENERIC                                          │ │
│ │         0 tenant • Status: active • Order: 3 • [BETA]              │ │
│ │         [Xem editions →]                                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ ┌─ POS ──────────────────────────────────────────────────────────────┐ │
│ │ [icon]  Bán hàng (POS)                            [✏️] [archive]  │ │
│ │         3 editions: FNB, RETAIL, GENERIC                           │ │
│ │         5 tenant • Status: active                                   │ │
│ │         [Xem editions →]                                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 11.3.2. Modal "Thêm App / Sửa App"

```
┌──────────────────────────────────────────────────────────────┐
│ Thêm ứng dụng mới                                       [X]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Code (mã định danh) *                                       │
│  [MARKETING                          ]                       │
│  Lưu ý: viết HOA, A-Z và _, không đổi sau khi tạo            │
│                                                              │
│  Tên hiển thị *                                              │
│  [Marketing Automation               ]                       │
│                                                              │
│  Mô tả                                                        │
│  [Quản lý chiến dịch marketing đa kênh ...           ]      │
│                                                              │
│  Icon (URL hoặc upload)        Màu                            │
│  [marketing.svg          ]    [#3B82F6 ⬛]                    │
│                                                              │
│  Thứ tự hiển thị                                              │
│  [6]                                                          │
│                                                              │
│                                          [Huỷ]  [Lưu]        │
└──────────────────────────────────────────────────────────────┘
```

API: `POST /api/v1/app` hoặc `PUT /api/v1/app/{code}` (edit). Validate `code` UNIQUE + format.

### 11.3.3. Trang App Edition List (drill-in từ App)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ◀ Quản lý ứng dụng / CRM                                                 │
│ CÁC PHIÊN BẢN CỦA CRM                              [+ Thêm Edition]      │
├──────────────────────────────────────────────────────────────────────────┤
│ [Status ▼]  [Visibility ▼]  [Industry ▼]                                │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ CRM-SPA            🌐 public  ⭐ default-SPA                          │ │
│ │ CRM Thẩm mỹ                                                           │ │
│ │ Industry: Spa & Thẩm mỹ • Suffix: /crm-spa                            │ │
│ │ Git: reborn-tech (https://github.com/reborn/cloud-crm)                │ │
│ │ Status: active • 12 tenant đang dùng                                  │ │
│ │ [✏️ Sửa]  [🚫 Deprecate]                                              │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ CRM-REALTY         🌐 public  ⭐ default-REAL_ESTATE  [BETA]          │ │
│ │ CRM Bất động sản                                                      │ │
│ │ Industry: Bất động sản • Suffix: /crm-realty                          │ │
│ │ Git: reborn-realty                                                     │ │
│ │ Status: beta • 1 tenant (TNPM)                                        │ │
│ │ [✏️ Sửa]  [✅ Promote → active]                                       │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ CRM-EDU            🌐 public  ⭐ default-EDUCATION                    │ │
│ │ CRM Giáo dục                                                          │ │
│ │ Industry: Giáo dục • Suffix: /crm-edu                                 │ │
│ │ Git: mentorhub                                                        │ │
│ │ Status: active • 8 tenant                                             │ │
│ │ [✏️ Sửa]                                                               │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ CRM-ABC-VIP        🔒 exclusive                                       │ │
│ │ CRM ABC (custom)                                                      │ │
│ │ Industry: (không gắn) • Suffix: /x-abc-7f2e1                          │ │
│ │ Status: active • 1 tenant whitelist (ABC) • [👁 Xem whitelist]       │ │
│ │ [✏️ Sửa]                                                               │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

Badge:
- 🌐 **public** (mặc định, không cần highlight)
- 🔓 **private** (sales backdoor)
- 🔒 **exclusive** (whitelist)
- ⭐ **default-{INDUSTRY}** (1 default per industry)
- **[BETA]** badge khi `status=beta`
- **[DEPRECATED]** badge khi `status=deprecated`

### 11.3.4. Modal "Thêm Edition / Sửa Edition"

```
┌──────────────────────────────────────────────────────────────┐
│ Thêm phiên bản mới cho CRM                              [X]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ━━ Thông tin cơ bản ━━                                      │
│                                                              │
│  Code phiên bản *                                            │
│  [CRM-FNB                            ]                       │
│  Quy ước: {APP}-{HẬU TỐ}, viết HOA, không đổi sau tạo       │
│                                                              │
│  Tên hiển thị *                                              │
│  [CRM Nhà hàng & Ăn uống             ]                       │
│                                                              │
│  Lĩnh vực (industry)                                         │
│  [Nhà hàng & Ăn uống       ▼]   ☑ Mặc định cho ngành này   │
│  Để trống = neutral (dùng cho mọi ngành)                     │
│                                                              │
│  ━━ Routing ━━                                                │
│                                                              │
│  URL suffix *                                                │
│  [/crm-fnb                           ]                       │
│  Tenant truy cập: https://{subdomain}.reborn.vn/crm-fnb      │
│  Phải UNIQUE toàn hệ thống                                    │
│                                                              │
│  Visibility *                                                │
│  ⦿ Public — hiện trong catalog, ai cùng ngành cũng dùng     │
│  ◯ Private — ẩn, sales chia sẻ code khi cần                 │
│  ◯ Exclusive — chỉ tenant trong whitelist                   │
│                                                              │
│  ━━ Source code ━━                                            │
│                                                              │
│  Git repo URL                                                │
│  [https://github.com/reborn/cloud-crm   ]                    │
│  Git branch                                                  │
│  [crm-fnb                                ]                   │
│                                                              │
│  ━━ Lifecycle ━━                                              │
│                                                              │
│  Status                                                      │
│  ⦿ Beta — sẵn sàng test                                     │
│  ◯ Active — đã production-ready                             │
│  ◯ Deprecated — không cho subscribe mới                     │
│                                                              │
│  Thứ tự hiển thị: [10]                                       │
│                                                              │
│                                          [Huỷ]  [Lưu]        │
└──────────────────────────────────────────────────────────────┘
```

API: `POST /api/v1/app_edition` hoặc `PUT /api/v1/app_edition/{id}`. Validate URL suffix regex + UNIQUE.

### 11.3.5. Trang Whitelist (drill-in từ Edition exclusive)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ◀ Quản lý ứng dụng / CRM / CRM-ABC-VIP                                   │
│ WHITELIST TENANT                                  [+ Thêm tenant]        │
├──────────────────────────────────────────────────────────────────────────┤
│ Edition: CRM-ABC-VIP (CRM ABC custom)                                    │
│ URL suffix: /x-abc-7f2e1 • Visibility: 🔒 exclusive                       │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ STT │ Tenant         │ Cấp bởi      │ Ngày cấp      │ Ghi chú       │ │
│ ├─────┼────────────────┼──────────────┼───────────────┼───────────────┤ │
│ │  1  │ Công ty ABC    │ Phan Đức Dũng │ 10/05/2026   │ HĐ #2026-001  │ │
│ │     │ alias: abc     │              │              │ [✏️] [🗑 Revoke]│ │
│ ├─────┴────────────────┴──────────────┴───────────────┴───────────────┤ │
│ │                                                                      │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

Modal "Thêm tenant":

```
┌──────────────────────────────────────────────────────────────┐
│ Whitelist tenant cho CRM-ABC-VIP                        [X]  │
├──────────────────────────────────────────────────────────────┤
│  Tenant *                                                    │
│  [🔍 Tìm theo alias / tên...                            ▼]  │
│  → Search async API GET /api/v1/tenant?q={query}            │
│                                                              │
│  Ghi chú (bắt buộc) *                                        │
│  [Custom build per HĐ #2026-001 ngày 10/05/2026          ]  │
│  → Audit yêu cầu nêu lý do (số HĐ, dự án, …)                │
│                                                              │
│                                          [Huỷ]  [Cấp quyền] │
└──────────────────────────────────────────────────────────────┘
```

API: `POST /api/v1/app_edition/{id}/allow-tenant`.

---

## 11.4. App Switcher Widget (shared component)

NPM lib `@reborn/app-switcher-react` — embed trong CRM/BPM/POS/CXM/SUPERADMIN FE để user nhảy giữa app + tenant.

### Mockup (vị trí: header top-right của mỗi app)

```
                                        ┌─────────────────────┐
                                        │ 🏢 Reborn JSC ▼     │
                                        │ ⚏  Apps     ▼      │
                                        │ 👤 Phan Đức Dũng    │
                                        └──────────┬──────────┘
                                                   │ click "Apps"
                                                   ▼
                                        ┌─────────────────────────────┐
                                        │ Tenant: Reborn JSC           │
                                        ├─────────────────────────────┤
                                        │ Ứng dụng:                    │
                                        │  ● CRM (CRM-SPA)  [đang ở]  │
                                        │    /crm-spa                  │
                                        │  ○ BPM (BPM-GENERIC)         │
                                        │    /bpm                      │
                                        │  ○ Superadmin                │
                                        │    /superadmin               │
                                        ├─────────────────────────────┤
                                        │ Tenant khác:                 │
                                        │  ▶ Spa Dr.Lena               │
                                        │    drlena.reborn.vn          │
                                        │  ▶ Cty BĐS TNPM              │
                                        │    tnpm.reborn.vn            │
                                        ├─────────────────────────────┤
                                        │ + Khám phá app mới           │
                                        └─────────────────────────────┘
```

### Component API

```tsx
import { AppSwitcher } from '@reborn/app-switcher-react';

<AppSwitcher
  platformBaseUrl="https://platform.reborn.vn"
  currentApp="CRM"
  currentTenantId={1}
  onAppChange={(app) => window.location = app.redirect_url}
  onTenantChange={(tenant) => window.location = `https://${tenant.subdomain}.reborn.vn`}
/>
```

Widget tự gọi `GET /api/v1/me/access-urls` (cache 5 phút), render dropdown.

### Behavior

| Action | Result |
|---|---|
| Click app trong cùng tenant | `window.location = redirect_url` (vd `/bpm`) |
| Click tenant khác | Navigate sang subdomain khác → tenant-landing-fe → user pick app |
| Click "Khám phá app mới" | Modal hiển thị list app `visibility=public` chưa subscribe |

---

## 11.5. Tenant Admin Console (Phase 6+ — outline)

Tenant admin (KHÁC superadmin Reborn JSC) cần UI riêng để self-service:

**URL**: `https://{tenant}.reborn.vn/admin`

**Required role**: `tenant_membership.role IN ('OWNER', 'ADMIN')`

**Sidebar menu**:

```
🏠 Tổng quan tenant
👥 Thành viên (mời, gán role)
📦 Ứng dụng đã đăng ký + nâng gói
🎁 Lịch sử thanh toán + hoá đơn
⚙️ Cài đặt tổ chức (logo, địa chỉ, lĩnh vực)
🔑 Phân quyền (nhân viên × tài nguyên)  ← gọi Org service
👤 Cài đặt cá nhân
```

→ **Phase 6+** triển khai sau MVP. Giai đoạn MVP, tenant admin gọi Sales/Support khi cần thay đổi.

---

## 11.6. Mapping UI ↔ API ↔ Aggregate

| UI screen | API endpoints | Aggregate (DDD) |
|---|---|---|
| Tenant Landing | `/me/access-urls`, `/tenant/{id}`, `/tenant/{id}/onboarding-checklist` | Tenant + TenantApp |
| App List (superadmin) | `/app` CRUD | App |
| App Edition List | `/app/{code}/edition?show=all` | AppEdition |
| Edition modal | `/app_edition` CRUD | AppEdition |
| Whitelist | `/app_edition/{id}/allow-tenant` CRUD | AppEditionAllowedTenant |
| App Switcher widget | `/me/access-urls` (cached) | TenantMembership + TenantApp |
| Tenant Admin Console | (mostly Org service endpoints) | (out of scope Platform) |

---

## 11.7. Component shared cần build (NPM packages)

| Package | Mục đích | Consumer |
|---|---|---|
| `@reborn/app-switcher-react` | Widget switch app + tenant | Tất cả FE app |
| `@reborn/platform-api-client` | TypeScript client cho Platform REST API | Tất cả FE app |
| `@reborn/platform-signup-sdk` | SDK self-signup form (Phase 5) | `ecosystem-frontend` |
| `@reborn/auth-react` | SSO login + JWT helper | Tất cả FE app |

→ Chi tiết spec từng package sẽ viết ở repo lib riêng — KHÔNG thuộc SAD này.

---

## 11.8. Wireframe → Implementation roadmap

| Phase | UI deliverable | Status |
|---|---|---|
| MVP Sprint 1 | Sidebar superadmin updated + App List + App modal | ⬜ |
| MVP Sprint 2 | App Edition List + Edition modal | ⬜ |
| MVP Sprint 3 | Whitelist tenant UI cho exclusive edition | ⬜ |
| MVP Sprint 4 | Tenant Landing Page (basic) | ⬜ |
| MVP Sprint 5 | App Switcher widget (NPM lib v0.1) | ⬜ |
| Phase 5 | Self-signup form ở `ecosystem.reborn.vn` | ⬜ |
| Phase 6 | Tenant Admin Console | ⬜ |

→ Mỗi sprint ~1 tuần (1 dev FE). Tổng MVP UI: ~5 tuần.
