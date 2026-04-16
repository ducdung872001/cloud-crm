# TESTCASE — CommunityHub Events Module

Route: `/community-hub/events` · API prefix: `/marketing/events`
Branch: `community-hub`
Created: 2026-04-16

---

## Suite 1: TC-EVENT — Event Management (CRUD + Publish)

### TC-EVENT-001: Mở danh sách sự kiện

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Truy cập menu "Community Hub" > "Sự kiện" | URL = `/community-hub/events`, API GET `/marketing/events` trả code 0, bảng render danh sách event | pending |
| 2 | Kiểm tra bảng hiển thị các cột chính | Cột "Tên sự kiện", "Ngày bắt đầu", "Địa điểm", "Trạng thái", "Đăng ký" hiển thị đầy đủ | pending |

### TC-EVENT-002: Tạo sự kiện mới (happy path)

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Click "Thêm mới" | Form tạo sự kiện mở ra với các tab/section: Thông tin chung, Địa điểm, Liên hệ, Cấu hình | pending |
| 2 | Điền title, description, start/end date, registration open/close date | Các trường nhận giá trị, date picker hoạt động đúng | pending |
| 3 | Điền venue name, address, city | Venue section hiển thị đúng khi chọn offline | pending |
| 4 | Điền contact name, phone, email, role | Contact section nhận giá trị | pending |
| 5 | Upload cover image | Preview hình hiển thị, file upload thành công | pending |
| 6 | Nhập ticket price, category, tags | Giá vé format VND, category dropdown, tags là multi-select/chips | pending |
| 7 | Click "Lưu" | API POST `/marketing/events` code 0, toast thành công, redirect về danh sách, event mới xuất hiện đầu list | pending |
| 8 | Mở lại event vừa tạo (edit view) | Tất cả field round-trip đúng: title, description, dates, venue, contact, cover image, price, category, tags | pending |

### TC-EVENT-003: Validate trường bắt buộc

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Click "Thêm mới" > bỏ trống tất cả > Click "Lưu" | Error inline cho title, start date, end date, contact name, contact phone. Không gọi API POST | pending |
| 2 | Nhập end date < start date | Error "Ngày kết thúc phải sau ngày bắt đầu" | pending |
| 3 | Nhập registration close date < registration open date | Error "Ngày đóng đăng ký phải sau ngày mở đăng ký" | pending |
| 4 | Chọn venue offline nhưng bỏ trống venue name + address | Error inline cho venue name, venue address | pending |
| 5 | Chọn venue online nhưng bỏ trống online URL | Error inline cho online URL | pending |
| 6 | Nhập phone contact không hợp lệ "abc" | Error "Số điện thoại không hợp lệ" | pending |

### TC-EVENT-004: Sửa sự kiện

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Mở event đã tạo > đổi title, description, venue, contact phone | Các field nhận giá trị mới | pending |
| 2 | Click "Lưu" | API PATCH `/marketing/events/:id` code 0, toast thành công | pending |
| 3 | Quay lại danh sách + mở lại event | List hiển thị title mới, edit view hiển thị đúng tất cả field đã sửa (round-trip) | pending |

### TC-EVENT-005: Xoá sự kiện

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Tạo event draft, không có registration > click Xoá > Xác nhận | API DELETE code 0, event biến mất khỏi danh sách | pending |
| 2 | Thử xoá event đã có registrations | API trả lỗi, UI hiển thị "Không thể xoá sự kiện đã có người đăng ký. Hãy huỷ sự kiện thay vì xoá" | pending |

### TC-EVENT-006: Publish / Unpublish sự kiện

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Mở event draft > click "Xuất bản" | API POST `/marketing/events/:id/publish` code 0, status chuyển sang "published", published_at ghi nhận | pending |
| 2 | Kiểm tra event published xuất hiện trên public share page | GET `/marketing/events/public/:slug` trả 200 với đầy đủ thông tin | pending |
| 3 | Click "Huỷ xuất bản" trên event chưa có registration | Status chuyển về "draft", public page trả 404 | pending |
| 4 | Click "Huỷ xuất bản" trên event đã có registration | Warning confirm hiển thị, nếu xác nhận thì unpublish thành công | pending |

### TC-EVENT-007: Gallery images upload

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Trong form event, mở section Gallery > upload 3 ảnh | Preview hiển thị 3 thumbnail, upload thành công | pending |
| 2 | Kéo thả đổi thứ tự ảnh > Lưu | Thứ tự ảnh lưu đúng, mở lại event thấy đúng thứ tự | pending |
| 3 | Xoá 1 ảnh khỏi gallery > Lưu | Ảnh bị xoá, chỉ còn 2 ảnh khi mở lại | pending |

### TC-EVENT-008: Multi-day dates config

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Bật chế độ "Nhiều ngày" > thêm 3 ngày với giờ bắt đầu/kết thúc khác nhau | UI hiển thị danh sách 3 ngày, mỗi ngày có thời gian riêng | pending |
| 2 | Xoá 1 ngày > Lưu | Còn 2 ngày, API lưu đúng, mở lại hiển thị đúng | pending |

---

## Suite 2: TC-EVENTREG — Event Registration (Dynamic Fields, Add-ons, Payment)

### TC-EVENTREG-001: Dynamic fields builder (admin)

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Mở event > tab "Biểu mẫu đăng ký" > click "Thêm trường" | Popup/dropdown chọn loại field: text, select, checkbox, date, number, textarea | pending |
| 2 | Thêm trường text "Nghề nghiệp" (required) | Field xuất hiện trong danh sách, label + type + required hiển thị đúng | pending |
| 3 | Thêm trường select "Kinh nghiệm" với options: <1 năm, 1-3 năm, >3 năm | Field select xuất hiện, 3 options hiển thị đúng | pending |
| 4 | Thêm trường checkbox "Đã từng tham gia event trước" | Field checkbox xuất hiện | pending |
| 5 | Thêm trường date "Ngày sinh" | Field date xuất hiện | pending |
| 6 | Kéo thả đổi thứ tự field > Lưu | Thứ tự lưu đúng, mở lại event hiển thị đúng thứ tự | pending |
| 7 | Xoá 1 field > Lưu | Field bị xoá, mở lại không còn field đó | pending |
| 8 | Kiểm tra public share page | Form đăng ký hiển thị đúng các dynamic field theo thứ tự admin cấu hình | pending |

### TC-EVENTREG-002: Add-on items (manual entry)

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Mở event > tab "Dịch vụ bổ sung" > click "Thêm add-on" | Form nhập: tên, giá, mô tả | pending |
| 2 | Thêm add-on "Áo thun sự kiện" giá 150,000 VND | Add-on xuất hiện trong danh sách | pending |
| 3 | Thêm add-on "Bữa trưa" giá 80,000 VND | Add-on thứ 2 xuất hiện | pending |
| 4 | Sửa giá add-on "Áo thun" thành 120,000 VND > Lưu | Giá cập nhật, mở lại event giá đúng 120,000 | pending |
| 5 | Xoá add-on "Bữa trưa" > Lưu | Add-on bị xoá, chỉ còn "Áo thun" | pending |
| 6 | Kiểm tra public share page hiển thị add-on | Form đăng ký có section chọn add-on với checkbox + giá | pending |

### TC-EVENTREG-003: Add-on items (service catalog picker)

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Click "Chọn từ danh mục dịch vụ" | Modal/dropdown hiển thị danh sách dịch vụ từ catalog (theo ngành) | pending |
| 2 | Chọn 2 dịch vụ từ catalog > Xác nhận | 2 dịch vụ được thêm vào danh sách add-on với tên + giá từ catalog | pending |
| 3 | Sửa giá override cho 1 dịch vụ catalog | Giá override hiển thị, giá gốc strikethrough hoặc ghi chú | pending |
| 4 | Lưu event > mở lại | Add-on từ catalog hiển thị đúng với giá đã override | pending |

### TC-EVENTREG-004: Public registration form (happy path)

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Truy cập link share event `/share_event?slug=xxx` | Trang public hiển thị: hero banner, thông tin event, form đăng ký | pending |
| 2 | Điền họ tên, SĐT, email | Các trường standard nhận giá trị | pending |
| 3 | Điền dynamic fields (nghề nghiệp, kinh nghiệm, checkbox, ngày sinh) | Dynamic fields render đúng type, nhận giá trị | pending |
| 4 | Chọn add-on "Áo thun sự kiện" | Tổng tiền tự động tính = ticket price + add-on price, hiển thị live | pending |
| 5 | Upload ảnh chuyển khoản (nếu require_payment_proof bật) | File upload thành công, preview hiển thị | pending |
| 6 | Click "Đăng ký" | API POST register code 201, thông báo "Đăng ký thành công, BTC sẽ liên hệ xác nhận" | pending |
| 7 | Đăng ký lại cùng SĐT cho cùng event | API trả 409, UI hiển thị "Bạn đã đăng ký sự kiện này rồi" | pending |

### TC-EVENTREG-005: Public registration validation

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Bỏ trống họ tên + SĐT > Submit | Error inline cho họ tên, SĐT. Không gọi API | pending |
| 2 | Nhập SĐT "abc123" | Error "Số điện thoại không hợp lệ" | pending |
| 3 | Bỏ trống dynamic field required "Nghề nghiệp" > Submit | Error inline cho field "Nghề nghiệp" | pending |
| 4 | Event đã hết chỗ (maxAttendees reached) | Form disabled hoặc thông báo "Sự kiện đã hết chỗ" | pending |
| 5 | Event đã đóng đăng ký (past registration_close_date) | Form disabled, thông báo "Đã hết hạn đăng ký" | pending |
| 6 | Event chưa mở đăng ký (before registration_open_date) | Form disabled, thông báo "Chưa mở đăng ký" + ngày mở | pending |

### TC-EVENTREG-006: Payment proof config

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Admin bật toggle "Yêu cầu ảnh chuyển khoản" trong event config | Toggle lưu thành công | pending |
| 2 | Truy cập public form > form hiển thị upload "Ảnh chuyển khoản" (required) | Upload field xuất hiện với label required | pending |
| 3 | Submit form không upload ảnh | Error "Vui lòng upload ảnh chuyển khoản" | pending |
| 4 | Admin tắt toggle > kiểm tra public form | Upload field không hiển thị | pending |

### TC-EVENTREG-007: Admin registrants table

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Mở event > tab "Người đăng ký" | Bảng hiển thị danh sách registrants: họ tên, SĐT, email, trạng thái, ngày ĐK, add-on, tổng tiền | pending |
| 2 | Filter theo trạng thái "pending" | Chỉ hiển thị registrant pending, API gửi `status=pending` | pending |
| 3 | Tìm kiếm theo tên/SĐT | Kết quả lọc đúng, API gửi `q=...` | pending |
| 4 | Click "Duyệt" (approve payment) cho 1 registrant | Trạng thái chuyển từ pending > confirmed, toast thành công | pending |
| 5 | Click "Phát hành vé" cho registrant confirmed | API POST issue-ticket, ticket code sinh ra, hiển thị trên bảng | pending |
| 6 | Click "Chuyển thành hội viên" cho registrant | API POST convert-to-member, hiển thị customer_id link, badge "Đã chuyển đổi" | pending |
| 7 | Kiểm tra registrant đã convert > click link customer | Redirect sang trang chi tiết Customer đúng ID | pending |
| 8 | Đổi trạng thái sang "cancelled" | Status update, toast thành công, stats cập nhật | pending |

### TC-EVENTREG-008: Total calculation on public form

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Event có ticket price 200,000 + 2 add-on (100K, 50K) | Tổng ban đầu hiển thị 200,000 (chỉ vé) | pending |
| 2 | Chọn add-on 1 (100K) | Tổng cập nhật live = 300,000 | pending |
| 3 | Chọn thêm add-on 2 (50K) | Tổng cập nhật live = 350,000 | pending |
| 4 | Bỏ chọn add-on 1 | Tổng cập nhật live = 250,000 | pending |
| 5 | Event miễn phí + add-on 100K | Tổng hiển thị = 100,000 | pending |
| 6 | Event miễn phí + không chọn add-on | Tổng hiển thị "Miễn phí" hoặc 0 | pending |

---

## Suite 3: TC-EVENTCHECKIN — Event Check-in & Service Tracking

### TC-EVENTCHECKIN-001: Check-in board overview

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Mở event > tab "Check-in" | Board hiển thị: ô tìm kiếm, filter ngày, danh sách registrant, live count (checked in / total) | pending |
| 2 | Live count hiển thị đúng | Ví dụ: "5 / 20 đã check-in" khớp với dữ liệu thực | pending |

### TC-EVENTCHECKIN-002: Check-in registrant

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Tìm registrant theo tên hoặc SĐT | Kết quả gợi ý/filter đúng, chỉ hiển thị registrant của event hiện tại | pending |
| 2 | Click "Check-in" cho registrant confirmed | Trạng thái chuyển sang "checked_in", checked_in_at ghi nhận, live count +1 | pending |
| 3 | Thử check-in registrant đã checked_in | Thông báo "Đã check-in rồi" hoặc button disabled | pending |
| 4 | Thử check-in registrant pending (chưa confirmed) | Cảnh báo hoặc chặn, yêu cầu confirm trước | pending |
| 5 | Thử check-in registrant cancelled | Chặn, thông báo "Đăng ký đã bị huỷ" | pending |

### TC-EVENTCHECKIN-003: Check-out registrant

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Click "Check-out" cho registrant đã checked_in | Ghi nhận thời gian check-out, hiển thị thời lượng tham gia | pending |
| 2 | Live count cập nhật sau check-out | Count giảm 1 (hoặc hiển thị riêng: checked-in vs checked-out) | pending |

### TC-EVENTCHECKIN-004: Date filter trên check-in board

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Event multi-day > chọn filter ngày 1 | Chỉ hiển thị registrant check-in ngày 1 | pending |
| 2 | Chọn filter ngày 2 | Danh sách cập nhật đúng cho ngày 2 | pending |
| 3 | Chọn "Tất cả ngày" | Hiển thị tổng hợp tất cả ngày | pending |

### TC-EVENTCHECKIN-005: Service usage tracker

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Mở event > tab "Sử dụng dịch vụ" hoặc section trong check-in board | Giao diện chọn registrant + danh sách dịch vụ đã dùng | pending |
| 2 | Chọn 1 registrant (đã checked_in) | Hiển thị danh sách dịch vụ đã sử dụng (ban đầu trống) + tổng tiền | pending |
| 3 | Click "Thêm dịch vụ" > chọn từ danh mục > xác nhận | Dịch vụ xuất hiện trong danh sách, running total cập nhật | pending |
| 4 | Thêm dịch vụ thứ 2 | Running total = tổng giá 2 dịch vụ | pending |
| 5 | Xoá 1 dịch vụ khỏi danh sách | Running total giảm, dịch vụ biến mất | pending |
| 6 | Chọn registrant chưa check-in | Thông báo "Chưa check-in, không thể ghi nhận dịch vụ" hoặc disable | pending |

### TC-EVENTCHECKIN-006: Share tab

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Mở event published > tab "Chia sẻ" | Hiển thị link public share, nút copy, nút chia sẻ mạng xã hội | pending |
| 2 | Click "Copy link" | Link copy vào clipboard, toast "Đã sao chép" | pending |
| 3 | Click nút Facebook share | Mở popup share Facebook với đúng URL event | pending |
| 4 | Click nút Zalo share | Mở popup share Zalo với đúng URL event | pending |
| 5 | Event draft > tab "Chia sẻ" | Thông báo "Cần xuất bản sự kiện trước khi chia sẻ" hoặc disable link | pending |
| 6 | Mở link share trên trình duyệt ẩn danh (chưa đăng nhập) | Trang public load đúng, không cần auth, hiển thị đầy đủ thông tin + form đăng ký | pending |

---

## Cross-flow

- `TC-E2E-EVENT-REGISTRATION`: Tạo event > publish > public register > admin confirm > issue ticket > check-in > ghi nhận dịch vụ > convert to member
- `TC-E2E-EVENT-PAYMENT`: Tạo event paid > public register > upload payment proof > admin approve > issue ticket > Sales order created

**Script**: `node tests/test-event-crud.mjs`
