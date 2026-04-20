# Part 02 — Lễ tân

## Phạm vi

Phân hệ **Lễ tân** là hub vận hành hằng ngày tại quầy. Bao gồm 4 module: **Quản lý ca làm việc**, **Bán hàng tại quầy (POS)**, **Check-in/Cửa vào**, **Trừ quota dịch vụ**.

**Actors chính:** Receptionist (chính), Branch Manager (giám sát), Technician (trừ quota).

**Phụ thuộc nghiệp vụ:**
- Để bán hàng → phải có ca đang mở.
- Để check-in → khách phải có gói thành viên còn hạn.
- Để trừ quota → khách phải có quota còn dư trong gói.

### Sơ đồ Use Case

![Use Case Diagram — Phân hệ Lễ tân](./diagrams/03-usecase-reception.png)

### Vòng đời Ca làm việc (State Machine)

![State Machine — Ca làm việc từ Chưa vào ca → Đóng ca](./diagrams/09-state-shift.png)

### Workflow một ngày làm việc

![Activity Diagram — Luồng vận hành 1 ca làm việc đầy đủ](./diagrams/12-workflow-shift.png)

---

## A. Quản lý ca làm việc

### UR-RECEPTION-01 — Mở ca đầu giờ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-01 |
| **Tên** | Cho phép nhân viên mở ca làm việc |
| **Actor** | Receptionist |
| **Mô tả** | Trước khi bán hàng, nhân viên phải mở một ca làm việc bằng cách chọn cấu hình ca (đã setup trước ở Part 11) và khai báo số tiền mặt thực tế đang có trong két. |
| **Tiền điều kiện** | • Đã đăng nhập (UR-ACCESS-01).<br>• Đang ở cơ sở có cấu hình ca.<br>• Không có ca khác đang mở của chính mình tại cơ sở này (CN-02). |
| **Đầu vào** | Chọn cấu hình ca + nhập tiền đầu ca theo 1 trong 2 chế độ:<br>• **Tổng tiền**: 1 ô số duy nhất<br>• **Theo mệnh giá**: bảng 9 mệnh giá VNĐ (500k → 1k) với số tờ |
| **Ràng buộc đầu vào** | • Tiền > 0 (bắt buộc)<br>• Số nguyên, không thập phân<br>• Format hiển thị có dấu phẩy ngăn cách nghìn |
| **Đầu ra** | • Trạng thái cơ sở: có ca đang mở, gắn với userId<br>• Lưu thời điểm bắt đầu, người mở, tiền đầu ca<br>• Người dùng được chuyển sang tab "Đang ca" |
| **Tiêu chí chấp nhận** | 1. Bỏ trống tiền → báo lỗi *"Vui lòng nhập số tiền đầu ca"*.<br>2. Tiền = 0 → cho phép nếu cấu hình ca cho phép, ngược lại báo lỗi.<br>3. Sau khi mở, các tác vụ Bán hàng, Check-in, Trừ quota mới được phép.<br>4. Nếu đã có ca đang mở của user này → không cho mở thêm, redirect về tab "Đang ca". |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-02 — Theo dõi ca đang mở

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-02 |
| **Tên** | Hiển thị trạng thái thời gian thực của ca |
| **Actor** | Receptionist, Branch Manager |
| **Mô tả** | Trong khi ca đang mở, người dùng phải xem được: thời gian đã trôi, tiền đầu ca, tổng thu thực tế trong ca, tổng tất cả phương thức thanh toán, chênh lệch (sẽ tính lúc đóng ca). Có nút truy cập nhanh đến POS và danh sách đơn trong ca. |
| **Tiêu chí chấp nhận** | 1. Đồng hồ đếm giờ định dạng `HH:MM:SS`, refresh mỗi giây.<br>2. Các thẻ KPI cập nhật real-time hoặc near-real-time (≤ 30s) sau mỗi giao dịch.<br>3. Có nút **Bán hàng tại POS** mở thẳng /create_sale_add.<br>4. Có nút **Danh sách đơn trong ca** chuyển sang tab Đơn trong ca.<br>5. Có nút **Kết thúc ca** (đỏ) để chuyển sang flow đóng ca. |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-03 — Xem đơn trong ca

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-03 |
| **Tên** | Liệt kê các đơn được tạo trong ca hiện tại |
| **Actor** | Receptionist |
| **Mô tả** | Người dùng có thể xem nhanh tất cả đơn đã tạo từ lúc mở ca, kèm các chỉ số tổng (số đơn, tổng doanh thu, công nợ phát sinh, giờ trung bình giữa các đơn). |
| **Tiêu chí chấp nhận** | 1. Filter theo trạng thái thanh toán + trạng thái xử lý.<br>2. Search theo mã đơn.<br>3. Bấm vào đơn → mở chi tiết đơn (như Part 04).<br>4. Khi chưa có đơn → empty state thân thiện. |
| **Mức ưu tiên** | **S** |

### UR-RECEPTION-04 — Đóng ca cuối giờ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-04 |
| **Tên** | Đóng ca và đối soát quỹ |
| **Actor** | Receptionist, Branch Manager |
| **Mô tả** | Cuối ca, nhân viên phải kiểm két thực tế, nhập số tiền hệ thống tính được vs số tiền thực tế, ghi chú chênh lệch nếu có. |
| **Đầu vào** | Tiền mặt xuất ca (theo tổng hoặc mệnh giá) + ghi chú lý do nếu chênh lệch ≠ 0. |
| **Đầu ra** | • Ca chuyển sang trạng thái "Đã đóng".<br>• Sinh báo cáo kết ca.<br>• Sau khi đóng, không thể tạo đơn mới với ca này.<br>• Mọi giao dịch tiền mặt được "chốt" vào ca. |
| **Tiêu chí chấp nhận** | 1. Chênh lệch ≠ 0 → bắt buộc nhập ghi chú lý do.<br>2. Cho phép đóng ca có chênh lệch (không chặn cứng) nhưng audit lại.<br>3. Sau khi đóng, hệ thống tự chuyển sang tab Báo cáo kết ca.<br>4. Người dùng không thể "mở lại" ca đã đóng (chỉ admin tenant có quyền force-reopen, nếu được cấp). |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-05 — Báo cáo kết ca

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-05 |
| **Tên** | Sinh báo cáo chi tiết sau đóng ca |
| **Actor** | Receptionist, Branch Manager |
| **Mô tả** | Sau khi đóng ca, hệ thống tự sinh báo cáo gồm: 4 chỉ số tổng (Tiền mặt / NH / Thẻ / Ví), bảng chi tiết các khoản, thông tin ca (mã ca, ngày, giờ vào/ra, nhân viên, chênh lệch). |
| **Tiêu chí chấp nhận** | 1. Có nút **In bảng cáo** (in trực tiếp ra máy in).<br>2. Có nút **Xuất Excel** tải `.xlsx`.<br>3. Có nút **Gửi Quản lý** đẩy báo cáo vào hộp thư của người quản lý cơ sở.<br>4. Báo cáo lưu vĩnh viễn, có thể tra cứu sau qua **Báo cáo tổng quan**. |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-06 — Báo cáo tổng quan ca

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-06 |
| **Tên** | Thống kê tổng hợp các ca đã đóng |
| **Actor** | Branch Manager, Tenant Admin |
| **Mô tả** | Quản lý phải xem được tổng hợp các ca đã đóng theo ngày/tuần/tháng: số ca, số nhân viên trực, chênh lệch tích lũy, hiện trạng ca đang mở. |
| **Tiêu chí chấp nhận** | 1. Filter theo cơ sở, theo nhân viên, theo kỳ.<br>2. Bấm vào một ca → mở báo cáo kết ca chi tiết của ca đó.<br>3. Xuất Excel tổng hợp. |
| **Mức ưu tiên** | **S** |

---

## B. Bán hàng tại quầy (POS)

### UR-RECEPTION-07 — Tạo đơn bán hàng tại POS

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-07 |
| **Tên** | Bán sản phẩm/dịch vụ qua màn POS |
| **Actor** | Receptionist |
| **Mô tả** | Nhân viên có một màn hình POS chia 2 cột: bên trái là lưới sản phẩm/dịch vụ có lọc theo danh mục + ô tìm kiếm + máy quét mã vạch; bên phải là giỏ hàng + thông tin khách + nút thanh toán. |
| **Tiền điều kiện** | Có ca đang mở (UR-RECEPTION-01). |
| **Tiêu chí chấp nhận** | 1. Lưới sản phẩm hiển thị tên, ảnh, giá, badge khuyến mãi.<br>2. Bấm card → thêm vào giỏ; nếu có biến thể → mở modal chọn biến thể.<br>3. Trong giỏ: cho phép thay đổi số lượng, xóa món.<br>4. Tự động tính tổng tiền hàng + thuế + chiết khấu = tổng thanh toán.<br>5. Hỗ trợ máy quét mã vạch (cắm USB) — focus vào ô tìm + quét → sản phẩm tự nhảy vào giỏ. |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-08 — Thêm nhanh sản phẩm/dịch vụ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-08 |
| **Tên** | Quick Add — thêm mặt hàng phát sinh không có trong danh mục |
| **Actor** | Receptionist |
| **Mô tả** | Khi khách yêu cầu một dịch vụ/phụ thu chưa có trong danh mục, nhân viên có thể thêm nhanh trực tiếp vào giỏ mà không phải tạo trong danh mục chính. |
| **Đầu vào** | Tên (bắt buộc, không trống), Đơn giá (bắt buộc, > 0), Đơn vị (chọn từ 10 lựa chọn: Cái/Chiếc/Hộp/Kg/Gram/Lít/Bộ/Dịch vụ/Giờ/Lần). |
| **Tiêu chí chấp nhận** | 1. Validation đầy đủ với thông báo lỗi rõ ràng.<br>2. Mặt hàng quick add KHÔNG được lưu vào danh mục chính.<br>3. Mặt hàng quick add KHÔNG trừ tồn kho.<br>4. Có preview trước khi xác nhận thêm vào giỏ. |
| **Mức ưu tiên** | **S** |
| **Ghi chú** | Để phân biệt với sản phẩm chính, ID có prefix `quick_`. |

### UR-RECEPTION-09 — Gắn khách vào đơn POS

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-09 |
| **Tên** | Liên kết khách hàng với đơn để tích điểm + lịch sử |
| **Actor** | Receptionist |
| **Mô tả** | Khi đơn bán cho hội viên, nhân viên có thể tìm khách hiện có hoặc thêm mới ngay trong giỏ hàng (qua slide panel "Thêm nhanh thành viên"). |
| **Tiêu chí chấp nhận** | 1. Search khách theo tên/SĐT/mã, có debounce.<br>2. Hiển thị card khách kèm tên, gói, công nợ, điểm tích lũy hiện tại.<br>3. Có nút **+ Thêm mới** mở slide panel với form ngắn (xem UR-MEMBER-02).<br>4. Sau khi gắn khách, đơn được ghi nhận vào lịch sử của khách. |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-10 — Áp dụng khuyến mãi/voucher cho đơn

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-10 |
| **Tên** | Áp khuyến mãi và voucher giấy lên đơn POS |
| **Actor** | Receptionist |
| **Mô tả** | Trong giỏ hàng, có nút mở modal khuyến mãi liệt kê các chương trình KM đủ điều kiện và chưa đủ điều kiện; có ô nhập mã voucher rời. |
| **Tiêu chí chấp nhận** | 1. Modal hiện 2 nhóm rõ ràng: **Đủ điều kiện** + **Chưa đủ điều kiện** (kèm lý do).<br>2. Bấm **Chọn** → áp KM → giỏ cập nhật dòng giảm giá.<br>3. Voucher sai/hết hạn/đã dùng → hiện thông báo lỗi cụ thể.<br>4. Có thể áp đồng thời nhiều KM nếu cấu hình cho phép (xem UR-MKT-01). |
| **Mức ưu tiên** | **S** |

### UR-RECEPTION-11 — Thanh toán đa phương thức

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-11 |
| **Tên** | Hỗ trợ nhiều phương thức thanh toán trong cùng một đơn |
| **Actor** | Receptionist |
| **Mô tả** | Modal thanh toán cho phép chọn nhiều phương thức cùng lúc (vd nửa cash, nửa CK), tính tiền thừa, tùy chọn ghi nợ. |
| **Đầu vào** | Phương thức + số tiền cho mỗi phương thức + tùy chọn ghi nợ + ghi chú. |
| **Tiêu chí chấp nhận** | 1. Cho phép thanh toán Tiền mặt / Chuyển khoản / Thẻ / Ví điện tử (theo cấu hình tenant).<br>2. Tổng tiền các phương thức = Tổng đơn (nếu không ghi nợ) hoặc < Tổng đơn (nếu ghi nợ).<br>3. Tự tính tiền thừa với tiền mặt.<br>4. Khi ghi nợ → BẮT BUỘC đã gắn khách vào đơn (UR-RECEPTION-09).<br>5. Sau khi xác nhận → in hóa đơn, reset giỏ, sẵn sàng cho đơn mới. |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-12 — Lưu đơn tạm

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-12 |
| **Tên** | Lưu đơn nháp để xử lý sau |
| **Actor** | Receptionist |
| **Mô tả** | Khi khách bỏ ngang hoặc nhân viên cần xử lý khách khác trước, có thể lưu giỏ hàng hiện tại làm đơn tạm và tiếp tục sau. |
| **Tiêu chí chấp nhận** | 1. Đơn tạm KHÔNG trừ tồn, KHÔNG ghi doanh thu.<br>2. Có tab riêng **Đơn tạm** để xem danh sách.<br>3. Bấm **Tiếp tục** → load lại giỏ vào màn POS.<br>4. Đơn tạm tự xóa sau N ngày không xử lý (cấu hình ở Part 11). |
| **Mức ưu tiên** | **S** |

### UR-RECEPTION-13 — In hóa đơn nhiệt / A4

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-13 |
| **Tên** | In hóa đơn sau thanh toán |
| **Actor** | Receptionist |
| **Mô tả** | Sau khi xác nhận thanh toán, hệ thống mở dialog in hóa đơn theo khổ giấy đã cấu hình (A4 / A5 / 80mm / 58mm). Có thể gửi qua SMS/Email thay vì in. |
| **Tiêu chí chấp nhận** | 1. Hóa đơn chứa: header tenant, mã đơn, ngày giờ, tên nhân viên, danh sách item, tổng tiền, phương thức thanh toán, footer, QR tra cứu (nếu bật).<br>2. Hỗ trợ in trực tiếp qua máy in nhiệt 80mm/58mm.<br>3. Tùy chọn gửi PDF qua email khách.<br>4. Tùy chọn gửi link tra cứu qua SMS. |
| **Mức ưu tiên** | **M** |

---

## C. Check-in / Cửa vào

### UR-RECEPTION-14 — Check-in qua quét thẻ/QR

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-14 |
| **Tên** | Ghi nhận khách đến qua thiết bị đọc thẻ/QR |
| **Actor** | Receptionist |
| **Mô tả** | Khách hội viên đến cơ sở quét thẻ RFID hoặc QR trên app điện thoại để check-in. Hệ thống hiện popup thông tin khách + quota còn lại. |
| **Tiêu chí chấp nhận** | 1. Hỗ trợ thiết bị đọc USB tiêu chuẩn HID (giả lập gõ phím).<br>2. Popup hiện: avatar, tên, gói thành viên, ngày hết hạn, danh sách quota theo dịch vụ.<br>3. Trạng thái thẻ:<br>   • ✅ Active → cho phép check-in<br>   • ⚠️ Sắp hết hạn / sắp hết quota → cho phép nhưng cảnh báo<br>   • ❌ Expired → chặn, gợi ý gia hạn.<br>4. Có nút giả lập quét cho môi trường test/đào tạo. |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-15 — Check-in thủ công

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-15 |
| **Tên** | Tìm khách thủ công khi không có thẻ |
| **Actor** | Receptionist |
| **Mô tả** | Khi khách quên thẻ / điện thoại hết pin, nhân viên có thể tìm khách bằng SĐT, tên, mã thành viên trong ô **Tìm thủ công**. |
| **Tiêu chí chấp nhận** | 1. Search có debounce.<br>2. Nhiều kết quả → list chọn.<br>3. Sau khi chọn → popup giống quét thẻ. |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-16 — Chọn khu vực sử dụng dịch vụ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-16 |
| **Tên** | Phân loại check-in theo khu vực |
| **Actor** | Receptionist |
| **Mô tả** | Sau khi xác nhận khách, nhân viên chọn khu vực khách sẽ vào (Co-working / Spa / Phòng riêng / khác). Hệ thống ghi nhận để báo cáo lưu lượng. |
| **Tiêu chí chấp nhận** | 1. Danh sách khu vực do tenant cấu hình.<br>2. Mỗi check-in có 1 record với (khách, khu vực, hướng IN/OUT, thời gian, người ghi nhận).<br>3. Có thể check-out (ghi nhận khách rời) bằng nút riêng. |
| **Mức ưu tiên** | **S** |

### UR-RECEPTION-17 — Lịch sử check-in gần đây

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-17 |
| **Tên** | Hiển thị các lượt check-in gần nhất |
| **Actor** | Receptionist |
| **Mô tả** | Trên màn check-in, phần dưới hiển thị 15 lượt check-in/check-out gần nhất trong ngày hiện tại để nhân viên biết ai đang ở trong cơ sở. |
| **Tiêu chí chấp nhận** | 1. Mỗi dòng: giờ, tên, hướng (▶ Vào / ◀ Ra), khu vực.<br>2. Cập nhật real-time hoặc poll ≤ 30 giây. |
| **Mức ưu tiên** | **C** — Could |

---

## D. Trừ quota dịch vụ

### UR-RECEPTION-18 — Trừ một suất dịch vụ trong gói

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-18 |
| **Tên** | Ghi nhận khách đã sử dụng 1 suất dịch vụ trong gói |
| **Actor** | Receptionist, Technician |
| **Mô tả** | Sau khi khách dùng xong dịch vụ thuộc gói thành viên (vd 1 lần massage), nhân viên trừ suất khỏi quota. |
| **Tiền điều kiện** | Khách có gói còn hiệu lực + dịch vụ đó còn quota > 0. |
| **Tiêu chí chấp nhận** | 1. Tìm khách → chọn dịch vụ từ lưới icon → bấm **Xác nhận trừ quota**.<br>2. Nếu quota dịch vụ đó = 0 → nút bị mờ, không cho thực hiện.<br>3. Hệ thống ghi log: khách, dịch vụ, thời gian, người trừ.<br>4. Quota của khách giảm 1 ngay lập tức trong hệ thống.<br>5. Toast confirm sau khi thành công. |
| **Mức ưu tiên** | **M** |

### UR-RECEPTION-19 — Đặt lịch booking

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-19 |
| **Tên** | Đặt slot giờ cho dịch vụ có lịch |
| **Actor** | Receptionist, Technician |
| **Mô tả** | Cho các dịch vụ cần giữ slot giờ (massage 60 phút, lớp yoga…), nhân viên chọn dịch vụ → xem lưới slot trống → đặt cho khách cụ thể. |
| **Tiêu chí chấp nhận** | 1. Lưới slot hiển thị theo ngày + theo dịch vụ.<br>2. Slot trống có thể đặt; slot đã có khách hiển thị tên khách (read-only).<br>3. Đặt thành công → khi khách đến đúng giờ, check-in bình thường (UR-RECEPTION-14).<br>4. Có thể hủy đặt nếu chưa đến giờ. |
| **Mức ưu tiên** | **S** |

### UR-RECEPTION-20 — Bán thẻ / gói thành viên tại quầy

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-RECEPTION-20 |
| **Tên** | POS-style để bán gói thành viên cho khách mới/gia hạn |
| **Actor** | Receptionist |
| **Mô tả** | Màn riêng để bán gói thành viên: lưới các gói (đã định nghĩa ở Part 11) bên trái + cột thanh toán bên phải gồm chọn khách + chọn gói + phương thức thanh toán. |
| **Tiêu chí chấp nhận** | 1. Mỗi card gói hiển thị: tên, giá, thời hạn, mô tả ngắn, danh sách dịch vụ kèm + quota.<br>2. Có thể chọn khách hiện có hoặc tạo mới qua slide panel.<br>3. Sau khi xác nhận → tạo thẻ mới (hoặc gia hạn thẻ cũ), cộng quota dịch vụ, in hóa đơn.<br>4. Toast hiển thị: tên gói, giá, thời hạn. |
| **Mức ưu tiên** | **M** |

---

## Tóm tắt yêu cầu Part 02

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-RECEPTION-01 | Mở ca đầu giờ | M |
| UR-RECEPTION-02 | Theo dõi ca đang mở | M |
| UR-RECEPTION-03 | Xem đơn trong ca | S |
| UR-RECEPTION-04 | Đóng ca cuối giờ | M |
| UR-RECEPTION-05 | Báo cáo kết ca | M |
| UR-RECEPTION-06 | Báo cáo tổng quan ca | S |
| UR-RECEPTION-07 | Tạo đơn POS | M |
| UR-RECEPTION-08 | Quick add sản phẩm | S |
| UR-RECEPTION-09 | Gắn khách vào đơn | M |
| UR-RECEPTION-10 | Áp khuyến mãi/voucher | S |
| UR-RECEPTION-11 | Thanh toán đa phương thức | M |
| UR-RECEPTION-12 | Lưu đơn tạm | S |
| UR-RECEPTION-13 | In hóa đơn | M |
| UR-RECEPTION-14 | Check-in quét thẻ/QR | M |
| UR-RECEPTION-15 | Check-in thủ công | M |
| UR-RECEPTION-16 | Chọn khu vực check-in | S |
| UR-RECEPTION-17 | Lịch sử check-in gần đây | C |
| UR-RECEPTION-18 | Trừ quota dịch vụ | M |
| UR-RECEPTION-19 | Đặt lịch booking | S |
| UR-RECEPTION-20 | Bán gói thành viên | M |

**Tổng:** 20 yêu cầu — 11 Must, 8 Should, 1 Could.

---

*Hết Part 02.*
