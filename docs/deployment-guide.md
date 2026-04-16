# Deployment Guide — Reborn Retail CRM

> Huong dan trien khai he thong CRM quan ly chuoi cua hang ban le.
> Phien ban: 2.x | Cap nhat: 2026-04-16

---

## Muc luc

1. [Yeu cau he thong](#1-yeu-cau-he-thong)
2. [Bien moi truong](#2-bien-moi-truong)
3. [Build Frontend](#3-build-frontend)
4. [Backend — 12 Microservices](#4-backend--12-microservices)
5. [Co so du lieu](#5-co-so-du-lieu)
6. [Nginx Reverse Proxy](#6-nginx-reverse-proxy)
7. [SSL / HTTPS](#7-ssl--https)
8. [Docker Compose](#8-docker-compose)
9. [Health Checks](#9-health-checks)
10. [Rollback](#10-rollback)
11. [CI/CD — GitHub Actions](#11-cicd--github-actions)

---

## 1. Yeu cau he thong

| Thanh phan | Phien ban toi thieu | Ghi chu |
|---|---|---|
| Node.js | 18 LTS | Dung de build frontend (Vite) |
| Java | 17+ (OpenJDK / Corretto) | Spring Boot 3.x |
| MySQL | 8.0+ | InnoDB, utf8mb4_unicode_ci |
| Redis | 7.0+ | Cache, session, pub/sub |
| RabbitMQ | 3.12+ | Message queue giua cac service |
| Nginx | 1.24+ | Reverse proxy, static files |
| Docker | 24+ | Tuy chon, khuyen dung |
| Docker Compose | 2.20+ | Tuy chon, khuyen dung |

**Tai nguyen toi thieu (production):**

- CPU: 8 vCPU
- RAM: 16 GB
- Disk: 100 GB SSD
- Bandwidth: 100 Mbps

---

## 2. Bien moi truong

Tao file `.env` hoac dat trong he thong CI/CD:

```bash
# ===== API URLs =====
APP_API_URL=https://api.retailcrm.reborn.vn
APP_BIZ_URL=https://biz.retailcrm.reborn.vn
APP_AUTHENTICATOR_URL=https://auth.retailcrm.reborn.vn
APP_BPM_URL=https://bpm.retailcrm.reborn.vn
APP_DOMAIN=retailcrm.reborn.vn

# ===== Firebase (Push Notification) =====
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=reborn-retail.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=reborn-retail
VITE_FIREBASE_STORAGE_BUCKET=reborn-retail.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXX

# ===== Database =====
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=reborn_retail_crm
DB_USERNAME=crm_user
DB_PASSWORD=<mat-khau-manh>

# ===== Redis =====
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=<mat-khau-redis>

# ===== RabbitMQ =====
RABBITMQ_HOST=127.0.0.1
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=crm_rabbit
RABBITMQ_PASSWORD=<mat-khau-rabbit>

# ===== JWT =====
JWT_SECRET=<chuoi-bi-mat-256-bit>
JWT_EXPIRATION=86400
```

> **Luu y bao mat:** Khong commit file `.env` len repository. Su dung secrets manager (Vault, AWS Secrets Manager) cho moi truong production.

---

## 3. Build Frontend

```bash
# 1. Cai dat dependencies
npm install

# 2. Build production
npm run build:prod

# 3. Ket qua output tai thu muc dist/
ls -la dist/
```

Thu muc `dist/` chua cac file static (HTML, JS, CSS) san sang deploy len Nginx hoac CDN.

**Kiem tra build thanh cong:**

```bash
# Kich thuoc bundle khong nen vuot qua 5 MB (gzip)
du -sh dist/
```

---

## 4. Backend — 12 Microservices

He thong backend gom 12 Spring Boot microservices:

| # | Service | Mo ta | Port mac dinh |
|---|---|---|---|
| 1 | **auth** | Xac thuc, phan quyen, JWT | 8080 |
| 2 | **sales** | Don hang, bao gia, hoa don ban | 8081 |
| 3 | **inventory** | Ton kho, nhap xuat, kiem ke | 8082 |
| 4 | **billing** | Thanh toan, cong no, phieu thu/chi | 8083 |
| 5 | **market** | Marketing, khuyen mai, voucher | 8084 |
| 6 | **customer** | Khach hang, nhom KH, the thanh vien | 8085 |
| 7 | **notification** | Thong bao, email, SMS, push | 8086 |
| 8 | **integration** | Tich hop ben thu 3 (POS, ERP, ecom) | 8087 |
| 9 | **care** | Cham soc khach hang, ticket, CSKH | 8088 |
| 10 | **logistics** | Van chuyen, giao hang, doi tac VC | 8089 |
| 11 | **finance** | Tai chinh, bao cao, so sach ke toan | 8090 |
| 12 | **operation** | Van hanh cua hang, ca lam, nhan su | 8091 |

### Khoi dong tung service

```bash
cd services/<ten-service>
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

### Build JAR

```bash
cd services/<ten-service>
./mvnw clean package -DskipTests
java -jar target/<ten-service>-1.0.0.jar --spring.profiles.active=prod
```

### Thu tu khoi dong

1. **auth** (bat buoc khoi dong truoc)
2. **customer**, **inventory** (cac service co ban)
3. Cac service con lai (bat ky thu tu nao)

> Moi service tu dong dang ky voi RabbitMQ khi khoi dong. Dam bao RabbitMQ va Redis da chay truoc khi start backend.

---

## 5. Co so du lieu

### Khoi tao schema

```sql
-- Tao database
CREATE DATABASE reborn_retail_crm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Tao user
CREATE USER 'crm_user'@'%' IDENTIFIED BY '<mat-khau-manh>';
GRANT ALL PRIVILEGES ON reborn_retail_crm.* TO 'crm_user'@'%';
FLUSH PRIVILEGES;
```

### Chay migration

Moi microservice su dung Flyway de quan ly schema migration:

```bash
# Migration tu dong chay khi service khoi dong
# Hoac chay thu cong:
./mvnw flyway:migrate -Dflyway.url=jdbc:mysql://localhost:3306/reborn_retail_crm
```

### Cau hinh MySQL khuyen nghi (my.cnf)

```ini
[mysqld]
innodb_buffer_pool_size = 4G
innodb_log_file_size = 1G
innodb_flush_log_at_trx_commit = 1
max_connections = 500
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

---

## 6. Nginx Reverse Proxy

```nginx
upstream backend_biz {
    server 127.0.0.1:8081;
    server 127.0.0.1:8082;
    server 127.0.0.1:8083;
    server 127.0.0.1:8084;
    server 127.0.0.1:8085;
    server 127.0.0.1:8086;
    server 127.0.0.1:8087;
    server 127.0.0.1:8088;
    server 127.0.0.1:8089;
    server 127.0.0.1:8090;
    server 127.0.0.1:8091;
}

upstream backend_admin {
    server 127.0.0.1:8080;
}

server {
    listen 80;
    server_name retailcrm.reborn.vn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name retailcrm.reborn.vn;

    ssl_certificate     /etc/ssl/certs/retailcrm.reborn.vn.crt;
    ssl_certificate_key /etc/ssl/private/retailcrm.reborn.vn.key;

    # Frontend — SPA
    location / {
        root /var/www/retailcrm/dist;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend — Business API
    location /bizapi/ {
        proxy_pass http://backend_biz/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }

    # Backend — Admin API
    location /adminapi/ {
        proxy_pass http://backend_admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_read_timeout 120s;
        client_max_body_size 10M;
    }

    # WebSocket (notification)
    location /ws/ {
        proxy_pass http://127.0.0.1:8086/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Gioi han request
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    location /bizapi/ {
        limit_req zone=api burst=200 nodelay;
    }
}
```

---

## 7. SSL / HTTPS

### Su dung Let's Encrypt (mien phi)

```bash
# Cai dat certbot
sudo apt install certbot python3-certbot-nginx

# Cap chung chi
sudo certbot --nginx -d retailcrm.reborn.vn -d api.retailcrm.reborn.vn

# Tu dong gia han (crontab)
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

### Cau hinh SSL khuyen nghi

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## 8. Docker Compose

```yaml
version: "3.9"

services:
  # ===== Infrastructure =====
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: reborn_retail_crm
      MYSQL_USER: crm_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./config/mysql/my.cnf:/etc/mysql/conf.d/custom.cnf
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 2gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      retries: 5
    restart: unless-stopped

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USERNAME}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_running"]
      interval: 15s
      retries: 5
    restart: unless-stopped

  # ===== Backend Services =====
  auth:
    build: ./services/auth
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8080:8080"
    depends_on:
      mysql: { condition: service_healthy }
      redis: { condition: service_healthy }
      rabbitmq: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      retries: 3
    restart: unless-stopped

  sales:
    build: ./services/sales
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8081:8081"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  inventory:
    build: ./services/inventory
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8082:8082"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  billing:
    build: ./services/billing
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8083:8083"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  market:
    build: ./services/market
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8084:8084"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  customer:
    build: ./services/customer
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8085:8085"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  notification:
    build: ./services/notification
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8086:8086"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  integration:
    build: ./services/integration
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8087:8087"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  care:
    build: ./services/care
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8088:8088"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  logistics:
    build: ./services/logistics
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8089:8089"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  finance:
    build: ./services/finance
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8090:8090"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  operation:
    build: ./services/operation
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    ports:
      - "8091:8091"
    depends_on:
      auth: { condition: service_healthy }
    restart: unless-stopped

  # ===== Frontend =====
  nginx:
    image: nginx:1.25-alpine
    volumes:
      - ./dist:/var/www/retailcrm/dist:ro
      - ./config/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - auth
      - sales
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
  rabbitmq_data:
```

### Lenh van hanh Docker

```bash
# Khoi dong toan bo
docker compose up -d

# Xem log
docker compose logs -f --tail=100 sales

# Khoi dong lai 1 service
docker compose restart inventory

# Dung toan bo
docker compose down
```

---

## 9. Health Checks

Moi microservice expose endpoint `/actuator/health`:

```bash
# Kiem tra tung service
curl -s http://localhost:8080/actuator/health | jq .
curl -s http://localhost:8081/actuator/health | jq .

# Script kiem tra tat ca
for port in $(seq 8080 8091); do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/actuator/health)
  echo "Port $port: $status"
done
```

**Cac chi so can giam sat:**

| Chi so | Endpoint | Nguong canh bao |
|---|---|---|
| Service UP/DOWN | `/actuator/health` | status != UP |
| DB connection pool | `/actuator/metrics/hikaricp.connections.active` | > 80% pool size |
| JVM heap | `/actuator/metrics/jvm.memory.used` | > 85% max heap |
| HTTP error rate | `/actuator/metrics/http.server.requests` | 5xx > 1% |
| Response time P95 | `/actuator/metrics/http.server.requests` | > 500ms |

---

## 10. Rollback

### Rollback Frontend

```bash
# Luu lai ban hien tai
cp -r /var/www/retailcrm/dist /var/www/retailcrm/dist.backup.$(date +%Y%m%d)

# Khoi phuc ban cu
cp -r /var/www/retailcrm/dist.previous /var/www/retailcrm/dist

# Reload nginx
sudo nginx -s reload
```

### Rollback Backend (Docker)

```bash
# Xem lich su image
docker images retailcrm/sales --format "table {{.Tag}}\t{{.CreatedAt}}"

# Quay ve phien ban cu
docker compose down sales
docker compose up -d sales --no-deps -e IMAGE_TAG=v1.2.3
```

### Rollback Database

```bash
# Flyway undo (neu co migration undo)
./mvnw flyway:undo -Dflyway.url=jdbc:mysql://localhost:3306/reborn_retail_crm

# Hoac khoi phuc tu backup
mysql -u root -p reborn_retail_crm < /backup/reborn_retail_crm_20260415.sql
```

> **Quy tac:** Luon backup database TRUOC khi deploy phien ban moi.

---

## 11. CI/CD — GitHub Actions

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [master]
    paths-ignore:
      - "docs/**"
      - "*.md"

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ghcr.io/${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit

  build-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run build:prod
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: dist/

  build-backend:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - auth
          - sales
          - inventory
          - billing
          - market
          - customer
          - notification
          - integration
          - care
          - logistics
          - finance
          - operation
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: 17
          distribution: corretto
      - run: |
          cd services/${{ matrix.service }}
          ./mvnw clean package -DskipTests
      - uses: docker/build-push-action@v5
        with:
          context: services/${{ matrix.service }}
          push: true
          tags: ${{ env.IMAGE_PREFIX }}/${{ matrix.service }}:${{ github.sha }}

  deploy:
    needs: [build-frontend, build-backend]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/retailcrm
            docker compose pull
            docker compose up -d --remove-orphans
            # Doi health check
            sleep 30
            curl -f http://localhost:8080/actuator/health || exit 1
            echo "Deploy thanh cong!"
```

### Quy trinh deploy

1. Developer push code len branch `master`
2. GitHub Actions tu dong: lint -> test -> build -> deploy
3. Neu build that bai, pipeline dung lai va gui thong bao
4. Neu deploy that bai, chay rollback tu dong

---

## Phu luc: Checklist truoc khi Go-Live

- [ ] Tat ca 12 microservices tra ve health UP
- [ ] SSL certificate hop le
- [ ] Database migration chay thanh cong
- [ ] Redis ket noi on dinh
- [ ] RabbitMQ queues duoc tao dung
- [ ] Nginx config test pass (`nginx -t`)
- [ ] Firewall chi mo port 80, 443
- [ ] Backup database tu dong da cau hinh
- [ ] Monitoring/alerting da bat
- [ ] DNS tro dung IP server
