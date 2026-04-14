# Part 04 — Giao dịch

*Phiên bản: Cửa hàng & Spa — Tenant "Viettel Store"*

**Giao dịch** là nơi bạn tra cứu, quản lý **các đơn hàng / hóa đơn đã tạo**. Khác với Part 02 (bán hàng — tạo đơn mới), phần này tập trung vào **xem lại và xử lý** đơn đã có: tra cứu, trả hàng, đổi hàng, xuất hóa đơn VAT, theo dõi trạng thái giao hàng.

Sidebar có **2 mục con**:

| Mục | URL | Dùng để |
|-----|-----|---------|
| **Danh sách đơn** | `/crm/sale_invoice` | Tra cứu toàn bộ hóa đơn bán hàng đã tạo |
| **Hóa đơn VAT** | `/crm/invoiceVAT` | Phát hành / tra cứu hóa đơn điện tử có VAT |

Các màn hình liên quan mà bạn có thể đi tới từ đây:

- **Theo dõi vận chuyển** (`/order_tracking`) — nếu có bán hàng kèm giao hàng.
- **Trả hàng** (`/return_invoice`) — xử lý khi khách trả lại sản phẩm.

---

## Mục lục

- [A. Danh sách đơn](#a-danh-sách-đơn)
- [B. Hóa đơn VAT](#b-hóa-đơn-vat)
- [C. Theo dõi vận chuyển](#c-theo-dõi-vận-chuyển)
- [D. Trả hàng / Hoàn đơn](#d-trả-hàng--hoàn-đơn)
- [E. Luồng công việc thường gặp](#e-luồng-công-việc-thường-gặp)

---

## A. Danh sách đơn

**Đường dẫn:** Sidebar → **Giao dịch** → **Danh sách đơn**
**URL:** `/crm/sale_invoice`

![Danh sách đơn](./images/part-04-giao-dich/A01-sale-invoice-list.png)

### A.1. Tổng quan giao diện

Màn hình gồm:

| Khu vực | Chức năng |
|---------|-----------|
| **Bộ lọc thời gian** | 2 ô: Từ ngày / Đến ngày. Mặc định hôm nay. Bấm biểu tượng 📅 để mở lịch |
| **Nút Lọc** | Áp dụng bộ lọc thời gian |
| **Thanh tab trạng thái** | **Tất cả** / **Chờ xử lý** / **Đang giao** / **Hoàn thành** / **Đã hủy** |
| **Nút Audit Excel** | Xuất báo cáo kiểm toán đơn hàng |
| **Danh sách đơn** (bên trái) | Card mỗi đơn với mã, tên khách, tổng tiền, trạng thái |
| **Panel chi tiết** (bên phải) | Khi click 1 đơn, panel hiện: sản phẩm, số lượng, đơn giá, thanh toán, lịch sử |

### A.2. Tra cứu một đơn cụ thể

**Các bước:**

1. Chọn **khoảng thời gian** (Từ ngày → Đến ngày).
2. Bấm **Lọc**.
3. Trên danh sách card, cuộn tìm hoặc dùng **ô tìm kiếm** ở đầu (gõ mã đơn / tên khách / SĐT).
4. Bấm vào card để mở **panel chi tiết** bên phải.

Panel chi tiết hiển thị:

- **Mã đơn** (vd `H0000001`), **Ngày giờ tạo**, **Nhân viên tạo**, **Ca**.
- **Thông tin khách hàng**: tên, SĐT, địa chỉ.
- **Danh sách sản phẩm**: từng dòng hiển thị Tên — Số lượng — Đơn giá — Thành tiền.
- **Tổng tiền hàng** — **Giảm giá** — **VAT** — **TỔNG THANH TOÁN**.
- **Lịch sử thanh toán**: các lần thu tiền (vd *"Cash — 500,000đ — 09:32 hôm nay"*, *"Chuyển khoản — 258,000đ — 09:32 hôm nay"*).
- **Trạng thái**: Chờ xác nhận / Đã thanh toán / Còn nợ / Đã hủy.

### A.3. Xử lý nhanh trên một đơn

Ở panel chi tiết hoặc menu 3-chấm của card, bạn có các hành động:

- **In hóa đơn** — mở preview để in ra giấy.
- **Gửi SMS/Email** — gửi hóa đơn điện tử cho khách.
- **Thanh toán còn nợ** — nếu đơn còn công nợ, bấm để thu tiếp.
- **Trả hàng / Hoàn đơn** — mở form hoàn đơn (xem [D](#d-trả-hàng--hoàn-đơn)).
- **Xuất hóa đơn VAT** — chuyển đơn này thành hóa đơn VAT điện tử (xem [B](#b-hóa-đơn-vat)).
- **Hủy đơn** — chỉ cho phép khi đơn chưa thanh toán.

### A.4. Quy định nhập liệu — Bộ lọc

| Trường | Kiểu | Ràng buộc |
|--------|------|-----------|
| **Từ ngày** | Date | Phải ≤ Đến ngày |
| **Đến ngày** | Date | Tối đa 365 ngày so với Từ ngày |
| **Tìm kiếm** | Text | Không giới hạn; match theo mã, tên khách, SĐT |

---

## B. Hóa đơn VAT

**Đường dẫn:** Sidebar → **Giao dịch** → **Hóa đơn VAT**
**URL:** `/crm/invoiceVAT`

![Hóa đơn VAT](./images/part-04-giao-dich/A02-invoice-vat.png)

### B.1. Mục đích

Phát hành **hóa đơn điện tử có VAT** theo quy định của Tổng cục Thuế. Chỉ dùng khi:

- Khách yêu cầu hóa đơn đỏ / hóa đơn VAT.
- Đơn vị bạn đã **đăng ký chữ ký số** và **kết nối** với nhà cung cấp hóa đơn điện tử (Viettel, VNPT, Misa, v.v. — cài trong Part 12).

### B.2. Các bước phát hành hóa đơn VAT

1. Vào **Giao dịch → Hóa đơn VAT**.
2. Bấm **+ Tạo hóa đơn VAT**.
3. Chọn nguồn:
   - **Từ đơn bán hàng** — chọn đơn đã có, hệ thống copy thông tin.
   - **Nhập thủ công** — tự nhập danh sách hàng.
4. Điền **Thông tin người mua** (tất cả dùng cho hóa đơn VAT):

#### Quy định nhập liệu — Thông tin người mua hóa đơn VAT

| Trường | Bắt buộc | Định dạng | Ghi chú |
|--------|:--------:|-----------|---------|
| **Tên người mua / công ty** | ✓ | Text | Khách doanh nghiệp điền tên công ty đầy đủ |
| **Mã số thuế (MST)** | ✓ cho doanh nghiệp | Số, 10 hoặc 13 chữ số | Hệ thống có thể auto fetch tên từ MST |
| **Địa chỉ người mua** | ✓ | Text ≤ 255 ký tự | Phải khớp địa chỉ đăng ký kinh doanh |
| **Email nhận hóa đơn** | ✓ | Email | Bắt buộc để gửi hóa đơn điện tử |
| **Hình thức thanh toán** | ✓ | Select | Tiền mặt / Chuyển khoản / Thẻ / TM+CK |

5. Kiểm tra **bảng hàng hóa** — số lượng, đơn giá, thành tiền, % thuế suất (0% / 5% / 8% / 10%).
6. Bấm **Xác nhận phát hành** → hệ thống ký số + gửi lên cơ quan thuế → trả về **mã tra cứu**.
7. Hệ thống gửi hóa đơn qua email tự động.

### B.3. Lỗi thường gặp khi phát hành VAT

| Lỗi | Nguyên nhân | Xử lý |
|-----|-------------|-------|
| *"Chữ ký số không hợp lệ"* | Chữ ký đã hết hạn / chưa cài | Liên hệ đơn vị CA gia hạn, vào Part 12 → Tích hợp để update |
| *"MST không tồn tại"* | MST sai hoặc công ty đã đóng cửa | Xác minh với khách |
| *"Tổng tiền không khớp"* | Sau thuế không bằng tổng dòng | Kiểm tra lại bảng hàng + thuế suất |

---

## C. Theo dõi vận chuyển

**URL:** `/crm/order_tracking`

![Theo dõi vận chuyển](./images/part-04-giao-dich/A03-order-tracking.png)

### C.1. Khi nào dùng

Khi cửa hàng bạn có kênh bán hàng **giao tận nơi**, không chỉ khách đến quầy. Ví dụ: gửi gói quà tặng sinh nhật, giao sản phẩm mua online.

### C.2. Các thông tin hiển thị

- **Mã đơn giao**, **Khách nhận**, **Địa chỉ**, **Số điện thoại**.
- **Đơn vị vận chuyển** (GHN, GHTK, J&T, Viettel Post, ShopeeExpress...).
- **Mã vận đơn** (tracking number).
- **Trạng thái**: Chờ lấy hàng / Đang giao / Giao thành công / Giao thất bại / Đã hoàn.
- **Ngày giao dự kiến**, **Ngày cập nhật gần nhất**.

### C.3. Tạo đơn giao

Thường được tạo **tự động** từ màn Bán hàng tại quầy khi khách chọn *"Giao tận nơi"*. Nếu cần tạo thủ công:

1. Bấm **+ Tạo đơn giao**.
2. Chọn đơn bán hàng gốc từ danh sách.
3. Điền địa chỉ giao (mặc định lấy từ hồ sơ khách).
4. Chọn đơn vị vận chuyển.
5. Bấm **Gửi sang đơn vị vận chuyển** — hệ thống tự push API tới đối tác, lấy về mã vận đơn.

---

## D. Trả hàng / Hoàn đơn

**URL:** `/crm/return_invoice`

![Trả hàng / Hoàn đơn](./images/part-04-giao-dich/A04-return-invoice.png)

### D.1. Khi nào dùng

Khi khách:
- Trả lại sản phẩm (không vừa ý / lỗi).
- Đổi sang sản phẩm khác.
- Hủy dịch vụ chưa sử dụng.

### D.2. Các bước xử lý trả hàng

1. Vào **Danh sách đơn** ([A](#a-danh-sách-đơn)), tìm đơn gốc.
2. Trong panel chi tiết, bấm **Trả hàng / Hoàn đơn**.
3. Form **Trả hàng** hiện lên:
   - Bảng các sản phẩm trong đơn gốc.
   - Cột **Số lượng trả** — nhập số lượng (≤ số đã mua).
   - Cột **Lý do** — dropdown: *Không vừa ý / Lỗi sản phẩm / Đổi sang sản phẩm khác / Khác*.
4. Chọn **Cách hoàn tiền**:
   - **Tiền mặt** — trả ngay khỏi két (ca làm việc sẽ ghi nhận chi).
   - **Chuyển khoản** — nhập STK khách.
   - **Tín dụng cửa hàng** — cộng vào ví khách, trừ dần ở đơn sau.
5. Nếu là **đổi hàng**, tick *"Tạo đơn mới thay thế"* — hệ thống mở luôn màn Bán hàng tại quầy với danh sách sản phẩm mới.
6. Bấm **Xác nhận hoàn**.
7. Hệ thống ghi nhận phiếu hoàn với mã riêng (vd `RT00001`) và liên kết tới đơn gốc.

#### Quy định nhập liệu — Phiếu hoàn hàng

| Trường | Bắt buộc | Ràng buộc |
|--------|:--------:|-----------|
| **Số lượng trả** | ✓ | > 0 và ≤ số lượng đã mua |
| **Lý do** | ✓ | Chọn từ dropdown |
| **Ghi chú** | — | Text |
| **Cách hoàn tiền** | ✓ | Tiền mặt / Chuyển khoản / Tín dụng cửa hàng |
| **STK hoàn** | ✓ nếu chọn Chuyển khoản | Số STK + tên chủ TK |

> **Lưu ý:** Sau khi hoàn, đơn gốc sẽ hiển thị badge *"Đã trả một phần"* hoặc *"Đã trả toàn bộ"*. Sản phẩm được **cộng lại vào tồn kho** tự động (trừ khi là dịch vụ hoặc hoàn "không nhập kho").

---

## E. Luồng công việc thường gặp

### E.1. "Khách yêu cầu xuất lại hóa đơn mua hôm qua"

1. Vào **Danh sách đơn** → chọn ngày hôm qua → tìm theo tên khách.
2. Bấm vào đơn → panel chi tiết → nút **In hóa đơn**.
3. Chọn máy in → In.

### E.2. "Khách trả 1 sản phẩm trong đơn mua hôm qua"

1. Vào **Danh sách đơn** → tìm đơn gốc.
2. Bấm **Trả hàng / Hoàn đơn** → nhập số lượng trả = 1 cho sản phẩm đó → lý do → cách hoàn.
3. Xác nhận → tiền mặt được xuất khỏi két, sản phẩm được cộng lại vào kho.

### E.3. "Doanh nghiệp mua đợt lớn, cần hóa đơn VAT"

1. Bán hàng bình thường ở **Bán hàng tại quầy**.
2. Sau khi thanh toán, vào **Giao dịch → Hóa đơn VAT** → **+ Tạo hóa đơn VAT**.
3. Chọn **Từ đơn bán hàng** → chọn đơn vừa tạo.
4. Điền MST + địa chỉ + email của công ty khách.
5. **Xác nhận phát hành** → hóa đơn gửi vào email khách.

---

*Hết Part 04.*
