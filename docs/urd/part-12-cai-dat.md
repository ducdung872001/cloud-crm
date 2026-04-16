# Part 12 — Cài đặt hệ thống (System Settings)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-SET-01: Cấu hình tenant & chi nhánh

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SET-01 |
| **Tên** | Cấu hình tenant & chi nhánh (Tenant & Branch Configuration) |
| **Actor** | Super Admin, Admin |
| **Mô tả** | Quản lý cấu hình multi-tenant và chi nhánh. **Tenant:** mỗi tenant là một doanh nghiệp độc lập trên hệ thống, dữ liệu hoàn toàn cách ly (data isolation). Cấu hình tenant gồm: tên công ty, mã số thuế, địa chỉ trụ sở, logo, favicon, màu chủ đạo (brand color), email domain, múi giờ, ngôn ngữ mặc định, format ngày/số/tiền tệ, gói dịch vụ (Plan: Starter / Professional / Enterprise), giới hạn user/storage. **Chi nhánh:** mỗi tenant có nhiều chi nhánh, mỗi chi nhánh gồm: tên, mã chi nhánh, địa chỉ, số điện thoại, email, người quản lý, trạng thái (Active / Inactive). Dữ liệu có thể phân quyền theo chi nhánh (nhân viên chỉ thấy dữ liệu chi nhánh mình, manager thấy multi-branch). Cấu hình hệ thống: fiscal year (Jan-Dec / Apr-Mar), working days (T2-T6, T2-T7), working hours, ngày nghỉ lễ, email SMTP, webhook, custom domain (CNAME). |
| **Tiền điều kiện** | Super Admin có quyền quản lý tenant. Admin có quyền cấu hình chi nhánh. |
| **Đầu vào** | **Tenant:** Tên công ty (*), MST, địa chỉ, logo, brand settings, timezone (*), locale (*), plan. **Chi nhánh:** Tên (*), mã (*), địa chỉ (*), người quản lý. **Cấu hình:** Fiscal year, working days, holidays, SMTP, webhook. |
| **Đầu ra** | Tenant được tạo/cập nhật. Chi nhánh hiển thị trong danh sách. Cấu hình áp dụng toàn hệ thống. Branding (logo, color) hiển thị đúng trên giao diện. |
| **Tiêu chí chấp nhận** | 1. Multi-tenant: data isolation hoàn toàn (tenant A không thấy dữ liệu tenant B). 2. Branding: logo hiển thị trên header, favicon trên tab, brand color áp dụng cho sidebar/button. 3. Timezone: tất cả datetime hiển thị theo timezone tenant. 4. CRUD chi nhánh hoạt động đúng. 5. Phân quyền theo chi nhánh: nhân viên chỉ thấy data branch mình (configurable). 6. Cấu hình fiscal year áp dụng cho báo cáo tài chính. 7. Working days/hours áp dụng cho SLA calculation. 8. Ngày nghỉ lễ: loại khỏi SLA calculation, hiển thị trên calendar. 9. Custom domain: cấu hình CNAME, SSL auto-provision. 10. Plan limits: enforce giới hạn user, storage theo gói. |
| **Ưu tiên** | **M** |

---

## UR-SET-02: Phân quyền RBAC

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SET-02 |
| **Tên** | Phân quyền RBAC (Role-Based Access Control) |
| **Actor** | Super Admin, Admin |
| **Mô tả** | Hệ thống phân quyền dựa trên vai trò (RBAC) với 3 cấp: **Role** (vai trò), **Permission** (quyền), **Data Scope** (phạm vi dữ liệu). **Role:** các vai trò mặc định (Super Admin, Admin, Manager, Sales, Support, Finance, Marketing, HR, Viewer) và vai trò tuỳ chỉnh. Mỗi user gán 1 hoặc nhiều role. **Permission:** quyền thao tác trên từng module theo CRUD (Create / Read / Update / Delete) + các action đặc biệt (Export, Import, Approve, Assign). Ma trận permission: Module x Action. Ví dụ: Sales có Create/Read/Update Deal nhưng không có Delete; Finance có Read/Export báo cáo nhưng không có Create deal. **Data Scope:** phạm vi dữ liệu được phép truy cập — All (toàn bộ), Branch (chi nhánh), Department (phòng ban), Team (nhóm), Own (chỉ bản thân). Ví dụ: Sales thấy Own deals, Manager thấy Department deals, CEO thấy All deals. Hỗ trợ field-level permission: ẩn/hiện field cụ thể theo role (ví dụ: giá vốn chỉ Finance/Admin thấy). Audit log: ghi nhận mọi thay đổi phân quyền (ai thay đổi, lúc nào, từ gì sang gì). |
| **Tiền điều kiện** | Tenant đã được tạo. Admin có quyền quản lý phân quyền. |
| **Đầu vào** | **Tạo role:** Tên role (*), mô tả, clone từ role có sẵn (tuỳ chọn). **Cấu hình permission:** Ma trận Module x Action (checkbox). **Data scope:** Module x Scope level. **Field permission:** Module x Field x Visible/Hidden. **Gán role:** User (*), Role(s) (*). |
| **Đầu ra** | Role được tạo với permission cấu hình. User được gán role. Giao diện tự động ẩn/hiện menu, button, field theo quyền. API trả 403 khi không có quyền. |
| **Tiêu chí chấp nhận** | 1. CRUD role hoạt động đúng. 2. Ma trận permission Module x Action: checkbox CRUD + Export/Import/Approve. 3. Data scope áp dụng đúng: Own chỉ thấy record mình tạo, Department thấy cùng phòng ban, v.v. 4. Gán nhiều role cho 1 user: quyền = UNION tất cả role. 5. Field-level permission: field bị hidden không hiển thị trên UI và không trả về trong API. 6. Menu/button ẩn khi không có quyền tương ứng. 7. API enforce: trả 403 Forbidden khi truy cập không quyền. 8. Clone role: tạo role mới từ role có sẵn, tuỳ chỉnh thêm. 9. Audit log: ghi nhận mọi thay đổi phân quyền. 10. Không cho phép xoá/sửa role Super Admin. |
| **Ưu tiên** | **M** |

---

## UR-SET-03: Tích hợp bên thứ 3

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SET-03 |
| **Tên** | Tích hợp bên thứ 3 (Third-party Integration) |
| **Actor** | Admin, Super Admin |
| **Mô tả** | Quản lý và cấu hình các tích hợp với hệ thống bên ngoài. Danh sách tích hợp hỗ trợ: **Email:** Microsoft 365, Google Workspace, SMTP/IMAP. **Messaging:** Zalo OA (ZNS API), Facebook Fanpage (Graph API), Viettel SMS Gateway. **VoIP:** SIP trunk (Viettel, VNPT, FPT, provider bất kỳ). **Storage:** Azure Blob Storage, AWS S3, MinIO. **Authentication:** Azure AD (SSO), Google OAuth, SAML 2.0. **Payment:** VNPay, Momo, ZaloPay (cho invoice payment link). **Logistics:** Giao Hàng Nhanh (GHN), Giao Hàng Tiết Kiệm (GHTK), Viettel Post API. **Calendar:** Microsoft Outlook Calendar, Google Calendar (2-way sync). **Webhook:** outgoing webhook khi có sự kiện (lead mới, deal won, ticket tạo), cấu hình URL + secret + events. Mỗi tích hợp có: trạng thái (Connected / Disconnected / Error), health check định kỳ, log gọi API (request/response/error), retry mechanism (3 lần, exponential backoff). Giao diện Marketplace: hiển thị tất cả tích hợp dạng card, 1-click connect (OAuth flow), cấu hình chi tiết. |
| **Tiền điều kiện** | Tài khoản / API key của bên thứ 3 đã sẵn sàng. |
| **Đầu vào** | **Kết nối:** Loại tích hợp (*), credentials (API key / OAuth / SIP config), cấu hình chi tiết (endpoint, mapping fields). **Webhook:** URL (*), secret, events to subscribe (*). |
| **Đầu ra** | Tích hợp Connected với health status. Dữ liệu đồng bộ giữa CRM và hệ thống bên ngoài. Webhook gửi payload khi event xảy ra. API log chi tiết. |
| **Tiêu chí chấp nhận** | 1. Marketplace hiển thị danh sách tích hợp dạng card (icon, tên, mô tả, trạng thái). 2. OAuth flow: 1-click connect cho M365, Google, Zalo, Facebook. 3. API key flow: nhập key, test connection, lưu. 4. Health check: kiểm tra kết nối mỗi 15 phút, alert khi lỗi. 5. API log: ghi request/response, filter theo tích hợp, thời gian, status code. 6. Webhook outgoing: gửi payload JSON khi event xảy ra, retry 3 lần nếu fail. 7. Webhook security: HMAC signature verification. 8. Disconnect: ngắt kết nối an toàn, xoá credentials. 9. Mỗi tích hợp có documentation/guide inline. 10. Rate limiting: tuân thủ rate limit của bên thứ 3, hiển thị usage. |
| **Ưu tiên** | **S** |
