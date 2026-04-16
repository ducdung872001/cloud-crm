# Part 11 — Cross-cutting Concerns

> Mo ta cac van de xuyen suot (cross-cutting) anh huong toan he thong:
> logging, error handling, i18n, date/time, performance, va background jobs.

---

## 1. Logging

### 1.1. Client-side Logging

Hien tai frontend su dung `console.log` / `console.warn` / `console.error`
truc tiep trong code. Chua co tap trung log ra external service.

| Muc do     | Su dung                          | Vi du                          |
|-----------|----------------------------------|--------------------------------|
| `log`     | Debug info trong dev             | API response, state change     |
| `warn`    | Logic bat thuong nhung khong loi | Missing optional field         |
| `error`   | Loi can xu ly                    | API fail, render crash         |

**Roadmap:** Tich hop Sentry SDK de bat loi production tu dong.
Config se dung `VITE_SENTRY_DSN` env var, filter sensitive data truoc khi gui.

### 1.2. Server-side Logging

Backend (Spring Boot) su dung **SLF4J + Logback** lam logging framework.

```
[2026-04-16 09:23:45.123] [crm-service] [INFO] [req-abc123] 
  CustomerController.getList — tenantId=42, page=1, size=20
```

- **Format:** timestamp, service-name, level, correlation-id, message
- **Correlation ID:** truyen qua header `X-Request-Id` tu API gateway
- **Log level:** DEBUG (dev), INFO (staging), WARN (prod)
- **ELK Stack:** Logstash thu log tu container → Elasticsearch → Kibana dashboard
- **Retention:** 7 ngay (dev), 30 ngay (staging), 90 ngay (prod)

---

## 2. Error Handling

### 2.1. Frontend — ErrorBoundary

React ErrorBoundary bat render error va hien thi fallback UI:

```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

- **Global level:** wrap toan bo `<App />` — bat moi unhandled error
- **Page level:** tung route co the co ErrorBoundary rieng
- **API error:** Axios interceptor bat HTTP error, hien thi toast notification

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

| Range       | Loai                | Vi du                        |
|------------|---------------------|------------------------------|
| 1000-1999  | Authentication      | 1001 = Token expired         |
| 2000-2999  | Authorization       | 2001 = No permission         |
| 3000-3999  | Validation          | 3001 = Required field        |
| 4000-4999  | Business logic      | 4001 = Duplicate email       |
| 5000-5999  | System / infra      | 5001 = DB connection failed  |

---

## 3. Internationalization (i18n)

### 3.1. Framework

Frontend su dung **react-i18next** voi cau hinh:

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

| Loai     | Vi du (vi)             | Vi du (en)           |
|---------|------------------------|----------------------|
| Date    | 16/04/2026             | 04/16/2026           |
| Money   | 1.500.000 VND          | 1,500,000 VND       |
| Percent | 10,5%                  | 10.5%                |

Su dung `Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })`
cho formatting tien te nhat quan.

---

## 4. Date/Time Handling

### 4.1. Dual Library (Tech Debt)

He thong hien dung **ca hai** `moment.js` va `date-fns`:

- **moment.js:** code cu (2022-2024), dung trong form, filter, report
- **date-fns:** code moi (2024+), nhe hon, tree-shakeable

Day la tech debt da biet (xem ADR-05 trong Part 13). Ke hoach migrate:
module moi bat buoc dung `date-fns`, module cu migrate dan theo sprint.

### 4.2. Timezone

- **Backend:** luu tat ca thoi gian dang UTC trong MySQL (`DATETIME` column)
- **Frontend:** convert sang timezone cua user khi hien thi
- **API contract:** ISO 8601 format: `2026-04-16T09:30:00Z`

---

## 5. Performance Optimization

### 5.1. Frontend

| Ky thuat                | Mo ta                                          |
|------------------------|------------------------------------------------|
| Vite code-splitting    | Moi route la 1 chunk rieng, load on-demand     |
| React.lazy + Suspense  | Lazy load page component                       |
| ag-Grid virtualization | Chi render row trong viewport (10k+ row OK)    |
| React.memo             | Tranh re-render component khi props khong doi   |
| useMemo / useCallback  | Cache gia tri tinh toan nang, callback on cung  |
| Image optimization     | WebP format, lazy loading, CDN cache            |

### 5.2. Backend

| Ky thuat             | Mo ta                                           |
|---------------------|------------------------------------------------|
| Redis cache         | Cache permission, config, lookup data           |
| Query optimization  | Index, pagination, avoid N+1                    |
| Connection pool     | HikariCP, max 20 connections per service        |
| Async processing    | RabbitMQ cho task nang (email, report)          |

---

## 6. Background Jobs (RabbitMQ)

### 6.1. Architecture

```
Producer (API) → RabbitMQ Exchange → Queue → Consumer (Worker)
```

### 6.2. Job Catalog

| Queue Name              | Chuc nang              | Retry | DLQ |
|------------------------|------------------------|-------|-----|
| `email.send`           | Gui email (SMTP)       | 3 lan | Co  |
| `report.generate`      | Tao bao cao Excel/PDF  | 2 lan | Co  |
| `sla.check`            | Kiem tra SLA deadline   | 1 lan | Co  |
| `notification.push`    | Push notification       | 3 lan | Co  |
| `import.process`       | Import Excel data       | 1 lan | Co  |

### 6.3. Dead Letter Queue (DLQ)

Khi message that bai sau max retry, chuyen vao DLQ de:
1. Admin review tren RabbitMQ Management UI
2. Fix loi va replay message
3. Alert qua email/Slack neu DLQ > 100 messages

---

## 7. Tong ket

Cross-cutting concerns duoc xu ly nhat quan qua cac layer:
- **Logging:** console (FE) + SLF4J/ELK (BE), huong toi Sentry
- **Error:** ErrorBoundary + Global Exception Handler + error code
- **i18n:** react-i18next, 2 ngon ngu vi/en
- **Date:** dual library (tech debt), UTC backend, local frontend
- **Performance:** code-split, virtualization, cache, async
- **Jobs:** RabbitMQ voi retry + DLQ pattern
