# Part 10 — Loyalty & Chăm sóc khách hàng

## 1. Phạm vi phân hệ

Phân hệ chăm sóc khách hàng sau bán: hệ thống điểm tích luỹ (loyalty points), hạng thẻ thành viên (tier), ticket hỗ trợ khách hàng, bảo hành sản phẩm (warranty) theo serial, thu thập và phân tích feedback từ KH.

Các route retail liên quan:

- `/loyalty_points` — điểm tích luỹ
- `/loyalty_point_ledger` — sổ cái điểm
- `/setting_loyalty` — cấu hình loyalty
- `/receive_ticket`, `/receive_ticket_process` — ticket hỗ trợ
- `/receive_warranty`, `/receive_warranty_process` — bảo hành
- `/feedback_enhancement` — feedback nâng cao

## 2. Actor liên quan

- **CSKH** — người dùng chính, xử lý ticket và warranty
- **Store Staff** — tạo ticket tại quầy, tra cứu điểm KH
- **Customer** — đối tượng tích điểm, gửi feedback
- **Tenant Admin** — cấu hình công thức tích điểm, tier rule
- **Warehouse** — xử lý hàng bảo hành đổi trả

## 3. Yêu cầu chi tiết

### UR-LOY-01 — Cấu hình công thức tích điểm

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-01 |
| **Tên** | Thiết lập rule tích điểm |
| **Actor** | Tenant Admin |
| **Mô tả** | `/setting_loyalty` cấu hình công thức tích điểm: ví dụ 1 điểm / 1.000đ doanh thu, hoặc % theo danh mục SP, hoặc bonus ngày sinh nhật. Hỗ trợ nhiều rule active song song với priority. |
| **Tiền điều kiện** | Tenant Admin đăng nhập |
| **Đầu vào** | Rule: loại, hệ số, điều kiện, thời gian áp dụng |
| **Đầu ra** | Rule lưu, áp dụng cho đơn bán mới |
| **Tiêu chí chấp nhận** | - Tối thiểu 1 rule mặc định<br>- Preview điểm tính cho đơn mẫu<br>- Không áp dụng hồi tố đơn cũ |
| **Ưu tiên** | **M** |

### UR-LOY-02 — Tích điểm tự động khi bán hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-02 |
| **Tên** | Cộng điểm khi đơn hoàn tất |
| **Actor** | System |
| **Mô tả** | Khi đơn bán chuyển trạng thái `completed` (hoặc `delivered` tuỳ cấu hình), hệ thống tự tính điểm theo rule và cộng vào tài khoản KH. Ghi bản ghi vào sổ cái điểm (ledger). |
| **Tiền điều kiện** | Đơn có KH đã định danh; rule tích điểm enable |
| **Đầu vào** | Đơn hàng |
| **Đầu ra** | Điểm cộng; bản ghi ledger mới |
| **Tiêu chí chấp nhận** | - Không cộng đôi nếu đơn refund<br>- Rollback điểm khi đơn cancel<br>- Thông báo KH qua SMS/Zalo (tuỳ cấu hình) |
| **Ưu tiên** | **M** |

### UR-LOY-03 — Sổ cái điểm (Ledger)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-03 |
| **Tên** | Lịch sử biến động điểm của KH |
| **Actor** | CSKH, Customer |
| **Mô tả** | `/loyalty_point_ledger` hiển thị lịch sử từng giao dịch điểm: cộng (từ đơn nào), trừ (đổi voucher / đơn nào), hết hạn. Mỗi dòng có: ngày, số điểm, loại, tham chiếu, số dư luỹ kế. |
| **Tiền điều kiện** | KH đã có giao dịch điểm |
| **Đầu vào** | KH ID |
| **Đầu ra** | Bảng ledger có phân trang |
| **Tiêu chí chấp nhận** | - Export Excel<br>- Drill-down vào đơn tham chiếu<br>- Số dư luỹ kế luôn khớp với balance |
| **Ưu tiên** | **M** |

### UR-LOY-04 — Hạng thẻ thành viên (Tier)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-04 |
| **Tên** | Tier system với upgrade / downgrade tự động |
| **Actor** | Tenant Admin |
| **Mô tả** | Cấu hình các tier (ví dụ Basic → Silver → Gold → Diamond) theo ngưỡng doanh số tích luỹ hoặc điểm trong kỳ. KH upgrade/downgrade tự động theo kỳ đánh giá (tháng/quý/năm). Mỗi tier có quyền lợi riêng (% giảm giá, ưu tiên CSKH). |
| **Tiền điều kiện** | Rule tier được khai báo |
| **Đầu vào** | Ngưỡng tier, benefits |
| **Đầu ra** | Tier KH cập nhật, thông báo nâng hạng |
| **Tiêu chí chấp nhận** | - Upgrade ngay khi đạt ngưỡng<br>- Downgrade vào cuối kỳ đánh giá<br>- Lưu lịch sử tier của KH |
| **Ưu tiên** | **S** |

### UR-LOY-05 — Hết hạn điểm (Expire)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-05 |
| **Tên** | Tự động hết hạn điểm theo thời gian |
| **Actor** | System |
| **Mô tả** | Điểm có thời hạn (ví dụ 12 tháng kể từ ngày tích). Job chạy hàng đêm sẽ trừ các điểm đã hết hạn và ghi vào ledger loại `expired`. Nhắc KH trước khi hết hạn 30 ngày. |
| **Tiền điều kiện** | Rule expiry enable |
| **Đầu vào** | Ledger entry |
| **Đầu ra** | Điểm hết hạn trừ khỏi số dư |
| **Tiêu chí chấp nhận** | - FIFO: điểm cũ trừ trước khi đổi voucher<br>- Gửi email/SMS nhắc trước 30 ngày<br>- Audit đầy đủ |
| **Ưu tiên** | **S** |

### UR-LOY-06 — Đổi điểm lấy voucher / SP

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-06 |
| **Tên** | KH đổi điểm lấy quà |
| **Actor** | CSKH, Customer |
| **Mô tả** | `/loyalty_points` cho phép CSKH (hoặc KH qua app) đổi điểm lấy voucher, discount code, SP quà, hoặc giảm trực tiếp vào đơn sau. Catalog quà cấu hình: điểm cần - phần thưởng. |
| **Tiền điều kiện** | KH đủ điểm; catalog quà active |
| **Đầu vào** | Chọn phần quà |
| **Đầu ra** | Điểm trừ; voucher sinh hoặc phiếu xuất quà |
| **Tiêu chí chấp nhận** | - Không đổi vượt số dư<br>- Voucher generate unique code<br>- Ghi ledger loại `redeemed` |
| **Ưu tiên** | **M** |

### UR-LOY-07 — Tiếp nhận ticket hỗ trợ

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-07 |
| **Tên** | Tạo ticket yêu cầu hỗ trợ từ KH |
| **Actor** | CSKH, Store Staff |
| **Mô tả** | `/receive_ticket` cho phép tạo ticket: KH, kênh tiếp nhận (điện thoại / fanpage / email / trực tiếp), loại (khiếu nại / hỏi đáp / yêu cầu đổi trả), ưu tiên, nội dung, file đính kèm. Mã ticket tự sinh. |
| **Tiền điều kiện** | User có quyền `ticket.create` |
| **Đầu vào** | Form ticket |
| **Đầu ra** | Ticket trạng thái `new`, được assign hoặc chờ assign |
| **Tiêu chí chấp nhận** | - Mã ticket format `TK-YYYYMM-####`<br>- SLA theo priority<br>- Auto-assign theo load CSKH (tuỳ cấu hình) |
| **Ưu tiên** | **M** |

### UR-LOY-08 — Xử lý ticket với workflow

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-08 |
| **Tên** | Quy trình xử lý ticket |
| **Actor** | CSKH |
| **Mô tả** | `/receive_ticket_process` quản lý workflow ticket: `new → assigned → in_progress → waiting_customer → resolved → closed`. CSKH ghi log xử lý, đính kèm file, chuyển cho CSKH khác. |
| **Tiền điều kiện** | Ticket tồn tại |
| **Đầu vào** | Action (assign / reply / resolve / close) |
| **Đầu ra** | Ticket cập nhật trạng thái; timeline log |
| **Tiêu chí chấp nhận** | - SLA warning khi gần quá hạn<br>- Notify KH khi trạng thái thay đổi<br>- Reopen trong 7 ngày được |
| **Ưu tiên** | **M** |

### UR-LOY-09 — Tiếp nhận bảo hành theo serial

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-09 |
| **Tên** | Tạo phiếu bảo hành |
| **Actor** | CSKH, Store Staff |
| **Mô tả** | `/receive_warranty` tạo phiếu bảo hành: KH, SP (tra serial number → tự tra cứu đơn gốc và thời hạn bảo hành), mô tả lỗi, ảnh, kênh tiếp nhận. Hệ thống check serial còn trong hạn hay không. |
| **Tiền điều kiện** | Serial tồn tại trong đơn bán |
| **Đầu vào** | Serial, mô tả lỗi |
| **Đầu ra** | Phiếu bảo hành trạng thái `received` |
| **Tiêu chí chấp nhận** | - Tra cứu serial < 1s<br>- Hiển thị hạn bảo hành còn lại<br>- Từ chối nếu ngoài hạn hoặc không tìm thấy |
| **Ưu tiên** | **M** |

### UR-LOY-10 — Xử lý bảo hành

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-10 |
| **Tên** | Workflow xử lý phiếu bảo hành |
| **Actor** | CSKH, Warehouse |
| **Mô tả** | `/receive_warranty_process` quản lý vòng đời phiếu bảo hành: `received → inspecting → repairing → repaired / replaced / rejected → returned_to_customer`. Gắn chi phí sửa (nếu có), thời gian xử lý. |
| **Tiền điều kiện** | Phiếu bảo hành đã tiếp nhận |
| **Đầu vào** | Action và kết quả xử lý |
| **Đầu ra** | Phiếu cập nhật; thông báo KH |
| **Tiêu chí chấp nhận** | - Link với phiếu xuất kho (nếu thay mới)<br>- SLA xử lý bảo hành<br>- Thống kê tỷ lệ lỗi theo SP |
| **Ưu tiên** | **S** |

### UR-LOY-11 — Feedback nâng cao (Enhancement request)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-11 |
| **Tên** | Thu thập góp ý cải tiến từ KH |
| **Actor** | CSKH, Customer |
| **Mô tả** | `/feedback_enhancement` cho phép KH gửi đề xuất cải tiến SP/dịch vụ. Marketer và Store Manager review, đánh priority, gắn status (`new → reviewing → accepted → rejected → implemented`). |
| **Tiền điều kiện** | KH đã đăng ký hoặc gửi công khai |
| **Đầu vào** | Nội dung feedback, loại |
| **Đầu ra** | Feedback lưu, hiển thị trong backlog |
| **Tiêu chí chấp nhận** | - KH nhận phản hồi trạng thái<br>- Vote feedback (tuỳ chọn)<br>- Tag theo module để phân nhóm |
| **Ưu tiên** | **C** |

### UR-LOY-12 — Báo cáo loyalty & CSKH

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-12 |
| **Tên** | Dashboard loyalty và CSKH |
| **Actor** | Store Manager, Tenant Admin |
| **Mô tả** | Báo cáo tổng hợp: số KH theo tier, điểm tích luỹ, điểm đã đổi, số ticket open/closed, SLA trung bình, số phiếu bảo hành, tỷ lệ lỗi SP. |
| **Tiền điều kiện** | Có dữ liệu |
| **Đầu vào** | Kỳ, chi nhánh |
| **Đầu ra** | Dashboard + biểu đồ |
| **Tiêu chí chấp nhận** | - Drill-down vào chi tiết<br>- Export Excel<br>- Filter theo CSKH cụ thể |
| **Ưu tiên** | **S** |

## 4. Quy tắc nghiệp vụ

- **Tích điểm chỉ đếm đơn thực bán**: đơn huỷ / refund phải rollback điểm tương ứng.
- **FIFO expire**: điểm cũ trừ trước khi đổi voucher, để điểm mới còn lại lâu hơn.
- **SLA ticket**: theo priority — urgent 2h, high 8h, normal 24h, low 48h.
- **Bảo hành phải có serial**: SP không serial không áp dụng được bảo hành cá nhân hoá.
- **Tier snapshot theo kỳ**: downgrade chỉ tính vào cuối kỳ đánh giá, không tức thời.
- **Không cộng điểm cho đơn thanh toán bằng điểm**: tránh vòng lặp.

## 5. Non-functional ràng buộc

- **Performance**: tra cứu điểm và serial < 1s với 1 triệu bản ghi.
- **Consistency**: cộng/trừ điểm atomic, không race condition khi nhiều giao dịch song song.
- **Audit**: mọi biến động điểm lưu ledger vĩnh viễn, không xoá.
- **Scalability**: job expire điểm xử lý 100k KH trong dưới 10 phút.
- **Security**: chỉ CSKH và Store Manager thao tác điểm thủ công; audit đầy đủ ai cộng/trừ.
- **Notification**: tích hợp với Part 09 để gửi thông báo qua kênh ưu tiên của KH.

---

*Hết Part 10. Xem tiếp [Part 11 — Báo cáo & BI](part-11-bao-cao-bi.md).*
