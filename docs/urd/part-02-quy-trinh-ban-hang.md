# Part 02 — Quy trình Bán hàng (Sales Pipeline)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-SALE-01: Quản lý cơ hội bán hàng

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-01 |
| **Tên** | Quản lý cơ hội bán hàng (Opportunity) |
| **Actor** | Sales, Sales Manager |
| **Mô tả** | Tạo và quản lý cơ hội bán hàng (deal) trong pipeline. Mỗi cơ hội gồm: tên cơ hội, khách hàng liên kết, liên hệ chính, giá trị ước tính (VND), xác suất thắng (%), ngày dự kiến chốt, giai đoạn (stage), nguồn cơ hội, sản phẩm/dịch vụ quan tâm, đối tác referral (nếu có), và nhân viên phụ trách. Các giai đoạn mặc định: Qualification → Needs Analysis → Proposal → Negotiation → Closed Won / Closed Lost. Admin có thể tuỳ chỉnh tên và số giai đoạn. |
| **Tiền điều kiện** | Khách hàng và liên hệ đã tồn tại. Người dùng có quyền tạo cơ hội. |
| **Đầu vào** | Tên cơ hội (*), khách hàng (*), liên hệ chính, giá trị (*), xác suất (%), ngày dự kiến chốt (*), giai đoạn (*), nguồn, sản phẩm/dịch vụ, đối tác referral, nhân viên phụ trách (*), ghi chú. |
| **Đầu ra** | Cơ hội được tạo, hiển thị trên Kanban board và danh sách. Giá trị weighted = giá trị x xác suất. |
| **Tiêu chí chấp nhận** | 1. CRUD cơ hội hoạt động đúng. 2. Kéo thả (drag & drop) chuyển giai đoạn trên Kanban. 3. Chuyển giai đoạn ghi log tự động (ngày, người thực hiện). 4. Validate: giá trị > 0, xác suất 0–100%, ngày chốt >= hôm nay. 5. Lọc cơ hội theo giai đoạn, nhân viên, khách hàng, khoảng thời gian. 6. Gán đối tác referral và tính hoa hồng liên kết UR-CUS-03. |
| **Ưu tiên** | **M** |

---

## UR-SALE-02: Tạo báo giá

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-02 |
| **Tên** | Tạo báo giá (Quotation) |
| **Actor** | Sales, Sales Manager |
| **Mô tả** | Tạo báo giá từ cơ hội bán hàng. Báo giá gồm: thông tin khách hàng, danh sách sản phẩm/dịch vụ (line items) với đơn giá, số lượng, chiết khấu, thuế VAT, tổng tiền. Hỗ trợ nhiều phiên bản báo giá cho cùng một cơ hội (v1, v2, v3...). Xuất PDF theo mẫu công ty. Gửi báo giá qua email trực tiếp từ hệ thống. Trạng thái: Draft → Sent → Accepted → Rejected → Expired. |
| **Tiền điều kiện** | Cơ hội bán hàng đã tồn tại. Danh mục sản phẩm/dịch vụ đã được cấu hình. |
| **Đầu vào** | Cơ hội liên kết (*), ngày báo giá (*), ngày hết hạn (*), line items: [sản phẩm (*), mô tả, số lượng (*), đơn giá (*), chiết khấu (%), thuế VAT (%)], điều khoản thanh toán, ghi chú, file đính kèm. |
| **Đầu ra** | Báo giá được lưu với mã tự động (QUO-YYYYMMDD-###). Tổng tiền tự động tính. PDF sinh theo template. |
| **Tiêu chí chấp nhận** | 1. Tạo báo giá với ít nhất 1 line item thành công. 2. Tổng tiền = SUM(số lượng x đơn giá x (1 - chiết khấu%) x (1 + VAT%)). 3. Xuất PDF đúng format, đầy đủ thông tin. 4. Gửi email báo giá (đính kèm PDF) thành công. 5. Quản lý nhiều phiên bản báo giá cho 1 cơ hội. 6. Chuyển trạng thái báo giá đúng luồng. 7. Từ báo giá Accepted, tạo nhanh hợp đồng (link UR-SALE-03). |
| **Ưu tiên** | **M** |

---

## UR-SALE-03: Quản lý hợp đồng

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-03 |
| **Tên** | Quản lý hợp đồng (Contract) |
| **Actor** | Sales, Sales Manager, Finance |
| **Mô tả** | Quản lý vòng đời hợp đồng từ tạo mới đến kết thúc. Hợp đồng gồm: mã hợp đồng, khách hàng, giá trị, ngày bắt đầu, ngày kết thúc, điều khoản, phụ lục, file scan đính kèm. Hỗ trợ quy trình phê duyệt nhiều cấp (BPM) và ký điện tử (eSign). Trạng thái: Draft → Pending Approval → Approved → Active → Completed → Terminated. Tự động cảnh báo trước khi hợp đồng hết hạn (30/15/7 ngày). |
| **Tiền điều kiện** | Báo giá đã được chấp nhận (hoặc tạo hợp đồng trực tiếp với quyền Manager). |
| **Đầu vào** | Báo giá liên kết, khách hàng (*), giá trị hợp đồng (*), ngày bắt đầu (*), ngày kết thúc (*), điều khoản thanh toán (*), nội dung hợp đồng, file đính kèm (scan/PDF). |
| **Đầu ra** | Hợp đồng được tạo với mã tự động (CON-YYYYMMDD-###). Gửi phê duyệt theo BPM. Cảnh báo hết hạn hoạt động. |
| **Tiêu chí chấp nhận** | 1. Tạo hợp đồng từ báo giá: kế thừa thông tin khách hàng, giá trị, line items. 2. Quy trình phê duyệt BPM hoạt động (ít nhất 2 cấp). 3. Lưu trữ nhiều phiên bản (phụ lục, sửa đổi). 4. Cảnh báo email/notification trước khi hết hạn. 5. Từ hợp đồng Active, tạo nhanh hoá đơn (link UR-SALE-04) và dự án (link UR-PROJ). 6. Tìm kiếm hợp đồng theo mã, khách hàng, trạng thái, khoảng thời gian. |
| **Ưu tiên** | **M** |

---

## UR-SALE-04: Hoá đơn & Thanh toán

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-04 |
| **Tên** | Hoá đơn & Thanh toán (Invoice & Payment) |
| **Actor** | Finance, Sales Manager |
| **Mô tả** | Tạo hoá đơn từ hợp đồng (toàn bộ hoặc theo đợt thanh toán). Theo dõi trạng thái thanh toán: Unpaid → Partial → Paid → Overdue. Ghi nhận từng lần thanh toán (ngày, số tiền, phương thức, chứng từ). Hỗ trợ xuất hoá đơn PDF và gửi email nhắc thanh toán tự động khi quá hạn. Liên kết với module Tài chính (UR-FIN) để đối soát công nợ. |
| **Tiền điều kiện** | Hợp đồng đang Active hoặc Completed. |
| **Đầu vào** | Hợp đồng liên kết (*), số hoá đơn, ngày hoá đơn (*), hạn thanh toán (*), giá trị (*), danh sách đợt thanh toán (nếu chia đợt), ghi chú. Ghi nhận thanh toán: ngày (*), số tiền (*), phương thức (*), mã giao dịch, chứng từ đính kèm. |
| **Đầu ra** | Hoá đơn được tạo với mã tự động (INV-YYYYMMDD-###). Trạng thái thanh toán cập nhật realtime. Email nhắc nợ gửi tự động. |
| **Tiêu chí chấp nhận** | 1. Tạo hoá đơn từ hợp đồng: kế thừa thông tin. 2. Chia hoá đơn thành nhiều đợt thanh toán. 3. Ghi nhận thanh toán từng phần, cập nhật trạng thái đúng. 4. Tự động chuyển Overdue khi quá hạn. 5. Email nhắc nợ gửi theo cấu hình (3 ngày, 7 ngày, 15 ngày sau hạn). 6. Xuất hoá đơn PDF. 7. Báo cáo công nợ theo khách hàng, theo thời gian. |
| **Ưu tiên** | **M** |

---

## UR-SALE-05: Pipeline Dashboard

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-05 |
| **Tên** | Pipeline Dashboard & Forecast |
| **Actor** | Sales Manager, CEO |
| **Mô tả** | Dashboard trực quan hiển thị toàn cảnh pipeline bán hàng. Bao gồm: biểu đồ phễu (funnel chart) theo giai đoạn, doanh thu dự báo (forecast = SUM weighted value), tỷ lệ chuyển đổi (conversion rate) giữa các giai đoạn, thời gian trung bình ở mỗi giai đoạn, so sánh target vs actual theo tháng/quý. Lọc theo nhân viên, đội nhóm, khoảng thời gian, nguồn khách hàng. |
| **Tiền điều kiện** | Có dữ liệu cơ hội bán hàng trong hệ thống. |
| **Đầu vào** | Bộ lọc: khoảng thời gian, nhân viên/đội nhóm, giai đoạn, nguồn. |
| **Đầu ra** | Dashboard với các biểu đồ và chỉ số realtime. Hỗ trợ xuất báo cáo PDF/Excel. |
| **Tiêu chí chấp nhận** | 1. Funnel chart hiển thị đúng số cơ hội và giá trị mỗi giai đoạn. 2. Forecast = SUM(giá trị x xác suất) cho các cơ hội đang mở. 3. Conversion rate = số chuyển sang giai đoạn tiếp / tổng số ở giai đoạn hiện tại. 4. Bộ lọc hoạt động đúng, dashboard cập nhật realtime. 5. So sánh target vs actual (target nhập bởi Manager). 6. Xuất báo cáo PDF/Excel. |
| **Ưu tiên** | **S** |
