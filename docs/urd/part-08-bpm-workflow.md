# Part 08 — BPM & Quy trình (Business Process Management)

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-BPM-01: Thiết kế quy trình BPMN

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-BPM-01 |
| **Tên** | Thiết kế quy trình BPMN (BPMN Process Designer) |
| **Actor** | Admin, Process Owner, CEO |
| **Mô tả** | Công cụ thiết kế quy trình nghiệp vụ dạng visual theo chuẩn BPMN 2.0. Hỗ trợ các phần tử: **Events** (Start, End, Timer, Message, Signal, Error), **Activities** (User Task, Service Task, Script Task, Sub-process, Call Activity), **Gateways** (Exclusive, Parallel, Inclusive, Event-based), **Flows** (Sequence Flow, Message Flow, Association), **Artifacts** (Data Object, Group, Annotation). Mỗi quy trình gồm: tên, mã quy trình, phiên bản (auto-increment), danh mục (Phê duyệt / Bán hàng / Tài chính / Nhân sự / Tuỳ chỉnh), mô tả, trạng thái (Draft / Published / Deprecated). User Task cấu hình: người thực hiện (theo vai trò / phòng ban / cá nhân cụ thể), form nhập liệu, SLA (thời gian tối đa), escalation khi quá hạn. Service Task tích hợp: gọi API nội bộ, gửi email/SMS, tạo record, cập nhật trạng thái. Hỗ trợ versioning — publish phiên bản mới không ảnh hưởng hồ sơ đang chạy trên phiên bản cũ. |
| **Tiền điều kiện** | Người dùng có quyền Admin hoặc Process Owner. |
| **Đầu vào** | Tên quy trình (*), danh mục (*), mô tả, sơ đồ BPMN (visual designer), cấu hình từng node (assignee, form, SLA, action). |
| **Đầu ra** | Quy trình BPMN được lưu, sẵn sàng publish. XML/JSON export theo chuẩn BPMN 2.0. Preview sơ đồ quy trình. |
| **Tiêu chí chấp nhận** | 1. BPMN designer drag & drop hoạt động mượt (canvas zoom, pan, auto-layout). 2. Hỗ trợ đầy đủ phần tử BPMN 2.0 cơ bản (Event, Activity, Gateway, Flow). 3. User Task: cấu hình assignee theo role/department/user. 4. Service Task: cấu hình gọi API, gửi notification. 5. Gateway Exclusive/Parallel hoạt động đúng logic. 6. Timer Event: hẹn giờ chính xác (delay, cycle, date). 7. Versioning: publish v2 không ảnh hưởng instance đang chạy v1. 8. Export/Import BPMN XML. 9. Validate quy trình trước khi publish (kiểm tra loop vô hạn, node không kết nối). 10. Clone quy trình thành bản mới. |
| **Ưu tiên** | **M** |

---

## UR-BPM-02: Luật nghiệp vụ DMN

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-BPM-02 |
| **Tên** | Luật nghiệp vụ DMN (Decision Model & Notation) |
| **Actor** | Admin, Process Owner |
| **Mô tả** | Xây dựng bảng quyết định (Decision Table) theo chuẩn DMN để định nghĩa luật nghiệp vụ mà không cần lập trình. Mỗi bảng quyết định gồm: tên, mô tả, input columns (các điều kiện đầu vào), output columns (kết quả), hit policy (Unique / First / Priority / Collect / Rule Order). Ứng dụng: phê duyệt chi phí theo giá trị (< 5tr: trưởng phòng, 5-50tr: giám đốc, > 50tr: hội đồng), phân loại lead theo điểm (score 0-30: Cold, 31-60: Warm, 61-100: Hot), tính chiết khấu theo hạng khách hàng và giá trị đơn hàng, routing ticket theo danh mục và mức độ ưu tiên. DMN table được gọi từ BPMN process (Business Rule Task) hoặc gọi trực tiếp qua API. Hỗ trợ test rule trực tiếp trên giao diện (nhập input, xem output). |
| **Tiền điều kiện** | Người dùng có quyền Admin hoặc Process Owner. |
| **Đầu vào** | Tên bảng quyết định (*), input columns (tên, kiểu dữ liệu, allowed values), output columns (tên, kiểu dữ liệu), rules (các dòng luật), hit policy (*). |
| **Đầu ra** | Bảng quyết định được lưu, sẵn sàng gọi từ BPMN hoặc API. Kết quả evaluate trả về đúng output theo input. |
| **Tiêu chí chấp nhận** | 1. Tạo/sửa/xoá bảng quyết định. 2. Thêm input/output columns với kiểu: String, Number, Boolean, Date. 3. Hit policy Unique/First/Collect hoạt động đúng. 4. Evaluate rule trả kết quả chính xác (test trực tiếp trên UI). 5. Tích hợp BPMN: Business Rule Task gọi DMN table đúng. 6. API evaluate: POST /api/dmn/{id}/evaluate trả kết quả JSON. 7. Versioning: publish phiên bản mới, phiên bản cũ vẫn hoạt động cho process đang chạy. 8. Xuất/nhập DMN XML. 9. Log mỗi lần evaluate (input, output, thời gian, người gọi). 10. Tối đa 100 rules/table, 20 columns/table. |
| **Ưu tiên** | **M** |

---

## UR-BPM-03: Xử lý hồ sơ theo quy trình

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-BPM-03 |
| **Tên** | Xử lý hồ sơ theo quy trình (Process Instance Management) |
| **Actor** | All Users (theo phân quyền từng quy trình) |
| **Mô tả** | Khởi tạo và xử lý hồ sơ (process instance) theo quy trình BPMN đã publish. Mỗi hồ sơ gồm: mã hồ sơ (tự động theo pattern cấu hình), quy trình áp dụng, phiên bản, người khởi tạo, ngày tạo, trạng thái hiện tại (node đang ở), dữ liệu form, lịch sử xử lý (audit trail), file đính kèm. Giao diện "Việc cần làm" (My Tasks): hiển thị tất cả User Task được assign cho user hiện tại, sắp xếp theo SLA (sắp hết hạn lên trước). Mỗi task: xem thông tin hồ sơ, nhập form, approve/reject/transfer, bình luận. Escalation tự động: khi task quá SLA, tự động escalate lên cấp trên (theo cấu hình). Dashboard quản lý: hồ sơ đang chạy, trung bình thời gian xử lý, bottleneck (node nào chậm nhất), SLA compliance rate. |
| **Tiền điều kiện** | Quy trình BPMN đã được publish (UR-BPM-01). Người dùng có quyền khởi tạo hoặc xử lý quy trình tương ứng. |
| **Đầu vào** | **Khởi tạo:** Chọn quy trình (*), nhập form khởi tạo (*), file đính kèm. **Xử lý task:** Nhập form (*), quyết định (Approve / Reject / Transfer / Return), bình luận, file bổ sung. |
| **Đầu ra** | Hồ sơ được tạo, di chuyển qua các node theo quy trình. Notification gửi cho assignee mỗi bước. Khi kết thúc: trạng thái Completed/Rejected, kết quả cuối cùng. Audit trail đầy đủ. |
| **Tiêu chí chấp nhận** | 1. Khởi tạo hồ sơ theo quy trình thành công, mã tự động. 2. Hồ sơ di chuyển đúng flow BPMN (sequence, gateway, parallel). 3. "Việc cần làm" hiển thị task đúng user, sắp xếp theo SLA. 4. Approve/Reject di chuyển hồ sơ đúng nhánh. 5. Transfer task cho user khác thành công. 6. Parallel Gateway: tạo đồng thời nhiều task, merge khi tất cả hoàn thành. 7. Timer Event: tự động trigger đúng thời gian. 8. Escalation: quá SLA tự động gửi notification cấp trên. 9. Audit trail: ghi đầy đủ (ai, lúc nào, làm gì, bình luận). 10. Dashboard: hồ sơ đang xử lý, average processing time, SLA compliance rate. 11. Tìm kiếm hồ sơ theo mã, người tạo, trạng thái, khoảng thời gian. |
| **Ưu tiên** | **M** |
