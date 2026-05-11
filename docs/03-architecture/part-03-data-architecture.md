# Part 03 — Data Architecture

## 1. Stack tổng quan

| Tier | Tech | Mục đích |
|---|---|---|
| **OLTP primary** | PostgreSQL 14 | Member, ledger, tier, reward, campaign, ticket |
| **OLTP replica** | PostgreSQL 14 read-only (2 nodes) | Read offloading: dashboard, RFM |
| **Cache** | Redis 7 Cluster | Hot member, balance cache, session, rate limit, idempotency |
| **OLAP** | ClickHouse | Analytics: RFM, CLV, cohort, materialized aggregates |
| **Search** | Elasticsearch | Member search by name/phone fuzzy |
| **Object storage** | S3-compatible (MinIO) | Avatar, ticket attachment, voucher PDF |
| **Queue** | RabbitMQ | Webhook DLQ, notification queue, async jobs |
| **Stream** (year 2+) | Kafka | Event sourcing for cross-system propagation |

## 2. Logical data model

### 2.1. Core tables (PostgreSQL)

```
tenant
└─ tenant_id, name, hostname, status

brand
└─ brand_id, tenant_id, code, name, logo_url, primary_color, status

store
└─ store_id, brand_id, tenant_id, store_group_id, name, address, manager_id

store_group
└─ store_group_id, tenant_id, parent_id, name

member                          ← core entity
└─ member_id PK
   tenant_id (sharding key)
   phone (E.164)
   name, dob, gender, email, national_id
   home_brand_id, registered_store_id
   barcode UNIQUE
   card_number
   current_tier_id (cached)
   current_balance (cached, signed bigint)
   lifetime_points_earned (cached)
   status (active/inactive/blocked/merged)
   merged_into_member_id
   tags (jsonb)
   external_refs (jsonb)
   created_at, updated_at, deleted_at

   UNIQUE (tenant_id, phone) WHERE scope=chain
   UNIQUE (tenant_id, home_brand_id, phone) WHERE scope=per_brand

points_ledger                   ← append-only, partitioned by month
└─ ledger_id PK
   member_id
   tenant_id (sharding)
   scope_id (brand_id or store_group_id)
   entry_type (earn/redeem/expire/adjust/refund/transfer_in/transfer_out)
   points (signed bigint)
   balance_after
   reference_type, reference_id
   earn_rule_id (FK)
   expires_at (for earn)
   consumed_from_ledger_id (for redeem/expire FIFO)
   brand_id, store_id
   actor_user_id (NULL=system)
   note
   created_at

   UNIQUE (reference_type, reference_id, entry_type) — idempotency

   PARTITION BY RANGE (created_at)  -- monthly partitions
   INDEX (member_id, created_at DESC)
   INDEX (expires_at) WHERE entry_type='earn'

tier
└─ tier_id PK, tenant_id, scope_id
   tier_code, tier_name (i18n), tier_order
   threshold_points, maintain_threshold_points
   evaluation_metric, evaluation_period_months
   earn_multiplier, benefits (jsonb), grace_periods

member_tier_history
└─ history_id PK, member_id, scope_id
   tier_id, from_date, to_date
   reason (upgrade/downgrade/initial/manual)
   evaluation_metric_value
   evaluated_at

earn_rule
└─ rule_id PK, tenant_id, scope_id
   name, type (invoice_amount/category_based/fixed_per_order)
   priority, params (jsonb), modifiers (jsonb)
   active, valid_from, valid_to

reward
└─ reward_id PK, tenant_id, scope_id
   reward_code, name (i18n), type
   points_required, value_vnd, cost_to_company_vnd
   stock_remaining, per_member_limit, per_member_period
   eligible_tiers (jsonb), valid_from, valid_to
   active

reward_redemption
└─ redemption_id PK, member_id, reward_id
   points_spent, voucher_code UNIQUE
   status (issued/used/expired/cancelled)
   used_at, used_order_ref
   created_at

campaign
└─ campaign_id PK, tenant_id, scope_id
   name, type, target_segment_id
   rules_json, budget_vnd, current_spend_vnd
   status, start_at, end_at
   notification_template_id, channels
   ab_test_group_id

segment
└─ segment_id PK, tenant_id
   name, filter_rules_json
   member_count_cached, last_refreshed_at

ticket                          ← CSKH
└─ ticket_id PK, ticket_code UNIQUE
   tenant_id, member_id (nullable)
   walk_in_phone, walk_in_name
   channel, category, subcategory, priority
   status, subject, description, attachments
   assigned_to_user_id, sla_deadline
   first_response_at, resolved_at
   related_order_ref, compensation_points
   customer_satisfaction (NPS)

ticket_event
└─ event_id PK, ticket_id, actor_user_id, event_type, payload, created_at

audit_log                       ← immutable, retention 7 years
└─ audit_id PK, tenant_id, actor_user_id
   action, resource_type, resource_id
   before_value (jsonb), after_value (jsonb)
   ip, user_agent, timestamp

idempotency_key                 ← Redis primary, PG backup
└─ key UNIQUE, request_hash, response_body, expires_at
```

### 2.2. Sharding & partitioning strategy

**Sharding** (horizontal scale):
- `tenant_id` là sharding key (all tables có tenant_id)
- Năm 1: single PG cluster, app-level tenant routing
- Năm 2+: shard theo `hash(tenant_id) mod N` nếu cần

**Partitioning** (within shard):
- `points_ledger` partition by `created_at` monthly → 12 partitions/năm
- Drop partition cũ sau 5 năm (retention rule)
- Index local mỗi partition

**Estimate size năm 3:**
- members: 5M × 1KB = 5GB
- points_ledger: ~750K txn/day × 3 entries (earn + tier_check + idempotency cache trace) = ~2.25M entries/day × 365 × 3 năm × 500 bytes = ~3.7TB
- → cần partition + archive cold partition sang ClickHouse hoặc S3

### 2.3. Cache strategy (Redis)

```
Key prefix              TTL       Purpose
────────────────────────────────────────────────────────────
member:lookup:phone:X   1 hour    Lookup result cache
member:balance:X        5 min     Hot balance (write-through)
member:profile:X        30 min    Full profile (TTL refresh)
session:user:X          7 days    Admin session
otp:phone:X             5 min     OTP code
ratelimit:apikey:X      sliding   API rate limit counter
idempotency:key:X       24 hours  Idempotency response
voucher:code:X          7 days    Voucher status (issued/used)
segment:X:count         1 hour    Segment member count
campaign:active         5 min     List active campaigns
```

**Cache invalidation:**
- `member:balance:X` invalidate sau mọi ledger write (publish channel)
- `voucher:code:X` invalidate sau redeem
- Other: TTL natural expire

### 2.4. ClickHouse OLAP layer

ClickHouse phục vụ analytics nặng (3M KH × 1B+ ledger entries):

```
Tables in ClickHouse:
├─ ledger_events           (CDC stream from PG)
├─ member_snapshot_daily    (materialized)
├─ rfm_score_snapshot       (daily computed)
├─ clv_prediction           (monthly computed)
├─ cohort_retention         (matrix)
└─ campaign_attribution
```

Pipeline:
- **CDC:** Debezium/Maxwell stream PG → Kafka → ClickHouse (eventual consistency, lag < 5 min)
- **Batch:** Cron daily 03:00 — compute RFM, refresh snapshots
- **Query:** Admin dashboard queries ClickHouse cho analytics, OLTP cho real-time

## 3. Data flow

### 3.1. Write path — Auto-earn

```
POS webhook
    ▼
[API GW] validate API key (Redis check) → rate limit
    ▼
[market-service]
    ├─ BEGIN TXN
    │   ├─ INSERT idempotency_key
    │   ├─ INSERT points_ledger entry
    │   ├─ UPDATE member SET balance += X, lifetime_points += X
    │   └─ (if tier changed) INSERT member_tier_history
    ├─ COMMIT
    ├─ Publish event → RabbitMQ: PointsEarnedEvent
    └─ Return response
                ▼
[notification-service] consume event → send SMS/Zalo
[analytics-pipeline] consume CDC → ClickHouse
```

### 3.2. Read path — Lookup KH

```
POS GET /lookup?phone=X
    ▼
[API GW]
    ▼
[market-service]
    ├─ Check Redis member:lookup:phone:X
    │   ├─ HIT → return cached
    │   └─ MISS:
    │        ├─ Query PG (with index on phone)
    │        ├─ Cache result with TTL
    │        └─ Return
```

### 3.3. Read path — Dashboard

```
Admin GET /dashboard/exec
    ▼
[analytics-service]
    ├─ Query ClickHouse for aggregates
    ├─ Query PG read replica for real-time (today's count)
    └─ Combine + return
```

## 4. Data retention & archival

| Data class | Online retention | Cold archive | Hard delete |
|---|---|---|---|
| Member profile | Forever (active) | — | After member soft-delete + 5 năm |
| Points ledger | 3 năm online | 5 năm cold (S3 + ClickHouse) | After 8 năm total |
| Tier history | Forever | — | Anonymize after member hard-delete |
| Reward redemption | 3 năm | 5 năm | Same as ledger |
| Campaign | 2 năm | 5 năm | — |
| Ticket | 3 năm | 7 năm (legal) | — |
| Audit log | 7 năm (compliance) | — | — |
| Idempotency key | 24 giờ | — | — |
| Webhook log | 30 ngày | — | — |

## 5. Backup & recovery

- **PG primary** snapshot daily 02:00 + WAL streaming continuous
- **Retention** 30 ngày online, 1 năm offline (S3 Glacier)
- **Replica lag** target < 1s
- **Restore drill** quarterly: restore last snapshot to sandbox, run smoke tests, time-to-restore measured
- **RTO** < 4h, **RPO** < 1h (full disaster) / < 1 phút (AZ failover)

## 6. Migration data path

```
Goldmem export ──┐
MS Access dump ──┼──► [ETL Pipeline] ──► staging.member_raw ──► validation
MS Excel CSV  ───┤    (dbt / scripts)         │
Supporter dump ──┘                            ▼
                                       [Dedupe by phone]
                                              │
                                              ▼
                                    [Merge cross-brand]
                                              │
                                              ▼
                                    [Production import]
                                              │
                                              ▼
                              points_ledger (initial earn entries)
                              member (with external_refs back-pointer)
                              ticket (from Supporter)
```

Chi tiết: [`../06-analysis/data-migration-strategy.md`](../06-analysis/data-migration-strategy.md)

## 7. Tham chiếu

- Microservices ownership of data: [`part-04-microservices.md`](part-04-microservices.md)
- Scalability for 3M: [`part-07-scalability-3m-customers.md`](part-07-scalability-3m-customers.md)
- Backup ops procedures: [`../08-operations/operations-runbook.md`](../08-operations/operations-runbook.md)
- ADR data decisions: [`part-09-adr.md`](part-09-adr.md)
