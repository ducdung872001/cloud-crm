# Part 14 — Quality Attributes & Risks

> **Executive Summary**: Part cuối cùng của SAD lập **cây chất lượng** (quality tree) theo ISO/IEC 25010 gắn với NFR từ URD Part 14, **đối chiếu metric target vs observed**, liệt kê **technical debt**, và xây **risk register** với 9 rủi ro lớn. Rủi ro nổi bật: **0% unit test coverage**, **hardcode Hostname header**, **duplicate libs** (moment + date-fns, 2 fingerprintjs), **không có observability**, **không có CI/CD trong repo**, **BE source không có sẵn** → khó verify integration. Roadmap đề xuất 3 giai đoạn: quick win (2 tuần), medium (1 quý), long term (6-12 tháng).

## 1. Quality tree (ISO/IEC 25010)

```
Product Quality
├── Functional suitability
│   ├── Completeness        → URD coverage ~95% (🟢)
│   ├── Correctness         → Manual QA only (🔴)
│   └── Appropriateness     → 🟢
├── Performance efficiency
│   ├── Time behaviour      → P95 target ≤ 500ms (🟡)
│   ├── Resource usage      → Bundle 8-12MB (🔴)
│   └── Capacity            → 1000+ tenant target (🟡)
├── Compatibility
│   ├── Co-existence        → Share domain với SSO (🟢)
│   └── Interoperability    → 11 integration points (🟡)
├── Usability
│   ├── Appropriateness     → 🟢
│   ├── Learnability        → Onboard ≤ 1 week (🟡)
│   ├── Operability         → Keyboard nav partial (🟡)
│   ├── Accessibility       → WCAG 2.1 AA chưa đạt (🔴)
│   └── UI aesthetics       → 🟢
├── Reliability
│   ├── Maturity            → Production 1-2 năm (🟡)
│   ├── Availability        → Target 99.5% (🟡)
│   ├── Fault tolerance     → No retry, no circuit breaker (🔴)
│   └── Recoverability      → DR chưa test (🔴)
├── Security                → Xem Part 10 (🔴 nhiều điểm)
├── Maintainability
│   ├── Modularity          → Module theo domain (🟢)
│   ├── Reusability         → reborn-util (🟢)
│   ├── Analysability       → 0% test → khó (🔴)
│   ├── Modifiability       → TypeScript giúp (🟡)
│   └── Testability         → 0% coverage (🔴)
└── Portability
    ├── Adaptability        → Multi-env var (🟢)
    ├── Installability      → Static build đơn giản (🟢)
    └── Replaceability      → Vendor lock-in thấp (🟢)
```

## 2. Metric target vs observed

### 2.1. Performance

| Metric | Target (URD-NFR) | Observed | Status |
|--------|------------------|----------|--------|
| LCP (first page) | ≤ 3s | ~4-5s ước tính do bundle lớn | 🔴 |
| INP | ≤ 200ms | chưa đo | 🟡 |
| CLS | ≤ 0.1 | chưa đo | 🟡 |
| API P95 | ≤ 500ms | phụ thuộc BE — chưa có APM | 🟡 |
| Bundle size (main chunk) | ≤ 1MB gzip | chưa đo — ước > 1.5MB | 🔴 |

### 2.2. Reliability

| Metric | Target | Observed |
|--------|--------|----------|
| Uptime | 99.5% | chưa có SLO tracking (🔴) |
| MTTR | ≤ 2h | chưa đo |
| Error budget | 3.6h/tháng | chưa quản lý |

### 2.3. Maintainability

| Metric | Target | Observed |
|--------|--------|----------|
| Dev onboarding | ≤ 1 tuần | 2-3 tuần thực tế (🔴) |
| Build time | ≤ 2 phút | ~90s OK (🟢) |
| TS strict mode | enabled | `strict: true` cần kiểm tra |

### 2.4. Testability

| Metric | Target | Observed |
|--------|--------|----------|
| Unit test coverage | ≥ 60% | **0%** (🔴🔴🔴) |
| E2E test | smoke scenarios | 0 (🔴) |
| Lint violation | 0 error | chưa có số |

## 3. Technical debt inventory

### 3.1. Code debt

| # | Mô tả | File | Mức | Effort |
|---|-------|------|-----|--------|
| D1 | Hardcode `"kcn.reborn.vn"` | `src/configs/fetchConfig.ts:40` | 🔴 | 30 phút |
| D2 | Duplicate date libs (moment + date-fns) | `package.json` | 🟡 | 2 tuần |
| D3 | Duplicate fingerprintjs (2 package) | `package.json` | 🟡 | 1 ngày |
| D4 | React 18 runtime + React 17 types | `package.json` | 🟡 | 1 ngày |
| D5 | 0% unit test | toàn repo | 🔴 | 1 quý |
| D6 | Không có Sentry/Datadog | `src/main.tsx` | 🔴 | 1 tuần |
| D7 | Mock data swap thủ công | `src/mocks/`, services | 🟡 | 2 tuần (migrate MSW) |
| D8 | TS 4.5 (nên lên 5.x) | `tsconfig.json` | 🟡 | 1 tuần |
| D9 | MSAL có thể không dùng nữa | `src/configs/authConfig.ts` | 🟡 | 1 ngày audit |
| D10 | ag-grid 30 (latest 32+) | `package.json` | 🟡 | 2 tuần |
| D11 | Hardcode VI strings trong JSX | nhiều trang | 🟡 | Ongoing |
| D12 | `dangerouslySetInnerHTML` chưa audit | grep toàn repo | 🔴 | 1 tuần |

Xem thêm file `docs/TECH_DEBT_INVENTORY.md` (nếu có).

### 3.2. Process debt

| # | Mô tả | Mức |
|---|-------|-----|
| P1 | Không có CI/CD config trong repo | 🔴 |
| P2 | Không có code review checklist | 🟡 |
| P3 | Không có release note template | 🟡 |
| P4 | Không có DR test định kỳ | 🔴 |
| P5 | Không có security pen test | 🔴 |

## 4. Risk register

### Risk 1 — No unit tests → regression risk

- **Severity**: High
- **Likelihood**: High
- **Impact**: Mỗi release tiềm ẩn bug, phải QA manual nặng
- **Mitigation**:
  1. Thêm **Vitest** config.
  2. Bắt đầu test utils + services (dễ, ROI cao).
  3. Bắt buộc test cho code mới (coverage gate PR = 60%).
  4. Backfill test cho module nghiệp vụ quan trọng (POS, finance).
- **Target**: 30% coverage sau 3 tháng, 60% sau 6 tháng

### Risk 2 — Hostname header hardcoded → env bleed

- **Severity**: Medium (có thể High nếu prod leak)
- **Likelihood**: Medium
- **Impact**: Gọi nhầm data tenant khi dev, có thể bị spoof khi prod
- **Mitigation**:
  1. Xoá hardcode, dùng `location.hostname`.
  2. Thêm CI check (grep literal `"kcn.reborn.vn"` → fail build).
  3. Gateway BE verify `Hostname` khớp với domain origin.
- **Target**: Fix trong 1 tuần

### Risk 3 — React 18 runtime + React 17 types → type drift

- **Severity**: Low-Medium
- **Likelihood**: Medium
- **Impact**: Type warning giả/thiếu, hook mới không có type chuẩn
- **Mitigation**: bump `@types/react` lên 18.x
- **Target**: 1 ngày

### Risk 4 — Duplicate libs (moment+date-fns, 2 fingerprintjs)

- **Severity**: Medium (performance)
- **Likelihood**: Certain
- **Impact**: Bundle lớn hơn cần thiết ~400KB
- **Mitigation**: chọn 1, migrate dần
- **Target**: 1 quý

### Risk 5 — No observability (no Sentry/Datadog)

- **Severity**: High
- **Likelihood**: Certain
- **Impact**: Bug production không biết, không có trace → debug mù
- **Mitigation**: integrate Sentry (FE) + OpenTelemetry (BE)
- **Target**: 2 tuần

### Risk 6 — No CI/CD config in repo

- **Severity**: High
- **Likelihood**: Certain
- **Impact**: Manual deploy → lỗi người, không có quality gate
- **Mitigation**: thêm `.github/workflows/` hoặc `.gitlab-ci.yml`
- **Target**: 1 tuần

### Risk 7 — Backend source not in repo

- **Severity**: Medium
- **Likelihood**: Certain
- **Impact**: Không verify được contract, không test integration được
- **Mitigation**:
  1. BE publish OpenAPI spec.
  2. FE generate client từ spec (orval / openapi-typescript).
  3. Contract test.
- **Target**: 1 quý

### Risk 8 — Multi-tenant isolation via Hostname (fragile)

- **Severity**: High (security)
- **Likelihood**: Medium
- **Impact**: Data leak giữa tenant nếu BE verify không đủ
- **Mitigation**:
  1. Gateway reject request có `Hostname` không khớp Origin/Referer.
  2. PostgreSQL RLS policy.
  3. Pen test kiểm tra spoofing.
- **Target**: 1 quý

### Risk 9 — 100+ routes → bundle size, memory

- **Severity**: Medium
- **Likelihood**: Certain
- **Impact**: Trang đầu tải chậm, browser nặng khi chuyển nhiều trang (memo leak?)
- **Mitigation**:
  1. Audit bundle (`vite-bundle-visualizer`).
  2. Dynamic import heavy libs.
  3. Preload chunk theo predictive navigation.
- **Target**: 1 quý

## 5. Risk matrix

```
          Likelihood
           Low    Med    High
        ┌──────┬──────┬──────┐
  High  │      │ R8   │ R1,5,│
  Sev   │      │      │ 6    │
        ├──────┼──────┼──────┤
  Med   │      │ R2,7,│ R4   │
  Sev   │      │ 9    │      │
        ├──────┼──────┼──────┤
  Low   │ R3   │      │      │
  Sev   │      │      │      │
        └──────┴──────┴──────┘
```

**Priority**: R1, R5, R6 (High-High) → xử trước.

## 6. Roadmap giảm thiểu

### 6.1. Quick win (2 tuần)

- ✅ Thêm Vitest config + 10 test đầu tiên (services, utils)
- ✅ Xoá hardcode Hostname
- ✅ Integrate Sentry FE
- ✅ Setup GitHub Actions CI (lint + build)
- ✅ Bump `@types/react` 18
- ✅ Thêm `vite-bundle-visualizer`, đo baseline

### 6.2. Medium term (1 quý)

- ✅ Coverage ≥ 30%
- ✅ E2E Playwright smoke scenario (POS flow, customer create)
- ✅ Dynamic import ag-grid, bpmn-js, slate
- ✅ Migrate moment → date-fns (hoặc ngược lại)
- ✅ OpenAPI spec từ BE + client generate
- ✅ Sonar/Semgrep trong CI
- ✅ DR test 1 lần
- ✅ Tenant isolation audit + fix gateway
- ✅ Feature flag (Unleash self-host)

### 6.3. Long term (6-12 tháng)

- ✅ Coverage ≥ 60%
- ✅ WCAG 2.1 AA đạt
- ✅ Bundle main chunk ≤ 1MB gzip
- ✅ Multi-region active-passive deploy
- ✅ 99.5% SLO đạt và tracking
- ✅ Migrate Mock → MSW
- ✅ Cân nhắc monorepo (Turborepo)
- ✅ Security pen test định kỳ

## 7. Success metrics

| KPI | Baseline | 1 quý | 1 năm |
|-----|----------|-------|-------|
| Unit test coverage | 0% | 30% | 60% |
| P95 API latency | ? | đo được | ≤ 500ms |
| Uptime | ? | đo được | 99.5% |
| Bundle main chunk | ~1.5MB | 1.2MB | ≤ 1MB |
| MTTR | ? | 4h | 2h |
| Deploy frequency | manual | daily | on-demand |
| Change failure rate | ? | ≤ 15% | ≤ 5% |
| Onboarding time | 2-3 tuần | 1.5 tuần | 1 tuần |

## 8. Kết luận

Reborn Retail CRM là hệ thống **trưởng thành về tính năng** (gần như đủ cho retail chain) nhưng **non trẻ về kỹ thuật vận hành** (thiếu test, observability, CI/CD). Rủi ro lớn nhất là **không có lưới an toàn khi thay đổi** (test + monitoring). Khuyến nghị ưu tiên **quick win** trong 2 tuần đầu để xây nền, sau đó roadmap 1 quý tập trung vào test coverage và observability. Multi-tenant security cần pen test sớm vì ảnh hưởng trực tiếp đến khách hàng.

## Tham chiếu

- Files:
  - `package.json`
  - `src/configs/fetchConfig.ts`
  - `tsconfig.json`
  - `docs/TECH_DEBT_INVENTORY.md` (nếu có)
- [URD Part 14 — NFR](../urd/part-14-nfr.md)
- [Part 10 — Security](part-10-security.md)
- [Part 11 — Cross-cutting](part-11-cross-cutting.md)
- [Part 12 — Deployment](part-12-deployment.md)
- [Part 13 — ADR](part-13-adr.md)

---
*Hết SAD — kết thúc tài liệu. Xem thêm [URD](../urd/README.md) hoặc [HDSD](../userguides/README.md).*
