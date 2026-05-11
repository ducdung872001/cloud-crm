# Hướng dẫn sử dụng FitPro

**Phiên bản:** 0.6 · Cập nhật 2026-04-24

Tài liệu HDSD dành cho người dùng nền tảng **FitPro** — giải pháp quản lý chuỗi trạm tập 6-9h với các phân hệ đặc thù: Mạng lưới 7×7×7, Hành trình 90 ngày và FitPro Modules. Được biên soạn theo hướng **task-based**: bạn muốn làm gì → đi qua các bước nào → kết thúc ở đâu.

## Thông tin sản phẩm & nhà cung cấp

| Mục | Giá trị |
|------|---------|
| Tên sản phẩm | **FitPro** |
| Nhà phát triển | **Reborn JSC** — Công ty Cổ phần Công nghệ và Truyền thông Reborn |
| Website công ty | https://ecosystem.reborn.vn |
| Phiên bản tài liệu | 0.6 (2026-04-24) |

> FitPro là sản phẩm phần mềm do **Reborn JSC** phát triển, được triển khai trên nền tảng công nghệ CRM đa ngành của Reborn. Bản quyền nội dung tài liệu này thuộc về Công ty Cổ phần Công nghệ và Truyền thông Reborn.

## Truy cập hệ thống

| Mục | Giá trị |
|------|---------|
| Link đăng nhập | [https://fitpro.reborn.vn/crm/login](https://fitpro.reborn.vn/crm/login) |
| Tài khoản dùng thử | `0971234599` |
| Mật khẩu | `Reborn@12345` |
| Vai trò đề nghị | Ban giám đốc (có full quyền xem-sửa) |

> Khi truy cập lần đầu, hệ thống tự chuyển sang trang SSO. Đăng nhập xong, hệ thống sẽ hỏi chọn vai trò — chọn **Ban giám đốc** để có toàn quyền trải nghiệm.

## Cấu trúc tài liệu

Tài liệu chia thành **15 Part**. Mỗi Part là một phân hệ độc lập trên sidebar bên trái, kèm các chức năng liên quan (dependencies) mà phân hệ đó liên kết tới.

Các Part có đánh dấu **🔜 Tương lai** là những phân hệ đã được đóng gói sẵn trong codebase nhưng chưa bật cho tenant FitPro hiện tại — sẽ kích hoạt ở các giai đoạn sau. Bạn có thể xem trước để hình dung lộ trình.

| Part | Phân hệ | Nội dung chính |
|------|---------|----------------|
| [Part 01](part-01-bat-dau.md) | Bắt đầu | Đăng nhập, tổng quan giao diện, Dashboard, thanh công cụ |
| [Part 02](part-02-le-tan.md) | Trạm FitPro 6-9h | Bán hàng tại quầy, Check-in trạm, Trừ buổi tập, Quản lý ca làm việc |
| [Part 03](part-03-thanh-vien.md) | Thành viên | Danh sách thành viên, Tạo/sửa thành viên, Cấu hình trường dữ liệu, Hạng thành viên |
| [Part 04](part-04-giao-dich.md) | Giao dịch | Danh sách đơn, Hóa đơn VAT, Xử lý trả hàng |
| [Part 05](part-05-luu-tru.md) 🔜 | Lưu trú | Check-in phòng, Đặt phòng, Quản lý lưu trú (dùng khi triển khai mô hình lưu trú) |
| [Part 06](part-06-tai-chinh.md) | Tài chính & Thanh toán | Tổng quan, Sổ thu chi, Quản lý quỹ, Khoản mục, Công nợ, Đối soát thanh toán |
| [Part 07](part-07-doi-tac-phan-hoi.md) | Business Owner & Phản hồi | Quản lý Business Owner (chủ trạm), Đánh giá & phản hồi từ hội viên |
| [Part 08](part-08-bao-cao.md) | Báo cáo | Doanh thu trạm, Thành viên, Lượt tập, Gói dịch vụ, Business Owner, Tài chính & Hoa hồng |
| [Part 09](part-09-uu-dai-cham-soc.md) 🔜 | Ưu đãi & Chăm sóc | Khuyến mãi & Voucher, Tích điểm, Chiến dịch marketing, Chăm sóc (chưa bật cho FitPro) |
| [Part 10](part-10-kho.md) 🔜 | Kho & Nguyên vật liệu | NVL, Nhà cung cấp, Kho, Sổ kho, Báo cáo kho (dùng khi trạm bán thêm đồ uống/NVL) |
| [Part 11](part-11-cai-dat-co-ban.md) | Cài đặt cơ bản | Cấu hình FitPro, Gói FitPro, Danh mục dịch vụ, Vận hành cơ sở |
| [Part 12](part-12-cai-dat-nang-cao.md) | Cài đặt nâng cao | Tổ chức & phân quyền, Kênh liên lạc, Tích hợp, Tài khoản & bảo mật, Hỗ trợ |
| [Part 13](part-13-mang-luoi-7x7x7.md) ✨ | Mạng lưới 7×7×7 | Cấu trúc mạng lưới giới thiệu, cây 7 tầng, quyền & hoa hồng theo nhánh |
| [Part 14](part-14-hanh-trinh-90-ngay.md) ✨ | Hành trình 90 ngày | Chu trình tham gia 90 ngày của hội viên, các mốc chuyển đổi, nhắc tự động |
| [Part 15](part-15-fitpro-modules.md) ✨ | FitPro Modules | 9 module đặc thù: Cấu hình loại trạm, Thẻ liên thông, Chỉ số cơ thể, Tuân thủ SOP, Tìm trạm gần nhất, Hoa hồng hệ thống, Phễu marketing, Khai thuế, Onboarding MF7 |
| Final | Tổng hợp | Gộp toàn bộ Part thành một file `HDSD-full.md` duy nhất + hướng dẫn upload |

- ✨ = Part mới trong v0.6 (viết riêng cho FitPro)
- 🔜 = giữ lại cho tương lai, chưa kích hoạt cho tenant FitPro hiện tại

## Quy ước

- **Ảnh chụp**: tất cả ảnh nằm trong thư mục `images/` và được tham chiếu bằng đường dẫn tương đối trong từng file markdown.
- **Đường dẫn (URL)**: các đường dẫn trong hướng dẫn đều bắt đầu bằng `/crm/` — đó là đường dẫn của ứng dụng trên tên miền `fitpro.reborn.vn` (ví dụ: `https://fitpro.reborn.vn/crm/dashboard`).
- **"Bấm"** và **"Nhấp"** dùng thay thế nhau, chỉ hành động click chuột trái.
- **Phím tắt** được in đậm, ví dụ: **Esc**, **Enter**.
- Hộp thoại lưu ý / cảnh báo được đánh dấu với tiền tố **Lưu ý:** / **Quan trọng:**.

## Lịch sử phiên bản

| Version | Ngày | Thay đổi |
|---------|------|----------|
| 0.5 | 2026-04-14 | Bản đầu tiên, 12 Part cho tenant "Viettel Store" (Cửa hàng & Spa). |
| 0.6 | 2026-04-24 | Cập nhật cho tenant **FitPro**: đổi Part 02 thành "Trạm FitPro 6-9h", đổi Part 07 thành "Business Owner & Phản hồi", làm mới Part 08 theo sidebar báo cáo mới. Thêm 3 Part mới (Part 13/14/15) cho đặc thù chuỗi trạm FitPro. |

## Cập nhật sau mỗi phiên

Mỗi Part được biên soạn trong một phiên riêng biệt với Claude. Khi tất cả Part hoàn tất, một phiên tổng hợp cuối sẽ gộp thành file `HDSD-full.md` để bạn chuyển đổi sang DOCX (khuyến nghị dùng chính Claude web để format đẹp, kèm theo upload thư mục `images/`).
