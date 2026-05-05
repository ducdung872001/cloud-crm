# So sánh Summary — Claude vs Ngọc + Lợi (buổi họp 5/5/2026)

> So sánh giữa `requirements_summary.md` (bóc từ 3 audio bằng Whisper + tổng hợp lại) và `summary.txt` (note tay của bạn Ngọc + Lợi tại buổi họp). Mục tiêu: đánh giá thừa / thiếu / lệch để tránh sót requirement khi triển khai.

## Nhận xét tổng quan

| Tiêu chí | Note Ngọc | Note Lợi | Claude summary |
|---|---|---|---|
| Độ dài | ~15 dòng | ~10 dòng | ~200 dòng |
| Cấu trúc | Bullet rời | Bullet rời | Có phân mục, mapping codebase, action items |
| Bao phủ | Tập trung mã số + báo cáo | Tập trung giao diện + 2 luồng | Đầy đủ, có cả deadline & câu hỏi mở |
| Sai lệch tiềm tàng | Không thấy | Bỏ luồng B (đăng ký mã mới) | Có nguy cơ "phóng đại" do Whisper transcribe sai |

## 1. Những điểm 3 bên KHỚP NHAU (đã chốt — yên tâm triển khai)

- ✅ Trang sự kiện cho phép admin **sửa banner + text + ảnh**, bố cục theo block, sắp xếp thứ tự.
- ✅ Cho phép **treo banner quảng cáo** ở vùng trống.
- ✅ **Bình luận trong sự kiện** (chỉ Lợi note rõ; Ngọc không note nhưng trong audio có).
- ✅ **Mã số định danh format** `<STT cá nhân>-<số nhóm>`, **20 người/nhóm**.
- ✅ **Trưởng nhóm**: thêm mã `master-<N>`.
- ✅ Mã số định danh là **khóa join** lịch sử: lớp đã học, dịch vụ đã dùng, ghi nợ.
- ✅ Có **báo cáo chi tiết** theo sự kiện + **báo cáo tổng thể** theo thành viên.

## 2. Những điểm Claude CÓ — Ngọc/Lợi KHÔNG (kiểm tra lại trong audio)

| # | Điểm | Nguồn | Mức độ tin cậy |
|---|---|---|---|
| 2.1 | **Deadline 9/5/2026** — sự kiện gần nhất, còn 4 ngày, khách giục giao diện trước 1-2 ngày | audio_part3 lines 133–197 | **Cao** — khách nói rõ |
| 2.2 | **Sự kiện test trên prod chưa ẩn**, khách đã thấy | audio_part1 lines 13–14 | **Cao** — khách phàn nàn |
| 2.3 | **SĐT liên hệ phải gắn cố định** trên trang sự kiện | audio_part1 lines 11–14 | **Cao** |
| 2.4 | **Login bằng mã số** (không phải SĐT/email) — tương đồng VNeID | audio_part2 lines 152–164 | **Cao** — khách nhấn mạnh |
| 2.5 | **Quên mật khẩu**: IP về admin, reset thủ công giai đoạn đầu | audio_part1 lines 174–179 | **Trung bình** — khách nói nhưng có thể đổi sau |
| 2.6 | **3 luồng đăng ký** (A: chưa có mã, B: đăng ký mã mới, C: đã có mã) | audio_part1 lines 113–124 | **Cao** — khách liệt kê 3 luồng rõ |
| 2.7 | **OTP SMS hiện đang test miễn phí** | audio_part1 lines 197–204 | **Cao** |
| 2.8 | **2 loại mã song song**: mã định danh cố định + mã chức vụ/khóa học | audio_part2 lines 152–179 | **Cao** — phần dài nhất buổi họp |
| 2.9 | **Quy tắc nhóm KHÔNG theo địa lý** mà theo thứ tự thời gian gia nhập | audio_part3 lines 1–10 | **Cao** — khách giải thích kỹ |
| 2.10 | **Đầu hạng = 6** (đang dùng) — các đầu khác chưa rõ | audio_part2 lines 244–252 | **Cao** |
| 2.11 | **Bình luận giữ vĩnh viễn** (không trôi như Facebook) | audio_part3 lines 172–179 | **Cao** |
| 2.12 | Khách so sánh **thuê ngoài 500k–1tr/ngày là xong** giao diện | audio_part3 lines 184–189 | **Cao** — áp lực tiến độ |
| 2.13 | **Timeline chi tiết theo ngày/tháng** (click ngày → ra hoạt động) | audio_part3 lines 109–125 | **Cao** |

→ Đây là **các điểm Ngọc/Lợi note thiếu**, cần đưa vào backlog.

## 3. Những điểm Ngọc/Lợi CÓ — Claude bị NHẸ HOẶC THIẾU

| # | Điểm | Nguồn | Hành động |
|---|---|---|---|
| 3.1 | **"Lấy SĐT làm định danh truy xuất, căn cứ vào dịch vụ + sản phẩm để nâng cấp"** (Ngọc note rất rõ flow nâng cấp demo → có mã) | Ngọc dòng 8 | Claude có nhưng diễn đạt rườm — **bổ sung gọn lại** trong summary |
| 3.2 | **"Báo cáo: từng sản phẩm có bao nhiêu người mua, số lượng, biến thể nào, trạng thái (đã đăng ký, đã mua)"** | Ngọc dòng 19 | Claude mô tả chung "hàng trăm cột", **chưa cụ thể từng chiều phân tích** → bổ sung |
| 3.3 | **Bảng thống kê data theo ngày người dùng đăng ký dịch vụ + lịch sử mua** | Ngọc dòng 18 | Claude có timeline nhưng **chưa nói rõ chiều "sản phẩm/dịch vụ"** — bổ sung |
| 3.4 | Lợi nói chỉ **"2 hình thức tham gia"** (đã có mã / chưa có mã) | Lợi dòng 29–31 | **Lệch với Claude (3 luồng)** — kiểm tra lại: audio_part1 lines 113–124 khách rõ ràng nói 3 luồng. Có thể Lợi gộp luồng B vào A. → **Claude đúng**, nhưng cần chốt lại với khách |
| 3.5 | **"Báo cáo chi tiết thành viên tham gia sự kiện"** (riêng) | Lợi dòng 32 | Claude có gộp trong báo cáo tổng — **nên tách thành 1 view riêng** |

## 4. Những điểm 1 bên CHỈ CÓ — đáng ngờ, cần verify

### 4.1 Ngọc CHỈ CÓ
- "Sau khi tham gia lớp thì sẽ có mã tham gia lớp học **lưu vào mã định danh**" (dòng 15)
  - Diễn đạt mơ hồ: "lưu vào" có nghĩa là **append cột** (Claude hiểu) hay **gộp số vào mã chính** (Ngọc có thể hiểu)?
  - Audio: khách nói "không sửa cột cũ, thêm cột mới" → **Claude đúng**, nhưng diễn đạt của Ngọc dễ gây nhầm khi triển khai.
  - **Action**: làm rõ với khách + Ngọc trước khi code schema.

### 4.2 Lợi CHỈ CÓ
- "Họp **wit-house**" (dòng 22) — Claude không bắt được tên buổi họp.
  - Có thể là tên đối tác / địa điểm. Whisper transcribe không có chữ "wit-house" trong file nào.
  - **Action**: hỏi Lợi tên đối tác để cập nhật metadata.

### 4.3 Claude CHỈ CÓ
- **Field "công việc hiện tại"** trong form đăng ký (audio_part2 line 1: "Đăng ký lúc đăng ký hoàn thành, đăng ký tên, số điện thoại, email, công việc hiện tại của khách hàng")
  - **Cao tin cậy** — câu mở đầu của audio_part2.
- **Khách yêu cầu ghi cả NỢ** vào lịch sử
  - audio_part2 line 168 ("có tiến dụng đen hay không") — Whisper có thể transcribe sai, từ "tiến dụng đen" nghi là "tín dụng đen".
  - **Action**: nghe lại đoạn này (file audio_part2.mp3, mốc ~628s).

## 5. Rủi ro chất lượng transcript

Whisper medium model không hoàn hảo với tiếng Việt khẩu ngữ. Một số chỗ trong transcript có lỗi rõ:

| Audio | Đoạn transcript | Nghi ngờ chính xác |
|---|---|---|
| part1 line 136 | "đã được **cướp** mã số" | → "**cấp** mã số" |
| part1 line 166 | "**gõ** cái mã số" | → "**điền** mã số" (có thể OK) |
| part2 line 168 | "tiến dụng đen" | → "tín dụng đen" |
| part3 line 41 | "chữ **mát tư**" | → "chữ **master**" |
| part2 line 17 | "**mentor 7**" | → có thể là "**mentor**" (không có số 7) |

→ Khi triển khai, **đối chiếu lại chỗ quan trọng** (đặc biệt format mã số, tên role) với note Ngọc/Lợi hoặc nghe lại audio.

## 6. Tổng kết — Ai thừa, ai thiếu

### Ngọc
- **Mạnh**: chốt rõ format mã số + báo cáo theo sản phẩm/biến thể (rất action-oriented).
- **Thiếu**: deadline, login bằng mã số, bình luận, sự kiện test trên prod, OTP, 3 luồng (Ngọc note 3 hình thức nhưng không tách rõ A/B/C).

### Lợi
- **Mạnh**: bắt được tên buổi họp ("wit-house"), nhấn mạnh bình luận + báo cáo.
- **Thiếu**: chi tiết hệ thống mã số (chỉ note "2 hình thức" — sót luồng B), deadline, login flow, timeline.

### Claude
- **Mạnh**: bao phủ rộng, có deadline / quote khách / mapping codebase / câu hỏi mở.
- **Yếu**: chi tiết "báo cáo theo sản phẩm/biến thể" diễn đạt chung chung; không bắt được tên buổi họp; có rủi ro transcript sai ở vài chỗ thuật ngữ (master, tín dụng đen).

## 7. Đề xuất cập nhật vào `requirements_summary.md`

- [ ] Thêm phần **"Báo cáo theo sản phẩm/dịch vụ"** với các chiều: số người mua, số lượng, biến thể, trạng thái (đã đăng ký / đã mua / đã hủy) — học từ note Ngọc.
- [ ] Tách **"Báo cáo thành viên tham gia sự kiện"** thành mục riêng — học từ note Lợi.
- [ ] Sửa thuật ngữ "master" cho đúng (transcript đang viết "mát tư").
- [ ] Cập nhật metadata buổi họp: tên đối tác = "wit-house" (cần xác nhận).
- [ ] Bổ sung field **"công việc hiện tại"** vào form đăng ký mặc định.
- [ ] Note rõ: lịch sử ghi cả **nợ / tín dụng đen** (cần khách xác nhận có muốn track không).

## 8. Câu hỏi cần làm rõ với khách (gộp từ 3 nguồn)

Ngoài 7 câu trong `requirements_summary.md` mục 7, bổ sung:

8. **"wit-house"** là tên gì? Đối tác / địa điểm / dự án?
9. Báo cáo **theo sản phẩm + biến thể** có cần không? Format thế nào?
10. Có muốn track **nợ / tín dụng đen** trong record thành viên không? (Vấn đề pháp lý / nhạy cảm)
11. **Ngọc note "lưu mã lớp học vào mã định danh"** — append cột hay gộp số? (verify lại với khách + Ngọc cùng lúc)
