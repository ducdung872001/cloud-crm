# Operations Runbook — Reborn Retail CRM

> Tai lieu van hanh va xu ly su co cho he thong CRM chuoi cua hang ban le.
> Phien ban: 2.x | Cap nhat: 2026-04-16

---

## Muc luc

1. [SLA cam ket](#1-sla-cam-ket)
2. [Giam sat he thong](#2-giam-sat-he-thong)
3. [Cac su co thuong gap](#3-cac-su-co-thuong-gap)
4. [Backup va khoi phuc](#4-backup-va-khoi-phuc)
5. [Xu ly su co (Incident Response)](#5-xu-ly-su-co-incident-response)
6. [Bao tri dinh ky](#6-bao-tri-dinh-ky)
7. [Bao mat](#7-bao-mat)
8. [Ke hoach mo rong (Capacity Planning)](#8-ke-hoach-mo-rong-capacity-planning)
9. [Ma tran lien he](#9-ma-tran-lien-he)

---

## 1. SLA cam ket

| Chi so | Muc tieu | Do luong |
|---|---|---|
| **Uptime** | 99.5% (toi da ~43.8h downtime/nam) | Tinh theo thang, loai tru bao tri co thong bao |
| **API Response P95** | < 500ms | Do tai Nginx access log va APM |
| **API Response P99** | < 1500ms | Do tai APM |
| **Thoi gian phan hoi ho tro** | < 2 gio (gio lam viec) | Tinh tu luc nhan ticket |
| **Thoi gian khac phuc P1** | < 4 gio | Tu luc xac nhan su co |
| **Thoi gian khac phuc P2** | < 8 gio | Tu luc xac nhan su co |
| **RTO (Recovery Time Objective)** | < 1 gio | Thoi gian khoi phuc toi da |
| **RPO (Recovery Point Objective)** | < 1 gio | Mat du lieu toi da chap nhan |

### Cach tinh Uptime

```
Uptime % = ((Tong phut trong thang - Phut downtime) / Tong phut trong thang) * 100
```

Downtime duoc tinh khi bat ky dieu kien nao sau xay ra:
- Trang chu khong truy cap duoc
- API tra ve 5xx > 5% request trong 5 phut
- Chuc nang ban hang (POS) khong hoat dong

---

## 2. Giam sat he thong

### 2.1 Health Checks

```bash
#!/bin/bash
# /opt/retailcrm/scripts/healthcheck.sh

SERVICES="8080 8081 8082 8083 8084 8085 8086 8087 8088 8089 8090 8091"
SERVICE_NAMES=("auth" "sales" "inventory" "billing" "market" "customer"
               "notification" "integration" "care" "logistics" "finance" "operation")

i=0
for port in $SERVICES; do
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time 5 http://localhost:$port/actuator/health)
  if [ "$status" != "200" ]; then
    echo "CRITICAL: ${SERVICE_NAMES[$i]} (port $port) — HTTP $status"
    # Gui alert
  fi
  ((i++))
done
```

Chay moi 1 phut qua crontab:
```
* * * * * /opt/retailcrm/scripts/healthcheck.sh >> /var/log/retailcrm/healthcheck.log 2>&1
```

### 2.2 Canh bao (Alerts)

| Chi so | Nguong WARNING | Nguong CRITICAL | Hanh dong |
|---|---|---|---|
| **DB connection pool** | Active > 70% | Active > 90% | Tang pool size hoac kiem tra slow queries |
| **Redis memory** | Used > 70% maxmemory | Used > 90% maxmemory | Kiem tra key TTL, xoa cache cu |
| **RabbitMQ queue depth** | > 10,000 messages | > 50,000 messages | Kiem tra consumer, restart neu can |
| **RabbitMQ unacked** | > 1,000 messages | > 5,000 messages | Consumer bi treo, restart service |
| **Disk usage** | > 80% | > 90% | Xoa log cu, mo rong disk |
| **JVM heap** | > 80% max | > 90% max | Kiem tra memory leak, tang heap |
| **CPU** | > 70% (5 phut) | > 90% (5 phut) | Kiem tra process, scale out |
| **Error rate (5xx)** | > 1% | > 5% | Kiem tra log, rollback neu can |
| **SSL cert expiry** | < 30 ngay | < 7 ngay | Renew certificate |

### 2.3 Cong cu khuyen dung

- **Metrics:** Prometheus + Grafana (Spring Boot Actuator expose /actuator/prometheus)
- **Log:** ELK Stack hoac Loki + Grafana
- **APM:** Elastic APM hoac Jaeger (distributed tracing)
- **Alerting:** Grafana Alerts -> Telegram / Slack / Email

---

## 3. Cac su co thuong gap

### 3.1 DB Connection Pool Exhaustion

**Trieu chung:**
- API tra ve 500 hoac timeout
- Log: `HikariPool - Connection is not available, request timed out`

**Nguyen nhan:**
- Slow query giu connection qua lau
- Leak connection (khong dong connection)
- Burst traffic dot ngot

**Xu ly:**

```bash
# 1. Kiem tra connection hien tai
mysql -u root -p -e "SHOW PROCESSLIST;" | grep -v Sleep | head -20

# 2. Tim slow query
mysql -u root -p -e "SELECT * FROM information_schema.processlist WHERE TIME > 10;"

# 3. Kill query co van de
mysql -u root -p -e "KILL <process_id>;"

# 4. Restart service bi anh huong
docker compose restart <service-name>

# 5. Tang pool size tam thoi (application.yml)
# spring.datasource.hikari.maximum-pool-size: 30 -> 50
```

**Phong ngua:**
- Dat `spring.datasource.hikari.leak-detection-threshold=60000`
- Index dung cac cot filter thuong dung
- Giam sat slow query log thuong xuyen

---

### 3.2 Redis Out of Memory (OOM)

**Trieu chung:**
- Log: `OOM command not allowed when used memory > maxmemory`
- Cache miss tang dot bien
- API cham hon binh thuong

**Xu ly:**

```bash
# 1. Kiem tra memory
redis-cli -a ${REDIS_PASSWORD} INFO memory

# 2. Tim key chiem nhieu memory
redis-cli -a ${REDIS_PASSWORD} --bigkeys

# 3. Xoa cache khong can thiet
redis-cli -a ${REDIS_PASSWORD} KEYS "cache:report:*" | xargs redis-cli DEL

# 4. Kiem tra key khong co TTL
redis-cli -a ${REDIS_PASSWORD} --scan | while read key; do
  ttl=$(redis-cli -a ${REDIS_PASSWORD} TTL "$key")
  if [ "$ttl" = "-1" ]; then echo "No TTL: $key"; fi
done
```

**Phong ngua:**
- Tat ca key phai co TTL (toi da 24h cho cache, 8h cho session)
- Cau hinh `maxmemory-policy allkeys-lru`
- Giam sat memory usage hang ngay

---

### 3.3 RabbitMQ Queue Backlog

**Trieu chung:**
- Thong bao (email, SMS, push) bi tre
- Don hang khong dong bo giua cac service
- Queue depth tang lien tuc

**Xu ly:**

```bash
# 1. Kiem tra queue
rabbitmqctl list_queues name messages consumers

# 2. Kiem tra consumer con song khong
rabbitmqctl list_consumers

# 3. Restart consumer service
docker compose restart notification

# 4. Neu queue qua lon, purge (CHI KHI CHAP NHAN MAT DU LIEU)
# rabbitmqctl purge_queue <queue_name>
```

**Phong ngua:**
- Moi queue phai co dead-letter exchange
- Dat `x-max-length: 100000` cho moi queue
- Alert khi queue > 10,000

---

### 3.4 JVM Heap / OutOfMemoryError

**Trieu chung:**
- Service tu dong restart
- Log: `java.lang.OutOfMemoryError: Java heap space`
- Response time tang dan truoc khi crash

**Xu ly:**

```bash
# 1. Lay heap dump truoc khi restart (neu service con chay)
jmap -dump:format=b,file=/tmp/heapdump.hprof <PID>

# 2. Restart service
docker compose restart <service-name>

# 3. Tang heap tam thoi
# JAVA_OPTS: -Xms512m -Xmx1024m -> -Xms1024m -Xmx2048m

# 4. Phan tich heap dump
# Dung Eclipse MAT hoac VisualVM
```

**Phong ngua:**
- Cau hinh `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/`
- Khong load toan bo list vao memory (phan trang bat buoc)
- Giam sat GC time qua Actuator metrics

---

### 3.5 Frontend 404 (SPA Routing)

**Trieu chung:**
- Truy cap truc tiep URL (`/sales/orders/123`) tra ve 404
- Refresh trang bi 404

**Xu ly:**

```bash
# Kiem tra nginx config co try_files khong
grep -n "try_files" /etc/nginx/conf.d/default.conf

# Phai co dong nay trong location /:
#   try_files $uri $uri/ /index.html;

# Sau khi sua, reload nginx
sudo nginx -t && sudo nginx -s reload
```

---

## 4. Backup va khoi phuc

### 4.1 MySQL — Backup hang ngay

```bash
#!/bin/bash
# /opt/retailcrm/scripts/backup-mysql.sh

BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="reborn_retail_crm"
RETENTION_DAYS=30

# Full backup
mysqldump -u root -p${DB_ROOT_PASSWORD} \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  ${DB_NAME} | gzip > ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz

# Xoa backup cu hon 30 ngay
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Log
echo "[${DATE}] Backup completed: ${DB_NAME}_${DATE}.sql.gz" >> /var/log/retailcrm/backup.log
```

Crontab — chay luc 2:00 AM moi ngay:
```
0 2 * * * /opt/retailcrm/scripts/backup-mysql.sh
```

### 4.2 Redis — Backup RDB

```bash
# Bat RDB snapshot trong redis.conf
save 900 1
save 300 10
save 60 10000

# Copy file dump.rdb ra noi an toan
cp /var/lib/redis/dump.rdb /backup/redis/dump_$(date +%Y%m%d).rdb
```

### 4.3 Point-in-Time Recovery (MySQL)

```bash
# Bat binary log trong my.cnf
[mysqld]
log-bin = /var/log/mysql/mysql-bin
binlog_expire_logs_seconds = 604800
binlog_format = ROW

# Khoi phuc den thoi diem cu the
# Buoc 1: Khoi phuc tu full backup
mysql -u root -p reborn_retail_crm < backup_20260415.sql

# Buoc 2: Apply binlog den thoi diem mong muon
mysqlbinlog --stop-datetime="2026-04-15 14:30:00" \
  /var/log/mysql/mysql-bin.000123 | mysql -u root -p reborn_retail_crm
```

### 4.4 Kiem tra backup

**Bat buoc kiem tra backup moi tuan:**

```bash
# Tao database tam
mysql -u root -p -e "CREATE DATABASE backup_test;"

# Restore va kiem tra
gunzip < /backup/mysql/reborn_retail_crm_latest.sql.gz | mysql -u root -p backup_test
mysql -u root -p backup_test -e "SELECT COUNT(*) FROM customers;"

# Xoa database tam
mysql -u root -p -e "DROP DATABASE backup_test;"
```

---

## 5. Xu ly su co (Incident Response)

### 5.1 Phan loai muc do nghiem trong

| Muc do | Mo ta | Thoi gian phan hoi | Thoi gian khac phuc | Vi du |
|---|---|---|---|---|
| **P1 — Critical** | He thong ngung hoat dong hoan toan | 15 phut | 4 gio | Database down, toan bo API 500 |
| **P2 — High** | Chuc nang chinh bi anh huong | 30 phut | 8 gio | POS khong ban duoc hang, thanh toan loi |
| **P3 — Medium** | Chuc nang phu bi anh huong | 2 gio | 24 gio | Bao cao xuat cham, thong bao tre |
| **P4 — Low** | Loi nho, khong anh huong nghiep vu | 8 gio | 72 gio | UI le, typo, tinh nang it dung |

### 5.2 Quy trinh xu ly su co

```
1. PHAT HIEN     Monitoring alert / User bao cao
       |
2. XAC NHAN      Xac dinh pham vi, muc do (P1-P4)
       |
3. THONG BAO     Thong bao team theo ma tran lien he
       |
4. DIEU TRA      Kiem tra log, metrics, reproduce
       |
5. KHAC PHUC     Hotfix / Rollback / Restart
       |
6. XAC MINH      Kiem tra he thong da binh thuong
       |
7. POST-MORTEM   Viet bao cao nguyen nhan, cach phong ngua
```

### 5.3 Escalation

| Thoi gian | Hanh dong |
|---|---|
| 0 — 15 phut | On-call engineer tiep nhan |
| 15 — 30 phut | Thong bao Tech Lead |
| 30 — 60 phut | Thong bao CTO / Engineering Manager |
| > 1 gio (P1) | Thong bao Ban giam doc, can nhac thong bao khach hang |
| > 4 gio (P1) | Hop khan cap toan team |

### 5.4 Template bao cao su co

```markdown
## Bao cao su co #<so>

**Thoi gian phat hien:** YYYY-MM-DD HH:MM
**Thoi gian khac phuc:** YYYY-MM-DD HH:MM
**Muc do:** P1/P2/P3/P4
**Anh huong:** Mo ta anh huong den nguoi dung

### Tom tat
<Mo ta ngan gon su co>

### Thoi gian xu ly (Timeline)
- HH:MM — Phat hien ...
- HH:MM — Bat dau dieu tra ...
- HH:MM — Tim ra nguyen nhan ...
- HH:MM — Ap dung ban va ...
- HH:MM — Xac nhan khac phuc ...

### Nguyen nhan goc (Root Cause)
<Nguyen nhan chi tiet>

### Hanh dong khac phuc
<Da lam gi de sua>

### Hanh dong phong ngua
- [ ] Hanh dong 1 — Nguoi phu trach — Deadline
- [ ] Hanh dong 2 — Nguoi phu trach — Deadline
```

---

## 6. Bao tri dinh ky

### 6.1 Lich bao tri

| Tan suat | Cong viec | Thoi diem khuyen nghi |
|---|---|---|
| **Hang ngay** | Kiem tra backup, xem alert | 8:00 AM |
| **Hang tuan** | Kiem tra restore backup, xem slow query | Thu 2, 9:00 AM |
| **Hang thang** | Cap nhat security patch, xoa log cu | Ngay 1, 2:00 AM |
| **Hang quy** | Review capacity, rotate JWT secret | Dau quy |

### 6.2 Lam moi cache khuyen mai (Promotion Cache Refresh)

```bash
# Khi cap nhat chuong trinh khuyen mai, can xoa cache
redis-cli -a ${REDIS_PASSWORD} KEYS "cache:promotion:*" | xargs redis-cli -a ${REDIS_PASSWORD} DEL
redis-cli -a ${REDIS_PASSWORD} KEYS "cache:voucher:*" | xargs redis-cli -a ${REDIS_PASSWORD} DEL

# Hoac goi API refresh
curl -X POST http://localhost:8084/api/admin/cache/refresh-promotions \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

### 6.3 Tong hop bao cao (Report Aggregation)

```bash
# Chay hang dem luc 1:00 AM — tong hop doanh thu, ton kho
# Crontab:
0 1 * * * curl -X POST http://localhost:8090/api/internal/reports/daily-aggregate

# Tong hop thang — chay ngay 1 hang thang
0 3 1 * * curl -X POST http://localhost:8090/api/internal/reports/monthly-aggregate
```

### 6.4 Xoay vong log (Log Rotation)

```bash
# /etc/logrotate.d/retailcrm
/var/log/retailcrm/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        docker compose -f /opt/retailcrm/docker-compose.yml restart nginx > /dev/null 2>&1 || true
    endscript
}
```

### 6.5 Docker cleanup

```bash
# Xoa container/image khong dung — chay hang tuan
docker system prune -f --filter "until=168h"
docker image prune -a -f --filter "until=720h"
```

---

## 7. Bao mat

### 7.1 JWT Rotation

```bash
# Quy trinh rotate JWT secret (moi quy)
# 1. Tao secret moi
NEW_SECRET=$(openssl rand -base64 64)

# 2. Cap nhat bien moi truong (ho tro 2 secret cung luc trong 24h)
JWT_SECRET_OLD=${JWT_SECRET}
JWT_SECRET=${NEW_SECRET}

# 3. Restart toan bo backend service
docker compose restart auth sales inventory billing market customer \
  notification integration care logistics finance operation

# 4. Sau 24h, xoa JWT_SECRET_OLD
```

### 7.2 API Key Management

| Loai key | Muc dich | Rotation | Luu tru |
|---|---|---|---|
| JWT Secret | Ky token xac thuc | 90 ngay | Secrets Manager |
| Firebase Key | Push notification | Khi bi lo | Secrets Manager |
| SMTP Password | Gui email | 90 ngay | Secrets Manager |
| Payment Gateway Key | Thanh toan | 90 ngay | Secrets Manager |
| SMS API Key | Gui SMS | 90 ngay | Secrets Manager |

**Quy tac:**
- Khong hard-code key trong source code
- Dung Secrets Manager (Vault / AWS SSM / GCP Secret Manager)
- Log tat ca cac lan truy cap key
- Revoke key ngay khi nghi bi lo

### 7.3 Audit Log

He thong ghi nhan audit log cho cac hanh dong quan trong:

```
Hanh dong duoc ghi log:
- Dang nhap / Dang xuat (thanh cong va that bai)
- Thay doi quyen nguoi dung
- Tao / Sua / Xoa don hang
- Thay doi gia san pham
- Xuat / Nhap kho
- Thay doi cau hinh he thong
- Truy cap bao cao tai chinh
```

**Truy van audit log:**

```bash
# Tim hoat dong cua 1 user
curl "http://localhost:8080/api/admin/audit-logs?userId=123&from=2026-04-01" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

# Tim thay doi tren 1 don hang
curl "http://localhost:8080/api/admin/audit-logs?entity=ORDER&entityId=456" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

**Luu tru audit log:** Giu toi thieu 1 nam, luu archive tren S3/GCS cho cac log > 3 thang.

---

## 8. Ke hoach mo rong (Capacity Planning)

### 8.1 Du phong tai nguyen theo quy mo

| Quy mo | CPU | RAM | Disk | DB Connections | Redis Memory |
|---|---|---|---|---|---|
| **100 cua hang** | 8 vCPU | 16 GB | 200 GB SSD | 200 | 2 GB |
| **200 cua hang** | 16 vCPU | 32 GB | 500 GB SSD | 400 | 4 GB |
| **500 cua hang** | 32 vCPU (cluster) | 64 GB | 1 TB SSD | 800 (read replica) | 8 GB (cluster) |

### 8.2 Chi so can theo doi de quyet dinh scale

| Chi so | Nguong scale | Hanh dong |
|---|---|---|
| CPU trung binh > 70% (1 tuan) | Scale UP | Tang vCPU hoac them node |
| RAM trung binh > 80% | Scale UP | Tang RAM hoac tach service |
| Disk > 70% | Mo rong | Tang disk hoac chuyen sang storage lon hon |
| DB connection > 70% pool | Scale OUT | Them read replica |
| API P95 > 800ms (1 tuan) | Optimize | Review query, them cache, scale |
| Queue backlog tang deu | Scale consumer | Them instance cho consumer service |

### 8.3 Chien luoc scale

**Giai doan 100-200 cua hang:**
- Single server, tang specs (vertical scaling)
- Them MySQL read replica cho bao cao
- Redis standalone du dung

**Giai doan 200-500 cua hang:**
- Chuyen sang Kubernetes hoac Docker Swarm
- MySQL cluster (1 primary + 2 replica)
- Redis Cluster (3 master + 3 replica)
- RabbitMQ cluster (3 nodes)
- CDN cho static assets
- Tach database theo service (database-per-service)

### 8.4 Uoc tinh luu luong

```
Moi cua hang trung binh:
- 200 don hang/ngay
- 5 nhan vien dung dong thoi
- ~1000 API request/gio (gio cao diem)

500 cua hang:
- 100,000 don hang/ngay
- 2,500 nguoi dung dong thoi
- ~500,000 API request/gio (gio cao diem)
- ~50 GB du lieu moi/nam
```

---

## 9. Ma tran lien he

| Vai tro | Ten | Dien thoai | Email | Khi nao lien he |
|---|---|---|---|---|
| **On-call Engineer** | (Cap nhat hang tuan) | — | oncall@reborn.vn | P1-P4, moi su co |
| **Tech Lead** | — | — | techlead@reborn.vn | P1-P2, sau 15 phut |
| **DevOps** | — | — | devops@reborn.vn | Infrastructure, deploy |
| **DBA** | — | — | dba@reborn.vn | Database issues |
| **CTO** | — | — | cto@reborn.vn | P1, sau 30 phut |
| **CEO** | — | — | ceo@reborn.vn | P1, sau 1 gio |
| **Hosting Provider** | — | Hotline nha cung cap | — | Server hardware, network |

### Kenh thong bao

| Kenh | Muc dich | Phan hoi ky vong |
|---|---|---|
| **Telegram Group** "CRM Ops" | Alert tu dong, trao doi nhanh | < 5 phut |
| **Email** oncall@reborn.vn | Su co, bao cao | < 30 phut |
| **Dien thoai** | P1 Critical | < 5 phut |
| **Jira / Issue Tracker** | Theo doi su co, post-mortem | Theo SLA |

---

## Phu luc: Lenh nhanh (Quick Reference)

```bash
# === Kiem tra trang thai ===
docker compose ps                              # Trang thai container
curl localhost:8080/actuator/health            # Health check auth
redis-cli -a $REDIS_PASSWORD INFO memory       # Redis memory
rabbitmqctl list_queues name messages          # Queue depth

# === Restart ===
docker compose restart <service>               # Restart 1 service
docker compose restart                         # Restart tat ca
docker compose down && docker compose up -d    # Restart hoan toan

# === Log ===
docker compose logs -f --tail=200 <service>    # Xem log realtime
docker compose logs --since="1h" <service>     # Log 1 gio gan nhat

# === Backup ===
mysqldump -u root -p reborn_retail_crm | gzip > backup.sql.gz
redis-cli -a $REDIS_PASSWORD BGSAVE           # Trigger RDB save

# === Scale ===
docker compose up -d --scale sales=3           # Scale service
```
