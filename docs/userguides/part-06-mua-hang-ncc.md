# Part 06 — Mua hàng & Nhà cung cấp

> **Dành cho**: Purchaser, Kế toán, Quản lý cửa hàng
> **Mức độ**: Trung cấp
> **Tham chiếu URD**: [Part 06 — Purchase & Suppliers](../urd/part-06-purchase-suppliers.md)

Mua hàng đầu vào là gốc của bán hàng đầu ra. Part này hướng dẫn quản lý nhà cung cấp (NCC), tạo purchase order (PO), nhập kho theo PO, và quản lý công nợ phải trả NCC.

## Mục lục
- [1. Tạo nhà cung cấp mới](#1-tạo-nhà-cung-cấp-mới)
- [2. Cập nhật thông tin NCC](#2-cập-nhật-thông-tin-ncc)
- [3. Tạo Purchase Order (PO)](#3-tạo-purchase-order-po)
- [4. Gửi PO qua email](#4-gửi-po-qua-email)
- [5. Nhập kho theo PO](#5-nhập-kho-theo-po)
- [6. Công nợ NCC](#6-công-nợ-ncc)
- [7. Tạo phiếu thanh toán NCC](#7-tạo-phiếu-thanh-toán-ncc)
- [8. Báo cáo mua hàng](#8-báo-cáo-mua-hàng)
- [FAQ](#faq)

---

## 1. Tạo nhà cung cấp mới

### Bước 1: Mở trang NCC

Sidebar → **Mua hàng → Nhà cung cấp** → nhấn **[+ Thêm NCC]**.

### Bước 2: Điền form

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| **Tên NCC** | ✅ | Tên công ty |
| **Mã NCC** | ❌ | Auto sinh nếu bỏ trống |
| **Mã số thuế** | ❌ | Cần nếu khai VAT đầu vào |
| **Người liên hệ** | ✅ | Tên + chức vụ |
| **SĐT** | ✅ | |
| **Email** | ❌ | Dùng để gửi PO tự động |
| **Địa chỉ** | ❌ | |
| **Số tài khoản ngân hàng** | ❌ | Để thanh toán CK |
| **Hạn thanh toán** | ❌ | VD: 30 ngày (Net 30) |
| **Ngành hàng cung cấp** | ❌ | Tag phân loại |
| **Ghi chú** | ❌ | |

### Bước 3: Lưu

Nhấn **[Lưu]**.

💡 **Mẹo**: Nhập **đầy đủ MST + số TK** để sau này phát hành PO + chuyển khoản không phải nhập lại.

---

## 2. Cập nhật thông tin NCC

### Các bước

1. Sidebar → **Mua hàng → Nhà cung cấp** → click tên NCC.
2. Nhấn **[Sửa]**.
3. Chỉnh thông tin → **[Lưu]**.

🔒 **Quyền**: Purchaser hoặc Store Manager.

### Xem lịch sử giao dịch NCC

Trong chi tiết NCC có tab:

- **Thông tin** — cơ bản
- **PO** — toàn bộ PO đã đặt
- **Phiếu nhập** — đã nhận bao nhiêu lô
- **Công nợ** — phải trả hiện tại + lịch sử thanh toán
- **Đánh giá** — rating NCC (giao đúng hẹn, chất lượng...)

---

## 3. Tạo Purchase Order (PO)

**PO** là đơn đặt hàng chính thức gửi NCC.

### Bước 1: Mở trang PO

Sidebar → **Mua hàng → Purchase Order** → **[+ Tạo PO]**.

### Bước 2: Chọn NCC

Ô **NCC** — gõ tìm → chọn.

Thông tin NCC (MST, TK) auto fill.

### Bước 3: Chọn kho nhận

**Kho nhận hàng** = kho nào sẽ nhập khi hàng về.

### Bước 4: Thêm sản phẩm

Nhấn **[+ Thêm dòng]**:

- Chọn SP từ danh sách (search)
- Nhập **số lượng đặt**
- Nhập **đơn giá mua** (có thể khác giá vốn hiện tại)
- **Thành tiền** tự tính

💡 **Mẹo**: Có thể **import dòng từ Excel** nếu đơn PO lớn (> 50 SP).

### Bước 5: Thông tin bổ sung

- **Ngày giao dự kiến**
- **Điều khoản thanh toán** (Net 30, Cash on delivery...)
- **Ghi chú cho NCC**
- **VAT %** (nếu có)

### Bước 6: Lưu + Duyệt

- **[Lưu nháp]** — nếu chưa chắc, lưu tạm
- **[Lưu + Duyệt]** — PO sang trạng thái **APPROVED**, sẵn sàng gửi NCC

🔒 **Quyền**: Tạo PO = Purchaser. Duyệt PO > ngưỡng X = Store Manager.

---

## 4. Gửi PO qua email

### Các bước

1. Mở chi tiết PO đã duyệt.
2. Nhấn **[Gửi email NCC]**.
3. Hệ thống đã điền sẵn:
   - **Đến**: email NCC
   - **Tiêu đề**: "[Công ty] PO số XXX — ngày YYY"
   - **Nội dung**: template chuẩn
   - **Đính kèm**: PO dạng PDF
4. Có thể edit tiêu đề/nội dung nếu muốn.
5. Nhấn **[Gửi]**.

PO chuyển trạng thái **SENT**, thời gian gửi lưu log.

💡 **Mẹo**: Nếu NCC không nhận email, xuất PDF và gửi qua Zalo/WhatsApp.

---

## 5. Nhập kho theo PO

Khi hàng về, tạo **phiếu nhập** trực tiếp từ PO để không phải nhập lại.

### Bước 1: Mở PO

Danh sách PO → tìm PO tương ứng → mở chi tiết.

### Bước 2: Nhấn Nhận hàng

Nút **[Nhận hàng]** ở góc phải.

### Bước 3: Tick từng dòng

Hệ thống liệt kê các dòng SP trong PO. Với mỗi dòng:

- **Số lượng đã đặt** (từ PO, không sửa)
- **Số lượng nhận thực tế** — bạn nhập (có thể < SL đặt nếu giao thiếu)
- **Kho nhập** — mặc định theo PO, có thể đổi
- **Hạn sử dụng + lô** — nếu SP track lot

### Bước 4: Hoàn tất

Nhấn **[Xác nhận nhập]**:

- Phiếu nhập được tạo
- Tồn kho tăng
- PO cập nhật **số lượng đã nhận** (dùng để nhận nhiều lần)
- Công nợ NCC tăng (phải trả)

### Nhận hàng nhiều lần

Nếu NCC giao 2 lần (lần 1: 60%, lần 2: 40%), bạn nhấn **[Nhận hàng]** mỗi lần — hệ thống track cho đến khi nhận đủ.

Khi nhận đủ 100% → PO chuyển **COMPLETED**.

⚠️ **Chú ý**: Nếu NCC giao **thiếu** và không giao bù → đóng PO thủ công với ghi chú lý do.

---

## 6. Công nợ NCC

Sidebar → **Mua hàng → Công nợ NCC**.

Bảng hiển thị:

| Cột | Ý nghĩa |
|---|---|
| **NCC** | Tên |
| **Tổng phải trả** | Tổng của các phiếu nhập chưa thanh toán |
| **Đã thanh toán** | Tổng các phiếu chi đã gửi NCC |
| **Còn lại** | Phải trả − Đã thanh toán |
| **Quá hạn** | Số tiền quá ngày điều khoản |

### Click vào NCC → xem chi tiết:

- Danh sách **phiếu nhập đang nợ**
- **Phiếu thanh toán đã thực hiện**
- **Tuổi nợ** (aging: 0-30, 31-60, 60+ ngày)

💡 **Mẹo**: Sắp xếp theo **quá hạn giảm dần** → ưu tiên thanh toán NCC quan trọng nhất.

---

## 7. Tạo phiếu thanh toán NCC

### Các bước

1. Sidebar → **Mua hàng → Thanh toán NCC** → **[+ Tạo phiếu thanh toán]**.
2. Chọn **NCC**.
3. Hệ thống liệt kê các phiếu nhập đang nợ.
4. Tick chọn các phiếu muốn thanh toán — có thể thanh toán 1 phần (partial).
5. Chọn **phương thức**:
   - Tiền mặt — từ quỹ
   - Chuyển khoản — từ TK ngân hàng công ty
   - Séc / thẻ
6. Nhập **số tiền thanh toán**.
7. Upload chứng từ (ảnh giấy UNC, bill chuyển khoản).
8. Nhấn **[Lưu + Duyệt]**.

Hệ thống:
- Tạo **phiếu chi** tương ứng
- Giảm công nợ NCC
- Ghi vào sổ quỹ / sổ ngân hàng

🔒 **Quyền**: Kế toán hoặc Store Manager.

---

## 8. Báo cáo mua hàng

Sidebar → **Báo cáo → Mua hàng**.

Các báo cáo:

### 8.1. Tổng hợp mua hàng theo kỳ

- Tổng giá trị mua theo tháng
- Top 10 NCC theo giá trị
- Top 10 SP mua nhiều nhất

### 8.2. Phân tích giá nhập

So sánh giá nhập cùng 1 SP từ **nhiều NCC** khác nhau → giúp đàm phán.

### 8.3. Hiệu suất NCC

Đánh giá NCC theo:

- **Tỷ lệ giao đúng hẹn**
- **Tỷ lệ đủ số lượng**
- **Chất lượng** (dựa trên số lần trả hàng)

Export Excel/PDF.

💡 **Mẹo**: Dùng hiệu suất NCC để **đánh giá lại hợp đồng mỗi quý** — cắt NCC kém, tăng mua từ NCC tốt.

---

## FAQ

**1. Tôi tạo PO nhưng chọn nhầm NCC, sửa được không?**
Được — chỉ khi PO còn ở trạng thái **DRAFT** hoặc **APPROVED chưa gửi**. Nếu đã SENT thì phải **huỷ + tạo mới**.

**2. NCC giao nhiều hơn PO (vd đặt 100, giao 110), xử lý thế nào?**
Có 2 cách: (a) Nhận 100 + trả lại 10; (b) Chỉnh PO tăng lên 110 nếu cần thêm. Chọn (a) là chuẩn audit.

**3. Giá nhập thay đổi giữa PO và phiếu nhập — có được không?**
Theo mặc định **không** — giá lock theo PO. Nếu cần sửa (vd tỷ giá biến động), cần quyền đặc biệt + lý do.

**4. Có thể tạo PO từ cảnh báo tồn thấp tự động không?**
Có. Vào Cảnh báo tồn → tick SP → **[Tạo PO]** → hệ thống gom các SP cùng NCC thành 1 PO.

**5. Công nợ NCC hiện âm — nghĩa là gì?**
Nghĩa là bạn đã **thanh toán thừa** cho NCC (advance payment). Khoản dư sẽ trừ vào lần nhập kế tiếp.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "NCC chưa có email" | Chưa nhập | Cập nhật thông tin NCC |
| "PO chưa duyệt không gửi được" | Trạng thái DRAFT | Duyệt trước |
| "Nhận hàng quá PO" | SL thực > SL đặt | Chỉnh số hoặc tạo PO bù |
| "Thanh toán quá công nợ" | Số tiền > còn lại | Giảm số tiền hoặc ghi advance |

---

*Hết Part 06. Xem tiếp [Part 07 — Vận chuyển & Giao hàng](part-07-van-chuyen.md).*
