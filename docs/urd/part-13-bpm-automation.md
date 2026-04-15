# Part 13 — BPM & Automation

## 1. Phạm vi phân hệ

Phân hệ BPM & Automation là nền tảng cấu hình quy trình nghiệp vụ và tự động hoá cho Retail CRM. Bao gồm: BPM engine (vẽ sơ đồ quy trình BPMN, gán task, kích hoạt workflow), Business Rules (luật IF-THEN cho approval/validation), quản lý quy trình mặc định, simulation, quản lý gói dịch vụ bán kèm, custom field cho entity, quản lý resource pool (nhân sự/thiết bị). Các route chính: `/bpm`, `/business_rule`, `/config_bpm`, `/manage_processes`, `/manage_default_processes`, `/process_simulation`, `/service_package_management`, `/field_management`, `/resource_management`.

## 2. Actor liên quan

- **Tenant Admin** — cấu hình quy trình, rule, field
- **Dev / Integrator** — viết rule script phức tạp, tích hợp webhook
- **Process Owner** — nghiệp vụ phụ trách 1 quy trình cụ thể (VD Trưởng Kho cho quy trình nhập kho)
- **System** — engine thực thi workflow

## 3. Yêu cầu chi tiết

### UR-BPM-01 — Vẽ sơ đồ quy trình BPMN

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-01 |
| **Tên** | Visual editor vẽ process diagram |
| **Actor** | Tenant Admin, Dev |
| **Mô tả** | Trang `/manage_processes` cung cấp editor kéo-thả để vẽ sơ đồ BPMN 2.0 với các element: Start Event, End Event, User Task, Service Task, Gateway (XOR/AND), Timer, Subprocess. User đặt tên task, gán role thực hiện, định nghĩa form input/output. |
| **Tiền điều kiện** | User có quyền `BPM_EDIT` |
| **Đầu vào** | Thao tác kéo-thả + config mỗi node |
| **Đầu ra** | Process definition lưu dạng BPMN XML |
| **Tiêu chí chấp nhận** | - Validate process có Start + End và không có dangling node<br>- Export/Import BPMN XML chuẩn<br>- Version hoá mỗi lần publish |
| **Ưu tiên** | **S** |

### UR-BPM-02 — Quy trình mặc định preset

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-02 |
| **Tên** | Thư viện quy trình mặc định ngành retail |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/manage_default_processes` liệt kê các preset: Duyệt đơn nhập hàng, Duyệt phiếu chi > X triệu, Quy trình đổi trả, Quy trình khuyến mãi lớn, Onboard nhân viên mới. User clone preset → chỉnh sửa cho tenant. |
| **Đầu vào** | Chọn preset + customize |
| **Đầu ra** | Process copy vào tenant |
| **Tiêu chí chấp nhận** | - Preset read-only, chỉ clone được<br>- Tối thiểu 10 preset sẵn |
| **Ưu tiên** | **C** |

### UR-BPM-03 — Gán task cho role hoặc user

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-03 |
| **Tên** | Định nghĩa người thực hiện mỗi user task |
| **Actor** | Tenant Admin |
| **Mô tả** | Mỗi User Task trong quy trình có thể gán cho: role cụ thể (VD "Store Manager"), user đích danh, org unit, hoặc biểu thức động (VD "Manager của cơ sở tạo đơn"). Engine tự route task tới inbox của người phù hợp. |
| **Đầu vào** | Assignment expression |
| **Đầu ra** | Task xuất hiện ở inbox user |
| **Tiêu chí chấp nhận** | - Support delegation khi user vắng<br>- Auto reassign sau 24h nếu không ai nhận<br>- Task list user xem ở `/user_task_list` |
| **Ưu tiên** | **S** |

### UR-BPM-04 — Business Rule IF-THEN

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-04 |
| **Tên** | Quản lý luật nghiệp vụ dạng IF-THEN |
| **Actor** | Tenant Admin, Dev |
| **Mô tả** | Trang `/business_rule` cho phép định nghĩa luật: IF (điều kiện trên entity) THEN (action). Ví dụ: `IF order.total > 10.000.000 THEN require approval from Manager`. Rule gắn vào event cụ thể (beforeSave, afterCreate…). |
| **Đầu vào** | Rule condition DSL + action |
| **Đầu ra** | Rule được evaluate khi event xảy ra |
| **Tiêu chí chấp nhận** | - Có visual rule builder cho user không code<br>- Có chế độ script (JavaScript sandbox) cho Dev<br>- Test rule trên dữ liệu mẫu trước khi publish |
| **Ưu tiên** | **S** |

### UR-BPM-05 — Cấu hình BPM tenant-wide

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-05 |
| **Tên** | Cài đặt tham số chung cho BPM engine |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/config_bpm` cho phép bật/tắt BPM engine, set timezone, ngày nghỉ lễ (để tính SLA), email notification template cho task assignment, số lượng process chạy song song. |
| **Đầu vào** | Các tham số config |
| **Đầu ra** | Engine áp dụng config mới |
| **Tiêu chí chấp nhận** | - Thay đổi áp dụng ngay không downtime<br>- Có preset holiday VN |
| **Ưu tiên** | **C** |

### UR-BPM-06 — Process simulation

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-06 |
| **Tên** | Mô phỏng chạy quy trình với dữ liệu mẫu |
| **Actor** | Tenant Admin, Process Owner |
| **Mô tả** | Trang `/process_simulation` cho phép chọn 1 process và tạo instance mô phỏng với dữ liệu mẫu, bước qua từng task để xác nhận logic đúng trước khi publish. Hiển thị path đã đi qua trên diagram. |
| **Đầu vào** | Process + variables đầu vào |
| **Đầu ra** | Highlight path + log mỗi bước |
| **Tiêu chí chấp nhận** | - Simulation không ghi dữ liệu thật<br>- Có thể save scenario để test lại |
| **Ưu tiên** | **C** |

### UR-BPM-07 — Custom field cho entity

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-07 |
| **Tên** | Thêm trường tuỳ chỉnh cho entity nghiệp vụ |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/field_management` cho phép thêm custom field cho các entity: Customer, Product, Order, Ticket. Loại field: text, number, date, dropdown, checkbox, lookup. Field có cấu hình: bắt buộc, hiển thị ở list, filter, export. |
| **Đầu vào** | Entity + field config |
| **Đầu ra** | Field xuất hiện trên form + list của entity |
| **Tiêu chí chấp nhận** | - Không xoá field đã có dữ liệu (chỉ archive)<br>- Field code unique trong entity<br>- Support ≥ 50 custom field mỗi entity |
| **Ưu tiên** | **S** |

### UR-BPM-08 — Resource management

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-08 |
| **Tên** | Quản lý resource pool (nhân sự, thiết bị) |
| **Actor** | Tenant Admin, Store Manager |
| **Mô tả** | Trang `/resource_management` khai báo pool resource: nhân viên giao hàng, xe, máy POS, kệ trưng bày. Gán resource cho task trong workflow (VD task "Giao hàng" yêu cầu 1 nhân viên giao + 1 xe rảnh). |
| **Đầu vào** | Resource definition + constraint |
| **Đầu ra** | Resource được reserve khi task chạy |
| **Tiêu chí chấp nhận** | - Conflict detection khi resource bị double-book<br>- Calendar view cho mỗi resource |
| **Ưu tiên** | **C** |

### UR-BPM-09 — Service package management

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-09 |
| **Tên** | Gói dịch vụ bán kèm kích hoạt workflow |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/service_package_management` tạo các gói dịch vụ bán kèm SP (VD "Lắp đặt tại nhà", "Bảo trì 12 tháng"). Mỗi gói liên kết với 1 workflow tự kích hoạt khi khách mua, tạo task cho đội kỹ thuật. |
| **Đầu vào** | Package definition + workflow linkage |
| **Đầu ra** | Khi POS bán → tạo service order + trigger workflow |
| **Tiêu chí chấp nhận** | - Gói có giá bán riêng, hiển thị ở POS như SKU đặc biệt<br>- Theo dõi tiến độ gói dịch vụ ở trang khách hàng |
| **Ưu tiên** | **C** |

### UR-BPM-10 — Trigger automation theo event

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-10 |
| **Tên** | Automation trigger khi event hệ thống xảy ra |
| **Actor** | Tenant Admin, Dev |
| **Mô tả** | Cấu hình automation "khi X xảy ra thì làm Y" không cần vẽ quy trình BPMN. Event ví dụ: `customer.created`, `order.paid`, `inventory.low`, `ticket.overdue`. Action ví dụ: gửi SMS, gửi email, tạo task, gọi webhook. |
| **Đầu vào** | Event + condition + action[] |
| **Đầu ra** | Automation chạy khi event match |
| **Tiêu chí chấp nhận** | - Có dashboard execution history + lỗi<br>- Retry 3 lần cho action thất bại<br>- Rate limit để tránh loop |
| **Ưu tiên** | **S** |

### UR-BPM-11 — Process instance monitoring

| Trường | Nội dung |
|---|---|
| **ID** | UR-BPM-11 |
| **Tên** | Theo dõi trạng thái process instance đang chạy |
| **Actor** | Tenant Admin, Process Owner |
| **Mô tả** | Trang `/bpm` hiển thị danh sách process instance: đang chạy, hoàn thành, lỗi. Click để xem diagram highlight step hiện tại, lịch sử task, variable values, và nút can thiệp (force complete, cancel, retry). |
| **Đầu vào** | Filter: process, status, ngày |
| **Đầu ra** | Bảng instance + diagram chi tiết |
| **Tiêu chí chấp nhận** | - Log mỗi can thiệp thủ công<br>- Cho phép export báo cáo performance process (avg time, bottleneck) |
| **Ưu tiên** | **S** |

## 4. Quy tắc nghiệp vụ liên quan

- **Version hoá**: Publish process mới tạo version mới, instance đang chạy giữ nguyên version cũ.
- **Isolation**: Rule/workflow scope theo tenant, không leak giữa các tenant.
- **Fail-safe**: Nếu workflow lỗi liên tục 3 lần, tự disable và cảnh báo admin.
- **Audit**: Mọi can thiệp thủ công, thay đổi rule đều log.

## 5. Non-functional ràng buộc

- **Performance**: Engine xử lý ≥ 100 instance/giây; task assign latency ≤ 500ms.
- **Reliability**: Task không mất khi engine restart (durable queue).
- **Sandbox**: Rule script chạy trong sandbox JS có timeout 5s, memory 50MB.
- **Extensibility**: API public cho Dev tạo process instance từ ngoài.

---

*Hết Part 13. Xem tiếp [Part 14 — NFR & Tích hợp](part-14-nfr-tich-hop.md).*
