# Operations Runbook — Reborn Retail CRM

> Tài liệu vận hành và xử lý sự cố cho hệ thống CRM chuỗi cửa hàng bán lẻ.
> Phiên bản: 2.x | Cập nhật: 2026-04-16

---

## Mục lục

1. [SLA cam kết](#1-sla-cam-ket)
2. [Giám sát hệ thống](#2-giam-sat-he-thong)
3. [Các sự cố thường gặp](#3-cac-su-co-thuong-gap)
4. [Backup và khôi phục](#4-backup-va-khoi-phuc)
5. [Xử lý sự cố (Incident Response)](#5-xu-ly-su-co-incident-response)
6. [Bảo trì định kỳ](#6-bao-tri-dinh-ky)
7. [Bảo mật](#7-bao-mat)
8. [Kế hoạch mở rộng (Capacity Planning)](#8-ke-hoach-mo-rong-capacity-planning)
9. [Ma trận liên hệ](#9-ma-tran-lien-he)

---

## 1. SLA cam kết

| Chỉ số | Mục tiêu | Đo lường |
|---|---|---|
| **Uptime** | 99.5% (tối đa ~43.8h downtime/năm) | Tính theo tháng, loại trừ bảo trì có thông báo |
| **API Response P95** | < 500ms | Đo tại Nginx access log và APM |
| **API Response P99** | < 1500ms | Đo tại APM |
| **Thời gian phản hồi hỗ trợ** | < 2 giờ (giờ làm việc) | Tính từ lúc nhận ticket |
| **Thời gian khắc phục P1** | < 4 giờ | Từ lúc xác nhận sự cố |
| **Thời gian khắc phục P2** | < 8 giờ | Từ lúc xác nhận sự cố |
| **RTO (Recovery Time Objective)** | < 1 giờ | Thời gian khôi phục tối đa |
| **RPO (Recovery Point Objective)** | < 1 giờ | Mất dữ liệu tối đa chấp nhận |

### Cách tính Uptime

```
Uptime % = ((Tổng phút trong tháng - Phút downtime) / Tổng phút trong tháng) * 100
```

Downtime được tính khi bất kỳ điều kiện nào sau xảy ra:
- Trang chủ không truy cập được
- API trả về 5xx > 5% request trong 5 phút
- Chức năng bán hàng (POS) không hoạt động

---

## 2. Giám sát hệ thống

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
    # Gửi alert
  fi
  ((i++))
done
```

Chạy mỗi 1 phút qua crontab:
```
* * * * * /opt/retailcrm/scripts/healthcheck.sh >> /var/log/retailcrm/healthcheck.log 2>&1
```

### 2.2 Cảnh báo (Alerts)

| Chỉ số | Ngưỡng WARNING | Ngưỡng CRITICAL | Hành động |
|---|---|---|---|
| **DB connection pool** | Active > 70% | Active > 90% | Tăng pool size hoặc kiểm tra slow queries |
| **Redis memory** | Used > 70% maxmemory | Used > 90% maxmemory | Kiểm tra key TTL, xoá cache cũ |
| **RabbitMQ queue depth** | > 10,000 messages | > 50,000 messages | Kiểm tra consumer, restart nếu cần |
| **RabbitMQ unacked** | > 1,000 messages | > 5,000 messages | Consumer bị treo, restart service |
| **Disk usage** | > 80% | > 90% | Xoá log cũ, mở rộng disk |
| **JVM heap** | > 80% max | > 90% max | Kiểm tra memory leak, tăng heap |
| **CPU** | > 70% (5 phút) | > 90% (5 phút) | Kiểm tra process, scale out |
| **Error rate (5xx)** | > 1% | > 5% | Kiểm tra log, rollback nếu cần |
| **SSL cert expiry** | < 30 ngày | < 7 ngày | Renew certificate |

### 2.3 Công cụ khuyên dùng

- **Metrics:** Prometheus + Grafana (Spring Boot Actuator expose /actuator/prometheus)
- **Log:** ELK Stack hoặc Loki + Grafana
- **APM:** Elastic APM hoặc Jaeger (distributed tracing)
- **Alerting:** Grafana Alerts -> Telegram / Slack / Email

---

## 3. Các sự cố thường gặp

### 3.1 DB Connection Pool Exhaustion

**Triệu chứng:**
- API trả về 500 hoặc timeout
- Log: `HikariPool - Connection is not available, request timed out`

**Nguyên nhân:**
- Slow query giữ connection quá lâu
- Leak connection (không đóng connection)
- Burst traffic đột ngột

**Xử lý:**

```bash
# 1. Kiểm tra connection hiện tại
mysql -u root -p -e "SHOW PROCESSLIST;" | grep -v Sleep | head -20

# 2. Tìm slow query
mysql -u root -p -e "SELECT * FROM information_schema.processlist WHERE TIME > 10;"

# 3. Kill query có vấn đề
mysql -u root -p -e "KILL <process_id>;"

# 4. Restart service bị ảnh hưởng
docker compose restart <service-name>

# 5. Tăng pool size tạm thời (application.yml)
# spring.datasource.hikari.maximum-pool-size: 30 -> 50
```

**Phòng ngừa:**
- Đặt `spring.datasource.hikari.leak-detection-threshold=60000`
- Index đúng các cột filter thường dùng
- Giám sát slow query log thường xuyên

---

### 3.2 Redis Out of Memory (OOM)

**Triệu chứng:**
- Log: `OOM command not allowed when used memory > maxmemory`
- Cache miss tăng đột biến
- API chậm hơn bình thường

**Xử lý:**

```bash
# 1. Kiểm tra memory
redis-cli -a ${REDIS_PASSWORD} INFO memory

# 2. Tìm key chiếm nhiều memory
redis-cli -a ${REDIS_PASSWORD} --bigkeys

# 3. Xoá cache không cần thiết
redis-cli -a ${REDIS_PASSWORD} KEYS "cache:report:*" | xargs redis-cli DEL

# 4. Kiểm tra key không có TTL
redis-cli -a ${REDIS_PASSWORD} --scan | while read key; do
  ttl=$(redis-cli -a ${REDIS_PASSWORD} TTL "$key")
  if [ "$ttl" = "-1" ]; then echo "No TTL: $key"; fi
done
```

**Phòng ngừa:**
- Tất cả key phải có TTL (tối đa 24h cho cache, 8h cho session)
- Cấu hình `maxmemory-policy allkeys-lru`
- Giám sát memory usage hàng ngày

---

### 3.3 RabbitMQ Queue Backlog

**Triệu chứng:**
- Thông báo (email, SMS, push) bị trễ
- Đơn hàng không đồng bộ giữa các service
- Queue depth tăng liên tục

**Xử lý:**

```bash
# 1. Kiểm tra queue
rabbitmqctl list_queues name messages consumers

# 2. Kiểm tra consumer còn sống không
rabbitmqctl list_consumers

# 3. Restart consumer service
docker compose restart notification

# 4. Nếu queue quá lớn, purge (CHỈ KHI CHẤP NHẬN MẤT DỮ LIỆU)
# rabbitmqctl purge_queue <queue_name>
```

**Phòng ngừa:**
- Mỗi queue phải có dead-letter exchange
- Đặt `x-max-length: 100000` cho mỗi queue
- Alert khi queue > 10,000

---

### 3.4 JVM Heap / OutOfMemoryError

**Triệu chứng:**
- Service tự động restart
- Log: `java.lang.OutOfMemoryError: Java heap space`
- Response time tăng dần trước khi crash

**Xử lý:**

```bash
# 1. Lấy heap dump trước khi restart (nếu service còn chạy)
jmap -dump:format=b,file=/tmp/heapdump.hprof <PID>

# 2. Restart service
docker compose restart <service-name>

# 3. Tăng heap tạm thời
# JAVA_OPTS: -Xms512m -Xmx1024m -> -Xms1024m -Xmx2048m

# 4. Phân tích heap dump
# Dùng Eclipse MAT hoặc VisualVM
```

**Phòng ngừa:**
- Cấu hình `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/`
- Không load toàn bộ list vào memory (phân trang bắt buộc)
- Giám sát GC time qua Actuator metrics

---

### 3.5 Frontend 404 (SPA Routing)

**Triệu chứng:**
- Truy cập trực tiếp URL (`/sales/orders/123`) trả về 404
- Refresh trang bị 404

**Xử lý:**

```bash
# Kiểm tra nginx config có try_files không
grep -n "try_files" /etc/nginx/conf.d/default.conf

# Phải có dòng này trong location /:
#   try_files $uri $uri/ /index.html;

# Sau khi sửa, reload nginx
sudo nginx -t && sudo nginx -s reload
```

---

## 4. Backup và khôi phục

### 4.1 MySQL — Backup hàng ngày

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

# Xoá backup cũ hơn 30 ngày
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Log
echo "[${DATE}] Backup completed: ${DB_NAME}_${DATE}.sql.gz" >> /var/log/retailcrm/backup.log
```

Crontab — chạy lúc 2:00 AM mỗi ngày:
```
0 2 * * * /opt/retailcrm/scripts/backup-mysql.sh
```

### 4.2 Redis — Backup RDB

```bash
# Bật RDB snapshot trong redis.conf
save 900 1
save 300 10
save 60 10000

# Copy file dump.rdb ra nơi an toàn
cp /var/lib/redis/dump.rdb /backup/redis/dump_$(date +%Y%m%d).rdb
```

### 4.3 Point-in-Time Recovery (MySQL)

```bash
# Bật binary log trong my.cnf
[mysqld]
log-bin = /var/log/mysql/mysql-bin
binlog_expire_logs_seconds = 604800
binlog_format = ROW

# Khôi phục đến thời điểm cụ thể
# Bước 1: Khôi phục từ full backup
mysql -u root -p reborn_retail_crm < backup_20260415.sql

# Bước 2: Apply binlog đến thời điểm mong muốn
mysqlbinlog --stop-datetime="2026-04-15 14:30:00" \
  /var/log/mysql/mysql-bin.000123 | mysql -u root -p reborn_retail_crm
```

### 4.4 Kiểm tra backup

**Bắt buộc kiểm tra backup mỗi tuần:**

```bash
# Tạo database tạm
mysql -u root -p -e "CREATE DATABASE backup_test;"

# Restore và kiểm tra
gunzip < /backup/mysql/reborn_retail_crm_latest.sql.gz | mysql -u root -p backup_test
mysql -u root -p backup_test -e "SELECT COUNT(*) FROM customers;"

# Xoá database tạm
mysql -u root -p -e "DROP DATABASE backup_test;"
```

---

## 5. Xử lý sự cố (Incident Response)

### 5.1 Phân loại mức độ nghiêm trọng

| Mức độ | Mô tả | Thời gian phản hồi | Thời gian khắc phục | Ví dụ |
|---|---|---|---|---|
| **P1 — Critical** | Hệ thống ngừng hoạt động hoàn toàn | 15 phút | 4 giờ | Database down, toàn bộ API 500 |
| **P2 — High** | Chức năng chính bị ảnh hưởng | 30 phút | 8 giờ | POS không bán được hàng, thanh toán lỗi |
| **P3 — Medium** | Chức năng phụ bị ảnh hưởng | 2 giờ | 24 giờ | Báo cáo xuất chậm, thông báo trễ |
| **P4 — Low** | Lỗi nhỏ, không ảnh hưởng nghiệp vụ | 8 giờ | 72 giờ | UI lệ, typo, tính năng ít dùng |

### 5.2 Quy trình xử lý sự cố

```
1. PHÁT HIỆN     Monitoring alert / User báo cáo
       |
2. XÁC NHẬN      Xác định phạm vi, mức độ (P1-P4)
       |
3. THÔNG BÁO     Thông báo team theo ma trận liên hệ
       |
4. ĐIỀU TRA      Kiểm tra log, metrics, reproduce
       |
5. KHẮC PHỤC     Hotfix / Rollback / Restart
       |
6. XÁC MINH      Kiểm tra hệ thống đã bình thường
       |
7. POST-MORTEM   Viết báo cáo nguyên nhân, cách phòng ngừa
```

### 5.3 Escalation

| Thời gian | Hành động |
|---|---|
| 0 — 15 phút | On-call engineer tiếp nhận |
| 15 — 30 phút | Thông báo Tech Lead |
| 30 — 60 phút | Thông báo CTO / Engineering Manager |
| > 1 giờ (P1) | Thông báo Ban giám đốc, cân nhắc thông báo khách hàng |
| > 4 giờ (P1) | Họp khẩn cấp toàn team |

### 5.4 Template báo cáo sự cố

```markdown
## Báo cáo sự cố #<số>

**Thời gian phát hiện:** YYYY-MM-DD HH:MM
**Thời gian khắc phục:** YYYY-MM-DD HH:MM
**Mức độ:** P1/P2/P3/P4
**Ảnh hưởng:** Mô tả ảnh hưởng đến người dùng

### Tóm tắt
<Mô tả ngắn gọn sự cố>

### Thời gian xử lý (Timeline)
- HH:MM — Phát hiện ...
- HH:MM — Bắt đầu điều tra ...
- HH:MM — Tìm ra nguyên nhân ...
- HH:MM — Áp dụng bản vá ...
- HH:MM — Xác nhận khắc phục ...

### Nguyên nhân gốc (Root Cause)
<Nguyên nhân chi tiết>

### Hành động khắc phục
<Đã làm gì để sửa>

### Hành động phòng ngừa
- [ ] Hành động 1 — Người phụ trách — Deadline
- [ ] Hành động 2 — Người phụ trách — Deadline
```

---

## 6. Bảo trì định kỳ

### 6.1 Lịch bảo trì

| Tần suất | Công việc | Thời điểm khuyến nghị |
|---|---|---|
| **Hàng ngày** | Kiểm tra backup, xem alert | 8:00 AM |
| **Hàng tuần** | Kiểm tra restore backup, xem slow query | Thứ 2, 9:00 AM |
| **Hàng tháng** | Cập nhật security patch, xoá log cũ | Ngày 1, 2:00 AM |
| **Hàng quý** | Review capacity, rotate JWT secret | Đầu quý |

### 6.2 Làm mới cache khuyến mãi (Promotion Cache Refresh)

```bash
# Khi cập nhật chương trình khuyến mãi, cần xoá cache
redis-cli -a ${REDIS_PASSWORD} KEYS "cache:promotion:*" | xargs redis-cli -a ${REDIS_PASSWORD} DEL
redis-cli -a ${REDIS_PASSWORD} KEYS "cache:voucher:*" | xargs redis-cli -a ${REDIS_PASSWORD} DEL

# Hoặc gọi API refresh
curl -X POST http://localhost:8084/api/admin/cache/refresh-promotions \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

### 6.3 Tổng hợp báo cáo (Report Aggregation)

```bash
# Chạy hàng đêm lúc 1:00 AM — tổng hợp doanh thu, tồn kho
# Crontab:
0 1 * * * curl -X POST http://localhost:8090/api/internal/reports/daily-aggregate

# Tổng hợp tháng — chạy ngày 1 hàng tháng
0 3 1 * * curl -X POST http://localhost:8090/api/internal/reports/monthly-aggregate
```

### 6.4 Xoay vòng log (Log Rotation)

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
# Xoá container/image không dùng — chạy hàng tuần
docker system prune -f --filter "until=168h"
docker image prune -a -f --filter "until=720h"
```

---

## 7. Bảo mật

### 7.1 JWT Rotation

```bash
# Quy trình rotate JWT secret (mỗi quý)
# 1. Tạo secret mới
NEW_SECRET=$(openssl rand -base64 64)

# 2. Cập nhật biến môi trường (hỗ trợ 2 secret cùng lúc trong 24h)
JWT_SECRET_OLD=${JWT_SECRET}
JWT_SECRET=${NEW_SECRET}

# 3. Restart toàn bộ backend service
docker compose restart auth sales inventory billing market customer \
  notification integration care logistics finance operation

# 4. Sau 24h, xoá JWT_SECRET_OLD
```

### 7.2 API Key Management

| Loại key | Mục đích | Rotation | Lưu trữ |
|---|---|---|---|
| JWT Secret | Ký token xác thực | 90 ngày | Secrets Manager |
| Firebase Key | Push notification | Khi bị lộ | Secrets Manager |
| SMTP Password | Gửi email | 90 ngày | Secrets Manager |
| Payment Gateway Key | Thanh toán | 90 ngày | Secrets Manager |
| SMS API Key | Gửi SMS | 90 ngày | Secrets Manager |

**Quy tắc:**
- Không hard-code key trong source code
- Dùng Secrets Manager (Vault / AWS SSM / GCP Secret Manager)
- Log tất cả các lần truy cập key
- Revoke key ngay khi nghi bị lộ

### 7.3 Audit Log

Hệ thống ghi nhận audit log cho các hành động quan trọng:

```
Hành động được ghi log:
- Đăng nhập / Đăng xuất (thành công và thất bại)
- Thay đổi quyền người dùng
- Tạo / Sửa / Xoá đơn hàng
- Thay đổi giá sản phẩm
- Xuất / Nhập kho
- Thay đổi cấu hình hệ thống
- Truy cập báo cáo tài chính
```

**Truy vấn audit log:**

```bash
# Tìm hoạt động của 1 user
curl "http://localhost:8080/api/admin/audit-logs?userId=123&from=2026-04-01" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

# Tìm thay đổi trên 1 đơn hàng
curl "http://localhost:8080/api/admin/audit-logs?entity=ORDER&entityId=456" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

**Lưu trữ audit log:** Giữ tối thiểu 1 năm, lưu archive trên S3/GCS cho các log > 3 tháng.

---

## 8. Kế hoạch mở rộng (Capacity Planning)

### 8.1 Dự phòng tài nguyên theo quy mô

| Quy mô | CPU | RAM | Disk | DB Connections | Redis Memory |
|---|---|---|---|---|---|
| **100 cửa hàng** | 8 vCPU | 16 GB | 200 GB SSD | 200 | 2 GB |
| **200 cửa hàng** | 16 vCPU | 32 GB | 500 GB SSD | 400 | 4 GB |
| **500 cửa hàng** | 32 vCPU (cluster) | 64 GB | 1 TB SSD | 800 (read replica) | 8 GB (cluster) |

### 8.2 Chỉ số cần theo dõi để quyết định scale

| Chỉ số | Ngưỡng scale | Hành động |
|---|---|---|
| CPU trung bình > 70% (1 tuần) | Scale UP | Tăng vCPU hoặc thêm node |
| RAM trung bình > 80% | Scale UP | Tăng RAM hoặc tách service |
| Disk > 70% | Mở rộng | Tăng disk hoặc chuyển sang storage lớn hơn |
| DB connection > 70% pool | Scale OUT | Thêm read replica |
| API P95 > 800ms (1 tuần) | Optimize | Review query, thêm cache, scale |
| Queue backlog tăng đều | Scale consumer | Thêm instance cho consumer service |

### 8.3 Chiến lược scale

**Giai đoạn 100-200 cửa hàng:**
- Single server, tăng specs (vertical scaling)
- Thêm MySQL read replica cho báo cáo
- Redis standalone đủ dùng

**Giai đoạn 200-500 cửa hàng:**
- Chuyển sang Kubernetes hoặc Docker Swarm
- MySQL cluster (1 primary + 2 replica)
- Redis Cluster (3 master + 3 replica)
- RabbitMQ cluster (3 nodes)
- CDN cho static assets
- Tách database theo service (database-per-service)

### 8.4 Ước tính lưu lượng

```
Mỗi cửa hàng trung bình:
- 200 đơn hàng/ngày
- 5 nhân viên dùng đồng thời
- ~1000 API request/giờ (giờ cao điểm)

500 cửa hàng:
- 100,000 đơn hàng/ngày
- 2,500 người dùng đồng thời
- ~500,000 API request/giờ (giờ cao điểm)
- ~50 GB dữ liệu mới/năm
```

---

## 9. Ma trận liên hệ

| Vai trò | Tên | Điện thoại | Email | Khi nào liên hệ |
|---|---|---|---|---|
| **On-call Engineer** | (Cập nhật hàng tuần) | — | oncall@reborn.vn | P1-P4, mọi sự cố |
| **Tech Lead** | — | — | techlead@reborn.vn | P1-P2, sau 15 phút |
| **DevOps** | — | — | devops@reborn.vn | Infrastructure, deploy |
| **DBA** | — | — | dba@reborn.vn | Database issues |
| **CTO** | — | — | cto@reborn.vn | P1, sau 30 phút |
| **CEO** | — | — | ceo@reborn.vn | P1, sau 1 giờ |
| **Hosting Provider** | — | Hotline nhà cung cấp | — | Server hardware, network |

### Kênh thông báo

| Kênh | Mục đích | Phản hồi kỳ vọng |
|---|---|---|
| **Telegram Group** "CRM Ops" | Alert tự động, trao đổi nhanh | < 5 phút |
| **Email** oncall@reborn.vn | Sự cố, báo cáo | < 30 phút |
| **Điện thoại** | P1 Critical | < 5 phút |
| **Jira / Issue Tracker** | Theo dõi sự cố, post-mortem | Theo SLA |

---

## Phụ lục: Lệnh nhanh (Quick Reference)

```bash
# === Kiểm tra trạng thái ===
docker compose ps                              # Trạng thái container
curl localhost:8080/actuator/health            # Health check auth
redis-cli -a $REDIS_PASSWORD INFO memory       # Redis memory
rabbitmqctl list_queues name messages          # Queue depth

# === Restart ===
docker compose restart <service>               # Restart 1 service
docker compose restart                         # Restart tất cả
docker compose down && docker compose up -d    # Restart hoàn toàn

# === Log ===
docker compose logs -f --tail=200 <service>    # Xem log realtime
docker compose logs --since="1h" <service>     # Log 1 giờ gần nhất

# === Backup ===
mysqldump -u root -p reborn_retail_crm | gzip > backup.sql.gz
redis-cli -a $REDIS_PASSWORD BGSAVE           # Trigger RDB save

# === Scale ===
docker compose up -d --scale sales=3           # Scale service
```
