# Part 12 — Yêu cầu Phi chức năng (NFR)

## 1. Khung NFR (ISO 25010)

| Nhóm | Sub-attributes áp dụng |
|---|---|
| **Performance Efficiency** | Time behaviour, Resource utilization, Capacity |
| **Reliability** | Maturity, Availability, Fault tolerance, Recoverability |
| **Security** | Confidentiality, Integrity, Non-repudiation, Accountability, Authenticity |
| **Maintainability** | Modularity, Reusability, Analysability, Modifiability, Testability |
| **Portability** | Adaptability, Installability, Replaceability |
| **Compatibility** | Co-existence, Interoperability |
| **Usability** | Recognizability, Learnability, Operability, Accessibility |

## 2. Performance — quan trọng nhất cho bài toán này

### UR-NFR-PERF-01 — Throughput

| Metric | Sustained | Peak (lễ/sale) | Cách đạt |
|---|---|---|---|
| Auto-earn webhook | 200 TPS | 500 TPS | Async queue, batch ledger write, Redis cache |
| Lookup KH | 500 TPS | 1.000 TPS | Index phone + cache hot members |
| Consume points | 100 TPS | 200 TPS | Đồng bộ — không queue |
| Validate voucher | 200 TPS | 400 TPS | Cache voucher status |

### UR-NFR-PERF-02 — Latency

| API | P50 | P95 | P99 | SLO |
|---|---|---|---|---|
| Lookup KH (phone) | < 100 ms | < 300 ms | < 500 ms | 99% within P95 |
| Auto-earn | < 200 ms | < 500 ms | < 1 s | 99% within P95 |
| Consume points | < 150 ms | < 400 ms | < 800 ms | 99% within P95 |
| Profile 360° load | < 500 ms | < 1.5 s | < 3 s | 95% within P95 |
| Dashboard L0 | < 1 s | < 2 s | < 5 s | 95% within P95 |
| RFM batch (3M) | n/a | n/a | n/a | < 30 phút cron |
| Tier eval (3M) | n/a | n/a | n/a | < 30 phút cron |
| Expire cron (3M) | n/a | n/a | n/a | < 30 phút |
| Bulk import (3M rows) | n/a | n/a | n/a | < 1 giờ |

### UR-NFR-PERF-03 — Capacity

| Resource | Target |
|---|---|
| Database storage | 10TB (3 năm) — points_ledger ~5TB chính |
| Active members | 5M (year 3) |
| Daily transactions | 750K (year 3 peak) |
| Concurrent users | 500 (admin), 100K (KH app) |
| API gateway throughput | 5.000 RPS aggregate |

## 3. Reliability

### UR-NFR-REL-01 — Availability

- **Uptime SLO:** 99.5% rolling 30 days (= max 3.6h downtime/month)
- **Planned maintenance window:** Sun 02:00–05:00 (Asia/HCM), notify 7 ngày trước
- **Status page:** `status.loyalty.reborn.vn` (TBD)

### UR-NFR-REL-02 — RTO/RPO

| Scenario | RTO (recovery time) | RPO (data loss) |
|---|---|---|
| App pod crash | < 1 phút (k8s auto-restart) | 0 |
| AZ outage | < 15 phút (failover replica) | < 1 phút |
| Region outage | < 4 giờ | < 1 giờ |
| Data corruption | < 4 giờ | Restore to last backup (max 1 giờ) |

### UR-NFR-REL-03 — Fault tolerance

- **Webhook retry:** 3 attempts với exp backoff (1m, 5m, 30m)
- **Dead letter queue** cho permanent failures
- **Circuit breaker** giữa services khi downstream chậm
- **Graceful degradation:** nếu notification service down, vẫn ghi points; gửi notification từ queue khi recover

### UR-NFR-REL-04 — Backup

- **DB:** Snapshot daily 02:00 + WAL continuous, retention 30 ngày
- **Object storage:** Versioning enabled, retention 90 ngày
- **Quarterly restore drill** — test restore từ backup tới sandbox

## 4. Security

### UR-NFR-SEC-01 — AuthN & AuthZ

- **Admin auth:** SSO OAuth2/OIDC qua hệ SSO Reborn trung tâm
- **External POS:** API key + (optional) IP whitelist
- **Member-facing app:** OTP qua SMS/Zalo + session JWT (TTL 7 ngày, refresh 30 ngày)
- **RBAC** + (optional) attribute-based (scope-aware)

### UR-NFR-SEC-02 — Data protection

- **In transit:** TLS 1.3 mandatory, HSTS preload
- **At rest:** DB encrypted (AES-256), object storage encrypted
- **PII fields** (phone, name, email, national_id, dob): logical encryption với key rotation 90 ngày
- **Secrets:** Vault/SOPS, không hardcode trong code/config

### UR-NFR-SEC-03 — Application security (OWASP Top 10)

| Risk | Mitigation |
|---|---|
| A01 Broken Access Control | RBAC enforced ở API + UI; permission check ở mọi endpoint |
| A02 Cryptographic Failures | TLS 1.3, AES-256 at rest, no MD5/SHA1 |
| A03 Injection | Parameterized queries (Spring Data JPA), input validation |
| A04 Insecure Design | Threat modeling cho mỗi feature lớn |
| A05 Security Misconfiguration | Hardened k8s, security headers, no default passwords |
| A06 Vulnerable Components | Dependabot/SCA; quarterly review |
| A07 Auth Failures | Rate limit, OTP, MFA cho admin |
| A08 Software & Data Integrity | Signed releases, image hash verification |
| A09 Logging Failures | Centralized logging, alert on anomaly |
| A10 SSRF | URL allowlist cho outbound webhook |

### UR-NFR-SEC-04 — Audit & accountability

- **Audit log** mọi config change, manual adjust, login admin, permission change — retention 7 năm
- **Webhook signing** (HMAC-SHA256) cho outbound notification
- **Pen-test** annual + sau mỗi major release

### UR-NFR-SEC-05 — Compliance

- **NĐ 13/2023 (PDPA VN):** consent management, right-to-access, right-to-erasure, breach notification 72h
- **NĐ 91/2020:** SMS spam — opt-out link + receiver whitelist
- **TT78/NĐ 123 (e-invoice):** không applicable cho loyalty service (chỉ POS)

> Chi tiết: [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)

## 5. Maintainability

### UR-NFR-MAINT-01 — Code quality

- Code coverage ≥ 70% lines (target 80% trong 6 tháng)
- Static analysis: SonarQube quality gate enforced
- Code review mandatory: 1+ reviewer cho mỗi PR
- ADR documented cho mọi quyết định kiến trúc

### UR-NFR-MAINT-02 — Observability

- **Logs:** centralized (ELK/Loki), structured JSON, trace_id correlation
- **Metrics:** Prometheus + Grafana — golden signals (latency, traffic, errors, saturation)
- **Traces:** OpenTelemetry, sampling 10%
- **Alerts:** PagerDuty với escalation policy

### UR-NFR-MAINT-03 — Deployment

- **CI/CD pipeline** với staging gate
- **Blue-green deployment** cho zero-downtime
- **Rollback** trong 5 phút từ alert
- **Feature flag** cho gradual rollout

## 6. Portability

- **Containerized** (Docker) — chạy được trên k8s bất kỳ
- **12-factor app** compliance
- **DB:** PostgreSQL 14+ (target), MySQL 8 fallback compatible
- **Cloud-agnostic** — không lock-in AWS/GCP/Azure-specific service

## 7. Compatibility

- **Browser support:** Chrome/Edge/Safari/Firefox last 2 versions (admin UI)
- **POS integration:** REST/JSON; có sample SDK cURL/JavaScript/Python/Java
- **External system:** webhook out với HMAC, supports HTTPS với valid cert

## 8. Usability

- **Localization:** Vi (primary), En (secondary). i18next.
- **WCAG 2.1 AA** target cho admin UI và member app (year 2)
- **Onboarding:** new admin onboarding < 1 ngày, có tour + documentation in-app
- **Mobile responsive:** admin UI work trên tablet 10"

## 9. Tham chiếu

- **SA quality attributes:** [`../03-architecture/part-10-quality-attributes.md`](../03-architecture/part-10-quality-attributes.md)
- **Risk register:** [`../08-operations/risk-register.md`](../08-operations/risk-register.md)
- **Compliance:** [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)
- **Scalability 3M customers:** [`../03-architecture/part-07-scalability-3m-customers.md`](../03-architecture/part-07-scalability-3m-customers.md)
