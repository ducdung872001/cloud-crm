# Part 03 — Thành viên

*Phiên bản: Cửa hàng & Spa — Tenant "Viettel Store"*

Phân hệ **Thành viên** là nơi bạn quản lý "trái tim" của hệ thống — **danh sách khách hàng hội viên** và **cấu hình các danh mục liên quan** (thẻ, nhóm, nguồn, nghề nghiệp, mối quan hệ, trường tùy chỉnh, cấu trúc hiển thị).

Sidebar có **2 mục con**:

| Mục | URL | Nội dung |
|-----|-----|----------|
| **Thành viên** | `/crm/customer_list` | Danh sách toàn bộ khách hàng, thêm/sửa/xóa, import/export, lọc nâng cao, xem chi tiết |
| **Cài đặt thành viên** | `/crm/setting_customer` | 7 tab cấu hình: thẻ, nguồn, nhóm, nghề nghiệp, mối quan hệ, trường bổ sung, cấu trúc xem |

> **Khác biệt so với Part 02:** Ở Part 02 (Lễ tân) bạn đã biết cách **thêm nhanh** một khách ngay khi bán hàng. Ở Part 03, chúng ta đi sâu hơn — quản lý hồ sơ khách đầy đủ, xem lịch sử giao dịch, áp dụng chính sách, cấu hình trường dữ liệu tùy theo đặc thù cửa hàng của bạn.

---

## Mục lục

- [A. Danh sách thành viên](#a-danh-sách-thành-viên)
  - [A.1. Tổng quan giao diện](#a1-tổng-quan-giao-diện)
  - [A.2. Tìm kiếm nhanh](#a2-tìm-kiếm-nhanh)
  - [A.3. Lọc nâng cao](#a3-lọc-nâng-cao)
  - [A.4. Thêm thành viên mới](#a4-thêm-thành-viên-mới)
  - [A.5. Xem & chỉnh sửa chi tiết](#a5-xem--chỉnh-sửa-chi-tiết)
  - [A.6. Nhập danh sách (Import)](#a6-nhập-danh-sách-import)
  - [A.7. Xuất danh sách (Export)](#a7-xuất-danh-sách-export)
- [B. Cài đặt thành viên](#b-cài-đặt-thành-viên)
  - [B.1. Danh sách thẻ thành viên](#b1-danh-sách-thẻ-thành-viên)
  - [B.2. Danh sách nguồn thành viên](#b2-danh-sách-nguồn-thành-viên)
  - [B.3. Danh sách nhóm thành viên](#b3-danh-sách-nhóm-thành-viên)
  - [B.4. Danh sách ngành nghề](#b4-danh-sách-ngành-nghề)
  - [B.5. Danh sách mối quan hệ](#b5-danh-sách-mối-quan-hệ)
  - [B.6. Định nghĩa trường thông tin bổ sung](#b6-định-nghĩa-trường-thông-tin-bổ-sung)
  - [B.7. Định nghĩa cấu trúc xem thông tin](#b7-định-nghĩa-cấu-trúc-xem-thông-tin)
- [C. Luồng công việc thường gặp](#c-luồng-công-việc-thường-gặp)

---

## A. Danh sách thành viên

**Đường dẫn:** Sidebar → **Thành viên** → **Thành viên**
**URL:** `/crm/customer_list`

### A.1. Tổng quan giao diện

![Màn hình Quản lý thành viên](./images/part-03-thanh-vien/A01-list-main.png)

Màn hình chia 4 khu vực:

| Khu vực | Vị trí | Chức năng |
|---------|--------|-----------|
| **Thanh tiêu đề** | Trên cùng | "Quản lý thành viên" + 3 nút: **Nhập danh sách**, **Xuất danh sách**, **Thêm nhanh** |
| **Thanh chỉ số** | Dưới tiêu đề | 4 thẻ: Thành viên mới / Tổng thành viên / Tổng doanh thu / Thành viên sắp hết hạn |
| **Thanh lọc** | Trên bảng | Ô tìm kiếm + filter: *Cả 4 danh sách còn hoạt động*, *Chọn nhóm*, các badge nhanh (*🏷️ Nhóm*, *⭐ VIP*, *🔴 Có nợ*, *📅 Mới*) |
| **Bảng danh sách** | Giữa – lớn | Danh sách khách với 7 cột: #, Họ và tên, Mã/Nhóm, Nhóm/Khác, Công nợ, Điểm tích lũy, Đơn hàng |
| **Thanh phân trang** | Dưới cùng | Số dòng / trang + điều hướng |

![Thanh tiêu đề & lọc (chi tiết)](./images/part-03-thanh-vien/A03-list-header.png)

### A.2. Tìm kiếm nhanh

**Các bước:**

1. Nhấp vào ô tìm kiếm trên cùng (placeholder *"Tên, SĐT, mã thành viên..."*).
2. Gõ từ khóa. Hệ thống lọc theo **thời gian thực** — sau 300ms không gõ thêm, danh sách tự cập nhật.
3. Kết quả sẽ match với:
   - Họ và tên
   - Số điện thoại (hoặc số đã che — vd `090xxx***`)
   - Mã thành viên
   - Email (tùy cấu hình)

**Mẹo:**
- Gõ `091` để lọc theo nhà mạng.
- Gõ `@gmail.com` để lọc theo domain email.
- Dấu cách giữa các từ: tất cả các từ phải khớp.

### A.3. Lọc nâng cao

Ngoài ô tìm, bạn có các bộ lọc khác:

- **Dropdown trạng thái** (*Cả 4 danh sách còn hoạt động*) — lọc theo trạng thái hội viên: Mới / Đang hoạt động / Hết hạn / Đã hủy.
- **Dropdown nhóm** (*Chọn nhóm*) — lọc theo nhóm thành viên (xem [B.3](#b3-danh-sách-nhóm-thành-viên)).
- **Badge nhanh**:
  - 🏷️ **Nhóm** — mở bộ chọn nhóm nhiều lựa chọn.
  - ⭐ **VIP** — chỉ hiện khách có tag VIP.
  - 🔴 **Có nợ** — chỉ hiện khách đang nợ tiền.
  - 📅 **Mới** — chỉ hiện khách tạo trong N ngày gần đây (N do quản lý cài).
- **Biểu tượng phễu 🔽** (*Lọc nâng cao* — chỉ có ở một số tenant) — mở modal lọc đa điều kiện:
  - Nguồn thành viên (nhiều lựa chọn)
  - Người phụ trách (nhiều lựa chọn)
  - Trạng thái cuộc gọi
  - Các trường thông tin bổ sung (do bạn cấu hình ở [B.6](#b6-định-nghĩa-trường-thông-tin-bổ-sung))

Bộ lọc đã áp dụng sẽ hiện thành các **chip** ở trên bảng, có dấu **×** để bỏ nhanh từng điều kiện.

### A.4. Thêm thành viên mới

**Các bước:**

1. Trên thanh tiêu đề, bấm nút **Thêm nhanh** (màu xanh).
2. Một **slide panel** trượt từ phải với tiêu đề *"Thêm nhanh thành viên"*.

   ![Slide panel Thêm nhanh — trống](./images/part-03-thanh-vien/A10-add-modal-empty.png)

3. Ở đầu panel có hai tab:
   - **Cá nhân** (mặc định).
   - **Doanh nghiệp** — khi chọn, các trường sẽ đổi (Họ và tên → Tên công ty, không còn Giới tính, v.v.).

4. Điền các trường:

   ![Slide panel đã điền dữ liệu mẫu](./images/part-03-thanh-vien/A11-add-modal-filled.png)

#### Quy định nhập liệu — Thêm nhanh thành viên (Cá nhân)

| Trường | Bắt buộc | Kiểu | Ràng buộc / Định dạng | Ghi chú |
|--------|:--------:|------|------------------------|---------|
| **Họ và tên** | ✓ | Text | Không trống; tự loại khoảng trắng đầu/cuối | Ví dụ: *"Nguyễn Văn An"* |
| **Số điện thoại** | ✓ | Tel | Phải khớp 1 trong 4 định dạng: `0xxxxxxxxx` (10 số), `xxx-xxx-xxxx`, `(xxx) xxx-xxxx`, hoặc `+84xxxxxxxxx` | Sai format → báo đỏ *"Số điện thoại không đúng định dạng"* |
| **Email** | — | Email | Nếu có nhập, phải đúng format `name@domain.tld` | Sai format → *"Email không đúng định dạng"* |
| **Giới tính** | ✓ (ở form đầy đủ) / — (ở thêm nhanh) | Radio | Nam / Nữ / Khác | Mặc định: không chọn |
| **Ghi chú** | — | Textarea | Không giới hạn độ dài nghiêm ngặt; khuyến nghị < 500 ký tự | |

**Lỗi thường gặp (toast đỏ):**

- *"Vui lòng nhập tên thành viên"* — bỏ trống ô **Họ và tên**.
- *"Vui lòng nhập số điện thoại"* — bỏ trống ô **Số điện thoại**.
- *"Số điện thoại không đúng định dạng"* — sai regex PHONE_REGEX.
- *"Email không đúng định dạng"* — sai regex EMAIL_REGEX.
- *"Số điện thoại đã tồn tại"* — trùng với khách khác trong cùng cơ sở.

#### Quy định nhập liệu — Thêm nhanh (Doanh nghiệp)

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Tên công ty** | ✓ | Thay cho "Họ và tên" |
| **Số điện thoại** | ✓ | Có thể là SĐT người đại diện |
| **Email** | — | Email liên hệ |
| **Ghi chú** | — | |

> **Không hiện Giới tính** khi chọn Doanh nghiệp.

5. Bấm nút ở cuối panel:
   - **Hủy** — đóng, không lưu.
   - **Nhập đầy đủ →** — đóng panel và chuyển sang trang **Chi tiết thành viên** đầy đủ với 80+ trường (xem [A.5](#a5-xem--chỉnh-sửa-chi-tiết)).
   - **Tạo nhanh** — lưu ngay, đóng panel, khách xuất hiện ở đầu danh sách.

### A.5. Xem & chỉnh sửa chi tiết

**Khi nào:** Cần xem đầy đủ thông tin một khách, bao gồm lịch sử mua hàng, lịch sử check-in, điểm tích lũy, công nợ, ghi chú chăm sóc…

**Các bước:**

1. Trong danh sách, bấm vào **Họ và tên** (hoặc icon **Xem** / **Chỉnh sửa** ở cuối dòng).
2. Trình duyệt điều hướng sang trang **Chi tiết thành viên** (`/crm/detail_person/customerId/<id>/purchase_invoice`).

   ![Trang Chi tiết thành viên (vào với id mới)](./images/part-03-thanh-vien/A20-detail-new.png)

3. Thanh tiêu đề của trang có:
   - **Breadcrumb**: *Danh sách thành viên › Chi tiết thành viên*.
   - **5 nút hành động nhanh** (góc phải):
     - 📅 **Đặt lịch hẹn** — tạo booking cho khách này.
     - ✅ **Tạo công việc** — giao công việc chăm sóc.
     - 📞 **Call** — gọi qua tổng đài ảo (nếu đã tích hợp Viettel/VoIP).
     - ✉️ **Email** — soạn email gửi khách.
     - 💬 **SMS** — gửi SMS (nếu đã tích hợp).

4. Trang chia thành nhiều **tab nội dung** (phụ thuộc cấu hình, thường có):
   - **Hóa đơn mua** — danh sách đơn khách đã mua.
   - **Thẻ dịch vụ** — các thẻ/gói đang có hiệu lực.
   - **Lịch hẹn** — các booking tương lai.
   - **Công việc chăm sóc** — task đã/đang làm cho khách.
   - **Lịch sử giao tiếp** — call log, email, SMS, chat.
   - **Ghi chú** — note riêng về khách.

5. **Cột trái** (thường là 30% chiều ngang) là **Thông tin thành viên** — gồm:

#### Các trường ở hồ sơ chi tiết thành viên

| Nhóm | Trường | Bắt buộc | Kiểu | Ghi chú |
|------|--------|:--------:|------|---------|
| **Phân loại** | Khách hàng (Cá nhân/Doanh nghiệp) | ✓ | Radio | Không đổi được sau khi đã tạo |
| | Loại thành viên (Nội bộ/Ngoài) | — | Radio | |
| **Thông tin cơ bản** | Chi nhánh | ✓ | Select | Chỉ admin mới đổi được |
| | Tên thành viên | ✓ | Text | |
| | Mã thành viên | — | Text | Có thể tự sinh theo cấu hình mã |
| | Số điện thoại | ✓ | Text + regex | Có icon con mắt để ẩn/hiện (quyền xem chi tiết) |
| | Email | — | Text + regex | Cũng có icon ẩn/hiện |
| | Giới tính | ✓ | Radio | Nam/Nữ |
| | Ngày sinh | — | Date | Chọn từ lịch |
| | Địa chỉ | — | Text | Một dòng |
| | Chiều cao (cm) | — | Number | Dành cho spa/fitness |
| | Cân nặng (kg) | — | Number | Dành cho spa/fitness |
| **Thông tin bổ sung** | Điện thoại người giới thiệu | — | Text + regex | |
| | Nguồn thành viên | — | Select | Danh mục ở [B.2](#b2-danh-sách-nguồn-thành-viên) |
| | Nghề nghiệp | — | Multi-select | Danh mục ở [B.4](#b4-danh-sách-ngành-nghề) |
| | Nhóm thành viên | — | Select | Danh mục ở [B.3](#b3-danh-sách-nhóm-thành-viên) |
| | Người phụ trách | — | Select | Chọn từ danh sách nhân viên |
| | Tình trạng cuộc gọi đầu tiên | — | Text | Ghi chú telesale |
| | Thành viên liên quan | — | Multi-select | Gán các khách có liên quan (gia đình, công ty...) |
| **Trường tùy chỉnh** | *(thay đổi theo cấu hình)* | Tùy cấu hình | Tùy kiểu | Các trường bạn tự tạo ở [B.6](#b6-định-nghĩa-trường-thông-tin-bổ-sung) |

#### Quy tắc validation chi tiết

1. **Họ tên** — bắt buộc, trim space. Nếu trống báo *"Vui lòng nhập tên thành viên"*.
2. **Số điện thoại** — phải khớp pattern `PHONE_REGEX` (10 số VN, hoặc các biến thể có dấu cách/ngoặc, hoặc quốc tế `+84...`). Lỗi hiện ngay dưới ô input.
3. **Email** — không bắt buộc, nhưng nếu nhập phải khớp `EMAIL_REGEX` (RFC 5322 cơ bản).
4. **Điện thoại người giới thiệu** — cùng regex như số điện thoại chính.
5. **Giới tính** — bắt buộc chọn khi tạo mới.
6. **Trường tùy chỉnh bắt buộc** — nếu ở [B.6](#b6-định-nghĩa-trường-thông-tin-bổ-sung) bạn đã cài một trường là "Bắt buộc", khi tạo/sửa khách sẽ được kiểm tra. Nếu bỏ trống, báo *"Các trường thông tin bổ sung bắt buộc không được để trống"*.
7. **Trường text mở rộng** — có giới hạn độ dài phía backend (thường 459 ký tự với textarea tùy chỉnh).

6. **Hành động** ở cuối form:
   - **Hủy** — quay về danh sách. Nếu có thay đổi chưa lưu, hệ thống hỏi xác nhận *"Bạn có chắc muốn hủy các thay đổi?"*.
   - **Cập nhật** / **Tạo mới** — lưu vào hệ thống.

### A.6. Nhập danh sách (Import)

**Khi nào:** Bạn chuyển dữ liệu từ Excel cũ (sau khi chuyển hệ thống) sang CRM, hoặc nhập lô khách từ form đăng ký.

**Các bước:**

1. Trên thanh tiêu đề, bấm **Nhập danh sách**.
2. Modal **Nhập khách hàng** mở:
   - **Tải mẫu Excel** — file `.xlsx` mẫu với các cột yêu cầu.
   - **Chọn file** — upload file đã điền.
   - **Xem trước** — bảng hiển thị 10 dòng đầu để bạn kiểm tra mapping cột đúng chưa.
   - **Tùy chọn**:
     - ☐ **Bỏ qua dòng trùng** — dòng có SĐT trùng khách cũ thì không ghi đè.
     - ☐ **Ghi đè** — cho phép cập nhật khách đã tồn tại.
3. Bấm **Nhập**. Hệ thống chạy nền, hiển thị tiến độ `X/Y`. Kết thúc hiện báo cáo:
   - ✅ Thành công: n khách
   - ⚠️ Bỏ qua: n dòng (lý do: trùng SĐT / thiếu tên / sai SĐT)
   - ❌ Lỗi: n dòng (kèm dòng số và lý do)
4. Bấm **Tải kết quả** để tải file Excel chi tiết các dòng lỗi.

> **Lưu ý:** Các trường bắt buộc trong file Excel: **Họ tên**, **Số điện thoại**, **Giới tính**. Các trường khác là tùy chọn. Với trường dropdown (Nhóm, Nguồn, Nghề nghiệp), bạn điền **tên chính xác** — hệ thống tự match.

### A.7. Xuất danh sách (Export)

**Khi nào:** Cần báo cáo cho sếp, hoặc gửi danh sách cho đối tác marketing (sau khi che số nhạy cảm).

**Các bước:**

1. **Lọc** trước ở danh sách (nếu bạn chỉ muốn xuất một tập con) — xem [A.2](#a2-tìm-kiếm-nhanh) và [A.3](#a3-lọc-nâng-cao).
2. Bấm **Xuất danh sách** trên thanh tiêu đề.
3. Modal **Xuất khách hàng** hiện với các tùy chọn:
   - **Phạm vi**: Tất cả / Theo bộ lọc hiện tại / Đã chọn ở bảng.
   - **Cột xuất**: tick các cột muốn có trong file.
   - **Định dạng**: `.xlsx` (Excel) / `.csv`.
4. Bấm **Xuất**. Hệ thống tạo file và trigger tải về.
5. Toast *"Xuất file thành công"* khi xong.

---

## B. Cài đặt thành viên

**Đường dẫn:** Sidebar → **Thành viên** → **Cài đặt thành viên**
**URL:** `/crm/setting_customer`

![Màn hình Cài đặt thành viên](./images/part-03-thanh-vien/B01-setting-landing.png)

Màn hình là một **lưới 7 ô** (mỗi ô là một danh mục/tab). Bấm vào ô để vào màn hình quản lý của danh mục đó.

| Ô | Màu nền | Mô tả |
|---|---------|-------|
| 1. Danh sách thẻ thành viên | Tím nhạt | Các loại thẻ/hạng thành viên (Diamond, Gold, Silver...) |
| 2. Danh sách nguồn thành viên | Xanh lá | Kênh khách biết đến bạn (FB, Zalo, giới thiệu…) |
| 3. Danh sách nhóm thành viên | Vàng | Phân loại theo chính sách giá/ưu đãi |
| 4. Danh sách ngành nghề/nghề nghiệp | Xanh biển | Phân khúc theo nghề của khách |
| 5. Danh sách mối quan hệ | Cam | Loại quan hệ (người thân, đồng nghiệp…) |
| 6. Định nghĩa trường thông tin bổ sung | Xanh lá nhạt | **Quan trọng** — thêm trường tùy chỉnh cho form thành viên |
| 7. Định nghĩa cấu trúc xem thông tin | Hồng | Sắp xếp layout màn chi tiết thành viên |

### B.1. Danh sách thẻ thành viên

**Mục đích:** Định nghĩa **các hạng thẻ thành viên** của cửa hàng bạn.

![Danh sách thẻ thành viên](./images/part-03-thanh-vien/B10-card-thethanhvien.png)

**Các cột trong bảng:**

| Cột | Ghi chú |
|-----|---------|
| STT | Số thứ tự |
| Tên thẻ | Vd: *"Hạng khách hàng cường"*, *"Thành viên vip"* |
| Mã loại thẻ | Vd: *"Diamond"*, *"Gold"*, *"Silver"* |
| Ảnh thẻ | Ảnh đại diện thẻ |
| Tiêu chuẩn từ | Mốc tiền tối thiểu để lên hạng |
| Tiêu chuẩn đến | Mốc trần của hạng này |
| Mô tả | Ngắn gọn |

**Thao tác:**
- **Thêm thẻ** (nút góc trên phải) → modal form với các trường: Tên thẻ, Mã, Ảnh upload, Tiêu chuẩn từ/đến, Tỷ lệ tích điểm, Mô tả.
- **Sửa** (icon bút) → mở modal như thêm mới.
- **Xóa** (icon thùng rác) → xác nhận. Nếu thẻ đang có khách sử dụng, hệ thống từ chối xóa.

### B.2. Danh sách nguồn thành viên

**Mục đích:** Khi tạo khách, bạn chọn "nguồn" để biết khách đến từ đâu. Báo cáo marketing dựa vào trường này.

![Danh sách nguồn](./images/part-03-thanh-vien/B11-nguon.png)

**Các cột:** STT | Tên nguồn | Nhóm nguồn | Thứ tự hiển thị.

**Ví dụ nguồn đã có sẵn:** *Tư vấn*, *Facebook*, *Zalo*, *Quảng cáo*, *Giới thiệu*, *YouTube*, *TikTok*, *Google*, *Báo chí*, *Sagawa*.

**Thao tác:**
- **Thêm mới** → form: Tên nguồn (bắt buộc, text), Nhóm nguồn (select: Online/Offline/Giới thiệu/Khác), Thứ tự hiển thị (số).
- Sửa / Xóa (tương tự B.1).

### B.3. Danh sách nhóm thành viên

**Mục đích:** Phân loại khách vào các **nhóm** để áp dụng chính sách giá/ưu đãi riêng.

![Danh sách nhóm](./images/part-03-thanh-vien/B12-nhom.png)

Ví dụ: *"Khách VIP"*, *"Khách mới"*, *"Khách trung thành"*, *"Khách doanh nghiệp"*.

**Form thêm/sửa:**
- **Tên nhóm** ✓ — bắt buộc, text ≤ 100 ký tự.
- **Mô tả** — textarea.
- **Màu nhãn** — color picker (hiển thị dạng badge trong danh sách thành viên).
- **Chính sách giá** — link sang cấu hình giá gắn với nhóm (xem Part 11).

### B.4. Danh sách ngành nghề/nghề nghiệp

**Mục đích:** Phân khúc khách theo nghề để làm marketing nhắm đúng đối tượng.

![Danh sách ngành nghề](./images/part-03-thanh-vien/B13-nghenghiep.png)

**Thao tác:** Thêm / Sửa / Xóa với các trường: Tên ngành nghề (text bắt buộc), Phân nhóm, Thứ tự hiển thị.

### B.5. Danh sách mối quan hệ

**Mục đích:** Định nghĩa loại quan hệ giữa các khách (người giới thiệu, người thân, đối tác…) để tạo mạng lưới.

![Danh sách mối quan hệ](./images/part-03-thanh-vien/B14-moiquanhe.png)

Ví dụ: *"Vợ / chồng"*, *"Anh chị em"*, *"Đồng nghiệp"*, *"Người giới thiệu"*.

Khi tạo/sửa khách, trường **Thành viên liên quan** sẽ cho chọn nhiều khách + kèm loại quan hệ từ danh mục này.

### B.6. Định nghĩa trường thông tin bổ sung

**Mục đích (quan trọng nhất):** Mở rộng form thành viên với **trường tùy chỉnh** đặc thù ngành nghề của bạn. Ví dụ:

- Spa: *Loại da*, *Tình trạng tóc*, *Dị ứng*.
- Gym: *Mục tiêu tập*, *Bệnh lý cần lưu ý*, *PT đang tập*.
- Co-working: *Công ty*, *Vai trò*, *Kích thước team*.

![Định nghĩa trường thông tin bổ sung](./images/part-03-thanh-vien/B15-fields.png)

**Các bước thêm một trường:**

1. Bấm **Thêm trường**.
2. Điền form:

#### Quy định nhập liệu — Định nghĩa trường bổ sung

| Trường | Bắt buộc | Kiểu | Ghi chú |
|--------|:--------:|------|---------|
| **Tên hiển thị** | ✓ | Text | Nhãn mà người nhập sẽ thấy (vd *"Loại da"*) |
| **Mã field** | ✓ | Text slug | Tự sinh từ tên hiển thị, dạng `loai_da`. Không đổi được sau khi lưu |
| **Loại dữ liệu** | ✓ | Select | Text / Number / Date / Select (dropdown) / Multi-select / Radio / Checkbox / Textarea / File upload |
| **Bắt buộc?** | — | Toggle | Nếu bật, form thêm/sửa khách yêu cầu điền |
| **Giá trị mặc định** | — | Tùy kiểu | Áp dụng khi tạo mới |
| **Ràng buộc độ dài (text)** | — | Number | `maxLength` cho input |
| **Giới hạn dạng textarea** | — | Number | Backend mặc định giới hạn 459 ký tự |
| **Danh sách option (với Select/Multi-select/Radio)** | ✓ khi dùng | Text[] | Mỗi dòng một option |
| **Nhóm hiển thị** | — | Select | Gán vào nhóm (ví dụ *"Thông tin sức khỏe"*) |
| **Thứ tự hiển thị** | — | Number | Số nhỏ hiện trước |

3. Bấm **Lưu**. Trường mới tự động xuất hiện trong form **Thêm/Sửa thành viên** ở khu vực **Thông tin bổ sung**.

> **Lưu ý quan trọng:**
> - **Mã field không đổi được** sau khi đã tạo, vì backend dùng để lưu dữ liệu. Đặt tên cẩn thận.
> - **Xóa một trường sẽ xóa tất cả dữ liệu** đã nhập ở trường đó trên mọi khách. Hệ thống cảnh báo trước.
> - Nếu đổi **Bắt buộc** từ `Tắt` sang `Bật`, các khách đã có dữ liệu trống sẽ bị "gãy" — không edit được nếu không điền trường này.

### B.7. Định nghĩa cấu trúc xem thông tin

**Mục đích:** Sắp xếp **layout hiển thị** trên màn Chi tiết thành viên theo **vai trò** người dùng. Ví dụ nhân viên bán hàng chỉ thấy tên + SĐT + điểm tích, còn quản lý thấy đầy đủ cả địa chỉ + nguồn + người phụ trách.

![Định nghĩa cấu trúc xem](./images/part-03-thanh-vien/B16-viewstructure.png)

**Thao tác cơ bản:**

1. Chọn **Vai trò** cần cấu hình (dropdown).
2. Danh sách trường hiện ra với toggle **Hiển thị / Ẩn** và ô **Thứ tự**.
3. Kéo thả để sắp xếp.
4. Bấm **Lưu cấu trúc**.

> Phần này là dành cho **admin tenant**, không phải nhân viên thường dùng hằng ngày.

---

## C. Luồng công việc thường gặp

### C.1. "Khách mới đến lần đầu"

1. Nhân viên lễ tân dùng **Bán hàng tại quầy** (Part 02) → bấm **+ Thêm mới thành viên** trong modal chọn khách → điền 3 trường (Tên, SĐT, Giới tính) → bấm **Tạo nhanh** → gắn vào đơn → bán hàng bình thường.
2. Sau khi khách rời, nếu cần bổ sung thông tin (nguồn, nghề nghiệp, ghi chú) → vào **Thành viên → Thành viên**, tìm khách, mở Chi tiết → điền tiếp.

### C.2. "Sếp bảo gửi danh sách khách VIP cho marketing"

1. Vào **Thành viên → Thành viên**.
2. Lọc bằng badge **⭐ VIP**.
3. Bấm **Xuất danh sách** → tick các cột cần (Họ tên, SĐT, Email, Nhóm) → Xuất `.xlsx`.
4. Gửi file cho marketing.

### C.3. "Chuyển dữ liệu từ Excel cũ sang"

1. Vào **Thành viên → Cài đặt thành viên → Định nghĩa trường bổ sung**.
2. Tạo các trường tùy chỉnh khớp với cột Excel của bạn.
3. Tải file Excel mẫu từ **Nhập danh sách** → copy dữ liệu cũ vào đúng format.
4. Upload → kiểm tra báo cáo → sửa các dòng lỗi → re-upload nếu cần.

### C.4. "Thiết lập các hạng thẻ đầu tiên"

1. Vào **Cài đặt thành viên → Danh sách thẻ thành viên**.
2. Thêm các hạng: *Basic* (từ 0đ), *Silver* (từ 2tr), *Gold* (từ 10tr), *Diamond* (từ 50tr).
3. Cài tỷ lệ tích điểm và ảnh cho từng hạng.
4. Khách mua sẽ tự lên hạng dựa vào tổng chi tiêu (xem thêm Part 09 — Ưu đãi & Chăm sóc).

---

## D. Lỗi thường gặp & cách xử lý

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|------------|
| *"Số điện thoại đã tồn tại"* khi thêm mới | SĐT trùng với khách cũ trong cùng cơ sở | Tìm khách cũ bằng SĐT trong danh sách → chọn thay vì tạo mới |
| *"Bạn không có quyền xem số điện thoại !"* khi bấm icon con mắt | Vai trò của bạn không được cấp quyền `customer.viewPhone` | Liên hệ quản lý để cấp quyền (xem Part 12) |
| Không thấy nút **Thêm nhanh** ở danh sách | Vai trò không có quyền `CUSTOMER` | Liên hệ admin |
| Import Excel báo *"Nhiều dòng lỗi"* | Sai format SĐT, thiếu tên, hoặc ngày sinh sai định dạng | Tải file kết quả → xem cột *"Lý do lỗi"* → sửa lại → upload lại |
| Trường tùy chỉnh đã tạo nhưng không thấy trên form | Trường chưa được gán nhóm hiển thị, hoặc thuộc vai trò không được bật | Kiểm tra ở [B.7](#b7-định-nghĩa-cấu-trúc-xem-thông-tin) |

---

## Tiếp theo

- **Part 04 — Giao dịch**: từ khách hàng → đi xem lịch sử giao dịch của họ. Chi tiết xử lý đơn, hóa đơn VAT, trả hàng.
- **Part 06 — Tài chính**: quản lý công nợ của khách (đã nhắc ở Part 02 và Part 03 — công nợ).
- **Part 09 — Ưu đãi & Chăm sóc**: áp dụng chính sách điểm tích lũy, voucher, chiến dịch gửi tin nhắn cho một nhóm khách.

---

*Hết Part 03.*
