# Part 05 — Lưu trú

*Phiên bản 0.6 — Tenant "FitPro"*

> 🔜 **Part áp dụng trong tương lai.** Tenant FitPro hiện tại (chuỗi trạm tập 6-9h) **chưa bật** phân hệ Lưu trú. Part này giữ trong tài liệu để bạn hình dung khả năng mở rộng nếu mô hình sau này có lưu trú kèm gói tập (VD: Wellness Retreat).

Phân hệ **Lưu trú** chỉ áp dụng khi cơ sở của bạn có loại hình dịch vụ **lưu trú qua đêm** như phòng riêng, phòng ngủ, căn hộ dịch vụ, homestay, co-living...

**Đường dẫn:** Sidebar → **Lưu trú**
**URL:** `/crm/ch_accommodation`

---

## A. Tổng quan giao diện

![Màn hình Lưu trú](./images/part-05-luu-tru/A01-accommodation-main.png)

Màn hình thường chia thành:

| Khu vực | Chức năng |
|---------|-----------|
| **Lịch phòng (Room Calendar)** | Ma trận theo thời gian: trục ngang = ngày, trục dọc = từng phòng/căn hộ. Mỗi ô là một slot đặt |
| **Danh sách phòng** | Tên phòng, loại, giá/đêm, trạng thái (trống / có khách / đang dọn / bảo trì) |
| **Bộ lọc** | Theo loại phòng, tầng, trạng thái |
| **Nút hành động** | *+ Tạo đặt phòng mới*, *Check-in nhanh*, *Check-out* |

---

## B. Các loại thao tác chính

### B.1. Tạo đặt phòng (Booking)

**Các bước:**

1. Trên lịch phòng, bấm vào **ô trống** tại ngày + phòng muốn đặt. Hoặc bấm **+ Tạo đặt phòng mới**.
2. Modal **Đặt phòng** hiện lên với các trường:

#### Quy định nhập liệu — Đặt phòng

| Trường | Bắt buộc | Kiểu | Ràng buộc / Ghi chú |
|--------|:--------:|------|---------------------|
| **Khách hàng** | ✓ | Select tìm kiếm | Gõ SĐT/tên để tìm; có thể **+ Thêm mới** nếu khách chưa có |
| **Phòng** | ✓ | Select | Danh sách phòng còn trống trong khoảng thời gian |
| **Ngày nhận phòng (Check-in)** | ✓ | Date | Không được trong quá khứ |
| **Ngày trả phòng (Check-out)** | ✓ | Date | Phải > Check-in. Tối thiểu 1 đêm |
| **Số người lớn** | ✓ | Number | ≥ 1, ≤ sức chứa của phòng |
| **Số trẻ em** | — | Number | ≥ 0 |
| **Giá/đêm** | ✓ | Number (VNĐ) | Mặc định lấy từ cấu hình phòng, cho phép override |
| **Dịch vụ kèm** | — | Multi-select | Ăn sáng / Giặt ủi / Đưa đón… |
| **Ghi chú** | — | Textarea ≤ 500 ký tự | |
| **Trạng thái đặt** | ✓ | Select | Đã xác nhận / Chờ xác nhận / Tạm giữ |

3. Bấm **Lưu đặt phòng**. Hệ thống chặn slot đó trên lịch.
4. Thu **cọc** (nếu có) bằng cách chọn **+ Thu cọc** — mở modal nhập số tiền, phương thức.

### B.2. Check-in khách đến

**Khi nào:** Khách đến đúng ngày/giờ đã đặt hoặc walk-in.

**Các bước:**

1. Trên lịch phòng, bấm vào booking của khách → panel chi tiết bên phải.
2. Bấm nút **Check-in**.
3. Form check-in hiện:
   - Xác nhận thông tin khách.
   - Upload **CMND/CCCD/Hộ chiếu** (bắt buộc theo quy định lưu trú).
   - Nhập số phòng cụ thể (nếu chưa chọn trước).
   - Nhập **giờ nhận thực tế**.
4. Bấm **Xác nhận check-in**.
5. Trạng thái phòng chuyển từ *"Đã đặt"* → *"Có khách"*.

#### Quy định nhập liệu — Check-in

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Ảnh CMND/CCCD** | ✓ | Upload ảnh, định dạng JPG/PNG, ≤ 5MB |
| **Giờ nhận phòng thực tế** | ✓ | Datetime, mặc định bằng giờ hiện tại |
| **Số phòng** | ✓ | Nếu loại phòng có nhiều room cụ thể |
| **Số khách check-in thực tế** | ✓ | Thường ≤ số người đăng ký |

### B.3. Check-out

**Các bước:**

1. Chọn booking đang "Có khách" → bấm **Check-out**.
2. Hệ thống tính:
   - Số đêm thực tế.
   - Tổng tiền phòng.
   - Dịch vụ phát sinh (ăn uống, minibar...).
   - Trừ cọc đã thu.
   - **Còn lại khách phải trả** / **Hoàn lại cho khách**.
3. Thu phần còn lại / hoàn cọc.
4. Bấm **Xác nhận check-out**.
5. Phòng chuyển sang *"Đang dọn"* (chờ nhân viên dọn xong mới về *"Trống"*).

---

## C. Cấu hình phòng & loại phòng

Cấu hình ban đầu (thường do admin làm một lần) nằm trong **Cài đặt → Vận hành cơ sở → Phòng** (xem Part 11).

Các thứ cần cài:

- **Loại phòng**: Tên (Phòng đơn / Phòng đôi / VIP / Suite), Sức chứa, Giá/đêm, Mô tả, Tiện nghi.
- **Danh sách phòng cụ thể**: Số phòng 101, 102, 201... gán vào loại phòng.
- **Giờ check-in / check-out chuẩn**: vd 14:00 / 12:00.
- **Phụ thu**: Giờ trễ, số khách vượt chuẩn, phụ thu cuối tuần.

---

## D. Báo cáo lưu trú

Liên quan tới **Báo cáo → Check-in** ở Part 08 — hiển thị:

- **Công suất phòng (Occupancy %)** theo ngày / tuần / tháng.
- **Doanh thu phòng** vs **Doanh thu dịch vụ kèm**.
- **ADR (Average Daily Rate)** — giá phòng trung bình.
- **RevPAR** — doanh thu trên mỗi phòng khả dụng.

---

## E. Lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|-----|-------------|-------|
| *"Phòng đã được đặt trong khoảng thời gian này"* | Conflict với booking khác | Chọn phòng khác hoặc đổi ngày |
| *"Không tìm thấy loại phòng"* | Chưa cấu hình loại phòng | Vào **Cài đặt → Vận hành cơ sở** |
| Check-in báo *"Thiếu CMND"* | Chưa upload giấy tờ | Upload rồi bấm lại |
| Check-out tính tiền sai | Giá phụ thu / dịch vụ kèm chưa cập nhật | Kiểm tra panel chi tiết đặt phòng |

---

*Hết Part 05.*
