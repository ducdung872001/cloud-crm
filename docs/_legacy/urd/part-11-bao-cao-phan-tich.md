# Part 11 — Báo cáo & Phân tích

## 1. Phạm vi phân hệ

Phân hệ Báo cáo & Phân tích cung cấp góc nhìn tổng hợp và chuyên sâu cho dữ liệu vận hành của Retail CRM, bao gồm: báo cáo doanh thu theo nhiều chiều, báo cáo khách hàng, phân tích khách hàng (RFM/Cohort), báo cáo tồn kho, báo cáo khuyến mãi/marketing, báo cáo tổng hợp đa phân hệ và dashboard KPI tuỳ chỉnh. Các route tiêu biểu: `/report_revenue`, `/report_customer`, `/customer_analysis`, `/inventory_report`, `/promotional_report`, `/marketing_report`, `/report_common`.

## 2. Actor liên quan

- **Store Manager** — xem báo cáo phạm vi 1 cơ sở
- **Chain Manager** — xem báo cáo phạm vi nhiều cơ sở trong chuỗi
- **Accountant** — chốt số liệu doanh thu, đối chiếu thuế, công nợ
- **Founder / C-level** — xem dashboard KPI tổng hợp toàn tenant
- **System** — job sinh báo cáo định kỳ, gửi email theo lịch

## 3. Yêu cầu chi tiết

### UR-REP-01 — Dashboard doanh thu theo kỳ

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-01 |
| **Tên** | Báo cáo doanh thu theo kỳ/cơ sở/nhân viên |
| **Actor** | Store Manager, Chain Manager, Accountant |
| **Mô tả** | Trang `/report_revenue` cho phép filter theo khoảng thời gian (hôm nay, tuần, tháng, tuỳ chọn), cơ sở (single/multi), nhân viên, kênh bán. Hiển thị bảng doanh thu gộp (gross), giảm giá, doanh thu thuần (net), số đơn, AOV; kèm biểu đồ cột theo ngày/tuần/tháng. |
| **Tiền điều kiện** | Đơn hàng đã được ghi nhận ở phân hệ POS/Order |
| **Đầu vào** | `fromDate`, `toDate`, `branchIds[]`, `staffIds[]`, `channels[]` |
| **Đầu ra** | Bảng tổng hợp + chart + tổng cuối trang |
| **Tiêu chí chấp nhận** | - Dữ liệu khớp với tổng đơn hàng đã chốt trong kỳ<br>- Hỗ trợ group by: ngày / tuần / tháng / nhân viên / cơ sở<br>- Thời gian render ≤ 5s với ≤ 100k đơn |
| **Ưu tiên** | **M** |

### UR-REP-02 — Top sản phẩm bán chạy

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-02 |
| **Tên** | Báo cáo top sản phẩm theo doanh số / số lượng / lợi nhuận |
| **Actor** | Store Manager, Chain Manager |
| **Mô tả** | Phần trong `/report_revenue` hoặc tab riêng cho xếp hạng top 10/50/100 sản phẩm bán chạy theo 3 tiêu chí: doanh thu, số lượng bán, lợi nhuận gộp. Hỗ trợ lọc theo nhóm SP, thương hiệu, cơ sở. |
| **Đầu vào** | Khoảng thời gian, tiêu chí sắp xếp, filter SP |
| **Đầu ra** | Bảng xếp hạng + % đóng góp trên tổng |
| **Tiêu chí chấp nhận** | - Có cột % contribution, cộng dồn Pareto<br>- Click vào SP mở trang chi tiết SP + lịch sử bán |
| **Ưu tiên** | **S** |

### UR-REP-03 — Báo cáo khách hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-03 |
| **Tên** | Báo cáo số lượng khách mới, khách quay lại, khách ngừng mua |
| **Actor** | Store Manager, Marketer |
| **Mô tả** | Trang `/report_customer` thống kê số khách mới (first-order trong kỳ), khách quay lại (≥ 2 đơn), khách churn (không mua ≥ 90 ngày). Hiển thị xu hướng theo tháng và chia theo cơ sở. |
| **Đầu vào** | Khoảng thời gian, ngưỡng churn (mặc định 90 ngày) |
| **Đầu ra** | KPI tile + line chart 12 tháng |
| **Tiêu chí chấp nhận** | - Định nghĩa "khách mới / quay lại / churn" có tooltip giải thích<br>- Drill-down từ KPI xuống danh sách khách cụ thể |
| **Ưu tiên** | **S** |

### UR-REP-04 — Phân tích RFM

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-04 |
| **Tên** | Phân tích khách hàng theo mô hình RFM |
| **Actor** | Marketer, Store Manager |
| **Mô tả** | Trang `/customer_analysis` tính điểm Recency, Frequency, Monetary cho từng khách (thang 1–5), nhóm tự động vào các segment: Champions, Loyal, Potential, At Risk, Lost. Có thể xuất danh sách từng segment để chạy chiến dịch marketing. |
| **Tiền điều kiện** | Tenant có ≥ 3 tháng dữ liệu đơn hàng |
| **Đầu vào** | Kỳ tính (mặc định 12 tháng gần nhất) |
| **Đầu ra** | Bảng heatmap RFM + danh sách khách mỗi segment |
| **Tiêu chí chấp nhận** | - Công thức chia điểm dựa trên quantile 20%<br>- Export Excel danh sách khách của 1 segment<br>- Đồng bộ segment với phân hệ Marketing (tạo campaign) |
| **Ưu tiên** | **S** |

### UR-REP-05 — Cohort analysis

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-05 |
| **Tên** | Phân tích cohort giữ chân khách hàng theo tháng |
| **Actor** | Marketer, Founder |
| **Mô tả** | Biểu đồ cohort (ma trận tam giác) cho thấy tỉ lệ % khách đăng ký tháng M1 còn mua ở các tháng M2, M3… M12. Hỗ trợ đánh giá retention theo kênh thu hút khách. |
| **Đầu vào** | Cohort range (12–24 tháng), channel filter |
| **Đầu ra** | Ma trận heatmap có % retention |
| **Tiêu chí chấp nhận** | - Mỗi ô tooltip hiện số khách tuyệt đối + %<br>- Export ảnh PNG cho báo cáo họp |
| **Ưu tiên** | **C** |

### UR-REP-06 — Báo cáo tồn kho

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-06 |
| **Tên** | Báo cáo tồn kho cuối kỳ + cảnh báo tồn thấp/tồn đọng |
| **Actor** | Store Manager, Warehouse |
| **Mô tả** | Trang `/inventory_report` hiển thị số lượng tồn cuối kỳ theo SP × kho, tuổi tồn (days of inventory), cảnh báo SP tồn dưới định mức min và SP tồn đọng > 90 ngày không bán. |
| **Đầu vào** | Thời điểm chốt tồn, kho (multi-select) |
| **Đầu ra** | Bảng tồn có cột: SKU, tên, tồn, giá trị, tuổi tồn, status |
| **Tiêu chí chấp nhận** | - Tổng giá trị tồn kho cuối bảng khớp với sổ kế toán<br>- Filter nhanh: "Tồn thấp", "Tồn đọng", "Hết hàng"<br>- Export Excel có sheet tổng hợp + chi tiết |
| **Ưu tiên** | **M** |

### UR-REP-07 — Báo cáo khuyến mãi & marketing

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-07 |
| **Tên** | Hiệu quả chiến dịch khuyến mãi |
| **Actor** | Marketer, Store Manager |
| **Mô tả** | Trang `/promotional_report` và `/marketing_report` tổng hợp mỗi chiến dịch: số lần áp dụng, tổng giảm giá đã phát, doanh thu đơn có khuyến mãi, ROI (doanh thu tăng / chi phí giảm giá). |
| **Đầu vào** | Khoảng thời gian, chiến dịch (multi-select) |
| **Đầu ra** | Bảng so sánh chiến dịch + biểu đồ ROI |
| **Tiêu chí chấp nhận** | - Có thể so sánh ≥ 2 chiến dịch side-by-side<br>- Drill-down từ chiến dịch xuống danh sách đơn hàng đã dùng |
| **Ưu tiên** | **S** |

### UR-REP-08 — So sánh 2 kỳ

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-08 |
| **Tên** | So sánh chỉ số giữa 2 kỳ (period over period) |
| **Actor** | Store Manager, Founder |
| **Mô tả** | Trên các báo cáo doanh thu/khách hàng, user có thể bật chế độ "So sánh" → chọn kỳ trước (tuần trước, tháng trước, cùng kỳ năm trước). Hệ thống hiển thị % tăng/giảm với mũi tên màu. |
| **Đầu vào** | Kỳ hiện tại + kỳ so sánh |
| **Đầu ra** | Bảng/chart có 2 cột/đường chồng |
| **Tiêu chí chấp nhận** | - % tính theo `(current - prev) / prev`<br>- Tô xanh nếu tăng > 5%, đỏ nếu giảm > 5%, xám nếu lệch nhỏ |
| **Ưu tiên** | **S** |

### UR-REP-09 — Drill-down & xuất Excel/PDF

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-09 |
| **Tên** | Drill-down từ tổng hợp xuống chi tiết và export |
| **Actor** | Tất cả role xem báo cáo |
| **Mô tả** | Mọi dòng tổng hợp trong báo cáo đều có thể click để xem danh sách chứng từ gốc (đơn hàng, phiếu nhập, phiếu xuất). Hỗ trợ nút Export Excel (xlsx) và Export PDF (cho báo cáo in). |
| **Đầu vào** | Hàng tổng hợp cần drill, định dạng export |
| **Đầu ra** | Modal chi tiết hoặc file tải về |
| **Tiêu chí chấp nhận** | - Excel giữ nguyên format số tiền, ngày tháng<br>- PDF có header tenant + logo<br>- File ≤ 10MB, nếu lớn hơn → sinh async + gửi email link |
| **Ưu tiên** | **M** |

### UR-REP-10 — Lịch báo cáo tự động gửi email

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-10 |
| **Tên** | Đặt lịch gửi báo cáo định kỳ qua email |
| **Actor** | Store Manager, Founder |
| **Mô tả** | User chọn một báo cáo bất kỳ → nút "Đặt lịch" → cấu hình: tần suất (hàng ngày/tuần/tháng), giờ gửi, người nhận (danh sách email), định dạng file đính kèm (xlsx/pdf). System job chạy và gửi đúng lịch. |
| **Đầu vào** | Cron expression hoặc preset + email list |
| **Đầu ra** | Email chứa file báo cáo + link web |
| **Tiêu chí chấp nhận** | - User có thể pause/resume lịch<br>- Lỗi gửi mail được log và retry 3 lần<br>- Chỉ gửi báo cáo trong phạm vi quyền của user tạo lịch |
| **Ưu tiên** | **C** |

### UR-REP-11 — KPI dashboard tuỳ chỉnh

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-11 |
| **Tên** | Dashboard KPI tuỳ chỉnh kéo-thả |
| **Actor** | Founder, Chain Manager |
| **Mô tả** | Trang `/report_common` cho phép user tạo dashboard riêng bằng cách kéo các widget: KPI tile, chart cột/đường, bảng top N, funnel. Layout grid lưu theo user. Mỗi widget chọn nguồn dữ liệu và filter riêng. |
| **Đầu vào** | Widget config JSON, layout grid |
| **Đầu ra** | Dashboard render realtime |
| **Tiêu chí chấp nhận** | - Có thể share dashboard cho user khác (read-only link)<br>- Tối đa 20 widget mỗi dashboard<br>- Auto refresh tuỳ chọn 1/5/15 phút |
| **Ưu tiên** | **C** |

### UR-REP-12 — Báo cáo tổng hợp đa phân hệ

| Trường | Nội dung |
|---|---|
| **ID** | UR-REP-12 |
| **Tên** | Báo cáo tổng hợp đa phân hệ (bán hàng + kho + tài chính) |
| **Actor** | Founder, Accountant |
| **Mô tả** | Trang tổng hợp lấy dữ liệu xuyên phân hệ: doanh thu thuần, giá vốn, lợi nhuận gộp, chi phí vận hành từ sổ thu chi, công nợ phải thu/phải trả. Cho cái nhìn tình hình kinh doanh cuối kỳ. |
| **Đầu vào** | Kỳ báo cáo, cơ sở |
| **Đầu ra** | Báo cáo 1 trang có đầy đủ nhóm chỉ số |
| **Tiêu chí chấp nhận** | - Số liệu khớp sổ thu chi + sổ tồn + sổ bán hàng<br>- Có thể lock kỳ sau khi Accountant chốt |
| **Ưu tiên** | **S** |

## 4. Quy tắc nghiệp vụ liên quan

- **Báo cáo chỉ đọc**: phân hệ không ghi dữ liệu gốc, chỉ đọc từ các schema đã được commit bởi POS/Inventory/Finance.
- **Timezone**: tất cả báo cáo dùng timezone của tenant (mặc định Asia/Ho_Chi_Minh).
- **Phân quyền dữ liệu**: Store Manager chỉ thấy dữ liệu cơ sở mình, Chain Manager thấy toàn chuỗi, Founder thấy toàn tenant.
- **Kỳ chốt**: sau khi Accountant "đóng kỳ" → số liệu kỳ đó đóng băng, không đổi theo edit sau.

## 5. Non-functional ràng buộc

- **Performance**: Báo cáo cơ bản ≤ 5s; báo cáo RFM/Cohort ≤ 15s; báo cáo custom dashboard load ≤ 8s cho 20 widget.
- **Caching**: Báo cáo hôm qua trở về trước được cache 1h, báo cáo hôm nay refresh mỗi 5 phút.
- **Export**: Giới hạn 500k dòng/lần xuất Excel; hơn thì chia file hoặc dùng async job.

---

*Hết Part 11. Xem tiếp [Part 12 — Cài đặt](part-12-cai-dat.md).*
