# Part 08 — Tài chính

## 1. Phạm vi phân hệ

Quản lý dòng tiền của tenant: sổ thu chi (cashbook), quỹ tiền mặt và tài khoản ngân hàng, công nợ (phải thu khách hàng + phải trả NCC), đối soát thanh toán với cổng bank/ví điện tử, danh mục phiếu (category), chuyển quỹ nội bộ, cấu hình phương thức thanh toán dùng cho POS và đơn hàng.

Phân hệ này liên kết với Part 02 (POS), Part 04 (Đơn hàng), Part 06 (Mua hàng) và Part 07 (Vận chuyển COD).

Các route retail liên quan:

- `/finance_management/cashbook` — sổ thu chi
- `/finance_management/fund_management` — quản lý quỹ
- `/finance_management/debt_management` — công nợ
- `/finance_management/debt_transaction` — giao dịch công nợ
- `/finance_management/category_management` — danh mục phiếu
- `/payment_control` — đối soát thanh toán
- `/setting_payment_method` — cấu hình phương thức thanh toán
- `/create_finance_transaction` — tạo phiếu thu/chi
- `/create_debt_transaction` — tạo giao dịch công nợ

## 2. Actor liên quan

- **Accountant** — người dùng chính
- **Store Manager** — duyệt phiếu lớn, xem báo cáo tài chính
- **Cashier** — phiếu thu từ POS tự sinh
- **Tenant Admin** — cấu hình danh mục, phương thức thanh toán

## 3. Yêu cầu chi tiết

### UR-FIN-01 — Quản lý quỹ tiền

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-01 |
| **Tên** | Danh sách quỹ tiền mặt và tài khoản ngân hàng |
| **Actor** | Accountant, Tenant Admin |
| **Mô tả** | `/finance_management/fund_management` quản lý danh sách quỹ: tiền mặt chi nhánh, tài khoản ngân hàng, ví điện tử. Mỗi quỹ có: tên, loại, số dư đầu kỳ, số dư hiện tại, chi nhánh sở hữu, trạng thái. |
| **Tiền điều kiện** | User có quyền `finance.fund.manage` |
| **Đầu vào** | Thông tin quỹ, số dư đầu kỳ |
| **Đầu ra** | Quỹ lưu, số dư cập nhật real-time theo giao dịch |
| **Tiêu chí chấp nhận** | - Không xoá quỹ có phát sinh giao dịch<br>- Số dư tính từ số dư đầu + thu - chi<br>- Phân quyền xem quỹ theo chi nhánh |
| **Ưu tiên** | **M** |

### UR-FIN-02 — Sổ thu chi (Cashbook)

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-02 |
| **Tên** | Xem sổ thu chi theo quỹ |
| **Actor** | Accountant |
| **Mô tả** | `/finance_management/cashbook` hiển thị tất cả phiếu thu/chi theo thứ tự thời gian, filter theo quỹ, kỳ, danh mục, người tạo. Mỗi dòng hiển thị số dư luỹ kế. |
| **Tiền điều kiện** | Có quỹ và giao dịch |
| **Đầu vào** | Filter: quỹ, kỳ, danh mục |
| **Đầu ra** | Bảng giao dịch có phân trang, số dư chạy |
| **Tiêu chí chấp nhận** | - Export Excel<br>- Tổng thu / tổng chi / chênh lệch<br>- Drill-down vào chi tiết phiếu |
| **Ưu tiên** | **M** |

### UR-FIN-03 — Tạo phiếu thu / chi

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-03 |
| **Tên** | Ghi nhận phiếu thu, phiếu chi thủ công |
| **Actor** | Accountant, Cashier |
| **Mô tả** | `/create_finance_transaction` tạo phiếu: loại (thu/chi), quỹ, danh mục, số tiền, đối tượng (KH/NCC/khác), ngày, ghi chú, chứng từ đính kèm. Lưu lịch sử audit. |
| **Tiền điều kiện** | User có quyền `finance.transaction.create` |
| **Đầu vào** | Form phiếu |
| **Đầu ra** | Phiếu lưu, số dư quỹ cập nhật |
| **Tiêu chí chấp nhận** | - Số tiền > 0<br>- Chi không được vượt số dư quỹ (trừ khi cho phép âm)<br>- Đính kèm ảnh/file chứng từ |
| **Ưu tiên** | **M** |

### UR-FIN-04 — Danh mục phiếu (Category)

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-04 |
| **Tên** | Quản lý nhóm khoản thu chi |
| **Actor** | Tenant Admin |
| **Mô tả** | `/finance_management/category_management` cho phép khai báo cây danh mục thu/chi: doanh thu bán hàng, thu khác, chi lương, chi thuê, chi mua hàng, chi marketing... Mỗi danh mục thuộc nhóm thu hoặc chi. |
| **Tiền điều kiện** | Tenant Admin đăng nhập |
| **Đầu vào** | Tên danh mục, loại (thu/chi), parent |
| **Đầu ra** | Cây danh mục dùng khi tạo phiếu |
| **Tiêu chí chấp nhận** | - Cây 2-3 cấp<br>- Không xoá danh mục đã dùng<br>- Có danh mục mặc định hệ thống |
| **Ưu tiên** | **S** |

### UR-FIN-05 — Chuyển quỹ nội bộ

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-05 |
| **Tên** | Chuyển tiền giữa 2 quỹ |
| **Actor** | Accountant |
| **Mô tả** | Tạo phiếu chuyển quỹ: từ quỹ A sang quỹ B, số tiền, phí (nếu có). Hệ thống tự tạo cặp phiếu chi ở A + phiếu thu ở B, gắn cùng mã chuyển. |
| **Tiền điều kiện** | Cả 2 quỹ tồn tại; quỹ nguồn đủ số dư |
| **Đầu vào** | Quỹ nguồn, quỹ đích, số tiền, ngày |
| **Đầu ra** | Cặp phiếu liên kết; số dư 2 quỹ cập nhật |
| **Tiêu chí chấp nhận** | - Atomic: cả 2 phiếu cùng thành công hoặc cùng rollback<br>- Phí ghi vào phiếu chi riêng<br>- Lịch sử chuyển quỹ riêng |
| **Ưu tiên** | **S** |

### UR-FIN-06 — Công nợ phải thu khách hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-06 |
| **Tên** | Theo dõi công nợ khách hàng |
| **Actor** | Accountant |
| **Mô tả** | `/finance_management/debt_management` tab phải thu: hiển thị danh sách KH còn nợ, tổng nợ, hạn thanh toán, lịch sử thanh toán. Drill-down xem chi tiết hoá đơn. |
| **Tiền điều kiện** | Có đơn bán công nợ |
| **Đầu vào** | Filter: KH, kỳ, trạng thái (quá hạn / trong hạn) |
| **Đầu ra** | Bảng công nợ |
| **Tiêu chí chấp nhận** | - Highlight KH quá hạn<br>- Tổng phải thu theo chi nhánh<br>- Nhắc nợ tự động (email/SMS) |
| **Ưu tiên** | **M** |

### UR-FIN-07 — Công nợ phải trả NCC

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-07 |
| **Tên** | Theo dõi công nợ NCC |
| **Actor** | Accountant |
| **Mô tả** | Tab phải trả trong `/finance_management/debt_management`: danh sách NCC còn nợ, hạn thanh toán. Liên kết với Part 06 (Mua hàng). |
| **Tiền điều kiện** | Có hoá đơn mua chưa thanh toán hết |
| **Đầu vào** | Filter: NCC, kỳ |
| **Đầu ra** | Bảng công nợ phải trả |
| **Tiêu chí chấp nhận** | - Cảnh báo hoá đơn sắp đến hạn<br>- Đề xuất lịch thanh toán<br>- Tổng phải trả theo NCC |
| **Ưu tiên** | **M** |

### UR-FIN-08 — Giao dịch công nợ

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-08 |
| **Tên** | Ghi nhận thanh toán công nợ |
| **Actor** | Accountant |
| **Mô tả** | `/create_debt_transaction` tạo phiếu thanh toán công nợ: chọn đối tượng (KH/NCC), chọn hoá đơn cần thanh toán, số tiền, quỹ. Hệ thống tự giảm công nợ và cập nhật quỹ. |
| **Tiền điều kiện** | Có công nợ mở |
| **Đầu vào** | Đối tượng, hoá đơn, số tiền, quỹ |
| **Đầu ra** | Phiếu thu (hoặc chi) + giảm công nợ |
| **Tiêu chí chấp nhận** | - Partial payment hỗ trợ<br>- Phân bổ tự động theo FIFO hoá đơn (tuỳ cấu hình)<br>- Không thanh toán vượt nợ |
| **Ưu tiên** | **M** |

### UR-FIN-09 — Cấu hình phương thức thanh toán

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-09 |
| **Tên** | Danh sách phương thức thanh toán dùng ở POS |
| **Actor** | Tenant Admin |
| **Mô tả** | `/setting_payment_method` cấu hình các phương thức: tiền mặt, chuyển khoản, thẻ POS, MoMo, ZaloPay, VNPay, công nợ. Mỗi phương thức có: tên, loại, quỹ mặc định, phí (%), enable/disable, icon. |
| **Tiền điều kiện** | Tenant Admin đăng nhập |
| **Đầu vào** | Thông tin phương thức |
| **Đầu ra** | Danh sách dùng ở POS và đơn hàng |
| **Tiêu chí chấp nhận** | - Ít nhất 1 phương thức enable<br>- Map với quỹ tương ứng<br>- Phí tự tính vào doanh thu thực nhận |
| **Ưu tiên** | **M** |

### UR-FIN-10 — Đối soát thanh toán với bank/ví

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-10 |
| **Tên** | Đối soát sao kê ngân hàng |
| **Actor** | Accountant |
| **Mô tả** | `/payment_control` cho phép import file sao kê (MB, VCB, TCB, MoMo, ZaloPay) và match với phiếu thu hệ thống theo số tiền, ngày, nội dung. Phát hiện chênh lệch và chưa đối soát. |
| **Tiền điều kiện** | Có file sao kê; có phiếu thu cần đối soát |
| **Đầu vào** | File sao kê (.csv/.xlsx) |
| **Đầu ra** | Báo cáo matched / unmatched / discrepancy |
| **Tiêu chí chấp nhận** | - Match tự động + suggest manual<br>- Đánh dấu phiếu đã đối soát<br>- Rollback sai match được |
| **Ưu tiên** | **S** |

### UR-FIN-11 — Cân đối quỹ cuối ngày

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-11 |
| **Tên** | Kiểm kê quỹ cuối ngày / cuối ca |
| **Actor** | Cashier, Store Manager |
| **Mô tả** | Cuối ca/ngày, Cashier đếm tiền mặt thực tế và nhập vào hệ thống. Hệ thống so sánh với số dư logic. Chênh lệch ghi nhận phiếu điều chỉnh có lý do. |
| **Tiền điều kiện** | Ca POS kết thúc |
| **Đầu vào** | Số tiền thực đếm theo mệnh giá |
| **Đầu ra** | Báo cáo cân đối; phiếu điều chỉnh chênh lệch |
| **Tiêu chí chấp nhận** | - Chênh lệch > ngưỡng cần Store Manager duyệt<br>- Lưu audit<br>- Link với end-of-shift POS |
| **Ưu tiên** | **S** |

### UR-FIN-12 — Báo cáo tài chính tổng hợp

| Trường | Nội dung |
|---|---|
| **ID** | UR-FIN-12 |
| **Tên** | Báo cáo doanh thu — chi phí — lợi nhuận |
| **Actor** | Store Manager, Tenant Admin |
| **Mô tả** | Báo cáo P&L đơn giản theo kỳ: doanh thu (thu từ bán), chi phí (nhập hàng, lương, thuê, marketing...), lợi nhuận gộp / thuần. Theo chi nhánh hoặc toàn tenant. |
| **Tiền điều kiện** | Có dữ liệu giao dịch |
| **Đầu vào** | Kỳ, chi nhánh |
| **Đầu ra** | Báo cáo P&L + biểu đồ |
| **Tiêu chí chấp nhận** | - Export PDF/Excel<br>- So sánh 2 kỳ<br>- Drill-down vào danh mục |
| **Ưu tiên** | **S** |

## 4. Quy tắc nghiệp vụ

- **Atomic transaction**: mọi thao tác chuyển quỹ, thanh toán công nợ phải atomic.
- **Số dư không âm**: quỹ không được âm, trừ khi cấu hình cho phép thấu chi.
- **Closing period**: sau khi đóng kỳ, không cho sửa phiếu trong kỳ đó; chỉ tạo phiếu điều chỉnh kỳ mới.
- **FIFO đối trừ**: thanh toán công nợ mặc định đối trừ hoá đơn cũ nhất trước.
- **Multi-currency**: giai đoạn 1 chỉ hỗ trợ VND; dự trù USD/EUR ở giai đoạn 2.

## 5. Non-functional ràng buộc

- **Data integrity**: dùng DB transaction cho mọi nghiệp vụ ảnh hưởng số dư.
- **Audit trail**: mọi phiếu có log đầy đủ (ai tạo, ai sửa, ai duyệt, ai xoá, thời gian).
- **Performance**: báo cáo cashbook 12 tháng load < 5s.
- **Security**: chỉ role `Accountant` và `Store Manager` truy cập; phân quyền theo quỹ và chi nhánh.
- **Compliance**: giữ lịch sử giao dịch tối thiểu 5 năm phục vụ kiểm toán.

---

*Hết Part 08. Xem tiếp [Part 09 — Marketing & Khuyến mãi](part-09-marketing-khuyen-mai.md).*
