# Performance Benchmark & Test Report — Reborn Retail CRM

**Phiên bản:** 1.0  
**Ngày lập:** 2026-04-16  
**Lập bởi:** Reborn Engineering Team  
**Hệ thống:** Reborn Retail CRM — Quản lý chuỗi bán lẻ  
**Trạng thái:** Target benchmarks — chưa chạy actual load test

---

## 1. Tóm tắt

### 1.1 Phạm vi

Đánh giá hiệu năng toàn diện cho Reborn Retail CRM bao gồm:
- **Frontend** — Bundle size, Lighthouse scores, render performance
- **API** — Response time, throughput, concurrency
- **Database** — Query performance, index strategy, connection pool
- **Scalability** — Dự phóng theo quy mô chuỗi bán lẻ

### 1.2 Công cụ

| Công cụ | Mục đích |
|---|---|
| **k6** (Grafana) | API load testing, stress testing |
| **JMeter** | Kịch bản phức tạp, distributed load test |
| **Lighthouse** | Frontend performance audit |
| **Vite Bundle Analyzer** | Bundle size analysis |
| **pg_stat_statements** | PostgreSQL query profiling |
| **Grafana + Prometheus** | Monitoring trong quá trình test |

### 1.3 Môi trường test

| Hạng mục | Cấu hình |
|---|---|
| API Server | 4 vCPU, 8GB RAM, Ubuntu 22.04 |
| Database | PostgreSQL 15, 8 vCPU, 32GB RAM, SSD NVMe |
| Load Generator | k6 cloud hoặc 2x EC2 c5.2xlarge |
| Network | Same VPC, latency < 1ms |
| Data seed | 1M invoices, 500K customers, 100K products, 50 branches |

### 1.4 Key Metrics tổng quan

| Metric | Target | Ghi chú |
|---|---|---|
| API P95 | < 500ms | Cho tất cả endpoints chính |
| API P99 | < 1s | Chấp nhận spike nhẹ |
| POS Invoice Create | < 300ms | Critical path cho bán hàng |
| FCP (First Contentful Paint) | < 2s | 3G throttled |
| LCP (Largest Contentful Paint) | < 3s | 3G throttled |
| Concurrent Users | 500 | Simultaneous active sessions |
| Error Rate | < 0.1% | Dưới tải bình thường |

---

## 2. Mục tiêu hiệu năng (Non-Functional Requirements)

### 2.1 Response Time

| Hạng mục | P50 | P95 | P99 | Max |
|---|---|---|---|---|
| API — Read (list/detail) | < 200ms | < 500ms | < 1s | < 2s |
| API — Write (create/update) | < 300ms | < 500ms | < 1s | < 2s |
| API — POS Invoice Create | < 150ms | < 300ms | < 500ms | < 1s |
| API — Report/Aggregate | < 1s | < 3s | < 5s | < 10s |
| Frontend — Page Navigation | < 500ms | < 1s | — | — |

### 2.2 Throughput

| Hạng mục | Target RPS | Ghi chú |
|---|---|---|
| API tổng | 2,000 | Tất cả endpoints cộng lại |
| Invoice Create | 200 | Peak hour (lúc cao điểm bán hàng) |
| Customer Query | 500 | Bao gồm autocomplete search |
| Report Generate | 20 | Report nặng, chấp nhận RPS thấp |

### 2.3 Concurrency

| Hạng mục | Target |
|---|---|
| Concurrent users (active session) | 500 |
| Concurrent POS terminals | 200 |
| Concurrent API connections | 1,000 |
| WebSocket connections (notifications) | 500 |

### 2.4 Data Volume

| Bảng | Số lượng bản ghi | Ghi chú |
|---|---|---|
| Invoices (hoá đơn) | 1,000,000 | 2 năm dữ liệu |
| Invoice Items | 5,000,000 | Trung bình 5 items/invoice |
| Customers (khách hàng) | 500,000 | Across all tenants |
| Products (sản phẩm) | 100,000 | Bao gồm variants |
| Stock Movements | 3,000,000 | Nhập/xuất/kiểm kê |
| Cashbook Entries | 500,000 | Thu/chi tiền mặt |
| Audit Logs | 10,000,000 | Mọi thao tác CRUD |

---

## 3. Frontend Performance

### 3.1 Bundle Analysis

| Chunk | Estimated Size | Ghi chú |
|---|---|---|
| `main.[hash].js` | ~800KB (gzipped) | Core React app, routing, shared components |
| `vendor.[hash].js` | ~1.2MB (gzipped) | node_modules — phần không code-split được |
| `slate-editor.[hash].js` | ~250KB (gzipped) | Slate rich text editor — lazy loaded |
| `ag-grid.[hash].js` | ~350KB (gzipped) | ag-grid-community — lazy loaded |
| `bpmn.[hash].js` | ~400KB (gzipped) | bpmn-js + form-js — lazy loaded |
| `exceljs.[hash].js` | ~200KB (gzipped) | Excel export — lazy loaded |
| `highcharts.[hash].js` | ~150KB (gzipped) | Charts — lazy loaded |
| CSS tổng | ~150KB (gzipped) | SCSS compiled |
| **Tổng (initial load)** | **~2.0MB** (gzipped) | main + vendor + CSS |
| **Tổng (tất cả chunks)** | **~3.5MB** (gzipped) | Bao gồm lazy chunks |

### 3.2 Lighthouse Scores — Target

| Metric | Target | Mức hiện tại (ước lượng) | Ghi chú |
|---|---|---|---|
| Performance | >= 80 | 55-65 | Bundle lớn kéo điểm xuống |
| Accessibility | >= 90 | 70-80 | Cần audit a11y |
| Best Practices | >= 90 | 80-85 | Console warnings, deprecated APIs |
| SEO | >= 80 | 60-70 | SPA — cần meta tags, SSR không áp dụng |

### 3.3 Heavy Dependencies — Lazy Load Strategy

| Package | Size (unpacked) | Chiến lược | Ưu tiên |
|---|---|---|---|
| `slate` + `slate-react` + `slate-history` | ~500KB | `React.lazy()` — load khi mở editor | High |
| `ag-grid-community` + `ag-grid-react` | ~800KB | `React.lazy()` — load khi vào trang có grid | High |
| `bpmn-js` + `@bpmn-io/form-js` | ~1.5MB | `React.lazy()` — load khi vào module workflow | High |
| `exceljs` | ~400KB | Dynamic `import()` — load khi user click Export | Medium |
| `highcharts` | ~350KB | `React.lazy()` — load khi vào dashboard/report | Medium |
| `jsoneditor` | ~250KB | Dynamic `import()` — chỉ dùng ở settings | Low |
| `reactflow` | ~200KB | `React.lazy()` — load khi vào workflow designer | Medium |
| `firebase` | ~300KB | Tree-shake — chỉ import messaging module | Medium |

### 3.4 Khuyến nghị tối ưu Frontend

| # | Hành động | Impact | Effort |
|---|---|---|---|
| 1 | **Code-split heavy dependencies** — Lazy load Slate, ag-grid, bpmn-js, exceljs, highcharts | Giảm initial load ~40% | Medium |
| 2 | **Tree-shake firebase** — Chỉ import `firebase/messaging`, không import toàn bộ SDK | Giảm ~200KB | Low |
| 3 | **Loại bỏ duplicate packages** — Bỏ `react-color` (giữ `react-colorful`), bỏ `xlsx` (giữ `exceljs`) | Giảm ~150KB | Low |
| 4 | **date-fns tree-shaking** — Đã dùng `date-fns@4` — đảm bảo import trực tiếp function, không import toàn bộ | Verify OK | Low |
| 5 | **CDN cho static assets** — Serve JS/CSS/images qua CloudFront hoặc CDN | Giảm TTFB 50-70% | Medium |
| 6 | **Prefetch route chunks** — `<link rel="prefetch">` cho các route phổ biến (invoice, customer) | Giảm navigation time | Low |

---

## 4. API Performance

### 4.1 Benchmark Table — Target

> **Lưu ý:** Các số liệu dưới đây là **TARGET benchmarks**. Actual test sẽ được chạy sau khi deploy lên staging environment với data seed đầy đủ.

| # | Endpoint | Method | Avg (ms) | P95 (ms) | P99 (ms) | Target RPS | Status |
|---|---|---|---|---|---|---|---|
| 1 | `/api/customers?filter=...` | GET | 150 | 400 | 800 | 300 | Target |
| 2 | `/api/invoices` (create POS) | POST | 120 | 280 | 450 | 200 | Target |
| 3 | `/api/invoices?page=1&limit=20` | GET | 180 | 450 | 900 | 200 | Target |
| 4 | `/api/products?category=...` | GET | 100 | 300 | 600 | 500 | Target |
| 5 | `/api/stock/query?branch=...` | GET | 200 | 500 | 1000 | 150 | Target |
| 6 | `/api/cashbook?date_range=...` | GET | 180 | 450 | 800 | 100 | Target |
| 7 | `/api/promotions/check-eligible` | POST | 80 | 200 | 400 | 300 | Target |
| 8 | `/api/loyalty/wallet/:customer_id` | GET | 50 | 150 | 300 | 200 | Target |
| 9 | `/api/reports/summary` | GET | 800 | 2500 | 4500 | 20 | Target |
| 10 | `/api/shifts/open` | POST | 100 | 250 | 500 | 50 | Target |

### 4.2 Kịch bản Load Test

#### Scenario 1 — Normal Load (giờ bình thường)
- 100 concurrent users
- 70% read (list, detail, search)
- 30% write (create invoice, update customer)
- Duration: 30 phút
- Expected: P95 < 500ms, error rate < 0.1%

#### Scenario 2 — Peak Load (giờ cao điểm)
- 300 concurrent users
- 60% POS invoice create
- 40% mixed (customer lookup, stock query, promotion check)
- Duration: 15 phút
- Expected: P95 < 800ms, error rate < 0.5%

#### Scenario 3 — Stress Test
- Ramp 0 → 500 users trong 10 phút
- Giữ 500 users trong 20 phút
- Expected: Xác định breaking point, không crash

#### Scenario 4 — Spike Test
- 100 users baseline → spike lên 500 trong 30 giây → quay lại 100
- Expected: Recovery time < 2 phút, không data loss

### 4.3 k6 Test Script (mẫu)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp up
    { duration: '10m', target: 100 },   // steady
    { duration: '5m', target: 300 },    // peak
    { duration: '10m', target: 300 },   // sustain peak
    { duration: '3m', target: 0 },      // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.001'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.reborn.vn';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

export default function () {
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
    'Hostname': 'test-tenant.reborn.vn',
  };

  // Customer search
  const customers = http.get(
    `${BASE_URL}/api/customers?keyword=Nguyen&page=1&limit=20`,
    { headers }
  );
  check(customers, { 'customer list 200': (r) => r.status === 200 });

  sleep(1);

  // POS Invoice create
  const invoice = http.post(
    `${BASE_URL}/api/invoices`,
    JSON.stringify({
      type: 'POS',
      branch_id: 1,
      items: [{ product_id: 101, quantity: 2, price: 150000 }],
      payment_method: 'cash',
    }),
    { headers }
  );
  check(invoice, { 'invoice create 201': (r) => r.status === 201 });

  sleep(2);
}
```

---

## 5. Database Performance

### 5.1 Index Strategy

#### Composite Indexes (tenant + branch)

Mọi bảng chính đều cần composite index bắt đầu với `tenant_id`:

```sql
-- Customer
CREATE INDEX idx_customer_tenant_phone ON customers (tenant_id, phone);
CREATE INDEX idx_customer_tenant_name ON customers (tenant_id, name varchar_pattern_ops);
CREATE INDEX idx_customer_tenant_branch ON customers (tenant_id, branch_id);

-- Invoice
CREATE INDEX idx_invoice_tenant_date ON invoices (tenant_id, created_at DESC);
CREATE INDEX idx_invoice_tenant_branch_date ON invoices (tenant_id, branch_id, created_at DESC);
CREATE INDEX idx_invoice_tenant_customer ON invoices (tenant_id, customer_id);

-- Product
CREATE INDEX idx_product_tenant_category ON products (tenant_id, category_id);
CREATE INDEX idx_product_tenant_barcode ON products (tenant_id, barcode);
CREATE INDEX idx_product_tenant_sku ON products (tenant_id, sku);

-- Stock
CREATE INDEX idx_stock_tenant_branch_product ON stock (tenant_id, branch_id, product_id);

-- Cashbook
CREATE INDEX idx_cashbook_tenant_branch_date ON cashbook (tenant_id, branch_id, transaction_date DESC);
```

#### Partial Index cho Soft Delete

```sql
-- Chỉ index bản ghi chưa xoá
CREATE INDEX idx_customer_active ON customers (tenant_id, phone)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_product_active ON products (tenant_id, barcode)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_invoice_not_cancelled ON invoices (tenant_id, created_at DESC)
  WHERE status != 'cancelled';
```

### 5.2 Query Optimization Targets

| Query Pattern | Current (est.) | Target | Giải pháp |
|---|---|---|---|
| Customer search by phone | < 50ms | < 20ms | Index on (tenant_id, phone) |
| Invoice list by date range | < 200ms | < 100ms | Composite index + LIMIT |
| Stock quantity by branch+product | < 30ms | < 10ms | Unique index, materialized view |
| Report — daily revenue | < 5s | < 2s | Pre-aggregated table hoặc materialized view |
| Report — monthly by branch | < 10s | < 3s | Materialized view, refresh nightly |
| Full-text search customer name | < 500ms | < 200ms | GIN index with pg_trgm |
| Promotion eligibility check | < 100ms | < 50ms | Cache eligible rules in Redis |
| Audit log query | < 1s | < 500ms | Partition by month, index on (tenant_id, created_at) |

### 5.3 Connection Pool Sizing

| Microservice | Min Connections | Max Connections | Idle Timeout | Ghi chú |
|---|---|---|---|---|
| API Gateway | 5 | 20 | 30s | Routing only, ít query |
| CRM Service | 10 | 50 | 60s | Customer, lead — heavy read |
| Invoice Service | 10 | 50 | 60s | POS — heavy write |
| Inventory Service | 10 | 40 | 60s | Stock query — heavy read |
| Cashbook Service | 5 | 30 | 60s | Medium load |
| Loyalty Service | 5 | 20 | 60s | Wallet lookup — fast |
| Report Service | 5 | 30 | 120s | Heavy queries, longer timeout |
| HRM Service | 5 | 20 | 60s | Nhân sự — lower load |
| Tax Service | 3 | 15 | 60s | Periodic, low traffic |
| Notification Service | 3 | 10 | 30s | Async, queue-based |
| Settings Service | 3 | 10 | 30s | Config — cached, low traffic |
| **Tổng max connections** | | **~295** | | PostgreSQL cần `max_connections >= 350` |

---

## 6. Scalability Projections

### 6.1 Quy mô theo số cửa hàng

| Metric | 10 stores | 50 stores | 100 stores | 500 stores |
|---|---|---|---|---|
| Concurrent POS terminals | 10-20 | 50-100 | 100-200 | 500-1000 |
| Daily transactions | 500-1,000 | 2,500-5,000 | 5,000-10,000 | 25,000-50,000 |
| Monthly invoices | 15K-30K | 75K-150K | 150K-300K | 750K-1.5M |
| DB size (1 year) | 2-5 GB | 10-25 GB | 20-50 GB | 100-250 GB |
| Concurrent users | 20-40 | 100-200 | 200-400 | 1,000-2,000 |
| API RPS (peak) | 50 | 250 | 500 | 2,500 |

### 6.2 Recommended Infrastructure

| Quy mô | Application | Database | Cache | CDN | Estimated Cost/month |
|---|---|---|---|---|---|
| **10 stores** (Startup) | 2x 2vCPU 4GB | 1x PostgreSQL 4vCPU 16GB | Redis 1GB | Optional | $200-400 |
| **50 stores** (Growth) | 4x 4vCPU 8GB + LB | 1x PostgreSQL 8vCPU 32GB | Redis 4GB cluster | CloudFront | $800-1,500 |
| **100 stores** (Scale) | 6x 4vCPU 8GB + LB (auto-scale) | 1x Primary + 1x Read Replica, 16vCPU 64GB | Redis 8GB cluster | CloudFront | $2,000-3,500 |
| **500 stores** (Enterprise) | K8s cluster 20+ pods (auto-scale) | 1x Primary + 2x Read Replica + PgBouncer, 32vCPU 128GB | Redis cluster 16GB + local cache | Multi-region CDN | $8,000-15,000 |

### 6.3 Scaling Strategy

```
Phase 1 (10-50 stores):
  └── Single server + single DB
      └── Focus: code optimization, indexing, caching

Phase 2 (50-100 stores):
  └── Horizontal app scaling (multiple instances + LB)
  └── Read replica cho report queries
  └── Redis cache cho sessions + hot data
      └── Focus: read/write splitting, cache strategy

Phase 3 (100-500 stores):
  └── Kubernetes orchestration
  └── Database sharding by tenant hoặc partition by date
  └── Event-driven architecture (message queue)
  └── CDN cho static assets
      └── Focus: distributed systems, eventual consistency

Phase 4 (500+ stores):
  └── Multi-region deployment
  └── CQRS pattern cho report
  └── Dedicated DB per large tenant
      └── Focus: isolation, compliance, SLA per tenant
```

---

## 7. Bottleneck Analysis & Recommendations

### 7.1 Known Bottlenecks

| # | Bottleneck | Impact | Mức độ |
|---|---|---|---|
| 1 | **Large frontend bundle** (~2MB initial gzipped) — FCP > 3s trên mạng chậm, LCP > 5s | User experience xấu, bounce rate cao | High |
| 2 | **No CDN** — Static assets serve trực tiếp từ app server | TTFB cao cho user xa data center, tăng load server | High |
| 3 | **No query cache (Redis)** — Mỗi request đều query database | Database overload khi concurrent users tăng | High |
| 4 | **No read replica** — Report queries chạy trên primary DB | Report nặng block write queries (POS invoice) | Medium |
| 5 | **No connection pooler (PgBouncer)** — Mỗi microservice giữ connection pool riêng | Tổng connections cao, PostgreSQL overhead | Medium |
| 6 | **Synchronous report generation** — Report summary query scan toàn bộ invoices | Timeout khi data lớn, block API thread | Medium |
| 7 | **No rate limiting** — API không giới hạn request rate per user/tenant | DDoS hoặc misbehaving client ảnh hưởng toàn hệ thống | Medium |
| 8 | **No background job queue** — Export Excel, send email chạy synchronous | API timeout cho large exports, user phải đợi | Low |

### 7.2 Top 5 Optimization Recommendations

| # | Hành động | Impact | Effort | Priority |
|---|---|---|---|---|
| 1 | **Triển khai CDN** (CloudFront / Cloudflare) cho static assets (JS, CSS, images). Cấu hình cache headers `Cache-Control: max-age=31536000, immutable` cho hashed assets. | Giảm TTFB 50-70%, giảm server load 30% | Low | **P0** — làm ngay |
| 2 | **Redis cache layer** cho hot data: product list (TTL 5m), customer lookup (TTL 1m), promotion rules (TTL 10m), user session/permissions. Cache invalidation qua pub/sub khi data thay đổi. | Giảm DB load 40-60%, giảm API latency 30% | Medium | **P0** — làm ngay |
| 3 | **Frontend code-splitting** — Lazy load Slate, ag-grid, bpmn-js, exceljs, highcharts. Route-based code splitting cho từng module. Target: initial bundle < 1MB gzipped. | Giảm FCP 40%, cải thiện Lighthouse Performance 15-20 điểm | Medium | **P1** — sprint tới |
| 4 | **Read replica + PgBouncer** — Route report/analytics queries sang read replica. PgBouncer làm connection pooler giảm overhead. Materialized views cho daily/monthly aggregation. | Report không block POS. Hỗ trợ 2-3x concurrent connections | Medium-High | **P1** — sprint tới |
| 5 | **Background job queue** (BullMQ / RabbitMQ) cho: Excel export, PDF generation, email sending, report pre-computation. API trả về job_id, frontend poll status. | Không timeout cho large exports, UX tốt hơn | Medium | **P2** — 1-2 tháng |

### 7.3 Quick Wins (< 1 ngày effort)

- [ ] Bật `gzip` / `brotli` compression trên Nginx (nếu chưa có)
- [ ] Thêm `Cache-Control` headers cho API responses ít thay đổi (product list, category list)
- [ ] Đảm bảo `vite build` tạo hashed filenames cho long-term caching
- [ ] Thêm `<link rel="preconnect">` cho API domain trong `index.html`
- [ ] Review và tắt `console.log` trong production build
- [ ] Database: `ANALYZE` chạy định kỳ để cập nhật query planner statistics

---

## Phụ lục

### A. Monitoring Metrics cần theo dõi

| Category | Metrics | Tool |
|---|---|---|
| API | Request rate, latency (P50/P95/P99), error rate, status codes | Prometheus + Grafana |
| Database | Active connections, query duration, cache hit ratio, dead tuples | pg_stat_statements, Grafana |
| Frontend | FCP, LCP, CLS, TTFB, JS errors | Web Vitals, Sentry |
| Infrastructure | CPU, Memory, Disk I/O, Network | Prometheus node_exporter |
| Business | Invoices/minute, active users, API calls/tenant | Custom metrics |

### B. SLA Targets

| Metric | Target |
|---|---|
| Uptime | 99.9% (< 8.76 giờ downtime/năm) |
| API Availability | 99.95% |
| RTO (Recovery Time Objective) | < 1 giờ |
| RPO (Recovery Point Objective) | < 15 phút |
| Planned Maintenance Window | 02:00-05:00 GMT+7, Chủ nhật |

---

*Tài liệu này cần được cập nhật sau mỗi lần chạy actual load test. Các số liệu hiện tại là TARGET — chưa phải kết quả đo thực tế.*
