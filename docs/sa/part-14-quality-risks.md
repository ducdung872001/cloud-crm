# Part 14 — Quality Attributes & Risks

> Danh gia chat luong he thong theo ISO 25010, danh sach tech debt,
> risk register, va roadmap cai thien kien truc.

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
| 6 | Data backup RPO        | 1 gio           | 1 gio (daily+)  | OK     |
| 7 | Recovery RTO           | 4 gio           | Chua test full  | RISK   |
| 8 | Unit test coverage     | > 80%           | ~45% (BE)       | FAIL   |
| 9 | Bundle size (gzip)     | < 1MB           | ~1.3MB          | WARN   |
|10 | Security audit         | Hang quy        | Chua co         | FAIL   |

### 2.2. Ghi chu

- **#3 TTI:** Bundle size lon do dual date library + ag-grid
- **#4 Concurrent:** Chua load test > 200 users, can JMeter test
- **#8 Coverage:** Backend chua co chinh sach bat buoc coverage gate
- **#10 Audit:** Can thue penetration testing it nhat 1 lan/nam

---

## 3. Technical Debt Inventory

Top 10 tech debt items, sap xep theo impact:

| # | Debt Item                                  | Impact | Effort | Priority |
|---|--------------------------------------------|--------|--------|----------|
| 1 | Dual date library (moment + date-fns)      | High   | Large  | Medium   |
| 2 | localStorage chua permissions (security)   | High   | Medium | High     |
| 3 | Unit test coverage thap (45%)              | High   | Large  | High     |
| 4 | Console.log thay vi structured logging (FE)| Medium | Small  | Medium   |
| 5 | Hardcode magic numbers trong business logic| Medium | Medium | Medium   |
| 6 | CSS khong nhat quan (Tailwind + inline)    | Medium | Large  | Low      |
| 7 | API response format khong chuan hoa        | Medium | Medium | Medium   |
| 8 | Missing API documentation (Swagger)        | Medium | Medium | Medium   |
| 9 | No rate limiting tren API endpoint         | High   | Small  | High     |
|10 | Database migration chua co rollback script | Medium | Small  | Medium   |

---

## 4. Risk Register

### 4.1. Architecture Risks

| # | Risk                                      | Likelihood | Impact | Score | Mitigation                              |
|---|-------------------------------------------|-----------|--------|-------|----------------------------------------|
| 1 | Tenant data leak do thieu filter          | Medium    | Critical| High  | Unit test tenant isolation moi query   |
| 2 | Single DB bottleneck khi scale > 500 user | Medium    | High   | High  | Read replica, query optimization       |
| 3 | localStorage tamper → UI bypass permission| Low       | Medium | Low   | Server-side verify tat ca permission   |
| 4 | moment.js EOL → security vulnerability    | Medium    | Medium | Medium| Migrate dan sang date-fns              |
| 5 | Bundle size tang → UX cham                | High      | Medium | High  | Code-split, lazy load, tree-shake      |
| 6 | RabbitMQ down → mat message               | Low       | High   | Medium| Persistent queue, DLQ, monitoring      |
| 7 | No security audit → unknown vulnerabilities| High     | Critical| Critical| Thue pentest, implement OWASP top 10|
| 8 | Key-person dependency (1-2 dev biet toan bo)| High    | High   | High  | SA docs, knowledge sharing, pair prog  |
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

### 5.1. Quick Wins (2 tuan)

| # | Action                                    | Impact                         |
|---|-------------------------------------------|--------------------------------|
| 1 | Them rate limiting cho API (Spring filter) | Chong brute force, DDoS co ban |
| 2 | Replace console.log bang logger utility    | Structured logging, de debug   |
| 3 | Them Swagger/OpenAPI cho top 20 API        | Dev experience, documentation  |
| 4 | Them database migration rollback scripts   | An toan khi deploy fail        |
| 5 | Config ESLint rule cam moment.js import moi| Ngan tang them tech debt       |

### 5.2. Medium Term (1 quy — Q3/2026)

| # | Action                                    | Impact                         |
|---|-------------------------------------------|--------------------------------|
| 1 | Tang unit test coverage len 70%            | Giam bug, tang confidence      |
| 2 | Tich hop Sentry cho frontend error tracking| Phat hien loi production nhanh |
| 3 | Load test 500 concurrent users (JMeter)    | Validate scaling capacity      |
| 4 | Implement circuit breaker cho external API | Tang reliability               |
| 5 | Chuan hoa API response format (envelope)   | Consistency, FE de xu ly       |

### 5.3. Long Term (6-12 thang — Q4/2026 - Q2/2027)

| # | Action                                    | Impact                         |
|---|-------------------------------------------|--------------------------------|
| 1 | Migrate hoan toan moment.js → date-fns    | Giam bundle 300KB, bao mat     |
| 2 | Chuyen permission sang Redis/Context       | Bao mat hon localStorage       |
| 3 | Them server-side API gateway (Kong)        | Rate limit, auth tap trung     |
| 4 | Penetration testing + security audit       | Compliance, trust              |
| 5 | Database read replica cho report queries   | Giam tai primary DB            |
| 6 | Kubernetes migration (tu Docker Compose)   | Auto-scaling, self-healing     |

---

## 6. Monitoring & Alerting (Hien tai va Ke hoach)

### 6.1. Hien tai

| Metric              | Tool              | Alert               |
|---------------------|-------------------|----------------------|
| Server uptime       | Uptime Robot      | Email khi down       |
| API error rate      | Spring Actuator   | Chua co alert        |
| DB connections      | MySQL Workbench   | Manual check         |
| Disk usage          | Linux cron        | Email khi > 85%      |

### 6.2. Ke hoach

| Metric              | Tool              | Alert               |
|---------------------|-------------------|----------------------|
| Frontend error      | Sentry            | Slack + Email        |
| API latency p95     | Grafana + Prometheus| Slack khi > 1s     |
| RabbitMQ DLQ size   | RabbitMQ plugin   | Slack khi > 50       |
| Memory / CPU        | Grafana           | Auto-scale trigger   |

---

## 7. Tong ket

- **Chat luong:** 6/10 NFR dat target, 4 can cai thien (TTI, coverage, audit, load test)
- **Tech debt:** 10 items, uu tien rate limiting + test coverage + Sentry
- **Risk:** 9 risks da nhan dien, critical nhat la security audit va tenant isolation
- **Roadmap:** 3 giai doan ro rang — quick wins → medium → long term
- **Nguyen tac:** Moi sprint danh 20% effort cho tech debt reduction
