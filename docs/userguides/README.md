# Hướng dẫn sử dụng — Reborn Retail CRM

**HDSD (Hướng dẫn sử dụng)** dành cho người dùng cuối của hệ thống Reborn Retail CRM — biến thể *Cửa hàng bán lẻ / Chuỗi / Multi-channel POS*.

> **Mục đích**: Hướng dẫn từng bước **cách thao tác** trên hệ thống. Khác với URD (mô tả hệ thống làm gì) và SAD (kiến trúc kỹ thuật), HDSD trả lời câu hỏi **"Người dùng cần bấm gì để làm X?"**

## Đối tượng đọc

- **Nhân viên mới** cần onboarding
- **Quản lý cửa hàng** cần cấu hình vận hành
- **Thu ngân / nhân viên kho / kế toán** cần tra cứu thao tác cụ thể
- **Đội triển khai Reborn** dùng làm tài liệu đào tạo tenant mới

## Cách đọc tài liệu

1. **Người mới** — đọc Part 01 (Bắt đầu) + Part 02 (POS) trước.
2. **Quản lý** — xem Part 12-13 về cấu hình.
3. **Tra cứu nhanh** — dùng mục lục dưới đây, click vào task cần làm.

## Mục lục

| Part | Nội dung | Dành cho |
|---|---|---|
| [Part 01](part-01-bat-dau.md) | Bắt đầu — Đăng nhập, giao diện, Dashboard | Tất cả |
| [Part 02](part-02-pos-ban-hang.md) | POS — Bán hàng tại quầy | Thu ngân, Quản lý |
| [Part 03](part-03-khach-hang.md) | Quản lý Khách hàng | Thu ngân, Sales |
| [Part 04](part-04-don-hang-hoa-don.md) | Đơn hàng & Hoá đơn VAT | Thu ngân, Kế toán |
| [Part 05](part-05-kho-san-pham.md) | Kho & Sản phẩm | Nhân viên kho, Quản lý |
| [Part 06](part-06-mua-hang-ncc.md) | Mua hàng & Nhà cung cấp | Purchaser, Kế toán |
| [Part 07](part-07-van-chuyen.md) | Vận chuyển & Giao hàng | Sales, Warehouse |
| [Part 08](part-08-tai-chinh.md) | Tài chính & Thanh toán | Kế toán |
| [Part 09](part-09-marketing-khuyen-mai.md) | Marketing & Khuyến mãi | Marketing |
| [Part 10](part-10-loyalty-cham-soc.md) | Loyalty & Chăm sóc khách | CSKH, Sales |
| [Part 11](part-11-bao-cao.md) | Báo cáo & Phân tích | Quản lý, Chủ cửa hàng |
| [Part 12](part-12-cai-dat.md) | Cài đặt cơ bản | Tenant Admin |
| [Part 13](part-13-bpm-nang-cao.md) | BPM & Tự động hoá nâng cao | Tenant Admin, Dev |
| [Part 14](part-14-faq-troubleshooting.md) | FAQ & Xử lý sự cố | Tất cả |

## Quy ước trong HDSD

### Ký hiệu

- **Ô bấm** — nút trên màn hình: "Nhấn **[Tạo đơn mới]**"
- **Đường dẫn menu** — `Bán hàng → POS → Mở ca`
- **Trường input** — *Tên khách hàng*: nhập "Nguyễn Văn A"
- **Phím tắt** — `Ctrl + K` để mở tìm kiếm nhanh
- 💡 **Mẹo** — Gợi ý tăng hiệu quả thao tác
- ⚠️ **Chú ý** — Cảnh báo lỗi thường gặp hoặc hành động không hoàn tác được
- 🔒 **Quyền** — Yêu cầu quyền tối thiểu để làm được

### Ảnh minh hoạ

Mọi thao tác quan trọng đều có screenshot kèm. Ảnh được lưu trong [images/](images/) theo từng part.

### Màu nút trong UI

| Màu | Ý nghĩa |
|-----|---------|
| 🟢 Xanh lá | Hành động chính (lưu, tạo, xác nhận) |
| 🔵 Xanh dương | Hành động phụ (xem, sửa, sao chép) |
| 🟠 Cam | Cảnh báo (huỷ, điều chỉnh) |
| 🔴 Đỏ | Nguy hiểm / không hoàn tác (xoá, reset) |

## Môi trường & Truy cập

- **URL**: do đội triển khai cung cấp (ví dụ: `https://demo.reborn.vn/crm`)
- **Tài khoản**: SSO — cấp bởi Tenant Admin
- **Trình duyệt đề xuất**: Chrome / Edge phiên bản ≥ 110
- **Thiết bị**: Máy tính desktop/laptop hoặc POS terminal. Một số tính năng có PWA cho tablet / điện thoại (kiểm kê kho, scanner).

## Liên hệ hỗ trợ

- **Support thời gian làm việc**: xem trang `Cài đặt → Liên hệ` trong app.
- **Tài liệu kỹ thuật**: [../sa/](../sa/) và [../urd/](../urd/).

## Lịch sử phiên bản

| Version | Ngày | Mô tả |
|---|---|---|
| 1.0 | 2026-04-15 | Bản đầu tiên cho Reborn Retail CRM |
