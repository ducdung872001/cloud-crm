# TNPM Test Strategy

**Version**: 1.0 (2026-04-14)
**Stack**: Vitest + React Testing Library + MSW + Playwright

## 1. Test Pyramid

```
       ▲
       │ E2E (Playwright)          ← 6 specs — happy path smoke
       │
       │ Integration (MSW)         ← backend contract tests
       │
       │ Component (vitest + RTL)  ← render + interaction + state
       │
       │ Unit (vitest)             ← pure utilities (future)
       ▼
```

## 2. Frameworks

| Layer | Tool | Config file | Run |
|---|---|---|---|
| Component / Unit | `vitest` + `@testing-library/react` + `jsdom` | [`vitest.config.mts`](../../vitest.config.mts) | `yarn test` |
| Test setup | — | [`src/test/setup.ts`](../../src/test/setup.ts) | — |
| Mock API (node) | `msw` | [`src/test/msw/server.ts`](../../src/test/msw/server.ts) | `yarn test:msw` |
| Mock API handlers | — | [`src/test/msw/handlers.ts`](../../src/test/msw/handlers.ts) | — |
| E2E browser | `@playwright/test` | [`playwright.config.ts`](../../playwright.config.ts) | `yarn test:e2e` |
| E2E tests | — | [`e2e-tests/`](../../e2e-tests/) | — |

## 3. Commands

```bash
# Component + integration tests (no browser)
yarn test                 # run all, exit after
yarn test:watch           # watch mode
yarn test:ui              # vitest UI (browser at localhost:51204)
yarn test:coverage        # with coverage report
yarn test:smoke           # only src/pages/**
yarn test:msw             # only MSW integration

# E2E (requires dev server running on :5173)
yarn dev                  # terminal 1
yarn test:e2e:install     # first time: install chromium
yarn test:e2e             # terminal 2
yarn test:e2e:ui          # UI mode with trace viewer
```

## 4. What's tested

### 4.1 Component smoke tests (`src/pages/**/*.test.tsx`)

For each of **12 new TNPM pages**, tests cover:

| Page | Test file | Tests covered |
|---|---|---|
| DebtManagementList | `src/pages/DebtManagement/DebtManagementList.test.tsx` | Render, KPI, filter tabs, search, pay modal, edit schedule, history modal |
| DebtTransactionList | `src/pages/DebtManagement/DebtTransactionList.test.tsx` | Render, KPI, type tabs, 4-type modal |
| LeaseContractList | `src/pages/LeaseContract/LeaseContractList.test.tsx` | 5 KPI, detail modal 4 tabs, deposit/escalation/renewal tabs |
| SettingPaymentMethods | `src/pages/SettingTNPM/SettingPaymentMethods.test.tsx` | 2 tabs, 6 methods, gateway config modal |
| SettingCAMCharges | `src/pages/SettingTNPM/SettingCAMCharges.test.tsx` | 3 KPI, add modal, preview allocation |
| PortfolioDashboardList | `src/pages/PortfolioDashboard/PortfolioDashboardList.test.tsx` | 6 KPI, chart, P&L table, send report modal |
| B2GComplianceList | `src/pages/B2GCompliance/B2GComplianceList.test.tsx` | 5 KPI, 3 tabs, workflow detail modal |
| FeeNotificationList | `src/pages/FeeNotification/FeeNotificationList.test.tsx` | 5 KPI, 4 tabs, wizard 4 steps, template editor, rules toggle |
| PartnerList (TNPM) | `src/pages/PartnerTNPM/PartnerList.test.tsx` | 5 types, add modal, detail drawer, search |
| PartnerContractList | `src/pages/PartnerTNPM/PartnerContractList.test.tsx` | KPI, type filter, create modal |
| VendorKPIDashboard | `src/pages/VendorManagement/VendorKPIDashboard.test.tsx` | HLD targets, ĐẠT/CHƯA ĐẠT badges, ranking |
| AuditLogList | `src/pages/AuditLog/AuditLogList.test.tsx` | 5 KPI, category pills, severity filter |
| VendorPortalPreview | `src/pages/VendorPortal/VendorPortalPreview.test.tsx` | Preview banner, 5 tabs, submit invoice modal |
| OwnerDashboard | `src/pages/OwnerDashboard/OwnerDashboard.test.tsx` | Row-level security swap (Phát Lộc → Vinhomes → UBND) |

**Focus**: smoke + interaction tests chứ không phải full e2e — mỗi test xác minh **page render không crash** + **1-2 user flows quan trọng nhất** (click button → modal mở → form state).

### 4.2 MSW integration tests (`src/test/msw/integration.test.ts`)

Verifies the **backend API contract** defined in [`BACKEND_API_SPEC.md`](./BACKEND_API_SPEC.md):

- 20+ endpoints across 6 microservice domains (portfolio, payment, vendor, partner, notification, compliance)
- Each test calls the mock handler, verifies response shape, status codes, query param filtering, POST payload handling
- **Mục đích**: khi BE team build real endpoints, họ copy test cases này → chạy với real URL → verify contract match

### 4.3 E2E tests (`e2e-tests/*.spec.ts`)

**6 specs** cho critical user flows:

| Spec | Flow tested |
|---|---|
| `debt-management.spec.ts` | Page load → filter → pay modal → history modal → navigate to txn |
| `partner.spec.ts` | Add partner → fill form → save → detail drawer shows contracts |
| `lease-contract.spec.ts` | Detail modal → switch 4 tabs → escalation/renewal views |
| `fee-notification.spec.ts` | Campaign wizard full 4-step flow → save draft → verify in list |
| `vendor-invoice.spec.ts` | 3-way match modal → 3 documents visible → 4-step workflow |
| `b2g-compliance.spec.ts` | Budget dashboard → payments tab → workflow detail → nav to audit/preview |

**E2E environment**: tests run against `http://localhost:5173` (vite dev server). Không cần real backend — tất cả TNPM pages dùng mock data.

## 5. Writing new tests

### 5.1 Component smoke test template

```tsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyPage from "./MyPage";

describe("MyPage", () => {
  it("renders title", () => {
    render(<MyPage />);
    expect(screen.getByRole("heading", { name: /Page Title/i })).toBeInTheDocument();
  });

  it("opens modal on button click", async () => {
    const user = userEvent.setup();
    render(<MyPage />);
    await user.click(screen.getByRole("button", { name: /Add new/i }));
    expect(screen.getByText(/Modal Title/i)).toBeInTheDocument();
  });
});
```

### 5.2 MSW handler template

```ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/my-endpoint", ({ request }) => {
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter");
    return HttpResponse.json({
      code: 0,
      result: { items: [/* mock data */], total: 0 },
    });
  }),
];
```

### 5.3 E2E test template

```ts
import { test, expect } from "@playwright/test";

test.describe("My Feature E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/my-route");
  });

  test("user can complete happy path", async ({ page }) => {
    await page.getByRole("button", { name: /Start/i }).click();
    await page.getByLabel("Name").fill("Test");
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText(/Success/i)).toBeVisible();
  });
});
```

## 6. Common pitfalls

1. **Ambiguous selectors**: `getByText(/Tổng/)` will fail if "Tổng" appears in multiple elements. Use `getAllByText(...)` + assertion on length, or use more specific `getByRole("button", { name: /^exact text$/ })`.

2. **Emoji in button names**: Testing Library computes accessible names from text content. Include emoji trong regex nếu button có emoji prefix: `getByRole("button", { name: /📨 Gửi/i })`.

3. **Split text nodes**: React JSX `{count}. {label}` creates multiple text nodes. Search for just the label part: `getByText(/^Cơ bản$/)`.

4. **Stub alerts/confirms**: Pages call `alert()` or `confirm()`. These are stubbed in [`setup.ts`](../../src/test/setup.ts).

5. **React Router routes**: Some pages use `<Link>` or `useNavigate`. Wrap in `<BrowserRouter>`:
   ```tsx
   const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);
   ```

6. **MSW base URL matching**: Handler pattern `*/debts` matches any host + `/debts` path. Use `http://api.tnpm.vn/debts` or any host in fetch calls.

7. **Playwright `webServer`**: Trong CI, config auto-starts dev server. Local dev cần chạy `yarn dev` trước khi `yarn test:e2e`.

## 7. Coverage goal

- **Smoke tests**: 100% of pages render without crash
- **Interaction tests**: Tất cả modals + critical state transitions
- **MSW integration**: Match endpoints với backend spec doc
- **E2E**: Happy path cho 6 nghiệp vụ chính
- **Target overall**: ≥ 70% line coverage cho `src/pages/` (chạy `yarn test:coverage`)

## 8. Next steps

1. Khi BE team build endpoints thật → swap `MOCK_*` imports bằng service calls
2. Giữ MSW handlers đồng bộ với backend contract để CI integration tests vẫn pass
3. Thêm smoke tests cho các trang legacy khi port sang TNPM
4. Mở rộng E2E khi có auth thật → tạo `auth.setup.ts` generate `auth.json`
5. CI/CD: chạy `yarn test` + `yarn type-check` + `yarn test:e2e` trên PR
