# Performance Benchmark — Reborn-Tech B2B CRM

> Dự án: CRM doanh nghiệp lớn / công ty công nghệ (B2B)
> Ngày tạo: 2026-04-16
> Phiên bản: 1.0

---

## 1. Yêu cầu phi chức năng (NFR Targets)

| Chỉ số | Mục tiêu | Ngưỡng cảnh báo | Ngưỡng lỗi |
|--------|----------|-----------------|-------------|
| API Response P50 | < 200ms | > 300ms | > 500ms |
| API Response P95 | < 500ms | > 700ms | > 1000ms |
| API Response P99 | < 1000ms | > 1500ms | > 2000ms |
| Complex query (pipeline report, dashboard) | < 2s | > 3s | > 5s |
| Concurrent users | 200 users | - | - |
| Uptime | 99.5% | < 99.5% | < 99% |
| Error rate | < 0.1% | > 0.5% | > 1% |
| Database query | < 100ms (P95) | > 200ms | > 500ms |
| File upload (hợp đồng PDF, 10MB) | < 5s | > 8s | > 15s |
| Export Excel (1000 rows) | < 10s | > 15s | > 30s |

---

## 2. Frontend Performance

### 2.1. Bundle Analysis

| Metric | Mục tiêu | Công cụ đo |
|--------|----------|------------|
| Initial bundle size (gzip) | < 300KB | webpack-bundle-analyzer |
| Largest chunk | < 150KB | webpack-bundle-analyzer |
| Tree-shaking hiệu quả | Loại bỏ >= 40% unused code | bundle stats |
| Code splitting | Lazy load cho mỗi route/module | React.lazy + dynamic import |
| CSS bundle | < 80KB (gzip) | - |
| Image optimization | WebP, lazy loading, < 200KB/ảnh | - |

### 2.2. Lighthouse Targets

| Metric | Mục tiêu | Ghi chú |
|--------|----------|---------|
| Performance Score | >= 85 | Desktop mode |
| First Contentful Paint (FCP) | < 1.5s | |
| Largest Contentful Paint (LCP) | < 2.5s | |
| Time to Interactive (TTI) | < 3.5s | |
| Cumulative Layout Shift (CLS) | < 0.1 | |
| Total Blocking Time (TBT) | < 300ms | |
| Speed Index | < 3.0s | |

### 2.3. Chiến lược tối ưu Frontend

| Kỹ thuật | Mô tả | Ưu tiên |
|----------|-------|---------|
| Route-based code splitting | Mỗi module (Customer, Contract, Invoice...) lazy load riêng | Cao |
| Virtualized list | Dùng react-window cho danh sách > 100 items | Cao |
| API response caching | SWR/React Query stale-while-revalidate | Cao |
| Debounce search/filter | 300ms debounce cho input tìm kiếm | Trung bình |
| Memoization | React.memo cho component list item, useMemo cho computed | Trung bình |
| Service Worker | Cache static assets, offline fallback | Thấp |

---

## 3. API Benchmark — 10 Endpoint chính

### 3.1. Kết quả đo (mục tiêu)

Điều kiện test: 200 concurrent users, database 100K customers, 50K opportunities, 20K contracts.

| # | Endpoint | Method | Mô tả | P50 | P95 | P99 | RPS mục tiêu |
|---|----------|--------|-------|-----|-----|-----|---------------|
| 1 | `/api/customers?filter=...` | GET | Lọc khách hàng multi-field, phân trang 20 items | < 150ms | < 400ms | < 800ms | 100 |
| 2 | `/api/opportunities?stage=...` | GET | Danh sách cơ hội theo giai đoạn + nhân viên | < 120ms | < 350ms | < 700ms | 80 |
| 3 | `/api/contracts/:id` | GET | Chi tiết hợp đồng + điều khoản + phụ lục + lịch sử | < 100ms | < 300ms | < 600ms | 120 |
| 4 | `/api/invoices` | POST | Tạo hóa đơn từ hợp đồng, tính toán VAT | < 200ms | < 500ms | < 1000ms | 50 |
| 5 | `/api/bpm/start` | POST | Khởi tạo workflow phê duyệt hợp đồng | < 300ms | < 700ms | < 1200ms | 30 |
| 6 | `/api/reports/summary` | GET | Dashboard tổng hợp: doanh thu, pipeline, KPI | < 800ms | < 1800ms | < 3000ms | 20 |
| 7 | `/api/tickets?status=...` | GET | Danh sách ticket hỗ trợ, filter theo trạng thái | < 100ms | < 300ms | < 600ms | 80 |
| 8 | `/api/quotations/:id/pdf` | GET | Xuất báo giá PDF với danh mục sản phẩm | < 500ms | < 1200ms | < 2000ms | 20 |
| 9 | `/api/cashbook?period=...` | GET | Danh sách sổ quỹ theo kỳ, tính số dư | < 150ms | < 400ms | < 800ms | 60 |
| 10 | `/api/dashboard` | GET | Dashboard chính: widget tổng hợp, biểu đồ | < 600ms | < 1500ms | < 2500ms | 30 |

### 3.2. Công cụ benchmark

| Công cụ | Mục đích |
|---------|----------|
| k6 (Grafana) | Load test chính — script cho 10 endpoint, ramp-up scenario |
| Artillery | Smoke test hàng ngày trong CI/CD |
| Postman Collection Runner | Functional + response time check |
| pgbench | Database-level benchmark |

---

## 4. Database Performance

### 4.1. Index Strategy

| Bảng | Cột index | Loại | Lý do |
|------|-----------|------|-------|
| `customers` | `tenant_id, name` | B-tree composite | Filter + search theo tenant |
| `customers` | `tenant_id, industry, scale` | B-tree composite | Filter theo ngành + quy mô |
| `customers` | `tax_code` | Unique | Lookup theo MST |
| `customers` | `name, phone, email` | GIN trigram | Full-text search |
| `opportunities` | `tenant_id, stage, assigned_to` | B-tree composite | Pipeline view filter |
| `opportunities` | `tenant_id, expected_close_date` | B-tree composite | Forecast query |
| `contracts` | `tenant_id, status, customer_id` | B-tree composite | Contract list filter |
| `contracts` | `tenant_id, end_date` | B-tree | SLA reminder query |
| `invoices` | `tenant_id, status, due_date` | B-tree composite | Debt tracking query |
| `invoices` | `contract_id` | B-tree | Join contract → invoice |
| `cashbook_entries` | `tenant_id, date, type` | B-tree composite | Sổ quỹ theo kỳ |
| `activity_logs` | `tenant_id, entity_type, entity_id` | B-tree composite | Timeline per entity |
| `bpm_instances` | `tenant_id, status, created_at` | B-tree composite | Workflow monitoring |
| `tickets` | `tenant_id, status, priority, assigned_to` | B-tree composite | Ticket list filter |

### 4.2. Connection Pool

| Tham số | Giá trị | Ghi chú |
|---------|---------|---------|
| Pool size (min) | 10 | Idle connections |
| Pool size (max) | 50 | Peak load |
| Connection timeout | 5s | Fail fast nếu pool đầy |
| Idle timeout | 30s | Giải phóng connection không dùng |
| Statement timeout | 30s | Kill query chạy quá lâu |
| Max lifetime | 30 phút | Tránh stale connection |

### 4.3. Chiến lược tối ưu Database

| Kỹ thuật | Mô tả | Áp dụng cho |
|----------|-------|-------------|
| Materialized View | Pre-compute cho dashboard, báo cáo tổng hợp | Report summary, KPI dashboard |
| Redis Cache | Cache kết quả query 5 phút | Dashboard, dropdown options, config |
| Pagination bắt buộc | Mọi list API phải có limit (max 100) | Tất cả list endpoint |
| Query plan review | EXPLAIN ANALYZE cho query > 100ms | Sprint review hàng tuần |
| Partial index | Index chỉ cho active records | `WHERE status != 'deleted'` |
| Read replica | Tách read cho report queries | Khi > 100 concurrent users |

---

## 5. Scalability — Kịch bản tải

### 5.1. Dự phóng theo số concurrent users

| Chỉ số | 50 users | 100 users | 200 users | 500 users |
|--------|----------|-----------|-----------|-----------|
| **Hạ tầng** | | | | |
| API instances | 1 | 2 | 2 | 4 |
| CPU (vCPU) | 2 | 4 | 4 | 8 |
| RAM (GB) | 4 | 8 | 8 | 16 |
| DB instance | 1x (2vCPU/4GB) | 1x (4vCPU/8GB) | 1x (4vCPU/8GB) + read replica | 1x (8vCPU/16GB) + 2 read replica |
| Redis | 1x (1GB) | 1x (2GB) | 1x (2GB) | 1x cluster (4GB) |
| **Hiệu năng dự kiến** | | | | |
| API P95 | < 300ms | < 400ms | < 500ms | < 700ms |
| Dashboard load | < 1s | < 1.5s | < 2s | < 3s |
| Report export | < 5s | < 8s | < 10s | < 15s |
| DB connections active | ~15 | ~30 | ~50 | ~100 |
| **Chi phí ước tính (VND/tháng)** | | | | |
| Cloud hosting | 3M | 6M | 8M | 18M |
| Database managed | 2M | 4M | 6M | 12M |
| Redis + CDN + backup | 1M | 2M | 3M | 5M |
| **Tổng** | **6M** | **12M** | **17M** | **35M** |

### 5.2. Bottleneck dự kiến và giải pháp

| Mốc | Bottleneck | Giải pháp |
|-----|-----------|-----------|
| 100 users | Database connection pool đầy khi nhiều report query đồng thời | Tăng pool max lên 50, cache report result |
| 200 users | API server CPU spike khi xuất PDF/Excel đồng thời | Tách export sang worker queue (Bull/BullMQ), giới hạn concurrent export |
| 200 users | Dashboard query chậm do join nhiều bảng | Materialized view refresh mỗi 5 phút |
| 500 users | Single DB không đủ IOPS cho cả read + write | Read replica cho report/dashboard, write chỉ trên primary |
| 500 users | Redis single node memory limit | Redis cluster hoặc tăng instance size |

### 5.3. Monitoring và Alert

| Metric | Công cụ | Alert khi |
|--------|---------|-----------|
| API response time P95 | Grafana + Prometheus | > 500ms trong 5 phút |
| Error rate | Sentry + Grafana | > 1% trong 1 phút |
| CPU usage | Cloud monitoring | > 80% trong 5 phút |
| Memory usage | Cloud monitoring | > 85% |
| DB connections | pg_stat_activity | > 80% pool size |
| DB slow query | pg_stat_statements | Query > 1s |
| Redis memory | Redis INFO | > 80% maxmemory |
| Disk usage | Cloud monitoring | > 80% |
| Uptime | UptimeRobot / Healthcheck | Downtime > 1 phút |

---

## 6. Test Plan

### 6.1. Load Test Scenarios (k6)

| Scenario | Mô tả | Duration | VUs |
|----------|-------|----------|-----|
| Smoke | Kiểm tra hệ thống hoạt động | 1 phút | 5 |
| Average Load | Tải bình thường ngày làm việc | 10 phút | 50 |
| Stress | Tải cao — peak hour | 10 phút | 200 (ramp 0→200 trong 2 phút) |
| Spike | Đột biến tải (sau meeting, đầu tháng) | 5 phút | 0→500→0 |
| Soak | Kiểm tra memory leak, connection leak | 2 giờ | 100 |

### 6.2. Lịch chạy benchmark

| Thời điểm | Loại test | Môi trường |
|-----------|-----------|------------|
| Mỗi PR merge | Smoke test (CI/CD) | Staging |
| Hàng tuần (Thứ 6) | Average Load + Stress | Staging |
| Trước mỗi release | Full suite (5 scenarios) | Pre-production |
| Hàng tháng | Soak test + DB benchmark | Pre-production |

---

## 7. Lịch sử cập nhật

| Ngày | Người cập nhật | Nội dung |
|------|----------------|----------|
| 2026-04-16 | Team Reborn | Khởi tạo performance benchmark v1.0 |
