# Part 02 — POS: Bán hàng tại quầy

## 1. Phạm vi phân hệ

**Phân hệ cốt lõi của Reborn Retail** — toàn bộ thao tác bán hàng tại quầy: mở/đóng ca, quản lý quỹ tiền mặt, tạo đơn, thanh toán, in hoá đơn, trả hàng, kiểm kê cuối ca. Đây là mô-đun có **ưu tiên cao nhất** và phải đảm bảo tốc độ thao tác nhanh.

## 2. Actor liên quan

- **Cashier / Thu ngân** — người dùng chính tại POS
- **Store Manager** — duyệt các thao tác đặc biệt (giảm giá lớn, huỷ đơn)
- **System** — tự động close ca nếu quá giờ, gửi cảnh báo
- **Customer** — khách hàng cuối (thông qua quét thẻ/SĐT)

## 3. Yêu cầu chi tiết

### UR-POS-01 — Mở ca làm việc

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-01 |
| **Tên** | Mở ca với số tiền đầu ca |
| **Actor** | Cashier |
| **Mô tả** | Cashier vào `/shift_management` → nhấn **Mở ca**, nhập số tiền mặt đầu ca (tiền rút từ két, tiền lẻ). Hệ thống tạo bản ghi `shift` với trạng thái `OPEN`, gắn `cashier_id`, `branch_id`, `opened_at`. |
| **Tiền điều kiện** | Cashier chưa có ca nào đang OPEN trên cùng cơ sở (CN-03) |
| **Đầu vào** | `openingCash` ≥ 0 (VND) |
| **Đầu ra** | Ca mới được tạo, POS khoá màn hình nếu cố tạo đơn mà chưa mở ca |
| **Tiêu chí chấp nhận** | - 1 cashier chỉ có 1 ca OPEN tại 1 thời điểm<br>- Nếu ca hôm qua chưa đóng → warning + buộc đóng trước<br>- Số tiền đầu ca lưu audit |
| **Ưu tiên** | **M** |

### UR-POS-02 — Tìm kiếm sản phẩm nhanh

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-02 |
| **Tên** | Tìm SP bằng tên / mã SKU / mã vạch |
| **Actor** | Cashier |
| **Mô tả** | Ô tìm kiếm ở `/create_sale_add` hỗ trợ 3 kiểu input: (1) Gõ tên SP → autocomplete gợi ý; (2) Scan mã vạch → tự add vào giỏ; (3) Nhập SKU đầy đủ + Enter → add vào giỏ. Tìm kiếm phải có debounce 200ms, fuzzy match tên. |
| **Đầu vào** | Chuỗi tìm kiếm hoặc barcode scanner input |
| **Đầu ra** | Danh sách gợi ý top 10 SP kèm ảnh, giá, tồn kho |
| **Tiêu chí chấp nhận** | - Response ≤ 200ms cho tenant ≤ 10k SKU<br>- Hiển thị "Hết hàng" cho SP có stock = 0<br>- Nếu có nhiều đơn vị (thùng/gói/cái) → cho chọn đơn vị |
| **Ưu tiên** | **M** |

### UR-POS-03 — Thêm SP vào giỏ hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-03 |
| **Tên** | Giỏ hàng động với số lượng, giá, giảm giá dòng |
| **Actor** | Cashier |
| **Mô tả** | Mỗi dòng trong giỏ có: SP (tên, SKU, ảnh), số lượng (có nút ±), đơn giá (cho phép sửa nếu có quyền), giảm giá dòng (% hoặc số tiền), thành tiền tự tính. Tổng tiền ở cuối giỏ update real-time. |
| **Đầu vào** | User chọn SP từ tìm kiếm |
| **Đầu ra** | Dòng mới trong giỏ, subtotal update |
| **Tiêu chí chấp nhận** | - Thêm SP đã có trong giỏ → tăng số lượng (không tạo dòng mới)<br>- Giá sửa thấp hơn giá vốn → warning nhưng có thể override nếu có quyền<br>- Hỗ trợ unit conversion (mua 1 thùng = 24 chai) |
| **Ưu tiên** | **M** |

### UR-POS-04 — Chọn khách hàng cho đơn

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-04 |
| **Tên** | Gắn khách hàng vào đơn (optional) |
| **Actor** | Cashier |
| **Mô tả** | Trên POS có ô chọn khách: tìm theo SĐT hoặc tên. Nếu không có khách hàng mới, có nút "Tạo khách nhanh" mở form inline (SĐT + tên). Khách được chọn hiển thị ở header của giỏ, kèm điểm tích luỹ và hạng thẻ. |
| **Đầu vào** | SĐT 10 số hoặc tên |
| **Đầu ra** | `customerId` gắn vào đơn |
| **Tiêu chí chấp nhận** | - Đơn không có khách vẫn tạo được (khách vãng lai)<br>- Khách có voucher khả dụng → gợi ý auto apply<br>- Hiển thị cảnh báo nếu khách có công nợ quá hạn |
| **Ưu tiên** | **M** |

### UR-POS-05 — Áp dụng khuyến mãi / voucher

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-05 |
| **Tên** | Áp mã giảm giá / chương trình khuyến mãi |
| **Actor** | Cashier |
| **Mô tả** | Nút "Áp KM" mở modal: (1) Nhập mã voucher thủ công; hoặc (2) Chọn từ list khuyến mãi đang chạy (buy 1 get 1, mua 3 giảm 10%, giảm theo hạng thẻ). Hệ thống validate điều kiện áp dụng, tính giảm và cập nhật tổng tiền. |
| **Đầu vào** | Mã voucher hoặc chương trình được chọn |
| **Đầu ra** | Dòng "Giảm giá" trong giỏ + tổng tiền mới |
| **Tiêu chí chấp nhận** | - Voucher hết hạn / đã dùng hết lượt → reject + lý do<br>- Có thể stack nhiều khuyến mãi nếu cấu hình cho phép<br>- Audit trail voucher dùng |
| **Ưu tiên** | **S** |

### UR-POS-06 — Thanh toán đa phương thức

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-06 |
| **Tên** | Thanh toán bằng tiền mặt / thẻ / QR / chuyển khoản / công nợ |
| **Actor** | Cashier, Customer |
| **Mô tả** | Sau khi giỏ hàng hoàn tất, nhấn **Thanh toán** → modal chọn phương thức: Tiền mặt, Thẻ, QR code (VietQR), Chuyển khoản, Ghi công nợ. Có thể split thanh toán (vd 500k tiền mặt + 300k thẻ). Với QR, hệ thống hiển thị mã động có số tiền + nội dung CK. |
| **Đầu vào** | Phương thức + số tiền từng phương thức |
| **Đầu ra** | Đơn chuyển trạng thái `PAID`, trừ tồn kho, ghi nhận vào sổ thu |
| **Tiêu chí chấp nhận** | - Tổng các phương thức = tổng tiền đơn<br>- QR có timeout 5 phút, auto hết hạn<br>- Chuyển khoản chờ webhook xác nhận từ bank → cashier nhấn "Xác nhận đã nhận"<br>- Ghi công nợ yêu cầu có customerId |
| **Ưu tiên** | **M** |

### UR-POS-07 — In hoá đơn bán hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-07 |
| **Tên** | In bill nhiệt hoặc xuất PDF/email |
| **Actor** | Cashier |
| **Mô tả** | Sau khi thanh toán, hệ thống tự động: (1) In bill ra máy in nhiệt kết nối (nếu có driver cấu hình); (2) Gửi hoá đơn qua email/SMS cho khách (nếu có thông tin); (3) Cho phép xuất PDF/in lại bất cứ lúc nào. |
| **Đầu vào** | `orderId` vừa hoàn tất |
| **Đầu ra** | Bill được in + lưu log |
| **Tiêu chí chấp nhận** | - Template bill cấu hình được (logo, footer, QR tra cứu)<br>- In lại không tạo đơn mới<br>- Fallback PDF nếu máy in lỗi |
| **Ưu tiên** | **M** |

### UR-POS-08 — Phát hành hoá đơn VAT điện tử

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-08 |
| **Tên** | Tạo HDDT theo yêu cầu khách |
| **Actor** | Cashier, Accountant |
| **Mô tả** | Khách yêu cầu VAT → nhập: tên công ty, MST, địa chỉ, email. Hệ thống gọi provider HDDT (VNPT, M-Invoice, VietInvoice...) để phát hành, nhận về mã tra cứu + link xem. Gửi email/SMS cho khách. |
| **Tiền điều kiện** | Đơn hàng đã PAID; tenant đã cấu hình provider HDDT |
| **Đầu vào** | Thông tin người mua (MST bắt buộc) |
| **Đầu ra** | HDDT phát hành, mã tra cứu lưu vào đơn |
| **Tiêu chí chấp nhận** | - Theo quy định TT78/NĐ123<br>- HDDT đã phát hành không sửa được, chỉ huỷ + phát hành lại (CN-05)<br>- Retry 3 lần nếu provider timeout |
| **Ưu tiên** | **M** |

### UR-POS-09 — Tạm treo đơn / Parked orders

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-09 |
| **Tên** | Lưu đơn tạm, xử lý đơn khác, quay lại sau |
| **Actor** | Cashier |
| **Mô tả** | Khi khách đang lưỡng lự hoặc quên ví, cashier có thể **Tạm treo** đơn để phục vụ khách khác. Danh sách đơn tạm hiển thị bên cạnh, click để resume. |
| **Đầu vào** | Đơn trong giỏ chưa thanh toán |
| **Đầu ra** | Đơn chuyển trạng thái `PARKED`, hiển thị ở sidebar |
| **Tiêu chí chấp nhận** | - Cashier có thể park nhiều đơn<br>- Đơn park tự động huỷ sau 24h nếu không resume<br>- Không trừ tồn kho khi park |
| **Ưu tiên** | **S** |

### UR-POS-10 — Trả hàng / Return invoice

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-10 |
| **Tên** | Xử lý hoàn trả hàng từ khách |
| **Actor** | Cashier, Store Manager |
| **Mô tả** | Trang `/return_invoice` cho phép tìm đơn gốc qua mã hoặc SĐT khách, chọn sản phẩm cần trả (1 phần hoặc toàn bộ), ghi lý do, chọn phương thức hoàn tiền (trả tiền mặt, credit về voucher, hoàn về thẻ). |
| **Tiền điều kiện** | Đơn gốc đã PAID; chính sách trả hàng cho phép (thời hạn, SP đủ điều kiện) |
| **Đầu vào** | `originalOrderId`, danh sách item trả + số lượng, lý do |
| **Đầu ra** | Phiếu trả hàng, cộng lại tồn kho, ghi nhận vào sổ chi |
| **Tiêu chí chấp nhận** | - Cần approval của Store Manager nếu quá X ngày<br>- SP không đủ điều kiện trả (khuyến mãi flash, SP vệ sinh) → reject<br>- Trả 1 phần thì đơn gốc chia đôi lịch sử |
| **Ưu tiên** | **M** |

### UR-POS-11 — Kiểm kê cuối ca

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-11 |
| **Tên** | Đếm tiền + đối chiếu trước khi đóng ca |
| **Actor** | Cashier |
| **Mô tả** | Trang `/shift_inventory` cuối ca: hệ thống hiển thị tổng doanh thu dự kiến theo từng phương thức (tiền mặt, thẻ, QR). Cashier đếm tiền mặt thực tế, nhập vào. Chênh lệch được ghi chú với lý do. |
| **Đầu vào** | Số đếm thực tế từng loại mệnh giá |
| **Đầu ra** | Phiếu kiểm kê ca, chênh lệch lưu vào sổ chi/thu phụ |
| **Tiêu chí chấp nhận** | - Chênh lệch > 5% → buộc note lý do<br>- Không cho đóng ca nếu chưa kiểm kê<br>- Export báo cáo ca PDF |
| **Ưu tiên** | **M** |

### UR-POS-12 — Đóng ca

| Trường | Nội dung |
|---|---|
| **ID** | UR-POS-12 |
| **Tên** | Đóng ca, chốt số liệu |
| **Actor** | Cashier, System |
| **Mô tả** | Nhấn **Đóng ca** → xác nhận kiểm kê đã làm → ca chuyển trạng thái `CLOSED` với `closed_at`, `closing_cash`, `total_revenue`. Sau đó không được thao tác thêm trên ca này (CN-07). |
| **Tiêu chí chấp nhận** | - System auto-close ca sau 24h nếu cashier quên<br>- Ca đóng rồi → chỉ xem, không sửa<br>- Báo cáo ca gửi email cho Store Manager |
| **Ưu tiên** | **M** |

## 4. Quy tắc nghiệp vụ liên quan

- **Mỗi đơn bắt buộc thuộc 1 ca**: nếu cashier chưa mở ca → không cho tạo đơn.
- **Tồn kho trừ ngay khi đơn PAID**: optimistic update trên FE, rollback nếu BE fail.
- **Giá vốn khoá tại thời điểm bán**: khi báo cáo lãi/lỗ dùng giá vốn tại lúc đó, không dùng giá vốn hiện tại.
- **Không cho xoá đơn đã PAID**: chỉ có thể huỷ (tạo phiếu ngược) hoặc trả hàng.

## 5. Non-functional ràng buộc

- **Performance**: Add-to-cart ≤ 200ms, thanh toán ≤ 500ms (không tính thời gian payment gateway).
- **Reliability**: POS có cache giỏ hàng ở localStorage — reload browser không mất data chưa submit.
- **Usability**: Hỗ trợ phím tắt cho mọi thao tác chính (F2 tìm SP, F9 thanh toán, Esc huỷ).
- **Concurrency**: 50+ POS cùng lúc/tenant peak, không deadlock khi update stock.

---

*Hết Part 02. Xem tiếp [Part 03 — Khách hàng](part-03-khach-hang.md).*
