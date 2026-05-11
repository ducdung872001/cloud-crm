# Hướng dẫn Triển khai — Reborn Loyalty (Siêu thị)

> Hệ thống loyalty cho chuỗi siêu thị: 2 thương hiệu, 100+ cửa hàng, 3 triệu khách hàng.

---

## 1. Yêu cầu hệ thống

| Thành phần | Phiên bản tối thiểu | Ghi chú |
|---|---|---|
| Node.js | 18 LTS trở lên | Dùng cho frontend build |
| Java | 17+ (OpenJDK hoặc Oracle) | Backend Spring Boot |
| MySQL | 8.0+ | Cơ sở dữ liệu chính |
| Redis | 7.0+ | Cache, session, rate-limit |
| RabbitMQ | 3.12+ | Message queue cho notification & async job |
| Nginx | 1.24+ | Reverse proxy, static file serving |
| Docker (tuỳ chọn) | 24+ | Nếu deploy bằng container |

**Tài nguyên server khuyến nghị (production):**

| Vai trò | CPU | RAM | Disk |
|---|---|---|---|
| Frontend + Nginx | 2 vCPU | 4 GB | 20 GB |
| Backend (mỗi service) | 4 vCPU | 8 GB | 50 GB |
| MySQL | 4 vCPU | 16 GB | 200 GB SSD |
| Redis | 2 vCPU | 8 GB | 20 GB |
| RabbitMQ | 2 vCPU | 4 GB | 30 GB |

---

## 2. Biến môi trường (Environment Variables)

Tạo file `.env` tại thư mục gốc frontend và cấu hình backend `application.yml` tương ứng.

### 2.1 Frontend `.env`

```bash
# API endpoints
APP_API_URL=https://api.loyalty.example.com
APP_BIZ_URL=https://biz.loyalty.example.com
APP_BPM_URL=https://bpm.loyalty.example.com
APP_AUTHENTICATOR_URL=https://auth.loyalty.example.com
APP_SSO_LINK=https://sso.loyalty.example.com
APP_DOMAIN=loyalty.example.com

# Firebase (push notification)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=reborn-loyalty.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=reborn-loyalty
VITE_FIREBASE_STORAGE_BUCKET=reborn-loyalty.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BLx...
```

### 2.2 Backend `application.yml` (các biến chung)

```yaml
spring:
  datasource:
    url: jdbc:mysql://db-host:3306/reborn_loyalty?useSSL=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  redis:
    host: ${REDIS_HOST}
    port: 6379
    password: ${REDIS_PASSWORD}
  rabbitmq:
    host: ${RABBITMQ_HOST}
    port: 5672
    username: ${RABBITMQ_USER}
    password: ${RABBITMQ_PASS}

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400
```

---

## 3. Build Frontend

```bash
# Cài đặt dependencies
npm install

# Build production
npm run build:prod
```

Kết quả build nằm trong thư mục `dist/`. Toàn bộ là static file (HTML, JS, CSS), copy vào Nginx web root để serve.

```bash
# Copy sang Nginx
cp -r dist/* /var/www/loyalty/
```

---

## 4. Build & Deploy Backend

Hệ thống gồm các microservice Spring Boot:

| Service | Port mặc định | Mô tả |
|---|---|---|
| `market` | 8081 | Quản lý cửa hàng, sản phẩm, khuyến mãi |
| `customer` | 8082 | Quản lý khách hàng, tích điểm, hạng thẻ |
| `notification` | 8083 | Gửi SMS, email, push notification |
| `auth` | 8084 | Xác thực, phân quyền, SSO |

### 4.1 Build JAR

```bash
# Tại mỗi thư mục service
./mvnw clean package -DskipTests -Pprod

# Output: target/<service-name>-1.0.0.jar
```

### 4.2 Chạy service

```bash
# Chạy trực tiếp
java -jar -Xms512m -Xmx2g \
  -Dspring.profiles.active=prod \
  target/market-1.0.0.jar

# Hoặc dùng systemd (khuyến nghị)
sudo systemctl start reborn-market
sudo systemctl start reborn-customer
sudo systemctl start reborn-notification
sudo systemctl start reborn-auth
```

**Ví dụ systemd unit file** (`/etc/systemd/system/reborn-market.service`):

```ini
[Unit]
Description=Reborn Market Service
After=network.target mysql.service redis.service

[Service]
User=reborn
WorkingDirectory=/opt/reborn/market
ExecStart=/usr/bin/java -jar -Xms512m -Xmx2g -Dspring.profiles.active=prod market-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## 5. Thiết lập Database

### 5.1 Tạo schema

```sql
CREATE DATABASE reborn_loyalty
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'reborn_app'@'%' IDENTIFIED BY '<strong-password>';
GRANT ALL PRIVILEGES ON reborn_loyalty.* TO 'reborn_app'@'%';
FLUSH PRIVILEGES;
```

### 5.2 Chạy migration

```bash
# Flyway migration tích hợp trong Spring Boot
# Tự chạy khi service khởi động lần đầu

# Hoặc chạy thủ công
./mvnw flyway:migrate -Dflyway.url=jdbc:mysql://db-host:3306/reborn_loyalty \
  -Dflyway.user=reborn_app -Dflyway.password=<password>
```

### 5.3 Seed data ban đầu

```bash
# Import dữ liệu danh mục (tỉnh/thành, loại cửa hàng, hạng thẻ mặc định)
mysql -u reborn_app -p reborn_loyalty < sql/seed_master_data.sql
```

---

## 6. Cấu hình Nginx

```nginx
upstream backend_biz {
    server 127.0.0.1:8081;
    server 127.0.0.1:8082;
}

upstream backend_admin {
    server 127.0.0.1:8084;
}

server {
    listen 80;
    server_name loyalty.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name loyalty.example.com;

    ssl_certificate     /etc/ssl/certs/loyalty.example.com.pem;
    ssl_certificate_key /etc/ssl/private/loyalty.example.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Frontend — static files
    root /var/www/loyalty;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend — business API
    location /bizapi/ {
        proxy_pass http://backend_biz/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Backend — admin API
    location /adminapi/ {
        proxy_pass http://backend_admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1024;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 7. SSL/HTTPS

### 7.1 Dùng Let's Encrypt (miễn phí)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d loyalty.example.com -d api.loyalty.example.com
```

### 7.2 Tự động gia hạn

```bash
# Certbot tự thêm cron job, kiểm tra:
sudo certbot renew --dry-run
```

### 7.3 Dùng SSL certificate mua

Đặt file `.pem` và `.key` vào `/etc/ssl/` và cập nhật đường dẫn trong Nginx config ở mục 6.

---

## 8. Docker Compose (tuỳ chọn)

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: reborn_loyalty
      MYSQL_USER: reborn_app
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./sql/seed_master_data.sql:/docker-entrypoint-initdb.d/seed.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3.12-management
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASS}
    ports:
      - "5672:5672"
      - "15672:15672"

  market:
    build: ./services/market
    ports:
      - "8081:8081"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_USERNAME: reborn_app
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started

  customer:
    build: ./services/customer
    ports:
      - "8082:8082"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_USERNAME: reborn_app
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on:
      mysql:
        condition: service_healthy

  notification:
    build: ./services/notification
    ports:
      - "8083:8083"
    depends_on:
      rabbitmq:
        condition: service_started

  auth:
    build: ./services/auth
    ports:
      - "8084:8084"
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started

  nginx:
    image: nginx:1.24-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./dist:/var/www/loyalty
      - ./ssl:/etc/ssl
    depends_on:
      - market
      - customer
      - notification
      - auth

volumes:
  mysql_data:
  redis_data:
```

```bash
# Khởi chạy
docker compose up -d

# Xem logs
docker compose logs -f market

# Dừng toàn bộ
docker compose down
```

---

## 9. Health Check Endpoints

Mỗi microservice expose endpoint kiểm tra sức khoẻ:

| Service | URL | Kỳ vọng |
|---|---|---|
| Market | `GET /bizapi/actuator/health` | `{"status":"UP"}` |
| Customer | `GET /bizapi/actuator/health` | `{"status":"UP"}` |
| Notification | `GET /bizapi/actuator/health` | `{"status":"UP"}` |
| Auth | `GET /adminapi/actuator/health` | `{"status":"UP"}` |
| MySQL | Kết nối port 3306 | TCP open |
| Redis | `redis-cli ping` | `PONG` |
| RabbitMQ | `GET :15672/api/healthchecks/node` | `{"status":"ok"}` |

**Script kiểm tra nhanh:**

```bash
#!/bin/bash
services=("http://localhost:8081/actuator/health"
          "http://localhost:8082/actuator/health"
          "http://localhost:8083/actuator/health"
          "http://localhost:8084/actuator/health")

for url in "${services[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" == "200" ]; then
    echo "[OK]   $url"
  else
    echo "[FAIL] $url (HTTP $status)"
  fi
done
```

---

## 10. Rollback Procedure

### 10.1 Frontend rollback

```bash
# Giữ lại bản build trước tại /var/www/loyalty_backup/
cp -r /var/www/loyalty /var/www/loyalty_$(date +%Y%m%d_%H%M%S)

# Khi cần rollback
rm -rf /var/www/loyalty
cp -r /var/www/loyalty_backup_<timestamp> /var/www/loyalty
sudo nginx -s reload
```

### 10.2 Backend rollback

```bash
# Giữ JAR cũ trước khi deploy
cp /opt/reborn/market/market-1.0.0.jar /opt/reborn/market/market-1.0.0.jar.bak

# Khi cần rollback
cp /opt/reborn/market/market-1.0.0.jar.bak /opt/reborn/market/market-1.0.0.jar
sudo systemctl restart reborn-market
```

### 10.3 Database rollback

```bash
# Snapshot trước migration
mysqldump -u root -p reborn_loyalty > backup_before_migration_$(date +%Y%m%d).sql

# Rollback
mysql -u root -p reborn_loyalty < backup_before_migration_<date>.sql

# Flyway rollback (nếu có undo migration)
./mvnw flyway:undo
```

---

## 11. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy Production

on:
  push:
    branches: [master]
    paths-ignore:
      - "docs/**"
      - "*.md"

env:
  REGISTRY: ghcr.io
  NODE_VERSION: "18"
  JAVA_VERSION: "17"

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - name: Frontend test
        run: |
          npm ci
          npm run lint
          npm run test:unit

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: ${{ env.JAVA_VERSION }}

      - name: Backend test
        run: ./mvnw verify

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build frontend
        run: |
          npm ci
          npm run build:prod
        env:
          APP_API_URL: ${{ secrets.APP_API_URL }}
          APP_BIZ_URL: ${{ secrets.APP_BIZ_URL }}
          APP_BPM_URL: ${{ secrets.APP_BPM_URL }}
          APP_AUTHENTICATOR_URL: ${{ secrets.APP_AUTHENTICATOR_URL }}

      - name: Build backend JARs
        run: ./mvnw clean package -DskipTests -Pprod

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/reborn
            # Backup hiện tại
            ./scripts/backup-current.sh
            # Pull artifacts & restart
            ./scripts/deploy.sh
            # Health check
            ./scripts/health-check.sh

      - name: Verify deployment
        run: |
          sleep 30
          curl -f https://loyalty.example.com/bizapi/actuator/health || exit 1

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {"text": "Deploy FAILED — ${{ github.sha }}"}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Checklist triển khai

- [ ] Server đủ tài nguyên (CPU, RAM, disk)
- [ ] MySQL 8 đã cài, tạo schema + user
- [ ] Redis đã cài, đặt password
- [ ] RabbitMQ đã cài, tạo user/vhost
- [ ] File `.env` frontend đã cấu hình đúng
- [ ] `application.yml` backend đã cấu hình đúng
- [ ] Frontend build thành công, copy vào Nginx root
- [ ] Backend JAR build thành công, systemd unit file tạo xong
- [ ] Nginx config reverse proxy đã test (`nginx -t`)
- [ ] SSL certificate cài xong, HTTPS hoạt động
- [ ] Health check tất cả service trả về UP
- [ ] Firewall chỉ mở port 80, 443 ra ngoài
- [ ] Backup script đã schedule (cron)
- [ ] Monitoring/alerting đã cấu hình
