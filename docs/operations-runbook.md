# SLA & Operations Runbook — Reborn Loyalty (Siêu thị)

> Tài liệu vận hành cho hệ thống loyalty: 2 thương hiệu, 100+ cửa hàng, 3 triệu khách hàng.

---

## 1. Cam kết SLA

### 1.1 Uptime & Performance

| Chỉ số | Cam kết | Đo lường |
|---|---|---|
| Uptime hệ thống | **99.5%** (tối đa ~43.8h downtime/năm) | Monitoring tool (Uptime Robot / Prometheus) |
| API response P50 | < 200ms | APM metrics |
| API response P95 | **< 500ms** | APM metrics |
| API response P99 | < 1500ms | APM metrics |
| Thời gian phản hồi hỗ trợ | **< 2 giờ** trong giờ hành chính | Ticket system |
| Thời gian xử lý sự cố P1 | < 1 giờ | Incident log |
| Thời gian xử lý sự cố P2 | < 4 giờ | Incident log |

### 1.2 Maintenance Window

- **Bảo trì định kỳ:** Chủ nhật 02:00 – 06:00 (thông báo trước 48h)
- **Bảo trì khẩn cấp:** Bất kỳ lúc nào, thông báo ngay khi phát hiện
- **Thời gian bảo trì không tính vào SLA downtime**

---

## 2. Monitoring Setup

### 2.1 Health Checks

| Đối tượng | Endpoint / Cách kiểm tra | Tần suất | Alert nếu fail |
|---|---|---|---|
| Market service | `GET /bizapi/actuator/health` → 200 | 30 giây | 3 lần liên tiếp |
| Customer service | `GET /bizapi/actuator/health` → 200 | 30 giây | 3 lần liên tiếp |
| Notification service | `GET /bizapi/actuator/health` → 200 | 30 giây | 3 lần liên tiếp |
| Auth service | `GET /adminapi/actuator/health` → 200 | 30 giây | 3 lần liên tiếp |
| MySQL | TCP port 3306 + `SELECT 1` | 15 giây | 2 lần liên tiếp |
| Redis | `redis-cli ping` → PONG | 15 giây | 2 lần liên tiếp |
| RabbitMQ | Management API `/api/healthchecks/node` | 30 giây | 3 lần liên tiếp |
| Nginx | `GET /` → 200 | 30 giây | 2 lần liên tiếp |
| SSL certificate | Kiểm tra ngày hết hạn | 1 lần/ngày | < 30 ngày |

### 2.2 Metrics cần theo dõi

| Metric | Ngưỡng cảnh báo (Warning) | Ngưỡng nghiêm trọng (Critical) |
|---|---|---|
| CPU usage | > 70% trong 5 phút | > 90% trong 2 phút |
| RAM usage | > 75% | > 90% |
| Disk usage | > 75% | > 90% |
| DB connection pool | > 80% used | > 95% used |
| Redis memory | > 70% maxmemory | > 90% maxmemory |
| RabbitMQ queue depth | > 10.000 messages | > 50.000 messages |
| API error rate (5xx) | > 1% | > 5% |
| API latency P95 | > 500ms | > 2000ms |
| JVM heap usage | > 75% | > 90% |

### 2.3 Alert channels

| Mức độ | Kênh thông báo |
|---|---|
| Warning | Slack channel `#loyalty-alerts` |
| Critical | Slack + SMS + Phone call (on-call) |
| P1 Incident | Tất cả kênh + escalation tự động |

---

## 3. Sự cố thường gặp & Cách xử lý

### 3.1 Database Connection Pool Exhausted

**Triệu chứng:** API trả 500, log hiển thị `Cannot acquire connection from pool`

**Nguyên nhân:** Quá nhiều kết nối đồng thời hoặc slow query giữ connection lâu.

**Xử lý:**

```bash
# Kiểm tra số connection hiện tại
mysql -e "SHOW STATUS LIKE 'Threads_connected';"
mysql -e "SHOW PROCESSLIST;" | head -30

# Kill các slow query (> 60s)
mysql -e "SELECT id FROM information_schema.processlist WHERE time > 60 AND command != 'Sleep';" \
  | while read id; do mysql -e "KILL $id;"; done

# Tăng pool size tạm thời (restart service cần thiết)
# Trong application.yml:
#   spring.datasource.hikari.maximum-pool-size: 30 → 50

# Dài hạn: optimize slow query, thêm index
```

### 3.2 Redis Out of Memory (OOM)

**Triệu chứng:** Redis từ chối write, log `OOM command not allowed`

**Xử lý:**

```bash
# Kiểm tra memory
redis-cli INFO memory | grep used_memory_human

# Xoá cache không cần thiết
redis-cli --scan --pattern "cache:*" | head -100
redis-cli FLUSHDB  # CHỈ dùng khi chắc chắn toàn bộ là cache

# Kiểm tra key lớn nhất
redis-cli --bigkeys

# Tăng maxmemory (tạm thời, không cần restart)
redis-cli CONFIG SET maxmemory 8gb

# Đặt eviction policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Dài hạn: review TTL, tách session vs cache sang instance khác
```

### 3.3 RabbitMQ Queue Backlog

**Triệu chứng:** Notification (SMS, email, push) bị delay, queue depth tăng liên tục.

**Xử lý:**

```bash
# Kiểm tra queue
rabbitmqctl list_queues name messages consumers

# Nếu consumer chết → restart notification service
sudo systemctl restart reborn-notification

# Nếu quá tải → scale consumer
# Tăng concurrency trong application.yml:
#   spring.rabbitmq.listener.simple.concurrency: 5 → 15

# Purge queue (MẤT DỮ LIỆU — chỉ dùng khi chấp nhận mất message)
rabbitmqctl purge_queue notification_queue
```

### 3.4 JVM Heap Overflow / Frequent GC

**Triệu chứng:** Service chậm dần, CPU cao do GC, cuối cùng OutOfMemoryError.

**Xử lý:**

```bash
# Kiểm tra heap
jcmd <pid> GC.heap_info

# Heap dump để phân tích
jcmd <pid> GC.heap_dump /tmp/heapdump.hprof

# Tăng heap (cần restart)
# Sửa ExecStart trong systemd: -Xmx2g → -Xmx4g
sudo systemctl restart reborn-customer

# Dài hạn: phân tích heap dump bằng Eclipse MAT, fix memory leak
```

### 3.5 Frontend trắng trang / lỗi 404

**Triệu chứng:** Người dùng thấy trang trắng hoặc 404 khi navigate.

**Xử lý:**

```bash
# Kiểm tra Nginx
sudo nginx -t
sudo systemctl status nginx

# Kiểm tra file frontend tồn tại
ls -la /var/www/loyalty/index.html

# Kiểm tra try_files directive trong Nginx config
# Phải có: try_files $uri $uri/ /index.html;

# Clear browser cache hoặc thêm cache-bust
# Rebuild frontend nếu cần
npm run build:prod && cp -r dist/* /var/www/loyalty/
sudo nginx -s reload
```

---

## 4. Backup Strategy

### 4.1 MySQL Backup

| Loại | Tần suất | Retention | Vị trí |
|---|---|---|---|
| Full backup (mysqldump) | Hàng ngày 01:00 | 30 ngày | `/backup/mysql/daily/` + S3 |
| Binary log (point-in-time) | Liên tục | 7 ngày | `/var/lib/mysql/` |
| Weekly full backup | Chủ nhật 03:00 | 90 ngày | S3 Glacier |

**Script backup hàng ngày:**

```bash
#!/bin/bash
# /opt/reborn/scripts/backup-mysql.sh

BACKUP_DIR="/backup/mysql/daily"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="reborn_loyalty"

# Tạo backup
mysqldump -u backup_user -p${DB_BACKUP_PASSWORD} \
  --single-transaction \
  --routines --triggers --events \
  ${DB_NAME} | gzip > ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz

# Upload S3
aws s3 cp ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz \
  s3://reborn-backups/mysql/daily/

# Xoá backup cũ hơn 30 ngày
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete

# Verify backup
gzip -t ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz
echo "Backup completed: ${DB_NAME}_${DATE}.sql.gz"
```

**Cron job:**

```cron
0 1 * * * /opt/reborn/scripts/backup-mysql.sh >> /var/log/backup-mysql.log 2>&1
```

### 4.2 Point-in-Time Recovery

```bash
# Bước 1: Restore full backup gần nhất
gunzip < /backup/mysql/daily/reborn_loyalty_20260415.sql.gz | mysql -u root -p reborn_loyalty

# Bước 2: Apply binary log đến thời điểm mong muốn
mysqlbinlog --stop-datetime="2026-04-16 10:30:00" \
  /var/lib/mysql/binlog.000042 binlog.000043 | mysql -u root -p reborn_loyalty
```

### 4.3 Redis Backup

```bash
# RDB snapshot (tự động theo config)
# redis.conf: save 900 1 / save 300 10 / save 60 10000

# Backup thủ công
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backup/redis/dump_$(date +%Y%m%d).rdb
```

---

## 5. Incident Response

### 5.1 Phân loại mức độ nghiêm trọng

| Mức độ | Mô tả | Ví dụ | Thời gian phản hồi | Thời gian xử lý |
|---|---|---|---|---|
| **P1 — Critical** | Hệ thống sập hoàn toàn, ảnh hưởng toàn bộ người dùng | DB down, toàn bộ API 500 | 15 phút | 1 giờ |
| **P2 — High** | Chức năng chính không hoạt động | Tích điểm lỗi, đăng nhập fail | 30 phút | 4 giờ |
| **P3 — Medium** | Chức năng phụ lỗi, có workaround | Export báo cáo lỗi, notification delay | 2 giờ | 24 giờ |
| **P4 — Low** | Lỗi nhỏ, không ảnh hưởng nghiệp vụ | UI hiển thị sai format ngày | 8 giờ | 72 giờ |

### 5.2 Quy trình xử lý sự cố

```
1. PHÁT HIỆN    → Alert tự động hoặc báo cáo từ user
       │
2. ĐÁNH GIÁ     → Xác định mức độ (P1–P4)
       │
3. THÔNG BÁO    → Gửi alert theo kênh phù hợp
       │
4. ĐIỀU TRA     → Xem log, metrics, reproduce issue
       │
5. KHẮC PHỤC    → Hotfix / restart / rollback
       │
6. XÁC NHẬN     → Verify hệ thống hoạt động bình thường
       │
7. POST-MORTEM  → Viết báo cáo root cause, action items
```

### 5.3 Escalation Path

| Thời gian | Hành động |
|---|---|
| 0–15 phút | On-call engineer xử lý |
| 15–30 phút | Thêm senior engineer |
| 30–60 phút | Thông báo Tech Lead |
| 1–2 giờ | Thông báo CTO |
| > 2 giờ (P1) | Thông báo CEO, xem xét rollback toàn bộ |

---

## 6. Scheduled Maintenance & Cron Jobs

### 6.1 Cron Jobs hệ thống

| Job | Schedule | Mô tả | Service |
|---|---|---|---|
| `point_expiry` | Hàng ngày 00:00 | Kiểm tra & hết hạn điểm quá 12 tháng | customer |
| `tier_evaluation` | Ngày 1 mỗi tháng 02:00 | Đánh giá lại hạng thẻ theo tổng chi tiêu | customer |
| `daily_report` | Hàng ngày 06:00 | Tổng hợp báo cáo doanh thu, tích điểm | market |
| `cleanup_expired_sessions` | Hàng ngày 03:00 | Xoá session hết hạn trong Redis | auth |
| `backup_mysql` | Hàng ngày 01:00 | Full backup database | cron (server) |
| `cleanup_old_logs` | Hàng tuần Chủ nhật 04:00 | Xoá log > 30 ngày | cron (server) |
| `ssl_cert_check` | Hàng ngày 08:00 | Kiểm tra SSL sắp hết hạn | cron (server) |

### 6.2 Chi tiết cron entries

```cron
# /etc/cron.d/reborn-loyalty

# Backup MySQL hàng ngày
0 1 * * * reborn /opt/reborn/scripts/backup-mysql.sh >> /var/log/reborn/backup.log 2>&1

# Cleanup log files cũ
0 4 * * 0 reborn find /var/log/reborn -name "*.log" -mtime +30 -delete

# Kiểm tra SSL certificate
0 8 * * * reborn /opt/reborn/scripts/check-ssl-expiry.sh >> /var/log/reborn/ssl-check.log 2>&1

# Disk usage alert
0 */6 * * * reborn /opt/reborn/scripts/check-disk.sh >> /var/log/reborn/disk-check.log 2>&1
```

### 6.3 Bảo trì định kỳ hàng tháng

- [ ] Review slow query log, optimize query nếu cần
- [ ] Kiểm tra disk usage, dọn dẹp nếu > 70%
- [ ] Kiểm tra backup restore hoạt động (test restore lên staging)
- [ ] Review access log, kiểm tra request bất thường
- [ ] Update OS security patches
- [ ] Rotate API keys nếu đến hạn

---

## 7. Log Locations & Rotation

### 7.1 Vị trí log

| Thành phần | Đường dẫn log | Ghi chú |
|---|---|---|
| Market service | `/var/log/reborn/market.log` | Spring Boot log |
| Customer service | `/var/log/reborn/customer.log` | Spring Boot log |
| Notification service | `/var/log/reborn/notification.log` | Spring Boot log |
| Auth service | `/var/log/reborn/auth.log` | Spring Boot log |
| Nginx access | `/var/log/nginx/access.log` | Request log |
| Nginx error | `/var/log/nginx/error.log` | Error log |
| MySQL slow query | `/var/log/mysql/slow.log` | Query > 1s |
| MySQL error | `/var/log/mysql/error.log` | DB errors |
| Redis | `/var/log/redis/redis-server.log` | Redis log |
| RabbitMQ | `/var/log/rabbitmq/rabbit@hostname.log` | Queue log |
| Cron/Backup | `/var/log/reborn/backup.log` | Backup script output |

### 7.2 Log Rotation

```logrotate
# /etc/logrotate.d/reborn-loyalty
/var/log/reborn/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 reborn reborn
    postrotate
        # Signal Spring Boot to reopen log file
        systemctl reload reborn-market reborn-customer reborn-notification reborn-auth 2>/dev/null || true
    endscript
}
```

### 7.3 Log format chuẩn

```
2026-04-16 10:30:45.123 [http-nio-8082-exec-5] INFO  c.r.customer.service.PointService - Tích điểm: customer_id=12345, points=+500, total=15500
```

| Thành phần | Mô tả |
|---|---|
| Timestamp | ISO 8601 với milliseconds |
| Thread | Tên thread xử lý |
| Level | TRACE / DEBUG / INFO / WARN / ERROR |
| Logger | Class name |
| Message | Nội dung, bao gồm context (ID, giá trị) |

---

## 8. Security

### 8.1 API Key Rotation

| Key | Rotation period | Quy trình |
|---|---|---|
| JWT Secret | 90 ngày | Đổi trong `application.yml`, restart auth service |
| Firebase API Key | Khi bị leak | Regenerate trên Firebase Console, update `.env` |
| Database password | 90 ngày | `ALTER USER`, update config, restart services |
| Redis password | 90 ngày | `CONFIG SET requirepass`, update config |
| RabbitMQ password | 90 ngày | `rabbitmqctl change_password`, update config |
| SSL Certificate | Trước khi hết hạn (auto-renew) | Certbot tự gia hạn |

### 8.2 JWT Configuration

```yaml
jwt:
  secret: ${JWT_SECRET}          # 256-bit random string
  expiration: 86400              # Access token: 24 giờ
  refresh-expiration: 2592000    # Refresh token: 30 ngày
```

- Access token hết hạn → client dùng refresh token để lấy token mới
- Refresh token hết hạn → user phải đăng nhập lại
- Khi đổi JWT Secret → tất cả token hiện tại bị invalidate

### 8.3 Audit Log

Hệ thống ghi lại tất cả thao tác quan trọng:

| Sự kiện | Thông tin ghi lại |
|---|---|
| Đăng nhập | user_id, IP, thời gian, thành công/thất bại |
| Thay đổi quyền | admin_id, target_user, old_role, new_role |
| Tích/trừ điểm | staff_id, customer_id, points, lý do |
| Export dữ liệu | user_id, loại export, số record |
| Xoá dữ liệu | user_id, table, record_id |

**Review audit log hàng tuần:**

```sql
-- Đăng nhập thất bại nhiều lần (brute force?)
SELECT username, COUNT(*) AS fail_count, MAX(created_at) AS last_attempt
FROM audit_log
WHERE action = 'LOGIN_FAILED'
  AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY username
HAVING fail_count > 10
ORDER BY fail_count DESC;

-- Thao tác bất thường ngoài giờ làm việc
SELECT *
FROM audit_log
WHERE HOUR(created_at) NOT BETWEEN 7 AND 22
  AND action IN ('DELETE', 'EXPORT', 'CHANGE_ROLE')
  AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### 8.4 Network Security

- Firewall chỉ mở port 80 (HTTP) và 443 (HTTPS) ra public
- MySQL (3306), Redis (6379), RabbitMQ (5672) chỉ cho phép kết nối nội bộ
- SSH (22) chỉ cho phép từ IP whitelist
- Cài fail2ban chống brute force SSH

---

## 9. Capacity Planning

### 9.1 Hiện tại (baseline)

| Metric | Giá trị |
|---|---|
| Số khách hàng | 3.000.000 |
| Số cửa hàng | 100+ |
| Giao dịch/ngày (ước tính) | ~50.000 |
| API requests/ngày | ~500.000 |
| Database size | ~15 GB |
| Redis memory | ~2 GB |

### 9.2 Dự phóng tăng trưởng

| Thời điểm | Khách hàng | Giao dịch/ngày | DB size | Hành động |
|---|---|---|---|---|
| Hiện tại | 3M | 50K | 15 GB | Baseline |
| +6 tháng | 3.5M | 65K | 25 GB | Monitor |
| +1 năm | 4M | 80K | 40 GB | Xem xét tăng RAM DB lên 32 GB |
| +2 năm | 5M | 120K | 80 GB | Tách read replica, tăng disk |
| +3 năm | 6M+ | 150K+ | 120 GB+ | Xem xét sharding hoặc chuyển Aurora |

### 9.3 Ngưỡng cần scale

| Tài nguyên | Ngưỡng cần hành động | Hành động |
|---|---|---|
| DB disk > 70% | Scale disk lên gấp đôi | Expand EBS / thêm disk |
| DB CPU > 70% liên tục | Tối ưu query hoặc scale up | Thêm index, read replica |
| Redis memory > 70% | Tăng maxmemory hoặc tách instance | Scale up RAM |
| API latency P95 > 500ms liên tục | Scale backend | Thêm instance, load balancer |
| RabbitMQ queue > 10K liên tục | Scale consumer | Tăng concurrency hoặc thêm instance |

---

## 10. Contact & Escalation Matrix

### 10.1 Đội vận hành

| Vai trò | Người | Liên hệ | Ghi chú |
|---|---|---|---|
| On-call Engineer | (Theo lịch trực) | Slack + Phone | Luân phiên hàng tuần |
| Senior Engineer | TBD | Slack + Phone | Escalation level 2 |
| Tech Lead | TBD | Slack + Phone | Escalation level 3 |
| DevOps/Infra | TBD | Slack + Phone | Server, network, DB |
| CTO | TBD | Phone | P1 kéo dài > 1h |
| CEO | ceo@reborn.vn | Phone + Email | P1 kéo dài > 2h |

### 10.2 Vendor/Bên thứ ba

| Dịch vụ | Vendor | Support contact | SLA |
|---|---|---|---|
| Cloud hosting | AWS / GCP / On-prem | Support portal | Theo plan |
| SMS Gateway | TBD | Hotline + Email | 99.5% uptime |
| Email service | TBD | Support ticket | 99.9% uptime |
| Firebase (Push) | Google | Firebase Support | Best effort |
| Domain / SSL | TBD | Support portal | — |

### 10.3 Lịch trực On-call

| Tuần | Người trực chính | Người trực phụ |
|---|---|---|
| Tuần 1 (T2–CN) | Engineer A | Engineer B |
| Tuần 2 (T2–CN) | Engineer B | Engineer C |
| Tuần 3 (T2–CN) | Engineer C | Engineer A |
| (Lặp lại) | ... | ... |

**Quy định on-call:**
- Phản hồi alert trong 15 phút
- Sẵn sàng remote access 24/7 trong tuần trực
- Nếu không xử lý được trong 30 phút → escalate
- Handoff cuối tuần: viết summary các incident đã xử lý

---

## Phụ lục: Quick Reference

### Lệnh thường dùng

```bash
# Restart service
sudo systemctl restart reborn-{market,customer,notification,auth}

# Xem log realtime
journalctl -u reborn-customer -f

# Kiểm tra tất cả service
for svc in market customer notification auth; do
  echo "=== reborn-$svc ==="
  sudo systemctl status reborn-$svc --no-pager | head -5
done

# Kiểm tra disk
df -h /var/lib/mysql /var/log /backup

# Kiểm tra DB connection
mysql -e "SHOW STATUS LIKE 'Threads_%';"

# Kiểm tra Redis
redis-cli INFO memory | grep used_memory_human
redis-cli INFO clients | grep connected_clients

# Kiểm tra RabbitMQ
rabbitmqctl list_queues name messages consumers
```
