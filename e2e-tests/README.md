# E2E Tests — TNPM CRM

Playwright end-to-end tests for the TNPM Property Management frontend.

## Setup

1. Install Playwright browsers (one-time):
   ```bash
   npx playwright install chromium
   ```

2. Start the dev server in one terminal:
   ```bash
   yarn dev
   ```

3. Run tests in another terminal:
   ```bash
   # All tests
   npx playwright test

   # UI mode (interactive debugger)
   npx playwright test --ui

   # Single file
   npx playwright test debt-management.spec.ts

   # Debug mode with browser visible
   npx playwright test --headed --debug
   ```

## Test files

| File | Flow covered |
|---|---|
| `debt-management.spec.ts` | Công nợ: list → pay → history |
| `partner.spec.ts` | Đối tác: add partner + create contract |
| `lease-contract.spec.ts` | Lease: detail modal → escalation apply → renewal |
| `fee-notification.spec.ts` | Notification: create campaign wizard (4 steps) |
| `vendor-invoice.spec.ts` | Vendor 3-way match workflow approval |
| `b2g-compliance.spec.ts` | B2G: budget dashboard + payment workflow |

## Auth

Hiện tại TNPM mock pages không yêu cầu login server-side. Các test đi thẳng vào các route `/debt-management`, `/partners`, v.v.
Nếu về sau cần real auth, tạo `auth-setup.ts` để generate `auth.json` rồi `storageState: "auth.json"` trong config.
