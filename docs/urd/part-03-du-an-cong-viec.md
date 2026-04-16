# Part 03 — Quản lý Dự án & Công việc

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-PROJ-01: Tạo & quản lý dự án

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PROJ-01 |
| **Tên** | Tạo & quản lý dự án (Project Management) |
| **Actor** | Project Manager, Sales Manager |
| **Mô tả** | Hệ thống cho phép tạo dự án triển khai từ hợp đồng đã ký (liên kết UR-SALE-03). Mỗi dự án gồm: tên dự án, mã dự án (tự động), khách hàng, hợp đồng liên kết, PM phụ trách, ngày bắt đầu, ngày kết thúc dự kiến, ngân sách (budget), trạng thái (Planning / In Progress / On Hold / Completed / Cancelled). Dự án được chia thành nhiều milestone (mốc tiến độ), mỗi milestone có tên, ngày dự kiến hoàn thành, % hoàn thành, và giá trị thanh toán tương ứng. Hỗ trợ xem tổng quan dự án dạng danh sách, Kanban theo trạng thái, và dashboard tiến độ. |
| **Tiền điều kiện** | Hợp đồng liên kết đang ở trạng thái Active. Người dùng có quyền tạo dự án. |
| **Đầu vào** | Tên dự án (*), hợp đồng liên kết, khách hàng (*), PM phụ trách (*), ngày bắt đầu (*), ngày kết thúc dự kiến (*), ngân sách (VND), mô tả, danh sách milestone: [tên (*), ngày dự kiến (*), giá trị thanh toán, ghi chú]. |
| **Đầu ra** | Dự án được tạo với mã tự động (PRJ-YYYYMMDD-###). Milestone được ghi nhận. Dashboard tiến độ cập nhật. Nếu tạo từ hợp đồng, thông tin khách hàng và giá trị được kế thừa tự động. |
| **Tiêu chí chấp nhận** | 1. Tạo dự án từ hợp đồng: kế thừa khách hàng, giá trị, thời gian. 2. Tạo dự án độc lập (không bắt buộc liên kết hợp đồng). 3. CRUD milestone hoạt động đúng. 4. Tổng giá trị milestone <= ngân sách dự án (cảnh báo nếu vượt). 5. Chuyển trạng thái dự án ghi log (ngày, người thực hiện, lý do). 6. Danh sách dự án hỗ trợ lọc theo trạng thái, PM, khách hàng, khoảng thời gian. 7. Dashboard hiển thị: tổng dự án theo trạng thái, dự án trễ deadline, dự án sắp kết thúc. |
| **Ưu tiên** | **M** |

---

## UR-PROJ-02: Phân công công việc

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PROJ-02 |
| **Tên** | Phân công công việc (Task Assignment & Tracking) |
| **Actor** | Project Manager, Developer/Member |
| **Mô tả** | Trong mỗi dự án, PM tạo và phân công công việc (task) cho thành viên. Mỗi task gồm: tiêu đề, mô tả, người thực hiện, người kiểm tra (reviewer), milestone thuộc về, độ ưu tiên (Low / Medium / High / Urgent), ngày bắt đầu, deadline, thời lượng ước tính (giờ), trạng thái (To Do / In Progress / Review / Done). Hỗ trợ sub-task (tối đa 2 cấp), đính kèm file, comment/discussion trên task. Hiển thị dạng danh sách, Kanban board, và biểu đồ Gantt (timeline). |
| **Tiền điều kiện** | Dự án đã tồn tại. Thành viên được gán vào dự án. |
| **Đầu vào** | Dự án (*), milestone, tiêu đề task (*), mô tả, người thực hiện (*), reviewer, độ ưu tiên (*), ngày bắt đầu (*), deadline (*), thời lượng ước tính (giờ), tag/label, file đính kèm. |
| **Đầu ra** | Task được tạo, hiển thị trên Kanban board và Gantt chart. Notification gửi đến người được gán. Tiến độ milestone tự động cập nhật dựa trên % task hoàn thành. |
| **Tiêu chí chấp nhận** | 1. CRUD task hoạt động đúng. 2. Kéo thả task trên Kanban board chuyển trạng thái. 3. Gantt chart hiển thị đúng timeline, dependency giữa các task (finish-to-start). 4. Tạo sub-task liên kết với task cha. 5. Comment trên task với mention (@user) gửi notification. 6. Filter task theo người thực hiện, trạng thái, độ ưu tiên, milestone. 7. Cảnh báo task quá hạn (overdue) trên dashboard và notification. 8. Tiến độ milestone = (số task Done / tổng task) x 100%. |
| **Ưu tiên** | **M** |

---

## UR-PROJ-03: KPI & Timesheet

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PROJ-03 |
| **Tên** | KPI & Timesheet (Đánh giá hiệu suất & Chấm công dự án) |
| **Actor** | Project Manager, Member, Sales Manager, HR |
| **Mô tả** | **Timesheet:** Thành viên dự án log thời gian làm việc hàng ngày cho từng task. Mỗi entry gồm: ngày, task, số giờ, mô tả công việc. PM xem tổng hợp timesheet theo dự án, theo thành viên, theo tuần/tháng. So sánh thời gian thực tế vs ước tính để đánh giá hiệu quả. **KPI Framework:** Quản lý chỉ tiêu KPI cho nhân viên theo kỳ (tháng/quý/năm). Mỗi KPI gồm: tên chỉ tiêu, đơn vị đo, mục tiêu (target), kết quả thực tế (actual), trọng số (%). Hệ thống tự động tính điểm KPI = SUM(actual/target x trọng số). Dashboard KPI hiển thị biểu đồ so sánh target vs actual, xếp hạng nhân viên. |
| **Tiền điều kiện** | Dự án và task đã tồn tại (cho Timesheet). Kỳ KPI đã được cấu hình bởi Admin/Manager (cho KPI). |
| **Đầu vào** | **Timesheet:** Ngày (*), task (*), số giờ (*), mô tả công việc. **KPI:** Nhân viên (*), kỳ đánh giá (*), danh sách chỉ tiêu: [tên KPI (*), đơn vị, target (*), actual, trọng số (%) (*)]. |
| **Đầu ra** | **Timesheet:** Log thời gian được lưu. Báo cáo tổng hợp theo dự án/thành viên/thời gian. **KPI:** Điểm KPI tự động tính. Dashboard xếp hạng nhân viên. Báo cáo KPI theo kỳ xuất Excel/PDF. |
| **Tiêu chí chấp nhận** | 1. Log timesheet theo ngày, tối đa 24h/ngày (validate). 2. Không cho log timesheet ngày tương lai. 3. PM phê duyệt timesheet (Pending → Approved / Rejected). 4. Báo cáo: tổng giờ theo dự án, theo thành viên, so sánh estimate vs actual. 5. Tạo kỳ KPI với danh sách chỉ tiêu. 6. Tổng trọng số các KPI trong 1 kỳ = 100% (validate). 7. Điểm KPI = SUM(min(actual/target, 1.2) x trọng số) — cap tại 120%. 8. Dashboard xếp hạng nhân viên theo điểm KPI. 9. Xuất báo cáo KPI ra Excel/PDF. |
| **Ưu tiên** | **M** (Timesheet), **S** (KPI Framework) |

---

## UR-PROJ-04: Quản lý thành viên dự án

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PROJ-04 |
| **Tên** | Quản lý thành viên dự án (Project Team) |
| **Actor** | Project Manager |
| **Mô tả** | PM gán và quản lý thành viên tham gia dự án. Mỗi thành viên có vai trò trong dự án (PM / Tech Lead / Developer / Tester / BA / Designer). Hỗ trợ xem workload (tải công việc) của từng thành viên trên nhiều dự án để tránh quá tải. Hiển thị resource allocation chart. |
| **Tiền điều kiện** | Dự án đã tồn tại. Nhân viên có tài khoản trong hệ thống. |
| **Đầu vào** | Dự án (*), nhân viên (*), vai trò trong dự án (*), % allocation (phần trăm thời gian dành cho dự án), ngày bắt đầu, ngày kết thúc. |
| **Đầu ra** | Thành viên được gán vào dự án. Workload chart cập nhật. Notification gửi đến thành viên. |
| **Tiêu chí chấp nhận** | 1. Gán/gỡ thành viên khỏi dự án. 2. Mỗi thành viên có 1 vai trò trong dự án. 3. Tổng allocation của 1 nhân viên trên tất cả dự án <= 100% (cảnh báo nếu vượt). 4. Xem workload chart: nhân viên nào đang rảnh, ai đang quá tải. 5. Chỉ thành viên trong dự án mới được gán task (validate). |
| **Ưu tiên** | **S** |

---

## UR-PROJ-05: Báo cáo tiến độ dự án

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PROJ-05 |
| **Tên** | Báo cáo tiến độ dự án (Project Status Report) |
| **Actor** | Project Manager, CEO, Sales Manager |
| **Mô tả** | Dashboard tổng quan tiến độ dự án gồm: % hoàn thành tổng thể (tính từ milestone/task), biểu đồ burndown (task remaining vs time), danh sách risk/issue, chi phí thực tế vs ngân sách. PM tạo báo cáo tiến độ tuần/tháng gửi cho stakeholder. Hỗ trợ cảnh báo tự động khi dự án trễ hơn 10% so với kế hoạch. |
| **Tiền điều kiện** | Dự án đang In Progress. Có dữ liệu task và timesheet. |
| **Đầu vào** | Dự án, khoảng thời gian báo cáo, nội dung risk/issue (nhập bởi PM). |
| **Đầu ra** | Dashboard tiến độ realtime. Báo cáo PDF/Excel gửi qua email. Cảnh báo dự án trễ. |
| **Tiêu chí chấp nhận** | 1. Dashboard hiển thị % hoàn thành, burndown chart, milestone timeline. 2. So sánh ngân sách dự kiến vs chi phí thực tế (từ timesheet x đơn giá giờ). 3. Danh sách risk/issue với mức độ (Low/Medium/High/Critical). 4. Cảnh báo tự động khi dự án trễ > 10% kế hoạch. 5. Xuất báo cáo PDF theo template chuẩn. 6. Lọc dashboard theo PM, khách hàng, trạng thái. |
| **Ưu tiên** | **C** |
