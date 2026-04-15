# Part 03 — Quản lý Khách hàng

> **Dành cho**: Thu ngân (Cashier), Sales, CSKH
> **Mức độ**: Cơ bản → Trung cấp
> **Tham chiếu URD**: [Part 03 — Customer](../urd/part-03-customer.md)

Quản lý khách hàng là trái tim của CRM — giúp bạn biết ai là khách VIP, ai cần chăm sóc, ai có công nợ. Part này hướng dẫn đầy đủ từ tạo khách đến phân khúc và chăm sóc.

## Mục lục
- [1. Xem danh sách khách hàng](#1-xem-danh-sách-khách-hàng)
- [2. Tìm kiếm khách](#2-tìm-kiếm-khách)
- [3. Tạo khách mới](#3-tạo-khách-mới)
- [4. Sửa thông tin khách](#4-sửa-thông-tin-khách)
- [5. Xem chi tiết khách](#5-xem-chi-tiết-khách)
- [6. Phân khúc khách (Segments)](#6-phân-khúc-khách-segments)
- [7. Chăm sóc khách](#7-chăm-sóc-khách)
- [8. Gia hạn gói thành viên](#8-gia-hạn-gói-thành-viên)
- [9. Merge khách trùng](#9-merge-khách-trùng)
- [10. Import khách từ Excel](#10-import-khách-từ-excel)
- [FAQ](#faq)

---

## 1. Xem danh sách khách hàng

### Bước 1: Mở trang danh sách

Sidebar → **Khách hàng → Danh sách khách hàng**.

### Bước 2: Hiểu các cột

Bảng mặc định hiển thị:

- **Mã KH** — mã tự sinh
- **Họ tên** — click để mở chi tiết
- **SĐT**
- **Email**
- **Hạng thẻ** (Silver / Gold / Platinum / VIP)
- **Điểm tích luỹ**
- **Tổng chi tiêu**
- **Ngày cuối mua**
- **Tag** — nhãn phân loại

### Bước 3: Phân trang + sắp xếp

- Cuối bảng có thanh phân trang (mặc định 20 khách/trang).
- Click vào tiêu đề cột để sắp xếp tăng/giảm.

💡 **Mẹo**: Click cột **Tổng chi tiêu** sắp xếp giảm dần → tìm nhanh top khách VIP.

> 🖼️ *Ảnh minh hoạ: Danh sách khách hàng — chụp sau*

---

## 2. Tìm kiếm khách

### 2.1. Tìm nhanh theo SĐT/tên

Ô tìm kiếm ở đầu trang — gõ **SĐT** hoặc **tên** → kết quả lọc tức thời.

### 2.2. Filter nâng cao

Nhấn **[Lọc nâng cao]** → mở panel filter:

- **Hạng thẻ**
- **Tag** (có thể chọn nhiều)
- **Khoảng ngày tạo**
- **Tổng chi tiêu từ ... đến ...**
- **Có công nợ / không**
- **Cơ sở** (nếu chain)

Nhấn **[Áp dụng]** → danh sách cập nhật.

💡 **Mẹo**: Lưu filter hay dùng thành **View lưu sẵn** để tái sử dụng.

---

## 3. Tạo khách mới

### Bước 1: Nhấn nút Tạo mới

Ở trang danh sách, nhấn **[+ Tạo khách hàng]** (nút xanh lá góc phải).

### Bước 2: Điền form

Các trường chính:

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| **Họ tên** | ✅ | Tối thiểu 2 từ |
| **SĐT** | ✅ | 10 số, unique trong tenant |
| **Email** | ❌ | Validate định dạng |
| **Ngày sinh** | ❌ | Dùng cho chúc mừng sinh nhật |
| **Giới tính** | ❌ | Nam/Nữ/Khác |
| **Địa chỉ** | ❌ | Tỉnh/Huyện/Phường + chi tiết |
| **Hạng thẻ** | ❌ | Mặc định Silver |
| **Tag** | ❌ | VD: "VIP", "Khách thân thiết" |
| **Nguồn** | ❌ | Facebook / Walk-in / Giới thiệu |
| **Ghi chú** | ❌ | Note tự do |

### Bước 3: Lưu

Nhấn **[Lưu]**. Hệ thống tạo mã KH tự động.

⚠️ **Chú ý**: Nếu **SĐT trùng** với khách có sẵn → hệ thống cảnh báo "Khách đã tồn tại" → bạn có thể chọn mở khách cũ hoặc nhập SĐT khác.

---

## 4. Sửa thông tin khách

### Các bước

1. Từ danh sách, click tên khách → mở trang chi tiết.
2. Nhấn **[Sửa]** ở góc phải trên.
3. Form edit hiện ra với data hiện tại.
4. Chỉnh sửa → nhấn **[Lưu]**.

🔒 **Quyền**: Cần quyền **Customer Edit**. Cashier thường chỉ được sửa thông tin cơ bản; Manager sửa được hạng thẻ và điểm.

---

## 5. Xem chi tiết khách

Trang chi tiết khách có **5 tab**:

### Tab 1: Thông tin

Hiển thị toàn bộ field cơ bản của khách + ảnh avatar.

### Tab 2: Đơn hàng

Danh sách tất cả đơn hàng khách đã mua:

- Mã đơn
- Ngày
- Tổng tiền
- Trạng thái (PAID / PARTIAL / RETURNED)
- Click vào đơn để xem chi tiết

💡 **Mẹo**: Tab này giúp bạn tư vấn: "Lần trước chị mua sản phẩm A, lần này em gợi ý thêm sản phẩm B đi kèm."

### Tab 3: Tích điểm

- **Điểm hiện tại**
- **Lịch sử tích/tiêu điểm**
- **Hạng thẻ hiện tại + ngưỡng lên hạng tiếp theo**
- **Voucher khả dụng**

### Tab 4: Tương tác

Lịch sử chăm sóc:

- Cuộc gọi (call log)
- SMS đã gửi
- Email đã gửi
- Ticket CSKH

### Tab 5: Ghi chú

Textbox tự do — ghi các note về sở thích, thói quen, lưu ý đặc biệt.

---

## 6. Phân khúc khách (Segments)

**Segment** là nhóm khách được lọc tự động theo điều kiện, dùng cho chiến dịch marketing.

### 6.1. Xem danh sách segment

Sidebar → **Khách hàng → Phân khúc**.

Các segment mặc định:

- **VIP** (chi tiêu ≥ 10 triệu / năm)
- **Khách mới** (tạo trong 30 ngày)
- **Ngủ đông** (không mua > 90 ngày)
- **Sinh nhật tháng này**

### 6.2. Tạo segment tuỳ chỉnh

1. Nhấn **[+ Tạo segment]**.
2. Đặt **tên** (VD: "Khách mua mỹ phẩm Q1").
3. Thêm **điều kiện** — ví dụ:
   - Ngành hàng = "Mỹ phẩm"
   - AND Ngày mua cuối ≥ 2026-01-01
   - AND Tổng chi tiêu ≥ 500k
4. Nhấn **[Preview]** xem số khách match.
5. Nhấn **[Lưu]**.

Segment sẽ **cập nhật tự động** khi có khách mới thoả điều kiện.

---

## 7. Chăm sóc khách

Ghi nhận các tương tác để team CSKH không bỏ sót.

### 7.1. Ghi cuộc gọi

1. Mở chi tiết khách → tab **Tương tác**.
2. Nhấn **[+ Ghi cuộc gọi]**.
3. Nhập: Mục đích, Kết quả, Thời lượng, Ghi chú.
4. Nhấn **[Lưu]**.

### 7.2. Gửi SMS

1. Nhấn **[+ Gửi SMS]**.
2. Chọn **template** (hoặc gõ tự do, max 160 ký tự).
3. Preview → **[Gửi]**.

⚠️ **Chú ý**: Gửi SMS tốn credit — cấu hình brand SMS ở Part 12.

### 7.3. Gửi email

Tương tự SMS nhưng hỗ trợ HTML template + attachment.

---

## 8. Gia hạn gói thành viên

Nếu tenant có bán **gói thành viên** (monthly/annual):

### Các bước

1. Mở chi tiết khách → tab **Tích điểm** (hoặc **Gói thành viên**).
2. Nhấn **[Gia hạn]**.
3. Chọn gói + thời hạn.
4. Thanh toán qua POS (tạo đơn dịch vụ) → tự cập nhật hạn mới.

💡 **Mẹo**: Cấu hình **cảnh báo hết hạn** (trước 7 ngày) để CSKH chủ động liên hệ khách.

---

## 9. Merge khách trùng

Khách cũ có thể bị tạo trùng do nhập sai SĐT. Dùng **Merge** để gộp.

### Các bước

1. Sidebar → **Khách hàng → Merge khách trùng**.
2. Hệ thống gợi ý các cặp khách có SĐT/email/tên gần giống.
3. Click 1 cặp → xem so sánh.
4. Chọn **master** (khách chính) → nhấn **[Gộp]**.
5. Toàn bộ đơn hàng, điểm, công nợ của khách phụ **chuyển hết sang master**.

⚠️ **Chú ý**: **Không hoàn tác được** — hãy kiểm tra kỹ trước khi merge.

🔒 **Quyền**: Store Manager trở lên.

---

## 10. Import khách từ Excel

Nhập hàng loạt khách từ file Excel.

### Bước 1: Tải template

Sidebar → **Khách hàng → Import** → nhấn **[Tải template]**.

File mẫu có các cột: `HoTen, SDT, Email, NgaySinh, DiaChi, Tag, Nguon`.

### Bước 2: Điền data

Mở file Excel, điền từng dòng. **SĐT** là unique key — không được trùng.

### Bước 3: Upload

Nhấn **[Chọn file]** → chọn file Excel → nhấn **[Preview]**.

Hệ thống kiểm tra:

- Trường bắt buộc có đủ chưa
- SĐT trùng với DB hiện có không
- Format ngày có hợp lệ không

### Bước 4: Xác nhận import

Nếu có lỗi → download file lỗi, sửa rồi upload lại.

Nếu OK → nhấn **[Import]** → chờ job chạy → kết quả hiện số thành công / thất bại.

💡 **Mẹo**: Với file > 5000 dòng, quá trình import có thể mất vài phút — để tab mở cho đến khi xong.

---

## FAQ

**1. Tôi tạo khách mà báo "SĐT đã tồn tại" dù tôi chắc là khách mới?**
SĐT có thể đã được tạo ở cơ sở khác. Dùng tìm kiếm SĐT → nếu đúng là khách trùng, mở khách cũ dùng tiếp.

**2. Điểm tích luỹ của khách bị sai — có sửa được không?**
Manager có thể **điều chỉnh điểm thủ công** ở tab Tích điểm → nhấn **[Điều chỉnh]** → nhập lý do (bắt buộc). Lưu audit log.

**3. Khách không muốn nhận SMS/email — có tắt được không?**
Vào chi tiết khách → tab Thông tin → bỏ tick **Đồng ý nhận marketing**. Khách sẽ không nằm trong segment gửi marketing.

**4. Có cách nào xem top 10 khách VIP nhanh không?**
Vào danh sách → sắp xếp theo **Tổng chi tiêu giảm dần** → xem top 10. Hoặc dùng segment "VIP".

**5. Import Excel 10.000 dòng mất bao lâu?**
Khoảng 3-5 phút tuỳ server. Sẽ có notification khi xong.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "SĐT trùng" | Khách đã tồn tại | Mở khách cũ, không tạo mới |
| "SĐT không hợp lệ" | Sai format 10 số | Kiểm tra đầu số |
| "Email không hợp lệ" | Sai format | Bỏ trống nếu không có |
| "Không có quyền sửa hạng thẻ" | Không đủ quyền | Nhờ Manager sửa |
| Import fail dòng X | Dữ liệu sai | Download file lỗi, sửa |

---

*Hết Part 03. Xem tiếp [Part 04 — Đơn hàng & Hoá đơn VAT](part-04-don-hang-hoa-don.md).*
