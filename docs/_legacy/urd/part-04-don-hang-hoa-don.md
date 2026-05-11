# Part 04 — Đơn hàng & Hoá đơn

## 1. Phạm vi phân hệ

Danh sách đơn hàng (bán + trả + đa kênh), hoá đơn VAT điện tử, trả hàng, multi-channel sales (Shopee/Lazada/Website), báo giá.

## 2. Actor liên quan

- **Cashier** — tạo đơn tại POS (đã cover Part 02)
- **Sales Rep** — tạo đơn cho khách B2B, báo giá
- **Accountant** — xuất VAT, đối soát
- **Online Sales Manager** — quản lý đơn từ marketplace

## 3. Yêu cầu chi tiết

### UR-ORDER-01 — Danh sách đơn bán

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-01 |
| **Tên** | Xem danh sách đơn bán theo cơ sở / kỳ |
| **Actor** | Cashier, Sales, Accountant |
| **Mô tả** | `/sale_invoice` liệt kê đơn với filter: ngày, cơ sở, trạng thái (PENDING/PAID/CANCELLED/REFUNDED), phương thức thanh toán, nhân viên bán, khách hàng. Click mở detail. |
| **Tiêu chí chấp nhận** | - Filter realtime, kết quả ≤ 1s cho 1 tháng<br>- Export Excel<br>- Highlight đơn chưa thanh toán |
| **Ưu tiên** | **M** |

### UR-ORDER-02 — Chi tiết đơn hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-02 |
| **Tên** | Xem chi tiết đơn với đầy đủ item, thuế, thanh toán |
| **Actor** | Cashier, Accountant |
| **Mô tả** | Modal hoặc trang detail hiển thị: khách, danh sách item (SKU, qty, đơn giá, chiết khấu, thành tiền), tổng, thuế, phương thức thanh toán, cashier, thời gian, trạng thái, lịch sử thay đổi. |
| **Tiêu chí chấp nhận** | - In lại bill<br>- Xem HDDT (nếu đã phát hành)<br>- Action: huỷ / trả hàng / cộng dồn nợ |
| **Ưu tiên** | **M** |

### UR-ORDER-03 — Huỷ đơn hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-03 |
| **Tên** | Huỷ đơn trong phạm vi cho phép |
| **Actor** | Store Manager |
| **Mô tả** | Đơn PENDING có thể huỷ ngay. Đơn PAID chỉ huỷ được qua phiếu hoàn (Return invoice). Ghi lý do huỷ, tạo audit trail. |
| **Tiêu chí chấp nhận** | - Huỷ đơn PAID cần Store Manager approval<br>- Cộng lại tồn kho<br>- Hoàn tiền theo phương thức đã thu |
| **Ưu tiên** | **M** |

### UR-ORDER-04 — Đơn đa kênh (Multi-channel Sales)

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-04 |
| **Tên** | Đồng bộ đơn từ marketplace (Shopee/Lazada/TikTok Shop) |
| **Actor** | Online Sales Manager, System |
| **Mô tả** | `/multi_channel_sales` hiển thị đơn từ các kênh online. Đơn được pull từ marketplace qua API sync định kỳ (5-15 phút). Hỗ trợ confirm, đóng gói, giao vận chuyển. |
| **Tiêu chí chấp nhận** | - Hiển thị rõ kênh nguồn (logo Shopee/Lazada...)<br>- SKU map giữa hệ thống và marketplace<br>- Đồng bộ trạng thái 2 chiều |
| **Ưu tiên** | **S** |

### UR-ORDER-05 — Hoá đơn VAT điện tử

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-05 |
| **Tên** | Phát hành / xem HDDT theo yêu cầu |
| **Actor** | Cashier, Accountant |
| **Mô tả** | `/invoiceVAT` liệt kê HDDT đã phát hành. Tích hợp provider (VNPT / M-Invoice / MISA MeInvoice). Cho phép phát hành từ đơn đã bán, huỷ + phát hành lại. Tuân thủ TT78/NĐ123. |
| **Tiêu chí chấp nhận** | - Provider timeout → retry 3 lần<br>- Huỷ HDDT ghi lý do, tạo HDDT thay thế<br>- Gửi HDDT cho khách qua email/SMS tự động |
| **Ưu tiên** | **M** |

### UR-ORDER-06 — Trả hàng / Hoàn tiền

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-06 |
| **Tên** | Xử lý khách trả hàng (đã cover chi tiết UR-POS-10) |
| **Actor** | Cashier, Store Manager |
| **Mô tả** | `/return_invoice` quản lý danh sách phiếu trả + tạo mới. Tìm đơn gốc → chọn item → lý do → phương thức hoàn. |
| **Tiêu chí chấp nhận** | - Xem tại Part 02 UR-POS-10 |
| **Ưu tiên** | **M** |

### UR-ORDER-07 — Báo giá (Offer / Quotation)

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-07 |
| **Tên** | Tạo báo giá gửi khách trước khi bán |
| **Actor** | Sales Rep |
| **Mô tả** | Form tạo báo giá: chọn SP, qty, giá (có thể discount), validity date. Xuất PDF có logo, gửi email/zalo. Có thể convert thành đơn khi khách đồng ý. |
| **Tiêu chí chấp nhận** | - Tracking trạng thái: sent/viewed/accepted/expired<br>- Convert → đơn không trùng SKU<br>- Lưu version nếu sửa |
| **Ưu tiên** | **C** |

### UR-ORDER-08 — Đơn tạm (Temporary / Draft Orders)

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-08 |
| **Tên** | Lưu đơn tạm chưa submit |
| **Actor** | Cashier |
| **Mô tả** | Đơn được park từ POS (UR-POS-09) xuất hiện ở `/temporary_order_list`. Cho phép filter, resume, delete. |
| **Tiêu chí chấp nhận** | - Tự xoá sau 24h<br>- Không trừ tồn kho<br>- Convert lên đơn thật |
| **Ưu tiên** | **C** |

### UR-ORDER-09 — Theo dõi đơn giao (Order Tracking)

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-09 |
| **Tên** | Tracking đơn đã chuyển cho logistics |
| **Actor** | Sales, Online Sales Manager |
| **Mô tả** | `/order_tracking` hiển thị đơn đã gửi vận chuyển với trạng thái từ logistics partner: pending / picked up / in transit / delivered / failed. |
| **Tiêu chí chấp nhận** | - Sync từ GHN/GHTK/VNPost API<br>- Notification khi có thay đổi trạng thái<br>- Auto close đơn khi delivered |
| **Ưu tiên** | **S** |

### UR-ORDER-10 — Báo cáo đơn bán

| Trường | Nội dung |
|---|---|
| **ID** | UR-ORDER-10 |
| **Tên** | Thống kê đơn theo kỳ / nhân viên / kênh |
| **Actor** | Store Manager, Accountant |
| **Mô tả** | (Chi tiết ở Part 11). Đếm số đơn, doanh thu, tỷ lệ huỷ, AOV theo ngày/tuần/tháng. |
| **Ưu tiên** | **S** |

## 4. Non-functional

- **Concurrency**: 50+ đơn cùng submit không race condition.
- **Audit**: Mọi thay đổi đơn ghi log (ai, khi nào, gì).
- **Compliance**: HDDT tuân thủ TT78 (mã CQT).

---

*Hết Part 04. Xem tiếp [Part 05 — Kho & Sản phẩm](part-05-kho-san-pham.md).*
