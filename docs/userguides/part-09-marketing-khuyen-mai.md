# Part 09 — Marketing & Khuyến mãi

> **Dành cho**: Marketing Staff, Marketing Manager, Store Manager
> **Mức độ**: Trung cấp
> **Tham chiếu URD**: [Part 09 — Marketing](../urd/part-09-marketing.md) (UR-MKT-01 → UR-MKT-25)

Part này hướng dẫn bạn **tạo chương trình khuyến mãi**, **phát voucher**, **gửi campaign đa kênh** và **kết nối fanpage/Zalo OA** để thu lead. Nếu bạn phụ trách tăng trưởng cho cửa hàng — đây là vũ khí chính.

## Mục lục
- [1. Tạo chương trình khuyến mãi](#1-tạo-chương-trình-khuyến-mãi)
- [2. Tạo voucher](#2-tạo-voucher)
- [3. Tạo campaign marketing](#3-tạo-campaign-marketing)
- [4. Chọn segment khách đích](#4-chọn-segment-khách-đích)
- [5. Template email/SMS/Zalo](#5-template-emailsmszalo)
- [6. Schedule gửi](#6-schedule-gửi)
- [7. Tracking mở / click](#7-tracking-mở--click)
- [8. Automation flow (drip)](#8-automation-flow-drip)
- [9. Kết nối Facebook Fanpage](#9-kết-nối-facebook-fanpage)
- [10. Kết nối Zalo OA](#10-kết-nối-zalo-oa)
- [11. Khảo sát NPS/CSAT](#11-khảo-sát-npscsat)
- [FAQ](#faq)

---

## 1. Tạo chương trình khuyến mãi

Sidebar → **Marketing → Khuyến mãi** (`/promotion`) → nhấn **[+ Tạo KM]**.

### 1.1. Các loại KM hỗ trợ

| Loại | Ví dụ |
|---|---|
| **Giảm % toàn đơn** | Giảm 10% cho đơn ≥ 500k |
| **Giảm tiền cố định** | Giảm 50.000đ cho đơn ≥ 300k |
| **Mua X tặng Y** | Mua 2 áo tặng 1 vớ |
| **Flash sale** | Áo A giảm 30% trong 2 giờ |
| **Giảm theo hạng thẻ** | Gold giảm 10%, Diamond giảm 15% |
| **Giảm theo danh mục** | Giảm 20% toàn bộ giày thể thao |

### 1.2. Điền form

- **Tên chương trình** (bắt buộc)
- **Loại KM** → chọn từ dropdown
- **Thời gian áp dụng**: từ ngày → đến ngày (có thể chọn giờ chi tiết cho flash sale)
- **Điều kiện áp dụng**:
  - Đơn tối thiểu
  - SP/Category eligible
  - Khách hàng eligible (segment, hạng thẻ)
  - Giới hạn lượt sử dụng (tổng / per khách)
- **Mức giảm**: % hoặc số tiền
- **Kênh áp dụng**: POS / Online / Marketplace
- **Stack với KM khác**: Yes/No

### 1.3. Lưu & kích hoạt

Nhấn **[Lưu nháp]** để lưu không kích hoạt, hoặc **[Kích hoạt ngay]** để chạy luôn.

⚠️ **Chú ý**: KM đang chạy **không sửa điều kiện được** — chỉ tạm dừng + tạo mới.

💡 **Mẹo**: Tạo KM **nháp trước** → review với Manager → mới kích hoạt.

> 🖼️ *Ảnh minh hoạ: Form tạo khuyến mãi — chụp sau*

---

## 2. Tạo voucher

Voucher là **mã giảm giá** — khác với KM tự động, voucher phải **nhập mã** mới áp dụng.

Sidebar → **Marketing → Voucher** (`/voucher`) → **[+ Tạo voucher]**.

### 2.1. Điền form

- **Tên** (ví dụ "Voucher chào mừng 2026")
- **Loại**:
  - **Single-use** — mỗi mã chỉ dùng 1 lần (in QR riêng từng khách)
  - **Multi-use** — 1 mã dùng chung, có giới hạn tổng
- **Mã**: nhập tay hoặc **sinh tự động** (ví dụ `WELCOME2026`)
- **Giá trị**: % / số tiền / quà
- **Điều kiện**: đơn tối thiểu, SP eligible
- **Thời hạn**: ngày bắt đầu → hết hạn
- **Số lượng**: cho multi-use, tổng mã cho single-use

### 2.2. Phát voucher

Sau khi tạo, có **3 cách** phát:

1. **Gửi tay từng khách** — chọn khách → **Gửi voucher** → SMS/Zalo/Email.
2. **Gửi theo campaign** — tích hợp trong campaign email (mục 3).
3. **In QR** — cho single-use, xuất file PDF để in ra thẻ vật lý.

💡 **Mẹo**: Voucher **single-use** giúp kiểm soát gian lận — dùng cho khuyến mãi giá trị cao.

---

## 3. Tạo campaign marketing

Campaign = **chiến dịch gửi thông điệp** đến tập khách mục tiêu qua 1 hay nhiều kênh.

Sidebar → **Marketing → Campaign** (`/campaign`) → **[+ Tạo campaign]**.

### Bước 1: Thông tin cơ bản

- **Tên campaign**
- **Mục tiêu**: Awareness / Conversion / Retention / Winback
- **Ngân sách dự kiến** (tuỳ chọn)
- **KPI kỳ vọng**: open rate, click rate, số đơn

### Bước 2: Chọn kênh

Tick 1 hoặc nhiều kênh:

- 📧 **Email**
- 📱 **SMS**
- 💬 **Zalo ZNS**
- 🔔 **Push notification** (nếu có app)

### Bước 3: Chọn segment đích

(Xem mục 4)

### Bước 4: Soạn nội dung cho từng kênh

(Xem mục 5)

### Bước 5: Schedule

(Xem mục 6)

### Bước 6: Preview & launch

Nhấn **[Gửi test]** đến SĐT/email của bạn → kiểm tra nội dung → **[Kích hoạt campaign]**.

⚠️ **Chú ý**: Gửi > 10.000 recipient cần **duyệt từ Marketing Manager**.

---

## 4. Chọn segment khách đích

Segment = **tập khách** filter theo tiêu chí.

### 4.1. Dùng segment có sẵn

Dropdown **Chọn segment** hiện các segment đã tạo: Khách VIP, Khách mới 30 ngày, Khách inactive 90 ngày, Theo hạng thẻ...

### 4.2. Tạo segment mới trong campaign

Nhấn **[+ Tạo segment mới]** → form builder:

- **Tiêu chí**: kết hợp AND / OR
- Các filter:
  - Hạng thẻ
  - Tổng chi tiêu
  - Số đơn
  - Ngày mua gần nhất
  - Thành phố
  - Tuổi, giới tính
  - Tag

Nhấn **[Xem trước]** → thấy số khách match.

💡 **Mẹo**: Segment càng **specific** → conversion càng cao. Tránh gửi mass cho toàn bộ danh sách.

Xem thêm chi tiết segment ở [Part 03 — Khách hàng](part-03-khach-hang.md).

---

## 5. Template email/SMS/Zalo

### 5.1. Email template

Sidebar → **Marketing → Template → Email** (`/template_email`).

- Tạo **template mới** với editor WYSIWYG (drag-drop block)
- Hỗ trợ **biến**: `{{customer_name}}`, `{{voucher_code}}`, `{{discount}}`, `{{order_last_date}}`
- Responsive preview: desktop / mobile

Template lưu xong → dùng trong campaign.

### 5.2. SMS template

- Giới hạn **160 ký tự** (tiếng Việt có dấu = 70 ký tự/segment)
- Brand name cần đăng ký trước (liên hệ nhà mạng)
- Biến như email

⚠️ **Chú ý**: SMS **không hỗ trợ link UTM tracking** dài — dùng link rút gọn.

### 5.3. Zalo ZNS template

Zalo yêu cầu **duyệt template trước** (Official):

1. Tạo template với format Zalo quy định (header + body + button)
2. Submit lên Zalo → chờ duyệt (1-3 ngày)
3. Sau duyệt → dùng trong campaign

💡 **Mẹo**: Giữ **3-5 template đã duyệt** sẵn cho từng mục đích: OTP, thông báo đơn, khuyến mãi.

---

## 6. Schedule gửi

Tại bước Schedule trong campaign, chọn:

### 6.1. Gửi ngay

Tick **Send immediately** → campaign kích hoạt sau khi duyệt.

### 6.2. Gửi theo giờ

Chọn **ngày + giờ cụ thể** → campaign chạy đúng giờ đó.

💡 **Mẹo**: Giờ vàng gửi cho retail:
- **Email**: 9-10h sáng hoặc 19-20h tối
- **SMS/Zalo**: 10h sáng hoặc 17h chiều
- Tránh gửi sau 21h và trước 8h sáng.

### 6.3. Gửi theo múi giờ khách

Tick **Smart send** → hệ thống gửi **theo giờ địa phương** của từng khách.

### 6.4. Gửi rải

Gửi **drip** (rải đều) trong X giờ — tránh spam spike + quá tải gateway.

---

## 7. Tracking mở / click

Sau khi campaign chạy, vào chi tiết campaign → tab **Tracking**.

### KPI hiển thị

- **Sent**: số đã gửi
- **Delivered**: đã nhận (trừ bounce)
- **Opened**: đã mở (email only)
- **Clicked**: đã click link
- **Converted**: đã tạo đơn từ link
- **Unsubscribed**: đã huỷ nhận

### Funnel

Biểu đồ phễu: Sent → Delivered → Opened → Clicked → Converted với tỷ lệ từng bước.

💡 **Mẹo**: Tỷ lệ open < 15% → cần đổi tiêu đề; tỷ lệ click < 2% → cần đổi CTA.

Các click/open được **gắn tag** vào customer — dùng làm segment cho campaign tiếp theo.

> 🖼️ *Ảnh minh hoạ: Dashboard tracking campaign — chụp sau*

---

## 8. Automation flow (drip)

Automation flow = **chuỗi message gửi tự động** theo trigger (không cần bấm send mỗi lần).

Sidebar → **Marketing → Automation** (`/marketing_automation`) → **[+ Tạo flow]**.

### Ví dụ flow "Chào mừng khách mới"

```
[Trigger: Khách mới đăng ký]
  ↓ (delay 0)
  Gửi email chào mừng + voucher 10%
  ↓ (delay 3 ngày)
  Gửi SMS nhắc dùng voucher
  ↓ (delay 7 ngày)
  IF đã mua → Gửi cảm ơn
  ELSE → Gửi nhắc lần 2
```

### Tạo flow

1. Chọn **Trigger**: event customer (signup, order_paid, birthday, inactive, abandoned_cart...)
2. Kéo **Action nodes** vào canvas: Send email / SMS / Zalo / Wait / IF-condition / Tag customer.
3. Nối các node bằng đường.
4. Cấu hình từng node (template, delay, điều kiện).
5. **[Lưu]** → **[Kích hoạt flow]**.

Flow chạy **24/7 tự động**.

💡 **Mẹo**: Start với flow đơn giản (3-4 node) trước → đo hiệu quả → mới mở rộng.

⚠️ **Chú ý**: Cẩn thận **không tạo loop vô hạn** (A → B → A...). Hệ thống có safety limit 10 step/customer/flow.

🔒 **Quyền**: `marketing.automation.manage`.

> 🖼️ *Ảnh minh hoạ: Canvas automation flow — chụp sau*

---

## 9. Kết nối Facebook Fanpage

Để **thu lead** từ Lead Ads Facebook về CRM tự động.

### Bước 1: Connect account

Sidebar → **Marketing → Tích hợp → Facebook** → nhấn **[Connect]**.

Login Facebook của bạn (phải là **Page Admin**) → duyệt permissions → chọn Fanpage.

### Bước 2: Chọn Lead Form

Hệ thống liệt kê các **Lead Form** đang chạy trên Page → chọn form muốn sync.

### Bước 3: Map field

Map các field trong form Facebook → field khách hàng CRM:

| Facebook | CRM |
|---|---|
| `full_name` | Họ tên |
| `phone_number` | SĐT |
| `email` | Email |
| `city` | Thành phố |

### Bước 4: Bật sync

Tick **Auto sync every 5 min** → mọi lead mới tự vào danh sách **Lead** trong CRM.

Lead có thể assign cho sales, add vào automation flow.

⚠️ **Chú ý**: Facebook access token **hết hạn sau 60 ngày** — hệ thống sẽ cảnh báo trước 7 ngày để renew.

---

## 10. Kết nối Zalo OA

### Bước 1: Tạo Zalo OA (nếu chưa có)

Truy cập [oa.zalo.me](https://oa.zalo.me) → đăng ký Official Account.

### Bước 2: Connect vào CRM

Sidebar → **Marketing → Tích hợp → Zalo OA** → nhấn **[Connect]**.

Nhập:
- **OA ID**
- **App ID + Secret** (từ Zalo for Developer)
- **Webhook URL** (copy từ CRM vào dashboard Zalo)

### Bước 3: Test

Nhấn **[Gửi tin nhắn test]** → nhập Zalo user ID của bạn → nhận tin → OK.

### Tính năng khi đã connect

- Gửi ZNS (Zalo Notification Service)
- Chatbot inbox 2 chiều trong CRM (tab **Inbox**)
- Tự động tạo lead khi khách nhắn OA lần đầu

💡 **Mẹo**: Zalo **free 1 tin/khách/24h** cho thông báo giao dịch — rẻ hơn SMS rất nhiều.

---

## 11. Khảo sát NPS/CSAT

Gửi khảo sát **mức độ hài lòng** sau mua hàng / dịch vụ.

Sidebar → **Marketing → Khảo sát** (`/survey`) → **[+ Tạo khảo sát]**.

### Các loại

- **NPS** (Net Promoter Score): 1 câu hỏi, thang 0-10
- **CSAT** (Customer Satisfaction): 5 sao + comment
- **Custom**: nhiều câu hỏi, multiple choice / text / rating

### Gửi khảo sát

Có **2 cách**:

1. **Auto** — cấu hình trigger (sau 24h khi đơn PAID) → tự gửi qua email/SMS.
2. **Manual** — chọn khách → nhấn Gửi.

### Xem kết quả

Vào chi tiết khảo sát → tab **Kết quả**:

- Biểu đồ phân phối điểm
- Danh sách response chi tiết
- Điểm NPS tổng: Promoters − Detractors
- Word cloud từ comment

💡 **Mẹo**: Khách cho điểm **< 6** → tạo **ticket CSKH tự động** (xem Part 10).

---

## FAQ

**1. Campaign gửi xong nhưng tỷ lệ delivered thấp — tại sao?**
Thường do: (a) Danh sách có nhiều số/email fake; (b) Brand name chưa đăng ký với nhà mạng; (c) Domain email chưa verify SPF/DKIM. Check tab **Tracking → Bounce**.

**2. Tôi có thể A/B test tiêu đề email không?**
Có — trong bước soạn email, tick **A/B test** → nhập 2 subject line → chọn % split → chọn kênh winner (open rate / click rate).

**3. Voucher bị trừ lượt nhưng khách nói chưa dùng — sao kiểm tra?**
Vào chi tiết voucher → tab **Lịch sử sử dụng** — hiện đơn hàng, ngày, cashier đã apply.

**4. Zalo template của tôi bị reject — nguyên nhân?**
Zalo thường reject khi: có nội dung khuyến mãi quá đà, link không rõ ràng, nội dung sai template đã phê duyệt. Đọc lại policy và resubmit.

**5. Tôi muốn gửi wish sinh nhật tự động — làm thế nào?**
Tạo automation flow: Trigger = `customer.birthday_today` → Action: gửi ZNS + tặng voucher mừng sinh nhật.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "Segment quá lớn, cần duyệt" | > 10k khách | Chờ duyệt manager |
| "Template chưa được duyệt" | Zalo chưa approve | Submit lại |
| "FB token expired" | Quá 60 ngày | Reconnect account |
| "Campaign paused — quota hết" | SMS/email pool hết | Nạp thêm credit |
| "Automation loop detected" | Flow tự gọi lại | Sửa logic, thêm exit condition |

---

*Hết Part 09. Xem tiếp [Part 10 — Loyalty & Chăm sóc](part-10-loyalty-cham-soc.md).*
