# Part 14 — NFR & Tích hợp

## 1. Phạm vi phân hệ

Part này gom các yêu cầu **phi chức năng (Non-Functional Requirements)**, **tích hợp bên ngoài**, và **mô hình dữ liệu cốt lõi** của toàn hệ thống Reborn Retail CRM. Không gắn với 1 phân hệ nghiệp vụ cụ thể — áp dụng xuyên suốt cho tất cả module từ POS, Kho, Đơn hàng, Tài chính, Marketing đến BPM. Bao gồm: hiệu năng, bảo mật, usability, reliability, đa ngôn ngữ, API/webhook, import/export, tích hợp payment/e-invoice/SMS/email/Zalo/shipping/marketplace, và sơ lược mô hình dữ liệu chính.

## 2. Actor liên quan

- **System** — runtime app, job background
- **DevOps** — vận hành infrastructure, giám sát
- **Integration Partners** — provider tích hợp (VNPay, VNPT, GHN, Shopee…)
- **Tenant Admin / Dev** — consumer của public API

## 3. Yêu cầu chi tiết

### UR-NFR-PERF-01 — Hiệu năng trang và thao tác chính

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-PERF-01 |
| **Tên** | Ngưỡng thời gian phản hồi cho UX |
| **Actor** | System |
| **Mô tả** | Định nghĩa SLO hiệu năng: trang list load ≤ 3s (p95), thao tác POS add-to-cart ≤ 200ms, tìm kiếm SP ≤ 300ms, báo cáo cơ bản ≤ 5s, báo cáo nặng ≤ 15s, mở dashboard ≤ 3s. Đo từ trình duyệt client trên mạng 4G điển hình. |
| **Tiền điều kiện** | Server có tải bình thường, dữ liệu tenant ≤ 1M record |
| **Đầu vào** | Metrics từ RUM + APM |
| **Đầu ra** | Dashboard monitoring, alert khi vượt ngưỡng |
| **Tiêu chí chấp nhận** | - p95 đạt ngưỡng trong 95% thời gian vận hành<br>- Slow query log ≥ 1s để DBA tối ưu<br>- POS offline mode fallback khi mạng chậm |
| **Ưu tiên** | **M** |

### UR-NFR-PERF-02 — Khả năng mở rộng

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-PERF-02 |
| **Tên** | Scalability theo số lượng tenant và giao dịch |
| **Actor** | System, DevOps |
| **Mô tả** | Hệ thống phải chịu được: 500 tenant đồng thời active, 10 triệu đơn hàng/tháng toàn cụm, 100 user đồng thời mỗi tenant. Kiến trúc horizontal scale ở tầng API và background job. |
| **Đầu vào** | Load test kết quả |
| **Đầu ra** | Capacity planning document |
| **Tiêu chí chấp nhận** | - Load test thực tế đạt ngưỡng<br>- Auto scale khi CPU > 70% trong 5 phút |
| **Ưu tiên** | **S** |

### UR-NFR-SEC-01 — Bảo mật RBAC & OWASP

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-SEC-01 |
| **Tên** | Kiểm soát truy cập và phòng chống OWASP Top 10 |
| **Actor** | System |
| **Mô tả** | Mọi API check quyền theo RBAC trước khi xử lý. Mã nguồn tuân thủ OWASP Top 10: SQL injection (parameterized queries), XSS (escape output), CSRF token cho form POST, SSRF filter, secure headers (CSP, HSTS, X-Frame-Options). |
| **Đầu vào** | SAST + DAST scan định kỳ |
| **Đầu ra** | Báo cáo bảo mật không có lỗ hổng critical |
| **Tiêu chí chấp nhận** | - Pentest hằng năm không critical/high<br>- Vulnerability critical fix trong ≤ 24h<br>- Dependency scan tự động ở CI |
| **Ưu tiên** | **M** |

### UR-NFR-SEC-02 — Audit log và encryption

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-SEC-02 |
| **Tên** | Audit log toàn bộ thao tác nhạy cảm + mã hoá dữ liệu |
| **Actor** | System, Tenant Admin |
| **Mô tả** | Mọi thao tác CRUD trên entity tài chính, khách hàng, cấu hình đều log: user, IP, thời gian, before/after. Mã hoá tại chỗ (AES-256 cho credential, PII) và trên đường truyền (TLS 1.2+). |
| **Đầu ra** | Audit log immutable, giao diện tra cứu |
| **Tiêu chí chấp nhận** | - Session timeout 8h idle, 24h absolute<br>- Password policy: 8+ ký tự, hoa/thường/số, đổi 90 ngày<br>- Audit log retention tối thiểu 1 năm |
| **Ưu tiên** | **M** |

### UR-NFR-USAB-01 — Usability & Accessibility

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-USAB-01 |
| **Tên** | Responsive, keyboard shortcut, WCAG AA |
| **Actor** | User |
| **Mô tả** | Giao diện responsive từ 768px trở lên. Màn POS tối ưu cho cảm ứng lẫn keyboard shortcut (F1–F12 cho thao tác nhanh). Tuân thủ WCAG 2.1 Level AA: contrast ratio, focus indicator, ARIA label, screen reader. |
| **Đầu vào** | UX audit + accessibility scan |
| **Đầu ra** | Báo cáo đạt WCAG AA |
| **Tiêu chí chấp nhận** | - POS dùng được 100% bằng keyboard<br>- Màn hình list chạy tốt trên tablet 10"<br>- Có help tooltip trên các field quan trọng |
| **Ưu tiên** | **S** |

### UR-NFR-I18N-01 — Đa ngôn ngữ & định dạng

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-I18N-01 |
| **Tên** | Hỗ trợ VI mặc định, EN optional |
| **Actor** | User |
| **Mô tả** | Tất cả label, message, email template hỗ trợ 2 ngôn ngữ: Tiếng Việt (mặc định) và Tiếng Anh. Định dạng tiền VND không phân số, date `dd/MM/yyyy`, số `1.234.567,89`. User có thể đổi ngôn ngữ ở header. |
| **Đầu vào** | Lựa chọn ngôn ngữ user |
| **Đầu ra** | UI render đúng locale |
| **Tiêu chí chấp nhận** | - Không hardcode string, tất cả qua file dịch<br>- Email/SMS template có bản VI + EN<br>- Fallback EN khi thiếu key VI |
| **Ưu tiên** | **S** |

### UR-NFR-RELY-01 — Availability, backup, DR

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-RELY-01 |
| **Tên** | Uptime 99.5%, RTO 4h, RPO 1h |
| **Actor** | DevOps |
| **Mô tả** | Hệ thống đảm bảo uptime ≥ 99.5% (≤ 3.6h downtime/tháng). Backup full hằng ngày + incremental hourly. Disaster Recovery plan với RTO 4h, RPO 1h, test DR 6 tháng/lần. |
| **Đầu ra** | Báo cáo uptime + biên bản test DR |
| **Tiêu chí chấp nhận** | - Health check endpoint + alert<br>- Failover DB master-replica tự động<br>- Backup được test restore định kỳ |
| **Ưu tiên** | **M** |

### UR-NFR-API-01 — Public REST API

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-API-01 |
| **Tên** | API REST JSON có version + rate limit |
| **Actor** | Integration Partner, Dev |
| **Mô tả** | Hệ thống expose REST API theo chuẩn: JSON, versioning qua URL (`/api/v1/…`), auth Bearer token (OAuth 2.0 / PAT), rate limit 1000 req/phút/tenant, error chuẩn RFC 7807. Có Swagger/OpenAPI doc. |
| **Đầu vào** | API key quản lý ở `/setting_integrations` |
| **Đầu ra** | JSON response |
| **Tiêu chí chấp nhận** | - Breaking change → bump major version<br>- Giữ song song ≥ 2 version trong 12 tháng<br>- Sandbox environment cho partner test |
| **Ưu tiên** | **S** |

### UR-NFR-WEBHOOK-01 — Outbound webhook

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-WEBHOOK-01 |
| **Tên** | Gửi webhook khi event xảy ra |
| **Actor** | System, Integration Partner |
| **Mô tả** | Hệ thống gửi HTTP POST webhook tới URL do tenant cấu hình, cho các event: `order.created`, `order.paid`, `order.cancelled`, `inventory.low`, `customer.created`, `ticket.created`. Payload JSON có HMAC-SHA256 signature ở header `X-Reborn-Signature`. |
| **Đầu vào** | Webhook URL + secret key |
| **Đầu ra** | HTTP call đến endpoint partner |
| **Tiêu chí chấp nhận** | - Retry exponential backoff tới 5 lần<br>- Partner phản hồi 2xx coi là success<br>- Log và UI xem lịch sử webhook |
| **Ưu tiên** | **S** |

### UR-NFR-INTEG-01 — Tích hợp Payment & E-invoice

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-INTEG-01 |
| **Tên** | Kết nối payment gateway và hoá đơn điện tử |
| **Actor** | System |
| **Mô tả** | Tích hợp với: **Payment** — VNPay, Momo, ZaloPay (QR + redirect); **E-invoice** — VNPT Invoice, MInvoice (phát hành, huỷ, tra cứu); **SMS OTP** — esms, VietGuys. Mỗi provider có adapter riêng, cấu hình ở `/setting_integrations`. |
| **Đầu vào** | API credential, certificate (e-invoice) |
| **Đầu ra** | Giao dịch thanh toán + hoá đơn điện tử phát hành |
| **Tiêu chí chấp nhận** | - Xử lý callback payment an toàn (idempotent)<br>- Lưu số hoá đơn, mã tra cứu, link PDF<br>- Log đầy đủ mọi call + response |
| **Ưu tiên** | **M** |

### UR-NFR-INTEG-02 — Tích hợp Shipping & Marketplace

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-INTEG-02 |
| **Tên** | Kết nối đơn vị vận chuyển và sàn TMĐT |
| **Actor** | System |
| **Mô tả** | Tích hợp: **Shipping** — GHN, GHTK, VNPost, J&T Express, Ninja Van (tạo đơn vận chuyển, tra status, in bill); **Marketplace** — Shopee, Lazada, Tiki, TikTok Shop (đồng bộ SP, đồng bộ đơn hàng, đồng bộ tồn kho). |
| **Đầu vào** | API credential từng nhà cung cấp |
| **Đầu ra** | Order + inventory đồng bộ 2 chiều |
| **Tiêu chí chấp nhận** | - Sync tồn kho ≤ 5 phút sau khi thay đổi<br>- Đơn từ marketplace tự tạo order CRM<br>- Cảnh báo khi token hết hạn |
| **Ưu tiên** | **S** |

### UR-NFR-INTEG-03 — Tích hợp SMS, Email, Zalo, Facebook

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-INTEG-03 |
| **Tên** | Kênh chăm sóc khách hàng |
| **Actor** | System, Marketer |
| **Mô tả** | Tích hợp **Email** (SMTP/SendGrid), **SMS** (esms/VietGuys với brandname), **Zalo OA** (gửi ZNS template đã duyệt), **Facebook Messenger** (webhook nhận + gửi message). Dùng cho xác nhận đơn, tracking ship, chăm sóc, chiến dịch marketing. |
| **Đầu ra** | Message được gửi tới khách |
| **Tiêu chí chấp nhận** | - Opt-out cho khách<br>- Rate limit theo quota provider<br>- Thống kê delivery/read/click |
| **Ưu tiên** | **S** |

### UR-NFR-DATA-01 — Mô hình dữ liệu cốt lõi

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-DATA-01 |
| **Tên** | Các entity chính và quan hệ |
| **Actor** | Dev, Architect |
| **Mô tả** | Hệ thống có các entity core: **Customer** (id, name, phone, email, rank, points); **Product** (id, sku, name, price, cost, category, brand); **Order** (id, code, customer_id, branch_id, total, status, channel); **OrderLine** (order_id, product_id, qty, price, discount); **Inventory** (product_id, warehouse_id, qty, qty_reserved); **Shift** (id, user_id, branch_id, open_amount, close_amount); **Payment** (id, order_id, method, amount, status); **Shipment** (id, order_id, carrier, tracking, status); **Ticket** (id, customer_id, type, status, sla); **Warranty** (id, product_id, customer_id, start_date, end_date). Quan hệ chính: Order 1–n OrderLine, Order 1–n Payment, Order 1–1 Shipment, Customer 1–n Order/Ticket. |
| **Đầu vào** | — |
| **Đầu ra** | ERD document, schema DB |
| **Tiêu chí chấp nhận** | - Mọi entity có `tenant_id` + `branch_id` (nếu scope branch)<br>- Soft delete cột `deleted_at`<br>- Audit cột `created_at/by`, `updated_at/by` |
| **Ưu tiên** | **M** |

### UR-NFR-IMPORT-01 — Import/Export Excel

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-IMPORT-01 |
| **Tên** | Import từ Excel và export mọi bảng list |
| **Actor** | User có quyền |
| **Mô tả** | Hỗ trợ import Excel cho: danh mục sản phẩm, khách hàng, nhà cung cấp, nguyên vật liệu, giá bán, tồn đầu kỳ. Template mẫu tải về. Mọi trang list có nút Export Excel lọc theo filter hiện tại. |
| **Đầu vào** | File .xlsx đúng template |
| **Đầu ra** | Dữ liệu import + report lỗi dòng |
| **Tiêu chí chấp nhận** | - Import đến 10k dòng/file<br>- Validate từng dòng, cho phép skip/fix và retry<br>- Preview trước khi commit<br>- Export giữ filter & sort hiện tại |
| **Ưu tiên** | **M** |

### UR-NFR-INTEG-04 — SSO với Reborn ID

| Trường | Nội dung |
|---|---|
| **ID** | UR-NFR-INTEG-04 |
| **Tên** | Single Sign-On qua Reborn ID |
| **Actor** | System, User |
| **Mô tả** | Toàn bộ auth tập trung ở Reborn SSO. CRM redirect về SSO để login, nhận token, validate và tạo session local. Hỗ trợ logout đồng bộ giữa các app trong hệ sinh thái Reborn. |
| **Đầu vào** | Token từ SSO |
| **Đầu ra** | Session CRM |
| **Tiêu chí chấp nhận** | - Token JWT ký bằng RSA<br>- Refresh token flow an toàn<br>- Single logout hoạt động đa app |
| **Ưu tiên** | **M** |

## 4. Quy tắc nghiệp vụ liên quan

- **Multi-tenancy**: Mọi query phải filter theo `tenant_id` — không leak dữ liệu giữa tenant.
- **Idempotency**: Mọi API ghi dữ liệu hỗ trợ `Idempotency-Key` header để tránh double commit.
- **Rate limit**: Giới hạn ở cả tầng user và tầng tenant.

## 5. Non-functional ràng buộc

- **Observability**: Structured logging (JSON), distributed tracing (OpenTelemetry), metrics (Prometheus).
- **Compliance**: Tuân thủ Nghị định 13/2023 về bảo vệ dữ liệu cá nhân, lưu trữ hoá đơn điện tử theo quy định Bộ Tài chính.
- **DevEx**: CI/CD tự động, deploy zero-downtime, rollback ≤ 5 phút.

---

*Hết URD — kết thúc tài liệu. Xem thêm [SAD](../sa/README.md) hoặc [HDSD](../userguides/README.md).*
