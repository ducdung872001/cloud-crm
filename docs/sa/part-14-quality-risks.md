# Part 14 — Quality Attributes & Risks

> Đánh giá chất lượng hệ thống theo ISO 25010, danh sách tech debt,
> risk register, và roadmap cải thiện kiến trúc.

---

## 1. Quality Tree (ISO 25010)

```
                    Quality
                       |
    ┌──────────┬───────┼────────┬──────────┐
    |          |       |        |          |
Performance Security Reliability Maintainability Usability
    |          |       |        |          |
  - Latency  - AuthN  - Uptime - Modularity - Learnability
  - Throughput- AuthZ  - Recovery- Testability- Accessibility
  - Capacity - Data   - Fault   - Reusability- Consistency
              protect  tolerance
```

---

## 2. Non-Functional Requirements (NFR)

### 2.1. NFR Targets vs Observed

| # | NFR                    | Target          | Observed        | Status |
|---|------------------------|-----------------|-----------------|--------|
| 1 | API p95 latency        | < 500ms         | ~350ms          | OK     |
| 2 | Page load (FCP)        | < 2s            | ~1.8s           | OK     |
| 3 | Time to Interactive    | < 3s            | ~3.2s           | WARN   |
| 4 | Concurrent users       | 500             | Tested 200      | RISK   |
| 5 | Uptime (monthly)       | 99.5%           | 99.2%           | WARN   |
| 6 | Data backup RPO        | 1 giờ           | 1 giờ (daily+)  | OK     |
| 7 | Recovery RTO           | 4 giờ           | Chưa test full  | RISK   |
| 8 | Unit test coverage     | > 80%           | ~45% (BE)       | FAIL   |
| 9 | Bundle size (gzip)     | < 1MB           | ~1.3MB          | WARN   |
|10 | Security audit         | Hàng quý        | Chưa có         | FAIL   |

### 2.2. Ghi chú

- **#3 TTI:** Bundle size lớn do dual date library + ag-grid
- **#4 Concurrent:** Chưa load test > 200 users, cần JMeter test
- **#8 Coverage:** Backend chưa có chính sách bắt buộc coverage gate
- **#10 Audit:** Cần thuê penetration testing ít nhất 1 lần/năm

---

## 3. Technical Debt Inventory

Top 10 tech debt items, sắp xếp theo impact:

| # | Debt Item                                  | Impact | Effort | Priority |
|---|--------------------------------------------|--------|--------|----------|
| 1 | Dual date library (moment + date-fns)      | High   | Large  | Medium   |
| 2 | localStorage chứa permissions (security)   | High   | Medium | High     |
| 3 | Unit test coverage thấp (45%)              | High   | Large  | High     |
| 4 | Console.log thay vì structured logging (FE)| Medium | Small  | Medium   |
| 5 | Hardcode magic numbers trong business logic| Medium | Medium | Medium   |
| 6 | CSS không nhất quán (Tailwind + inline)    | Medium | Large  | Low      |
| 7 | API response format không chuẩn hóa        | Medium | Medium | Medium   |
| 8 | Missing API documentation (Swagger)        | Medium | Medium | Medium   |
| 9 | No rate limiting trên API endpoint         | High   | Small  | High     |
|10 | Database migration chưa có rollback script | Medium | Small  | Medium   |

---

## 4. Risk Register

### 4.1. Architecture Risks

| # | Risk                                      | Likelihood | Impact | Score | Mitigation                              |
|---|-------------------------------------------|-----------|--------|-------|----------------------------------------|
| 1 | Tenant data leak do thiếu filter          | Medium    | Critical| High  | Unit test tenant isolation mọi query   |
| 2 | Single DB bottleneck khi scale > 500 user | Medium    | High   | High  | Read replica, query optimization       |
| 3 | localStorage tamper → UI bypass permission| Low       | Medium | Low   | Server-side verify tất cả permission   |
| 4 | moment.js EOL → security vulnerability    | Medium    | Medium | Medium| Migrate dần sang date-fns              |
| 5 | Bundle size tăng → UX chậm                | High      | Medium | High  | Code-split, lazy load, tree-shake      |
| 6 | RabbitMQ down → mất message               | Low       | High   | Medium| Persistent queue, DLQ, monitoring      |
| 7 | No security audit → unknown vulnerabilities| High     | Critical| Critical| Thuê pentest, implement OWASP top 10|
| 8 | Key-person dependency (1-2 dev biết toàn bộ)| High    | High   | High  | SA docs, knowledge sharing, pair prog  |
| 9 | Third-party API down (email, payment)     | Medium    | Medium | Medium| Circuit breaker, retry, fallback queue |

### 4.2. Risk Matrix

```
            │ Low Impact │ Medium     │ High       │ Critical   │
────────────┼────────────┼────────────┼────────────┼────────────┤
High Likely │            │ #5         │ #8         │ #7         │
Medium      │            │ #4         │ #1, #2     │            │
Low         │ #3         │ #9         │ #6         │            │
```

---

## 5. Roadmap

### 5.1. Quick Wins (2 tuần)

| # | Action                                    | Impact                         |
|---|-------------------------------------------|--------------------------------|
| 1 | Thêm rate limiting cho API (Spring filter) | Chống brute force, DDoS cơ bản |
| 2 | Replace console.log bằng logger utility    | Structured logging, dễ debug   |
| 3 | Thêm Swagger/OpenAPI cho top 20 API        | Dev experience, documentation  |
| 4 | Thêm database migration rollback scripts   | An toàn khi deploy fail        |
| 5 | Config ESLint rule cấm moment.js import mới| Ngăn tăng thêm tech debt       |

### 5.2. Medium Term (1 quý — Q3/2026)

| # | Action                                    | Impact                         |
|---|-------------------------------------------|--------------------------------|
| 1 | Tăng unit test coverage lên 70%            | Giảm bug, tăng confidence      |
| 2 | Tích hợp Sentry cho frontend error tracking| Phát hiện lỗi production nhanh |
| 3 | Load test 500 concurrent users (JMeter)    | Validate scaling capacity      |
| 4 | Implement circuit breaker cho external API | Tăng reliability               |
| 5 | Chuẩn hóa API response format (envelope)   | Consistency, FE dễ xử lý       |

### 5.3. Long Term (6-12 tháng — Q4/2026 - Q2/2027)

| # | Action                                    | Impact                         |
|---|-------------------------------------------|--------------------------------|
| 1 | Migrate hoàn toàn moment.js → date-fns    | Giảm bundle 300KB, bảo mật     |
| 2 | Chuyển permission sang Redis/Context       | Bảo mật hơn localStorage       |
| 3 | Thêm server-side API gateway (Kong)        | Rate limit, auth tập trung     |
| 4 | Penetration testing + security audit       | Compliance, trust              |
| 5 | Database read replica cho report queries   | Giảm tải primary DB            |
| 6 | Kubernetes migration (từ Docker Compose)   | Auto-scaling, self-healing     |

---

## 6. Monitoring & Alerting (Hiện tại và Kế hoạch)

### 6.1. Hiện tại

| Metric              | Tool              | Alert               |
|---------------------|-------------------|----------------------|
| Server uptime       | Uptime Robot      | Email khi down       |
| API error rate      | Spring Actuator   | Chưa có alert        |
| DB connections      | MySQL Workbench   | Manual check         |
| Disk usage          | Linux cron        | Email khi > 85%      |

### 6.2. Kế hoạch

| Metric              | Tool              | Alert               |
|---------------------|-------------------|----------------------|
| Frontend error      | Sentry            | Slack + Email        |
| API latency p95     | Grafana + Prometheus| Slack khi > 1s     |
| RabbitMQ DLQ size   | RabbitMQ plugin   | Slack khi > 50       |
| Memory / CPU        | Grafana           | Auto-scale trigger   |

---

## 7. Tổng kết

- **Chất lượng:** 6/10 NFR đạt target, 4 cần cải thiện (TTI, coverage, audit, load test)
- **Tech debt:** 10 items, ưu tiên rate limiting + test coverage + Sentry
- **Risk:** 9 risks đã nhận diện, critical nhất là security audit và tenant isolation
- **Roadmap:** 3 giai đoạn rõ ràng — quick wins → medium → long term
- **Nguyên tắc:** Mỗi sprint dành 20% effort cho tech debt reduction
