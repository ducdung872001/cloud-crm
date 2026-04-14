# Part 06 — Tài chính & Thanh toán

## Phạm vi

Phân hệ **Tài chính & Thanh toán** quản lý dòng tiền của tenant: thu chi, quỹ, khoản mục, công nợ, đối soát thanh toán online. Đây KHÔNG phải hệ thống kế toán đầy đủ (xem Part 00 — Out-of-scope) — chỉ bao quát ở mức "sổ quỹ + công nợ" cho doanh nghiệp nhỏ.

**Actors chính:** Accountant (chính), Branch Manager, Tenant Admin (cấu hình quỹ).

### Sơ đồ Use Case

![Use Case Diagram — Phân hệ Tài chính & Thanh toán](./diagrams/06-usecase-finance.png)

---

## A. Tổng quan tài chính

### UR-FIN-01 — Dashboard tài chính

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-01 |
| **Tên** | Dashboard chỉ số dòng tiền |
| **Actor** | Branch Manager, Accountant |
| **Mô tả** | Trang tổng quan hiển thị: tổng thu / tổng chi / chênh lệch (lãi-lỗ), biểu đồ dòng tiền theo ngày, top khoản thu/chi, số dư các quỹ. |
| **Tiêu chí chấp nhận** | 1. Filter kỳ: Hôm nay / Tuần / Tháng / Năm / Tùy chọn.<br>2. Số liệu real-time hoặc near-real-time.<br>3. Biểu đồ xu hướng 30 ngày gần nhất.<br>4. Pie chart top khoản. |
| **Mức ưu tiên** | **M** |

---

## B. Sổ thu chi (Cashbook)

### UR-FIN-02 — Sổ thu chi tổng hợp

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-02 |
| **Tên** | Bảng giao dịch thu chi tổng hợp |
| **Actor** | Accountant |
| **Mô tả** | Bảng liệt kê mọi giao dịch thu/chi (cả tự động từ POS lẫn thủ công), filter và search được. |
| **Tiêu chí chấp nhận** | 1. Cột: Mã phiếu, Ngày giờ, Loại (Thu/Chi), Khoản mục, Đối tượng, Số tiền, Quỹ, Mô tả, Trạng thái.<br>2. Filter theo kỳ + loại + khoản mục + quỹ + nhân viên.<br>3. Mã phiếu tự sinh dạng `PT0000001` (thu) / `PC0000001` (chi).<br>4. Tổng số tiền thu/chi hiển thị ở cuối bảng theo bộ lọc hiện tại. |
| **Mức ưu tiên** | **M** |

### UR-FIN-03 — Tạo phiếu thu/chi thủ công

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-03 |
| **Tên** | Ghi nhận giao dịch tài chính ngoài POS |
| **Actor** | Accountant |
| **Mô tả** | Form tạo phiếu thu hoặc phiếu chi cho các giao dịch không đến từ bán hàng (lương, điện nước, thu cọc khách, mua NVL ngoài...). |
| **Đầu vào** | • **Loại** (M, Thu/Chi)<br>• **Ngày giao dịch** (M, mặc định hôm nay)<br>• **Khoản mục** (M, từ danh mục Part 06.D)<br>• **Quỹ** (M, từ danh sách quỹ)<br>• **Đối tượng** (S, Khách/NCC/Nhân viên/Khác)<br>• **Số tiền** (M, > 0, tối đa 14 chữ số)<br>• **Mô tả/lý do** (S, ≤ 500 ký tự)<br>• **Chứng từ đính kèm** (C, file ≤ 10MB) |
| **Tiêu chí chấp nhận** | 1. Sau khi lưu, số dư quỹ cập nhật ngay.<br>2. Phiếu hiển thị trong sổ thu chi.<br>3. Audit trail: ai tạo, lúc nào.<br>4. Cho phép upload nhiều chứng từ. |
| **Mức ưu tiên** | **M** |

### UR-FIN-04 — Hủy phiếu

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-04 |
| **Tên** | Hủy phiếu đã tạo (trong ngày) |
| **Actor** | Accountant, Branch Manager |
| **Mô tả** | Cho phép hủy phiếu thu/chi nếu phát hiện sai, nhưng chỉ trong ngày tạo phiếu. |
| **Tiêu chí chấp nhận** | 1. Hủy phiếu sẽ đảo số dư quỹ.<br>2. Phiếu vẫn hiện trong sổ với badge ❌ Đã hủy + lý do hủy bắt buộc.<br>3. Không cho hủy phiếu khác ngày — phải dùng phiếu điều chỉnh ngược lại.<br>4. Yêu cầu quyền `finance.cancel`. |
| **Mức ưu tiên** | **S** |

---

## C. Quản lý quỹ

### UR-FIN-05 — Danh sách quỹ với số dư

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-05 |
| **Tên** | Quản lý nhiều quỹ tài chính |
| **Actor** | Accountant, Tenant Admin |
| **Mô tả** | Tenant có thể có nhiều quỹ: tiền mặt tại quầy, ngân hàng A, ngân hàng B, MoMo, ZaloPay, quỹ dự phòng. Mỗi quỹ có loại + số dư + biến động trong ngày. |
| **Tiêu chí chấp nhận** | 1. Bảng cột: Tên quỹ, Loại (Cash/Bank/E-wallet), Số dư hiện tại, Biến động hôm nay, Trạng thái.<br>2. Số dư tự tính từ tổng thu - tổng chi của quỹ.<br>3. Bấm vào quỹ → xem lịch sử giao dịch của riêng quỹ đó. |
| **Mức ưu tiên** | **M** |

### UR-FIN-06 — Thêm quỹ mới

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-06 |
| **Tên** | Tạo một quỹ tài chính |
| **Actor** | Tenant Admin |
| **Mô tả** | Form thêm quỹ với các trường tùy theo loại. |
| **Đầu vào** | • **Tên quỹ** (M, ≤ 100)<br>• **Loại** (M, Cash/Bank/E-wallet)<br>• **Số dư khởi tạo** (M, ≥ 0) — sinh phiếu thu "Số dư ban đầu" tự động<br>• **Số tài khoản** (S, nếu Bank)<br>• **Tên ngân hàng** (S, select)<br>• **Chủ tài khoản** (S)<br>• **Mã ví** (S, nếu E-wallet) |
| **Tiêu chí chấp nhận** | 1. Tạo xong quỹ xuất hiện trong danh sách dropdown khi tạo phiếu thu/chi.<br>2. Số dư khởi tạo có thể là 0 (tạo quỹ rỗng). |
| **Mức ưu tiên** | **M** |

### UR-FIN-07 — Chuyển tiền giữa các quỹ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-07 |
| **Tên** | Internal transfer giữa quỹ |
| **Actor** | Accountant |
| **Mô tả** | Cho phép chuyển tiền giữa các quỹ (vd rút tiền mặt từ ATM về két, hoặc chuyển tiền mặt vào tài khoản ngân hàng). |
| **Tiêu chí chấp nhận** | 1. Modal chọn: quỹ gửi, quỹ nhận, số tiền, ghi chú.<br>2. Hệ thống tạo đồng thời 1 phiếu chi (quỹ gửi) + 1 phiếu thu (quỹ nhận) cùng mã liên kết.<br>3. Số dư cả 2 quỹ cập nhật đồng thời. |
| **Mức ưu tiên** | **S** |

---

## D. Quản lý khoản mục thu/chi

### UR-FIN-08 — CRUD khoản mục

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-08 |
| **Tên** | Danh mục phân loại các giao dịch tài chính |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant cấu hình các khoản mục thu (vd Doanh thu bán hàng, Doanh thu dịch vụ, Cọc khách, Hoa hồng, Khác) và khoản mục chi (Lương, Điện nước, Mua NVL, Thuê mặt bằng, Marketing, Thuế, Khác). |
| **Đầu vào** | • **Tên khoản mục** (M, ≤ 100)<br>• **Loại** (M, Thu/Chi)<br>• **Mã** (S, auto gen)<br>• **Khoản mục cha** (S, để tạo cây phân cấp)<br>• **Mô tả** (S) |
| **Tiêu chí chấp nhận** | 1. CRUD đầy đủ.<br>2. Hỗ trợ phân cấp cha-con (tối đa 3 cấp).<br>3. Không cho xóa khoản mục đã được dùng. |
| **Mức ưu tiên** | **M** |

---

## E. Quản lý công nợ

### UR-FIN-09 — Công nợ phải thu (khách)

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-09 |
| **Tên** | Quản lý các khoản khách đang nợ |
| **Actor** | Accountant, Receptionist |
| **Mô tả** | Bảng liệt kê khách đang nợ tiền cửa hàng, hỗ trợ thu nợ một phần hoặc toàn bộ. |
| **Tiêu chí chấp nhận** | 1. Cột: Tên khách, SĐT, Tổng nợ hiện tại, Số ngày nợ, Cờ "Quá hạn".<br>2. Bấm vào khách → xem chi tiết các đơn nợ + lịch sử thanh toán từng phần.<br>3. Nút **Thu nợ** → modal chọn đơn cần thu + nhập số tiền + chọn quỹ nhận → xác nhận.<br>4. Sau thu: tự sinh phiếu thu trong sổ thu chi (UR-FIN-02), công nợ giảm tương ứng. |
| **Mức ưu tiên** | **M** |

### UR-FIN-10 — Công nợ phải trả (NCC)

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-10 |
| **Tên** | Quản lý nợ với nhà cung cấp |
| **Actor** | Accountant |
| **Mô tả** | Tab thứ 2 hiển thị các NCC mà cửa hàng đang nợ tiền (từ phiếu nhập kho chưa trả đủ — Part 10). Có nút trả nợ. |
| **Tiêu chí chấp nhận** | 1. Cột tương tự công nợ phải thu nhưng đối tượng là NCC.<br>2. Trả nợ: chọn đơn nhập + nhập số tiền + chọn quỹ chi → xác nhận → sinh phiếu chi tự động.<br>3. Có cảnh báo khi vượt hạn mức tín dụng đã cấu hình với NCC. |
| **Mức ưu tiên** | **M** |

---

## F. Đối soát thanh toán online

### UR-FIN-11 — Đối soát với cổng thanh toán

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FIN-11 |
| **Tên** | Đối soát giao dịch online với sao kê từ kênh |
| **Actor** | Accountant |
| **Mô tả** | Khi tenant nhận thanh toán qua VNPay/MoMo/ZaloPay/Bank gateway, có độ trễ về tiền (1-3 ngày). Module này so khớp giao dịch trong CRM với sao kê thực tế từ kênh. |
| **Tiêu chí chấp nhận** | 1. Chọn kênh + khoảng thời gian.<br>2. Upload file sao kê CSV/Excel hoặc auto fetch qua API (nếu có).<br>3. Bảng so khớp với 4 nhóm: ✅ Khớp / ⚠️ Lệch / ❓ Thiếu CRM / ❓ Thiếu sao kê.<br>4. Cho phép xử lý từng dòng lệch (tạo phiếu thu bù, đánh dấu pending...).<br>5. Sau khi xác nhận → kỳ đó được "chốt" — không cho sửa nữa.<br>6. CN-06: phiếu đối soát đã chốt không sửa được. |
| **Mức ưu tiên** | **S** |

---

## Tóm tắt yêu cầu Part 06

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-FIN-01 | Dashboard tài chính | M |
| UR-FIN-02 | Sổ thu chi | M |
| UR-FIN-03 | Tạo phiếu thu/chi thủ công | M |
| UR-FIN-04 | Hủy phiếu | S |
| UR-FIN-05 | Danh sách quỹ | M |
| UR-FIN-06 | Thêm quỹ mới | M |
| UR-FIN-07 | Chuyển tiền giữa quỹ | S |
| UR-FIN-08 | CRUD khoản mục | M |
| UR-FIN-09 | Công nợ phải thu | M |
| UR-FIN-10 | Công nợ phải trả | M |
| UR-FIN-11 | Đối soát thanh toán | S |

**Tổng:** 11 yêu cầu — 8 Must, 3 Should.

---

*Hết Part 06.*
