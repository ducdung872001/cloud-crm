# Test Strategy — Reborn Loyalty Platform

> **Status:** Draft v1.0 — 2026-05-11

## 1. Mục tiêu

- Đảm bảo loyalty engine đúng đắn về kế toán (balance, ledger, FIFO)
- Đảm bảo POS integration không lỗi (idempotency, latency, error handling)
- Đảm bảo migration data từ 4 nguồn không mất/sai
- Đáp ứng NFR: 500 TPS, P95 < 500ms, 99.5% uptime
- Compliance: NĐ 13/2023, audit trail

## 2. Test scope

### 2.1. In-scope

- Loyalty engine (points, tier, rewards, expire, campaign)
- Customer 360° (lookup, dedupe, merge, bulk import)
- POS API (auto-earn, consume, refund, voucher)
- Notification (template render, throttle, delivery)
- Admin UI (settings, dashboards)
- Analytics (RFM, CLV)
- Migration ETL pipeline

### 2.2. Out-of-scope

- POS hardware
- External SMS/Email/Zalo gateway internals
- 3rd party BI tool

## 3. Test levels

```
                    ┌────────────────────┐
                    │  Acceptance (UAT)  │ ← BA, CSKH, Marketing
                    └─────────┬──────────┘
                    ┌─────────┴──────────┐
                    │  E2E (Playwright)  │ ← QA team
                    └─────────┬──────────┘
                    ┌─────────┴──────────┐
                    │  System / Integration│
                    └─────────┬──────────┘
                    ┌─────────┴──────────┐
                    │  Component         │
                    └─────────┬──────────┘
                    ┌─────────┴──────────┐
                    │  Unit              │ ← Developer
                    └────────────────────┘
```

## 4. Critical test suites

### TS-MBR — Membership

- TC-MBR-01: Register new member via POS (phone unique)
- TC-MBR-02: Register via app with OTP
- TC-MBR-03: Bulk import 10K members
- TC-MBR-04: Bulk import 3M (load test environment)
- TC-MBR-05: Dedupe by phone — keep latest
- TC-MBR-06: Merge cross-brand member
- TC-MBR-07: Soft delete + anonymize
- TC-MBR-08: Block / unblock cycle
- TC-MBR-09: Profile 360° load < 1.5s

### TS-PTS — Points

- TC-PTS-01: Auto-earn earn rule invoice_amount
- TC-PTS-02: Auto-earn earn rule category_based
- TC-PTS-03: Multiple rules priority
- TC-PTS-04: Min spend threshold
- TC-PTS-05: Max points per order cap
- TC-PTS-06: Stack mode single_highest
- TC-PTS-07: Stack mode multiplicative with cap
- TC-PTS-08: Tier multiplier applied correctly
- TC-PTS-09: Idempotency same order_ref different idempotency_key
- TC-PTS-10: Idempotency duplicate idempotency_key
- TC-PTS-11: Consume FIFO
- TC-PTS-12: Consume insufficient balance error
- TC-PTS-13: Refund rollback proportional
- TC-PTS-14: Refund into negative balance + audit
- TC-PTS-15: Cron expire `after_months` mode
- TC-PTS-16: Cron expire `end_of_year` mode
- TC-PTS-17: Notification before expire
- TC-PTS-18: Manual adjust within cap
- TC-PTS-19: Manual adjust > cap → 2-level approval
- TC-PTS-20: Reconciliation cron detects discrepancy

### TS-TIER — Tier

- TC-TIER-01: Upgrade instant on threshold
- TC-TIER-02: Auto eval monthly
- TC-TIER-03: Grace period 1 cycle
- TC-TIER-04: Downgrade after grace
- TC-TIER-05: Dry-run before apply
- TC-TIER-06: Tier eval 3M members < 30 min (perf)
- TC-TIER-07: Tier per brand isolation

### TS-RWD — Rewards

- TC-RWD-01: CRUD reward catalog
- TC-RWD-02: Redeem voucher
- TC-RWD-03: Redeem physical gift → fulfillment workflow
- TC-RWD-04: Stock limit enforced (race condition)
- TC-RWD-05: Per-member limit enforced
- TC-RWD-06: Tier-restricted reward access
- TC-RWD-07: Voucher validate at POS
- TC-RWD-08: Voucher use marks used
- TC-RWD-09: Voucher expire cron
- TC-RWD-10: Cancel redemption within period

### TS-PROMO — Promotion

- TC-PROMO-01: Create campaign wizard
- TC-PROMO-02: Segment builder + count
- TC-PROMO-03: Launch on schedule
- TC-PROMO-04: Auto-stop on budget cap
- TC-PROMO-05: Apply rule on matching transaction
- TC-PROMO-06: Notification throttle 100k/h
- TC-PROMO-07: A/B test bucketing deterministic
- TC-PROMO-08: Statistical significance computed

### TS-SCOPE — Cross-brand

- TC-SCOPE-01: chain_wide → per_brand migration
- TC-SCOPE-02: Cross-brand transfer A→B with ratio
- TC-SCOPE-03: Transfer cooldown 7 days enforced
- TC-SCOPE-04: Per-brand tier independent
- TC-SCOPE-05: Super-customer link no data leak
- TC-SCOPE-06: Cross-brand cap daily

### TS-POS — POS Integration

- TC-POS-01: Lookup KH by phone < 300ms
- TC-POS-02: Auto-earn P95 < 500ms (load test)
- TC-POS-03: Sandbox isolation
- TC-POS-04: API key rotation
- TC-POS-05: API key revoke immediate effect
- TC-POS-06: Rate limit 1000 req/min
- TC-POS-07: Webhook HMAC signature verify
- TC-POS-08: DLQ retry 3x
- TC-POS-09: Webhook duplicate idempotent

### TS-CARE — CSKH

- TC-CARE-01: Create ticket from CSKH
- TC-CARE-02: Auto-assign workflow
- TC-CARE-03: SLA at-risk alert
- TC-CARE-04: Compensation points within cap
- TC-CARE-05: Customer satisfaction post-resolve
- TC-CARE-06: Reopen within 7 days

### TS-RPT — Analytics

- TC-RPT-01: Executive dashboard load < 2s
- TC-RPT-02: RFM cron daily
- TC-RPT-03: CLV monthly batch
- TC-RPT-04: Cohort matrix
- TC-RPT-05: Liability report monthly
- TC-RPT-06: Export Excel large dataset (background job)

### TS-SEC — Security

- TC-SEC-01: Cross-tenant query rejected
- TC-SEC-02: Cross-brand scope leak prevented
- TC-SEC-03: PII masked in logs
- TC-SEC-04: SQL injection prevented (input validation)
- TC-SEC-05: XSS prevented (admin UI)
- TC-SEC-06: CSRF token enforced
- TC-SEC-07: Audit log immutable
- TC-SEC-08: Right-to-erasure workflow

### TS-COMPL — Compliance

- TC-COMPL-01: Consent capture at registration
- TC-COMPL-02: Marketing opt-in optional
- TC-COMPL-03: Data export (right-to-access)
- TC-COMPL-04: Deletion 30-day grace
- TC-COMPL-05: NĐ 91 frequency cap 3/week enforced
- TC-COMPL-06: NĐ 91 time window 7-22h enforced
- TC-COMPL-07: Unsubscribe link in email

### TS-MIGR — Migration

- TC-MIGR-01: ETL extract Goldmem schema
- TC-MIGR-02: Phone normalize to E.164
- TC-MIGR-03: Dedupe within source
- TC-MIGR-04: Dedupe cross-brand (super-customer)
- TC-MIGR-05: Dry-run preview accurate
- TC-MIGR-06: Full load 3M < 1h
- TC-MIGR-07: Reconciliation cross-system
- TC-MIGR-08: Rollback procedure

### TS-PERF — Performance

- TC-PERF-01: Sustained 200 TPS auto-earn 24h
- TC-PERF-02: Peak 500 TPS auto-earn 1h
- TC-PERF-03: Lookup 1000 TPS
- TC-PERF-04: Cron expire 3M < 30min
- TC-PERF-05: Cron tier eval 3M < 30min
- TC-PERF-06: Bulk import 3M < 1h
- TC-PERF-07: Dashboard load < 2s with 3M data

## 5. Test data strategy

| Env | Approach |
|---|---|
| Dev | Synthetic via Factory pattern |
| CI | Fixed scenarios via JSON fixtures |
| Staging | Anonymized prod copy refresh weekly |
| Sandbox | Test API key with sandbox flag, separate schema |
| Production | NO test data, smoke only with prod test member account |

PII handling in non-prod: anonymize on copy, fake phone/name with deterministic seed for reproducibility.

## 6. Defect management

| Severity | Definition | SLA fix |
|---|---|---|
| 🔴 Critical | Block release, data loss, security breach | 4 hours |
| 🟠 High | Critical path broken, workaround painful | 24 hours |
| 🟡 Medium | Non-critical bug, workaround available | 1 sprint |
| 🟢 Low | Cosmetic, edge case | Backlog |

Tracking: GitHub Issues (internal) / Linear / Jira.

## 7. Roles

| Role | Responsibility |
|---|---|
| Developer | Unit + integration tests |
| QA Engineer | E2E, exploratory, regression suite |
| QA Lead | Test strategy, coverage, defect triage |
| Security | Pen-test, SAST/DAST tooling |
| UAT Tester (KH) | Acceptance criteria sign-off |

## 8. Tham chiếu

- Test cases legacy: [`testcases-legacy-retail.md`](testcases-legacy-retail.md)
- Acceptance criteria: [`../08-operations/acceptance-criteria.md`](../08-operations/acceptance-criteria.md)
- Quality attributes: [`../03-architecture/part-10-quality-attributes.md`](../03-architecture/part-10-quality-attributes.md)
- Risk register: [`../08-operations/risk-register.md`](../08-operations/risk-register.md)
