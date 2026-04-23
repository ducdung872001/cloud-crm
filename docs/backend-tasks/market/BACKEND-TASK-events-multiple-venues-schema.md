# BACKEND TASK — Events: mở rộng `venue` thành danh sách nhiều địa điểm (parking/waiting/venue)

**Discovered:** 2026-04-23 — Khách hàng W-House yêu cầu qua tester.
**Severity:** 🟡 FEATURE — cần product sign-off trước khi triển khai.
**Module:** `cloud-market-master`
**Type:** Schema change + API additive
**Host ảnh hưởng:** `hub.reborn.vn`

---

## Bối cảnh yêu cầu (verbatim từ tester)

> Khách hàng mong muốn địa điểm này sẽ là một danh sách động để có thể chỉ dẫn chi tiết: **địa điểm để xe, địa điểm chờ, địa điểm tổ chức,…** Cụ thể khi bấm dấu cộng địa điểm thì sẽ được chọn thêm địa điểm khác và hiện map của địa điểm đó.

Hiện tại mỗi event có **1 `venue`** duy nhất (name, address, city, lat, lng, isOnline, onlineUrl) — không đủ cho event có nhiều khu vực (gửi xe xa hội trường, khu check-in riêng, v.v.).

---

## Đề xuất schema

Giữ `venue` hiện tại như **địa điểm chính (primary venue)** để không phá backward-compatibility. Thêm mảng `venues[]` cho các địa điểm phụ.

```typescript
// Field mới trên Event:
venues: Array<{
  id: string;                 // uuid / slug
  type: "venue" | "parking" | "waiting" | "stage" | "other";
  label: string;              // "Địa điểm để xe tòa B"
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  note?: string;              // hướng dẫn đường đi / thông tin bổ sung
  order?: number;             // thứ tự hiển thị
}>
```

### Tại sao không bỏ `venue` cũ?

- Event đã publish + data đã có trong DB vẫn dùng `venue` nested object.
- Nhiều code client (public portal, share event, email confirmation) đang đọc `event.venue.name`.
- Migration tốn thời gian hơn là giữ cả hai.

→ Rule: **primary venue** luôn đọc từ `event.venue`. Nếu `venues[]` có phần tử type=`venue` thì đó là bản đầy đủ của primary (có thể đồng bộ khi save).

---

## DB migration

- Thêm column `venues` kiểu `JSON` / `JSONB` / `TEXT` (tuỳ RDBMS) trên bảng events.
- Default `[]` cho record cũ.
- **Không** đụng tới column `venue_name` / `venue_address` / … cũ — cứ giữ cho backward.

---

## API changes

1. **`POST /market/events/create`** — accept thêm field `venues[]`. Validate: mỗi phần tử bắt buộc có `label` và `address`; `latitude`/`longitude` nếu có phải là số hợp lệ.
2. **`POST /market/events/update`** — cho phép update `venues[]` (replace toàn bộ, không merge).
3. **`GET /market/events/public`** và **`GET /market/events/public/list`** — include `venues[]` trong response.
4. **`GET /market/events/{id}`** (admin) — include `venues[]`.

### Format response

```json
{
  "code": 0,
  "result": {
    "id": 123,
    "venue": { "name": "Hội trường A", "address": "...", "latitude": 10.77, "longitude": 106.69, "isOnline": false },
    "venues": [
      { "id": "v1", "type": "venue",   "label": "Hội trường chính", "address": "...", "latitude": 10.77, "longitude": 106.69 },
      { "id": "v2", "type": "parking", "label": "Bãi đỗ xe tầng hầm B1", "address": "...", "latitude": 10.771, "longitude": 106.691, "note": "Gửi xe miễn phí 4h" },
      { "id": "v3", "type": "waiting", "label": "Khu check-in", "address": "Lobby tầng 1", "note": "Mang theo vé điện tử" }
    ]
  }
}
```

---

## Việc cần làm

1. Add column `venues` (JSON) vào bảng `events` + migration có default `[]`.
2. Update `EventDTO` / `CreateEventRequest` / `UpdateEventRequest` để accept `venues`.
3. Update serializer của các endpoint list/detail (public + admin) để trả `venues`.
4. Validate payload: `venues` có thể rỗng; nếu có phần tử, `label` và `address` bắt buộc.
5. Nếu `venues[]` chứa phần tử type=`venue`, đồng bộ nó vào `event.venue` khi save (single source of truth cho primary venue).
6. Unit test: create event có 3 venues (1 venue, 1 parking, 1 waiting) → save → list/detail trả đúng.

---

## FE scope (để khớp)

- [src/pages/CommunityHub/Events/types.ts](../../../src/pages/CommunityHub/Events/types.ts) — thêm type `EventVenueEntry` + field `venues?: EventVenueEntry[]` trong `EventEntity`.
- [src/pages/CommunityHub/Events/EventFormPage.tsx](../../../src/pages/CommunityHub/Events/EventFormPage.tsx) — thay section "4. Địa điểm tổ chức" bằng list động với nút "+ Thêm địa điểm", dropdown type, ô address, picker lat/lng, preview map (Google Maps embed).
- [src/pages/ShareEventPage/index.tsx](../../../src/pages/ShareEventPage/index.tsx) + [src/pages/PublicEvents/index.tsx](../../../src/pages/PublicEvents/index.tsx) — render các venue phụ với icon riêng (🅿️ parking, 🚪 waiting, 📍 main).

**Cần duyệt scope trước khi FE code**: đây là thay đổi lớn, liên quan UX form + public portal.
