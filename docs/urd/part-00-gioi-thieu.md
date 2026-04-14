# Part 00 — Giới thiệu & Tổng quan

## 1. Mục đích tài liệu

Tài liệu **User Requirement Document (URD)** này mô tả **đầy đủ các yêu cầu nghiệp vụ và chức năng** mà hệ thống **Reborn CRM** — biến thể *Cửa hàng / Spa / Cộng đồng* — phải đáp ứng. Tài liệu được biên soạn ngược (reverse-engineered) từ:

1. **Source code** hiện có trong repository `cloud-crm` (React + TypeScript, ~167 trang).
2. **Hành vi thực tế** quan sát được khi vận hành hệ thống tại tenant test (`localhost:4000` + SSO `localhost:8080`).
3. **Tài liệu HDSD** (`docs/userguides/HDSD-full-final.md`) đã được biên soạn trước cho người dùng cuối.

URD KHÔNG hướng dẫn thao tác (đó là việc của HDSD). URD trả lời câu hỏi **"Hệ thống PHẢI làm được những gì?"** ở mức yêu cầu nghiệp vụ và chức năng, kèm tiêu chí nghiệm thu rõ ràng.

## 2. Phạm vi hệ thống

### 2.1. Trong phạm vi (In-scope)

Reborn CRM phục vụ các loại hình kinh doanh sau:

- **Spa, thẩm mỹ viện** — bán dịch vụ theo gói + sản phẩm chăm sóc.
- **Phòng tập / fitness club** — gói thành viên có quota dịch vụ.
- **Co-working space / community hub** — check-in theo ngày + dịch vụ kèm.
- **Homestay / căn hộ dịch vụ** — đặt phòng + lưu trú.
- **Cửa hàng bán lẻ kết hợp dịch vụ** — sản phẩm + dịch vụ trong cùng một điểm bán.
- **Trung tâm chăm sóc sức khỏe / clinic nhỏ** — đặt lịch + lịch sử bệnh nhân (ở mức cơ bản).

Hệ thống bao phủ các nhóm chức năng:

1. Quản lý khách hàng (CRM cốt lõi)
2. Bán hàng tại quầy (POS)
3. Quản lý ca làm việc & quỹ tiền mặt
4. Đặt lịch / Booking / Lưu trú
5. Quản lý kho & nguyên vật liệu
6. Tài chính & Công nợ
7. Marketing automation đa kênh (SMS / Email / Zalo / Facebook)
8. Loyalty & khuyến mãi
9. Báo cáo phân tích kinh doanh
10. Cấu hình tenant đa cơ sở
11. Phân quyền & bảo mật
12. Tích hợp bên thứ ba (thanh toán, vận chuyển, hóa đơn điện tử)

### 2.2. Ngoài phạm vi (Out-of-scope)

URD này KHÔNG bao phủ:

- Hệ thống **kế toán đầy đủ** theo chuẩn Việt Nam (chỉ ghi nhận thu chi cơ bản, không đáp ứng báo cáo tài chính theo TT200 / TT133).
- Hệ thống **HRM / chấm công** đầy đủ (chỉ có ca làm việc cơ bản, không tính lương theo công thức phức tạp).
- Hệ thống **ERP sản xuất** (chỉ có nhập xuất tồn, không có MRP / BOM phức tạp).
- **Mobile app cho khách hàng** (chỉ có giao diện web, có thể tích hợp với app riêng qua API).
- **AI / Machine Learning** dự đoán hành vi khách (có thể có ở phiên bản tương lai).

## 3. Stakeholders & Actors

### 3.1. Stakeholders (bên liên quan)

| Stakeholder | Vai trò trong dự án | Mối quan tâm chính |
|-------------|---------------------|--------------------|
| **Chủ doanh nghiệp / Founder** | Người đầu tư, quyết định mua/thuê hệ thống | ROI, doanh thu, mức độ tự động hóa |
| **Quản lý cơ sở** | Vận hành hằng ngày, ra quyết định ngắn hạn | Báo cáo, KPI nhân viên, công cụ điều phối |
| **Nhân viên lễ tân / thu ngân** | Người dùng chính tại quầy | Tốc độ thao tác, dễ dùng, ít lỗi |
| **Kỹ thuật viên / nhân viên dịch vụ** | Người trực tiếp cung cấp dịch vụ | Lịch làm việc, lịch khách, hoa hồng |
| **Kế toán nội bộ** | Theo dõi tiền, thuế, công nợ | Sổ thu chi đầy đủ, đối soát chính xác |
| **Marketing / CSKH** | Lên chiến dịch, chăm sóc khách | Phân khúc, automation, tỷ lệ chuyển đổi |
| **Đội triển khai Reborn** | Setup tenant, đào tạo, hỗ trợ | Cài đặt linh hoạt, dễ tùy biến |
| **Đội phát triển Reborn** | Bảo trì, nâng cấp | Kiến trúc rõ, dễ mở rộng |

### 3.2. Actors (vai trò trong hệ thống)

URD dùng các Actor sau xuyên suốt:

| Actor | Mô tả | Quyền cốt lõi |
|-------|-------|---------------|
| **Khách (Guest)** | Người chưa đăng nhập | Không có (chỉ thấy trang login) |
| **Nhân viên (Staff)** | Đăng nhập với vai trò thường | Bán hàng, check-in, xem khách |
| **Lễ tân (Receptionist)** | Staff chuyên trực quầy | + mở/đóng ca, in hóa đơn |
| **Kỹ thuật viên (Technician)** | Staff cung cấp dịch vụ | + xem lịch của mình, trừ quota |
| **Kế toán (Accountant)** | Staff phụ trách tài chính | + thu chi, công nợ, đối soát |
| **Marketing (Marketer)** | Staff phụ trách MKT | + tạo chiến dịch, gửi mass message |
| **Quản lý cơ sở (Branch Manager)** | Quản lý cấp cơ sở | + xem báo cáo cơ sở, duyệt phiếu |
| **Quản lý tenant (Tenant Admin)** | Admin của đơn vị thuê | + cấu hình toàn cục, phân quyền |
| **Super Admin (Reborn)** | Đội Reborn vận hành SaaS | + quản lý nhiều tenant, monitor hệ thống |
| **Hệ thống (System)** | Tác nhân tự động (cron, automation) | Chạy job định kỳ, gửi notification |
| **Bên thứ ba (Third-party)** | API ngoại — payment, SMS, vận chuyển… | Webhook, callback |

### 3.3. Sơ đồ phân cấp Actor

```
Super Admin (Reborn)
└── Tenant Admin (Khách hàng tenant)
    └── Branch Manager (Quản lý cơ sở)
        ├── Receptionist
        ├── Technician
        ├── Accountant
        └── Marketer
```

Mỗi cấp **kế thừa quyền** của cấp dưới (cấu hình ở Part 12).

## 4. Glossary — Thuật ngữ

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **Tenant** | Một đơn vị thuê hệ thống (1 doanh nghiệp khách hàng), có dữ liệu cô lập với tenant khác |
| **Cơ sở (Branch)** | Một điểm bán/cửa hàng vật lý của tenant. 1 tenant có thể có nhiều cơ sở |
| **Ca làm việc (Shift)** | Khoảng thời gian nhân viên trực quầy có ghi nhận dòng tiền độc lập |
| **POS** | Point of Sale — màn hình bán hàng tại quầy |
| **Quota** | Số lượt dịch vụ trong gói thành viên mà khách được dùng |
| **Gói thành viên (Plan)** | Sản phẩm bán theo dạng gói có thời hạn + quota dịch vụ |
| **Hạng thẻ (Tier)** | Cấp độ thành viên (Basic/Silver/Gold/Diamond) lên theo tổng chi tiêu |
| **MRR** | Monthly Recurring Revenue — doanh thu định kỳ hằng tháng |
| **AOV** | Average Order Value — giá trị đơn hàng trung bình |
| **ARPU** | Average Revenue Per User — doanh thu trung bình / khách |
| **Churn** | Khách rời bỏ hệ thống (không quay lại trong N ngày) |
| **Retention** | Tỷ lệ khách giữ chân được |
| **KOL** | Key Opinion Leader — người ảnh hưởng giới thiệu khách |
| **PO (đối tác)** | Purchase Order — đơn đặt hàng từ đại lý sỉ |
| **SLA** | Service Level Agreement — cam kết thời gian xử lý |
| **SSO** | Single Sign-On — đăng nhập một lần dùng cho nhiều ứng dụng |
| **2FA** | Two-Factor Authentication — xác thực hai bước |
| **Webhook** | Cơ chế callback HTTP từ hệ thống ra bên ngoài khi có sự kiện |
| **VAT** | Thuế giá trị gia tăng |
| **MST** | Mã số thuế |
| **NCC** | Nhà cung cấp |
| **NVL** | Nguyên vật liệu |
| **CRUD** | Create / Read / Update / Delete — 4 thao tác cơ bản trên dữ liệu |
| **MoSCoW** | Phương pháp xếp ưu tiên: Must / Should / Could / Won't |

## 5. Giả định & Ràng buộc

### 5.1. Giả định (Assumptions)

| ID | Giả định |
|----|----------|
| AS-01 | Mỗi tenant có ít nhất 1 cơ sở vật lý hoặc 1 cơ sở "ảo" để gán dữ liệu |
| AS-02 | Người dùng có máy tính chạy trình duyệt hiện đại (Chrome / Edge / Safari ≥ 2 phiên bản gần nhất) |
| AS-03 | Có internet ổn định khi vận hành (hệ thống không hỗ trợ offline) |
| AS-04 | Số điện thoại Việt Nam là phương tiện định danh chính của khách hàng |
| AS-05 | Tiền tệ mặc định là VND, có thể đổi sang USD/EUR cho các tenant quốc tế |
| AS-06 | Mọi dữ liệu nhạy cảm (mật khẩu, token, API key) được mã hóa khi lưu |
| AS-07 | Dữ liệu được backup định kỳ bởi đội Reborn (không phải tenant tự backup) |

### 5.2. Ràng buộc (Constraints)

| ID | Ràng buộc | Lý do |
|----|-----------|-------|
| CN-01 | Số điện thoại trong cùng một cơ sở phải duy nhất | Dùng làm khóa định danh khách |
| CN-02 | Một nhân viên không thể mở 2 ca cùng lúc trên cùng cơ sở | Tránh tranh chấp quỹ |
| CN-03 | Đơn hàng đã thanh toán không thể xóa, chỉ có thể hoàn / hủy | Bảo toàn audit trail |
| CN-04 | Hóa đơn VAT đã phát hành không sửa được, chỉ có thể hủy + phát hành lại | Theo quy định Tổng cục Thuế |
| CN-05 | Mật khẩu phải ≥ 8 ký tự, có chữ hoa + thường + số | Chính sách bảo mật |
| CN-06 | Phiếu đối soát thanh toán đã chốt không sửa được trong cùng kỳ | Audit |
| CN-07 | Trường tùy chỉnh (custom field) đã tạo không đổi mã (`fieldCode`) | Backend dùng làm khóa |
| CN-08 | Số lượng cơ sở / nhân viên / khách bị giới hạn theo gói SaaS đã thuê | Mô hình thương mại |

## 6. Cấu trúc tài liệu

URD chia thành **15 part**, được phân nhóm như sau:

- **Tổng quan** (Part này): mục đích, scope, actor, glossary
- **Chức năng** (Part 01–12): tương ứng 12 mục trên Menu chính
- **Phi chức năng** (Part 13): performance, security, usability, reliability
- **Tích hợp & dữ liệu** (Part 14): API, webhook, mô hình dữ liệu

Mỗi Part chức năng mở đầu bằng **mô tả phân hệ + danh sách actor liên quan**, rồi liệt kê **các yêu cầu (UR)** theo template chuẩn (xem README).

## 7. Lịch sử phiên bản

| Phiên bản | Ngày | Người soạn | Mô tả |
|-----------|------|------------|-------|
| 1.0 | 2026-04-14 | Reborn (reverse-engineered từ codebase + HDSD) | Bản đầu tiên, biên soạn ngược từ hệ thống đang chạy |

## 8. Phê duyệt

| Vai trò | Họ tên | Chữ ký | Ngày |
|---------|--------|--------|------|
| Đại diện Khách hàng | | | |
| PM Reborn | | | |
| Tech Lead Reborn | | | |
| QA Lead Reborn | | | |

---

*Hết Part 00.*
