# Part 06 — Mua hàng & Nhà cung cấp

## 1. Phạm vi phân hệ

Quản lý nhà cung cấp (NCC), lập Purchase Order (PO), gửi PO đến NCC, nhận hàng từ PO vào kho, theo dõi công nợ phải trả NCC, và các báo cáo mua hàng. Phân hệ này là nguồn đầu vào cho Part 05 (Kho & Sản phẩm) và liên kết với Part 08 (Tài chính) qua công nợ phải trả.

Các route retail liên quan:

- `/supplier_list` — danh sách NCC
- `/invoice_order` — phiếu nhập kho (có thể từ PO)
- `/create_purchase_order` (lazy-loaded) — tạo đơn đặt mua
- `/purchase_invoice` — hoá đơn mua / công nợ NCC

## 2. Actor liên quan

- **Purchaser** — người dùng chính, lập PO và làm việc với NCC
- **Warehouse Staff** — nhận hàng từ PO, tạo phiếu nhập
- **Accountant** — theo dõi công nợ phải trả, thanh toán NCC
- **Store Manager** — duyệt PO giá trị lớn
- **Tenant Admin** — cấu hình hạn mức duyệt, danh mục NCC

## 3. Yêu cầu chi tiết

### UR-PURCH-01 — CRUD nhà cung cấp

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-01 |
| **Tên** | Quản lý hồ sơ nhà cung cấp |
| **Actor** | Purchaser, Tenant Admin |
| **Mô tả** | `/supplier_list` quản lý danh sách NCC với các trường: mã NCC, tên, người liên hệ, số điện thoại, email, địa chỉ, mã số thuế (MST), số tài khoản ngân hàng, nhóm NCC, ghi chú. Cho phép tạo mới, sửa, xoá mềm, tìm kiếm và lọc. |
| **Tiền điều kiện** | Purchaser đăng nhập, có quyền `supplier.manage` |
| **Đầu vào** | Form thông tin NCC; file import Excel (tùy chọn) |
| **Đầu ra** | Bản ghi NCC được lưu, hiển thị trong danh sách có phân trang |
| **Tiêu chí chấp nhận** | - Mã NCC unique trong tenant<br>- MST validate 10 hoặc 13 ký tự số<br>- Xoá mềm: NCC đã có PO không xoá cứng được<br>- Tìm kiếm theo tên / MST / SĐT |
| **Ưu tiên** | **M** |

### UR-PURCH-02 — Phân nhóm NCC và đánh giá chất lượng

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-02 |
| **Tên** | Nhóm NCC và ghi chú đánh giá |
| **Actor** | Purchaser |
| **Mô tả** | NCC được phân nhóm (ví dụ: chính thức, thời vụ, backup) và có trường ghi chú chất lượng (thời gian giao hàng, tỷ lệ hàng lỗi, độ tin cậy). Purchaser có thể thêm nhận xét sau mỗi lần nhập hàng. |
| **Tiền điều kiện** | NCC đã tồn tại |
| **Đầu vào** | Nhóm NCC, rating 1-5, ghi chú text |
| **Đầu ra** | Lịch sử đánh giá lưu theo thời gian, điểm trung bình hiển thị trên hồ sơ NCC |
| **Tiêu chí chấp nhận** | - Điểm trung bình tính lại mỗi lần có review mới<br>- Hiển thị 5 lần đánh giá gần nhất<br>- Lọc NCC theo nhóm khi tạo PO |
| **Ưu tiên** | **S** |

### UR-PURCH-03 — Tạo Purchase Order

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-03 |
| **Tên** | Lập đơn đặt mua gửi NCC |
| **Actor** | Purchaser |
| **Mô tả** | `/create_purchase_order` cho phép lập PO: chọn NCC, kho nhận, ngày dự kiến giao, danh sách item (SKU, số lượng, giá mua, VAT), điều khoản thanh toán, ghi chú. Tổng tiền và thuế tự tính. |
| **Tiền điều kiện** | NCC tồn tại; user có quyền `po.create` |
| **Đầu vào** | Form PO với các dòng item |
| **Đầu ra** | PO ở trạng thái `draft`, có mã PO unique |
| **Tiêu chí chấp nhận** | - Mã PO tự sinh theo format `PO-YYYYMM-####`<br>- Tổng tiền = sum(qty × giá) + VAT<br>- Lưu draft nhiều lần trước khi submit |
| **Ưu tiên** | **M** |

### UR-PURCH-04 — Duyệt PO theo hạn mức

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-04 |
| **Tên** | Workflow duyệt PO |
| **Actor** | Store Manager, Tenant Admin |
| **Mô tả** | PO có giá trị vượt hạn mức cấu hình (ví dụ 50 triệu) cần Store Manager duyệt trước khi gửi. Trạng thái: `draft → pending_approval → approved → sent → received → closed`. |
| **Tiền điều kiện** | PO ở trạng thái draft hoặc pending_approval |
| **Đầu vào** | Nút duyệt / từ chối + ghi chú |
| **Đầu ra** | Trạng thái PO cập nhật, thông báo cho Purchaser |
| **Tiêu chí chấp nhận** | - Hạn mức cấu hình theo role<br>- Từ chối có lý do bắt buộc<br>- Email / in-app thông báo cho Purchaser |
| **Ưu tiên** | **S** |

### UR-PURCH-05 — Gửi PO qua email cho NCC

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-05 |
| **Tên** | Xuất PDF và gửi PO qua email |
| **Actor** | Purchaser |
| **Mô tả** | Sau khi PO được duyệt, Purchaser có thể xuất PDF template PO và gửi email trực tiếp đến email NCC kèm file đính kèm. Lưu log đã gửi. |
| **Tiền điều kiện** | PO ở trạng thái `approved`; NCC có email |
| **Đầu vào** | Nội dung email (có template mặc định), CC/BCC (tuỳ chọn) |
| **Đầu ra** | Email gửi đi; PO chuyển trạng thái `sent`; log lưu |
| **Tiêu chí chấp nhận** | - PDF có logo tenant, thông tin NCC, chi tiết item<br>- Log hiển thị ngày gửi, người gửi, email đích<br>- Retry nếu gửi thất bại |
| **Ưu tiên** | **S** |

### UR-PURCH-06 — Nhận hàng từ PO (Goods Receipt)

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-06 |
| **Tên** | Tạo phiếu nhập kho từ PO |
| **Actor** | Warehouse Staff |
| **Mô tả** | `/invoice_order` cho phép chọn PO đã duyệt và tạo phiếu nhập kho. Hệ thống pre-fill danh sách item từ PO, cho phép sửa số lượng thực nhận (nếu thiếu/thừa). Sau khi lưu, tồn kho cập nhật và PO chuyển sang `partial_received` hoặc `received`. |
| **Tiền điều kiện** | PO ở trạng thái `sent` hoặc `partial_received` |
| **Đầu vào** | PO number, kho nhận, số lượng thực nhận theo từng item |
| **Đầu ra** | Phiếu nhập kho được tạo; tồn kho cộng; PO cập nhật |
| **Tiêu chí chấp nhận** | - Cho phép nhận nhiều đợt từ 1 PO<br>- Chênh lệch thực nhận vs đặt hiển thị rõ<br>- Cập nhật giá vốn trung bình (weighted average) |
| **Ưu tiên** | **M** |

### UR-PURCH-07 — Hoá đơn mua và công nợ NCC

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-07 |
| **Tên** | Theo dõi công nợ phải trả NCC |
| **Actor** | Accountant |
| **Mô tả** | `/purchase_invoice` quản lý hoá đơn mua: mỗi phiếu nhập sinh 1 hoá đơn (hoặc gộp nhiều phiếu). Hoá đơn có: tổng tiền, đã thanh toán, còn nợ, hạn thanh toán. Bảng công nợ hiển thị tổng phải trả theo NCC. |
| **Tiền điều kiện** | Đã có phiếu nhập từ PO |
| **Đầu vào** | Số hoá đơn NCC (nhập tay), ngày hoá đơn, hạn thanh toán |
| **Đầu ra** | Hoá đơn lưu; công nợ NCC cập nhật |
| **Tiêu chí chấp nhận** | - Cảnh báo hoá đơn quá hạn<br>- Partial payment hỗ trợ<br>- Drill-down từ tổng công nợ về chi tiết hoá đơn |
| **Ưu tiên** | **M** |

### UR-PURCH-08 — Thanh toán NCC

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-08 |
| **Tên** | Ghi nhận thanh toán cho NCC |
| **Actor** | Accountant |
| **Mô tả** | Từ màn công nợ, Accountant tạo phiếu chi thanh toán cho 1 hoặc nhiều hoá đơn của NCC. Phiếu chi link với quỹ tiền (Part 08). |
| **Tiền điều kiện** | Có hoá đơn còn dư nợ |
| **Đầu vào** | Số tiền, phương thức (tiền mặt / chuyển khoản), quỹ nguồn, ngày thanh toán |
| **Đầu ra** | Phiếu chi; công nợ giảm tương ứng; quỹ giảm |
| **Tiêu chí chấp nhận** | - Không thanh toán quá số còn nợ<br>- Ghi log audit<br>- Đính kèm UNC ngân hàng (tuỳ chọn) |
| **Ưu tiên** | **M** |

### UR-PURCH-09 — VAT và hoá đơn đầu vào

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-09 |
| **Tên** | Quản lý VAT đầu vào |
| **Actor** | Accountant |
| **Mô tả** | Mỗi hoá đơn mua lưu thông tin VAT (thuế suất, tiền thuế) để phục vụ khai thuế. Có báo cáo tổng VAT đầu vào theo kỳ. |
| **Tiền điều kiện** | NCC có MST; hoá đơn đã nhập |
| **Đầu vào** | Thuế suất (0/5/8/10%), số hoá đơn đỏ, ký hiệu |
| **Đầu ra** | Sổ VAT đầu vào theo kỳ |
| **Tiêu chí chấp nhận** | - Export Excel đúng mẫu cơ quan thuế<br>- Tách VAT 0/5/8/10%<br>- Khớp với tổng công nợ |
| **Ưu tiên** | **S** |

### UR-PURCH-10 — Báo cáo mua hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-10 |
| **Tên** | Báo cáo tổng hợp mua hàng |
| **Actor** | Purchaser, Store Manager |
| **Mô tả** | Báo cáo theo kỳ: tổng giá trị mua, top NCC, top SP nhập nhiều nhất, giá mua trung bình, xu hướng giá, thời gian giao hàng trung bình. |
| **Tiền điều kiện** | Có dữ liệu PO và phiếu nhập |
| **Đầu vào** | Kỳ, NCC (optional), danh mục SP |
| **Đầu ra** | Bảng số liệu + biểu đồ |
| **Tiêu chí chấp nhận** | - Export Excel<br>- So sánh 2 kỳ<br>- Drill-down về PO cụ thể |
| **Ưu tiên** | **S** |

### UR-PURCH-11 — Import NCC hàng loạt

| Trường | Nội dung |
|---|---|
| **ID** | UR-PURCH-11 |
| **Tên** | Import danh sách NCC từ Excel |
| **Actor** | Tenant Admin |
| **Mô tả** | Cho phép import danh sách NCC từ file Excel theo template cố định. Validate lỗi trước khi ghi. |
| **Tiền điều kiện** | File Excel đúng template |
| **Đầu vào** | File .xlsx |
| **Đầu ra** | Danh sách NCC được tạo; báo cáo dòng lỗi |
| **Tiêu chí chấp nhận** | - Validate MST, email format<br>- Dry-run hiển thị preview<br>- Rollback nếu có lỗi critical |
| **Ưu tiên** | **C** |

## 4. Quy tắc nghiệp vụ

- **Mã PO unique**: mỗi PO có mã theo format `PO-YYYYMM-####`, không trùng trong tenant.
- **Weighted average cost**: giá vốn cập nhật theo phương pháp bình quân gia quyền khi nhận hàng.
- **Partial receipt**: 1 PO có thể nhận thành nhiều đợt, trạng thái chuyển `partial_received` cho đến đợt cuối.
- **Hạn mức duyệt**: cấu hình theo role; vượt hạn mức bắt buộc workflow approval.
- **Không xoá cứng**: NCC đã có PO/phiếu nhập chỉ được xoá mềm (soft delete).

## 5. Non-functional ràng buộc

- **Performance**: danh sách NCC và PO load < 2s với 10k bản ghi.
- **Audit**: mọi thao tác duyệt PO, thanh toán ghi log đầy đủ (user, time, old/new value).
- **Security**: phân quyền theo role — Purchaser không xem được thanh toán; Accountant không tạo PO.
- **Integration**: hook với Part 05 (kho) và Part 08 (tài chính) qua event bus nội bộ.

---

*Hết Part 06. Xem tiếp [Part 07 — Vận chuyển](part-07-van-chuyen.md).*
