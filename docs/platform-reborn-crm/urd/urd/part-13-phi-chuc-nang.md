# Part 13 — Yêu cầu phi chức năng (NFR)

## Phạm vi

Phần này mô tả các **yêu cầu phi chức năng (Non-Functional Requirements)** — những thuộc tính chất lượng mà hệ thống phải đáp ứng, không liên quan trực tiếp đến chức năng cụ thể nào.

Các nhóm NFR:
- A. Hiệu năng (Performance)
- B. Khả dụng & Độ tin cậy (Availability & Reliability)
- C. Bảo mật (Security)
- D. Khả năng sử dụng (Usability)
- E. Khả năng mở rộng (Scalability)
- F. Khả năng tương thích (Compatibility)
- G. Quốc tế hóa (Internationalization)
- H. Khả năng bảo trì (Maintainability)
- I. Tuân thủ pháp luật (Compliance)
- J. Hỗ trợ vận hành (Operational)

---

## A. Hiệu năng

### NFR-PERF-01 — Thời gian phản hồi UI

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-PERF-01 |
| **Tên** | Thời gian phản hồi giao diện |
| **Mô tả** | Mọi trang chính phải load và render ≤ 3 giây với điều kiện mạng broadband (≥ 10 Mbps) và dữ liệu cơ sở < 10.000 khách. |
| **Đo lường** | • Trang Dashboard: ≤ 3s<br>• Danh sách khách (10/trang): ≤ 2s<br>• POS: ≤ 2s lần đầu, ≤ 500ms khi thêm sản phẩm vào giỏ<br>• Báo cáo 1 tháng: ≤ 5s<br>• Submit form CRUD: ≤ 1s |
| **Mức ưu tiên** | **M** |

### NFR-PERF-02 — Throughput POS

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-PERF-02 |
| **Tên** | Khả năng xử lý đơn hàng |
| **Mô tả** | POS phải hỗ trợ 1 nhân viên tạo ≥ 60 đơn/giờ (tức 1 đơn/phút) trong điều kiện đông khách, không bị nghẽn. |
| **Mức ưu tiên** | **M** |

### NFR-PERF-03 — Tải đồng thời

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-PERF-03 |
| **Tên** | Số người dùng đồng thời mỗi tenant |
| **Mô tả** | Hệ thống phải hỗ trợ tối thiểu 50 người dùng đồng thời cho 1 tenant trung bình (tổng nhân viên < 200) mà không suy giảm hiệu năng. |
| **Mức ưu tiên** | **S** |

### NFR-PERF-04 — Báo cáo lớn

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-PERF-04 |
| **Tên** | Báo cáo quy mô lớn chạy nền |
| **Mô tả** | Báo cáo / xuất file > 10.000 bản ghi phải chạy nền (background job) và thông báo khi xong, không block giao diện. |
| **Mức ưu tiên** | **S** |

---

## B. Khả dụng & Độ tin cậy

### NFR-AVAIL-01 — Uptime SLA

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-AVAIL-01 |
| **Tên** | Cam kết uptime 99.5% |
| **Mô tả** | Hệ thống production phải có uptime ≥ 99.5% mỗi tháng (downtime ≤ 3.6 giờ/tháng). |
| **Đo lường** | Monitor qua Pingdom / UptimeRobot. |
| **Mức ưu tiên** | **M** |

### NFR-AVAIL-02 — Backup dữ liệu

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-AVAIL-02 |
| **Tên** | Backup tự động hằng ngày |
| **Mô tả** | Database tenant phải được backup tự động ít nhất 1 lần/ngày, lưu giữ tối thiểu 30 ngày, có thể restore trong vòng 4 giờ khi có sự cố. |
| **Mức ưu tiên** | **M** |

### NFR-AVAIL-03 — Disaster Recovery

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-AVAIL-03 |
| **Tên** | RTO + RPO chỉ tiêu |
| **Mô tả** | Khi có sự cố nghiêm trọng:<br>• **RTO** (Recovery Time Objective) ≤ 4 giờ<br>• **RPO** (Recovery Point Objective) ≤ 1 giờ |
| **Mức ưu tiên** | **S** |

### NFR-AVAIL-04 — Bảo trì có kế hoạch

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-AVAIL-04 |
| **Tên** | Maintenance window |
| **Mô tả** | Mọi đợt bảo trì có kế hoạch phải được thông báo trước ≥ 48 giờ qua email và banner trong app. Thực hiện trong khung giờ 02:00–05:00 (giờ VN) để giảm ảnh hưởng. |
| **Mức ưu tiên** | **S** |

---

## C. Bảo mật

### NFR-SEC-01 — Mã hóa dữ liệu

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SEC-01 |
| **Tên** | Mã hóa data ở rest và in-transit |
| **Mô tả** | • **In-transit**: tất cả request/response qua HTTPS với TLS 1.2+.<br>• **At-rest**: mật khẩu hash bcrypt, các credentials nhạy cảm (API key, token) mã hóa AES-256.<br>• File upload (CMND, chứng từ) lưu trên S3 với encryption mặc định. |
| **Mức ưu tiên** | **M** |

### NFR-SEC-02 — Chính sách mật khẩu

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SEC-02 |
| **Tên** | Yêu cầu mật khẩu mạnh |
| **Mô tả** | • ≥ 8 ký tự<br>• Có chữ hoa + thường + số<br>• Không trùng với 5 mật khẩu gần nhất<br>• Không phải các mật khẩu phổ biến (12345678, password, qwerty...) |
| **Mức ưu tiên** | **M** |

### NFR-SEC-03 — Bảo vệ chống brute force

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SEC-03 |
| **Tên** | Rate limit và lockout |
| **Mô tả** | • Sai mật khẩu 5 lần liên tiếp → khóa tài khoản 15 phút.<br>• API endpoint quan trọng có rate limit (vd login: 10 req/phút/IP). |
| **Mức ưu tiên** | **M** |

### NFR-SEC-04 — Audit trail

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SEC-04 |
| **Tên** | Log mọi thao tác nhạy cảm |
| **Mô tả** | Mọi thao tác sau phải được ghi log không xóa được:<br>• Đăng nhập / đăng xuất<br>• Đổi mật khẩu / quyền<br>• Tạo / sửa / xóa khách / nhân viên<br>• Thanh toán / hoàn / hủy đơn<br>• Phát hành / hủy hóa đơn VAT<br>• Mở / đóng ca<br>• Đối soát thanh toán |
| **Lưu trữ** | Tối thiểu 2 năm (audit log). |
| **Mức ưu tiên** | **M** |

### NFR-SEC-05 — Phân quyền cô lập tenant

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SEC-05 |
| **Tên** | Tenant isolation tuyệt đối |
| **Mô tả** | Dữ liệu của tenant A không bao giờ được truy cập bởi user của tenant B, kể cả khi có lỗi hoặc cố tình bypass URL. Mọi query DB phải scope theo `tenantId`. |
| **Mức ưu tiên** | **M** |

### NFR-SEC-06 — Bảo vệ OWASP Top 10

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SEC-06 |
| **Tên** | Phòng tránh các lỗ hổng OWASP Top 10 |
| **Mô tả** | Hệ thống phải có biện pháp phòng tránh: SQL Injection, XSS, CSRF, Insecure Deserialization, Broken Auth, IDOR, SSRF, security misconfiguration. |
| **Mức ưu tiên** | **M** |

### NFR-SEC-07 — Quyền nhạy cảm

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SEC-07 |
| **Tên** | Ẩn dữ liệu nhạy cảm theo quyền |
| **Mô tả** | • Số điện thoại khách hiển thị mặc định dạng che (`090***1234`).<br>• Chỉ user có quyền `customer.viewPhone` mới xem được đầy đủ.<br>• Tương tự với email, CCCD, STK ngân hàng. |
| **Mức ưu tiên** | **M** |

---

## D. Khả năng sử dụng

### NFR-USE-01 — Trải nghiệm trên trình duyệt

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-USE-01 |
| **Tên** | Hỗ trợ trình duyệt phổ biến |
| **Mô tả** | Hệ thống chạy mượt trên 2 phiên bản gần nhất của: Chrome, Edge, Safari, Firefox. Không cần hỗ trợ IE11. |
| **Mức ưu tiên** | **M** |

### NFR-USE-02 — Đáp ứng (Responsive)

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-USE-02 |
| **Tên** | Responsive cho desktop và tablet |
| **Mô tả** | Layout thích ứng với:<br>• Desktop: 1280px – 1920px (chính)<br>• Tablet: 768px – 1280px<br>• Mobile: 360px – 768px (basic, không tối ưu cho POS)<br>POS chỉ tối ưu cho desktop / tablet. |
| **Mức ưu tiên** | **S** |

### NFR-USE-03 — Onboarding cho người mới

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-USE-03 |
| **Tên** | Tour hướng dẫn lần đầu |
| **Mô tả** | Người dùng mới (lần đầu vào màn quan trọng) được hiển thị tour overlay với các bước hướng dẫn nhanh. Có thể skip và không hiện lại. |
| **Mức ưu tiên** | **C** |

### NFR-USE-04 — Phím tắt

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-USE-04 |
| **Tên** | Hỗ trợ phím tắt cho thao tác hay dùng |
| **Mô tả** | • POS: Enter để xác nhận, Esc để đóng modal, F2 để search nhanh, F4 để thanh toán.<br>• Toàn cục: Ctrl+K để mở tìm kiếm. |
| **Mức ưu tiên** | **C** |

### NFR-USE-05 — Thông báo lỗi rõ ràng

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-USE-05 |
| **Tên** | Error message thân thiện |
| **Mô tả** | Mọi lỗi hiển thị cho người dùng phải:<br>• Bằng tiếng Việt rõ ràng (không phải stack trace)<br>• Có gợi ý cách khắc phục (nếu có)<br>• Có mã lỗi để báo support khi cần |
| **Mức ưu tiên** | **M** |

---

## E. Khả năng mở rộng

### NFR-SCALE-01 — Hỗ trợ nhiều tenant

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SCALE-01 |
| **Tên** | Multi-tenant SaaS |
| **Mô tả** | Hệ thống phải hỗ trợ ≥ 1.000 tenant đồng thời trên cùng hạ tầng, mỗi tenant có dữ liệu cô lập. |
| **Mức ưu tiên** | **M** |

### NFR-SCALE-02 — Quy mô dữ liệu / tenant

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SCALE-02 |
| **Tên** | Hỗ trợ quy mô dữ liệu tenant lớn |
| **Mô tả** | 1 tenant lớn có thể có:<br>• 100.000 khách hàng<br>• 1.000.000 đơn hàng/năm<br>• 50 cơ sở<br>• 500 nhân viên<br>Mọi truy vấn phải vẫn nằm trong giới hạn NFR-PERF-01. |
| **Mức ưu tiên** | **S** |

### NFR-SCALE-03 — Horizontal scaling

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-SCALE-03 |
| **Tên** | Kiến trúc cho phép scale ngang |
| **Mô tả** | Backend phải stateless để có thể scale horizontal qua container orchestration (K8s/Docker Swarm). Database hỗ trợ read replica. |
| **Mức ưu tiên** | **S** |

---

## F. Khả năng tương thích

### NFR-COMP-01 — Tương thích thiết bị POS

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-COMP-01 |
| **Tên** | Hỗ trợ thiết bị ngoại vi POS |
| **Mô tả** | Hỗ trợ:<br>• Máy in nhiệt USB 80mm/58mm (ESC/POS)<br>• Máy in laser/inkjet A4/A5<br>• Máy quét mã vạch HID (USB hoặc Bluetooth)<br>• Đầu đọc thẻ RFID HID<br>• Két thu ngân (cash drawer) qua máy in nhiệt |
| **Mức ưu tiên** | **S** |

### NFR-COMP-02 — Tương thích với hệ sinh thái Reborn

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-COMP-02 |
| **Tên** | SSO + chia sẻ user với các sản phẩm Reborn khác |
| **Mô tả** | Hệ thống dùng chung SSO với các sản phẩm Reborn khác (Hub, AppHub...). User đăng nhập 1 lần dùng cho mọi sản phẩm. |
| **Mức ưu tiên** | **M** |

---

## G. Quốc tế hóa

### NFR-I18N-01 — Hỗ trợ tiếng Việt và tiếng Anh

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-I18N-01 |
| **Tên** | i18n cho UI |
| **Mô tả** | Mọi label/button/message hệ thống có ít nhất 2 ngôn ngữ: Tiếng Việt (default), English. Locale có thể thêm sau. |
| **Mức ưu tiên** | **S** |

### NFR-I18N-02 — Hỗ trợ định dạng địa phương

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-I18N-02 |
| **Tên** | Locale-aware formatting |
| **Mô tả** | Số, ngày, tiền tệ hiển thị theo locale của tenant (UR-SETUP-02). |
| **Mức ưu tiên** | **S** |

---

## H. Khả năng bảo trì

### NFR-MAINT-01 — Logging tập trung

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-MAINT-01 |
| **Tên** | Centralized logging cho debug |
| **Mô tả** | Tất cả log của các service được tập trung vào hệ thống logging (vd ELK, Loki) để đội DevOps tra cứu khi có sự cố. |
| **Mức ưu tiên** | **S** |

### NFR-MAINT-02 — Monitoring + Alert

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-MAINT-02 |
| **Tên** | Hệ thống monitoring real-time |
| **Mô tả** | Có dashboard monitor (CPU, RAM, response time, error rate, queue depth) và alert qua Slack/Email khi có chỉ số vượt ngưỡng. |
| **Mức ưu tiên** | **S** |

### NFR-MAINT-03 — CI/CD

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-MAINT-03 |
| **Tên** | Pipeline tự động hóa |
| **Mô tả** | Code mới được build, test, deploy tự động qua pipeline CI/CD. Có môi trường staging riêng để test trước khi lên production. |
| **Mức ưu tiên** | **S** |

---

## I. Tuân thủ pháp luật

### NFR-LEGAL-01 — Tuân thủ Luật An ninh mạng VN

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-LEGAL-01 |
| **Tên** | Tuân thủ Luật ANM 2018 |
| **Mô tả** | • Dữ liệu cá nhân của công dân Việt Nam được lưu trữ tại Việt Nam.<br>• Có cơ chế cho phép cơ quan chức năng yêu cầu cung cấp dữ liệu khi cần. |
| **Mức ưu tiên** | **M** |

### NFR-LEGAL-02 — Tuân thủ Luật Bảo vệ dữ liệu cá nhân

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-LEGAL-02 |
| **Tên** | Tuân thủ Nghị định 13/2023/NĐ-CP |
| **Mô tả** | • Có cam kết bảo mật dữ liệu cho khách hàng.<br>• Cho phép khách yêu cầu xem/sửa/xóa dữ liệu cá nhân của họ.<br>• Có thông báo khi dữ liệu bị thu thập. |
| **Mức ưu tiên** | **M** |

### NFR-LEGAL-03 — Tuân thủ thuế

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-LEGAL-03 |
| **Tên** | Tuân thủ Thông tư hóa đơn điện tử |
| **Mô tả** | Phát hành hóa đơn VAT đúng theo Thông tư 78/2021/TT-BTC và các văn bản liên quan. |
| **Mức ưu tiên** | **M** |

### NFR-LEGAL-04 — Tuân thủ lưu trú

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-LEGAL-04 |
| **Tên** | Tuân thủ Thông tư về quản lý lưu trú |
| **Mô tả** | Với tenant có lưu trú: lưu thông tin CMND/CCCD theo Thông tư 06/2017/TT-BVHTTDL ít nhất 5 năm, có thể xuất báo cáo gửi công an khi cần. |
| **Mức ưu tiên** | **M** (nếu tenant có lưu trú) |

---

## J. Hỗ trợ vận hành

### NFR-OPS-01 — Tài liệu hướng dẫn

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-OPS-01 |
| **Tên** | HDSD đầy đủ cho người dùng cuối |
| **Mô tả** | Có HDSD viết cho khách hàng (xem `docs/userguides/HDSD-full-final.md`) bao phủ mọi tính năng chính. |
| **Mức ưu tiên** | **M** |

### NFR-OPS-02 — Kênh hỗ trợ khách hàng

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-OPS-02 |
| **Tên** | Hỗ trợ kỹ thuật cho tenant |
| **Mô tả** | Có ít nhất 2 kênh hỗ trợ:<br>• Hotline / Zalo trong giờ hành chính<br>• Email ticket 24/7 (response trong 24h) |
| **Mức ưu tiên** | **S** |

### NFR-OPS-03 — Đào tạo

| Trường | Nội dung |
|--------|----------|
| **ID** | NFR-OPS-03 |
| **Tên** | Đào tạo người dùng khi triển khai |
| **Mô tả** | Mỗi tenant mới được đào tạo ≥ 1 buổi (online hoặc offline) cho team admin + key users. |
| **Mức ưu tiên** | **S** |

---

## Tóm tắt yêu cầu Part 13

| Nhóm | Số yêu cầu | Must | Should | Could |
|------|:----------:|:----:|:------:|:-----:|
| Hiệu năng | 4 | 2 | 2 | 0 |
| Khả dụng | 4 | 2 | 2 | 0 |
| Bảo mật | 7 | 7 | 0 | 0 |
| Khả năng sử dụng | 5 | 2 | 1 | 2 |
| Mở rộng | 3 | 1 | 2 | 0 |
| Tương thích | 2 | 1 | 1 | 0 |
| Quốc tế hóa | 2 | 0 | 2 | 0 |
| Bảo trì | 3 | 0 | 3 | 0 |
| Pháp luật | 4 | 4 | 0 | 0 |
| Vận hành | 3 | 1 | 2 | 0 |
| **Tổng** | **37** | **20** | **15** | **2** |

---

*Hết Part 13.*
