# Part 03 — Quản lý Thành viên

## Phạm vi

Phân hệ **Quản lý Thành viên** là kho dữ liệu khách hàng trung tâm. Bao phủ CRUD khách, tìm kiếm/lọc nâng cao, import/export, hồ sơ chi tiết, các danh mục liên quan (thẻ, nhóm, nguồn, nghề nghiệp, mối quan hệ, trường tùy chỉnh), và cấu trúc hiển thị.

**Actors chính:** Receptionist (xem/tạo nhanh), Marketer (lọc/xuất), Branch Manager (xem chi tiết), Tenant Admin (cấu hình danh mục).

**Phụ thuộc nghiệp vụ:**
- Phần lớn các phân hệ khác (POS, Check-in, Hóa đơn, Marketing) đều tham chiếu đến khách hàng → đây là phân hệ "nền".

### Sơ đồ Use Case

![Use Case Diagram — Phân hệ Thành viên](./diagrams/04-usecase-member.png)

---

## A. Quản lý danh sách thành viên

### UR-MEMBER-01 — Danh sách thành viên với KPI

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-01 |
| **Tên** | Hiển thị danh sách + chỉ số tổng hợp |
| **Actor** | Staff (theo quyền) |
| **Mô tả** | Trang chính phải hiển thị danh sách thành viên dạng bảng có phân trang, kèm thanh KPI: tổng thành viên, thành viên mới trong kỳ, tổng doanh thu liên quan, thành viên sắp hết hạn. |
| **Tiêu chí chấp nhận** | 1. Bảng có cột: STT, Họ tên + avatar, Mã thành viên/Nhóm, Hạng/Tag, Công nợ, Điểm tích lũy, Số đơn hàng.<br>2. Phân trang server-side, mặc định 10/trang.<br>3. Sắp xếp được theo từng cột (asc/desc).<br>4. KPI tự refresh sau khi có thao tác CRUD.<br>5. Dữ liệu scope theo cơ sở đang chọn (UR-ACCESS-07). |
| **Mức ưu tiên** | **M** |

### UR-MEMBER-02 — Tạo nhanh thành viên

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-02 |
| **Tên** | Slide panel thêm nhanh |
| **Actor** | Receptionist, Staff |
| **Mô tả** | Cung cấp slide panel ngắn để thêm khách trong < 10 giây với các trường tối thiểu: tên, SĐT, email tùy chọn, giới tính, ghi chú. Hỗ trợ 2 loại: Cá nhân và Doanh nghiệp. |
| **Đầu vào — Cá nhân** | • **Họ tên** (bắt buộc, text, trim space)<br>• **Số điện thoại** (bắt buộc, regex VN/quốc tế)<br>• **Email** (tùy chọn, regex email)<br>• **Giới tính** (radio Nam/Nữ/Khác)<br>• **Ghi chú** (textarea ≤ 500) |
| **Đầu vào — Doanh nghiệp** | Như Cá nhân nhưng đổi "Họ tên" → "Tên công ty", không có Giới tính. |
| **Tiêu chí chấp nhận** | 1. Validation client-side ngay khi rời khỏi ô.<br>2. Bỏ trống tên → toast *"Vui lòng nhập tên thành viên"*.<br>3. Bỏ trống SĐT → toast *"Vui lòng nhập số điện thoại"*.<br>4. SĐT trùng trong cùng cơ sở → backend trả lỗi *"Số điện thoại đã tồn tại"*.<br>5. Có nút **Nhập đầy đủ →** chuyển sang form chi tiết (UR-MEMBER-04).<br>6. Sau khi tạo thành công → khách xuất hiện ở đầu danh sách. |
| **Mức ưu tiên** | **M** |

### UR-MEMBER-03 — Tìm kiếm và lọc nâng cao

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-03 |
| **Tên** | Tìm và lọc danh sách thành viên |
| **Actor** | Staff |
| **Mô tả** | Người dùng có thể tìm kiếm tự do (tên/SĐT/mã/email) và lọc theo nhiều điều kiện đồng thời (trạng thái, nhóm, badge nhanh, nguồn, người phụ trách, trường tùy chỉnh). |
| **Tiêu chí chấp nhận** | 1. Search debounce 300ms, không phân biệt dấu/hoa thường.<br>2. Badge nhanh: 🏷️ Nhóm, ⭐ VIP, 🔴 Có nợ, 📅 Mới (N ngày).<br>3. Modal **Lọc nâng cao** cho phép tổ hợp nhiều điều kiện.<br>4. Bộ lọc đã áp hiển thị thành chip có thể bỏ riêng.<br>5. Lọc xong, có thể **Xuất danh sách** (UR-MEMBER-08) chỉ phần đã lọc. |
| **Mức ưu tiên** | **M** |

### UR-MEMBER-04 — Hồ sơ chi tiết thành viên

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-04 |
| **Tên** | Trang chi tiết với toàn bộ thông tin và lịch sử |
| **Actor** | Staff (theo quyền), Branch Manager |
| **Mô tả** | Trang chi tiết hiển thị toàn bộ thông tin hồ sơ + các tab nội dung: Hóa đơn mua, Thẻ dịch vụ, Lịch hẹn, Công việc chăm sóc, Lịch sử giao tiếp, Ghi chú. |
| **Cấu trúc trường** | Xem mục B bên dưới (UR-MEMBER-05 → UR-MEMBER-08 chi tiết các nhóm trường). |
| **Tiêu chí chấp nhận** | 1. Cột trái (≈30%) hiển thị thông tin cơ bản + tag.<br>2. Cột phải (≈70%) là vùng tab.<br>3. Trên cùng có 5 nút hành động nhanh: Đặt lịch hẹn, Tạo công việc, Call, Email, SMS.<br>4. Mọi thay đổi phải qua form sửa, không inline edit (trừ tag).<br>5. Audit trail: ghi log mọi thay đổi quan trọng. |
| **Mức ưu tiên** | **M** |

### UR-MEMBER-05 — Trường thông tin cơ bản

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-05 |
| **Tên** | Validation các trường cốt lõi của hồ sơ thành viên |
| **Actor** | Staff |
| **Mô tả** | Các trường sau phải có trên form hồ sơ chi tiết với validation đầy đủ. |
| **Danh sách trường** | • **Phân loại**: Cá nhân / Doanh nghiệp (M, không đổi sau khi tạo)<br>• **Loại thành viên**: Nội bộ / Ngoài (S)<br>• **Chi nhánh** (M, chỉ admin đổi được)<br>• **Tên** (M, text)<br>• **Mã thành viên** (S, có thể tự sinh theo cấu hình)<br>• **Số điện thoại** (M, regex, có icon ẩn/hiện)<br>• **Email** (S, regex, có icon ẩn/hiện)<br>• **Giới tính** (M, radio)<br>• **Ngày sinh** (S, date)<br>• **Địa chỉ** (S, text)<br>• **Chiều cao (cm)** (C, number) — cho spa/fitness<br>• **Cân nặng (kg)** (C, number) — cho spa/fitness |
| **Tiêu chí chấp nhận** | 1. Mỗi trường hiển thị icon `*` đỏ nếu bắt buộc.<br>2. SĐT/Email có icon con mắt ẩn/hiện, chỉ dùng được nếu vai trò có quyền `customer.viewPhone` / `customer.viewEmail`.<br>3. Sai regex → hiện thông báo dưới ô input ngay khi rời khỏi ô.<br>4. Submit lỗi → focus về ô đầu tiên bị lỗi. |
| **Mức ưu tiên** | **M** |

### UR-MEMBER-06 — Trường thông tin bổ sung (cố định)

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-06 |
| **Tên** | Các trường mở rộng trong nhóm "Thông tin bổ sung" |
| **Actor** | Staff |
| **Mô tả** | Form chi tiết phải có nhóm "Thông tin bổ sung" với các trường có sẵn (không phải custom field). |
| **Danh sách trường** | • **Điện thoại người giới thiệu** (S, regex)<br>• **Nguồn thành viên** (S, select từ danh mục Nguồn)<br>• **Nghề nghiệp** (S, multi-select từ danh mục Nghề)<br>• **Nhóm thành viên** (S, select từ danh mục Nhóm)<br>• **Người phụ trách** (S, select nhân viên)<br>• **Tình trạng cuộc gọi đầu tiên** (C, text)<br>• **Thành viên liên quan** (C, multi-select khách kèm loại quan hệ) |
| **Mức ưu tiên** | **S** |

### UR-MEMBER-07 — Trường tùy chỉnh động

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-07 |
| **Tên** | Hỗ trợ trường tùy chỉnh do tenant định nghĩa |
| **Actor** | Tenant Admin (cấu hình), Staff (nhập dữ liệu) |
| **Mô tả** | Tenant có thể tự định nghĩa các trường mở rộng (custom fields) cho hồ sơ khách. Form chi tiết tự động hiển thị các trường này theo cấu hình. |
| **Tiêu chí chấp nhận** | 1. Hỗ trợ kiểu: Text / Number / Date / Select / Multi-select / Radio / Checkbox / Textarea / File upload.<br>2. Trường được tag là "Bắt buộc" → form yêu cầu điền khi submit.<br>3. Mã trường (`fieldCode`) không đổi được sau khi tạo (CN-07).<br>4. Xóa trường → backend cảnh báo + xóa toàn bộ dữ liệu trường đó trên mọi khách.<br>5. Trường textarea có giới hạn 459 ký tự mặc định. |
| **Mức ưu tiên** | **S** |
| **Ghi chú** | Cấu hình trường nằm ở UR-MEMBER-15 (Cài đặt thành viên → Trường thông tin bổ sung). |

### UR-MEMBER-08 — Import danh sách từ Excel

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-08 |
| **Tên** | Nhập khách hàng hàng loạt từ file Excel |
| **Actor** | Tenant Admin, Branch Manager |
| **Mô tả** | Cho phép import danh sách khách từ file `.xlsx` mẫu, có xem trước, kiểm tra mapping cột, xử lý dòng trùng/ghi đè, sinh báo cáo lỗi chi tiết. |
| **Tiêu chí chấp nhận** | 1. Có nút **Tải mẫu Excel** với các cột yêu cầu.<br>2. Upload file → hiển thị 10 dòng đầu để preview.<br>3. Tùy chọn: **Bỏ qua dòng trùng** / **Ghi đè**.<br>4. Sau khi chạy → báo cáo: thành công X, bỏ qua Y, lỗi Z (kèm dòng + lý do).<br>5. Tải được file kết quả `.xlsx` chi tiết các dòng lỗi.<br>6. Trường bắt buộc trong file: Họ tên, SĐT, Giới tính. |
| **Mức ưu tiên** | **S** |

### UR-MEMBER-09 — Export danh sách

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-09 |
| **Tên** | Xuất danh sách thành viên ra Excel/CSV |
| **Actor** | Marketer, Branch Manager, Tenant Admin |
| **Mô tả** | Cho phép xuất danh sách khách (toàn bộ / theo bộ lọc / đã chọn) với các cột tùy chọn. |
| **Tiêu chí chấp nhận** | 1. Modal cho chọn: phạm vi (Tất cả / Theo lọc / Đã chọn), cột muốn xuất, định dạng (xlsx/csv).<br>2. File tải về có encoding UTF-8 BOM (mở Excel không lỗi tiếng Việt).<br>3. Có log audit ai xuất, lúc nào, bao nhiêu bản ghi.<br>4. Xuất > 10.000 bản ghi chạy nền + thông báo khi xong. |
| **Mức ưu tiên** | **S** |

---

## B. Cài đặt thành viên (danh mục liên quan)

### UR-MEMBER-10 — Danh mục thẻ thành viên (hạng/tier)

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-10 |
| **Tên** | Định nghĩa hạng thẻ thành viên |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant có thể định nghĩa các hạng thẻ (vd Diamond/Gold/Silver/Basic) với mốc tiêu chuẩn từ - đến (tổng chi tiêu), tỷ lệ tích điểm, ảnh, mô tả. |
| **Tiêu chí chấp nhận** | 1. CRUD đầy đủ.<br>2. Không cho xóa thẻ đang có khách sử dụng.<br>3. Khách tự lên hạng dựa vào tổng chi tiêu (cơ chế ở Part 09).<br>4. Có thể đổi tên/mô tả/ảnh sau khi tạo. |
| **Mức ưu tiên** | **S** |

### UR-MEMBER-11 — Danh mục nguồn thành viên

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-11 |
| **Tên** | Quản lý kênh thu hút khách |
| **Actor** | Tenant Admin, Marketer |
| **Mô tả** | Cấu hình danh sách nguồn (FB, Zalo, Giới thiệu, Walk-in, Quảng cáo, YouTube...) để gắn khi tạo khách và phục vụ báo cáo marketing. |
| **Tiêu chí chấp nhận** | 1. CRUD đầy đủ.<br>2. Có nhóm nguồn (Online/Offline/Giới thiệu/Khác).<br>3. Sắp xếp được theo thứ tự hiển thị. |
| **Mức ưu tiên** | **S** |

### UR-MEMBER-12 — Danh mục nhóm thành viên

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-12 |
| **Tên** | Phân nhóm khách để áp chính sách giá/ưu đãi |
| **Actor** | Tenant Admin, Marketer |
| **Mô tả** | Tạo các nhóm khách (VIP, Mới, Trung thành, Doanh nghiệp...) với màu nhãn để hiển thị trong danh sách. |
| **Tiêu chí chấp nhận** | 1. CRUD.<br>2. Mỗi nhóm có màu picker.<br>3. Có thể link sang chính sách giá (Part 11).<br>4. Hiển thị badge màu trong UR-MEMBER-01. |
| **Mức ưu tiên** | **S** |

### UR-MEMBER-13 — Danh mục ngành nghề

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-13 |
| **Tên** | Phân khúc khách theo nghề nghiệp |
| **Actor** | Tenant Admin |
| **Mô tả** | Cho phép tạo danh mục ngành nghề và gán nhiều ngành cho mỗi khách (multi-select). |
| **Tiêu chí chấp nhận** | 1. CRUD.<br>2. Có phân nhóm cha-con. |
| **Mức ưu tiên** | **C** |

### UR-MEMBER-14 — Danh mục mối quan hệ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-14 |
| **Tên** | Định nghĩa loại quan hệ giữa khách |
| **Actor** | Tenant Admin |
| **Mô tả** | Định nghĩa các loại quan hệ (Vợ/chồng, Anh chị em, Đồng nghiệp, Người giới thiệu...) để gắn vào trường "Thành viên liên quan" của hồ sơ. |
| **Tiêu chí chấp nhận** | 1. CRUD.<br>2. Hỗ trợ 2 chiều của quan hệ (vd "Người giới thiệu" / "Được giới thiệu bởi"). |
| **Mức ưu tiên** | **C** |

### UR-MEMBER-15 — Định nghĩa trường thông tin bổ sung

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-15 |
| **Tên** | Quản lý custom field cho hồ sơ thành viên |
| **Actor** | Tenant Admin |
| **Mô tả** | Giao diện cho phép tenant tự tạo các trường mở rộng cho form thành viên (UR-MEMBER-07). |
| **Đầu vào (form định nghĩa trường)** | • **Tên hiển thị** (M, text)<br>• **Mã field** (M, slug, không đổi sau khi lưu)<br>• **Loại dữ liệu** (M, 9 kiểu)<br>• **Bắt buộc?** (toggle)<br>• **Giá trị mặc định** (tùy kiểu)<br>• **Giới hạn độ dài** (number)<br>• **Danh sách option** (cho Select/Multi/Radio)<br>• **Nhóm hiển thị** (gán vào nhóm trường)<br>• **Thứ tự hiển thị** (number) |
| **Tiêu chí chấp nhận** | 1. Sau khi lưu, trường hiển thị ngay trên form thêm/sửa thành viên.<br>2. Đổi trường từ "không bắt buộc" → "bắt buộc": cảnh báo các khách hiện tại có dữ liệu trống sẽ không sửa được nếu không điền.<br>3. Xóa trường: cảnh báo mất toàn bộ dữ liệu trường đó. |
| **Mức ưu tiên** | **S** |

### UR-MEMBER-16 — Cấu trúc xem hồ sơ theo vai trò

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-MEMBER-16 |
| **Tên** | Tùy biến layout hồ sơ theo vai trò người dùng |
| **Actor** | Tenant Admin |
| **Mô tả** | Cho phép sắp xếp các trường nào hiển thị, ẩn hiện, thứ tự hiển thị trên form chi tiết — khác nhau theo vai trò xem. |
| **Tiêu chí chấp nhận** | 1. Chọn vai trò → list trường + toggle hiển thị + ô thứ tự.<br>2. Drag-and-drop sắp xếp.<br>3. Lưu cấu hình → áp dụng ngay khi vai trò đó mở form chi tiết. |
| **Mức ưu tiên** | **C** |

---

## Tóm tắt yêu cầu Part 03

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-MEMBER-01 | Danh sách + KPI | M |
| UR-MEMBER-02 | Tạo nhanh thành viên | M |
| UR-MEMBER-03 | Tìm + lọc nâng cao | M |
| UR-MEMBER-04 | Hồ sơ chi tiết | M |
| UR-MEMBER-05 | Trường cơ bản | M |
| UR-MEMBER-06 | Trường thông tin bổ sung | S |
| UR-MEMBER-07 | Trường tùy chỉnh động | S |
| UR-MEMBER-08 | Import Excel | S |
| UR-MEMBER-09 | Export Excel/CSV | S |
| UR-MEMBER-10 | Hạng thẻ thành viên | S |
| UR-MEMBER-11 | Nguồn thành viên | S |
| UR-MEMBER-12 | Nhóm thành viên | S |
| UR-MEMBER-13 | Ngành nghề | C |
| UR-MEMBER-14 | Mối quan hệ | C |
| UR-MEMBER-15 | Định nghĩa trường tùy chỉnh | S |
| UR-MEMBER-16 | Cấu trúc xem theo vai trò | C |

**Tổng:** 16 yêu cầu — 5 Must, 8 Should, 3 Could.

---

*Hết Part 03.*
