# Demo MentorHub — Thứ 6 2026-05-08

**Đối tượng:** anh chủ + anh em nội bộ.
**Thời lượng:** 5–7 phút (có thể giãn ra 10 phút nếu Q&A).
**Người demo:** Dũng (chính) — backup screen của một người khác mở sẵn trang khác phòng lỗi.
**URL:** `https://mentorhub.reborn.vn/crm/mh/dashboard` (đã đăng nhập sẵn, hoặc local `http://localhost:5173/crm/mh/dashboard`).

---

## Beat 1 — Mở đầu (30 giây)

> "Như đã thống nhất hôm 6/5, MentorHub có **2 lớp giá trị**: pre-class và post-class. Hôm nay em demo nguyên vòng đầu cuối của 1 mentor — anh Khoa, dạy Microservices — vừa kết thúc buổi 3 lớp 'Service Discovery & Load Balancing'."

Action:
- Mở `/crm/mh/dashboard`.
- Trỏ vào card "BUỔI HỌC TIẾP THEO" + KPI "DOANH THU 30 NGÀY 48.2tr".

Kịch bản nói:
- "1 mentor solo — 1240 học viên đang theo, 187 giao dịch tháng này, NPS 4.92."
- "Đây là số mentor cá nhân làm được khi có hệ thống — không phải Telegram + Zoom rời rạc nữa."

---

## Beat 2 — Phần thịt trước (pre-class) (45 giây)

> "Trước buổi học, mentor cần biết hôm nay mình đang dạy ai. Em mở Calendar."

Action:
- Click "Lịch dạy" (`/mh/calendar`).
- Trỏ vào số "23/30 đã đăng ký" của buổi sắp tới.

Kịch bản nói:
- "Mỗi buổi mentor thấy được số đăng ký + capacity, lúc nào đầy lúc nào trống."
- "Phía sau (chưa demo lần này) còn pre-class digest — gom hết bài tập học viên đã nộp, câu hỏi đã đặt trước, mentor có 5 phút trước buổi đọc nhanh."

(Skip nhanh để tới phần wow ở Beat 3.)

---

## Beat 3 — Live session glance (30 giây — CHỈ LƯỚT)

Action:
- Click "Live Session" (`/mh/live-session`).
- Show qua giao diện 5 giây.

Kịch bản nói:
- "Đang dạy thì có Live Assistant — bắt câu hỏi học viên realtime, gợi ý mentor trả lời thế nào. Phần này deep dive ở demo sau."
- "Quan trọng: hệ thống record toàn bộ buổi qua Zoom, transcribe ngay sau khi kết thúc."

---

## Beat 4 — ⭐ Phần thịt sau — AI Meeting Notes (90 giây — CORE)

> "Buổi vừa kết thúc 2 tiếng trước. Đây là cái MentorHub khác hẳn các SaaS dạy học khác."

Action:
- Click "AI Meeting Notes" hoặc trực tiếp `/mh/session-review`.
- Để trang load full.

Kịch bản nói (chậm, nhấn từng phần):
1. **AI summary** (5 giây): "Tóm tắt buổi tự sinh — anh chủ đọc trong 10 giây, biết buổi vừa rồi nói gì."
2. **Key points + timestamps** (10 giây): "8 điểm chính, có timestamp click vào nghe lại đoạn đó."
3. **Q&A trích xuất** (10 giây): "3 câu hỏi quan trọng nhất + câu trả lời được lọc ra. Học viên cần tham khảo gì cứ vào đây."
4. **Action items** (5 giây): "5 task cụ thể cho học viên — đính kèm tin nhắn sau."

> "Đến đây hầu hết SaaS dạy học dừng. **MentorHub đi tiếp một bước nữa** — và đây mới là phần đáng tiền."

---

## Beat 5 — ⭐⭐ Cá nhân hoá từng học viên (120 giây — WOW MOMENT)

Action:
- Scroll xuống phần "Phân tích từng học viên — mỗi học viên một thông điệp riêng".
- Để khán giả thấy 6 card khác nhau: Nam 96, Đức 92, Hà 88, Hoàng Anh 71, Tuấn 58, Linh 32.

Kịch bản nói (CHẬM, cho khán giả "ngấm"):

> "AI đã đọc transcript và breakdown từng học viên — engagement bao nhiêu, nói bao nhiêu phút, chat bao nhiêu lần. Quan trọng nhất: tự sinh **một tin nhắn riêng cho từng người**, dựa trên buổi học hôm nay + profile của họ."

Đọc to 3 ví dụ tương phản (8 giây mỗi tin):

**(a) Anh Nam — engagement 96, người dẫn dắt:**
> "Anh Nam — buổi này anh đã chia sẻ một loạt kinh nghiệm Istio migration ở Shopee... Anh có thể gửi em link tới blog post được không? Em muốn đính kèm cho cả nhóm."

→ Comment: "Đây là tin gửi cho top contributor — **không nịnh chung chung** mà gọi đúng đoạn anh Nam đóng góp."

**(b) Anh Tuấn — engagement 58, vào trễ 22 phút:**
> "Anh Tuấn — em để ý anh vào hơi trễ buổi nay. Em đã clip lại 22 phút đầu và gửi kèm tin này — anh xem lại lúc rảnh nhé. Còn chuyện hoá đơn VAT — em đã chuyển team backoffice xử lý."

→ Comment: "**Hệ thống biết** anh Tuấn vào trễ → tự cắt clip 22 phút đầu. **Hệ thống biết** anh Tuấn có ticket VAT đang mở → kèm update vào tin. Đây là personalization thật."

**(c) Chị Linh — engagement 32, vắng 2 buổi liên tiếp, ticket Zoom link:**
> "Chị Linh — em không thấy chị buổi nay (cũng vắng buổi 2)... Em có gửi kèm recording đầy đủ buổi 2+3 + tóm tắt 5 phút đọc nhanh. Cần em call hỗ trợ trực tiếp không chị?"

→ Comment: "Đây là **win-back message** cho người sắp churn. Mentor không cần nhớ ai vắng — hệ thống nhớ thay."

> "Học viên 10 ngày sau **không nhớ kiến thức** — đó là điều anh chủ nói hôm 6/5. Họ chỉ nhớ ai gọi tên mình, ai care mình. Đây là cái MentorHub làm cho mentor — **làm hộ phần emotional touch** mà mentor không có thời gian làm."

---

## Beat 6 — Cockpit gửi cá nhân hoá (60 giây)

Action:
- Click button "💬 Mở cockpit gửi cá nhân hoá (6)".
- Modal mở ra — left: list 6 học viên với engagement score, right: editor.

Kịch bản nói:
- "Mentor không cần ngồi viết 6 tin. AI đã viết sẵn — mentor chỉ click vào từng tên, đọc, **edit nếu cần**, rồi approve."
- Click sang anh Tuấn → cho khán giả thấy textarea có thể edit. "Mentor thấy AI viết hơi sai chỗ nào — sửa, save, gửi."
- Trỏ vào checkbox "Auto-send từ buổi sau" ở cuối: "Gói Pro+ — mentor có thể bật auto-send. Hệ thống tự lo, mentor không cần review nữa."
- Trỏ vào button "📤 Lên lịch gửi 3 tin lúc 22:30": "Tin gửi qua **Zalo OA của công ty** — không phải Zalo cá nhân — vì Zalo cá nhân bị Zalo Inc chặn gửi tự động. Đây là điểm cấu hình quan trọng anh chủ đã chốt hôm trước."

---

## Beat 7 — Two-way reply + cộng đồng (45 giây)

Action:
- Đóng modal. Mở Chat (`/mh/chat`).

Kịch bản nói:
- "Học viên reply lại — tin nhắn đổ về đây, gắn đúng thread của từng người. Mentor 1 chỗ trả lời tất cả."
- "Mỗi câu reply còn được **AI gợi ý draft** trả lời — mentor bấm Approve hoặc edit."

(Optional) Chuyển sang Tickets (`/mh/tickets`):
- "Còn kênh hỗ trợ chính thức — TK-2341 anh thấy đó là ticket Zoom link của chị Linh — nó chính là lý do tin nhắn gửi cho chị Linh có nội dung khác."
- "Hệ thống **kết nối** giữa nhận xét cá nhân hoá ↔ ticket support ↔ profile học viên — không silo."

---

## Beat 8 — Đóng + roadmap (30 giây)

Action:
- Quay lại Dashboard.

Kịch bản nói:
- "Demo hôm nay là bản đầu — em xác nhận đã chạy được vòng đầu cuối: pre-class glance → live session → post-class AI breakdown → tin nhắn cá nhân hoá → reply + ticket."
- "Tuần sau là UAT (anh chủ chốt yêu cầu). Tháng 5 test nội bộ. Đầu tháng 6 thương mại hoá. Em đã có file REQUIREMENTS + GAP_AND_PLAN chi tiết, anh review để chốt phase 1."
- "Còn 1 USP em chưa demo hôm nay là **Zoom credit pool** — mentor share slot Zoom rảnh đổi credit. Cộng đồng WIT vào pool sẵn. Phase 6 sẽ làm. Em sẽ demo riêng khi xong."

---

## Backup checklist (chạy trước demo 30 phút)

1. [ ] `npm run build:dev` thành công (đã verify hôm nay 2026-05-07, build pass 4089 modules trong 20s).
2. [ ] Mở browser sạch, login MentorHub trước, navigate qua hết 4 page chính (`/dashboard`, `/calendar`, `/session-review`, `/chat`).
3. [ ] Test mở modal "Mở cockpit gửi cá nhân hoá" — đảm bảo render được, click qua các học viên không lỗi.
4. [ ] Disable notifications hệ thống (Slack, mail, ...) trên máy demo.
5. [ ] Chuẩn bị URL demo riêng tab — không Cmd+L mất giữa beat.
6. [ ] Internet check — speedtest 50Mbps+.
7. [ ] Backup video (xem `BACKUP_VIDEO_PLAN.md`).

---

## Câu hỏi có thể gặp + sẵn câu trả lời

| Q | A ngắn |
|---|---|
| Cái này khác Notion AI / Otter / Fireflies thế nào? | Họ làm summary chung. Mình làm **per-student personalization** — tin riêng từng người dựa trên transcript + profile + ticket + history. |
| Học viên có biết tin AI viết không? | Có quy trình opt-in + có dấu "✦ AI" trong tin. Mentor luôn có quyền review trước khi gửi (gói Pro+ mới có auto-send). |
| Privacy / PDPL? | Đang draft ToS (D9, deadline 2026-05-25). Recording opt-in từ Zoom dialog, retention 90 ngày, học viên có quyền yêu cầu xoá. |
| Cost AI? | Markup 2.5× cost provider (margin 60%). Free + Trial chỉ Haiku/Groq (rẻ). Sonnet/Opus từ Starter. Add-on pack 200k = 100 evaluations. |
| Khi nào commercial? | Soft launch 2026-06-01 với 5–10 mentor pilot trả tiền thật, mở rộng 2026-07-01. |
| Mentor lớn (Phạm Thành Long) có dùng không? | Có — chốt hôm 6/5: tất cả qua SaaS, không bypass / không self-host. Differentiation qua tier gói (Master / Academy). |

---

## Sau demo

1. Ghi lại tất cả câu hỏi anh chủ nêu + góp ý → update vào REQUIREMENTS_mentorhub.md mục "Decisions".
2. Nếu anh chủ duyệt — start Phase 1 (foundation cleanup, schema unify, model registry tách config) sáng Thứ 2 2026-05-11.
3. Nếu cần điều chỉnh scope — sửa GAP_AND_PLAN_mentorhub.md, gửi lại confirm.
