# Part 07 — Đối tác & Phản hồi

## Phạm vi

Part này gom 2 mục độc lập trên Menu vì cùng phục vụ "đối tượng không phải khách lẻ":

- **Đối tác (KOL/PO)**: KOL, người giới thiệu, đại lý sỉ (Purchase Order), đối tác dịch vụ.
- **Phản hồi**: thu thập + xử lý phản hồi/khiếu nại/góp ý của khách hàng từ nhiều kênh.

**Actors chính:** Marketer (đối tác), CSKH (phản hồi), Branch Manager, Accountant (trả hoa hồng).

---

## A. Đối tác (KOL / PO / Đại lý)

### UR-PARTNER-01 — Quản lý danh sách đối tác

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PARTNER-01 |
| **Tên** | CRUD đối tác kèm chỉ số hiệu quả |
| **Actor** | Marketer, Branch Manager |
| **Mô tả** | Bảng liệt kê các đối tác (KOL, người giới thiệu, đại lý sỉ, đối tác dịch vụ) với chỉ số: số khách giới thiệu, doanh thu mang về, hoa hồng đã trả, hoa hồng phải trả. |
| **Tiêu chí chấp nhận** | 1. Cột: Mã, Tên, Loại (KOL/Referral/PO/Service), SĐT/Email, Nhóm ngành, Số khách giới thiệu, Doanh thu, Hoa hồng đã trả, Hoa hồng phải trả.<br>2. Filter theo loại + nhóm.<br>3. Chỉ số tự cập nhật từ các đơn có gắn đối tác (UR-PARTNER-03). |
| **Mức ưu tiên** | **S** |

### UR-PARTNER-02 — Thêm/sửa đối tác

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PARTNER-02 |
| **Tên** | Form đối tác đầy đủ |
| **Actor** | Marketer, Tenant Admin |
| **Mô tả** | Form thêm/sửa đối tác với thông tin định danh, thanh toán, hợp đồng, hoa hồng. |
| **Đầu vào** | • **Tên đối tác** (M, ≤ 255)<br>• **Loại** (M, KOL/Referral/PO/Service)<br>• **SĐT** (M)<br>• **Email** (S)<br>• **Địa chỉ** (S)<br>• **MST** (S, 10/13 số nếu PO)<br>• **STK ngân hàng + Tên NH + Chủ TK** (S, để trả hoa hồng)<br>• **Tỷ lệ hoa hồng** (S, %, hoặc số cố định/đơn)<br>• **Hạn hợp đồng** (S, date)<br>• **Ghi chú** (S)<br>• **Logo/Avatar** (S, ≤ 5MB) |
| **Tiêu chí chấp nhận** | 1. CRUD đầy đủ.<br>2. Validation: SĐT đúng format, MST 10/13 số, email valid.<br>3. Tỷ lệ hoa hồng có thể là % hoặc số cố định/đơn (radio chọn). |
| **Mức ưu tiên** | **S** |

### UR-PARTNER-03 — Gắn đối tác vào đơn hàng

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PARTNER-03 |
| **Tên** | Liên kết đối tác giới thiệu với đơn POS |
| **Actor** | Receptionist |
| **Mô tả** | Khi tạo đơn ở POS, có ô **Người giới thiệu** để chọn đối tác. Khi đơn được xác nhận, hệ thống tự tính hoa hồng theo tỷ lệ đã cấu hình. |
| **Tiêu chí chấp nhận** | 1. Ô "Người giới thiệu" trong giỏ hàng / modal thanh toán.<br>2. Search đối tác theo tên/SĐT.<br>3. Hoa hồng được tính tự động và lưu vào trạng thái "phải trả" của đối tác.<br>4. Một đơn chỉ gắn được 1 đối tác giới thiệu (CN). |
| **Mức ưu tiên** | **S** |

### UR-PARTNER-04 — Trả hoa hồng cho đối tác

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PARTNER-04 |
| **Tên** | Thanh toán hoa hồng tích lũy |
| **Actor** | Accountant |
| **Mô tả** | Trên trang chi tiết đối tác, tab **Hoa hồng** liệt kê các đơn đã sinh hoa hồng (chưa trả). Người dùng tick các đơn cần trả → chọn quỹ chi → xác nhận. |
| **Tiêu chí chấp nhận** | 1. Liệt kê các đơn với cột: mã đơn, ngày, doanh thu, hoa hồng.<br>2. Tổng các đơn được chọn hiển thị real-time.<br>3. Sau xác nhận → tự sinh phiếu chi trong sổ thu chi (UR-FIN-03), đánh dấu các đơn "Đã trả hoa hồng".<br>4. Có audit ai trả, lúc nào, qua quỹ nào. |
| **Mức ưu tiên** | **S** |

---

## B. Phản hồi khách hàng

### UR-FEEDBACK-01 — Thu thập phản hồi đa kênh

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FEEDBACK-01 |
| **Tên** | Tập trung phản hồi từ nhiều nguồn |
| **Actor** | Hệ thống, CSKH |
| **Mô tả** | Hệ thống phải nhận và lưu phản hồi từ các kênh: Form web/app, khảo sát SMS/Email sau dịch vụ, chat bot, nhân viên nhập tay, comment Facebook/Zalo (nếu tích hợp). Tất cả đổ về 1 inbox thống nhất. |
| **Tiêu chí chấp nhận** | 1. Mỗi phản hồi có nguồn (channel) rõ ràng.<br>2. Phản hồi được gắn với khách hàng (nếu xác định được).<br>3. Phản hồi từ kênh tự động (form/khảo sát) tạo record với trạng thái "Mới". |
| **Mức ưu tiên** | **S** |

### UR-FEEDBACK-02 — Phân loại và quản lý phản hồi

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FEEDBACK-02 |
| **Tên** | Workflow xử lý phản hồi |
| **Actor** | CSKH, Branch Manager |
| **Mô tả** | Mỗi phản hồi có loại (Khen/Góp ý/Khiếu nại), mức độ (Nhẹ/Trung bình/Nghiêm trọng), trạng thái xử lý (Mới/Đang xử lý/Đã xử lý/Bỏ qua), người phụ trách. |
| **Tiêu chí chấp nhận** | 1. Cột bảng: Mã, Ngày, Khách, Kênh, Loại, Mức độ, Nội dung, Trạng thái, Người phụ trách.<br>2. Filter mạnh theo từng cột.<br>3. Bấm vào → mở panel chi tiết với lịch sử xử lý.<br>4. Có thể assign nhanh người phụ trách từ menu 3-chấm. |
| **Mức ưu tiên** | **S** |

### UR-FEEDBACK-03 — Tạo phản hồi thủ công

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FEEDBACK-03 |
| **Tên** | Form ghi nhận phản hồi nhân viên nghe trực tiếp |
| **Actor** | Receptionist, CSKH |
| **Mô tả** | Khi khách phản hồi bằng miệng tại quầy, nhân viên có thể ghi vào form thủ công. |
| **Đầu vào** | • **Khách hàng** (S, có thể để trống nếu vô danh)<br>• **Kênh** (M, dropdown)<br>• **Loại** (M, Khen/Góp ý/Khiếu nại)<br>• **Mức độ** (M, Nhẹ/TB/Nghiêm trọng)<br>• **Nội dung** (M, textarea ≤ 2000)<br>• **Ảnh đính kèm** (S, max 5 file × 5MB)<br>• **Ngày phát sinh** (M, date) |
| **Tiêu chí chấp nhận** | 1. Validation đầy đủ.<br>2. Tự gán người phụ trách = người tạo (override được). |
| **Mức ưu tiên** | **S** |

### UR-FEEDBACK-04 — Lịch sử xử lý phản hồi

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FEEDBACK-04 |
| **Tên** | Audit trail cho mỗi phản hồi |
| **Actor** | CSKH, Branch Manager |
| **Mô tả** | Mỗi lần xử lý phản hồi (chuyển trạng thái, ghi note, gọi điện, gửi voucher), hành động được ghi vào lịch sử của phản hồi đó. |
| **Tiêu chí chấp nhận** | 1. Mỗi entry: thời gian, người, hành động, ghi chú.<br>2. Có thể xem toàn bộ timeline trong panel chi tiết.<br>3. Khi chuyển sang "Đã xử lý" → bắt buộc nhập kết quả cuối. |
| **Mức ưu tiên** | **S** |

### UR-FEEDBACK-05 — Báo cáo phản hồi

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FEEDBACK-05 |
| **Tên** | Phân tích chất lượng dịch vụ qua phản hồi |
| **Actor** | Branch Manager, Tenant Admin |
| **Mô tả** | Báo cáo định kỳ với các chỉ số: số phản hồi/tháng, tỷ lệ Khen/Góp ý/Khiếu nại, thời gian xử lý trung bình, top nhân viên xử lý nhanh, khu vực bị khiếu nại nhiều. |
| **Tiêu chí chấp nhận** | 1. Filter theo kỳ + cơ sở.<br>2. Có biểu đồ pie + cột.<br>3. Drill-down từ chỉ số → list phản hồi cụ thể.<br>4. Xuất Excel. |
| **Mức ưu tiên** | **C** |

---

## Tóm tắt yêu cầu Part 07

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-PARTNER-01 | Danh sách đối tác | S |
| UR-PARTNER-02 | Thêm/sửa đối tác | S |
| UR-PARTNER-03 | Gắn đối tác vào đơn | S |
| UR-PARTNER-04 | Trả hoa hồng | S |
| UR-FEEDBACK-01 | Thu phản hồi đa kênh | S |
| UR-FEEDBACK-02 | Workflow phản hồi | S |
| UR-FEEDBACK-03 | Tạo phản hồi thủ công | S |
| UR-FEEDBACK-04 | Lịch sử xử lý | S |
| UR-FEEDBACK-05 | Báo cáo phản hồi | C |

**Tổng:** 9 yêu cầu — 0 Must, 8 Should, 1 Could.

---

*Hết Part 07.*
