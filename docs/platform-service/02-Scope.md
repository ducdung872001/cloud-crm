# 02 — Scope

## 2.1. In Scope (Platform Service quản lý)

### 2.1.1. Bounded Context: **Tenancy**
- Định nghĩa tổ chức (tenant) — đơn vị chứa data biệt lập trên hệ thống
- Đăng ký app cho tenant (subscription) + chu kỳ sử dụng
- Liên kết user với tenant (membership) — 1 user có thể thuộc nhiều tenant với các vai trò khác nhau
- Lifecycle event: created, activated, suspended, expired, terminated

### 2.1.2. Bounded Context: **Pricing & Entitlement**
- Catalog gói dịch vụ (package): tên, giá, chu kỳ, mô tả tính năng
- Ma trận quyền theo gói (package_permission): gói nào được phép truy cập resource × action nào
- Lịch sử biến đổi gói (audit)

### 2.1.3. Bounded Context: **Catalog (master data)**
- Lĩnh vực kinh doanh (industry) — Spa, Y tế, Giáo dục, Bán lẻ…
- Đơn vị hành chính (area) — tỉnh, huyện, xã của Việt Nam
- Phân hệ (module) — CRM, BPM, POS, Social…
- Tài nguyên phân quyền (resource) — CUSTOMER, INVOICE, REPORT… kèm bộ actions
- Mapping module ↔ resource (module_resource)

### 2.1.4. Bounded Context: **Storage**
- Metadata file upload: tên gốc, MIME, size, owner (tenant/user), bucket path
- Blob storage có thể là local disk / S3 / Cloudflare R2 (chốt ở `09-Deployment.md`)
- Pre-signed URL để FE upload trực tiếp lên blob, không qua BE

### 2.1.5. Bounded Context: **Help**
- Video hỗ trợ (help_video) — link YouTube/Vimeo, mô tả, gắn vào module/feature
- Bài viết hỗ trợ (help_article) — markdown content, search-able

### 2.1.6. Cross-cutting (mọi context)
- Audit log per entity (`*_event_log`)
- Soft delete (`deleted_at`)
- Created/updated by user_id

## 2.2. Out of Scope (KHÔNG thuộc Platform)

| Domain | Service phụ trách | Lý do |
|---|---|---|
| Authentication (login, password, MFA, SSO/OAuth) | Identity | Hot path, cần isolate để scale + swap vendor |
| User profile (name, avatar, gender, dob) | Identity | Mặc dù có `user_id` reference, profile data nằm Identity |
| Org chart (department, position, employee tree) | Org | Per-tenant, biến đổi theo nội bộ tenant |
| Tenant role + role_permission + permission_department | Org | Assignment per-tenant, không phải catalog |
| Request permission workflow (xin/duyệt quyền nội bộ) | Org | Workflow per-tenant |
| Push notification, email transactional, SMS | Notification | Hot path, queue-based |
| User OAuth tokens (Gmail/Outlook connect) | Notification | Vendor token, không nên ở Platform |
| Email/SMS template | Notification | Tenant-customizable templates |
| Business data (customer, invoice, contract, ticket…) | Business Apps | Per-tenant nghiệp vụ |
| Reporting/Analytics dashboard cho tenant | Business Apps (CRM) | Tenant-scope reports |
| Reporting Platform-level (MRR, churn) | **Platform** (Phase 6, KHÔNG MVP) | Sẽ build sau |
| Billing/Invoice/Payment processing | TBD (Billing service riêng — Phase tương lai) | Phức tạp riêng (gateway, refund, dunning) |

## 2.3. MVP Boundary (Phase 1)

| Feature | MVP | Phase sau |
|---|---|---|
| Tenant CRUD + filter + search | ✅ | |
| Tenant_app subscription | ✅ | |
| Tenant_membership (user ↔ tenant) | ✅ | |
| Package CRUD | ✅ | |
| Package_permission matrix UI | ✅ | |
| Industry CRUD | ✅ | |
| Module + Resource + Module_resource CRUD | ✅ | |
| File upload (avatar, logo) | ✅ | |
| Help video CRUD | ⬜ | Phase 2 |
| Help article CRUD | ⬜ | Phase 2 |
| Webhook outbound (tenant.* events) | ⬜ | Phase 3 |
| Platform Reporting dashboard (MRR, churn) | ⬜ | Phase 4 |
| Audit log UI (xem ai đổi gì) | ⬜ (chỉ ghi DB ở MVP) | Phase 2 |
| **Self-service signup** từ `ecosystem.reborn.vn` (trial 2 tuần + gói miễn phí) | ⬜ | **Phase 5 — sau khi MVP ổn định** |
| Multi-region (read replica EU) | ⬜ | Phase tương lai |

### 2.3.1. Phase 5 — Self-service signup (sau MVP)

**Mục tiêu**: Cho phép khách tiềm năng tự đăng ký dùng thử / gói miễn phí trực tiếp từ `ecosystem.reborn.vn` (corporate site), không cần Sales can thiệp.

**Use case cốt lõi**:
- Visitor xem `ecosystem.reborn.vn` → bấm CTA "Dùng thử miễn phí 14 ngày" hoặc "Đăng ký gói Free"
- Form đăng ký: tên doanh nghiệp + email admin + phone + lĩnh vực (industry) + chọn gói (Trial 14d / Free)
- Submit → Platform tạo `signup_request` (status: pending_email_verify), gửi email xác minh
- User click link xác minh → Platform auto-create `tenant` (status: active) + `tenant_app` (gói trial/free) + `tenant_membership` (OWNER) + tạo user trên Identity nếu chưa có
- Notification gửi email "Welcome + đường dẫn login + hướng dẫn sử dụng"
- User login được luôn vào CRM tenant của mình

**MVP forward-compat hooks** (cần làm ngay ở MVP để không break schema sau):
- Bảng `package` thêm `is_trial`, `is_free`, `trial_days` (xem § 4.6)
- Bảng `signup_request` ở schema MVP để dành (chưa expose API, sẽ mở sau)
- Lifecycle `tenant.status` đã có sẵn `pending` → `active` — không cần state machine mới

**Sẽ có ở Phase 5 (chưa MVP)**:
- Public endpoints `POST /api/v1/public/signup/*` (xem § 5.X)
- Anti-abuse: CAPTCHA, rate limit, email verification bắt buộc, fraud detection
- Tích hợp với `ecosystem.reborn.vn` qua iframe form hoặc API call
- Auto-provision flow: signup → verify → tạo tenant + send welcome trong < 30s

## 2.4. Constraints

### 2.4.1. Technical
- **DB**: PostgreSQL 14+ (đồng nhất với services khác). DB tên `prod_platformdb` đã được DBA tạo sẵn.
- **Backend stack**: Spring Boot 3.2.3 + Java 21 + Maven + spring-data-jdbc + jOOQ 3.18.6 — match `cloud-sales-master`. Group ID `vn.reborn.platform`. Chi tiết ADR-005, 005b, 005c.
- **API style**: REST + JSON. Không dùng GraphQL (giữ đơn giản).
- **Auth**: nhận JWT Bearer token từ Identity, tự verify (JWKS endpoint của Identity).
- **Hosting**: container hoá (Docker), deploy lên cluster Kubernetes hiện hữu.

### 2.4.2. Business
- **Backward compatibility**: trong giai đoạn cutover (4–8 tuần), endpoint cũ `reborn.vn/api/beautySalon/*`, `/package/*`, `/field/*` phải vẫn chạy (reverse-proxy). Chi tiết ở `07-Migration-Plan.md`.
- **Data migration zero-loss**: không được mất 1 row tenant/user/package nào trong cutover.
- **Downtime cutover**: ≤5 phút (chỉ giai đoạn flip DNS / proxy).
- **Tenant trong production**: 252 tenant (snapshot 2026-05) — tất cả phải migrate.

### 2.4.3. Compliance
- Lưu PII (email, phone, address) phải mã hoá at-rest (PostgreSQL TDE hoặc field-level).
- Audit log retention ≥2 năm.
- GDPR-ready: API `DELETE /api/user/{id}/erase` để xoá toàn bộ membership của 1 user (trigger từ Identity khi user yêu cầu xoá tài khoản).

## 2.5. Assumptions

1. Identity Service đã có endpoint `/users/{id}` trả về `{id, name, email, phone, avatar}` dùng được làm enrichment cho membership.
2. Identity Service expose JWKS endpoint cho Platform verify JWT.
3. Org Service đã có (hoặc sẽ có) endpoint `GET /api/tenant/{id}/employee/{user_id}` trả role + permission.
4. DBA có thể tạo schema, role, replication slot trên `prod_platformdb`.
5. DevOps có thể deploy thêm 1 service mới trên cluster K8s + cấu hình DNS `platform.reborn.vn`.
6. Frontend Reborn Super Admin (nhánh này) sẵn sàng đổi `prefixRebornVn` → `prefixPlatform` khi BE ready.

## 2.6. Risks (chi tiết ở `08-NFR.md`)

| Risk | Mức độ | Mitigation |
|---|---|---|
| Migration data lệch giữa `reborn.vn` cũ và `prod_platformdb` mới | Cao | Dual-write 2–4 tuần + checksum daily |
| Tenant CRM tenant tiếp tục gọi endpoint cũ sau cutover | Trung bình | Reverse-proxy giữ 6 tháng + deprecation warning header |
| User_id từ Identity bị xoá → membership orphan | Trung bình | Outbox event `user.deleted` → soft-delete membership |
| Package_permission inconsistent với role_permission của Org | Cao | Org enforce check qua Platform API trước mọi grant |

## 2.7. Definition of Done (per feature)

Mỗi feature MVP được coi là Done khi:
- [ ] DDL có trong `04-Database-Schema.md` và đã apply lên `prod_platformdb`
- [ ] API endpoint có trong `05-API-Spec.md` và OpenAPI YAML ready
- [ ] Unit test ≥70% coverage
- [ ] Integration test với mock Identity + Org
- [ ] FE superadmin đã đổi từ endpoint cũ → endpoint mới + smoke test PASS
- [ ] Audit log ghi đầy đủ
- [ ] Doc API published
