# Huong dan Trien khai — Reborn Tech B2B CRM

> **Nhanh:** reborn-tech
> **Phien ban:** 1.0 | Cap nhat: 2026-04-16
> **Doi tuong doc:** DevOps, SRE, Tech Lead

---

## Muc luc

1. [Dieu kien tien quyet](#1-dieu-kien-tien-quyet)
2. [Bien moi truong](#2-bien-moi-truong)
3. [Build Frontend](#3-build-frontend)
4. [12 Microservices Backend](#4-12-microservices-backend)
5. [MySQL Database](#5-mysql-database)
6. [Nginx Reverse Proxy](#6-nginx-reverse-proxy)
7. [Docker Compose](#7-docker-compose)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Rollback](#9-rollback)
10. [Kiem tra sau trien khai](#10-kiem-tra-sau-trien-khai)

---

## 1. Dieu kien tien quyet

### Phan cung toi thieu (Production)

| Thanh phan | Cau hinh |
|------------|---------|
| CPU | 8 vCPU |
| RAM | 16 GB |
| Disk | 100 GB SSD |
| OS | Ubuntu 22.04 LTS hoac CentOS 8+ |
| Network | IP tinh, port 80/443 mo |

### Phan mem yeu cau

| Phan mem | Phien ban | Muc dich |
|----------|-----------|---------|
| Docker | 24.0+ | Container runtime |
| Docker Compose | 2.20+ | Orchestration |
| Node.js | 18 LTS | Build frontend |
| npm | 9+ | Package manager FE |
| MySQL | 8.0+ | Database |
| Nginx | 1.24+ | Reverse proxy, SSL termination |
| Redis | 7.0+ | Cache, session |
| RabbitMQ | 3.12+ | Message queue |
| Git | 2.40+ | Source code |
| Certbot | Latest | SSL Let's Encrypt |

---

## 2. Bien moi truong

Tao file `.env` tai thu muc root cua moi microservice. Mau:

```bash
# ─── Database ───
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=reborn_crm
DB_USER=reborn_app
DB_PASSWORD=<strong-password>
DB_POOL_SIZE=20

# ─── Redis ───
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# ─── RabbitMQ ───
RABBITMQ_HOST=127.0.0.1
RABBITMQ_PORT=5672
RABBITMQ_USER=reborn
RABBITMQ_PASSWORD=<rabbitmq-password>
RABBITMQ_VHOST=/reborn

# ─── JWT ───
JWT_SECRET=<256-bit-random-key>
JWT_EXPIRE=86400

# ─── Application ───
APP_ENV=production
APP_PORT=<port-rieng-tung-service>
APP_LOG_LEVEL=info

# ─── Storage ───
UPLOAD_DIR=/data/uploads
MAX_FILE_SIZE=10485760

# ─── External ───
SINVOICE_URL=https://api.sinvoice.vn
SINVOICE_TOKEN=<token>
ZALO_OA_ACCESS_TOKEN=<token>
ZALO_OA_REFRESH_TOKEN=<token>

# ─── Multi-tenant ───
TENANT_DB_PREFIX=tenant_
MASTER_DB_NAME=reborn_master
```

**Luu y bao mat:**
- KHONG commit file `.env` len Git
- Su dung Docker Secrets hoac HashiCorp Vault cho production
- Rotate JWT_SECRET dinh ky (moi quy)
- DB_PASSWORD phai >= 16 ky tu, bao gom chu hoa/thuong/so/ky tu dac biet

---

## 3. Build Frontend

```bash
# Clone source
git clone -b reborn-tech https://github.com/reborn-vn/cloud-crm.git
cd cloud-crm

# Cai dependencies
npm ci --production=false

# Build production
npm run build

# Ket qua output tai thu muc build/ hoac dist/
# Copy vao thu muc Nginx serve static
cp -r dist/* /var/www/reborn-crm/
```

### Bien moi truong Frontend (build-time)

Tao file `.env.production`:

```bash
VITE_API_BASE_URL=https://biz.reborn.vn
VITE_BPM_API_URL=https://biz.reborn.vn/bpmapi
VITE_APP_TITLE=Reborn Tech CRM
VITE_UPLOAD_URL=https://biz.reborn.vn/upload
```

---

## 4. 12 Microservices Backend

### Danh sach service va port mac dinh

| # | Service | Port | URL Prefix | Mo ta |
|---|---------|------|------------|-------|
| 1 | cloud-customer-master | 9001 | /api/customer/, /api/contact/ | Khach hang, lien he |
| 2 | cloud-sales-master | 9002 | /bizapi/sales/ | Hoa don, don hang, dashboard |
| 3 | cloud-billing-master | 9003 | /bizapi/billing/ | Thu chi, cong no, quy |
| 4 | cloud-contract-master | 9004 | /api/contract/ | Hop dong |
| 5 | cloud-inventory-master | 9005 | /inventory/ | Kho, san pham |
| 6 | cloud-care-master | 9006 | /bizapi/care/ | Ticket, bao hanh |
| 7 | cloud-market-master | 9007 | /market/ | Voucher, khuyen mai, campaign |
| 8 | cloud-notification-master | 9008 | /notification/ | Push, email, SMS, ZNS |
| 9 | cloud-integration-master | 9009 | /integration/ | Tich hop ben thu 3 |
| 10 | cloud-logistics-master | 9010 | /logistics/ | Van chuyen |
| 11 | cloud-finance-master | 9011 | /finance/ | Tai chinh (chi banking) |
| 12 | cloud-bpm-master | 9012 | /bpmapi/ | Quy trinh nghiep vu |

### Khoi dong tung service

```bash
cd /opt/reborn/cloud-<service-name>-master
cp .env.example .env
# Chinh sua .env theo moi truong

# Khoi dong
npm ci --production
npm run start:prod

# Hoac dung PM2
pm2 start ecosystem.config.js --env production
```

---

## 5. MySQL Database

### Khoi tao

```bash
# Dang nhap MySQL
mysql -u root -p

# Tao database master
CREATE DATABASE reborn_master CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Tao user ung dung
CREATE USER 'reborn_app'@'%' IDENTIFIED BY '<strong-password>';
GRANT ALL PRIVILEGES ON reborn_master.* TO 'reborn_app'@'%';
FLUSH PRIVILEGES;
```

### Cau hinh MySQL (my.cnf) khuyen nghi

```ini
[mysqld]
# Charset
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# InnoDB
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 1
innodb_file_per_table = 1

# Connection
max_connections = 500
wait_timeout = 600
interactive_timeout = 600

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Binary log (cho replication/backup)
log-bin = mysql-bin
server-id = 1
binlog_expire_logs_seconds = 604800
```

### Backup dinh ky

```bash
# Backup hang ngay luc 2:00 AM
0 2 * * * /usr/bin/mysqldump -u reborn_app -p'<password>' \
  --single-transaction --routines --triggers \
  reborn_master | gzip > /backup/mysql/reborn_master_$(date +\%Y\%m\%d).sql.gz
```

---

## 6. Nginx Reverse Proxy

### Cau hinh chinh `/etc/nginx/sites-available/reborn-crm`

```nginx
upstream customer_service {
    server 127.0.0.1:9001;
}
upstream sales_service {
    server 127.0.0.1:9002;
}
upstream billing_service {
    server 127.0.0.1:9003;
}
upstream contract_service {
    server 127.0.0.1:9004;
}
upstream inventory_service {
    server 127.0.0.1:9005;
}
upstream care_service {
    server 127.0.0.1:9006;
}
upstream market_service {
    server 127.0.0.1:9007;
}
upstream notification_service {
    server 127.0.0.1:9008;
}
upstream integration_service {
    server 127.0.0.1:9009;
}
upstream logistics_service {
    server 127.0.0.1:9010;
}
upstream finance_service {
    server 127.0.0.1:9011;
}
upstream bpm_service {
    server 127.0.0.1:9012;
}

server {
    listen 80;
    server_name biz.reborn.vn *.reborn.vn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name biz.reborn.vn *.reborn.vn;

    ssl_certificate     /etc/letsencrypt/live/reborn.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reborn.vn/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    client_max_body_size 20M;

    # ─── Frontend SPA ───
    root /var/www/reborn-crm;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # ─── API routing theo prefix ───
    location /api/customer/ {
        proxy_pass http://customer_service;
        include /etc/nginx/proxy_params;
    }
    location /api/contact/ {
        proxy_pass http://customer_service;
        include /etc/nginx/proxy_params;
    }
    location /api/contract/ {
        proxy_pass http://contract_service;
        include /etc/nginx/proxy_params;
    }
    location /api/opportunity/ {
        proxy_pass http://customer_service;
        include /etc/nginx/proxy_params;
    }
    location /api/quotation/ {
        proxy_pass http://sales_service;
        include /etc/nginx/proxy_params;
    }
    location /bizapi/sales/ {
        proxy_pass http://sales_service;
        include /etc/nginx/proxy_params;
    }
    location /bizapi/billing/ {
        proxy_pass http://billing_service;
        include /etc/nginx/proxy_params;
    }
    location /bizapi/care/ {
        proxy_pass http://care_service;
        include /etc/nginx/proxy_params;
    }
    location /inventory/ {
        proxy_pass http://inventory_service;
        include /etc/nginx/proxy_params;
    }
    location /market/ {
        proxy_pass http://market_service;
        include /etc/nginx/proxy_params;
    }
    location /notification/ {
        proxy_pass http://notification_service;
        include /etc/nginx/proxy_params;
    }
    location /integration/ {
        proxy_pass http://integration_service;
        include /etc/nginx/proxy_params;
    }
    location /logistics/ {
        proxy_pass http://logistics_service;
        include /etc/nginx/proxy_params;
    }
    location /finance/ {
        proxy_pass http://finance_service;
        include /etc/nginx/proxy_params;
    }
    location /bpmapi/ {
        proxy_pass http://bpm_service;
        include /etc/nginx/proxy_params;
    }

    # ─── Static uploads ───
    location /uploads/ {
        alias /data/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # ─── Health check ───
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
```

### Proxy params (`/etc/nginx/proxy_params`)

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

### Kich hoat va test

```bash
sudo ln -s /etc/nginx/sites-available/reborn-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Docker Compose

File `docker-compose.yml` tai thu muc root:

```yaml
version: "3.9"

services:
  # ─── Infrastructure ───
  mysql:
    image: mysql:8.0
    container_name: reborn-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: reborn_master
      MYSQL_USER: reborn_app
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/custom.cnf
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: reborn-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: reborn-rabbitmq
    restart: always
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
      RABBITMQ_DEFAULT_VHOST: /reborn
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"

  # ─── Backend Services ───
  customer:
    build: ./cloud-customer-master
    container_name: reborn-customer
    restart: always
    env_file: ./cloud-customer-master/.env
    ports:
      - "9001:9001"
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started

  sales:
    build: ./cloud-sales-master
    container_name: reborn-sales
    restart: always
    env_file: ./cloud-sales-master/.env
    ports:
      - "9002:9002"
    depends_on:
      mysql:
        condition: service_healthy

  billing:
    build: ./cloud-billing-master
    container_name: reborn-billing
    restart: always
    env_file: ./cloud-billing-master/.env
    ports:
      - "9003:9003"
    depends_on:
      mysql:
        condition: service_healthy

  contract:
    build: ./cloud-contract-master
    container_name: reborn-contract
    restart: always
    env_file: ./cloud-contract-master/.env
    ports:
      - "9004:9004"
    depends_on:
      mysql:
        condition: service_healthy

  inventory:
    build: ./cloud-inventory-master
    container_name: reborn-inventory
    restart: always
    env_file: ./cloud-inventory-master/.env
    ports:
      - "9005:9005"
    depends_on:
      mysql:
        condition: service_healthy

  care:
    build: ./cloud-care-master
    container_name: reborn-care
    restart: always
    env_file: ./cloud-care-master/.env
    ports:
      - "9006:9006"
    depends_on:
      mysql:
        condition: service_healthy

  market:
    build: ./cloud-market-master
    container_name: reborn-market
    restart: always
    env_file: ./cloud-market-master/.env
    ports:
      - "9007:9007"
    depends_on:
      mysql:
        condition: service_healthy

  notification:
    build: ./cloud-notification-master
    container_name: reborn-notification
    restart: always
    env_file: ./cloud-notification-master/.env
    ports:
      - "9008:9008"
    depends_on:
      mysql:
        condition: service_healthy
      rabbitmq:
        condition: service_started

  integration:
    build: ./cloud-integration-master
    container_name: reborn-integration
    restart: always
    env_file: ./cloud-integration-master/.env
    ports:
      - "9009:9009"
    depends_on:
      mysql:
        condition: service_healthy

  logistics:
    build: ./cloud-logistics-master
    container_name: reborn-logistics
    restart: always
    env_file: ./cloud-logistics-master/.env
    ports:
      - "9010:9010"
    depends_on:
      mysql:
        condition: service_healthy

  finance:
    build: ./cloud-finance-master
    container_name: reborn-finance
    restart: always
    env_file: ./cloud-finance-master/.env
    ports:
      - "9011:9011"
    depends_on:
      mysql:
        condition: service_healthy

  bpm:
    build: ./cloud-bpm-master
    container_name: reborn-bpm
    restart: always
    env_file: ./cloud-bpm-master/.env
    ports:
      - "9012:9012"
    depends_on:
      mysql:
        condition: service_healthy
      rabbitmq:
        condition: service_started

  # ─── Nginx ───
  nginx:
    image: nginx:1.24-alpine
    container_name: reborn-nginx
    restart: always
    volumes:
      - ./docker/nginx/reborn-crm.conf:/etc/nginx/conf.d/default.conf
      - ./docker/nginx/proxy_params:/etc/nginx/proxy_params
      - ./dist:/var/www/reborn-crm
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /data/uploads:/data/uploads:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - customer
      - sales
      - billing
      - contract
      - care
      - bpm

volumes:
  mysql_data:
  redis_data:
  rabbitmq_data:
```

### Lenh trien khai

```bash
# Build va khoi dong tat ca
docker compose up -d --build

# Xem log
docker compose logs -f --tail=100

# Khoi dong lai 1 service
docker compose restart customer

# Dung tat ca
docker compose down
```

---

## 8. CI/CD Pipeline

### Quy trinh trien khai (Git-based)

```
Developer push → GitHub Actions → Build & Test → Docker Build → Deploy to Server
```

### GitHub Actions workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy B2B CRM
on:
  push:
    branches: [reborn-tech]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install & Build Frontend
        run: |
          npm ci
          npm run build

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/reborn
            git pull origin reborn-tech
            docker compose up -d --build
            docker compose ps
```

### Checklist truoc khi deploy Production

- [ ] Tat ca test PASS (unit + integration)
- [ ] Code da duoc review boi it nhat 1 nguoi
- [ ] Database migration da chay thanh cong tren staging
- [ ] Bien moi truong production da kiem tra
- [ ] Backup database truoc khi deploy
- [ ] Thong bao team ve thoi gian deploy

---

## 9. Rollback

### Rollback nhanh (< 5 phut)

```bash
# Quay ve commit truoc
cd /opt/reborn
git log --oneline -5           # Xac dinh commit can quay ve
git checkout <commit-hash>

# Rebuild va restart
docker compose up -d --build
```

### Rollback database

```bash
# Restore tu backup
gunzip < /backup/mysql/reborn_master_<date>.sql.gz | mysql -u root -p reborn_master
```

### Rollback tung service

```bash
# Chi rebuild 1 service
docker compose build customer
docker compose up -d customer
```

---

## 10. Kiem tra sau trien khai

### Health check

```bash
# Kiem tra tat ca service
curl -s https://biz.reborn.vn/health

# Kiem tra tung service
for port in 9001 9002 9003 9004 9005 9006 9007 9008 9009 9010 9011 9012; do
  echo "Port $port: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:$port/health)"
done
```

### Smoke test

```bash
# Test API customer
curl -s -H "Authorization: Bearer <token>" \
     -H "Hostname: demo.reborn.vn" \
     -X POST https://biz.reborn.vn/api/customer/filter \
     -H "Content-Type: application/json" \
     -d '{"page":1,"pageSize":5}' | jq .code

# Ket qua mong doi: 0
```

### Kiem tra log loi

```bash
# Xem log 5 phut gan nhat
docker compose logs --since=5m | grep -i error

# Kiem tra MySQL connections
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
```

---

## Lien he ho tro

- **DevOps Lead:** ceo@reborn.vn
- **Repository:** github.com/reborn-vn/cloud-crm (nhanh reborn-tech)
- **Documentation:** docs/README.md
