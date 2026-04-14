# Part 08 — Báo cáo

## Phạm vi

Phân hệ **Báo cáo** cung cấp bộ báo cáo phân tích kinh doanh, phục vụ cho quản lý ra quyết định. Đây là phân hệ chỉ-đọc (read-only) — không nhập liệu. Bao gồm 6 báo cáo chính: Doanh thu & MRR, Thành viên, Check-in, Dịch vụ, Đối tác, Tài chính & Công nợ.

**Actors chính:** Branch Manager (chính), Tenant Admin, Marketer, Accountant.

**Yêu cầu chung cho mọi báo cáo:** filter kỳ + so sánh kỳ trước + xuất Excel + có thể gửi định kỳ qua email.

---

## A. Yêu cầu chung

### UR-REPORT-01 — Khung báo cáo chuẩn

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-REPORT-01 |
| **Tên** | Cấu trúc chung cho mọi báo cáo |
| **Actor** | Mọi báo cáo viewer |
| **Mô tả** | Mọi báo cáo phải có khung chung: bộ lọc kỳ, so sánh kỳ trước, xuất file, gửi định kỳ. |
| **Tiêu chí chấp nhận** | 1. **Filter kỳ**: Hôm nay / Tuần này / Tháng này / Quý / Năm / Tùy chọn (date range).<br>2. **So sánh**: với cùng kỳ trước (tỷ lệ tăng/giảm %, mũi tên ↑↓ màu).<br>3. **Filter cơ sở**: nếu tenant nhiều cơ sở.<br>4. **Xuất Excel**: nút trên cùng, tải `.xlsx`.<br>5. **Gửi định kỳ**: cấu hình lịch (hằng ngày/tuần/tháng) + danh sách email nhận.<br>6. Số liệu được tính từ DB thật, không hardcode.<br>7. Báo cáo load ≤ 5 giây với khoảng dữ liệu 1 tháng. |
| **Mức ưu tiên** | **M** |

---

## B. Báo cáo Doanh thu & MRR

### UR-REPORT-02 — Báo cáo Doanh thu tổng hợp

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-REPORT-02 |
| **Tên** | Doanh thu tổng + chỉ số định kỳ |
| **Actor** | Branch Manager, Tenant Admin |
| **Mô tả** | Báo cáo doanh thu với các chỉ số chính: tổng doanh thu, MRR, ARPU, AOV, số đơn, tỷ lệ tăng trưởng. |
| **Tiêu chí chấp nhận** | 1. **Tổng doanh thu** theo kỳ (từ POS + bán gói + bán lẻ).<br>2. **MRR** = doanh thu định kỳ tháng (từ gói thành viên có thời hạn — chia đều theo tháng).<br>3. **ARPU** = Doanh thu / số khách trong kỳ.<br>4. **AOV** = Doanh thu / số đơn.<br>5. **Tăng trưởng** so kỳ trước (%).<br>6. Biểu đồ doanh thu theo ngày (cột).<br>7. Biểu đồ doanh thu theo nguồn (pie: bán hàng/dịch vụ/gói).<br>8. Top 10 sản phẩm/dịch vụ.<br>9. Doanh thu theo nhân viên.<br>10. Doanh thu theo nhóm khách. |
| **Mức ưu tiên** | **M** |

---

## C. Báo cáo Thành viên

### UR-REPORT-03 — Báo cáo tăng trưởng và giữ chân thành viên

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-REPORT-03 |
| **Tên** | Phân tích base thành viên |
| **Actor** | Branch Manager, Marketer |
| **Mô tả** | Báo cáo các chỉ số về thành viên: tổng số, mới, active, churn, retention, phân bố. |
| **Tiêu chí chấp nhận** | 1. **Tổng thành viên** cuối kỳ.<br>2. **Thành viên mới** đăng ký trong kỳ.<br>3. **Active** = có check-in/mua trong N ngày (cấu hình tenant).<br>4. **Churned** = không hoạt động > N ngày.<br>5. **Retention rate** + **Churn rate** (%).<br>6. Biểu đồ tăng trưởng theo thời gian.<br>7. Phân bố theo: hạng thẻ, giới tính, độ tuổi, nghề nghiệp, nguồn.<br>8. **Sắp hết hạn** (7/15/30 ngày tới) — list khách + xuất nhanh sang chiến dịch MKT (Part 09). |
| **Mức ưu tiên** | **M** |

---

## D. Báo cáo Check-in

### UR-REPORT-04 — Phân tích lưu lượng

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-REPORT-04 |
| **Tên** | Báo cáo check-in / lưu lượng khách |
| **Actor** | Branch Manager |
| **Mô tả** | Số lượt check-in, khách duy nhất, heatmap giờ cao điểm, top khách trung thành. |
| **Tiêu chí chấp nhận** | 1. **Tổng lượt check-in** trong kỳ.<br>2. **Khách duy nhất** (deduplicated).<br>3. **TB lượt/khách**.<br>4. **Heatmap** giờ × ngày trong tuần.<br>5. **Top khách** theo số lượt.<br>6. **Phân bố theo khu vực** (Co-working/Spa/Phòng riêng).<br>7. **Xu hướng theo tuần** (line chart). |
| **Mức ưu tiên** | **S** |

---

## E. Báo cáo Dịch vụ

### UR-REPORT-05 — Hiệu quả từng dịch vụ/sản phẩm

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-REPORT-05 |
| **Tên** | Phân tích hiệu quả dịch vụ |
| **Actor** | Branch Manager, Tenant Admin |
| **Mô tả** | Top dịch vụ bán chạy, dịch vụ "chết", hiệu quả combo, tỷ lệ sử dụng quota gói. |
| **Tiêu chí chấp nhận** | 1. **Top dịch vụ** theo doanh thu và theo lượt.<br>2. **Dịch vụ ít/không dùng** trong kỳ.<br>3. **Combo** vs **lẻ** — so sánh doanh thu và margin.<br>4. **Tỷ lệ sử dụng quota** theo từng gói thành viên.<br>5. **Thời gian TB giữa lần dùng** của một khách. |
| **Mức ưu tiên** | **S** |

---

## F. Báo cáo Đối tác

### UR-REPORT-06 — ROI đối tác

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-REPORT-06 |
| **Tên** | Đo lường hiệu quả các đối tác giới thiệu |
| **Actor** | Marketer, Branch Manager |
| **Mô tả** | Top đối tác, doanh thu mang về, hoa hồng đã chi, ROI = doanh thu/hoa hồng. |
| **Tiêu chí chấp nhận** | 1. **Top đối tác** theo số khách mang về.<br>2. **Doanh thu / đối tác**.<br>3. **Hoa hồng đã chi / đối tác**.<br>4. **ROI** từng đối tác.<br>5. **Tỷ lệ chuyển đổi**: số khách giới thiệu thực sự mua / tổng giới thiệu. |
| **Mức ưu tiên** | **S** |

---

## G. Báo cáo Tài chính & Công nợ

### UR-REPORT-07 — Báo cáo dòng tiền và P&L cơ bản

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-REPORT-07 |
| **Tên** | Báo cáo tài chính cơ bản |
| **Actor** | Branch Manager, Accountant, Tenant Admin |
| **Mô tả** | Tổng thu/chi, lãi gộp/ròng, số dư các quỹ đầu/cuối kỳ, công nợ phải thu/trả đầu/cuối kỳ. |
| **Tiêu chí chấp nhận** | 1. **Tổng thu / chi** kỳ.<br>2. **Lãi gộp** (Doanh thu − Giá vốn).<br>3. **Lãi ròng** (Lãi gộp − chi phí).<br>4. **Số dư quỹ** đầu vs cuối kỳ.<br>5. **Công nợ phải thu/phải trả** đầu vs cuối kỳ.<br>6. Biểu đồ thu/chi theo ngày (cột đôi).<br>7. Pie cơ cấu chi.<br>8. **Tỷ lệ thu hồi nợ** trong kỳ. |
| **Mức ưu tiên** | **M** |

---

## H. Tự động hóa báo cáo

### UR-REPORT-08 — Gửi báo cáo định kỳ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-REPORT-08 |
| **Tên** | Schedule gửi báo cáo qua email |
| **Actor** | Branch Manager, Tenant Admin |
| **Mô tả** | Cho phép cấu hình gửi tự động báo cáo (PDF hoặc Excel) tới danh sách email theo lịch (ngày/tuần/tháng). |
| **Đầu vào** | • Báo cáo cần gửi (M)<br>• Danh sách email (M, cách nhau dấu phẩy)<br>• Tần suất (M, Hằng ngày / Hằng tuần + thứ / Hằng tháng + ngày)<br>• Giờ gửi (M)<br>• Định dạng (M, PDF / Excel) |
| **Tiêu chí chấp nhận** | 1. Sau khi cấu hình → hệ thống chạy job tự động.<br>2. Gửi xong có log: thời gian, ai nhận, thành công/thất bại.<br>3. Có thể bật/tắt từng schedule. |
| **Mức ưu tiên** | **C** |

---

## Tóm tắt yêu cầu Part 08

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-REPORT-01 | Khung báo cáo chuẩn | M |
| UR-REPORT-02 | Doanh thu & MRR | M |
| UR-REPORT-03 | Thành viên | M |
| UR-REPORT-04 | Check-in | S |
| UR-REPORT-05 | Dịch vụ | S |
| UR-REPORT-06 | Đối tác | S |
| UR-REPORT-07 | Tài chính & Công nợ | M |
| UR-REPORT-08 | Gửi báo cáo định kỳ | C |

**Tổng:** 8 yêu cầu — 4 Must, 3 Should, 1 Could.

---

*Hết Part 08.*
