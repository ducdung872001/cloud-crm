---
from: reborn-hub (FE community-hub)
to: cloud-market-master (microservice /market/* — biz.reborn.vn)
created: 2026-05-05T06:44:00Z
slug: events-be-tester-bugs
status: open
gh_issue: https://github.com/ducdung872001/cloud-market-master/issues/7
context_doc: https://docs.google.com/document/d/1PqsbitYSIp_MrdjTe8TpGXYzy8Wd6AFxFxYTyEhJF74/edit
test_event: https://hub.reborn.vn/crm/events/m-khp-v-squat-a9s
test_account: 0898348348 / Reborn@12345 (W-House Admin, bsnId 336)
---

# 3 vấn đề BE cần xử lý sau khi tester (W-House) report — bộ phụ kiện events

## Bối cảnh (Why)

Tester W-House gửi 5 bug cho phân hệ Sự kiện trên hub.reborn.vn. FE đã fix
4/5 bug ở branch `community-hub` (commit chưa tạo, code đã edit trong repo
`reborn-hub`). Còn 3 vấn đề thuộc backend bắt buộc cần BE xử lý trước khi
deploy được sạch:

1. **Convert registration → hội viên trả 500** (chặn workflow tester).
2. **Timezone không nhất quán** trên các trường datetime của event.
3. **`dynamicFields` JSON cần serialize 2 prop mới** (`price`, `optionPrices`)
   — nếu BE đang strict-parse thì sẽ mất data; cần xác nhận hành vi.

## Yêu cầu cụ thể (What)

### 1. POST `/market/events/registrations/convert?id=<regId>` đang trả 500

**Repro (ngày 2026-05-05, đã test trực tiếp):**

```bash
curl -X POST 'https://biz.reborn.vn/market/events/registrations/convert?id=31' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMjY1...' \
  -H 'Selectedrole: 431_709' \
  -H 'Content-Type: application/json' \
  -H 'Content-Length: 0'
# → {"message":"Lỗi hệ thống","code":500}
```

- Token: user `0898348348` (W-House Admin, role `mod`, bsnId 336, sub 2265).
- Registration id 31 thuộc event slug `m-khp-v-squat-a9s` (event id 21).
- Lỗi không log message gì hữu ích cho FE; chỉ generic “Lỗi hệ thống”.

**Cần BE:**
- Đào log application/server tại endpoint `convertRegistrationToCustomer` (hoặc
  service tương tự) ở thời điểm 2026-05-04 → 2026-05-05.
- Trả lỗi cụ thể (message + code phù hợp) thay vì 500 chung chung — FE đã
  chuyển sang hiển thị message từ `res.message` trong toast cho admin.
- Done = call lại với cùng request payload trả 200 (hoặc trả 400/409 với
  message rõ ràng nếu reg đã convert / data thiếu).

### 2. Timezone — events trả ISO datetime không nhất quán

**Hiện trạng từ API (event id 21, slug `m-khp-v-squat-a9s`):**

```json
{
  "startDate":            "2026-05-08T18:00:00Z",
  "endDate":              "2026-05-10T01:00:00Z",
  "registrationOpenDate": "2026-04-19T10:00:00Z",
  "registrationCloseDate":"2026-05-07T10:00:00Z",
  "publishedAt":          "2026-04-22T15:20:00Z",
  "createdAt":            "2026-04-22T14:28:33Z",
  "updatedAt":            "2026-05-01T09:02:48Z"
}
```

Tester nhập trên form (ảnh kèm trong context_doc):
- Bắt đầu: 09/05/2026 09:00 (giờ VN, GMT+7) → expected UTC: `2026-05-09T02:00:00Z`
- Kết thúc: 10/05/2026 15:00 → expected UTC: `2026-05-10T08:00:00Z`

Nhưng BE đang lưu start = `2026-05-08T18:00:00Z` (lệch -8h so với expect),
end = `2026-05-10T01:00:00Z` (lệch -7h). Lệch không đều giữa 2 trường →
nghi BE đang strip `Z` rồi áp dụng shift (treating incoming UTC như GMT+7
local rồi convert “ngược” sang UTC), kết hợp với việc một số trường đi qua
path khác.

**Cần BE:**
- Audit toàn bộ converter datetime (Jackson `ObjectMapper`, JPA
  `@DateTimeFormat`, MyBatis `TypeHandler`...) cho entity Event và
  Registration để confirm: incoming ISO with `Z` được giữ nguyên là UTC,
  KHÔNG strip rồi shift.
- Nếu BE chạy ở timezone server khác UTC, cấu hình
  `spring.jackson.time-zone=UTC` (hoặc tương đương) và DB column ở
  `TIMESTAMP WITH TIME ZONE` / luôn lưu UTC.
- Done = tạo event mới với `startDate` request body =
  `2026-06-01T02:00:00.000Z`, gọi `GET` lại → trả về đúng
  `2026-06-01T02:00:00Z` (hoặc `+00:00`), không lệch.

**FE-side đã làm:** từ ngày 2026-05-05 FE gửi datetime với explicit offset
`+07:00` (VD `2026-05-09T09:00:00+07:00` thay vì `Z`) và display luôn
quy chiếu Asia/Ho_Chi_Minh qua `Intl.DateTimeFormat`. Nếu BE preserve được
offset hoặc convert đúng sang UTC khi lưu thì display sẽ đúng cho event mới
tạo. Event id 21 (test) sẽ vẫn lệch — admin cần edit lại sau khi BE fix.

### 3. `dynamicFields` JSON — cần serialize prop mới

FE vừa thêm 2 thuộc tính cho `DynamicFieldDefinition`:

```ts
{
  id: string,
  label: string,
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "date" | "email" | "phone",
  required: boolean,
  options?: string[],
  order: number,
  // ── MỚI ──
  price?: number,                          // áp cho type="checkbox" — tick = +price
  optionPrices?: Record<string, number>    // áp cho type="select" — map option → price
}
```

Đây là JSON nested lưu vào column `dynamic_fields` (BE đang trả thẳng JSON
string trong response). Mục đích: cho admin định nghĩa các option có giá
(VD “Đồng phục 100k”, “Squat ngày 10/05/2026 (400k)”) và tổng tiền đăng ký
sẽ tự động cộng/trừ khi khách tick. FE đã update `total_amount` tính kèm
giá này; BE cần đảm bảo:

**Cần BE:**
- Field `dynamicFields` đã được lưu/đọc dạng JSON blob (không strict schema).
  Confirm là `price` và `optionPrices` được persist round-trip đúng
  (POST `/market/events/create` rồi `GET /market/events/public?slug=...`
  thấy trả về đầy đủ).
- Nếu có Jackson view filter / DTO chỉ nhận field whitelist → bổ sung 2
  field mới.
- Done = tạo event với `dynamicFields` chứa `price`/`optionPrices`, GET lại
  event, kiểm tra response giữ nguyên (FE sẽ tự test bằng tester sau khi
  BE confirm).

## File FE liên quan để BE tham chiếu (read-only)

- `reborn-hub/src/configs/urls.ts:2523` — `convertToMember` URL.
- `reborn-hub/src/services/EventService.ts:72-74` — call convert.
- `reborn-hub/src/pages/CommunityHub/Events/storage.ts:568-587` — async
  wrapper, hiện đang surface `res.message` lên UI.
- `reborn-hub/src/pages/CommunityHub/Events/EventDetailPage.tsx:656-679`
  — UI handler convert (đã hiển thị error chi tiết).
- `reborn-hub/src/pages/CommunityHub/Events/datetime.ts` — helper FE format
  Asia/Ho_Chi_Minh (mới tạo).
- `reborn-hub/src/pages/CommunityHub/Events/types.ts:58-71` — interface
  `DynamicFieldDefinition` (đã thêm `price`, `optionPrices`).

## Tiêu chí done (BE self-verify)

- [ ] `POST /market/events/registrations/convert?id=31` với token tester
      W-House trả 200 (hoặc 4xx với message rõ ràng) — không 500.
- [ ] Tạo event mới với `startDate=2026-06-01T02:00:00Z`, GET lại đúng
      `2026-06-01T02:00:00Z`. Test thêm với offset
      `2026-06-01T09:00:00+07:00`, GET trả về cùng instant.
- [ ] Round-trip `dynamicFields` chứa `price`/`optionPrices` giữ
      nguyên giá trị.
- [ ] Reply về kênh tương ứng (Slack / GitHub issue trên repo BE) khi xong.

---

_FE đã merge changes vào branch `community-hub` (chưa push tại thời điểm
viết handoff này). FE sẽ deploy lên `hub.reborn.vn` theo gate workflow
"build" sau khi BE confirm._
