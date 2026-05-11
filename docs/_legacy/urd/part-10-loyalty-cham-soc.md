# Part 10 — Loyalty & Chăm sóc khách hàng

## 1. Phạm vi phân hệ

Phân hệ chăm sóc khách hàng sau bán: hệ thống điểm tích luỹ (loyalty points), hạng thẻ thành viên (tier), ticket hỗ trợ khách hàng, bảo hành sản phẩm (warranty) theo serial, thu thập và phân tích feedback từ KH.

> **Lưu ý (2026-04):** Loyalty là menu top-level riêng biệt (không nằm dưới Marketing). Hỗ trợ chuỗi siêu thị đa thương hiệu (2+ brands, 100+ stores, 3M+ KH), tích hợp hệ thống loyalty bên ngoài qua API/webhook.

Các route retail liên quan:

- `/loyalty_points` — điểm tích luỹ
- `/loyalty_point_ledger` — sổ cái điểm
- `/loyalty_integration` — tích hợp hệ thống loyalty bên ngoài (POS, app)
- `/dashboard_loyalty` — dashboard tổng quan loyalty
- `/member_list` — danh sách thành viên loyalty
- `/setting_loyalty` — cấu hình loyalty (point rules, tier, expiry, scope, module toggle)
- `/receive_ticket`, `/receive_ticket_process` — ticket hỗ trợ
- `/receive_warranty`, `/receive_warranty_process` — bảo hành
- `/feedback_enhancement` — feedback nâng cao

## 2. Actor liên quan

- **CSKH** — người dùng chính, xử lý ticket và warranty
- **Store Staff** — tạo ticket tại quầy, tra cứu điểm KH, quét barcode thẻ thành viên
- **Customer** — đối tượng tích điểm, gửi feedback, sở hữu thẻ thành viên ảo
- **Tenant Admin** — cấu hình công thức tích điểm, tier rule, scope, expiry, module toggle
- **Warehouse** — xử lý hàng bảo hành đổi trả
- **External POS / System** — hệ thống bên ngoài gửi giao dịch qua webhook/API để tích điểm
- **Brand Manager** — quản lý loyalty riêng theo thương hiệu (khi scope = per_brand)

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

### UR-LOY-13 — Cấu hình hết hạn điểm nâng cao (Point Expiry Config)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-13 |
| **Tên** | Cấu hình chế độ hết hạn điểm |
| **Actor** | Tenant Admin |
| **Mô tả** | `/setting_loyalty` cho phép chọn 1 trong 3 chế độ hết hạn điểm: (1) `never` — điểm không bao giờ hết hạn, (2) `after_months` — hết hạn sau N tháng kể từ ngày tích (ví dụ 12 tháng), (3) `end_of_year` — tất cả điểm hết hạn vào 31/12 hàng năm. Khi chuyển chế độ, hệ thống tính lại ngày hết hạn cho điểm hiện tại và hiển thị preview số KH bị ảnh hưởng trước khi apply. |
| **Tiền điều kiện** | Tenant Admin đăng nhập, có quyền `loyalty.setting` |
| **Đầu vào** | Mode (never / after_months / end_of_year), tham số N (nếu after_months) |
| **Đầu ra** | Config lưu; job nightly recalc expiry date cho ledger entries |
| **Tiêu chí chấp nhận** | - Preview số KH & tổng điểm bị ảnh hưởng khi đổi mode<br>- Confirm dialog trước khi apply<br>- Gửi nhắc KH trước 30 ngày khi điểm sắp hết hạn<br>- Audit log ghi lại mọi thay đổi config |
| **Ưu tiên** | **M** |

### UR-LOY-14 — Đánh giá hạng thẻ tự động (Auto Tier Evaluation)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-14 |
| **Tên** | Auto upgrade/downgrade tier theo kỳ đánh giá |
| **Actor** | System, Tenant Admin |
| **Mô tả** | Cấu hình kỳ đánh giá tier: `monthly` / `quarterly` / `yearly`. Cuối mỗi kỳ, job tự động rà soát toàn bộ KH: upgrade ngay khi đạt ngưỡng, downgrade nếu không đạt ngưỡng duy trì — có grace period (ví dụ 1 kỳ ân hạn trước khi downgrade thực sự). KH nhận thông báo khi thay đổi tier. Tenant Admin có thể chạy dry-run để xem trước kết quả trước khi batch chính thức. |
| **Tiền điều kiện** | Tier rules đã cấu hình (UR-LOY-04); kỳ đánh giá đã set |
| **Đầu vào** | Chu kỳ đánh giá, grace period (số kỳ), ngưỡng duy trì mỗi tier |
| **Đầu ra** | Batch update tier KH; log upgrade/downgrade; thông báo KH |
| **Tiêu chí chấp nhận** | - Dry-run hiển thị danh sách KH upgrade/downgrade trước khi apply<br>- Grace period: KH không bị downgrade ngay mà có N kỳ ân hạn<br>- Gửi notification cho KH khi tier thay đổi<br>- Performance: xử lý 3M KH trong < 30 phút<br>- Lưu lịch sử tier evaluation mỗi kỳ |
| **Ưu tiên** | **M** |

### UR-LOY-15 — Phạm vi Loyalty theo thương hiệu / nhóm cửa hàng (Loyalty Scope)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-15 |
| **Tên** | Cấu hình scope loyalty: chain-wide / per-brand / per-store-group |
| **Actor** | Tenant Admin |
| **Mô tả** | `/setting_loyalty` cho phép chọn phạm vi áp dụng loyalty: (1) `chain_wide` — điểm và tier dùng chung toàn chuỗi, (2) `per_brand` — mỗi thương hiệu có pool điểm và tier riêng, (3) `per_store_group` — nhóm cửa hàng tuỳ chọn có pool riêng. Khi scope = per_brand, hỗ trợ tuỳ chọn cross-brand points (KH có thể chuyển đổi điểm giữa các brand theo tỷ lệ cấu hình). |
| **Tiền điều kiện** | Tenant có nhiều brand hoặc store group |
| **Đầu vào** | Scope mode, cross-brand ratio (nếu bật), mapping store → brand/group |
| **Đầu ra** | Config lưu; ledger và tier tách theo scope |
| **Tiêu chí chấp nhận** | - Khi đổi scope, migrate dữ liệu điểm/tier có confirm<br>- Cross-brand: tỷ lệ chuyển đổi cấu hình được (ví dụ 1 điểm Brand A = 0.8 điểm Brand B)<br>- Dashboard loyalty filter theo scope<br>- Báo cáo gộp toàn chuỗi và tách theo scope |
| **Ưu tiên** | **M** |

### UR-LOY-16 — Thẻ thành viên ảo với barcode (Member Card Barcode)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-16 |
| **Tên** | Phát hành thẻ thành viên ảo có barcode |
| **Actor** | CSKH, Store Staff, Customer |
| **Mô tả** | `/member_list` cho phép phát hành thẻ thành viên ảo cho KH, kèm barcode (Code128 hoặc QR). KH xem thẻ trong app/Zalo mini app, hoặc CSKH in thẻ cứng (PDF format). Store Staff quét barcode tại quầy để tra cứu nhanh thông tin KH, tier, số dư điểm. |
| **Tiền điều kiện** | KH đã đăng ký thành viên |
| **Đầu vào** | KH ID; loại barcode |
| **Đầu ra** | Thẻ ảo với barcode unique; PDF printable |
| **Tiêu chí chấp nhận** | - Barcode unique, không trùng<br>- Quét barcode tại POS tra cứu KH < 1s<br>- In PDF thẻ (hỗ trợ batch print nhiều thẻ)<br>- Thẻ hiển thị: tên KH, tier, barcode, ngày phát hành |
| **Ưu tiên** | **S** |

### UR-LOY-17 — Import thành viên hàng loạt (Bulk Member Import)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-17 |
| **Tên** | Import danh sách thành viên từ CSV |
| **Actor** | Tenant Admin |
| **Mô tả** | `/member_list` hỗ trợ upload file CSV để import thành viên hàng loạt. Hệ thống dedupe theo số điện thoại: nếu phone đã tồn tại thì merge (cập nhật thông tin, cộng dồn điểm nếu có cột điểm). Hỗ trợ import đến 3 triệu bản ghi (background job, notify khi xong). Download template CSV và xem kết quả import (số thành công, lỗi, trùng). |
| **Tiền điều kiện** | Tenant Admin có quyền `loyalty.member.import` |
| **Đầu vào** | File CSV (phone, name, email, tier, points, ...) |
| **Đầu ra** | Members created/updated; báo cáo kết quả import |
| **Tiêu chí chấp nhận** | - Dedupe by phone: không tạo trùng<br>- Merge strategy: update thông tin mới, giữ lại nếu cột CSV trống<br>- Validate format (phone, email) trước khi import<br>- Background job cho file > 10k rows, notify qua bell khi xong<br>- Xử lý 3M rows trong < 1 giờ<br>- Download file lỗi để sửa và re-import |
| **Ưu tiên** | **M** |

### UR-LOY-18 — Bật/tắt module (Loyalty-only Mode)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-18 |
| **Tên** | Toggle chế độ Loyalty-only vs Full CRM |
| **Actor** | Tenant Admin |
| **Mô tả** | `/setting_loyalty` cho phép bật chế độ `loyalty_only`: chỉ hiển thị các tính năng loyalty (tích điểm, tier, member, dashboard loyalty) và ẩn toàn bộ module CRM khác (ticket, warranty, feedback). Phù hợp cho tenant chỉ cần loyalty program mà không cần CSKH đầy đủ. Khi toggle, menu và permission tự điều chỉnh. |
| **Tiền điều kiện** | Tenant Admin đăng nhập |
| **Đầu vào** | Mode: `loyalty_only` / `full_crm` |
| **Đầu ra** | Menu và route ẩn/hiện tương ứng; permission auto-adjust |
| **Tiêu chí chấp nhận** | - Chuyển mode không mất dữ liệu<br>- Route bị ẩn trả 403 nếu truy cập trực tiếp<br>- Toggle lại full_crm khôi phục toàn bộ<br>- Reflect ngay trên sidebar menu sau khi reload |
| **Ưu tiên** | **S** |

### UR-LOY-19 — Trang tích hợp & tài liệu API (Integration & API Docs)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-19 |
| **Tên** | Trang quản lý tích hợp và API docs cho hệ thống bên ngoài |
| **Actor** | Tenant Admin |
| **Mô tả** | `/loyalty_integration` cung cấp: (1) Quản lý API key cho external POS/system, (2) Tài liệu API inline (endpoint tích điểm, trừ điểm, tra cứu KH, webhook events), (3) Webhook config (URL callback, events subscribe: `order.completed`, `points.earned`, `tier.changed`), (4) Log request/response gần nhất để debug. Hỗ trợ sandbox mode để test trước khi go-live. |
| **Tiền điều kiện** | Tenant Admin có quyền `loyalty.integration` |
| **Đầu vào** | API key request, webhook URL, subscribed events |
| **Đầu ra** | API key issued; webhook registered; docs hiển thị |
| **Tiêu chí chấp nhận** | - Generate / revoke API key<br>- Webhook test ping thành công<br>- Request log lưu 30 ngày gần nhất<br>- Rate limit: 1000 req/min per API key<br>- Sandbox mode không ảnh hưởng production data |
| **Ưu tiên** | **M** |

### UR-LOY-20 — Tích điểm tự động từ POS bên ngoài (Webhook)

| Trường | Nội dung |
|---|---|
| **ID** | UR-LOY-20 |
| **Tên** | Auto-earn points từ external POS qua webhook |
| **Actor** | External POS / System |
| **Mô tả** | External POS gửi webhook `order.completed` với payload (store_id, phone KH, tổng tiền, danh mục SP, order_id). Hệ thống nhận, validate API key, tra cứu KH theo phone (tạo mới nếu chưa có), tính điểm theo rule hiện hành (hỗ trợ 3 loại: `invoice_amount` — theo tổng tiền, `category_based` — theo danh mục SP, `fixed_per_order` — cố định mỗi đơn). Áp dụng min_spend threshold và multiplier config (ví dụ x2 điểm ngày sinh nhật). Ghi ledger và cập nhật tier. |
| **Tiền điều kiện** | API key valid; webhook registered (UR-LOY-19) |
| **Đầu vào** | Webhook payload: store_id, phone, amount, category[], order_ref |
| **Đầu ra** | Điểm cộng; ledger entry; tier re-evaluate nếu cần; response 200 với points_earned |
| **Tiêu chí chấp nhận** | - Idempotent: cùng order_ref không cộng đôi<br>- Validate phone format, store_id thuộc tenant<br>- Min spend: đơn dưới ngưỡng không tích điểm<br>- Multiplier: áp dụng đúng config (birthday, promo period)<br>- Latency < 500ms per request<br>- Dead letter queue cho webhook thất bại, retry 3 lần |
| **Ưu tiên** | **M** |

## 4. Quy tắc nghiệp vụ

- **Tích điểm chỉ đếm đơn thực bán**: đơn huỷ / refund phải rollback điểm tương ứng.
- **FIFO expire**: điểm cũ trừ trước khi đổi voucher, để điểm mới còn lại lâu hơn.
- **SLA ticket**: theo priority — urgent 2h, high 8h, normal 24h, low 48h.
- **Bảo hành phải có serial**: SP không serial không áp dụng được bảo hành cá nhân hoá.
- **Tier snapshot theo kỳ**: downgrade chỉ tính vào cuối kỳ đánh giá, không tức thời.
- **Không cộng điểm cho đơn thanh toán bằng điểm**: tránh vòng lặp.
- **Scope isolation**: khi loyalty scope = per_brand hoặc per_store_group, điểm và tier hoàn toàn tách biệt giữa các scope; KH có thể có tier khác nhau ở mỗi brand.
- **Cross-brand points có tỷ lệ chuyển đổi**: chỉ áp dụng khi Tenant Admin bật; tỷ lệ phải > 0 và cấu hình 2 chiều (A→B và B→A).
- **Point expiry mode là global**: toàn tenant dùng chung 1 mode expiry; khi chuyển mode, điểm hiện tại được recalc ngày hết hạn.
- **Tier evaluation grace period**: KH không đạt ngưỡng duy trì không bị downgrade ngay — phải qua hết grace period (số kỳ ân hạn) mới downgrade. Grace period tối thiểu = 0 (downgrade ngay), mặc định = 1 kỳ.
- **Webhook idempotency**: external POS gửi trùng order_ref sẽ nhận response thành công nhưng không cộng điểm lần 2.
- **Earn rule priority**: khi nhiều earn rule active (invoice_amount, category_based, fixed_per_order), hệ thống áp dụng rule có priority cao nhất; không stack nhiều rule trên cùng 1 đơn trừ khi cấu hình `stackable = true`.
- **Min spend threshold**: đơn có tổng tiền dưới min_spend không tích điểm, áp dụng cả đơn nội bộ và webhook.
- **Multiplier không áp dụng chồng**: nếu KH vừa sinh nhật vừa trong promo period, chỉ áp multiplier cao nhất (không nhân chồng), trừ khi cấu hình `stack_multiplier = true`.

## 5. Non-functional ràng buộc

- **Performance**: tra cứu điểm và serial < 1s với 3 triệu bản ghi; barcode scan lookup < 1s.
- **Consistency**: cộng/trừ điểm atomic, không race condition khi nhiều giao dịch song song (kể cả webhook concurrent).
- **Audit**: mọi biến động điểm lưu ledger vĩnh viễn, không xoá. Ghi log thay đổi config (expiry mode, scope, tier eval).
- **Scalability**: job expire điểm xử lý 3M KH trong dưới 30 phút; tier evaluation batch 3M KH trong < 30 phút; bulk import 3M rows trong < 1 giờ.
- **Security**: chỉ CSKH và Store Manager thao tác điểm thủ công; audit đầy đủ ai cộng/trừ. API key scoped per tenant, rate limited 1000 req/min.
- **Notification**: tích hợp với Part 09 để gửi thông báo qua kênh ưu tiên của KH.
- **API / Webhook**: latency < 500ms per webhook request; dead letter queue với retry 3 lần; request log lưu 30 ngày.
- **Multi-brand isolation**: khi scope = per_brand, query điểm/tier phải filter đúng brand, không leak data cross-brand.

---

*Hết Part 10. Xem tiếp [Part 11 — Báo cáo & BI](part-11-bao-cao-bi.md).*
