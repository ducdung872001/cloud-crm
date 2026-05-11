# Part 01 — Truy cập hệ thống

## 1. Phạm vi phân hệ

Phân hệ Truy cập bao gồm các yêu cầu liên quan đến: đăng nhập/đăng xuất, SSO, phiên làm việc, chọn vai trò, giao diện chung (header/sidebar/notification), Dashboard Retail mặc định, và cấu hình cá nhân của user hiện tại.

## 2. Actor liên quan

- **Guest** — chưa đăng nhập
- **Staff / Cashier / Warehouse / Accountant / Marketer** — đã đăng nhập ở vai trò thường
- **Store Manager / Tenant Admin** — đã đăng nhập ở vai trò quản lý
- **System** — job tự động (refresh token, expire session)

## 3. Yêu cầu chi tiết

### UR-ACCESS-01 — Đăng nhập qua SSO

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-01 |
| **Tên** | Đăng nhập hệ thống qua SSO trung tâm |
| **Actor** | Guest, Staff |
| **Mô tả** | Người dùng nhập SĐT/email + mật khẩu ở trang SSO Reborn; sau khi xác thực thành công, hệ thống tạo session và redirect về URL gốc hoặc `/create_sale_add` (màn POS) nếu không có returnUrl. |
| **Tiền điều kiện** | Người dùng đã được Tenant Admin tạo tài khoản và cấp quyền |
| **Đầu vào** | SĐT (10 số) / email hợp lệ; mật khẩu ≥ 8 ký tự |
| **Đầu ra** | Cookie `token`, `user`, redirect về app, hiển thị tên user trên header |
| **Tiêu chí chấp nhận** | - Sai mật khẩu 3 lần → khoá 5 phút<br>- Session TTL mặc định 8 giờ, có tuỳ chọn "Remember me" 30 ngày<br>- Logout xoá cookie và redirect về SSO |
| **Ưu tiên** | **M** |

### UR-ACCESS-02 — Chọn vai trò (multi-role)

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-02 |
| **Tên** | Chọn vai trò khi user có nhiều role |
| **Actor** | Staff có multi-role |
| **Mô tả** | Nếu user thuộc nhiều `org`/`department`, sau login hiện modal **Chọn vai trò** (`ChooseRole`) liệt kê các vai trò kèm tên phòng ban. User chọn 1 role → lưu vào `localStorage.SelectedRole` và áp dụng cho phiên. |
| **Tiền điều kiện** | UR-ACCESS-01 đã pass |
| **Đầu vào** | Danh sách role trả về từ `/authenticator/user/info` |
| **Đầu ra** | `SelectedRole` trong localStorage, menu sidebar filter theo quyền role đó |
| **Tiêu chí chấp nhận** | - Nếu chỉ 1 role → tự động chọn<br>- User có thể đổi role mà không cần logout (nút "Đổi vai trò" trong user menu) |
| **Ưu tiên** | **M** |

### UR-ACCESS-03 — Phân quyền theo role (RBAC)

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-03 |
| **Tên** | Kiểm soát hiển thị menu + chức năng theo quyền |
| **Actor** | Tất cả |
| **Mô tả** | Mỗi menu item trong `routes.tsx` có trường `code` (vd `POS_CREATE_SALE_ORDER`, `INV_VIEW`). Backend trả về danh sách `permissions` cho role. Sidebar chỉ hiển thị các menu có code nằm trong danh sách đó. Các route không có quyền → 403 khi truy cập trực tiếp URL. |
| **Tiền điều kiện** | Tenant Admin đã gán quyền cho role ở `Cài đặt → Phân quyền` |
| **Đầu vào** | `user.permissions` từ API info |
| **Đầu ra** | Menu sidebar + hiển thị button theo quyền |
| **Tiêu chí chấp nhận** | - User không có quyền `POS_CREATE_SALE_ORDER` không thấy nút "Tạo đơn mới"<br>- Nhập URL trực tiếp bị chặn + toast "Bạn không có quyền" |
| **Ưu tiên** | **M** |

### UR-ACCESS-04 — Giao diện chung (Layout)

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-04 |
| **Tên** | Layout 3 vùng: Header + Sidebar + Content |
| **Actor** | Tất cả đã login |
| **Mô tả** | App dùng 1 layout chính `LayoutPage` có: (1) Header trên cùng với logo, chọn cơ sở, chuông thông báo, menu user, switcher ngôn ngữ; (2) Sidebar trái thu gọn/mở được với menu đa cấp; (3) Content khu vực chính bên phải. |
| **Đầu vào** | `isCollapsedSidebar` từ UIContext |
| **Đầu ra** | Layout responsive, nhớ trạng thái thu gọn |
| **Tiêu chí chấp nhận** | - Sidebar có thể mở rộng/thu gọn, trạng thái lưu trong localStorage<br>- Ngôn ngữ VI/EN switch tức thời, không reload<br>- Header bền — luôn hiện khi scroll content |
| **Ưu tiên** | **M** |

### UR-ACCESS-05 — Chọn cơ sở (Branch Switcher)

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-05 |
| **Tên** | Chuyển đổi giữa các cơ sở mà user có quyền |
| **Actor** | Multi-branch user (Store Manager, Chain Manager) |
| **Mô tả** | User đang ở cơ sở A có thể chuyển sang cơ sở B (trong cùng tenant) mà không cần logout. Header hiển thị cơ sở hiện tại, click để mở dropdown. Sau khi chọn, các API request tự động gửi `branchId` mới. |
| **Tiền điều kiện** | User có `branches` array ≥ 2 |
| **Đầu vào** | Selected `branchId` |
| **Đầu ra** | UIContext `dataBranch` cập nhật, trigger reload data các trang đang mở |
| **Tiêu chí chấp nhận** | - POS đang mở giỏ hàng mà chuyển cơ sở → confirm trước khi mất dữ liệu<br>- Report trang đang xem tự filter lại theo cơ sở mới |
| **Ưu tiên** | **S** |

### UR-ACCESS-06 — Dashboard Retail mặc định

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-06 |
| **Tên** | Dashboard Retail với 6 KPI chính + biểu đồ doanh thu |
| **Actor** | Store Manager, Tenant Admin |
| **Mô tả** | Màn hình `/dashboard` hiển thị 6 KPI tile: **Doanh thu hôm nay**, **Đơn hàng hôm nay**, **Khách mới**, **AOV**, **Tồn kho thấp cảnh báo**, **Công nợ phải thu**. Kèm biểu đồ đường doanh thu 7 ngày gần nhất và top 5 SP bán chạy. |
| **Đầu vào** | Filter cơ sở + khoảng thời gian |
| **Đầu ra** | Render KPI + chart từ `DashboardService` |
| **Tiêu chí chấp nhận** | - Load dưới 2s cho tenant có ≤ 1M đơn<br>- KPI tile click-through vào trang chi tiết tương ứng<br>- Auto refresh 5 phút/lần |
| **Ưu tiên** | **S** |

### UR-ACCESS-07 — Thông báo real-time

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-07 |
| **Tên** | Chuông thông báo với badge số chưa đọc |
| **Actor** | Tất cả đã login |
| **Mô tả** | Header có icon chuông hiển thị số thông báo chưa đọc (`countUnread`). Click → dropdown 10 notification gần nhất + link sang trang `/notification` full. Thông báo đến qua Firebase Cloud Messaging (`firebase-config.ts`). |
| **Đầu vào** | FCM token + subscription trên backend |
| **Đầu ra** | Toast khi có notification mới, badge update |
| **Tiêu chí chấp nhận** | - Permission browser được request lần đầu<br>- Click notification → navigate tới trang liên quan (order detail, ticket…)<br>- Mark-as-read khi click |
| **Ưu tiên** | **S** |

### UR-ACCESS-08 — Cài đặt cá nhân

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-08 |
| **Tên** | Cập nhật thông tin cá nhân + đổi mật khẩu |
| **Actor** | Tất cả |
| **Mô tả** | Trang `/setting_personal` cho user sửa: tên, avatar, SĐT liên hệ, ngôn ngữ ưa thích, đổi mật khẩu (nhập mật khẩu cũ + mới 2 lần). |
| **Đầu vào** | Form validation, mật khẩu mới ≥ 8 ký tự + có chữ hoa/thường/số |
| **Đầu ra** | Profile cập nhật, đăng xuất nếu đổi mật khẩu |
| **Tiêu chí chấp nhận** | - Đổi mật khẩu thành công → force logout tất cả session<br>- Avatar upload max 2MB, định dạng jpg/png |
| **Ưu tiên** | **M** |

### UR-ACCESS-09 — Đăng xuất

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-09 |
| **Tên** | Đăng xuất an toàn |
| **Actor** | Tất cả |
| **Mô tả** | User click "Đăng xuất" → xoá cookie, xoá localStorage (trừ cấu hình không nhạy cảm), revoke token ở SSO, redirect về trang login. |
| **Tiêu chí chấp nhận** | - Session-based data (giỏ hàng đang mở) được confirm trước khi mất<br>- Multi-tab logout đồng bộ (BroadcastChannel) |
| **Ưu tiên** | **M** |

### UR-ACCESS-10 — Session expire handling

| Trường | Nội dung |
|---|---|
| **ID** | UR-ACCESS-10 |
| **Tên** | Xử lý hết hạn phiên |
| **Actor** | System, User |
| **Mô tả** | Khi API trả 401, app tự động redirect về SSO với `returnUrl = currentPath`. Nếu đang ở trang POS có giỏ hàng chưa lưu → lưu tạm vào localStorage để restore sau khi login lại. |
| **Tiêu chí chấp nhận** | - Trong 10 phút trước khi hết hạn, hiện warning "Phiên sắp hết hạn, refresh?"<br>- Refresh token tự động nếu cookie có `refresh_token` |
| **Ưu tiên** | **M** |

## 4. Quy tắc nghiệp vụ liên quan

- **Tenant isolation**: mọi API có header `Hostname` = domain tenant, backend dùng để filter data.
- **Branch scoping**: các phân hệ Kho/POS/Report bắt buộc phải có `branchId` trong request.
- **Permission inheritance**: Store Manager kế thừa quyền Staff, Chain Manager kế thừa Store Manager.

## 5. Non-functional ràng buộc

- **Performance**: Login → Dashboard ≤ 3s trên mạng 4G.
- **Availability**: SSO login phải HA — downtime = toàn hệ thống không dùng được.
- **Security**: Password hash bcrypt cost ≥ 10, CSRF token trên mọi POST.

---

*Hết Part 01. Xem tiếp [Part 02 — POS Bán hàng](part-02-pos-ban-hang.md).*
