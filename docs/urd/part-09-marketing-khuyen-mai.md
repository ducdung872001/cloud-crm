# Part 09 — Marketing & Khuyến mãi

## 1. Phạm vi phân hệ

Các công cụ marketing đa kênh của Reborn Retail CRM: campaign marketing theo segment, automation flow (drip campaign), gửi email / SMS / Zalo marketing, tích hợp Fanpage Facebook, chương trình khuyến mãi (voucher, flash sale), khảo sát khách hàng (NPS, CSAT), chăm sóc khách hàng đa kênh.

Các route retail liên quan:

- `/marketing_campaign` — campaign marketing
- `/marketing_automation` — automation flow
- `/email_marketing` — email marketing
- `/sms_marketing` — SMS marketing
- `/zalo_marketing`, `/zalo` — Zalo OA marketing
- `/fanpage`, `/facebook` — Facebook fanpage
- `/promotional_program` — chương trình khuyến mãi
- `/customer_survey`, `/cxm_survey` — khảo sát KH
- `/customer_care`, `/customer_care_email` — chăm sóc KH
- `/multi_channel_communication` — giao tiếp đa kênh

## 2. Actor liên quan

- **Marketer** — người dùng chính, lập campaign
- **CSKH (Customer Care)** — xử lý phản hồi, chăm sóc 1-1
- **Store Manager** — duyệt ngân sách marketing
- **Customer** — đối tượng đích (passive)
- **Tenant Admin** — cấu hình kênh (API keys Facebook, Zalo OA, email SMTP, SMS brand name)

## 3. Yêu cầu chi tiết

### UR-MKT-01 — Tạo campaign marketing

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-01 |
| **Tên** | Lập chiến dịch marketing với segment đích |
| **Actor** | Marketer |
| **Mô tả** | `/marketing_campaign` cho phép tạo campaign: tên, mô tả, mục tiêu (awareness / conversion), kênh (email/SMS/Zalo/multi), segment đích (từ danh sách KH, tag, tier), ngân sách dự kiến, thời gian chạy. |
| **Tiền điều kiện** | Marketer đăng nhập, có quyền `marketing.campaign` |
| **Đầu vào** | Form campaign, segment rule |
| **Đầu ra** | Campaign ở trạng thái `draft` |
| **Tiêu chí chấp nhận** | - Segment hiển thị tổng số KH match<br>- Preview message cho từng kênh<br>- Lưu draft không giới hạn |
| **Ưu tiên** | **M** |

### UR-MKT-02 — Schedule gửi campaign

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-02 |
| **Tên** | Lên lịch gửi campaign |
| **Actor** | Marketer |
| **Mô tả** | Campaign có thể gửi ngay hoặc schedule theo thời gian định sẵn. Hỗ trợ timezone tenant. Trạng thái: `draft → scheduled → running → completed`. |
| **Tiền điều kiện** | Campaign đã có nội dung và segment |
| **Đầu vào** | Thời gian gửi, timezone |
| **Đầu ra** | Campaign chuyển `scheduled`; job vào queue |
| **Tiêu chí chấp nhận** | - Cho phép huỷ trước giờ gửi<br>- Smart send-time (gửi theo giờ active của KH)<br>- Rate limiting để tránh spam burst |
| **Ưu tiên** | **S** |

### UR-MKT-03 — Template email marketing

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-03 |
| **Tên** | Thư viện template email với editor |
| **Actor** | Marketer |
| **Mô tả** | `/email_marketing` cung cấp editor HTML (drag-drop hoặc WYSIWYG) để tạo template email. Hỗ trợ variable `{{customer_name}}`, `{{voucher_code}}`. Lưu template tái sử dụng. |
| **Tiền điều kiện** | SMTP đã cấu hình |
| **Đầu vào** | Nội dung email, subject, sender name |
| **Đầu ra** | Template lưu, preview render |
| **Tiêu chí chấp nhận** | - Preview desktop + mobile<br>- Test gửi đến 1 email bất kỳ<br>- Unsubscribe link tự chèn |
| **Ưu tiên** | **M** |

### UR-MKT-04 — Template SMS và Zalo ZNS

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-04 |
| **Tên** | Template SMS brand name và Zalo ZNS |
| **Actor** | Marketer |
| **Mô tả** | `/sms_marketing` và `/zalo_marketing` cho phép soạn template SMS (tối đa 160 ký tự không dấu) và template Zalo ZNS (phải đăng ký mẫu trước với Zalo). Hỗ trợ variable. |
| **Tiền điều kiện** | Brand name SMS đã đăng ký; Zalo OA đã kết nối |
| **Đầu vào** | Nội dung, variable mapping |
| **Đầu ra** | Template lưu |
| **Tiêu chí chấp nhận** | - Đếm ký tự SMS và tính số SMS<br>- Zalo ZNS validate template_id đã duyệt<br>- Preview thực tế |
| **Ưu tiên** | **M** |

### UR-MKT-05 — Tracking mở / click

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-05 |
| **Tên** | Theo dõi tỷ lệ mở, click, chuyển đổi |
| **Actor** | Marketer |
| **Mô tả** | Sau khi campaign chạy, thống kê: tổng gửi, đã nhận, mở, click, bounce, unsubscribe, conversion. Funnel hiển thị trực quan. |
| **Tiền điều kiện** | Campaign đã chạy |
| **Đầu vào** | Campaign ID |
| **Đầu ra** | Dashboard thống kê realtime |
| **Tiêu chí chấp nhận** | - Email dùng tracking pixel + UTM link<br>- SMS chỉ track click qua shortlink<br>- Drill-down danh sách KH đã mở/click |
| **Ưu tiên** | **M** |

### UR-MKT-06 — A/B test

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-06 |
| **Tên** | Test 2 biến thể nội dung |
| **Actor** | Marketer |
| **Mô tả** | Campaign hỗ trợ A/B test: chia segment thành 2 nhóm ngẫu nhiên (50/50 hoặc tuỳ chọn), gửi 2 biến thể khác nhau. Sau khi có kết quả, có thể auto-send winner cho phần còn lại. |
| **Tiền điều kiện** | Campaign có ít nhất 2 variant |
| **Đầu vào** | Variant A, Variant B, tỷ lệ chia |
| **Đầu ra** | Kết quả theo variant, winner được xác định |
| **Tiêu chí chấp nhận** | - Chọn metric winner (open rate / click rate / conversion)<br>- Sample size đủ tin cậy<br>- Auto-send winner cho 80% còn lại (optional) |
| **Ưu tiên** | **C** |

### UR-MKT-07 — Automation flow (drip campaign)

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-07 |
| **Tên** | Xây dựng flow tự động nhiều bước |
| **Actor** | Marketer |
| **Mô tả** | `/marketing_automation` cung cấp canvas drag-drop để xây flow: trigger (KH mới, mua lần đầu, sinh nhật, bỏ giỏ) → action (gửi email / SMS / Zalo / tag KH) → delay → điều kiện rẽ nhánh → action tiếp. |
| **Tiền điều kiện** | Có template và segment |
| **Đầu vào** | Flow diagram |
| **Đầu ra** | Flow enable, chạy nền theo trigger |
| **Tiêu chí chấp nhận** | - Visual editor node-based<br>- Test flow với KH giả<br>- Pause/resume flow |
| **Ưu tiên** | **S** |

### UR-MKT-08 — Fanpage Facebook integration

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-08 |
| **Tên** | Kết nối và quản lý fanpage Facebook |
| **Actor** | Marketer, CSKH |
| **Mô tả** | `/facebook` + `/fanpage` cho phép kết nối fanpage qua Facebook Graph API, xem inbox tin nhắn, comment post, trả lời trực tiếp trong CRM. Post mới lên fanpage từ CRM. |
| **Tiền điều kiện** | Tenant Admin đã OAuth fanpage |
| **Đầu vào** | Message reply, post content |
| **Đầu ra** | Post xuất hiện trên fanpage; inbox sync 2 chiều |
| **Tiêu chí chấp nhận** | - Sync messages qua webhook<br>- Match KH Facebook với KH CRM theo SĐT/email<br>- Gán ticket CSKH từ inbox |
| **Ưu tiên** | **S** |

### UR-MKT-09 — Zalo OA integration

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-09 |
| **Tên** | Kết nối Zalo OA |
| **Actor** | Marketer, CSKH |
| **Mô tả** | `/zalo` tích hợp Zalo Official Account: gửi broadcast, gửi ZNS cá nhân hoá, nhận và trả lời tin nhắn khách. |
| **Tiền điều kiện** | Zalo OA token hợp lệ |
| **Đầu vào** | Message, template ZNS |
| **Đầu ra** | Tin nhắn gửi đi; inbox 2 chiều |
| **Tiêu chí chấp nhận** | - Token refresh tự động<br>- Quota ZNS/ngày hiển thị rõ<br>- Cảnh báo khi gần hết quota |
| **Ưu tiên** | **S** |

### UR-MKT-10 — Chương trình khuyến mãi & voucher

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-10 |
| **Tên** | Tạo chương trình khuyến mãi và sinh voucher |
| **Actor** | Marketer, Store Manager |
| **Mô tả** | `/promotional_program` tạo chương trình: loại (% discount / số tiền / tặng SP / flash sale), điều kiện áp dụng (đơn tối thiểu, SP/danh mục, KH VIP), thời gian, ngân sách. Sinh voucher code (đơn hoặc hàng loạt). |
| **Tiền điều kiện** | Marketer có quyền `promotion.create` |
| **Đầu vào** | Cấu hình chương trình |
| **Đầu ra** | Chương trình enable; voucher code sẵn sàng |
| **Tiêu chí chấp nhận** | - Flash sale theo khung giờ<br>- Voucher code unique, 1-time hoặc multi-use<br>- Không chồng chéo 2 khuyến mãi (cấu hình priority) |
| **Ưu tiên** | **M** |

### UR-MKT-11 — Khảo sát khách hàng NPS/CSAT

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-11 |
| **Tên** | Thu thập ý kiến khách hàng |
| **Actor** | Marketer, CSKH |
| **Mô tả** | `/customer_survey` + `/cxm_survey` cho phép tạo form khảo sát (NPS 0-10, CSAT 1-5, câu hỏi mở, lựa chọn), gửi qua email/SMS/Zalo sau khi KH mua hàng X ngày. Báo cáo NPS/CSAT realtime. |
| **Tiền điều kiện** | Có template khảo sát |
| **Đầu vào** | Form câu hỏi, trigger, segment |
| **Đầu ra** | Survey gửi; kết quả thu về |
| **Tiêu chí chấp nhận** | - NPS score tự tính (promoters - detractors)<br>- Phân nhóm theo tier KH<br>- Follow-up detractors tự động |
| **Ưu tiên** | **S** |

### UR-MKT-12 — Chăm sóc khách hàng đa kênh

| Trường | Nội dung |
|---|---|
| **ID** | UR-MKT-12 |
| **Tên** | Inbox thống nhất các kênh |
| **Actor** | CSKH |
| **Mô tả** | `/customer_care` + `/multi_channel_communication` gom inbox từ Facebook, Zalo, email, SMS vào một màn hình unified. CSKH trả lời từ CRM, ghi lịch sử tương tác vào hồ sơ KH. |
| **Tiền điều kiện** | Đã kết nối ít nhất 1 kênh |
| **Đầu vào** | Reply content |
| **Đầu ra** | Message gửi qua kênh tương ứng; lưu lịch sử KH |
| **Tiêu chí chấp nhận** | - Assign ticket cho CSKH cụ thể<br>- SLA response time hiển thị<br>- Canned response (câu trả lời mẫu) |
| **Ưu tiên** | **M** |

## 4. Quy tắc nghiệp vụ

- **Opt-out bắt buộc**: mọi email marketing phải có link unsubscribe; SMS marketing phải có TU (từ chối).
- **Tần suất liên hệ tối đa**: 1 KH không nhận quá X message/tuần (cấu hình) để chống spam.
- **Quiet hours**: không gửi SMS/Zalo ngoài khung 8h-21h (cấu hình).
- **Segment snapshot**: khi campaign chạy, snapshot danh sách KH để tránh thay đổi segment giữa chừng.
- **Voucher duy nhất**: code voucher unique toàn tenant, sinh ngẫu nhiên alphanumeric.

## 5. Non-functional ràng buộc

- **Scalability**: gửi 100k email/giờ qua queue worker; SMS/Zalo qua partner API có rate limit.
- **Deliverability**: SPF/DKIM/DMARC cấu hình đúng để email không vào spam.
- **Compliance**: tuân thủ GDPR / Nghị định 13 về bảo vệ dữ liệu cá nhân; lưu opt-out.
- **Security**: API keys (Facebook, Zalo, SMTP, SMS) mã hoá AES-256.
- **Monitoring**: cảnh báo khi bounce rate > 5% hoặc spam report > 0.1%.

---

*Hết Part 09. Xem tiếp [Part 10 — Loyalty & Chăm sóc](part-10-loyalty-cham-soc.md).*
