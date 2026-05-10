# 08 — Non-Functional Requirements

## 8.1. Performance & Capacity

### Latency targets (P95, end-to-end client → response)

| Endpoint group | P50 | P95 | P99 |
|---|---|---|---|
| `GET /api/v1/me`, `/health/*` | 30ms | 100ms | 200ms |
| `GET /api/v1/tenant/{id}` (single) | 50ms | 150ms | 300ms |
| `GET /api/v1/tenant?page=1&limit=10` | 100ms | 300ms | 500ms |
| `GET /api/v1/tenant/{id}/membership` (enrich Identity) | 200ms | 500ms | 1s |
| `POST /api/v1/tenant` (create + emit events) | 300ms | 800ms | 2s |
| `PUT /api/v1/package/{id}/permissions` (bulk) | 500ms | 1.5s | 3s |
| Internal `/internal/tenant/{id}/entitlement` | 50ms | 200ms | 400ms |
| `POST /api/v1/public/signup` (create signup_request) | 200ms | 500ms | 1s |
| `POST /api/v1/public/signup/verify-email` (saga create tenant) | 500ms | 1.5s | 3s |
| End-to-end self-onboard (submit → welcome email arrived) | 5s | 15s | 30s |

### Throughput target (year 1)

- Steady state: 100 req/s
- Peak (giờ làm việc): 500 req/s
- Burst (10s): 2000 req/s

### Capacity

- 2,000 tenant active (year 1) → scale tới 20,000 tenant trong 5 năm (10x)
- 50,000 active membership → 500,000
- DB size 5 GB → 50 GB

## 8.2. Availability & Reliability

### SLO

- **Availability**: 99.9% / tháng (≤43 phút downtime)
  - Excludes scheduled maintenance (annouced ≥7 ngày trước)
- **Error rate**: <0.5% 5xx requests
- **Data durability**: 99.999999% (Postgres + daily backup + WAL archive)

### High Availability

- DB: Postgres primary + 1 sync standby + 1 async replica (read traffic)
- Service: ≥2 replica K8s pod, anti-affinity khác node
- Load balancer: ingress nginx HA (2 nodes)
- **No single point of failure** trong hot path

### Disaster Recovery

- **RTO**: 2 hours
- **RPO**: 1 hour (qua WAL archive every 5 min)
- Backup retention: daily 30 days, weekly 12 weeks, monthly 12 months
- Cross-region snapshot mỗi 24h (Singapore → Tokyo)
- Quarterly DR drill: restore production snapshot lên DR cluster, run smoke

## 8.3. Security

### 8.3.1. Authentication

- Mọi request (trừ `/health/*`) yêu cầu JWT valid
- JWT từ Identity, verify qua JWKS với cache 1h (TTL fallback 24h)
- JWT TTL: access token 15 phút, refresh token 7 ngày (Identity quản lý)
- Service-to-service: dùng client_credentials OAuth flow với scope giới hạn

### 8.3.2. Authorization

- Tất cả endpoint declare `@PreAuthorize("hasPermission('tenant.create')")` style
- Permission check qua `platform_user_role` của caller
- Audit log mọi mutation kèm actor + IP + user-agent

### 8.3.3. Input validation

- Spring `@Valid` + Bean Validation cho mọi DTO
- DTO không expose entity trực tiếp — luôn map qua MapStruct
- Whitelist cho query filter (không cho free-form SQL injection)

### 8.3.4. Output encoding

- JSON responses: Jackson auto-escape
- Không trả raw HTML — nếu cần (vd help_article content_md), sanitize phía FE bằng DOMPurify

### 8.3.5. Encryption

- **In transit**: TLS 1.3 only (TLS 1.2 fallback). Cert Let's Encrypt auto-renew via cert-manager.
- **At rest**: 
  - DB: MySQL InnoDB tablespace encryption (qua keyring plugin) hoặc filesystem-level (LUKS)
  - PII columns (`tenant.email`, `tenant.phone`, `tenant.tax_code`): MySQL `AES_ENCRYPT()`/`AES_DECRYPT()` field-level (key trong vault) hoặc app-layer (preferred)
  - File storage: S3 SSE-S3 hoặc SSE-KMS
- **Secrets**: K8s Secret + sealed-secrets controller, rotate ≤90 ngày

### 8.3.6. Rate limiting & DDoS

- Per-user: 1000 req/min read, 100 write
- Per-IP anonymous: 60 req/min
- WAF (Cloudflare) front layer: bot mitigation, geo-block tier nếu cần

### 8.3.10. Self-service signup anti-abuse (Phase 5)

Public endpoints `POST /api/v1/public/signup/*` là attack surface lớn (free creation). Áp dụng đa lớp phòng vệ:

| Lớp | Kỹ thuật | Threshold |
|---|---|---|
| WAF | Cloudflare bot fight mode | Auto-block known bot signature |
| CAPTCHA | reCAPTCHA v3 (invisible) | Score ≥ 0.5; reject < 0.3 |
| Rate limit per IP | Token bucket | 3 signup/giờ/IP, 10 check-availability/min |
| Rate limit per email | DB query | 1 signup/giờ/email (giảm spam re-submit) |
| Email verification | Bắt buộc | 24h expire, 1-shot token |
| Disposable email block | List domain (mailinator, 10minutemail…) | Reject ngay |
| Fraud signal scoring | App-layer rule engine | Score combine: IP reputation + UA + speed-of-fill + email pattern |
| Manual review queue | Status `pending_admin_review` | Trigger khi score cao, admin Reborn xem |
| IP blacklist | Auto-add khi >10 signup expired/7 ngày | 30 ngày suspension |
| Email domain abuse | Cùng domain >50 signup/tháng | Alert team Sales follow up |

### 8.3.11. PII trong signup_request

Bảng `signup_request` chứa email + phone + IP. Apply:
- Encryption at-rest (cùng cấp với `tenant.email`)
- Auto-purge sau 90 ngày với rows status `expired`/`rejected`:
  ```sql
  DELETE FROM signup_request
   WHERE status IN ('expired','rejected')
     AND created_at < NOW() - INTERVAL 90 DAY;
  ```
- GDPR erase: `DELETE /api/v1/internal/user/{user_id}/erase` cũng trigger xoá signup_request có email match

### 8.3.7. SQL injection

- 100% queries qua JPA/Hibernate parameterized
- Code review block raw SQL string concat

### 8.3.8. Audit & compliance

- Mọi mutation INSERT vào `entity_event_log` với before/after diff JSON
- Retention 2 năm
- Quarterly penetration test (external vendor)
- Annual security review

### 8.3.9. PII & GDPR

- `tenant.email`, `tenant.phone`, `tenant_membership.user_id` link là PII
- Endpoint `DELETE /api/v1/internal/user/{user_id}/erase`:
  - Soft-delete tất cả `tenant_membership` của user
  - Anonymize `created_by`, `updated_by` thành `0` cho rows do user đó tạo
  - Không xoá entity (vd tenant) — chỉ unlink user
- Export data per user: `GET /api/v1/internal/user/{user_id}/export-pii`

## 8.4. Maintainability

### Code quality

- **Test coverage**: ≥70% line, ≥60% branch
- **Linting**: Checkstyle + SpotBugs + SonarQube quality gate
- **Code review**: required, ≥1 approver, no self-merge
- **Naming**: theo `03-Domain-Model.md` ubiquitous language

### Documentation

- OpenAPI spec auto-gen từ Spring annotations
- Deployment runbook trong `09-Deployment.md`
- ADR cho mọi quyết định kiến trúc trong `10-ADR.md`
- Onboarding doc cho dev mới: tổng thời gian setup local ≤2h

### Logging & Observability

- **Structured logging**: JSON, level INFO+ trong production
- **Correlation ID**: mọi log có `request_id` (gen từ ingress nếu thiếu) + `actor_user_id`
- **Metrics**: Prometheus scrape `/metrics`
  - HTTP request duration histogram per endpoint
  - DB query duration
  - Outbox lag (event published vs occurred timestamp)
  - JWT verification cache hit rate
- **Tracing**: OpenTelemetry → Tempo/Jaeger
- **Log aggregation**: Loki (hoặc ELK)

### Alerting (PagerDuty/OpsGenie)

| Alert | Threshold | Severity |
|---|---|---|
| 5xx error rate | >1% trong 5 phút | P2 |
| P95 latency tenant API | >2s trong 5 phút | P2 |
| DB connection pool exhausted | <10% available | P1 |
| Outbox lag | >30s | P2 |
| Identity unreachable | 3 fails liên tiếp | P1 |
| Disk usage | >80% | P3 |
| Backup fail | 1 fail | P1 |

## 8.5. Scalability

### Horizontal scale

- Service stateless → scale pod theo CPU/memory:
  - HPA min 2, max 20 pod
  - Trigger: CPU >70% hoặc memory >80%
- DB scale read-heavy: thêm async read replica + dùng connection pooler (ProxySQL hoặc HikariCP-only)
- Cache shared: Redis cluster (3 nodes minimum)

### Vertical scale

- DB primary: start 4 vCPU / 16 GB RAM. Upgrade tới 16 vCPU / 64 GB khi cần.
- App pod: 1 vCPU / 2 GB RAM mỗi pod

### Bottleneck analysis

- Identity API call (enrich) là bottleneck tiềm tàng → batch + cache aggressive
- Outbox publisher là single-threaded mặc định → có thể partition theo aggregate_type

## 8.6. Compatibility

### Browser (cho FE Reborn Super Admin)
Chrome ≥110, Firefox ≥110, Edge ≥110, Safari ≥16. Không hỗ trợ IE.

### API
- Backward compat ≥1 năm cho v1
- Breaking change → bump v2, sống song song 1 năm
- Header `Sunset: <date>` khi deprecate endpoint

### DB
- MySQL 8.0+ (không gắn cứng 8.0, test với 8.4 LTS cũng ok)

### Java
- Java 21 LTS (match cloud-sales-master). Support tới 2031.

## 8.7. Compliance & Legal

- **Data residency**: prod data lưu tại Singapore (AWS ap-southeast-1) — phù hợp cho khách Việt Nam
- **GDPR-ready**: API erase + export như section 8.3.9
- **PCI-DSS**: KHÔNG xử lý card data (Billing service riêng, nếu có sau này)
- **ISO 27001**: target Year 2

## 8.8. Cost target

- Year 1 budget: ~$300/tháng infra (chưa tính dev)
  - DB primary: $80
  - DB standby: $80
  - 2 app pods: $40
  - Load balancer: $20
  - Redis: $30
  - S3 + CloudFront: $20
  - Monitoring (Loki/Prom self-hosted): $30
- Year 5 estimate: ~$2000/tháng

## 8.9. Operability

### Deployment frequency
- Target: deploy 2-3 lần/tuần
- Strategy: rolling update, canary 10% trong 30 phút trước khi 100%

### Mean Time to Recovery (MTTR)
- Target: <1h cho P1 incidents

### Mean Time Between Failures (MTBF)
- Target: >30 ngày

### Runbook coverage
- 100% scenario P1 phải có runbook trong wiki

## 8.10. Localization

- API messages: VI default, EN qua `Accept-Language: en-US`
- Date/time: server UTC, FE convert Asia/Ho_Chi_Minh
- Currency: VND (NUMERIC(15,2))
- Number format: server raw, FE format `1.234.567`
