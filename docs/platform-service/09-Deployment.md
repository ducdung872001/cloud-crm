# 09 — Deployment & Infrastructure

## 9.1. Tech stack

> **Stack đồng nhất với `cloud-sales-master`** (microservice tham chiếu của Reborn). Mọi version + library lock theo đó.

| Layer | Choice | Version | Ghi chú |
|---|---|---|---|
| Runtime | Java (Eclipse Temurin / Amazon Corretto) | **21 LTS** | Match cloud-sales-master |
| Framework | Spring Boot | **3.2.3** | Match cloud-sales-master |
| Build | **Maven** | 3.9+ | KHÔNG Gradle — đồng nhất Reborn |
| Group ID | `vn.reborn.platform` | — | **Giữ namespace `vn.reborn`** (KHÁC `vn.lena` của cloud-sales) |
| Data layer | spring-boot-starter-data-jdbc + **jOOQ** + spring-jdbc | jOOQ 3.18.6 | Match cloud-sales — KHÔNG JPA/Hibernate |
| Connection pool | HikariCP | 5.1.0 | |
| DB driver | mysql-connector-j | 8.0.33 | |
| DB | MySQL | 8.0+ | Đồng nhất services khác |
| Mapping | MapStruct | 1.4.2.Final | |
| Boilerplate | Lombok | 1.18.34 | |
| JSON | Gson | 2.8.2 | (Jackson cho REST controller) |
| Logging | Logback | 1.4.14 | |
| Cache | Caffeine + Redis (Spring Data Redis) | latest | L1 in-memory + L2 distributed |
| Migration | **Flyway** | 9.x | Versioned SQL migration |
| Messaging | spring-kafka | (theo Spring Boot BOM) | Outbox + event |
| Reactive | rxjava3 | (nếu cần) | Match cloud-sales |
| Env loader | springboot3-dotenv (`me.paulschwarz`) | latest | `.env` file local dev |
| Object storage | aws-java-sdk-s3 | latest | Hoặc Cloudflare R2 (S3-compatible) |
| HTTP client | unirest-java (hoặc Spring `RestClient`) | — | Khi gọi Identity/Org service |
| Test | spring-boot-starter-test (JUnit 5) + javafaker | — | |
| Container | Docker (multi-stage Maven build) | — | |
| Orchestrator | Kubernetes | 1.28+ | Reborn cluster đã có |
| API Gateway | nginx ingress | — | KHÔNG Spring Cloud Gateway (đơn giản) |
| Service mesh | (none MVP) | — | Có thể Istio sau |
| CI/CD | GitHub Actions | — | |
| Secrets | K8s Secret + Sealed Secrets | — | Encrypted at rest |
| TLS | cert-manager + Let's Encrypt | — | Auto-renew |
| Monitoring | Prometheus + Grafana + Loki | — | Self-hosted |
| Tracing | OpenTelemetry → Tempo/Jaeger | — | |
| Error tracking | Sentry | optional | |
| Internal lib | `vn.lena.entity-share` (nếu reuse được) | latest | Cross-namespace lib từ cloud-sales — chỉ dùng khi data shape phù hợp |

**Quyết định lớn**: dùng **spring-data-jdbc + jOOQ** (KHÔNG JPA) để match cloud-sales-master. Hệ quả:
- Repository viết kiểu `JdbcTemplate` + jOOQ DSL (type-safe SQL)
- KHÔNG có `@Entity`, `@OneToMany` lazy loading — phải explicit join trong query
- Migration: vẫn Flyway. Code-gen jOOQ types từ DDL trong build phase.
- Outbox publisher: dùng Spring Kafka producer + scheduled task

## 9.2. Repository layout

> Multi-module Maven, follow cloud-sales-master pattern (parent pom + sub-modules).

```
reborn-platform-backend/     ← repo BE git riêng, parent project
├── pom.xml                        ← parent pom (Spring Boot 3.2.3, Java 21)
├── README.md
├── docker/
│   ├── Dockerfile                 ← multi-stage Maven build
│   └── docker-compose.dev.yml
├── deploy/
│   ├── helm/                      ← K8s helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── values-staging.yaml
│   │   ├── values-prod.yaml
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── ingress.yaml
│   │       ├── hpa.yaml
│   │       ├── configmap.yaml
│   │       └── secret-sealed.yaml
│   └── nginx/
│       └── legacy-proxy.conf      ← reverse-proxy cho backward compat
├── platform-entity/               ← shared module: DTO + jOOQ generated types
│   ├── pom.xml
│   └── src/main/
│       ├── java/vn/reborn/platform/entity/    ← DTO, request/response shapes
│       └── jooq-generated/                  ← auto-gen từ DDL Flyway
├── platform-service/                ← main service module
│   ├── pom.xml
│   └── src/main/
│       ├── java/vn/reborn/platform/
│       │   ├── PlatformApplication.java
│       │   ├── config/            ← Security, jOOQ, Kafka, Redis config
│       │   ├── tenant/            ← Bounded context tenant
│       │   │   ├── domain/        ← Aggregate + DomainEvent
│       │   │   ├── application/   ← Service + UseCase
│       │   │   ├── infrastructure/ ← Repo (jOOQ DSL) + ExternalClient
│       │   │   └── interfaces/    ← REST controller
│       │   ├── pkg/               ← package (avoid Java 'package' keyword)
│       │   ├── catalog/           ← industry, area, module, resource
│       │   ├── storage/           ← file_metadata
│       │   ├── help/              ← help_video, help_article
│       │   ├── signup/            ← signup_request (Phase 5)
│       │   ├── outbox/            ← outbox publisher
│       │   ├── audit/             ← entity_event_log
│       │   └── shared/            ← cross-cutting (error, util)
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           ├── application-staging.yml
│           ├── application-prod.yml
│           └── db/migration/      ← Flyway scripts V001-V016
├── platform-service/src/test/       ← unit + integration test
├── e2e/                           ← Postman/Newman e2e
└── docs/                          ← link sang docs/platform-service/ (symlink)
```

### Sample parent `pom.xml` (root)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>
    <groupId>vn.reborn</groupId>
    <artifactId>reborn-platform-backend</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>platform-entity</module>
        <module>platform-service</module>
    </modules>

    <properties>
        <java.version>21</java.version>
        <jooq.version>3.18.6</jooq.version>
        <hikaricp.version>5.1.0</hikaricp.version>
        <mapstruct.version>1.4.2.Final</mapstruct.version>
        <mysql.version>8.0.33</mysql.version>
        <lombok.version>1.18.34</lombok.version>
        <gson.version>2.8.2</gson.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Lombok, MapStruct, jOOQ, HikariCP, MySQL, Gson — version pinned -->
        </dependencies>
    </dependencyManagement>
</project>
```

→ Cấu trúc và version chính xác match `cloud-sales-master/pom.xml`. Khi implement, copy parent pom + thay artifactId.

## 9.3. Environment

### Local dev

- Docker Compose: MySQL + Redis + Kafka + Wiremock (cho Identity/Org)
- App chạy trong IDE (debug) hoặc `./mvnw spring-boot:run -pl platform-service`
- Port: 8090
- DB: `platform_local` (user `platform_local` / pass random)
- Migration: Flyway auto-run khi start
- Env: `.env` ở root, load qua `springboot3-dotenv`

```bash
# docker-compose.dev.yml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: platform_local
      MYSQL_USER: platform_local
      MYSQL_PASSWORD: localpass
      MYSQL_ROOT_PASSWORD: rootpass
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci --default-time-zone='+00:00'
    ports: ["3307:3306"]
    volumes: ["mysql_data:/var/lib/mysql"]
  redis:
    image: redis:7
    ports: ["6380:6379"]
  kafka:
    image: confluentinc/cp-kafka:7.5
    # ...
  wiremock-identity:
    image: wiremock/wiremock:3
    ports: ["8081:8080"]
    volumes: ["./wiremock/identity:/home/wiremock"]
```

### Staging

- K8s cluster: `reborn-cluster-staging`
- DB: `prod_platformdb_staging` (clone từ prod weekly)
- Domain: `platform-staging.reborn.vn`
- Replicas: 1
- Auto-deploy: mỗi merge vào `main` branch

### Production

- K8s cluster: `reborn-cluster-prod`
- DB: `prod_platformdb` (đã có)
- Domain: `platform.reborn.vn`
- Replicas: 2 minimum, HPA tới 20
- Deploy: manual approve sau khi staging OK 24h

## 9.4. K8s manifests (excerpt)

```yaml
# deploy/helm/templates/deployment.yaml (simplified)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: platform-service
spec:
  replicas: {{ .Values.replicas }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: app
        image: registry.reborn.vn/platform-service:{{ .Values.image.tag }}
        ports: [{ containerPort: 8090 }]
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: {{ .Values.env }}
        - name: DB_URL
          valueFrom:
            secretKeyRef: { name: platform-db, key: url }
        # ... more env from sealed secret
        resources:
          requests: { cpu: 500m, memory: 1Gi }
          limits:   { cpu: 2,    memory: 2Gi }
        livenessProbe:
          httpGet: { path: /health/live, port: 8090 }
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet: { path: /health/ready, port: 8090 }
          periodSeconds: 5
```

```yaml
# deploy/helm/templates/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: platform-service }
spec:
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
  - type: Resource
    resource: { name: memory, target: { type: Utilization, averageUtilization: 80 } }
```

## 9.5. CI/CD pipeline (GitHub Actions)

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD

on:
  push: { branches: [main, develop, 'feature/**'] }
  pull_request: { branches: [main, develop] }

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env: { MYSQL_ROOT_PASSWORD: test, MYSQL_DATABASE: platform_test }
        ports: ['3306:3306']
        options: >-
          --health-cmd="mysqladmin ping -h localhost"
          --health-interval=10s --health-timeout=5s --health-retries=10
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with: { java-version: 21, distribution: temurin }
    - uses: actions/cache@v4
      with: { path: ~/.m2/repository, key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }} }
    - run: ./mvnw -B verify                # unit + integration test
    - run: ./mvnw -B jacoco:report
    - uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: aquasecurity/trivy-action@master
      with: { scan-type: 'fs', severity: 'CRITICAL,HIGH' }

  build-image:
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/heads/feature/')
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with: { java-version: 21, distribution: temurin }
    - run: ./mvnw -B -DskipTests package
    - uses: docker/build-push-action@v5
      with:
        push: true
        context: .
        file: docker/Dockerfile
        tags: registry.reborn.vn/platform-service:${{ github.sha }}

  deploy-staging:
    needs: build-image
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - uses: actions/checkout@v4
    - name: Helm upgrade staging
      run: |
        helm upgrade platform-service deploy/helm \
          -f deploy/helm/values-staging.yaml \
          --set image.tag=${{ github.sha }} \
          --kube-context staging

  deploy-prod:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production         # GitHub env requires manual approval
    steps:
    - uses: actions/checkout@v4
    - name: Helm upgrade production
      run: |
        helm upgrade platform-service deploy/helm \
          -f deploy/helm/values-prod.yaml \
          --set image.tag=${{ github.sha }} \
          --kube-context prod
```

Manual approve gate cho prod (GitHub Environment protection rule).

## 9.6. Database migration strategy

- Flyway scripts version-controlled trong `src/main/resources/db/migration/`
- App start tự run pending migration (qua Spring Boot auto-config)
- Migration phải **backward compatible** trong rolling deploy:
  - **OK**: ADD COLUMN nullable, ADD INDEX CONCURRENTLY, CREATE TABLE
  - **NOT OK**: DROP COLUMN, RENAME COLUMN, NOT NULL trên column có data
  - Pattern cho breaking change: 2-step deploy (V100 add new + dual-write code → V101 drop old)
- Production migration: review trước, approve manual

## 9.7. Configuration management

12-factor: tất cả config qua env var. Spring profile chọn `application-{env}.yaml`. Sample:

```yaml
# application-prod.yaml
server:
  port: 8090
  
spring:
  datasource:
    url: ${DB_URL}                           # jdbc:mysql://prod-db:3306/prod_platformdb?serverTimezone=UTC&useSSL=true&characterEncoding=utf8mb4
    username: ${DB_USER}
    password: ${DB_PASS}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 5000
  jooq:
    sql-dialect: MYSQL
  flyway:
    enabled: true
    locations: classpath:db/migration
  data:
    redis:
      host: ${REDIS_HOST}
      port: 6379
  kafka:
    bootstrap-servers: ${KAFKA_BROKERS}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

platform:
  identity:
    base-url: https://auth.reborn.vn
    jwks-uri: ${platform.identity.base-url}/.well-known/jwks.json
    cache-ttl: PT1H
  org:
    base-url: https://org.reborn.vn
  s3:
    endpoint: ${S3_ENDPOINT}
    bucket-public: platform-public
    bucket-private: platform-private
    access-key: ${S3_ACCESS_KEY}
    secret-key: ${S3_SECRET_KEY}

management:
  endpoints.web.exposure.include: health,info,metrics,prometheus
  endpoint.health.show-details: when-authorized
```

## 9.8. Secret management

Sensitive (không commit code):
- DB password
- S3 access/secret key
- Identity service-account credentials
- JWT signing key (nếu Platform tự sign cho service-to-service)
- Kafka SASL credentials
- Sentry DSN

Lưu trong K8s Secret, encrypted-at-rest qua Sealed Secrets:

```bash
# Generate sealed secret
echo -n "secret-value" | kubectl create secret generic platform-db \
  --from-file=password=/dev/stdin --dry-run=client -o yaml | \
  kubeseal --controller-namespace=kube-system -o yaml > deploy/helm/templates/secret-sealed.yaml
```

Rotate quarterly.

## 9.9. Networking

```
Internet
  ↓
Cloudflare (WAF + DDoS) 
  ↓
nginx ingress (TLS termination)
  ↓
Service: platform-service (ClusterIP)
  ↓
Pods (2-20 replicas)
  ↓ ↓
DB primary    Redis cluster   Kafka cluster   S3
  ↓
DB standby (sync)
  ↓
DB replica (async, read-only)
```

Internal traffic (CRM/BPM gọi Platform): qua internal LB `platform.internal:8090`, không đi qua Cloudflare → giảm latency.

## 9.10. Observability stack

| Tool | Purpose | URL nội bộ |
|---|---|---|
| Prometheus | Metric scrape | `prometheus.internal` |
| Grafana | Dashboard | `grafana.reborn.vn` |
| Loki | Log aggregation | qua Grafana datasource |
| Tempo | Distributed tracing | qua Grafana datasource |
| Sentry | Error tracking + alerting | `sentry.reborn.vn` |
| Alertmanager | Alert routing | trong Prometheus stack |
| Uptime Kuma | External uptime check | `status.reborn.vn` (public) |

Dashboards Grafana cần build:
- Platform Overview: req/s, latency P50/P95/P99, error rate, CPU/mem
- DB metrics: connections, query duration, replication lag
- Outbox: events pending, publish lag
- Identity dependency: call count, failure rate, cache hit rate

## 9.11. Backup & restore drill

- Daily logical backup (`mysqldump --single-transaction`) → S3 lifecycle (30 ngày warm, 12 tháng cold)
- Binary log archive every 5 min → cho point-in-time recovery (PITR)
- Quarterly drill: restore snapshot lên DR cluster, run smoke test, document RTO actual

```bash
# Sample restore
gunzip -c /backup/prod_platformdb_20260501.sql.gz | \
  mysql -h dr-db.internal -u platform_admin -p platform_dr_test
# Apply binlog for PITR
mysqlbinlog --start-datetime="2026-05-01 00:00:00" \
            --stop-datetime="2026-05-01 03:00:00" \
            /backup/binlog/mysql-bin.* | mysql -h dr-db.internal -u platform_admin -p
```

## 9.12. Onboarding new dev (local setup)

1. Clone repo `reborn-platform-backend`
2. Cài JDK 21 + Maven 3.9+ (nếu chưa có)
3. `docker compose -f docker/docker-compose.dev.yml up -d` (MySQL + Redis + Kafka + Wiremock)
4. Copy `.env.example` → `.env`, fill local config
5. `./mvnw clean install -DskipTests` (build platform-entity + platform-service)
6. `./mvnw spring-boot:run -pl platform-service` → service chạy ở `:8090`
7. `curl http://localhost:8090/health/ready` → 200 OK
8. Postman collection: `e2e/Postman/Cloud-Platform.postman_collection.json` import sẵn

Tổng thời gian: **~30 phút** (giả định Java 21 + Maven + Docker đã có).

## 9.13. Versioning & Release

- SemVer: `MAJOR.MINOR.PATCH`
- Tag git: `v1.0.0`, `v1.0.1`, `v1.1.0`
- Changelog: `CHANGELOG.md` + GitHub Release notes
- API version path-prefix `/api/v1` — bump v2 khi breaking
