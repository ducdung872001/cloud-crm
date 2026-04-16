# Part 10 — Kênh giao tiếp (Communication Channels)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-COM-01: Tổng đài VoIP/SIP

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-COM-01 |
| **Tên** | Tổng đài VoIP/SIP (VoIP Call Center) |
| **Actor** | Sales, Support, Call Center Agent, Manager |
| **Mô tả** | Tích hợp tổng đài VoIP/SIP trực tiếp trong CRM. Hỗ trợ gọi đi (outbound) và nhận cuộc gọi đến (inbound) từ giao diện web. Khi có cuộc gọi đến, hệ thống tự động nhận diện số điện thoại (caller ID lookup) và hiển thị popup thông tin khách hàng (tên, công ty, lịch sử giao dịch, ticket mở). Mỗi cuộc gọi ghi nhận: số gọi, số nhận, thời gian bắt đầu/kết thúc, thời lượng, trạng thái (Answered / Missed / Busy / Failed), nhân viên xử lý, ghi âm (nếu bật), ghi chú sau cuộc gọi (call disposition). Hỗ trợ: chuyển cuộc gọi (transfer), giữ máy (hold), hội nghị (conference 3 bên), IVR menu cơ bản, hàng đợi cuộc gọi (queue) phân bổ theo round-robin hoặc least-busy. Tích hợp qua SIP trunk với nhà cung cấp: Viettel, VNPT, FPT Telecom, hoặc SIP provider bất kỳ. |
| **Tiền điều kiện** | SIP trunk đã được cấu hình với nhà cung cấp VoIP. Extension (số nội bộ) đã gán cho nhân viên. WebRTC hoặc SIP softphone đã cài đặt. |
| **Đầu vào** | **Gọi đi:** Số điện thoại (*) hoặc chọn từ danh bạ khách hàng. **Nhận cuộc gọi:** Tự động popup. **Sau cuộc gọi:** Ghi chú, disposition (Interested / Not Interested / Callback / Wrong Number), lịch hẹn callback. |
| **Đầu ra** | Cuộc gọi được thực hiện/nhận. Log cuộc gọi tự động tạo trên timeline khách hàng. Ghi âm lưu trữ (nếu bật). Thống kê cuộc gọi: tổng gọi, answered, missed, average duration. |
| **Tiêu chí chấp nhận** | 1. Gọi đi từ CRM (click-to-call) thành công qua SIP trunk. 2. Nhận cuộc gọi đến: popup hiển thị thông tin khách hàng trong < 2 giây. 3. Caller ID lookup: khớp số điện thoại với khách hàng trong hệ thống. 4. Ghi âm cuộc gọi (configurable on/off), lưu trữ, nghe lại. 5. Transfer/Hold/Conference hoạt động đúng. 6. Call queue: phân bổ round-robin hoặc least-busy. 7. Log cuộc gọi tự động trên timeline khách hàng (có link ghi âm). 8. Thống kê: tổng calls, answered rate, missed rate, avg duration, theo nhân viên. 9. Ghi chú + disposition sau cuộc gọi bắt buộc (configurable). 10. Chất lượng âm thanh: codec G.711/G.729, latency < 150ms. |
| **Ưu tiên** | **S** |

---

## UR-COM-02: Email tích hợp

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-COM-02 |
| **Tên** | Email tích hợp (Integrated Email) |
| **Actor** | Sales, Support, Marketing, All Users |
| **Mô tả** | Tích hợp email trực tiếp trong CRM, giúp gửi/nhận email mà không cần rời ứng dụng. Hỗ trợ kết nối: Microsoft 365 (via OAuth2), Google Workspace (via OAuth2), IMAP/SMTP bất kỳ. Mỗi nhân viên kết nối email cá nhân; email gửi/nhận tự động đồng bộ (2-way sync) và hiển thị trên timeline khách hàng (matching theo email address). Giao diện email: inbox, sent, drafts, compose (rich text editor, đính kèm file, CC/BCC), thread view. Hỗ trợ email template (link UR-MKT-03) với merge fields. Email tracking: theo dõi open, click, reply cho mỗi email gửi đi. Shared inbox: nhiều nhân viên cùng quản lý 1 hộp thư chung (ví dụ: sales@company.com, support@company.com), assign email cho nhân viên xử lý. |
| **Tiền điều kiện** | Nhân viên đã kết nối email (OAuth hoặc IMAP/SMTP). |
| **Đầu vào** | **Kết nối email:** Loại (M365 / Google / IMAP), credentials (OAuth flow hoặc IMAP/SMTP config). **Gửi email:** To (*), CC, BCC, Subject (*), Body (*), Attachments, Template (tuỳ chọn). |
| **Đầu ra** | Email gửi thành công. Email nhận đồng bộ vào CRM. Timeline khách hàng hiển thị email trao đổi. Tracking: open/click events. |
| **Tiêu chí chấp nhận** | 1. Kết nối Microsoft 365 qua OAuth2 thành công. 2. Kết nối Google Workspace qua OAuth2 thành công. 3. Kết nối IMAP/SMTP với cấu hình tuỳ chỉnh. 4. 2-way sync: email gửi/nhận trong CRM đồng bộ với mail server. 5. Auto-matching: email gửi/nhận tự động link vào đúng khách hàng (theo email address). 6. Compose: rich text, attachment (tối đa 25MB), CC/BCC. 7. Email tracking: open pixel + click redirect hoạt động đúng. 8. Shared inbox: assign email, trạng thái (Open / Replied / Closed). 9. Thread view: hiển thị chuỗi email đúng thứ tự. 10. Đồng bộ email tối đa 30 ngày gần nhất khi kết nối lần đầu. |
| **Ưu tiên** | **M** |

---

## UR-COM-03: Zalo OA + Facebook Fanpage

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-COM-03 |
| **Tên** | Zalo OA + Facebook Fanpage (Social Channel Integration) |
| **Actor** | Sales, Support, Marketing |
| **Mô tả** | Tích hợp kênh Zalo Official Account và Facebook Fanpage vào CRM. **Zalo OA:** nhận tin nhắn từ Zalo, trả lời trực tiếp trong CRM, gửi ZNS (Zalo Notification Service) cho khách hàng, theo dõi follower OA. **Facebook Fanpage:** nhận tin nhắn Messenger, nhận comment trên bài post, trả lời trong CRM, theo dõi reaction/share. Giao diện omni-channel inbox: tập trung tất cả tin nhắn từ Zalo + Facebook + Email vào 1 hộp thư chung, assign cho nhân viên xử lý, trạng thái conversation (Open / Pending / Resolved). Auto-matching: khi khách nhắn tin, hệ thống tự động nhận diện khách hàng (theo số điện thoại Zalo hoặc Facebook profile) và hiển thị thông tin trên sidebar. Nếu khách mới, tự động tạo lead. Chatbot cơ bản: auto-reply ngoài giờ làm việc, menu chọn chủ đề, chuyển nhân viên khi cần. |
| **Tiền điều kiện** | Zalo OA đã được xác thực và kết nối qua Zalo API. Facebook Fanpage đã kết nối qua Facebook Graph API (OAuth). |
| **Đầu vào** | **Kết nối:** Zalo OA ID + Secret Key, Facebook Page Token (OAuth flow). **Trả lời tin nhắn:** Nội dung (*), hình ảnh/file đính kèm. **Chatbot:** Kịch bản auto-reply, menu, routing rules. |
| **Đầu ra** | Tin nhắn Zalo/Facebook hiển thị realtime trong omni-channel inbox. Conversation gắn vào khách hàng trên timeline. Lead tự động tạo cho khách mới. |
| **Tiêu chí chấp nhận** | 1. Kết nối Zalo OA qua Zalo API thành công. 2. Nhận tin nhắn Zalo realtime (webhook), hiển thị trong inbox < 3 giây. 3. Trả lời tin nhắn Zalo (text, hình ảnh) thành công. 4. Gửi ZNS template cho khách hàng. 5. Kết nối Facebook Fanpage qua Graph API. 6. Nhận tin nhắn Messenger + comment realtime. 7. Trả lời Messenger/comment từ CRM. 8. Omni-channel inbox: tập trung Zalo + Facebook + Email, assign nhân viên. 9. Auto-matching: nhận diện khách hàng, tự động tạo lead nếu mới. 10. Chatbot: auto-reply ngoài giờ, menu chọn chủ đề, routing đúng nhân viên. 11. Conversation history đầy đủ trên timeline khách hàng. |
| **Ưu tiên** | **S** |
