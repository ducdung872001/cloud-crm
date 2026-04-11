# Backend Changes Required - Bug Report Reborn Retail

## 1. Sales Microservice (prefixSales)

### C.3.1 - Không duyệt được phiếu trả hàng (400 Bad Request)
- **Endpoint**: `POST /sales/invoice/return/confirm?id={id}`
- **Vấn đề**: API trả về 400 Bad Request khi gọi confirm
- **Nguyên nhân có thể**: 
  - FE truyền `id` từ response của `create/return` hoặc `create/exchange`. Nếu response không trả về `id` thì FE dùng `Date.now()` (timestamp) làm ID → gọi confirm với ID sai
  - **Action BE**: Đảm bảo response của `POST /sales/invoice/create/return` và `POST /sales/invoice/create/exchange` **trả về `id` (invoiceId)** trong `result`. FE đã handle: `if (res?.result?.id) optimistic.id = String(res.result.id);`
- **Ưu tiên**: CAO

### C.3.4 - Cho phép tạo 2 phiếu trả hàng cho cùng 1 đơn
- **Endpoint**: `POST /sales/invoice/create/return`
- **Vấn đề**: 1 đơn vị sản phẩm trong 1 đơn hàng chỉ được trả 1 lần duy nhất, nhưng hiện tại BE cho tạo nhiều phiếu trả cho cùng 1 mã đơn
- **Action BE**: Validate trước khi tạo phiếu trả - kiểm tra số lượng đã trả của từng sản phẩm trong đơn gốc. Nếu đã trả hết thì reject
- **Ưu tiên**: CAO

### C.3.5 / C.3.7 - Phiếu đổi/trả hàng tạo thành công nhưng không thấy trong danh sách
- **Endpoint**: `GET /sales/invoice/return-exchange/list`
- **Vấn đề**: Sau khi tạo phiếu đổi hàng (IV11) hoặc trả hàng (IV2) thành công, reload trang không thấy phiếu trong danh sách
- **Action BE**: 
  - Kiểm tra endpoint list có include cả invoiceType IV11 (đổi hàng) không, hay chỉ list IV2
  - Kiểm tra phiếu vừa tạo có thực sự được persist vào DB hay bị rollback
  - Kiểm tra filter mặc định của list API
- **Ưu tiên**: CAO

### C.3.6 - Trả hàng hoàn tiền gốc thay vì giá sau giảm
- **Vấn đề**: Khách áp mã giảm giá, trả 3.663.000đ nhưng khi trả hàng BE hoàn khách 4.070.000đ (giá gốc)
- **Action BE**: Khi tạo phiếu trả hàng, `fee` (tiền hoàn) phải dựa trên giá thực tế khách đã thanh toán (sau discount), không phải giá gốc. Cần tính: `refundAmount = originalFee - discount` cho từng sản phẩm
- **Ưu tiên**: CAO (gây thất thoát tài chính)

### C.3.8 - Sau trả hàng thành công không cộng tồn kho
- **Endpoint**: `POST /sales/invoice/return/confirm`
- **Vấn đề**: Xác nhận trả hàng thành công nhưng không trigger cộng lại tồn kho
- **Action BE**: Khi confirm phiếu trả hàng, phải gọi Inventory service để cộng lại số lượng tồn kho tương ứng
- **Ưu tiên**: CAO

### C.3.3 - Tên sản phẩm không hiện trên phiếu trả hàng
- **Endpoint**: `GET /sales/invoice/return-exchange/list`
- **Vấn đề**: Response thiếu thông tin sản phẩm (products array) trong từng phiếu
- **Action BE**: Include `products` array (productId, variantId, name, qty) trong response của list API. FE đã có logic enrich từ Inventory nhưng cần BE trả products cơ bản
- **Ưu tiên**: TRUNG BÌNH

---

## 2. Inventory Microservice (prefixInventory)

### D.4.1 - Mua hàng không trừ tồn kho
- **Vấn đề**: Nhập 200 sản phẩm thành công, bán 6 sản phẩm nhưng tồn kho vẫn 200
- **Action BE**: Khi Sales tạo đơn hàng thành công (hoàn thành thanh toán), phải trigger trừ tồn kho trong Inventory service
- **Ưu tiên**: CAO

### D.4.2 - Sổ kho không cập nhật sau bán hàng
- **Vấn đề**: Tab "Xuất bán" trong sổ kho - tồn trước và tồn sau đều hiện 0
- **Action BE**: Bản ghi xuất bán cần điền đúng `tồn trước` = tồn kho trước khi bán, `tồn sau` = tồn trước - số lượng bán
- **Ưu tiên**: CAO

### D.1.2 / D.1.4 - Thêm/nhân bản sản phẩm thành công nhưng không hiện trong danh sách
- **Endpoint**: `POST /inventory/product/create` (hoặc tương tự)
- **Vấn đề**: API trả success nhưng sản phẩm không xuất hiện khi list
- **Action BE**: Kiểm tra product create flow - có thể thiếu mapping `bsnId` hoặc `branchId`, khiến sản phẩm bị tạo ở context khác
- **Ưu tiên**: TRUNG BÌNH

### D.1.3 - Mã vạch biến thể không lưu
- **Vấn đề**: Sinh mã vạch cho biến thể → lưu sản phẩm → vào lại không thấy mã vạch
- **Action BE**: Kiểm tra flow lưu barcode cho variant - có thể endpoint update product không persist barcode của variant
- **Ưu tiên**: THẤP

---

## 3. Admin Microservice (prefixAdmin)

### E.1.1 - Tìm kiếm khách hàng không tìm được bằng SĐT/email
- **Endpoint**: `GET /admin/customer/list_paid?keyword=...`
- **Vấn đề**: Chỉ tìm được theo tên, không tìm theo SĐT và email
- **Action BE**: Mở rộng query tìm kiếm `keyword` để match cả: `name LIKE %keyword%` OR `phone LIKE %keyword%` OR `email LIKE %keyword%`
- **Ưu tiên**: TRUNG BÌNH

---

## 4. Notification Microservice (prefixNotification)

### B.2 - Bộ lọc thông báo (phần BE)
- **Endpoint**: `GET /firebaseDeliveryHistory/list`
- **Vấn đề**: FE đã fix filter params (không gửi params cũ khi clear filter). Nhưng nếu filter vẫn không hoạt động sau fix FE → BE cần kiểm tra:
  - Param `branchId` có được query đúng không
  - Param `status` có filter đúng loại thông báo không (ví dụ: "Đã hủy" chỉ nên trả đơn hàng đã hủy, không phải thông báo tồn kho)
  - Param `fromTime` / `toTime` format DD/MM/YYYY có được parse đúng không
- **Ưu tiên**: TRUNG BÌNH (FE đã fix phần chính)

---

## 5. Shipping / Integration Microservice

### C.5.1 - Không tạo được đơn vận chuyển
- **Vấn đề**: Screenshot hiện "Tạo đơn thất bại"
- **Action BE**: Cần debug endpoint tạo đơn vận chuyển - kiểm tra log lỗi cụ thể
- **Ưu tiên**: CAO

---

## 6. Market Microservice (prefixMA)

### C.1.2 - Voucher/Promotion check eligible
- **Endpoint**: Promotion check eligible endpoint
- **Vấn đề**: FE mock đã tắt (`DEV_MOCK = false`). BE cần trả dữ liệu thật cho eligible/ineligible promotions
- **Action BE**: Implement/fix endpoint check eligible promotions, đảm bảo kiểm tra điều kiện `minOrderAmount` trước khi đưa vào eligible list
- **Ưu tiên**: TRUNG BÌNH

---

## 7. Billing Microservice

### F.6.2 - QR Thu nợ không chia sẻ được
- **Vấn đề**: Không chia sẻ trực tiếp qua Zalo/Facebook/Messenger. Copy link không hiện URL
- **Action BE**: Tạo endpoint public có thể share link (ví dụ: `https://pay.reborn.vn/qr/{debtId}`) thay vì chỉ trả QR image
- **Ưu tiên**: THẤP

---

## 8. Multi-channel / Online Orders

### C.4.1 - Không xuất được báo cáo/Excel
- **Vấn đề**: Tổng quan và đơn hàng đa kênh không xuất được
- **Action BE**: Kiểm tra endpoint export cho multi-channel orders
- **Ưu tiên**: THẤP
