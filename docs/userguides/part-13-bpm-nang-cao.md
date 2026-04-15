# Part 13 — BPM & Tự động hoá nâng cao

> **Dành cho**: Tenant Admin, Business Analyst, Developer tích hợp
> **Mức độ**: Nâng cao (optional reading)
> **Tham chiếu URD**: [Part 13 — BPM](../urd/part-13-bpm.md) (UR-BPM-01 → UR-BPM-20)

Part này dành cho **người dùng nâng cao** muốn **tự động hoá quy trình phức tạp** mà các module chuẩn chưa cover. Bạn có thể vẽ BPMN, đặt business rules IF-THEN, và tạo custom field trên nhiều entity. Nếu chỉ dùng cơ bản — bạn có thể **bỏ qua part này**.

## Mục lục
- [1. Giới thiệu BPM engine](#1-giới-thiệu-bpm-engine)
- [2. Vẽ quy trình BPMN](#2-vẽ-quy-trình-bpmn)
- [3. Cấu hình task](#3-cấu-hình-task)
- [4. Business rules IF-THEN](#4-business-rules-if-then)
- [5. Trigger automation theo event](#5-trigger-automation-theo-event)
- [6. Process simulation](#6-process-simulation)
- [7. Custom field](#7-custom-field)
- [8. Service package kèm workflow](#8-service-package-kèm-workflow)
- [9. Resource pool](#9-resource-pool)
- [FAQ](#faq)

---

## 1. Giới thiệu BPM engine

BPM (Business Process Management) trong Reborn CRM cho phép:

- **Vẽ quy trình** bằng BPMN 2.0 drag-drop (không code)
- **Assign task** cho role / user / phòng ban
- **SLA timer** cho mỗi bước
- **Escalation** khi quá SLA
- **Form động** gắn với task
- **Tích hợp** với mọi entity (đơn, khách, kho, ticket...)

### Khi nào dùng BPM?

- Quy trình **phức tạp có nhiều bước + nhiều người duyệt** (ví dụ: duyệt KM > 1 triệu cần 3 cấp)
- Quy trình **chuyên ngành** không có sẵn (ví dụ: kiểm định SP trước khi xuất xưởng)
- **On-boarding khách VIP** với 7 bước đúng thứ tự
- **Off-boarding nhân viên** checklist 10 việc

### Khi nào **không** nên dùng BPM?

- Quy trình đơn giản 1-2 bước → dùng automation flow (Part 09) nhẹ hơn
- Logic tính toán phức tạp → dùng custom code
- Reporting → dùng Report Builder

💡 **Mẹo**: Bắt đầu bằng **1 quy trình nhỏ** để làm quen trước khi migrate mọi thứ lên BPM.

🔒 **Quyền**: `bpm.process.manage` — chỉ Admin hoặc vai trò đặc biệt.

---

## 2. Vẽ quy trình BPMN

Sidebar → **BPM → Process Designer** (`/bpm_designer`) → **[+ Tạo process mới]**.

### 2.1. Canvas

Canvas bên trái hiển thị **palette**:

- **Events**: Start / End / Timer / Message / Error
- **Activities**: Task / User task / Service task / Script task / Sub-process
- **Gateways**: Exclusive (XOR) / Parallel (AND) / Inclusive (OR)
- **Flows**: Sequence flow / Message flow

### 2.2. Ví dụ quy trình: Duyệt KM lớn

```
[Start]
  ↓
[User task: Marketing tạo KM]
  ↓
<Exclusive Gateway: Giá trị KM?>
  ↓ < 1tr                    ↓ ≥ 1tr
[Auto approve]              [User task: Manager duyệt]
                              ↓
                              <Approved?>
                              ↓ Yes          ↓ No
                              [Service: publish KM]  [End rejected]
                              ↓
                              [End approved]
```

### 2.3. Cách vẽ

1. Drag **Start event** (hình tròn) vào canvas.
2. Drag **User task** → nối bằng sequence flow.
3. Double-click task → popup cấu hình (xem mục 3).
4. Drag **Gateway** → nối + đặt condition.
5. Kết thúc bằng **End event**.

### 2.4. Lưu & validate

Nhấn **[Validate]** → engine check lỗi logic (task không có người, flow orphan, loop vô hạn).

Nhấn **[Lưu nháp]** → process lưu ở trạng thái DRAFT.

Nhấn **[Deploy]** → process chuyển sang LIVE, có thể trigger.

> 🖼️ *Ảnh minh hoạ: Canvas BPMN với palette — chụp sau*

---

## 3. Cấu hình task

Double-click vào 1 **User task** → popup cấu hình:

### 3.1. Assignee

Chọn **ai làm**:

- **Role**: mọi user có role X sẽ thấy task trong inbox
- **User cụ thể**: chỉ định tên
- **Manager của người trước đó**: dynamic (duyệt cấp trên)
- **Assignee của customer** (dynamic): sales care khách đó

### 3.2. SLA

- **Due time**: X giờ / ngày sau khi task tạo
- **Warning time**: cảnh báo trước X giờ
- **Escalation**: nếu quá SLA → escalate đến ai

### 3.3. Form data

Task có thể **gắn form** để người làm nhập data:

- Chọn **form template** (hoặc design form inline)
- Các field: text, number, date, select, upload file
- Validation required / regex

### 3.4. Notification

Khi task tạo:
- Gửi **email/Zalo/in-app noti** cho assignee
- Template có biến `{{task_name}}`, `{{due_date}}`, `{{link}}`

Nhấn **[Save task config]**.

💡 **Mẹo**: Task nào quan trọng → bật cả **email + Zalo** để không miss.

---

## 4. Business rules IF-THEN

Business rule chạy **tự động** khi điều kiện khớp — nhẹ hơn BPM, không cần vẽ flow.

Sidebar → **BPM → Business Rules** (`/bpm_rules`) → **[+ Tạo rule]**.

### Cấu trúc

```
WHEN event xảy ra
IF điều kiện(s)
THEN action(s)
```

### Ví dụ

**Rule: Auto tag VIP khi chi tiêu > 50tr**

```
WHEN order.paid
IF customer.total_spent_1y >= 50000000
THEN
  - customer.add_tag("VIP")
  - customer.set_tier("Diamond")
  - send_zns(customer, template="welcome_vip")
  - notify_user(role="store_manager", "Khách X lên Diamond")
```

### Tạo rule

1. **WHEN**: chọn event (order.created/paid/cancelled, customer.signup, ticket.created, stock.low...).
2. **IF**: thêm điều kiện — field operator value, kết hợp AND/OR. Ví dụ: `customer.tier = "Gold" AND order.total > 2000000`.
3. **THEN**: chọn actions — set field, gửi message, tạo task, gọi webhook...
4. **[Test với data mẫu]** → chạy dry-run.
5. **[Save & Activate]**.

⚠️ **Chú ý**: Rule chạy **synchronously** với event → tránh rule quá nặng làm chậm hệ thống.

💡 **Mẹo**: Setup **priority** giữa các rule nếu có nhiều rule cùng trigger 1 event.

---

## 5. Trigger automation theo event

Kết hợp event + rule + automation flow để làm **hệ thống phản xạ**.

### Các event có sẵn

| Module | Events |
|---|---|
| Order | created, paid, cancelled, refunded, shipped, delivered |
| Customer | signup, tier_up, tier_down, birthday, inactive_30d |
| Inventory | low_stock, out_of_stock, restocked |
| Ticket | created, assigned, escalated, resolved, sla_breach |
| Payment | received, failed, refunded |
| Shift | opened, closed, variance_high |

### Ví dụ tổ hợp

**Scenario: Khách đặt đơn online → tự động xử lý**

1. `order.created` → rule check `order.total > 0` → action: create shipping request
2. `order.paid` → rule check → actions: reserve stock + create warehouse pick task
3. `order.shipped` → action: send SMS tracking link
4. `order.delivered` → action: trigger automation flow "Ask feedback sau 24h"

Tất cả không cần con người can thiệp — **24/7 tự chạy**.

> 🖼️ *Ảnh minh hoạ: Rule configurator với WHEN/IF/THEN — chụp sau*

---

## 6. Process simulation

Trước khi deploy process lớn, hãy **simulate** để tránh bug trong production.

### Cách simulate

1. Mở process trong Designer.
2. Nhấn **[Simulate]** trên toolbar.
3. Nhập **input data mẫu** (hoặc chọn từ production history).
4. Nhấn **[Run]** — engine chạy qua từng node, highlight đường đi.
5. Xem:
   - **Bottleneck**: task nào mất nhiều thời gian nhất
   - **Rejection rate**: bao nhiêu % đi nhánh "rejected"
   - **Total lead time**: trung bình process mất bao lâu

### Batch simulate

Input **100 case mẫu** → chạy toàn bộ → nhận report thống kê.

💡 **Mẹo**: Dùng simulate trước mỗi thay đổi lớn — giống *unit test cho quy trình*.

---

## 7. Custom field

Mỗi entity (Customer, Order, Product, Ticket...) có thể thêm **field tuỳ chỉnh** mà không cần dev.

Sidebar → **Cài đặt → Custom Field** (`/custom_field`).

### Bước 1: Chọn entity

Ví dụ chọn **Customer**.

### Bước 2: Tạo field

Nhấn **[+ Thêm field]**:

- **Tên field** (ví dụ "Sở thích")
- **Key** (snake_case, ví dụ `interests`)
- **Kiểu**: Text / Number / Date / Boolean / Select / Multi-select / File / JSON
- **Bắt buộc** Yes/No
- **Default value**
- **Validation**: regex / min/max
- **Hiển thị ở**: form tạo, form sửa, list view, export
- **Group** (section UI)

Nhấn **[Lưu]**.

### Bước 3: Sử dụng

Field xuất hiện ngay trong form tạo/sửa Customer. Có thể **filter, search, report** theo field này.

⚠️ **Chú ý**: Đổi **type field** đã có data rất rủi ro — nên tạo field mới + migrate.

💡 **Mẹo**: Dùng custom field cho **dữ liệu chuyên ngành** — ví dụ cửa hàng thời trang thêm field "Size", "Màu chính", "Chất liệu".

---

## 8. Service package kèm workflow

Service package = **gói dịch vụ** có workflow tự động kèm. Thường dùng cho spa, salon, xưởng sửa chữa — nhưng retail cũng dùng được (ví dụ gói cài đặt máy, gói thay pin...).

Sidebar → **Sản phẩm → Service Package** (`/service_package`) → **[+ Tạo gói]**.

### Cấu trúc

- **Tên gói** (ví dụ "Gói thay màn hình iPhone")
- **Giá**
- **Thời lượng** (phút)
- **Workflow**: chọn process BPMN đã tạo ở mục 2

Khi khách mua gói này, hệ thống **tự spawn workflow instance** — các task phân bổ cho kỹ thuật viên tự động.

### Ví dụ workflow gói thay màn hình

```
[Tiếp nhận máy]
  → [Chẩn đoán + báo giá]
  → [Khách đồng ý?]
    Yes → [Thay linh kiện] → [QC] → [Trả máy] → [End]
    No  → [Trả máy nguyên] → [End]
```

💡 **Mẹo**: Gắn **resource pool** (mục 9) để book lịch kỹ thuật viên tự động.

---

## 9. Resource pool

Resource = **tài nguyên có giới hạn** — phòng, thiết bị, con người có lịch.

Sidebar → **BPM → Resource Pool** (`/resource_pool`).

### Tạo resource

- **Tên** (ví dụ "Kỹ thuật viên A", "Máy hàn số 1", "Phòng VIP 1")
- **Loại**: Người / Thiết bị / Phòng
- **Capacity**: 1 (single), hoặc > 1 (shared)
- **Working hours**: 8-17h thứ 2-6, 8-12h thứ 7
- **Kỹ năng** (tags): "sửa iPhone", "sửa Samsung" (cho khớp task)

### Dùng trong workflow

Tại **User task** cấu hình, chọn **Assignee = Resource pool** → engine **auto-assign** resource rỗi phù hợp (khớp kỹ năng + giờ làm).

### Lịch resource

Sidebar → **BPM → Resource Calendar** → xem lịch booking từng resource theo ngày/tuần. Có thể **kéo thả** để reschedule.

⚠️ **Chú ý**: Over-booking resource → hệ thống báo conflict, yêu cầu giải quyết.

💡 **Mẹo**: Setup resource đúng capacity + working hours ngay từ đầu → engine tự quản lý conflict.

> 🖼️ *Ảnh minh hoạ: Calendar resource với các booking — chụp sau*

---

## FAQ

**1. Tôi không biết vẽ BPMN — có template mẫu không?**
Có — trong Designer, nhấn **[Template Library]** → chọn từ 20+ template mẫu (duyệt KM, onboarding khách VIP, xử lý khiếu nại, kiểm kê định kỳ...). Edit lại theo nhu cầu.

**2. Business rule và automation flow — khác gì?**
- **Rule**: đơn giản IF-THEN, sync với event, không có delay/branching phức tạp. Phù hợp logic nhanh.
- **Automation flow** (Part 09): drag-drop đa bước, có delay, split, phù hợp marketing journey.
- **BPM process**: phức tạp nhất, có human task + approval + SLA. Cho quy trình vận hành thực sự.

**3. Deploy process mới có ảnh hưởng instance đang chạy?**
Không — instance đang chạy tiếp tục với version cũ. Instance mới dùng version mới. Có thể **migrate** instance cũ thủ công.

**4. Custom field có thể query trong report không?**
Có — Report Builder thấy custom field như field native. Chỉ cần đợi 5 phút cho index mới.

**5. BPM engine có giới hạn số instance đồng thời?**
Mặc định 1.000 active instance/tenant. Cần nhiều hơn → nâng gói.

**6. Tôi muốn webhook ra hệ thống ngoài từ BPM?**
Dùng **Service task** → loại HTTP → nhập URL, method, headers, payload. Response có thể gán vào process variable.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "Process validation failed" | Flow orphan / loop | Check error message trong designer |
| "No assignee for task" | Role/user xoá | Gán lại assignee |
| "Resource overbooked" | Conflict lịch | Reschedule hoặc thêm resource |
| "Rule timeout" | Rule chạy > 10s | Tối ưu rule, dùng async action |
| "Custom field key duplicate" | Trùng key | Dùng key khác |
| "Simulation data invalid" | Thiếu field bắt buộc | Điền đủ sample data |

---

*Hết Part 13. Xem tiếp [Part 14 — FAQ & Xử lý sự cố](part-14-faq-troubleshooting.md).*
