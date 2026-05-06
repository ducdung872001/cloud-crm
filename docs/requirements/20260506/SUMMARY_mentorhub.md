# Tóm tắt — Phần MentorHub

**Nguồn:** `Vincom Center 3.m4a` — đoạn `~00:40:50 → 00:55:12`
**Người tham gia:** Anh chủ + Dũng (Reborn).

---

## 1. Định vị sản phẩm

- **MentorHub = SaaS hỗ trợ vận hành lớp đào tạo** cho mentor/master/chuyên gia cá nhân.
- Tệp dùng:
  - Mentor cá nhân, không có hệ thống IT riêng (đa số đang dùng **Zoom + Telegram rời rạc**).
  - Cả các "thầy lớn" như Phạm Hành Lâm — họ có hệ thống riêng, không dùng SaaS này.
- **Pain point chính:** Zoom + Telegram → không kiểm soát được dữ liệu học viên, không có OV (overview), không cá nhân hóa được.

## 2. Kiến trúc 2 lớp giá trị

> "Mình chỉ làm 2 thứ: **phần thịt trước** và **phần thịt sau**."

### a. Phần thịt trước (pre-class)
- Tương tác với học viên trước buổi học.
- Có **flow quy trình + data học viên** (ai đăng ký, profile, đã tương tác gì).
- Một nút "thắt" để tổng hợp toàn bộ dữ liệu pre-class trước khi vào lớp.

### b. Phần thịt sau (post-class) — phần được nhấn mạnh nhất
- **Ghi nhận từng học viên trong buổi:** Zoom được integrate để record và breakdown từng người.
- Sau buổi học, hệ thống **tự sinh nhận xét cá nhân hóa** cho từng học viên:
  - "Hôm nay bạn đã tương tác như thế này, chuyên gia nhận định bạn nên..."
  - "Bạn chưa chịu tương tác lắm, có vướng gì không? Có câu hỏi gì không?"
- Thông điệp gửi qua **Zalo OA của công ty** (không phải Zalo cá nhân — vì Zalo cá nhân bị Zalo Inc chặn gửi tự động).
- **Tương tác 2 chiều:** học viên trả lời → hệ thống bắt → đổ về một cost (luồng) → mentor xử lý tiếp.

## 3. Insight cốt lõi: cá nhân hóa cảm xúc

Học viên 10 ngày sau **không nhớ kiến thức**. Họ chỉ nhớ:
- Vỗ tay
- Rung chuông
- Lời chúc mừng / nhắc nhở khi tăng-giảm chỉ số
- Thông điệp cá nhân hóa gửi riêng cho mình

→ Sản phẩm phải **làm tốt phần emotional touch** này, không cần nội dung phức tạp.

## 4. Mô hình chia sẻ Zoom (idea key, có thể là USP)

Bài toán: Zoom mỗi mentor mua riêng → **lãng phí** (1 tháng dạy 2–3 buổi, gói 365 ngày bỏ phí). Mặt khác mua chung tài khoản → **cấn lịch** (cùng giờ 2–3 người cần dùng).

Giải pháp:
- Hệ thống MentorHub **deal trực tiếp với Zoom/Google Meet** lấy gói lớn.
- Mỗi mentor có **tài khoản credit** (giống ví / trade hàng nước bộ).
- Khi không dùng Zoom của mình → cho mentor khác mượn → được +credit.
- Khi cần thêm slot → trừ credit hoặc trả tiền.
- Hệ thống **scan slot rảnh, phân phối điều phối tài khoản tự động**.

Mở rộng: cộng đồng `Hồ Phát` có **hàng nghìn người** đang lãng phí Zoom — có thể vào pool này ngay.

## 5. Pricing (đề xuất)

| Gói | Giá tham khảo | Đặc điểm |
|---|---|---|
| **Cơ bản (300k/tháng)** | 300.000đ | Không giới hạn bốc băm — dạy nhiều bao nhiêu cũng được |
| **Cao cấp (800k/tháng)** | 800.000đ | Có giới hạn nhưng kèm nhiều khóa / nhiều slot |
| **VIP / Granite** | Add-on | Phần phải trả phí ra ngoài (Zoom/AI), gắn vào gói |

Mentor có thể **tự cắm course content (cao) vào** và phân phối cho học viên.

## 6. Roadmap đã chốt

| Mốc | Việc |
|---|---|
| **Thứ 6 tuần này** | Demo bản đầu cho anh chủ |
| **Tuần sau** | UAT (sau khi anh chủ chốt yêu cầu) |
| **Tháng 5** | Test nội bộ |
| **Đầu tháng 6** | Thương mại hóa |
| **Tháng 7** | Scale, đẩy mạnh phân phối |

## 7. Open issues / cần làm rõ

- Cơ chế **chia credit Zoom** cụ thể (1 buổi = bao nhiêu credit, swap rate giữa các loại tài khoản).
- Tích hợp Zoom: dùng API record, hay scrape, hay deal license enterprise?
- Pipeline AI cho phần "đánh giá học viên" sau buổi (model nào, run khi nào, cost).
- Zalo OA: cần đăng ký OA cho công ty + verify để gửi message tự động.
- Có nên cho mentor "lớn" (Phạm Hành Lâm…) bypass và tự host không, hay bắt theo SaaS chuẩn?
