# [notification] feedbackHistory/count trả 400 Bad Request

**Severity:** 🟠 HIGH
**Service:** `cloud-notification-master`
**Endpoint:** `GET /notification/feedbackHistory/count`
**Phát hiện:** 2026-04-21, console 400 trên nhánh community-hub (tenant `hub.reborn.vn`)

---

## Hiện tượng

Khi vào trang `Quản lý thành viên` hoặc các trang có `<Header />` (gọi notification count cho badge), FE gọi:

```
GET https://biz.reborn.vn/notification/feedbackHistory/count
Host: biz.reborn.vn
Hostname: hub.reborn.vn
```

BE trả `400 Bad Request`, đi kèm:

```
SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input
  at NotificationService.ts:32
  at async getCountUnread (header.tsx:567)
```

→ FE crash promise do response body rỗng.

## Nguyên nhân nghi ngờ

Một hoặc kết hợp các case:

1. **Endpoint chưa implement** trên notification service — route matching fail → trả 400 body rỗng.
2. **Thiếu required param** (ví dụ `employeeId`, `userId`, `startDate`) → BE reject nhưng không trả error JSON, chỉ HTTP 400 với body rỗng.
3. **Tenant không có data** → query trả error thay vì `{ count: 0 }`.
4. **Auth middleware chặn** trước khi vào controller mà không trả error body chuẩn.

## Việc cần làm

### 1. Chuẩn hoá response

Dù success hay fail, endpoint phải **luôn trả JSON body** theo contract chuẩn của project:

```jsonc
// Success — ngay cả khi count = 0
{ "code": 0, "message": "OK", "result": { "count": 0 } }

// Fail
{ "code": 400, "message": "MISSING_PARAM: employeeId", "result": null }
```

Không bao giờ trả body rỗng + HTTP 400 → FE không thể parse.

### 2. Xác nhận contract endpoint

Chốt với FE team:

- URL: `GET /notification/feedbackHistory/count`
- Query params **bắt buộc/optional**: `employeeId?`, `userId?`, `fromDate?`, `toDate?`
- Response shape: `{ code, message, result: { count: number } }`
- Empty result ≠ error — tenant mới chưa có feedback → `count: 0`

### 3. Test regression

- Tenant mới tạo (0 feedback) → gọi endpoint → `{ code: 0, result: { count: 0 } }`
- Tenant đang dùng (≥ 1 feedback unread) → `count > 0`
- Thiếu header `X-Tenant-ID` → `403 MISSING_TENANT` (nhất quán với rule billing)

### 4. Audit các endpoint count/list tương tự trong notification

Cùng pattern có thể bug ở:

- `GET /notification/feedbackHistory/list`
- `GET /notification/history/count`
- `GET /notification/push/count`
- Mọi endpoint `/notification/*/count`

## Acceptance Criteria

- [ ] `GET /notification/feedbackHistory/count` **luôn** trả JSON body, không rỗng
- [ ] Tenant mới (0 feedback) → `result.count === 0`, không error
- [ ] Param sai → HTTP 400 + body `{ code, message }` giải thích rõ param nào sai
- [ ] FE `await res.json()` không throw ở [src/services/NotificationService.ts:32](../../../src/services/NotificationService.ts#L32) nữa

## Lưu ý không phá ngành khác

- Fix cross-cutting, áp cho mọi ngành (retail / spa / tnpm / community-hub / banking / …).
- Giữ response shape hiện tại (chỉ đảm bảo không rỗng), FE không cần sửa.

## Reference

- FE caller: [src/services/NotificationService.ts](../../../src/services/NotificationService.ts)
- FE header badge: `getCountUnread()` trong [src/components/header/header.tsx](../../../src/components/header/header.tsx)
