# Part 08 — Tài chính & Thanh toán

> **Dành cho**: Kế toán (Accountant), Quản lý cửa hàng, Chủ cửa hàng
> **Mức độ**: Trung cấp
> **Tham chiếu URD**: [Part 08 — Tài chính](../urd/part-08-tai-chinh.md) (UR-FIN-01 → UR-FIN-20)

Part này hướng dẫn toàn bộ thao tác **ghi nhận dòng tiền**, **quản lý quỹ**, **công nợ** và **đối soát thanh toán** trên Reborn Retail CRM. Nếu bạn là kế toán chính của cửa hàng — đây là tài liệu bạn cần đọc kỹ nhất.

## Mục lục
- [1. Dashboard tài chính](#1-dashboard-tài-chính)
- [2. Sổ thu chi — tạo phiếu thu](#2-sổ-thu-chi--tạo-phiếu-thu)
- [3. Sổ thu chi — tạo phiếu chi](#3-sổ-thu-chi--tạo-phiếu-chi)
- [4. Danh mục khoản mục](#4-danh-mục-khoản-mục)
- [5. Quản lý quỹ & chuyển quỹ](#5-quản-lý-quỹ--chuyển-quỹ)
- [6. Công nợ khách hàng (phải thu)](#6-công-nợ-khách-hàng-phải-thu)
- [7. Công nợ NCC (phải trả)](#7-công-nợ-ncc-phải-trả)
- [8. Đối soát sao kê ngân hàng](#8-đối-soát-sao-kê-ngân-hàng)
- [9. Cấu hình phương thức thanh toán](#9-cấu-hình-phương-thức-thanh-toán)
- [10. Báo cáo tài chính cơ bản](#10-báo-cáo-tài-chính-cơ-bản)
- [FAQ](#faq)

---

## 1. Dashboard tài chính

Sidebar → **Tài chính → Dashboard** (`/finance_dashboard`).

Màn hình gồm **6 KPI**:

| KPI | Ý nghĩa |
|---|---|
| **Tiền mặt tồn quỹ** | Tổng tiền mặt trong tất cả quỹ hiện tại |
| **Tổng thu hôm nay** | Cộng dồn tất cả phiếu thu trong ngày |
| **Tổng chi hôm nay** | Cộng dồn tất cả phiếu chi trong ngày |
| **Công nợ phải thu** | Tổng nợ khách hàng chưa thu |
| **Công nợ phải trả** | Tổng nợ NCC chưa trả |
| **Dòng tiền ròng 30 ngày** | Thu − Chi trong 30 ngày gần nhất |

Bên dưới là **biểu đồ dòng tiền 30 ngày** và **top 5 khoản mục chi lớn nhất**.

💡 **Mẹo**: Click vào tile để xem trang chi tiết. Dashboard refresh mỗi 5 phút.

> 🖼️ *Ảnh minh hoạ: Dashboard tài chính — chụp sau*

---

## 2. Sổ thu chi — tạo phiếu thu

Phiếu thu ghi nhận **tiền vào** — có thể từ đơn hàng, thu nợ khách, góp vốn, thu khác.

### Bước 1: Mở trang Sổ thu chi

Sidebar → **Tài chính → Sổ thu chi** (`/cash_book`).

### Bước 2: Tạo phiếu mới

Nhấn **[+ Tạo phiếu thu]** (nút xanh lá).

### Bước 3: Điền form

- **Ngày chứng từ**: mặc định hôm nay
- **Quỹ nhận tiền**: chọn từ dropdown (Quỹ tiền mặt / TK Vietcombank / ...)
- **Khoản mục thu**: chọn danh mục (xem mục 4)
- **Đối tượng** (tuỳ chọn): Khách hàng / NCC / Nhân viên
- **Số tiền**: VND
- **Lý do**: mô tả ngắn
- **Chứng từ kèm**: upload ảnh biên lai (tuỳ chọn)

### Bước 4: Lưu

Nhấn **[Lưu]** — phiếu chuyển trạng thái **Đã ghi nhận**. Quỹ tự động tăng.

⚠️ **Chú ý**: Phiếu đã lưu **không sửa được** — chỉ **huỷ + tạo lại**. Luôn kiểm tra kỹ trước khi bấm Lưu.

🔒 **Quyền**: `finance.receipt.create`. Phiếu > 50 triệu cần **Accountant Manager** duyệt.

> 🖼️ *Ảnh minh hoạ: Form phiếu thu — chụp sau*

---

## 3. Sổ thu chi — tạo phiếu chi

Tương tự phiếu thu nhưng cho **tiền ra** — chi lương, chi mua nguyên liệu, chi thuê mặt bằng...

### Các bước

1. Sidebar → **Tài chính → Sổ thu chi** → tab **Phiếu chi**.
2. Nhấn **[+ Tạo phiếu chi]**.
3. Điền: **Quỹ xuất tiền**, **Khoản mục chi**, **Đối tượng**, **Số tiền**, **Lý do**.
4. Upload chứng từ: hoá đơn đỏ / biên lai / hợp đồng.
5. Nhấn **[Lưu]**.

⚠️ **Chú ý**: Nếu quỹ **không đủ tiền** → hệ thống báo lỗi. Cần nạp thêm trước khi chi.

💡 **Mẹo**: Với chi lặp lại hàng tháng (thuê mặt bằng, internet), dùng **Mẫu phiếu chi** để tạo nhanh — xem Part 13.

---

## 4. Danh mục khoản mục

Khoản mục (category) giúp **phân loại thu/chi** để lên báo cáo P&L chuẩn kế toán.

### Xem & tạo

Sidebar → **Tài chính → Khoản mục** (`/finance_category`).

Màn hình chia làm **2 nhóm**:

- **Khoản mục thu**: Doanh thu bán hàng, Thu nợ, Thu khác, Góp vốn...
- **Khoản mục chi**: Chi mua hàng, Chi lương, Chi thuê, Chi marketing, Chi điện nước...

### Tạo mới

Nhấn **[+ Thêm khoản mục]**:

- **Tên**
- **Loại**: Thu / Chi
- **Mã tham chiếu** (tuỳ chọn — mapping với tài khoản kế toán)
- **Trạng thái**: Active / Inactive

💡 **Mẹo**: Thiết lập khoản mục **một lần** lúc setup ban đầu. Sau đó chỉ dùng, ít khi phải thêm.

---

## 5. Quản lý quỹ & chuyển quỹ

Cửa hàng thường có **nhiều quỹ**: tiền mặt tại quầy, tiền mặt tại két chính, TK Vietcombank, TK BIDV, ví MoMo...

### 5.1. Xem danh sách quỹ

Sidebar → **Tài chính → Quỹ** (`/finance_account`).

Mỗi quỹ hiển thị: Tên, Loại (Cash/Bank/E-wallet), Số dư hiện tại, Chi nhánh.

### 5.2. Tạo quỹ mới

Nhấn **[+ Tạo quỹ]**:

- **Tên quỹ** (ví dụ "TK Vietcombank — Chi nhánh Hà Nội")
- **Loại**: Tiền mặt / Ngân hàng / Ví điện tử
- **Số tài khoản** (nếu ngân hàng)
- **Số dư ban đầu**
- **Cơ sở sở hữu**

### 5.3. Chuyển tiền giữa các quỹ

Khi cần nạp tiền két vào ngân hàng, hoặc rút tiền bank về quỹ mặt:

1. Nhấn **[Chuyển quỹ]** trong trang danh sách quỹ.
2. Điền:
   - **Từ quỹ** → **Đến quỹ**
   - **Số tiền**
   - **Ngày chuyển**
   - **Phí chuyển** (nếu có)
   - **Lý do**
3. Nhấn **[Xác nhận chuyển]**.

Hệ thống tự sinh **2 bút toán**: 1 phiếu chi ở quỹ nguồn, 1 phiếu thu ở quỹ đích.

⚠️ **Chú ý**: Không thể huỷ lệnh chuyển đã xác nhận — phải tạo lệnh chuyển ngược.

> 🖼️ *Ảnh minh hoạ: Form chuyển quỹ — chụp sau*

---

## 6. Công nợ khách hàng (phải thu)

### 6.1. Xem tổng quan

Sidebar → **Tài chính → Công nợ phải thu** (`/receivable`).

Hiển thị danh sách khách có dư nợ với:

- Tên, SĐT
- Tổng nợ
- Tuổi nợ (< 30 ngày, 30-60, > 60, quá hạn)
- Đơn hàng gốc

### 6.2. Thu nợ

1. Click vào khách → trang chi tiết công nợ.
2. Nhấn **[Thu nợ]**.
3. Chọn **đơn hàng cần thu** (có thể tích nhiều đơn).
4. Chọn **quỹ nhận** + **phương thức**.
5. Nhấn **[Xác nhận thu]** → hệ thống tạo phiếu thu tự động + giảm dư nợ khách.

💡 **Mẹo**: Có thể **thu một phần** — ví dụ đơn nợ 5 triệu, khách trả 2 triệu.

### 6.3. Nhắc nợ

Tại danh sách, chọn khách → nhấn **[Gửi nhắc nợ]** → hệ thống gửi SMS/Zalo với template mặc định.

⚠️ **Chú ý**: Công nợ quá hạn **> 90 ngày** → tự động block khách khỏi mua chịu tiếp (cấu hình được).

---

## 7. Công nợ NCC (phải trả)

Tương tự phải thu nhưng cho **NCC**.

Sidebar → **Tài chính → Công nợ phải trả** (`/payable`).

### Trả nợ NCC

1. Click NCC → chi tiết công nợ.
2. Nhấn **[Trả nợ]**.
3. Chọn PO cần trả, số tiền, quỹ xuất.
4. **[Xác nhận]** → hệ thống tạo phiếu chi tự động.

💡 **Mẹo**: Xem **báo cáo dự kiến phải trả 7 ngày tới** để lên kế hoạch dòng tiền.

---

## 8. Đối soát sao kê ngân hàng

Cuối ngày/tuần, bạn cần **match** giao dịch hệ thống với sao kê ngân hàng để phát hiện lệch.

### Bước 1: Download sao kê từ bank

Login internet banking → export CSV / MT940 / Excel → lưu file.

### Bước 2: Import vào CRM

Sidebar → **Tài chính → Đối soát** (`/bank_reconciliation`) → nhấn **[Import sao kê]**.

Chọn quỹ (TK ngân hàng) → upload file → hệ thống parse các dòng giao dịch.

### Bước 3: Match

Hệ thống **auto-match** các giao dịch trùng (theo số tiền + ngày + mã tham chiếu).

Các dòng **chưa match** hiển thị riêng — bạn cần:

- **Match thủ công** với phiếu thu/chi có sẵn
- Hoặc **tạo phiếu mới** từ dòng sao kê

### Bước 4: Confirm

Khi tất cả dòng đã match → nhấn **[Hoàn tất đối soát]**.

⚠️ **Chú ý**: Đối soát cần làm **đều đặn** (tuần/tháng). Để lâu sẽ khó lần ra lệch.

> 🖼️ *Ảnh minh hoạ: Màn hình đối soát với dòng auto-match — chụp sau*

---

## 9. Cấu hình phương thức thanh toán

Sidebar → **Cài đặt → Phương thức thanh toán** (`/payment_method`).

Hệ thống hỗ trợ:

| Phương thức | Ghi chú |
|---|---|
| **Tiền mặt** | Mặc định, bật sẵn |
| **Thẻ (POS bank)** | Nhập mã giao dịch thủ công |
| **VietQR** | Sinh QR động realtime |
| **MoMo** | Cần app partner key |
| **ZaloPay** | Cần merchant ID |
| **VNPay** | Cần TMN code + hash secret |
| **Chuyển khoản** | Xác nhận thủ công |
| **Công nợ** | Bắt buộc có customer |

### Bật 1 phương thức

1. Click vào phương thức → tab **Cấu hình**.
2. Nhập credentials (API key, merchant ID...).
3. Chọn **Quỹ mặc định nhận tiền**.
4. Toggle **Bật**.
5. Nhấn **[Lưu]**.

### Test kết nối

Nhấn **[Test ping]** → hệ thống gọi thử API của provider → báo OK/fail.

🔒 **Quyền**: `settings.payment.configure` — chỉ Tenant Admin.

---

## 10. Báo cáo tài chính cơ bản

Sidebar → **Báo cáo → Tài chính** (`/report_finance`).

4 báo cáo chính:

### 10.1. Báo cáo thu chi theo khoản mục

Chọn khoảng thời gian → hiện bảng pivot: khoản mục × tháng, kèm tổng thu/chi/ròng.

### 10.2. Báo cáo dòng tiền

Chart đường: Số dư quỹ theo ngày.

### 10.3. Báo cáo công nợ

Aging report: < 30 / 30-60 / 60-90 / > 90 ngày.

### 10.4. Báo cáo P&L đơn giản

Doanh thu − Giá vốn − Chi phí = Lợi nhuận.

Tất cả đều có nút **Export Excel** / **Export PDF** ở góc phải.

💡 **Mẹo**: Schedule gửi báo cáo tự động — xem [Part 11](part-11-bao-cao.md).

---

## FAQ

**1. Tôi tạo nhầm phiếu thu — làm sao xoá?**
Phiếu đã lưu không xoá được, chỉ **huỷ** (soft delete). Vào chi tiết phiếu → nhấn **Huỷ phiếu** → nhập lý do. Audit log vẫn giữ.

**2. Khách trả tiền qua QR nhưng tôi thấy 2 bút toán — sao vậy?**
Hệ thống ghi nhận: 1 phiếu thu ở quỹ ngân hàng + cập nhật status đơn hàng. Không phải double-count.

**3. Tại sao số dư quỹ không khớp với sổ sách ngân hàng?**
Thường do: (a) Phí ngân hàng chưa ghi nhận; (b) Giao dịch pending chưa về; (c) Chưa đối soát. Dùng chức năng Đối soát.

**4. Có thể import phiếu thu/chi từ Excel không?**
Có — trang Sổ thu chi có nút **[Import Excel]** với template mẫu. Tối đa 500 dòng/lần.

**5. Tôi muốn chặn bán chịu khi khách nợ quá X ngày?**
Vào **Cài đặt → Công nợ** → đặt ngưỡng block. Khi quá ngưỡng, POS sẽ disable phương thức Công nợ cho khách đó.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "Quỹ không đủ số dư" | Chi vượt tồn | Nạp thêm hoặc đổi quỹ |
| "Phiếu đã khoá" | Đã đóng kỳ kế toán | Liên hệ Accountant Manager mở lại |
| "Import sao kê: format lỗi" | File sai chuẩn | Dùng template đúng, hoặc export CSV UTF-8 |
| "Provider VNPay timeout" | Mạng/provider lỗi | Retry; check dashboard VNPay |
| "Công nợ quá hạn — bị block" | Cấu hình ngưỡng | Thu bớt nợ hoặc override bởi Manager |

---

*Hết Part 08. Xem tiếp [Part 09 — Marketing & Khuyến mãi](part-09-marketing-khuyen-mai.md).*
