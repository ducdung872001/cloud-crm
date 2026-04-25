# BACKEND TASK — Events: 3 việc còn lại từ tester report 2026-04-24

**Discovered:** 2026-04-24 — Tester W-House (Google Doc "W-House phần sự kiện").
**Severity:** 🟡 Medium — FE đã tự fallback đủ để hiển thị, nhưng BE cần fix để dữ liệu lưu đúng & ticket auto-issue chuẩn.
**Module:** `cloud-market-master`
**Host ảnh hưởng:** `hub.reborn.vn`
**Liên quan FE branch:** `community-hub` — đã merge fix client-side (timezone, QR upload, total fallback, stats source).

---

## Bối cảnh

Tester báo 4 mục, FE đã giải quyết được 1 mục hoàn toàn (timezone — chỉ cần FE-side defensive parse) và 3 mục còn lại cần BE phối hợp:

1. **`totalAmount` không lưu / không trả về** trên `event_registration`.
2. **`selectedAddOns` có thể đang bị drop** ở lớp deserialize (cùng pattern Jackson đã gặp với `paymentProof`).
3. **`ticketCode` không auto-issue** khi admin chuyển `status = confirmed`.

Ngoài ra, FE thêm field mới `bankAccountOverride.qrImageUrl` (string URL ảnh QR upload thủ công cho tenant chưa dùng VietQR) — BE cần persist field này trong JSON `bank_account_override`.

---

## Việc 1 — Persist & return `totalAmount`

### Triệu chứng
FE gửi `POST /market/events/public/register` với `totalAmount: <số>` (đã tính = `ticketPrice + Σ(addOn.unitPrice × qty)`). Khi admin GET danh sách registrations → trường `totalAmount` về `null` hoặc `0`.

### Cần làm
1. Verify DTO `EventRegistrationCreateRequest` (hoặc tương đương) có khai field `totalAmount` (Long / Integer / BigDecimal). Nếu không → Jackson silent drop.
2. Verify entity `EventRegistration` có cột `total_amount` mapping đúng.
3. Verify response serializer (admin list + admin get + public detail nếu có) emit lại field `totalAmount` (camelCase).
4. Nếu Jackson dùng `@JsonIgnore` trên getter → fix bằng `@JsonSetter("totalAmount")` explicit trên setter (đúng pattern đã gặp ở `paymentProof`).

### Acceptance test
```bash
# Đăng ký public
curl -X POST 'https://biz.reborn.vn/market/events/public/register?slug=evt-xxx' \
  -H 'Hostname: hub.reborn.vn' -H 'Content-Type: application/json' \
  --data-raw '{"fullName":"Test","phone":"0900","totalAmount":250000,"selectedAddOns":[{"addOnId":"ad-1","qty":2}]}'
# → 200, result.totalAmount = 250000

# Admin list
curl 'https://biz.reborn.vn/market/events/registrations?eventId=...' \
  -H 'Authorization: Bearer ...' -H 'Hostname: hub.reborn.vn'
# → mỗi item có totalAmount = 250000
```

---

## Việc 2 — Persist & return `selectedAddOns`

### Triệu chứng
FE gửi `selectedAddOns: [{ addOnId, qty }]` khi đăng ký. Admin xem chi tiết → mảng rỗng / null. Hậu quả: cột "Add-on" hiển thị "—", panel thống kê dịch vụ/sản phẩm trên tab "Người đăng ký" không có data để aggregate.

### Cần làm
1. DTO `EventRegistrationCreateRequest` phải khai `selectedAddOns: List<SelectedAddOn>` hoặc `String` (JSON) tuỳ schema.
2. Entity column `selected_add_ons` (TEXT / JSON) lưu JSON string.
3. Serializer trả lại `selectedAddOns` dưới dạng JSON string hoặc array (FE đã handle cả 2 cases trong `normalizeReg`).
4. Cùng kỹ thuật `@JsonSetter` nếu Jackson đang ngáng.

### Acceptance test
```bash
# Same payload trên — sau khi tạo, GET lại
curl 'https://biz.reborn.vn/market/events/registrations?eventId=...'
# → mỗi item có selectedAddOns = [{ "addOnId": "ad-1", "qty": 2 }] (hoặc JSON string parse được)
```

---

## Việc 3 — Auto-issue `ticketCode` khi `status = confirmed`

### Triệu chứng
Admin chuyển registration sang `confirmed` qua `POST /market/events/registrations/update?id=...` body `{"status":"confirmed"}` → BE update status nhưng `ticketCode` vẫn null. FE không tự sinh code (sợ lệch giữa BE/DB/public ticket-check).

### Cần làm
Trong handler `updateRegistration`:
- Nếu `status` chuyển từ `pending → confirmed` (hoặc bất kỳ trạng thái → confirmed) **và** `ticketCode` đang null → sinh code mới và lưu.
- Format đề xuất: `${eventSlug.slice(0,8).toUpperCase()}-${random6char}` (giống FE fallback localStorage), hoặc UUID short — miễn unique trong scope event.
- Response sau update phải trả luôn `ticketCode` mới sinh.
- Đồng thời lưu `confirmedAt = now()` nếu chưa có.

### Acceptance test
```bash
curl -X POST 'https://biz.reborn.vn/market/events/registrations/update?id=30' \
  -H 'Authorization: Bearer ...' -H 'Content-Type: application/json' \
  -H 'Hostname: hub.reborn.vn' \
  --data-raw '{"status":"confirmed"}'
# → 200, result.ticketCode = "EVT-XXX-ABC123" (non-null), result.confirmedAt = ISO timestamp
```

---

## Việc 4 — Lưu thêm `qrImageUrl` trong `bankAccountOverride`

### Bối cảnh
FE vừa thêm tính năng cho admin upload ảnh QR ngân hàng thủ công (cho tenant chưa dùng VietQR auto-gen). FE gửi:

```json
{
  "bankAccountOverride": {
    "bank": "VCB",
    "holder": "NGUYEN VAN A",
    "accountNumber": "0123456789",
    "phone": "0987654321",
    "qrImageUrl": "https://reborn.vn/uploads/abc123.png"
  }
}
```

### Cần làm
- Field `bank_account_override` đang lưu dạng JSON (text) trên entity `Event` → chỉ cần đảm bảo BE không filter / drop unknown key khi serialize/deserialize.
- Nếu DTO `EventBankAccount` dạng strong-typed → thêm field `qrImageUrl: String` (optional, nullable).
- Public endpoint `GET /market/events/public?slug=...` cũng phải trả `bankAccountOverride.qrImageUrl` để public payment screen hiển thị đúng QR.

### Acceptance test
```bash
curl -X POST 'https://biz.reborn.vn/market/events/update?id=...' \
  -H 'Authorization: ...' -H 'Hostname: hub.reborn.vn' \
  --data-raw '{"bankAccountOverride":{"bank":"VCB","holder":"X","accountNumber":"123","qrImageUrl":"https://reborn.vn/uploads/abc.png"}}'
# → 200

curl 'https://biz.reborn.vn/market/events/public?slug=...' -H 'Hostname: hub.reborn.vn'
# → result.bankAccountOverride.qrImageUrl = "https://reborn.vn/uploads/abc.png"
```

---

## Notes

- **Timezone**: tester báo "Thời gian lưu vào data bị sai so với input" → FE đã tự fix client-side bằng cách append `Z` cho ISO không có TZ marker. **Khuyến nghị BE**: trả ISO UTC có `Z` rõ ràng (ví dụ `Instant.toString()`) thay vì `LocalDateTime.toString()` — tránh ambiguity. Nếu hiện đang dùng `LocalDateTime` storage, ít nhất serializer nên format ra ISO UTC.

- **Item tester #1 ("Stats chi tiết sai")** — FE đã sửa nguồn (compute từ regs + event mới fetch, không đọc localStorage). Sau khi BE fix Việc 1+2, stats expectedRevenue/collectedRevenue sẽ tự đúng. Không cần BE thay đổi gì cho mục này.

- Sau khi BE deploy 4 việc trên, FE rà soát:
  - [ ] Tạo event có add-on, đăng ký public → `totalAmount` + `selectedAddOns` lưu đúng và hiển thị trên list/modal.
  - [ ] Đổi status → confirmed → `ticketCode` auto-sinh.
  - [ ] Upload QR ảnh trên event config → public share page hiện đúng QR thay vì auto-gen.
  - [ ] Stats panel "Đã thu / Dự thu" có số đúng (không phải 0).
