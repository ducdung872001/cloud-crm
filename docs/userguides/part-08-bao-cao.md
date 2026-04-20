# Part 08 — Báo cáo

*Phiên bản: Cửa hàng & Spa — Tenant "Viettel Store"*

**Báo cáo** là phân hệ dành chủ yếu cho **quản lý cửa hàng** — nơi bạn có **cái nhìn tổng hợp** về hoạt động kinh doanh qua các bộ biểu đồ và bảng số liệu. Không dùng để nhập liệu mà chỉ để **đọc và phân tích**.

Sidebar có **6 mục con**:

| # | Mục | URL | Nội dung |
|---|-----|-----|----------|
| 1 | **Doanh thu & MRR** | `/crm/ch_report_revenue` | Doanh thu tổng, doanh thu định kỳ (MRR) |
| 2 | **Thành viên** | `/crm/ch_report_members` | Tăng trưởng thành viên, hạng, giữ chân |
| 3 | **Check-in** | `/crm/ch_report_checkin` | Lượt sử dụng dịch vụ, tần suất, giờ cao điểm |
| 4 | **Dịch vụ** | `/crm/ch_report_services` | Hiệu quả từng dịch vụ, gói |
| 5 | **Đối tác** | `/crm/ch_report_partners` | Hoa hồng trả đối tác, nguồn khách |
| 6 | **Tài chính & Công nợ** | `/crm/ch_report_finance` | Dòng tiền, lãi lỗ, công nợ |

Tất cả các báo cáo đều có:

- **Bộ lọc kỳ** — Hôm nay / Tuần / Tháng / Quý / Năm / Tùy chọn.
- **So sánh** — với cùng kỳ trước (để thấy tăng trưởng).
- **Xuất Excel** — tải báo cáo.
- **Lọc theo cơ sở** — nếu có nhiều chi nhánh.

---

## A. Báo cáo Doanh thu & MRR

**URL:** `/crm/ch_report_revenue`

![Báo cáo Doanh thu](./images/part-08-bao-cao/A01-revenue.png)

### A.1. Các chỉ số chính

- **Tổng doanh thu** theo kỳ — tổng tiền thu được từ bán hàng / dịch vụ / gói thành viên.
- **MRR (Monthly Recurring Revenue)** — doanh thu định kỳ từ các gói thành viên đang active.
- **ARPU (Average Revenue Per User)** — doanh thu trung bình trên mỗi thành viên.
- **Tỷ lệ tăng trưởng** — so với kỳ trước, dạng %.
- **Số đơn hàng** — đếm đơn.
- **Giá trị đơn trung bình (AOV)**.

### A.2. Các biểu đồ

- **Doanh thu theo ngày** — biểu đồ cột cho cả kỳ.
- **Doanh thu theo nguồn thu** — pie: bán hàng / dịch vụ / gói thành viên / bán lẻ.
- **Top 10 sản phẩm / dịch vụ** — bar chart xếp giảm dần.
- **Doanh thu theo nhân viên bán** — cho tính hoa hồng / KPI.
- **Doanh thu theo nhóm thành viên** — ai đóng góp nhiều nhất.

### A.3. Cách đọc báo cáo MRR

MRR đặc biệt quan trọng với mô hình **bán gói thành viên**:

- Nếu bạn bán gói 6 tháng giá 12 triệu → MRR = 12tr / 6 = 2tr/tháng.
- Hệ thống tự chia đều doanh thu gói theo số tháng và hiển thị đúng vào tháng tương ứng.
- Chỉ số MRR **ổn định** nghĩa là khách hàng trung thành, cơ sở kinh doanh bền vững.

---

## B. Báo cáo Thành viên

**URL:** `/crm/ch_report_members`

![Báo cáo Thành viên](./images/part-08-bao-cao/A02-members.png)

### B.1. Các chỉ số

- **Tổng thành viên** cuối kỳ.
- **Thành viên mới** — đăng ký trong kỳ.
- **Thành viên đang hoạt động** — có check-in hoặc mua trong N ngày (cấu hình tenant).
- **Thành viên không hoạt động** (churned) — không dùng trong N ngày.
- **Tỷ lệ giữ chân (Retention rate)** — %.
- **Tỷ lệ mất khách (Churn rate)** — %.

### B.2. Các biểu đồ

- **Tăng trưởng thành viên** theo thời gian (line chart).
- **Phân bố theo hạng thẻ** — pie chart (Diamond / Gold / Silver / Basic).
- **Phân bố theo giới tính / độ tuổi / nghề nghiệp**.
- **Nguồn thành viên** — FB / Zalo / Giới thiệu / Quảng cáo / Walk-in.

### B.3. Thành viên sắp hết hạn

Bảng liệt kê các khách có gói **sắp hết hạn** (trong 7/15/30 ngày tới). Từ đây bạn có thể:
- Xuất danh sách → gửi sang chiến dịch marketing nhắc gia hạn (Part 09).
- Gọi điện trực tiếp.

---

## C. Báo cáo Check-in

**URL:** `/crm/ch_report_checkin`

![Báo cáo Check-in](./images/part-08-bao-cao/A03-checkin.png)

### C.1. Các chỉ số

- **Tổng lượt check-in** trong kỳ.
- **Khách duy nhất** — deduplicate theo thành viên.
- **Trung bình lượt / khách**.
- **Tổng lượt theo ngày**.

### C.2. Biểu đồ

- **Heatmap giờ cao điểm** — lưới giờ × ngày trong tuần, đậm nhạt theo mật độ.
- **Top khách trung thành** — ai đến nhiều nhất.
- **Phân bố theo khu vực** — Co-working / Spa / Phòng riêng...
- **Xu hướng theo tuần** — để nhận ra mùa vụ.

### C.3. Ứng dụng

- Biết giờ cao điểm để sắp lịch nhân viên hợp lý.
- Nhận ra khu vực nào đang bị bỏ trống → giảm giá hoặc cải thiện.
- Phát hiện khách không còn đến → đưa vào chiến dịch winback.

---

## D. Báo cáo Dịch vụ

**URL:** `/crm/ch_report_services`

![Báo cáo Dịch vụ](./images/part-08-bao-cao/A04-services.png)

### D.1. Các chỉ số

- **Top dịch vụ bán chạy** — theo doanh thu và theo số lượt.
- **Dịch vụ "chết"** — ít/không ai dùng trong kỳ.
- **Hiệu quả combo** — doanh thu từ khách mua combo vs mua lẻ.
- **Tỷ lệ sử dụng quota** — khách có gói đã dùng bao nhiêu %.
- **Thời gian trung bình giữa các lần dùng**.

### D.2. Gợi ý hành động

Báo cáo này giúp bạn quyết định:
- **Dịch vụ nào cần đẩy mạnh marketing** (đang có nhu cầu).
- **Dịch vụ nào cần tái cơ cấu / loại bỏ** (không có khách).
- **Giá gói có hợp lý không** — nếu tỷ lệ sử dụng quota < 50% → gói quá rộng → nên giảm giá hoặc rút quota.

---

## E. Báo cáo Đối tác

**URL:** `/crm/ch_report_partners`

![Báo cáo Đối tác](./images/part-08-bao-cao/A05-partners.png)

### E.1. Các chỉ số

- **Top đối tác mang về khách** — ai hiệu quả nhất.
- **Doanh thu từ đối tác** — tổng, theo từng đối tác.
- **Hoa hồng đã chi** — tổng, theo đối tác.
- **ROI đối tác** — doanh thu / hoa hồng, cho biết đối tác có lãi không.
- **KOL có tỷ lệ chuyển đổi cao nhất** — họ giới thiệu 10 khách thì bao nhiêu thực sự mua.

### E.2. Ứng dụng

- Biết đối tác nào đáng giữ, đối tác nào "ăn không" (lấy hoa hồng mà không mang khách).
- Phân bổ ngân sách marketing hợp lý.

---

## F. Báo cáo Tài chính & Công nợ

**URL:** `/crm/ch_report_finance`

![Báo cáo Tài chính](./images/part-08-bao-cao/A06-finance.png)

### F.1. Các chỉ số

- **Tổng thu / chi** trong kỳ.
- **Lãi gộp / Lãi ròng** — sau trừ chi phí.
- **Số dư các quỹ** — đầu kỳ và cuối kỳ.
- **Công nợ phải thu** (từ khách) — đầu kỳ vs cuối kỳ.
- **Công nợ phải trả** (cho NCC) — đầu kỳ vs cuối kỳ.

### F.2. Biểu đồ

- **Biểu đồ thu chi theo ngày** — cột đôi (thu màu xanh, chi màu đỏ).
- **Cơ cấu chi** — pie chart các khoản mục chi lớn.
- **Xu hướng công nợ** — line chart.
- **Tỷ lệ thu hồi nợ** — thu hồi được bao nhiêu % so với nợ phát sinh.

---

## G. Xuất báo cáo & Gửi định kỳ

### G.1. Xuất thủ công

Mọi báo cáo đều có nút **Xuất Excel** ở góc phải — tải file `.xlsx` ngay.

### G.2. Gửi email định kỳ

Với các báo cáo quan trọng (Doanh thu, Tài chính), bạn có thể cài **Gửi tự động**:

1. Bấm **🔔 Gửi định kỳ**.
2. Điền:
   - **Danh sách email nhận** (cách nhau bằng dấu phẩy).
   - **Tần suất**: Hàng ngày / Hàng tuần (chọn thứ) / Hàng tháng (chọn ngày).
   - **Giờ gửi**.
   - **Định dạng**: PDF / Excel.
3. **Lưu**. Hệ thống sẽ gửi tự động theo lịch.

---

## H. Đọc báo cáo — Các chỉ số quan trọng nhất cho chủ cửa hàng

Nếu bạn chỉ có 5 phút mỗi sáng, hãy xem 5 chỉ số này:

1. **Doanh thu hôm qua vs hôm qua của tuần trước** — tăng hay giảm?
2. **Số check-in hôm qua** — cơ sở có đông khách không?
3. **MRR tháng hiện tại** — doanh thu định kỳ có bền không?
4. **Công nợ phải thu** — có đang tăng nhanh không (dấu hiệu bán chịu nhiều)?
5. **Top 3 dịch vụ bán chạy tuần này** — để tập trung bổ sung hàng / nhân sự.

---

*Hết Part 08.*
