# Part 07 — Vận chuyển & Giao hàng

## 1. Phạm vi phân hệ

Quản lý quy trình giao hàng: tạo phiếu giao, chọn đối tác vận chuyển (GHN, GHTK, VNPost, J&T, nội bộ), in label, tracking real-time, cấu hình phí ship theo bảng giá/khu vực, xử lý COD (Cash On Delivery) và đối soát COD với partner, dashboard logistics tổng quan.

Các route retail liên quan:

- `/shipping` — danh sách phiếu giao
- `/add_shipping` — tạo phiếu giao mới
- `/shipping_parther` — danh sách đối tác vận chuyển (lưu ý: typo `parther` thay vì `partner` trong code)
- `/shipping_fee_config` — cấu hình phí ship
- `/dashboard_shipping` — dashboard logistics

## 2. Actor liên quan

- **Sales / Cashier** — tạo phiếu giao khi chốt đơn
- **Warehouse Staff** — đóng gói, bàn giao cho shipper
- **Shipping Coordinator** — điều phối, theo dõi tracking
- **Accountant** — đối soát COD với partner
- **Customer** — xem tracking đơn của mình (kênh tra cứu public)

## 3. Yêu cầu chi tiết

### UR-SHIP-01 — Cấu hình đối tác vận chuyển

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-01 |
| **Tên** | Quản lý danh sách đối tác vận chuyển |
| **Actor** | Tenant Admin |
| **Mô tả** | `/shipping_parther` quản lý danh sách partner: GHN, GHTK, VNPost, J&T, Viettel Post, Best Express, nội bộ. Mỗi partner có: tên, logo, API key/token, endpoint, enable/disable, mặc định cho vùng. |
| **Tiền điều kiện** | Tenant Admin đăng nhập, có quyền `shipping.config` |
| **Đầu vào** | Tên partner, credentials API, vùng phục vụ |
| **Đầu ra** | Partner lưu, sẵn sàng chọn khi tạo phiếu giao |
| **Tiêu chí chấp nhận** | - Credentials mã hoá khi lưu DB<br>- Test connection trước khi save<br>- Enable/disable không xoá cứng |
| **Ưu tiên** | **M** |

### UR-SHIP-02 — Cấu hình bảng phí ship

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-02 |
| **Tên** | Bảng phí ship theo vùng và trọng lượng |
| **Actor** | Tenant Admin, Shipping Coordinator |
| **Mô tả** | `/shipping_fee_config` cấu hình phí ship: theo khu vực (nội thành / ngoại thành / liên tỉnh), theo trọng lượng (dưới 1kg, 1-3kg, >3kg), theo partner. Cho phép freeship theo điều kiện (đơn > X, KH VIP). |
| **Tiền điều kiện** | Đã có partner |
| **Đầu vào** | Vùng, trọng lượng, phí, điều kiện freeship |
| **Đầu ra** | Bảng phí áp dụng khi tính phí đơn |
| **Tiêu chí chấp nhận** | - Tự lookup phí khi tạo phiếu giao<br>- Override thủ công được<br>- Lịch sử thay đổi bảng phí |
| **Ưu tiên** | **M** |

### UR-SHIP-03 — Tạo phiếu giao hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-03 |
| **Tên** | Lập phiếu giao từ đơn bán |
| **Actor** | Sales, Warehouse |
| **Mô tả** | `/add_shipping` tạo phiếu giao: chọn đơn bán (hoặc nhập thủ công), địa chỉ nhận, liên hệ, trọng lượng, kích thước, giá trị COD, ghi chú shipper, chọn partner. Hệ thống tự tính phí theo bảng phí. |
| **Tiền điều kiện** | Đơn bán đã chốt; có partner enable |
| **Đầu vào** | Mã đơn, địa chỉ nhận, weight, COD amount |
| **Đầu ra** | Phiếu giao ở trạng thái `draft`, mã tracking nội bộ |
| **Tiêu chí chấp nhận** | - Validate địa chỉ có tỉnh/quận/phường<br>- Hiển thị preview phí trước khi submit<br>- Link 2 chiều với đơn bán |
| **Ưu tiên** | **M** |

### UR-SHIP-04 — Push phiếu giao lên partner API

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-04 |
| **Tên** | Gửi phiếu lên hệ thống partner |
| **Actor** | Sales, Shipping Coordinator |
| **Mô tả** | Khi submit phiếu giao, hệ thống call API của partner để tạo vận đơn, nhận lại mã vận đơn (tracking code) từ partner. Trạng thái phiếu chuyển `created_on_partner`. |
| **Tiền điều kiện** | Phiếu giao ở trạng thái `draft`; partner có credentials hợp lệ |
| **Đầu vào** | Phiếu giao |
| **Đầu ra** | Mã tracking từ partner lưu vào phiếu |
| **Tiêu chí chấp nhận** | - Retry 3 lần nếu API fail<br>- Log request/response cho debug<br>- Fallback: cho phép tạo thủ công nếu partner API down |
| **Ưu tiên** | **M** |

### UR-SHIP-05 — In label vận đơn

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-05 |
| **Tên** | Xuất và in label giao hàng |
| **Actor** | Warehouse Staff |
| **Mô tả** | Sau khi có mã tracking từ partner, xuất label PDF/PNG chuẩn của partner (kích thước A6 hoặc 10x15cm) để dán lên gói hàng. Hỗ trợ in hàng loạt. |
| **Tiền điều kiện** | Phiếu có tracking code từ partner |
| **Đầu vào** | Danh sách phiếu chọn in |
| **Đầu ra** | File PDF label sẵn sàng in |
| **Tiêu chí chấp nhận** | - In lẻ hoặc bulk<br>- Format label đúng chuẩn partner (barcode, QR)<br>- Re-print có đánh dấu `REPRINT` |
| **Ưu tiên** | **S** |

### UR-SHIP-06 — Tracking real-time qua webhook

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-06 |
| **Tên** | Nhận webhook trạng thái từ partner |
| **Actor** | System |
| **Mô tả** | Hệ thống expose webhook endpoint để partner push sự kiện: picked_up, in_transit, delivered, returned, failed_delivery. Phiếu giao cập nhật trạng thái tự động, lưu lịch sử sự kiện. |
| **Tiền điều kiện** | Webhook URL đã đăng ký với partner |
| **Đầu vào** | Payload webhook từ partner |
| **Đầu ra** | Trạng thái phiếu giao cập nhật; timeline hiển thị trên UI |
| **Tiêu chí chấp nhận** | - Verify signature webhook<br>- Idempotent: cùng event không cập nhật 2 lần<br>- Thông báo cho Sales khi giao thành công / thất bại |
| **Ưu tiên** | **M** |

### UR-SHIP-07 — Danh sách và lọc phiếu giao

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-07 |
| **Tên** | Màn hình quản lý phiếu giao |
| **Actor** | Sales, Shipping Coordinator |
| **Mô tả** | `/shipping` hiển thị danh sách phiếu giao với filter: trạng thái, partner, khoảng ngày, KH, shipper. Mỗi dòng có action nhanh: xem chi tiết, cancel, re-push. |
| **Tiền điều kiện** | Có phiếu giao |
| **Đầu vào** | Filter parameters |
| **Đầu ra** | Danh sách có phân trang |
| **Tiêu chí chấp nhận** | - Filter combo (AND)<br>- Export Excel<br>- Highlight phiếu quá hạn giao |
| **Ưu tiên** | **M** |

### UR-SHIP-08 — Xử lý COD

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-08 |
| **Tên** | Ghi nhận thu hộ COD |
| **Actor** | Shipping Coordinator, Accountant |
| **Mô tả** | Với phiếu có COD, khi partner xác nhận đã thu tiền, hệ thống ghi nhận số tiền COD dự kiến nhận từ partner. Mỗi phiếu có trạng thái COD: `pending → collected → settled`. |
| **Tiền điều kiện** | Phiếu có `cod_amount > 0`; đã giao thành công |
| **Đầu vào** | Webhook delivered từ partner |
| **Đầu ra** | COD chuyển trạng thái `collected`, chờ đối soát |
| **Tiêu chí chấp nhận** | - Tổng COD pending hiển thị trên dashboard<br>- Link với công nợ partner (Part 08)<br>- Cảnh báo COD thu quá lâu không settle |
| **Ưu tiên** | **M** |

### UR-SHIP-09 — Đối soát COD với partner

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-09 |
| **Tên** | Đối soát và nhận tiền COD từ partner |
| **Actor** | Accountant |
| **Mô tả** | Định kỳ (tuần/tháng), partner gửi bảng kê COD. Accountant import file bảng kê, hệ thống match với phiếu giao, đánh dấu `settled` cho các phiếu đã nhận tiền. Chênh lệch cần xử lý thủ công. |
| **Tiền điều kiện** | Có phiếu COD `collected` chưa settle |
| **Đầu vào** | File bảng kê Excel từ partner |
| **Đầu ra** | Báo cáo đối soát: matched, unmatched, discrepancy |
| **Tiêu chí chấp nhận** | - Auto-match theo tracking code<br>- Highlight chênh lệch phí / số tiền<br>- Tạo phiếu thu tiền COD vào quỹ |
| **Ưu tiên** | **S** |

### UR-SHIP-10 — Huỷ phiếu giao

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-10 |
| **Tên** | Huỷ phiếu giao và hoàn kho |
| **Actor** | Sales, Shipping Coordinator |
| **Mô tả** | Cho phép huỷ phiếu giao nếu chưa bàn giao hoặc partner hỗ trợ huỷ. Khi huỷ, call API cancel partner, tồn kho reserved được release. |
| **Tiền điều kiện** | Phiếu ở trạng thái `draft`, `created_on_partner`, hoặc `picked_up` (nếu partner cho huỷ) |
| **Đầu vào** | Lý do huỷ |
| **Đầu ra** | Phiếu chuyển `cancelled`; kho release |
| **Tiêu chí chấp nhận** | - Không huỷ được phiếu đã giao<br>- Log người huỷ + thời gian<br>- Hoàn đơn bán về trạng thái chờ giao lại |
| **Ưu tiên** | **S** |

### UR-SHIP-11 — Dashboard logistics

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-11 |
| **Tên** | Dashboard tổng quan vận chuyển |
| **Actor** | Shipping Coordinator, Store Manager |
| **Mô tả** | `/dashboard_shipping` hiển thị: số phiếu theo trạng thái, tỷ lệ giao thành công, thời gian giao trung bình, top partner theo volume, tổng COD pending, bản đồ phân bố đơn. |
| **Tiền điều kiện** | Có dữ liệu phiếu giao |
| **Đầu vào** | Khoảng ngày |
| **Đầu ra** | Widget số liệu + biểu đồ |
| **Tiêu chí chấp nhận** | - Refresh mỗi 5 phút<br>- Filter theo chi nhánh<br>- So sánh partner hiệu quả |
| **Ưu tiên** | **S** |

### UR-SHIP-12 — Tra cứu tracking public cho khách

| Trường | Nội dung |
|---|---|
| **ID** | UR-SHIP-12 |
| **Tên** | Public tracking page |
| **Actor** | Customer |
| **Mô tả** | Cung cấp URL public `tracking/{code}` để KH nhập mã vận đơn (hoặc SĐT) tra cứu trạng thái giao hàng. Không cần đăng nhập. |
| **Tiền điều kiện** | Phiếu có mã tracking |
| **Đầu vào** | Mã tracking hoặc SĐT |
| **Đầu ra** | Timeline trạng thái + địa điểm hiện tại |
| **Tiêu chí chấp nhận** | - Không lộ thông tin nhạy cảm (giá đơn)<br>- Rate limit chống spam<br>- Responsive mobile |
| **Ưu tiên** | **C** |

## 4. Quy tắc nghiệp vụ

- **1 đơn → nhiều phiếu giao**: 1 đơn có thể tách thành nhiều kiện giao (chia đơn theo kho).
- **COD chỉ áp dụng cho đơn chưa thanh toán online**: đơn đã thanh toán qua cổng không có COD.
- **Freeship rule**: áp dụng theo thứ tự ưu tiên: KH VIP > voucher > bảng phí.
- **Cancel cost**: huỷ sau khi partner đã nhận có thể phát sinh phí, ghi nhận như chi phí.
- **Webhook idempotency**: phải xử lý duplicate webhook an toàn (dùng event_id).

## 5. Non-functional ràng buộc

- **Availability**: webhook endpoint 99.9% uptime, xử lý < 500ms.
- **Reliability**: retry API partner 3 lần với exponential backoff khi lỗi network.
- **Security**: credentials API partner mã hoá AES-256 trong DB; webhook verify HMAC signature.
- **Audit**: log mọi call API partner (request, response, latency) giữ 90 ngày để debug.
- **Performance**: dashboard logistics render < 3s với 10k phiếu/tháng.

---

*Hết Part 07. Xem tiếp [Part 08 — Tài chính](part-08-tai-chinh.md).*
