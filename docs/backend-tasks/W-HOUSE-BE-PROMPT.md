# Prompt cho BE — Fix 3 nhóm lỗi chặn W-House (hub.reborn.vn)

**Ngày phát hiện**: 2026-04-22
**Tenant**: W-House (`hub.reborn.vn`, tenantId=336)
**User test**: `0898348348` (W-House Admin, roles=`["mod"]`)
**Môi trường**: `https://biz.reborn.vn` (prod BE)

Tester báo 5 lỗi ở hub.reborn.vn. Sau khi FE rà chi tiết bằng Playwright + curl probe, xác định **3 lỗi gốc nằm ở BE** (2 lỗi còn lại đã fix ở FE). Mỗi lỗi kèm `curl` để reproduce, response hiện tại, và kỳ vọng.

---

## 🔴 Lỗi #1 — Module **Sự kiện** (`/market/events/*`) hoàn toàn không dùng được

### 1a. `POST /market/events/create` — 400 "Input wrong" với MỌI payload

Đã thử 3 format × 9 path biến thể — đều 400 hoặc 404. Xem chi tiết: `docs/backend-tasks/market/BACKEND-TASK-events-create-400-and-list-403.md`.

**Reproduce**:
```bash
curl -X POST 'https://biz.reborn.vn/market/events/create' \
  -H 'Authorization: Bearer <token user 0898348348>' \
  -H 'Hostname: hub.reborn.vn' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Probe","description":"x","start_date":"2026-05-01T10:00:00Z","end_date":"2026-05-01T12:00:00Z","registration_open_date":"2026-04-22T00:00:00Z","registration_close_date":"2026-05-01T00:00:00Z","venue_is_online":true,"venue_online_url":"https://zoom.us/1","contact_name":"X","contact_phone":"0912345678","status":"draft"}'
```
**Response hiện tại**: `400 {"error":"Input wrong"}` — generic, không rõ field nào sai.

**Cần làm**:
- Bật chi tiết validation error (field + rule). VD: `{"error":"Validation failed","details":{"start_date":"required","venue_online_url":"must be URL"}}`.
- Xác nhận endpoint/path chính xác. Spec `docs/events/backend-spec.md` viết `POST /marketing/events` (trả 404), FE gọi `POST /market/events/create`. Chọn 1 format và document.
- Xác nhận schema field: BE table `marketing_events` dùng snake_case; FE gửi camelCase có nested `venue: {...}`, `contactPerson: {...}`. BE nên accept cả 2 HOẶC FE phải serialize flatten trước POST — đồng bộ lại với team FE.

### 1b. `GET /market/events/list` — 403 với Path permission SAI

**Reproduce**:
```bash
curl 'https://biz.reborn.vn/market/events/list?page=1&limit=20' \
  -H 'Authorization: Bearer <token>' \
  -H 'Hostname: hub.reborn.vn'
```
**Response hiện tại**: `403 {"error":"Bạn không có quyền thực hiện thao tác này! Path: /promotion/, Action: VIEW"}`

Path `/promotion/` ở message → permission middleware đang map route `/market/events/*` vào group permission `/promotion/`. Rõ ràng sai — events không phải promotion. Middleware fallback khi không có policy cụ thể cho route events.

**Cần làm**:
- Đăng ký permission group mới cho events, đề xuất `/events/` hoặc `/market/events/`.
- Thêm action chuẩn: `VIEW`, `ADD`, `EDIT`, `DELETE`, `PUBLISH`.
- Cấp các action này cho role `mod`, `admin`, `owner` của mọi tenant có dùng community-hub.

---

## 🔴 Lỗi #2 — `POST /customer/customer/update` (tạo/update khách hàng) — 500 "/key/key.pub"

Đây là endpoint được dùng trong **Thêm nhanh thành viên** (bug tester #5) và các luồng update customer khác.

**Reproduce**:
```bash
curl -X POST 'https://biz.reborn.vn/customer/customer/update' \
  -H 'Authorization: Bearer <token>' \
  -H 'Hostname: hub.reborn.vn' \
  -H 'Content-Type: application/json' \
  -d '{"name":"TEST","phone":"0912000001","gender":"1","custType":0,"branchId":330,"avatar":"","firstCall":"","height":"","weight":"","trademark":"","taxCode":"","careerId":0}'
```
**Response hiện tại**: `500 {"error":"/key/key.pub"}`

Thông điệp `/key/key.pub` → có vẻ BE đang cố đọc public key file `/key/key.pub` cho JWT verify (hoặc crypto operation nào đó) nhưng file không tồn tại / không có permission. **Infra/config issue, không phải bug payload.**

**Cần làm**:
- Check container/pod `customer-service` có mount file `/key/key.pub` không.
- Check Deployment env / ConfigMap / Secret chứa public key đã deploy đúng chưa.
- Endpoint này là core — bất kỳ save customer nào cũng fail ⇒ rất khả năng module customer đang hỏng toàn cục cho tenant này.

---

## 🔴 Lỗi #3 — `GET /customer/employee/list` — 500 "param binder doesn't support this type of value"

Module "Cài đặt > Tổ chức & Phân quyền > Danh sách nhân viên" không hiển thị được nhân viên.

**Reproduce** (đã thử 5 biến thể param — đều 500 như nhau):
```bash
curl 'https://biz.reborn.vn/customer/employee/list?page=1&limit=10' \
  -H 'Authorization: Bearer <token>' -H 'Hostname: hub.reborn.vn'

curl 'https://biz.reborn.vn/customer/employee/list?page=1&limit=10&branchId=336' \
  -H 'Authorization: Bearer <token>' -H 'Hostname: hub.reborn.vn'
```
**Response hiện tại**:
```json
500 {"error":"param binder doesn't support this type of value, please add the additional implementation"}
```

Lỗi framework-level (binding layer). Khả năng: handler signature kê một param có type mà binder chưa register (VD `Option<Int>`, `BigInt`, custom enum…).

**Cần làm**:
- Stack trace handler `/customer/employee/list` — xác định field type gây crash.
- Bổ sung implementation cho param binder tương ứng, hoặc đổi signature về type cơ bản (string/int/bool).
- Thêm unit test tối thiểu: gọi endpoint với param trống + param đầy đủ, phải 200.

---

## ✅ Không liên quan BE (FE đã fix, ghi chú để BE biết)

- **Bug tester #3 (Đơn vị sản phẩm loading mãi)** — FE bug: `isMounted` guard skip initial fetch. Đã fix `src/pages/SettingSell/partials/ProductUnit/ProductUnitList.tsx`. BE `/customer/unit/list` hoạt động bình thường (200).
- **Bug tester #4 (Danh mục sản phẩm chọn ra null)** — FE bug: option `value` bị undefined khi API trả field tên khác. Đã fix `src/pages/SettingSell/partials/Product/partials/AddProductPage.tsx`. BE `/inventory/category/list` trả 200 (nhưng tenant 336 hiện có 0 items — tester thấy data có thể do account khác / tenant khác, cần tester confirm).
- **FE silent fallback Events** — FE bug: `storage.ts` âm thầm ghi localStorage khi BE lỗi, user tưởng đã lưu DB. Đã fix — giờ hiện toast "Lưu thất bại: <BE error>".
- **Date format MM/DD/YYYY trên form Events** — FE bug: `<input type="datetime-local">` render theo locale OS. Đã thay bằng `DatePickerCustom` force `dd/MM/yyyy`.

---

## 🧪 Cách verify sau khi BE fix

FE có sẵn 3 test script:
```bash
# Từ repo cloud-crm, branch community-hub
node tests/probe-be-deep.mjs              # Đầy đủ 3 lỗi BE trên — kỳ vọng hết 500/403
node tests/test-events-create-from-mock.mjs # Tạo 3 event từ MOCK — kỳ vọng 3 event vào DB
node tests/verify-all-fixes.mjs           # Smoke tổng quan
```

Login token reuse trong `tests/.auth-state.json`. Nếu hết hạn: `TEST_USER=0898348348 TEST_PASS='Reborn@12345' node tests/login-save.mjs`.

## 📎 Token mẫu để debug (exp 2026-XX-XX)

Payload JWT: `{"id":2265,"username":"0898348348","name":"W-House Admin","roles":["mod"],"mapBeautySalon":{"hub.reborn.vn":336},"subdomain":"hub.reborn.vn"}`.
