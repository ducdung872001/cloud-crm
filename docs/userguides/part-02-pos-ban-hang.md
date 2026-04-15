# Part 02 — POS: Bán hàng tại quầy

> **Dành cho**: Thu ngân (Cashier), Quản lý cửa hàng (Store Manager)
> **Mức độ**: Cơ bản → Trung cấp
> **Tham chiếu URD**: [Part 02 — POS Bán hàng](../urd/part-02-pos-ban-hang.md) (UR-POS-01 → UR-POS-12)

Đây là **phân hệ quan trọng nhất** của Reborn Retail — nơi bạn bán hàng mỗi ngày. Part này hướng dẫn từ lúc **chuẩn bị thiết bị đầu ca** đến **đóng ca cuối ngày**, qua toàn bộ quy trình tạo đơn và thanh toán.

## Mục lục
- [0. Chuẩn bị thiết bị](#0-chuẩn-bị-thiết-bị)
- [1. Mở ca làm việc](#1-mở-ca-làm-việc)
- [2. Mở màn hình POS](#2-mở-màn-hình-pos)
- [3. Tìm sản phẩm](#3-tìm-sản-phẩm)
- [4. Thêm vào giỏ hàng](#4-thêm-vào-giỏ-hàng)
- [5. Chỉnh số lượng, giá, giảm giá](#5-chỉnh-số-lượng-giá-giảm-giá)
- [6. Chọn khách hàng](#6-chọn-khách-hàng)
- [7. Áp mã khuyến mãi / voucher](#7-áp-mã-khuyến-mãi--voucher)
- [8. Thanh toán](#8-thanh-toán)
- [9. Xác nhận + in hoá đơn](#9-xác-nhận--in-hoá-đơn)
- [10. Phát hành HDĐT VAT](#10-phát-hành-hdđt-vat)
- [11. Tạm treo đơn (Park)](#11-tạm-treo-đơn-park)
- [12. Phím tắt](#12-phím-tắt)
- [13. Kiểm kê + đóng ca](#13-kiểm-kê--đóng-ca)
- [FAQ](#faq)

---

## 0. Chuẩn bị thiết bị

Trước khi mở ca, hãy đảm bảo các thiết bị sau hoạt động:

### 0.1. Máy in nhiệt (bill printer)

- Kiểm tra giấy còn đủ (cuộn giấy thermal 80mm).
- Cắm nguồn + USB → đèn xanh sáng.
- Test: nhấn nút **Feed** → giấy ra đều.

### 0.2. Scanner mã vạch

- Cắm USB → nghe tiếng "bíp" khi cắm.
- Test: quét 1 mã vạch bất kỳ vào Notepad → ra chuỗi số.

### 0.3. Két tiền (cash drawer)

- Kết nối qua máy in (RJ11) hoặc USB.
- Két sẽ tự mở khi có đơn tiền mặt thành công.

### 0.4. Kết nối mạng

- Wifi hoặc LAN ổn định.
- Nếu mạng yếu, POS vẫn cache được giỏ hàng nhưng thanh toán QR/thẻ sẽ fail.

💡 **Mẹo**: Luôn **test in 1 bill mẫu** đầu ca để chắc chắn máy in sẵn sàng.

---

## 1. Mở ca làm việc

> 🔒 **Quyền**: Cashier trở lên. Mỗi cashier chỉ được có **1 ca OPEN** cùng lúc.

### Bước 1: Truy cập trang Quản lý ca

Sidebar → **Bán hàng → Quản lý ca** (`/shift_management`).

### Bước 2: Nhấn nút Mở ca

Nếu chưa có ca nào đang mở, bạn sẽ thấy nút **[Mở ca]** màu xanh lá.

### Bước 3: Nhập tiền đầu ca

Modal hiện ra, nhập:

- **Số tiền mặt đầu ca** — tiền rút từ két, tiền lẻ chuẩn bị trả khách (ví dụ: 500.000đ)
- **Ghi chú** (tuỳ chọn)

Nhấn **[Xác nhận mở ca]**.

⚠️ **Chú ý**:
- Nếu ca hôm qua chưa đóng → bạn phải **đóng ca cũ trước** (xem mục 13).
- Số tiền đầu ca sẽ lưu vào audit log — nhập chính xác.

> 🖼️ *Ảnh minh hoạ: Modal mở ca — chụp sau*

---

## 2. Mở màn hình POS

Sidebar → **Bán hàng → POS** (`/create_sale_add`).

Giao diện POS chia làm 2 phần:

- **Bên trái**: ô tìm SP + danh sách SP gợi ý
- **Bên phải**: giỏ hàng + thông tin khách + tổng tiền + nút thanh toán

> 🖼️ *Ảnh minh hoạ: Màn hình POS chính — chụp sau*

---

## 3. Tìm sản phẩm

Có **3 cách** tìm sản phẩm:

### Cách 1: Gõ tên sản phẩm

Click vào ô **Tìm sản phẩm** → gõ tên → danh sách gợi ý hiện ra sau ~200ms.

Click vào SP muốn thêm.

### Cách 2: Quét mã vạch

Trỏ chuột vào ô tìm SP → dùng scanner quét mã vạch trên sản phẩm → **SP tự động thêm vào giỏ**.

### Cách 3: Nhập SKU

Gõ SKU đầy đủ (ví dụ `SP00123`) → nhấn **Enter** → thêm vào giỏ.

💡 **Mẹo**: Phím tắt `F2` để focus nhanh vào ô tìm SP từ bất cứ đâu.

⚠️ **Chú ý**: SP hết hàng hiển thị label **"Hết hàng"** màu đỏ — vẫn thêm được vào giỏ nhưng sẽ bị warning.

---

## 4. Thêm vào giỏ hàng

Sau khi chọn SP, dòng sẽ hiện trong giỏ với:

- Ảnh + tên SP
- SKU
- Số lượng (mặc định 1)
- Đơn giá
- Thành tiền

Nếu SP có **nhiều đơn vị** (thùng / gói / cái), hệ thống hỏi chọn đơn vị trước.

💡 **Mẹo**: Thêm SP đã có trong giỏ → **tăng số lượng** chứ không tạo dòng mới.

---

## 5. Chỉnh số lượng, giá, giảm giá

### 5.1. Sửa số lượng

- Nhấn nút **+** / **−** bên dòng SP
- Hoặc click vào số → gõ số mới → Enter

### 5.2. Sửa đơn giá

Click vào ô đơn giá → gõ giá mới → Enter.

🔒 **Quyền**: Chỉ cashier có quyền **sửa giá** mới thấy ô này editable. Nếu không có quyền, ô đơn giá là read-only.

⚠️ **Chú ý**: Sửa giá thấp hơn giá vốn → hệ thống hiện **warning** nhưng cho phép override nếu quyền cho phép.

### 5.3. Giảm giá dòng

Click icon **%** bên dòng SP → nhập:

- **%** (ví dụ 10 = giảm 10%)
- Hoặc **số tiền cố định** (ví dụ 20.000đ)

Nhấn **Enter** để áp dụng.

---

## 6. Chọn khách hàng

### 6.1. Tìm khách cũ

1. Click ô **Khách hàng** ở bên phải giỏ.
2. Gõ **SĐT** (10 số) hoặc **tên** → gợi ý hiện ra.
3. Click chọn → khách gắn vào đơn.

Hệ thống hiển thị: tên, điểm tích luỹ, hạng thẻ, công nợ (nếu có).

⚠️ **Chú ý**: Nếu khách có **công nợ quá hạn**, cảnh báo đỏ hiện ra — bạn cần đòi nợ trước khi bán tiếp hoặc xin duyệt của Quản lý.

### 6.2. Tạo khách mới nhanh

Nếu không tìm thấy, nhấn **[+ Tạo khách nhanh]** → form inline hiện:

- **SĐT** (bắt buộc)
- **Họ tên** (bắt buộc)
- **Email** (tuỳ chọn)

Nhấn **[Lưu]** → khách được tạo + tự gắn vào đơn.

💡 **Mẹo**: Đơn không có khách vẫn tạo được (khách vãng lai). Nhưng nếu khách muốn tích điểm / mua chịu → **bắt buộc** chọn khách.

---

## 7. Áp mã khuyến mãi / voucher

### Bước 1: Mở modal Khuyến mãi

Nhấn nút **[Áp KM]** (thường gần khu vực tổng tiền).

### Bước 2: Chọn cách áp

**Cách 1 — Nhập mã voucher thủ công**:
Gõ mã vào ô → nhấn **Áp dụng**.

**Cách 2 — Chọn từ danh sách KM đang chạy**:
Chọn 1 trong các chương trình hiển thị (buy 1 get 1, mua 3 giảm 10%, giảm theo hạng thẻ...).

### Bước 3: Xác nhận

Hệ thống validate điều kiện → hiện **dòng "Giảm giá"** trong giỏ và tổng tiền mới.

⚠️ **Chú ý**:
- Voucher hết hạn / hết lượt → reject kèm lý do.
- Có thể stack nhiều khuyến mãi nếu cấu hình cho phép.

---

## 8. Thanh toán

### Bước 1: Nhấn nút Thanh toán

Nút **[Thanh toán]** màu xanh lá ở góc phải dưới, hoặc phím tắt **F9**.

### Bước 2: Chọn phương thức

Modal thanh toán mở ra với 5 phương thức:

| Phương thức | Ghi chú |
|---|---|
| **Tiền mặt** | Nhập số tiền khách đưa → hệ thống tính tiền thối |
| **Thẻ** | Cà thẻ máy POS ngân hàng → nhập mã giao dịch |
| **QR code** (VietQR) | Hệ thống sinh QR động → khách quét bằng app ngân hàng |
| **Chuyển khoản** | Khách chuyển đến STK cửa hàng — chờ xác nhận thủ công |
| **Công nợ** | Ghi nợ vào tài khoản khách (bắt buộc có customerId) |

### Bước 3: Split thanh toán (nếu cần)

Khách trả 500k tiền mặt + 300k thẻ? Nhấn **[+ Thêm phương thức]** → chia nhỏ.

Hệ thống đảm bảo **tổng các phương thức = tổng tiền đơn**.

### Bước 4: Xác nhận

Nhấn **[Xác nhận thanh toán]**.

- Với **QR**: chờ webhook bank → khi có tiếng "ting" hoặc status chuyển **Đã thanh toán** → OK.
- Với **chuyển khoản**: cashier kiểm tra app ngân hàng → bấm **Xác nhận đã nhận**.

⚠️ **Chú ý**: QR có **timeout 5 phút**. Nếu hết giờ → tạo QR mới.

---

## 9. Xác nhận + in hoá đơn

Sau khi thanh toán thành công:

1. Đơn chuyển trạng thái **PAID** — tồn kho tự động trừ.
2. Két tiền tự mở (nếu tiền mặt).
3. **Máy in nhiệt** in bill tự động.
4. Nếu khách có email/SĐT → hệ thống gửi bill PDF qua email/SMS.

💡 **Mẹo**: Nếu cần **in lại**, vào **Bán hàng → Đơn hàng** → tìm đơn → **In lại bill** — không tạo đơn mới.

---

## 10. Phát hành HDĐT VAT

Nếu khách **yêu cầu hoá đơn VAT điện tử**:

### Bước 1: Mở modal HDĐT

Sau thanh toán, trong màn hình chi tiết đơn, nhấn **[Phát hành HDĐT]**.

### Bước 2: Nhập thông tin người mua

- **Tên công ty** (bắt buộc)
- **Mã số thuế** (MST) — bắt buộc
- **Địa chỉ** (bắt buộc)
- **Email nhận hoá đơn** (bắt buộc)

### Bước 3: Phát hành

Nhấn **[Phát hành]**. Hệ thống gọi provider HDĐT (VNPT, M-Invoice, VietInvoice...) → nhận về:

- Mã tra cứu
- Link xem
- HDĐT gửi thẳng vào email khách

⚠️ **Chú ý**: HDĐT đã phát hành **không sửa được**. Nếu sai → phải **huỷ + phát hành lại** (cần quyền Accountant).

🔒 **Quyền**: Cần tenant đã cấu hình provider HDĐT (xem Part 12 — Cài đặt).

---

## 11. Tạm treo đơn (Park)

Khách lưỡng lự hoặc quên ví? **Tạm treo đơn** để phục vụ khách khác trước.

### Các bước

1. Trong giỏ hàng hiện tại, nhấn **[Tạm treo]** (hoặc `Ctrl+P`).
2. Đơn chuyển sang **sidebar đơn treo** bên trái.
3. Tạo đơn mới cho khách tiếp theo.

### Resume đơn treo

Click vào đơn treo ở sidebar → giỏ hàng khôi phục nguyên vẹn → tiếp tục thanh toán.

⚠️ **Chú ý**: Đơn treo **tự động huỷ sau 24h** nếu không resume. Không trừ tồn kho khi park.

---

## 12. Phím tắt

Học thuộc các phím tắt sau sẽ giúp bạn bán hàng nhanh gấp đôi:

| Phím | Chức năng |
|---|---|
| **F2** | Focus ô tìm sản phẩm |
| **F4** | Chọn khách hàng |
| **F9** | Mở modal thanh toán |
| **Enter** | Xác nhận/Tiếp tục |
| **Esc** | Đóng modal / huỷ thao tác |
| **Ctrl + P** | Tạm treo đơn |
| **Ctrl + N** | Tạo đơn mới |
| **Ctrl + K** | Tìm kiếm nhanh toàn cục |

💡 **Mẹo**: In bảng phím tắt dán lên POS cho nhân viên mới.

---

## 13. Kiểm kê + đóng ca

Cuối ngày (hoặc hết ca), bạn phải **kiểm kê tiền** và **đóng ca**.

### 13.1. Mở trang kiểm kê

Sidebar → **Bán hàng → Kiểm kê ca** (`/shift_inventory`).

### 13.2. Xem số liệu hệ thống

Hệ thống hiển thị:

- **Tiền mặt dự kiến** = tiền đầu ca + tổng thu tiền mặt − tổng chi
- **Thẻ**: tổng giao dịch thẻ
- **QR**: tổng QR đã nhận
- **Chuyển khoản**: tổng đã xác nhận

### 13.3. Đếm tiền mặt thực tế

Đếm tiền trong két — nhập vào form theo mệnh giá:

- Tờ 500k × ? tờ
- Tờ 200k × ? tờ
- ...

Hệ thống tự tính **tổng thực tế** và **chênh lệch**.

⚠️ **Chú ý**: Chênh lệch **> 5%** → bắt buộc nhập **lý do chênh lệch**.

### 13.4. Đóng ca

Nhấn **[Đóng ca]** → confirm.

- Ca chuyển trạng thái **CLOSED**.
- Báo cáo ca PDF được gửi email cho Store Manager.
- Không thể tạo thêm đơn cho ca này.

💡 **Mẹo**: Nếu cashier quên đóng ca, **hệ thống tự đóng sau 24h** nhưng số liệu có thể không chính xác — nên đóng thủ công.

> 🖼️ *Ảnh minh hoạ: Form kiểm kê ca — chụp sau*

---

## FAQ

**1. Tôi chưa mở ca mà bấm POS — tại sao báo lỗi?**
Quy tắc: mỗi đơn bắt buộc thuộc 1 ca OPEN. Hãy vào Quản lý ca → Mở ca trước.

**2. Khách trả bằng QR nhưng tôi không thấy tiền về?**
(a) Kiểm tra mạng; (b) Đợi tối đa 30 giây cho webhook; (c) Nếu vẫn không, gọi bank xác minh giao dịch.

**3. Máy in nhiệt không in sau khi thanh toán?**
(a) Check giấy; (b) Check nguồn; (c) Vào chi tiết đơn → nhấn **In lại**. Nếu vẫn không, xuất PDF rồi in qua máy in khác.

**4. Tôi đang bán mà nhấn nhầm Đăng xuất — giỏ hàng có mất không?**
Không. Giỏ hàng được cache ở localStorage. Login lại → giỏ hàng khôi phục.

**5. Khách muốn trả hàng từ 3 ngày trước — làm thế nào?**
Xem [Part 04 — Đơn hàng & Hoá đơn](part-04-don-hang-hoa-don.md) mục Trả hàng.

**6. Tôi có thể bán SP không có trong hệ thống không?**
Không. Mọi SP phải được tạo trong Kho trước (Part 05). Có thể nhờ Quản lý tạo nhanh.

**7. Có thể bán khi mất mạng không?**
Chế độ **offline mode** đang trong roadmap. Hiện tại cần mạng ổn định.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "Chưa mở ca" | Chưa có shift OPEN | Mở ca trước |
| "SP hết hàng" | Tồn = 0 | Kiểm kê lại, hoặc nhập thêm hàng |
| "QR hết hạn" | Quá 5 phút | Tạo QR mới |
| "Voucher không áp dụng" | Hết hạn / hết lượt / không đủ điều kiện | Kiểm tra điều kiện voucher |
| "HDĐT provider timeout" | Mạng/provider lỗi | Retry; gọi hotline VNPT/M-Invoice nếu persistent |
| "Chênh lệch kiểm kê > 5%" | Thiếu/thừa tiền | Đếm lại; note lý do |

---

*Hết Part 02. Xem tiếp [Part 03 — Khách hàng](part-03-khach-hang.md).*
