# Part 11 — Cross-cutting Concerns

## Executive Summary

Cross-cutting concerns là các mối quan tâm **xuyên suốt mọi feature**, không thuộc về một bounded context cụ thể. Bao gồm: **logging**, **monitoring & metrics**, **error handling**, **caching**, **i18n**, **configuration management**, **feature flags**, **time/timezone**, **search**. Một số đã có trong codebase (i18n, error handling), một số là **đề xuất** dựa trên best practice.

---

## 1. Logging

### 1.1. Frontend logging

> 🟢 **Quan sát hiện tại:** Frontend dùng `console.log` rải rác. Production build có `terserOptions.compress.drop_console = true` → strip toàn bộ console.

**Vấn đề:** Khi user gặp lỗi production, không có log để debug.

**Đề xuất:**

| Mục đích | Tool |
|----------|------|
| **Error tracking** | Sentry / Datadog RUM |
| **User session replay** | LogRocket / Sentry Replay |
| **Performance monitoring** | Web Vitals (CLS/FID/LCP) → analytics |
| **Custom event** | Mixpanel / Amplitude (analytics) |

**Pattern:**

```ts
// utils/logger.ts
import * as Sentry from "@sentry/react";

export const logger = {
  info: (msg: string, ctx?: any) => {
    if (process.env.NODE_ENV === "development") console.log(msg, ctx);
    // production: silent unless Sentry breadcrumb
    Sentry.addBreadcrumb({ message: msg, data: ctx });
  },
  warn: (msg: string, ctx?: any) => {
    Sentry.captureMessage(msg, "warning");
  },
  error: (err: Error, ctx?: any) => {
    Sentry.captureException(err, { extra: ctx });
  }
};
```

### 1.2. Backend logging

> 🔴 **Đề xuất** — không thấy được trong frontend repo.

**Structured logging** với JSON:

```json
{
  "timestamp": "2026-04-14T10:23:45.123Z",
  "level": "INFO",
  "service": "sales",
  "request_id": "req-uuid",
  "user_id": 456,
  "tenant_id": 123,
  "message": "Invoice created",
  "invoice_id": 789,
  "duration_ms": 245
}
```

**Tools:**

- **Logger library**: Winston (Node.js), Logback (Java), structlog (Python)
- **Aggregation**: ELK (Elasticsearch + Logstash + Kibana) hoặc Loki + Grafana hoặc Datadog
- **Sampling**: log INFO 10%, log ERROR 100%

### 1.3. Log levels

| Level | Khi nào dùng |
|-------|--------------|
| **DEBUG** | Chi tiết flow, chỉ bật khi debug |
| **INFO** | Sự kiện bình thường (request started/completed, job processed) |
| **WARN** | Bất thường nhưng chưa fail (retry, fallback) |
| **ERROR** | Exception, request fail |
| **FATAL** | Service crash |

### 1.4. Không log

- ❌ Mật khẩu
- ❌ Access token, refresh token
- ❌ Credit card, CVV
- ❌ Mã PIN
- ❌ Dữ liệu sức khỏe
- ❌ CMND/CCCD đầy đủ

---

## 2. Monitoring & Metrics

### 2.1. Pillars of observability

| Pillar | Mô tả | Tool |
|--------|-------|------|
| **Logs** | Sự kiện chi tiết | ELK / Loki / Datadog |
| **Metrics** | Số liệu thời gian | Prometheus + Grafana |
| **Traces** | Distributed tracing | Jaeger / Zipkin / Datadog APM |

### 2.2. Metrics quan trọng

#### Service metrics

- **Request rate** (requests per second)
- **Error rate** (% requests fail)
- **Latency** (p50, p95, p99)
- **Saturation** (CPU, RAM, disk, connection pool)

#### Business metrics

- Số đơn POS/giờ/tenant
- Doanh thu/giờ/tenant
- Số user active concurrent
- Tỷ lệ thanh toán thành công
- Tỷ lệ webhook delivery thành công

### 2.3. Alerts

| Alert | Threshold | Action |
|-------|-----------|--------|
| **Error rate** > 5% trong 5 phút | Page on-call |
| **Latency p99** > 3s | Slack channel |
| **Service down** | Page on-call |
| **DB connection pool** > 80% | Slack |
| **Disk** > 85% | Slack |
| **SMS budget** > 90% daily | Email manager |
| **Webhook fail rate** > 10% | Slack |
| **Cron job stuck** > 1h | Page on-call |

### 2.4. Dashboard đề xuất

- **System Overview**: services up/down, error rate, latency
- **Business Overview**: orders/min, revenue, active users per tenant
- **Database**: connection pool, query time, replication lag
- **Integration**: webhook success rate, payment gateway response time
- **Per-tenant**: top 20 tenant by load (giúp phát hiện noisy tenant)

---

## 3. Error handling

### 3.1. Frontend error boundary

```tsx
// components/errorBoundary/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return <Page500 onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

> ⚠️ **Quan sát**: Codebase **không có** `ErrorBoundary` rõ ràng — nếu 1 page crash, toàn bộ app trắng. Cần thêm.

### 3.2. API error handling

```ts
const res = await CustomerService.update(body);
if (res.code === 0) {
  showToast("Thành công", "success");
} else if (res.code === 401) {
  // interceptor đã handle
} else if (res.code === 403) {
  showToast("Bạn không có quyền", "error");
} else if (res.code >= 500) {
  showToast("Lỗi hệ thống. Vui lòng thử lại.", "error");
  Sentry.captureMessage(`API 5xx: ${res.message}`);
} else {
  showToast(res.error || res.message || "Có lỗi xảy ra", "error");
}
```

### 3.3. User-facing message convention

| Trường hợp | Message |
|------------|---------|
| Validation fail | Cụ thể: *"Số điện thoại không đúng định dạng"* |
| Permission denied | *"Bạn không có quyền thực hiện thao tác này"* |
| Not found | *"Không tìm thấy dữ liệu"* |
| Conflict (đã tồn tại) | *"Số điện thoại đã tồn tại"* |
| Server error | *"Có lỗi xảy ra. Vui lòng thử lại sau."* |
| Network error | *"Lỗi kết nối. Vui lòng kiểm tra mạng."* |

> Quy tắc: **bằng tiếng Việt** + **gợi ý hành động** + **không expose stack trace**.

---

## 4. Caching strategy

### 4.1. Frontend caching

| Loại | Lưu ở | TTL | Ví dụ |
|------|-------|-----|-------|
| **Static asset** | Browser cache + CDN | 1 năm (immutable hash) | JS/CSS/font |
| **API response cache** | React state hoặc memory | 5 phút | Dropdown options |
| **Local storage** | localStorage | đến khi clear | User preferences, draft form |
| **IndexedDB** | IndexedDB | tùy | Offline data (nếu có) |
| **Cookie** | Cookie | session/persistent | Token, user meta |

### 4.2. Backend caching

| Layer | Tool | Use case |
|-------|------|----------|
| **L1 — In-process** | LRU cache | Hot data per service |
| **L2 — Distributed** | Redis | Shared cache giữa instances |
| **L3 — Database** | DB query cache | Materialized view |
| **L4 — CDN** | CloudFlare/CloudFront | Public API response |

### 4.3. Cache invalidation patterns

- **TTL**: cache hết hạn tự động (đơn giản)
- **Write-through**: update DB → update cache cùng lúc
- **Write-behind**: update cache trước → async update DB (rủi ro mất data)
- **Cache-aside**: app tự quản (read miss → query DB → set cache)
- **Pub/sub invalidation**: 1 service update → publish event → các service khác clear cache liên quan

### 4.4. Cache key convention

```
<service>:<entity>:<id>:<version>

vd: customer:detail:12345:v1
    invoice:list:tenant=123:branch=45:page=1:v2
```

### 4.5. Cache cần tránh

- ❌ Cache data nhạy cảm (token, password)
- ❌ Cache rất ngắn (< 1s) — overhead cao hơn benefit
- ❌ Cache quá dài → stale data

---

## 5. Internationalization (i18n)

### 5.1. Library

`react-i18next` 14.x

### 5.2. Setup

> Quan sát file [`src/i18n.ts`](../../src/i18n.ts).

```ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./locales/vi.json";
import en from "./locales/en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: localStorage.getItem("language") || "vi",
    fallbackLng: "vi",
    interpolation: { escapeValue: false },
  });
```

### 5.3. Usage trong component

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <button onClick={() => i18n.changeLanguage("en")}>EN</button>
    </div>
  );
}
```

### 5.4. Locale files

```
src/locales/
├── vi.json       # Tiếng Việt
└── en.json       # English
```

### 5.5. Format numbers, dates, currency

> Quan sát: codebase đang dùng **moment** + **date-fns** lẫn nhau (cần thống nhất). Format số/tiền dùng `formatCurrency` từ `reborn-util`.

**Đề xuất chuẩn**:

```ts
// Date: dùng date-fns + locale
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";

format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi });

// Number: dùng Intl
new Intl.NumberFormat("vi-VN").format(1234567);  // "1.234.567"

// Currency:
new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(1234567);
// "1.234.567 ₫"
```

---

## 6. Configuration management

### 6.1. Frontend config

#### Build-time

`vite.config.ts` define:

```ts
define: {
  "process.env.APP_API_URL": JSON.stringify(env.APP_API_URL),
  "process.env.APP_BIZ_URL": JSON.stringify(env.APP_BIZ_URL),
  // ...
}
```

→ Inject lúc build, không đổi runtime.

#### Runtime config

Một số config phải fetch lúc app start:

```ts
// App.tsx
useEffect(() => {
  TenantConfigService.get().then(config => {
    setTenantConfig(config);
  });
}, []);
```

→ Cấu hình **per tenant** (logo, theme, feature flags) lấy từ backend.

### 6.2. Env files

```
.env                # Default (commit to git)
.env.development    # Dev (commit)
.env.staging        # Staging (commit)
.env.production     # Production (KHÔNG commit, inject lúc deploy)
.env.local          # Local override (KHÔNG commit)
```

### 6.3. Backend config

> 🔴 **Đề xuất**

- **Per-environment**: file YAML/JSON inject lúc deploy
- **Secret**: từ Vault, không commit
- **Per-tenant**: lưu trong DB table `tenant_config`
- **Hot reload**: feature flag thay đổi runtime không cần restart

---

## 7. Feature flags

### 7.1. Mục đích

- Bật/tắt tính năng cho một số tenant (gradual rollout)
- A/B test
- Kill switch (tắt nhanh feature đang fail)

### 7.2. Pattern

```ts
const { features } = useContext(UserContext);

if (features.includes("new_pos_ui")) {
  return <NewPOSPage />;
} else {
  return <OldPOSPage />;
}
```

### 7.3. Tool đề xuất

- **LaunchDarkly** / **Unleash** (managed)
- **Tự build**: table `feature_flag` trong DB, frontend fetch lúc init

### 7.4. Hiện tại

Codebase có vẻ dùng **gói SaaS-based features** (mỗi tenant thuê gói nào → có feature đó), không dùng feature flag động. Đây cũng là 1 cách hợp lý.

---

## 8. Time & Timezone

### 8.1. Quy ước

- **DB**: lưu UTC (timestamp with timezone)
- **API**: trả ISO 8601 với timezone
- **Frontend**: convert sang local time của user khi hiển thị

### 8.2. Cấu hình per-tenant

Tenant có thể có múi giờ khác nhau (vd tenant ở Singapore: GMT+8). Cài ở [`UR-SETUP-02`](../urd/part-11-cai-dat-co-ban.md#ur-setup-02--cấu-hình-định-dạng-hệ-thống).

```ts
// Lúc hiển thị
const tenantTimezone = userContext.tenantConfig.timezone || "Asia/Ho_Chi_Minh";
format(toZonedTime(date, tenantTimezone), "dd/MM/yyyy HH:mm");
```

### 8.3. Cron job timezone

Background job (vd "Báo cáo ngày") chạy theo timezone tenant, không phải UTC. Backend phải xử lý.

---

## 9. Search

### 9.1. Frontend search

- **Local search**: filter array trong memory (nhanh, < 100 items)
- **API search**: gọi backend với query string
- **Debounce**: mọi search input dùng `useDebounce` 300ms

### 9.2. Backend search

| Loại | Implementation |
|------|----------------|
| **Exact match** | DB index |
| **Prefix** | `LIKE 'foo%'` + index |
| **Full-text** | PostgreSQL tsvector hoặc Elasticsearch |
| **Fuzzy** | pg_trgm hoặc ES |
| **Multi-field** | ES với boost weight |

### 9.3. Tìm kiếm toàn cục (global search)

Trong header có ô search match:
- Khách hàng (theo tên, SĐT, mã)
- Đơn hàng (mã)
- Sản phẩm (tên, mã, barcode)

Backend cần có endpoint `/api/global-search?q=...` truy vấn nhiều entity song song.

---

## 10. Notification

### 10.1. Loại notification

| Loại | Ví dụ | Channel |
|------|-------|---------|
| **In-app** | Đơn hàng mới | Chuông trên header |
| **Push (browser)** | Sự kiện realtime | Firebase FCM |
| **Push (mobile)** | Khi có app riêng | FCM / APNs |
| **Email** | Báo cáo định kỳ | SMTP |
| **SMS** | OTP, gia hạn | SMS gateway |
| **Zalo** | Khuyến mãi | Zalo OA |

### 10.2. Notification service

> Đã mô tả ở [Part 08 §3.12](part-08-backend-architecture.md#312-notification-service-bizapinotification).

### 10.3. Quy ước payload

```json
{
  "id": "notif-uuid",
  "type": "INVOICE_CREATED",
  "title": "Đơn hàng mới",
  "body": "Đơn #INV001 đã được tạo bởi Nguyễn A",
  "data": {
    "invoiceId": 123,
    "url": "/sale_invoice?id=123"
  },
  "createdAt": "2026-04-14T10:23:45Z",
  "read": false
}
```

---

## 11. Background jobs

### 11.1. Loại job

| Loại | Tần suất | Ví dụ |
|------|---------|-------|
| **Real-time** | Trigger by event | Send notification, dispatch webhook |
| **Scheduled** | Cron | Daily report, reconciliation |
| **Batch** | One-off, lớn | Marketing campaign 10k SMS |
| **Cleanup** | Cron | Xóa file temp, archive log |

### 11.2. Pattern

Đã mô tả ở [Part 08 §9](part-08-backend-architecture.md#9-background-workers-đề-xuất).

### 11.3. Monitoring

- Mỗi job có metric: started, completed, failed, duration
- Dead letter queue cho job fail nhiều lần
- Dashboard hiển thị job đang chạy, queue depth

---

## 12. Idempotency

### 12.1. Tại sao cần

Network có thể fail giữa chừng → client retry → backend xử lý 2 lần → đơn duplicate.

### 12.2. Pattern

Client gửi header `Idempotency-Key: <uuid>` với mỗi POST quan trọng:

```
POST /sales/invoice/create
Idempotency-Key: req-abc-123
Body: { ... }
```

Backend:

```python
def create_invoice(request):
    key = request.headers.get("Idempotency-Key")
    cached = redis.get(f"idempotency:{key}")
    if cached:
        return cached  # Trả lại response cũ
    
    response = process_create()
    redis.setex(f"idempotency:{key}", 3600, response)
    return response
```

> ⚠️ **Quan sát**: Codebase **chưa có** idempotency key. POST tạo đơn nếu user double-click hoặc mạng kém → có thể tạo 2 đơn. Cần fix.

---

## 13. Distributed tracing

### 13.1. Mục đích

Khi 1 request đi qua nhiều microservice, debug rất khó nếu không trace được full chain.

### 13.2. Tool

- **Jaeger** (open-source)
- **Zipkin** (open-source)
- **Datadog APM** (managed)
- **AWS X-Ray** (managed)

### 13.3. Pattern

Mỗi request có:
- `trace_id`: định danh toàn bộ request chain
- `span_id`: định danh 1 hop
- `parent_span_id`: hop cha

Frontend gửi header `traceparent` (W3C standard), backend pass tiếp qua các service.

> 🔴 **Đề xuất** — không thấy trong codebase hiện tại.

---

## 14. Rate limiting (client-side)

Để tránh user click spam tạo nhiều request:

```ts
// Disable button khi đang submit
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  if (submitting) return;
  setSubmitting(true);
  try {
    await CustomerService.update(body);
  } finally {
    setSubmitting(false);
  }
};

return <Button disabled={submitting}>Lưu</Button>;
```

Pattern này quan sát thấy trong nhiều form ([`AddCustomerPersonModal`](../../src/pages/CustomerPerson/partials/AddCustomerPersonModal.tsx) → `isSubmit` state).

---

## 15. Cross-cutting concerns checklist

Khi build feature mới, check:

- [ ] Có log đủ event quan trọng?
- [ ] Có metric để track usage?
- [ ] Có error handling rõ ràng?
- [ ] Có cache nếu data tĩnh?
- [ ] Có i18n cho UI text?
- [ ] Có timezone-aware nếu liên quan ngày giờ?
- [ ] Có idempotency cho POST critical?
- [ ] Có rate limit protection?
- [ ] Có audit log nếu nhạy cảm?
- [ ] Có notification cho user nếu cần?

---

*Hết Part 11.*
