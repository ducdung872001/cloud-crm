# Part 05 — Lưu trú

## Phạm vi

Phân hệ **Lưu trú** chỉ áp dụng cho tenant có loại hình kinh doanh có **lưu trú qua đêm**: homestay, căn hộ dịch vụ, co-living, phòng riêng, mini-hostel. Các tenant chỉ bán dịch vụ theo giờ có thể tắt phân hệ này.

**Actors chính:** Receptionist, Branch Manager, Housekeeping (vai trò nhân viên dọn phòng).

---

## UR-STAY-01 — Lịch phòng dạng ma trận

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-STAY-01 |
| **Tên** | Hiển thị lịch các phòng theo thời gian |
| **Actor** | Receptionist |
| **Mô tả** | Trang chính của phân hệ là một lịch dạng ma trận: trục ngang = ngày, trục dọc = từng phòng/căn hộ. Mỗi ô là một slot đặt với màu trạng thái (trống / đã đặt / có khách / đang dọn / bảo trì). |
| **Tiêu chí chấp nhận** | 1. Filter theo loại phòng, tầng, trạng thái.<br>2. Drag-to-create: kéo qua nhiều ngày để tạo nhanh booking.<br>3. Bấm vào ô đã đặt → mở chi tiết booking ở panel.<br>4. Cuộn thông minh — load thêm theo nhu cầu. |
| **Mức ưu tiên** | **M** |

## UR-STAY-02 — Tạo đặt phòng

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-STAY-02 |
| **Tên** | Booking phòng cho khách |
| **Actor** | Receptionist |
| **Mô tả** | Modal để đặt phòng cho khách hàng cụ thể với các trường thông tin đầy đủ. |
| **Đầu vào** | • **Khách hàng** (M, search hoặc thêm mới)<br>• **Phòng** (M, chỉ liệt kê phòng còn trống)<br>• **Check-in date** (M, ≥ hôm nay)<br>• **Check-out date** (M, > Check-in)<br>• **Số người lớn** (M, 1 ≤ x ≤ sức chứa)<br>• **Số trẻ em** (S, ≥ 0)<br>• **Giá/đêm** (M, mặc định từ cấu hình phòng, override được)<br>• **Dịch vụ kèm** (multi-select)<br>• **Ghi chú** (textarea ≤ 500)<br>• **Trạng thái đặt** (Đã xác nhận / Chờ xác nhận / Tạm giữ) |
| **Tiêu chí chấp nhận** | 1. Khi chọn phòng + ngày, hệ thống chặn slot đó trên lịch ngay.<br>2. Conflict (phòng bị đặt bởi booking khác) → báo lỗi *"Phòng đã được đặt trong khoảng thời gian này"*.<br>3. Có thể thu cọc ngay sau khi tạo booking (gọi UR-FIN-01).<br>4. Booking có mã duy nhất (vd `BK00001`). |
| **Mức ưu tiên** | **M** |

## UR-STAY-03 — Check-in khách lưu trú

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-STAY-03 |
| **Tên** | Ghi nhận khách đến nhận phòng |
| **Actor** | Receptionist |
| **Mô tả** | Khi khách đến đúng ngày đã đặt (hoặc walk-in), nhân viên check-in: xác nhận thông tin, upload CMND/CCCD theo quy định lưu trú, ghi giờ nhận thực tế. |
| **Đầu vào** | • **Ảnh CMND/CCCD/Hộ chiếu** (M, JPG/PNG ≤ 5MB)<br>• **Giờ nhận phòng thực tế** (M, datetime)<br>• **Số phòng cụ thể** (M nếu loại phòng có nhiều room)<br>• **Số khách thực tế** (M, ≤ số đăng ký) |
| **Tiêu chí chấp nhận** | 1. Phòng chuyển trạng thái "Đã đặt" → "Có khách".<br>2. Tuân thủ Thông tư 06/2017/TT-BVHTTDL: lưu thông tin giấy tờ tối thiểu N năm.<br>3. Thiếu CMND → chặn check-in, hiện *"Thiếu CMND"*.<br>4. Tự gửi thông báo cho khách (SMS/Zalo) sau khi check-in nếu cấu hình bật. |
| **Mức ưu tiên** | **M** |

## UR-STAY-04 — Check-out và tính tiền

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-STAY-04 |
| **Tên** | Trả phòng và thanh toán cuối kỳ |
| **Actor** | Receptionist |
| **Mô tả** | Khi khách trả phòng, hệ thống tính: số đêm thực tế, tiền phòng, dịch vụ phát sinh, trừ cọc, ra số tiền còn phải thu (hoặc hoàn). |
| **Tiêu chí chấp nhận** | 1. Tự tính số đêm dựa vào check-in/check-out thực tế (không dựa booking gốc).<br>2. Cộng đầy đủ phụ thu: dịch vụ kèm, minibar, giặt là, late check-out.<br>3. Cho phép chỉnh giá dịch vụ kèm trước khi xác nhận.<br>4. Sau xác nhận → phòng chuyển sang "Đang dọn"; tự tạo task cho housekeeping. |
| **Mức ưu tiên** | **M** |

## UR-STAY-05 — Quản lý trạng thái phòng

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-STAY-05 |
| **Tên** | Vòng đời trạng thái phòng |
| **Actor** | Housekeeping, Receptionist |
| **Mô tả** | Mỗi phòng có vòng đời trạng thái: Trống → Đã đặt → Có khách → Đang dọn → Trống. Ngoài ra có trạng thái Bảo trì (do quản lý chủ động chuyển). |
| **Tiêu chí chấp nhận** | 1. Housekeeping có app/màn hình riêng để cập nhật "Đã dọn xong" → phòng về Trống.<br>2. Branch Manager có thể chuyển phòng sang "Bảo trì" để chặn đặt.<br>3. Mọi chuyển trạng thái có log: ai, khi nào, lý do. |
| **Mức ưu tiên** | **S** |

## UR-STAY-06 — Cấu hình loại phòng & phòng cụ thể

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-STAY-06 |
| **Tên** | Setup phòng và loại phòng |
| **Actor** | Tenant Admin, Branch Manager |
| **Mô tả** | Tenant phải có giao diện cấu hình các loại phòng (Đơn, Đôi, VIP, Suite) với sức chứa, giá/đêm, tiện nghi, ảnh; sau đó tạo các phòng cụ thể (101, 102, 201...) gán vào loại. |
| **Tiêu chí chấp nhận** | 1. CRUD loại phòng và phòng cụ thể.<br>2. Một loại phòng có nhiều phòng cụ thể.<br>3. Cấu hình giờ check-in / check-out chuẩn (vd 14:00 / 12:00).<br>4. Cấu hình phụ thu: late check-out, vượt khách, cuối tuần. |
| **Mức ưu tiên** | **M** |
| **Ghi chú** | Cấu hình thực tế nằm trong Part 11 (Cài đặt cơ bản → Vận hành cơ sở). |

## UR-STAY-07 — Báo cáo lưu trú

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-STAY-07 |
| **Tên** | KPI vận hành lưu trú |
| **Actor** | Branch Manager, Tenant Admin |
| **Mô tả** | Hệ thống phải tính các chỉ số chuẩn ngành lưu trú: Occupancy %, ADR (Average Daily Rate), RevPAR, doanh thu phòng vs dịch vụ kèm. |
| **Tiêu chí chấp nhận** | 1. Có sẵn trong Part 08 — Báo cáo (mục Check-in / Lưu trú).<br>2. Filter theo cơ sở, theo kỳ.<br>3. Biểu đồ xu hướng theo thời gian.<br>4. Xuất Excel. |
| **Mức ưu tiên** | **S** |

---

## Tóm tắt yêu cầu Part 05

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-STAY-01 | Lịch phòng ma trận | M |
| UR-STAY-02 | Tạo đặt phòng | M |
| UR-STAY-03 | Check-in lưu trú | M |
| UR-STAY-04 | Check-out + tính tiền | M |
| UR-STAY-05 | Quản lý trạng thái phòng | S |
| UR-STAY-06 | Cấu hình loại phòng | M |
| UR-STAY-07 | Báo cáo lưu trú | S |

**Tổng:** 7 yêu cầu — 5 Must, 2 Should.

---

*Hết Part 05.*
