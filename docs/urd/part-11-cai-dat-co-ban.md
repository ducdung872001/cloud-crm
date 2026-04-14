# Part 11 — Cài đặt cơ bản

## Phạm vi

Phân hệ **Cài đặt cơ bản** chứa các cấu hình mà tenant cài **một lần khi mới triển khai** và **thi thoảng chỉnh khi có thay đổi nghiệp vụ**. Bao gồm 4 nhóm chính.

**Actors chính:** Tenant Admin (chính), Branch Manager (cấu hình cơ sở mình quản lý).

---

## A. Cấu hình toàn cục (Tenant Config)

### UR-SETUP-01 — Cấu hình thông tin đơn vị

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-01 |
| **Tên** | Cài đặt thông tin định danh tenant |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant phải cài thông tin định danh chung: tên đơn vị, logo, MST, địa chỉ, liên hệ. Các thông tin này được hiển thị trên hóa đơn, header, cover báo cáo. |
| **Đầu vào** | • **Tên đơn vị** (M, ≤ 255)<br>• **Tên viết tắt** (S, ≤ 20)<br>• **Logo** (S, JPG/PNG ≤ 2MB, khuyến nghị 512×512)<br>• **Slogan** (S, ≤ 255)<br>• **MST** (S, 10/13 số)<br>• **Địa chỉ đăng ký** (S)<br>• **SĐT** (S)<br>• **Email liên hệ** (S)<br>• **Website** (S, URL valid) |
| **Tiêu chí chấp nhận** | 1. Validation đầy đủ.<br>2. Lưu xong thông tin tự cập nhật ở header + hóa đơn ngay.<br>3. Logo upload thành công có preview. |
| **Mức ưu tiên** | **M** |

### UR-SETUP-02 — Cấu hình định dạng hệ thống

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-02 |
| **Tên** | Locale, ngôn ngữ, định dạng số/ngày/tiền |
| **Actor** | Tenant Admin |
| **Mô tả** | Cài đặt các định dạng chung: múi giờ, ngôn ngữ mặc định, đơn vị tiền tệ, định dạng ngày, định dạng số, ngày bắt đầu tuần. |
| **Tiêu chí chấp nhận** | 1. **Múi giờ**: mặc định `Asia/Ho_Chi_Minh`, có thể đổi.<br>2. **Ngôn ngữ**: VI/EN.<br>3. **Tiền tệ**: VND/USD/EUR.<br>4. **Định dạng ngày**: dd/MM/yyyy / MM/dd/yyyy / yyyy-MM-dd.<br>5. **Định dạng số**: 1,000,000.00 / 1.000.000,00.<br>6. **Tuần bắt đầu**: Thứ Hai / Chủ Nhật.<br>7. Mọi định dạng áp dụng cho toàn bộ hệ thống và mọi báo cáo. |
| **Mức ưu tiên** | **M** |

### UR-SETUP-03 — Cấu hình in ấn

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-03 |
| **Tên** | Cấu hình mẫu in hóa đơn |
| **Actor** | Tenant Admin |
| **Mô tả** | Cài cấu hình in: khổ giấy, header/footer hóa đơn, có in logo không, có in QR tra cứu không. |
| **Đầu vào** | • **Khổ giấy** (M, A4/A5/80mm/58mm)<br>• **Header hóa đơn** (S, text + biến `{{tên_đơn_vị}}`, `{{địa_chỉ}}`)<br>• **Footer hóa đơn** (S)<br>• **In logo** (toggle)<br>• **In QR tra cứu** (toggle) |
| **Tiêu chí chấp nhận** | 1. Có nút **Xem thử** mở preview hóa đơn mẫu.<br>2. Mỗi loại khổ giấy có template riêng. |
| **Mức ưu tiên** | **S** |

### UR-SETUP-04 — Cấu hình mã tự động

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-04 |
| **Tên** | Định nghĩa quy tắc sinh mã |
| **Actor** | Tenant Admin |
| **Mô tả** | Cho phép cấu hình quy tắc sinh mã tự động cho các đối tượng (khách, đơn, NVL, NCC, kiểm kê...) theo prefix + năm + số tự tăng. |
| **Tiêu chí chấp nhận** | 1. Mỗi đối tượng có 1 cấu hình riêng.<br>2. Format: `{prefix}{year}{seq:0N}` vd `KH2026000001`.<br>3. Tự reset chuỗi seq theo năm hoặc tháng (tùy).<br>4. Có thể tắt auto-gen, cho người dùng tự nhập. |
| **Mức ưu tiên** | **S** |

### UR-SETUP-05 — Cấu hình làm tròn giá

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-05 |
| **Tên** | Quy tắc làm tròn tiền |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant chọn cách làm tròn cho các đơn POS: làm tròn đến 1000đ / 500đ / 100đ / không làm tròn. |
| **Tiêu chí chấp nhận** | 1. Áp dụng ở mức tổng đơn (không từng dòng).<br>2. Có 2 mode: làm tròn lên / xuống / chuẩn.<br>3. Hiển thị dòng "Làm tròn" trong giỏ hàng để minh bạch. |
| **Mức ưu tiên** | **C** |

---

## B. Danh mục dịch vụ

### UR-SETUP-06 — Quản lý cây danh mục sản phẩm/dịch vụ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-06 |
| **Tên** | Cấu trúc cây danh mục cấp 1/2/3 |
| **Actor** | Tenant Admin, Branch Manager |
| **Mô tả** | Tenant tạo cấu trúc danh mục sản phẩm/dịch vụ theo cây phân cấp. |
| **Tiêu chí chấp nhận** | 1. CRUD cây 3 cấp.<br>2. Drag-and-drop để sắp xếp lại.<br>3. Đổi tên / xóa / di chuyển nhánh.<br>4. Không cho xóa danh mục đang chứa item. |
| **Mức ưu tiên** | **M** |

### UR-SETUP-07 — Tạo / sửa sản phẩm hoặc dịch vụ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-07 |
| **Tên** | Quản lý từng item trong danh mục |
| **Actor** | Tenant Admin, Branch Manager |
| **Mô tả** | Form chi tiết để tạo/sửa item với loại Sản phẩm / Dịch vụ / Combo. |
| **Đầu vào** | • **Tên** (M, ≤ 255)<br>• **Mã** (S, ≤ 50, auto)<br>• **Mã vạch** (S, cho máy quét)<br>• **Danh mục** (M)<br>• **Loại** (M, Sản phẩm/Dịch vụ/Combo)<br>• **Đơn vị tính** (M)<br>• **Giá bán** (M, ≥ 0)<br>• **Giá vốn** (S)<br>• **Giá khuyến mãi** (S)<br>• **VAT** (S, 0/5/8/10%)<br>• **Mô tả ngắn / đầy đủ** (S)<br>• **Ảnh** (S)<br>• **Biến thể** (S, table size/màu/...)<br>• **Thời lượng dịch vụ** (S nếu là dịch vụ có booking, phút)<br>• **Số nhân viên cần** (S)<br>• **Tồn kho ban đầu** (S, nếu sản phẩm)<br>• **Tồn tối thiểu** (S)<br>• **Cho phép bán khi hết** (toggle)<br>• **Nhóm thuộc gói TV** (S, multi-select)<br>• **Trạng thái** (M, Đang bán/Ngừng bán) |
| **Tiêu chí chấp nhận** | 1. Sản phẩm: trừ kho khi bán + trừ kho khi dùng combo.<br>2. Dịch vụ: không trừ kho.<br>3. Combo: tự gộp các item con + cho phép giá riêng (khác tổng giá lẻ).<br>4. Item Đang bán xuất hiện trong POS; Ngừng bán → ẩn nhưng vẫn xem được trong lịch sử. |
| **Mức ưu tiên** | **M** |

### UR-SETUP-08 — Tạo combo

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-08 |
| **Tên** | Đóng gói nhiều item thành 1 combo bán chung |
| **Actor** | Tenant Admin |
| **Mô tả** | Combo là item đặc biệt gộp nhiều sản phẩm/dịch vụ với giá ưu đãi (rẻ hơn tổng các item lẻ). |
| **Tiêu chí chấp nhận** | 1. Form thêm combo có bảng "Thành phần" với SL + item.<br>2. Khi bán combo: hệ thống ghi nhận từng thành phần (cho báo cáo) nhưng tính tổng giá theo combo.<br>3. Sản phẩm trong combo vẫn trừ kho. |
| **Mức ưu tiên** | **S** |

### UR-SETUP-09 — Import sản phẩm hàng loạt

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-09 |
| **Tên** | Import sản phẩm/dịch vụ từ Excel |
| **Actor** | Tenant Admin |
| **Mô tả** | Cho phép nhập hàng trăm item từ file Excel mẫu. |
| **Tiêu chí chấp nhận** | 1. Tải file mẫu.<br>2. Upload + preview + kiểm tra mapping cột.<br>3. Báo cáo dòng lỗi.<br>4. Hỗ trợ cập nhật (có cột "Mã" thì update, không có thì tạo mới). |
| **Mức ưu tiên** | **S** |

---

## C. Quản lý gói thành viên

### UR-SETUP-10 — Tạo / sửa gói thành viên

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-10 |
| **Tên** | Định nghĩa các gói thẻ/quota khách có thể mua |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant cấu hình các gói (Basic, Premium, Standard...) với giá, thời hạn, danh sách dịch vụ kèm + quota. |
| **Đầu vào** | • **Tên gói** (M)<br>• **Mã gói** (S, auto)<br>• **Màu chủ đạo** (S, color picker)<br>• **Giá** (M, ≥ 0)<br>• **Giá khuyến mãi** (S, hiển thị giá gốc gạch ngang)<br>• **Thời hạn** (M, số tháng ≥ 1)<br>• **Mô tả ngắn** (M, ≤ 500)<br>• **Danh sách dịch vụ kèm** (M, table với cột: Dịch vụ, Số lượt, Đơn vị)<br>• **Ưu đãi bổ sung** (S, vd "Giảm 10% spa khác ngoài gói")<br>• **Ảnh** (S)<br>• **Badge** (S, "Phổ biến", "Mới", "Giảm 20%")<br>• **Trạng thái** (M, Đang bán/Ngừng bán)<br>• **Thứ tự hiển thị** (S) |
| **Tiêu chí chấp nhận** | 1. CRUD đầy đủ.<br>2. Gói Đang bán hiển thị trong màn Bán thẻ thành viên (UR-RECEPTION-20).<br>3. Khi khách mua gói → tự cộng quota tương ứng vào ví dịch vụ của khách.<br>4. Quota tự giảm khi nhân viên trừ ở UR-RECEPTION-18.<br>5. Hỗ trợ quota "không giới hạn" (∞). |
| **Mức ưu tiên** | **M** |

---

## D. Vận hành cơ sở (Branch Operations)

### UR-SETUP-11 — Quản lý cơ sở / chi nhánh

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-11 |
| **Tên** | CRUD cơ sở vật lý của tenant |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant tạo các cơ sở (chi nhánh) là điểm bán vật lý. Mỗi cơ sở có dữ liệu cô lập. |
| **Đầu vào** | • **Tên cơ sở** (M)<br>• **Mã** (S, auto)<br>• **Địa chỉ** (M)<br>• **SĐT** (S)<br>• **Quản lý phụ trách** (S)<br>• **Múi giờ** (S, nếu khác default)<br>• **Trạng thái** (M, Đang hoạt động/Tạm đóng) |
| **Tiêu chí chấp nhận** | 1. CRUD đầy đủ.<br>2. Một tenant tối thiểu 1 cơ sở.<br>3. Khách hàng, đơn, kho... đều scope theo cơ sở.<br>4. Switcher cơ sở trên Header (UR-ACCESS-07). |
| **Mức ưu tiên** | **M** |

### UR-SETUP-12 — Cấu hình ca làm việc mẫu

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-12 |
| **Tên** | Setup các template ca cho cơ sở |
| **Actor** | Tenant Admin, Branch Manager |
| **Mô tả** | Tenant định nghĩa các mẫu ca (Ca sáng, Ca chiều, Ca toàn thời...) để khi mở ca ở Part 02 nhân viên chỉ cần chọn. |
| **Đầu vào** | • **Tên ca** (M)<br>• **Giờ bắt đầu** (M)<br>• **Giờ kết thúc** (M)<br>• **Tiền mặt mặc định đầu ca** (S)<br>• **Bắt buộc đếm mệnh giá** (toggle)<br>• **Cho phép mở nhiều ca đồng thời** (toggle) |
| **Tiêu chí chấp nhận** | 1. Mỗi cơ sở có cấu hình riêng.<br>2. Sửa cấu hình không ảnh hưởng các ca đã đóng. |
| **Mức ưu tiên** | **M** |

### UR-SETUP-13 — Cấu hình phương thức thanh toán

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-13 |
| **Tên** | Bật/tắt và cấu hình từng phương thức |
| **Actor** | Tenant Admin |
| **Mô tả** | Tenant chọn các phương thức thanh toán nào dùng + cấu hình credentials cho từng cái. |
| **Tiêu chí chấp nhận** | 1. **Tiền mặt** — mặc định bật, không cần config.<br>2. **Chuyển khoản** — STK, NH, chủ TK, QR tĩnh.<br>3. **Thẻ** — máy POS bank (chỉ ghi nhận, không integrate).<br>4. **Ví điện tử** — link sang Part 12 (tích hợp).<br>5. **Công nợ** — cho phép bán chịu hay không. |
| **Mức ưu tiên** | **M** |

### UR-SETUP-14 — Cấu hình giao diện POS

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-SETUP-14 |
| **Tên** | Tùy biến màn POS theo nhu cầu |
| **Actor** | Tenant Admin, Branch Manager |
| **Mô tả** | Cho phép bật/tắt các tab trên POS, chọn danh mục mặc định, hành vi sau thanh toán. |
| **Tiêu chí chấp nhận** | 1. Bật/tắt tabs: Bán hàng / Bán thẻ / Bán LP / Đơn tạm / Đơn hàng / Báo cáo.<br>2. Chọn danh mục mặc định khi mở POS.<br>3. Cho phép Quick Add hay không.<br>4. Tự động in hóa đơn sau thanh toán hay không. |
| **Mức ưu tiên** | **S** |

---

## Tóm tắt yêu cầu Part 11

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-SETUP-01 | Thông tin đơn vị | M |
| UR-SETUP-02 | Định dạng hệ thống | M |
| UR-SETUP-03 | Cấu hình in | S |
| UR-SETUP-04 | Mã tự động | S |
| UR-SETUP-05 | Làm tròn giá | C |
| UR-SETUP-06 | Cây danh mục SP/DV | M |
| UR-SETUP-07 | Tạo/sửa sản phẩm/dịch vụ | M |
| UR-SETUP-08 | Tạo combo | S |
| UR-SETUP-09 | Import hàng loạt | S |
| UR-SETUP-10 | Gói thành viên | M |
| UR-SETUP-11 | Quản lý cơ sở | M |
| UR-SETUP-12 | Cấu hình ca làm việc | M |
| UR-SETUP-13 | Cấu hình phương thức TT | M |
| UR-SETUP-14 | Cấu hình POS | S |

**Tổng:** 14 yêu cầu — 8 Must, 5 Should, 1 Could.

---

*Hết Part 11.*
