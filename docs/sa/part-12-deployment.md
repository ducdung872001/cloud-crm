# Part 12 — Deployment Architecture

> Mô tả các môi trường triển khai, CI/CD pipeline, Docker containerization,
> chiến lược scaling, và disaster recovery cho hệ thống Reborn CRM.

---

## 1. Environments

### 1.1. Tổng quan

| Môi trường  | URL                          | Mục đích                    | Data          |
|------------|------------------------------|-----------------------------|---------------|
| Dev        | localhost:5173 / :8080       | Developer local              | Seed data     |
| Staging    | staging.reborn.vn            | QA testing, UAT              | Anonymized    |
| Production | *.reborn.vn                  | End-user thực tế             | Real data     |

### 1.2. Dev Environment

- Frontend: `npm run dev` → Vite dev server port 5173
- Backend: Spring Boot chạy từng service hoặc Docker Compose
- Database: MySQL 8.0 local hoặc Docker
- Redis + RabbitMQ: Docker container

### 1.3. Staging

- Mirror production về infrastructure
- Data anonymized từ production (tên, email, SĐT được mask)
- Auto-deploy khi merge vào branch `develop`
- Reset data hàng tuần (Sunday 2:00 AM)

### 1.4. Production

- Multi-tenant SaaS, mỗi tenant truy cập qua subdomain: `{tenant}.reborn.vn`
- SSL certificate wildcard: `*.reborn.vn`
- CDN: Cloudflare cho static assets
- Monitoring: Uptime check mỗi 60s

---

## 2. CI/CD Pipeline

### 2.1. GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml (simplified)
name: CI/CD Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [main]

jobs:
  build-test:
    steps:
      - checkout
      - setup-java-17
      - setup-node-18
      - run: mvn clean test           # Backend unit test
      - run: npm ci && npm run build   # Frontend build
      - run: npm run test              # Frontend test

  deploy-staging:
    needs: build-test
    if: github.ref == 'refs/heads/develop'
    steps:
      - docker-build & push to registry
      - ssh deploy to staging server

  deploy-production:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    steps:
      - docker-build & push to registry
      - blue-green deploy to production
```

### 2.2. Pipeline Stages

```
Code Push → Lint → Unit Test → Build → Docker Image → Push Registry
  → Deploy Staging (auto) → Smoke Test → Deploy Production (manual approve)
```

| Stage           | Tool              | Thời gian | Gate           |
|----------------|-------------------|-----------|----------------|
| Lint           | ESLint + Checkstyle| ~1 min   | Block on error |
| Unit Test      | JUnit + Vitest    | ~3 min    | >80% coverage  |
| Build          | Maven + Vite      | ~5 min    | Build success  |
| Docker Build   | Docker Buildx     | ~3 min    | Image scan OK  |
| Deploy Staging | Docker Compose    | ~2 min    | Auto           |
| Smoke Test     | Playwright        | ~5 min    | All pass       |
| Deploy Prod    | Blue-green        | ~5 min    | Manual approve |

---

## 3. Docker Containerization

### 3.1. Service Containers (12 microservices)

| # | Service              | Port  | Image Size | Memory  |
|---|---------------------|-------|------------|---------|
| 1 | crm-service         | 8081  | ~180MB     | 512MB   |
| 2 | hr-service          | 8082  | ~160MB     | 512MB   |
| 3 | tax-service         | 8083  | ~150MB     | 512MB   |
| 4 | inventory-service   | 8084  | ~140MB     | 384MB   |
| 5 | accounting-service  | 8085  | ~160MB     | 512MB   |
| 6 | auth-service        | 8086  | ~120MB     | 384MB   |
| 7 | notification-service| 8087  | ~100MB     | 256MB   |
| 8 | report-service      | 8088  | ~150MB     | 512MB   |
| 9 | bpm-service         | 8089  | ~130MB     | 384MB   |
|10 | file-service        | 8090  | ~110MB     | 256MB   |
|11 | scheduler-service   | 8091  | ~100MB     | 256MB   |
|12 | frontend (Nginx)    | 80    | ~30MB      | 128MB   |

### 3.2. Infrastructure Containers

| Service    | Port  | Purpose                    | Memory  |
|-----------|-------|----------------------------|---------|
| MySQL 8.0 | 3306  | Primary database           | 2GB     |
| Redis 7   | 6379  | Cache + session            | 512MB   |
| RabbitMQ  | 5672  | Message queue              | 512MB   |
| Nginx     | 443   | Reverse proxy + SSL        | 128MB   |

### 3.3. Docker Compose (dev/staging)

```yaml
services:
  crm-service:
    image: reborn/crm-service:${TAG}
    environment:
      - SPRING_PROFILES_ACTIVE=staging
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      mysql: { condition: service_healthy }
      redis: { condition: service_started }
    deploy:
      resources:
        limits: { memory: 512M }
```

---

## 4. Scaling Strategy

### 4.1. Horizontal Scaling (Stateless Services)

- Tất cả 12 microservice là **stateless** — không lưu session local
- Session lưu trong Redis → bất kỳ instance nào cũng xử lý được
- Load balancer (Nginx) phân phối request round-robin
- Scale rule: CPU > 70% trong 5 phút → thêm 1 instance (max 4)

### 4.2. Vertical Scaling (Database)

- MySQL: tăng RAM/CPU khi query slow > 2s
- Redis: tăng RAM khi eviction rate > 5%
- Không shard MySQL — single-instance với read replica

### 4.3. Performance Targets

| Metric                | Target     | Current    |
|----------------------|------------|------------|
| API p95 latency      | < 500ms    | ~350ms     |
| Page load (FCP)      | < 2s       | ~1.8s      |
| Concurrent users     | 500        | ~200       |
| Uptime               | 99.5%      | 99.2%      |

---

## 5. Blue-Green Deployment

### 5.1. Flow

```
1. Production đang chạy trên "Blue" (v1.2.0)
2. Deploy "Green" (v1.3.0) song song
3. Smoke test Green qua internal URL
4. Switch Nginx upstream từ Blue → Green
5. Monitor 15 phút
6. Nếu OK → remove Blue containers
7. Nếu lỗi → rollback: switch Nginx về Blue (< 30s)
```

### 5.2. Database Migration

- Flyway migration chạy **trước** khi deploy Green
- Migration phải backward-compatible (Blue vẫn đọc được)
- Không xóa column trong cùng release — deprecate trước, xóa release sau

---

## 6. Disaster Recovery

### 6.1. Backup Strategy

| Data          | Method              | Frequency    | Retention |
|--------------|---------------------|-------------|-----------|
| MySQL        | mysqldump + binlog  | Daily full   | 30 ngày   |
| Redis        | RDB snapshot        | Mỗi 6h       | 7 ngày    |
| File storage | rsync to backup     | Daily        | 90 ngày   |
| Config/Secret| Git + Vault         | On change    | Unlimited |

### 6.2. RTO / RPO Targets

| Metric | Target   | Mô tả                                    |
|--------|----------|------------------------------------------|
| RPO    | 1 giờ    | Mất tối đa 1 giờ dữ liệu                  |
| RTO    | 4 giờ    | Phục hồi hệ thống trong 4 giờ             |

### 6.3. Recovery Procedure

1. **Database:** Restore từ backup mới nhất + replay binlog
2. **Services:** Re-deploy từ Docker registry (image đã lưu)
3. **Config:** Restore từ Git repository
4. **DNS:** Chuyển sang backup server nếu primary down

---

## 7. Tổng kết

| Khía cạnh       | Giải pháp                              |
|----------------|----------------------------------------|
| Environments   | Dev → Staging → Production             |
| CI/CD          | GitHub Actions, ~20 phút full pipeline |
| Container      | Docker, 12 services + 4 infra         |
| Scaling        | Horizontal (services), Vertical (DB)  |
| Zero-downtime  | Blue-green deployment                  |
| DR             | Daily backup, RPO 1h, RTO 4h          |
