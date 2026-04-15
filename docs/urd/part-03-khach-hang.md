# Part 03 — Quản lý Khách hàng

## 1. Phạm vi phân hệ

CRUD khách hàng, phân khúc, trường tuỳ chỉnh, renewal (gia hạn gói), danh sách thành viên, chăm sóc khách (calling, timeline tương tác).

## 2. Actor liên quan

- **Cashier** — tạo nhanh khách mới tại POS
- **Sales Rep** — quản lý, gắn tag, ghi note
- **Marketer** — tạo segment, phân khúc
- **Store Manager** — duyệt xoá, merge khách trùng

## 3. Yêu cầu chi tiết

### UR-CUST-01 — CRUD khách hàng

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-01 |
| **Tên** | Tạo / xem / sửa / xoá khách hàng |
| **Actor** | Staff, Sales Rep |
| **Mô tả** | Trang `/customer_list` hiển thị bảng khách với filter theo: tên, SĐT, tag, hạng thẻ, cơ sở. Click vào hàng → mở detail `/detail_person/:id`. Form tạo khách có các trường cơ bản: SĐT (bắt buộc), tên, email, ngày sinh, địa chỉ, nguồn, ghi chú. |
| **Đầu vào** | SĐT 10 số, tên ≥ 2 ký tự |
| **Đầu ra** | Bản ghi customer mới, toast success |
| **Tiêu chí chấp nhận** | - SĐT trùng trong cùng cơ sở → reject (CN-01)<br>- Xoá cần quyền + không xoá được khách có đơn hàng (soft delete) |
| **Ưu tiên** | **M** |

### UR-CUST-02 — Trường tuỳ chỉnh (Custom Fields)

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-02 |
| **Tên** | Tenant Admin cấu hình thêm field tuỳ chỉnh cho khách |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/field_management` cho phép tạo field mới (text, number, date, dropdown, multi-select, checkbox) gắn vào entity `customer`. Các field này xuất hiện trong form tạo khách + có thể filter ở list. |
| **Tiêu chí chấp nhận** | - FieldCode không đổi được sau khi tạo (CN-07)<br>- Field bắt buộc (required) phải validate<br>- Max 30 custom field/entity |
| **Ưu tiên** | **S** |

### UR-CUST-03 — Tìm kiếm & lọc khách nâng cao

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-03 |
| **Tên** | Filter với nhiều điều kiện kết hợp |
| **Actor** | Sales Rep, Marketer |
| **Mô tả** | Hỗ trợ filter AND/OR theo: hạng thẻ, tổng chi tiêu, ngày tạo, tag, ngày sinh (vd "sinh nhật tháng này"), số đơn. Lưu filter thành view. |
| **Tiêu chí chấp nhận** | - Kết quả paginate (mặc định 50/trang)<br>- Export Excel danh sách filter<br>- Saved view chia sẻ với team |
| **Ưu tiên** | **S** |

### UR-CUST-04 — Lịch sử giao dịch khách

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-04 |
| **Tên** | Timeline đơn hàng + tương tác của 1 khách |
| **Actor** | Sales Rep, Cashier |
| **Mô tả** | Trang `/detail_person/:id` có tab: Thông tin, Đơn hàng, Thanh toán, Điểm tích luỹ, Voucher, Tương tác (gọi/SMS/email), Ghi chú. Hiển thị tổng chi tiêu, AOV, lần mua gần nhất. |
| **Tiêu chí chấp nhận** | - Paginate với 20 đơn/trang<br>- Click đơn → mở chi tiết<br>- Timeline tương tác có icon theo loại |
| **Ưu tiên** | **M** |

### UR-CUST-05 — Phân khúc khách hàng (Segments)

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-05 |
| **Tên** | Tạo segment theo điều kiện động |
| **Actor** | Marketer |
| **Mô tả** | `/customer_segments` cho phép tạo segment với điều kiện: RFM (Recency, Frequency, Monetary), hạng thẻ, ngày sinh, tag, nguồn, số đơn trong N ngày. Segment cập nhật tự động khi dữ liệu thay đổi. |
| **Tiêu chí chấp nhận** | - Segment dùng cho: gửi campaign, áp khuyến mãi<br>- Preview số khách match trước khi save<br>- Segment tĩnh (snapshot) vs động (realtime) |
| **Ưu tiên** | **S** |

### UR-CUST-06 — Danh sách hội viên (Member List)

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-06 |
| **Tên** | Xem danh sách khách đã mua gói/thẻ thành viên |
| **Actor** | Store Manager, Sales |
| **Mô tả** | `/member_list` hiển thị khách đã mua gói thành viên, có thông tin: hạng thẻ, ngày hết hạn, điểm còn lại, quota dịch vụ (nếu có). Nút gia hạn nhanh. |
| **Tiêu chí chấp nhận** | - Cảnh báo gần hết hạn (7/14/30 ngày)<br>- Filter theo trạng thái: active/expired/renewing<br>- Xuất Excel |
| **Ưu tiên** | **S** |

### UR-CUST-07 — Gia hạn gói thành viên

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-07 |
| **Tên** | Renew membership |
| **Actor** | Cashier, Sales |
| **Mô tả** | `/renewal_list` hiển thị khách sắp/đã hết hạn. Nhân viên có thể gia hạn tại chỗ (chuyển sang POS với gói được chọn sẵn) hoặc bulk gia hạn. |
| **Tiêu chí chấp nhận** | - Áp dụng ưu đãi gia hạn sớm nếu có<br>- Tích hợp với loyalty (tặng điểm welcome back)<br>- Email nhắc tự động theo cấu hình |
| **Ưu tiên** | **C** |

### UR-CUST-08 — Merge khách trùng

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-08 |
| **Tên** | Gộp 2+ bản ghi khách trùng thành 1 |
| **Actor** | Store Manager |
| **Mô tả** | Khi phát hiện khách trùng (do nhập tay), admin có thể merge: chọn bản ghi primary, bản ghi kia được gộp (đơn hàng, điểm, voucher gộp về primary). |
| **Tiêu chí chấp nhận** | - Soft delete bản ghi bị gộp<br>- Audit trail<br>- Không gộp được khách có công nợ khác nhau |
| **Ưu tiên** | **C** |

### UR-CUST-09 — Chăm sóc khách hàng (Care History)

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-09 |
| **Tên** | Ghi nhận các lần tương tác chăm sóc |
| **Actor** | Sales Rep, CSKH |
| **Mô tả** | `/customer_care` cho phép ghi lại các cuộc gọi, SMS, email, chat zalo với khách. Có thể link với ticket hỗ trợ. |
| **Tiêu chí chấp nhận** | - Tag theo loại tương tác<br>- Next action date để nhắc follow-up<br>- Report số lượng tương tác theo nhân viên |
| **Ưu tiên** | **S** |

### UR-CUST-10 — Import khách hàng hàng loạt

| Trường | Nội dung |
|---|---|
| **ID** | UR-CUST-10 |
| **Tên** | Upload Excel để import khách hàng |
| **Actor** | Store Manager, Tenant Admin |
| **Mô tả** | Upload file Excel (template có sẵn), hệ thống validate từng dòng, hiển thị preview, cho chọn dòng OK để import. Dòng lỗi hiển thị lý do. |
| **Tiêu chí chấp nhận** | - Max 10.000 dòng/lần<br>- Dedupe theo SĐT trong file + với DB hiện có<br>- Rollback nếu > 5% dòng lỗi |
| **Ưu tiên** | **S** |

## 4. Non-functional

- **Performance**: List 1M khách, filter phải ≤ 1s (index + cache).
- **Privacy**: PII (SĐT, email) mask khi không có quyền đầy đủ.
- **Data quality**: Validate định dạng SĐT VN (09xx, 08xx, 07xx, 03xx, 05xx).

---

*Hết Part 03. Xem tiếp [Part 04 — Đơn hàng & Hoá đơn](part-04-don-hang-hoa-don.md).*
