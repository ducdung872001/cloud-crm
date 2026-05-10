# Reborn Platform Service — Phân tích Thiết kế Hệ thống

> Tập tài liệu phân tích thiết kế (SAD) cho **Reborn Platform Service** — backend mới phục vụ console quản trị nền tảng (Reborn Super Admin Console). Service này là **single source of truth** về tổ chức (tenant), gói dịch vụ, lĩnh vực kinh doanh, phân hệ, tài nguyên phân quyền và file metadata.

## Quick links

| # | Tài liệu | Mục đích | Đối tượng đọc |
|---|---|---|---|
| 00 | [Tổng quan](./00-Overview.md) | Bối cảnh, vision, vai trò trong hệ sinh thái 5 services | Tất cả |
| 01 | [Stakeholders](./01-Stakeholders.md) | Các bên liên quan + use case chính + acceptance criteria | PM, BA, Lead |
| 02 | [Scope](./02-Scope.md) | In/out of scope, MVP boundary, constraints, assumptions | PM, Tech Lead |
| 03 | [Domain Model](./03-Domain-Model.md) | Entity, aggregate, ubiquitous language, state machine, invariants | Dev (BE+FE) |
| 04 | [Database Schema](./04-Database-Schema.md) | DDL chi tiết MySQL 8 cho `prod_platformdb` | DBA, BE Dev |
| 05 | [API Spec](./05-API-Spec.md) | Hợp đồng REST API, error code, pagination, idempotency | BE+FE Dev, Integration |
| 06 | [Integration](./06-Integration.md) | Tích hợp với Identity / Org / Notification / Apps + outbox event | BE Dev, Architect |
| 07 | [Migration Plan](./07-Migration-Plan.md) | Cutover từ `reborn.vn/api/*` cũ — phase, risk, rollback | DBA, DevOps, BE Lead |
| 07a | [Legacy Mapping & ETL Scripts](./07a-Legacy-Mapping.md) | Naming convention, per-column mapping, SQL ETL scripts idempotent, validation suite | DBA, BE Dev, Migration owner |
| 08 | [NFR](./08-NFR.md) | Security, performance, SLA, scalability, compliance | Architect, Security, SRE |
| 09 | [Deployment](./09-Deployment.md) | Tech stack, infra, CI/CD, env, observability | DevOps, SRE |
| 10 | [ADR](./10-ADR.md) | Architecture Decision Record — 20 quyết định chốt | Tất cả (đặc biệt khi onboard) |

## Đọc theo vai trò

### Dev BE (chuẩn bị implement)
1. `00-Overview` (15 phút) — hiểu vai trò
2. `03-Domain-Model` (45 phút) — entity, aggregate, invariant
3. `04-Database-Schema` (1 giờ) — DDL ready apply
4. `05-API-Spec` (45 phút) — endpoint contract
5. `06-Integration` (30 phút) — call Identity/Org

### DBA / DevOps
1. `00-Overview` (15 phút)
2. `04-Database-Schema` § 4.1, 4.18 (capacity)
3. `09-Deployment` (1 giờ) — infra, CI/CD, observability
4. `07-Migration-Plan` (1 giờ) — cutover phase + ETL
5. `07a-Legacy-Mapping` (2 giờ) — chi tiết SQL scripts trước khi run migration

### PM / BA
1. `00-Overview`
2. `01-Stakeholders` (use case)
3. `02-Scope` (boundary)

### Architect / Tech Lead
- Đọc toàn bộ, đặc biệt `10-ADR` để hiểu rationale các quyết định.

## Trạng thái doc

- **Version**: 1.0 (draft chờ duyệt)
- **Last update**: 2026-05-10
- **Tác giả**: Reborn JSC
- **Trạng thái**: 📝 Draft — đợi review của CTO + Lead BE + DBA
- **Sau khi duyệt**: chuyển trạng thái Accepted → bắt đầu implementation theo phase ở `07-Migration-Plan`

## Tóm tắt tổng

### Vấn đề cần giải quyết
Bảng platform-level (tenant, package, industry, area, module, resource) hiện rải rác ở `reborn.vn/api/*` (vốn là social/spa) và `cloud.reborn.vn/adminapi/*`. Lẫn lộn data, không neutral về ngành, không có nơi tập trung để Reborn JSC vận hành.

### Giải pháp
Tách thành 1 service mới `platform.reborn.vn` trên DB riêng `prod_platformdb` (MySQL 8). 5 bounded context: Tenancy, Pricing, Catalog, Storage, Help.

### Kiến trúc 5 services
```
① Identity (auth)
② Platform ← TÀI LIỆU NÀY
③ Org (orgchart, role per-tenant)
④ Notification (push, email)
⑤ Business Apps (CRM, BPM, social)
```

### MVP (3-4 tháng)
- Tenant CRUD + tenant_app + tenant_membership
- Package CRUD + package_permission matrix
- Industry CRUD
- Module + Resource + module_resource CRUD
- File upload (avatar, logo)
- Outbox event publishing

### Migration timeline
~10 tháng từ Phase 0 prep tới Phase 5 decommission legacy. Chi tiết ở `07-Migration-Plan`.

## Repos & resources

| Repo | Mục đích | Trạng thái |
|---|---|---|
| **`reborn-platform-frontend`** | Reborn Super Admin Console (React/Vite). Hiện đang ở nhánh `reborn-superadmin` của repo `cloud-crm` — sẽ tách ra repo git riêng. | Code đã ready, đang dùng workaround `prefixAdminLegacy`; chờ BE deploy để đổi `prefixRebornVn` → `prefixPlatform` |
| **`reborn-platform-backend`** | Service Platform (Spring Boot 3.2.3 + Java 21 + Maven + MySQL 8 + spring-data-jdbc + jOOQ 3.18.6 — match stack `cloud-sales-master`). Group ID `vn.reborn.platform`. Multi-module: parent `reborn-platform-backend` → `platform-service` (main) + `platform-entity` (DTO + jOOQ gen). | Sẽ tạo mới sau khi duyệt SAD |
| **DB** | `prod_platformdb` (MySQL 8) | DBA đã tạo sẵn, rỗng — chờ Flyway V001-V016 |

## Conventions xuyên suốt

- Tiếng Việt **có dấu** trong văn bản, code/identifier tiếng Anh
- Tên: `tenant` (KHÔNG `organization` để tránh nhầm với Org service)
- Định danh: `tenant_id`, `user_id` (logical ref to Identity)
- Time: `DATETIME(6)` UTC, FE convert Asia/Ho_Chi_Minh
- Soft delete: `deleted_at DATETIME(6) NULL`
- Audit: mọi mutation ghi `entity_event_log`

## Câu hỏi thường gặp

**Q: Vì sao tách Platform khỏi Identity?**
A: Identity là hot path (login/refresh ~10x traffic CRUD), cần scale độc lập + có thể swap vendor sau. Xem ADR-001.

**Q: Vì sao dùng MySQL chứ không PostgreSQL?**
A: Đồng nhất với hệ stack hiện hữu của Reborn (DBA team đã quen, monitoring/backup đã set up). Xem ADR-004.

**Q: Stack BE giống hệt cloud-sales-master không?**
A: Có. Java 21 + Spring Boot 3.2.3 + Maven + spring-data-jdbc + jOOQ 3.18.6 + HikariCP + MapStruct + Lombok + Gson + spring-kafka + Logback. Group ID khác: `vn.reborn.platform` (KHÔNG `vn.lena`). Xem ADR-005, 005b, 005c.

**Q: Tên bảng & cột trong DB chuẩn không, có rule không?**
A: Có — quy hoạch chính thức ở `07a § 7a.1` (snake_case singular, no domain prefix, reserved fields). Mọi rename trong migration tuân thủ.

**Q: Migration data từ legacy đảm bảo không mất gì không?**
A: Có. `07a` chi tiết: per-column mapping, lookup tables, validation suite (count + checksum + per-row diff), reconciliation cron, rollback playbook 3 mức. Quá trình dual-write 2-4 tuần để catch drift trước khi cutover.

**Q: User data nằm ở đâu?**
A: Identity. Platform chỉ lưu `user_id` logical reference + bảng `tenant_membership` làm cầu nối. Khi cần hiển thị user info, gọi API enrich. Xem ADR-002 + § 6.2.2.

**Q: Phân quyền user/role nằm ở đâu?**
A: Org service. Platform chỉ định nghĩa **catalog** (resource, action) và **entitlement matrix** (gói có quyền gì). Org sẽ check matrix khi gán quyền cụ thể trong tenant. Xem ADR-003.

**Q: Khi nào BE sẽ deploy?**
A: Sau khi CTO duyệt docset này → chốt timeline → start sprint 1.

**Q: FE superadmin có thay đổi gì sau khi BE deploy?**
A: Chỉ đổi `prefixRebornVn` → `prefixPlatform` trong [`urls.ts`](../../src/configs/urls.ts) (1 commit nhỏ). Workaround `prefixAdminLegacy` cũng sẽ được gỡ. Xem § 7 Phase 3.

## Liên hệ

- Tech Lead BE: TBD
- DBA: TBD
- Reviewer: CTO Reborn JSC

---

*Tài liệu này append-only về phần ADR. Các phần khác có thể edit trước khi Accepted; sau khi Accepted thì cần "amended record" — không sửa lịch sử.*
