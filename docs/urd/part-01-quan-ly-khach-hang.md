# Part 01 — Quản lý Khách hàng & Liên hệ

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-16 | **Nhánh:** reborn-tech

---

## UR-CUS-01: Quản lý khách hàng doanh nghiệp

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-CUS-01 |
| **Tên** | Quản lý khách hàng doanh nghiệp |
| **Actor** | Sales, Sales Manager |
| **Mô tả** | Hệ thống cho phép tạo, xem, sửa, xóa hồ sơ khách hàng doanh nghiệp (B2B). Mỗi khách hàng bao gồm: tên công ty, mã số thuế, ngành nghề (industry), quy mô nhân sự, doanh thu ước tính, địa chỉ, website, nguồn khách hàng (source), và trạng thái (Lead / Prospect / Customer / Churned). Hỗ trợ phân loại theo ngành CNTT: phần mềm, phần cứng, dịch vụ cloud, bảo mật, tích hợp hệ thống, outsourcing, v.v. |
| **Tiền điều kiện** | Người dùng đã đăng nhập và có quyền truy cập module Khách hàng. |
| **Đầu vào** | Tên công ty (*), mã số thuế, ngành nghề (*), quy mô nhân sự, doanh thu ước tính (VND), địa chỉ, số điện thoại, email, website, nguồn khách hàng, nhân viên phụ trách (*), ghi chú. |
| **Đầu ra** | Hồ sơ khách hàng được lưu thành công, hiển thị trong danh sách. Tự động gán mã khách hàng (CUS-YYYYMMDD-###). |
| **Tiêu chí chấp nhận** | 1. Tạo mới khách hàng với đầy đủ trường bắt buộc (*) thành công. 2. Validate mã số thuế (10 hoặc 13 số). 3. Không cho phép trùng mã số thuế. 4. Danh sách khách hàng hỗ trợ tìm kiếm, lọc theo ngành/trạng thái/nguồn/nhân viên phụ trách. 5. Xem chi tiết khách hàng hiển thị đầy đủ thông tin và các tab liên quan (liên hệ, cơ hội, hợp đồng, ticket). 6. Sửa/xóa khách hàng hoạt động đúng (xóa mềm). |
| **Ưu tiên** | **M** |

---

## UR-CUS-02: Quản lý người liên hệ

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-CUS-02 |
| **Tên** | Quản lý người liên hệ (Contact) |
| **Actor** | Sales, Sales Manager |
| **Mô tả** | Quản lý danh sách người liên hệ thuộc mỗi khách hàng doanh nghiệp. Mỗi liên hệ gồm: họ tên, chức vụ, phòng ban, email, số điện thoại, vai trò trong quyết định mua hàng (Decision Maker / Influencer / User / Gatekeeper), và cờ đánh dấu "Người quyết định chính" (Primary Decision Maker). Một khách hàng có thể có nhiều liên hệ. |
| **Tiền điều kiện** | Khách hàng doanh nghiệp đã tồn tại trong hệ thống. |
| **Đầu vào** | Khách hàng liên kết (*), họ tên (*), chức vụ, phòng ban, email (*), số điện thoại, vai trò quyết định (*), cờ Decision Maker (boolean), ghi chú. |
| **Đầu ra** | Liên hệ được lưu và hiển thị trong tab "Liên hệ" của khách hàng. |
| **Tiêu chí chấp nhận** | 1. Tạo liên hệ gắn với khách hàng thành công. 2. Mỗi khách hàng có tối đa 1 Primary Decision Maker (cảnh báo nếu đã có). 3. Validate email đúng format. 4. Liên hệ hiển thị trong danh sách chung và trong chi tiết khách hàng. 5. Hỗ trợ tìm kiếm liên hệ theo tên, email, chức vụ, vai trò. 6. Xóa liên hệ không ảnh hưởng đến khách hàng cha. |
| **Ưu tiên** | **M** |

---

## UR-CUS-03: Quản lý đối tác

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-CUS-03 |
| **Tên** | Quản lý đối tác (Partner) |
| **Actor** | Sales Manager, Admin |
| **Mô tả** | Quản lý danh sách đối tác kinh doanh (reseller, referral partner, technology partner, implementation partner). Mỗi đối tác gồm: tên công ty, loại đối tác, mức hoa hồng (%), hợp đồng đối tác, trạng thái (Active / Inactive / Pending), và lịch sử giới thiệu khách hàng (referral). Theo dõi doanh thu phát sinh qua từng đối tác. |
| **Tiền điều kiện** | Người dùng có quyền quản lý đối tác. |
| **Đầu vào** | Tên đối tác (*), loại đối tác (*), mức hoa hồng (%), email, SĐT, địa chỉ, ghi chú, file hợp đồng đối tác (đính kèm). |
| **Đầu ra** | Hồ sơ đối tác được lưu. Dashboard đối tác hiển thị tổng referral và hoa hồng. |
| **Tiêu chí chấp nhận** | 1. CRUD đối tác hoạt động đúng. 2. Gán đối tác referral khi tạo cơ hội bán hàng. 3. Tính hoa hồng tự động dựa trên giá trị hợp đồng x tỷ lệ %. 4. Báo cáo doanh thu theo đối tác. 5. Lọc đối tác theo loại, trạng thái. |
| **Ưu tiên** | **S** |

---

## UR-CUS-04: Phân khúc khách hàng

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-CUS-04 |
| **Tên** | Phân khúc khách hàng (Segmentation) |
| **Actor** | Sales Manager, Marketing |
| **Mô tả** | Hỗ trợ phân khúc khách hàng theo nhiều tiêu chí: ngành nghề, quy mô, doanh thu, vùng miền, nguồn, trạng thái. Cho phép gắn tag tùy chỉnh và chấm điểm khách hàng (Customer Scoring) dựa trên: số deal thắng, tổng doanh thu, tần suất tương tác, thời gian là khách hàng. Hệ thống tự động phân hạng: VIP / Gold / Silver / Standard. |
| **Tiền điều kiện** | Có dữ liệu khách hàng trong hệ thống. |
| **Đầu vào** | Tiêu chí phân khúc (bộ lọc kết hợp), tag tuỳ chỉnh, quy tắc scoring (cấu hình bởi Admin). |
| **Đầu ra** | Danh sách khách hàng theo phân khúc. Điểm scoring và hạng tự động cập nhật. |
| **Tiêu chí chấp nhận** | 1. Tạo phân khúc với bộ lọc kết hợp (AND/OR). 2. Gắn/gỡ tag cho khách hàng (bulk action). 3. Scoring tự động tính khi có thay đổi dữ liệu liên quan. 4. Xem danh sách khách hàng theo hạng (VIP/Gold/Silver/Standard). 5. Xuất danh sách phân khúc ra Excel. |
| **Ưu tiên** | **C** |

---

## UR-CUS-05: Lịch sử tương tác

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-CUS-05 |
| **Tên** | Lịch sử tương tác (Interaction Timeline) |
| **Actor** | Sales, Sales Manager, Support |
| **Mô tả** | Ghi nhận và hiển thị toàn bộ lịch sử tương tác với khách hàng theo dạng timeline. Các loại tương tác: cuộc gọi (call log), email gửi/nhận, cuộc họp (meeting), ghi chú nội bộ (note), demo/presentation, và các hoạt động tự động (gửi chiến dịch marketing, thay đổi trạng thái). Mỗi tương tác ghi nhận: thời gian, loại, người thực hiện, nội dung tóm tắt, file đính kèm (nếu có). |
| **Tiền điều kiện** | Khách hàng đã tồn tại trong hệ thống. |
| **Đầu vào** | Loại tương tác (*), ngày giờ (*), nội dung (*), file đính kèm, liên hệ liên quan, cơ hội liên quan. |
| **Đầu ra** | Tương tác được ghi và hiển thị trên timeline của khách hàng. Hoạt động tự động được log mà không cần nhập thủ công. |
| **Tiêu chí chấp nhận** | 1. Thêm tương tác thủ công (call, meeting, note) thành công. 2. Timeline hiển thị đúng thứ tự thời gian (mới nhất trước). 3. Lọc timeline theo loại tương tác. 4. Hoạt động hệ thống (gửi email chiến dịch, chuyển trạng thái) tự động ghi log. 5. Hỗ trợ đính kèm file (tối đa 10MB/file). 6. Tìm kiếm trong nội dung tương tác. |
| **Ưu tiên** | **M** |
