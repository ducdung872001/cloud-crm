# BACKEND-TASK: `/market/events/*` endpoints hỏng — create 400, list 403 sai permission

**Phát hiện**: 2026-04-22 — khi tester W-House báo "Tạo sự kiện > Lưu & công bố / Lưu nháp không gọi API".
**Môi trường**: `https://biz.reborn.vn` (prod BE), truy cập qua `https://hub.reborn.vn/crm` (W-House tenant, id=336).
**User**: `0898348348` (W-House Admin, roles=`["mod"]`, tenantId=336).
**Ảnh hưởng**: Toàn bộ chức năng module **Sự kiện (Community Hub — Events)** không lưu được vào DB. FE hiện đang rơi vào fallback `localStorage` (xem [src/pages/CommunityHub/Events/storage.ts](../../../src/pages/CommunityHub/Events/storage.ts)) nên user thấy data hiển thị nhưng thực tế DB trống. Khi đổi máy/trình duyệt sẽ mất sạch.

## 1. Bug permission: `GET /market/events/list` → 403 nhưng ghi Path sai

```bash
GET /bizapi/market/events/list?page=1&limit=20
Authorization: Bearer <token user 0898348348, role mod, tenant 336>
Hostname: hub.reborn.vn

→ 403 { "error": "Bạn không có quyền thực hiện thao tác này! Path: /promotion/, Action: VIEW" }
```

- `Path: /promotion/` → permission middleware đang map route `/market/events/*` vào group permission `/promotion/`. Tức là permission policy cho module Events **chưa được đăng ký** trong bảng permission của BE, nó fallback sang `/promotion/` (module bên cạnh trong microservice `market`).
- User `mod` không có perm `/promotion/ VIEW` nên bị chặn ngay.

**Cần làm**:
1. Đăng ký permission group mới `/events/` (hoặc `/market/events/`) trong BE permission table.
2. Gán các action chuẩn: `VIEW`, `ADD`, `EDIT`, `DELETE`, `PUBLISH`.
3. Cấp các action này cho role `mod` (và `admin`) ở mọi tenant.

## 2. Bug validate: `POST /market/events/create` → 400 "Input wrong" bất kể payload

Đã thử **3 format payload × 9 path** — tất cả đều fail. Script probe: `tests/probe-events-api.mjs`, `tests/probe-events-paths.mjs`, `tests/probe-events-minimal.mjs`.

| Payload | Status | Body |
|---|---|---|
| `{}` (rỗng) | 403 `/promotion/ ADD` | → permission chặn trước |
| `{ title: "x" }` | 403 `/promotion/ ADD` | → permission chặn trước |
| `{ title, tenantId: 336 }` | **400** `"Input wrong"` | qua permission, fail validate |
| `{ title, tenant_id: 336 }` | **400** `"Input wrong"` | qua permission, fail validate |
| Full snake_case (title + description + start_date + end_date + reg open/close + venue_is_online + venue_online_url + contact_name + contact_phone) | **400** `"Input wrong"` | fail validate |
| Full camelCase flat (startDate, venueName, ...) | **400** `"Input wrong"` | fail validate |
| Full camelCase nested (`venue: {...}`, `contactPerson: {...}`) | **400** `"Input wrong"` | fail validate |

**Cần làm**:
1. Xác nhận endpoint chính xác (FE đang gọi `POST /market/events/create`; spec trong `docs/events/backend-spec.md` viết `POST /marketing/events` nhưng path đó trả 404 → chắc chắn FE path là đúng).
2. Bật chi tiết lỗi validation thay vì generic `"Input wrong"`. Trả field cụ thể + rule bị vi phạm (VD `{"error":"Validation failed","details":{"start_date":"required"}}`).
3. Đồng bộ schema FE ↔ BE: hiện FE gửi nested (`venue: {...}`) dựa trên entity `EventEntity`. BE table dùng flat snake_case (`venue_name`, `venue_is_online`, v.v.). **Đề xuất**: BE accept cả 2 format, hoặc FE phải có serializer flatten trước khi POST.

## 3. Hậu quả FE & workaround hiện tại

`src/pages/CommunityHub/Events/storage.ts::createEventAsync` có fallback:

```ts
try {
  const res = await EventService.create(data);
  if (isApiOk(res)) { apiAvailable = true; return normalizeEvent(unwrap(res)); }
} catch { /* fallback */ }
return this.createEvent(data);  // ← lưu localStorage
```

`isApiOk` chỉ true khi `code===0 || result!==undefined || ok===true`. BE trả 400/403 → false → silently rơi vào `createEvent(data)` ghi localStorage. **UI không hề báo lỗi** — user tưởng đã lưu DB.

**Đề xuất FE fix** (song song với BE fix):
- Khi API trả 4xx/5xx, hiển thị toast đỏ rõ ràng (`Lưu thất bại: <BE error>`) thay vì fallback ngầm.
- Fallback localStorage chỉ dùng cho **network error** (offline), không dùng cho validation/permission error từ BE.

## 4. Steps để verify sau khi BE fix

```bash
# 1. Login UI với tài khoản có role mod/admin
node tests/login-save.mjs   # TEST_USER=0898348348 TEST_PASS=...

# 2. Chạy probe — phải pass hết
node tests/probe-events-api.mjs      # kỳ vọng: tất cả 200/201
node tests/probe-events-paths.mjs    # kỳ vọng: path đúng trả 200
node tests/test-events-create-from-mock.mjs  # kỳ vọng: 3/3 event vào DB

# 3. Verify qua list
curl 'https://biz.reborn.vn/market/events/list?page=1&limit=20' \
  -H 'Authorization: Bearer ...' -H 'Hostname: hub.reborn.vn'
# → 200 với items array chứa 3 event vừa tạo
```
