# Part 05 — Kho & Sản phẩm

> **Dành cho**: Nhân viên kho (Warehouse), Quản lý cửa hàng, Purchaser
> **Mức độ**: Trung cấp
> **Tham chiếu URD**: [Part 05 — Inventory](../urd/part-05-inventory.md)

Kho là nền tảng của bán lẻ — hàng hoá đúng số lượng, đúng vị trí thì POS mới bán được. Part này hướng dẫn toàn bộ nghiệp vụ kho: từ tạo SP đến kiểm kê định kỳ.

## Mục lục
- [1. Tạo danh mục sản phẩm](#1-tạo-danh-mục-sản-phẩm)
- [2. Thêm sản phẩm mới](#2-thêm-sản-phẩm-mới)
- [3. Upload ảnh sản phẩm](#3-upload-ảnh-sản-phẩm)
- [4. Danh sách kho](#4-danh-sách-kho)
- [5. Xem tồn kho ma trận SP × Kho](#5-xem-tồn-kho-ma-trận-sp--kho)
- [6. Cảnh báo tồn thấp](#6-cảnh-báo-tồn-thấp)
- [7. Phiếu nhập kho từ NCC](#7-phiếu-nhập-kho-từ-ncc)
- [8. Phiếu xuất kho thủ công](#8-phiếu-xuất-kho-thủ-công)
- [9. Chuyển kho giữa chi nhánh](#9-chuyển-kho-giữa-chi-nhánh)
- [10. Điều chỉnh kho](#10-điều-chỉnh-kho)
- [11. Kiểm kê định kỳ (Stock take)](#11-kiểm-kê-định-kỳ-stock-take)
- [12. Báo cáo tồn kho](#12-báo-cáo-tồn-kho)
- [FAQ](#faq)

---

## 1. Tạo danh mục sản phẩm

Sản phẩm được tổ chức theo **danh mục cây** (category tree) — ví dụ: Mỹ phẩm → Son → Son lì.

### Các bước

1. Sidebar → **Kho & Sản phẩm → Danh mục**.
2. Nhấn **[+ Thêm danh mục]**.
3. Nhập:
   - **Tên danh mục**
   - **Danh mục cha** (nếu là sub-category)
   - **Mã danh mục** (tuỳ chọn, auto sinh)
   - **Thứ tự** (số, để sắp xếp)
4. Nhấn **[Lưu]**.

💡 **Mẹo**: Thiết kế cây danh mục tối đa **3 cấp** cho dễ tìm.

---

## 2. Thêm sản phẩm mới

### Bước 1: Mở form

Sidebar → **Kho & Sản phẩm → Sản phẩm** → **[+ Thêm sản phẩm]**.

### Bước 2: Điền thông tin cơ bản

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| **Tên SP** | ✅ | Ngắn gọn, rõ ràng |
| **SKU** | ✅ | Mã quản lý nội bộ, unique |
| **Mã vạch** | ❌ | Barcode từ NCC hoặc sinh mới |
| **Danh mục** | ✅ | Chọn từ cây |
| **Đơn vị cơ bản** | ✅ | Cái / chai / hộp / thùng... |
| **Giá vốn** | ✅ | Giá nhập từ NCC (chưa VAT) |
| **Giá bán lẻ** | ✅ | Giá niêm yết cho POS |
| **VAT %** | ❌ | Thường 8% hoặc 10% |
| **Tồn tối thiểu** | ❌ | Ngưỡng cảnh báo low stock |
| **Mô tả** | ❌ | Dùng cho web/đa kênh |

### Bước 3: Đơn vị quy đổi

Nếu SP có nhiều đơn vị (ví dụ 1 thùng = 24 chai):

1. Chuyển sang tab **Đơn vị**.
2. Nhấn **[+ Thêm đơn vị]**.
3. Nhập: Tên đơn vị = "Thùng", Quy đổi = "24 chai", Giá bán theo thùng.

💡 **Mẹo**: Đơn vị nhỏ nhất (chai) là **đơn vị cơ bản** — mọi tính toán tồn kho dựa trên đơn vị này.

### Bước 4: Lưu

Nhấn **[Lưu]** → SP xuất hiện trong danh sách.

⚠️ **Chú ý**: SKU **không trùng** — nếu trùng, hệ thống báo lỗi ngay.

---

## 3. Upload ảnh sản phẩm

### Các bước

1. Mở chi tiết SP → tab **Hình ảnh**.
2. Nhấn **[+ Tải ảnh]**.
3. Chọn file (max 5MB, định dạng JPG/PNG/WEBP).
4. Có thể tải **nhiều ảnh** cùng lúc — ảnh đầu tiên là ảnh đại diện.
5. Kéo thả để sắp xếp thứ tự.

💡 **Mẹo**: Ảnh vuông (1:1) nhìn đẹp nhất trên POS và trang web.

---

## 4. Danh sách kho

Tenant có thể có **nhiều kho**: kho tổng, kho chi nhánh A, kho chi nhánh B...

### Xem danh sách

Sidebar → **Kho & Sản phẩm → Danh sách kho**.

Mỗi kho có:

- **Tên kho**
- **Mã kho**
- **Cơ sở gắn liền** (nếu gắn với chi nhánh)
- **Người quản lý**
- **Tổng giá trị tồn**

### Tạo kho mới

1. Nhấn **[+ Thêm kho]**.
2. Nhập tên, mã, địa chỉ, gắn cơ sở, chọn người quản lý.
3. Lưu.

🔒 **Quyền**: Chỉ Tenant Admin hoặc Store Manager cao nhất được tạo kho.

---

## 5. Xem tồn kho ma trận SP × Kho

Trang quan trọng nhất — cho bạn biết **từng SP đang ở kho nào, bao nhiêu**.

### Các bước

1. Sidebar → **Kho & Sản phẩm → Tồn kho**.
2. Bảng hiện: hàng = SP, cột = kho, ô = số lượng.
3. Click ô để xem chi tiết (lô hàng, hạn sử dụng nếu có).

### Filter

- **Danh mục SP**
- **Tìm theo SKU/tên**
- **Chỉ hiển thị SP có tồn > 0**
- **Chỉ hiển thị SP tồn thấp**

💡 **Mẹo**: Dùng checkbox **"Chỉ hiển thị SP tồn thấp"** → danh sách cần nhập thêm hàng.

> 🖼️ *Ảnh minh hoạ: Ma trận tồn kho — chụp sau*

---

## 6. Cảnh báo tồn thấp

Khi tồn SP < **tồn tối thiểu**, hệ thống:

- Hiển thị **badge đỏ** ở tile Dashboard
- Gửi **thông báo chuông** cho Store Manager
- Liệt kê trong trang **Cảnh báo tồn** (Sidebar → Kho → Cảnh báo tồn thấp)

### Xử lý cảnh báo

1. Mở trang cảnh báo.
2. Check danh sách SP cần nhập.
3. Tạo **PO (Purchase Order)** ngay từ đây → xem Part 06.

---

## 7. Phiếu nhập kho từ NCC

Khi hàng về từ NCC, bạn tạo **phiếu nhập** để cộng tồn.

### Cách 1: Nhập từ PO

1. Sidebar → **Mua hàng → PO** → mở PO đã tạo.
2. Nhấn **[Nhận hàng]**.
3. Tick từng dòng đã nhận + số lượng thực tế.
4. Chọn **kho nhập**.
5. Xác nhận.

Hệ thống tự tạo phiếu nhập + cộng tồn.

### Cách 2: Nhập kho thủ công

1. Sidebar → **Kho → Phiếu nhập** → **[+ Tạo phiếu nhập]**.
2. Chọn **NCC**.
3. Chọn **kho nhập**.
4. Thêm dòng SP + số lượng + giá vốn.
5. Upload hoá đơn NCC (tuỳ chọn).
6. Nhấn **[Lưu + Duyệt]**.

⚠️ **Chú ý**: Phiếu nhập đã duyệt → không sửa được. Nếu sai, tạo **phiếu điều chỉnh** bù.

---

## 8. Phiếu xuất kho thủ công

Dùng khi **không phải bán hàng** mà vẫn xuất hàng ra — ví dụ: tiêu huỷ, làm mẫu, biếu tặng.

### Các bước

1. Sidebar → **Kho → Phiếu xuất** → **[+ Tạo phiếu xuất]**.
2. Chọn **kho xuất**.
3. Chọn **lý do xuất**: Tiêu huỷ / Làm mẫu / Biếu tặng / Hao hụt / Khác.
4. Thêm dòng SP + số lượng.
5. Ghi chú.
6. Nhấn **[Lưu + Duyệt]**.

🔒 **Quyền**: Cần quyền **Inventory Out**. Store Manager trở lên.

💡 **Mẹo**: Mọi phiếu xuất thủ công đều **ảnh hưởng báo cáo lỗ lãi** → nhập chính xác lý do để kế toán phân loại.

---

## 9. Chuyển kho giữa chi nhánh

Hàng từ kho tổng chuyển xuống chi nhánh, hoặc giữa 2 chi nhánh.

### Các bước

1. Sidebar → **Kho → Phiếu chuyển kho** → **[+ Tạo phiếu chuyển]**.
2. Chọn:
   - **Kho nguồn**
   - **Kho đích**
3. Thêm SP + số lượng chuyển.
4. Nhập thông tin vận chuyển (xe nào, tài xế, dự kiến đến).
5. Nhấn **[Lưu + Gửi]** — phiếu sang trạng thái **IN TRANSIT**, hàng tạm khoá.

### Xác nhận đã nhận

Khi hàng đến kho đích, thủ kho nhấn **[Đã nhận]** + tick từng dòng + số lượng thực nhận.

Nếu **thiếu** (ví dụ 10 mà chỉ nhận 9) → tạo **phiếu điều chỉnh thiếu**.

⚠️ **Chú ý**: Phiếu chuyển kho chưa được nhận thì **không tính vào tồn kho đích** — để tránh bán nhầm.

---

## 10. Điều chỉnh kho

Dùng khi phát hiện **sai lệch** giữa sổ sách và thực tế (mất, thừa, hỏng).

### Các bước

1. Sidebar → **Kho → Điều chỉnh kho** → **[+ Tạo phiếu điều chỉnh]**.
2. Chọn kho + SP.
3. Nhập:
   - **Tồn hệ thống hiện tại** (auto hiện)
   - **Tồn thực tế** (bạn nhập)
4. Chọn **lý do**: Mất / Hỏng / Thừa / Kiểm đếm sai / Khác.
5. Ghi chú chi tiết.
6. Lưu + Duyệt.

🔒 **Quyền**: Store Manager. Audit log 100%.

⚠️ **Chú ý**: Điều chỉnh kho tạo **chi phí bất thường** → kế toán phải biết.

---

## 11. Kiểm kê định kỳ (Stock take)

Kiểm kê toàn bộ kho — thường làm định kỳ tháng/quý.

### Bước 1: Tạo phiếu kiểm kê

1. Sidebar → **Kho → Kiểm kê định kỳ** → **[+ Tạo kiểm kê]**.
2. Chọn **kho** và **phạm vi**:
   - Toàn bộ kho
   - Theo danh mục
   - Theo tag SP
3. Nhấn **[Bắt đầu kiểm kê]**.

Trạng thái kho chuyển sang **ĐANG KIỂM KÊ** — trong lúc này, các đơn bán vẫn chạy nhưng ghi log riêng.

### Bước 2: Đếm thực tế

Hệ thống sinh danh sách SP cần đếm. Nhân viên đi đếm + nhập số liệu (qua PWA trên điện thoại cũng được).

Với mỗi dòng, nhập:

- Số lượng đếm được

### Bước 3: Đối chiếu

Sau khi đếm xong, nhấn **[Đối chiếu]** → hệ thống hiện:

- SP khớp
- SP thừa
- SP thiếu

### Bước 4: Kết thúc kiểm kê

Duyệt + ký → hệ thống tạo **phiếu điều chỉnh tự động** cho các chênh lệch → cập nhật tồn.

💡 **Mẹo**: Kiểm kê nên làm **ngoài giờ bán** để tránh sai số.

---

## 12. Báo cáo tồn kho

Sidebar → **Báo cáo → Tồn kho** → chọn loại:

- **Tồn hiện tại** — snapshot hiện tại theo kho
- **Biến động kho** — nhập/xuất/chuyển trong khoảng ngày
- **Tuổi tồn kho** — SP đang nằm kho bao lâu (phát hiện hàng chậm bán)
- **ABC analysis** — phân loại SP theo doanh thu (A: top 20%, B: 30%, C: 50%)

Export Excel/PDF tuỳ nhu cầu.

---

## FAQ

**1. Tôi tạo SP mà không có ảnh, có bán được không?**
Được. Ảnh chỉ tuỳ chọn. Nhưng khuyến khích upload để POS + web đẹp hơn.

**2. Tồn kho âm có nghĩa là gì?**
Là lỗi — bạn đã bán nhiều hơn tồn thực có. Kiểm kê ngay và điều chỉnh.

**3. Tôi muốn 1 SP có 2 giá bán khác nhau ở 2 cơ sở — có được không?**
Có. Vào chi tiết SP → tab **Giá theo cơ sở** → đặt giá riêng.

**4. Chuyển kho mà chưa được nhận thì tồn nằm ở đâu?**
Ở **"kho ảo đang chuyển"** — không tính vào kho nguồn hay đích cho đến khi xác nhận nhận.

**5. SP hết hạn sử dụng, hệ thống có cảnh báo không?**
Có — nếu bạn bật tracking **lô + hạn sử dụng** ở cài đặt SP. Cảnh báo trước 30 ngày hết hạn.

**6. Kiểm kê định kỳ mất bao lâu?**
Phụ thuộc số SKU. Tenant 1000 SKU mất ~2 giờ nếu 2 người đếm.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "SKU đã tồn tại" | Trùng SKU | Đặt SKU khác |
| "Không đủ tồn để xuất" | Tồn < số lượng xuất | Nhập thêm hoặc chỉnh số lượng |
| "Chuyển kho cùng 1 kho" | Nguồn = đích | Chọn đích khác |
| Tồn kho âm | Bug / race condition | Kiểm kê, điều chỉnh |
| Upload ảnh fail | File > 5MB | Resize ảnh |

---

*Hết Part 05. Xem tiếp [Part 06 — Mua hàng & NCC](part-06-mua-hang-ncc.md).*
