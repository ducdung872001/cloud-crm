# 01 — Stakeholders & Use Cases

## 1.1. Stakeholders

| # | Vai trò | Tổ chức | Mục tiêu chính | Tần suất tương tác |
|---|---|---|---|---|
| S1 | **Super Admin** (vận hành nền tảng) | Reborn JSC | CRUD tenant, định giá gói, theo dõi sức khỏe hệ thống | Hàng ngày |
| S2 | **Sales Reborn JSC** | Reborn JSC | Tạo tenant mới khi onboard khách hàng, gán gói + chu kỳ | Hàng tuần |
| S3 | **Billing/Finance** | Reborn JSC | Theo dõi MRR, gia hạn, công nợ, xuất hoá đơn | Hàng tháng |
| S4 | **Tech Support L2** | Reborn JSC | Tra user thuộc tenant nào để debug, override permission khi cần | Theo ticket |
| S5 | **Tenant Admin** (admin của 1 tenant) | Khách hàng | Xem gói + hạn dùng tenant mình; quản orgchart (qua Org service) | Hàng tuần |
| S6 | **End-user** (nhân viên tenant) | Khách hàng | Đọc-only: profile, gói, notification | Hàng ngày |
| S7 | **Developer Reborn** (BE/FE/Mobile) | Reborn JSC | Gọi API Platform để lấy meta-data tenant/user/permission | Realtime (mọi request) |
| S8 | **DBA / DevOps** | Reborn JSC | Backup, monitor, scale `prod_platformdb`, deploy service | Theo ca trực |
| S9 | **Prospect Tenant** (Phase 5) | Khách tiềm năng | Tự đăng ký dùng thử / gói free từ `ecosystem.reborn.vn`, không qua Sales | One-shot lúc onboard |

## 1.2. Goals & Pain Points

### Super Admin (S1)
- **Goal**: 1 màn hình duy nhất để CRUD tenant + gói + lĩnh vực + module + resource. Trước đây phải vào 3 console khác nhau (CRM tenant, admin, ops dashboard).
- **Pain hiện tại**: bảng `beauty_salon` mang tên ngành Spa khiến UX khó hiểu khi onboard khách giáo dục/y tế. Endpoint nằm trong `reborn.vn/api/*` lẫn data social, khó quản lý permission.

### Sales Reborn JSC (S2)
- **Goal**: tạo tenant mới + gán gói trial trong dưới 2 phút.
- **Acceptance**: khi tạo tenant, tự động tạo `tenant_app` (đăng ký các app default), gửi email kích hoạt cho admin tenant.

### Billing (S3)
- **Goal**: xem báo cáo MRR/ARR theo tháng, danh sách tenant sắp hết hạn (≤30 ngày), tenant đã hết hạn (overdue).
- **Acceptance**: dashboard `/dashboard` (sau khi rebuild) hiển thị: MRR, số tenant active, top 10 tenant theo doanh thu, danh sách gia hạn.

### Tech Support (S4)
- **Goal**: nhập số điện thoại user → tra ngay tenant nào, role gì, gói gì, login lần cuối.
- **Acceptance**: trang `/user` có search theo phone/email, click ra detail kèm danh sách tenant_membership.

### Tenant Admin (S5) — KHÔNG dùng console này
- Sẽ dùng CRM tenant (`reborn-tech`) để xem gói + hạn dùng (read-only, gọi Platform API).
- CRUD orgchart/role/permission qua Org service.

### Developer (S7)
- **Goal**: gọi `GET /api/tenant/{id}` lấy meta tenant trong dưới 50ms (cache hit).
- **Goal**: subscribe webhook `tenant.expired` để app tenant tự khoá tính năng.

### DBA/DevOps (S8)
- **Goal**: backup `prod_platformdb` daily, RPO ≤24h, RTO ≤2h.
- **Goal**: scale read replica khi tải lên ≥1k req/s.

## 1.3. Use Cases (chi tiết)

### UC-01: Onboard tenant mới
**Actor**: Sales (S2)
**Trigger**: Khách hàng ký hợp đồng SaaS
**Flow**:
1. Sales mở `/organization` → click "Thêm mới"
2. Fill form: tên tenant, subdomain, lĩnh vực (industry), khu vực (area), admin email
3. Chọn gói + chu kỳ (6 tháng / 12 tháng / vĩnh viễn)
4. Submit → BE tạo:
   - 1 row `tenant`
   - 1 row `tenant_app` per app được chọn (CRM, BPM, …)
   - 1 row `tenant_membership` cho admin (gọi Identity tạo user nếu chưa có)
   - Trigger event `tenant.created` → Notification gửi email kích hoạt
5. Frontend redirect `/organization/{id}` xem detail

**Postcondition**: tenant active, admin có thể login.

### UC-02: Gia hạn gói
**Actor**: Billing (S3)
**Trigger**: Khách thanh toán phí gia hạn
**Flow**:
1. Billing mở `/extension_list` → tìm tenant
2. Click "Gia hạn" → chọn chu kỳ + giá
3. BE update `tenant_app.end_date` += chu kỳ; tạo row `tenant_app_history`
4. Trigger event `tenant.renewed`

### UC-03: Đổi gói (upgrade/downgrade)
**Actor**: Sales (S2) hoặc Tenant Admin tự upgrade
**Flow**:
1. Mở tenant → click "Đổi gói" → chọn gói mới
2. BE check: gói mới có support tất cả module tenant đang dùng không?
   - Nếu downgrade và mất module → cảnh báo, yêu cầu confirm
3. Update `tenant_app.package_id`, push event `tenant.package_changed`
4. CRM tenant nhận event → revoke quyền theo `package_permission` của gói mới

### UC-04: CRUD gói dịch vụ
**Actor**: Super Admin (S1)
**Flow**: `/package_manage` → CRUD trên bảng `package` + `package_permission` (matrix gói × resource).

### UC-05: Khai báo lĩnh vực kinh doanh
**Actor**: Super Admin (S1)
**Flow**: `/field_management` → CRUD `industry`. Khi tạo tenant mới, dropdown industry lấy từ đây.

### UC-06: Khai báo phân hệ + tài nguyên phân quyền
**Actor**: Super Admin (S1)
**Flow**: `/resource_management` (3 tab):
1. **Phân hệ** (`module`): CRM, BPM, POS, Social…
2. **Tài nguyên** (`resource`): CUSTOMER, INVOICE, REPORT… mỗi cái có actions VIEW/CREATE/UPDATE/DELETE
3. **Gán resource vào phân hệ** (`module_resource`): bảng nối m:n

### UC-07: Cấu hình quyền theo gói
**Actor**: Super Admin (S1)
**Flow**: `/package_manage` → click "Cấu hình quyền" cho 1 gói → màn hình ma trận `(resource × action)`. Tick để bật quyền cho gói.

**Lưu ý quan trọng**: đây là *entitlement matrix* định nghĩa "gói nào CÓ THỂ làm gì". Việc gán quyền cho user/department cụ thể trong tenant → là chức năng của **Org service**, không thuộc Platform.

### UC-08: Tra user cross-tenant
**Actor**: Tech Support (S4)
**Flow**: `/user` → search phone/email → list tất cả `tenant_membership` của user đó → click vào từng membership xem role/permission (gọi Org).

### UC-09: Cấu hình personal (Setting Account)
**Actor**: Bản thân Super Admin (S1)
**Flow**: `/setting_account` → đổi avatar, đổi password (gọi Identity), connect Gmail/Outlook (gọi Notification).

**Phạm vi Platform**: chỉ avatar (upload qua `file_metadata`). Password thuộc Identity. OAuth email tokens thuộc Notification.

### UC-10: Audit log thao tác
**Actor**: Super Admin / Tech Support
**Goal**: xem ai đã thay đổi gì trên tenant/package/resource.
**Flow**: bảng `*_event_log` ghi mọi mutation; UI list filter theo entity + actor + time range.

### UC-11: Self-onboard từ `ecosystem.reborn.vn` (Phase 5)
**Actor**: Prospect Tenant (S9)
**Trigger**: Visitor truy cập `ecosystem.reborn.vn`, bấm CTA "Dùng thử 14 ngày" hoặc "Đăng ký gói Free"
**Flow**:
1. FE `ecosystem.reborn.vn` hiển thị form: tên doanh nghiệp, email admin, phone, lĩnh vực (industry), gói (Trial / Free), CAPTCHA
2. Submit → call `POST https://platform.reborn.vn/api/v1/public/signup`:
   - Platform validate (CAPTCHA, rate limit per IP, format)
   - INSERT `signup_request` (status: `pending_email_verify`, expires_at = +24h)
   - Gửi email xác minh tới email admin với token (qua Notification)
3. User click link `https://ecosystem.reborn.vn/verify?token=...`
4. FE call `POST /api/v1/public/signup/verify-email` với token
5. Platform:
   - Validate token + chưa expired
   - Auto-create `tenant` (alias = subdomain auto-gen từ tên doanh nghiệp, status `active`)
   - Auto-create `tenant_app` với gói Trial/Free đã chọn (start = now, end = now + trial_days)
   - Gọi Identity tạo user (nếu email chưa tồn tại) — random password, gửi setup link
   - Insert `tenant_membership` (membership_role = OWNER, status = active)
   - UPDATE `signup_request.status = activated`, `tenant_id = X`
   - Emit event `tenant.self_onboarded`
6. Notification consume event → gửi email welcome kèm:
   - URL truy cập tenant: `https://{subdomain}.reborn.vn/crm`
   - Link đặt mật khẩu (nếu user mới)
   - Hướng dẫn 5 bước đầu tiên (link tới help_video/help_article)
7. User truy cập + đăng nhập + dùng được luôn

**Acceptance**:
- Tổng thời gian từ submit form → email welcome ≤ 30s
- Anti-abuse: ≤ 3 signup/giờ/IP, CAPTCHA bắt buộc
- Email verification: bắt buộc (tránh spam tenant)
- Trial 14 ngày: hết hạn auto-suspend, gửi email upsell trước 3 ngày
- Free package: dùng vô thời hạn nhưng giới hạn (max_users, max_storage, package_permission hạn chế)

## 1.4. Acceptance Criteria mức cao

| ID | Mô tả | Cách verify |
|---|---|---|
| AC-01 | Tạo tenant mới → admin nhận email kích hoạt trong ≤30s | E2E test |
| AC-02 | Đổi gói → CRM tenant tự động update permission trong ≤10s (event-driven) | Integration test |
| AC-03 | Tra user theo phone → trả kết quả ≤500ms (P95) | Load test |
| AC-04 | Mọi mutation đều có record trong `*_event_log` với actor + before/after JSON | DB check |
| AC-05 | Downtime cutover từ `reborn.vn/api/*` cũ → Platform mới ≤5 phút | Migration drill |
| AC-06 | Read replica lag ≤2s P99 | Monitoring |
| AC-07 | API Platform availability ≥99.9% (≤43m downtime/tháng) | SLA monitoring |

## 1.5. Persona-driven feature priority (MVP → Phase N)

| Phase | Tính năng | Stakeholder hưởng lợi |
|---|---|---|
| **MVP** | Tenant CRUD + Package CRUD + Industry CRUD + tenant_app + tenant_membership | S1, S2, S3 |
| **Phase 2** | Module + Resource + Package_permission CRUD | S1 |
| **Phase 3** | File storage (avatar/logo) | S1, S5 |
| **Phase 4** | Help center (video + article) | S1, S5, S6 |
| **Phase 5** | **Self-service signup** từ `ecosystem.reborn.vn` (UC-11) — trial 14d + gói free | S9, S2 (giảm tải Sales) |
| **Phase 6** | Event-driven (webhook tenant.* events) cho apps | S7 |
| **Phase 7** | Platform Reporting (MRR/churn dashboard) | S3 |
