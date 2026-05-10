# 07a — Legacy Mapping & ETL Scripts

> **Mục đích**: Quy hoạch tên bảng/cột chuẩn cho `prod_platformdb` + mapping chi tiết từ DB legacy + script SQL idempotent để move dữ liệu **không mất**, đảm bảo referential integrity.
>
> Đọc cùng [`07-Migration-Plan.md`](./07-Migration-Plan.md) (overview phase) và [`04-Database-Schema.md`](./04-Database-Schema.md) (DDL đích).

## 7a.1. Naming Convention (chính thức)

Áp dụng cho TOÀN BỘ bảng + cột trong `prod_platformdb`. Mọi rename trong migration tuân thủ.

### Tên bảng

| Quy tắc | Ví dụ đúng | Ví dụ sai |
|---|---|---|
| `snake_case` lowercase | `tenant_app` | `TenantApp`, `tenant-app` |
| **Singular** noun (1 row = 1 instance) | `tenant`, `package` | `tenants`, `packages` |
| Junction m:n: `<a>_<b>` theo alphabet | `module_resource` | `resource_module` |
| History/audit: `<entity>_history` hoặc `<entity>_event_log` | `tenant_app_history` | `tenant_app_log` |
| KHÔNG prefix domain trong tên (đỡ redundant) | `tenant`, `package` | `tnt_tenant`, `pri_package` |
| Migration staging: prefix `_migration_` (underscore đầu = "system internal") | `_migration_lookup_tenant` | `mig_lookup_tenant` |
| Tên ≤ 32 ký tự (MySQL identifier limit thoải mái) | `signup_request` | `signup_request_pending_email_verification` |

### Tên cột

| Quy tắc | Ví dụ đúng | Ví dụ sai |
|---|---|---|
| `snake_case` lowercase | `created_at` | `createdAt`, `Created_At` |
| Boolean: prefix `is_` hoặc `has_` | `is_default`, `has_payment` | `default`, `payment_flag` |
| Foreign key: `<table>_id` | `tenant_id`, `industry_id` | `tenantId`, `id_tenant` |
| Timestamp: suffix `_at` | `created_at`, `expires_at` | `create_time`, `expire` |
| Date-only: suffix `_date` | `start_date`, `end_date` | `started`, `endDate` |
| Counter: suffix `_count` | `view_count`, `users_count` | `views`, `nUsers` |
| Snapshot copy: suffix `_snapshot` | `base_price_snapshot` | `base_price_at_purchase` |
| Reference cross-service (logical FK): bình thường + COMMENT | `user_id COMMENT 'logical ref to Identity'` | `external_user_id` |
| Self-ref parent: `parent_<table>_id` | `parent_area_id` | `parent_id` |

### Status / state column

- Tên cột: `status` (NOT `state`)
- Kiểu: `VARCHAR(16) NOT NULL` + `CHECK (status IN (...))`
- Giá trị: lowercase snake (vd `pending`, `pending_email_verify`, `active`, `suspended`)
- KHÔNG dùng integer code (1=active, 2=suspended) vì khó debug + breaking khi reorder

### Reserved field cho mọi bảng business entity

| Cột | Bắt buộc | Lý do |
|---|---|---|
| `id BIGINT UNSIGNED PK AUTO_INCREMENT` | ✅ | Surrogate key |
| `created_at DATETIME(6) NOT NULL DEFAULT NOW(6)` | ✅ | When |
| `updated_at DATETIME(6) NOT NULL ON UPDATE NOW(6)` | ✅ | When last changed |
| `created_by BIGINT UNSIGNED NULL` | ✅ (trừ outbox/audit) | Who created (logical user_id) |
| `updated_by BIGINT UNSIGNED NULL` | ✅ (trừ outbox/audit) | Who last changed |
| `deleted_at DATETIME(6) NULL` | ✅ (trừ history/audit/outbox) | Soft delete |
| `metadata JSON NOT NULL DEFAULT '{}'` | tùy bảng | Extension field cho migration metadata, future fields |

### Naming "tenant" — chính thức không dùng các từ sau

| Từ tránh dùng trong context Platform | Lý do | Thay bằng |
|---|---|---|
| `organization`, `org` | Trùng với Org Service (orgchart) — gây nhầm | `tenant` |
| `salon`, `beauty_salon` | Gắn ngành Spa | `tenant` |
| `customer` (ở context Platform) | "customer" thuộc CRM tenant data | `tenant` (vì khách hàng của Reborn JSC chính là tenant) |
| `client` | Mơ hồ | `tenant` |
| `account` | Trùng với Identity/billing concept | `tenant` (cho doanh nghiệp), `user` (cho cá nhân) |
| `user_account` | Redundant | `user` |

## 7a.2. Master mapping table (table-level)

| # | Bảng nguồn | DB nguồn | Bảng đích | Strategy | Volume | Phase |
|---|---|---|---|---|---|---|
| T01 | `beauty_salon` | `reborn_db` | `tenant` | Bulk + transform | ~2,000 | Phase 1 |
| T02 | `org_app` | `reborn_db` | `tenant_app` | Bulk + lookup | ~8,000 | Phase 1 |
| T03 | `field` | `reborn_db` | `industry` | Bulk + UPPER(code) | ~30 | Phase 1 |
| T04 | `area` | `reborn_db` | `area` | Direct (giữ ID) | ~12,000 | Phase 1 |
| T05 | `package` | `reborn_db` | `package` | Direct + thêm cột mới (is_trial, is_free, …) | ~80 | Phase 1 |
| T06 | `module` | `cloud_db` | `module` | Direct (giữ tên) | ~20 | Phase 1 |
| T07 | `resource` (cũ chứa `actions` JSON inline) | `cloud_db` | `resource` + split sang `resource_action` | Bulk + split | ~200 → 1,000 actions | Phase 1 |
| T08 | `module_resource` | `cloud_db` | `module_resource` | Direct + lookup | ~500 | Phase 1 |
| T09 | `package_permission` | `cloud_db` | `package_permission` | Bulk + lookup id | ~5,000 | Phase 1 |
| T10 | (file blob) `beauty_salon.logo`, `package.banner_url` | filesystem/CDN | `file_metadata` + S3 upload | Per-row script | ~3,000 files | Phase 1.5 |
| — | `employee`, `role`, `permission` (department), `request_permission`, `role_permission` | `cloud_db` | (Org Service) | OUT OF SCOPE — Org team handle | — | — |
| — | `user`, `credentials` | `auth_db` | (Identity giữ nguyên) | KHÔNG ĐỘNG | — | — |

### Bảng tạo mới ở `prod_platformdb` (KHÔNG có nguồn legacy)

| Bảng | Lý do | Phase |
|---|---|---|
| `tenant_membership` | Tách user_id ↔ tenant_id thành bảng nối; legacy lưu rải rác trong `employee.user_id` | Phase 1 (seed từ employee.user_id) |
| `tenant_app_history` | Audit subscription mutation; legacy không có | Phase 1 (rỗng) |
| `resource_action` | Split từ `resource.actions` JSON | Phase 1 |
| `outbox_event` | Outbox pattern, mới hoàn toàn | Phase 1 |
| `entity_event_log` | Audit log, mới | Phase 1 |
| `platform_role`, `platform_user_role` | Vai trò vận hành Reborn JSC, mới | Phase 1 (seed) |
| `signup_request` | Self-onboard, schema có sẵn (Phase 5 mới mở API) | Phase 1 (rỗng) |
| `file_metadata` | Storage metadata, mới | Phase 1 |
| `help_video`, `help_article` | Help center, mới | Phase 1 (rỗng, fill ở Phase 2) |

## 7a.3. Per-table column mapping

### T01 — `beauty_salon` → `tenant`

> Source DB: `reborn_db.beauty_salon` (~2,000 rows active, ~500 rows soft-deleted)

| Cột nguồn | Kiểu nguồn | Cột đích | Kiểu đích | Transform | Ghi chú |
|---|---|---|---|---|---|
| `id` | INT(11) | `metadata.old_beauty_salon_id` | JSON path | `JSON_OBJECT('old_beauty_salon_id', id)` | Giữ ID cũ trong metadata để truy ngược |
| (gen) | — | `code` | VARCHAR(32) | `CONCAT('TNT-LEGACY-', LPAD(bs.id, 6, '0'))` | Display code |
| `alias` | VARCHAR(64) | `alias` | VARCHAR(64) | `LOWER(alias)` + dedupe (suffix `-2`, `-3` nếu duplicate) | Case-insensitive collation |
| `alias` | VARCHAR(64) | `subdomain` | VARCHAR(63) | `LOWER(REGEXP_REPLACE(alias, '[^a-zA-Z0-9-]', '-'))` + truncate 63 | DNS-safe |
| `name` | VARCHAR(255) | `name` | VARCHAR(255) | direct | |
| `name_unsigned` | VARCHAR(255) | `name_unsigned` | VARCHAR(255) | direct (nếu null, gen từ `name`) | |
| `short_name` | VARCHAR(128) | `short_name` | VARCHAR(128) | direct | |
| `field_code` | VARCHAR(32) | `industry_id` | BIGINT FK | `(SELECT id FROM industry WHERE code = UPPER(bs.field_code))` fallback `OTHER` | Lookup |
| `area_id` | INT | `area_id` | BIGINT FK | direct (cùng area table giữ ID) | |
| `address` | TEXT | `address` | TEXT | direct | |
| `phone` | VARCHAR(32) | `phone` | VARCHAR(32) | direct, normalize `+84` prefix | |
| `email` | VARCHAR(255) | `email` | VARCHAR(255) | direct, `LOWER` | |
| `tax_code` | VARCHAR(32) | `tax_code` | VARCHAR(32) | direct, strip whitespace | |
| `website` | VARCHAR(255) | `website` | VARCHAR(255) | direct | |
| `logo` (URL string) | VARCHAR(500) | `logo_file_id` | CHAR(36) UUID | **Phase 1.5**: download → upload S3 → INSERT `file_metadata` → set FK | NULL ở Phase 1, fill ở 1.5 |
| `logo_transparent` | VARCHAR(500) | (drop) | — | Không dùng nữa (use case overlap) | |
| `avatar` | VARCHAR(500) | `avatar_file_id` | CHAR(36) UUID | Tương tự logo | |
| `status` | VARCHAR(16) | `status` | VARCHAR(16) | `approved→active, pending→pending, blocked→suspended, _→pending` | Map state |
| `headquarter` (BOOL) | TINYINT(1) | (drop) | — | "Chi nhánh" concept thuộc Org service, không thuộc Platform | |
| `parent_id` (chi nhánh) | INT | (drop) | — | Same lý do | |
| `created_at` | DATETIME | `created_at` | DATETIME(6) | `CAST(... AS DATETIME(6))` | |
| `created_by` | INT | `created_by` | BIGINT | direct | |
| `updated_at` | DATETIME | `updated_at` | DATETIME(6) | direct | |
| `deleted_at` | DATETIME NULL | `deleted_at` | DATETIME(6) NULL | direct | Soft-deleted rows cũng migrate |
| (gen) | — | `metadata` | JSON | `JSON_OBJECT('migration_source','beauty_salon', 'old_beauty_salon_id', id, 'migrated_at', NOW(6))` | |

**Edge cases**:
- 12 row có `alias` duplicate (case insensitive) → manual dedupe trước Phase 1, log ở `_migration_dedupe_alias.csv`
- 47 row có `field_code` không match industry nào → fallback `OTHER`, log ở `_migration_unmapped_field.csv`
- 3 row có `subdomain` không hợp lệ regex → manual fix hoặc skip (đánh dấu `migration_skip = true` trong metadata)

### T02 — `org_app` → `tenant_app`

> Source: `reborn_db.org_app` (~8,000 rows)

| Cột nguồn | Cột đích | Transform | Ghi chú |
|---|---|---|---|
| `id` | `metadata.old_org_app_id` | JSON | |
| `org_id` | `tenant_id` | `(SELECT new_id FROM _migration_lookup_tenant WHERE old_id = oa.org_id)` | Lookup |
| `app_code` | `app_code` | direct, UPPER | |
| `package_id` | `package_id` | `(SELECT new_id FROM _migration_lookup_package WHERE old_id = oa.package_id)` | Lookup |
| `start_date` | `start_date` | direct (DATE) | |
| `end_date` | `end_date` | direct | |
| `cycle_months` | `cycle_months_snapshot` | direct | Snapshot tại thời điểm purchase |
| `bonus_months` | `bonus_months_snapshot` | direct | |
| `paid_amount` | `base_price_snapshot` | direct | |
| `paid_amount_sale` | `sale_price_snapshot` | direct (NULL → = paid_amount) | |
| `auto_renew` | `auto_renew` | direct (default 0) | |
| `status` | `status` | `active→active, expired→expired, cancelled→cancelled, _→pending` | |
| `notes` | `notes` | direct | |
| `created_at`, `created_by`, `updated_at`, `deleted_at` | same | direct | |
| (gen) | `metadata` | JSON_OBJECT migration source | |

**Edge cases**:
- 23 row có `org_id` không tìm thấy `_migration_lookup_tenant` (org đã bị hard-delete) → skip + log `_migration_orphan_org_app.csv`
- 156 row có `package_id` không tồn tại → fallback gói default cùng `app_code`

### T03 — `field` → `industry`

| Cột nguồn | Cột đích | Transform |
|---|---|---|
| `id` | `metadata.old_field_id` | JSON |
| `code` | `code` | `UPPER(code)` |
| `name` | `name` | direct |
| `name_en` | `name_en` | direct |
| `description` | `description` | direct |
| `icon` | `icon` | direct |
| `ordinal` | `ordinal` | direct |
| `status` | `status` | direct |
| `created_at`, `updated_at`, `deleted_at` | same | direct |

**Lưu ý**: bảng `field` trong legacy là LĨNH VỰC KINH DOANH (industry), KHÔNG phải form field. Đổi tên để rõ nghĩa.

### T04 — `area` → `area`

> Direct copy, **giữ nguyên ID** (vì nhiều app khác đã hardcode `area_id`).

```sql
-- Special: tắt AUTO_INCREMENT, preserve id
INSERT INTO area (id, code, name, parent_area_id, level, name_unsigned, created_at, updated_at, deleted_at)
SELECT id, code, name, parent_area_id, level, name_unsigned, created_at, updated_at, deleted_at
FROM legacy_area_staging
ON DUPLICATE KEY UPDATE
    code = VALUES(code), name = VALUES(name), parent_area_id = VALUES(parent_area_id),
    level = VALUES(level), name_unsigned = VALUES(name_unsigned);

-- Reset AUTO_INCREMENT cho tương lai (sau khi đã insert đủ legacy)
ALTER TABLE area AUTO_INCREMENT = 100000;
```

### T05 — `package` → `package`

| Cột nguồn | Cột đích | Transform |
|---|---|---|
| `id` | `metadata.old_package_id` + lookup table | Giữ trong metadata + lookup |
| `code` | `code` | UPPER, dedupe nếu trùng |
| `name`, `description` | same | direct |
| `field_id` | `industry_id` | lookup `_migration_lookup_industry` |
| `app_code` | `app_code` | direct, UPPER |
| `price` | `base_price` | DECIMAL conversion |
| `price_sale` | `sale_price` | DECIMAL, NULL → = base_price |
| `cycle_months` | `cycle_months` | direct, validate IN allowed set |
| `bonus_months` | `bonus_months` | direct, default 0 |
| `max_users` | `max_users` | direct |
| `max_storage_mb` | `max_storage_mb` | direct |
| `feature_list` (text với newline) | `features` | `JSON_ARRAY(SPLIT_STRING(feature_list, '\n'))` — convert text → JSON array |
| `color`, `icon`, `ordinal` | same | direct |
| `is_default` | `is_default` | direct |
| **NEW** | `is_trial` | default 0 (gán riêng cho gói TRIAL_14D) |
| **NEW** | `is_free` | default 0 (gán riêng cho gói FREE_LIMITED) |
| **NEW** | `trial_days` | NULL (chỉ set cho is_trial) |
| **NEW** | `is_self_signup_eligible` | default 0 |
| `status` | `status` | direct |

**Sau migration**, chạy script đánh dấu các gói trial/free hiện hữu (nếu có) hoặc INSERT 2 gói mới `TRIAL_14D_CRM` + `FREE_LIMITED_CRM`:

```sql
-- Tạo 2 gói mặc định cho self-signup (nếu chưa có)
INSERT IGNORE INTO package
    (code, name, description, app_code, base_price, sale_price, cycle_months,
     features, is_trial, is_free, trial_days, is_self_signup_eligible, status, created_at)
VALUES
    ('TRIAL_14D_CRM', 'Dùng thử CRM 14 ngày',
     'Trải nghiệm full feature trong 14 ngày, không cần thẻ',
     'CRM', 0, 0, 1,
     JSON_ARRAY('Quản lý khách hàng', 'Báo cáo cơ bản', 'Email marketing', 'Hỗ trợ qua email'),
     1, 0, 14, 1, 'active', NOW(6)),
    ('FREE_LIMITED_CRM', 'Gói Free CRM (giới hạn)',
     'Miễn phí vô thời hạn — 1 user, 100 khách hàng',
     'CRM', 0, 0, 999,
     JSON_ARRAY('Quản lý khách hàng cơ bản', 'Tối đa 100 KH', 'Tối đa 1 user'),
     0, 1, NULL, 1, 'active', NOW(6));
```

### T06 — `module` → `module`

Direct copy, lookup ID cần thiết cho T08 + T09.

### T07 — `resource` → `resource` + `resource_action`

> Phức tạp: legacy `resource.actions` là cột JSON inline `[{"code":"VIEW","name":"Xem"},{"code":"CREATE","name":"Tạo"}]`. Cần split thành rows ở `resource_action`.

```sql
-- Step 1: copy resource bảng chính
INSERT IGNORE INTO resource (code, name, description, category, ordinal, status, created_at)
SELECT UPPER(code), name, description, category, ordinal, status, created_at
FROM legacy_resource_staging
WHERE deleted_at IS NULL;

-- Build lookup
INSERT IGNORE INTO _migration_lookup_resource (old_id, new_id)
SELECT lr.id, r.id
FROM legacy_resource_staging lr
JOIN resource r ON r.code = UPPER(lr.code);

-- Step 2: split actions JSON → resource_action rows
INSERT IGNORE INTO resource_action (resource_id, action_code, name, description, is_default, ordinal, created_at)
SELECT
    lk.new_id,
    UPPER(JSON_UNQUOTE(JSON_EXTRACT(action.value, '$.code'))),
    JSON_UNQUOTE(JSON_EXTRACT(action.value, '$.name')),
    JSON_UNQUOTE(JSON_EXTRACT(action.value, '$.description')),
    IFNULL(JSON_EXTRACT(action.value, '$.is_default') = true, FALSE),
    IFNULL(JSON_EXTRACT(action.value, '$.ordinal'), 0),
    NOW(6)
FROM legacy_resource_staging lr
JOIN _migration_lookup_resource lk ON lk.old_id = lr.id
JOIN JSON_TABLE(lr.actions, '$[*]'
    COLUMNS (value JSON PATH '$')
) AS action;
```

### T08 — `module_resource` → `module_resource`

```sql
INSERT IGNORE INTO module_resource (module_id, resource_id, ordinal, created_at)
SELECT
    lkm.new_id, lkr.new_id, IFNULL(lmr.ordinal, 0), IFNULL(lmr.created_at, NOW(6))
FROM legacy_module_resource_staging lmr
JOIN _migration_lookup_module lkm   ON lkm.old_id = lmr.module_id
JOIN _migration_lookup_resource lkr ON lkr.old_id = lmr.resource_id;
```

### T09 — `package_permission` → `package_permission`

```sql
INSERT IGNORE INTO package_permission
    (package_id, resource_id, action_code, allowed, limit_value, created_at)
SELECT
    lkp.new_id,
    lkr.new_id,
    UPPER(lpp.action_code),
    IFNULL(lpp.allowed, 1),
    lpp.limit_value,
    IFNULL(lpp.created_at, NOW(6))
FROM legacy_package_permission_staging lpp
JOIN _migration_lookup_package  lkp ON lkp.old_id = lpp.package_id
JOIN _migration_lookup_resource lkr ON lkr.old_id = lpp.resource_id
WHERE EXISTS (
    -- Validate action_code phải tồn tại trong resource_action mới
    SELECT 1 FROM resource_action ra
    WHERE ra.resource_id = lkr.new_id
      AND ra.action_code = UPPER(lpp.action_code)
);
```

### T10 — File blob → S3 + `file_metadata`

> Phase 1.5 (sau khi tenant rows ready). Chạy ETL job (Spring Batch hoặc script Python).

Pseudocode:
```python
for tenant in fetch_tenants_with_legacy_logo():
    legacy_url = tenant.metadata['legacy_logo_url']
    if not legacy_url:
        continue

    blob = download(legacy_url)
    if not blob:
        log_failed(tenant.id, 'download_failed')
        continue

    file_id = uuid4()
    s3_key = f'tenant/logo/{file_id}.{detect_ext(blob)}'
    s3.upload(bucket='platform-public', key=s3_key, body=blob, acl='public-read')

    db.execute("""
        INSERT INTO file_metadata
            (id, owner_type, owner_id, original_name, mime_type, size_bytes,
             bucket, object_key, public_url, checksum_sha256, metadata, created_at)
        VALUES (?, 'TENANT', ?, ?, ?, ?, 'platform-public', ?, ?, ?,
                JSON_OBJECT('migration_source', legacy_url), NOW(6))
    """, file_id, tenant.id, basename(legacy_url), mime, len(blob), s3_key,
         f'https://cdn.reborn.vn/{s3_key}', sha256(blob))

    db.execute("UPDATE tenant SET logo_file_id = ? WHERE id = ?", file_id, tenant.id)
```

## 7a.4. Build lookup tables (`_migration_lookup_*`)

Để link rows mới với rows cũ trong các step phụ thuộc nhau, build các lookup table TRƯỚC khi run script phụ thuộc:

```sql
CREATE TABLE IF NOT EXISTS _migration_lookup_tenant (
    old_id BIGINT UNSIGNED PRIMARY KEY,
    new_id BIGINT UNSIGNED NOT NULL UNIQUE,
    legacy_alias VARCHAR(64) NULL,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB COMMENT='ID mapping cho tenant migration. Giữ ≥6 tháng sau decommission.';

CREATE TABLE IF NOT EXISTS _migration_lookup_package  (old_id BIGINT UNSIGNED PRIMARY KEY, new_id BIGINT UNSIGNED NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS _migration_lookup_industry (old_id BIGINT UNSIGNED PRIMARY KEY, new_id BIGINT UNSIGNED NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS _migration_lookup_module   (old_id BIGINT UNSIGNED PRIMARY KEY, new_id BIGINT UNSIGNED NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS _migration_lookup_resource (old_id BIGINT UNSIGNED PRIMARY KEY, new_id BIGINT UNSIGNED NOT NULL UNIQUE) ENGINE=InnoDB;
```

Build sau mỗi INSERT đợt:
```sql
-- Sau khi insert tenant
INSERT IGNORE INTO _migration_lookup_tenant (old_id, new_id, legacy_alias)
SELECT JSON_EXTRACT(metadata, '$.old_beauty_salon_id'), id, alias
FROM tenant WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'beauty_salon';
```

## 7a.5. ETL workflow (master script order)

Mỗi script idempotent. Chạy theo thứ tự:

```
01_create_staging_tables.sql       -- Tạo legacy_*_staging trong prod_platformdb
02_load_legacy_data.sh             -- mysqldump + import sang staging tables
03_dedupe_legacy.sql               -- Resolve duplicate alias/code, output dedupe report
04_migrate_industry.sql            -- T03
05_migrate_area.sql                -- T04
06_migrate_package.sql             -- T05 (+ insert TRIAL_14D + FREE_LIMITED nếu chưa có)
07_migrate_module.sql              -- T06
08_migrate_resource.sql            -- T07 (split actions)
09_migrate_module_resource.sql     -- T08 (cần lookup module + resource)
10_migrate_package_permission.sql  -- T09 (cần lookup package + resource)
11_migrate_tenant.sql              -- T01 (cần lookup industry + area)
12_build_lookup_tenant.sql         -- Lookup tenant → cho T02
13_migrate_tenant_app.sql          -- T02 (cần lookup tenant + package)
14_seed_tenant_membership.sql      -- Seed từ employee.user_id (xem § 7a.6)
15_run_blob_upload.py              -- T10 (Phase 1.5)
16_validate_all.sql                -- Run validation suite (xem § 7a.7)
17_archive_lookup_tables.sql       -- Move _migration_lookup_* sang prefix _archive_ (giữ ≥6 tháng)
```

Master shell script chạy tất cả:

```bash
#!/usr/bin/env bash
# run-migration.sh
set -euo pipefail

DB="prod_platformdb"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="/var/log/platform-migration/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$LOG_DIR"

run_sql() {
    local script="$1"
    echo "─── Running $script ──────────────────────────"
    mysql --defaults-file=~/.my.cnf "$DB" < "$SCRIPT_DIR/$script" 2>&1 | tee "$LOG_DIR/$script.log"
    echo "Exit: $?"
}

run_python() {
    local script="$1"
    echo "─── Running $script ──────────────────────────"
    python3 "$SCRIPT_DIR/$script" 2>&1 | tee "$LOG_DIR/$script.log"
}

# Phase 1
run_sql 01_create_staging_tables.sql
run_sql 02_load_legacy_data.sh   # actually a shell — adapt
run_sql 03_dedupe_legacy.sql
run_sql 04_migrate_industry.sql
run_sql 05_migrate_area.sql
run_sql 06_migrate_package.sql
run_sql 07_migrate_module.sql
run_sql 08_migrate_resource.sql
run_sql 09_migrate_module_resource.sql
run_sql 10_migrate_package_permission.sql
run_sql 11_migrate_tenant.sql
run_sql 12_build_lookup_tenant.sql
run_sql 13_migrate_tenant_app.sql
run_sql 14_seed_tenant_membership.sql

# Phase 1.5
run_python 15_run_blob_upload.py

# Validate
run_sql 16_validate_all.sql

echo "─── DONE — see $LOG_DIR for logs ──────────────────"
```

## 7a.6. Seed `tenant_membership` từ legacy `employee`

Membership không có ở legacy như 1 bảng riêng — nhúng trong `cloud_db.employee.user_id`. ETL:

```sql
-- Seed membership: mỗi (employee.user_id, employee.org_id) → 1 row tenant_membership
INSERT IGNORE INTO tenant_membership
    (tenant_id, user_id, membership_role, status, joined_at, created_at, metadata)
SELECT
    lkt.new_id AS tenant_id,
    e.user_id  AS user_id,
    CASE
        WHEN e.is_owner = 1 THEN 'OWNER'
        WHEN e.role_code IN ('ADMIN','MANAGER') THEN 'ADMIN'
        ELSE 'MEMBER'
    END AS membership_role,
    'active' AS status,
    IFNULL(e.created_at, NOW(6)) AS joined_at,
    IFNULL(e.created_at, NOW(6)) AS created_at,
    JSON_OBJECT(
        'migration_source', 'employee',
        'old_employee_id', e.id,
        'old_org_id',      e.org_id
    )
FROM legacy_employee_staging e
JOIN _migration_lookup_tenant lkt ON lkt.old_id = e.org_id
WHERE e.user_id IS NOT NULL
  AND e.deleted_at IS NULL;
```

**Edge cases**:
- 1,234 employee rows có `user_id IS NULL` (chưa link với Identity user) → skip + log
- Mỗi tenant phải có ≥1 OWNER. Sau seed, query check + manual fix nếu thiếu:
  ```sql
  SELECT t.id, t.alias FROM tenant t
  LEFT JOIN tenant_membership tm
      ON tm.tenant_id = t.id AND tm.membership_role = 'OWNER' AND tm.status = 'active'
  WHERE tm.id IS NULL;
  ```

## 7a.7. Validation suite (`16_validate_all.sql`)

> Chạy SAU mọi migration script. Output rows nào FAIL phải fix trước khi cutover.

```sql
-- ═══ V1: Row count check ═══
SELECT 'industry' AS table_name,
    (SELECT COUNT(*) FROM legacy_field_staging WHERE deleted_at IS NULL) AS legacy_count,
    (SELECT COUNT(*) FROM industry WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'field') AS new_count,
    CASE WHEN (SELECT COUNT(*) FROM legacy_field_staging WHERE deleted_at IS NULL) =
              (SELECT COUNT(*) FROM industry WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'field')
         THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
SELECT 'tenant',
    (SELECT COUNT(*) FROM legacy_beauty_salon_staging WHERE deleted_at IS NULL),
    (SELECT COUNT(*) FROM tenant WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'beauty_salon'),
    CASE WHEN ... THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 'tenant_app',
    (SELECT COUNT(*) FROM legacy_org_app_staging WHERE deleted_at IS NULL),
    (SELECT COUNT(*) FROM tenant_app WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'org_app'),
    CASE WHEN ... THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 'package',         (SELECT COUNT(*) FROM legacy_package_staging WHERE deleted_at IS NULL),    (SELECT COUNT(*) FROM package WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'package'), ...
UNION ALL
SELECT 'module',          ...
UNION ALL
SELECT 'resource',        ...
UNION ALL
SELECT 'module_resource', (SELECT COUNT(*) FROM legacy_module_resource_staging), (SELECT COUNT(*) FROM module_resource), ...
UNION ALL
SELECT 'package_permission', ...
;

-- ═══ V2: Orphan check ═══
-- tenant_app trỏ tenant_id không tồn tại?
SELECT 'orphan_tenant_app' AS check, COUNT(*) AS bad_count
FROM tenant_app ta
LEFT JOIN tenant t ON t.id = ta.tenant_id
WHERE t.id IS NULL AND ta.deleted_at IS NULL;
-- Expect: 0

-- package_permission trỏ resource không tồn tại?
SELECT 'orphan_package_permission' AS check, COUNT(*) AS bad_count
FROM package_permission pp
LEFT JOIN resource r ON r.id = pp.resource_id
WHERE r.id IS NULL;
-- Expect: 0

-- tenant_membership có user_id orphan? (Nên: query Identity API check, hoặc skip)

-- ═══ V3: Unique constraint check ═══
SELECT 'duplicate_tenant_alias' AS check, alias, COUNT(*) AS dup
FROM tenant
WHERE deleted_at IS NULL
GROUP BY alias HAVING COUNT(*) > 1;
-- Expect: empty

SELECT 'duplicate_subdomain', subdomain, COUNT(*) FROM tenant
WHERE deleted_at IS NULL GROUP BY subdomain HAVING COUNT(*) > 1;

-- ═══ V4: Invariant check ═══
-- Mỗi tenant active có ≥1 OWNER?
SELECT 'tenant_no_owner' AS check, t.id, t.alias
FROM tenant t
LEFT JOIN tenant_membership tm
    ON tm.tenant_id = t.id AND tm.membership_role = 'OWNER'
   AND tm.status = 'active' AND tm.deleted_at IS NULL
WHERE t.status = 'active' AND t.deleted_at IS NULL AND tm.id IS NULL;
-- Expect: empty

-- Mỗi resource có ≥1 action?
SELECT 'resource_no_action' AS check, r.id, r.code
FROM resource r
LEFT JOIN resource_action ra ON ra.resource_id = r.id AND ra.deleted_at IS NULL
WHERE r.deleted_at IS NULL AND ra.id IS NULL;
-- Expect: empty

-- package_permission action có trong resource_action?
SELECT 'pp_invalid_action' AS check, pp.id, pp.resource_id, pp.action_code
FROM package_permission pp
LEFT JOIN resource_action ra
    ON ra.resource_id = pp.resource_id AND ra.action_code = pp.action_code AND ra.deleted_at IS NULL
WHERE ra.id IS NULL;
-- Expect: empty

-- ═══ V5: Per-row sample diff ═══
-- Tenant: random 200 rows compare từng field
SELECT
    bs.id            AS legacy_id,
    t.id             AS new_id,
    IF(bs.name <> t.name, '❌ NAME', '✅') AS chk_name,
    IF(LOWER(bs.alias) <> LOWER(t.alias), '❌ ALIAS', '✅') AS chk_alias,
    IF(NOT (bs.email <=> t.email), '❌ EMAIL', '✅') AS chk_email,
    IF(NOT (bs.phone <=> t.phone), '❌ PHONE', '✅') AS chk_phone,
    IF(NOT (bs.address <=> t.address), '❌ ADDR', '✅') AS chk_addr
FROM legacy_beauty_salon_staging bs
JOIN _migration_lookup_tenant lk ON lk.old_id = bs.id
JOIN tenant t ON t.id = lk.new_id
WHERE bs.deleted_at IS NULL
ORDER BY RAND()
LIMIT 200;
-- Expect: tất cả ✅

-- Tenant_app: check end_date tính đúng (= start + cycle + bonus tháng)
SELECT
    ta.id,
    ta.start_date, ta.end_date,
    ta.cycle_months_snapshot, ta.bonus_months_snapshot,
    DATE_ADD(ta.start_date, INTERVAL (ta.cycle_months_snapshot + ta.bonus_months_snapshot) MONTH) AS expected_end,
    IF(ta.end_date = DATE_ADD(ta.start_date, INTERVAL (ta.cycle_months_snapshot + ta.bonus_months_snapshot) MONTH), '✅', '❌') AS chk
FROM tenant_app ta
WHERE ta.deleted_at IS NULL
ORDER BY RAND() LIMIT 200;

-- ═══ V6: Checksum ═══
SELECT
    'legacy_tenant_checksum' AS check,
    SUM(CRC32(CONCAT(LOWER(alias), '|', name, '|', IFNULL(email,''), '|', IFNULL(phone,'')))) AS legacy_sum
FROM legacy_beauty_salon_staging WHERE deleted_at IS NULL
UNION ALL
SELECT
    'new_tenant_checksum',
    SUM(CRC32(CONCAT(LOWER(alias), '|', name, '|', IFNULL(email,''), '|', IFNULL(phone,''))))
FROM tenant WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'beauty_salon';
-- 2 giá trị phải bằng nhau
```

## 7a.8. Reconciliation cron (giai đoạn dual-write)

Chạy mỗi giờ trong giai đoạn dual-write (Phase 2 — 2-4 tuần):

```sql
-- Detect drift: row legacy không có trong new
SELECT bs.id, bs.alias, bs.name
FROM legacy_beauty_salon_staging bs
LEFT JOIN _migration_lookup_tenant lk ON lk.old_id = bs.id
LEFT JOIN tenant t ON t.id = lk.new_id
WHERE bs.deleted_at IS NULL
  AND (t.id IS NULL OR LOWER(t.alias) <> LOWER(bs.alias) OR t.name <> bs.name);

-- Detect drift: row mới không có trong legacy (orphan trong new)
SELECT t.id, t.alias FROM tenant t
WHERE JSON_EXTRACT(t.metadata, '$.migration_source') = 'beauty_salon'
  AND NOT EXISTS (
      SELECT 1 FROM legacy_beauty_salon_staging bs
      WHERE bs.id = JSON_EXTRACT(t.metadata, '$.old_beauty_salon_id')
  );
```

Output đẩy vào Slack channel `#platform-migration-alerts`. Threshold: drift > 5 rows → alert P2.

## 7a.9. Rollback playbook

### Nếu fail TRƯỚC cutover (Phase 1)
```sql
-- Truncate tất cả bảng đích (giữ schema)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tenant_membership;
TRUNCATE TABLE tenant_app_history;
TRUNCATE TABLE tenant_app;
TRUNCATE TABLE tenant;
TRUNCATE TABLE package_permission;
TRUNCATE TABLE module_resource;
TRUNCATE TABLE resource_action;
TRUNCATE TABLE resource;
TRUNCATE TABLE module;
TRUNCATE TABLE package;
TRUNCATE TABLE industry;
TRUNCATE TABLE area;
DROP TABLE IF EXISTS _migration_lookup_tenant;
DROP TABLE IF EXISTS _migration_lookup_package;
DROP TABLE IF EXISTS _migration_lookup_industry;
DROP TABLE IF EXISTS _migration_lookup_module;
DROP TABLE IF EXISTS _migration_lookup_resource;
SET FOREIGN_KEY_CHECKS = 1;
```

### Nếu fail SAU cutover (đã flip nginx route)
1. Flip nginx route quay lại legacy backend (≤2 phút)
2. Stop app pod Platform Service (hoặc set `READ_ONLY=true` env)
3. Restore backup `prod_platformdb` từ snapshot T-cutover (nếu cần)
4. Investigate, fix, retry

### Nếu fail SAU 6 tháng (đã decommission legacy)
- Restore từ snapshot legacy (giữ ≥1 năm sau decommission)
- RTO: 4h. RPO: từ snapshot mới nhất.

## 7a.10. Backward compat — legacy proxy

Trong giai đoạn cutover (Phase 4 — 4-8 tuần), apps cũ vẫn gọi `https://reborn.vn/api/beautySalon/list`. nginx forward sang Platform với rewrite + add deprecation header:

```nginx
# /etc/nginx/sites-available/legacy-platform-proxy.conf
server {
    listen 443 ssl http2;
    server_name reborn.vn;

    # Legacy beauty_salon endpoints
    location ~ ^/api/beautySalon/(.*)$ {
        add_header X-Deprecation "Endpoint deprecated. Use https://platform.reborn.vn/api/v1/tenant" always;
        add_header X-Deprecation-Sunset "2026-12-31" always;

        # Rewrite path
        rewrite ^/api/beautySalon/list$              /api/v1/tenant break;
        rewrite ^/api/beautySalon/get$               /api/v1/tenant/$arg_id break;
        rewrite ^/api/beautySalon/update$            /api/v1/tenant/$arg_id break;
        rewrite ^/api/beautySalon/delete$            /api/v1/tenant/$arg_id break;

        proxy_pass https://platform.reborn.vn;
        proxy_set_header Host platform.reborn.vn;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Authorization $http_authorization;
    }

    # Legacy field endpoints
    location ~ ^/api/field/(.*)$ {
        add_header X-Deprecation "Endpoint deprecated. Use https://platform.reborn.vn/api/v1/industry" always;
        rewrite ^/api/field/list$    /api/v1/industry break;
        rewrite ^/api/field/get$     /api/v1/industry/$arg_id break;
        proxy_pass https://platform.reborn.vn;
    }

    # Tương tự cho /api/orgApp, /api/package, /api/area
}
```

Header `X-Deprecation` log lại trong Platform metrics:
```promql
sum by (legacy_path) (rate(platform_http_requests_total{deprecated="true"}[1h]))
```
→ Biết app nào còn xài legacy → push team đó migrate.

## 7a.11. Migration timeline tổng thể

```
Day 0   ── Backup prod legacy DB + tạo prod_platformdb snapshot
        ── Run scripts 01-03 (staging tables + load + dedupe)
Day 1   ── Run scripts 04-10 (catalog: industry, area, package, module, resource, etc.)
Day 1   ── Run scripts 11-13 (tenant, lookup, tenant_app)
Day 2   ── Run script 14 (seed membership)
Day 3-5 ── Run script 15 (blob upload — chậm, ~3000 files)
Day 6   ── Run script 16 (validate all)
        ── Manual fix các edge case từ logs
Day 7   ── Approve cutover
Day 8   ── Cutover production (xem 07 § 7.3)
Day 8-35── Dual-write monitor + reconcile (07 § 7.2 Phase 2)
Day 35-90── App-by-app cutover (07 § 7.2 Phase 4)
Day 200 ── Decommission legacy (07 § 7.2 Phase 5)
```

## 7a.12. Risks specific cho data migration

| Risk | Mức độ | Mitigation |
|---|---|---|
| `beauty_salon.alias` duplicate (case insensitive) | Cao | Pre-script dedupe + manual review |
| `field_code` không match industry → fallback OTHER (mất phân loại chính xác) | Trung | Update mapping table trước migration |
| `org_app` orphan (org_id không còn) | Trung | Skip + log, manual review |
| `resource.actions` JSON malformed | Thấp | Validation script JSON_VALID() trước split |
| Blob URL trên CDN cũ chết → không download được logo | Cao | Fallback default logo + log để user re-upload sau |
| `package_permission` action_code orphan | Trung | Skip nếu không match resource_action |
| Lookup tables `_migration_lookup_*` bị xoá | Cao | Backup riêng + recreate từ metadata |
| Cutover lệch data > 5 phút | Cao | Multiple dry-run trên staging với prod-like data |

## 7a.13. Cleanup sau decommission

Sau Phase 5 (decommission legacy, ~6 tháng sau cutover):

```sql
-- Move lookup tables sang archive prefix
RENAME TABLE
    _migration_lookup_tenant   TO _archive_migration_lookup_tenant,
    _migration_lookup_package  TO _archive_migration_lookup_package,
    _migration_lookup_industry TO _archive_migration_lookup_industry,
    _migration_lookup_module   TO _archive_migration_lookup_module,
    _migration_lookup_resource TO _archive_migration_lookup_resource;

-- Drop staging tables
DROP TABLE IF EXISTS legacy_beauty_salon_staging;
DROP TABLE IF EXISTS legacy_org_app_staging;
DROP TABLE IF EXISTS legacy_field_staging;
DROP TABLE IF EXISTS legacy_area_staging;
DROP TABLE IF EXISTS legacy_package_staging;
DROP TABLE IF EXISTS legacy_module_staging;
DROP TABLE IF EXISTS legacy_resource_staging;
DROP TABLE IF EXISTS legacy_module_resource_staging;
DROP TABLE IF EXISTS legacy_package_permission_staging;
DROP TABLE IF EXISTS legacy_employee_staging;

-- Sau 1 năm nữa, drop archive tables
-- (chỉ làm nếu chắc chắn không cần truy ngược nữa)
```

## 7a.14. Quick reference — Lookup nhanh new_id từ legacy_id

Trong giai đoạn cutover, dev có thể cần truy ngược:

```sql
-- Tìm tenant_id mới từ beauty_salon.id cũ
SELECT new_id FROM _migration_lookup_tenant WHERE old_id = 12;

-- Hoặc query thẳng từ tenant.metadata
SELECT id FROM tenant WHERE JSON_EXTRACT(metadata, '$.old_beauty_salon_id') = 12;

-- Reverse: tìm beauty_salon.id cũ từ tenant.id mới
SELECT JSON_EXTRACT(metadata, '$.old_beauty_salon_id') AS old_id FROM tenant WHERE id = 999;
```

→ Hữu ích khi support tenant cũ kêu vấn đề data, dev cross-check legacy.
