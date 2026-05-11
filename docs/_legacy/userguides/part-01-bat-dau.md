# Part 01 — Bắt đầu với Reborn Retail CRM

> **Dành cho**: Tất cả người dùng mới (Thu ngân, Nhân viên kho, Kế toán, Quản lý cửa hàng)
> **Mức độ**: Cơ bản
> **Tham chiếu URD**: [Part 01 — Truy cập hệ thống](../urd/part-01-truy-cap.md) (UR-ACCESS-01 → UR-ACCESS-10)

Chào mừng bạn đến với **Reborn Retail CRM** — hệ thống quản lý bán lẻ đa kênh. Part này sẽ giúp bạn làm quen với giao diện và những thao tác cơ bản nhất trong 10 phút.

## Mục lục
- [1. Đăng nhập vào hệ thống](#1-đăng-nhập-vào-hệ-thống)
- [2. Tour giao diện](#2-tour-giao-diện)
- [3. Chọn vai trò khi có nhiều role](#3-chọn-vai-trò-khi-có-nhiều-role)
- [4. Chọn cơ sở làm việc](#4-chọn-cơ-sở-làm-việc)
- [5. Cập nhật thông tin cá nhân](#5-cập-nhật-thông-tin-cá-nhân)
- [6. Đổi mật khẩu](#6-đổi-mật-khẩu)
- [7. Đổi ngôn ngữ VI/EN](#7-đổi-ngôn-ngữ-vien)
- [8. Thu/gọn sidebar](#8-thugọn-sidebar)
- [9. Xem thông báo](#9-xem-thông-báo)
- [10. Tìm kiếm nhanh](#10-tìm-kiếm-nhanh)
- [11. Đăng xuất an toàn](#11-đăng-xuất-an-toàn)
- [12. Dashboard Retail](#12-dashboard-retail)
- [FAQ](#faq)

---

## 1. Đăng nhập vào hệ thống

Reborn Retail CRM sử dụng **SSO (Single Sign-On)** — bạn chỉ cần 1 tài khoản cho toàn bộ hệ sinh thái Reborn.

### Bước 1: Mở trình duyệt và truy cập URL

Mở **Chrome** hoặc **Edge** (phiên bản ≥ 110) và truy cập URL do đội triển khai cung cấp, ví dụ:

```
https://yourbrand.reborn.vn/crm
```

### Bước 2: Nhập thông tin đăng nhập

Tại trang SSO, nhập:

- **Số điện thoại** (10 số) hoặc **Email** đã được cấp
- **Mật khẩu** (≥ 8 ký tự)

Tích ô **Ghi nhớ đăng nhập** nếu máy bạn dùng cá nhân (phiên sẽ giữ 30 ngày).

Nhấn nút **[Đăng nhập]** màu xanh lá.

> 🖼️ *Ảnh minh hoạ: Màn hình SSO Reborn — chụp sau*

### Bước 3: Chờ redirect

Sau khi xác thực thành công, hệ thống sẽ tự động chuyển bạn vào màn hình POS hoặc Dashboard (tuỳ role).

⚠️ **Chú ý**: Sai mật khẩu 3 lần liên tiếp → tài khoản sẽ bị khoá 5 phút. Hãy bấm **Quên mật khẩu** nếu không chắc.

---

## 2. Tour giao diện

Sau khi đăng nhập, bạn sẽ thấy giao diện gồm **3 vùng chính**:

### 2.1. Header (thanh trên cùng)

Từ trái sang phải:

- **Logo Reborn** — click để quay về Dashboard
- **Nút thu/gọn Sidebar** — icon 3 vạch
- **Ô chọn cơ sở** — hiển thị cơ sở đang làm việc (xem mục 4)
- **Ô tìm kiếm nhanh** — phím tắt `Ctrl + K`
- **Chuông thông báo** 🔔 — có badge đỏ nếu có noti mới
- **Nút ngôn ngữ** — VI / EN
- **Avatar user** — click để mở menu cá nhân

### 2.2. Sidebar (thanh trái)

Menu đa cấp, chia theo phân hệ:

- Dashboard
- Bán hàng (POS, Đơn hàng, Trả hàng)
- Khách hàng
- Kho & Sản phẩm
- Mua hàng
- Tài chính
- Marketing
- Báo cáo
- Cài đặt

💡 **Mẹo**: Menu sẽ chỉ hiển thị các mục bạn có **quyền** truy cập. Nếu không thấy menu mong đợi, liên hệ Quản lý để cấp quyền.

### 2.3. Content (vùng làm việc)

Khu vực chính bên phải — nơi hiển thị nội dung trang bạn đang mở.

> 🖼️ *Ảnh minh hoạ: Tổng quan 3 vùng layout — chụp sau*

---

## 3. Chọn vai trò khi có nhiều role

Nếu tài khoản của bạn thuộc **nhiều phòng ban / vai trò**, sau khi login sẽ hiện modal **Chọn vai trò**.

### Các bước

1. Đọc tên từng vai trò kèm phòng ban.
2. Click vào vai trò muốn sử dụng cho phiên này.
3. Nhấn **[Xác nhận]**.

Hệ thống lưu vai trò vào phiên. Bạn có thể đổi vai trò sau bằng cách click **Avatar → Đổi vai trò** (không cần logout).

🔒 **Quyền**: Vai trò quyết định menu + chức năng bạn thấy. Chọn đúng vai trò trước khi bắt đầu làm việc.

---

## 4. Chọn cơ sở làm việc

Nếu bạn quản lý nhiều chi nhánh/cửa hàng, hãy chọn đúng cơ sở trước khi thao tác.

### Các bước

1. Ở **Header**, click vào ô hiển thị cơ sở hiện tại (bên cạnh logo).
2. Dropdown hiện danh sách cơ sở bạn có quyền.
3. Click chọn cơ sở → các trang đang mở sẽ tự reload theo cơ sở mới.

⚠️ **Chú ý**: Nếu đang mở giỏ hàng POS mà đổi cơ sở → hệ thống sẽ **confirm** trước khi mất dữ liệu. Nên hoàn tất đơn trước khi switch.

> 🖼️ *Ảnh minh hoạ: Dropdown chọn cơ sở — chụp sau*

---

## 5. Cập nhật thông tin cá nhân

### Các bước

1. Click **Avatar** ở góc phải trên → chọn **Thông tin cá nhân**.
2. Trang `/setting_personal` mở ra.
3. Sửa các trường: *Họ tên*, *SĐT liên hệ*, *Avatar*, *Ngôn ngữ ưa thích*.
4. Nhấn **[Lưu thay đổi]** (nút xanh lá).

💡 **Mẹo**: Ảnh avatar nên ≤ 2MB, định dạng JPG/PNG, tỷ lệ vuông cho đẹp.

---

## 6. Đổi mật khẩu

### Các bước

1. Vào **Thông tin cá nhân** như mục 5.
2. Cuộn xuống khu vực **Đổi mật khẩu**.
3. Nhập:
   - *Mật khẩu hiện tại*
   - *Mật khẩu mới* (≥ 8 ký tự, phải có chữ hoa, chữ thường, số)
   - *Xác nhận mật khẩu mới*
4. Nhấn **[Cập nhật mật khẩu]**.

⚠️ **Chú ý**: Sau khi đổi mật khẩu thành công, hệ thống sẽ **đăng xuất toàn bộ session** (kể cả tablet / POS khác đang login cùng tài khoản). Bạn cần login lại.

---

## 7. Đổi ngôn ngữ VI/EN

Click nút **VI / EN** ở Header. Giao diện switch tức thời, không cần reload trang.

💡 **Mẹo**: Ngôn ngữ được lưu theo user — lần sau login sẽ nhớ.

---

## 8. Thu/gọn sidebar

Nếu màn hình nhỏ hoặc bạn muốn tập trung vào vùng nội dung:

- Click icon **3 vạch** (☰) ở Header → sidebar thu lại chỉ còn icon.
- Click lại → mở rộng trở lại.

Trạng thái được nhớ trong trình duyệt.

---

## 9. Xem thông báo

### Các bước

1. Click **chuông 🔔** ở Header — dropdown hiện 10 thông báo gần nhất.
2. Click vào 1 thông báo → navigate tới trang liên quan (đơn hàng, ticket, cảnh báo tồn...).
3. Để xem tất cả, nhấn **Xem tất cả** cuối dropdown → mở trang `/notification`.

💡 **Mẹo**: Lần đầu, trình duyệt sẽ hỏi quyền gửi notification — **bấm Allow** để nhận thông báo real-time.

---

## 10. Tìm kiếm nhanh

Phím tắt `Ctrl + K` (hoặc `⌘ + K` trên Mac) → mở ô tìm kiếm toàn cục.

Có thể tìm: **đơn hàng, khách hàng, sản phẩm, trang/menu**.

Gõ từ khoá → kết quả gợi ý hiện ngay → Enter để nhảy tới.

---

## 11. Đăng xuất an toàn

### Các bước

1. Click **Avatar** → chọn **Đăng xuất**.
2. Hệ thống xoá cookie + token → redirect về trang login.

⚠️ **Chú ý**: Nếu đang có giỏ hàng POS chưa thanh toán, hệ thống sẽ cảnh báo trước. Nên **Tạm treo đơn** (xem Part 02) trước khi đăng xuất.

🔒 **Nguyên tắc an toàn**: Luôn đăng xuất khi rời máy POS công cộng để tránh người khác thao tác nhầm dưới tài khoản của bạn.

---

## 12. Dashboard Retail

Sau khi login (nếu role là Store Manager hoặc cao hơn), bạn sẽ thấy **Dashboard Retail** tại `/dashboard`.

### 12.1. 6 KPI chính

| KPI | Ý nghĩa |
|---|---|
| **Doanh thu hôm nay** | Tổng tiền đơn PAID trong ngày |
| **Đơn hàng hôm nay** | Số đơn đã hoàn tất |
| **Khách mới** | Số customer mới đăng ký |
| **AOV** | Giá trị trung bình mỗi đơn |
| **Tồn kho thấp** | Số SP < ngưỡng cảnh báo |
| **Công nợ phải thu** | Tổng công nợ chưa thu |

Click vào mỗi tile để xem trang chi tiết.

### 12.2. Biểu đồ doanh thu 7 ngày

Đường biểu diễn doanh thu 7 ngày gần nhất + top 5 sản phẩm bán chạy.

💡 **Mẹo**: Dashboard **tự refresh mỗi 5 phút**. Nếu muốn update ngay, nhấn F5.

> 🖼️ *Ảnh minh hoạ: Dashboard Retail đầy đủ — chụp sau*

---

## FAQ

**1. Tôi quên mật khẩu, làm sao lấy lại?**
Tại trang SSO, nhấn **Quên mật khẩu** → nhập SĐT/email → nhận OTP qua tin nhắn/email → đặt mật khẩu mới.

**2. Tôi login được nhưng không thấy menu POS?**
Có 2 nguyên nhân: (a) Role của bạn không có quyền POS — liên hệ Quản lý; (b) Bạn đang ở sai vai trò — click Avatar → Đổi vai trò.

**3. Tôi thấy sai cơ sở (ví dụ cơ sở B trong khi đang đứng tại cơ sở A)?**
Click ô cơ sở ở Header, chọn lại cơ sở A. Nếu không thấy cơ sở A trong dropdown, liên hệ Quản lý để được gán quyền.

**4. Sidebar của tôi bị thu gọn không mở lại được?**
Nhấn icon 3 vạch ở Header hoặc xoá cache trình duyệt → F5.

**5. Tôi không nhận được thông báo dù có đơn mới?**
Kiểm tra: (a) Đã Allow notification ở trình duyệt chưa; (b) Trình duyệt có đang mở tab CRM không (FCM cần tab active).

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "Sai tài khoản hoặc mật khẩu" | Gõ sai | Kiểm tra caps lock, gõ lại |
| "Tài khoản bị khoá" | Sai 3 lần liên tiếp | Chờ 5 phút, thử lại |
| "Phiên đã hết hạn" | Quá 8 giờ không tương tác | Login lại |
| Trang trắng sau login | Cache cũ | Ctrl+Shift+R để reload cứng |

---

*Hết Part 01. Xem tiếp [Part 02 — POS Bán hàng](part-02-pos-ban-hang.md).*
