# Part 12 — Cài đặt nâng cao

*Phiên bản: Cửa hàng & Spa — Tenant "Viettel Store"*

Part 12 bao phủ 5 mục cài đặt còn lại — **dành cho admin tenant** và các **cấu hình kỹ thuật**:

| # | Mục | URL | Dùng để |
|---|-----|-----|---------|
| 1 | **Tổ chức & phân quyền** | `/crm/setting_org` | Phòng ban, nhóm quyền, nhân viên |
| 2 | **Kênh liên lạc** | `/crm/setting_channels` | Cấu hình SMS, Email, Zalo OA, Facebook |
| 3 | **Tích hợp & kết nối** | `/crm/setting_integrations` | API bên thứ 3, webhook, ứng dụng |
| 4 | **Tài khoản & bảo mật** | `/crm/setting_account` | Hồ sơ cá nhân, đổi mật khẩu, 2FA |
| 5 | **Hỗ trợ thành viên** | `/crm/setting_ticket` | Cấu hình hệ thống ticket hỗ trợ |

---

## A. Tổ chức & phân quyền

**URL:** `/crm/setting_org`

![Tổ chức & phân quyền](./images/part-12-cai-dat-nang-cao/A01-setting-org.png)

### A.1. Cấu trúc

Màn hình này gộp **3 nhóm cấu hình** có liên quan mật thiết với nhau:

1. **Phòng ban** (Department) — cấu trúc tổ chức
2. **Nhóm quyền** (Role) — tập hợp các quyền cụ thể
3. **Nhân viên** (User) — tài khoản của từng người, gán vào phòng ban + nhóm quyền

### A.2. Phòng ban

**Ví dụ cây phòng ban:**

```
Viettel Store (root)
├── Ban giám đốc
├── Phòng Lễ tân
│   ├── Ca sáng
│   └── Ca chiều
├── Phòng Kỹ thuật viên
├── Phòng Kế toán
└── Phòng Marketing
```

#### Quy định nhập liệu — Phòng ban

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Tên phòng ban** | ✓ | Text ≤ 255 |
| **Mã** | — | Auto gen |
| **Phòng ban cha** | — | Select — để trống nếu là root |
| **Trưởng phòng** | — | Select nhân viên |
| **Mô tả** | — | Text |

### A.3. Nhóm quyền

Mỗi nhóm quyền là **tập hợp các quyền cụ thể** (permissions). Ví dụ:

- **Admin tenant** — toàn quyền.
- **Quản lý cửa hàng** — xem báo cáo + mở/đóng ca + xem lịch sử + không được xóa dữ liệu.
- **Nhân viên lễ tân** — bán hàng + check-in + xem khách + không vào báo cáo tiền.
- **Kế toán** — xem tiền + phiếu thu chi + công nợ + không được bán hàng.
- **Kỹ thuật viên** — chỉ xem lịch của mình, trừ quota dịch vụ.

**Tạo nhóm quyền:**

1. Bấm **+ Thêm nhóm quyền**.
2. Điền **Tên nhóm** + **Mô tả**.
3. Tick các quyền cụ thể trong **cây quyền** — thường được nhóm theo module:
   - `customer.view` / `customer.create` / `customer.update` / `customer.delete`
   - `customer.viewPhone` — quyền nhạy cảm (xem SĐT đầy đủ)
   - `invoice.create` / `invoice.cancel` / `invoice.refund`
   - `shift.open` / `shift.close` / `shift.viewAll`
   - `finance.create` / `finance.view` / `finance.approve`
   - ...
4. **Lưu**.

#### Quy định nhập liệu — Nhóm quyền

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Tên nhóm quyền** | ✓ | Text |
| **Mô tả** | — | Text |
| **Cơ sở áp dụng** | — | Chỉ nhóm này ở cơ sở A, hoặc tất cả |
| **Danh sách quyền** | ✓ | Tick ít nhất 1 |

### A.4. Nhân viên (tài khoản)

**Thêm nhân viên mới:**

1. Bấm **+ Thêm nhân viên**.
2. Điền thông tin:

#### Quy định nhập liệu — Nhân viên / Tài khoản

| Trường | Bắt buộc | Kiểu | Ràng buộc |
|--------|:--------:|------|-----------|
| **Họ và tên** | ✓ | Text ≤ 255 | |
| **Số điện thoại** | ✓ | Tel | Không trùng với nhân viên khác. Dùng làm username đăng nhập |
| **Email** | ✓ | Email | Cũng có thể làm username |
| **Mật khẩu** | ✓ | Text | Yêu cầu: ≥ 8 ký tự, có chữ hoa + chữ thường + số |
| **Xác nhận mật khẩu** | ✓ | Text | Phải khớp mật khẩu |
| **Phòng ban** | ✓ | Select | Từ danh sách phòng ban |
| **Nhóm quyền** | ✓ | Multi-select | Có thể gán nhiều nhóm, quyền được union |
| **Cơ sở được phép** | ✓ | Multi-select | Nhân viên ở cơ sở nào thì thấy dữ liệu cơ sở đó |
| **Mã nhân viên** | — | Text | Auto gen |
| **CCCD/CMND** | — | Text | |
| **Ngày sinh** | — | Date | |
| **Ngày vào làm** | — | Date | |
| **Địa chỉ** | — | Text | |
| **Ảnh đại diện** | — | Upload ≤ 2MB | |
| **Trạng thái** | ✓ | Đang làm / Nghỉ việc / Tạm khóa | |

3. **Lưu**. Nhân viên nhận email/SMS kèm thông tin đăng nhập và link đăng nhập.

### A.5. Mẹo quản lý phân quyền

- **Nguyên tắc tối thiểu**: chỉ cấp quyền thực sự cần. Đừng cấp Admin cho mọi người "cho nhanh".
- **Nhân viên thu ngân không được cấp quyền Refund** — tránh gian lận.
- **Tách quyền xem báo cáo** — quản lý có, nhân viên không có.
- Khi **nhân viên nghỉ việc** → chuyển trạng thái **Nghỉ việc** (không xóa) → mọi log vẫn giữ.
- Định kỳ **review quyền** 6 tháng/lần.

---

## B. Kênh liên lạc

**URL:** `/crm/setting_channels`

![Kênh liên lạc](./images/part-12-cai-dat-nang-cao/A02-setting-channels.png)

### B.1. Các kênh hỗ trợ

Landing page này gom 4 kênh chính:

- **SMS** — cổng gửi SMS (Viettel, VinaSMS, eSMS...)
- **Email** — SMTP / SendGrid / Mailgun
- **Zalo OA** — kênh Zalo Official Account
- **Facebook Messenger** — Fanpage

### B.2. SMS

#### Cấu hình cổng SMS

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Nhà cung cấp** | ✓ | Viettel / VinaSMS / eSMS / Twilio |
| **API Key / Username** | ✓ | Credentials do NCC cấp |
| **API Secret / Password** | ✓ | |
| **Brand name** | ✓ | Tên hiển thị khi khách nhận SMS |
| **Loại tin** | ✓ | OTP / Marketing / Chăm sóc |

#### Test kết nối

Sau khi điền, bấm **Test gửi** → nhập 1 SĐT → gửi tin thử.

### B.3. Email (SMTP)

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Máy chủ SMTP** | ✓ | Vd `smtp.gmail.com` |
| **Cổng** | ✓ | 587 (TLS) / 465 (SSL) |
| **Username / Email** | ✓ | |
| **Password / App Password** | ✓ | Với Gmail phải dùng App Password |
| **Email gửi (From)** | ✓ | |
| **Tên hiển thị (From name)** | ✓ | Vd *"Viettel Store"* |
| **Reply-to** | — | Nếu muốn khách reply về địa chỉ khác |

### B.4. Zalo OA

| Trường | Ghi chú |
|--------|---------|
| **OA ID** | Do Zalo cấp khi đăng ký OA |
| **Access Token** | Từ Zalo Developer |
| **Secret Key** | |
| **Webhook URL** | Copy URL này cấu hình vào Zalo |

### B.5. Facebook Messenger

| Trường | Ghi chú |
|--------|---------|
| **Page ID** | ID Fanpage |
| **Page Access Token** | Token long-lived từ Facebook Graph API |
| **App Secret** | |
| **Webhook Verify Token** | Do bạn tự đặt |

---

## C. Tích hợp & kết nối

**URL:** `/crm/setting_integrations`

![Tích hợp & kết nối](./images/part-12-cai-dat-nang-cao/A03-setting-integrations.png)

### C.1. Các loại tích hợp

- **Payment gateway**: VNPay, MoMo, ZaloPay, OnePay — để nhận thanh toán online.
- **Kế toán**: MISA, FAST, Bravo — đồng bộ hóa đơn sang phần mềm kế toán.
- **Hóa đơn điện tử**: Viettel E-invoice, VNPT, Misa meInvoice — để xuất VAT (xem Part 04).
- **Vận chuyển**: GHN, GHTK, J&T — tạo đơn giao tự động.
- **Google**: Google Calendar, Google Sheets, Google Drive — đồng bộ lịch / báo cáo.
- **Microsoft**: Outlook, Teams.
- **Ứng dụng tùy chỉnh**: webhook cho app của bạn.

### C.2. Các bước kết nối một tích hợp

1. Chọn **loại tích hợp** từ danh sách.
2. Bấm **Kết nối**.
3. Điền **credentials** (API key, secret, token…) — do nhà cung cấp cấp.
4. Bấm **Test kết nối** — hệ thống gọi API thử.
5. Nếu OK, bật **Kích hoạt** → tích hợp đi vào hoạt động.

### C.3. Webhook

Tenant có thể **gửi sự kiện** sang app của bên ngoài:

1. Bấm **+ Thêm webhook**.
2. Điền:
   - **URL đích**
   - **Sự kiện muốn nhận**: `invoice.created`, `customer.created`, `checkin.created`, `shift.closed`, v.v.
   - **Bí mật ký** (HMAC secret)
3. **Lưu**. Mỗi khi sự kiện xảy ra, CRM POST JSON sang URL đó.

### C.4. Monitoring webhook

Tab **Giám sát webhook** hiển thị:
- Số lần gửi thành công / thất bại.
- Log chi tiết mỗi request.
- Nút **Retry** cho các request thất bại.

---

## D. Tài khoản & bảo mật

**URL:** `/crm/setting_account`

![Tài khoản & bảo mật](./images/part-12-cai-dat-nang-cao/A04-setting-account.png)

### D.1. Khác biệt so với Part 12.A

- **Part 12.A (Tổ chức & phân quyền)** → admin cấu hình **tất cả nhân viên**.
- **Part 12.D (Tài khoản & bảo mật)** → **mỗi cá nhân** tự quản lý tài khoản của chính mình.

### D.2. Các tab

#### Hồ sơ cá nhân

- Họ tên, avatar, SĐT, email
- Bấm **Cập nhật**.

#### Đổi mật khẩu

| Trường | Bắt buộc | Ràng buộc |
|--------|:--------:|-----------|
| **Mật khẩu hiện tại** | ✓ | Phải đúng mật khẩu đang dùng |
| **Mật khẩu mới** | ✓ | ≥ 8 ký tự, có chữ hoa + chữ thường + số. Không giống mật khẩu cũ |
| **Xác nhận mật khẩu mới** | ✓ | Phải khớp **Mật khẩu mới** |

**Quy tắc mạnh yếu:**
- 🔴 **Yếu** — chỉ có chữ thường
- 🟡 **Trung bình** — chữ hoa + thường
- 🟢 **Mạnh** — chữ hoa + thường + số
- 🟢🟢 **Rất mạnh** — có thêm ký tự đặc biệt + ≥ 12 ký tự

#### Xác thực 2 bước (2FA)

Nếu tenant bật 2FA, bạn phải:
1. Tải app **Google Authenticator** / **Authy**.
2. Quét QR code.
3. Nhập mã 6 số từ app để xác nhận.
4. Lưu **backup codes** để dùng khi mất điện thoại.

#### Phiên đăng nhập

Danh sách các **thiết bị đang đăng nhập** bằng tài khoản của bạn. Có thể **Đăng xuất từ xa** một thiết bị (nếu thấy lạ).

#### Nhật ký hoạt động

Log các hành động quan trọng của chính bạn: đăng nhập, đổi mật khẩu, thay đổi nhạy cảm. Dùng để kiểm tra tài khoản có bị lạ không.

#### Gói dịch vụ

Xem tenant của bạn đang dùng gói nào, hạn đến khi nào, các tính năng bao gồm. Từ đây có nút **Gia hạn** / **Nâng cấp gói**.

---

## E. Hỗ trợ thành viên (Ticket System)

**URL:** `/crm/setting_ticket`

![Hỗ trợ thành viên](./images/part-12-cai-dat-nang-cao/A05-setting-ticket.png)

### E.1. Mục đích

Cấu hình **hệ thống ticket** để khách hàng có thể:
- Gửi yêu cầu hỗ trợ qua form / email / QR code.
- Theo dõi tiến độ xử lý.
- Nhận thông báo khi có cập nhật.

### E.2. Các nhóm cấu hình

#### Danh mục loại ticket

Vd: *Khiếu nại chất lượng*, *Yêu cầu đổi/trả*, *Hỏi thông tin*, *Báo lỗi*, *Gợi ý cải thiện*.

Mỗi loại có:
- Tên, mô tả.
- **SLA** — thời gian phải xử lý (vd 24h, 48h, 7 ngày).
- **Đội phụ trách** (route tự động).
- **Mức độ ưu tiên mặc định**.

#### Trạng thái ticket

Các trạng thái trong vòng đời: *Mới* → *Đang xử lý* → *Chờ phản hồi* → *Đã xử lý* → *Đóng*. Có thể thêm trạng thái tùy chỉnh.

#### Template phản hồi

Các mẫu reply nhanh để nhân viên không phải gõ lại, vd:

```
Xin chào {{tên_khách}},
Cảm ơn quý khách đã phản hồi. Chúng tôi đã ghi nhận và sẽ xử lý trong vòng 24 giờ. 
...
```

#### QR code hỗ trợ

Tạo **mã QR** để in lên tờ rơi / menu / hoá đơn. Khách quét QR → vào form gửi ticket nhanh.

### E.3. Kết nối với Phản hồi (Part 07)

Các ticket tạo ở đây **tự động đồng bộ** với màn **Phản hồi** (Part 07). Về bản chất là cùng một dữ liệu, chỉ khác ở góc nhìn:

- **Phản hồi** (Part 07) — góc nhìn CRM (loại, mức độ, nội dung).
- **Ticket** (Part 12.E) — góc nhìn workflow (SLA, trạng thái, người phụ trách).

---

## F. Nhóm cài đặt hay bỏ qua nhưng quan trọng

### F.1. Đổi mật khẩu mặc định ngay sau khi nhận tenant

**Rất nhiều tenant để mật khẩu mặc định nhiều tháng.** Điều này cực kỳ nguy hiểm. Admin tenant nên:
1. Đăng nhập lần đầu.
2. Vào **Tài khoản & bảo mật** → **Đổi mật khẩu** ngay.
3. Bật 2FA nếu có thể.

### F.2. Kiểm tra quyền xem SĐT

Quyền `customer.viewPhone` rất nhạy cảm. Mặc định nhiều hệ thống cấp cho tất cả nhân viên → ai cũng thấy SĐT khách đầy đủ. Nên **chỉ cấp cho quản lý và nhân viên trực tiếp cần**.

### F.3. Backup dữ liệu

Vào **Tích hợp** → kiểm tra có tích hợp **Google Drive** / **Dropbox** để backup không. Nếu không có, yêu cầu đội Reborn cấu hình.

### F.4. Giám sát webhook

Nếu bạn có app ngoài kết nối với CRM, hãy vào **Giám sát webhook** định kỳ. Webhook thất bại nhiều = dữ liệu sẽ lệch.

---

*Hết Part 12.*
