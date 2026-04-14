# Part 07 — Đối tác & Phản hồi

*Phiên bản: Cửa hàng & Spa — Tenant "Viettel Store"*

Phần này gom **2 mục độc lập trên sidebar** vì chúng đều liên quan đến *"những người không phải nhân viên / không phải khách lẻ"*:

| Mục | URL | Đối tượng |
|-----|-----|-----------|
| **Đối tác (KOL/PO)** | `/crm/ch_partners` | Người giới thiệu, KOL, Purchase Order (PO), đại lý |
| **Phản hồi** | `/crm/ch_feedback` | Phản hồi / khiếu nại / góp ý của khách hàng |

---

## A. Đối tác (KOL / PO / Đại lý)

**URL:** `/crm/ch_partners`

![Màn hình Đối tác](./images/part-07-doi-tac-phan-hoi/A01-partners.png)

### A.1. Đối tác là gì?

**Đối tác** ở đây là những người/tổ chức có mối quan hệ kinh doanh đặc biệt với cửa hàng:

- **KOL / Influencer** — người nổi tiếng được cửa hàng thuê/mời quảng bá, có thể nhận hoa hồng từ khách họ giới thiệu.
- **Người giới thiệu (Referral)** — khách hàng hoặc cá nhân khác đã giới thiệu khách mới, được thưởng theo chính sách.
- **Purchase Order (PO) / Đại lý** — các đơn vị mua sỉ, đặt lô để bán lại.
- **Đối tác dịch vụ** — các bên thứ ba cung cấp dịch vụ kèm (vận chuyển, giặt ủi, PT...).

### A.2. Các cột trong danh sách

| Cột | Ghi chú |
|-----|---------|
| **Mã đối tác** | Tự sinh |
| **Tên** | Họ tên hoặc tên tổ chức |
| **Loại** | KOL / Referral / PO / Dịch vụ |
| **SĐT / Email** | Liên hệ |
| **Nhóm ngành** | Loại ngành hoạt động |
| **Số khách đã giới thiệu** | Đếm từ hệ thống |
| **Doanh thu mang về** | Tổng tiền từ khách do đối tác này giới thiệu |
| **Hoa hồng đã trả** | Tổng hoa hồng đã chi |
| **Hoa hồng phải trả** | Đang chờ chi |

### A.3. Thêm đối tác mới

**Các bước:**

1. Bấm **+ Thêm đối tác**.
2. Điền form:

#### Quy định nhập liệu — Đối tác

| Trường | Bắt buộc | Kiểu | Ràng buộc |
|--------|:--------:|------|-----------|
| **Tên đối tác** | ✓ | Text ≤ 255 | |
| **Loại đối tác** | ✓ | Select | KOL / Referral / PO / Dịch vụ |
| **Số điện thoại** | ✓ | Tel | Đúng định dạng VN hoặc quốc tế |
| **Email** | — | Email | |
| **Địa chỉ** | — | Text | |
| **Mã số thuế** | — | Text, 10 hoặc 13 số | Nếu là PO/doanh nghiệp |
| **Số TK ngân hàng** | — | Text | Để trả hoa hồng |
| **Tên NH** | — | Text | |
| **Chủ TK** | — | Text | |
| **Tỷ lệ hoa hồng (%)** | — | Number 0-100 | Hoặc số cố định per đơn |
| **Hạn hợp đồng** | — | Date | |
| **Ghi chú** | — | Textarea | |
| **Ảnh đại diện / Logo** | — | Upload ≤ 5MB | |

3. Bấm **Lưu**.

### A.4. Gắn đối tác vào đơn hàng

Khi tạo **đơn bán hàng** (Part 02):
- Ở modal thanh toán / giỏ hàng có ô **"Người giới thiệu"** — chọn đối tác.
- Khi đơn được xác nhận, hệ thống tự tính hoa hồng theo tỷ lệ đã cài.
- Hoa hồng được tích lũy vào trạng thái **"phải trả"** của đối tác.

### A.5. Trả hoa hồng cho đối tác

1. Vào danh sách đối tác → chọn đối tác → tab **Hoa hồng**.
2. Xem danh sách các đơn đã có hoa hồng (chưa trả).
3. Tick các đơn cần thanh toán → **Thanh toán hoa hồng**.
4. Chọn **Quỹ chi** → **Xác nhận**.
5. Hệ thống tạo phiếu chi ở **Sổ thu chi** (Part 06), đánh dấu các đơn đó là "Đã trả hoa hồng".

---

## B. Phản hồi khách hàng

**URL:** `/crm/ch_feedback`

![Màn hình Phản hồi](./images/part-07-doi-tac-phan-hoi/A02-feedback.png)

### B.1. Mục đích

Thu thập, phân loại và xử lý **phản hồi của khách**:
- **Khen ngợi** — tích cực, có thể dùng làm testimonial.
- **Góp ý** — đề xuất cải thiện, quản lý cần xem.
- **Khiếu nại** — vấn đề nghiêm trọng, cần xử lý nhanh.

### B.2. Các kênh thu thập

Phản hồi có thể đến từ nhiều nguồn, đổ về cùng một nơi để dễ quản lý:

- **Form trên app/web** của khách.
- **Khảo sát sau khi dùng dịch vụ** (gửi qua SMS/email).
- **Chat với bot** — chuyển tiếp phản hồi.
- **Nhập thủ công** — nhân viên nghe khách nói trực tiếp thì ghi vào.
- **Social media listening** — comment từ Facebook/Zalo (nếu đã tích hợp Social CRM).

### B.3. Các cột / trạng thái

| Cột | Ghi chú |
|-----|---------|
| **Mã phản hồi** | Tự sinh |
| **Ngày giờ** | |
| **Khách hàng** | Gắn vào hồ sơ khách (nếu xác định được) |
| **Kênh** | Form / SMS / App / Nhân viên / FB... |
| **Loại** | Khen / Góp ý / Khiếu nại |
| **Mức độ** | Nhẹ / Trung bình / Nghiêm trọng |
| **Nội dung** | Text khách viết |
| **Trạng thái xử lý** | Mới / Đang xử lý / Đã xử lý / Bỏ qua |
| **Người phụ trách** | Nhân viên được giao xử lý |

### B.4. Các bước xử lý một phản hồi

1. Bấm vào phản hồi ở danh sách → mở panel chi tiết.
2. **Phân loại**: chọn Loại, Mức độ.
3. **Gán người phụ trách**: chọn từ danh sách nhân viên.
4. Chuyển trạng thái sang **Đang xử lý**.
5. **Viết note**: mỗi lần có hành động, ghi vào phần **Lịch sử xử lý** (vd *"Đã gọi điện xin lỗi và tặng voucher 100k"*).
6. Khi xong, chuyển sang **Đã xử lý** + ghi kết quả cuối.

#### Quy định nhập liệu — Tạo phản hồi thủ công

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Khách hàng** | — | Select hoặc để trống nếu vô danh |
| **Kênh** | ✓ | Select |
| **Loại** | ✓ | Khen / Góp ý / Khiếu nại |
| **Mức độ** | ✓ | Nhẹ / Trung bình / Nghiêm trọng |
| **Nội dung** | ✓ | Textarea ≤ 2000 ký tự |
| **Ảnh đính kèm** | — | Upload, max 5 file × 5MB |
| **Ngày phát sinh** | ✓ | Date |

### B.5. Báo cáo phản hồi

- **Số phản hồi theo tháng** — biểu đồ cột.
- **Tỷ lệ Khen / Góp ý / Khiếu nại** — pie chart.
- **Thời gian xử lý trung bình** — từ Mới → Đã xử lý.
- **Top nhân viên xử lý nhanh nhất**.
- **Khu vực / dịch vụ bị khiếu nại nhiều nhất** — alert cho quản lý cải thiện.

---

## C. Luồng công việc thường gặp

### C.1. "KOL A mang về 5 khách mới tháng này — tính hoa hồng"

1. Mỗi khi khách đến và nói *"Em biết qua chị A"*, lễ tân phải gắn **Người giới thiệu: A** vào đơn ngay khi bán hàng.
2. Cuối tháng, vào **Đối tác** → tìm A → tab **Hoa hồng** → thấy 5 đơn + tổng hoa hồng.
3. Tick tất cả → **Thanh toán hoa hồng** → chọn quỹ → xác nhận.
4. Phiếu chi tự tạo trong **Sổ thu chi**, A được đánh dấu đã nhận đủ.

### C.2. "Khách khiếu nại dịch vụ massage không đúng thời lượng"

1. Lễ tân nghe khách, vào **Phản hồi** → **+ Tạo phản hồi** → gắn khách → Loại: *Khiếu nại* → Mức độ: *Trung bình* → nội dung.
2. Gán người phụ trách: Quản lý ca.
3. Quản lý vào, xem, gọi điện xin lỗi → tặng voucher 200k → ghi note → chuyển **Đã xử lý**.
4. Cuối tháng trong báo cáo Khiếu nại, thấy đúng rằng dịch vụ này đang có vấn đề → cải thiện.

---

*Hết Part 07.*
