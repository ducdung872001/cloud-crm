# BACKEND TASK — Events: `PATCH/PUT registrations/update` không lưu `status`

**Discovered:** 2026-04-23 — Tester W-House
**Severity:** 🔴 CRITICAL — admin không chuyển được trạng thái đăng ký → không duyệt / huỷ được đơn.
**Module:** `cloud-market-master`
**Endpoint:** `POST https://biz.reborn.vn/market/events/registrations/update?id={id}`
**Host ảnh hưởng:** `hub.reborn.vn`

---

## Repro tối giản (do tester gửi)

```bash
curl 'https://biz.reborn.vn/market/events/registrations/update?id=30' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {admin_token}' \
  -H 'Content-Type: application/json' \
  -H 'Hostname: hub.reborn.vn' \
  -H 'Origin: https://hub.reborn.vn' \
  -H 'Selectedrole: 431_41113' \
  --data-raw '{"status":"confirmed"}'
```

**Kết quả quan sát:** request trả 200 (không báo lỗi) nhưng khi GET lại record `id=30` thì `status` vẫn là giá trị cũ (`pending`). Admin phải F5 và status vẫn không đổi → UI của FE chọn status mới, submit, rồi refresh thấy vẫn như cũ.

---

## Giả thuyết nguyên nhân (để BE verify)

1. **DTO update thiếu field `status`** — Controller/Service chỉ whitelist một số field để update (full name, phone, note…), `status` không nằm trong danh sách → silent ignore.
2. **Partial update dùng entity save thay vì update column** — BE load lại entity từ DB rồi save lại mà không merge field `status` từ payload (`@JsonIgnoreProperties` hoặc field bị set lại về giá trị default từ DB).
3. **Enum validation fail im lặng** — Nếu `status` là enum và giá trị `"confirmed"` không map được, BE có thể catch exception và bỏ qua field thay vì 400.
4. **Role / permission guard** — Endpoint chấp nhận request nhưng middleware authorization chặn write op với role `mod` (`431_41113` là Ban giám đốc → mod role) → response 200 nhưng side-effect bị rollback.
5. **DB column `status` có CHECK constraint / ENUM** không bao gồm `"confirmed"` → update fail, service nuốt exception.

---

## Việc cần làm

1. **Log full request body + câu SQL update** cho endpoint `registrations/update` → xác nhận `status` có được gửi vào câu UPDATE không.
2. **Kiểm tra DTO / Controller**: đảm bảo field `status` được expose trong `UpdateRegistrationRequest` (hoặc tên tương đương) và được map xuống DB column.
3. **Kiểm tra service**: nếu dùng pattern "load → set → save", đảm bảo `entity.setStatus(req.getStatus())` được gọi; nếu dùng `UPDATE ... SET` trực tiếp, đảm bảo câu SQL có `status = ?`.
4. **Trả về record sau update** trong response để FE verify ngay. Hiện `FE` không có cách biết BE thực sự update hay không ngoài việc refetch.
5. **Response code rõ ràng** nếu `status` value không hợp lệ — trả 400 với message thay vì 200 silent-ignore.

---

## Các giá trị `status` hợp lệ (FE gửi)

Xem [src/pages/CommunityHub/Events/types.ts](../../../src/pages/CommunityHub/Events/types.ts) — enum `RegistrationStatus`:

- `pending` — chờ duyệt
- `confirmed` — đã xác nhận
- `checked_in` — đã check-in
- `cancelled` — huỷ
- `no_show` — không đến
- `waitlist` — trong danh sách chờ

BE phải chấp nhận **cả 6 giá trị trên** khi update.

---

## Test verify sau fix

```bash
# 1. Update status → confirmed
curl -X POST 'https://biz.reborn.vn/market/events/registrations/update?id=30' \
  -H 'Authorization: Bearer {admin_token}' \
  -H 'Content-Type: application/json' \
  -H 'Hostname: hub.reborn.vn' -H 'Selectedrole: 431_41113' \
  --data-raw '{"status":"confirmed"}'
# Expected: 200 {code:0, result:{id:30, status:"confirmed", ...}}

# 2. GET registration lại → status phải là confirmed
curl 'https://biz.reborn.vn/market/events/registrations/{id}?id=30' \
  -H 'Authorization: Bearer {admin_token}' -H 'Hostname: hub.reborn.vn' -H 'Selectedrole: 431_41113'
# Expected: result.status = "confirmed"

# 3. Update status → cancelled + các field khác → cả 2 phải được lưu
curl -X POST 'https://biz.reborn.vn/market/events/registrations/update?id=30' \
  -H 'Authorization: Bearer {admin_token}' -H 'Content-Type: application/json' \
  -H 'Hostname: hub.reborn.vn' -H 'Selectedrole: 431_41113' \
  --data-raw '{"status":"cancelled","note":"Khách huỷ do bận"}'
# GET lại → status=cancelled AND note="Khách huỷ do bận"
```

---

## Liên quan FE

Code FE gọi endpoint này: [src/pages/CommunityHub/Events/EventDetailPage.tsx](../../../src/pages/CommunityHub/Events/EventDetailPage.tsx) (dropdown chọn status trong bảng registrations) → gọi qua `eventStorage.updateRegistrationAsync` trong [src/pages/CommunityHub/Events/storage.ts](../../../src/pages/CommunityHub/Events/storage.ts).

FE **không cần sửa gì** — payload gửi đúng `{"status":"confirmed"}`. Bug 100% ở BE.
