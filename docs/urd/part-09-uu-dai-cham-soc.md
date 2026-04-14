# Part 09 — Ưu đãi & Chăm sóc

## Phạm vi

Phân hệ **Ưu đãi & Chăm sóc** là công cụ giữ chân khách và kéo khách mới. Bao gồm: **Khuyến mãi & Voucher**, **Tích điểm hội viên (loyalty)**, **Chiến dịch marketing đa kênh**, **Chăm sóc thành viên (task automation)**.

**Actors chính:** Marketer (chính), Branch Manager (duyệt), Receptionist (thực hiện task chăm sóc), CSKH.

---

## A. Khuyến mãi & Voucher

### UR-MKT-01 — Tạo chương trình khuyến mãi

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-01 |
| **Tên** | Cấu hình chương trình giảm giá |
| **Actor** | Marketer, Branch Manager |
| **Mô tả** | Tenant phải tạo được nhiều loại khuyến mãi: giảm theo %, giảm theo số tiền, mua N tặng M, combo giá, flash sale, voucher code, freebies (tặng quà). |
| **Đầu vào** | • **Tên CT** (M, ≤ 255)<br>• **Mã CT** (S, slug)<br>• **Loại** (M, 6 loại: %/Tiền/Mua tặng/Combo/Flash sale/Voucher)<br>• **Giá trị giảm** (M, theo loại)<br>• **Áp dụng cho** (M, Toàn bộ/Danh mục/Sản phẩm)<br>• **Điều kiện tối thiểu** (S, đơn ≥ X)<br>• **Giới hạn giảm tối đa** (S, ≤ Y)<br>• **Đối tượng khách** (M, Tất cả/Theo hạng/Theo nhóm/Khách mới)<br>• **Ngày bắt đầu/kết thúc** (M, datetime, end > start)<br>• **Giới hạn lượt dùng tổng** (S)<br>• **Giới hạn lượt dùng/khách** (S)<br>• **Mã voucher** (S, ≤ 20 ký tự, in hoa, không dấu)<br>• **Mô tả/Điều khoản** (S, ≤ 2000)<br>• **Ảnh banner** (S, ≤ 5MB)<br>• **Trạng thái** (M, Nháp/Đang chạy/Đã kết thúc/Tạm dừng) |
| **Tiêu chí chấp nhận** | 1. Validation đầy đủ.<br>2. Cho phép lưu Nháp (chưa kích hoạt).<br>3. Có nút **Kích hoạt** chuyển sang Đang chạy.<br>4. Hệ thống tự chuyển sang Đã kết thúc khi quá ngày kết thúc.<br>5. Modal Khuyến mãi trên POS (UR-RECEPTION-10) chỉ hiện CT có status = Đang chạy + đủ điều kiện. |
| **Mức ưu tiên** | **M** |

### UR-MKT-02 — Tạo lô voucher giấy

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-02 |
| **Tên** | Sinh hàng loạt mã voucher để in giấy |
| **Actor** | Marketer |
| **Mô tả** | Trong một chương trình khuyến mãi có sẵn, tenant có thể sinh lô voucher (vd 1000 mã) với prefix riêng để in lên giấy phát cho khách. |
| **Tiêu chí chấp nhận** | 1. Số lượng + prefix + thời hạn từng voucher.<br>2. Mỗi voucher có mã unique.<br>3. Xuất Excel danh sách mã để in.<br>4. Audit ai sinh, lúc nào, bao nhiêu mã. |
| **Mức ưu tiên** | **C** |

### UR-MKT-03 — Theo dõi hiệu quả khuyến mãi

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-03 |
| **Tên** | KPI cho mỗi chương trình KM |
| **Actor** | Marketer, Branch Manager |
| **Mô tả** | Trong danh sách chương trình, mỗi CT hiển thị: số lượt dùng/giới hạn, doanh thu sinh ra, chi phí giảm giá, ROI. |
| **Tiêu chí chấp nhận** | 1. Cập nhật real-time hoặc near-real-time.<br>2. Bấm vào CT → drill-down các đơn cụ thể đã dùng. |
| **Mức ưu tiên** | **S** |

---

## B. Tích điểm hội viên (Loyalty)

### UR-MKT-04 — Quản lý ví điểm khách hàng

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-04 |
| **Tên** | Lưu trữ + hiển thị điểm tích lũy mỗi khách |
| **Actor** | Receptionist (xem), Marketer (cấu hình quy tắc) |
| **Mô tả** | Mỗi khách có một ví điểm với số dư hiện tại, lịch sử các giao dịch tích/đổi điểm, điểm đã hết hạn (nếu có cấu hình hạn dùng điểm). |
| **Tiêu chí chấp nhận** | 1. Trên hồ sơ khách hiển thị điểm hiện có.<br>2. Có tab **Lịch sử điểm**: ngày, loại (Tích/Đổi/Điều chỉnh), giá trị (+/-), số dư sau, lý do.<br>3. Có thể điều chỉnh thủ công (UR-MKT-06). |
| **Mức ưu tiên** | **S** |

### UR-MKT-05 — Cấu hình quy tắc tích/đổi điểm

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-05 |
| **Tên** | Định nghĩa cách khách kiếm và đổi điểm |
| **Actor** | Marketer, Tenant Admin |
| **Mô tả** | Tenant cấu hình các quy tắc: mua bao nhiêu được bao nhiêu điểm, đổi điểm lấy gì, áp dụng cho ai, hiệu lực. |
| **Đầu vào** | • **Tên quy tắc** (M)<br>• **Loại** (M, Tích/Đổi)<br>• **Điều kiện áp dụng** (M, vd "Đơn ≥ 100k")<br>• **Tỷ lệ** (M, vd "10.000đ = 1 điểm" hoặc "100 điểm = 10.000đ giảm")<br>• **Nhóm khách áp dụng** (S)<br>• **Thời gian hiệu lực** (S)<br>• **Mức trần / đơn** (S, max điểm tích cho 1 đơn) |
| **Tiêu chí chấp nhận** | 1. Có thể có nhiều quy tắc đồng thời.<br>2. Khi đơn được tạo ở POS với khách đã gắn → tự cộng điểm theo quy tắc.<br>3. Khi khách dùng điểm đổi giảm giá → tự trừ điểm. |
| **Mức ưu tiên** | **S** |

### UR-MKT-06 — Điều chỉnh điểm thủ công

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-06 |
| **Tên** | Cộng/trừ điểm thủ công cho khách |
| **Actor** | Branch Manager, Marketer |
| **Mô tả** | Trong các trường hợp khiếu nại, tặng điểm khuyến mãi, sai sót... tenant có thể điều chỉnh điểm thủ công. |
| **Tiêu chí chấp nhận** | 1. Form: số điểm (+/-), lý do (M, ≤ 500), tham chiếu phiếu (S).<br>2. Yêu cầu quyền `loyalty.adjust`.<br>3. Ghi log vĩnh viễn, không xóa được. |
| **Mức ưu tiên** | **S** |

### UR-MKT-07 — Đổi điểm lấy quà

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-07 |
| **Tên** | Khách đổi điểm tại quầy |
| **Actor** | Receptionist |
| **Mô tả** | Tenant cấu hình danh mục quà có thể đổi (sản phẩm, voucher, dịch vụ). Khi khách yêu cầu, nhân viên xác minh và đổi. |
| **Tiêu chí chấp nhận** | 1. Có catalog quà với tên, ảnh, số điểm cần.<br>2. Search khách → xem điểm còn → chọn quà → xác nhận → trừ điểm + xuất phiếu quà.<br>3. Không cho đổi nếu điểm không đủ. |
| **Mức ưu tiên** | **C** |

---

## C. Chiến dịch marketing đa kênh

### UR-MKT-08 — Tạo chiến dịch SMS / Email / Zalo / Push / Facebook

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-08 |
| **Tên** | Cấu hình chiến dịch gửi tin hàng loạt |
| **Actor** | Marketer |
| **Mô tả** | Tenant tạo chiến dịch chọn kênh + đối tượng + nội dung + thời gian gửi. Hệ thống đẩy vào hàng đợi và gửi dần theo throttle của kênh. |
| **Đầu vào** | • **Tên chiến dịch** (M)<br>• **Kênh** (M, SMS/Email/Zalo OA/Push/Facebook)<br>• **Đối tượng** (M, Tất cả/Theo nhóm/Theo hạng/Theo bộ lọc)<br>• **Mục đích** (S, KM/Nhắc gia hạn/Sinh nhật/Winback/Cảm ơn)<br>• **Tiêu đề** (M nếu Email)<br>• **Nội dung** (M; SMS ≤ 160; Zalo ≤ 500; Email HTML đầy đủ)<br>• **Biến thay thế** (S, vd `{{tên_khách}}`, `{{điểm}}`, `{{gói}}`)<br>• **Thời gian gửi** (M, Gửi ngay / Lên lịch)<br>• **Giới hạn/kỳ** (S, max tin/khách/N ngày) |
| **Tiêu chí chấp nhận** | 1. Validation đầy đủ.<br>2. **Xem trước** với 1 mẫu khách thực.<br>3. **Test gửi** sang 1 SĐT cụ thể trước khi gửi mass.<br>4. Sau khi xác nhận → đẩy vào queue, gửi theo throttle (vd 100 SMS/phút).<br>5. Có thể **Hủy chiến dịch** đang chạy. |
| **Mức ưu tiên** | **M** |

### UR-MKT-09 — Báo cáo chiến dịch

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-09 |
| **Tên** | KPI cho mỗi chiến dịch sau khi chạy |
| **Actor** | Marketer |
| **Mô tả** | Tab Báo cáo của mỗi chiến dịch hiển thị: gửi thành công, thất bại, tỷ lệ mở (email), tỷ lệ click, conversion (khách mua sau khi nhận), ROI. |
| **Tiêu chí chấp nhận** | 1. Số liệu cập nhật real-time hoặc near-real-time.<br>2. Có cột chi phí (theo tariff của kênh).<br>3. ROI = doanh thu sinh ra từ chiến dịch / chi phí gửi. |
| **Mức ưu tiên** | **S** |

---

## D. Chăm sóc thành viên (Task automation)

### UR-MKT-10 — Quản lý nhiệm vụ chăm sóc khách

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-10 |
| **Tên** | Hệ thống task chăm sóc gắn với khách hàng |
| **Actor** | Receptionist, CSKH, Branch Manager |
| **Mô tả** | Tenant có thể tạo task chăm sóc thủ công hoặc tự động (sinh từ event), gán cho nhân viên, theo dõi tiến độ. |
| **Tiêu chí chấp nhận** | 1. Cột bảng: Khách, Loại, Người phụ trách, Hạn, Trạng thái, Kết quả.<br>2. Filter theo người phụ trách (mặc định = tôi), theo loại, theo trạng thái.<br>3. Trạng thái: Mới / Đang làm / Đã xong / Bỏ qua.<br>4. Bấm vào task → mở chi tiết với hướng dẫn (template) + ô ghi kết quả. |
| **Mức ưu tiên** | **S** |

### UR-MKT-11 — Tự động sinh task chăm sóc theo event

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-11 |
| **Tên** | Automation rules cho task chăm sóc |
| **Actor** | Marketer, Tenant Admin |
| **Mô tả** | Tenant cấu hình quy tắc tự động để sinh task khi có event xảy ra (vd "khi đơn > 1tr → tạo task gọi hỏi thăm sau 3 ngày"). |
| **Đầu vào** | • Tên quy tắc<br>• Event trigger (Đơn mới / Sinh nhật / Gói sắp hết hạn / Khách không đến > N ngày...)<br>• Điều kiện thêm (vd "đơn ≥ X")<br>• Loại task sinh ra<br>• Người được giao (cá nhân hoặc nhóm)<br>• Hạn (sau N ngày kể từ event)<br>• Template hướng dẫn |
| **Tiêu chí chấp nhận** | 1. Có thể bật/tắt từng quy tắc.<br>2. Hệ thống chạy quét định kỳ (vd mỗi 1 giờ) sinh task tự động.<br>3. Task tự động cũng có thể cấu hình **Tự gửi tin** (gắn với UR-MKT-08).<br>4. Audit trail: quy tắc nào sinh task nào. |
| **Mức ưu tiên** | **S** |

### UR-MKT-12 — Sinh nhật & các sự kiện khách

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MKT-12 |
| **Tên** | Tự động chăm sóc theo sự kiện cá nhân khách |
| **Actor** | Hệ thống |
| **Mô tả** | Hệ thống tự nhận diện sinh nhật / ngày kỷ niệm / mốc hạng thẻ và sinh task hoặc tin nhắn chúc mừng. |
| **Tiêu chí chấp nhận** | 1. Quét hằng ngày.<br>2. Tích hợp với quy tắc automation (UR-MKT-11).<br>3. Có thể tự gửi voucher tặng cho khách sinh nhật (gắn với KM ở UR-MKT-01). |
| **Mức ưu tiên** | **C** |

---

## Tóm tắt yêu cầu Part 09

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-MKT-01 | Tạo chương trình KM | M |
| UR-MKT-02 | Tạo lô voucher giấy | C |
| UR-MKT-03 | Theo dõi hiệu quả KM | S |
| UR-MKT-04 | Ví điểm khách | S |
| UR-MKT-05 | Quy tắc tích/đổi điểm | S |
| UR-MKT-06 | Điều chỉnh điểm thủ công | S |
| UR-MKT-07 | Đổi điểm lấy quà | C |
| UR-MKT-08 | Chiến dịch đa kênh | M |
| UR-MKT-09 | Báo cáo chiến dịch | S |
| UR-MKT-10 | Quản lý task chăm sóc | S |
| UR-MKT-11 | Automation task | S |
| UR-MKT-12 | Tự chăm sóc theo sự kiện | C |

**Tổng:** 12 yêu cầu — 2 Must, 7 Should, 3 Could.

---

*Hết Part 09.*
