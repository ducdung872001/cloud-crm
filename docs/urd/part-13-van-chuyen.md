# Part 13 — Vận chuyển & Logistics (Shipping & Logistics)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-LOG-01: Đối tác vận chuyển

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-LOG-01 |
| **Tên** | Đối tác vận chuyển (Shipping Partner Management) |
| **Actor** | Admin, Warehouse Staff, Sales |
| **Mô tả** | Quản lý các đối tác vận chuyển và tạo đơn giao hàng tích hợp. **Đối tác:** tích hợp API với Giao Hàng Nhanh (GHN), Giao Hàng Tiết Kiệm (GHTK), Viettel Post, J&T Express, và đối tác tuỳ chỉnh (manual). Mỗi đối tác gồm: tên, API credentials, trạng thái kết nối, dịch vụ hỗ trợ (standard, express, same-day), khu vực phục vụ. **Đơn giao hàng:** tạo đơn trực tiếp từ CRM khi xuất kho (link UR-INV-03) hoặc từ đơn hàng. Thông tin đơn: mã đơn CRM, mã vận đơn (từ hãng vận chuyển), người gửi (kho/chi nhánh), người nhận (khách hàng), địa chỉ giao, danh sách sản phẩm, trọng lượng, kích thước, dịch vụ giao hàng, phí vận chuyển (auto-calculate từ API), COD (thu hộ), ghi chú giao hàng. **Tracking:** đồng bộ trạng thái đơn hàng realtime từ hãng vận chuyển (Picking Up / In Transit / Delivering / Delivered / Returned / Failed), webhook nhận cập nhật, hiển thị timeline giao hàng. |
| **Tiền điều kiện** | Đối tác vận chuyển đã kết nối API (UR-SET-03). Kho và sản phẩm đã có. |
| **Đầu vào** | **Cấu hình đối tác:** Tên (*), API key (*), dịch vụ, khu vực. **Tạo đơn giao hàng:** Đối tác (*), người nhận (*), địa chỉ giao (*), sản phẩm (*), trọng lượng (*), dịch vụ (*), COD amount, ghi chú. |
| **Đầu ra** | Đơn giao hàng được tạo, mã vận đơn từ hãng. Phí vận chuyển tự động tính. Tracking realtime. In phiếu giao hàng (label). Thông báo khách hàng khi trạng thái thay đổi. |
| **Tiêu chí chấp nhận** | 1. Kết nối GHN, GHTK, Viettel Post qua API thành công. 2. Tạo đơn giao hàng từ CRM, nhận mã vận đơn từ hãng. 3. Auto-calculate phí vận chuyển từ API (theo trọng lượng, khoảng cách, dịch vụ). 4. Tracking realtime: đồng bộ trạng thái qua webhook/polling (< 5 phút delay). 5. Timeline giao hàng hiển thị đầy đủ các mốc. 6. COD: ghi nhận số tiền thu hộ, đối soát khi đã giao. 7. In phiếu giao hàng / label (PDF, format hãng vận chuyển). 8. Gửi SMS/email thông báo khách hàng khi trạng thái thay đổi. 9. Đối soát đơn hàng: đã giao, đã thu COD, đã đối soát. 10. Báo cáo giao hàng: tổng đơn, tỷ lệ giao thành công, thời gian giao trung bình. |
| **Ưu tiên** | **C** |

---

## UR-LOG-02: Phí vận chuyển

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-LOG-02 |
| **Tên** | Phí vận chuyển (Shipping Fee Management) |
| **Actor** | Admin, Sales, Finance |
| **Mô tả** | Quản lý bảng giá và chính sách phí vận chuyển. **Bảng giá vận chuyển:** cấu hình giá theo đối tác, dịch vụ, khu vực (nội thành / ngoại thành / liên tỉnh), trọng lượng (theo bậc thang: 0-1kg, 1-5kg, 5-10kg, > 10kg), kích thước (quy đổi trọng lượng thể tích). Hỗ trợ 2 chế độ: **API pricing** (lấy giá realtime từ API hãng vận chuyển) và **Custom pricing** (admin tự cấu hình bảng giá nội bộ). **Chính sách miễn phí vận chuyển:** cấu hình điều kiện miễn phí (đơn hàng >= X đồng, khách hàng VIP, chương trình khuyến mãi). **Phụ phí:** cấu hình phụ phí theo điều kiện (giao hàng ngoài giờ, hàng cồng kềnh, hàng dễ vỡ, giao hàng vùng xa). Phí vận chuyển hiển thị khi tạo đơn hàng/hoá đơn, khách hàng hoặc doanh nghiệp chịu (configurable). |
| **Tiền điều kiện** | Đối tác vận chuyển đã cấu hình (UR-LOG-01). |
| **Đầu vào** | **Bảng giá:** Đối tác (*), dịch vụ (*), khu vực (*), trọng lượng (*), giá (*). **Chính sách miễn phí:** Điều kiện (*), áp dụng cho (tất cả / segment KH / chương trình). **Phụ phí:** Tên (*), điều kiện (*), số tiền / % (*). |
| **Đầu ra** | Phí vận chuyển tự động tính khi tạo đơn hàng. Áp dụng miễn phí / phụ phí đúng điều kiện. Hiển thị breakdown phí (phí cơ bản + phụ phí - giảm giá). |
| **Tiêu chí chấp nhận** | 1. Cấu hình bảng giá theo đối tác, dịch vụ, khu vực, trọng lượng. 2. API pricing: lấy giá realtime từ GHN/GHTK/Viettel Post API. 3. Custom pricing: admin nhập bảng giá nội bộ, override API price. 4. Tính phí chính xác theo trọng lượng thực tế hoặc thể tích (chọn giá trị lớn hơn). 5. Miễn phí vận chuyển tự động áp dụng khi đủ điều kiện. 6. Phụ phí tự động cộng thêm theo điều kiện. 7. Breakdown phí: hiển thị rõ phí cơ bản, phụ phí, giảm giá, tổng. 8. Phí vận chuyển hiển thị trên đơn hàng / hoá đơn. 9. Báo cáo chi phí vận chuyển: tổng phí theo tháng, đối tác, khu vực. 10. Import/Export bảng giá từ Excel. |
| **Ưu tiên** | **C** |
