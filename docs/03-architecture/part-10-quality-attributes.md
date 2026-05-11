# Part 10 — Quality Attributes & Fitness Functions

## 1. Quality attribute scenarios (ATAM)

### QA-01 — Performance: auto-earn latency

```
Source:       External POS
Stimulus:     POST /autoEarn for 1 order
Artifact:     market-service + DB
Environment:  Peak Saturday 17:00, 500 TPS
Response:     Ghi ledger, response 200 OK with points_earned
Measure:      P95 latency < 500 ms; error rate < 0.5%
```

**Fitness function:** Continuous load test → fail build if P95 > 500ms on staging.

### QA-02 — Availability: 99.5% uptime

```
Source:       Random failure (pod crash, network glitch)
Stimulus:     Component fails
Artifact:     Cluster
Environment:  Normal operation
Response:     Auto-recovery, request retries succeed
Measure:      Monthly availability ≥ 99.5%; MTTR < 15 min
```

**Fitness function:** Chaos engineering monthly — kill random pods, measure recovery time.

### QA-03 — Scalability: 3M → 5M members

```
Source:       Year 2-3 growth
Stimulus:     Member count grows 3M → 5M
Artifact:     DB + cache + analytics
Environment:  Production
Response:     System scales without re-architecture
Measure:      All SLO still met at 5M; cost grows linearly (not exponential)
```

**Fitness function:** Capacity planning review quarterly + load test with 5M synthetic data.

### QA-04 — Security: PII protection

```
Source:       Attacker (external) or insider
Stimulus:     Attempt to access PII of other tenants/members
Artifact:     API + DB
Environment:  Production
Response:     Access denied + audit log
Measure:      0 cross-tenant leaks in audit; pen-test pass annually
```

**Fitness function:** Integration test cross-tenant queries reject; quarterly RBAC review.

### QA-05 — Modifiability: add new tier rule

```
Source:       Marketing wants new earn rule (e.g., category × 1.5 for premium SKU)
Stimulus:     New rule requirement
Artifact:     earn_rule table + market-service
Environment:  Dev → Prod
Response:     Add via admin UI without code change
Measure:      Time to production < 1 hour (config only)
```

**Fitness function:** Earn rule designed as data, not code — verified by ADR + test.

### QA-06 — Interoperability: integrate new POS brand

```
Source:       New brand acquired
Stimulus:     Need to integrate POS Brand C
Artifact:     ACL adapter + API
Environment:  Staging → Prod
Response:     New adapter developed; rest of system unchanged
Measure:      Integration < 2 weeks; no impact on Brand A/B
```

**Fitness function:** Anti-corruption layer pattern enforced (ADR-13).

## 2. Quality attributes trace matrix

| NFR ID | Quality | Driver | Architecture decision | Fitness function |
|---|---|---|---|---|
| NFR-PERF-01 | Performance | 500 TPS peak | Async queue + Redis cache + horizontal scale | Load test continuous |
| NFR-PERF-02 | Performance | Latency P95 < 500ms | Indexed DB + cache hot members | Synthetic monitor |
| NFR-REL-01 | Availability | 99.5% uptime | Multi-AZ + HPA + DR | Uptime monitor |
| NFR-REL-02 | Recoverability | RTO < 4h | Backup daily + WAL streaming + DR drill | Quarterly drill |
| NFR-SEC-01 | Confidentiality | PII protection | Encryption at rest + masking + RBAC | Pen-test annual |
| NFR-SEC-02 | Integrity | Audit trail | Append-only ledger + audit_log immutable | Reconciliation cron |
| NFR-SEC-03 | Authenticity | API key + HMAC | Signed webhook | Integration test |
| NFR-MAINT-01 | Modifiability | Rule changes < 1h | Config-driven rules | Demo with new rule |
| NFR-MAINT-02 | Testability | Coverage ≥ 70% | Unit + integration tests | SonarQube gate |
| NFR-MAINT-03 | Observability | Detect issue < 5 min | Prometheus + alert | Synthetic chaos test |
| NFR-COMP-01 | Compliance | NĐ 13/2023 | Consent + erasure flow + audit 7 năm | Annual audit |

## 3. Quality risk register

| Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Peak 500 TPS quá tải DB primary | M | H | Read replica + connection pool + auto-scale | DBA |
| Webhook duplicate (POS bug) → double points | M | H | Idempotency mandatory | Backend lead |
| Cross-brand data leak | L | C | Scope filter mandatory + integration test | Security |
| Migration ETL data quality | H | M | Dry-run + reconciliation + parallel run 1 tháng | Migration lead |
| Tier eval cron 3M KH > 30 phút | L | M | Batch parallel + ClickHouse offload | Backend lead |
| Notification spam (campaign mistake) | M | H | Throttle + dry-run preview + approval workflow | Marketing PM |
| API key leak | L | H | Rotation + scope + IP whitelist + revocation < 5min | DevOps |
| Insider abuse (manual adjust > 50K KH) | L | C | Cap per adjust + 2-level approval + audit alert | Compliance |
| POS Brand B integration delay | M | M | Pilot Brand A first + Brand B ACL adapter parallel | PM |
| KH self-service deletion mass request | L | M | Workflow review + grace period | Legal/Compliance |

L=Low M=Medium H=High C=Critical

Full risk register: [`../08-operations/risk-register.md`](../08-operations/risk-register.md)

## 4. Architecture fitness functions (continuous)

| Fitness function | Check | Frequency | Tool |
|---|---|---|---|
| Latency P95 < 500ms | Auto-earn endpoint | Real-time | Prometheus alert |
| Error rate < 1% | All public APIs | 5 min window | Grafana alert |
| Cross-tenant query rejected | Integration test | Per PR | CI |
| All ledger entries idempotent | Integration test | Per PR | CI |
| RBAC matrix enforced | Authz test | Per PR | CI |
| DB query plan no full scan | Slow query log | Daily | pgBadger |
| Replica lag < 1s | Monitor | Real-time | Postgres exporter |
| DLQ size < 100 | Monitor | Real-time | Prometheus |
| Cache hit rate > 90% | Redis stats | Hourly | Grafana |
| Notification delivery ≥ 95% | Monitor | Daily | Notification service |
| Tier eval cron < 30 min | Job timing | Each run | Cron logs + alert |
| Backup restore succeed | DR drill | Quarterly | Manual procedure |

## 5. Trade-off summary

| Chọn | Đánh đổi | Lý do chọn |
|---|---|---|
| Strong consistency cho points | Latency cao hơn eventual | Money-like — không cho phép sai |
| Append-only ledger | Storage lớn | Audit + accounting requirement |
| Shared DB multi-tenant | Risk noisy neighbor | Cost + manageability với volume hiện tại |
| Java/Spring | Slower dev iteration vs Node/Go | Reliability + team familiar |
| 1 region | Higher cost if multi-region | Customer chỉ ở VN |
| Webhook (POS push) | POS phải code | Reborn không pull được POS DB |

## 6. Tham chiếu

- NFR: [`../02-requirements/part-12-nfr.md`](../02-requirements/part-12-nfr.md)
- Risk register: [`../08-operations/risk-register.md`](../08-operations/risk-register.md)
- ADR: [`part-09-adr.md`](part-09-adr.md)
- Scalability: [`part-07-scalability-3m-customers.md`](part-07-scalability-3m-customers.md)
