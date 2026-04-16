# Part 00 — Tổng quan

> Tài liệu này mô tả mục đích, phạm vi và đối tượng của bộ tài liệu System Architecture
> cho nhánh **reborn-tech** — nền tảng CRM B2B dành cho doanh nghiệp công nghệ/IT.

---

## 1. Mục đích tài liệu

Tài liệu System Architecture (SA) phục vụ các mục đích:

1. **Làm rõ thiết kế tổng thể** — giúp tất cả thành viên hiểu cách hệ thống hoạt động
   từ frontend đến backend, từ database đến message queue.
2. **Hướng dẫn implement** — developer biết module nào thuộc microservice nào,
   API contract ra sao, data flow đi như thế nào.
3. **Hỗ trợ ra quyết định** — khi cần thay đổi kiến trúc, tài liệu này là cơ sở
   để đánh giá tác động (impact analysis).
4. **Onboarding** — thành viên mới đọc SA để nắm hệ thống trong 1-2 ngày
   thay vì mất 2-3 tuần đọc code.

---

## 2. Phạm vi hệ thống

### 2.1. Sản phẩm

**Reborn CRM** là nền tảng SaaS multi-tenant, phục vụ nhiều ngành dọc:
retail, spa, community-hub, tech, TNPM, fitpro, banking, ...

Tài liệu này tập trung vào nhánh **reborn-tech** — B2B CRM cho doanh nghiệp
công nghệ và dịch vụ IT, bao gồm:

- Công ty tư vấn công nghệ (IT consulting)
- Doanh nghiệp SaaS (Software as a Service)
- Dịch vụ IT (IT services, managed services)
- Tích hợp hệ thống (system integration)

### 2.2. Các module chính

```
+------------------------------------------------------------------+
|                      REBORN CRM — reborn-tech                    |
+------------------------------------------------------------------+
|                                                                  |
|  [Customer/Contact/Partner]  [Sales Pipeline]  [Project Mgmt]   |
|       Quản lý khách hàng     Opportunity        Dự án IT        |
|       Liên hệ, đối tác       → Quote            Task, milestone |
|       Phân khúc, nguồn        → Contract         Timesheet       |
|                                → Invoice                         |
|                                                                  |
|  [BPM / Workflow]            [Ticketing & Warranty]              |
|       Business rule           Ticket CSKH                        |
|       Approval flow           Bảo hành sản phẩm                  |
|       E-form mapping          SLA tracking                       |
|                                                                  |
|  [Marketing Automation]      [Multi-channel Comm]                |
|       Campaign                Email / SMS                        |
|       Voucher, CTKM           Zalo OA / ZNS                     |
|       Customer survey         Facebook Messenger                 |
|                                VoIP / SIP call center            |
|                                                                  |
|  [KPI Management]            [Finance]                           |
|       Chỉ tiêu nhân viên     Sổ thu chi (cashbook)              |
|       Dashboard KPI           Công nợ (debt)                     |
|       Báo cáo hiệu suất      Quỹ (fund)                        |
|                                                                  |
|  [Reporting & Analytics]     [Inventory]                         |
|       Báo cáo tổng hợp       Kho, sản phẩm                     |
|       Dashboard               Nhập/xuất/tồn                     |
|       Xuất Excel/PDF          Biến thể, đơn vị                  |
|                                                                  |
+------------------------------------------------------------------+
```

### 2.3. Những gì KHÔNG nằm trong phạm vi

- Chi tiết nghiệp vụ **ngành khác** (retail POS, spa booking, banking finance)
- Source code level documentation (xem JSDoc / Javadoc trong code)
- Hướng dẫn sử dụng cho end-user (xem `docs/userguides/`)

---

## 3. Đối tượng đọc

| Đối tượng            | Đọc phần nào                           | Mức độ chi tiết |
|----------------------|----------------------------------------|-----------------|
| Product Owner        | Part 00, 01, 02                        | Tổng quan        |
| Developer (FE)       | Part 00, 01, 06, 05, 07               | Chi tiết         |
| Developer (BE)       | Part 00, 01, 02, 03, 04, 05, 09, 10   | Chi tiết         |
| DevOps / SRE         | Part 00, 01, 11, 12, 13               | Chi tiết         |
| Tech Lead / Architect| Tất cả 15 phần                         | Đầy đủ           |
| QA / Tester          | Part 00, 01, 02, 08                   | Tổng quan        |

---

## 4. Thuật ngữ và viết tắt

| Viết tắt  | Đầy đủ                              | Giải thích                                |
|-----------|-------------------------------------|-------------------------------------------|
| CRM       | Customer Relationship Management    | Quản lý quan hệ khách hàng                |
| B2B       | Business-to-Business                | Kinh doanh giữa các doanh nghiệp          |
| SaaS      | Software as a Service               | Phần mềm dịch vụ                          |
| SPA       | Single Page Application             | Ứng dụng trang đơn (React)                |
| BPM       | Business Process Management         | Quản lý quy trình nghiệp vụ               |
| RBAC      | Role-Based Access Control           | Phân quyền theo vai trò                   |
| JWT       | JSON Web Token                      | Token xác thực                            |
| SSO       | Single Sign-On                      | Đăng nhập một lần                         |
| MSAL      | Microsoft Authentication Library    | Thư viện xác thực Azure AD                |
| ZNS       | Zalo Notification Service           | Gửi thông báo qua Zalo                    |
| OA        | Official Account                    | Tài khoản chính thức (Zalo)               |
| SLA       | Service Level Agreement             | Cam kết mức dịch vụ                       |
| CTKM      | Chương Trình Khuyến Mại             | Promotion campaign                        |
| IV        | Invoice                             | Hóa đơn                                   |

---

## 5. Cách đọc tài liệu

1. **Bắt đầu từ Part 00** (bạn đang ở đây) — nắm phạm vi và thuật ngữ
2. **Đọc Part 01** — hiểu kiến trúc tổng thể, nhìn toàn cảnh
3. **Chọn phần liên quan** theo vai trò của bạn (xem bảng ở mục 3)
4. **Tham khảo ADR** (Part 14) khi cần hiểu lý do đằng sau quyết định thiết kế

---

## 6. Nguyên tắc kiến trúc cốt lõi

1. **Multi-tenant isolation** — Dữ liệu các tenant tách biệt hoàn toàn
   qua row-level filtering (tenant_id). Không có cross-tenant data leak.

2. **Backend trung lập ngành** — 12 microservice dùng chung cho mọi ngành.
   Khác biệt nghiệp vụ xử lý qua tenant config và feature flag,
   KHÔNG hardcode `if (nganh == "tech")`.

3. **Domain-driven boundaries** — Mỗi microservice sở hữu một domain rõ ràng.
   Giao tiếp cross-service qua API hoặc message queue (RabbitMQ).

4. **Config over code** — Business rule khác nhau giữa các ngành/tenant
   phải đọc từ bảng config, không viết điều kiện trong code.

5. **API contract stability** — Breaking change phải bump version endpoint
   (`/v2/...`), giữ legacy cho đến khi mọi FE migrate xong.

---

## 7. Lịch sử cập nhật tài liệu

| Ngày       | Phiên bản | Người cập nhật | Nội dung                    |
|------------|-----------|----------------|-----------------------------|
| 2026-04-16 | 1.0       | SA Team        | Tạo tài liệu Part 00, 01    |
