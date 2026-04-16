# Risk Register — Reborn-Tech B2B CRM

> Dự án: CRM doanh nghiệp lớn / công ty công nghệ (B2B)
> Ngày tạo: 2026-04-16
> Phiên bản: 1.0

---

## 1. Ma trận rủi ro (Risk Matrix)

|               | **Thấp (1)** | **Trung bình (2)** | **Cao (3)** | **Rất cao (4)** | **Nghiêm trọng (5)** |
|---------------|:-----------:|:------------------:|:-----------:|:---------------:|:--------------------:|
| **Gần như chắc chắn (5)** | 5 | 10 | 15 | 20 | **25** |
| **Rất có thể (4)**        | 4 | 8  | 12 | **16** | **20** |
| **Có thể (3)**            | 3 | 6  | 9  | **12** | **15** |
| **Ít khi (2)**            | 2 | 4  | 6  | 8  | 10 |
| **Hiếm khi (1)**          | 1 | 2  | 3  | 4  | 5  |

**Phân loại mức độ:**
- 1-4: Thấp (chấp nhận, theo dõi)
- 5-9: Trung bình (cần biện pháp giảm thiểu)
- 10-15: Cao (ưu tiên xử lý)
- 16-25: Nghiêm trọng (hành động ngay)

---

## 2. Danh sách rủi ro

### 2.1. Rủi ro Kỹ thuật

| ID | Mô tả | Xác suất | Tác động | Mức độ | Biện pháp | Người chịu trách nhiệm | Trạng thái |
|----|--------|----------|----------|--------|-----------|------------------------|------------|
| KT-01 | **BPM workflow quá phức tạp** — Quy trình phê duyệt hợp đồng, cơ hội bán hàng có nhiều nhánh điều kiện, dẫn đến lỗi logic hoặc deadlock workflow | 4 | 4 | **16 — Nghiêm trọng** | Thiết kế BPMN chuẩn hóa, unit test từng node, stress test toàn flow trước release; giới hạn độ sâu nhánh tối đa 5 cấp | Tech Lead | Mở |
| KT-02 | **Rò rỉ dữ liệu giữa tenant (cross-tenant data leak)** — Multi-tenant dùng chung DB, query thiếu tenant filter gây lộ dữ liệu khách hàng/hợp đồng | 3 | 5 | **15 — Cao** | Row-level security, middleware tự động inject tenant_id, penetration test cross-tenant mỗi sprint, audit log query | Tech Lead / Security | Mở |
| KT-03 | **Lỗi tích hợp Zalo OA / Viettel CA / VoIP** — API bên thứ ba thay đổi spec, downtime, hoặc rate-limit gây gián đoạn nghiệp vụ | 4 | 3 | **12 — Cao** | Circuit breaker pattern, retry + fallback queue, monitor health endpoint 5 phút/lần, hợp đồng SLA với vendor | Backend Lead | Mở |
| KT-04 | **Hiệu năng API với truy vấn phức tạp** — Báo cáo pipeline, dashboard tổng hợp join nhiều bảng gây query > 2s khi dữ liệu lớn | 4 | 3 | **12 — Cao** | Index strategy, materialized view cho report, query plan review, cache Redis cho dashboard, phân trang bắt buộc | Backend Lead | Mở |
| KT-05 | **Đứt chuỗi phê duyệt hợp đồng (approval chain breaks)** — Người phê duyệt nghỉ phép, tài khoản bị khóa, hoặc workflow node lỗi → hợp đồng treo vô thời hạn | 3 | 4 | **12 — Cao** | Cơ chế ủy quyền (delegation), auto-escalation sau 48h, admin can force-approve với audit trail, cảnh báo email khi workflow treo > 24h | Product Owner / Tech Lead | Mở |

### 2.2. Rủi ro Dự án

| ID | Mô tả | Xác suất | Tác động | Mức độ | Biện pháp | Người chịu trách nhiệm | Trạng thái |
|----|--------|----------|----------|--------|-----------|------------------------|------------|
| DA-01 | **Scope creep — yêu cầu B2B liên tục mở rộng** — Khách hàng doanh nghiệp đòi thêm tính năng ERP-like (kho, sản xuất, HR) ngoài phạm vi CRM | 5 | 3 | **15 — Cao** | Change request process nghiêm ngặt, đánh giá impact trước khi chấp nhận, backlog riêng cho phase sau, freeze scope 2 tuần trước release | Project Manager | Mở |
| DA-02 | **Biến động nhân sự (resource turnover)** — Dev/BA nghỉ việc giữa dự án, mất kiến thức domain B2B và code context | 3 | 4 | **12 — Cao** | Tài liệu hóa kiến trúc + quy trình, pair programming, code review bắt buộc, knowledge sharing session 2 tuần/lần | Project Manager / Tech Lead | Mở |
| DA-03 | **Khó khăn đào tạo người dùng BPM phức tạp** — Nhân viên kinh doanh quen Excel, kháng cự quy trình BPM nhiều bước | 4 | 3 | **12 — Cao** | HDSD chi tiết theo từng vai trò, video hướng dẫn, training on-site 2 ngày, sandbox môi trường luyện tập, helpdesk nội bộ 1 tháng đầu | BA / Trainer | Mở |
| DA-04 | **Migration dữ liệu từ CRM cũ thất bại** — Dữ liệu legacy không chuẩn hóa, thiếu trường, duplicate, mất quan hệ giữa entity | 3 | 4 | **12 — Cao** | Phân tích data quality trước migration, script ETL + validation, chạy thử 3 lần trước go-live, rollback plan, giữ CRM cũ song song 1 tháng | Data Engineer / BA | Mở |

### 2.3. Rủi ro Nghiệp vụ

| ID | Mô tả | Xác suất | Tác động | Mức độ | Biện pháp | Người chịu trách nhiệm | Trạng thái |
|----|--------|----------|----------|--------|-----------|------------------------|------------|
| NV-01 | **Tính hoa hồng sai (wrong commission calculation)** — Công thức phức tạp (theo doanh số, sản phẩm, KPI) dẫn đến sai lệch khi có edge case | 3 | 5 | **15 — Cao** | Unit test 50+ case, đối chiếu Excel hàng tháng, audit log mọi thay đổi công thức, approval trước khi chốt kỳ commission | BA / Finance Lead | Mở |
| NV-02 | **Không phát hiện vi phạm SLA hợp đồng** — Hệ thống không cảnh báo khi hợp đồng sắp hết hạn, milestone trễ, hoặc điều khoản bị vi phạm | 3 | 4 | **12 — Cao** | Cron job check SLA hàng ngày, cảnh báo email/notification trước 7/3/1 ngày, dashboard SLA riêng, escalation tự động khi quá hạn | Backend Lead / BA | Mở |
| NV-03 | **Dự báo cơ hội (forecast) không chính xác** — Pipeline probability không phản ánh thực tế, dẫn đến quyết định kinh doanh sai | 4 | 3 | **12 — Cao** | Review probability hàng tuần, so sánh forecast vs actual hàng quý, cải thiện model dựa trên dữ liệu lịch sử, multiple forecast scenario | Sales Manager / BA | Mở |
| NV-04 | **Cấu hình phân quyền sai lộ dữ liệu nhạy cảm** — Admin set permission không đúng, nhân viên thấy hợp đồng/giá/hoa hồng của team khác | 3 | 5 | **15 — Cao** | Permission template theo vai trò chuẩn, audit log truy cập dữ liệu nhạy cảm, review permission hàng tháng, test RBAC tự động mỗi deploy | Tech Lead / Security | Mở |

### 2.4. Rủi ro Vận hành

| ID | Mô tả | Xác suất | Tác động | Mức độ | Biện pháp | Người chịu trách nhiệm | Trạng thái |
|----|--------|----------|----------|--------|-----------|------------------------|------------|
| VH-01 | **Server downtime ngoài kế hoạch** — Hạ tầng cloud gặp sự cố, CRM không truy cập được trong giờ làm việc | 2 | 5 | **10 — Cao** | HA deployment (min 2 instance), health check + auto-restart, uptime monitoring 24/7, RTO < 30 phút, SLA 99.5% | DevOps | Mở |
| VH-02 | **Backup thất bại hoặc không restore được** — Backup chạy nhưng dữ liệu corrupt, không kiểm tra restore định kỳ | 2 | 5 | **10 — Cao** | Backup tự động hàng ngày + weekly full, test restore hàng tháng, backup ở region khác, alert khi backup fail, RPO < 24h | DevOps | Mở |
| VH-03 | **Email/SMS gửi thất bại** — Thông báo hợp đồng, nhắc SLA, OTP không tới người nhận | 3 | 3 | **9 — Trung bình** | Queue retry 3 lần, fallback sang provider phụ, monitor delivery rate, alert khi fail rate > 5%, log mọi message | Backend Lead / DevOps | Mở |
| VH-04 | **VoIP service gián đoạn** — Tổng đài VoIP mất kết nối, không ghi nhận cuộc gọi, mất lịch sử tương tác | 3 | 3 | **9 — Trung bình** | Heartbeat check 1 phút/lần, CDR sync retry queue, fallback ghi chú thủ công khi VoIP down, SLA hợp đồng với nhà cung cấp VoIP | DevOps / Vendor | Mở |

---

## 3. Tổng hợp theo mức độ

| Mức độ | Số lượng | ID |
|--------|----------|----|
| Nghiêm trọng (16-25) | 1 | KT-01 |
| Cao (10-15) | 11 | KT-02, KT-03, KT-04, KT-05, DA-01, DA-02, DA-03, DA-04, NV-01, NV-02, NV-03, NV-04, VH-01, VH-02 |
| Trung bình (5-9) | 2 | VH-03, VH-04 |
| Thấp (1-4) | 0 | — |

---

## 4. Quy trình quản lý rủi ro

1. **Nhận diện** — Mỗi sprint review bổ sung rủi ro mới
2. **Đánh giá** — PM + Tech Lead chấm điểm Xác suất x Tác động
3. **Xử lý** — Rủi ro >= 10 điểm phải có biện pháp cụ thể trong sprint tiếp theo
4. **Theo dõi** — Cập nhật trạng thái hàng tuần trong standup
5. **Đóng** — Rủi ro đã xử lý hoặc không còn áp dụng → chuyển trạng thái "Đã đóng"

---

## 5. Lịch sử cập nhật

| Ngày | Người cập nhật | Nội dung |
|------|----------------|----------|
| 2026-04-16 | Team Reborn | Khởi tạo risk register v1.0 — 15 rủi ro |
