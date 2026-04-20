# Part 06 — Tài chính & Thanh toán

*Phiên bản: Cửa hàng & Spa — Tenant "Viettel Store"*

**Tài chính & Thanh toán** là phân hệ theo dõi **dòng tiền** của cơ sở bạn: tiền đã thu (doanh thu), tiền đã chi (chi phí), tiền còn trong quỹ, công nợ với khách và nhà cung cấp, đối soát với các kênh thanh toán online.

Sidebar có **6 mục con** — mỗi mục là một góc nhìn khác của cùng một bức tranh:

| # | Mục | URL | Dùng để |
|---|-----|-----|---------|
| 1 | **Tổng quan tài chính** | `/crm/finance_management/dashboard` | Dashboard các chỉ số dòng tiền |
| 2 | **Sổ thu chi** | `/crm/finance_management/cashbook` | Ghi nhận từng giao dịch thu/chi |
| 3 | **Quản lý quỹ** | `/crm/finance_management/fund_management` | Các quỹ (tiền mặt, ngân hàng, ví điện tử) |
| 4 | **Quản lý khoản mục** | `/crm/finance_management/category_management` | Danh mục loại thu / chi |
| 5 | **Quản lý công nợ** | `/crm/finance_management/debt_management` | Công nợ khách hàng + nhà cung cấp |
| 6 | **Đối soát thanh toán** | `/crm/payment_control` | Đối soát với kênh thanh toán online |

---

## A. Tổng quan tài chính

**URL:** `/crm/finance_management/dashboard`

![Tổng quan tài chính](./images/part-06-tai-chinh/A01-finance-dashboard.png)

Màn hình hiển thị các chỉ số tổng hợp:

- **Tổng thu** (theo kỳ) — tổng tiền đã thu từ tất cả nguồn.
- **Tổng chi** — tổng tiền đã chi.
- **Chênh lệch thu – chi** — dương = lãi, âm = lỗ.
- **Dòng tiền theo ngày** — biểu đồ cột 30 ngày gần nhất.
- **Top khoản thu** — biểu đồ pie các khoản thu lớn nhất.
- **Top khoản chi** — tương tự cho chi.
- **Số dư các quỹ** — list các quỹ với số dư hiện tại.

**Bộ lọc kỳ:** *Hôm nay / Tuần này / Tháng này / Năm nay / Tùy chọn*.

---

## B. Sổ thu chi (Cashbook)

**URL:** `/crm/finance_management/cashbook`

![Sổ thu chi](./images/part-06-tai-chinh/A02-cashbook.png)

### B.1. Mục đích

Ghi nhận **từng giao dịch thu hoặc chi** — bao gồm cả tự động (từ bán hàng, trả hàng) và thủ công (lương, điện nước, nhập nguyên vật liệu ngoài hệ thống...).

### B.2. Các cột trong bảng

| Cột | Ghi chú |
|-----|---------|
| **Mã phiếu** | Tự sinh (vd `PT0000001` cho thu, `PC0000001` cho chi) |
| **Ngày giờ** | Thời điểm giao dịch |
| **Loại** | Thu / Chi |
| **Khoản mục** | Danh mục (xem [D](#d-quản-lý-khoản-mục-thu-chi)) |
| **Đối tượng** | Khách / NCC / Nhân viên / Khác |
| **Số tiền** | VNĐ |
| **Quỹ** | Tiền mặt / NH A / NH B / Ví MoMo... |
| **Mô tả** | Ghi chú |
| **Trạng thái** | Đã ghi / Chờ duyệt / Đã hủy |

### B.3. Tạo phiếu thu thủ công

**Các bước:**

1. Bấm **+ Tạo phiếu thu**.
2. Điền form:

#### Quy định nhập liệu — Phiếu thu / chi

| Trường | Bắt buộc | Kiểu | Ràng buộc |
|--------|:--------:|------|-----------|
| **Loại phiếu** | ✓ | Radio | Thu / Chi |
| **Ngày giao dịch** | ✓ | Date | Mặc định hôm nay |
| **Khoản mục** | ✓ | Select | Chọn từ danh mục (xem [D](#d-quản-lý-khoản-mục-thu-chi)) |
| **Quỹ** | ✓ | Select | Chọn từ danh sách quỹ (xem [C](#c-quản-lý-quỹ)) |
| **Đối tượng** | — | Select | Khách / NCC / Nhân viên — tùy khoản mục |
| **Số tiền** | ✓ | Number > 0 | Tối đa 14 chữ số (99.999.999.999.999 đ) |
| **Mô tả / lý do** | — | Textarea ≤ 500 ký tự | Nên điền để audit sau |
| **Chứng từ đính kèm** | — | File upload | Ảnh biên lai / PDF, ≤ 10 MB |

3. Bấm **Lưu phiếu**. Phiếu hiện trong sổ thu chi và **cập nhật số dư quỹ** tức thời.

### B.4. Hủy phiếu

- Chỉ cho phép hủy phiếu **trong ngày tạo**.
- Hủy sẽ đảo số dư quỹ và ghi thêm dòng *"Đã hủy"* vào log.
- Phiếu hủy **không bị xóa** khỏi sổ — vẫn hiện với badge ❌ Hủy.

---

## C. Quản lý quỹ

**URL:** `/crm/finance_management/fund_management`

![Quản lý quỹ](./images/part-06-tai-chinh/A03-fund-management.png)

### C.1. Quỹ là gì?

**Quỹ** = một "ví" chứa tiền. Mỗi cơ sở thường có nhiều quỹ:
- **Tiền mặt tại két** (cash box)
- **Ngân hàng chính** — TK công ty
- **Ngân hàng phụ** — TK ví trả góp
- **MoMo / ZaloPay / VNPay** — các ví điện tử
- **Quỹ dự phòng** — tiền riêng không liên quan kinh doanh

### C.2. Các thông tin hiển thị

Với mỗi quỹ, bảng hiển thị:

| Cột | Ghi chú |
|-----|---------|
| **Tên quỹ** | Vd *"Tiền mặt tại quầy"* |
| **Loại** | Cash / Bank / E-wallet |
| **Số dư hiện tại** | Tự tính từ các giao dịch |
| **Biến động hôm nay** | Tổng thu – tổng chi của ngày |
| **Trạng thái** | Đang dùng / Tạm khóa |

### C.3. Thêm quỹ mới

1. Bấm **+ Thêm quỹ**.
2. Điền form:

#### Quy định nhập liệu — Quỹ

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Tên quỹ** | ✓ | Text ≤ 100 ký tự |
| **Loại quỹ** | ✓ | Cash / Bank / E-wallet |
| **Số dư khởi tạo** | ✓ | Number ≥ 0. Ghi nhận phiếu thu ảo "Số dư ban đầu" |
| **Số tài khoản** *(nếu Bank)* | — | Text |
| **Tên ngân hàng** *(nếu Bank)* | — | Select từ danh mục NH |
| **Chủ tài khoản** *(nếu Bank)* | — | Text |
| **Mã ví** *(nếu E-wallet)* | — | Text |

### C.4. Chuyển tiền giữa các quỹ

**Các bước:**

1. Bấm **Chuyển quỹ** (nút góc phải).
2. Chọn **Quỹ gửi** + **Quỹ nhận** + **Số tiền**.
3. Ghi chú (vd *"Rút tiền mặt từ ATM sang két"*).
4. **Xác nhận**. Hệ thống tạo 1 phiếu chi ở quỹ gửi + 1 phiếu thu ở quỹ nhận, số dư 2 quỹ cập nhật đồng thời.

---

## D. Quản lý khoản mục (thu/chi)

**URL:** `/crm/finance_management/category_management`

![Quản lý khoản mục](./images/part-06-tai-chinh/A04-category-management.png)

### D.1. Mục đích

**Khoản mục** là **danh mục phân loại** các giao dịch thu chi. Báo cáo tài chính dựa vào khoản mục để biết "tiền vào/ra từ đâu".

**Ví dụ khoản mục thu:**
- Doanh thu bán hàng
- Doanh thu dịch vụ
- Tiền cọc khách
- Tiền hoa hồng
- Thu khác

**Ví dụ khoản mục chi:**
- Lương nhân viên
- Tiền điện nước
- Mua nguyên vật liệu
- Thuê mặt bằng
- Marketing / quảng cáo
- Thuế
- Chi khác

### D.2. Thêm / Sửa / Xóa khoản mục

Tương tự các danh mục khác, với các trường:

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Tên khoản mục** | ✓ | Text ≤ 100 |
| **Loại** | ✓ | Thu / Chi |
| **Mã** | — | Tự sinh nếu bỏ trống |
| **Khoản mục cha** | — | Để tạo cây phân cấp |
| **Mô tả** | — | Text |

---

## E. Quản lý công nợ

**URL:** `/crm/finance_management/debt_management`

![Quản lý công nợ](./images/part-06-tai-chinh/A05-debt-management.png)

### E.1. Công nợ khách hàng

Liệt kê các khách **đang nợ cửa hàng**:

- Tên khách, SĐT, Tổng nợ hiện tại, Số ngày nợ, Nợ quá hạn?
- Bấm vào để xem **chi tiết công nợ**: danh sách các đơn nợ + các lần thanh toán từng phần.

**Thu nợ:**
1. Chọn khách → **Thu nợ**.
2. Chọn đơn cần thu (hoặc thu một phần).
3. Nhập số tiền + quỹ nhận.
4. Xác nhận → hệ thống tự tạo phiếu thu ở sổ thu chi.

### E.2. Công nợ phải trả (NCC)

Tab thứ 2 — liệt kê **tiền cửa hàng đang nợ nhà cung cấp** (từ các đơn nhập kho chưa trả đủ).

**Trả nợ NCC:**
1. Chọn NCC → **Trả nợ**.
2. Chọn đơn nhập → nhập số tiền → chọn quỹ.
3. Xác nhận → phiếu chi tạo tự động.

#### Quy định nhập liệu — Phiếu thu/trả nợ

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Đối tượng** | ✓ | Khách / NCC |
| **Đơn công nợ** | ✓ | Chọn 1 hoặc nhiều |
| **Số tiền** | ✓ | > 0 và ≤ số nợ còn |
| **Quỹ** | ✓ | Chọn từ danh sách |
| **Ghi chú** | — | |

---

## F. Đối soát thanh toán

**URL:** `/crm/payment_control`

![Đối soát thanh toán](./images/part-06-tai-chinh/A06-payment-control.png)

### F.1. Mục đích

Khi cửa hàng nhận thanh toán qua **cổng online** (VNPay, MoMo, ZaloPay, các bank gateway), số tiền thật về tài khoản thường **trễ 1–3 ngày**. Module này giúp bạn đối soát:

- **Giao dịch đã ghi trong CRM** vs
- **Giao dịch thật sự có trên sao kê** của kênh thanh toán.

### F.2. Các bước đối soát

1. Chọn **kênh** (VNPay / MoMo / ZaloPay / Bank gateway).
2. Chọn **khoảng thời gian**.
3. Bấm **Tải sao kê** — upload file CSV/Excel từ kênh, hoặc hệ thống tự fetch qua API (nếu đã tích hợp).
4. Bảng **So khớp** hiện ra:
   - Dòng **khớp** ✅ — CRM có, sao kê có, số tiền khớp.
   - Dòng **lệch** ⚠️ — số tiền chênh lệch hoặc mã giao dịch khớp một phần.
   - Dòng **thiếu bên CRM** ❓ — sao kê có mà CRM chưa ghi. Hành động: tạo phiếu thu bù.
   - Dòng **thiếu bên sao kê** ❓ — CRM có mà sao kê chưa. Hành động: chờ thêm / liên hệ kênh.
5. Xử lý từng dòng lệch → **Xác nhận đối soát**.
6. Hệ thống đánh dấu kỳ đó là "Đã đối soát" — không cho sửa.

---

## G. Luồng công việc thường gặp

### G.1. "Cuối ngày đóng ca và đối soát két"

1. Làm **Đóng ca** trong Quản lý ca (Part 02).
2. Sau khi đóng, vào **Sổ thu chi** → lọc **Hôm nay** → đối chiếu với phiếu in từ POS.
3. Nếu có giao dịch online, vào **Đối soát thanh toán** (khi có sao kê).

### G.2. "Trả lương nhân viên cuối tháng"

1. Vào **Sổ thu chi** → **+ Tạo phiếu chi**.
2. Loại: *Chi* → Khoản mục: *Lương nhân viên* → Đối tượng: chọn nhân viên → Số tiền.
3. Quỹ: Ngân hàng (nếu chuyển khoản) hoặc Tiền mặt.
4. Đính kèm **bảng lương** (PDF) → Lưu.

### G.3. "Khách nợ từ tháng trước, giờ đến trả"

1. Vào **Quản lý công nợ** → tab Khách hàng → tìm tên.
2. Bấm **Thu nợ** → chọn đơn nợ cũ → nhập số tiền → chọn quỹ nhận.
3. Xác nhận. Công nợ của khách được trừ xuống, phiếu thu tự động tạo trong Sổ thu chi.

---

## H. Lỗi thường gặp

| Lỗi | Xử lý |
|-----|-------|
| Số dư quỹ âm | Có phiếu chi nhiều hơn số thực có — kiểm tra lịch sử, có thể phải điều chỉnh |
| Phiếu đã đối soát không sửa được | Đúng thiết kế — phải mở kỳ đối soát (liên hệ admin) |
| *"Khoản mục không tồn tại"* | Chưa tạo → vào **Quản lý khoản mục** tạo trước |

---

*Hết Part 06.*
