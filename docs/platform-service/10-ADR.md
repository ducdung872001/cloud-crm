# 10 — Architecture Decision Records

> Mỗi ADR ghi 1 quyết định kiến trúc quan trọng + bối cảnh + lựa chọn loại bỏ + hệ quả. Append-only — khi đảo quyết định, viết ADR mới supersede ADR cũ, không sửa lịch sử.

Format theo [Michael Nygard ADR template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

---

## ADR-001 — Tách Platform thành service riêng (không gom vào Identity)

- **Trạng thái**: Accepted (2026-05-10)
- **Người quyết**: CTO + Lead BE Reborn

### Bối cảnh
Bảng platform-level (tenant, package, industry...) hiện nằm rải rác ở `reborn.vn` (vốn là social/spa app) và `cloud.reborn.vn/adminapi`. Cần consolidate. Có 2 lựa chọn:
- A: Gom chung vào DB của Identity Service (1 service)
- B: Tạo Platform Service riêng + DB riêng

### Quyết định
Chọn **B**: tách Platform thành service riêng, DB riêng `prod_platformdb`.

### Lý do
- Identity là hot path (login/refresh) — thường có traffic 10x business CRUD; cần scale độc lập
- Identity có thể swap sang vendor (Keycloak, Auth0) trong tương lai → coupling sẽ phá kế hoạch này
- Platform CRUD low-traffic nhưng business-critical → cần ownership team rõ ràng
- Compliance: PII identity (password hash, MFA, OAuth token) cần isolate khác blast radius với business data

### Hệ quả
- ✅ Mỗi service evolve độc lập
- ✅ Backup/restore riêng từng concern
- ⚠️ Cần "logical reference" `user_id` cross-DB thay vì FK cứng
- ⚠️ Khi cần join (vd hiển thị user name), phải call API enrich → latency cao hơn ~50ms

---

## ADR-002 — Membership pattern thay vì copy user data

- **Trạng thái**: Accepted (2026-05-10)
- **Supersedes**: none

### Bối cảnh
Platform cần biết user X thuộc tenant Y với vai trò gì. 2 cách:
- A: Copy `name + email + avatar` từ Identity vào Platform DB (denormalize)
- B: Chỉ lưu `user_id` trong `tenant_membership`, enrich qua API call khi cần

### Quyết định
Chọn **B** + cache layer (Caffeine local 5 phút + Redis distributed nếu cần)

### Lý do
- Tránh duplicate data → khi user đổi avatar, Identity là source of truth
- Khi user xoá tài khoản, chỉ cần emit event → Platform soft-delete membership
- API enrich có cache nên latency overhead chấp nhận được

### Hệ quả
- ✅ Single source of truth cho user data
- ⚠️ Identity must expose batch endpoint `/users/batch?ids=...` (đã list trong dependency)
- ⚠️ Outbox event `user.deleted` từ Identity là hard requirement

---

## ADR-003 — Catalog vs Assignment separation (Platform vs Org)

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Bảng `permission` cũ chứa lẫn:
- Định nghĩa tài nguyên (resource catalog) — chung mọi tenant
- Gán quyền cho department/user — per-tenant

### Quyết định
- **Catalog** (`module`, `resource`, `module_resource`, `package_permission`) → Platform
- **Assignment** (`tenant_role`, `role_permission`, `permission_department`, `request_permission`) → Org

### Lý do
- Catalog ít thay đổi (vài lần/năm), do Reborn JSC quản
- Assignment thay đổi liên tục, do tenant admin tự quản trong scope tenant
- Nếu gom chung, tenant admin của tenant A có thể vô tình thấy/đổi catalog → security issue

### Hệ quả
- ✅ Ownership rõ ràng
- ⚠️ Org phải gọi Platform để lấy catalog matrix khi render UI → cần cache
- ⚠️ Org enforce check entitlement trước khi cho gán quyền → cần endpoint `GET /internal/tenant/{id}/entitlement`

---

## ADR-004 — Sử dụng MySQL 8 (không PostgreSQL)

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
DB engine cho Platform Service. DBA đã tạo sẵn `prod_platformdb` trên hệ MySQL hiện hữu.

### Quyết định
MySQL 8.0+ (InnoDB).

### Lý do
- Reborn các service khác đã dùng MySQL → đồng nhất ops, backup, monitoring, DBA expertise
- DB `prod_platformdb` đã được DBA tạo sẵn trên MySQL cluster hiện hữu
- MySQL 8 đã hỗ trợ JSON native (binary lưu trữ tối ưu, query indexed qua generated column)
- CHECK constraints (từ MySQL 8.0.16) đủ cho enum-like validation
- InnoDB + GTID + semi-sync replication trưởng thành cho HA
- Chi phí license/support đã được Reborn cover (vs introduce stack mới)

### Loại bỏ
- **PostgreSQL**: vượt trội về JSONB, partial index, pg_trgm, foreign data wrapper. Nhưng require team learn new ops, không có DBA chuyên — risk vận hành cao hơn lợi ích kỹ thuật.
- **MongoDB**: không phù hợp data quan hệ (tenant ↔ subscription ↔ permission có nhiều join).
- **CockroachDB / YugabyteDB**: distributed SQL — overkill cho volume hiện tại.

### Hệ quả
- ✅ DBA team đã quen, không cần training mới
- ✅ Đồng nhất backup/monitoring tooling (mysqldump, Percona Toolkit)
- ⚠️ JPA dialect set `MySQLDialect` (Spring Boot 3 + Hibernate 6 đã hỗ trợ)
- ⚠️ Không có **partial index** → mọi query soft-delete (`WHERE deleted_at IS NULL`) cần composite index có `deleted_at` ở cuối; size index lớn hơn Postgres ~20%
- ⚠️ Không có **CITEXT** → dùng default collation `utf8mb4_0900_ai_ci` (case + accent insensitive) cho VARCHAR cần case-insensitive (vd `tenant.alias`, `email`)
- ⚠️ Full-text search dùng InnoDB `FULLTEXT INDEX` (kém pg_trgm về fuzzy match) — đủ cho MVP; sau scale cân nhắc Elasticsearch external
- ⚠️ Trigger syntax MySQL khác Postgres (`DELIMITER`, `SIGNAL SQLSTATE`) — viết đúng style trong DDL

---

## ADR-005 — Spring Boot 3.2.3 + Java 21 + Maven (match cloud-sales-master)

- **Trạng thái**: Accepted (2026-05-10) — updated theo confirm của Tech Lead
- **Supersedes**: phiên bản trước chốt Java 17 + Gradle

### Bối cảnh
BE framework + runtime + build tool. Cần đồng nhất với các microservice hiện hữu của Reborn (`cloud-sales-master` là tham chiếu chuẩn).

### Quyết định
- **Spring Boot 3.2.3** (lock chính xác phiên bản)
- **Java 21 LTS** (Eclipse Temurin / Amazon Corretto)
- **Maven 3.9+** (KHÔNG Gradle)
- **Group ID**: `vn.reborn.platform` (giữ namespace `vn.reborn` cho service mới của Reborn JSC, KHÁC `vn.lena` của cloud-sales)
- Multi-module project (repo `reborn-platform-backend`): parent `reborn-platform-backend` → modules `platform-entity` (DTO + jOOQ generated) + `platform-service` (main service)

### Lý do
- Cloud-sales-master đã chạy Java 21 + Spring Boot 3.2.3 + Maven trên production → ops team quen, CI/CD pipeline reuse được
- Java 21 LTS support tới 2031 (so với Java 17 tới 2029)
- Java 21 có virtual threads (Project Loom) — phù hợp cho I/O-bound workload (Identity API call, DB query)
- Maven là defacto trong Reborn — sao chép parent pom + tweak là chạy được
- Namespace `vn.reborn` rõ ownership: service mới của công ty Reborn JSC, không nhầm với code legacy `vn.lena`

### Loại bỏ
- Java 17: hết slot LTS sớm hơn, cloud-sales đã upgrade 21
- Gradle: tốc độ build hơn nhưng team không dùng — gây inconsistency
- Quarkus / Node.js / Go: ngôn ngữ/framework khác, KHÔNG đồng nhất stack
- Group ID `vn.lena.platform`: nhầm namespace của legacy

### Hệ quả
- ✅ Hiring + onboarding dễ (Java đã có dev team)
- ✅ CI/CD template reuse từ cloud-sales-master (đỡ setup mới)
- ✅ jOOQ generated code có thể share format với cloud-sales nếu cùng tooling
- ⚠️ Memory footprint cao hơn Quarkus/Go (~512MB baseline)
- ⚠️ Cần JDK 21 trên dev workstation + CI runner (cloud-sales đã có sẵn)

---

## ADR-005b — Data layer: spring-data-jdbc + jOOQ (KHÔNG JPA/Hibernate)

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Lựa chọn ORM/data access layer.

### Quyết định
Dùng `spring-boot-starter-data-jdbc` + **jOOQ 3.18.6** + `spring-jdbc` (đồng bộ cloud-sales-master). KHÔNG JPA/Hibernate.

### Lý do
- Match exactly cloud-sales-master stack — dev cross-service quen ngay
- jOOQ type-safe SQL DSL — tránh string SQL injection, IDE autocomplete cột
- KHÔNG có lazy loading magic (N+1 query risk) — mọi query explicit
- Codegen jOOQ từ DDL Flyway → schema + Java type sync 100%, refactor an toàn
- spring-data-jdbc đơn giản hơn JPA cho aggregate-based domain (Platform là CRUD-heavy, không có inheritance phức tạp)

### Loại bỏ
- **JPA/Hibernate**: phức tạp (cascade, lazy, dirty checking) → debug khó; team Reborn không dùng cho cloud-sales
- **MyBatis**: tương đương jOOQ về spirit nhưng XML config nặng nề
- **Raw JdbcTemplate**: thiếu type safety

### Hệ quả
- ✅ Type-safe queries qua jOOQ DSL
- ✅ Hibernate dialect, lazy proxy không gây bug ngầm
- ⚠️ Phải code rõ ràng từng query (không có magic findByX) — bù lại dễ predict
- ⚠️ Codegen jOOQ tăng build time ~10s
- ⚠️ Migration script (07a) viết native MySQL — không qua HQL/JPQL

---

## ADR-005c — Library version lock theo cloud-sales-master

- **Trạng thái**: Accepted (2026-05-10)

### Quyết định
Lock chính xác version các library chính theo cloud-sales-master `pom.xml`:

| Lib | Version |
|---|---|
| spring-boot-starter-parent | 3.2.3 |
| jOOQ | 3.18.6 |
| HikariCP | 5.1.0 |
| MapStruct | 1.4.2.Final |
| Lombok | 1.18.34 |
| Gson | 2.8.2 |
| mysql-connector-j | 8.0.33 |
| Logback | 1.4.14 |
| spring-jdbc | 5.0.9.RELEASE |
| JUnit Jupiter | 5.5.2 |

### Lý do
- Avoid version drift giữa services
- Khi cloud-sales upgrade, Platform có roadmap follow

### Hệ quả
- ⚠️ Cần monitor cloud-sales upgrade và follow within 1 quarter

---

## ADR-006 — Outbox pattern cho event publishing

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Khi tạo tenant, cần (a) INSERT vào DB, (b) emit event để Notification gửi email. Nếu emit trực tiếp Kafka → có nguy cơ inconsistency (DB commit nhưng event lost, hoặc ngược lại).

### Quyết định
Outbox pattern: ghi event vào bảng `outbox_event` cùng transaction với business mutation. Background worker đọc & publish lên Kafka, mark `published_at`.

### Lý do
- Đảm bảo at-least-once delivery
- Transaction atomic giữa business write + event write
- Không mất event nếu Kafka down — replay từ DB

### Loại bỏ
- Direct Kafka publish: risk inconsistency
- Two-phase commit: phức tạp, không scale

### Hệ quả
- ✅ Reliability cao
- ⚠️ Worker thêm 1 thread + cần monitor lag
- ⚠️ Subscriber phải idempotent (vì at-least-once có thể duplicate)

---

## ADR-007 — Soft delete (`deleted_at`) thay vì hard delete

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Khi user xoá tenant/package, có giữ data không?

### Quyết định
Soft delete: cột `deleted_at TIMESTAMPTZ NULL`. Mọi query phải `WHERE deleted_at IS NULL` (qua Hibernate `@SQLRestriction` hoặc filter).

### Lý do
- Audit trail giữ được
- Rollback nếu xoá nhầm
- Cascade soft-delete dễ hơn hard delete (không cần ON DELETE CASCADE phức tạp)

### Loại bỏ
- Hard delete + audit log riêng: phức tạp restore

### Hệ quả
- ✅ Recoverable
- ⚠️ Index cần partial (`WHERE deleted_at IS NULL`) để giữ size nhỏ
- ⚠️ Disk usage tăng theo thời gian — cần job purge sau 2 năm với policy rõ

---

## ADR-008 — Logical reference cho cross-service FK

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
`tenant_membership.user_id` → user table thuộc Identity DB khác. Có cho FK cứng cross-DB không?

### Quyết định
KHÔNG. Chỉ lưu `user_id BIGINT` + COMMENT documentation. Không ràng buộc cross-DB.

### Lý do
- PostgreSQL không hỗ trợ FK cross-DB (chỉ trong cùng DB)
- Foreign Data Wrapper (FDW) tốn maintenance
- Microservice nên loose coupling — Identity scale/migrate độc lập với Platform

### Hệ quả
- ✅ Loose coupling
- ⚠️ Risk orphan record khi Identity xoá user — mitigated bằng outbox event `user.deleted`
- ⚠️ Validation `user_id` exists chỉ check qua API call → tạm chấp nhận eventual consistency

---

## ADR-009 — REST + JSON, không GraphQL

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
API style.

### Quyết định
REST + JSON, OpenAPI 3 spec.

### Lý do
- Team quen REST hơn
- Tooling (Postman, OpenAPI gen, Spring) trưởng thành
- Cache HTTP-level dễ hơn
- Use case Platform không có over-fetching nghiêm trọng (data shape ổn định)

### Loại bỏ
- GraphQL: power lớn nhưng overhead query optimization, security N+1
- gRPC: tốt cho service-to-service nhưng FE web khó consume trực tiếp

### Hệ quả
- ✅ Learning curve thấp
- ⚠️ Multiple roundtrip cho 1 use case phức tạp — mitigate bằng aggregate endpoint (`/me`, `/tenant/{id}/with-apps`)

---

## ADR-010 — Versioning API qua path prefix `/api/v1/`

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Cách versioning API khi breaking change.

### Quyết định
Path versioning: `/api/v1/`, `/api/v2/`. Không dùng header version.

### Lý do
- Clear cho developer + caller
- Easier debugging (URL hiện rõ trong log)
- Standard practice

### Loại bỏ
- Header `API-Version`: ẩn, dễ quên
- Subdomain `v1.api.platform.reborn.vn`: nặng infra

### Hệ quả
- ✅ Easy migration
- ⚠️ Cần script duplicate code khi bump v2 (hoặc share service layer, chỉ tách controller)

---

## ADR-011 — File storage qua presigned URL (FE upload trực tiếp)

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Upload file (avatar, logo) qua BE hay trực tiếp lên S3?

### Quyết định
FE upload trực tiếp lên S3 qua presigned URL từ Platform.

### Flow:
1. FE call `POST /api/v1/file/presigned-upload` với metadata
2. BE tạo row `file_metadata` (status pending) + sign URL
3. FE PUT file lên S3 trực tiếp
4. FE call `POST /api/v1/file/{id}/confirm` → BE update status

### Lý do
- BE không trở thành bottleneck cho large file
- Cost tiết kiệm bandwidth K8s
- Standard S3 pattern

### Loại bỏ
- Upload qua BE: bottleneck + tốn bandwidth

### Hệ quả
- ✅ Scale tốt
- ⚠️ Cần garbage collection cho file `pending` không confirm sau 1h
- ⚠️ FE phải xử lý fail giữa chừng (resume nếu cần)

---

## ADR-012 — Kafka cho event broker (vs RabbitMQ)

- **Trạng thái**: Tentative — chờ DevOps confirm hạ tầng (2026-05-10)

### Bối cảnh
Event bus cho outbox publish.

### Quyết định (tentative)
Kafka 3.x.

### Lý do
- Throughput cao
- Replay event dễ (dùng partition + offset)
- Reborn có thể đã có Kafka cluster (cần confirm)

### Loại bỏ
- RabbitMQ: phù hợp message queue (work queue), kém replay
- Redis Stream: nhẹ nhưng less mature cho consumer group

### Hệ quả
- Nếu DevOps không có Kafka → fallback RabbitMQ với same outbox pattern

---

## ADR-013 — Service tự verify JWT (không qua API gateway centralized)

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
JWT verification: API gateway centralized hay mỗi service tự làm?

### Quyết định
Mỗi service tự verify qua Spring Security Resource Server + JWKS từ Identity.

### Lý do
- Defense in depth: nếu gateway bị bypass, service vẫn an toàn
- Spring Security có built-in support, không tốn code
- JWKS cache hiệu quả → low overhead (~5ms per request)

### Loại bỏ
- Gateway-only verify: SPOF + nếu bug filter, mọi service exposed

### Hệ quả
- ✅ Security stronger
- ⚠️ Mỗi service phải maintain JWKS client + cache

---

## ADR-014 — Naming "tenant" thay vì "organization"

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
"Organization" là tên dùng phổ biến trong Org service. Trong Platform, "tenant" rõ nghĩa SaaS hơn.

### Quyết định
Platform dùng `tenant`. Org dùng `org_chart` (cấu trúc bên trong tenant).

### Lý do
- Tránh nhầm lẫn 2 service
- "tenant" là từ chuẩn trong SaaS multi-tenancy
- "organization" trong Org có nghĩa orgchart structure (department/position)

### Hệ quả
- ⚠️ Phải cẩn thận khi viết doc/code, không dùng lẫn 2 từ
- ⚠️ FE Reborn Super Admin sidebar đã có "Danh sách tổ chức" — giữ nguyên label tiếng Việt nhưng identifier code dùng `tenant`

---

## ADR-015 — Hệ thống quote giá snapshot tại thời điểm subscribe

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Khi tenant subscribe gói A giá 199K, sau 6 tháng Reborn JSC tăng giá lên 299K. Tenant gia hạn theo giá nào?

### Quyết định
Snapshot giá tại thời điểm subscribe (`tenant_app.base_price_snapshot`). Khi gia hạn cùng gói + cùng chu kỳ → giá snapshot. Khi đổi gói/chu kỳ → giá mới hiện tại.

### Lý do
- Fair với khách: ko bị tăng giá đột ngột giữa chu kỳ
- Predictable cost cho tenant
- Standard SaaS billing practice

### Hệ quả
- ⚠️ DB tăng cột snapshot
- ⚠️ Báo cáo doanh thu phải đọc snapshot, không đọc current price

---

## ADR-016 — Audit log inline trong DB (không tách service)

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Audit log volume lớn (~5M rows/năm). Có nên tách service riêng?

### Quyết định
Lưu trong cùng DB Platform (bảng `entity_event_log`), partition theo tháng sau Phase 2.

### Lý do
- Year 1 volume vẫn nhỏ (~5GB), Postgres handle ngon
- Tách service tăng complexity
- Khi cần thì đẩy sang ELK qua Logstash, vẫn giữ DB primary

### Hệ quả
- ⚠️ Phải partition + purge sau 2 năm

---

## ADR-017 — Industry table có industry_id reference từ tenant + package

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Tenant có 1 industry chính. Package có `industry_id NULLABLE` (NULL = neutral).

### Quyết định
Tenant.industry_id NOT NULL (mỗi tenant phải chọn 1 ngành chính).
Package.industry_id NULLABLE — nếu NULL = áp dụng cho mọi industry.

### Lý do
- Tenant cần phân loại để Sales, marketing target
- Package có thể neutral (vd "Free Trial") hoặc industry-specific (vd "Premium Spa")

### Hệ quả
- ⚠️ Khi tenant đổi industry (rare event), phải check mọi tenant_app có package cùng industry không

---

## ADR-018 — Multi-language: VI default, EN qua Accept-Language

- **Trạng thái**: Accepted (2026-05-10)

### Quyết định
- Server response message VI default
- Header `Accept-Language: en-US` → EN
- Resource messages trong `messages_vi.properties`, `messages_en.properties`

### Lý do
- 95% khách Việt Nam → VI default
- EN cho khả năng mở rộng quốc tế

### Hệ quả
- ⚠️ Mọi message phải qua i18n bundle, không hardcode

---

## ADR-019 — KHÔNG implement billing/payment trong Platform

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Có nên gom billing (invoice, payment, dunning) vào Platform?

### Quyết định
KHÔNG. Tách thành Billing Service riêng (Phase tương lai).

### Lý do
- Billing có domain logic phức tạp riêng (proration, refund, dunning, multi-currency, tax)
- Cần PCI-DSS compliance nếu xử lý card → blast radius nguy hiểm nếu gom
- Có thể bundle Stripe/Momo gateway riêng

### Hệ quả
- ⚠️ Platform expose `tenant_app` data, Billing đọc + tạo invoice riêng
- ⚠️ Phase tương lai mới làm

---

## ADR-022 — App Edition + Routing 2 lớp (1 wildcard pattern + reserved exceptions)

- **Trạng thái**: Accepted (2026-05-10)
- **Updated**: clarify routing pattern duy nhất sau review của user

### Bối cảnh
1 ứng dụng (CRM, BPM, CXM, POS, social, ...) trong hệ Reborn thực tế phát hành nhiều variant theo lĩnh vực kinh doanh:
- CRM-SPA (Spa, branch `reborn-tech`), CRM-EDU (Giáo dục, `mentorhub`), CRM-LOYALTY (chuỗi bán lẻ, `reborn-loyalty`), CRM-REALTY (BĐS), CRM-GENERIC (mọi ngành)
- BPM-HEALTHCARE, BPM-FINANCE, BPM-GENERIC
- POS-FNB, POS-RETAIL, POS-GENERIC
- Tương lai: MARKETING-*, WAREHOUSE-*, ACCOUNTING-*, …

Mỗi variant deploy là 1 FE container riêng. Khi user của tenant truy cập, cần route tới đúng variant tenant đó đăng ký.

### Quyết định
1. Tách 2 bảng catalog: **`app`** (CRM, BPM, POS, ...) + **`app_edition`** (CRM-SPA, CRM-REALTY, BPM-FINANCE, ...) — pattern general, không hardcode CRM.
2. Bổ sung cột `app_edition_id` vào `tenant_app` (FK + trigger validate match `app_code`).
3. **Routing pattern duy nhất** cho mọi tenant (trừ reserved): `https://{tenant.subdomain}.reborn.vn{edition.url_suffix}`. Subdomain CHỈ 1 cấp = tenant. Suffix là path prefix (vd `/crm-spa`, `/crm-realty`, `/bpm`).
4. **Reserved subdomain** (`auth`, `platform`, `org`, `notification`, `ecosystem`, `cdn`, `admin`, `www`, …) đi qua nginx custom route — bảng `reserved_subdomain` quản lý + validate khi tạo tenant.
5. Endpoint `GET /internal/tenant/{id}/app/{code}/access-url` tính sẵn `redirect_url` ở server side. FE chỉ cần follow URL — không biết logic concat.
6. **Default edition per (app, industry)**: dùng generated column `default_key` + UNIQUE → enforce 1-default-per-pair tự động.
7. **Package vẫn gắn với app_code** (KHÔNG edition_code) — gói "Premium CRM" áp cho mọi edition CRM với cùng giá + entitlement.
8. **Migration legacy**: legacy `org_app` không có edition → resolve theo (app_code, tenant.industry_id) → default edition. Fallback GENERIC. Log nếu không match.
9. **Visibility 3-tier** trên `app_edition` (`public` / `private` / `exclusive`) + bảng `app_edition_allowed_tenant` cho whitelist exclusive. Mặc định endpoint catalog public chỉ trả `public` — tenant không thấy private/exclusive editions tồn tại. Bảo vệ runtime qua check membership ở `/access-url` (403 nếu guess URL trái phép).
10. **App + Edition CRUD UI** thuộc MVP của superadmin console (UC-12, UC-13) — vì catalog này là tiền đề cho mọi tenant subscribe.

### Lý do
- **Concept general** áp dụng mọi app, hôm nay và tương lai — schema không cần thay đổi
- **1 routing pattern duy nhất** đơn giản hoá ops: 1 wildcard SSL cert `*.reborn.vn`, 1 nginx ingress với routing rules theo path, 1 DNS wildcard A record
- Subdomain 1 cấp = tenant rõ ràng, không nested confuse
- Path suffix dễ đọc trong URL (`/crm-realty` rõ hơn `crm-realty.reborn.vn`)
- Reserved exceptions xử lý infrastructure cleanly — không lẫn với tenant routes
- Routing tính ở server: nếu sau đổi pattern (vd thêm version path `/v2/`) chỉ update Platform code, không động FE
- Default per industry → UX onboarding mượt
- Tách `app_edition` khỏi `package` giảm complexity matrix permission

### Loại bỏ
- **Multi-level subdomain** (`{tenant}.{edition}.reborn.vn` vd `tnpm.crm-realty.reborn.vn`): rườm rà, cần wildcard cert nhiều cấp, khó manage DNS
- **4 routing pattern (subdomain/path/fixed/tenant_subdomain)** trong field `routing_pattern` enum: over-engineering, thực tế chỉ dùng 1
- **Subdomain riêng per edition** (`crm-spa.reborn.vn`, `crm-realty.reborn.vn`) không có tenant: phải thêm domain mỗi khi launch edition mới + cert mới
- **Ghép `app_code = "CRM-SPA"` thành 1 string** trong tenant_app: thiếu normalization
- **Hardcode routing rule trong FE**: update FE mỗi khi thêm edition
- **Routing client-side dựa trên tenant.industry**: FE duplicate logic Platform
- **Chỉ 2 mức visibility (`public`/`private`)**: gộp `private` + `exclusive` thành 1 → mất khả năng whitelist tenant cụ thể, sales-led deal khó manage. 3 tier rõ vai trò: public (catalog), private (sales backdoor), exclusive (custom build cho tenant đã ký HĐ).

### Hệ quả
- ✅ DevOps đơn giản: 1 wildcard cert + 1 ingress rule + 1 DNS wildcard
- ✅ Schema scalable — app mới chỉ INSERT row + thêm location block nginx, KHÔNG cần DNS/cert mới
- ✅ Onboarding tenant smooth (auto-suggest edition theo industry)
- ✅ App Switcher widget thống nhất qua `/me/access-urls`
- ✅ URL đẹp + dễ nhớ: `tnpm.reborn.vn/crm-realty`
- ⚠️ Trigger validate `app_code = app_edition.app_code` — overhead nhỏ
- ⚠️ Migration legacy phải resolve edition cho ~8,000 row tenant_app — có thể có ~5% cần manual review
- ⚠️ Bảng `reserved_subdomain` cần maintain (~30-50 row, ít thay đổi)
- ⚠️ Đổi edition của tenant đã active là rare + destructive — chỉ SUPER_ADMIN, có schedule + warning + nginx redirect 302 cũ→mới trong 30 ngày để bookmark còn dùng
- ⚠️ FE phải đọc tenant từ subdomain (Host header) — cần nginx forward đúng `Host` (đã include trong sample config)
- ⚠️ Workflow phát hành app mới (UC-12) cần phối hợp BE/FE/DevOps + Super Admin — tài liệu hoá rõ thứ tự (1. dev/deploy, 2. nginx route, 3. khai báo Platform, 4. seed catalog/package)
- ⚠️ Exclusive edition cần audit chặt — mỗi `allow-tenant` ghi `granted_by` + `notes` (số HĐ) bắt buộc

---

## ADR-021 — Self-service signup từ ecosystem.reborn.vn (Phase 5)

- **Trạng thái**: Accepted (2026-05-10) — implement post-MVP
- **Bổ sung sau review của user**

### Bối cảnh
Ngoài luồng Sales onboard manual (UC-01), Reborn muốn cho phép khách tiềm năng tự đăng ký dùng thử / gói miễn phí trực tiếp từ corporate site `ecosystem.reborn.vn`, không cần Sales can thiệp. Mục tiêu: giảm CAC, tăng top-of-funnel, accelerate growth.

### Quyết định
1. **Schema forward-compat ở MVP**: bảng `signup_request` + 4 cột mới trên `package` (`is_trial`, `is_free`, `trial_days`, `is_self_signup_eligible`) đã có sẵn ở Flyway V010 + V002. API public mở ở Phase 5.
2. **Tích hợp ecosystem.reborn.vn**: Option A — JS SDK NPM `@reborn/platform-signup-sdk` (KHÔNG dùng iframe).
3. **Email verification bắt buộc**: 24h expire, 1-shot token, anti-spam.
4. **Hai loại gói self-signup**:
   - `TRIAL_14D_*`: `is_trial=1, trial_days=14`. Hết auto-suspend.
   - `FREE_LIMITED_*`: `is_free=1, max_users=1, max_storage_mb=100`, `package_permission` giới hạn (chỉ VIEW + CREATE basic).
5. **Saga atomicity** cho verify-email: tạo tenant + tenant_app + membership trong 1 DB transaction; gọi Identity create user là remote step có compensation.
6. **Anti-abuse đa lớp** (xem `08 § 8.3.10`): WAF + reCAPTCHA v3 + rate limit IP/email + disposable email block + fraud scoring.

### Lý do
- **Forward-compat ngay ở MVP**: tránh DB schema change lớn ở Phase 5 (tránh downtime cutover thứ 2)
- **JS SDK > iframe**: tracking + UX + a11y tốt hơn; iframe khó style theo brand ecosystem
- **Saga single-DB transaction**: 95% steps trong Platform DB nên dùng local transaction; chỉ Identity là remote
- **Anti-abuse cao** vì free signup là attack surface lớn

### Loại bỏ
- **No email verification**: spam tenant ngập DB, làm giảm chất lượng lead Sales
- **Iframe embed**: kém UX, khó track conversion funnel
- **Phone OTP thay email**: chi phí SMS cao, UX phức tạp với tenant quốc tế (Phase tương lai)
- **Tự động charge card khi hết trial**: ko làm Phase 5 vì chưa có Billing service (xem ADR-019)

### Hệ quả
- ✅ MVP đã có schema sẵn → Phase 5 chỉ cần code API + FE SDK + workflow
- ✅ Trial 14d cho phép khách trải nghiệm full feature → conversion rate cao hơn Free-only
- ✅ Anti-abuse layered → khó bị spam
- ⚠️ Cần Notification service ready trước Phase 5 (gửi verify email + welcome email)
- ⚠️ Cần Identity service expose `POST /users` (create user) endpoint
- ⚠️ Cần ops process: monitor signup_request abuse, manual review queue
- ⚠️ Cần FE team cho `ecosystem.reborn.vn` build form + integrate SDK
- ⚠️ Cần workflow upsell: trước khi trial hết 3 ngày, gửi email + in-app banner

### Metric thành công Phase 5
- Self-signup conversion (visit form → tenant active): ≥30%
- Trial → paid conversion: ≥10% (industry benchmark SaaS)
- Spam ratio: <5% (signup_request rejected hoặc auto-expired)
- Time-to-first-value: <5 phút (signup → user login + import data đầu tiên)

---

## ADR-020 — Soft constraint check phía app layer cho cross-aggregate invariant

- **Trạng thái**: Accepted (2026-05-10)

### Bối cảnh
Invariant như "không cho terminate tenant nếu còn tenant_app active" — check ở DB trigger hay app layer?

### Quyết định
Check ở **service layer** (Spring `@Transactional` method, dùng jOOQ DSL). DB trigger chỉ cho invariant đơn giản (vd `package_permission.action_code` valid).

### Lý do
- App-layer dễ đọc, test, debug
- DB trigger phức tạp → giảm portability nếu sau này đổi DB
- Hiệu năng tương đương

### Hệ quả
- ⚠️ Mọi mutation path phải đi qua service layer (không cho raw SQL từ admin tool)
