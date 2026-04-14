# Part 14 — Tích hợp & Dữ liệu

## Phạm vi

Phần này mô tả các **yêu cầu tích hợp (Integration Requirements)** với hệ thống bên ngoài và **yêu cầu dữ liệu (Data Requirements)** — mô hình dữ liệu cốt lõi, import/export, backup, retention.

---

## A. Tích hợp với hệ thống bên ngoài

### IR-01 — SSO (Single Sign-On)

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-01 |
| **Tên** | Tích hợp với SSO của Reborn |
| **Loại** | Authentication |
| **Mô tả** | Hệ thống đăng nhập qua trang SSO chung của Reborn, không có form đăng nhập riêng. |
| **Tích hợp với** | `sso.reborn.vn` (production), `localhost:8080` (dev) |
| **Giao thức** | OAuth 2.0 / OIDC |
| **Endpoint** | • `/oauth/authorize` (redirect)<br>• `/oauth/token` (exchange code)<br>• `/oauth/userinfo` (lấy thông tin user) |
| **Mức ưu tiên** | **M** |

### IR-02 — Cổng thanh toán online

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-02 |
| **Tên** | Tích hợp các payment gateway |
| **Loại** | Payment |
| **Mô tả** | Tenant có thể bật một hoặc nhiều cổng để nhận thanh toán online. |
| **Đối tác hỗ trợ** | • **VNPay** — QR + Bank gateway<br>• **MoMo** — Ví điện tử<br>• **ZaloPay** — Ví điện tử<br>• **OnePay** — Bank gateway<br>• **Stripe** (cho tenant quốc tế) |
| **Cơ chế** | Redirect-based hoặc IPN webhook callback. |
| **Yêu cầu kỹ thuật** | Mỗi cổng có credentials (merchant ID, secret) cấu hình ở UR-INTEG-01. |
| **Mức ưu tiên** | **S** |

### IR-03 — Hóa đơn điện tử

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-03 |
| **Tên** | Tích hợp E-invoice provider |
| **Loại** | Invoicing |
| **Mô tả** | Phát hành hóa đơn VAT điện tử qua nhà cung cấp được Tổng cục Thuế cấp phép. |
| **Đối tác hỗ trợ** | • Viettel E-invoice<br>• VNPT eInvoice<br>• Misa meInvoice<br>• EasyInvoice |
| **Yêu cầu** | • Chứng thư số CA hợp lệ<br>• API endpoint từ NCC<br>• Credentials |
| **Mức ưu tiên** | **M** (nếu tenant cần xuất VAT) |

### IR-04 — Đơn vị vận chuyển

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-04 |
| **Tên** | Tích hợp shipping carrier |
| **Loại** | Logistics |
| **Mô tả** | Tạo đơn giao tự động qua API của các đơn vị vận chuyển. |
| **Đối tác** | GHN, GHTK, J&T Express, Viettel Post, ShopeeExpress, Ahamove |
| **Cơ chế** | REST API + webhook callback cập nhật trạng thái |
| **Mức ưu tiên** | **S** |

### IR-05 — SMS gateway

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-05 |
| **Tên** | Tích hợp dịch vụ gửi SMS |
| **Loại** | Messaging |
| **Mô tả** | Gửi SMS OTP, marketing, notification. |
| **Đối tác** | Viettel SMS Brand, VinaSMS, eSMS, Twilio |
| **Tariff** | Tính phí theo số tin gửi (cấu hình ở Part 12) |
| **Mức ưu tiên** | **M** |

### IR-06 — Email service

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-06 |
| **Tên** | Tích hợp dịch vụ gửi email |
| **Loại** | Messaging |
| **Mô tả** | Gửi email transactional và marketing. |
| **Đối tác** | SMTP custom (Gmail, Office365), SendGrid, Mailgun, AWS SES |
| **Mức ưu tiên** | **M** |

### IR-07 — Zalo OA

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-07 |
| **Tên** | Tích hợp Zalo Official Account |
| **Loại** | Messaging |
| **Mô tả** | Gửi tin Zalo OA cho khách đã follow. |
| **Đối tác** | Zalo Open API |
| **Mức ưu tiên** | **S** |

### IR-08 — Facebook Messenger

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-08 |
| **Tên** | Tích hợp Facebook Messenger |
| **Loại** | Messaging + Social |
| **Mô tả** | Nhận inbox từ Fanpage và đẩy vào Phản hồi (UR-FEEDBACK-01). |
| **Đối tác** | Facebook Graph API |
| **Mức ưu tiên** | **C** |

### IR-09 — Webhook outbound

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-09 |
| **Tên** | Hệ thống gửi event ra ngoài qua webhook |
| **Loại** | Integration |
| **Mô tả** | Tenant tự đăng ký URL nhận event để tích hợp với app riêng (vd app khách hàng, dashboard tự build). |
| **Sự kiện được publish** | • `customer.created` / `customer.updated`<br>• `invoice.created` / `invoice.paid` / `invoice.cancelled` / `invoice.refunded`<br>• `checkin.created` / `checkin.completed`<br>• `shift.opened` / `shift.closed`<br>• `member.tier_changed`<br>• `payment.received` |
| **Format** | JSON, HTTP POST, header `X-Reborn-Signature` HMAC-SHA256 |
| **Reliability** | Retry tối đa 5 lần với exponential backoff |
| **Mức ưu tiên** | **S** |

---

## B. Yêu cầu dữ liệu

### DR-01 — Mô hình dữ liệu cốt lõi

| Trường | Nội dung |
|--------|----------|
| **ID** | DR-01 |
| **Tên** | Các entity trung tâm |
| **Mô tả** | Hệ thống phải quản lý các entity sau (mức cốt lõi): |

**Cây entity chính:**

```
Tenant (1)
├── Branch (n) — Cơ sở
│   ├── Warehouse (n) — Kho vật lý
│   ├── ShiftConfig (n) — Cấu hình ca
│   └── Shift (n) — Ca làm việc thực tế
│       └── Invoice (n) — Đơn hàng tạo trong ca
├── Department (n) — Phòng ban
├── Role (n) — Nhóm quyền
│   └── Permission (n) — Quyền cụ thể
├── User (n) — Nhân viên
│   ├── role_user (link)
│   └── branch_user (link)
├── Customer (n) — Khách hàng
│   ├── CustomerExtraInfo (n) — Trường tùy chỉnh
│   ├── Card (n) — Thẻ thành viên đang giữ
│   ├── LoyaltyWallet (1) — Ví điểm
│   └── CheckinLog (n) — Lịch sử check-in
├── Category (n) — Danh mục SP/DV
│   └── Product (n) — SP/DV
│       └── ProductVariant (n) — Biến thể
├── MembershipPlan (n) — Gói thành viên
│   └── PlanService (n) — Dịch vụ trong gói + quota
├── Supplier (n) — Nhà cung cấp
│   └── Material (n) — NVL
├── Partner (n) — Đối tác KOL/PO
├── Promotion (n) — Khuyến mãi
│   └── Voucher (n) — Mã voucher con
├── Campaign (n) — Chiến dịch marketing
│   └── CampaignDelivery (n) — Lịch sử gửi
├── Cashbook (n) — Sổ thu chi
│   ├── Fund (n) — Quỹ tài chính
│   └── FinanceCategory (n) — Khoản mục
├── Feedback (n) — Phản hồi khách
└── Ticket (n) — Ticket hỗ trợ
```

| **Mức ưu tiên** | **M** |

### DR-02 — Khóa định danh

| Trường | Nội dung |
|--------|----------|
| **ID** | DR-02 |
| **Tên** | Quy ước khóa cho các entity |
| **Mô tả** | Mọi entity phải có:<br>• `id` (BIGINT, PK, auto-increment)<br>• `tenantId` (BIGINT, NOT NULL, indexed) — để cô lập tenant<br>• `branchId` (nếu áp dụng)<br>• `createdAt`, `updatedAt` (TIMESTAMP)<br>• `createdBy`, `updatedBy` (BIGINT, FK user)<br>• `deletedAt` (TIMESTAMP NULL) — soft delete<br>• Các entity người dùng nhập có `code` (VARCHAR, unique trong scope tenant + branch) |
| **Mức ưu tiên** | **M** |

### DR-03 — Ràng buộc duy nhất

| Trường | Nội dung |
|--------|----------|
| **ID** | DR-03 |
| **Tên** | Unique constraints |
| **Mô tả** | Một số trường phải duy nhất trong scope phù hợp:<br>• Customer SĐT: unique trong (tenant, branch) — CN-01<br>• Mã sản phẩm / NVL: unique trong tenant<br>• Mã đơn / phiếu / hóa đơn: unique trong tenant<br>• Email user: unique toàn hệ thống (vì SSO) |
| **Mức ưu tiên** | **M** |

### DR-04 — Soft delete

| Trường | Nội dung |
|--------|----------|
| **ID** | DR-04 |
| **Tên** | Xóa mềm với cờ `deletedAt` |
| **Mô tả** | Hầu hết entity dùng soft delete. Hard delete chỉ áp dụng với:<br>• Phiếu / nhật ký vận hành ngắn hạn (chat, log session)<br>• Notification cũ > 90 ngày<br>Các entity nghiệp vụ cốt lõi (đơn, khách, hóa đơn, phiếu thu chi) **không bao giờ** xóa cứng để giữ audit. |
| **Mức ưu tiên** | **M** |

### DR-05 — Backup và lưu trữ

| Trường | Nội dung |
|--------|----------|
| **ID** | DR-05 |
| **Tên** | Chiến lược backup |
| **Mô tả** | • Full backup mỗi đêm (giữ 30 bản gần nhất)<br>• Incremental backup mỗi giờ (giữ 7 ngày)<br>• Backup được lưu off-site (cloud storage tách biệt với production DB)<br>• Test restore định kỳ mỗi tháng |
| **Mức ưu tiên** | **M** |

### DR-06 — Retention dữ liệu

| Trường | Nội dung |
|--------|----------|
| **ID** | DR-06 |
| **Tên** | Thời gian giữ các loại dữ liệu |
| **Mô tả** | • **Dữ liệu nghiệp vụ** (khách, đơn, hóa đơn, kho): không xóa, lưu vĩnh viễn<br>• **Audit log**: ≥ 2 năm<br>• **Session log**: ≥ 6 tháng<br>• **Notification**: 90 ngày, sau đó archive<br>• **Backup file**: theo DR-05<br>• **CMND/CCCD lưu trú**: ≥ 5 năm (NFR-LEGAL-04) |
| **Mức ưu tiên** | **M** |

### DR-07 — Migration dữ liệu khi onboard

| Trường | Nội dung |
|--------|----------|
| **ID** | DR-07 |
| **Tên** | Hỗ trợ chuyển dữ liệu từ hệ thống cũ |
| **Mô tả** | Khi tenant mới chuyển từ hệ thống khác sang Reborn CRM, đội triển khai phải có công cụ:<br>• Import khách hàng từ Excel (UR-MEMBER-08)<br>• Import sản phẩm/dịch vụ (UR-SETUP-09)<br>• Import NVL (tương tự)<br>• Có thể script tùy biến cho dữ liệu phức tạp (lịch sử đơn, công nợ) |
| **Mức ưu tiên** | **S** |

### DR-08 — Export full dữ liệu khi tenant rời đi

| Trường | Nội dung |
|--------|----------|
| **ID** | DR-08 |
| **Tên** | Quyền data portability của tenant |
| **Mô tả** | Khi tenant ngừng dịch vụ, họ có quyền yêu cầu xuất toàn bộ dữ liệu của mình ở định dạng chuẩn (Excel/CSV hoặc dump SQL). Đội Reborn cung cấp trong vòng 30 ngày kể từ ngày yêu cầu. |
| **Tuân thủ** | NFR-LEGAL-02 (Bảo vệ dữ liệu cá nhân) |
| **Mức ưu tiên** | **M** |

### DR-09 — Encryption tại nguồn

| Trường | Nội dung |
|--------|----------|
| **ID** | DR-09 |
| **Tên** | Mã hóa các trường nhạy cảm trong DB |
| **Mô tả** | Các trường sau lưu mã hóa AES-256 (column-level encryption):<br>• Mật khẩu (bcrypt, không phải AES)<br>• API key, secret key của tích hợp<br>• Token webhook, OAuth refresh token<br>• File CMND/CCCD (lưu trên S3 với SSE-S3) |
| **Mức ưu tiên** | **M** |

---

## C. Yêu cầu API

### IR-10 — REST API cho client

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-10 |
| **Tên** | Backend cung cấp REST API |
| **Mô tả** | Frontend (React app) và các app bên ngoài giao tiếp với backend qua REST API. |
| **Quy ước** | • JSON request/response<br>• Authentication qua Bearer token (JWT từ SSO)<br>• Versioning qua URL prefix `/api/v1/`<br>• Pagination chuẩn: `?page=1&limit=20`<br>• Filter: `?filter[field]=value`<br>• Sort: `?sort=field,-createdAt`<br>• Error format: `{ code, message, details? }` |
| **Mức ưu tiên** | **M** |

### IR-11 — API Documentation

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-11 |
| **Tên** | Có tài liệu API tự động |
| **Mô tả** | Backend phải có Swagger/OpenAPI spec public (cho dev nội bộ và khách hàng có quyền dev). |
| **Mức ưu tiên** | **S** |

### IR-12 — Rate limiting

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-12 |
| **Tên** | API rate limit |
| **Mô tả** | Mỗi tenant có quota request/phút. Mặc định 600 req/phút. Có thể nâng theo gói SaaS. Khi vượt → trả HTTP 429. |
| **Mức ưu tiên** | **S** |

---

## D. Hỗ trợ thiết bị ngoại vi

### IR-13 — Máy in nhiệt POS

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-13 |
| **Tên** | In trực tiếp qua máy in nhiệt |
| **Mô tả** | Hỗ trợ in hóa đơn qua máy in nhiệt 80mm/58mm cắm USB. |
| **Cơ chế** | Print qua trình duyệt (nếu driver hệ điều hành nhận) hoặc qua extension/agent client riêng. |
| **Mức ưu tiên** | **M** |

### IR-14 — Máy quét mã vạch

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-14 |
| **Tên** | Hỗ trợ máy quét mã vạch USB |
| **Mô tả** | Máy quét USB tiêu chuẩn HID (giả lập gõ phím) — chỉ cần focus vào ô tìm và quét. |
| **Mức ưu tiên** | **M** |

### IR-15 — Đầu đọc thẻ RFID/QR

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-15 |
| **Tên** | Đọc thẻ RFID hoặc camera quét QR cho check-in |
| **Mô tả** | Hỗ trợ thiết bị RFID HID (giả lập gõ phím) hoặc kết nối camera USB để quét QR. |
| **Mức ưu tiên** | **S** |

### IR-16 — Két thu ngân (Cash drawer)

| Trường | Nội dung |
|--------|----------|
| **ID** | IR-16 |
| **Tên** | Mở két tự động khi thanh toán tiền mặt |
| **Mô tả** | Két thu ngân kết nối qua máy in nhiệt (cable RJ11), tự mở khi in hóa đơn tiền mặt. |
| **Mức ưu tiên** | **S** |

---

## Tóm tắt yêu cầu Part 14

| Nhóm | Số yêu cầu | Must | Should | Could |
|------|:----------:|:----:|:------:|:-----:|
| Tích hợp ngoại vi | 9 | 4 | 4 | 1 |
| Yêu cầu dữ liệu | 9 | 8 | 1 | 0 |
| Yêu cầu API | 3 | 1 | 2 | 0 |
| Thiết bị ngoại vi | 4 | 2 | 2 | 0 |
| **Tổng** | **25** | **15** | **9** | **1** |

---

## Tổng kết toàn bộ URD

### Số lượng yêu cầu theo Part

| Part | Phân hệ | Tổng | M | S | C |
|------|---------|:----:|:-:|:-:|:-:|
| 01 | Truy cập hệ thống | 12 | 8 | 4 | 0 |
| 02 | Lễ tân | 20 | 11 | 8 | 1 |
| 03 | Thành viên | 16 | 5 | 8 | 3 |
| 04 | Giao dịch | 8 | 5 | 3 | 0 |
| 05 | Lưu trú | 7 | 5 | 2 | 0 |
| 06 | Tài chính | 11 | 8 | 3 | 0 |
| 07 | Đối tác & Phản hồi | 9 | 0 | 8 | 1 |
| 08 | Báo cáo | 8 | 4 | 3 | 1 |
| 09 | Ưu đãi & Chăm sóc | 12 | 2 | 7 | 3 |
| 10 | Kho & NVL | 9 | 8 | 1 | 0 |
| 11 | Cài đặt cơ bản | 14 | 8 | 5 | 1 |
| 12 | Cài đặt nâng cao | 23 | 6 | 11 | 6 |
| 13 | Phi chức năng | 37 | 20 | 15 | 2 |
| 14 | Tích hợp & Dữ liệu | 25 | 15 | 9 | 1 |
| **Tổng** | | **211** | **105** | **87** | **19** |

### Phân bổ ưu tiên

- **Must (M):** 105 yêu cầu — ~50%. Là tập tối thiểu cần đáp ứng cho phiên bản đầu.
- **Should (S):** 87 yêu cầu — ~41%. Quan trọng, nên có sớm.
- **Could (C):** 19 yêu cầu — ~9%. Tốt để có, có thể đẩy sang phiên bản sau.

### Trace từ HDSD ↔ URD

Mỗi mục trong HDSD (`docs/userguides/`) tương ứng với một hoặc nhiều yêu cầu trong URD này. Khi cần cập nhật:
- Thay đổi nghiệp vụ → cập nhật cả HDSD lẫn URD.
- Phát hiện lỗi → tham chiếu Tiêu chí chấp nhận trong URD để xác định behavior đúng.
- Lên scope phiên bản mới → review các yêu cầu Could/Won't và promote lên Should/Must.

---

*Hết Part 14 — Hết URD.*
