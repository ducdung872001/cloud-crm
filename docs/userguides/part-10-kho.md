# Part 10 — Kho & Nguyên vật liệu

*Phiên bản: Cửa hàng & Spa — Tenant "Viettel Store"*

Phân hệ **Kho & Nguyên vật liệu** quản lý toàn bộ **nguyên liệu / sản phẩm vật lý** của cửa hàng — từ nhập kho, xuất kho, kiểm kê, đến báo cáo tồn kho. Dù cơ sở bạn chủ yếu bán **dịch vụ**, phần này vẫn cần thiết để quản lý:

- Nguyên vật liệu cho dịch vụ (dầu massage, sản phẩm skincare, kim tiêm, găng tay…).
- Sản phẩm bán kèm (thực phẩm chức năng, mỹ phẩm, đồ lưu niệm…).
- Vật tư tiêu hao (khăn, nến, cồn, giấy in…).

Sidebar có **6 mục con**:

| # | Mục | URL | Chức năng |
|---|-----|-----|-----------|
| 1 | **Nguyên vật liệu** | `/crm/material` | Danh mục NVL |
| 2 | **Nhà cung cấp** | `/crm/supplier` | Danh sách NCC |
| 3 | **Danh sách kho** | `/crm/warehouse` | Các kho vật lý |
| 4 | **Sổ kho** | `/crm/inventory` | Lịch sử nhập/xuất |
| 5 | **Quản lý kho (kiểm kê)** | `/crm/inventory_checking` | Kiểm kê định kỳ |
| 6 | **Báo cáo kho** | `/crm/report_warehouse` | Báo cáo tồn kho, xuất nhập |

---

## A. Nguyên vật liệu (Danh mục)

**URL:** `/crm/material`

![Nguyên vật liệu](./images/part-10-kho/A01-material.png)

### A.1. Các cột

| Cột | Ghi chú |
|-----|---------|
| **Mã NVL** | Tự sinh hoặc tự nhập |
| **Tên NVL** | Vd *"Dầu massage lavender"* |
| **Danh mục** | Vd *"Tinh dầu"*, *"Khăn"*, *"Mỹ phẩm"* |
| **Đơn vị** | ml / lít / cái / hộp... |
| **Giá nhập TB** | Tính từ các lần nhập |
| **Tồn hiện tại** | Số lượng trên toàn bộ kho |
| **Tồn tối thiểu** | Cảnh báo khi < |
| **NCC ưa dùng** | NCC mặc định để đặt |

### A.2. Thêm NVL mới

1. Bấm **+ Thêm NVL**.
2. Điền form:

#### Quy định nhập liệu — NVL

| Trường | Bắt buộc | Kiểu | Ghi chú |
|--------|:--------:|------|---------|
| **Mã NVL** | — | Text ≤ 50 | Auto gen nếu bỏ trống |
| **Tên NVL** | ✓ | Text ≤ 255 | |
| **Danh mục** | ✓ | Select | Tạo mới được từ trong dropdown |
| **Đơn vị tính** | ✓ | Select | Từ danh sách đơn vị |
| **Đơn vị quy đổi** | — | Phép tính | Vd *1 hộp = 12 chai* |
| **Giá nhập** | ✓ | Number ≥ 0 | |
| **Giá bán** | — | Number ≥ 0 | Nếu NVL này cũng bán lẻ |
| **Tồn tối thiểu** | — | Number ≥ 0 | Ngưỡng cảnh báo |
| **NCC ưa dùng** | — | Select | Chọn từ danh sách NCC |
| **Mô tả** | — | Textarea | |
| **Ảnh NVL** | — | Upload | |

3. **Lưu**.

---

## B. Nhà cung cấp

**URL:** `/crm/supplier`

![Nhà cung cấp](./images/part-10-kho/A02-supplier.png)

### B.1. Danh sách

Các cột: **Mã NCC**, **Tên công ty**, **Người liên hệ**, **SĐT**, **Email**, **Địa chỉ**, **Công nợ phải trả**.

### B.2. Thêm NCC

#### Quy định nhập liệu — NCC

| Trường | Bắt buộc | Kiểu | Ghi chú |
|--------|:--------:|------|---------|
| **Tên NCC / Công ty** | ✓ | Text ≤ 255 | |
| **Mã số thuế** | — | Text, 10 hoặc 13 số | |
| **Người liên hệ** | — | Text | |
| **Số điện thoại** | ✓ | Tel | |
| **Email** | — | Email | |
| **Địa chỉ** | — | Text | |
| **Ngân hàng / STK** | — | Text | Để trả nợ qua CK |
| **Hạn mức tín dụng** | — | Number | Được nợ tối đa bao nhiêu |
| **Thời hạn nợ (ngày)** | — | Number | Vd 30 ngày |
| **Mô tả** | — | Textarea | |

---

## C. Danh sách kho

**URL:** `/crm/warehouse`

![Danh sách kho](./images/part-10-kho/A03-warehouse-list.png)

### C.1. Khái niệm

Một cửa hàng có thể có **nhiều kho vật lý** — vd:
- **Kho chính** — cất đồ dự trữ.
- **Kho bán lẻ** — đồ bày để bán.
- **Kho sử dụng** — đồ đang sử dụng ở các phòng dịch vụ.

Mỗi NVL có thể tồn ở nhiều kho khác nhau.

### C.2. Thêm kho

#### Quy định nhập liệu — Kho

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Tên kho** | ✓ | Text |
| **Mã kho** | — | Auto gen |
| **Cơ sở** | ✓ | Chọn chi nhánh/cơ sở |
| **Địa chỉ vật lý** | — | Text |
| **Người phụ trách** | — | Select nhân viên |
| **Trạng thái** | ✓ | Đang dùng / Tạm khóa |

---

## D. Sổ kho (Lịch sử nhập/xuất)

**URL:** `/crm/inventory`

![Sổ kho](./images/part-10-kho/A04-inventory.png)

### D.1. Các loại phiếu

- **Phiếu nhập** — nhập từ NCC, hoặc nhập từ kho khác.
- **Phiếu xuất** — xuất sử dụng nội bộ, xuất bán, xuất sang kho khác.
- **Phiếu điều chỉnh** — sau khi kiểm kê phát hiện chênh lệch.

### D.2. Tạo phiếu nhập

1. Bấm **+ Tạo phiếu nhập**.
2. Điền form:

#### Quy định nhập liệu — Phiếu nhập kho

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Mã phiếu** | — | Auto gen |
| **Ngày nhập** | ✓ | Date |
| **Nhà cung cấp** | ✓ | Select |
| **Kho nhận** | ✓ | Select |
| **Bảng hàng**: mỗi dòng | ✓ | |
| – NVL/Sản phẩm | ✓ | Select (tìm) |
| – Số lượng | ✓ | Number > 0 |
| – Đơn giá nhập | ✓ | Number ≥ 0 |
| – Thuế VAT | — | 0/5/8/10% |
| – Thành tiền | (tự tính) | SL × Đơn giá |
| **Tổng tiền hàng** | (tự tính) | |
| **Phí vận chuyển** | — | Number |
| **Chiết khấu** | — | Number hoặc % |
| **Tổng cộng** | (tự tính) | |
| **Đã trả** | — | Số tiền trả NCC ngay |
| **Còn nợ** | (tự tính) | Tổng - Đã trả |
| **Quỹ chi** | ✓ nếu Đã trả > 0 | |
| **Ghi chú** | — | |
| **Chứng từ** | — | Upload hóa đơn từ NCC |

3. **Lưu + Nhập kho**. Hệ thống:
   - Cộng số lượng vào kho nhận.
   - Cập nhật giá nhập trung bình.
   - Tạo phiếu chi trong Sổ thu chi (nếu có trả).
   - Cập nhật công nợ NCC (nếu còn nợ).

### D.3. Tạo phiếu xuất

Tương tự phiếu nhập, nhưng:

- **Loại xuất**: Xuất bán / Xuất sử dụng / Xuất chuyển kho / Xuất tiêu hủy.
- Trừ số lượng ở kho xuất.
- Nếu là xuất bán, ghi nhận doanh thu.
- Nếu là xuất chuyển kho, tạo phiếu nhập tương ứng ở kho nhận.

---

## E. Quản lý kho (Kiểm kê)

**URL:** `/crm/inventory_checking`

![Quản lý kho - Kiểm kê](./images/part-10-kho/A05-inventory-checking.png)

### E.1. Mục đích

Định kỳ (tuần/tháng/quý), nhân viên kho đếm **số lượng thực tế** và so sánh với **số lượng hệ thống** để phát hiện:
- Hàng bị hỏng / mất / trộm.
- Hàng ghi sai số lượng khi nhập/xuất.
- Hàng hết hạn.

### E.2. Các bước kiểm kê

1. Bấm **+ Tạo phiếu kiểm kê**.
2. Điền:
   - Kho kiểm kê
   - Ngày kiểm kê
   - Người kiểm kê
3. Hệ thống load bảng:
   - Mã NVL / Tên
   - Tồn theo sổ (hệ thống tính)
   - **Tồn thực tế** — nhân viên gõ vào sau khi đếm
   - **Chênh lệch** — tự tính
4. Sau khi đếm xong toàn bộ, bấm **Xác nhận kiểm kê**.
5. Hệ thống tự tạo **Phiếu điều chỉnh**:
   - NVL dư → cộng thêm vào kho.
   - NVL thiếu → trừ bớt.
6. Ghi chú lý do cho từng dòng chênh lệch (để audit).

### E.3. Tính hao hụt

Sau kiểm kê, hệ thống tổng kết:
- **Giá trị hao hụt** (tổng tiền NVL bị thiếu).
- **Tỷ lệ hao hụt** = Hao hụt / Tổng giá trị tồn.

Chỉ số này cao bất thường = có vấn đề: nhân viên gian lận / quy trình xuất sai / bảo quản kém.

---

## F. Báo cáo kho

**URL:** `/crm/report_warehouse`

![Báo cáo kho](./images/part-10-kho/A06-report-warehouse.png)

### F.1. Các báo cáo có sẵn

- **Tồn kho hiện tại** — danh sách toàn bộ NVL và số lượng.
- **Sắp hết hàng** — danh sách NVL tồn < tồn tối thiểu (gợi ý nhập).
- **Nhập – Xuất – Tồn** — bảng tổng hợp theo kỳ.
- **Giá trị tồn kho** — tổng tiền đang "ngậm" trong kho.
- **Top NVL luân chuyển nhanh / chậm** — để điều chỉnh kế hoạch mua.
- **Hạn sử dụng** — NVL sắp hết hạn.
- **Lịch sử giá nhập** — xem biến động giá theo thời gian.

---

## G. Luồng công việc thường gặp

### G.1. "Nhập lô hàng mới từ NCC"

1. NCC giao hàng kèm hóa đơn.
2. Vào **Sổ kho → + Tạo phiếu nhập** → chọn NCC → chọn kho.
3. Nhập từng dòng hàng theo hóa đơn → kiểm tra tổng tiền khớp.
4. Nếu đã trả → ghi số tiền đã trả + chọn quỹ chi.
5. Đính kèm ảnh hóa đơn → **Lưu + Nhập kho**.

### G.2. "Cuối tháng kiểm kê kho chính"

1. Vào **Quản lý kho → + Tạo phiếu kiểm kê** → Kho chính → ngày hôm nay.
2. In bảng kiểm kê → đi đếm thực tế.
3. Nhập số đếm vào các dòng có chênh lệch.
4. Ghi lý do cho từng dòng chênh lệch.
5. **Xác nhận** → phiếu điều chỉnh tự tạo.
6. Xem báo cáo **Giá trị hao hụt** → báo quản lý nếu > 5%.

### G.3. "Sản phẩm bán cho khách trong ngày"

Việc này **tự động** diễn ra khi bạn **Bán hàng tại quầy** (Part 02) — mỗi sản phẩm được chọn sẽ tự xuất kho. Không cần làm thủ công ở Part 10.

---

*Hết Part 10.*
