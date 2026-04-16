# Part 05 — Tài chính (Finance)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-FIN-01: Sổ thu chi

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-01 |
| **Tên** | Sổ thu chi (Cashbook) |
| **Actor** | Finance, Sales Manager, Admin |
| **Mô tả** | Quản lý toàn bộ các khoản thu và chi của doanh nghiệp. Mỗi phiếu thu/chi gồm: mã phiếu (tự động), loại (Thu / Chi), danh mục thu chi (cấu hình bởi Admin), số tiền, ngày giao dịch, phương thức (Tiền mặt / Chuyển khoản / Ví điện tử), quỹ liên kết (link UR-FIN-03), khách hàng / đối tác liên quan, hợp đồng / hoá đơn liên kết, người tạo, người phê duyệt, trạng thái (Draft / Pending Approval / Approved / Rejected / Cancelled), nội dung, chứng từ đính kèm (ảnh, PDF). Phiếu thu có thể tạo tự động từ ghi nhận thanh toán hoá đơn (link UR-SALE-04). Phiếu chi hỗ trợ quy trình phê duyệt BPM theo giá trị (< 5 triệu: trưởng phòng, >= 5 triệu: giám đốc). |
| **Tiền điều kiện** | Người dùng có quyền truy cập module Tài chính. Danh mục thu chi đã được cấu hình. |
| **Đầu vào** | Loại phiếu (*), danh mục (*), số tiền (*), ngày giao dịch (*), phương thức thanh toán (*), quỹ (*), khách hàng / đối tác, hợp đồng / hoá đơn liên kết, nội dung (*), chứng từ đính kèm. |
| **Đầu ra** | Phiếu thu/chi được tạo với mã tự động (PT-YYYYMMDD-### / PC-YYYYMMDD-###). Số dư quỹ tự động cập nhật sau khi phê duyệt. Sổ thu chi hiển thị dạng danh sách với tổng thu, tổng chi, số dư theo khoảng thời gian. |
| **Tiêu chí chấp nhận** | 1. Tạo phiếu thu/chi với đầy đủ thông tin thành công. 2. Phiếu chi qua phê duyệt BPM theo cấu hình giá trị. 3. Sau phê duyệt, số dư quỹ tự động cộng (thu) hoặc trừ (chi). 4. Sổ thu chi hiển thị: ngày, mã phiếu, loại, danh mục, số tiền, quỹ, trạng thái. 5. Lọc theo: khoảng thời gian, loại (thu/chi), danh mục, quỹ, trạng thái. 6. Tổng thu, tổng chi, chênh lệch hiển thị trên header. 7. Liên kết phiếu thu từ thanh toán hoá đơn hoạt động đúng. 8. Xuất sổ thu chi ra Excel. 9. Đính kèm chứng từ (tối đa 5 file, 10MB/file). |
| **Ưu tiên** | **M** |

---

## UR-FIN-02: Công nợ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-02 |
| **Tên** | Quản lý công nợ (Debt / Accounts Receivable & Payable) |
| **Actor** | Finance, Sales Manager, CEO |
| **Mô tả** | Theo dõi công nợ phải thu (khách hàng nợ mình) và phải trả (mình nợ nhà cung cấp). Công nợ phát sinh từ: hoá đơn bán hàng chưa thanh toán đủ, hợp đồng có đợt thanh toán, và phiếu chi chưa đối soát. Mỗi bản ghi công nợ gồm: khách hàng / nhà cung cấp, hoá đơn / hợp đồng liên kết, tổng giá trị, đã thanh toán, còn nợ, hạn thanh toán, số ngày quá hạn (overdue days), trạng thái (Current / Overdue / Bad Debt). Hệ thống tự động tổng hợp công nợ từ các phiếu thu/chi và hoá đơn. Báo cáo tuổi nợ (Aging Report) phân loại theo khoảng thời gian quá hạn: 0-30 ngày, 31-60 ngày, 61-90 ngày, > 90 ngày. |
| **Tiền điều kiện** | Có hoá đơn hoặc phiếu thu/chi đã phát sinh. |
| **Đầu vào** | Bộ lọc: khách hàng / nhà cung cấp, khoảng thời gian, trạng thái, nhân viên phụ trách. Ghi nhận thanh toán: ngày, số tiền, phương thức, mã giao dịch. |
| **Đầu ra** | Bảng công nợ tổng hợp theo khách hàng. Aging Report phân theo khoảng quá hạn. Cảnh báo công nợ quá hạn qua email/notification. |
| **Tiêu chí chấp nhận** | 1. Công nợ phải thu tự động tổng hợp từ hoá đơn chưa thanh toán đủ. 2. Công nợ phải trả tổng hợp từ phiếu chi / hoá đơn mua hàng. 3. Ghi nhận thanh toán từng phần, cập nhật số dư nợ realtime. 4. Aging Report phân 4 khoảng: Current, 1-30, 31-60, 61-90, >90 ngày. 5. Tự động gửi email nhắc nợ theo cấu hình (7 ngày, 15 ngày, 30 ngày quá hạn). 6. Dashboard công nợ: tổng phải thu, tổng phải trả, tổng quá hạn, biểu đồ aging. 7. Lọc công nợ theo khách hàng, nhân viên, khoảng thời gian, trạng thái. 8. Đánh dấu Bad Debt (nợ xấu) với lý do. 9. Xuất báo cáo công nợ / aging report ra Excel/PDF. |
| **Ưu tiên** | **M** |

---

## UR-FIN-03: Quỹ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-03 |
| **Tên** | Quản lý quỹ (Fund Management) |
| **Actor** | Finance, Admin, CEO |
| **Mô tả** | Quản lý các quỹ tiền của doanh nghiệp. Mỗi quỹ gồm: tên quỹ, loại (Tiền mặt / Ngân hàng / Ví điện tử), số tài khoản (nếu ngân hàng), ngân hàng, chi nhánh, số dư hiện tại, trạng thái (Active / Inactive). Hỗ trợ chuyển tiền giữa các quỹ (inter-fund transfer) với phê duyệt. Mỗi phiếu thu/chi (UR-FIN-01) phải gắn với một quỹ cụ thể. Số dư quỹ tự động cập nhật khi phiếu thu/chi được phê duyệt. Lịch sử biến động số dư (transaction log) cho mỗi quỹ. |
| **Tiền điều kiện** | Admin đã tạo ít nhất 1 quỹ. Người dùng có quyền quản lý quỹ. |
| **Đầu vào** | **Tạo quỹ:** Tên quỹ (*), loại (*), số tài khoản, ngân hàng, chi nhánh, số dư ban đầu (*). **Chuyển quỹ:** Quỹ nguồn (*), quỹ đích (*), số tiền (*), lý do, chứng từ. |
| **Đầu ra** | Quỹ được tạo. Số dư cập nhật realtime. Phiếu chuyển quỹ được ghi nhận. Lịch sử giao dịch hiển thị đầy đủ. |
| **Tiêu chí chấp nhận** | 1. CRUD quỹ hoạt động đúng. 2. Số dư quỹ = Số dư ban đầu + Tổng thu - Tổng chi + Tổng chuyển vào - Tổng chuyển ra. 3. Không cho phép chi/chuyển vượt quá số dư hiện tại (validate). 4. Chuyển tiền giữa quỹ: tạo 1 phiếu chi ở quỹ nguồn + 1 phiếu thu ở quỹ đích (atomic). 5. Phê duyệt chuyển quỹ theo BPM (giá trị > ngưỡng cấu hình). 6. Lịch sử giao dịch (transaction log) cho mỗi quỹ: ngày, loại, số tiền, số dư sau giao dịch, nguồn. 7. Dashboard quỹ: tổng số dư tất cả quỹ, biểu đồ biến động theo tháng. 8. Lọc quỹ theo loại, trạng thái. 9. Xuất lịch sử giao dịch ra Excel. |
| **Ưu tiên** | **S** |

---

## UR-FIN-04: Báo cáo tài chính

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-04 |
| **Tên** | Báo cáo tài chính tổng hợp (Financial Report) |
| **Actor** | Finance, CEO, Sales Manager |
| **Mô tả** | Dashboard và báo cáo tổng hợp tài chính gồm: doanh thu theo tháng/quý/năm (từ hoá đơn đã thanh toán), chi phí theo danh mục, lợi nhuận gộp (doanh thu - chi phí), tình hình công nợ, số dư quỹ, và biểu đồ xu hướng (trend). Hỗ trợ so sánh giữa các kỳ (month-over-month, year-over-year). Các biểu đồ: doanh thu line chart, chi phí bar chart, công nợ pie chart, cash flow waterfall chart. |
| **Tiền điều kiện** | Có dữ liệu thu chi, công nợ, hoá đơn trong hệ thống. |
| **Đầu vào** | Khoảng thời gian báo cáo, bộ lọc: nhân viên, khách hàng, danh mục, quỹ. |
| **Đầu ra** | Dashboard tài chính với biểu đồ realtime. Báo cáo chi tiết xuất Excel/PDF. |
| **Tiêu chí chấp nhận** | 1. Doanh thu theo tháng = tổng hoá đơn đã thanh toán trong tháng. 2. Chi phí theo danh mục hiển thị đúng. 3. Lợi nhuận gộp = doanh thu - chi phí. 4. So sánh doanh thu kỳ này vs kỳ trước (% tăng/giảm). 5. Cash flow chart: dòng tiền vào/ra theo tháng. 6. Bộ lọc hoạt động đúng. 7. Xuất báo cáo Excel/PDF. |
| **Ưu tiên** | **S** |
