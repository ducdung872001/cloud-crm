# Part 11 — Cross-cutting Concerns

> Mô tả các vấn đề xuyên suốt (cross-cutting) ảnh hưởng toàn hệ thống:
> logging, error handling, i18n, date/time, performance, và background jobs.

---

## 1. Logging

### 1.1. Client-side Logging

Hiện tại frontend sử dụng `console.log` / `console.warn` / `console.error`
trực tiếp trong code. Chưa có tập trung log ra external service.

| Mức độ     | Sử dụng                          | Ví dụ                          |
|-----------|----------------------------------|--------------------------------|
| `log`     | Debug info trong dev             | API response, state change     |
| `warn`    | Logic bất thường nhưng không lỗi | Missing optional field         |
| `error`   | Lỗi cần xử lý                    | API fail, render crash         |

**Roadmap:** Tích hợp Sentry SDK để bắt lỗi production tự động.
Config sẽ dùng `VITE_SENTRY_DSN` env var, filter sensitive data trước khi gửi.

### 1.2. Server-side Logging

Backend (Spring Boot) sử dụng **SLF4J + Logback** làm logging framework.

```
[2026-04-16 09:23:45.123] [crm-service] [INFO] [req-abc123] 
  CustomerController.getList — tenantId=42, page=1, size=20
```

- **Format:** timestamp, service-name, level, correlation-id, message
- **Correlation ID:** truyền qua header `X-Request-Id` từ API gateway
- **Log level:** DEBUG (dev), INFO (staging), WARN (prod)
- **ELK Stack:** Logstash thu log từ container → Elasticsearch → Kibana dashboard
- **Retention:** 7 ngày (dev), 30 ngày (staging), 90 ngày (prod)

---

## 2. Error Handling

### 2.1. Frontend — ErrorBoundary

React ErrorBoundary bắt render error và hiển thị fallback UI:

```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

- **Global level:** wrap toàn bộ `<App />` — bắt mọi unhandled error
- **Page level:** từng route có thể có ErrorBoundary riêng
- **API error:** Axios interceptor bắt HTTP error, hiển thị toast notification

### 2.2. Backend — Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(ex.getHttpStatus())
            .body(new ErrorResponse(ex.getCode(), ex.getMessage()));
    }
}
```

### 2.3. Error Code Convention

| Range       | Loại                | Ví dụ                        |
|------------|---------------------|------------------------------|
| 1000-1999  | Authentication      | 1001 = Token expired         |
| 2000-2999  | Authorization       | 2001 = No permission         |
| 3000-3999  | Validation          | 3001 = Required field        |
| 4000-4999  | Business logic      | 4001 = Duplicate email       |
| 5000-5999  | System / infra      | 5001 = DB connection failed  |

---

## 3. Internationalization (i18n)

### 3.1. Framework

Frontend sử dụng **react-i18next** với cấu hình:

```typescript
i18n.use(initReactI18next).init({
  lng: "vi",
  fallbackLng: "en",
  ns: ["common", "crm", "hr", "tax"],
  defaultNS: "common",
});
```

### 3.2. Locale Files

```
src/locales/
  vi/
    common.json    // menu, button, label chung
    crm.json       // module CRM
    hr.json        // module HR
  en/
    common.json
    crm.json
    hr.json
```

### 3.3. Date & Currency Formatting

| Loại     | Ví dụ (vi)             | Ví dụ (en)           |
|---------|------------------------|----------------------|
| Date    | 16/04/2026             | 04/16/2026           |
| Money   | 1.500.000 VND          | 1,500,000 VND       |
| Percent | 10,5%                  | 10.5%                |

Sử dụng `Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })`
cho formatting tiền tệ nhất quán.

---

## 4. Date/Time Handling

### 4.1. Dual Library (Tech Debt)

Hệ thống hiện dùng **cả hai** `moment.js` và `date-fns`:

- **moment.js:** code cũ (2022-2024), dùng trong form, filter, report
- **date-fns:** code mới (2024+), nhẹ hơn, tree-shakeable

Đây là tech debt đã biết (xem ADR-05 trong Part 13). Kế hoạch migrate:
module mới bắt buộc dùng `date-fns`, module cũ migrate dần theo sprint.

### 4.2. Timezone

- **Backend:** lưu tất cả thời gian dạng UTC trong MySQL (`DATETIME` column)
- **Frontend:** convert sang timezone của user khi hiển thị
- **API contract:** ISO 8601 format: `2026-04-16T09:30:00Z`

---

## 5. Performance Optimization

### 5.1. Frontend

| Kỹ thuật                | Mô tả                                          |
|------------------------|------------------------------------------------|
| Vite code-splitting    | Mỗi route là 1 chunk riêng, load on-demand     |
| React.lazy + Suspense  | Lazy load page component                       |
| ag-Grid virtualization | Chỉ render row trong viewport (10k+ row OK)    |
| React.memo             | Tránh re-render component khi props không đổi   |
| useMemo / useCallback  | Cache giá trị tính toán nặng, callback ổn cùng  |
| Image optimization     | WebP format, lazy loading, CDN cache            |

### 5.2. Backend

| Kỹ thuật             | Mô tả                                           |
|---------------------|------------------------------------------------|
| Redis cache         | Cache permission, config, lookup data           |
| Query optimization  | Index, pagination, avoid N+1                    |
| Connection pool     | HikariCP, max 20 connections per service        |
| Async processing    | RabbitMQ cho task nặng (email, report)          |

---

## 6. Background Jobs (RabbitMQ)

### 6.1. Architecture

```
Producer (API) → RabbitMQ Exchange → Queue → Consumer (Worker)
```

### 6.2. Job Catalog

| Queue Name              | Chức năng              | Retry | DLQ |
|------------------------|------------------------|-------|-----|
| `email.send`           | Gửi email (SMTP)       | 3 lần | Có  |
| `report.generate`      | Tạo báo cáo Excel/PDF  | 2 lần | Có  |
| `sla.check`            | Kiểm tra SLA deadline   | 1 lần | Có  |
| `notification.push`    | Push notification       | 3 lần | Có  |
| `import.process`       | Import Excel data       | 1 lần | Có  |

### 6.3. Dead Letter Queue (DLQ)

Khi message thất bại sau max retry, chuyển vào DLQ để:
1. Admin review trên RabbitMQ Management UI
2. Fix lỗi và replay message
3. Alert qua email/Slack nếu DLQ > 100 messages

---

## 7. Tổng kết

Cross-cutting concerns được xử lý nhất quán qua các layer:
- **Logging:** console (FE) + SLF4J/ELK (BE), hướng tới Sentry
- **Error:** ErrorBoundary + Global Exception Handler + error code
- **i18n:** react-i18next, 2 ngôn ngữ vi/en
- **Date:** dual library (tech debt), UTC backend, local frontend
- **Performance:** code-split, virtualization, cache, async
- **Jobs:** RabbitMQ với retry + DLQ pattern
