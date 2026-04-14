# Part 01 — Truy cập hệ thống

## Phạm vi

Phân hệ này bao phủ **truy cập, định danh, giao diện chung và Dashboard**. Đây là điểm chạm đầu tiên của mọi người dùng với hệ thống.

**Các module liên quan:** Login, SSO, Layout chung (Header/Sidebar), Dashboard, Switcher cơ sở, Menu người dùng.

**Actors chính:** Guest, Staff, Receptionist, Branch Manager, Tenant Admin.

---

## UR-ACCESS-01 — Đăng nhập qua SSO

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-01 |
| **Tên** | Đăng nhập tập trung qua SSO |
| **Actor** | Guest, Staff, Branch Manager, Tenant Admin |
| **Mô tả** | Người dùng phải đăng nhập một lần qua trang SSO chung để truy cập CRM cũng như các sản phẩm khác trong hệ sinh thái Reborn. Sau khi đăng nhập, session phải được duy trì để chuyển qua lại giữa các sản phẩm mà không cần nhập lại mật khẩu. |
| **Tiền điều kiện** | Người dùng có tài khoản hợp lệ (do admin tenant tạo). |
| **Đầu vào** | • SĐT / Email / ID nhân viên<br>• Mật khẩu<br>• Tùy chọn "Ghi nhớ" |
| **Đầu ra** | • Token phiên được lưu vào cookie/localStorage<br>• Người dùng được chuyển vào trang mặc định (Dashboard hoặc landing tùy cấu hình)<br>• Nếu tài khoản có nhiều vai trò → hiện modal "Chọn vai trò" |
| **Tiêu chí chấp nhận** | 1. Đúng SĐT + đúng mật khẩu → đăng nhập thành công.<br>2. Sai mật khẩu → hiện thông báo lỗi rõ ràng, không tiết lộ tài khoản tồn tại hay không.<br>3. Tick "Ghi nhớ" → phiên kéo dài tối thiểu 7 ngày trên trình duyệt đó.<br>4. Đăng nhập một lần → mở các sản phẩm Reborn khác trong cùng SSO không cần nhập lại. |
| **Mức ưu tiên** | **M** — Must |
| **Ghi chú** | URL SSO mặc định `localhost:8080` cho dev, `https://sso.reborn.vn` cho production. Hỗ trợ cả `Đăng nhập với Google` và `Đăng nhập với AppHub`. |

---

## UR-ACCESS-02 — Đăng nhập đa vai trò

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-02 |
| **Tên** | Chọn vai trò khi tài khoản có nhiều quyền |
| **Actor** | Staff có nhiều vai trò |
| **Mô tả** | Một tài khoản có thể được gán đồng thời nhiều vai trò ở nhiều cơ sở. Sau khi đăng nhập, hệ thống phải hỏi người dùng chọn vai trò + cơ sở muốn làm việc trong phiên hiện tại. |
| **Tiền điều kiện** | UR-ACCESS-01 đã thực hiện thành công. |
| **Đầu vào** | Lựa chọn vai trò và cơ sở từ danh sách. |
| **Đầu ra** | Phiên làm việc gắn với vai trò + cơ sở đã chọn; mọi truy vấn dữ liệu sau đó bị scope theo cơ sở đó. |
| **Tiêu chí chấp nhận** | 1. Tài khoản 1 vai trò, 1 cơ sở → bỏ qua bước này, vào thẳng Dashboard.<br>2. Tài khoản nhiều vai trò → hiện modal chọn.<br>3. Sau khi chọn, có thể đổi qua menu **Avatar → Vai trò**. |
| **Mức ưu tiên** | **M** |
| **Ghi chú** | Mặc định ghi nhớ vai trò + cơ sở đã chọn cho lần đăng nhập sau (cấu hình được). |

---

## UR-ACCESS-03 — Quên mật khẩu / Reset mật khẩu

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-03 |
| **Tên** | Khôi phục mật khẩu |
| **Actor** | Staff (đã có tài khoản nhưng quên mật khẩu) |
| **Mô tả** | Người dùng phải có cách lấy lại quyền truy cập khi quên mật khẩu, qua kênh email hoặc SMS đã đăng ký với admin tenant. |
| **Tiền điều kiện** | Tài khoản tồn tại; có email hoặc SĐT hợp lệ. |
| **Đầu vào** | SĐT hoặc email đăng ký. |
| **Đầu ra** | • Email/SMS chứa link/OTP reset được gửi.<br>• Sau khi đặt lại, session cũ bị hủy. |
| **Tiêu chí chấp nhận** | 1. OTP/Link có hiệu lực ≤ 15 phút.<br>2. Mật khẩu mới phải khác mật khẩu cũ và đáp ứng chính sách (≥ 8 ký tự, hoa + thường + số).<br>3. Mọi phiên cũ trên thiết bị khác bị đăng xuất. |
| **Mức ưu tiên** | **M** |

---

## UR-ACCESS-04 — Đăng xuất an toàn

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-04 |
| **Tên** | Đăng xuất khỏi hệ thống |
| **Actor** | Staff |
| **Mô tả** | Người dùng có nút Đăng xuất trong menu cá nhân. Sau khi đăng xuất, mọi token bị xóa, người dùng quay về trang đăng nhập. |
| **Tiêu chí chấp nhận** | 1. Bấm **Đăng xuất** → cookie/token bị xóa.<br>2. Bấm Back của trình duyệt sau đó → KHÔNG xem được dữ liệu nội bộ.<br>3. Nếu cấu hình SSO logout, mọi sản phẩm Reborn khác cũng bị đăng xuất theo. |
| **Mức ưu tiên** | **M** |

---

## UR-ACCESS-05 — Layout chung: Sidebar + Header

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-05 |
| **Tên** | Cung cấp giao diện điều hướng nhất quán |
| **Actor** | Staff (mọi vai trò) |
| **Mô tả** | Mọi trang trong hệ thống phải có cùng thanh bên trái (Sidebar) chứa danh sách phân hệ, và thanh trên cùng (Header) chứa các công cụ chung: tìm kiếm toàn cục, switcher cơ sở, ngôn ngữ, thông báo, menu cá nhân. |
| **Tiêu chí chấp nhận** | 1. Sidebar hiển thị các nhóm phân hệ theo cấu hình tenant + vai trò người dùng.<br>2. Sidebar có nút **thu gọn** để tăng diện tích nội dung.<br>3. Mục đang truy cập được làm nổi bật trong sidebar.<br>4. Header hiển thị: tên gói thuê, tên cơ sở hiện tại, ngôn ngữ, chuông thông báo (kèm số chưa đọc), avatar.<br>5. Tìm kiếm toàn cục match với tên thành viên, mã đơn, mã sản phẩm, không phân biệt dấu/hoa thường. |
| **Mức ưu tiên** | **M** |

---

## UR-ACCESS-06 — Phân quyền theo Menu

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-06 |
| **Tên** | Ẩn/hiện các mục Menu theo quyền của vai trò |
| **Actor** | Staff |
| **Mô tả** | Sidebar phải tự động ẩn các mục mà vai trò hiện tại không có quyền truy cập. Nếu người dùng cố vào URL trực tiếp, hệ thống chặn truy cập. |
| **Tiêu chí chấp nhận** | 1. Vai trò không có quyền `customer.view` → mục **Thành viên** không hiện trong sidebar.<br>2. Truy cập URL `/customer_list` trực tiếp → hiện trang 403 hoặc redirect về Dashboard.<br>3. Việc thay đổi quyền (Part 12) áp dụng ngay khi người dùng đăng nhập lại lần sau. |
| **Mức ưu tiên** | **M** |

---

## UR-ACCESS-07 — Chuyển đổi cơ sở

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-07 |
| **Tên** | Đổi cơ sở làm việc trong phiên |
| **Actor** | Staff được gán nhiều cơ sở |
| **Mô tả** | Trên Header có dropdown cho phép đổi cơ sở. Mọi dữ liệu hiển thị (khách, đơn, kho, báo cáo…) sau đó tự lọc theo cơ sở mới. |
| **Tiêu chí chấp nhận** | 1. Dropdown chỉ liệt kê các cơ sở mà tài khoản được phép.<br>2. Sau khi đổi, mọi list/report tự refresh.<br>3. Cơ sở đang chọn được lưu vào session, dùng làm context mặc định. |
| **Mức ưu tiên** | **M** |

---

## UR-ACCESS-08 — Đa ngôn ngữ (i18n)

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-08 |
| **Tên** | Hỗ trợ tiếng Việt và tiếng Anh |
| **Actor** | Staff |
| **Mô tả** | Người dùng có thể chọn ngôn ngữ giao diện. Lựa chọn ngôn ngữ được ghi nhớ cho lần đăng nhập sau. |
| **Tiêu chí chấp nhận** | 1. Tối thiểu 2 ngôn ngữ: Tiếng Việt (mặc định), English.<br>2. Đổi ngôn ngữ áp dụng ngay không cần reload trang.<br>3. Mọi label, button, message hệ thống đều đổi theo ngôn ngữ.<br>4. Định dạng số / ngày / tiền tệ đổi theo locale tương ứng. |
| **Mức ưu tiên** | **S** — Should |

---

## UR-ACCESS-09 — Thông báo trong app

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-09 |
| **Tên** | Trung tâm thông báo cho người dùng |
| **Actor** | Staff |
| **Mô tả** | Hệ thống phải hiển thị các thông báo được gửi cho người dùng (đơn mới, yêu cầu phê duyệt, lịch sắp tới, alert quota…) ở chuông trên Header. Thông báo có badge số chưa đọc. |
| **Tiêu chí chấp nhận** | 1. Bấm chuông → mở dropdown danh sách thông báo, mới nhất ở trên.<br>2. Bấm vào một thông báo → điều hướng đến đối tượng liên quan + đánh dấu đã đọc.<br>3. Có nút **Đánh dấu tất cả đã đọc**.<br>4. Số trên badge cập nhật real-time hoặc near-real-time (poll ≤ 30 giây). |
| **Mức ưu tiên** | **S** |

---

## UR-ACCESS-10 — Dashboard tổng quan

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-10 |
| **Tên** | Trang Dashboard hiển thị KPI tức thời |
| **Actor** | Staff (tùy quyền), Branch Manager |
| **Mô tả** | Sau khi đăng nhập, người dùng được đưa đến (hoặc có thể vào) trang Dashboard hiển thị các chỉ số quan trọng nhất theo cơ sở đang chọn. |
| **Đầu ra** | Hiển thị: số thành viên active vs giới hạn gói, lượt check-in hôm nay, số thành viên sắp hết hạn, doanh thu kỳ, biểu đồ top dịch vụ bán chạy, sự kiện sắp tới, cảnh báo quota, các nút truy cập nhanh. |
| **Tiêu chí chấp nhận** | 1. Mọi số liệu thuộc cơ sở đang chọn (UR-ACCESS-07).<br>2. Số liệu được tính từ dữ liệu thật, không hardcode.<br>3. Bấm vào một KPI → điều hướng đến trang chi tiết tương ứng.<br>4. Trang Dashboard load ≤ 3 giây với cơ sở < 10.000 khách. |
| **Mức ưu tiên** | **M** |

---

## UR-ACCESS-11 — Tìm kiếm toàn cục

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-11 |
| **Tên** | Ô tìm kiếm trên Header |
| **Actor** | Staff |
| **Mô tả** | Người dùng có thể tìm nhanh khách hàng / sản phẩm / dịch vụ / đơn hàng từ ô tìm kiếm trên Header mà không cần vào từng phân hệ. |
| **Tiêu chí chấp nhận** | 1. Gõ ≥ 2 ký tự → hiện gợi ý dropdown (debounce 300ms).<br>2. Kết quả nhóm theo loại đối tượng (Khách / Đơn / Sản phẩm).<br>3. Bấm vào kết quả → điều hướng đến chi tiết.<br>4. Nhấn **Enter** → mở trang kết quả tìm kiếm đầy đủ. |
| **Mức ưu tiên** | **S** |

---

## UR-ACCESS-12 — Phiên hết hạn (Session Timeout)

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-ACCESS-12 |
| **Tên** | Tự động đăng xuất khi không hoạt động |
| **Actor** | Hệ thống |
| **Mô tả** | Để bảo mật, sau N phút không có thao tác (cấu hình ở Part 11), phiên người dùng tự động hết hạn và yêu cầu đăng nhập lại. |
| **Tiêu chí chấp nhận** | 1. Mặc định N = 60 phút, có thể đổi 15–480 phút.<br>2. Trước khi hết hạn 2 phút, hệ thống hiện modal cảnh báo cho người dùng tiếp tục.<br>3. Khi hết hạn, mọi tác vụ đang gõ bị mất, người dùng phải đăng nhập lại.<br>4. Nếu tick "Ghi nhớ", thời gian này được nhân đôi. |
| **Mức ưu tiên** | **S** |

---

## Tóm tắt yêu cầu Part 01

| ID | Tên | Ưu tiên |
|----|-----|:-------:|
| UR-ACCESS-01 | Đăng nhập SSO | M |
| UR-ACCESS-02 | Chọn vai trò sau đăng nhập | M |
| UR-ACCESS-03 | Khôi phục mật khẩu | M |
| UR-ACCESS-04 | Đăng xuất an toàn | M |
| UR-ACCESS-05 | Layout chung Sidebar + Header | M |
| UR-ACCESS-06 | Phân quyền theo Menu | M |
| UR-ACCESS-07 | Chuyển đổi cơ sở | M |
| UR-ACCESS-08 | Đa ngôn ngữ Vi/En | S |
| UR-ACCESS-09 | Trung tâm thông báo | S |
| UR-ACCESS-10 | Dashboard tổng quan | M |
| UR-ACCESS-11 | Tìm kiếm toàn cục | S |
| UR-ACCESS-12 | Session Timeout | S |

**Tổng:** 12 yêu cầu — 8 Must, 4 Should.

---

*Hết Part 01.*
