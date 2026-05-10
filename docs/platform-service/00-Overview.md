# 00 — Tổng quan Platform Service

> Tài liệu phân tích thiết kế hệ thống cho **Reborn Platform Service** — backend mới phục vụ cho console quản trị nền tảng (Reborn Super Admin Console).

## 0.1. Bối cảnh

Hệ sinh thái Reborn hiện có nhiều ứng dụng SaaS multi-tenant (CRM, BPM, social, mobile…) chạy trên cùng hạ tầng. Trong giai đoạn đầu, các bảng "platform-level" (định nghĩa tổ chức, gói dịch vụ, lĩnh vực kinh doanh, phân hệ, tài nguyên phân quyền…) được nhúng chung trong DB của ứng dụng `reborn.vn` — vốn được định vị là **social network ngành Spa**. Hệ quả:

- Bảng `beauty_salon` (= tenant) mang tên ngành-specific, không neutral cho lĩnh vực khác (giáo dục, y tế, bán lẻ…).
- Endpoint `https://reborn.vn/api/beautySalon/*` lẫn lộn data social (post, friend) với data quản trị tenant.
- Không có nơi tập trung để Reborn JSC (công ty nền tảng) vận hành toàn hệ thống: thêm tenant mới, định giá gói, khai báo phân hệ, audit user cross-tenant.
- Khi 1 chức năng cần "ai là tenant nào, gói nào, có quyền gì", phải join cross-DB cross-service phức tạp.

## 0.2. Mục tiêu Platform Service

Tách thành 1 backend service độc lập (`platform.reborn.vn`) trên DB riêng `prod_platformdb`, đóng vai trò **single source of truth** cho 5 nhóm dữ liệu nền tảng:

| Nhóm | Bảng cốt lõi | Ý nghĩa |
|---|---|---|
| **Tenancy** | `tenant`, `tenant_app`, `tenant_membership` | Tổ chức nào, đăng ký app gì, ai thuộc tổ chức nào |
| **Pricing** | `package`, `package_permission` | Gói dịch vụ + ma trận quyền theo gói (entitlement) |
| **Catalog** | `industry`, `area`, `module`, `resource`, `module_resource` | Định nghĩa lĩnh vực kinh doanh, đơn vị hành chính, phân hệ, tài nguyên phân quyền |
| **Storage** | `file_metadata` | Metadata file upload (avatar, logo, banner) |
| **Help** | `help_video`, `help_article` | Nội dung trợ giúp do Reborn JSC publish |

## 0.3. Vai trò trong kiến trúc 5 services

```
┌────────────────────────────────────────────────────────────────────┐
│ ① Identity Service          (auth.reborn.vn) ─ đã có      │
│   Auth thuần: users, credentials, sessions, OAuth/SSO              │
└────────────────────────────────────────────────────────────────────┘
       ▲                    ▲                ▲
       │ user_id            │                │
       │                    │                │
┌──────┴───────────────┐ ┌──┴────────────┐ ┌─┴──────────────────────┐
│ ② Platform Service   │ │ ③ Org Service │ │ ④ Notification Service │
│ platform.reborn.vn   │ │ org.reborn.vn │ │ notification.reborn.vn │
│ ─────────────────── │ │ ───────────── │ │ ─────────────────────  │
│ TÀI LIỆU NÀY        │ │ orgchart, role│ │ push, email, template  │
│ prod_platformdb     │ │ permission    │ │ device_token           │
└──────────────────────┘ └───────────────┘ └────────────────────────┘
       │                    │                │
       ▼                    ▼                ▼
┌────────────────────────────────────────────────────────────────────┐
│ ⑤ Business Apps (CRM, BPM, social, mobile…) ─ biz.reborn.vn        │
│   Tenant business data: customer, contract, invoice, ticket…      │
└────────────────────────────────────────────────────────────────────┘
```

- **Platform** *biết*: tenant nào tồn tại, đang dùng gói nào, gói đó có quyền gì, lĩnh vực kinh doanh là gì. *Không biết*: ai login, password ra sao (Identity), trong tenant ai là sếp ai (Org), khách hàng của tenant là ai (Apps).
- **Identity** *biết*: ai là ai. *Không biết*: user thuộc tenant nào (Platform).
- **Org** *biết*: trong 1 tenant, cấu trúc phòng ban, ai có vai trò gì. *Không biết*: tenant đang dùng gói nào (Platform).
- **Notification** *biết*: gửi push/email cho ai, mailbox cá nhân kết nối qua OAuth. *Không biết*: lý do gửi (do Apps quyết định).
- **Apps** *biết*: nghiệp vụ tenant. *Không biết*: meta-data về tenant (gọi Platform khi cần).

## 0.4. Phân quyền vận hành

| Console | Người dùng | Thao tác cho phép |
|---|---|---|
| **Reborn Super Admin Console** (repo `reborn-platform-frontend` — hiện đang ở nhánh `reborn-superadmin` của `cloud-crm`, sẽ tách ra) | Nhân viên Reborn JSC | CRUD tenant / package / industry / module / resource / package_permission. Audit user cross-tenant. |
| **Tenant Admin Console** (CRM tenant) | Admin của từng tenant | Read-only: gói đang dùng, hạn dùng. CRUD: orgchart, role, permission của tenant mình (qua Org service). |
| **End-user App** | User thường | Read-only: profile, gói (info), notification |

## 0.5. Phạm vi tài liệu

Docset gồm 10 parts (numbered 00–10):

| # | File | Mục đích |
|---|---|---|
| 00 | `00-Overview.md` | Bối cảnh, vision, vai trò trong hệ sinh thái (file này) |
| 01 | `01-Stakeholders.md` | Các bên liên quan + use case chính |
| 02 | `02-Scope.md` | In/out of scope, MVP boundary |
| 03 | `03-Domain-Model.md` | Entity, relationship, ubiquitous language |
| 04 | `04-Database-Schema.md` | DDL chi tiết cho `prod_platformdb` |
| 05 | `05-API-Spec.md` | Hợp đồng REST API (cấp endpoint) |
| 06 | `06-Integration.md` | Tích hợp với Identity / Org / Notification / Apps |
| 07 | `07-Migration-Plan.md` | Chiến lược cutover từ `reborn.vn/api/*` cũ |
| 08 | `08-NFR.md` | Non-functional: security, performance, SLA |
| 09 | `09-Deployment.md` | Hạ tầng, env, CI/CD |
| 10 | `10-ADR.md` | Architecture Decision Record |

## 0.6. Quy ước

- **Tên**: dùng tiếng Việt có dấu trong văn bản, code/identifier dùng tiếng Anh.
- **Định danh**:
  - Tenant: `tenant_id` (BIGINT) — không dùng `salon_id`/`org_id` vì lẫn nghĩa.
  - User: `user_id` (BIGINT) — logical reference sang Identity, không có FK cứng.
  - Membership: `membership_id` (PK) bridging user + tenant.
- **Time**: tất cả `created_at`, `updated_at` là `TIMESTAMPTZ` UTC. App layer convert sang Asia/Ho_Chi_Minh khi hiển thị.
- **Soft delete**: dùng cột `deleted_at TIMESTAMPTZ NULL` — không dùng cờ `is_deleted`.
- **Audit**: mọi bảng có `created_by`, `updated_by` (user_id), trừ `*_event_log`.

## 0.7. Trạng thái hiện tại (2026-05)

- Frontend (sẽ thành repo riêng `reborn-platform-frontend`) hiện đang ở nhánh `reborn-superadmin` của `cloud-crm` — đã bóc tách khỏi `reborn-tech` (commit `8177277c` + sau đó), build OK, smoke test 9/9 PASS.
- Đang dùng workaround tạm: 35 endpoint trỏ về `cloud.reborn.vn/adminapi/*` (commit `185ebf7e`) — sẽ gỡ sau khi Platform Service deploy.
- DB `prod_platformdb` đã được DBA tạo sẵn (rỗng), chờ DDL từ tài liệu này.
- Các bảng nguồn còn ở `reborn.vn` (beauty_salon, package, field, area, orgApp, organization) và `cloud.reborn.vn/adminapi` (module, resource, employee…) — chưa migrate.

## 0.8. Quyết định đã chốt (sẽ chi tiết hoá ở `10-ADR.md`)

1. ✅ Tách Platform thành service riêng (không gom chung với Identity).
2. ✅ Dùng "logical reference" `user_id` thay vì FK cross-DB cứng.
3. ✅ Catalog (định nghĩa) ở Platform; assignment (per-tenant config) ở Org.
4. ✅ Bảng `tenant_membership` trong Platform làm cầu nối user ↔ tenant; enrich profile qua API call sang Identity.
5. ✅ DB engine: Mysql (đồng nhất với các service khác).
6. ✅ Kế thừa BE stack hiện tại của Reborn (Spring Boot — sẽ chốt trong ADR).
