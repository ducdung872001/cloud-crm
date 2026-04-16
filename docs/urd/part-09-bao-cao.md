# Part 09 — Báo cáo & Dashboard (Reports & Dashboard)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-RPT-01: Dashboard tổng hợp CEO

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RPT-01 |
| **Tên** | Dashboard tổng hợp CEO (Executive Dashboard) |
| **Actor** | CEO, C-Level, Director |
| **Mô tả** | Dashboard tổng quan hiệu quả kinh doanh cho lãnh đạo cấp cao. Gồm các widget: **KPI Cards** — doanh thu tháng/quý/năm, số deal won/lost, giá trị pipeline, số khách hàng mới, tỷ lệ chuyển đổi lead→deal, average deal size, customer acquisition cost (CAC). **Biểu đồ** — doanh thu line chart (12 tháng gần nhất, so sánh YoY), pipeline funnel chart, deal win rate bar chart theo team/nhân viên, revenue by product/service pie chart, customer growth area chart. **Bảng xếp hạng** — Top 10 nhân viên theo doanh thu, Top 10 khách hàng theo giá trị, Top 5 sản phẩm bán chạy. Hỗ trợ bộ lọc global: khoảng thời gian, chi nhánh, phòng ban, nhân viên. Dashboard auto-refresh mỗi 5 phút hoặc refresh thủ công. Hỗ trợ fullscreen mode cho trình chiếu trên TV/monitor. |
| **Tiền điều kiện** | Hệ thống có dữ liệu bán hàng, khách hàng, pipeline ít nhất 1 tháng. Người dùng có quyền xem dashboard CEO. |
| **Đầu vào** | Bộ lọc: khoảng thời gian (*), chi nhánh, phòng ban, nhân viên. |
| **Đầu ra** | Dashboard realtime với KPI cards, biểu đồ, bảng xếp hạng. Dữ liệu cập nhật theo bộ lọc. |
| **Tiêu chí chấp nhận** | 1. KPI cards hiển thị giá trị chính xác so với dữ liệu gốc. 2. Doanh thu = tổng hoá đơn đã thanh toán (không tính Draft/Cancelled). 3. So sánh YoY: % tăng/giảm so với cùng kỳ năm trước. 4. Pipeline funnel: hiển thị đúng số deal và giá trị mỗi stage. 5. Win rate = Won / (Won + Lost) x 100%, tính đúng theo team/nhân viên. 6. Bộ lọc global áp dụng đồng thời cho tất cả widget. 7. Auto-refresh mỗi 5 phút (configurable). 8. Fullscreen mode hoạt động. 9. Load dashboard < 3 giây (với dữ liệu 1 năm, 10K records). 10. Responsive: hiển thị tốt trên desktop (1920px) và tablet (1024px). |
| **Ưu tiên** | **M** |

---

## UR-RPT-02: Báo cáo doanh thu & pipeline

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RPT-02 |
| **Tên** | Báo cáo doanh thu & pipeline (Revenue & Pipeline Report) |
| **Actor** | CEO, Sales Manager, Finance |
| **Mô tả** | Hệ thống báo cáo chi tiết về doanh thu và pipeline bán hàng. **Báo cáo doanh thu:** doanh thu theo tháng/quý/năm, theo sản phẩm/dịch vụ, theo nhân viên, theo kênh bán hàng, theo chi nhánh. So sánh actual vs target (mục tiêu KPI). Doanh thu recurring vs one-time. **Báo cáo pipeline:** giá trị pipeline theo stage, weighted pipeline (giá trị x xác suất thắng), pipeline velocity (tốc độ chuyển đổi qua mỗi stage), forecast doanh thu tháng tới (dựa trên pipeline hiện tại + historical win rate). **Báo cáo deal:** danh sách deal won/lost, lý do thắng/thua (phân tích), average sales cycle (số ngày từ lead→won), deal source analysis (nguồn nào hiệu quả nhất). Tất cả báo cáo hỗ trợ drill-down (click vào số liệu để xem chi tiết từng record). |
| **Tiền điều kiện** | Có dữ liệu deal và hoá đơn trong hệ thống. |
| **Đầu vào** | Loại báo cáo (*), khoảng thời gian (*), bộ lọc: nhân viên, team, sản phẩm, khách hàng, chi nhánh, deal source. |
| **Đầu ra** | Báo cáo dạng bảng + biểu đồ. Drill-down đến từng record. Xuất Excel/PDF. |
| **Tiêu chí chấp nhận** | 1. Doanh thu theo tháng khớp với tổng hoá đơn paid. 2. Doanh thu theo nhân viên = tổng deal won của nhân viên đó. 3. Actual vs Target: hiển thị % đạt mục tiêu, color-coded (xanh >= 100%, vàng 70-99%, đỏ < 70%). 4. Weighted pipeline = SUM(deal value x stage probability). 5. Forecast tháng tới = weighted pipeline + recurring revenue. 6. Average sales cycle tính đúng (ngày tạo lead → ngày won). 7. Drill-down: click doanh thu → danh sách hoá đơn/deal chi tiết. 8. Lọc đa chiều (nhiều filter đồng thời). 9. Xuất Excel (giữ format bảng) và PDF (có header/footer công ty). 10. Lưu bộ lọc yêu thích (saved report). |
| **Ưu tiên** | **M** |

---

## UR-RPT-03: Báo cáo khách hàng & team

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RPT-03 |
| **Tên** | Báo cáo khách hàng & team (Customer & Team Analytics) |
| **Actor** | CEO, Sales Manager, Marketing |
| **Mô tả** | **Báo cáo khách hàng:** phân tích customer base — tổng khách hàng, khách hàng mới theo tháng, customer lifetime value (CLV), customer churn rate, phân bố khách hàng theo ngành/quy mô/khu vực, top khách hàng theo doanh thu, khách hàng at-risk (không giao dịch > 90 ngày), customer satisfaction (từ feedback/survey). **Báo cáo team:** hiệu suất đội ngũ bán hàng — số deal xử lý, doanh thu đạt được, average deal size, win rate, average response time (lead → first contact), activities (calls, emails, meetings) theo nhân viên/team, so sánh giữa các team, leaderboard tháng/quý. Hỗ trợ schedule report: tự động gửi báo cáo qua email hàng tuần/tháng cho người nhận cấu hình. |
| **Tiền điều kiện** | Có dữ liệu khách hàng và hoạt động bán hàng trong hệ thống. |
| **Đầu vào** | Loại báo cáo (*), khoảng thời gian (*), bộ lọc: team, nhân viên, phân khúc khách hàng, ngành, khu vực. Cấu hình schedule report: tần suất, người nhận email. |
| **Đầu ra** | Báo cáo dạng bảng + biểu đồ. Leaderboard. Scheduled email report (PDF đính kèm). |
| **Tiêu chí chấp nhận** | 1. Tổng khách hàng, khách mới, churn rate tính đúng. 2. CLV = tổng doanh thu từ khách hàng kể từ ngày đầu tiên. 3. Churn rate = (khách hàng mất / tổng KH đầu kỳ) x 100%. 4. Khách hàng at-risk: không giao dịch > 90 ngày (configurable), highlight đỏ. 5. Phân bố khách hàng theo ngành/quy mô hiển thị pie/bar chart. 6. Team leaderboard: ranking theo doanh thu, deal count, win rate. 7. Activities report: tổng calls, emails, meetings theo nhân viên. 8. Schedule report: gửi email đúng lịch (weekly Monday 8AM, monthly 1st 8AM). 9. Drill-down đến danh sách khách hàng / deal cụ thể. 10. Xuất Excel/PDF. |
| **Ưu tiên** | **S** |
