# SLA & Operations Runbook — Reborn Tech B2B CRM

> **Nhanh:** reborn-tech
> **Phien ban:** 1.0 | Cap nhat: 2026-04-16
> **Doi tuong doc:** DevOps, SRE, On-call Engineer
> **Quy mo:** 50 – 500 nguoi dung dong thoi

---

## Muc luc

1. [SLA Cam ket](#1-sla-cam-ket)
2. [Monitoring & Alerting](#2-monitoring--alerting)
3. [Cac su co thuong gap & Cach xu ly](#3-cac-su-co-thuong-gap--cach-xu-ly)
4. [Backup & Recovery](#4-backup--recovery)
5. [Incident Response](#5-incident-response)
6. [Bao mat Van hanh](#6-bao-mat-van-hanh)
7. [Capacity Planning](#7-capacity-planning)

---

## 1. SLA Cam ket

### Muc tieu kha dung

| Chi so | Muc tieu | Ghi chu |
|--------|----------|---------|
| Uptime | 99.5% | Tinh theo thang, tru thoi gian bao tri co thong bao truoc |
| Downtime cho phep | <= 3.6 gio/thang | |
| RTO (Recovery Time Objective) | <= 1 gio | Thoi gian phuc hoi toi da |
| RPO (Recovery Point Objective) | <= 1 gio | Mat du lieu toi da 1 gio |
| Response time P95 | <= 500ms | API response, khong tinh upload file |
| Response time P99 | <= 1500ms | |

### Phan loai su co

| Muc do | Mo ta | Thoi gian phan hoi | Thoi gian xu ly |
|--------|-------|---------------------|-----------------|
| P1 — Critical | He thong khong truy cap duoc, mat du lieu | 15 phut | 1 gio |
| P2 — High | Chuc nang chinh khong hoat dong (ban hang, hop dong) | 30 phut | 4 gio |
| P3 — Medium | Chuc nang phu loi, anh huong 1 nhom nguoi dung | 2 gio | 1 ngay lam viec |
| P4 — Low | Loi giao dien, typo, cai tien nho | 1 ngay | 1 tuan |

### Thoi gian bao tri dinh ky

- **Khi nao:** Thu 7 hang tuan, 02:00 – 04:00 (GMT+7)
- **Thong bao:** It nhat 24 gio truoc qua email + banner he thong
- **Thoi luong toi da:** 2 gio

---

## 2. Monitoring & Alerting

### Stack khuyen nghi

| Thanh phan | Cong cu | Muc dich |
|------------|---------|---------|
| Metrics | Prometheus + Grafana | CPU, RAM, disk, request rate, response time |
| Logs | ELK Stack (Elasticsearch + Logstash + Kibana) | Tap trung log 12 service |
| APM | Grafana Tempo hoac Jaeger | Distributed tracing |
| Uptime | UptimeRobot hoac Grafana Synthetic | Ping endpoint /health moi 1 phut |
| Alerting | Grafana Alerting → Telegram/Zalo/Email | Canh bao theo nguong |

### Cac metric can giam sat

| Metric | Nguong canh bao (Warning) | Nguong nguy hiem (Critical) |
|--------|---------------------------|----------------------------|
| CPU usage | > 70% trong 5 phut | > 90% trong 2 phut |
| RAM usage | > 75% | > 90% |
| Disk usage | > 80% | > 90% |
| MySQL connections | > 300 | > 450 (max 500) |
| MySQL slow queries | > 10/phut | > 50/phut |
| Redis memory | > 75% maxmemory | > 90% |
| RabbitMQ queue depth | > 10,000 messages | > 50,000 messages |
| API error rate (5xx) | > 1% | > 5% |
| API response P95 | > 500ms | > 1500ms |
| SSL cert expiry | < 30 ngay | < 7 ngay |
| Disk I/O wait | > 20% | > 40% |

### Cau hinh Prometheus (trich)

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'reborn-services'
    static_configs:
      - targets:
          - '127.0.0.1:9001'
          - '127.0.0.1:9002'
          - '127.0.0.1:9003'
          - '127.0.0.1:9004'
          - '127.0.0.1:9005'
          - '127.0.0.1:9006'
          - '127.0.0.1:9007'
          - '127.0.0.1:9008'
          - '127.0.0.1:9009'
          - '127.0.0.1:9010'
          - '127.0.0.1:9011'
          - '127.0.0.1:9012'

  - job_name: 'mysql'
    static_configs:
      - targets: ['127.0.0.1:9104']

  - job_name: 'redis'
    static_configs:
      - targets: ['127.0.0.1:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['127.0.0.1:9113']
```

### Canh bao Telegram (mau Grafana)

```
{{ .Status }} | {{ .CommonLabels.alertname }}
Severity: {{ .CommonLabels.severity }}
Service: {{ .CommonLabels.instance }}
Value: {{ .CommonAnnotations.value }}
Time: {{ .StartsAt.Format "2006-01-02 15:04:05" }}
```

---

## 3. Cac su co thuong gap & Cach xu ly

### 3.1 Service khong phan hoi (502 Bad Gateway)

**Trieu chung:** Nginx tra 502, nguoi dung thay trang loi

**Nguyen nhan thuong gap:**
- Service backend crash hoac restart
- Port bi conflict
- Het memory

**Xu ly:**

```bash
# 1. Xac dinh service nao die
docker compose ps | grep -v "Up"

# 2. Xem log service do
docker compose logs --tail=200 customer

# 3. Restart service
docker compose restart customer

# 4. Neu van khong len, kiem tra resource
docker stats --no-stream

# 5. Neu het RAM, tang limit hoac kill process khong can thiet
```

### 3.2 Database connection exhausted

**Trieu chung:** API tra loi cham, log bao "Too many connections"

**Xu ly:**

```bash
# 1. Kiem tra so connection hien tai
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
mysql -u root -p -e "SHOW PROCESSLIST;" | head -30

# 2. Kill connection idle lau
mysql -u root -p -e "
SELECT id, user, host, db, time, state
FROM information_schema.processlist
WHERE time > 300 AND command = 'Sleep'
ORDER BY time DESC;
"

# 3. Tang max_connections neu can
mysql -u root -p -e "SET GLOBAL max_connections = 600;"

# 4. Kiem tra connection pool config cua service
# Dieu chinh DB_POOL_SIZE trong .env
```

### 3.3 Redis memory day

**Trieu chung:** API cham, session mat, cache khong hoat dong

**Xu ly:**

```bash
# 1. Kiem tra memory
redis-cli -a <password> INFO memory

# 2. Xoa cache cu (khong anh huong session)
redis-cli -a <password> --scan --pattern "cache:*" | xargs redis-cli -a <password> DEL

# 3. Kiem tra key lon nhat
redis-cli -a <password> --bigkeys

# 4. Cau hinh eviction policy
redis-cli -a <password> CONFIG SET maxmemory-policy allkeys-lru
```

### 3.4 Disk day

**Trieu chung:** Ghi log/upload that bai, database error

**Xu ly:**

```bash
# 1. Tim thu muc chiem nhieu dung luong
du -sh /var/log/* /data/uploads/* /var/lib/mysql/* | sort -rh | head -10

# 2. Don dep log cu
find /var/log -name "*.log" -mtime +30 -delete
docker system prune -f

# 3. Rotate log
logrotate -f /etc/logrotate.d/reborn-crm

# 4. Xoa backup cu (giu 7 ngay gan nhat)
find /backup -name "*.sql.gz" -mtime +7 -delete
```

### 3.5 SSL certificate het han

**Trieu chung:** Trinh duyet bao "Not Secure", API call that bai

**Xu ly:**

```bash
# 1. Kiem tra ngay het han
openssl x509 -enddate -noout -in /etc/letsencrypt/live/reborn.vn/fullchain.pem

# 2. Gia han
certbot renew

# 3. Reload Nginx
nginx -t && systemctl reload nginx
```

### 3.6 RabbitMQ queue bi nghen

**Trieu chung:** Notification/email khong gui, BPM workflow khong chay

**Xu ly:**

```bash
# 1. Kiem tra queue
rabbitmqctl list_queues name messages consumers

# 2. Kiem tra consumer con song khong
docker compose ps notification bpm

# 3. Restart consumer
docker compose restart notification bpm

# 4. Neu queue qua lon, purge (MAT du lieu trong queue)
# Chi lam khi da xac nhan khong can cac message cu
rabbitmqctl purge_queue <queue_name>
```

---

## 4. Backup & Recovery

### Chien luoc backup

| Du lieu | Tan suat | Giu lai | Vi tri | Phuong phap |
|---------|----------|---------|--------|-------------|
| MySQL (full) | Hang ngay 02:00 | 30 ngay | Local + S3 | mysqldump |
| MySQL (binlog) | Lien tuc | 7 ngay | Local | Binary log |
| Redis (RDB) | Moi 6 gio | 7 ngay | Local | BGSAVE |
| File upload | Hang ngay 03:00 | 90 ngay | S3 | rsync |
| Config files | Moi thay doi | Vinh vien | Git | git commit |

### Script backup tu dong

```bash
#!/bin/bash
# /opt/reborn/scripts/backup.sh
# Chay hang ngay qua crontab

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
S3_BUCKET="s3://reborn-backup/crm"

# 1. MySQL full backup
mysqldump -u reborn_app -p"${DB_PASSWORD}" \
  --single-transaction --routines --triggers --events \
  reborn_master | gzip > "${BACKUP_DIR}/mysql/reborn_master_${DATE}.sql.gz"

# 2. Upload S3
aws s3 cp "${BACKUP_DIR}/mysql/reborn_master_${DATE}.sql.gz" \
  "${S3_BUCKET}/mysql/"

# 3. Upload files
rsync -az /data/uploads/ "${BACKUP_DIR}/uploads/"
aws s3 sync "${BACKUP_DIR}/uploads/" "${S3_BUCKET}/uploads/"

# 4. Don dep backup cu (local)
find "${BACKUP_DIR}/mysql" -name "*.sql.gz" -mtime +30 -delete
find "${BACKUP_DIR}/uploads" -mtime +90 -delete

echo "[$(date)] Backup hoan tat" >> /var/log/reborn-backup.log
```

### Crontab

```bash
# Backup MySQL hang ngay luc 02:00
0 2 * * * /opt/reborn/scripts/backup.sh >> /var/log/reborn-backup.log 2>&1

# Redis BGSAVE moi 6 gio
0 */6 * * * redis-cli -a <password> BGSAVE
```

### Phuc hoi (Recovery)

```bash
# 1. Phuc hoi MySQL tu backup
gunzip < /backup/mysql/reborn_master_<date>.sql.gz | mysql -u root -p reborn_master

# 2. Phuc hoi tu S3
aws s3 cp s3://reborn-backup/crm/mysql/reborn_master_<date>.sql.gz /tmp/
gunzip < /tmp/reborn_master_<date>.sql.gz | mysql -u root -p reborn_master

# 3. Phuc hoi file upload
aws s3 sync s3://reborn-backup/crm/uploads/ /data/uploads/

# 4. Restart services
docker compose restart
```

### Kiem tra backup dinh ky

- **Hang tuan:** Verify backup file ton tai va kich thuoc hop ly
- **Hang thang:** Restore thu len moi truong staging, kiem tra du lieu do day du
- **Ghi nhan:** Log ket qua vao file /var/log/reborn-backup-verify.log

---

## 5. Incident Response

### Quy trinh xu ly su co

```
Phat hien → Phan loai (P1-P4) → Thong bao → Xu ly → Xac nhan → Post-mortem
```

### Buoc 1: Phat hien

- Alert tu Prometheus/Grafana
- Bao cao tu nguoi dung
- Uptime monitor

### Buoc 2: Phan loai

Xac dinh muc do P1–P4 theo bang o muc 1.

### Buoc 3: Thong bao

| Muc do | Thong bao ai | Kenh |
|--------|-------------|------|
| P1 | Toan bo team + CEO | Telegram nhom + Goi dien |
| P2 | Team DevOps + Tech Lead | Telegram nhom |
| P3 | DevOps on-call | Telegram ca nhan |
| P4 | Log vao backlog | Jira/GitHub Issues |

**Mau thong bao:**

```
[P1 — CRITICAL] He thong CRM khong truy cap duoc
Thoi diem: 2026-04-16 14:30 GMT+7
Anh huong: Tat ca nguoi dung khong dang nhap duoc
Trang thai: Dang xu ly
Nguoi xu ly: <ten>
ETA: 30 phut
```

### Buoc 4: Xu ly

1. **Triage:** Xac dinh root cause (log, metrics, recent changes)
2. **Mitigation:** Giam thieu anh huong ngay (restart, rollback, scale)
3. **Fix:** Ap dung ban sua loi
4. **Verify:** Xac nhan he thong hoat dong binh thuong

### Buoc 5: Post-mortem (voi P1, P2)

Viet bao cao trong 48 gio, bao gom:

- Timeline chi tiet
- Root cause
- Impact (so nguoi dung anh huong, thoi gian downtime)
- Hanh dong khac phuc
- Bai hoc rut ra
- Action items de phong lan sau

---

## 6. Bao mat Van hanh

### Checklist bao mat

| Hang muc | Tan suat | Mo ta |
|----------|----------|-------|
| Cap nhat OS patches | Hang thang | `apt update && apt upgrade` |
| Cap nhat Docker images | Hang thang | Pull latest security patches |
| Rotate JWT Secret | Hang quy | Doi JWT_SECRET, deploy lai |
| Rotate DB password | Hang quy | Doi password MySQL, cap nhat .env |
| Review firewall rules | Hang thang | Chi mo port 80, 443, SSH (IP whitelist) |
| Kiem tra log truy cap bat thuong | Hang tuan | Tim brute force, SQL injection attempts |
| Scan lo hong bao mat | Hang thang | `docker scout`, `npm audit` |
| Backup test restore | Hang thang | Restore len staging, verify |

### Firewall (UFW)

```bash
# Chi cho phep cac port can thiet
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Restrict SSH theo IP
ufw delete allow 22/tcp
ufw allow from <office-ip> to any port 22

ufw enable
```

### Fail2Ban cho SSH va Nginx

```ini
# /etc/fail2ban/jail.local
[sshd]
enabled = true
maxretry = 5
bantime = 3600

[nginx-http-auth]
enabled = true
maxretry = 10
bantime = 600

[nginx-botsearch]
enabled = true
maxretry = 5
bantime = 86400
```

### CORS Policy

Chi cho phep cac domain:

```
https://biz.reborn.vn
https://*.reborn.vn
```

---

## 7. Capacity Planning

### Quy mo hien tai va du kien

| Chi so | Hien tai | 6 thang toi | 12 thang toi |
|--------|----------|-------------|--------------|
| So tenant | 5 | 20 | 50 |
| Nguoi dung dong thoi | 50 | 200 | 500 |
| So khach hang (tong) | 10,000 | 50,000 | 200,000 |
| So hop dong/thang | 500 | 2,000 | 5,000 |
| Dung luong DB | 5 GB | 20 GB | 80 GB |
| Dung luong upload | 10 GB | 50 GB | 200 GB |
| API requests/phut | 500 | 2,000 | 5,000 |

### Ke hoach mo rong

#### Giai doan 1: 50 – 100 nguoi dung (hien tai)

- **Server:** 1 server (8 vCPU, 16 GB RAM)
- **Database:** Single MySQL instance
- **Cache:** Single Redis
- **Khong can:** Load balancer, DB replication

#### Giai doan 2: 100 – 300 nguoi dung

- **Server:** 2 server (Load Balancer phia truoc)
- **Database:** MySQL Primary + 1 Replica (read)
- **Cache:** Redis Sentinel (HA)
- **Them:** CDN cho static assets

#### Giai doan 3: 300 – 500 nguoi dung

- **Server:** 3+ server + Kubernetes (tuy chon)
- **Database:** MySQL Primary + 2 Replica + ProxySQL
- **Cache:** Redis Cluster
- **Queue:** RabbitMQ Cluster (3 node)
- **Them:** Object storage (S3) cho upload, read/write splitting

### Dau hieu can scale

| Dau hieu | Hanh dong |
|----------|---------|
| CPU > 70% lien tuc 1 tuan | Them server, cai dat load balancer |
| RAM > 80% | Tang RAM hoac tach service ra server rieng |
| DB connections > 400 | Them read replica, toi uu query |
| API P95 > 800ms | Profiling, them cache, toi uu DB index |
| Disk > 70% | Tang disk, chuyen upload sang S3 |
| Queue depth tang lien tuc | Them consumer, kiem tra bottleneck |

### Chi phi uoc tinh (VPS/Cloud VN)

| Giai doan | Cau hinh | Chi phi/thang (VND) |
|-----------|---------|---------------------|
| 1 (50 user) | 1x 8vCPU/16GB | 2,000,000 – 3,000,000 |
| 2 (200 user) | 2x 8vCPU/16GB + LB | 5,000,000 – 7,000,000 |
| 3 (500 user) | 3x 8vCPU/32GB + LB + S3 | 10,000,000 – 15,000,000 |

---

## Lien he

- **On-call primary:** DevOps team — Telegram group "Reborn Ops"
- **Escalation:** ceo@reborn.vn
- **Repository:** github.com/reborn-vn/cloud-crm (nhanh reborn-tech)
