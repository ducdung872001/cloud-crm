# Part 06 — Marketing & Automation

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-MKT-01: Chiến dịch Email/SMS/Zalo

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-01 |
| **Tên** | Chiến dịch Email/SMS/Zalo (Campaign Management) |
| **Actor** | Marketing, Sales Manager, Admin |
| **Mô tả** | Tạo và quản lý các chiến dịch tiếp thị đa kênh: Email, SMS, Zalo OA. Mỗi chiến dịch gồm: tên chiến dịch, mục tiêu (Lead Nurturing / Promotion / Announcement / Re-engagement), kênh gửi (Email / SMS / Zalo / Multi-channel), danh sách người nhận (từ segment khách hàng hoặc import CSV), template tin nhắn (link UR-MKT-03), lịch gửi (gửi ngay / hẹn giờ / gửi theo múi giờ người nhận), trạng thái (Draft / Scheduled / Running / Paused / Completed / Failed). Hỗ trợ A/B testing với 2-3 biến thể nội dung, tự động chọn biến thể tốt nhất sau khi test trên 10-20% danh sách. Thống kê realtime: số gửi, delivered, opened, clicked, bounced, unsubscribed. Tích hợp Viettel SMS Gateway, Zalo ZNS API, SMTP/SendGrid cho email. |
| **Tiền điều kiện** | Danh sách khách hàng đã có trong hệ thống. Template tin nhắn đã được tạo. Kênh gửi (SMTP, SMS Gateway, Zalo OA) đã được cấu hình trong Cài đặt tích hợp (UR-SET-03). |
| **Đầu vào** | Tên chiến dịch (*), mục tiêu (*), kênh gửi (*), danh sách người nhận (*) (segment hoặc CSV), template (*), lịch gửi (*), cấu hình A/B testing (tuỳ chọn), sender name/email/phone. |
| **Đầu ra** | Chiến dịch được tạo với mã tự động (CAMP-YYYYMMDD-###). Tin nhắn được gửi theo lịch. Dashboard thống kê: sent, delivered, open rate, click rate, bounce rate, unsubscribe rate. Báo cáo chi tiết từng người nhận (trạng thái, thời gian mở, link clicked). |
| **Tiêu chí chấp nhận** | 1. CRUD chiến dịch hoạt động đúng. 2. Gửi Email qua SMTP/SendGrid thành công, tracking open/click. 3. Gửi SMS qua Viettel Gateway thành công, nhận delivery report. 4. Gửi Zalo ZNS thành công, tracking trạng thái. 5. Hẹn giờ gửi chính xác (sai lệch <= 1 phút). 6. A/B testing: tự động chọn biến thể winner sau thời gian test. 7. Danh sách đen (unsubscribed/bounced) tự động loại khỏi lần gửi sau. 8. Dashboard thống kê realtime theo từng chiến dịch. 9. Xuất báo cáo chiến dịch ra Excel/PDF. 10. Giới hạn tốc độ gửi (rate limiting) để tránh bị block. |
| **Ưu tiên** | **M** |

---

## UR-MKT-02: Marketing Automation Workflow

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-02 |
| **Tên** | Marketing Automation Workflow |
| **Actor** | Marketing, Sales Manager, Admin |
| **Mô tả** | Xây dựng các luồng tự động hoá marketing dạng visual workflow (drag & drop). Các node trong workflow gồm: **Trigger** (Lead mới tạo, Lead đổi trạng thái, Deal thắng/thua, Khách hàng sinh nhật, Form submit, Tag được gắn), **Action** (Gửi Email/SMS/Zalo, Gắn tag, Đổi trạng thái lead, Tạo task cho Sales, Thêm vào segment, Gửi notification), **Condition** (If/Else theo field, Score >= ngưỡng, Đã mở email, Đã click link), **Delay** (Chờ N phút/giờ/ngày, Chờ đến ngày cụ thể). Mỗi workflow có trạng thái: Draft / Active / Paused / Archived. Hỗ trợ lead scoring tự động: mỗi hành vi (mở email +5, click link +10, visit website +3, reply email +20) cộng điểm, khi đạt ngưỡng tự động chuyển MQL → SQL. |
| **Tiền điều kiện** | Các kênh gửi đã cấu hình. Template tin nhắn đã có. Hệ thống có dữ liệu lead/khách hàng. |
| **Đầu vào** | Tên workflow (*), trigger (*), chuỗi action/condition/delay (visual builder), cấu hình lead scoring (điểm cho mỗi hành vi), ngưỡng chuyển đổi MQL/SQL. |
| **Đầu ra** | Workflow được kích hoạt, tự động xử lý lead/khách hàng khi trigger xảy ra. Log chi tiết mỗi lần chạy (thời gian, node đã qua, kết quả). Lead score tự động cập nhật. |
| **Tiêu chí chấp nhận** | 1. Visual workflow builder drag & drop hoạt động mượt. 2. Trigger bắt sự kiện đúng (lead mới, đổi trạng thái, v.v.). 3. Action gửi Email/SMS/Zalo thành công. 4. Condition If/Else phân nhánh đúng logic. 5. Delay chờ đúng thời gian cấu hình. 6. Lead scoring cộng điểm đúng theo hành vi. 7. Tự động chuyển MQL → SQL khi score >= ngưỡng. 8. Log chi tiết mỗi workflow execution (audit trail). 9. Pause/Resume workflow không mất dữ liệu đang xử lý. 10. Giới hạn tối đa 50 workflow active đồng thời (per tenant). |
| **Ưu tiên** | **S** |

---

## UR-MKT-03: Quản lý template tin nhắn

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-03 |
| **Tên** | Quản lý template tin nhắn (Message Template Management) |
| **Actor** | Marketing, Admin |
| **Mô tả** | Tạo và quản lý các mẫu tin nhắn cho Email, SMS, Zalo ZNS. Mỗi template gồm: tên, kênh (Email / SMS / Zalo), danh mục (Welcome / Promotion / Reminder / Notification / Follow-up), nội dung với biến động (merge fields: {{ten_khach}}, {{ten_cong_ty}}, {{san_pham}}, {{link_landing}}, {{nhan_vien_phu_trach}}, v.v.), preview, trạng thái (Draft / Active / Archived). Template Email hỗ trợ HTML editor (rich text + drag & drop block builder), responsive design. Template SMS giới hạn 160 ký tự (hoặc 70 ký tự Unicode). Template Zalo ZNS theo format Zalo quy định (cần duyệt trước khi sử dụng). Hỗ trợ versioning — lưu lịch sử chỉnh sửa, rollback về phiên bản trước. |
| **Tiền điều kiện** | Người dùng có quyền quản lý template. Đối với Zalo ZNS, Zalo OA đã được kết nối. |
| **Đầu vào** | Tên template (*), kênh (*), danh mục (*), nội dung (*) (với merge fields), subject (Email), sender name. |
| **Đầu ra** | Template được lưu, sẵn sàng sử dụng trong chiến dịch (UR-MKT-01) và workflow (UR-MKT-02). Preview hiển thị đúng với merge fields mẫu. |
| **Tiêu chí chấp nhận** | 1. CRUD template hoạt động đúng. 2. Email HTML editor: chèn text, image, button, divider, columns. 3. Merge fields tự động thay thế đúng khi gửi. 4. Preview hiển thị với dữ liệu mẫu. 5. SMS hiển thị cảnh báo khi vượt 160 ký tự (hoặc 70 Unicode). 6. Zalo ZNS template đúng format (có nút submit duyệt). 7. Versioning: lưu tối đa 10 phiên bản, rollback 1 click. 8. Clone template thành bản mới. 9. Lọc template theo kênh, danh mục, trạng thái. 10. Tìm kiếm template theo tên, nội dung. |
| **Ưu tiên** | **M** |
