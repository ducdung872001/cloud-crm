# Part 05 — Kho & Sản phẩm

## 1. Phạm vi phân hệ

Quản lý catalog sản phẩm, nhiều kho nhiều chi nhánh, nhập xuất kho, chuyển kho, điều chỉnh kho, kiểm kê, nguyên vật liệu, tồn đầu-cuối kỳ.

## 2. Actor liên quan

- **Warehouse Staff** — người dùng chính
- **Store Manager** — duyệt phiếu lớn
- **Chain Manager** — chuyển kho giữa chi nhánh
- **Purchaser** — kết nối với mua hàng NCC

## 3. Yêu cầu chi tiết

### UR-INV-01 — Danh mục sản phẩm

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-01 |
| **Tên** | CRUD sản phẩm với thuộc tính đầy đủ |
| **Actor** | Warehouse Staff, Tenant Admin |
| **Mô tả** | `/setting_sell` quản lý catalog SP với: tên, SKU, mã vạch, ảnh (nhiều), danh mục, đơn vị (nhiều — cái/gói/thùng với tỷ lệ quy đổi), giá bán, giá vốn, VAT rate, mô tả, tồn kho tối thiểu/tối đa. |
| **Tiêu chí chấp nhận** | - SKU unique trong tenant (CN-02)<br>- Upload ảnh tối đa 5, resize tự động<br>- Variant SP (size/màu) nếu cấu hình |
| **Ưu tiên** | **M** |

### UR-INV-02 — Quản lý kho nhiều chi nhánh

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-02 |
| **Tên** | Danh sách kho vật lý |
| **Actor** | Tenant Admin, Chain Manager |
| **Mô tả** | `/warehouse_list` liệt kê các kho vật lý. Mỗi kho có: tên, mã, địa chỉ, chi nhánh liên kết, loại (bán lẻ / trung tâm / tạm). Tồn kho track riêng cho từng kho. |
| **Tiêu chí chấp nhận** | - 1 chi nhánh có thể có nhiều kho<br>- Kho trung tâm chia sẻ giữa chi nhánh<br>- Phân quyền xem kho theo role |
| **Ưu tiên** | **M** |

### UR-INV-03 — Xem tồn kho theo SP/kho

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-03 |
| **Tên** | Tồn kho real-time với cảnh báo tồn tối thiểu |
| **Actor** | Warehouse, Store Manager |
| **Mô tả** | `/product_inventory` bảng ma trận: SP × kho → số lượng. Có cảnh báo màu đỏ nếu dưới `min_stock`, màu vàng nếu gần min. Filter theo danh mục, highlight SP hết hàng. |
| **Tiêu chí chấp nhận** | - Cập nhật real-time sau mỗi giao dịch<br>- Xem lịch sử biến động (stock movement)<br>- Export Excel |
| **Ưu tiên** | **M** |

### UR-INV-04 — Phiếu nhập kho (Import Invoice)

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-04 |
| **Tên** | Nhập kho từ NCC hoặc nhập chỉnh khác |
| **Actor** | Warehouse, Purchaser |
| **Mô tả** | `/invoice_order` tạo phiếu nhập: chọn NCC (nếu có), chọn kho đích, thêm các item (SKU, qty, giá nhập). Sau khi save, tồn kho cộng tương ứng. Có thể link với PO đã tạo trước. |
| **Tiêu chí chấp nhận** | - Cập nhật giá vốn trung bình weighted average<br>- Link với PO để tick off<br>- Xuất PDF phiếu nhập |
| **Ưu tiên** | **M** |

### UR-INV-05 — Phiếu xuất kho / Outbound Delivery

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-05 |
| **Tên** | Xuất kho do bán hàng / chuyển / tiêu huỷ |
| **Actor** | Warehouse |
| **Mô tả** | Phiếu xuất tự động sinh khi đơn bán submit, hoặc thủ công cho điều chỉnh. Hiển thị lý do xuất: bán / chuyển / tiêu huỷ / tặng / mẫu. |
| **Tiêu chí chấp nhận** | - Tồn kho trừ ngay<br>- Không cho xuất nếu tồn không đủ (trừ khi cho phép âm)<br>- Audit xuất cho KH tặng + mẫu |
| **Ưu tiên** | **M** |

### UR-INV-06 — Chuyển kho (Transfer)

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-06 |
| **Tên** | Chuyển hàng giữa 2 kho |
| **Actor** | Chain Manager, Warehouse |
| **Mô tả** | `/inventory_transfer_document` tạo phiếu chuyển: kho nguồn → kho đích, danh sách item + qty. Hệ thống tạo 2 phiếu: xuất ở nguồn + nhập ở đích, có trạng thái `pending → in_transit → received`. |
| **Tiêu chí chấp nhận** | - CN-09: phải có phiếu tách rời<br>- Kho đích nhận bấm xác nhận → chuyển trạng thái<br>- Chênh lệch (hỏng, thiếu) ghi nhận khi nhận |
| **Ưu tiên** | **S** |

### UR-INV-07 — Điều chỉnh kho (Stock Adjustment)

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-07 |
| **Tên** | Phiếu điều chỉnh (+/-) với lý do |
| **Actor** | Warehouse, Store Manager |
| **Mô tả** | `/stock_adjustment` cho phép điều chỉnh số lượng do: mất mát, hỏng, thừa, lỗi nhập. Lý do bắt buộc, ghi log. |
| **Tiêu chí chấp nhận** | - Chênh lệch > X% cần approval Store Manager<br>- Audit đầy đủ<br>- Ảnh hưởng đến giá vốn trung bình |
| **Ưu tiên** | **S** |

### UR-INV-08 — Kiểm kê định kỳ (Stock Take)

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-08 |
| **Tên** | Phiếu kiểm kê với đếm thực tế |
| **Actor** | Warehouse |
| **Mô tả** | `/warehouse_checking` + `/create_inventory` tạo phiếu kiểm kê theo kho. Hệ thống snapshot số lượng hệ thống, cho nhân viên nhập số đếm thực tế (có thể dùng mobile scanner PWA). Chênh lệch tự tạo phiếu điều chỉnh. |
| **Tiêu chí chấp nhận** | - Freeze kho trong lúc kiểm kê (optional)<br>- Hỗ trợ đếm nhiều nhân viên song song<br>- Lịch sử kiểm kê để audit |
| **Ưu tiên** | **S** |

### UR-INV-09 — Quản lý nguyên vật liệu (BOM cơ bản)

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-09 |
| **Tên** | Khai báo công thức SP (BOM đơn giản) |
| **Actor** | Tenant Admin |
| **Mô tả** | `/material` cho phép khai báo NVL và công thức tạo SP từ NVL (1 SP = 0.5 NVL A + 0.3 NVL B). Khi bán SP, NVL tự trừ kho. |
| **Tiêu chí chấp nhận** | - BOM 1 cấp (không đệ quy SP → SP)<br>- Có thể override trong phiếu sản xuất<br>- Cảnh báo thiếu NVL |
| **Ưu tiên** | **C** |

### UR-INV-10 — Báo cáo kho

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-10 |
| **Tên** | Báo cáo tồn đầu kỳ, nhập, xuất, tồn cuối kỳ |
| **Actor** | Store Manager, Accountant |
| **Mô tả** | `/report_warehouse` cho kỳ chọn + kho. Hiển thị tồn đầu, nhập, xuất, tồn cuối cho từng SP. Value theo giá vốn. |
| **Tiêu chí chấp nhận** | - Export Excel/PDF<br>- Drill-down vào chi tiết movement<br>- So sánh 2 kỳ |
| **Ưu tiên** | **S** |

### UR-INV-11 — Cuối ca kiểm kho

| Trường | Nội dung |
|---|---|
| **ID** | UR-INV-11 |
| **Tên** | Kiểm kê nhanh cuối ca POS |
| **Actor** | Cashier |
| **Mô tả** | `/end_of_shift_inventory` cho cashier đếm một số SP quan trọng cuối ca (vd hàng giá trị cao, hàng dễ mất). Không thay thế kiểm kê toàn kho. |
| **Tiêu chí chấp nhận** | - Danh sách SP cần đếm cấu hình được<br>- Chênh lệch tạo phiếu điều chỉnh<br>- Link với phiếu kiểm kê ca POS |
| **Ưu tiên** | **C** |

## 4. Quy tắc nghiệp vụ

- **Weighted average cost**: giá vốn tính theo trung bình cộng có trọng số.
- **Tồn kho không âm** (CN-08): trừ khi pre-order cho phép.
- **Reserved stock**: đơn pending giữ chỗ tồn kho cho đến khi cancel hoặc ship.

## 5. Non-functional

- **Scalability**: 100k+ SKU, 50+ kho, không chậm khi query.
- **Consistency**: update tồn kho atomic, không race condition.

---

*Hết Part 05. Xem tiếp [Part 06 — Mua hàng & NCC](part-06-mua-hang-ncc.md).*
