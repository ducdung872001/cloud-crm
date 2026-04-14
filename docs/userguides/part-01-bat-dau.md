# Part 01 — Bắt đầu sử dụng Reborn CRM

*Phiên bản: Cửa hàng & Spa — Tenant "Viettel Store"*

Phần này hướng dẫn bạn những thao tác đầu tiên khi mở ứng dụng: đăng nhập, làm quen với giao diện, nhận diện các khu vực chính trên màn hình, và biết cách đi tới từng phân hệ công việc.

> **Đối tượng đọc:** Người dùng mới hoặc quản lý vừa nhận tài khoản. Sau khi đọc xong, bạn sẽ tự tin đăng nhập, di chuyển giữa các mục, và biết "vào đâu để làm gì".

---

## 1. Mở ứng dụng và đăng nhập

### 1.1. Mở trang đăng nhập

Mở trình duyệt (khuyên dùng **Google Chrome** hoặc **Microsoft Edge** phiên bản mới), nhập địa chỉ hệ thống mà đơn vị cung cấp cho bạn. Ví dụ:

```
https://<ten-mien-cua-ban>/crm/
```

Khi vào lần đầu, hệ thống sẽ tự chuyển sang trang đăng nhập thống nhất (Single Sign-On).

![Trang đăng nhập — trạng thái trống](./images/part-01-bat-dau/01-login-empty.png)

Trang đăng nhập gồm:

| Ô / Nút | Ý nghĩa |
|---------|---------|
| **SĐT/Email/ID** | Nhập số điện thoại, email hoặc ID nhân viên mà đơn vị cấp cho bạn |
| **Nhập mật khẩu** | Nhập mật khẩu của bạn. Bấm biểu tượng con mắt ở cuối ô để hiện/ẩn mật khẩu |
| **Ghi nhớ** | Tick vào nếu bạn dùng máy tính cá nhân, lần sau sẽ không cần đăng nhập lại trong thời gian nhất định |
| **Đăng nhập** (nút xanh) | Gửi thông tin đăng nhập |
| **Google / AppHub** | Các cách đăng nhập thay thế nếu được cấu hình |

> **Lưu ý:** Trên máy tính công cộng, **không** tick "Ghi nhớ" để bảo vệ tài khoản của bạn.

### 1.2. Nhập thông tin và đăng nhập

1. Nhấp vào ô **SĐT/Email/ID** rồi nhập thông tin đăng nhập.
2. Nhấp vào ô **Nhập mật khẩu** rồi gõ mật khẩu.
3. Kiểm tra lại lần nữa.

![Trang đăng nhập — đã điền thông tin](./images/part-01-bat-dau/02-login-filled.png)

4. Bấm nút **Đăng nhập** (hoặc nhấn phím **Enter** trên bàn phím).

Hệ thống sẽ xác thực và đưa bạn vào màn hình làm việc.

### 1.3. Nếu hệ thống hỏi vai trò

Khi tài khoản của bạn được cấp nhiều vai trò khác nhau (ví dụ vừa là nhân viên bán hàng, vừa tham gia ban quản lý), hệ thống sẽ hiện một cửa sổ **Chọn vai trò** ngay sau khi đăng nhập.

- Chọn vai trò bạn muốn sử dụng trong phiên này.
- Bấm **Xác nhận / Tiếp tục**.

> **Mẹo:** Nếu công việc hằng ngày chỉ dùng một vai trò, bạn có thể bỏ qua bước này ở các lần sau bằng cách nhờ quản trị viên tắt các vai trò không dùng.

### 1.4. Tôi quên mật khẩu thì làm thế nào?

Hiện tại mật khẩu do đơn vị (admin) của bạn quản lý qua hệ thống SSO. Liên hệ:

- Người phụ trách CNTT / admin hệ thống tại đơn vị → yêu cầu **reset mật khẩu**.
- Sau khi được cấp lại, đăng nhập và nên đổi mật khẩu ngay trong mục **Tài khoản & bảo mật** (xem Part 12).

---

## 2. Tổng quan giao diện làm việc

Sau khi đăng nhập thành công, bạn sẽ thấy màn hình chính **Tổng quan** (Dashboard). Giao diện chia làm 3 khu vực:

![Màn hình tổng quan sau khi đăng nhập](./images/part-01-bat-dau/03-dashboard-overview.png)

| Khu vực | Vị trí | Chức năng |
|---------|--------|-----------|
| **Thanh bên trái (Sidebar)** | Dọc cột trái | Điều hướng giữa các phân hệ |
| **Thanh trên cùng (Header)** | Ngang trên cùng | Tên tenant, tìm kiếm toàn cục, thông báo, chọn ngôn ngữ, tài khoản |
| **Vùng nội dung** | Phần còn lại | Hiển thị nội dung của phân hệ bạn đang chọn |

### 2.1. Thanh trên cùng (Header)

![Thanh trên cùng](./images/part-01-bat-dau/05-header.png)

Từ trái sang phải:

1. **Logo Reborn + Nút thu gọn sidebar (« »)**
   Bấm vào biểu tượng `«` để **thu gọn** thanh bên trái (còn lại các icon nhỏ), giúp có nhiều diện tích hơn cho vùng nội dung. Bấm lại để mở rộng.

2. **Tên gói đang dùng**
   Ví dụ hiển thị *"Viettel - Sử dụng gói vàng"*. Đây là tên tenant (đơn vị) và gói dịch vụ bạn đang thuê.

3. **Thanh tìm kiếm toàn cục**
   Gõ tên thành viên, dịch vụ hoặc mã đơn hàng để tìm nhanh mà không cần vào từng phân hệ.

4. **Tên cơ sở (ví dụ: Viettel Store)**
   Nếu đơn vị bạn có nhiều cơ sở / cửa hàng, bấm vào đây để chuyển đổi cơ sở làm việc. Mọi số liệu hiển thị sau đó sẽ theo cơ sở bạn vừa chọn.

5. **Chọn ngôn ngữ (Tiếng Việt / English)**

   ![Chọn ngôn ngữ](./images/part-01-bat-dau/08-language-switcher.png)

   Bấm để mở menu và chọn ngôn ngữ hiển thị. Lựa chọn này được ghi nhớ cho các lần đăng nhập sau.

6. **Chuông thông báo 🔔 (kèm số lượng chưa đọc)**
   Bấm để xem các thông báo hệ thống gửi cho bạn: đơn hàng mới, yêu cầu phê duyệt, lịch công việc, v.v.

7. **Avatar + tên người dùng**

   ![Menu người dùng](./images/part-01-bat-dau/07-user-menu.png)

   Bấm vào avatar/tên để mở menu cá nhân gồm:
   - **Hồ sơ** — xem/chỉnh thông tin cá nhân.
   - **Vai trò** — chuyển đổi vai trò nếu tài khoản có nhiều vai trò.
   - **Đăng xuất** — thoát khỏi hệ thống.

### 2.2. Thanh bên trái (Sidebar)

![Thanh bên trái mặc định](./images/part-01-bat-dau/06-sidebar.png)

Thanh bên trái là "mục lục" của toàn bộ ứng dụng. Nó gồm 12 mục lớn, mỗi mục tương ứng với một phân hệ công việc:

| # | Mục | Mô tả ngắn | Part liên quan |
|---|-----|------------|----------------|
| 1 | **Tổng quan** | Dashboard chính với chỉ số tức thời | Part 01 (mục 3) |
| 2 | **Lễ tân** | Bán hàng tại quầy, check-in khách, trừ quota, quản lý ca | Part 02 |
| 3 | **Thành viên** | Danh sách khách hàng là hội viên, cài đặt | Part 03 |
| 4 | **Giao dịch** | Danh sách đơn hàng, hóa đơn VAT | Part 04 |
| 5 | **Lưu trú** | Quản lý lưu trú / phòng (nếu kinh doanh có dịch vụ lưu trú) | Part 05 |
| 6 | **Tài chính & Thanh toán** | Sổ thu chi, quỹ, công nợ, đối soát | Part 06 |
| 7 | **Đối tác (KOL/PO)** | Đối tác giới thiệu / KOL / purchase order | Part 07 |
| 8 | **Phản hồi** | Phản hồi / khiếu nại của khách | Part 07 |
| 9 | **Báo cáo** | Báo cáo doanh thu, thành viên, check-in, dịch vụ, đối tác, tài chính | Part 08 |
| 10 | **Ưu đãi & Chăm sóc** | Khuyến mãi/voucher, tích điểm, chiến dịch marketing, chăm sóc thành viên | Part 09 |
| 11 | **Kho & Nguyên vật liệu** | Nguyên vật liệu, nhà cung cấp, kho, kiểm kê | Part 10 |
| 12 | **Cài đặt** | Cấu hình tenant, danh mục dịch vụ, tổ chức & phân quyền, tích hợp | Part 11 + Part 12 |

#### Mở rộng một nhóm để xem các mục con

Các nhóm có dấu `›` ở cuối dòng là **nhóm có mục con**. Bấm vào tên nhóm (ví dụ *"Lễ tân"*) hoặc vào dấu `›` để mở rộng. Sau khi mở, các mục con hiện bên dưới thụt vào và bạn có thể bấm trực tiếp vào mục cần dùng.

![Nhóm "Lễ tân" đã mở — hiển thị 4 mục con](./images/part-01-bat-dau/09-sidebar-active.png)

Trong ảnh trên, nhóm **Lễ tân** đã được mở rộng, cho thấy 4 mục con:

- **Bán hàng tại quầy** — tạo hóa đơn bán hàng / dịch vụ ngay tại quầy.
- **Check-in / Cửa vào** — ghi nhận khách vào sử dụng dịch vụ.
- **Trừ quota dịch vụ** — trừ suất dịch vụ của gói thành viên.
- **Quản lý ca làm việc** — mở/đóng ca, bàn giao, kiểm quỹ.

Mục đang chọn sẽ được làm nổi bật màu xanh đậm, giúp bạn luôn biết mình đang ở đâu.

> **Mẹo:** Nếu bạn chỉ thấy icon mà không thấy chữ, có nghĩa là sidebar đang ở chế độ thu gọn. Bấm nút `«` ở góc trên-trái để mở rộng trở lại.

### 2.3. Vùng nội dung

Vùng bên phải là nơi bạn thực hiện công việc thực tế. Nội dung ở đây **thay đổi** theo mục bạn chọn ở thanh bên trái. Ở màn hình **Tổng quan**, vùng này hiển thị các ô số liệu kinh doanh tức thời.

---

## 3. Đọc nhanh màn hình Tổng quan

Màn hình **Tổng quan** (Dashboard) là nơi đầu tiên bạn nhìn thấy sau khi đăng nhập. Nó cung cấp một "ảnh chụp nhanh" tình hình kinh doanh của cơ sở bạn đang làm việc.

![Dashboard chi tiết](./images/part-01-bat-dau/10-dashboard-final.png)

Dashboard gồm 4 loại ô thông tin:

### 3.1. Các chỉ số tổng hợp (ô thẻ — KPI)

Hàng trên cùng hiển thị các chỉ số quan trọng:

- **Thành viên đang hoạt động** (ví dụ *"Active: 47/200"*) — số hội viên còn hiệu lực so với tổng số cho phép của gói dịch vụ.
- **Check-in hôm nay** — số lượt khách đã check-in trong ngày.
- **Hội viên sắp hết hạn** — số lượng cần nhắc gia hạn.
- **Doanh thu** — số liệu doanh thu trong kỳ (ngày / tháng, tùy cấu hình).

> **Lưu ý:** Các chỉ số này là con số tức thời, được hệ thống tính lại mỗi khi bạn mở lại màn hình hoặc làm mới trình duyệt (F5).

### 3.2. Biểu đồ "Bán tốt nhà"

Hiển thị các dịch vụ/sản phẩm bán chạy nhất trong kỳ, dạng thanh ngang có phần trăm. Dùng để biết nhanh mặt hàng nào đang là "xương sống doanh thu" của bạn.

### 3.3. Sự kiện sắp tới

Liệt kê các mốc thời gian quan trọng: đợt khai trương, các lớp sắp tổ chức, các chiến dịch chuẩn bị chạy. Nhắc bạn không bỏ lỡ.

### 3.4. Cảnh báo Quota

Bảng bên phải nhắc tên những hội viên có quota dịch vụ sắp hết / đã hết. Từ đây bạn có thể bấm vào tên để đi thẳng đến hồ sơ thành viên và nhắc khách gia hạn.

### 3.5. Truy cập nhanh

Các nút vuông như **Check-in**, **Trạm trả**, **Lớp lô**, **Lưu trú**, **Phản hồi**, **Lịch lớp**, v.v. là **lối tắt** để mở nhanh màn hình công việc hay dùng nhất, không cần qua sidebar.

---

## 4. Các luồng công việc cơ bản

Để giúp bạn hình dung, dưới đây là bản đồ "Tôi muốn làm... → vào đâu". Chi tiết từng luồng sẽ được hướng dẫn ở các Part tiếp theo.

| Tôi muốn... | Đi tới mục | Part hướng dẫn chi tiết |
|-------------|-----------|-------------------------|
| Mở ca làm việc đầu ngày | **Lễ tân → Quản lý ca làm việc** | Part 02 |
| Bán một gói dịch vụ cho khách mới | **Lễ tân → Bán hàng tại quầy** | Part 02 |
| Check-in cho khách đến sử dụng dịch vụ | **Lễ tân → Check-in / Cửa vào** | Part 02 |
| Tìm hồ sơ một hội viên | **Thành viên → Thành viên** | Part 03 |
| Thêm một hội viên mới (ngoài luồng bán hàng) | **Thành viên → Thành viên → Thêm mới** | Part 03 |
| Xem lại các hóa đơn bán hàng hôm nay | **Giao dịch → Danh sách đơn** | Part 04 |
| Hoàn tiền / trả hàng cho khách | **Giao dịch → Danh sách đơn → Chi tiết đơn** | Part 04 |
| Ghi nhận một khoản thu/chi ngoài bán hàng | **Tài chính & Thanh toán → Sổ thu chi** | Part 06 |
| Đối soát tiền mặt cuối ca | **Tài chính & Thanh toán → Đối soát thanh toán** | Part 06 |
| Tạo chương trình khuyến mãi | **Ưu đãi & Chăm sóc → Khuyến mãi & Voucher** | Part 09 |
| Nhập kho nguyên vật liệu mới | **Kho & Nguyên vật liệu → Sổ kho** | Part 10 |
| Thêm tài khoản nhân viên mới | **Cài đặt → Tổ chức & phân quyền** | Part 12 |
| Cấu hình danh mục dịch vụ / sản phẩm | **Cài đặt → Danh mục dịch vụ** | Part 11 |
| Đổi mật khẩu của tôi | **Avatar → Hồ sơ → Đổi mật khẩu** | Part 12 |

---

## 5. Các phím tắt và mẹo dùng nhanh

| Thao tác | Cách làm |
|----------|----------|
| Quay lại màn trước | Dùng nút **Back** của trình duyệt hoặc nút mũi tên ở góc trên-trái của màn hình nội dung |
| Đóng cửa sổ (popup / modal) | Phím **Esc** hoặc bấm dấu **×** ở góc trên-phải của popup |
| Mở nhanh màn Tổng quan | Bấm biểu tượng **Tổng quan** ở đầu thanh bên trái |
| Tìm nhanh thành viên / đơn hàng | Dùng ô tìm kiếm trên thanh trên cùng |
| Thu gọn/mở rộng thanh bên trái | Bấm nút `«` / `»` ở đầu sidebar |
| Làm mới dữ liệu mà không mất đăng nhập | **F5** hoặc **Ctrl + R** |

---

## 6. Đăng xuất

Khi kết thúc ca làm việc, bạn nên đăng xuất để bảo vệ dữ liệu:

1. Bấm vào **avatar** (hoặc tên bạn) ở góc trên-phải.
2. Trong menu thả xuống, bấm **Đăng xuất**.
3. Hệ thống sẽ đưa bạn về trang đăng nhập.

> **Quan trọng:** Trên các máy tính dùng chung (máy tại quầy lễ tân), hãy đăng xuất sau mỗi ca làm việc. Đừng chỉ đóng trình duyệt — người khác mở lại trình duyệt có thể vào nguyên phiên làm việc của bạn nếu có tick "Ghi nhớ".

---

## 7. Tiếp theo cần đọc gì?

Bạn đã sẵn sàng bắt đầu công việc hằng ngày:

- **Part 02 — Lễ tân**: chính là nơi bạn sẽ dành thời gian nhiều nhất trong ngày. Từ mở ca, bán hàng, check-in khách, cho đến đóng ca cuối ngày.
- **Part 03 — Thành viên**: cách quản lý danh sách khách hàng hội viên, xem lịch sử sử dụng dịch vụ.
- **Part 12 — Cài đặt nâng cao**: chỉ đọc nếu bạn là người quản trị, cần cấp tài khoản / đổi phân quyền cho nhân viên.

---

*Hết Part 01.*
