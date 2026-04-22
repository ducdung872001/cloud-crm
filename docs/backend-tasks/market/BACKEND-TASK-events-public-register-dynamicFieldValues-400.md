# BACKEND TASK — Events: `/public/register` trả 400 khi payload có `dynamicFieldValues`

**Discovered:** 2026-04-22 — Tester W-House + re-test bởi FE team 2026-04-22
**Severity:** 🔴 CRITICAL — mọi sự kiện có `dynamicFields` đều không đăng ký được
**Module:** `cloud-market-master`
**Endpoint:** `POST /market/events/public/register?slug={slug}`
**Host ảnh hưởng:** `hub.reborn.vn` (prod live)

---

## Repro tối giản (2026-04-22, đã verify)

```bash
# ✅ Cùng event, KHÔNG có dynamicFieldValues → 200 OK
curl -X POST 'https://biz.reborn.vn/market/events/public/register?slug=m-khp-v-squat-a9s' \
  -H 'Hostname: hub.reborn.vn' -H 'Content-Type: application/json' \
  --data-raw '{"fullName":"X","phone":"0000","source":"public_portal"}'
# → 200 {code:0, result:{id, ...}}

# ❌ Cùng event, CÓ dynamicFieldValues (key hợp lệ, giá trị hợp lệ) → 400
curl -X POST 'https://biz.reborn.vn/market/events/public/register?slug=m-khp-v-squat-a9s' \
  -H 'Hostname: hub.reborn.vn' -H 'Content-Type: application/json' \
  --data-raw '{"fullName":"X","phone":"0000","source":"public_portal","dynamicFieldValues":{"df-1776868195054-xvu":"Nguyen A"}}'
# → 400 {"error":"Input wrong"}
```

→ BE reject ngay khi **có mặt** key `dynamicFieldValues` trong payload — không phụ thuộc nội dung, không phụ thuộc event. Đây là **validation/deserialization bug ở DTO**.

---

## Payload gốc của tester (để tham chiếu)

### Event `cm-hoa-4y8` — checkbox field
```json
{
  "fullName": "Trần Thị Bảo Ngọc",
  "phone": "0387129809",
  "email": "baongoctran1411@gmail.com",
  "company": "test",
  "note": "Không có",
  "source": "public_portal",
  "dynamicFieldValues": { "df-1776871791355-fz8": "true" }
}
```
→ 400 `{"error":"Input wrong"}`

---

## Giả thuyết nguyên nhân

1. **DTO ignore field**: `EventRegistrationDTO` không khai `dynamicFieldValues` → Jackson/strict-mode reject unknown field → 400.
2. **Type mismatch**: DTO khai `Map<String, Object>` nhưng annotation `@JsonInclude` hoặc constraint `@Valid` fail với giá trị string.
3. **Strict validation** vẫn còn: giá trị `"true"` (string) cho checkbox bị coi là invalid boolean → reject.
4. **Legacy field name**: BE expect key `dynamic_field_values` (snake_case) nhưng FE gửi camelCase `dynamicFieldValues` → field không map → nếu `FAIL_ON_UNKNOWN_PROPERTIES=true` thì 400.

---

## Việc cần làm

1. **Log full request body + validation trace** cho endpoint `/market/events/public/register` → xác định root cause chính xác (1 trong 4 giả thuyết).
2. **DTO đúng spec FE**:
   ```java
   public class EventRegistrationDTO {
     // ... các field chính
     @JsonProperty("dynamicFieldValues")
     private Map<String, String> dynamicFieldValues; // KHÔNG @Valid, NULLABLE
   }
   ```
   - Jackson config: `FAIL_ON_UNKNOWN_PROPERTIES = false`
   - Value luôn là **String**, BE tự convert theo `field.type`:
     - `checkbox`: `"true"` | `"false"` → boolean
     - `number`: parse integer/decimal, reject nếu NaN
     - `date`: ISO string `YYYY-MM-DD`
     - `select`: phải thuộc `field.options[]`
     - `email`/`phone`: regex
3. **Cho phép "unknown field id"** (key không có trong `event.dynamicFields`) — chỉ log warn, không reject. Tránh race khi admin edit event đổi field id.
4. **Return 400 đúng contract** (FE đã sẵn parse):
   ```json
   {
     "code": -2,
     "message": "Thiếu thông tin bắt buộc",
     "errors": [
       { "field": "df-abc", "message": "Trường này là bắt buộc" }
     ]
   }
   ```
   Trường `error: "Input wrong"` hiện tại **không đủ thông tin** cho user — cần message tiếng Việt + chỉ rõ field nào sai.

---

## FE đã fix phần liên quan (sẵn merge)

[src/pages/CommunityHub/Events/storage.ts](../../../src/pages/CommunityHub/Events/storage.ts) — `registerForEventAsync`:

1. **Không silent-fallback localStorage** khi BE trả error → user thấy message thật thay vì nghĩ đã đăng ký thành công.
2. **Clean `dynamicFieldValues`**: lọc key rỗng/null/undefined, không gửi object rỗng.
3. **Parse error body**: hỗ trợ `res.error | res.message | res.errorMessage` từ BE — sẵn sàng đọc contract chuẩn.
4. **Network vs HTTP error phân biệt**: chỉ fallback localStorage khi `apiAvailable === false`.

[src/pages/CommunityHub/Events/components/DynamicFieldsRenderer.tsx](../../../src/pages/CommunityHub/Events/components/DynamicFieldsRenderer.tsx) + [DynamicFieldsBuilder.tsx](../../../src/pages/CommunityHub/Events/components/DynamicFieldsBuilder.tsx) + [EventFormPage.tsx](../../../src/pages/CommunityHub/Events/EventFormPage.tsx):

5. **Chặn lưu event** nếu có `select` field thiếu `options[]` — tránh data bẩn chảy xuống BE.
6. **Renderer hiện warning đỏ** khi select không có options (UX cho user).

---

## Acceptance test cho BE

| TC | Request | Expected |
|---|---|---|
| TC-01 | Slug tồn tại, payload hợp lệ **có `dynamicFieldValues`** | 200, `{code:0, result: {id, ticketCode, ...}}` |
| TC-02 | Slug không tồn tại | 404 `{code:-3, message:"Sự kiện không tồn tại"}` |
| TC-03 | Event `ended`/`cancelled` | 400 `{code:-4, message:"Sự kiện đã kết thúc"}` |
| TC-04 | Phone đã đăng ký cho event này | 409 `{code:-5, message:"SĐT này đã đăng ký"}` |
| TC-05 | Missing required dynamicField | 400 `{code:-2, errors:[{field,message}]}` |
| TC-06 | Event full `maxAttendees` | 400 `{code:-6, message:"Sự kiện đã đủ số người đăng ký"}` |
| TC-07 | Phone invalid format | 400 `{code:-7, field:"phone", message:"SĐT không hợp lệ"}` |
| TC-08 | **Payload có `dynamicFieldValues` với 1 field text + 1 field checkbox** | 200 (TC chính — repro nguyên bug) |

**Priority**: Fix trong vòng 24h. Sau fix, báo FE re-test bằng curl repro ở trên.
