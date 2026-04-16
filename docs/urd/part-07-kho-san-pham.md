# Part 07 — Kho & Sản phẩm (Inventory & Products)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-INV-01: Quản lý sản phẩm/dịch vụ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-INV-01 |
| **Tên** | Quản lý sản phẩm / dịch vụ (Product & Service Catalog) |
| **Actor** | Sales, Product Manager, Admin |
| **Mô tả** | Quản lý danh mục sản phẩm và dịch vụ của doanh nghiệp. Mỗi sản phẩm/dịch vụ gồm: mã (SKU, tự động hoặc nhập tay), tên, loại (Sản phẩm vật lý / Dịch vụ / Phần mềm / Subscription), danh mục (cây phân cấp tối đa 3 level), đơn vị tính, giá bán (hỗ trợ nhiều bảng giá: Standard / Enterprise / Partner), giá vốn, thuế VAT (%), mô tả ngắn, mô tả chi tiết (rich text), hình ảnh (tối đa 10 ảnh), tài liệu đính kèm (datasheet, brochure), trạng thái (Active / Inactive / Discontinued), thuộc tính tuỳ chỉnh (custom fields). Với loại Subscription: chu kỳ thanh toán (Monthly / Quarterly / Yearly), giá theo chu kỳ, tự động tạo hoá đơn gia hạn. Hỗ trợ bundle (gói sản phẩm): nhóm nhiều sản phẩm/dịch vụ thành 1 gói với giá ưu đãi. |
| **Tiền điều kiện** | Danh mục sản phẩm đã được cấu hình. Người dùng có quyền quản lý sản phẩm. |
| **Đầu vào** | Mã SKU, tên (*), loại (*), danh mục (*), đơn vị tính (*), giá bán (*), giá vốn, thuế VAT, mô tả, hình ảnh, tài liệu, thuộc tính tuỳ chỉnh, cấu hình subscription (nếu áp dụng), bundle items (nếu bundle). |
| **Đầu ra** | Sản phẩm/dịch vụ được tạo với SKU. Hiển thị trong danh mục khi tạo báo giá, hoá đơn, hợp đồng. Bảng giá áp dụng đúng theo loại khách hàng. |
| **Tiêu chí chấp nhận** | 1. CRUD sản phẩm/dịch vụ hoạt động đúng. 2. Danh mục cây phân cấp 3 level hoạt động (tạo, sắp xếp, di chuyển). 3. Nhiều bảng giá: Standard, Enterprise, Partner — áp dụng đúng khi tạo báo giá. 4. Subscription: tự động tạo hoá đơn gia hạn khi hết chu kỳ. 5. Bundle: hiển thị giá gốc và giá gói, tự trừ tồn kho từng item. 6. Upload tối đa 10 ảnh (5MB/ảnh), kéo thả sắp xếp thứ tự. 7. Tìm kiếm sản phẩm theo tên, SKU, danh mục. 8. Lọc theo loại, danh mục, trạng thái, khoảng giá. 9. Import sản phẩm từ Excel (template chuẩn). 10. Xuất danh mục sản phẩm ra Excel. |
| **Ưu tiên** | **M** |

---

## UR-INV-02: Quản lý kho

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-INV-02 |
| **Tên** | Quản lý kho (Warehouse Management) |
| **Actor** | Warehouse Staff, Product Manager, Admin |
| **Mô tả** | Quản lý hệ thống kho hàng của doanh nghiệp. Mỗi kho gồm: tên kho, mã kho, loại (Kho chính / Kho chi nhánh / Kho ảo), địa chỉ, người quản lý, trạng thái (Active / Inactive). Theo dõi tồn kho realtime theo từng sản phẩm, từng kho: số lượng tồn, số lượng đã đặt (reserved), số lượng sẵn sàng (available = tồn - reserved), giá trị tồn kho (theo giá vốn). Cảnh báo tồn kho thấp (low stock alert) khi số lượng sẵn sàng <= ngưỡng tối thiểu (cấu hình theo sản phẩm). Kiểm kê kho (stocktake): tạo phiên kiểm kê, nhập số lượng thực tế, hệ thống tính chênh lệch, điều chỉnh tồn kho sau phê duyệt. |
| **Tiền điều kiện** | Sản phẩm đã được tạo (UR-INV-01). Kho đã được thiết lập. |
| **Đầu vào** | **Tạo kho:** Tên kho (*), mã kho (*), loại (*), địa chỉ, người quản lý. **Cấu hình tồn kho:** Sản phẩm, kho, ngưỡng tối thiểu, ngưỡng tối đa. **Kiểm kê:** Kho (*), danh sách sản phẩm, số lượng thực tế. |
| **Đầu ra** | Bảng tồn kho realtime (sản phẩm x kho). Cảnh báo low stock qua notification/email. Biên bản kiểm kê với chênh lệch. Báo cáo giá trị tồn kho. |
| **Tiêu chí chấp nhận** | 1. CRUD kho hoạt động đúng. 2. Tồn kho cập nhật realtime khi nhập/xuất kho (UR-INV-03). 3. Available = On-hand - Reserved, hiển thị chính xác. 4. Low stock alert gửi notification khi available <= ngưỡng min. 5. Kiểm kê: tạo phiên, nhập thực tế, hiển thị chênh lệch, phê duyệt điều chỉnh. 6. Lịch sử biến động tồn kho (stock movement log) cho mỗi sản phẩm. 7. Giá trị tồn kho = SUM(số lượng x giá vốn) theo từng kho. 8. Lọc tồn kho theo kho, danh mục, trạng thái (low stock / normal / overstock). 9. Xuất báo cáo tồn kho ra Excel. |
| **Ưu tiên** | **S** |

---

## UR-INV-03: Nhập/Xuất kho

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-INV-03 |
| **Tên** | Nhập / Xuất kho (Stock In/Out) |
| **Actor** | Warehouse Staff, Sales, Purchase Manager |
| **Mô tả** | Quản lý các phiếu nhập kho và xuất kho. **Phiếu nhập kho:** mã phiếu (NK-YYYYMMDD-###), loại nhập (Mua hàng / Chuyển kho / Sản xuất / Trả hàng / Kiểm kê điều chỉnh), kho đích, nhà cung cấp (nếu mua hàng), danh sách sản phẩm (sản phẩm, số lượng, giá nhập), tổng giá trị, người tạo, người phê duyệt, trạng thái (Draft / Pending / Approved / Cancelled), ghi chú, chứng từ đính kèm. **Phiếu xuất kho:** mã phiếu (XK-YYYYMMDD-###), loại xuất (Bán hàng / Chuyển kho / Trả nhà cung cấp / Huỷ / Kiểm kê điều chỉnh), kho nguồn, khách hàng (nếu bán hàng), đơn hàng liên kết, danh sách sản phẩm (sản phẩm, số lượng, giá xuất), trạng thái tương tự nhập kho. Hỗ trợ chuyển kho giữa các kho (inter-warehouse transfer): tạo 1 phiếu xuất ở kho nguồn + 1 phiếu nhập ở kho đích (atomic). Phiếu xuất kho validate: không cho xuất vượt quá số lượng available. |
| **Tiền điều kiện** | Kho và sản phẩm đã tồn tại. Người dùng có quyền nhập/xuất kho. |
| **Đầu vào** | **Nhập kho:** Loại nhập (*), kho đích (*), nhà cung cấp, danh sách sản phẩm (sản phẩm *, số lượng *, giá nhập *), ghi chú, chứng từ. **Xuất kho:** Loại xuất (*), kho nguồn (*), khách hàng / đơn hàng, danh sách sản phẩm (sản phẩm *, số lượng *), ghi chú, chứng từ. |
| **Đầu ra** | Phiếu nhập/xuất kho được tạo với mã tự động. Tồn kho cập nhật sau khi phiếu được phê duyệt. Lịch sử biến động tồn kho ghi nhận đầy đủ. |
| **Tiêu chí chấp nhận** | 1. Tạo phiếu nhập kho, phê duyệt, tồn kho tăng đúng số lượng. 2. Tạo phiếu xuất kho, phê duyệt, tồn kho giảm đúng số lượng. 3. Validate: không cho xuất vượt available, hiển thị lỗi rõ ràng. 4. Chuyển kho: atomic (xuất kho A + nhập kho B cùng lúc). 5. Phiếu nhập từ mua hàng: link đến nhà cung cấp, cập nhật giá vốn trung bình. 6. Phiếu xuất từ bán hàng: link đến đơn hàng/hoá đơn. 7. Phê duyệt theo BPM (giá trị > ngưỡng cấu hình). 8. In phiếu nhập/xuất kho (PDF). 9. Lọc phiếu theo loại, kho, khoảng thời gian, trạng thái. 10. Xuất danh sách phiếu ra Excel. |
| **Ưu tiên** | **S** |
