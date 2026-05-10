# 07 — Migration Plan

> Cutover từ hệ thống cũ (`reborn.vn/api/*` + `cloud.reborn.vn/adminapi/*`) sang Platform Service mới với **zero data loss** và **downtime ≤5 phút**.
>
> **📎 Companion doc**: [`07a-Legacy-Mapping.md`](./07a-Legacy-Mapping.md) — naming convention chính thức, per-column mapping chi tiết cho từng bảng, ETL SQL scripts idempotent, validation suite, lookup tables, rollback playbook. Đọc 07 (overview phase + risk) trước, 07a (chi tiết SQL) khi bắt tay implement.

## 7.1. Bảng nguồn → đích

| Bảng nguồn (cũ) | DB nguồn | Bảng đích | Service | Strategy |
|---|---|---|---|---|
| `beauty_salon` | `reborn_db` (host reborn.vn) | `tenant` | Platform | Bulk copy + transform |
| `org_app` | `reborn_db` | `tenant_app` | Platform | Bulk copy |
| `package` | `reborn_db` | `package` | Platform | Bulk copy |
| `field` | `reborn_db` | `industry` | Platform | Bulk + rename |
| `area` | `reborn_db` | `area` | Platform | Bulk copy |
| `module` | `cloud_db` (host cloud.reborn.vn) | `module` | Platform | Bulk copy |
| `module_resource` | `cloud_db` | `module_resource` | Platform | Bulk copy |
| `resource` | `cloud_db` | `resource` + `resource_action` | Platform | Bulk + split actions |
| `package_permission` | `cloud_db` | `package_permission` | Platform | Bulk + remap action codes |
| `employee` | `cloud_db` | (Org service) | Org | Out of scope — Org team handle |
| `role`, `role_permission`, `request_permission` | `cloud_db` | (Org service) | Org | Out of scope |
| `permission` (department) | `cloud_db` | (Org service) | Org | Out of scope |
| Các field user trong `user` table | `auth_db` (host `auth.reborn.vn`) | (Identity giữ nguyên) | Identity | Không động |

→ Thực tế Platform migration: **9 bảng**.

## 7.2. Migration phases

### Phase 0 — Prep (1 tuần)
- DBA cấp credential read-only `reborn_db` + `cloud_db` cho dev migrate script
- DBA enable binary log (ROW format) trên 2 DB nguồn (cho CDC qua Debezium nếu cần)
- Confirm `prod_platformdb` đã rỗng + có schema từ Flyway V001-V012 (nhưng chưa V013-V014)
- Setup môi trường staging: `platform-staging.reborn.vn` + `prod_platformdb_staging` (clone từ snapshot prod)

### Phase 1 — Initial bulk copy (off-hours, 2–3h downtime cho ETL)
**Khi**: 02:00 sáng cuối tuần
**Bước**:
1. Lock write trên các bảng nguồn (read-only mode 2h)
2. Run migration script `V013__migrate_from_legacy_beauty_salon.sql` + `V014`
3. Validate row count + sample diff
4. Unlock write

**Approach (MySQL)**: dùng staging table + ETL job (Spring Batch hoặc Pentaho/Airbyte) để pipe data qua, không dùng Foreign Data Wrapper (MySQL không có native FDW như Postgres).

**Script structure** (mỗi script idempotent, có guard check):

```sql
-- V013__migrate_from_legacy_beauty_salon.sql
-- Tiền điều kiện: ETL job đã copy beauty_salon → bảng staging legacy_beauty_salon_staging
-- trong cùng prod_platformdb (chạy trước khi apply Flyway).

-- Idempotent guard
SELECT COUNT(*) INTO @v_already_migrated FROM tenant
WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'beauty_salon';

-- Nếu đã migrate, bỏ qua (Flyway sẽ skip nếu version đã apply, đây là double-safety)
-- Trong MySQL Flyway script không support IF/ELSE control flow, dùng INSERT IGNORE pattern thay thế

INSERT IGNORE INTO tenant (
    code, alias, subdomain, name, name_unsigned, industry_id, area_id,
    address, phone, email, tax_code, status, metadata,
    created_at, created_by
)
SELECT
    CONCAT('TNT-LEGACY-', LPAD(bs.id, 6, '0'))                  AS code,
    LOWER(bs.alias)                                              AS alias,
    LOWER(REGEXP_REPLACE(bs.alias, '[^a-zA-Z0-9-]', '-'))        AS subdomain,
    bs.name,
    bs.name_unsigned,
    COALESCE(
        (SELECT id FROM industry WHERE code = UPPER(bs.field_code) LIMIT 1),
        (SELECT id FROM industry WHERE code = 'OTHER' LIMIT 1)
    )                                                            AS industry_id,
    bs.area_id,
    bs.address, bs.phone, bs.email, bs.tax_code,
    CASE bs.status
        WHEN 'approved' THEN 'active'
        WHEN 'pending'  THEN 'pending'
        ELSE 'pending'
    END                                                          AS status,
    JSON_OBJECT(
        'migration_source', 'beauty_salon',
        'old_beauty_salon_id', bs.id,
        'migrated_at', NOW(6)
    )                                                            AS metadata,
    bs.created_at,
    bs.created_by
FROM legacy_beauty_salon_staging bs
WHERE bs.deleted_at IS NULL;

-- Build lookup index (legacy id → new id) for next migration scripts
CREATE TABLE IF NOT EXISTS _migration_lookup_tenant (
    old_id BIGINT UNSIGNED PRIMARY KEY,
    new_id BIGINT UNSIGNED NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT IGNORE INTO _migration_lookup_tenant (old_id, new_id)
SELECT
    JSON_EXTRACT(metadata, '$.old_beauty_salon_id'),
    id
FROM tenant
WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'beauty_salon';
```

### Phase 2 — Dual-write (2–4 tuần)
Trong giai đoạn này, **app cũ vẫn ghi vào `reborn_db`/`cloud_db`** đồng thời Platform ghi vào `prod_platformdb`. Mục tiêu: catch up incremental + verify consistency.

**Cơ chế dual-write**:

**Option A — Reverse proxy + forward** (preferred):
```
                          ┌─► reborn_db (giữ nguyên)
FE/CRM cũ ──► nginx ──┤
                          └─► Platform Service ──► prod_platformdb
```
nginx forward request `POST /api/beautySalon/create` vào cả 2 backend, nhưng chỉ trả response của legacy (FE chưa biết Platform). Platform write best-effort.

**Option B — App-level dual-write** (nếu Option A khó):
- Sửa BE legacy: sau khi commit `reborn_db`, async call Platform API
- Risk: nếu Platform fail, data lệch — cần monitor + reconcile

**Reconciliation cron** (mỗi giờ):
```sql
-- Detect drift
SELECT bs.id, bs.alias, t.alias
FROM legacy_beauty_salon_staging bs
LEFT JOIN tenant t ON JSON_EXTRACT(t.metadata, '$.old_beauty_salon_id') = bs.id
WHERE t.id IS NULL
   OR LOWER(t.alias) <> LOWER(bs.alias)
   OR t.name <> bs.name;
```
Alert + manual fix nếu drift > 0.

### Phase 3 — FE cutover (1 ngày)
- **FE Reborn Super Admin** (nhánh này): đổi `prefixRebornVn` → `prefixPlatform` (1 commit nhỏ trong urls.ts)
- Smoke test
- Deploy

Sau bước này: **superadmin đọc/ghi vào Platform**. App cũ (CRM tenant) vẫn dùng legacy → tiếp tục dual-write.

### Phase 4 — App cutover (lần lượt 1 app/lần, 4–8 tuần)
Mỗi app (CRM, BPM, Mobile…) tuần tự cutover:
1. Sửa app: gọi Platform thay legacy cho các endpoint tenant/package/industry/module/resource
2. Test trên staging
3. Deploy production
4. Monitor 1 tuần
5. Tắt dual-write của riêng các endpoint đó

### Phase 5 — Decommission legacy (sau 6 tháng từ Phase 4)
- Mark legacy table `READ ONLY` 1 tháng
- Backup full
- Drop legacy tables
- Tắt reverse proxy

## 7.3. Cutover ngày D — chi tiết

```
T-7 days: gửi notice cho mọi team
T-3 days: dry-run trên staging
T-1 day:  freeze code change cho 2 service
T-1h:     backup prod_platformdb + reborn_db + cloud_db (snapshot)
T+0:      bật banner "maintenance" trên FE
T+1m:     stop write traffic legacy (nginx return 503)
T+2m:     run incremental sync (CDC delta từ T-1h tới T+1m)
T+3m:     run validation script (count + checksum)
T+4m:     flip nginx route: /api/beautySalon/* → platform.reborn.vn
T+5m:     gỡ banner maintenance
T+10m:    smoke test e2e
T+1h:     monitoring intensive 24h
```

## 7.4. Validation script

```sql
-- Run sau Phase 1
SELECT
    (SELECT COUNT(*) FROM legacy_beauty_salon_staging WHERE deleted_at IS NULL) AS legacy_count,
    (SELECT COUNT(*) FROM tenant WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'beauty_salon') AS new_count,
    CASE WHEN
        (SELECT COUNT(*) FROM legacy_beauty_salon_staging WHERE deleted_at IS NULL) =
        (SELECT COUNT(*) FROM tenant WHERE JSON_EXTRACT(metadata, '$.migration_source') = 'beauty_salon')
    THEN 'PASS' ELSE 'FAIL' END AS check_result;

-- Per-row diff (sample 100 random rows)
SELECT
    bs.id AS legacy_id,
    t.id  AS new_id,
    IF(bs.name <> t.name, 'NAME_DIFF', NULL)  AS diff_name,
    IF(LOWER(bs.alias) <> LOWER(t.alias), 'ALIAS_DIFF', NULL) AS diff_alias,
    IF(NOT (bs.email <=> t.email), 'EMAIL_DIFF', NULL) AS diff_email
FROM legacy_beauty_salon_staging bs
JOIN _migration_lookup_tenant lk ON lk.old_id = bs.id
JOIN tenant t ON t.id = lk.new_id
ORDER BY RAND()
LIMIT 100;
```

## 7.5. Rollback plan

### Nếu Phase 1 fail
- Truncate các bảng đã ghi: `TRUNCATE tenant, tenant_app, package, ... CASCADE`
- Xoá `_migration_lookup_*`
- Re-prepare data + retry

### Nếu Phase 3 (FE cutover) fail
- Revert FE commit (đổi lại `prefixRebornVn`)
- Deploy FE rollback
- Platform vẫn ghi (dual-write tiếp)

### Nếu Phase 4 (1 app cutover) fail
- Revert app code (hoặc disable feature flag)
- App quay lại đọc/ghi legacy
- Platform vẫn maintain dual-write

### Worst case — sau Phase 5 (đã decommission)
- Restore từ backup snapshot (lấy tại T-1h cutover)
- RTO: 4h. RPO: từ snapshot mới nhất.

## 7.6. Mapping field cụ thể (tham khảo cho dev)

### `beauty_salon` → `tenant`

| Cũ | Mới | Transform |
|---|---|---|
| `id` | `metadata.old_beauty_salon_id` | INT → JSONB string |
| (gen) | `code` | `'TNT-LEGACY-' \|\| LPAD(id::text,6,'0')` |
| `alias` | `alias` | `LOWER()`, ensure UNIQUE (suffix _2 nếu duplicate) |
| `alias` | `subdomain` | strip non-allowed chars |
| `name` | `name` | direct |
| `name_unsigned` | `name_unsigned` | direct |
| `field_code` | `industry_id` | `industry.code = UPPER(field_code)` lookup; default OTHER |
| `area_id` | `area_id` | direct (cùng area table) |
| `address`, `phone`, `email`, `tax_code` | same | direct |
| `status` | `status` | `approved→active, pending→pending, _→pending` |
| `logo`, `logo_transparent` | `logo_file_id` | upload blob lên S3, INSERT `file_metadata`, ref id |
| `created_at`, `created_by` | same | direct |
| `headquarter` | (drop) | flag bool — chỉ có ý nghĩa khi parent_id; không migrate |
| `parent_id` | (drop) | parent-child relationship của beauty_salon là khái niệm "chi nhánh" — chuyển sang Org nếu cần |

**Lưu ý lớn**: `beauty_salon.parent_id` (chi nhánh) — concept này KHÔNG thuộc Platform. Nếu tenant CRM cần "chi nhánh" thì là khái niệm Org (department subtree). Migration script DROP cột này, Org team xử lý sau.

### `org_app` → `tenant_app`

| Cũ | Mới | Transform |
|---|---|---|
| `id` | `metadata.old_org_app_id` | |
| `org_id` | `tenant_id` | lookup qua `_migration_lookup_tenant` |
| `app_code` | `app_code` | direct |
| `package_id` | `package_id` | lookup `_migration_lookup_package` |
| `start_date`, `end_date` | same | direct |
| `cycle_months` | `cycle_months_snapshot` | |
| `bonus_months` | `bonus_months_snapshot` | |
| `status` | `status` | active/expired/cancelled mapping |
| `paid_amount` | `base_price_snapshot` | |

### `field` → `industry`

| Cũ | Mới | Transform |
|---|---|---|
| `id` | drop | |
| `code` | `code` | UPPER |
| `name` | `name` | direct |
| `description` | `description` | direct |
| `ordinal` | `ordinal` | direct |
| `status` | `status` | direct |

### `package` → `package`

Direct copy với rename column nếu cần. Lookup `industry_id` mới.

### `area` → `area`

Direct copy. ID giữ nguyên (đảm bảo apps gọi `area_id` cũ vẫn ok).

### `module` + `resource` từ cloud → Platform

Direct copy. ID có thể đổi → cần `_migration_lookup_module/resource`.

`resource.actions` (cũ là JSON array trong column) → split thành rows trong `resource_action`:
```sql
INSERT INTO resource_action (resource_id, action_code, name, is_default)
SELECT 
    lk.new_id,
    UPPER(action.value->>'code'),
    action.value->>'name',
    (action.value->>'is_default')::BOOLEAN
FROM legacy_resource_staging r
JOIN _migration_lookup_resource lk ON lk.old_id = r.id
CROSS JOIN LATERAL jsonb_array_elements(r.actions::JSONB) action
ON CONFLICT (resource_id, action_code, deleted_at) DO NOTHING;
```

### `package_permission` → `package_permission`

Direct copy với lookup mới id của package + resource.

## 7.7. Backward compatibility shim (giữ legacy URL)

Trong Phase 4, khi có app vẫn gọi `https://reborn.vn/api/beautySalon/list`, nginx forward sang Platform với rewrite:

```nginx
location ~ ^/api/beautySalon/(.*)$ {
    add_header X-Deprecation "Endpoint deprecated, use platform.reborn.vn/api/v1/tenant" always;
    rewrite ^/api/beautySalon/list$       /api/v1/tenant break;
    rewrite ^/api/beautySalon/get$        /api/v1/tenant/$arg_id break;
    rewrite ^/api/beautySalon/update$     /api/v1/tenant/$arg_id break;
    proxy_pass https://platform.reborn.vn;
}
```

Header `X-Deprecation` log lại trong Platform metrics → biết app nào còn xài legacy → push team đó migrate.

## 7.8. Timeline tổng thể

```
W1  ──► Phase 0 prep (DBA, staging)
W2  ──► Phase 0 + V001-V012 migration script tested
W3  ──► Phase 1 trial trên staging
W4  ──► Phase 1 production (cuối tuần — downtime 2–3h)
W5  ──► Phase 2 dual-write start + Phase 3 FE superadmin cutover
W6-9──► Phase 2 dual-write monitor + reconcile
W10 ──► Phase 4: CRM cutover
W14 ──► Phase 4: BPM cutover
W18 ──► Phase 4: Mobile cutover
W20-44──► Soak period
W44 ──► Phase 5 decommission begin
```

Tổng: **~10 tháng** từ start tới decommission hoàn toàn.

## 7.9. Risks migration

| Risk | Mức | Mitigation |
|---|---|---|
| Field `beauty_salon.alias` có duplicate (case-insensitive) | Cao | Pre-script dedupe + manual review tuần 0 |
| Package phức tạp với nhiều legacy field | Trung | Snapshot toàn bộ vào `metadata` JSONB cho recovery |
| Apps khác (mobile native) khó cutover | Cao | Giữ legacy proxy ≥12 tháng |
| Downtime vượt 5 phút | Trung | Multiple dry-run trên staging với prod-like data |
| Lookup table _migration_lookup_* bị mất | Cao | Backup riêng + recreate từ metadata |
