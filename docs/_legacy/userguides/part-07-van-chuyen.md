# Part 07 — Vận chuyển & Giao hàng

> **Dành cho**: Sales online, Warehouse, Shipping coordinator
> **Mức độ**: Trung cấp
> **Tham chiếu URD**: [Part 07 — Shipping & Logistics](../urd/part-07-shipping.md)

Bán hàng online cần có hệ thống giao hàng trơn tru. Part này hướng dẫn cấu hình đối tác vận chuyển (GHN, GHTK, VNPost, J&T), tạo phiếu giao, in label, tracking, xử lý COD, và xử lý đơn giao thất bại.

## Mục lục
- [1. Cấu hình đối tác vận chuyển](#1-cấu-hình-đối-tác-vận-chuyển)
- [2. Cấu hình bảng phí ship](#2-cấu-hình-bảng-phí-ship)
- [3. Tạo phiếu giao hàng](#3-tạo-phiếu-giao-hàng)
- [4. In label vận chuyển](#4-in-label-vận-chuyển)
- [5. Tracking trạng thái đơn giao](#5-tracking-trạng-thái-đơn-giao)
- [6. Xử lý COD](#6-xử-lý-cod)
- [7. Dashboard logistics](#7-dashboard-logistics)
- [8. Xử lý đơn giao thất bại](#8-xử-lý-đơn-giao-thất-bại)
- [FAQ](#faq)

---

## 1. Cấu hình đối tác vận chuyển

Trước khi dùng, phải kết nối tài khoản đối tác vận chuyển.

### Bước 1: Mở trang cấu hình

Sidebar → **Cài đặt → Đối tác vận chuyển**.

### Bước 2: Thêm đối tác

Nhấn **[+ Thêm đối tác]** → chọn 1 trong các tuỳ chọn:

- **GHN** (Giao Hàng Nhanh)
- **GHTK** (Giao Hàng Tiết Kiệm)
- **VNPost**
- **J&T Express**
- **ViettelPost**
- **Tự giao** (shipper nội bộ)

### Bước 3: Nhập API credentials

Tuỳ đối tác, cần:

- **Token / API key** (lấy từ tài khoản NSX của đối tác)
- **Shop ID**
- **Địa chỉ lấy hàng mặc định** (cơ sở / kho gửi)

Nhấn **[Test kết nối]** → nếu thành công, đèn xanh.

### Bước 4: Bật sử dụng

Tick **Đang hoạt động** → đối tác sẵn sàng dùng.

💡 **Mẹo**: Nên kết nối **2-3 đối tác** để so phí + backup khi 1 đối tác quá tải.

🔒 **Quyền**: Tenant Admin.

> 🖼️ *Ảnh minh hoạ: Form cấu hình GHN — chụp sau*

---

## 2. Cấu hình bảng phí ship

### 2.1. Phí theo đối tác

Mỗi đối tác có bảng phí riêng — hệ thống gọi API real-time để lấy phí chính xác theo:

- Điểm đi (cơ sở)
- Điểm đến (địa chỉ khách)
- Trọng lượng đơn
- Dịch vụ (nhanh / tiêu chuẩn)

### 2.2. Bảng phí tuỳ chỉnh

Nếu muốn đặt phí cứng (áp cho tất cả đối tác hoặc tự giao):

1. Sidebar → **Cài đặt → Bảng phí ship**.
2. **[+ Thêm quy tắc]**:
   - **Khu vực** (VD: Nội thành HN / Ngoại thành / Liên tỉnh)
   - **Phí cố định** (VD: 20.000đ / 35.000đ / theo kg)
   - **Miễn phí từ** (VD: Đơn ≥ 500k → free ship)
3. Lưu.

💡 **Mẹo**: Cấu hình **miễn phí theo ngưỡng** là chiến thuật tăng AOV hiệu quả.

---

## 3. Tạo phiếu giao hàng

### Bước 1: Từ đơn bán

1. Mở chi tiết đơn (Part 04).
2. Nhấn **[Tạo phiếu giao hàng]**.

### Bước 2: Chọn đối tác

Dropdown **Đối tác vận chuyển** — chọn 1 trong các đối tác đã cấu hình.

Hệ thống gọi API để lấy **phí dự kiến** theo:
- Điểm lấy (cơ sở của đơn)
- Điểm giao (địa chỉ khách trong đơn)
- Trọng lượng (tính từ SP)

### Bước 3: Nhập thông tin kiện hàng

- **Cân nặng** (gram/kg)
- **Kích thước** (dài × rộng × cao, cm)
- **Ghi chú cho shipper** (VD: "Gọi trước khi giao")
- **Giá trị khai báo**
- **COD** — số tiền thu hộ (bằng tổng đơn nếu chưa thanh toán)

### Bước 4: Xác nhận tạo

Nhấn **[Tạo phiếu giao]**:

- Hệ thống gọi API đối tác → tạo order bên họ → nhận về **mã vận đơn**
- Phiếu giao chuyển trạng thái **WAITING_PICKUP**
- Đơn hàng gắn với mã vận đơn

---

## 4. In label vận chuyển

Sau khi tạo phiếu giao, nhấn **[In label]**.

Có 2 kiểu label:

- **A6** — cho máy in label chuyên dụng (khuyến khích)
- **A4** — 2-4 label/trang cho máy in thường

Label chứa:

- Tên + SĐT khách
- Địa chỉ đầy đủ
- Mã vận đơn + QR/barcode
- COD (nếu có)
- Ghi chú shipper

Dán label lên kiện → chờ shipper đến lấy.

💡 **Mẹo**: In **2 bản** — 1 dán kiện, 1 lưu trong kho để đối chiếu khi cần.

---

## 5. Tracking trạng thái đơn giao

### 5.1. Xem tracking 1 đơn

Mở chi tiết đơn → tab **Vận chuyển** → hiện **timeline**:

- **WAITING_PICKUP** — chờ shipper lấy
- **PICKED_UP** — đã lấy hàng
- **IN_TRANSIT** — đang vận chuyển
- **OUT_FOR_DELIVERY** — shipper đang giao
- **DELIVERED** — đã giao thành công
- **FAILED** — giao thất bại
- **RETURNED** — trả về shop

Mỗi bước có **thời gian + vị trí + ghi chú**.

### 5.2. Webhook từ đối tác

Các đối tác gửi **webhook** mỗi khi status đổi → hệ thống tự cập nhật. Không cần refresh thủ công.

### 5.3. Polling fallback

Nếu webhook fail, hệ thống **poll API mỗi 15 phút** để đồng bộ.

💡 **Mẹo**: Nếu thấy đơn "kẹt" ở 1 trạng thái quá lâu → vào chi tiết → nhấn **[Đồng bộ thủ công]**.

---

## 6. Xử lý COD

**COD** (Cash on Delivery) — shipper thu tiền hộ, sau đó đối tác trả lại cho shop.

### 6.1. Danh sách COD chờ đối soát

Sidebar → **Vận chuyển → COD**.

Bảng hiển thị:

- Đơn hàng
- Số COD
- Trạng thái: **Chưa thu** / **Đã thu** / **Đã chuyển shop** / **Đối soát**

### 6.2. Đối soát với đối tác

Đối tác định kỳ (hàng ngày/tuần) chuyển tiền COD về TK shop. Kèm file đối soát Excel.

### Các bước đối soát

1. Nhấn **[Đối soát]**.
2. Chọn **đối tác** + **khoảng ngày**.
3. Upload file đối soát từ đối tác.
4. Hệ thống so khớp:
   - Tổng COD hệ thống vs Tổng COD đối tác chuyển
   - Chi tiết từng đơn
5. Phát hiện chênh lệch → điều chỉnh thủ công.
6. Nhấn **[Hoàn tất đối soát]**.

⚠️ **Chú ý**: Đối tác thường **giữ lại phí dịch vụ** — check kỹ bảng phí trước khi đối soát.

---

## 7. Dashboard logistics

Sidebar → **Vận chuyển → Dashboard**.

### 7.1. KPI tiles

- **Đơn pending** (chưa tạo phiếu giao)
- **Đơn in transit**
- **Đơn delivered hôm nay**
- **Đơn thất bại hôm nay**
- **COD chờ đối soát**

### 7.2. Biểu đồ

- **Tỷ lệ thành công** theo đối tác
- **Thời gian giao trung bình** (từ pickup → delivered)
- **Top khu vực có tỷ lệ fail cao**

💡 **Mẹo**: Nếu 1 đối tác có tỷ lệ fail > 10% → xem xét chuyển sang đối tác khác.

> 🖼️ *Ảnh minh hoạ: Dashboard logistics — chụp sau*

---

## 8. Xử lý đơn giao thất bại

Đơn FAILED thường do:

- Khách không nghe máy
- Khách từ chối nhận
- Địa chỉ sai
- Không có người nhận

### Các bước xử lý

1. Sidebar → **Vận chuyển → Đơn thất bại**.
2. Mở đơn → xem **lý do fail** + ghi chú shipper.
3. Chọn hướng xử lý:

| Hướng | Mô tả |
|---|---|
| **Giao lại** | Hệ thống gọi API đối tác → tạo lần giao tiếp theo. Có thể chỉnh địa chỉ/SĐT. |
| **Chuyển đối tác khác** | Huỷ đơn với đối tác hiện tại, tạo phiếu giao với đối tác mới. |
| **Trả về shop** | Chấp nhận hàng quay lại → cộng lại tồn kho → huỷ đơn bán. |
| **Liên hệ khách** | Call khách xác nhận trước khi thử giao lại. |

### Callback tự động

Cấu hình **kịch bản** tại Part 13 — BPM:

- Fail lần 1 → tự SMS khách + chờ 1 ngày → giao lại
- Fail lần 2 → tự call CSKH xác nhận
- Fail lần 3 → tự trả hàng về shop

---

## FAQ

**1. Tôi chọn đối tác nhưng phí không hiện — lỗi gì?**
Có thể do: (a) API key sai → test lại kết nối; (b) Địa chỉ khách không đủ (thiếu phường/huyện) → bổ sung; (c) Đối tác maintenance → thử đối tác khác.

**2. Khách khiếu nại shipper giao trễ — kiểm tra ở đâu?**
Tracking tab trong đơn — xem timeline chi tiết. Nếu cần, liên hệ support đối tác với mã vận đơn.

**3. Đối tác chuyển COD thiếu so với hệ thống?**
Dùng chức năng **Đối soát** → xem chênh lệch chi tiết. Thường do phí dịch vụ hoặc đơn chưa thu được. Liên hệ đối tác xác nhận.

**4. In label A6 bị lệch — sửa thế nào?**
Chỉnh **margin máy in** trong driver hoặc dùng template A4 rồi cắt.

**5. Có thể tự giao hàng bằng shipper nội bộ không?**
Có. Cấu hình đối tác "Tự giao" → chỉ định shipper → in label nội bộ → update trạng thái thủ công.

**6. Webhook không về, đơn kẹt trạng thái cũ?**
Vào chi tiết đơn → **[Đồng bộ thủ công]**. Nếu vẫn kẹt, báo Admin check cấu hình webhook URL.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "Test kết nối fail" | API key sai | Kiểm tra lại credentials |
| "Không tính được phí" | Địa chỉ thiếu | Bổ sung phường/huyện |
| "Đối tác từ chối đơn" | Địa chỉ ngoài vùng phục vụ | Đổi đối tác |
| "COD chênh lệch" | Phí dịch vụ hoặc thu thiếu | Đối soát thủ công |
| "Label không in được" | Máy in / template | Chuyển A4 |
| "Webhook không về" | URL/firewall | Báo Admin |

---

*Hết Part 07. Xem tiếp [Part 08 — Tài chính & Thanh toán](part-08-tai-chinh.md).*
