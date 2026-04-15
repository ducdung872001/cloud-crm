# Part 11 — Cross-cutting concerns

> **Executive Summary**: Các mối quan tâm xuyên suốt (logging, error, i18n, date/time, currency, a11y, performance, monitoring, feature flag, background job) được xử lý ở FE bằng thư viện tiêu chuẩn: `ErrorBoundary`, `react-i18next`, `moment` + `date-fns` (duplicated — rủi ro), `Intl.NumberFormat` cho VND. **Thiếu rõ ràng**: không có integration Sentry/Datadog cho client error, không có feature flag system, không rõ background job framework BE. Performance dựa vào code-split route-level của Vite — bundle vẫn lớn do Slate + ag-grid + bpmn-js.

## 1. Logging

### 1.1. Client-side

🟢 **Quan sát**: `src/components/ErrorBoundary/` — React error boundary bắt lỗi render, hiển thị fallback UI.

🔴 **Thiếu**: không thấy integration Sentry, Datadog RUM, LogRocket hay tự host service tương tự. Error chỉ log ra `console.error`.

**Khuyến nghị**:

```ts
// src/main.tsx (đề xuất)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.APP_SENTRY_DSN,
  environment: process.env.APP_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
});
```

### 1.2. Server-side log forwarding

🔴 BE — kỳ vọng:

- Log format: **JSON structured** (timestamp, level, service, traceId, userId, tenantId, message).
- Shipper: Fluent Bit / Filebeat → **Loki** hoặc **Elasticsearch**.
- Retention: 30 ngày hot, 90 ngày warm, 1 năm cold.

### 1.3. Trace ID propagation

Khuyến nghị thêm vào `fetchConfig.ts`:

```ts
config.headers["X-Request-Id"] = crypto.randomUUID();
```

BE echo lại qua các service để trace một request end-to-end.

## 2. Error handling

### 2.1. Layers

```
┌────────────────────────────────┐
│ 1. Global ErrorBoundary (SPA)  │  React render error
├────────────────────────────────┤
│ 2. Route-level boundary        │  (tuỳ route)
├────────────────────────────────┤
│ 3. Service try/catch           │  Network + business error
├────────────────────────────────┤
│ 4. window.onerror + onunh..    │  Uncaught promise (🔴 cần add)
└────────────────────────────────┘
```

### 2.2. Toast

🟢 FE dùng `react-toastify` (hoặc tương đương) — `showToast(message, "error" | "success")`. Mỗi service gọi sau response không ok.

### 2.3. User-facing error messages

- Khi 4xx: hiển thị `response.message` từ BE (phải có tiếng Việt).
- Khi 5xx: "Lỗi hệ thống, vui lòng thử lại."
- Khi network: "Không kết nối được máy chủ."

### 2.4. Form validation error

Dùng **react-hook-form** hoặc validate thủ công, hiển thị dưới field bằng `Form.ErrorText`.

## 3. Internationalization (i18n)

### 3.1. Stack

🟢 `react-i18next` 14 + `i18next-browser-languagedetector`.

### 3.2. File structure

```
public/locales/
  vi/
    common.json
    pos.json
    inventory.json
    ...
  en/
    common.json
    ...
```

### 3.3. Namespace

Mỗi module dùng 1 namespace để tránh key collision:

```ts
const { t } = useTranslation(["pos", "common"]);
t("pos:order.create");
t("common:button.save");
```

### 3.4. Fallback

- `fallbackLng: "vi"` — tiếng Việt là ngôn ngữ chủ.
- Nếu key thiếu ở `vi` → hiển thị key raw để tester phát hiện.

### 3.5. Rủi ro

🟡 Nhiều chỗ hardcode chuỗi VI trực tiếp trong JSX — không qua `t()`. Cần audit bằng lint rule `i18next/no-literal-string`.

## 4. Date/time

### 4.1. Libs

🟢 `package.json` chứa **cả** `moment` và `date-fns` — **duplicate**, rủi ro bundle bloat.

**Khuyến nghị**: chọn **1** — `date-fns` hiện đại hơn, tree-shakeable. Migrate dần moment → date-fns trong 1-2 sprint.

### 4.2. Locale

```ts
import { vi } from "date-fns/locale";
format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi });
// → "15/04/2026 14:30"
```

### 4.3. Timezone

🔴 **Rủi ro**: browser user chạy ở `Asia/Ho_Chi_Minh` (UTC+7). Nếu server ở UTC → phải convert khi hiển thị.

**Convention đề xuất**:

- BE trả ISO 8601 với timezone (`2026-04-15T07:30:00Z` hoặc `+07:00`).
- FE parse bằng `parseISO()`, hiển thị locale VN.
- Không gửi date-only string — luôn đi kèm giờ.

## 5. Currency & number

### 5.1. VND default

```ts
const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
// 1234567 → "1.234.567 ₫"
```

### 5.2. Multi-currency (future)

Nếu tenant quốc tế, cần thêm column `currency` vào order. FE đọc từ API, không hardcode VND.

### 5.3. Rounding

VND làm tròn **đến đồng** (không có xu). Khi tính thuế 8% → dùng `Math.round()`.

## 6. Accessibility (a11y)

### 6.1. Target

**WCAG 2.1 AA**.

### 6.2. Checklist

| Yêu cầu | Trạng thái |
|---------|------------|
| Semantic HTML (`<button>` không phải `<div onClick>`) | 🟡 mixed |
| Keyboard navigation | 🟡 ag-grid ok, modal cần kiểm tra |
| ARIA label cho icon button | 🔴 nhiều chỗ thiếu |
| Contrast ratio ≥ 4.5:1 | 🟡 cần audit |
| Focus visible | 🟡 |
| Screen reader test (NVDA/JAWS) | 🔴 chưa làm |
| Form label + error association | 🟡 |

### 6.3. Khuyến nghị

- Cài `eslint-plugin-jsx-a11y`.
- Test định kỳ với **axe DevTools** browser extension.
- Ít nhất 1 lần audit chuyên gia a11y trước GA.

## 7. Performance

### 7.1. Code splitting

🟢 Vite + `React.lazy()` cho mỗi route → bundle ban đầu nhỏ, load module khi vào trang.

### 7.2. Lazy load image

🟡 Dùng `loading="lazy"` cho `<img>`, hoặc thư viện `react-lazy-load-image-component`.

### 7.3. Bundle size

🔴 **Rủi ro**: tổng bundle ~8-12MB uncompressed (ước tính từ `package.json`).

Đóng góp lớn nhất:

| Lib | Size (gzip) |
|-----|-------------|
| ag-grid + enterprise | ~800KB |
| bpmn-js | ~600KB |
| slate + slate-react | ~200KB |
| moment (locale) | ~300KB |
| firebase | ~200KB |
| msal | ~150KB |

**Hành động**:

1. Dynamic import `ag-grid` (chỉ load trang có grid).
2. Dynamic import `bpmn-js` (chỉ trang BPM designer).
3. Remove moment, dùng date-fns.
4. Cân nhắc gỡ MSAL nếu không còn dùng.

### 7.4. Image optimization

- Convert PNG/JPG → **WebP** hoặc **AVIF**.
- CDN tự resize (CloudFlare Image Resizing, imgproxy).

### 7.5. Caching

- `Cache-Control: public, max-age=31536000, immutable` cho static asset (Vite hash filename).
- `index.html` no-cache.

## 8. Monitoring

### 8.1. Core Web Vitals (target)

| Metric | Target |
|--------|--------|
| LCP | ≤ 2.5s |
| FID / INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| TTFB | ≤ 600ms |

### 8.2. FPS

Các trang có animation (dashboard chart, drag-drop BPM) nên duy trì ≥ 55 FPS.

### 8.3. API response time

BE target (per [Part 14](part-14-quality-risks.md)):

| Endpoint | P95 |
|----------|-----|
| POS create order | ≤ 500ms |
| Product search | ≤ 300ms |
| Report heavy | ≤ 5s |

### 8.4. Monitoring stack khuyến nghị

```
FE RUM         →  Sentry Performance / Datadog RUM / web-vitals lib
BE APM         →  OpenTelemetry → Tempo (trace) + Prometheus (metric)
Log            →  Loki / ELK
Uptime         →  UptimeRobot / Pingdom
Alerting       →  Grafana Alerting → Slack/Telegram
```

## 9. Feature flags

🔴 **Thấp** — không thấy flag system (LaunchDarkly, Unleash, ConfigCat) trong code.

### Giả thuyết

- Có thể bật/tắt module qua **menu permission** — nhưng không phải flag thực sự.
- Có thể bật/tắt qua **env var** build-time — kém linh hoạt.

### Khuyến nghị

Giới thiệu **Unleash** (open source) hoặc **Flagsmith** để:

- A/B test.
- Canary rollout (bật 5% user).
- Kill switch khi có bug.
- Per-tenant toggle (important cho retail multi-brand).

## 10. Background jobs

🔴 **Thấp** — BE concern, chưa xác nhận.

### Kỳ vọng

| Job | Tần suất |
|-----|----------|
| Sync marketplace order | 5 phút |
| Rollup daily report | 0h hàng ngày |
| Cleanup expired session | 1h |
| Retry failed webhook | 10s (với backoff) |
| Send scheduled campaign | theo lịch user đặt |
| Reindex search | weekly |
| Archive old log | monthly |

### Framework khuyến nghị

- **Quartz** (Java) / **go-cron** (Go) / **Bull** + Redis (Node).
- **Temporal.io** cho workflow dài, retry phức tạp.

### Monitoring

- Mỗi job log `started`, `succeeded`/`failed`, `duration`.
- Dashboard "Job health" để ops theo dõi.

## 11. Configuration

### 11.1. Env var

🟢 Vite env prefix `APP_*`:

```
APP_API_URL=https://cloud.reborn.vn
APP_BIZ_URL=https://biz.reborn.vn
APP_BPM_URL=https://bpm.reborn.vn
APP_AUTHENTICATOR_URL=https://reborn.vn
APP_CONNECT_URL=https://connect.reborn.vn
APP_UPLOAD_URL=https://upload.reborn.vn
APP_ATHENA_URL=https://api-athenaspear-prod.athenafs.io
```

### 11.2. Runtime config (for multi-env deployment)

🔴 Hiện tại env var **build-time** → 1 build = 1 env. Muốn share build cho dev/stg/prod phải tách config ra `config.json` runtime, nạp từ `public/`.

## 12. Localization of errors

Mỗi key error BE nên có i18n key tương ứng:

```json
// common.json
{
  "error": {
    "NETWORK": "Không kết nối được máy chủ",
    "UNAUTHORIZED": "Phiên làm việc hết hạn",
    "FORBIDDEN": "Bạn không có quyền thực hiện",
    "NOT_FOUND": "Không tìm thấy dữ liệu",
    "CONFLICT": "Dữ liệu đã tồn tại",
    "VALIDATION": "Dữ liệu không hợp lệ"
  }
}
```

## Tham chiếu

- Files:
  - `src/components/ErrorBoundary/`
  - `src/i18n/` (hoặc `public/locales/`)
  - `package.json` (moment, date-fns, i18next)
  - `vite.config.ts`
- [Part 03 — Tech stack](part-03-tech-stack.md)
- [Part 14 — Quality & risks](part-14-quality-risks.md)
- [ADR-09](part-13-adr.md#adr-09) i18next

---
*Hết Part 11. Xem tiếp [Part 12 — Deployment](part-12-deployment.md).*
