# Part 12 — Cài đặt (Tenant Admin)

> **Dành cho**: Tenant Admin, Chủ cửa hàng, Đội triển khai Reborn
> **Mức độ**: Trung cấp → Nâng cao
> **Tham chiếu URD**: [Part 12 — Cài đặt](../urd/part-12-cai-dat.md) (UR-SET-01 → UR-SET-30)

Part này hướng dẫn **setup ban đầu tenant** — cấu hình công ty, tạo cơ sở, tạo user, phân quyền, tích hợp các dịch vụ bên ngoài. Nếu bạn là **người đầu tiên** đăng nhập CRM sau khi mua license, hãy làm tuần tự theo checklist cuối part.

## Mục lục
- [1. Cập nhật thông tin tenant](#1-cập-nhật-thông-tin-tenant)
- [2. Quản lý cơ sở (chi nhánh)](#2-quản-lý-cơ-sở-chi-nhánh)
- [3. Quản lý tổ chức (phòng ban)](#3-quản-lý-tổ-chức-phòng-ban)
- [4. Tạo user mới](#4-tạo-user-mới)
- [5. Gán role cho user](#5-gán-role-cho-user)
- [6. Tạo role tuỳ chỉnh](#6-tạo-role-tuỳ-chỉnh)
- [7. Cấu hình sản phẩm/dịch vụ mặc định](#7-cấu-hình-sản-phẩmdịch-vụ-mặc-định)
- [8. Cấu hình kênh bán](#8-cấu-hình-kênh-bán)
- [9. Cấu hình ticket/warranty](#9-cấu-hình-ticketwarranty)
- [10. Tích hợp bên ngoài](#10-tích-hợp-bên-ngoài)
- [11. Setup checklist ban đầu](#11-setup-checklist-ban-đầu)
- [FAQ](#faq)

---

## 1. Cập nhật thông tin tenant

Sidebar → **Cài đặt → Thông tin công ty** (`/setting_tenant`).

### Các field

- **Tên đầy đủ** (in trên hoá đơn)
- **Tên viết tắt / Brand**
- **Mã số thuế** (bắt buộc nếu phát hành VAT)
- **Địa chỉ trụ sở**
- **SĐT, Email, Website**
- **Logo** (PNG/SVG ≤ 2MB) — hiển thị góc trên trái + trên hoá đơn/bill
- **Chữ ký đại diện** (ảnh) — cho hợp đồng
- **Múi giờ**: mặc định `Asia/Ho_Chi_Minh`
- **Tiền tệ**: mặc định VND
- **Ngôn ngữ mặc định**: VI

Nhấn **[Lưu]**.

💡 **Mẹo**: Thay **favicon** cũng ở đây để tab trình duyệt có logo brand.

---

## 2. Quản lý cơ sở (chi nhánh)

Cơ sở = **địa điểm vật lý** — cửa hàng, kho, văn phòng. Mỗi tenant có **≥ 1 cơ sở**.

Sidebar → **Cài đặt → Cơ sở** (`/setting_branch`).

### 2.1. Tạo cơ sở mới

Nhấn **[+ Tạo cơ sở]**.

- **Tên** (ví dụ "Cửa hàng Hà Nội 1")
- **Mã** (ví dụ `HN01`)
- **Loại**: Cửa hàng / Kho / Văn phòng / Xưởng
- **Địa chỉ** đầy đủ (tỉnh, huyện, xã, chi tiết)
- **Toạ độ GPS** (tuỳ chọn, pick từ map)
- **SĐT, Email**
- **Quản lý phụ trách** (pick từ danh sách user)
- **Giờ mở cửa**: ví dụ 8:00 - 22:00
- **Trạng thái**: Active / Inactive

Nhấn **[Lưu]**.

### 2.2. Kho mặc định

Mỗi cơ sở có **1 kho mặc định** — khi bán hàng POS sẽ trừ tồn kho này. Xem thêm [Part 05 — Kho](part-05-kho-san-pham.md).

### 2.3. Phân quyền theo cơ sở

User có thể được gán **nhiều cơ sở** — chỉ thấy data của cơ sở mình quản lý.

⚠️ **Chú ý**: Xoá cơ sở **không thực sự xoá** — chỉ inactive. Dữ liệu đơn hàng cũ vẫn giữ.

---

## 3. Quản lý tổ chức (phòng ban)

Tổ chức = **sơ đồ phòng ban** — dùng cho HR và phân quyền.

Sidebar → **Cài đặt → Tổ chức** (`/setting_organization`).

### Cấu trúc cây

```
Công ty
├── Khối kinh doanh
│   ├── Bán hàng
│   └── Marketing
├── Khối vận hành
│   ├── Kho
│   └── Giao hàng
└── Khối hỗ trợ
    ├── Kế toán
    └── CSKH
```

### Tạo node

Click vào node cha → **[+ Thêm phòng ban con]** → nhập tên + mã → Lưu.

### Di chuyển

Drag-drop node sang vị trí mới.

Mỗi user thuộc **≥ 1 phòng ban**.

💡 **Mẹo**: Phòng ban hữu ích cho **báo cáo nhân sự** + **workflow approval** (cấp trên duyệt).

---

## 4. Tạo user mới

Sidebar → **Cài đặt → Người dùng** (`/setting_user`) → **[+ Tạo user]**.

### Bước 1: Điền thông tin

- **Họ tên** (bắt buộc)
- **SĐT** (10 số, duy nhất trong hệ thống)
- **Email** (duy nhất)
- **Phòng ban**
- **Cơ sở làm việc** (1 hoặc nhiều)
- **Chức vụ** (label, không ảnh hưởng quyền)
- **Mã nhân viên** (tuỳ chọn)
- **Ngày vào làm**

### Bước 2: Gán role

(Xem mục 5)

### Bước 3: Gửi invite

Chọn **cách kích hoạt tài khoản**:

- **Gửi email invite** — user nhận link setup mật khẩu
- **Tạo mật khẩu tạm** — bạn đặt mật khẩu, user đổi lần login đầu

Nhấn **[Tạo user]**.

⚠️ **Chú ý**:
- SĐT/Email **không trùng** với user hiện có.
- User **chưa activate** sẽ ở trạng thái *Pending* — không login được.
- User quên activate > 7 ngày → gửi lại invite (nút **Resend**).

### Vô hiệu hoá user

Không xoá user đã có giao dịch (ảnh hưởng audit). Thay vào đó, bấm **Disable** — user không login được nhưng data vẫn còn.

💡 **Mẹo**: Khi nhân viên nghỉ việc, **disable ngay** để bảo mật.

> 🖼️ *Ảnh minh hoạ: Form tạo user + gán role — chụp sau*

---

## 5. Gán role cho user

Role = **tập hợp quyền**. Mỗi user được gán **≥ 1 role**.

### Cách gán

1. Vào trang user → tab **Quyền**.
2. Chọn từ dropdown **Role có sẵn**:
   - `tenant_admin`
   - `store_manager`
   - `cashier`
   - `warehouse_staff`
   - `accountant`
   - `purchaser`
   - `marketing_staff`
   - `cskh_staff`
   - `viewer` (chỉ xem)
3. Có thể gán **nhiều role** — quyền là **union**.
4. Nhấn **[Lưu]**.

💡 **Mẹo**: Gán **role chính** trước, role phụ sau. Luôn áp dụng **least privilege** — chỉ cho quyền tối thiểu cần thiết.

🔒 **Chú ý bảo mật**: Chỉ có **tenant_admin** mới được gán role `tenant_admin`. Tránh gán bừa — user có tenant_admin sẽ thấy & sửa được tất cả.

---

## 6. Tạo role tuỳ chỉnh

Nếu role mặc định không đủ, tạo **custom role**.

Sidebar → **Cài đặt → Role** (`/setting_role`) → **[+ Tạo role]**.

### Bước 1: Thông tin chung

- **Tên role** (ví dụ "Trưởng ca")
- **Mô tả**
- **Scope**: Toàn tenant / Theo cơ sở

### Bước 2: Chọn permissions

Cây quyền chia theo **module → action**:

```
Bán hàng
  ├── [x] pos.sale.create
  ├── [x] pos.sale.view
  ├── [ ] pos.sale.delete
  ├── [x] pos.refund.create
  └── [ ] pos.price_override
Khách hàng
  ├── [x] customer.view
  ├── [x] customer.create
  ├── [ ] customer.delete
  └── [ ] customer.export
Kho
  ├── [x] inventory.view
  └── [ ] inventory.adjust
...
```

Tick các permission muốn gán.

### Bước 3: Lưu

Nhấn **[Lưu role]** → role hiện ngay trong dropdown khi tạo/sửa user.

⚠️ **Chú ý**: Đổi permission của role **đã gán cho user** → **tất cả user đó bị ảnh hưởng ngay**. Cẩn thận khi edit role production.

💡 **Mẹo**: Dùng **[Duplicate]** để clone role có sẵn rồi chỉnh — nhanh hơn tạo từ đầu.

> 🖼️ *Ảnh minh hoạ: Cây permission của role custom — chụp sau*

---

## 7. Cấu hình sản phẩm/dịch vụ mặc định

Sidebar → **Cài đặt → Sản phẩm** (`/setting_product_default`).

### Các option

- **Mã SKU tự sinh**: prefix (ví dụ `SP`) + độ dài số
- **Barcode format**: EAN13 / Code128 / QR
- **Đơn vị mặc định**: Cái / Kg / Thùng
- **VAT mặc định**: 10% / 8% / 0% / không
- **Giá vốn tính theo**: FIFO / LIFO / Trung bình gia quyền
- **Bật serial tracking**: Yes/No (áp dụng cho SP điện tử, xe máy...)
- **Cho phép giá âm**: No (hiếm khi Yes)
- **Cảnh báo tồn thấp**: ngưỡng mặc định (ví dụ 5)

Nhấn **[Lưu]**.

💡 **Mẹo**: Setup **một lần đầu** — sau đó mỗi SP mới kế thừa các giá trị này, chỉ cần override khi khác.

---

## 8. Cấu hình kênh bán

Sidebar → **Cài đặt → Kênh bán** (`/setting_sales_channel`).

### Các kênh hỗ trợ

| Kênh | Ghi chú |
|---|---|
| **POS (offline)** | Mặc định, luôn bật |
| **Website riêng** | Cần cấu hình CMS/headless commerce |
| **Shopee** | Kết nối qua Shopee Partner API |
| **Lazada** | OAuth với seller center |
| **TikTok Shop** | Qua TikTok Shop API |
| **Tiki** | Qua Tiki Open API |
| **Zalo Mini App** | Cần Zalo developer account |
| **Facebook Shop** | Facebook Commerce Manager |

### Connect 1 kênh

Click kênh → tab **Cấu hình** → nhập credentials → **[Test]** → **[Bật]**.

Sau khi bật:
- **Sync sản phẩm**: đẩy SP từ CRM lên marketplace
- **Sync đơn hàng**: pull đơn về CRM
- **Sync tồn kho**: realtime 2 chiều
- **Sync giá / KM**

⚠️ **Chú ý**: Token marketplace thường expired sau 30-90 ngày — hệ thống cảnh báo trước 7 ngày.

💡 **Mẹo**: Bật **1 kênh tại 1 thời điểm** để kiểm soát — đừng bật 5 kênh cùng ngày.

---

## 9. Cấu hình ticket/warranty

Sidebar → **Cài đặt → Ticket** (`/setting_ticket`).

### 9.1. Loại ticket

Mặc định có: Khiếu nại, Hỏi đáp, Bảo hành, Đổi trả. Thêm loại tuỳ công ty: *Yêu cầu báo giá*, *Tư vấn*...

Mỗi loại có:

- **Tên**
- **SLA phản hồi** (giờ)
- **SLA giải quyết** (giờ)
- **Auto-assign cho phòng ban nào**
- **Template trả lời mặc định**

### 9.2. Status workflow

Custom workflow cho ticket — drag-drop:

```
NEW → IN_PROGRESS → WAITING_CUSTOMER → RESOLVED → CLOSED
```

Thêm status: `ESCALATED`, `REJECTED`, `PENDING_APPROVAL`...

### 9.3. Cấu hình warranty

- **Thời hạn BH mặc định** theo category SP
- **Trung tâm BH**: danh sách xưởng sửa + địa chỉ
- **Template biên nhận BH**: PDF mẫu

Nhấn **[Lưu]**.

---

## 10. Tích hợp bên ngoài

Sidebar → **Cài đặt → Tích hợp** (`/setting_integration`).

Các nhóm:

### 10.1. Thanh toán

- VNPay, MoMo, ZaloPay, VietQR — xem [Part 08](part-08-tai-chinh.md) mục 9.

### 10.2. Hoá đơn điện tử

- VNPT einvoice, M-Invoice, Viettel-Invoice
- Nhập: MST, mẫu số, ký hiệu, credentials
- **[Test phát hành]** hoá đơn mẫu

### 10.3. SMS Gateway

- Esms, VihatTel, Twilio
- Nhập API key + brand name đã đăng ký
- Test gửi

### 10.4. Email (SMTP)

- Gmail SMTP, SendGrid, Mailgun, AWS SES
- Verify domain (SPF/DKIM)
- Test gửi

### 10.5. Shipping

- GHN, GHTK, J&T, Viettel Post, Ninja Van
- Connect token → sync cước phí + tracking tự động
- Xem [Part 07 — Vận chuyển](part-07-van-chuyen.md)

### 10.6. Marketplace

- Xem mục 8

### 10.7. Kế toán ngoài

- MISA, Fast — export đồng bộ 1 chiều dữ liệu bán hàng

### 10.8. Chatbot / AI

- OpenAI, Anthropic — dùng cho AI reply ticket, tóm tắt call log

Mỗi tích hợp đều có nút **[Test kết nối]** — hãy test ngay sau khi setup.

⚠️ **Chú ý**: Lưu API key / secret **an toàn** — chỉ tenant_admin thấy được. Không share qua chat.

---

## 11. Setup checklist ban đầu

Khi tenant mới, làm theo thứ tự:

### Ngày 1 — Công ty + Cơ sở

- [ ] Cập nhật thông tin công ty (mục 1)
- [ ] Upload logo + chữ ký
- [ ] Tạo các cơ sở (mục 2)
- [ ] Tạo phòng ban (mục 3)

### Ngày 2 — Users + Permissions

- [ ] Tạo user tenant_admin thứ 2 (backup)
- [ ] Tạo các user cho Store Manager / Cashier
- [ ] Gán role chuẩn (mục 5)
- [ ] Nếu cần: tạo custom role (mục 6)

### Ngày 3 — Sản phẩm + Kho

- [ ] Cấu hình default SP (mục 7)
- [ ] Import danh mục SP (xem [Part 05](part-05-kho-san-pham.md))
- [ ] Nhập tồn kho ban đầu
- [ ] Tạo NCC

### Ngày 4 — Tích hợp

- [ ] Cấu hình payment methods (xem Part 08)
- [ ] Connect hoá đơn điện tử (mục 10.2)
- [ ] Connect SMS (mục 10.3)
- [ ] Connect shipping (mục 10.5)

### Ngày 5 — Marketing + Loyalty

- [ ] Cấu hình loyalty (xem [Part 10](part-10-loyalty-cham-soc.md))
- [ ] Cấu hình hạng thẻ
- [ ] Tạo KM chào mừng
- [ ] Connect Zalo OA

### Ngày 6 — Ticket + Finance

- [ ] Cấu hình ticket/warranty (mục 9)
- [ ] Tạo quỹ tài chính + khoản mục (xem Part 08)

### Ngày 7 — Đào tạo + Go-live

- [ ] Training nhân viên 1 buổi dùng POS
- [ ] Test bán 1 đơn thật → đối soát
- [ ] Kiểm tra báo cáo
- [ ] **Go-live** 🚀

💡 **Mẹo**: Không vội làm tất cả trong 1 ngày. Chia nhỏ, test từng phần trước khi nhập data thật.

---

## FAQ

**1. Tôi mất tài khoản tenant_admin duy nhất — làm sao khôi phục?**
Liên hệ **Reborn support** kèm bằng chứng sở hữu tenant (email đăng ký, hợp đồng). Support sẽ reset qua quy trình bảo mật.

**2. Có thể xoá cơ sở không?**
Không xoá cứng — chỉ **inactive**. Dữ liệu giao dịch cũ được giữ vĩnh viễn để audit.

**3. User login nhưng không thấy menu nào?**
(a) Kiểm tra role đã gán chưa; (b) Kiểm tra cơ sở đã assign chưa; (c) Permission có đủ không. Dùng chức năng **"View as user"** trong trang user để test.

**4. Tôi muốn import 50 user cùng lúc?**
Dùng **[Import Excel]** trong trang Users. Template có sẵn. Tối đa 500 user/lần.

**5. Đổi mật khẩu toàn bộ user được không?**
Không bulk. Có thể **force reset** toàn bộ — lần login tới ai cũng phải đổi. Dùng khi có sự cố bảo mật.

**6. Có audit log ai đã làm gì không?**
Có — Sidebar → **Cài đặt → Audit log** (`/audit_log`). Filter theo user, action, thời gian. Giữ **1 năm**.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "SĐT đã tồn tại" | User trùng | Kiểm tra user cũ, disable nếu cần |
| "Role không thể gán" | Không có quyền | Nhờ tenant_admin gán |
| "Integration test failed" | Credentials sai / mạng | Check lại, đọc error message |
| "Email invite không tới" | Domain block | Dùng mật khẩu tạm thay invite |
| "Quá số user license" | Vượt quota | Nâng gói / disable user không dùng |

---

*Hết Part 12. Xem tiếp [Part 13 — BPM & Tự động hoá](part-13-bpm-nang-cao.md).*
