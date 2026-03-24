Thiết kế luồng tạo Phiếu Thu / Chi cho hệ thống quản lý tài chính bán lẻ (FinRetail).

====================================================
I. MỤC TIÊU
====================================================

Cho phép người dùng ghi nhận dòng tiền vào hoặc ra khỏi quỹ một cách nhanh chóng,
đơn giản, trực quan và hạn chế sai sót.

Luồng này áp dụng cho:
- Thu tiền
- Chi tiền

====================================================
II. ĐIỂM TRUY CẬP
====================================================

Người dùng có thể truy cập từ:

1. Sidebar → "Tạo Phiếu Thu/Chi"
2. Nút "+ Tạo phiếu" trên Dashboard

====================================================
III. CẤU TRÚC FORM TẠO PHIẾU
====================================================

Tên form: "Phiếu giao dịch mới"
Mô tả phụ: "Ghi lại dòng tiền vào/ra khỏi quỹ của bạn"

----------------------------------------------------
1. LOẠI GIAO DỊCH
----------------------------------------------------

Radio toggle gồm:
[ Thu tiền ]   [ Chi tiền ]

Mặc định: Thu tiền

Khi chọn:
- Thu tiền → hiển thị nhóm danh mục Thu
- Chi tiền → hiển thị nhóm danh mục Chi

----------------------------------------------------
2. HẠNG MỤC
----------------------------------------------------

Dropdown phân nhóm:

Nếu là Thu:
    - Doanh thu bán hàng
    - Thu nợ khách hàng
    - Hoàn vốn đầu tư
    - Trả hàng nhận lại tiền

Nếu là Chi:
    - Tiền điện
    - Tiền nước
    - Chi lương nhân viên
    - Nhập hàng
    - Tiền thuê mặt bằng
    - Chi phí marketing

Bắt buộc chọn.

----------------------------------------------------
3. NGUỒN TIỀN (QUỸ)
----------------------------------------------------

Dropdown chọn quỹ:

Ví dụ:
    - Ngân hàng MB
    - Két thu ngân ca sáng
    - Tiền mặt tại quầy

Ý nghĩa:
- Thu tiền → tiền được cộng vào quỹ đã chọn
- Chi tiền → tiền bị trừ khỏi quỹ đã chọn

Bắt buộc chọn.

----------------------------------------------------
4. SỐ TIỀN (VND)
----------------------------------------------------

Input number:
- Chỉ nhận số dương
- Format có dấu phân cách hàng nghìn
- Không cho nhập số âm

Validation:
- > 0
- Không được để trống

----------------------------------------------------
5. MÔ TẢ / GHI CHÚ
----------------------------------------------------

Textarea (không bắt buộc)

Dùng để:
- Ghi chú chi tiết
- Mô tả nội dung giao dịch

----------------------------------------------------
6. ĐỐI TƯỢNG LIÊN QUAN
----------------------------------------------------

Input text (có thể autocomplete)

Ví dụ:
- Tên khách hàng
- Nhà cung cấp

Dùng để liên kết giao dịch với công nợ nếu cần.

----------------------------------------------------
7. CHỨNG TỪ ĐÍNH KÈM
----------------------------------------------------

Upload file / ảnh:

- Ảnh hóa đơn
- Biên lai
- Chứng từ liên quan

Không bắt buộc.

----------------------------------------------------
8. HÀNH ĐỘNG
----------------------------------------------------

Nút chính:
[ Lưu phiếu giao dịch ]

Nút phụ:
[ Hủy ]

====================================================
IV. LUỒNG XỬ LÝ KHI NHẤN "LƯU PHIẾU"
====================================================

1. Validate toàn bộ form
2. Nếu hợp lệ:
    - Ghi transaction vào hệ thống
    - Cập nhật số dư quỹ tương ứng:
        + Thu → + số tiền
        + Chi → - số tiền
3. Nếu có đối tượng liên quan:
    - Cập nhật công nợ (phải thu / phải trả)
4. Hiển thị thông báo thành công
5. Redirect về:
    - Dashboard
    hoặc
    - Trang Sổ Thu Chi

====================================================
V. ẢNH HƯỞNG SAU KHI TẠO PHIẾU
====================================================

Dashboard sẽ cập nhật:

- Tổng quỹ hiện tại
- Giao dịch gần nhất
- Tổng nợ phải thu / phải trả (nếu có)

====================================================
VI. UX YÊU CẦU
====================================================

- Thao tác nhanh, không reload toàn trang.
- Focus tự động vào ô Số tiền.
- Enter có thể submit.
- Hiển thị màu sắc:
    Thu tiền → xanh lá
    Chi tiền → đỏ
- Tối ưu thao tác bằng bàn phím.

====================================================
VII. MỞ RỘNG TƯƠNG LAI
====================================================

- Cho phép tạo phiếu từ công nợ
- Tự động gợi ý danh mục theo hành vi
- Tạo phiếu nhanh từ Dashboard
- Phân quyền theo nhân viên


====================================================
VIII. SỔ THU CHI (Xem toàn bộ giao dịch)
====================================================

Điểm truy cập:
- Sidebar → Sổ Thu Chi
- Từ Dashboard → "Xem toàn bộ sổ thu chi"

Chức năng:
Hiển thị danh sách toàn bộ giao dịch đã tạo.

Bộ lọc nhanh:
- Tất cả
- Thu
- Chi
- Theo quỹ (Ngân hàng MB, Két thu ngân…)
- Tháng này

Thông tin hiển thị:
- Ngày giao dịch (group theo ngày)
- Tên giao dịch
- Loại (Thu/Chi)
- Quỹ liên quan
- Số tiền (màu xanh nếu thu, đỏ nếu chi)

Thanh tổng hợp:
- Tổng thu
- Tổng chi
- Số dư thực

UX:
- Load thêm khi scroll
- Group theo ngày
- Hiển thị số lượng giao dịch đã tải

====================================================
IX. QUẢN LÝ CÔNG NỢ
====================================================

Điểm truy cập:
- Sidebar → Quản lý Công Nợ

Hiển thị:
- Tổng nợ phải thu
- Tổng nợ phải trả
- Số khách hàng/ncc còn nợ

Bộ lọc:
- Tất cả
- Phải thu (KH)
- Phải trả (NCC)
- Quá hạn

Bảng dữ liệu gồm:
- Đối tượng (Khách hàng / NCC)
- Loại công nợ
- Số nợ
- Hạn thanh toán
- Trạng thái:
    + Sắp đến hạn
    + Còn hạn
    + Quá hạn
- Hành động:
    + QR Thu nợ (cho khách)
    + Thanh toán (cho NCC)

====================================================
X. QR THU NỢ
====================================================

Khi nhấn "QR Thu nợ":

Hiển thị modal:

- Tên khách hàng
- Số tiền nợ
- QR Code thanh toán
- Nút:
    + Chia sẻ mã QR
    + Đóng

Luồng:
1. Hệ thống tạo QR theo số tiền nợ.
2. Khách quét và thanh toán.
3. Sau khi thanh toán thành công:
    - Tự động ghi nhận giao dịch thu tiền
    - Cập nhật quỹ tương ứng
    - Tự động gạch công nợ
    - Cập nhật trạng thái thành "Đã thanh toán"

Không cần tạo phiếu thủ công.

====================================================
XI. QUẢN LÝ QUỸ TIỀN
====================================================

Điểm truy cập:
- Sidebar → Quản lý Quỹ

Chức năng:
Hiển thị danh sách các quỹ hiện có.

Mỗi quỹ hiển thị:
- Tên quỹ
- Loại (Ngân hàng / Tiền mặt)
- Số dư hiện tại
- Ngày cập nhật gần nhất

Có thể:
- Thêm quỹ mới
- Chỉnh sửa quỹ
- Xem lịch sử giao dịch của quỹ

Hiển thị tổng quỹ toàn hệ thống.

====================================================
XII. KIỂM KÊ CUỐI CA
====================================================

Điểm truy cập:
- Sidebar → Kiểm kê cuối ca

Mục tiêu:
Đối chiếu số tiền thực tế với số tiền trên hệ thống.

Luồng:

1. Chọn quỹ cần kiểm kê (ví dụ: Két thu ngân ca sáng)

2. Hiển thị:
    - Số dư trên hệ thống
    - Ô nhập số tiền thực tế đếm được

3. Hệ thống tính:
    Chênh lệch = Thực tế - Hệ thống

4. Nếu có chênh lệch:
    - Hiển thị cảnh báo:
        + Thừa tiền
        + Thiếu tiền
    - Yêu cầu nhập lý do

5. Nút:
    + Hoàn tất kiểm kê & Kết ca
    + Xuất báo cáo

Tóm tắt ca làm việc:
- Tổng thu
- Tổng chi
- Số giao dịch
- Lợi nhuận ca

====================================================
XIII. TƯƠNG TÁC GIỮA CÁC MODULE
====================================================

1. Tạo Phiếu → Cập nhật Quỹ → Cập nhật Sổ Thu Chi
2. Công nợ → Thanh toán → Sinh Phiếu → Cập nhật Quỹ
3. QR Thu Nợ → Auto tạo Phiếu Thu → Gạch công nợ
4. Kiểm kê → Nếu chênh lệch → Có thể sinh Phiếu điều chỉnh
5. Dashboard → Tổng hợp dữ liệu từ tất cả module

====================================================
XIV. NGUYÊN TẮC THIẾT KẾ
====================================================

- Mọi dòng tiền phải đi qua Phiếu giao dịch.
- Mọi công nợ phải có khả năng truy ngược về giao dịch gốc.
- Số dư quỹ = Tổng Thu - Tổng Chi.
- Không cho phép số dư âm (trừ khi cấu hình cho phép).
- Mọi thay đổi đều có log.

====================================================
XV. MỤC TIÊU SẢN PHẨM
====================================================

- Minh bạch dòng tiền
- Tự động hóa công nợ
- Giảm thao tác thủ công
- Hạn chế sai sót
- Kiểm soát tiền mặt theo ca