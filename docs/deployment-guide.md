# Deployment Guide — Reborn Retail CRM

> Hướng dẫn triển khai hệ thống CRM quản lý chuỗi cửa hàng bán lẻ.
> Phiên bản: 2.x | Cập nhật: 2026-04-16

---

## Mục lục

1. [Yêu cầu hệ thống](#1-yeu-cau-he-thong)
2. [Biến môi trường](#2-bien-moi-truong)
3. [Build Frontend](#3-build-frontend)
4. [Backend — 12 Microservices](#4-backend--12-microservices)
5. [Cơ sở dữ liệu](#5-co-so-du-lieu)
6. [Nginx Reverse Proxy](#6-nginx-reverse-proxy)
7. [SSL / HTTPS](#7-ssl--https)
8. [Docker Compose](#8-docker-compose)
9. [Health Checks](#9-health-checks)
10. [Rollback](#10-rollback)
11. [CI/CD — GitHub Actions](#11-cicd--github-actions)

---

## 1. Yêu cầu hệ thống

| Thành phần | Phiên bản tối thiểu | Ghi chú |
|---|---|---|
| Node.js | 18 LTS | Dùng để build frontend (Vite) |
| Java | 17+ (OpenJDK / Corretto) | Spring Boot 3.x |
| MySQL | 8.0+ | InnoDB, utf8mb4_unicode_ci |
| Redis | 7.0+ | Cache, session, pub/sub |
| RabbitMQ | 3.12+ | Message queue giữa các service |
| Nginx | 1.24+ | Reverse proxy, static files |
| Docker | 24+ | Tuỳ chọn, khuyên dùng |
| Docker Compose | 2.20+ | Tuỳ chọn, khuyên dùng |

**Tài nguyên tối thiểu (production):**

- CPU: 8 vCPU
- RAM: 16 GB
- Disk: 100 GB SSD
- Bandwidth: 100 Mbps

---

## 2. Biến môi trường

Tạo file `.env` hoặc đặt trong hệ thống CI/CD:

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

> **Lưu ý bảo mật:** Không commit file `.env` lên repository. Sử dụng secrets manager (Vault, AWS Secrets Manager) cho môi trường production.

---

## 3. Build Frontend

```bash
# 1. Cài đặt dependencies
npm install

# 2. Build production
npm run build:prod

# 3. Kết quả output tại thư mục dist/
ls -la dist/
```

Thư mục `dist/` chứa các file static (HTML, JS, CSS) sẵn sàng deploy lên Nginx hoặc CDN.

**Kiểm tra build thành công:**

```bash
# Kích thước bundle không nên vượt quá 5 MB (gzip)
du -sh dist/
```

---

## 4. Backend — 12 Microservices

Hệ thống backend gồm 12 Spring Boot microservices:

| # | Service | Mô tả | Port mặc định |
|---|---|---|---|
| 1 | **auth** | Xác thực, phân quyền, JWT | 8080 |
| 2 | **sales** | Đơn hàng, báo giá, hoá đơn bán | 8081 |
| 3 | **inventory** | Tồn kho, nhập xuất, kiểm kê | 8082 |
| 4 | **billing** | Thanh toán, công nợ, phiếu thu/chi | 8083 |
| 5 | **market** | Marketing, khuyến mãi, voucher | 8084 |
| 6 | **customer** | Khách hàng, nhóm KH, thẻ thành viên | 8085 |
| 7 | **notification** | Thông báo, email, SMS, push | 8086 |
| 8 | **integration** | Tích hợp bên thứ 3 (POS, ERP, ecom) | 8087 |
| 9 | **care** | Chăm sóc khách hàng, ticket, CSKH | 8088 |
| 10 | **logistics** | Vận chuyển, giao hàng, đối tác VC | 8089 |
| 11 | **finance** | Tài chính, báo cáo, sổ sách kế toán | 8090 |
| 12 | **operation** | Vận hành cửa hàng, ca làm, nhân sự | 8091 |

### Khởi động từng service

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

### Thứ tự khởi động

1. **auth** (bắt buộc khởi động trước)
2. **customer**, **inventory** (các service cơ bản)
3. Các service còn lại (bất kỳ thứ tự nào)

> Mỗi service tự động đăng ký với RabbitMQ khi khởi động. Đảm bảo RabbitMQ và Redis đã chạy trước khi start backend.

---

## 5. Cơ sở dữ liệu

### Khởi tạo schema

```sql
-- Tạo database
CREATE DATABASE reborn_retail_crm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Tạo user
CREATE USER 'crm_user'@'%' IDENTIFIED BY '<mat-khau-manh>';
GRANT ALL PRIVILEGES ON reborn_retail_crm.* TO 'crm_user'@'%';
FLUSH PRIVILEGES;
```

### Chạy migration

Mỗi microservice sử dụng Flyway để quản lý schema migration:

```bash
# Migration tự động chạy khi service khởi động
# Hoặc chạy thủ công:
./mvnw flyway:migrate -Dflyway.url=jdbc:mysql://localhost:3306/reborn_retail_crm
```

### Cấu hình MySQL khuyến nghị (my.cnf)

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

    # Giới hạn request
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    location /bizapi/ {
        limit_req zone=api burst=200 nodelay;
    }
}
```

---

## 7. SSL / HTTPS

### Sử dụng Let's Encrypt (miễn phí)

```bash
# Cài đặt certbot
sudo apt install certbot python3-certbot-nginx

# Cấp chứng chỉ
sudo certbot --nginx -d retailcrm.reborn.vn -d api.retailcrm.reborn.vn

# Tự động gia hạn (crontab)
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

### Cấu hình SSL khuyến nghị

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

### Lệnh vận hành Docker

```bash
# Khởi động toàn bộ
docker compose up -d

# Xem log
docker compose logs -f --tail=100 sales

# Khởi động lại 1 service
docker compose restart inventory

# Dừng toàn bộ
docker compose down
```

---

## 9. Health Checks

Mỗi microservice expose endpoint `/actuator/health`:

```bash
# Kiểm tra từng service
curl -s http://localhost:8080/actuator/health | jq .
curl -s http://localhost:8081/actuator/health | jq .

# Script kiểm tra tất cả
for port in $(seq 8080 8091); do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/actuator/health)
  echo "Port $port: $status"
done
```

**Các chỉ số cần giám sát:**

| Chỉ số | Endpoint | Ngưỡng cảnh báo |
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
# Lưu lại bản hiện tại
cp -r /var/www/retailcrm/dist /var/www/retailcrm/dist.backup.$(date +%Y%m%d)

# Khôi phục bản cũ
cp -r /var/www/retailcrm/dist.previous /var/www/retailcrm/dist

# Reload nginx
sudo nginx -s reload
```

### Rollback Backend (Docker)

```bash
# Xem lịch sử image
docker images retailcrm/sales --format "table {{.Tag}}\t{{.CreatedAt}}"

# Quay về phiên bản cũ
docker compose down sales
docker compose up -d sales --no-deps -e IMAGE_TAG=v1.2.3
```

### Rollback Database

```bash
# Flyway undo (nếu có migration undo)
./mvnw flyway:undo -Dflyway.url=jdbc:mysql://localhost:3306/reborn_retail_crm

# Hoặc khôi phục từ backup
mysql -u root -p reborn_retail_crm < /backup/reborn_retail_crm_20260415.sql
```

> **Quy tắc:** Luôn backup database TRƯỚC khi deploy phiên bản mới.

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
            # Đợi health check
            sleep 30
            curl -f http://localhost:8080/actuator/health || exit 1
            echo "Deploy thành công!"
```

### Quy trình deploy

1. Developer push code lên branch `master`
2. GitHub Actions tự động: lint -> test -> build -> deploy
3. Nếu build thất bại, pipeline dừng lại và gửi thông báo
4. Nếu deploy thất bại, chạy rollback tự động

---

## Phụ lục: Checklist trước khi Go-Live

- [ ] Tất cả 12 microservices trả về health UP
- [ ] SSL certificate hợp lệ
- [ ] Database migration chạy thành công
- [ ] Redis kết nối ổn định
- [ ] RabbitMQ queues được tạo đúng
- [ ] Nginx config test pass (`nginx -t`)
- [ ] Firewall chỉ mở port 80, 443
- [ ] Backup database tự động đã cấu hình
- [ ] Monitoring/alerting đã bật
- [ ] DNS trỏ đúng IP server
