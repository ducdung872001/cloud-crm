# Part 12 — Cài đặt nâng cao

## Phạm vi

Phân hệ **Cài đặt nâng cao** chứa các cấu hình kỹ thuật và bảo mật. Bao gồm 5 nhóm: tổ chức & phân quyền, kênh liên lạc, tích hợp, tài khoản & bảo mật, hệ thống ticket hỗ trợ.

**Actors chính:** Tenant Admin (chính), từng cá nhân (cài tài khoản riêng), Reborn DevOps (hỗ trợ tích hợp).

---

## A. Tổ chức & Phân quyền

### UR-PERM-01 — Quản lý phòng ban

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PERM-01 |
| **Tên** | Cây phòng ban tenant |
| **Actor** | Tenant Admin |
| **Mô tả** | Cấu hình cấu trúc tổ chức theo cây phân cấp: Ban giám đốc, Phòng Lễ tân, Phòng Kỹ thuật viên, Phòng Kế toán, Phòng Marketing, v.v. |
| **Đầu vào** | • **Tên phòng ban** (M, ≤ 255)<br>• **Mã** (S, auto)<br>• **Phòng ban cha** (S, để trống nếu là root)<br>• **Trưởng phòng** (S, select nhân viên)<br>• **Mô tả** (S) |
| **Tiêu chí chấp nhận** | 1. CRUD đầy đủ.<br>2. Hỗ trợ phân cấp tối đa 5 cấp.<br>3. Không cho xóa phòng ban có nhân viên trực thuộc.<br>4. Drag-and-drop sắp xếp lại cấu trúc. |
| **Mức ưu tiên** | **S** |

### UR-PERM-02 — Quản lý nhóm quyền (Role)

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PERM-02 |
| **Tên** | Định nghĩa role với tập quyền cụ thể |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant tạo các nhóm quyền (vd Admin tenant, Quản lý cửa hàng, Lễ tân, Kế toán, Kỹ thuật viên...) bằng cách tick các quyền cụ thể từ cây quyền. |
| **Tiêu chí chấp nhận** | 1. Cây quyền nhóm theo module: `customer.*`, `invoice.*`, `shift.*`, `finance.*`, `inventory.*`, `marketing.*`, `report.*`, `setting.*`.<br>2. Mỗi node là 1 quyền cụ thể (vd `customer.viewPhone` — quyền nhạy cảm, ẩn SĐT mặc định).<br>3. CRUD đầy đủ.<br>4. Có template role mẫu sẵn (Admin / Manager / Receptionist / ...). |
| **Mức ưu tiên** | **M** |

### UR-PERM-03 — Quản lý nhân viên (User)

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PERM-03 |
| **Tên** | CRUD tài khoản người dùng |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant tạo / sửa / khóa / mở khóa / xóa tài khoản nhân viên. Mỗi nhân viên gán vào phòng ban + nhóm quyền + cơ sở được phép. |
| **Đầu vào** | • **Họ tên** (M, ≤ 255)<br>• **SĐT** (M, làm username, không trùng)<br>• **Email** (M, valid, có thể là username phụ)<br>• **Mật khẩu** (M, ≥ 8 ký tự, hoa+thường+số)<br>• **Xác nhận mật khẩu** (M, khớp)<br>• **Phòng ban** (M)<br>• **Nhóm quyền** (M, multi-select — quyền là union)<br>• **Cơ sở được phép** (M, multi-select)<br>• **Mã nhân viên** (S, auto)<br>• **CCCD/CMND** (S)<br>• **Ngày sinh** (S)<br>• **Ngày vào làm** (S)<br>• **Địa chỉ** (S)<br>• **Avatar** (S, ≤ 2MB)<br>• **Trạng thái** (M, Đang làm/Nghỉ việc/Tạm khóa) |
| **Tiêu chí chấp nhận** | 1. Tạo xong gửi email/SMS thông báo đến nhân viên kèm thông tin đăng nhập.<br>2. Khi nhân viên nghỉ việc → chuyển trạng thái "Nghỉ việc" thay vì xóa, để giữ log lịch sử.<br>3. Yêu cầu quyền `user.create` / `user.update` / `user.delete`.<br>4. Mật khẩu lưu dưới dạng hash bcrypt (CN-05).<br>5. Quyền áp dụng ở lần đăng nhập tiếp theo của nhân viên. |
| **Mức ưu tiên** | **M** |

### UR-PERM-04 — Audit thay đổi quyền

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-PERM-04 |
| **Tên** | Ghi log mọi thay đổi liên quan phân quyền |
| **Actor** | Tenant Admin |
| **Mô tả** | Mọi thay đổi (tạo/sửa/xóa user, gán/bỏ quyền, đổi role) đều được ghi log với thời gian, người thực hiện, trước/sau. |
| **Tiêu chí chấp nhận** | 1. Trang **Lịch sử phân quyền** với bộ lọc thời gian + đối tượng.<br>2. Chỉ Tenant Admin xem được.<br>3. Không thể xóa log. |
| **Mức ưu tiên** | **S** |

---

## B. Kênh liên lạc

### UR-CHANNEL-01 — Cấu hình SMS gateway

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-CHANNEL-01 |
| **Tên** | Tích hợp nhà cung cấp SMS |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant cấu hình credentials cho nhà cung cấp SMS đã chọn (Viettel/VinaSMS/eSMS/Twilio). |
| **Đầu vào** | • **Nhà cung cấp** (M, dropdown)<br>• **API Key / Username** (M)<br>• **API Secret / Password** (M, lưu mã hóa)<br>• **Brand name** (M, hiển thị khi khách nhận SMS)<br>• **Loại tin** (M, OTP / Marketing / CSKH) |
| **Tiêu chí chấp nhận** | 1. Có nút **Test gửi** sang 1 SĐT trước khi lưu.<br>2. Credentials lưu mã hóa (AES-256).<br>3. Nếu test fail → không cho lưu.<br>4. Sau lưu → các chiến dịch SMS (UR-MKT-08) dùng được. |
| **Mức ưu tiên** | **M** |

### UR-CHANNEL-02 — Cấu hình SMTP Email

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-CHANNEL-02 |
| **Tên** | Tích hợp gửi email |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant cài máy chủ SMTP để gửi email từ hệ thống. |
| **Đầu vào** | • **Máy chủ SMTP** (M, vd `smtp.gmail.com`)<br>• **Cổng** (M, 587/465)<br>• **Username/Email** (M)<br>• **Password / App Password** (M)<br>• **Email gửi (From)** (M)<br>• **Tên hiển thị (From name)** (M)<br>• **Reply-to** (S) |
| **Tiêu chí chấp nhận** | 1. Có nút **Test gửi**.<br>2. Hỗ trợ TLS/SSL.<br>3. Dùng cho: hóa đơn điện tử, chiến dịch email, thông báo hệ thống. |
| **Mức ưu tiên** | **M** |

### UR-CHANNEL-03 — Cấu hình Zalo OA

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-CHANNEL-03 |
| **Tên** | Tích hợp Zalo Official Account |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant kết nối Zalo OA của mình để gửi tin Zalo. |
| **Đầu vào** | • **OA ID** (M)<br>• **Access Token** (M)<br>• **Secret Key** (M)<br>• **Webhook URL** (auto, copy-able) |
| **Tiêu chí chấp nhận** | 1. Test gửi tin sang số Zalo cụ thể.<br>2. Webhook URL được tự động sinh, tenant copy vào trang Zalo Developer. |
| **Mức ưu tiên** | **S** |

### UR-CHANNEL-04 — Cấu hình Facebook Messenger

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-CHANNEL-04 |
| **Tên** | Tích hợp Fanpage Facebook |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant kết nối Fanpage để: nhận inbox, gửi tin chiến dịch (theo policy của Facebook). |
| **Đầu vào** | • **Page ID** (M)<br>• **Page Access Token** (M, long-lived)<br>• **App Secret** (M)<br>• **Webhook Verify Token** (M, do tenant tự đặt) |
| **Tiêu chí chấp nhận** | 1. Verify webhook hai chiều với Facebook.<br>2. Inbox đến từ Fanpage hiển thị trong Phản hồi (UR-FEEDBACK-01). |
| **Mức ưu tiên** | **C** |

---

## C. Tích hợp & Kết nối

### UR-INTEG-01 — Cấu hình payment gateway

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-INTEG-01 |
| **Tên** | Tích hợp cổng thanh toán online |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant kết nối các cổng thanh toán online: VNPay, MoMo, ZaloPay, OnePay. |
| **Tiêu chí chấp nhận** | 1. Mỗi cổng có form riêng cho merchant ID, secret, callback URL.<br>2. Có nút **Test kết nối**.<br>3. Sau khi bật → POS hiển thị các phương thức online tương ứng.<br>4. Webhook callback từ cổng được xử lý đúng vào sổ thu chi (UR-FIN-02). |
| **Mức ưu tiên** | **S** |

### UR-INTEG-02 — Tích hợp hóa đơn điện tử

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-INTEG-02 |
| **Tên** | Tích hợp E-invoice provider |
| **Actor** | Tenant Admin, Accountant |
| **Mô tả** | Tenant kết nối với nhà cung cấp hóa đơn điện tử (Viettel E-invoice, VNPT, Misa meInvoice). |
| **Tiêu chí chấp nhận** | 1. Form: API endpoint, username, password, chứng thư số (file upload).<br>2. Test kết nối + test phát hành 1 hóa đơn nháp.<br>3. Sau khi bật → tab "Hóa đơn VAT" Part 04 hoạt động. |
| **Mức ưu tiên** | **M** (nếu tenant cần xuất VAT) |

### UR-INTEG-03 — Tích hợp đơn vị vận chuyển

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-INTEG-03 |
| **Tên** | Kết nối GHN/GHTK/J&T/Viettel Post |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant kết nối API các hãng vận chuyển để tạo đơn giao tự động. |
| **Tiêu chí chấp nhận** | 1. Mỗi đơn vị có form credentials riêng.<br>2. Test API lấy phí.<br>3. Có thể bật nhiều đơn vị cùng lúc — POS cho khách chọn. |
| **Mức ưu tiên** | **S** |

### UR-INTEG-04 — Webhook outbound

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-INTEG-04 |
| **Tên** | Tenant tự cấu hình webhook để nhận event |
| **Actor** | Tenant Admin (developer) |
| **Mô tả** | Tenant đăng ký webhook để app/tool bên ngoài nhận event từ CRM (đơn mới, khách mới, check-in...). |
| **Đầu vào** | • **URL đích** (M, HTTPS)<br>• **Sự kiện muốn nhận** (M, multi-select: `invoice.created`, `customer.created`, `checkin.created`, `shift.closed`, ...)<br>• **HMAC secret** (M, để verify chữ ký) |
| **Tiêu chí chấp nhận** | 1. CRUD webhook.<br>2. Mỗi sự kiện POST JSON sang URL với header `X-Reborn-Signature` (HMAC-SHA256 của body).<br>3. Retry tối đa 5 lần với exponential backoff nếu URL trả ≠ 2xx.<br>4. Có trang **Giám sát webhook** xem log + manual retry. |
| **Mức ưu tiên** | **S** |

### UR-INTEG-05 — Giám sát webhook

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-INTEG-05 |
| **Tên** | Trang theo dõi tình trạng các webhook |
| **Actor** | Tenant Admin |
| **Mô tả** | Hiển thị log mỗi request webhook đã gửi, thành công/thất bại, response, thời gian. |
| **Tiêu chí chấp nhận** | 1. Filter theo webhook + thời gian + status.<br>2. Bấm vào → xem chi tiết payload + response.<br>3. Nút **Retry** cho request thất bại. |
| **Mức ưu tiên** | **C** |

---

## D. Tài khoản & Bảo mật cá nhân

### UR-SECURITY-01 — Hồ sơ cá nhân

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SECURITY-01 |
| **Tên** | Mỗi cá nhân tự cập nhật hồ sơ |
| **Actor** | Staff (chính họ) |
| **Mô tả** | Người dùng tự sửa: họ tên, avatar, SĐT, email cá nhân (khác email đăng nhập). |
| **Tiêu chí chấp nhận** | 1. Validation đầy đủ.<br>2. Đổi SĐT → cần xác thực OTP qua SĐT mới.<br>3. Đổi email → gửi link xác thực. |
| **Mức ưu tiên** | **S** |

### UR-SECURITY-02 — Đổi mật khẩu

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SECURITY-02 |
| **Tên** | Người dùng tự đổi mật khẩu |
| **Actor** | Staff |
| **Đầu vào** | • **Mật khẩu hiện tại** (M, đúng mật khẩu đang dùng)<br>• **Mật khẩu mới** (M, ≥ 8 ký tự, hoa+thường+số, khác mật khẩu cũ)<br>• **Xác nhận mật khẩu mới** (M, khớp) |
| **Tiêu chí chấp nhận** | 1. Validation đầy đủ.<br>2. Sai mật khẩu hiện tại → báo lỗi, đếm số lần thử.<br>3. Sau N lần sai (cấu hình tenant, mặc định 5) → khóa tạm tài khoản 15 phút.<br>4. Hiển thị thanh "Độ mạnh mật khẩu" (Yếu/TB/Mạnh/Rất mạnh).<br>5. Sau đổi thành công → mọi phiên đăng nhập khác bị logout. |
| **Mức ưu tiên** | **M** |

### UR-SECURITY-03 — Xác thực 2 bước (2FA)

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SECURITY-03 |
| **Tên** | Bật 2FA bằng Google Authenticator |
| **Actor** | Staff |
| **Mô tả** | Người dùng có thể bật 2FA cho tài khoản; tenant có thể cấu hình **bắt buộc 2FA** với một số role (vd Tenant Admin). |
| **Tiêu chí chấp nhận** | 1. Hiển thị QR code để app authenticator quét.<br>2. Nhập mã 6 số xác nhận setup.<br>3. Cấp **backup codes** (10 mã) để dùng khi mất điện thoại.<br>4. Khi đăng nhập, sau khi nhập đúng mật khẩu → yêu cầu mã 6 số.<br>5. Có thể tắt 2FA (yêu cầu nhập mật khẩu hiện tại + mã 2FA). |
| **Mức ưu tiên** | **S** |

### UR-SECURITY-04 — Quản lý phiên đăng nhập

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SECURITY-04 |
| **Tên** | Xem và đăng xuất các thiết bị khác |
| **Actor** | Staff |
| **Mô tả** | Người dùng xem danh sách thiết bị đang đăng nhập với cùng tài khoản, có thể đăng xuất từ xa. |
| **Tiêu chí chấp nhận** | 1. Liệt kê: thiết bị, IP, thời gian đăng nhập, thao tác cuối.<br>2. Có nút **Đăng xuất** từng thiết bị riêng.<br>3. Có nút **Đăng xuất toàn bộ thiết bị khác**. |
| **Mức ưu tiên** | **S** |

### UR-SECURITY-05 — Nhật ký hoạt động cá nhân

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SECURITY-05 |
| **Tên** | Audit trail của chính tài khoản |
| **Actor** | Staff |
| **Mô tả** | Hiển thị lịch sử hoạt động của tài khoản: đăng nhập, đổi mật khẩu, các thay đổi nhạy cảm. |
| **Tiêu chí chấp nhận** | 1. Filter theo loại + thời gian.<br>2. Chỉ chính tài khoản đó xem được. |
| **Mức ưu tiên** | **C** |

### UR-SECURITY-06 — Xem gói dịch vụ tenant

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SECURITY-06 |
| **Tên** | Hiển thị thông tin gói thuê SaaS |
| **Actor** | Tenant Admin |
| **Mô tả** | Hiển thị tenant đang dùng gói SaaS nào, hạn đến khi nào, các tính năng bao gồm, giới hạn (số cơ sở, số nhân viên, số khách). |
| **Tiêu chí chấp nhận** | 1. Có nút **Gia hạn** / **Nâng cấp gói** (mở trang khác hoặc liên hệ Reborn).<br>2. Cảnh báo trước khi gói hết hạn 7/15/30 ngày. |
| **Mức ưu tiên** | **S** |

---

## E. Hỗ trợ thành viên (Ticket System)

### UR-TICKET-01 — Cấu hình loại ticket

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-TICKET-01 |
| **Tên** | Định nghĩa các loại ticket hỗ trợ |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant cấu hình các loại ticket: Khiếu nại chất lượng / Đổi-trả / Hỏi thông tin / Báo lỗi / Gợi ý cải thiện. |
| **Tiêu chí chấp nhận** | 1. Mỗi loại có: Tên, Mô tả, **SLA** (thời gian xử lý), **Đội phụ trách** (route tự động), **Mức ưu tiên mặc định**.<br>2. CRUD đầy đủ. |
| **Mức ưu tiên** | **S** |

### UR-TICKET-02 — Cấu hình trạng thái và workflow

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-TICKET-02 |
| **Tên** | Trạng thái lifecycle ticket |
| **Actor** | Tenant Admin |
| **Mô tả** | Cấu hình các trạng thái: Mới → Đang xử lý → Chờ phản hồi → Đã xử lý → Đóng. Có thể thêm trạng thái tùy chỉnh. |
| **Tiêu chí chấp nhận** | 1. Mỗi trạng thái có: Tên, Màu, Vị trí trong workflow.<br>2. Cho phép định nghĩa các chuyển trạng thái hợp lệ. |
| **Mức ưu tiên** | **C** |

### UR-TICKET-03 — Template phản hồi nhanh

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-TICKET-03 |
| **Tên** | Template trả lời khách |
| **Actor** | Tenant Admin, CSKH |
| **Mô tả** | Tenant tạo các template phản hồi để CSKH chèn nhanh khi reply ticket. Hỗ trợ biến thay thế. |
| **Tiêu chí chấp nhận** | 1. Rich text editor.<br>2. Hỗ trợ biến: `{{tên_khách}}`, `{{mã_ticket}}`, `{{tên_nhân_viên}}`, ...<br>3. Sắp xếp theo nhóm. |
| **Mức ưu tiên** | **C** |

### UR-TICKET-04 — QR code gửi ticket

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-TICKET-04 |
| **Tên** | Sinh QR code dẫn về form gửi ticket |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant tạo QR code để in lên tờ rơi / menu / hóa đơn. Khách quét QR → vào form gửi ticket nhanh. |
| **Tiêu chí chấp nhận** | 1. QR có thể có size + format khác nhau.<br>2. URL QR có tham số tracking để biết QR ở đâu được quét.<br>3. Form ticket cho khách điền không cần đăng nhập. |
| **Mức ưu tiên** | **C** |

---

## Tóm tắt yêu cầu Part 12

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-PERM-01 | Quản lý phòng ban | S |
| UR-PERM-02 | Quản lý nhóm quyền | M |
| UR-PERM-03 | Quản lý nhân viên | M |
| UR-PERM-04 | Audit phân quyền | S |
| UR-CHANNEL-01 | SMS gateway | M |
| UR-CHANNEL-02 | SMTP Email | M |
| UR-CHANNEL-03 | Zalo OA | S |
| UR-CHANNEL-04 | Facebook Messenger | C |
| UR-INTEG-01 | Payment gateway | S |
| UR-INTEG-02 | Hóa đơn điện tử | M |
| UR-INTEG-03 | Vận chuyển | S |
| UR-INTEG-04 | Webhook outbound | S |
| UR-INTEG-05 | Giám sát webhook | C |
| UR-SECURITY-01 | Hồ sơ cá nhân | S |
| UR-SECURITY-02 | Đổi mật khẩu | M |
| UR-SECURITY-03 | 2FA | S |
| UR-SECURITY-04 | Quản lý phiên đăng nhập | S |
| UR-SECURITY-05 | Nhật ký cá nhân | C |
| UR-SECURITY-06 | Xem gói dịch vụ | S |
| UR-TICKET-01 | Cấu hình loại ticket | S |
| UR-TICKET-02 | Cấu hình trạng thái | C |
| UR-TICKET-03 | Template phản hồi | C |
| UR-TICKET-04 | QR code ticket | C |

**Tổng:** 23 yêu cầu — 6 Must, 11 Should, 6 Could.

---

*Hết Part 12.*
