# Part 11 — Nhân sự & KPI (HR & KPI)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-HR-01: Quản lý nhân viên & phòng ban

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-HR-01 |
| **Tên** | Quản lý nhân viên & phòng ban (Employee & Department Management) |
| **Actor** | HR, Admin, Manager, CEO |
| **Mô tả** | Quản lý toàn bộ thông tin nhân viên và cơ cấu tổ chức. **Nhân viên:** mã nhân viên (tự động), họ tên, email công ty, số điện thoại, ngày sinh, giới tính, CCCD/CMND, địa chỉ, ảnh đại diện, phòng ban, chức vụ, cấp quản lý trực tiếp (manager), ngày vào làm, loại hợp đồng (Thử việc / Chính thức / Part-time / Thực tập), trạng thái (Active / On Leave / Resigned / Terminated), tài khoản ngân hàng, mã số thuế cá nhân, người phụ thuộc, bảo hiểm, hồ sơ đính kèm (CV, hợp đồng, bằng cấp). **Phòng ban:** tên, mã, cây tổ chức phân cấp (company → division → department → team), trưởng phòng, số nhân viên, mô tả chức năng. **Sơ đồ tổ chức:** hiển thị cây phân cấp visual (org chart), click vào node xem thông tin phòng ban/nhân viên. |
| **Tiền điều kiện** | Admin đã thiết lập cơ cấu phòng ban. |
| **Đầu vào** | **Nhân viên:** Họ tên (*), email (*), phòng ban (*), chức vụ (*), ngày vào làm (*), loại hợp đồng (*), thông tin cá nhân, hồ sơ đính kèm. **Phòng ban:** Tên (*), mã (*), phòng cha, trưởng phòng. |
| **Đầu ra** | Hồ sơ nhân viên được tạo với mã tự động. Cây tổ chức hiển thị chính xác. Danh sách nhân viên theo phòng ban. Sơ đồ tổ chức visual. |
| **Tiêu chí chấp nhận** | 1. CRUD nhân viên với đầy đủ thông tin. 2. CRUD phòng ban, hỗ trợ cây phân cấp tối đa 5 level. 3. Gán nhân viên vào phòng ban, thay đổi phòng ban (lưu lịch sử). 4. Sơ đồ tổ chức visual (org chart) hiển thị chính xác. 5. Tìm kiếm nhân viên theo tên, email, mã, phòng ban. 6. Lọc theo phòng ban, chức vụ, trạng thái, loại hợp đồng. 7. Upload hồ sơ đính kèm (tối đa 10 file, 10MB/file). 8. Lịch sử thay đổi nhân viên (phòng ban, chức vụ, trạng thái) — audit log. 9. Import nhân viên từ Excel. 10. Xuất danh sách nhân viên ra Excel. |
| **Ưu tiên** | **M** |

---

## UR-HR-02: KPI Framework

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-HR-02 |
| **Tên** | KPI Framework (Key Performance Indicator Management) |
| **Actor** | CEO, Manager, HR, Employee |
| **Mô tả** | Hệ thống quản lý KPI từ cấp công ty đến cá nhân. **KPI công ty:** các chỉ tiêu chiến lược (doanh thu năm, số khách hàng mới, customer satisfaction score). **KPI phòng ban:** phân bổ từ KPI công ty xuống phòng ban, trưởng phòng phân bổ tiếp cho nhân viên. **KPI cá nhân:** gán cho từng nhân viên theo tháng/quý, gồm: tên KPI, đơn vị đo (số, %, tiền), mục tiêu (target), trọng số (weight %), nguồn dữ liệu (manual input / auto from CRM data), ngưỡng đánh giá (Xuất sắc >= 120%, Đạt 80-119%, Chưa đạt < 80%). KPI tự động thu thập từ CRM: doanh thu (từ deal won), số lead mới (từ module Lead), số cuộc gọi (từ UR-COM-01), số meeting (từ calendar), response time (từ ticket). Đánh giá KPI: cuối kỳ, manager review kết quả, nhân viên tự đánh giá, manager chấm điểm cuối cùng, tính tổng điểm = SUM(result x weight). |
| **Tiền điều kiện** | Cơ cấu phòng ban và nhân viên đã có (UR-HR-01). Kỳ đánh giá đã được cấu hình. |
| **Đầu vào** | **Cấu hình KPI:** Tên KPI (*), đơn vị (*), target (*), weight (*), nguồn dữ liệu, ngưỡng đánh giá. **Gán KPI:** Nhân viên (*), kỳ đánh giá (*), danh sách KPI (*). **Đánh giá:** Kết quả thực tế (auto/manual), self-review, manager review, điểm cuối cùng. |
| **Đầu ra** | Bảng KPI theo nhân viên/phòng ban/công ty. Kết quả đánh giá cuối kỳ. Báo cáo KPI: % đạt mục tiêu, so sánh giữa các kỳ, ranking nhân viên. |
| **Tiêu chí chấp nhận** | 1. Tạo KPI template (bộ KPI mẫu) cho từng vị trí. 2. Gán KPI cho nhân viên theo tháng/quý. 3. Tổng weight = 100% (validate). 4. KPI tự động thu thập dữ liệu từ CRM (deal, lead, call, ticket) chính xác. 5. KPI manual: nhân viên nhập, manager xác nhận. 6. Self-review: nhân viên tự đánh giá, viết nhận xét. 7. Manager review: chấm điểm, nhận xét, approve. 8. Tổng điểm = SUM(actual/target x weight), chuẩn hoá thang 100. 9. Báo cáo KPI: ranking, trend theo kỳ, so sánh phòng ban. 10. Notification nhắc nhở: gần hết kỳ đánh giá, nhân viên chưa self-review. |
| **Ưu tiên** | **S** |

---

## UR-HR-03: Chấm công & ca làm việc

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-HR-03 |
| **Tên** | Chấm công & ca làm việc (Attendance & Shift Management) |
| **Actor** | Employee, HR, Manager |
| **Mô tả** | Quản lý chấm công và ca làm việc. **Ca làm việc:** tạo các ca (Sáng: 8:00-12:00, Chiều: 13:00-17:00, Full: 8:00-17:00, Đêm: 22:00-6:00), gán ca cho nhân viên theo lịch (tuần/tháng). **Chấm công:** check-in/check-out qua ứng dụng web (GPS location, WiFi IP), máy chấm công (tích hợp API), hoặc QR code. Mỗi bản ghi chấm công: nhân viên, ngày, giờ check-in, giờ check-out, ca làm việc, trạng thái (Đúng giờ / Đi muộn / Về sớm / Vắng mặt / Nghỉ phép), thời gian làm thực tế, overtime. **Nghỉ phép:** nhân viên tạo đơn xin nghỉ (loại nghỉ: Phép năm / Ốm / Không lương / Đặc biệt), manager phê duyệt, trừ số ngày phép tự động. Bảng chấm công tháng: tổng hợp theo nhân viên, phòng ban (số ngày làm, đi muộn, nghỉ, overtime). |
| **Tiền điều kiện** | Nhân viên đã có trong hệ thống (UR-HR-01). Ca làm việc đã được cấu hình. |
| **Đầu vào** | **Ca làm việc:** Tên ca (*), giờ bắt đầu (*), giờ kết thúc (*), phút cho phép trễ. **Chấm công:** Check-in/check-out (tự động lấy thời gian, GPS/IP). **Nghỉ phép:** Loại nghỉ (*), ngày bắt đầu (*), ngày kết thúc (*), lý do (*). |
| **Đầu ra** | Bảng chấm công tháng theo nhân viên/phòng ban. Số ngày phép còn lại. Báo cáo đi muộn/về sớm. Bảng tổng hợp overtime. |
| **Tiêu chí chấp nhận** | 1. CRUD ca làm việc, gán ca cho nhân viên. 2. Check-in/check-out qua web (GPS tracking, validate bán kính cho phép). 3. Tích hợp máy chấm công qua API (đồng bộ dữ liệu). 4. Tự động phát hiện: đi muộn (check-in > giờ bắt đầu + phút cho phép), về sớm (check-out < giờ kết thúc). 5. Đơn xin nghỉ phép: tạo, phê duyệt BPM, trừ phép tự động. 6. Số ngày phép: tính theo loại hợp đồng, thâm niên, cộng dồn theo quy định. 7. Bảng chấm công tháng: hiển thị calendar view + table view. 8. Overtime: tự động tính giờ OT (ngoài ca, ngày nghỉ, ngày lễ). 9. Xuất bảng chấm công ra Excel (format cho kế toán). 10. Notification: nhắc check-in, thông báo đi muộn cho manager. |
| **Ưu tiên** | **C** |
