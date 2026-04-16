# Part 00 — Giới thiệu

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## 1. Mục đích

Tài liệu này mô tả yêu cầu người dùng (User Requirements) cho hệ thống **Reborn Tech CRM** — giải pháp CRM B2B chuyên biệt dành cho **doanh nghiệp công nghệ và dịch vụ CNTT** (phần mềm, tích hợp hệ thống, outsourcing, managed services, cloud, bảo mật, v.v.).

Mục tiêu:
- Chuẩn hóa quy trình bán hàng B2B từ lead đến hợp đồng và dự án triển khai.
- Quản lý toàn bộ vòng đời khách hàng: tiếp cận → tư vấn → chốt deal → triển khai → hỗ trợ → gia hạn.
- Tự động hóa nghiệp vụ (BPM), marketing, và theo dõi KPI đội ngũ.
- Tích hợp tài chính, kho/tài sản, và báo cáo quản trị.

---

## 2. Phạm vi Hệ thống

### 2.1 Các module chính

| # | Module | Mã | Mô tả ngắn |
|---|--------|----|-------------|
| 1 | Khách hàng & Liên hệ | CUS | Hồ sơ doanh nghiệp, người liên hệ, đối tác, phân khúc |
| 2 | Quy trình Bán hàng | SALE | Cơ hội, báo giá, hợp đồng, hoá đơn, pipeline |
| 3 | Quản lý Dự án | PROJ | Dự án triển khai, milestone, task, timesheet |
| 4 | Hỗ trợ & Bảo hành | TKT | Ticket, SLA, warranty, knowledge base |
| 5 | BPM Workflow | BPM | Thiết kế quy trình phê duyệt, tự động hoá |
| 6 | Marketing Automation | MKT | Chiến dịch Email/SMS/Zalo, lead scoring |
| 7 | KPI | KPI | Chỉ tiêu, đánh giá hiệu suất nhân viên |
| 8 | Tài chính & Công nợ | FIN | Doanh thu, chi phí, công nợ, đối soát |
| 9 | Báo cáo | RPT | Dashboard, báo cáo tuỳ chỉnh, xuất Excel/PDF |
| 10 | Kho & Tài sản | INV | Sản phẩm, license, thiết bị, serial |
| 11 | Cài đặt | SET | Tenant, user, role, cấu hình hệ thống |

### 2.2 Ngoài phạm vi (v1.0)

- Kế toán tổng hợp (chỉ quản lý công nợ, không thay thế phần mềm kế toán).
- ERP sản xuất.
- Ứng dụng mobile native (hỗ trợ responsive web).

---

## 3. Các bên liên quan (Stakeholders)

| Vai trò | Mô tả | Module chính sử dụng |
|---------|--------|----------------------|
| **Sales** (Nhân viên kinh doanh) | Quản lý lead, cơ hội, báo giá, chốt hợp đồng | CUS, SALE, MKT |
| **Sales Manager** (Trưởng phòng KD) | Giám sát pipeline, forecast, KPI đội ngũ | SALE, KPI, RPT |
| **Project Manager** (Quản lý dự án) | Triển khai dự án sau chốt hợp đồng, quản lý task, resource | PROJ, TKT |
| **Support / Helpdesk** (Hỗ trợ kỹ thuật) | Tiếp nhận ticket, xử lý SLA, bảo hành | TKT |
| **Marketing** | Chạy chiến dịch, nuôi dưỡng lead | MKT, CUS |
| **Finance** (Kế toán / Tài chính) | Quản lý hoá đơn, công nợ, đối soát | FIN, SALE |
| **Admin** (Quản trị hệ thống) | Cấu hình tenant, phân quyền, BPM | SET, BPM, AUTH |
| **CEO / Ban giám đốc** | Xem dashboard tổng hợp, ra quyết định | RPT, KPI |

---

## 4. Phương pháp Ưu tiên — MoSCoW

| Ký hiệu | Ý nghĩa | Mô tả |
|----------|---------|-------|
| **M** — Must have | Bắt buộc | Không có thì hệ thống không hoạt động được. Release v1.0 phải có. |
| **S** — Should have | Nên có | Quan trọng nhưng có thể workaround tạm. Ưu tiên cao cho v1.1. |
| **C** — Could have | Có thể có | Nâng cao trải nghiệm, triển khai khi còn resource. |
| **W** — Won't have | Không làm (đợt này) | Ghi nhận nhưng chưa triển khai trong release hiện tại. |

### Tổng quan phân bổ ưu tiên (dự kiến)

| Module | M | S | C | W |
|--------|---|---|---|---|
| Khách hàng & Liên hệ | 3 | 1 | 1 | 0 |
| Quy trình Bán hàng | 4 | 1 | 0 | 0 |
| Quản lý Dự án | 3 | 1 | 1 | 0 |
| Hỗ trợ & Bảo hành | 2 | 2 | 1 | 0 |
| BPM Workflow | 2 | 1 | 1 | 1 |
| Marketing Automation | 1 | 2 | 1 | 1 |
| KPI | 1 | 2 | 1 | 1 |
| Tài chính | 2 | 2 | 1 | 0 |
| Báo cáo | 2 | 1 | 2 | 0 |
| Kho & Tài sản | 1 | 2 | 1 | 1 |
| Cài đặt | 3 | 1 | 1 | 0 |

---

## 5. Quy ước Tài liệu

### 5.1 Cấu trúc mỗi yêu cầu (UR)

Mỗi yêu cầu được trình bày dưới dạng bảng với các trường:

| Trường | Mô tả |
|--------|-------|
| **ID** | Mã định danh: `UR-<MODULE>-<##>` |
| **Tên** | Tên ngắn gọn của yêu cầu |
| **Actor** | Vai trò người dùng thực hiện |
| **Mô tả** | Mô tả chi tiết chức năng |
| **Tiền điều kiện** | Điều kiện cần thỏa mãn trước khi thực hiện |
| **Đầu vào** | Dữ liệu/thao tác người dùng cung cấp |
| **Đầu ra** | Kết quả mong đợi sau khi hoàn tất |
| **Tiêu chí chấp nhận** | Danh sách điều kiện để yêu cầu được coi là hoàn thành |
| **Ưu tiên** | M / S / C / W (theo MoSCoW) |

### 5.2 Trạng thái yêu cầu

`Draft` → `Reviewed` → `Approved` → `Implemented` → `Tested`

---

## 6. Tham chiếu

- Kiến trúc backend: xem [../backend-tasks/](../backend-tasks/)
- Test case tổng hợp: xem [../TESTCASE_REBORN_TECH.md](../TESTCASE_REBORN_TECH.md)
- Mục lục URD: xem [README.md](README.md)
