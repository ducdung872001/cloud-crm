# BACKEND TASK — Events: xem chi tiết 1 registration + thống kê đăng ký theo service/add-on

**Discovered:** 2026-04-23 — Khách hàng W-House yêu cầu qua tester.
**Severity:** 🟡 FEATURE — cần product sign-off trước khi triển khai.
**Module:** `cloud-market-master`
**Type:** New endpoints (read-only)
**Host ảnh hưởng:** `hub.reborn.vn`

---

## Bối cảnh yêu cầu (verbatim từ tester)

> Với danh sách người đăng ký thêm chức năng xem **thông tin chi tiết** mà người dùng đã đăng ký. Kèm theo **thống kê** mỗi dịch vụ / sản phẩm đăng ký có số lượng người đăng ký là bao nhiêu.

---

## Phạm vi

### Phần 1 — Detail 1 registration

Hiện bảng registrations chỉ show cột cơ bản (fullName, phone, status, paymentProof, add-ons rút gọn). User muốn click vào 1 row → mở panel / modal hiển thị **toàn bộ** data đã submit:

- Thông tin liên hệ: fullName, phone, email, company, note
- Ticket: ticketCode, registeredAt, confirmedAt, checkedInAt
- Dynamic field values: từng field (label + value)
- Selected add-ons: từng add-on (tên, số lượng, đơn giá, thành tiền)
- Selected dates (nếu event multi-day): list ngày đã chọn
- Payment: proof image, status, reviewedAt, rejectReason
- Check-in/out history: `checkInOutRecords` timeline
- UTM source / campaign (nếu có)

Data đã có sẵn trong DB, chỉ cần một endpoint trả về đầy đủ:

```
GET /market/events/registrations/detail?id={registrationId}
→ 200 { code: 0, result: { /* full EventRegistration shape */ } }
```

→ **Nếu endpoint list hiện tại đã trả full object** thì không cần thêm endpoint, FE chỉ cần render. Kiểm tra: [src/pages/CommunityHub/Events/storage.ts](../../../src/pages/CommunityHub/Events/storage.ts) hàm `listRegistrationsByEventAsync`.

### Phần 2 — Stats đăng ký theo service / add-on

User muốn biết: trong event `X`, add-on `"Bộ kit yoga"` có bao nhiêu người đăng ký, tổng doanh thu dự kiến là bao nhiêu.

Endpoint đề xuất:

```
GET /market/events/stats?eventId={id}
→ 200 {
  code: 0,
  result: {
    totalRegistrations: 47,
    byStatus: { pending: 10, confirmed: 30, cancelled: 5, checked_in: 2 },
    byAddOn: [
      { addOnId: "ad-...", addOnName: "Bộ kit yoga",   qty: 12, revenue: 600000 },
      { addOnId: "ad-...", addOnName: "Ăn nhẹ buffet", qty: 8,  revenue: 400000 }
    ],
    byService: [   // nếu event có dynamic field kiểu "select service"
      { fieldId: "df-...", option: "Yoga cơ bản",    count: 20 },
      { fieldId: "df-...", option: "Yoga nâng cao",  count: 15 }
    ],
    byDate: [      // nếu multi-day
      { date: "2026-05-06", count: 30 },
      { date: "2026-05-10", count: 17 }
    ]
  }
}
```

### Tính toán

- `byAddOn`: unnest `selected_add_ons` JSON array, group by `addOnId`, sum `qty`, sum `qty * unitPrice`.
- `byService`: group by value của dynamic field có `type="select"` / `type="radio"`.
- `byStatus`: COUNT group by `status`.
- `byDate`: unnest `selected_dates` array, group by từng ngày.

Nếu DB hiện lưu các field này dưới dạng JSON text, cần thêm helper để parse khi aggregate — hoặc:

- **Option A** (ổn + lâu dài): tạo bảng phụ `registration_addons` (registration_id, add_on_id, qty, unit_price) để query SQL chuẩn.
- **Option B** (nhanh): aggregate in-app (load all registrations rồi tính) — OK cho event <1000 người, nhưng không scale.

Đề xuất Option B trước để release nhanh, schedule Option A cho milestone sau.

---

## Việc cần làm

1. **Check endpoint list hiện tại** — nếu đã trả full object thì chỉ cần FE build UI detail modal.
2. **Thêm endpoint `GET /market/events/stats?eventId={id}`** — trả 4 nhóm thống kê ở trên.
3. **Filter theo status** cho stats (optional): `?eventId=X&status=confirmed` để user biết số đã xác nhận.
4. **Permission**: chỉ admin của event hoặc vai trò có quyền xem events mới được gọi.
5. **Cache** nhẹ (TTL 30s) nếu query tốn (event có nhiều đăng ký).

---

## FE scope (sau khi BE xong)

- [src/pages/CommunityHub/Events/EventDetailPage.tsx](../../../src/pages/CommunityHub/Events/EventDetailPage.tsx) — thêm panel "Thống kê đăng ký" (4 card: total, by status, by add-on bar chart, by date).
- Click vào row registration → mở modal hiển thị full data.
- Export CSV thống kê.

**Cần duyệt scope** trước khi triển khai — đây là feature, không phải bug.
