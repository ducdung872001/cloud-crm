# Test Cases — Reborn Tech CRM (B2B)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## TC-CUS: Quản lý Khách hàng & Liên hệ

| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| TC-CUS-01 | Tạo khách hàng doanh nghiệp với đầy đủ trường bắt buộc (tên, ngành nghề, nhân viên phụ trách). | Khách hàng được tạo thành công, mã CUS-YYYYMMDD-### tự sinh, hiển thị trong danh sách. | pending |
| TC-CUS-02 | Tạo khách hàng trùng mã số thuế với khách hàng đã tồn tại. | Hệ thống hiển thị lỗi "Mã số thuế đã tồn tại", không cho lưu. | pending |
| TC-CUS-03 | Tạo liên hệ gắn với khách hàng, đánh dấu Decision Maker. Tạo thêm liên hệ thứ 2 cũng đánh dấu Decision Maker. | Liên hệ 1 tạo thành công. Liên hệ 2 hiển thị cảnh báo "Khách hàng đã có Primary Decision Maker". | pending |
| TC-CUS-04 | Tạo đối tác loại Referral, hoa hồng 10%. Tạo cơ hội 500 triệu gán đối tác này. Chốt Closed Won. | Hoa hồng tự động tính = 50 triệu. Hiển thị trong dashboard đối tác. | pending |
| TC-CUS-05 | Thêm tương tác (gọi điện, ghi chú) cho khách hàng. Gửi email chiến dịch marketing. | Timeline hiển thị: tương tác thủ công + log tự động gửi email. Sắp xếp mới nhất trước. | pending |

---

## TC-SALE: Quy trình Bán hàng

| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| TC-SALE-01 | Tạo cơ hội bán hàng, kéo thả qua các giai đoạn trên Kanban: Qualification → Needs Analysis → Proposal → Negotiation → Closed Won. | Mỗi lần chuyển giai đoạn ghi log (ngày, người thực hiện). Kanban cập nhật đúng. Cơ hội hiển thị ở Closed Won. | pending |
| TC-SALE-02 | Tạo báo giá từ cơ hội với 3 line items, chiết khấu 5%, VAT 10%. Xuất PDF. Gửi email. | Tổng tiền tính đúng công thức. PDF sinh đầy đủ. Email gửi thành công với PDF đính kèm. | pending |
| TC-SALE-03 | Chấp nhận báo giá → Tạo hợp đồng. Gửi phê duyệt 2 cấp (Manager → Director). | Hợp đồng kế thừa thông tin từ báo giá. Phê duyệt cấp 1 chuyển sang cấp 2. Sau cấp 2 duyệt, hợp đồng Active. | pending |
| TC-SALE-04 | Từ hợp đồng Active, tạo hoá đơn chia 3 đợt. Ghi nhận thanh toán đợt 1. Để quá hạn đợt 2. | Hoá đơn tạo 3 đợt đúng giá trị. Thanh toán đợt 1 → Partial. Đợt 2 quá hạn → Overdue + email nhắc nợ tự động. | pending |
| TC-SALE-05 | Xem Pipeline Dashboard: kiểm tra funnel chart, forecast, conversion rate. Lọc theo nhân viên A. | Funnel hiển thị đúng số cơ hội mỗi giai đoạn. Forecast = SUM(value x probability). Lọc chỉ hiển thị data nhân viên A. | pending |

---

## TC-PROJ: Quản lý Dự án

| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| TC-PROJ-01 | Tạo dự án từ hợp đồng Active. Thêm milestone, task, gán thành viên. | Dự án liên kết hợp đồng. Milestone/task tạo thành công. Thành viên nhận notification. | pending |
| TC-PROJ-02 | Cập nhật tiến độ task (0% → 50% → 100%). Kiểm tra milestone progress và Gantt chart. | Milestone progress tự động tính từ task con. Gantt chart hiển thị đúng timeline và phần trăm. | pending |
| TC-PROJ-03 | Ghi timesheet cho task. Xem báo cáo effort theo dự án, theo thành viên. | Timesheet lưu thành công. Báo cáo tổng hợp giờ làm đúng theo dự án và theo người. | pending |

---

## TC-TKT: Hỗ trợ & Bảo hành (Ticketing)

| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| TC-TKT-01 | Tạo ticket hỗ trợ từ khách hàng, gán mức ưu tiên High, SLA phản hồi 4h. | Ticket tạo thành công. Countdown SLA hiển thị. Notification gửi đến nhân viên hỗ trợ. | pending |
| TC-TKT-02 | Để ticket vượt SLA phản hồi (quá 4h). Kiểm tra escalation tự động. | Ticket chuyển trạng thái Escalated. Gửi notification đến Manager. Ghi log vi phạm SLA. | pending |
| TC-TKT-03 | Tạo ticket bảo hành, kiểm tra thời hạn bảo hành từ hợp đồng. Trường hợp hết bảo hành. | Ticket bảo hành: nếu còn hạn → xử lý bình thường. Nếu hết hạn → cảnh báo "Hết bảo hành", yêu cầu xác nhận tính phí. | pending |

---

## TC-BPM: BPM Workflow

| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| TC-BPM-01 | Admin thiết kế quy trình phê duyệt hợp đồng 3 cấp (Sales → Manager → Director). Gán cho module Hợp đồng. | Quy trình lưu thành công. Khi tạo hợp đồng, tự động trigger luồng phê duyệt 3 cấp. | pending |
| TC-BPM-02 | Trong luồng phê duyệt: cấp 1 duyệt, cấp 2 từ chối với lý do. | Cấp 1 duyệt → chuyển cấp 2. Cấp 2 từ chối → hợp đồng về Draft, ghi lý do, notification cho người tạo. | pending |
| TC-BPM-03 | Tạo quy trình tự động: khi cơ hội chuyển sang Closed Won → tự động tạo hợp đồng Draft + gửi email chúc mừng. | Chuyển giai đoạn Closed Won → hợp đồng Draft tự tạo với thông tin từ cơ hội → email gửi đến khách hàng. | pending |

---

## TC-AUTH: Xác thực & Phân quyền

| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| TC-AUTH-01 | Đăng nhập với tài khoản Sales. Truy cập module Khách hàng (có quyền) và module Cài đặt (không có quyền). | Khách hàng: truy cập bình thường. Cài đặt: hiển thị "Bạn không có quyền truy cập" hoặc ẩn menu. | pending |
| TC-AUTH-02 | Sales tạo khách hàng → chỉ thấy khách hàng mình phụ trách. Manager cùng phòng → thấy tất cả khách hàng phòng mình. Director → thấy toàn bộ. | Phân quyền theo cấp: nhân viên (own), trưởng phòng (department), giám đốc (all). Dữ liệu hiển thị đúng scope. | pending |
| TC-AUTH-03 | Admin tạo role mới "Support Lead" với quyền: xem ticket (all), sửa ticket (department), không xóa. Gán role cho user. | Role tạo thành công. User với role Support Lead: xem tất cả ticket, sửa ticket phòng mình, nút Xóa bị ẩn/disable. | pending |
