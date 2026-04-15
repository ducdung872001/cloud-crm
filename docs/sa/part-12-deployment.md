# Part 12 — Deployment & Operations

> **Executive Summary**: Frontend Reborn Retail CRM là **Vite build static** (`base: "/crm/"`) thích hợp host qua **CDN + object bucket**. Backend microservices (đã suy luận ở [Part 08](part-08-backend-architecture.md)) phù hợp **containerize + Kubernetes** với PostgreSQL master-replica, Redis, và object storage S3-compatible. Không có file CI/CD nào trong repo này — toàn bộ pipeline được đề xuất theo best practice. Mục tiêu **RTO 4h / RPO 1h**, **3 môi trường** (dev/staging/prod), **active-passive multi-region VN**.

## 1. Environment strategy

| Env | Mục đích | URL | Deploy trigger |
|-----|----------|-----|----------------|
| **dev** | Developer daily, tích hợp nội bộ | `dev-crm.reborn.vn` | Push to `develop` |
| **staging** | UAT với khách hàng, demo sale | `stg-crm.reborn.vn` | Tag `stg-*` |
| **production** | Khách hàng thật | `crm.reborn.vn` + tenant subdomain | Tag `v*.*.*` + manual approve |

### Env-specific config

Mỗi env có bộ env var riêng (`APP_API_URL`, `APP_BIZ_URL`, ...). Nên tách ra:

```
.env.development
.env.staging
.env.production
```

Hoặc **runtime config** — ship 1 build duy nhất, nạp `/config.json` theo host.

## 2. Build pipeline (CI)

### 2.1. Khuyến nghị GitHub Actions / GitLab CI

```yaml
stages:
  - lint
  - typecheck
  - test
  - build
  - scan
  - publish

lint:
  script:
    - yarn install --frozen-lockfile
    - yarn lint

typecheck:
  script:
    - yarn tsc --noEmit

test:
  script:
    - yarn test --coverage
  coverage: '/Statements.*?(\d+\.\d+)%/'

build:
  script:
    - yarn build --mode production
  artifacts:
    paths:
      - dist/

scan:
  script:
    - yarn audit --level high
    - trivy fs dist/

publish:
  script:
    - aws s3 sync dist/ s3://reborn-crm-prod/crm/ --delete
    - aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/crm/*"
```

### 2.2. Quality gate

- **Lint**: 0 error (warning cho phép).
- **Typecheck**: 0 error.
- **Test**: coverage ≥ 60% (hiện tại 0% — xem [Part 14](part-14-quality-risks.md)).
- **Audit**: 0 high/critical vulnerability.
- **Build size**: cảnh báo nếu bundle > 5MB.

## 3. Continuous deployment (CD)

### 3.1. Frontend

Build static → upload S3/bucket → invalidate CDN cache → done. **Zero-downtime** tự nhiên vì CDN serve file mới sau khi invalidate.

### 3.2. Backend — Strategy

| Strategy | Use case | Ưu/nhược |
|----------|----------|----------|
| **Blue-Green** | Risk-averse, prod quan trọng | Tốn 2× tài nguyên lúc switch |
| **Canary 1% → 10% → 50% → 100%** | Rollout an toàn, có RUM | Cần load balancer support |
| **Rolling** | Default K8s deployment | Có thể có lỗi tạm nếu schema change |

**Khuyến nghị**: Canary với Flagger (Kubernetes) + Prometheus metric gate.

### 3.3. Database migration

- Dùng **Flyway** / **Liquibase**.
- **Forward-only** — không rollback DB.
- Strategy **expand-and-contract**:
  1. Expand: thêm column mới, FE chưa dùng.
  2. Deploy FE dùng column mới.
  3. Contract: xoá column cũ sau N tuần.

## 4. Frontend hosting

### 4.1. Kiến trúc

```
                   ┌────────────────┐
User (browser)────►│  CDN Edge      │
                   │  CloudFlare /  │
                   │  BunnyCDN /    │
                   │  CloudFront    │
                   └────────┬───────┘
                            │ cache miss
                            ▼
                   ┌────────────────┐
                   │  Object store  │
                   │  S3 / R2 / MinIO│
                   │  reborn-crm-*  │
                   └────────────────┘
```

### 4.2. Khuyến nghị CDN VN

- **BunnyCDN**: rẻ, POP tại VN, support tốt.
- **CloudFlare**: free tier rộng, DDoS protection.
- **VNG CloudCDN** / **Viettel CDN**: latency thấp hơn cho user VN.

### 4.3. Cache policy

| Path | Cache-Control |
|------|---------------|
| `/crm/assets/*.[hash].js` | `public, max-age=31536000, immutable` |
| `/crm/assets/*.[hash].css` | `public, max-age=31536000, immutable` |
| `/crm/index.html` | `no-cache, must-revalidate` |
| `/crm/locales/*.json` | `public, max-age=3600` |

## 5. Backend hosting

### 5.1. Option A — Kubernetes (khuyến nghị)

```
┌────────────────────────────────────────┐
│ VN region (Primary — HCM / HN)         │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │  K8s cluster                        │ │
│ │  - 3 control plane                  │ │
│ │  - 6-20 worker node                 │ │
│ │  - HPA autoscale                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │  Managed PostgreSQL                 │ │
│ │  - 1 primary (write)                │ │
│ │  - 2 read replica                   │ │
│ │  - WAL archive to object store      │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│ │ Redis   │  │ Kafka   │  │ MinIO   │  │
│ │ cluster │  │ 3 broker│  │         │  │
│ └─────────┘  └─────────┘  └─────────┘  │
└────────────────────────────────────────┘
           │ Async replicate
           ▼
┌────────────────────────────────────────┐
│ VN region (Secondary / DR)             │
│  - Warm standby                        │
│  - PG streaming replica                │
│  - Object store cross-region replica   │
└────────────────────────────────────────┘
```

### 5.2. Option B — ECS / Nomad / VM

Nếu team chưa sẵn sàng K8s, bắt đầu với:

- **AWS ECS Fargate** — serverless container, đơn giản.
- **Docker Compose trên VM** — dev/stg phù hợp, prod không scale tốt.

### 5.3. VN cloud provider

- **Viettel IDC Cloud**, **VNG Cloud**, **CMC Cloud**, **FPT Cloud** — compliant NĐ 13.
- **AWS Singapore / AWS HCM** — latency chấp nhận được, có Direct Connect.

## 6. Multi-region strategy

**Khuyến nghị active-passive VN**:

- **Primary**: HCM (hoặc HN).
- **DR (warm standby)**: region khác, đồng bộ liên tục.
- **Failover**: DNS health check + manual promote replica thành primary.

**Không dùng active-active** vì:

- Conflict resolution với row-level data phức tạp.
- Không cần thiết cho SLA 99.5%.

## 7. Database operations

### 7.1. PostgreSQL

| Thông số | Giá trị |
|----------|---------|
| Version | 15+ |
| Primary | 1 (write) |
| Read replica | 2 (hot standby) |
| Connection pool | PgBouncer hoặc RDS Proxy |
| Backup | Daily pg_basebackup + WAL archive |
| PITR window | 7 ngày |
| Maintenance | Weekly VACUUM FULL (off-peak) |

### 7.2. Backup strategy

- **Full backup**: daily 2h sáng → object store, GPG encrypted.
- **Incremental**: WAL archive mỗi 5 phút.
- **Test restore**: monthly (bắt buộc — backup không test = không có backup).
- **Retention**: 30 ngày online, 1 năm cold (Glacier / BackBlaze B2).

### 7.3. Connection pool

```
App → PgBouncer (transaction pool) → Postgres
```

Tiết kiệm connection cho Postgres (mỗi connection tốn ~10MB RAM).

## 8. Redis

Vai trò:

1. **Cache**: product list, permission, menu.
2. **Session** (nếu BE dùng session thay JWT).
3. **Queue**: Bull / BullMQ cho background job.
4. **Rate limit**: token bucket.
5. **Pub/Sub**: websocket notification.

Config:

- Persistence: AOF everysec.
- Cluster: 3 master + 3 replica (production).
- Eviction: `allkeys-lru` cho cache-only DB.

## 9. Object storage

Dùng cho:

- Ảnh sản phẩm (user upload).
- File đính kèm (hợp đồng, hoá đơn scan).
- Report export (.xlsx, .pdf).
- Backup database.

**S3-compatible** options:

- AWS S3 / GCP Cloud Storage
- MinIO (self-host)
- Backblaze B2 (rẻ)
- CloudFlare R2 (không egress fee)

Kết hợp CDN signed URL cho tải ảnh public.

## 10. Scaling

### 10.1. Horizontal (stateless service)

- HPA Kubernetes theo CPU + custom metric (requests/sec).
- Min 2 pod, max 20 pod.
- **Không giữ state trong memory** — dùng Redis.

### 10.2. Vertical (database)

- Scale instance up: 4c8g → 8c16g → 16c32g → ...
- Khi vượt 32c64g → cân nhắc sharding / Citus.

### 10.3. Read scaling

- Read replica cho report-heavy query.
- Route read query qua replica bằng connection string riêng.

## 11. Monitoring & alerting

### 11.1. Stack khuyến nghị

```
Metric       →  Prometheus + Grafana
Log          →  Loki (hoặc ELK)
Trace        →  Tempo / Jaeger
APM          →  OpenTelemetry
Uptime       →  Blackbox Exporter + UptimeRobot external
Alert        →  Alertmanager → Slack / Telegram / PagerDuty
```

### 11.2. SLO / SLI

| SLO | Target |
|-----|--------|
| API availability | 99.5% (3.6h downtime/month) |
| P95 latency | ≤ 500ms |
| Error rate | ≤ 0.5% |

### 11.3. Alert example

```
- alert: HighErrorRate
  expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Error rate > 5% trong 5 phút"
```

## 12. Disaster Recovery

### 12.1. RTO / RPO target

| Metric | Target |
|--------|--------|
| **RTO** (Recovery Time Objective) | 4 giờ |
| **RPO** (Recovery Point Objective) | 1 giờ |

### 12.2. DR runbook

1. **Detect**: monitoring alert primary down > 5 phút.
2. **Decide**: on-call + CTO quyết định failover (có thể cần 15 phút).
3. **Execute**:
   - Promote PG replica → primary.
   - Update DNS (TTL = 60s).
   - Điều chuyển traffic.
4. **Verify**: smoke test endpoint chính.
5. **Communicate**: status page + email khách.
6. **Post-mortem**: trong 72h.

### 12.3. DR test

Quarterly (mỗi quý) — tập trận trên staging.

## 13. Cost optimization

| Kỹ thuật | Tiết kiệm |
|----------|-----------|
| Reserved instance (1-3 năm) | 30-60% |
| Right-sizing (giảm CPU/RAM thừa) | 20-40% |
| Spot instance cho batch job | 60-80% |
| Cold storage cho backup cũ | 80% |
| CDN R2 / BunnyCDN | Free egress |
| Shutdown dev/stg ngoài giờ | 50% |
| Gzip/Brotli bundle | 70% bandwidth |

## 14. On-call & incident

- **Rotation**: weekly, ít nhất 2 người.
- **Tools**: PagerDuty / OpsGenie.
- **SLA response**: P1 15 phút, P2 1 giờ, P3 1 ngày.
- **Runbook**: mỗi alert phải có link tới runbook "làm gì khi gặp alert này".

## 15. Deployment checklist

- [ ] CI pipeline pass.
- [ ] DB migration applied (staging).
- [ ] Smoke test staging pass.
- [ ] Release note.
- [ ] Feature flag set.
- [ ] Rollback plan.
- [ ] On-call notified.
- [ ] Monitoring dashboard ready.
- [ ] Customer notice (nếu maintenance window).

## Tham chiếu

- Files:
  - `vite.config.ts` (base `/crm/`)
  - `package.json` (build script)
- [Part 08 — Backend](part-08-backend-architecture.md)
- [Part 11 — Cross-cutting](part-11-cross-cutting.md)
- [Part 14 — Quality & Risks](part-14-quality-risks.md)

---
*Hết Part 12. Xem tiếp [Part 13 — ADR](part-13-adr.md).*
