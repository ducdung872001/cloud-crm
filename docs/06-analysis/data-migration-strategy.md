# Data Migration Strategy — Goldmem + Access + Excel + Supporter → 1 nguồn

## TL;DR

> 3M KH hợp nhất từ 4 nguồn lộn xộn (Goldmem chuẩn nhất, Access hard-to-export, Excel cần làm sạch, Supporter dữ liệu khác structure). Strategy: **3 phase** — (1) **ETL pipeline** stage data + data quality + dedupe by phone, (2) **Dry-run** preview + reconciliation, (3) **Cutover** + 30 ngày parallel run + retire hệ cũ. Total time 8 tuần. Risk lớn nhất: data quality của Access/Excel + dedupe overlap brand A/B → cần dry-run kỹ + Marketing approve preview.

## 1. Data inventory

| Nguồn | Loại | Quy mô | Data quality |
|---|---|---|---|
| **Goldmem** | RDBMS (MS SQL Server?) | ~3M KH, ~50M transaction history | 🟢 Tốt — primary source |
| **MS Access** | .mdb file | ~3M rows? bảng quyền lợi | 🟡 Trung bình — schema không chuẩn |
| **MS Excel** | .xlsx file | Hàng nghìn rows / file, nhiều file | 🔴 Yếu — manual edit, free format |
| **Supporter** | RDBMS hoặc custom | Khiếu nại history | 🟡 Cần làm sạch |

## 2. Mapping schema → Reborn

### 2.1. Goldmem → `customer` + `member` + `points_ledger`

```
goldmem.customer
├─ customer_id      → member.external_refs.goldmem_id
├─ phone            → member.phone (E.164 normalize)
├─ full_name        → member.name
├─ dob              → member.dob
├─ email            → member.email
├─ register_date    → member.registered_at
├─ home_store_id    → member.registered_store_id (mapping store_id)
├─ current_balance  → reconstruct via ledger (don't trust this)
├─ tier             → member.current_tier_id (map old → new tier)

goldmem.transaction_history
├─ trans_id         → ledger.reference_id
├─ customer_id      → member_id
├─ trans_date       → ledger.created_at
├─ trans_type       → ledger.entry_type (map: PURCHASE → earn, REDEEM → redeem)
├─ amount           → derive points
├─ store_id         → ledger.store_id

goldmem.benefit_program
├─ benefit_id       → reward.reward_id
├─ ...              → reward entity
```

### 2.2. MS Access → bổ sung quyền lợi

```
access.benefit_log
├─ customer_phone   → join với member by phone
├─ benefit_received → reward_redemption (if not duplicate with Goldmem)
├─ received_date    → redemption.created_at
```

Risk: trùng với Goldmem benefit → dedupe by `(customer_id, benefit_id, received_date)`.

### 2.3. MS Excel → reference cho dashboard design

Excel chủ yếu là **dashboard manual** + **bảng tổng hợp** → không phải data source mới. Sử dụng để hiểu khách đang tính metric gì, replicate trong Reborn dashboard.

→ KHÔNG migrate row-level data từ Excel.

### 2.4. Supporter → `ticket`

```
supporter.complaint
├─ complaint_id     → ticket.external_refs.supporter_id
├─ customer_phone   → join with member by phone (or walk_in if not exist)
├─ complaint_date   → ticket.created_at
├─ category         → ticket.category (map dictionary)
├─ severity         → ticket.priority (high/normal/low)
├─ description      → ticket.description
├─ resolution       → ticket.resolution
├─ status           → ticket.status (map open/closed)
├─ assigned_to      → ticket.assigned_to_user_id (need user mapping)
```

## 3. ETL Pipeline

```
                        ┌─────────────────┐
                        │  Goldmem (SQL)  │ ──┐
                        └─────────────────┘   │
                        ┌─────────────────┐   │
                        │  Access (.mdb)  │ ──┤
                        └─────────────────┘   │           ┌─────────────────┐
                        ┌─────────────────┐   │           │  Staging DB     │
                        │  Excel (.xlsx)  │ ──┼──Extract──►  schema_v1      │
                        └─────────────────┘   │           │  member_raw     │
                        ┌─────────────────┐   │           │  ledger_raw     │
                        │  Supporter      │ ──┘           │  ticket_raw     │
                        └─────────────────┘               └─────────────────┘
                                                                   │
                                                                   ▼
                                                          ┌─────────────────┐
                                                          │ Data Quality    │
                                                          │ - Phone format  │
                                                          │ - Email valid   │
                                                          │ - Dedupe        │
                                                          │ - Cross-brand   │
                                                          └─────────────────┘
                                                                   │
                                                                   ▼
                                                          ┌─────────────────┐
                                                          │ Dry-run preview │
                                                          │ - Total counts  │
                                                          │ - Diff vs source│
                                                          │ - Sample 100 KH │
                                                          └─────────────────┘
                                                                   │
                                                                   ▼ ✓ approved
                                                          ┌─────────────────┐
                                                          │ Production Load │
                                                          │ - Atomic batch  │
                                                          │ - Audit log     │
                                                          │ - Rollback ready│
                                                          └─────────────────┘
                                                                   │
                                                                   ▼
                                                          ┌─────────────────┐
                                                          │ Reborn Loyalty  │
                                                          │ - member        │
                                                          │ - points_ledger │
                                                          │ - ticket        │
                                                          └─────────────────┘
```

**Tooling đề xuất:**
- Python + pandas (transform)
- dbt cho schema staging → production
- PostgreSQL UPSERT (ON CONFLICT) cho idempotent
- Apache Airflow cho orchestration (optional)

## 4. Data quality rules

### 4.1. Phone normalize

```python
def normalize_phone(phone_raw):
    # Strip whitespace, special chars
    p = re.sub(r'\D', '', phone_raw)
    # Handle prefix
    if p.startswith('0'):
        return '+84' + p[1:]
    elif p.startswith('84'):
        return '+' + p
    elif p.startswith('+84'):
        return p
    else:
        return None  # invalid
```

**Edge cases:**
- Số 10 chữ số bắt đầu 0 → +84
- Số 11 chữ số cũ (091.xxxx.xxx → 9 chữ số sau prefix) → handle Việt Nam telco rename 2018
- Số quốc tế (non +84) → flag for review
- NULL or invalid → tạo placeholder `+84_legacy_<uuid>` để giữ data nhưng đánh dấu

### 4.2. Dedupe rules

```sql
-- Detect duplicates within Goldmem
SELECT phone, COUNT(*), STRING_AGG(customer_id, ',')
FROM staging.member_raw
GROUP BY phone
HAVING COUNT(*) > 1;
```

**Strategy:**
- Same phone in same source → merge (latest update wins for non-key fields)
- Same phone cross brand (Goldmem A + Goldmem B) → super-customer link, keep 2 member entities
- Similar names same phone with different DOB → flag suspicious, manual review

### 4.3. Cross-brand overlap

Expected: 15-25% phone overlap giữa Brand A + Brand B → super-customer.

Process:
1. Stage raw từ 2 brand riêng
2. Compute overlap set
3. Generate `super_customer_id` cho overlap
4. Link member entities với super-customer

### 4.4. Ledger reconstruction

`current_balance` ở Goldmem có thể không khớp với SUM của ledger (do bugs, manual edits). Reborn approach:

**Option 1 (safe):** Trust Goldmem balance, create 1 ledger entry `migration_baseline = current_balance` → going forward use new rules.

**Option 2 (audit):** Migrate full transaction history → reconstruct ledger → compare with Goldmem balance → reconcile discrepancy.

→ Đề xuất Option 1 cho speed. Option 2 cho audit-sensitive cases.

## 5. Phase plan

### Phase 1 (Tuần 1-2): Discovery & Mapping

| Task | Owner | Deliverable |
|---|---|---|
| Kickoff với Phòng CNTT&CĐS | PM | Meeting notes, contacts |
| Get schema dump Goldmem | DBA khách + Reborn | DDL files |
| Get .mdb file Access | Operation team | Files transferred (secure) |
| Get sample Excel files | Marketing team | Sample 5-10 representative files |
| Get Supporter export | CSKH team | CSV/SQL export |
| Field mapping document | BA Reborn | `migration-mapping.xlsx` |
| Data quality assessment | Data engineer | Issues list + ranking |

### Phase 2 (Tuần 3-4): Build ETL + Stage

| Task | Owner | Deliverable |
|---|---|---|
| Build extract scripts | Data eng | Scripts (Python/SQL) |
| Build transform layer | Data eng | dbt models / pandas pipelines |
| Build validation rules | Data eng + BA | Test suite |
| Run extract → stage (full) | Data eng | Staging DB populated |
| Data quality report | Data eng | Issues found + count |
| Marketing review preview | Marketing | Sign-off on sample 1.000 KH |

### Phase 3 (Tuần 5-6): Dry-run + Refinement

| Task | Owner | Deliverable |
|---|---|---|
| Dry-run load to sandbox | Reborn | Sandbox env có 100% data |
| Reconciliation: total count, sum balance | Reborn + Marketing | Reconciliation report |
| Spot check 100 KH random + 10 VIP | CSKH | Validation report |
| Fix issues found | Data eng | Updated pipeline |
| Cross-brand merge preview | Reborn + Marketing | Approval pending |

### Phase 4 (Tuần 7-8): Cutover

| Task | Owner | Deliverable |
|---|---|---|
| Freeze legacy systems (read-only) | Khách CNTT&CĐS | Cutover confirmed |
| Full production load | Reborn | All members migrated |
| Smoke tests | QA | Pass criteria |
| POS pilot 5-10 store | Tech + Operations | Live data flowing |
| Parallel run 30 days | All | Reconcile daily |
| Final cutover + retire legacy | All | Legacy stopped |

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Goldmem schema export incomplete | M | H | Multiple meetings with DBA, sample test early |
| Access file corrupt / không export được | H | M | Try multiple Access versions, OCR if needed; fallback PDF report extraction |
| Excel files inconsistent structure | H | M | Use Excel as reference only, không migrate data |
| Cross-brand overlap không như ước tính | M | M | Run analysis early, decision criteria pre-agreed |
| KH bị mất điểm sau migration | L | H | Backup snapshot + parallel run + rollback procedure |
| Ledger reconstruction sai | M | H | Option 1 baseline (safe), audit Option 2 nếu cần |
| Performance issue khi load 3M | M | M | Batch 10K, test in staging full-size |
| Privacy / compliance issue | L | C | Anonymize in staging, secure transfer (PGP), legal review |
| Operational downtime > 4h | M | H | Cutover trong off-peak (Sunday 2-5am) |

## 7. Cutover plan (detailed)

### T-7 days

- Communicate KH: "Maintenance Sunday 2-5am, no impact at POS"
- Backup full Goldmem snapshot
- Pre-load Reborn staging với latest delta
- Notify CSKH team: be on standby

### T-1 day

- Final sync: lấy data update từ Goldmem hôm trước
- Run dry-run final
- Compare counts: expect 100% match

### T-0 (Sunday 02:00)

```
02:00 — Set Goldmem read-only mode
02:05 — Run final delta extract
02:30 — Production load to Reborn
03:00 — Reconciliation
03:15 — Smoke tests:
        - Random 100 KH balance match
        - 10 VIP profile complete
        - POS lookup API working
04:00 — Switch POS to use Reborn API
04:15 — Test live transaction at 5 stores
04:30 — Monitor for issues
05:00 — Cutover complete, Goldmem stays read-only for 30 days
```

### T+30 days

- Goldmem retired (data archived offline)
- Access/Excel/Supporter retired (data archived)
- Post-mortem

## 8. Rollback plan

Nếu gặp issue critical sau cutover:
1. Switch POS back to Goldmem write mode
2. Reborn enters read-only
3. Investigate issue
4. Fix + re-attempt cutover next window

Decision criteria for rollback:
- > 5% transactions failing
- > 100 KH complaints in 4 hours
- DB integrity issue detected

## 9. Data retention legacy

| Source | Retention sau cutover |
|---|---|
| Goldmem | 12 tháng read-only (legal/audit), then archive offline 5 năm |
| Access | Archive offline 5 năm (compliance) |
| Excel | Archive 5 năm |
| Supporter | 12 tháng read-only, archive 5 năm |

## 10. Tham chiếu

- URD bulk import: [`../02-requirements/part-02-membership-core.md#ur-mbr-05-bulk-import-3m-kh-must`](../02-requirements/part-02-membership-core.md)
- Operations migration plan: [`../08-operations/data-migration-plan.md`](../08-operations/data-migration-plan.md)
- Cross-brand handling: [`cross-brand-strategy.md`](cross-brand-strategy.md)
- PDPA compliance trong migration: [`compliance-pdpa.md`](compliance-pdpa.md)
