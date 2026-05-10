# 04 — Database Schema (`prod_platformdb`)

> DDL chi tiết cho **MySQL 8.0+**. Theo convention **snake_case** cho tên bảng + cột, **singular** cho table name (vd `tenant`, không `tenants`). Mọi bảng có `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`.

## 4.1. Cấu hình DB

```sql
-- DBA đã tạo: prod_platformdb
-- Charset: utf8mb4, collation: utf8mb4_0900_ai_ci (case-insensitive, accent-insensitive)
-- Storage engine: InnoDB (mặc định MySQL 8)
-- SQL mode: STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO
-- Time zone: UTC (server set @@global.time_zone = '+00:00')

-- Sample DB-level setting (DBA chạy 1 lần):
ALTER DATABASE prod_platformdb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

-- Verify
SHOW VARIABLES LIKE 'character_set_database';
SHOW VARIABLES LIKE 'collation_database';
```

## 4.2. Convention chung

| Loại | Quy ước MySQL |
|---|---|
| Primary key | `BIGINT UNSIGNED AUTO_INCREMENT`. Ngoại lệ: `file_metadata.id` dùng `CHAR(36)` UUID. |
| Foreign key local | `BIGINT UNSIGNED` + `FOREIGN KEY` ràng buộc cứng |
| Foreign key cross-service | `BIGINT UNSIGNED` (vd `user_id`) + `COMMENT 'logical ref to Identity'` — KHÔNG có constraint |
| Timestamp | `DATETIME(6)` lưu UTC (precision tới microsecond). Không dùng `TIMESTAMP` (giới hạn 2038). |
| String ngắn | `VARCHAR(n)` với n cụ thể (32/64/128/255) |
| String dài | `TEXT` (đến 64KB) hoặc `MEDIUMTEXT` |
| Email/alias case-insensitive | `VARCHAR(...) COLLATE utf8mb4_0900_ai_ci` (mặc định DB) |
| JSON | `JSON` (MySQL 8 native, lưu binary tối ưu) |
| Boolean | `TINYINT(1) NOT NULL DEFAULT 0` (alias `BOOLEAN`) |
| Số tiền | `DECIMAL(15,2)` |
| Soft delete | `deleted_at DATETIME(6) NULL` (NULL = chưa xoá) |
| Audit | `created_by BIGINT UNSIGNED`, `updated_by BIGINT UNSIGNED` (logical ref to user) |
| Enum | `VARCHAR(16)` + `CHECK (... IN (...))` — KHÔNG dùng `ENUM` native (khó alter) |

**Lưu ý MySQL 8 vs PostgreSQL**:
- **Partial index** không hỗ trợ → mọi query `WHERE deleted_at IS NULL` phải có index đầy đủ trên các cột filter, app layer chịu thêm chi phí
- **Generated columns** thay thế cho 1 số expression index
- Mọi query phải có `WHERE deleted_at IS NULL` (jOOQ — repository method baseline đã include)
- Full-text search: dùng `FULLTEXT INDEX` của InnoDB hoặc external (Elasticsearch sau này)

## 4.3. Bảng `industry` — Lĩnh vực kinh doanh

```sql
CREATE TABLE industry (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code            VARCHAR(32)     NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    name_en         VARCHAR(255)    NULL,
    description     TEXT            NULL,
    icon            VARCHAR(64)     NULL,
    ordinal         INT             NOT NULL DEFAULT 0,
    status          VARCHAR(16)     NOT NULL DEFAULT 'active',
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    updated_by      BIGINT UNSIGNED NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_industry_code (code),
    KEY idx_industry_status_ordinal (status, ordinal, deleted_at),
    CONSTRAINT chk_industry_status CHECK (status IN ('active','archived'))
) ENGINE=InnoDB COMMENT='Lĩnh vực kinh doanh (Spa, Y tế, Giáo dục…). Catalog do Reborn JSC quản.';
```

## 4.4. Bảng `area` — Đơn vị hành chính (tree)

```sql
CREATE TABLE area (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code            VARCHAR(16)     NOT NULL,
    name            VARCHAR(128)    NOT NULL,
    parent_area_id  BIGINT UNSIGNED NULL,
    level           TINYINT UNSIGNED NOT NULL,
    -- 1 = tỉnh/thành phố trực thuộc TW
    -- 2 = quận/huyện/thị xã
    -- 3 = phường/xã/thị trấn
    -- 4 = (dự phòng — thôn/xóm nếu cần)
    name_unsigned   VARCHAR(128)    NOT NULL,
    -- tên không dấu để search ILIKE nhanh
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_area_code (code),
    KEY idx_area_parent (parent_area_id, deleted_at),
    KEY idx_area_level  (level, deleted_at),
    FULLTEXT KEY ft_area_name (name, name_unsigned),
    CONSTRAINT fk_area_parent FOREIGN KEY (parent_area_id) REFERENCES area(id) ON DELETE RESTRICT,
    CONSTRAINT chk_area_level CHECK (level BETWEEN 1 AND 4)
) ENGINE=InnoDB COMMENT='Cây hành chính VN. Seed từ dữ liệu Bộ Nội vụ. Read-only sau seed.';
```

## 4.5. Bảng `tenant` — Tổ chức (= beauty_salon cũ)

```sql
CREATE TABLE tenant (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code            VARCHAR(32)     NOT NULL,
    -- vd: TNT-2026-0001 (auto-gen). Dùng để hiển thị/in.
    alias           VARCHAR(64)     NOT NULL,
    -- vd: rebornjsc, dr-lena. Case-insensitive bằng default collation.
    subdomain       VARCHAR(63)     NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    name_unsigned   VARCHAR(255)    NOT NULL,
    short_name      VARCHAR(128)    NULL,
    industry_id     BIGINT UNSIGNED NOT NULL,
    area_id         BIGINT UNSIGNED NULL,
    address         TEXT            NULL,
    phone           VARCHAR(32)     NULL,
    email           VARCHAR(255)    NULL,
    tax_code        VARCHAR(32)     NULL,
    website         VARCHAR(255)    NULL,
    logo_file_id    CHAR(36)        NULL,
    avatar_file_id  CHAR(36)        NULL,
    status          VARCHAR(16)     NOT NULL DEFAULT 'pending',
    suspended_reason TEXT           NULL,
    activated_at    DATETIME(6)     NULL,
    terminated_at   DATETIME(6)     NULL,
    notes           TEXT            NULL,
    metadata        JSON            NOT NULL,
    -- {"old_beauty_salon_id": 12, "import_source": "..."}
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    updated_by      BIGINT UNSIGNED NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tenant_code (code),
    UNIQUE KEY uq_tenant_alias (alias),
    UNIQUE KEY uq_tenant_subdomain (subdomain),
    KEY idx_tenant_status (status, deleted_at),
    KEY idx_tenant_industry (industry_id, deleted_at),
    KEY idx_tenant_area (area_id, deleted_at),
    KEY idx_tenant_phone (phone, deleted_at),
    FULLTEXT KEY ft_tenant_name (name, name_unsigned),
    CONSTRAINT fk_tenant_industry FOREIGN KEY (industry_id) REFERENCES industry(id),
    CONSTRAINT fk_tenant_area FOREIGN KEY (area_id) REFERENCES area(id),
    CONSTRAINT chk_tenant_status CHECK (status IN ('pending','active','suspended','expired','terminated')),
    CONSTRAINT chk_tenant_subdomain CHECK (subdomain REGEXP '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$')
) ENGINE=InnoDB COMMENT='Tổ chức thuê bao SaaS. Migrate từ reborn.vn/beauty_salon.';

-- Trigger uppercase alias before insert/update để chuẩn hoá (nếu cần)
-- Không bắt buộc vì collation đã case-insensitive.
```

**Note**: `logo_file_id` + `avatar_file_id` reference `file_metadata.id` — không tạo FK ngay vì `file_metadata` định nghĩa sau. Tạo FK sau khi cả 2 bảng có:
```sql
ALTER TABLE tenant
    ADD CONSTRAINT fk_tenant_logo FOREIGN KEY (logo_file_id) REFERENCES file_metadata(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_tenant_avatar FOREIGN KEY (avatar_file_id) REFERENCES file_metadata(id) ON DELETE SET NULL;
```

## 4.6. Bảng `package` — Gói dịch vụ

```sql
CREATE TABLE package (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code            VARCHAR(64)     NOT NULL,
    -- vd: BASIC_CRM, PREMIUM_BPM, FREE_TRIAL
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    industry_id     BIGINT UNSIGNED NULL,
    -- NULL = gói neutral, dùng cho mọi industry
    app_code        VARCHAR(32)     NOT NULL,
    -- vd: CRM, BPM. 1 package gắn 1 app.
    base_price      DECIMAL(15,2)   NOT NULL DEFAULT 0,
    -- giá / 1 chu kỳ, đơn vị VND
    sale_price      DECIMAL(15,2)   NOT NULL DEFAULT 0,
    -- giá ưu đãi (≤ base_price)
    cycle_months    SMALLINT UNSIGNED NOT NULL DEFAULT 12,
    -- 999 = vĩnh viễn
    bonus_months    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    max_users       INT UNSIGNED    NULL,
    -- NULL = unlimited
    max_storage_mb  INT UNSIGNED    NULL,
    features        JSON            NOT NULL,
    -- list feature description hiển thị card gói
    color           VARCHAR(16)     NULL,
    icon            VARCHAR(64)     NULL,
    ordinal         INT             NOT NULL DEFAULT 0,
    is_default      TINYINT(1)      NOT NULL DEFAULT 0,
    -- Self-service signup hooks (Phase 5)
    is_trial        TINYINT(1)      NOT NULL DEFAULT 0,
    -- 1 = gói dùng thử có thời hạn; hết trial_days auto-suspend
    is_free         TINYINT(1)      NOT NULL DEFAULT 0,
    -- 1 = gói miễn phí vô thời hạn (giới hạn bởi max_users, max_storage_mb, package_permission)
    trial_days      SMALLINT UNSIGNED NULL,
    -- Số ngày trial (chỉ áp dụng khi is_trial=1, vd 14 ngày)
    is_self_signup_eligible TINYINT(1) NOT NULL DEFAULT 0,
    -- 1 = hiển thị trong dropdown self-signup ở ecosystem.reborn.vn
    status          VARCHAR(16)     NOT NULL DEFAULT 'draft',
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    updated_by      BIGINT UNSIGNED NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_package_code (code),
    KEY idx_package_status_ordinal (status, ordinal, deleted_at),
    KEY idx_package_app (app_code, deleted_at),
    KEY idx_package_industry (industry_id, deleted_at),
    KEY idx_package_self_signup (is_self_signup_eligible, status, deleted_at),
    CONSTRAINT fk_package_industry FOREIGN KEY (industry_id) REFERENCES industry(id),
    CONSTRAINT chk_package_status CHECK (status IN ('draft','active','archived')),
    CONSTRAINT chk_package_cycle  CHECK (cycle_months IN (1,3,6,12,24,36,999)),
    CONSTRAINT chk_sale_lte_base  CHECK (sale_price <= base_price),
    -- Self-service signup invariants (xem 03-Domain § 3.10)
    CONSTRAINT chk_pkg_trial_days CHECK (is_trial = 0 OR (trial_days IS NOT NULL AND trial_days BETWEEN 1 AND 90)),
    CONSTRAINT chk_pkg_free_zero  CHECK (is_free = 0 OR (base_price = 0 AND sale_price = 0)),
    CONSTRAINT chk_pkg_trial_xor_free CHECK (NOT (is_trial = 1 AND is_free = 1)),
    CONSTRAINT chk_pkg_self_signup_kind CHECK (is_self_signup_eligible = 0 OR is_trial = 1 OR is_free = 1)
) ENGINE=InnoDB COMMENT='Catalog gói dịch vụ. Mỗi gói gắn 1 app + 1 industry (hoặc neutral).';

-- Unique constraint "1 default per (industry, app)" với MySQL không hỗ trợ partial unique →
-- enforce ở app layer (service check trước khi set is_default = 1).
-- Hoặc dùng generated column trick:
ALTER TABLE package
    ADD COLUMN default_key VARCHAR(64) AS (
        IF(is_default = 1 AND status = 'active' AND deleted_at IS NULL,
           CONCAT(IFNULL(industry_id, 0), ':', app_code),
           NULL)
    ) STORED,
    ADD UNIQUE KEY uq_package_default (default_key);
```

## 4.7. Bảng `tenant_app` — Đăng ký app cho tenant

```sql
CREATE TABLE tenant_app (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT UNSIGNED NOT NULL,
    app_code        VARCHAR(32)     NOT NULL,
    package_id      BIGINT UNSIGNED NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    base_price_snapshot DECIMAL(15,2) NOT NULL,
    sale_price_snapshot DECIMAL(15,2) NOT NULL,
    cycle_months_snapshot SMALLINT UNSIGNED NOT NULL,
    bonus_months_snapshot SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    auto_renew      TINYINT(1)      NOT NULL DEFAULT 0,
    status          VARCHAR(16)     NOT NULL DEFAULT 'pending',
    notes           TEXT            NULL,
    metadata        JSON            NOT NULL,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    updated_by      BIGINT UNSIGNED NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    -- Unique (tenant_id, app_code) cho rows chưa xoá: enforce app-layer (vì MySQL ko hỗ trợ partial unique)
    KEY idx_tenant_app_tenant (tenant_id, deleted_at),
    KEY idx_tenant_app_status (status, deleted_at),
    KEY idx_tenant_app_end_date (end_date, status, deleted_at),
    -- Index cho báo cáo "sắp hết hạn"
    CONSTRAINT fk_tenant_app_tenant  FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_tenant_app_package FOREIGN KEY (package_id) REFERENCES package(id),
    CONSTRAINT chk_tenant_app_status CHECK (status IN ('pending','active','expired','cancelled')),
    CONSTRAINT chk_tenant_app_dates  CHECK (end_date > start_date)
) ENGINE=InnoDB COMMENT='Subscription tenant ↔ app. 1 tenant có nhiều app subscription cùng lúc.';
```

### Bảng `tenant_app_history` — Lịch sử thay đổi subscription

```sql
CREATE TABLE tenant_app_history (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tenant_app_id   BIGINT UNSIGNED NOT NULL,
    action          VARCHAR(32)     NOT NULL,
    -- created, renewed, package_changed, suspended, expired, cancelled
    from_state      JSON            NULL,
    to_state        JSON            NULL,
    cycle_months    SMALLINT UNSIGNED NULL,
    amount          DECIMAL(15,2)   NULL,
    notes           TEXT            NULL,
    actor_user_id   BIGINT UNSIGNED NULL,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_tenant_app_hist (tenant_app_id, created_at DESC),
    CONSTRAINT fk_tah_tenant_app FOREIGN KEY (tenant_app_id) REFERENCES tenant_app(id)
) ENGINE=InnoDB COMMENT='Audit trail mọi mutation subscription. Append-only.';
```

## 4.8. Bảng `tenant_membership` — User ↔ Tenant

```sql
CREATE TABLE tenant_membership (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT UNSIGNED NOT NULL,
    user_id         BIGINT UNSIGNED NOT NULL COMMENT 'logical ref to Identity Service. Không có FK cứng.',
    membership_role VARCHAR(32)     NOT NULL DEFAULT 'MEMBER',
    -- Vai trò ở mức platform. Khác tenant_role trong Org.
    status          VARCHAR(16)     NOT NULL DEFAULT 'invited',
    invited_by      BIGINT UNSIGNED NULL,
    invited_at      DATETIME(6)     NULL,
    joined_at       DATETIME(6)     NULL,
    revoked_at      DATETIME(6)     NULL,
    last_login_at   DATETIME(6)     NULL,
    -- updated bởi event từ Identity (login.success)
    metadata        JSON            NOT NULL,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    -- Unique (tenant, user) cho rows alive: enforce app-layer
    KEY idx_tm_user (user_id, deleted_at),
    KEY idx_tm_tenant_status (tenant_id, status, deleted_at),
    KEY idx_tm_role (membership_role, deleted_at),
    KEY idx_tm_last_login (last_login_at DESC),
    CONSTRAINT fk_tm_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT chk_tm_role   CHECK (membership_role IN ('OWNER','ADMIN','MEMBER','GUEST')),
    CONSTRAINT chk_tm_status CHECK (status IN ('invited','active','revoked','declined'))
) ENGINE=InnoDB COMMENT='Cầu nối user ↔ tenant. user_id là logical reference sang Identity.';

-- Trigger: enforce ≥1 OWNER per tenant
DELIMITER $$
CREATE TRIGGER trg_tm_check_owner
    BEFORE UPDATE ON tenant_membership
    FOR EACH ROW
BEGIN
    DECLARE v_owner_count INT;
    IF (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
       AND OLD.membership_role = 'OWNER' AND OLD.status = 'active' THEN
        SELECT COUNT(*) INTO v_owner_count FROM tenant_membership
            WHERE tenant_id = OLD.tenant_id
              AND membership_role = 'OWNER'
              AND status = 'active'
              AND deleted_at IS NULL
              AND id <> OLD.id;
        IF v_owner_count = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Cannot remove last OWNER of tenant';
        END IF;
    END IF;
END$$
DELIMITER ;
```

## 4.9. Bảng `module` + `resource` + `module_resource` + `resource_action`

```sql
CREATE TABLE module (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code            VARCHAR(32)     NOT NULL,
    -- CRM, BPM, POS, SOCIAL…
    name            VARCHAR(128)    NOT NULL,
    description     TEXT            NULL,
    icon            VARCHAR(64)     NULL,
    color           VARCHAR(16)     NULL,
    ordinal         INT             NOT NULL DEFAULT 0,
    status          VARCHAR(16)     NOT NULL DEFAULT 'active',
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    updated_by      BIGINT UNSIGNED NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_module_code (code),
    CONSTRAINT chk_module_status CHECK (status IN ('active','archived'))
) ENGINE=InnoDB;

CREATE TABLE resource (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code            VARCHAR(64)     NOT NULL,
    -- CUSTOMER, INVOICE, REPORT, KPI…
    name            VARCHAR(128)    NOT NULL,
    description     TEXT            NULL,
    category        VARCHAR(32)     NULL,
    -- data | report | system | …
    ordinal         INT             NOT NULL DEFAULT 0,
    status          VARCHAR(16)     NOT NULL DEFAULT 'active',
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    updated_by      BIGINT UNSIGNED NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_resource_code (code),
    CONSTRAINT chk_resource_status CHECK (status IN ('active','archived'))
) ENGINE=InnoDB;

CREATE TABLE resource_action (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resource_id     BIGINT UNSIGNED NOT NULL,
    action_code     VARCHAR(32)     NOT NULL,
    -- VIEW, CREATE, UPDATE, DELETE, EXPORT, APPROVE, ASSIGN…
    name            VARCHAR(128)    NOT NULL,
    description     TEXT            NULL,
    is_default      TINYINT(1)      NOT NULL DEFAULT 0,
    ordinal         INT             NOT NULL DEFAULT 0,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    -- UNIQUE (resource_id, action_code) cho rows alive — enforce app-layer
    KEY idx_resource_action_res (resource_id, deleted_at),
    CONSTRAINT fk_ra_resource FOREIGN KEY (resource_id) REFERENCES resource(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE module_resource (
    module_id       BIGINT UNSIGNED NOT NULL,
    resource_id     BIGINT UNSIGNED NOT NULL,
    ordinal         INT             NOT NULL DEFAULT 0,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    PRIMARY KEY (module_id, resource_id),
    KEY idx_mr_resource (resource_id),
    CONSTRAINT fk_mr_module   FOREIGN KEY (module_id) REFERENCES module(id) ON DELETE CASCADE,
    CONSTRAINT fk_mr_resource FOREIGN KEY (resource_id) REFERENCES resource(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='M:N — 1 resource có thể thuộc nhiều module.';
```

## 4.10. Bảng `package_permission` — Entitlement matrix

```sql
CREATE TABLE package_permission (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    package_id      BIGINT UNSIGNED NOT NULL,
    resource_id     BIGINT UNSIGNED NOT NULL,
    action_code     VARCHAR(32)     NOT NULL,
    allowed         TINYINT(1)      NOT NULL DEFAULT 1,
    -- 0 = explicit deny (override)
    limit_value     INT UNSIGNED    NULL,
    -- vd: max 100 customer/tháng. NULL = unlimited.
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    updated_by      BIGINT UNSIGNED NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_package_perm (package_id, resource_id, action_code),
    KEY idx_pp_package  (package_id),
    KEY idx_pp_resource (resource_id),
    CONSTRAINT fk_pp_package  FOREIGN KEY (package_id)  REFERENCES package(id)  ON DELETE CASCADE,
    CONSTRAINT fk_pp_resource FOREIGN KEY (resource_id) REFERENCES resource(id) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Ma trận gói × resource × action.';

-- Trigger validate action_code phải có trong resource_action
DELIMITER $$
CREATE TRIGGER trg_pp_check_action
    BEFORE INSERT ON package_permission
    FOR EACH ROW
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count FROM resource_action
        WHERE resource_id = NEW.resource_id
          AND action_code = NEW.action_code
          AND deleted_at IS NULL;
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'action_code not found in resource_action';
    END IF;
END$$

CREATE TRIGGER trg_pp_check_action_upd
    BEFORE UPDATE ON package_permission
    FOR EACH ROW
BEGIN
    DECLARE v_count INT;
    IF NEW.resource_id <> OLD.resource_id OR NEW.action_code <> OLD.action_code THEN
        SELECT COUNT(*) INTO v_count FROM resource_action
            WHERE resource_id = NEW.resource_id
              AND action_code = NEW.action_code
              AND deleted_at IS NULL;
        IF v_count = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'action_code not found in resource_action';
        END IF;
    END IF;
END$$
DELIMITER ;
```

## 4.11. Bảng `file_metadata` — Storage

```sql
CREATE TABLE file_metadata (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    owner_type      VARCHAR(32)     NOT NULL,
    owner_id        BIGINT UNSIGNED NULL,
    original_name   VARCHAR(255)    NOT NULL,
    mime_type       VARCHAR(128)    NOT NULL,
    size_bytes      BIGINT UNSIGNED NOT NULL,
    bucket          VARCHAR(64)     NOT NULL,
    object_key      VARCHAR(512)    NOT NULL,
    public_url      TEXT            NULL,
    checksum_sha256 CHAR(64)        NULL,
    metadata        JSON            NOT NULL,
    -- {"width": 1024, "height": 768, "exif": {...}}
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_file_object (bucket, object_key),
    KEY idx_file_owner (owner_type, owner_id, deleted_at),
    CONSTRAINT chk_file_owner CHECK (owner_type IN ('TENANT','USER','PACKAGE','HELP','SYSTEM'))
) ENGINE=InnoDB COMMENT='Metadata file upload. Blob trong S3/local. Soft-delete: cron sẽ purge blob sau 30 ngày.';
```

## 4.12. Help Center

```sql
CREATE TABLE help_video (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code            VARCHAR(64)     NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    video_url       TEXT            NOT NULL,
    thumbnail_url   TEXT            NULL,
    duration_sec    INT UNSIGNED    NULL,
    module_code     VARCHAR(32)     NULL,
    feature_code    VARCHAR(64)     NULL,
    industry_id     BIGINT UNSIGNED NULL,
    language        VARCHAR(8)      NOT NULL DEFAULT 'vi',
    ordinal         INT             NOT NULL DEFAULT 0,
    is_published    TINYINT(1)      NOT NULL DEFAULT 0,
    published_at    DATETIME(6)     NULL,
    view_count      BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    updated_by      BIGINT UNSIGNED NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_help_video_code (code),
    KEY idx_help_video_module (module_code, is_published, deleted_at),
    KEY idx_help_video_pub (is_published, ordinal, deleted_at),
    CONSTRAINT fk_help_video_industry FOREIGN KEY (industry_id) REFERENCES industry(id)
) ENGINE=InnoDB;

CREATE TABLE help_article (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug            VARCHAR(255)    NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    summary         TEXT            NULL,
    content_md      MEDIUMTEXT      NOT NULL,
    -- markdown
    module_code     VARCHAR(32)     NULL,
    industry_id     BIGINT UNSIGNED NULL,
    tags            JSON            NOT NULL,
    -- list string ["billing", "onboard", ...]
    language        VARCHAR(8)      NOT NULL DEFAULT 'vi',
    is_published    TINYINT(1)      NOT NULL DEFAULT 0,
    published_at    DATETIME(6)     NULL,
    view_count      BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      BIGINT UNSIGNED NULL,
    updated_by      BIGINT UNSIGNED NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_help_article_slug (slug),
    FULLTEXT KEY ft_help_article (title, summary, content_md),
    CONSTRAINT fk_help_article_industry FOREIGN KEY (industry_id) REFERENCES industry(id)
) ENGINE=InnoDB;
```

## 4.13. Outbox table (cho event publish)

```sql
CREATE TABLE outbox_event (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    aggregate_type  VARCHAR(64)     NOT NULL,
    aggregate_id    BIGINT UNSIGNED NOT NULL,
    event_type      VARCHAR(64)     NOT NULL,
    payload         JSON            NOT NULL,
    headers         JSON            NOT NULL,
    occurred_at     DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    published_at    DATETIME(6)     NULL,
    publish_attempts INT UNSIGNED   NOT NULL DEFAULT 0,
    last_error      TEXT            NULL,
    PRIMARY KEY (id),
    KEY idx_outbox_unpublished (published_at, occurred_at),
    KEY idx_outbox_aggregate   (aggregate_type, aggregate_id, occurred_at DESC)
) ENGINE=InnoDB COMMENT='Outbox pattern: ghi event cùng transaction với business mutation.';
```

## 4.14. Audit log (per entity event)

```sql
CREATE TABLE entity_event_log (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    entity_type     VARCHAR(64)     NOT NULL,
    entity_id       BIGINT UNSIGNED NOT NULL,
    event_action    VARCHAR(32)     NOT NULL,
    -- INSERT, UPDATE, DELETE, RESTORE
    actor_user_id   BIGINT UNSIGNED NULL,
    actor_ip        VARCHAR(45)     NULL,
    -- IPv4/IPv6 string
    actor_user_agent TEXT           NULL,
    before_snapshot JSON            NULL,
    after_snapshot  JSON            NULL,
    diff            JSON            NULL,
    -- {"field": {"from": x, "to": y}}
    correlation_id  CHAR(36)        NULL,
    -- UUID
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_eel_entity (entity_type, entity_id, created_at DESC),
    KEY idx_eel_actor  (actor_user_id, created_at DESC),
    KEY idx_eel_corr   (correlation_id)
) ENGINE=InnoDB
  COMMENT='Audit log: every mutation. Retention 2 năm. Append-only.'
  PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p2026q2 VALUES LESS THAN (TO_DAYS('2026-07-01')),
    PARTITION p2026q3 VALUES LESS THAN (TO_DAYS('2026-10-01')),
    PARTITION p2026q4 VALUES LESS THAN (TO_DAYS('2027-01-01')),
    PARTITION p2027q1 VALUES LESS THAN (TO_DAYS('2027-04-01')),
    PARTITION p_max   VALUES LESS THAN MAXVALUE
  );

-- Add partition mới mỗi quarter qua cron job + ALTER TABLE.
```

## 4.14b. Bảng `signup_request` — Self-service onboarding (Phase 5)

> **Lưu ý**: schema có sẵn ở MVP (forward-compat). API public mở ở Phase 5.

```sql
CREATE TABLE signup_request (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email           VARCHAR(255)    NOT NULL,
    phone           VARCHAR(32)     NULL,
    full_name       VARCHAR(255)    NULL,
    -- Tên người đăng ký (admin)
    company_name    VARCHAR(255)    NOT NULL,
    -- Tên doanh nghiệp → đề xuất alias/subdomain
    suggested_alias VARCHAR(64)     NULL,
    -- Auto-gen từ company_name, có thể null nếu user tự nhập
    industry_id     BIGINT UNSIGNED NULL,
    area_id         BIGINT UNSIGNED NULL,
    package_id      BIGINT UNSIGNED NOT NULL,
    -- Phải là package có is_self_signup_eligible = 1
    verify_token    CHAR(64)        NOT NULL,
    -- Random hex 32 bytes, dùng 1 lần
    expires_at      DATETIME(6)     NOT NULL,
    -- Mặc định = created_at + 24h
    status          VARCHAR(32)     NOT NULL DEFAULT 'pending_email_verify',
    -- submitted | pending_email_verify | activated | expired | rejected
    rejected_reason TEXT            NULL,
    -- Anti-abuse, fraud detection note
    -- Anti-abuse tracking
    source_ip       VARCHAR(45)     NULL,
    user_agent      TEXT            NULL,
    captcha_token   VARCHAR(255)    NULL,
    captcha_score   DECIMAL(3,2)    NULL,
    -- reCAPTCHA v3 score (0.0 risk → 1.0 trust)
    referrer_url    TEXT            NULL,
    utm_source      VARCHAR(64)     NULL,
    utm_campaign    VARCHAR(64)     NULL,
    -- Tracking marketing campaign
    -- Result link
    tenant_id       BIGINT UNSIGNED NULL,
    -- Set khi status = activated
    user_id         BIGINT UNSIGNED NULL,
    -- ID của user vừa tạo trên Identity (nếu mới)
    activated_at    DATETIME(6)     NULL,
    -- Audit
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_signup_token (verify_token),
    KEY idx_signup_email_status (email, status),
    KEY idx_signup_status_expires (status, expires_at),
    KEY idx_signup_source_ip (source_ip, created_at),
    -- Cho rate limit check
    CONSTRAINT fk_signup_industry FOREIGN KEY (industry_id) REFERENCES industry(id),
    CONSTRAINT fk_signup_area     FOREIGN KEY (area_id) REFERENCES area(id),
    CONSTRAINT fk_signup_package  FOREIGN KEY (package_id) REFERENCES package(id),
    CONSTRAINT fk_signup_tenant   FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT chk_signup_status  CHECK (status IN ('submitted','pending_email_verify','activated','expired','rejected'))
) ENGINE=InnoDB COMMENT='Self-service signup requests từ ecosystem.reborn.vn (Phase 5).';

-- Cron mỗi 5 phút: mark expired
-- UPDATE signup_request
-- SET status = 'expired'
-- WHERE status = 'pending_email_verify'
--   AND expires_at < NOW();

-- Anti-abuse: rate limit per IP (kiểm tra ở app layer dùng index idx_signup_source_ip)
-- "≤ 3 signup/giờ/IP" — query:
-- SELECT COUNT(*) FROM signup_request
-- WHERE source_ip = ? AND created_at > NOW() - INTERVAL 1 HOUR;
```

## 4.15. Reference data (platform_role) — vai trò Reborn JSC

```sql
CREATE TABLE platform_role (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code            VARCHAR(32)     NOT NULL,
    -- SUPER_ADMIN, BILLING_ADMIN, SUPPORT_L2, SALES, READONLY
    name            VARCHAR(128)    NOT NULL,
    description     TEXT            NULL,
    permissions     JSON            NOT NULL,
    -- list các action được phép trong console superadmin
    -- vd: ["tenant.create", "tenant.suspend", "package.update", ...]
    is_builtin      TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_platform_role_code (code)
) ENGINE=InnoDB;

CREATE TABLE platform_user_role (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL COMMENT 'logical ref to Identity',
    platform_role_id BIGINT UNSIGNED NOT NULL,
    granted_by      BIGINT UNSIGNED NULL,
    granted_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    expires_at      DATETIME(6)     NULL,
    deleted_at      DATETIME(6)     NULL,
    PRIMARY KEY (id),
    -- UNIQUE (user, role) cho rows alive: enforce app-layer
    KEY idx_pur_user (user_id, deleted_at),
    CONSTRAINT fk_pur_role FOREIGN KEY (platform_role_id) REFERENCES platform_role(id)
) ENGINE=InnoDB COMMENT='Gán platform_role cho user Reborn JSC.';
```

## 4.16. Seed data ban đầu (idempotent)

```sql
-- 1. Industry mặc định
INSERT INTO industry (code, name, name_en, ordinal) VALUES
    ('SPA',          'Spa & Thẩm mỹ',     'Spa & Beauty',          1),
    ('HEALTHCARE',   'Y tế',              'Healthcare',            2),
    ('EDUCATION',    'Giáo dục',          'Education',             3),
    ('RETAIL',       'Bán lẻ',            'Retail',                4),
    ('FNB',          'Nhà hàng & Ăn uống','Food & Beverage',       5),
    ('REAL_ESTATE',  'Bất động sản',      'Real Estate',           6),
    ('FINANCE',      'Tài chính & Ngân hàng','Finance & Banking',  7),
    ('CONSULTING',   'Tư vấn',            'Consulting',            8),
    ('OTHER',        'Khác',              'Other',                 99)
ON DUPLICATE KEY UPDATE name = VALUES(name), name_en = VALUES(name_en), ordinal = VALUES(ordinal);

-- 2. Module
INSERT INTO module (code, name, ordinal, status) VALUES
    ('CRM',     'Quản lý khách hàng (CRM)', 1, 'active'),
    ('BPM',     'Quản lý quy trình (BPM)',  2, 'active'),
    ('POS',     'Bán hàng (POS)',           3, 'active'),
    ('SOCIAL',  'Mạng xã hội',              4, 'active'),
    ('SUPPORT', 'Hỗ trợ khách hàng',         5, 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name), ordinal = VALUES(ordinal);

-- 3. Platform role
INSERT INTO platform_role (code, name, is_builtin, permissions) VALUES
    ('SUPER_ADMIN', 'Super Admin (toàn quyền)', 1, JSON_ARRAY('*')),
    ('SALES',       'Nhân viên Sales',           1, JSON_ARRAY('tenant.read','tenant.create','tenant_app.read','tenant_app.create','package.read')),
    ('BILLING',     'Billing Admin',             1, JSON_ARRAY('tenant.read','tenant_app.read','tenant_app.renew','package.read')),
    ('SUPPORT_L2',  'Tech Support L2',           1, JSON_ARRAY('tenant.read','tenant_membership.read','user.read','tenant.suspend')),
    ('READONLY',    'Read-only',                 1, JSON_ARRAY('*.read'))
ON DUPLICATE KEY UPDATE name = VALUES(name), permissions = VALUES(permissions);

-- 4. Resource (sample)
INSERT INTO resource (code, name, category) VALUES
    ('CUSTOMER',  'Khách hàng',  'data'),
    ('CONTRACT',  'Hợp đồng',    'data'),
    ('INVOICE',   'Hoá đơn',     'data'),
    ('REPORT',    'Báo cáo',     'report'),
    ('KPI',       'KPI',         'data')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 5. Resource_action: seed riêng (verbose), thực hiện ở migration script V011.

-- 6. Area: import từ file CSV của Bộ Nội vụ (~10000 rows) qua script LOAD DATA INFILE.
```

## 4.17. Migration script structure (Flyway convention)

```
prod_platformdb/migrations/
├── V001__create_industry_area.sql
├── V002__create_tenant_package.sql        -- bao gồm package.is_trial/is_free/trial_days/is_self_signup_eligible
├── V003__create_module_resource.sql
├── V004__create_package_permission.sql
├── V005__create_tenant_app_membership.sql
├── V006__create_file_metadata.sql
├── V007__create_help_center.sql
├── V008__create_outbox_audit.sql
├── V009__create_platform_role.sql
├── V010__create_signup_request.sql        -- Phase 5 forward-compat (table có sẵn, API mở sau)
├── V011__seed_industry_module_role.sql
├── V012__seed_resource_action.sql
├── V013__seed_area_vn.sql
├── V014__seed_default_trial_free_packages.sql  -- gói "TRIAL_14D" + "FREE_LIMITED" cho self-signup
├── V015__migrate_from_legacy_beauty_salon.sql  -- one-shot, có guard check
└── V016__migrate_from_legacy_org_app.sql       -- one-shot
```

## 4.18. Disk size estimate (1 năm)

| Bảng | Rows ước tính | Avg row size | Total |
|---|---|---|---|
| `tenant` | 2,000 | 2 KB | 4 MB |
| `tenant_app` | 8,000 | 1 KB | 8 MB |
| `tenant_app_history` | 50,000 | 1 KB | 50 MB |
| `tenant_membership` | 50,000 | 0.5 KB | 25 MB |
| `package` | 100 | 2 KB | 200 KB |
| `package_permission` | 5,000 | 0.3 KB | 1.5 MB |
| `industry` | 50 | 0.5 KB | 25 KB |
| `area` | 12,000 | 0.3 KB | 4 MB |
| `module` | 20 | 0.5 KB | 10 KB |
| `resource` | 200 | 0.5 KB | 100 KB |
| `resource_action` | 1,000 | 0.3 KB | 300 KB |
| `module_resource` | 500 | 0.1 KB | 50 KB |
| `file_metadata` | 100,000 | 1 KB | 100 MB |
| `help_video` | 200 | 1 KB | 200 KB |
| `help_article` | 500 | 5 KB | 2.5 MB |
| `outbox_event` | 1M (purge after publish) | 1 KB | 100 MB peak |
| `entity_event_log` | 5M | 1 KB | 5 GB |
| `platform_role` | 10 | 0.5 KB | 5 KB |
| `platform_user_role` | 50 | 0.2 KB | 10 KB |
| `signup_request` (Phase 5) | 30,000/năm | 1 KB | 30 MB |

**Total Year 1**: ~5.3 GB (95% là audit log). Với index + InnoDB overhead ~7–8 GB. Backup compressed ~2 GB.

→ 1 instance MySQL 4 vCPU / 16 GB RAM dư sức trong 3–5 năm đầu. Read replica sau khi cần.

## 4.19. MySQL-specific notes

### 4.19.1. Charset
- DB default `utf8mb4` (full Unicode + emoji)
- Collation `utf8mb4_0900_ai_ci`: case-insensitive, accent-insensitive — tốt cho search tiếng Việt
- ⚠️ Một số cột cần `_bin` collation (vd `code` columns) để case-sensitive nếu muốn — đã set explicit nếu cần

### 4.19.2. Timezone
- Server: `SET GLOBAL time_zone = '+00:00'` (UTC)
- App layer convert sang Asia/Ho_Chi_Minh khi hiển thị
- Connection string JDBC: `?serverTimezone=UTC`

### 4.19.3. JSON column
- MySQL 8 lưu binary tối ưu, query nhanh
- Index trên JSON dùng generated column:
  ```sql
  ALTER TABLE tenant
      ADD COLUMN old_bs_id BIGINT AS (JSON_VALUE(metadata, '$.old_beauty_salon_id')) STORED,
      ADD INDEX idx_tenant_old_bs (old_bs_id);
  ```

### 4.19.4. Foreign key + ON DELETE
- InnoDB enforce FK (KHÁC MyISAM)
- `ON DELETE RESTRICT` (default) cho dữ liệu master (industry, area, package)
- `ON DELETE CASCADE` cho child relationship (resource_action, module_resource, package_permission)
- `ON DELETE SET NULL` cho optional FK (logo_file_id)

### 4.19.5. Connection pool
- Spring Boot HikariCP: pool size 20, idle timeout 10 min
- MySQL `max_connections`: 200 (đủ cho 4-8 pod × 20 connection + monitoring)

### 4.19.6. Replication
- Async replica cho read-heavy traffic
- Binlog format: `ROW` (chuẩn cho replication chính xác)
- GTID enabled để failover dễ
