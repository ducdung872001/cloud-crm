# Part 12 — Deployment Architecture

> Mo ta cac moi truong trien khai, CI/CD pipeline, Docker containerization,
> chien luoc scaling, va disaster recovery cho he thong Reborn CRM.

---

## 1. Environments

### 1.1. Tong quan

| Moi truong  | URL                          | Muc dich                    | Data          |
|------------|------------------------------|-----------------------------|---------------|
| Dev        | localhost:5173 / :8080       | Developer local              | Seed data     |
| Staging    | staging.reborn.vn            | QA testing, UAT              | Anonymized    |
| Production | *.reborn.vn                  | End-user thuc te             | Real data     |

### 1.2. Dev Environment

- Frontend: `npm run dev` → Vite dev server port 5173
- Backend: Spring Boot chay tung service hoac Docker Compose
- Database: MySQL 8.0 local hoac Docker
- Redis + RabbitMQ: Docker container

### 1.3. Staging

- Mirror production ve infrastructure
- Data anonymized tu production (ten, email, SDT duoc mask)
- Auto-deploy khi merge vao branch `develop`
- Reset data hang tuan (Sunday 2:00 AM)

### 1.4. Production

- Multi-tenant SaaS, moi tenant truy cap qua subdomain: `{tenant}.reborn.vn`
- SSL certificate wildcard: `*.reborn.vn`
- CDN: Cloudflare cho static assets
- Monitoring: Uptime check moi 60s

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

| Stage           | Tool              | Thoi gian | Gate           |
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

- Tat ca 12 microservice la **stateless** — khong luu session local
- Session luu trong Redis → bat ky instance nao cung xu ly duoc
- Load balancer (Nginx) phan phoi request round-robin
- Scale rule: CPU > 70% trong 5 phut → them 1 instance (max 4)

### 4.2. Vertical Scaling (Database)

- MySQL: tang RAM/CPU khi query slow > 2s
- Redis: tang RAM khi eviction rate > 5%
- Khong shard MySQL — single-instance voi read replica

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
1. Production dang chay tren "Blue" (v1.2.0)
2. Deploy "Green" (v1.3.0) song song
3. Smoke test Green qua internal URL
4. Switch Nginx upstream tu Blue → Green
5. Monitor 15 phut
6. Neu OK → remove Blue containers
7. Neu loi → rollback: switch Nginx ve Blue (< 30s)
```

### 5.2. Database Migration

- Flyway migration chay **truoc** khi deploy Green
- Migration phai backward-compatible (Blue van doc duoc)
- Khong xoa column trong cung release — deprecate truoc, xoa release sau

---

## 6. Disaster Recovery

### 6.1. Backup Strategy

| Data          | Method              | Frequency    | Retention |
|--------------|---------------------|-------------|-----------|
| MySQL        | mysqldump + binlog  | Daily full   | 30 ngay   |
| Redis        | RDB snapshot        | Moi 6h       | 7 ngay    |
| File storage | rsync to backup     | Daily        | 90 ngay   |
| Config/Secret| Git + Vault         | On change    | Unlimited |

### 6.2. RTO / RPO Targets

| Metric | Target   | Mo ta                                    |
|--------|----------|------------------------------------------|
| RPO    | 1 gio    | Mat toi da 1 gio du lieu                  |
| RTO    | 4 gio    | Phuc hoi he thong trong 4 gio             |

### 6.3. Recovery Procedure

1. **Database:** Restore tu backup moi nhat + replay binlog
2. **Services:** Re-deploy tu Docker registry (image da luu)
3. **Config:** Restore tu Git repository
4. **DNS:** Chuyen sang backup server neu primary down

---

## 7. Tong ket

| Khia canh       | Giai phap                              |
|----------------|----------------------------------------|
| Environments   | Dev → Staging → Production             |
| CI/CD          | GitHub Actions, ~20 phut full pipeline |
| Container      | Docker, 12 services + 4 infra         |
| Scaling        | Horizontal (services), Vertical (DB)  |
| Zero-downtime  | Blue-green deployment                  |
| DR             | Daily backup, RPO 1h, RTO 4h          |
