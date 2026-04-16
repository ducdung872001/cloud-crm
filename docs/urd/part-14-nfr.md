# Part 14 — Yêu cầu phi chức năng (Non-Functional Requirements)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## NFR-PERF: Performance

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-PERF |
| **Category** | Performance |
| **Target** | Hệ thống đáp ứng nhanh, mượt mà cho trải nghiệm người dùng enterprise. |
| **Measurement** | 1. **API Response Time:** P50 < 200ms, P95 < 500ms, P99 < 1000ms cho tất cả REST API (đo tại server, không tính network latency). 2. **Page Load Time:** First Contentful Paint (FCP) < 1.5 giây, Time to Interactive (TTI) < 3 giây trên kết nối 4G. 3. **Concurrent Users:** hỗ trợ 200 concurrent users trên cùng tenant mà không suy giảm hiệu năng (P95 vẫn < 500ms). 4. **Database Query:** 95% queries < 100ms, không có query > 5 giây (trừ báo cáo phức tạp). 5. **Search:** full-text search trả kết quả < 300ms cho index 1 triệu records. 6. **File Upload:** hỗ trợ upload file tối đa 50MB, chunked upload cho file > 10MB. 7. **Real-time:** WebSocket push notification < 500ms từ lúc event phát sinh. 8. **Batch Operations:** import/export Excel 10K rows < 30 giây. |

---

## NFR-SEC: Security

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SEC |
| **Category** | Security |
| **Target** | Bảo mật tuân thủ OWASP Top 10, Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. |
| **Measurement** | 1. **Authentication:** OAuth 2.0 + JWT, access token TTL 15 phút, refresh token TTL 7 ngày. Hỗ trợ MFA (TOTP, SMS OTP). SSO qua Azure AD / SAML 2.0. 2. **Authorization:** RBAC enforce tại cả frontend (ẩn UI) và backend (API 403). Field-level permission. Data scope isolation. 3. **OWASP Top 10:** loại bỏ SQL Injection (parameterized queries), XSS (output encoding, CSP header), CSRF (token), Broken Authentication (rate limit login 5 lần/15 phút, account lockout). 4. **Data Encryption:** TLS 1.2+ cho data in transit. AES-256 cho data at rest (sensitive fields: CCCD, số tài khoản, API keys). 5. **PDPA Compliance (NĐ 13/2023):** consent management (ghi nhận đồng ý thu thập dữ liệu cá nhân), right to access / rectify / delete, data processing log, export dữ liệu cá nhân theo yêu cầu. 6. **Audit Trail:** ghi log mọi thao tác CRUD trên dữ liệu nhạy cảm (who, when, what, old value, new value). Retention 2 năm. 7. **Penetration Testing:** ít nhất 1 lần/năm bởi bên thứ 3. 8. **Secret Management:** API keys, credentials lưu trong Azure Key Vault / HashiCorp Vault, không hardcode. |

---

## NFR-REL: Reliability

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-REL |
| **Category** | Reliability |
| **Target** | Hệ thống hoạt động ổn định, giảm thiểu downtime. |
| **Measurement** | 1. **Uptime SLA:** 99.5% uptime hàng tháng (tối đa ~3.6 giờ downtime/tháng), không tính planned maintenance. 2. **RTO (Recovery Time Objective):** < 1 giờ cho sự cố nghiêm trọng (database failure, server down). 3. **RPO (Recovery Point Objective):** < 15 phút (mất tối đa 15 phút dữ liệu khi sự cố). 4. **Backup:** automated daily backup (database + file storage), retention 30 ngày. Weekly backup retention 12 tháng. 5. **Disaster Recovery:** DR site tại region khác (Azure paired region), failover < 1 giờ. 6. **Health Monitoring:** hệ thống monitoring 24/7 (Prometheus + Grafana), alert qua Teams/Email khi service down hoặc resource > 80%. 7. **Graceful Degradation:** khi một microservice lỗi, các service khác vẫn hoạt động (circuit breaker pattern). 8. **Zero-Downtime Deployment:** rolling update, blue-green deployment, không gián đoạn service khi deploy phiên bản mới. |

---

## NFR-SCALE: Scalability

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SCALE |
| **Category** | Scalability |
| **Target** | Hệ thống mở rộng linh hoạt từ 50 lên 500 users mà không cần thay đổi kiến trúc. |
| **Measurement** | 1. **Horizontal Scaling:** mỗi microservice scale independently (Kubernetes HPA), auto-scale khi CPU > 70% hoặc request rate tăng. 2. **User Growth:** hỗ trợ 50 users giai đoạn đầu, mở rộng lên 200 users (năm 2), 500 users (năm 3) trên cùng kiến trúc. 3. **Data Growth:** database xử lý 10 triệu records/table mà không suy giảm hiệu năng (proper indexing, partitioning). 4. **Multi-tenant Scaling:** hỗ trợ 100+ tenants trên cùng cluster, data isolation đảm bảo. 5. **Storage:** auto-scale Azure Blob Storage, không giới hạn dung lượng file (tính phí theo usage). 6. **Message Queue:** event-driven architecture (RabbitMQ / Azure Service Bus) xử lý 10K messages/giây. 7. **Caching:** Redis cluster, cache hit rate > 80% cho dữ liệu đọc nhiều (danh mục, cấu hình, permission). 8. **CDN:** static assets (images, JS, CSS) served qua Azure CDN, response < 50ms trong khu vực Việt Nam. |

---

## NFR-INT: Integration

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-INT |
| **Category** | Integration |
| **Target** | Tích hợp mượt mà với hệ sinh thái dịch vụ phổ biến tại Việt Nam và quốc tế. |
| **Measurement** | 1. **Viettel Services:** SMS Brandname API (gửi 1000 SMS/phút), Viettel Post API (tạo đơn, tracking, đối soát). 2. **Zalo Ecosystem:** Zalo OA API (nhận/gửi tin nhắn, follow/unfollow events), Zalo ZNS API (gửi notification template, delivery report), ZaloPay API (payment link, transaction status). 3. **Azure AD:** SSO via SAML 2.0 / OpenID Connect, auto-provision user từ Azure AD group, sync profile changes. 4. **Microsoft 365:** Outlook Email (2-way sync via Graph API), Outlook Calendar (event sync), OneDrive/SharePoint (file storage). 5. **Google Workspace:** Gmail sync (via Gmail API), Google Calendar sync, Google Drive integration. 6. **Facebook:** Fanpage Messenger (webhook, send/receive), Page Comments (monitor, reply), Lead Ads (auto-import lead). 7. **Payment Gateways:** VNPay (QR code, ATM, credit card), Momo (QR, deeplink), ZaloPay — tạo payment link từ hoá đơn, nhận IPN callback. 8. **Shipping:** GHN, GHTK, Viettel Post — full lifecycle (create order, calculate fee, tracking, COD reconciliation). 9. **API Standards:** RESTful API, OpenAPI 3.0 specification, rate limit 1000 requests/minute/tenant, API versioning (v1, v2). 10. **Webhook:** outgoing webhook với HMAC-SHA256 signature, retry 3 lần (exponential backoff), delivery log. |
