# Part 04 — Đơn hàng & Hoá đơn VAT

> **Dành cho**: Thu ngân, Kế toán, Quản lý cửa hàng
> **Mức độ**: Trung cấp
> **Tham chiếu URD**: [Part 04 — Orders & Invoices](../urd/part-04-orders-invoices.md)

Sau khi bán hàng ở POS, mọi đơn đều lưu vào **danh sách đơn**. Part này hướng dẫn tra cứu, in lại, huỷ đơn, trả hàng, phát hành HDĐT, và đồng bộ đơn đa kênh.

## Mục lục
- [1. Danh sách đơn hàng](#1-danh-sách-đơn-hàng)
- [2. Xem chi tiết đơn](#2-xem-chi-tiết-đơn)
- [3. In lại hoá đơn](#3-in-lại-hoá-đơn)
- [4. Huỷ đơn](#4-huỷ-đơn)
- [5. Trả hàng từ khách](#5-trả-hàng-từ-khách)
- [6. Phát hành HDĐT VAT](#6-phát-hành-hdđt-vat)
- [7. Xem danh sách HDĐT đã phát hành](#7-xem-danh-sách-hdđt-đã-phát-hành)
- [8. Huỷ + phát hành lại HDĐT](#8-huỷ--phát-hành-lại-hdđt)
- [9. Tạo báo giá (Quotation)](#9-tạo-báo-giá-quotation)
- [10. Đơn đa kênh](#10-đơn-đa-kênh)
- [11. Tracking đơn đã giao](#11-tracking-đơn-đã-giao)
- [FAQ](#faq)

---

## 1. Danh sách đơn hàng

Sidebar → **Bán hàng → Đơn hàng** (`/sale_order`).

### 1.1. Filter theo kỳ

Thanh filter trên cùng:

- **Hôm nay** / **7 ngày** / **30 ngày** / **Tuỳ chỉnh** (chọn khoảng ngày)

### 1.2. Filter theo cơ sở

Nếu multi-branch: dropdown **Cơ sở** → chọn 1 hoặc nhiều.

### 1.3. Filter theo trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| **DRAFT** | Đơn nháp, chưa lưu |
| **PENDING** | Chờ thanh toán |
| **PAID** | Đã thanh toán đầy đủ |
| **PARTIAL** | Thanh toán 1 phần |
| **PARKED** | Tạm treo |
| **CANCELLED** | Đã huỷ |
| **RETURNED** | Đã trả hàng toàn bộ |
| **PARTIAL_RETURN** | Trả 1 phần |

### 1.4. Các cột hiển thị

- Mã đơn, Ngày, Khách, Thu ngân, Cơ sở, Tổng tiền, Phương thức TT, Trạng thái

💡 **Mẹo**: Click tiêu đề cột để sắp xếp. Click vào dòng đơn để mở chi tiết.

> 🖼️ *Ảnh minh hoạ: Danh sách đơn hàng — chụp sau*

---

## 2. Xem chi tiết đơn

Click vào 1 đơn từ danh sách → mở trang chi tiết với:

- **Header**: Mã đơn, Ngày tạo, Thu ngân, Cơ sở, Trạng thái
- **Khách hàng**: Link về chi tiết khách
- **Danh sách SP**: Ảnh, tên, SKU, SL, đơn giá, giảm giá, thành tiền
- **Tổng tiền**: Subtotal, KM, VAT (nếu có), tổng cuối
- **Phương thức thanh toán**: Chi tiết từng phương thức + số tiền
- **Lịch sử trạng thái**: audit log ai làm gì lúc nào
- **Nút action**: In lại, Huỷ, Trả hàng, Phát hành HDĐT, Sao chép đơn

---

## 3. In lại hoá đơn

### Các bước

1. Mở chi tiết đơn.
2. Nhấn **[In lại bill]** (icon máy in).
3. Chọn:
   - **In bill nhiệt** — ra máy in kết nối
   - **Xuất PDF** — tải file về
   - **Gửi email** — nhập email nhận

💡 **Mẹo**: In lại không tạo đơn mới — bill giống hệt bill gốc.

---

## 4. Huỷ đơn

### Khi nào được huỷ?

- Đơn **PENDING** hoặc **PARKED**: huỷ tự do
- Đơn **PAID**: phải qua **quy trình hoàn tiền**, cần quyền đặc biệt

### Các bước

1. Mở chi tiết đơn.
2. Nhấn **[Huỷ đơn]** (nút cam).
3. Modal confirm hiện:
   - Chọn **lý do huỷ** (dropdown: Khách đổi ý / Hết hàng / Sai thông tin / Khác)
   - Ghi chú (bắt buộc nếu chọn "Khác")
4. Nhấn **[Xác nhận huỷ]**.

Hệ thống:
- Đơn chuyển trạng thái **CANCELLED**
- **Cộng lại tồn kho** (nếu đã trừ)
- Nếu đã thanh toán → tạo phiếu **hoàn tiền** chờ xử lý

⚠️ **Chú ý**: Huỷ đơn **PAID** sẽ được log audit + thông báo cho Store Manager.

🔒 **Quyền**: Huỷ đơn PENDING — Cashier. Huỷ đơn PAID — Store Manager.

---

## 5. Trả hàng từ khách

Khi khách đem hàng đến trả — dùng chức năng **Return Invoice**.

### Bước 1: Mở trang Trả hàng

Sidebar → **Bán hàng → Trả hàng** (`/return_invoice`).

### Bước 2: Tìm đơn gốc

Nhập **mã đơn gốc** hoặc **SĐT khách** → chọn đúng đơn.

### Bước 3: Chọn sản phẩm trả

Hệ thống liệt kê SP trong đơn. Với mỗi SP, tick chọn + nhập **số lượng trả** (tối đa = SL đã mua).

### Bước 4: Ghi lý do

Chọn **lý do trả**:
- Lỗi sản xuất
- Không vừa ý
- Sai sản phẩm
- Khác (ghi rõ)

### Bước 5: Chọn phương thức hoàn tiền

- **Hoàn tiền mặt** — trả tiền từ két
- **Credit về voucher** — tạo voucher bằng giá trị trả cho khách dùng lần sau
- **Hoàn về thẻ** — chuyển khoản về thẻ khách

### Bước 6: Xác nhận

Nhấn **[Xác nhận trả hàng]**.

Hệ thống:
- Tạo **phiếu trả hàng** (return invoice)
- **Cộng lại tồn kho**
- Ghi nhận vào sổ chi
- Đơn gốc chuyển **PARTIAL_RETURN** hoặc **RETURNED**

⚠️ **Chú ý**:
- Quá hạn chính sách trả hàng (ví dụ > 7 ngày) → cần **approval của Store Manager**.
- SP thuộc diện **không trả** (khuyến mãi flash, SP vệ sinh cá nhân đã mở) → reject.

---

## 6. Phát hành HDĐT VAT

(Tương tự Part 02 mục 10, nhưng có thể phát hành **sau** khi đã tạo đơn từ lâu.)

### Các bước

1. Mở chi tiết đơn.
2. Nhấn **[Phát hành HDĐT]**.
3. Nhập thông tin người mua: **Tên công ty, MST, Địa chỉ, Email**.
4. Nhấn **[Phát hành]**.

Hệ thống gọi provider → nhận mã tra cứu → gửi email cho khách.

💡 **Mẹo**: Có thể phát hành HDĐT cho đơn **trong vòng 7 ngày** kể từ khi bán (theo TT78/NĐ123).

---

## 7. Xem danh sách HDĐT đã phát hành

Sidebar → **Bán hàng → Hoá đơn VAT** (`/vat_invoice`).

### Các cột

- Số hoá đơn
- Ngày phát hành
- Mã tra cứu
- Tên người mua
- MST
- Tổng tiền
- Trạng thái (Đã phát hành / Đã huỷ / Chờ gửi)
- Link xem XML
- Link download PDF

### Filter

- Khoảng ngày
- MST khách
- Trạng thái

💡 **Mẹo**: Export danh sách HDĐT ra Excel để gửi kế toán nội bộ cuối tháng.

---

## 8. Huỷ + phát hành lại HDĐT

Nếu HDĐT có sai sót (sai MST, sai tên...), bạn phải **huỷ** rồi **phát hành lại**.

### Bước 1: Huỷ HDĐT cũ

1. Mở danh sách HDĐT → tìm HDĐT sai.
2. Nhấn **[Huỷ]**.
3. Nhập **lý do huỷ** (bắt buộc, theo mẫu TT78).
4. Xác nhận.

Hệ thống gửi request huỷ lên provider + báo cáo cơ quan thuế.

### Bước 2: Phát hành lại

Quay về đơn hàng → nhấn **[Phát hành HDĐT]** lần nữa → nhập thông tin đúng → phát hành.

⚠️ **Chú ý**: HDĐT huỷ phải ghi rõ lý do — lưu vĩnh viễn cho thanh tra thuế.

🔒 **Quyền**: Kế toán hoặc Store Manager.

---

## 9. Tạo báo giá (Quotation)

Báo giá dùng khi khách hỏi giá trước khi quyết định mua. **Chưa thường dùng** trong retail, nhưng có sẵn cho B2B.

### Các bước

1. Sidebar → **Bán hàng → Báo giá** → **[+ Tạo báo giá]**.
2. Chọn khách + thêm SP như tạo đơn thường.
3. Nhấn **[Lưu báo giá]**.
4. **[Gửi email]** cho khách.
5. Khi khách chốt, nhấn **[Chuyển thành đơn bán]** → auto tạo đơn từ báo giá.

---

## 10. Đơn đa kênh

Đơn từ các sàn TMĐT (**Shopee, Lazada, Tiki, TikTok Shop**) được đồng bộ về CRM.

### 10.1. Xem đơn sàn

Sidebar → **Bán hàng → Đơn đa kênh**.

Có thể lọc theo **kênh**: Shopee / Lazada / Tiki...

### 10.2. Đồng bộ thủ công

Nếu đơn mới từ sàn chưa về, nhấn **[Đồng bộ ngay]** ở góc phải trên.

### 10.3. Xử lý đơn sàn

Mỗi đơn sàn có các action:
- **Xác nhận** (accept order)
- **In phiếu giao** (ship label)
- **Cập nhật trạng thái giao hàng** → đồng bộ ngược về sàn

💡 **Mẹo**: Cấu hình kết nối sàn tại Part 12 — Cài đặt → Integrations.

---

## 11. Tracking đơn đã giao

Với đơn online hoặc đơn có ship:

### Các bước

1. Mở chi tiết đơn.
2. Xem phần **Vận chuyển** → click **[Xem tracking]**.
3. Modal hiện timeline: Picking → In transit → Delivered → Completed.
4. Status được update từ đối tác vận chuyển (GHN/GHTK/VNPost).

Xem thêm Part 07 — Vận chuyển.

---

## FAQ

**1. Tôi huỷ đơn PAID nhưng không thấy tiền hoàn về đâu?**
Huỷ đơn PAID tạo **phiếu hoàn tiền** chờ kế toán xử lý. Vào Tài chính → Phiếu chi → lọc loại "Hoàn đơn".

**2. Có thể sửa đơn đã PAID không?**
Không. Chỉ có thể **huỷ + tạo đơn mới** hoặc **trả hàng**.

**3. HDĐT đã phát hành rồi, có sửa được MST không?**
Không. Phải **huỷ** rồi phát hành lại HDĐT mới.

**4. Đơn Shopee về CRM nhưng số lượng tồn kho không bị trừ?**
Kiểm tra cấu hình integration: có bật **"Trừ tồn khi đồng bộ"** không. Nếu không, tồn chỉ trừ khi bạn xác nhận đóng gói.

**5. In lại bill cũ bị mờ — sửa template ở đâu?**
Part 12 — Cài đặt → Template in → Bill POS.

**6. Tôi muốn in phiếu giao kèm QR cho khách kiểm tra đơn — được không?**
Được. Cấu hình template bill thêm QR tra cứu trong Part 12.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "Đơn không tồn tại" | Mã sai | Check lại mã |
| "Không có quyền huỷ" | Role không đủ | Nhờ Manager |
| "SP không đủ điều kiện trả" | Chính sách | Xin duyệt Manager |
| "HDĐT provider lỗi" | Mạng/provider | Retry sau vài phút |
| "Quá hạn phát hành HDĐT" | > 7 ngày | Không phát hành được, giải thích cho khách |

---

*Hết Part 04. Xem tiếp [Part 05 — Kho & Sản phẩm](part-05-kho-san-pham.md).*
