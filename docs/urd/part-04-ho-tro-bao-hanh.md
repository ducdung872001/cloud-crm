# Part 04 — Hỗ trợ & Bảo hành (Ticketing & Warranty)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-TKT-01: Ticket hỗ trợ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-TKT-01 |
| **Tên** | Ticket hỗ trợ khách hàng (Support Ticket) |
| **Actor** | Support / Helpdesk, Sales, Khách hàng (qua portal) |
| **Mô tả** | Hệ thống tiếp nhận và xử lý ticket hỗ trợ từ nhiều kênh: email, điện thoại (VoIP), Zalo OA, Facebook Messenger, và customer portal. Mỗi ticket gồm: mã ticket (tự động), tiêu đề, mô tả vấn đề, khách hàng, người liên hệ, kênh tiếp nhận (channel), loại vấn đề (Bug / Feature Request / Question / Incident), độ ưu tiên (Low / Medium / High / Critical), nhân viên xử lý, trạng thái (Open / In Progress / Waiting Customer / Resolved / Closed / Reopened), và SLA tracking. Hỗ trợ gán tự động (auto-assign) theo round-robin hoặc theo kỹ năng (skill-based routing). Hiển thị dạng danh sách và Kanban. |
| **Tiền điều kiện** | Người dùng có quyền truy cập module Ticket. Khách hàng đã tồn tại trong hệ thống (hoặc tự tạo khi nhận ticket từ kênh mới). |
| **Đầu vào** | Tiêu đề (*), mô tả (*), khách hàng (*), người liên hệ, kênh tiếp nhận (*), loại vấn đề (*), độ ưu tiên (*), nhân viên xử lý, SLA policy, sản phẩm/dịch vụ liên quan, file đính kèm (screenshot, log). |
| **Đầu ra** | Ticket được tạo với mã tự động (TKT-YYYYMMDD-###). Email/notification xác nhận gửi đến khách hàng. SLA timer bắt đầu đếm. Ticket hiển thị trên Kanban board và danh sách. |
| **Tiêu chí chấp nhận** | 1. Tạo ticket thủ công thành công. 2. Tự động tạo ticket từ email đến (email-to-ticket). 3. Tự động tạo ticket từ Zalo OA / Facebook message. 4. Auto-assign theo cấu hình (round-robin hoặc skill-based). 5. SLA tracking: thời gian phản hồi đầu tiên (first response time) và thời gian xử lý (resolution time). 6. Cảnh báo khi SLA sắp vi phạm (< 1 giờ còn lại). 7. Chuyển trạng thái ticket đúng luồng, ghi log đầy đủ. 8. Kéo thả Kanban board hoạt động. 9. Conversation thread: mỗi ticket có chuỗi trao đổi (comment nội bộ + reply khách hàng). 10. Đính kèm file (tối đa 20MB/file, 5 file/ticket). |
| **Ưu tiên** | **M** |

---

## UR-TKT-02: Bảo hành sản phẩm

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-TKT-02 |
| **Tên** | Bảo hành sản phẩm (Product Warranty) |
| **Actor** | Support / Helpdesk, Finance |
| **Mô tả** | Quản lý bảo hành sản phẩm/dịch vụ CNTT theo serial number hoặc license key. Mỗi bản ghi bảo hành gồm: khách hàng, sản phẩm, serial/license, ngày bắt đầu bảo hành, ngày hết hạn, loại bảo hành (Standard / Extended / Premium), trạng thái (Active / Expired / Void). Khi khách hàng yêu cầu hỗ trợ, hệ thống tự động kiểm tra còn bảo hành hay không. Nếu hết bảo hành, tạo báo giá sửa chữa/gia hạn. Quy trình sửa chữa (repair workflow): Tiếp nhận → Chẩn đoán → Báo giá sửa chữa (nếu hết BH) → Khách duyệt → Sửa chữa → Kiểm tra → Trả hàng. |
| **Tiền điều kiện** | Sản phẩm và khách hàng đã tồn tại. Bảo hành được tạo khi xuất hóa đơn/giao hàng (liên kết UR-SALE-04). |
| **Đầu vào** | Khách hàng (*), sản phẩm (*), serial/license (*), ngày bắt đầu BH (*), thời hạn BH (tháng) (*), loại BH (*), hợp đồng liên kết, ghi chú. **Yêu cầu sửa chữa:** Mô tả lỗi (*), ảnh/video lỗi, mức độ nghiêm trọng. |
| **Đầu ra** | Bản ghi bảo hành được lưu. Khi tra cứu serial → hiển thị trạng thái BH (còn/hết). Yêu cầu sửa chữa tạo ticket liên kết. Cảnh báo bảo hành sắp hết hạn (30/15/7 ngày). |
| **Tiêu chí chấp nhận** | 1. CRUD bảo hành hoạt động đúng. 2. Tra cứu nhanh bảo hành theo serial/license. 3. Tự động đánh dấu Expired khi hết hạn (batch job hàng ngày). 4. Tạo yêu cầu sửa chữa (repair request) từ bản ghi BH. 5. Repair workflow đầy đủ các bước, mỗi bước ghi log. 6. Nếu hết BH: tự động tạo báo giá sửa chữa (link UR-SALE-02). 7. Cảnh báo email/notification BH sắp hết hạn. 8. Báo cáo: tổng sản phẩm đang BH, sắp hết, đã hết, theo khách hàng. |
| **Ưu tiên** | **M** |

---

## UR-TKT-03: Knowledge Base & FAQ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-TKT-03 |
| **Tên** | Knowledge Base & FAQ (Cơ sở tri thức) |
| **Actor** | Support / Helpdesk, Admin |
| **Mô tả** | Hệ thống quản lý cơ sở tri thức (Knowledge Base — KB) gồm các bài viết hướng dẫn, FAQ, và giải pháp cho các vấn đề thường gặp. Mỗi bài viết gồm: tiêu đề, danh mục (category), nội dung (rich text), tags, trạng thái (Draft / Published / Archived), tác giả, ngày tạo/cập nhật. Hỗ trợ tìm kiếm toàn văn (full-text search). Nhân viên support tra cứu KB khi xử lý ticket để tìm giải pháp nhanh. Bài viết có thể được tạo từ ticket đã giải quyết (convert ticket → KB article). |
| **Tiền điều kiện** | Người dùng có quyền quản lý Knowledge Base. |
| **Đầu vào** | Tiêu đề (*), danh mục (*), nội dung (rich text) (*), tags, trạng thái, file đính kèm (ảnh, video, PDF). |
| **Đầu ra** | Bài viết KB được lưu và có thể tìm kiếm. Hiển thị trong tab "Giải pháp gợi ý" khi xử lý ticket cùng danh mục. |
| **Tiêu chí chấp nhận** | 1. CRUD bài viết KB hoạt động đúng. 2. Rich text editor hỗ trợ: heading, bold, italic, list, code block, image, link. 3. Phân danh mục cây (category tree, tối đa 3 cấp). 4. Full-text search trong tiêu đề và nội dung. 5. Gợi ý bài viết liên quan khi xử lý ticket (matching by category + tags). 6. Convert ticket → KB article: kế thừa tiêu đề, mô tả, và giải pháp. 7. Thống kê: bài viết phổ biến nhất (view count), bài viết hữu ích (helpful vote). 8. Quản lý phiên bản bài viết (version history). |
| **Ưu tiên** | **S** |

---

## UR-TKT-04: SLA Management

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-TKT-04 |
| **Tên** | Quản lý SLA (Service Level Agreement) |
| **Actor** | Admin, Support Manager |
| **Mô tả** | Cấu hình các chính sách SLA cho ticket hỗ trợ. Mỗi SLA policy gồm: tên, điều kiện áp dụng (theo loại vấn đề, độ ưu tiên, khách hàng VIP), thời gian phản hồi đầu tiên (first response), thời gian xử lý (resolution), giờ làm việc (business hours vs 24/7), và hành động khi vi phạm (escalation). Hệ thống tự động áp SLA phù hợp khi tạo ticket, đếm thời gian theo business hours, và thực hiện escalation khi vi phạm. |
| **Tiền điều kiện** | Admin đã cấu hình SLA policy. |
| **Đầu vào** | Tên SLA (*), điều kiện áp dụng (bộ lọc), first response time (*) (phút/giờ), resolution time (*) (giờ/ngày), business hours (cấu hình lịch làm việc), escalation rules: [% thời gian đã trôi → hành động (notify manager, reassign, v.v.)]. |
| **Đầu ra** | SLA policy được lưu. Ticket mới tự động gán SLA phù hợp. Dashboard SLA hiển thị: % ticket đạt SLA, % vi phạm, thời gian trung bình xử lý. |
| **Tiêu chí chấp nhận** | 1. CRUD SLA policy hoạt động đúng. 2. Tự động gán SLA khi tạo ticket (match theo điều kiện). 3. Đếm thời gian đúng theo business hours (trừ ngoài giờ, weekend, ngày lễ). 4. Tạm dừng SLA timer khi ticket ở trạng thái "Waiting Customer". 5. Escalation tự động khi đạt ngưỡng (75%, 100% thời gian). 6. Dashboard SLA: % đạt, % vi phạm, avg response time, avg resolution time. 7. Báo cáo SLA theo khoảng thời gian, theo nhân viên. |
| **Ưu tiên** | **S** |
