# Requirements 2026-05-05 — Community Hub / Events

> Nguồn: 3 file ghi âm buổi trao đổi với khách (audio_part1/2/3.mp3 — tổng ~43 phút). Transcript raw: `audio_part1.txt`, `audio_part2.txt`, `audio_part3.txt`.

## 0. Bối cảnh & Deadline

- Sự kiện gần nhất của khách: **9/5/2026** (còn 4 ngày kể từ buổi họp).
- Khách phía nghiệp vụ đã chuẩn bị xong (đồng phục, size áo, màu…); hệ thống bên mình chưa kịp.
- Khách so sánh: thuê ngoài 500k–1tr/ngày là xong giao diện → áp lực tiến độ cao.
- **Ưu tiên thống nhất**: làm **giao diện tổng thể trước** (1–2 ngày), phần dữ liệu / thống kê / mã số làm song song trong tuần kế tiếp.

## 1. Form / Trang đăng ký sự kiện (giao diện)

### Vấn đề hiện tại
- Trang sự kiện hiện tại đang lock, **admin không có quyền chỉnh sửa nội dung** → khách không tự cập nhật được.
- Layout cứng, ít cột thông tin so với mockup khách mong muốn (ở mockup có nhiều cột, hiển thị render thiếu).

### Yêu cầu
- Cho phép admin **chỉnh sửa nội dung trang sự kiện** (text + ảnh), không cần dev can thiệp.
- Layout block linh hoạt:
  - Mỗi block = **khung ảnh + chữ** (ảnh trên/dưới/trái/phải).
  - Số lượng block không giới hạn (1, 2, 3, 4… vô hạn).
  - Admin **kéo thả thứ tự** (cái nào lên trước, cái nào sau).
  - Mỗi block có thể đính link.
- Cho phép treo **banner / link quảng cáo** ở phần dưới trang.
- **Bình luận** dưới mỗi sự kiện:
  - Giữ lại vĩnh viễn, không bị trôi như Facebook.
  - Là kênh CSKH (khách hỏi → mình trả lời tại đây).
- Hub list: 1 tháng có ~12 sự kiện, admin tự sắp xếp pin/thứ tự hiển thị.

### Lưu ý
- Sự kiện test cũ trên môi trường khách thấy được → cần **ẩn** (đang lộ).
- Đầu mối sự kiện phải có **số điện thoại liên hệ của bên mình** (rõ ràng trên trang).

## 2. Đăng ký tham gia — 3 luồng

| Luồng | Định danh | Hành vi |
|---|---|---|
| **A. Chưa có mã số** (thành viên demo) | Tên + SĐT | Đăng ký nhanh để tham gia 1 sự kiện. Sau 1–2 lần trải nghiệm, được tư vấn nâng cấp. |
| **B. Đăng ký mã số mới** | Tên + SĐT + form mở mã | Khi user nhấn "đăng ký thành viên" → admin nhận yêu cầu, CSKH, cấp mã. |
| **C. Đã có mã số** | Mã số + mật khẩu | Login trực tiếp; hệ thống auto-fill thông tin đã lưu. |

### Form đăng ký (luồng A) — field bắt buộc
- Họ tên
- Số điện thoại (định danh tạm; có thể OTP — hiện đang test miễn phí)
- Email
- Công việc hiện tại
- (Khách nói thêm) các field tuỳ biến theo từng sự kiện (size áo, màu áo, lựa chọn món…) — **tham khảo mockup khách dán** ở `audio_part3` lines 95–104.

### Login (luồng C)
- Đăng nhập bằng **mã số** (không phải SĐT/email) — tương đồng với VNeID căn cước.
- Mật khẩu admin set ban đầu, user đổi sau.
- **Quên mật khẩu** → IP / yêu cầu về admin, admin reset thủ công (giai đoạn đầu).

## 3. Hệ thống mã số thành viên (CORE)

> Đây là phần quan trọng nhất, đã chiếm ~70% thời gian buổi họp.

### 3.1 Hai loại mã

1. **Mã định danh cố định** (= "ID con người")
   - Cấp 1 lần, đi suốt đời, **không bao giờ đổi**.
   - Vai trò giống VNeID / số căn cước công dân.
   - Là khoá login, là khoá join mọi lịch sử & dịch vụ.

2. **Mã chức vụ / mã khóa học** (= "số báo danh")
   - Cấp thêm khi user tham gia khóa học mới hoặc lên cấp (Mentor 7 → Master, Nhà giáo dục gia đình…).
   - **Không sửa cột cũ — tạo cột mới**. Một người có thể có nhiều mã chức vụ song song.
   - Khách kỳ vọng cả đời 1 người tích lũy ~10 mã loại này là nhiều.

### 3.2 Format mã định danh

`<HẠNG><STT cá nhân>-<STT nhóm>`

Ví dụ thực tế từ buổi họp: `5971-300`, `6676-334`, `6806-340`.

| Phần | Ý nghĩa |
|---|---|
| `<HẠNG>` (1 chữ số đầu) | Hạng thành viên. Hiện đang lên đầu **6** = thành viên chính thức. (Các đầu khác chưa làm rõ trong buổi này → cần hỏi tiếp.) |
| `<STT cá nhân>` | Số thứ tự cá nhân tăng dần theo thời gian gia nhập (đã ~6.000+ thành viên). |
| `<STT nhóm>` | Số nhóm. **20 người / nhóm**, tăng dần theo thứ tự. (Đã có ~334 nhóm.) |

**Quy tắc nhóm:**
- 20 người ghi danh trước → nhóm 1; 20 người tiếp → nhóm 2; v.v.
- **KHÔNG phân theo địa lý / khu vực**. Chỉ theo thứ tự thời gian gia nhập.
- Mỗi nhóm có 1 trưởng nhóm để admin phân công nhiệm vụ.

**Trưởng nhóm:**
- Có thêm 1 mã riêng, prefix `master` (ví dụ `master-1`, `master-2`, `master-3`…).
- Là cột riêng trong record của user (không gộp vào mã định danh chính).

### 3.3 Quy tắc lưu lịch sử

- Mọi sự kiện trong đời thành viên đều **link về mã định danh cố định**:
  - Check-in sự kiện
  - Sản phẩm/dịch vụ đã dùng (nước uống, cà phê, làm da mặt, ngâm chân…)
  - Khóa học đã tham gia, điểm số, sao, công ty chứng nhận
  - Tiền đã chuyển hằng tháng
  - Nợ (nếu có) — khách yêu cầu ghi cả nợ
- Khi admin tra cứu: **điều tra từ gốc lên ngọn** — gõ mã → xem toàn bộ lịch sử → mới biết user hiện đang ở chức vụ nào.
- Trang chi tiết user phải có **dòng thời gian** (timeline): click tháng → ra hoạt động trong tháng; click ngày → ra chi tiết ngày đó.

## 4. Báo cáo / Thống kê

### Cấu trúc
- **Báo cáo chi tiết theo từng sự kiện** (mỗi sự kiện 1 bảng riêng, hàng trăm cột tuỳ field).
- **Báo cáo tổng thể** (theo tháng, theo nhóm, theo hạng…).
- Khách yêu cầu **làm tổng thể trước** vì dễ hơn, chi tiết làm sau.

### Field thống kê (chưa đầy đủ — gợi ý từ buổi họp)
- Số tiền user chuyển vào hằng tháng.
- Số sự kiện / khóa học đã tham gia.
- Điểm đánh giá, số sao.
- Trạng thái hoạt động ("ngon" / "không ngon" — từ khách dùng).
- Lịch sử check-in theo dòng thời gian.

## 5. Phân quyền nội dung trang sự kiện

| Vùng | Quyền |
|---|---|
| Tên / mô tả sự kiện | Admin sửa được |
| Khung ảnh, banner | Admin upload + sắp xếp |
| Form đăng ký (field) | Admin tự định nghĩa field (giống Google Form / typeform) |
| Bình luận | User comment, admin reply, KHÔNG xoá tự động |
| SĐT liên hệ | Admin gắn cố định trên trang |

## 6. Tham chiếu vào codebase hiện tại

> Mapping yêu cầu vào module `src/pages/CommunityHub/Events/*` đang sửa trên branch `community-hub`.

| Yêu cầu | File / module hiện tại | Action gợi ý |
|---|---|---|
| Layout block linh hoạt + ảnh + chữ | `EventDetailPage.tsx`, `EventFormPage.tsx` | Mở rộng schema để hỗ trợ block-based content |
| Field động trên form đăng ký | `DynamicFieldsBuilder.tsx`, `DynamicFieldsRenderer.tsx` | Đã có nền tảng — bổ sung kiểu field còn thiếu (size, color, multi-choice) |
| Mã số thành viên (định danh + chức vụ) | *(chưa có module)* | Cần thiết kế module `Members` mới (out of Events scope) |
| Đăng ký theo mã số / SĐT | `PublicEvents/index.tsx`, `ShareEventPage/index.tsx` | Thêm 3 luồng A/B/C ở form public |
| Bình luận sự kiện | *(chưa có)* | Thêm component comment list dưới `EventDetailPage` |
| Báo cáo theo timeline | *(chưa có)* | Thiết kế trang `MemberDetailPage` với timeline |

## 7. Câu hỏi cần làm rõ tiếp với khách

1. Các đầu hạng còn lại của mã định danh (ngoài đầu **6**) là gì? Mapping prefix → hạng?
2. Trưởng nhóm: format chính xác — `master-N` hay nguyên `<mã cá nhân>-master-N`?
3. Quên mật khẩu giai đoạn 2 có cần OTP qua SMS / email tự động không, hay vẫn manual?
4. Field động trên form đăng ký: khách có muốn admin tự định nghĩa hay dev hardcode theo loại sự kiện?
5. Bình luận: có cần moderation (duyệt trước khi public) không?
6. Báo cáo: format export — trên web, PDF, hay Excel?
7. Phân quyền nội bộ: bao nhiêu role (admin, super-admin, mentor, master…)?

## 8. Đề xuất ưu tiên triển khai

**Tuần này (đến 9/5):**
- [ ] Mở quyền sửa nội dung trang sự kiện cho admin (giao diện block + ảnh)
- [ ] Bổ sung field còn thiếu trong form đăng ký theo mockup khách
- [ ] Ẩn các sự kiện test trên prod
- [ ] Gắn SĐT liên hệ vào template trang sự kiện

**Tuần kế (10/5–17/5):**
- [ ] Bình luận dưới sự kiện
- [ ] Module Members: schema mã định danh + mã chức vụ
- [ ] 3 luồng đăng ký (A/B/C)
- [ ] Login bằng mã số

**Sau đó:**
- [ ] Trang Member detail với timeline lịch sử
- [ ] Báo cáo tổng thể (tháng / nhóm / hạng)
- [ ] Báo cáo chi tiết từng sự kiện
- [ ] Quản lý nhóm + trưởng nhóm
