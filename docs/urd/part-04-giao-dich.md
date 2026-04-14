# Part 04 — Giao dịch

## Phạm vi

Phân hệ **Giao dịch** quản lý vòng đời sau-bán: tra cứu đơn đã tạo, in/gửi lại hóa đơn, phát hành hóa đơn VAT điện tử, xử lý vận chuyển, trả/đổi hàng. Phân hệ này KHÔNG tạo đơn mới (đó là việc của POS Part 02).

**Actors chính:** Receptionist (xử lý thường ngày), Accountant (VAT, đối soát), Branch Manager (giám sát), Tenant Admin (cấu hình).

---

## A. Danh sách đơn

### UR-SALE-01 — Danh sách đơn theo kỳ với panel chi tiết

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-01 |
| **Tên** | Tra cứu đơn hàng đã tạo |
| **Actor** | Staff |
| **Mô tả** | Hiển thị danh sách đơn theo cơ sở đang chọn, có lọc khoảng thời gian và tab trạng thái. Click vào đơn → mở panel chi tiết bên phải. |
| **Đầu vào** | • Từ ngày — Đến ngày (mặc định hôm nay)<br>• Tab trạng thái: Tất cả / Chờ xử lý / Đang giao / Hoàn thành / Đã hủy<br>• Search: mã đơn / tên khách / SĐT |
| **Tiêu chí chấp nhận** | 1. Card mỗi đơn hiển thị: mã, tên khách, tổng tiền, trạng thái, giờ.<br>2. Panel chi tiết hiển thị: thông tin khách, danh sách item, tổng tiền + giảm + VAT, lịch sử thanh toán, trạng thái.<br>3. Khoảng tối đa 365 ngày (CN performance).<br>4. Audit Excel button xuất danh sách hiện tại. |
| **Mức ưu tiên** | **M** |

### UR-SALE-02 — Hành động trên đơn

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-02 |
| **Tên** | Các thao tác trên một đơn cụ thể |
| **Actor** | Staff (theo quyền) |
| **Mô tả** | Trên panel chi tiết hoặc menu 3-chấm của card, người dùng có các hành động: in lại, gửi lại, thu nợ, trả hàng, xuất VAT, hủy. |
| **Tiêu chí chấp nhận** | 1. **In hóa đơn** — mở preview, cho chọn máy in.<br>2. **Gửi SMS/Email** — gửi lại hóa đơn cho khách.<br>3. **Thanh toán còn nợ** — mở modal thu nợ (gọi UR-FIN-09).<br>4. **Trả hàng** — mở form hoàn (UR-SALE-08).<br>5. **Xuất hóa đơn VAT** — chuyển sang Part 04.B.<br>6. **Hủy đơn** — chỉ cho phép khi chưa thanh toán; ghi log lý do.<br>7. CN-03: đơn đã thanh toán không thể xóa, chỉ có thể hoàn / hủy. |
| **Mức ưu tiên** | **M** |

### UR-SALE-03 — Audit/Export đơn theo kỳ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-03 |
| **Tên** | Xuất file kiểm toán đơn hàng |
| **Actor** | Accountant, Branch Manager |
| **Mô tả** | Xuất `.xlsx` chứa toàn bộ đơn trong khoảng thời gian đã lọc, mỗi dòng = 1 đơn (hoặc 1 dòng/sản phẩm tùy tùy chọn), kèm cột phương thức thanh toán, công nợ, nhân viên tạo, ca. |
| **Tiêu chí chấp nhận** | 1. Filter trước khi xuất.<br>2. Tùy chọn: 1 dòng/đơn hoặc 1 dòng/sản phẩm.<br>3. Nén file nếu > 50.000 dòng. |
| **Mức ưu tiên** | **S** |

---

## B. Hóa đơn VAT

### UR-SALE-04 — Phát hành hóa đơn VAT từ đơn bán

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-04 |
| **Tên** | Sinh và gửi hóa đơn điện tử VAT |
| **Actor** | Accountant, Receptionist (theo quyền) |
| **Mô tả** | Cho phép phát hành hóa đơn VAT điện tử bằng cách chọn đơn bán đã có hoặc nhập thủ công. Hệ thống tự ký số + đẩy lên cơ quan thuế qua nhà cung cấp đã tích hợp. |
| **Đầu vào — Người mua** | • **Tên người mua/công ty** (M)<br>• **MST** (M nếu doanh nghiệp, 10 hoặc 13 chữ số)<br>• **Địa chỉ** (M, ≤ 255)<br>• **Email nhận hóa đơn** (M, valid)<br>• **Hình thức thanh toán** (M, Tiền mặt/CK/Thẻ/TM+CK) |
| **Tiền điều kiện** | Tenant đã cấu hình tích hợp hóa đơn điện tử (UR-INT-XX) + có chứng thư số còn hạn. |
| **Tiêu chí chấp nhận** | 1. Nguồn tạo: từ đơn bán (copy info) hoặc nhập thủ công.<br>2. Bảng hàng hóa cho phép chỉnh thuế suất 0/5/8/10%.<br>3. Sau phát hành: trả về mã tra cứu, gửi email cho khách tự động.<br>4. Lỗi *"Chữ ký số không hợp lệ"*, *"MST không tồn tại"*, *"Tổng tiền không khớp"* phải được hiển thị rõ ràng. |
| **Mức ưu tiên** | **M** |
| **Ghi chú** | CN-04: hóa đơn VAT đã phát hành không sửa được, chỉ hủy + phát hành lại. |

### UR-SALE-05 — Tra cứu hóa đơn VAT đã phát hành

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-05 |
| **Tên** | Danh sách hóa đơn VAT theo kỳ |
| **Actor** | Accountant |
| **Mô tả** | Hiển thị danh sách hóa đơn VAT đã phát hành để tra cứu, kèm trạng thái (Đã phát hành / Đã hủy / Lỗi), in lại, gửi lại email. |
| **Tiêu chí chấp nhận** | 1. Filter theo kỳ + người mua + MST.<br>2. Bấm vào hóa đơn → xem PDF nhúng trực tiếp.<br>3. Có nút **In** và **Gửi lại email**.<br>4. Có nút **Hủy hóa đơn** (chỉ với hóa đơn không quá hạn quy định pháp luật). |
| **Mức ưu tiên** | **M** |

---

## C. Vận chuyển

### UR-SALE-06 — Tích hợp đơn vị vận chuyển

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-06 |
| **Tên** | Tạo đơn giao và push sang đơn vị vận chuyển |
| **Actor** | Receptionist, Branch Manager |
| **Mô tả** | Khi khách chọn "Giao tận nơi", hệ thống tạo đơn giao và push sang đơn vị vận chuyển đã cấu hình (GHN, GHTK, J&T, ViettelPost, ShopeeExpress) qua API, lấy về mã vận đơn. |
| **Tiêu chí chấp nhận** | 1. Tạo từ POS lúc thanh toán (auto) hoặc từ danh sách đơn (thủ công).<br>2. Cho phép chọn đơn vị, dịch vụ, lấy phí dự kiến từ API.<br>3. Sau khi gửi → lưu mã vận đơn, cập nhật trạng thái qua webhook callback. |
| **Mức ưu tiên** | **S** |

### UR-SALE-07 — Theo dõi trạng thái vận chuyển

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-07 |
| **Tên** | Bảng theo dõi đơn đang giao |
| **Actor** | Receptionist, CSKH |
| **Mô tả** | Trang riêng hiển thị các đơn đang giao với cập nhật real-time / poll từ đơn vị vận chuyển. |
| **Tiêu chí chấp nhận** | 1. Cột: mã đơn, khách nhận, địa chỉ, đơn vị vận chuyển, mã vận đơn, trạng thái, ngày dự kiến.<br>2. Trạng thái: Chờ lấy / Đang giao / Giao thành công / Giao thất bại / Đã hoàn.<br>3. Bấm vào → xem tracking chi tiết.<br>4. Có alert khi đơn ở trạng thái "Giao thất bại". |
| **Mức ưu tiên** | **S** |

---

## D. Trả hàng / Hoàn đơn

### UR-SALE-08 — Tạo phiếu hoàn hàng

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SALE-08 |
| **Tên** | Xử lý trả/đổi hàng |
| **Actor** | Receptionist, Branch Manager |
| **Mô tả** | Từ một đơn bán đã thanh toán, nhân viên có thể tạo phiếu hoàn từng phần hoặc toàn bộ, chọn cách hoàn tiền và lý do. |
| **Đầu vào** | Bảng item của đơn gốc, với:<br>• **Số lượng trả** (M, > 0 và ≤ số đã mua)<br>• **Lý do** (M, dropdown: Không vừa ý / Lỗi sản phẩm / Đổi sang sản phẩm khác / Khác)<br>• **Ghi chú** (tùy chọn)<br>• **Cách hoàn**: Tiền mặt / Chuyển khoản (kèm STK) / Tín dụng cửa hàng |
| **Tiêu chí chấp nhận** | 1. Phiếu hoàn có mã riêng (vd `RT00001`) và liên kết đơn gốc.<br>2. Đơn gốc hiển thị badge "Đã trả một phần" hoặc "Đã trả toàn bộ".<br>3. Sản phẩm vật lý được cộng lại tồn kho tự động (trừ khi chọn "không nhập kho").<br>4. Tiền mặt được xuất khỏi quỹ (sinh phiếu chi tự động ở Part 06).<br>5. Tích hợp với "Tạo đơn mới thay thế" — checkbox để mở luôn POS với danh sách thay thế.<br>6. CN-03: không thể xóa, chỉ có thể hủy phiếu hoàn (ghi audit). |
| **Mức ưu tiên** | **M** |

---

## Tóm tắt yêu cầu Part 04

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-SALE-01 | Danh sách đơn + chi tiết | M |
| UR-SALE-02 | Hành động trên đơn | M |
| UR-SALE-03 | Audit/Export đơn | S |
| UR-SALE-04 | Phát hành hóa đơn VAT | M |
| UR-SALE-05 | Tra cứu hóa đơn VAT | M |
| UR-SALE-06 | Tích hợp vận chuyển | S |
| UR-SALE-07 | Theo dõi vận chuyển | S |
| UR-SALE-08 | Trả hàng / Hoàn đơn | M |

**Tổng:** 8 yêu cầu — 5 Must, 3 Should.

---

*Hết Part 04.*
