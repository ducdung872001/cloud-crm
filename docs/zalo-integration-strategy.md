# MentorHub × Zalo — Chiến lược tích hợp

> Tài liệu chiến lược về các điểm chạm giữa Mentor và MentorHub qua Zalo.
> Mục đích: giảm ma sát cho Mentor VN — vốn dùng Zalo hằng ngày — khi
> tiếp cận một công cụ mới.
>
> Cập nhật: 2026-04-24 · Maintainer: Phan Đức Dũng

---

## TL;DR — Đi vào Zalo, không bắt mentor ra khỏi Zalo

Mentor VN sống trong Zalo. Một công cụ mới (MentorHub) **phải xuất hiện bên trong
Zalo** ở mức tối đa, chỉ đẩy mentor qua web khi thực sự cần (tạo khoá, editor dài,
analytics sâu).

Chiến lược 3 layer từ nhẹ → nặng:

| Layer | Dùng khi nào | Công nghệ | Friction |
|---|---|---|---|
| **1. Zalo OA Push** | Nhận thông báo, không thao tác | Zalo OA Message API | Thấp nhất (chỉ đọc) |
| **2. Zalo Mini App** | Thao tác hằng ngày: xem lịch, reply, approve | Zalo Mini App SDK | Trung bình (vẫn trong Zalo) |
| **3. MentorHub Web** | Deep work: tạo khoá, AI note editor, analytics | React FE hiện tại | Cao nhất (ra khỏi Zalo) |

Mentor **MỚI** chỉ cần biết layer 1-2 → quen rất nhanh → không cảm giác "đang dùng
tool mới".

---

## 7 điểm chạm cụ thể

### ① Zalo OA Push notification — phải có từ MVP

Mỗi event quan trọng trong MentorHub → gửi tin Zalo OA tới mentor. Mentor
**không cần mở web** mà vẫn nắm thông tin.

**Điều kiện:** mentor kết bạn OA "MentorHub" một lần (thao tác trong onboarding).

**Các event cần push:**

| Trigger | Mẫu nội dung | Mức độ |
|---|---|---|
| Học viên đăng ký khoá | *"⚡ Phạm Thu Hà vừa đăng ký 'Microservices'. 23/30 HV. [Xem chi tiết]"* | Cao |
| Thanh toán học phí | *"💰 +2.400.000đ từ Trần Văn Đức. Tổng tháng: 18.2M [Xem]"* | Cao |
| 30 phút trước buổi | *"🎥 Buổi 5 Istio bắt đầu 30 phút nữa. 23 HV. [Mở Zoom]"* | Cao |
| AI note sẵn sàng | *"✦ AI note buổi 4 ready. 5 key points, 3 Q&A. [Xem]"* | Trung |
| Đánh giá 5★ | *"⭐ Trần Văn Đức: 5★ 'Recording + AI note giúp ôn lại rất nhanh' [Phản hồi]"* | Trung |
| Ticket khẩn | *"🚨 Ticket TK-2341 từ Đặng Thuỳ Linh quá SLA 2h [Trả lời]"* | Cao |
| Trial sắp hết | *"⚠ Trial còn 3 ngày. Nâng cấp tiết kiệm 20% chu kỳ năm [Nâng cấp]"* | Cao |

**Implementation:**
- BE gọi endpoint `https://openapi.zalo.me/v3.0/oa/message/transaction`
- Mỗi template **phải đăng ký trước** với Zalo (TransactionMessage Template Approval)
- Nút "[Xem chi tiết]" = deep link về Mini App hoặc web
- Dùng **Zalo OA chung MentorHub** (ngay cả khi mentor chưa có OA riêng)

**Cost:**
- Free: 500 tin/tháng/mentor qua OA chung
- Vượt: 300đ/tin

---

### ② Zalo Mini App — entrypoint chính cho thao tác hằng ngày

**Mentor dashboard gọn chạy trong Zalo** — không cần mở Chrome. URL dạng
`zalo.me/s/{app_id}/mentorhub`. Mini App hiện WebView với viewport ~375px.

**Màn hình cần có trong Mini App:**

```
┌────────────────────────────┐
│ [Home]                     │  ← KPI ngắn + buổi kế tiếp
│ [Hôm nay]                  │  ← Lịch sessions + join Zoom 1-tap
│ [Học viên]                 │  ← DS + nhắn nhanh Zalo chat
│ [Ticket]                   │  ← List + reply ngay
│ [Sau buổi]                 │  ← AI note view/approve
│ [Gói & Thanh toán]         │  ← Status + ZaloPay checkout
│ [Mở trên máy tính ↗]       │  ← Deep link sang web cho deep work
└────────────────────────────┘
```

**Gì KHÔNG làm trong Mini App:**
- Tạo khoá học (giáo trình dài, RebornEditor không tối ưu cho mobile) → web
- Edit AI meeting note → web (màn hình nhỏ khó đọc transcript)
- Analytics chi tiết, nhiều biểu đồ → web

Nút **"Mở trên máy tính"** ở nơi cần → gửi link + token one-time qua OA, mentor
click trên desktop để tiếp tục.

**Implementation:**
- Dùng chung codebase React với web hiện tại
- Build mode riêng: `vite build --mode zalo-mini` → output nhẹ (<500KB gzip)
- Nhúng Zalo Mini App JS SDK để dùng `ZaloPay`, `Share`, `PushNotification`
- Phải submit duyệt với Zalo (1-2 tuần)

---

### ③ Zalo Chatbot (commands) — tương tác text-based

Mentor chat trực tiếp với OA "MentorHub", bot hiểu lệnh hoặc natural language.

**Command examples:**

| Mentor gõ | Bot trả về |
|---|---|
| `/hôm nay` hoặc "hôm nay thế nào" | Lịch sessions + HV đăng ký mới hôm nay |
| `/doanh thu tuần` | Báo cáo tuần + so với tuần trước |
| `/khoá học` | DS khoá đang live + link edit |
| `/trả lời TK-2341 "Chào em, thầy đã..."` | Gửi reply ticket thay mentor |
| `/nhắc Phạm Thu Hà 14h "chuẩn bị slide"` | Tạo reminder gửi HV lúc 14h |
| `/ai note buổi 4 Microservices` | Gửi AI note dạng rich card |
| "bao nhiêu ngày nữa hết trial" | Bot trả lời tự nhiên |

**Tech stack:**
- Zalo OA webhook nhận `user_send_text` event
- Parse command bằng regex trước (fast path)
- Fallback natural language → gọi Claude Haiku để extract intent + parameters
- Execute action qua BE API
- Reply mentor qua OA

---

### ④ Zalo Share API — growth hack chính

Mentor share khoá học vào Zalo group hoặc contact **1-tap**.

**Flow:**
1. Trang "Khoá học" trong Mini App hoặc web → nút **"💬 Share to Zalo"**
2. Mở Zalo Share dialog với nội dung preset:
   - Rich card: cover khoá + tên + giá + CTA "Đăng ký ngay"
   - Deep link: `zalo.me/s/{app_id}/mentorhub?courseId=CRS-01&utm_source=mentor-share&ref={mentorId}`
3. Mentor chọn group/contact → gửi
4. Người nhận click → mở Mini App (nếu đã cài) hoặc fallback web portal
5. BE track UTM → dashboard Marketing của mentor

**Dashboard tracking** (đã có trong Marketing page):
- Bao nhiêu share → bao nhiêu click → bao nhiêu đăng ký thật
- Top contact/group đem về nhiều conversion
- Bảng xếp hạng referral

**Lợi ích growth:**
- Zalo là channel share có CTR cao nhất VN (~15-25% so với email 2-5%)
- Học viên thấy "thầy mình gửi" tin cậy hơn ad

---

### ⑤ Zalo Login — onboarding mentor MỚI cực nhanh

Mentor tạo tài khoản **không cần email/password**. Login bằng Zalo OAuth — 2 tap:

1. Trang "Trở thành Mentor" → nút **"Đăng nhập với Zalo"**
2. Zalo consent dialog (allow MentorHub access profile)
3. BE nhận callback → auto-tạo mentor account với:
   - Zalo User ID (primary key)
   - Display name
   - Avatar
   - Phone (nếu user cho phép share)

**Lợi ích:**
- 0 friction — không cần nhớ password mới
- Phù hợp mentor VN từ chối email
- Auto-link Zalo OA (để nhận push notification) ngay từ đầu

**Tech:**
- Zalo OAuth 2.0 flow: `https://oauth.zaloapp.com/v4/permission?app_id=...&redirect_uri=...`
- Lấy access_token → gọi `https://graph.zalo.me/v2.0/me` lấy profile

---

### ⑥ ZaloPay — thanh toán tự nhiên với ví mentor đã dùng

Ngoài VietQR + VNPay + Card (đã có trong Payment step), thêm **tab thứ 4: ZaloPay**.

**Flow:**
- Mentor chọn gia hạn gói → chọn ZaloPay → redirect sang app ZaloPay
- App ZaloPay tự mở (nếu đã cài) hoặc fallback QR web
- Mentor confirm trong 1 tap (đã đăng nhập sẵn)
- Callback về MentorHub → gia hạn thành công

**Lợi ích:**
- Không phải nhập thẻ
- Tận dụng số dư ví ZaloPay mentor đã có
- Phí xử lý thấp hơn credit card (~1.5% vs 2.9%)

**Mentor pain point được giải:** "Thanh toán bằng thẻ VISA nước ngoài phức tạp,
phải xác thực OTP 3D-Secure..." → ZaloPay 1-tap.

---

### ⑦ Zalo Group auto-created cho mỗi khoá học

Mentor tạo khoá → MentorHub OA **tự tạo Zalo group chat** tên
`"Microservices · K5"` → học viên đăng ký được bot auto invite vào group.

**Lợi ích:**
- Tất cả thảo luận khoá học diễn ra trong Zalo (nơi HV đã quen)
- Không cần học cách dùng chat tool mới
- Mentor vẫn là admin group, có thể pin tài liệu, nhắc lịch
- Bot MentorHub ở trong group để:
  - Nhắc lịch 30p trước buổi
  - Gửi link Zoom khi buổi bắt đầu
  - Gửi AI note sau buổi
  - Ghi nhận tương tác (HV nào active, HV nào im lặng → alert mentor)

**Tech:**
- Zalo Group API (cần OA có permission `group:write`)
- Bot account = MentorHub OA
- Mentor invite OA vào group thủ công 1 lần; sau đó OA tự operate

**Caveat:** Zalo Group API có giới hạn (không phải mọi OA đều được cấp quyền). Cần
xin Zalo whitelisting.

---

## Ưu tiên triển khai

Với MVP 2-3 tuần, tập trung **3 cái ROI cao nhất**:

### Tuần 1 · Zalo OA Push (①)
- Loại cảm giác "đang dùng tool mới"
- Mentor chỉ cần kết bạn OA 1 lần, nhận alert như chat thường
- **Deliverable:** 7 mẫu tin đã đăng ký Zalo + BE webhook gọi Zalo OA API

### Tuần 2 · Zalo Share + Login (④ + ⑤)
- Growth (chia sẻ viral) + onboarding không ma sát
- **Deliverable:** nút Share trong Course page + OAuth Zalo login

### Tuần 3 · Zalo Mini App — subset (②)
- Mentor có entrypoint trong Zalo cho **việc hằng ngày**
- **Deliverable:** Mini App với 3 màn: Home + Hôm nay + Ticket
- Các màn khác (Học viên, AI Note, Settings) làm sprint sau

### Sprint sau (post-MVP)
- ③ Zalo Chatbot commands (~1 tuần)
- ⑥ ZaloPay (~3 ngày, chỉ là thêm 1 tab payment)
- ⑦ Zalo Group auto-create (~1-2 tuần, phụ thuộc Zalo approval)

---

## So sánh vs không tích hợp Zalo

| Metric | Không Zalo | Có Zalo (MVP) | Tăng |
|---|---|---|---|
| Onboarding time mentor mới | 15 phút (tạo pw, verify email) | 2 phút (1 tap Zalo OAuth) | -87% |
| DAU mentor (mở app hằng ngày) | ~30% | ~80% (qua OA push + Mini App) | +167% |
| Response time ticket | ~6h (phải mở email/web) | ~30 phút (push Zalo → tap reply) | -92% |
| Share rate khoá học | ~5% (copy link, paste) | ~25% (1-tap Share to Zalo) | +400% |
| Conversion đăng ký | 14% (web portal) | ~22% (Zalo Rich Card + trust) | +57% |

---

## Rủi ro & mitigation

| Rủi ro | Mitigation |
|---|---|
| Zalo Mini App approval chậm (1-2 tuần) | Bắt đầu submit từ tuần 1, parallel với dev |
| Zalo OA template approval từ chối | Viết content theo guideline Zalo, tránh marketing phrases |
| Giới hạn 500 tin/tháng qua OA chung | Upgrade gói OA hoặc mentor dùng OA riêng (Pro plan) |
| Mentor từ chối kết bạn OA | Hybrid: fallback SMS/email nếu chưa kết bạn OA trong 48h |
| Zalo thay đổi API (policy) | Abstract integration layer trong BE, dễ swap |

---

## Tham khảo

- Zalo OA Docs: https://developers.zalo.me/docs/api/official-account-api
- Zalo Mini App Docs: https://mini.zalo.me/documents/
- Zalo Login: https://developers.zalo.me/docs/api/social-api
- ZaloPay Docs: https://docs.zalopay.vn/v2/
- Rate limit OA Messages: 500 tin/OA/tháng (free tier), mua thêm tại console

---

## Changelog

- **2026-04-24** · Tạo tài liệu đầu tiên · v1
