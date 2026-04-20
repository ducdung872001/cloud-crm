# Hướng dẫn sử dụng Reborn CRM — Cửa hàng & Spa

Tài liệu HDSD dành cho khách hàng thuê sử dụng Reborn CRM (biến thể Cửa hàng / Spa / Dịch vụ). Được biên soạn theo hướng **task-based**: bạn muốn làm gì → đi qua các bước nào → kết thúc ở đâu.

## Cấu trúc tài liệu

Tài liệu chia thành nhiều Part. Mỗi Part là một phân hệ độc lập trên sidebar bên trái, kèm các chức năng liên quan (dependencies) mà phân hệ đó liên kết tới.

| Part | Phân hệ | Nội dung chính |
|------|---------|----------------|
| [Part 01](part-01-bat-dau.md) | Bắt đầu | Đăng nhập, tổng quan giao diện, Dashboard, thanh công cụ |
| [Part 02](part-02-le-tan.md) | Lễ tân | Bán hàng tại quầy, Check-in khách, Trừ quota dịch vụ, Quản lý ca làm việc |
| [Part 03](part-03-thanh-vien.md) | Thành viên | Danh sách thành viên, Tạo/sửa thành viên, Cấu hình trường dữ liệu, Hạng thành viên |
| [Part 04](part-04-giao-dich.md) | Giao dịch | Danh sách đơn, Hóa đơn VAT, Xử lý trả hàng |
| [Part 05](part-05-luu-tru.md) | Lưu trú | Check-in phòng, Đặt phòng, Quản lý lưu trú |
| [Part 06](part-06-tai-chinh.md) | Tài chính & Thanh toán | Tổng quan, Sổ thu chi, Quản lý quỹ, Khoản mục, Công nợ, Đối soát thanh toán |
| [Part 07](part-07-doi-tac-phan-hoi.md) | Đối tác & Phản hồi | KOL/PO, Phản hồi khách hàng |
| [Part 08](part-08-bao-cao.md) | Báo cáo | Doanh thu & MRR, Thành viên, Check-in, Dịch vụ, Đối tác, Tài chính & Công nợ |
| [Part 09](part-09-uu-dai-cham-soc.md) | Ưu đãi & Chăm sóc | Khuyến mãi & Voucher, Tích điểm hội viên, Chiến dịch marketing, Chăm sóc thành viên |
| [Part 10](part-10-kho.md) | Kho & Nguyên vật liệu | NVL, Nhà cung cấp, Kho, Sổ kho, Quản lý kho, Báo cáo kho |
| [Part 11](part-11-cai-dat-co-ban.md) | Cài đặt cơ bản | Cấu hình toàn cục, Danh mục dịch vụ, Gói thành viên, Vận hành cơ sở |
| [Part 12](part-12-cai-dat-nang-cao.md) | Cài đặt nâng cao | Tổ chức & phân quyền, Kênh liên lạc, Tích hợp, Tài khoản & bảo mật, Hỗ trợ |
| Final | Tổng hợp | Gộp toàn bộ Part thành một file .md duy nhất + hướng dẫn upload |

## Quy ước

- **Ảnh chụp**: tất cả ảnh nằm trong thư mục `images/` và được tham chiếu bằng đường dẫn tương đối trong từng file markdown.
- **Đường dẫn (URL)**: các đường dẫn trong hướng dẫn đều bắt đầu bằng `/crm/` — đó là đường dẫn của ứng dụng trên tên miền của bạn (ví dụ: `https://tnex.reborn.vn/crm/dashboard`).
- **"Bấm"** và **"Nhấp"** dùng thay thế nhau, chỉ hành động click chuột trái.
- **Phím tắt** được in đậm, ví dụ: **Esc**, **Enter**.
- Hộp thoại lưu ý / cảnh báo được đánh dấu với tiền tố **Lưu ý:** / **Quan trọng:**.

## Cập nhật sau mỗi phiên

Mỗi Part được biên soạn trong một phiên riêng biệt với Claude. Khi tất cả Part hoàn tất, một phiên tổng hợp cuối sẽ gộp thành file `HDSD-full.md` để bạn chuyển đổi sang DOCX (khuyến nghị dùng chính Claude web để format đẹp, kèm theo upload thư mục `images/`).
