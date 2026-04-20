# Part 14 — Performance, Quality, Risks

## Executive Summary

Part cuối cùng tổng hợp **performance targets** (mapping với URD NFR), **quality strategy** (test pyramid, tooling), **risk register** với mức nghiêm trọng và mitigation plan, và **technical debt** đã quan sát được trong codebase. Đề xuất **action plan** ngắn hạn (1-3 tháng) và dài hạn (6-12 tháng).

---

## 1. Performance — Map với URD NFR

### 1.1. Bảng performance targets

| NFR ID | Yêu cầu | Trạng thái | Cách đạt |
|--------|---------|:----------:|----------|
| NFR-PERF-01 | Page load ≤ 3s | ⚠️ Cần đo | Lazy load + CDN + cache + DB index |
| NFR-PERF-01 | POS add to cart ≤ 500ms | ⚠️ Cần đo | Local state + debounce + optimistic UI |
| NFR-PERF-01 | Báo cáo 1 tháng ≤ 5s | ⚠️ Cần đo | Read replica + materialized view + cache |
| NFR-PERF-01 | Form CRUD submit ≤ 1s | ⚠️ Cần đo | Async UI + skeleton loader |
| NFR-PERF-02 | POS 60 đơn/giờ/staff | ⚠️ Cần test | Tối ưu render + ít re-render |
| NFR-PERF-03 | 50 user concurrent/tenant | ⚠️ Cần load test | Backend horizontal scale |
| NFR-PERF-04 | Báo cáo > 10k bản ghi chạy nền | ⚠️ Cần verify | Background job + queue |

### 1.2. Performance budget

| Metric | Target | Tool đo |
|--------|--------|---------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse, Web Vitals |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Lighthouse |
| **Time to Interactive (TTI)** | < 5s | Lighthouse |
| **Bundle size (gzip)** | < 1MB initial | Webpack analyzer / vite bundle visualizer |

### 1.3. Quan sát hiện tại

| Metric | Hiện tại (estimated) | Target | Gap |
|--------|---------------------|--------|-----|
| **Initial bundle gzip** | ~5 MB | < 1 MB | ❌ 5x |
| **Initial bundle raw** | ~20 MB | < 3 MB | ❌ 7x |
| **CSS bundle** | ~4.6 MB raw / 446 KB gzip | < 200 KB | ❌ 2x |

> **Conclusion**: Bundle hiện tại **vượt budget 5-7 lần**. Cần ưu tiên optimization (xem [ADR-17](part-13-adr.md#adr-17--bundle-size-optimization-đề-xuất-action)).

### 1.4. Performance test plan

| Test | Tool | Tần suất |
|------|------|----------|
| **Lighthouse CI** | Lighthouse | Mỗi PR |
| **Bundle size check** | `vite-bundle-visualizer` | Mỗi PR |
| **Load test** | k6 / Artillery | Trước release lớn |
| **Stress test** | k6 | Hằng quý |
| **Real User Monitoring** | Sentry / Datadog RUM | Production liên tục |

---

## 2. Quality strategy

### 2.1. Test pyramid

```
                    ▲
                   ╱ ╲
                  ╱   ╲       E2E (Playwright) — 5%
                 ╱─────╲      Critical user flows
                ╱       ╲
               ╱─────────╲    Integration — 15%
              ╱           ╲   Page với mock API
             ╱─────────────╲
            ╱               ╲  Unit (Vitest) — 80%
           ╱─────────────────╲ utils, services, hooks, components
          ───────────────────
```

### 2.2. Test coverage targets

| Layer | Coverage target |
|-------|----------------|
| **Utils** | ≥ 90% |
| **Services** | ≥ 80% |
| **Hooks** | ≥ 80% |
| **Components** | ≥ 60% |
| **Pages** | ≥ 40% |
| **Overall** | ≥ 70% |

### 2.3. Tools đề xuất

| Tool | Vai trò |
|------|---------|
| **Vitest** | Unit + integration test runner (đã có Vite, dùng Vitest tự nhiên) |
| **React Testing Library** | Render component trong test |
| **MSW** (Mock Service Worker) | Mock API calls |
| **Playwright** | E2E test (đã có infrastructure cho HDSD!) |
| **Lighthouse CI** | Performance regression |
| **vite-bundle-visualizer** | Bundle analysis |
| **Sentry** | Error tracking + RUM |
| **SonarQube** | Code quality + smell |
| **Snyk** / **Dependabot** | Dependency vulnerability |

### 2.4. Quality gate

PR không merge được nếu:

- ❌ Lint fail
- ❌ Test fail
- ❌ Coverage giảm > 1%
- ❌ Bundle size tăng > 5%
- ❌ Lighthouse score giảm > 5 điểm
- ❌ Có high/critical security vulnerability
- ❌ Chưa có review approve

### 2.5. Test hiện trạng

> 🔴 **Quan sát**: Codebase **không có** test file (`*.test.tsx`, `*.spec.ts`). Có Playwright nhưng cài tách trong `docs/userguides/tooling/` chỉ để chụp ảnh HDSD.

→ **Test coverage hiện tại ước tính: 0%**.

→ Đây là **technical debt lớn nhất** cần action.

---

## 3. Technical debt register

### 3.1. Bảng technical debt

| ID | Mục | Mô tả | Ưu tiên | Effort | Tác động |
|----|-----|-------|:-------:|:------:|---------|
| TD-01 | Bundle size 5-7x quá lớn | Phải lazy load module nặng | 🔴 High | M | Page load chậm, mất khách |
| TD-02 | Hardcode `Hostname` header | Bug critical, leak data tenant nếu lên prod | 🔴 Critical | XS | Security incident |
| TD-03 | Không có test suite | 0% coverage, dễ break | 🔴 High | XL | Regression bug, slow release |
| TD-04 | Refresh token logic thiếu | UX kém, user logout giữa chừng | 🟡 Med | S | UX |
| TD-05 | Page lớn > 3000 dòng (CustomerPersonList) | Khó maintain | 🟡 Med | L | Dev velocity |
| TD-06 | Dùng moment + date-fns lẫn lộn | Bundle phình + nhầm lẫn | 🟢 Low | L | Bundle size |
| TD-07 | React 17 cũ | Thiếu concurrent features | 🟡 Med | L | Innovation |
| TD-08 | Dependency cũ (1-2 năm) | Có CVE chưa patch | 🟡 Med | M | Security |
| TD-09 | Không có ErrorBoundary | 1 page crash → toàn app trắng | 🟡 Med | XS | UX |
| TD-10 | Không có PrivateRoute wrapper | User bypass URL được | 🟡 Med | S | Security |
| TD-11 | Không có CSP/HSTS header | OWASP gap | 🟡 Med | XS | Security |
| TD-12 | Không có distributed tracing | Debug khó với microservices | 🟢 Low | L | Ops |
| TD-13 | Không có idempotency key | Có thể tạo đơn duplicate | 🟡 Med | M | Data integrity |
| TD-14 | API không có versioning | Backend break frontend ngay | 🟡 Med | L | Release flexibility |
| TD-15 | Service vừa fetch raw vừa dùng apiHelper | Inconsistent | 🟢 Low | S | Code quality |
| TD-16 | Mock data trong production bundle | Bloat | 🟢 Low | S | Bundle |
| TD-17 | Comment-out code chưa xóa | Code smell | 🟢 Low | XS | Code quality |
| TD-18 | i18n chỉ có VI/EN, locale files lớn | Locale eager load | 🟢 Low | S | Bundle |

**Effort scale:**
- **XS**: < 1 ngày
- **S**: 1-3 ngày
- **M**: 1-2 tuần
- **L**: 2-4 tuần
- **XL**: > 1 tháng

---

## 4. Risk register

### 4.1. Phân loại risk

| Loại | Mô tả |
|------|-------|
| **Technical** | Liên quan code, kiến trúc, công nghệ |
| **Operational** | Liên quan vận hành, deployment, monitoring |
| **Security** | Liên quan bảo mật, compliance |
| **Business** | Liên quan business model, scope creep, vendor |
| **People** | Liên quan đội ngũ, knowledge, turnover |

### 4.2. Risk register

| ID | Loại | Risk | Likelihood | Impact | Score | Mitigation |
|----|------|------|:----------:|:------:|:-----:|------------|
| R-01 | Security | Hardcode Hostname → tenant leak | High | Critical | 🔴 9 | Fix ngay (TD-02) |
| R-02 | Operational | Backend microservice down → cascade fail | Med | High | 🔴 6 | Circuit breaker, fallback, monitoring |
| R-03 | Performance | Bundle quá lớn → user bỏ | High | High | 🔴 9 | Bundle optimization (TD-01) |
| R-04 | Technical | 0% test coverage → regression | High | High | 🔴 9 | Setup test suite (TD-03) |
| R-05 | Security | Dependency CVE chưa patch | Med | High | 🟡 6 | Snyk + auto update |
| R-06 | Security | Audit log bị tamper | Low | Critical | 🟡 5 | Append-only + offsite backup |
| R-07 | Operational | Database down → toàn bộ system fail | Low | Critical | 🟡 5 | HA cluster, backup, DR |
| R-08 | Business | Vendor lock-in (CDN, cloud, e-invoice) | Med | Med | 🟡 4 | Multi-vendor strategy |
| R-09 | People | Single dev biết toàn bộ codebase | Med | High | 🟡 6 | Documentation (HDSD/URD/SAD), pair programming |
| R-10 | Technical | Migration to React 18+ delayed → stuck với React 17 | Low | Med | 🟢 3 | Plan migration roadmap |
| R-11 | Operational | Backup không restore được khi cần | Low | Critical | 🟡 5 | Test restore monthly |
| R-12 | Security | Token leak qua console.log | Med | High | 🟡 6 | drop_console + audit log |
| R-13 | Performance | DB query không index → slow query | Med | Med | 🟡 4 | Query monitoring + index review |
| R-14 | Operational | DevOps single point of failure | Med | High | 🟡 6 | Cross-train, runbook |
| R-15 | Business | Camunda BPM license/maintain | Low | Med | 🟢 3 | Self-host community edition |
| R-16 | Compliance | Quên backup data > 12 tháng (Luật ANM) | Low | High | 🟡 4 | Automated retention check |
| R-17 | Operational | Cron job stuck → không sinh task chăm sóc | Med | Med | 🟡 4 | Job monitoring + alert |
| R-18 | Security | SQL injection nếu backend không dùng ORM | Low | Critical | 🟡 5 | Code review + SAST tool |

**Score formula:** Likelihood (1-3) × Impact (1-3)

| Score | Mức |
|-------|-----|
| 7-9 | 🔴 Critical |
| 4-6 | 🟡 Medium |
| 1-3 | 🟢 Low |

---

## 5. Action plan

### 5.1. Sprint hiện tại (Critical fix — 2 tuần)

| Action | TD/Risk | Effort | Owner |
|--------|---------|:------:|-------|
| Fix hardcode Hostname header | TD-02, R-01 | XS | Frontend |
| Setup Snyk + Dependabot | TD-08, R-05 | S | DevOps |
| Add ErrorBoundary | TD-09 | XS | Frontend |
| Fix nginx headers (CSP, HSTS) | TD-11 | XS | DevOps |

### 5.2. Q2 2026 (3 tháng)

| Action | TD/Risk | Effort |
|--------|---------|:------:|
| Setup test suite (Vitest + RTL + MSW) | TD-03, R-04 | XL |
| Implement refresh token logic | TD-04 | S |
| Bundle size optimization phase 1 (lazy load bpmn-js, slate, exceljs) | TD-01, R-03 | M |
| Add PrivateRoute wrapper | TD-10 | S |
| Add idempotency key cho POST critical | TD-13 | M |
| Refactor CustomerPersonList page | TD-05 | L |
| Setup distributed tracing | TD-12 | L |

### 5.3. Q3-Q4 2026 (6-12 tháng)

| Action | TD/Risk | Effort |
|--------|---------|:------:|
| Migrate React 17 → 18 | TD-07, R-10 | L |
| API versioning (v1, v2) | TD-14 | L |
| Migrate moment → date-fns | TD-06 | L |
| Server-side API Gateway (Kong/Traefik) | ADR-06 review | XL |
| Performance test + Lighthouse CI | NFR-PERF | M |
| Multi-tenant RLS (PostgreSQL) | R-01 long-term | M |

---

## 6. Quality metrics dashboard (đề xuất)

Setup dashboard hiển thị real-time:

### 6.1. Code quality

- Lines of code (LoC)
- Cyclomatic complexity
- Code duplication %
- Technical debt ratio (theo SonarQube)
- Test coverage trend

### 6.2. Bundle size

- Initial bundle size (gzip)
- Per-page chunk size
- Trend theo thời gian

### 6.3. Build time

- CI duration
- Vite dev cold start
- HMR latency

### 6.4. Production health

- Error rate (Sentry)
- API latency p95/p99
- Uptime (UptimeRobot)

### 6.5. Security

- Open vulnerabilities (Snyk)
- Day since last security incident
- Mean time to patch (MTTP)

---

## 7. Knowledge management

### 7.1. Tài liệu cần có

- ✅ HDSD (đã có) — `docs/userguides/`
- ✅ URD (đã có) — `docs/urd/`
- ✅ SAD (đang viết — Part này) — `docs/sa/`
- 📋 **API documentation** (Swagger/OpenAPI) — chưa có
- 📋 **Onboarding doc** cho dev mới — chưa có
- 📋 **Runbook ops** cho on-call — chưa có
- 📋 **ADR file riêng** trong `docs/sa/adr/` — chưa có

### 7.2. Best practice

- Tài liệu **viết khi quyết định**, không viết hồi tố
- ADR nhẹ (≤ 1 trang) nhưng có
- Code comment chỉ cho **tại sao** (why), không phải **làm gì** (what)
- README mỗi folder lớn

---

## 8. Kết luận & Đề xuất

### 8.1. Strengths của hệ thống

✅ Architecture rõ ràng (layered, microservices)
✅ Code organization tốt (167 page, 240 service, 78 component có pattern nhất quán)
✅ TypeScript đầy đủ
✅ i18n có sẵn
✅ Multi-tenant đã thiết kế từ đầu
✅ Service layer DRY với apiHelper
✅ Vừa hoàn thành migration Vite — modern toolchain

### 8.2. Top 5 gap quan trọng nhất

1. 🔴 **Hardcode Hostname** — fix ngay
2. 🔴 **0% test coverage** — investment lớn nhất
3. 🔴 **Bundle size 5-7x quá lớn** — tối ưu lazy load
4. 🟡 **Refresh token logic thiếu** — fix UX
5. 🟡 **Backend không có document** — đội backend cần xác nhận Part 08 + 12

### 8.3. Priority matrix

```
            Impact High            Impact Low
         ┌─────────────────────┬──────────────────┐
Easy     │ TD-02 Fix hardcode  │ TD-09 Boundary   │
         │ TD-11 Headers       │ TD-15 Service    │
         │ TD-09 Boundary      │ TD-17 Cleanup    │
         ├─────────────────────┼──────────────────┤
Hard     │ TD-01 Bundle opt    │ TD-06 Date lib   │
         │ TD-03 Test suite    │ TD-12 Tracing    │
         │ TD-07 React 18      │ TD-18 Locales    │
         └─────────────────────┴──────────────────┘
```

→ Bắt đầu với góc trên-trái (high impact, easy).

### 8.4. Khuyến nghị final

1. **Tuần 1-2**: Fix Critical gap (TD-02, TD-09, TD-11)
2. **Tháng 1**: Setup test infrastructure (TD-03 phase 1)
3. **Tháng 2**: Bundle optimization phase 1 (TD-01)
4. **Tháng 3**: Refresh token + PrivateRoute (TD-04, TD-10)
5. **Q2-Q3**: Test coverage > 50%, refactor mega pages
6. **Q4**: React 18 migration, API versioning

---

## 9. Câu hỏi mở cho stakeholder

1. **Backend team**: xác nhận Part 08 + Part 12. Có thông tin cụ thể về stack, infra?
2. **DevOps**: có monitoring/logging/alerting hiện tại không? Tool gì?
3. **Security**: có audit/pentest gần đây không? Kết quả?
4. **Product**: có roadmap nào đụng đến scaling lớn (1000+ tenant) trong 6 tháng tới?
5. **QA**: hiện test thủ công thế nào? Sẵn sàng đầu tư automation?
6. **Business**: SLA cam kết với khách hàng là gì? (uptime, response time)

---

## 10. Đánh giá tổng quan

| Khía cạnh | Điểm | Ghi chú |
|-----------|:----:|---------|
| **Architecture clarity** | 8/10 | Rõ ràng, có pattern |
| **Code organization** | 8/10 | Layered tốt, một số mega file |
| **Test coverage** | 1/10 | Critical gap |
| **Documentation** | 7/10 | HDSD/URD/SAD đầy đủ, code comment thiếu |
| **Performance** | 5/10 | Bundle quá lớn |
| **Security** | 6/10 | Có thiết kế nhưng có gap |
| **Scalability** | 7/10 | Multi-tenant + microservices đúng hướng |
| **Maintainability** | 6/10 | Cần refactor mega page + test |
| **DevOps maturity** | ?/10 | Chưa đủ data — đội DevOps trả lời |
| **Compliance** | 7/10 | Có thiết kế cho ANM, NĐ 13, TT78 |
| **TỔNG** | **6.5/10** | Solid foundation, cần đầu tư test + perf + security gap |

---

*Hết Part 14 — Hết SAD bản thảo.*

---

## Bảng tổng kết toàn bộ SAD

| Part | Tiêu đề | Số dòng (ước) | Mức tự tin |
|------|---------|:-------------:|:----------:|
| 00 | Tổng quan | ~250 | 🟢 |
| 01 | Kiến trúc tổng thể | ~300 | 🟢🟡 |
| 02 | Frontend Architecture | ~400 | 🟢 |
| 03 | Tech Stack & Dependencies | ~400 | 🟢 |
| 04 | Routing & Navigation | ~350 | 🟢 |
| 05 | Component & Module | ~350 | 🟢 |
| 06 | Service Layer & API | ~450 | 🟡 |
| 07 | Data Architecture | ~350 | 🟡 |
| 08 | Backend Architecture | ~400 | 🔴 |
| 09 | Integration | ~500 | 🟡 |
| 10 | Security | ~400 | 🟡 |
| 11 | Cross-cutting Concerns | ~400 | 🟡 |
| 12 | Deployment & Infrastructure | ~450 | 🔴 |
| 13 | ADRs (18 records) | ~350 | 🟢🟡 |
| 14 | Performance, Quality, Risks | ~400 | 🟡 |
| **Total** | | **~5,350 dòng** | |

**Phần cần đội backend/DevOps xác nhận** (mức 🔴): Part 08, Part 12
**Phần cần backend xác nhận chi tiết** (🟡): Part 06, 07, 09, 10, 11, 14
**Phần đã verify từ codebase** (🟢): Part 00, 02, 03, 04, 05, 13 (ADR Accepted)

Sau khi đội backend/DevOps cung cấp thông tin, Part 08 và 12 sẽ được rewrite từ 🔴 → 🟢.
