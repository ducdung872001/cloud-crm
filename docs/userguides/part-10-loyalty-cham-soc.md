# Part 10 — Loyalty & Chăm sóc khách hàng

> **Dành cho**: CSKH (Customer Service), Sales, Store Manager
> **Mức độ**: Cơ bản → Trung cấp
> **Tham chiếu URD**: [Part 10 — Loyalty & Care](../urd/part-10-loyalty.md) (UR-LOY-01 → UR-LOY-18, UR-CARE-01 → UR-CARE-15)

Giữ khách **quay lại mua lần 2, lần 3** rẻ hơn tìm khách mới 5 lần. Part này chỉ bạn cách cấu hình **chương trình tích điểm**, **quản lý hạng thẻ**, **xử lý ticket hỗ trợ** và **theo dõi bảo hành** theo serial.

## Mục lục
- [1. Cấu hình công thức tích điểm](#1-cấu-hình-công-thức-tích-điểm)
- [2. Cấu hình hạng thẻ](#2-cấu-hình-hạng-thẻ)
- [3. Xem điểm & lịch sử tích điểm của khách](#3-xem-điểm--lịch-sử-tích-điểm-của-khách)
- [4. Đổi điểm lấy voucher / quà](#4-đổi-điểm-lấy-voucher--quà)
- [5. Expire điểm](#5-expire-điểm)
- [6. Tiếp nhận ticket hỗ trợ](#6-tiếp-nhận-ticket-hỗ-trợ)
- [7. Workflow xử lý ticket](#7-workflow-xử-lý-ticket)
- [8. Tiếp nhận bảo hành](#8-tiếp-nhận-bảo-hành)
- [9. Tracking warranty theo serial](#9-tracking-warranty-theo-serial)
- [10. Thu thập feedback](#10-thu-thập-feedback)
- [FAQ](#faq)

---

## 1. Cấu hình công thức tích điểm

Sidebar → **Loyalty → Cấu hình điểm** (`/loyalty_config`).

### 1.1. Công thức cơ bản

Dạng: **X đồng chi tiêu = Y điểm**.

Ví dụ phổ biến:
- 1.000đ = 1 điểm (1%)
- 10.000đ = 1 điểm (0.1%)
- 1.000đ = 0.5 điểm + bonus x2 cho sản phẩm đặc biệt

### 1.2. Điền form

- **Tỷ lệ cơ bản**: số đồng → 1 điểm
- **Tính trên**: Giá bán / Giá bán trước KM / Giá sau thuế
- **Loại trừ**: sản phẩm/category không tích điểm (ví dụ voucher, gift card)
- **Bonus theo hạng thẻ** (bảng dưới)
- **Giá trị quy đổi khi trừ điểm**: 1 điểm = ? đồng khi khách redeem

### 1.3. Bonus theo hạng thẻ

| Hạng | Bonus |
|---|---|
| Basic | x1 |
| Silver | x1.2 |
| Gold | x1.5 |
| Diamond | x2 |

Nhấn **[Lưu cấu hình]** — áp dụng cho **đơn mới** kể từ thời điểm lưu.

⚠️ **Chú ý**: Đổi công thức **không ảnh hưởng điểm cũ**. Khách đã tích được giữ nguyên.

🔒 **Quyền**: `loyalty.config.edit` — Tenant Admin.

---

## 2. Cấu hình hạng thẻ

Hạng thẻ = **level khách hàng** dựa trên tổng chi tiêu / số đơn / điểm.

Sidebar → **Loyalty → Hạng thẻ** (`/membership_tier`).

### 2.1. Hệ thống có sẵn 4 hạng mặc định

| Hạng | Điều kiện (ví dụ) | Quyền lợi |
|---|---|---|
| **Basic** | 0đ — 4.999.999đ / năm | Tích điểm cơ bản |
| **Silver** | 5tr — 19.999.999đ | Bonus x1.2, giảm 5% birthday |
| **Gold** | 20tr — 49.999.999đ | Bonus x1.5, giảm 10%, ưu tiên hỗ trợ |
| **Diamond** | ≥ 50tr | Bonus x2, giảm 15%, quà sinh nhật riêng |

### 2.2. Sửa hạng

Click vào hạng → sửa:

- **Tên**
- **Điều kiện lên hạng**: tổng chi tiêu 365 ngày / số đơn / điểm tích luỹ
- **Điều kiện giữ hạng**: chi tiêu tối thiểu để **không bị xuống hạng**
- **Quyền lợi**: danh sách (bonus %, voucher tặng, hotline riêng...)
- **Màu sắc** (hiển thị badge trong UI)

### 2.3. Tạo hạng mới

Nhấn **[+ Thêm hạng]** — có thể tạo ≤ 10 hạng.

💡 **Mẹo**: Giữ **3-4 hạng** là đủ. Nhiều quá → khách rối, bạn khó quản lý.

### 2.4. Đánh giá lên/xuống hạng

Hệ thống chạy job **mỗi đêm** (2h sáng) để đánh giá lại hạng. Khách lên hạng → gửi chúc mừng tự động. Khách xuống hạng → gửi nhắc nhở (cấu hình được).

⚠️ **Chú ý**: Có thể **pin hạng** khách VIP — không bao giờ bị xuống hạng dù không mua.

> 🖼️ *Ảnh minh hoạ: Form cấu hình hạng thẻ — chụp sau*

---

## 3. Xem điểm & lịch sử tích điểm của khách

### 3.1. Xem nhanh tại POS

Khi chọn khách trên POS, hiển thị: **Điểm hiện tại** + **Hạng thẻ** ngay cạnh tên.

### 3.2. Xem chi tiết

Sidebar → **Khách hàng** → click vào khách → tab **Loyalty**.

Hiển thị:

- **Điểm khả dụng**
- **Điểm đã dùng (lifetime)**
- **Điểm sẽ expire 30 ngày tới**
- **Hạng hiện tại** + tiến độ lên hạng kế
- **Loyalty ledger**: bảng chi tiết mỗi giao dịch tích/trừ điểm

### 3.3. Loyalty ledger

Mỗi dòng ledger:

| Ngày | Loại | Mô tả | +/- điểm | Balance | Đơn liên quan |
|---|---|---|---|---|---|

Loại có thể là: EARN (tích từ đơn), REDEEM (đổi quà), ADJUST (admin chỉnh), EXPIRE (hết hạn).

💡 **Mẹo**: Dùng filter theo loại để điều tra khiếu nại "tôi không thấy điểm".

---

## 4. Đổi điểm lấy voucher / quà

Khách đủ điểm → có thể **redeem** (đổi).

### 4.1. Cấu hình catalog đổi quà

Sidebar → **Loyalty → Catalog đổi quà** (`/redeem_catalog`) → **[+ Tạo phần quà]**.

Mỗi phần quà:

- **Tên** (ví dụ "Voucher 50.000đ")
- **Loại**: Voucher / Sản phẩm vật lý / Dịch vụ
- **Điểm cần** (ví dụ 500 điểm)
- **Hạng tối thiểu được đổi** (nếu giới hạn)
- **Tồn kho quà** (nếu physical)
- **Hết hạn sau X ngày** kể từ khi đổi

### 4.2. Khách đổi quà tại POS / Web

Ở POS:
1. Chọn khách → trang chi tiết khách có nút **[Đổi quà]**.
2. Hiện danh sách quà khách đủ điểm đổi.
3. Click quà → confirm → hệ thống trừ điểm + tạo voucher / phiếu giao quà.

💡 **Mẹo**: Voucher sinh từ redeem có thể **apply ngay cho đơn đang tạo** — không cần thoát POS.

### 4.3. Trừ điểm trực tiếp trong đơn

Có thể đặt config: **1 điểm = 100đ**, khách muốn dùng X điểm để giảm đơn → POS hiển thị ô **Sử dụng điểm**. Nhập số điểm → đơn giảm tương ứng.

⚠️ **Chú ý**: Điểm dùng để trả **không được tích điểm lại** (tránh loop).

---

## 5. Expire điểm

Điểm cũ nên hết hạn để **thúc đẩy mua hàng thường xuyên**.

### Cấu hình

Tại trang **Loyalty → Cấu hình điểm**, bật **Expire**:

- **Policy**:
  - **Sliding** — điểm hết hạn sau X tháng kể từ ngày tích
  - **Fixed** — toàn bộ điểm reset cuối năm (31/12)
- **Cảnh báo trước**: gửi SMS/Zalo nhắc khách 30/14/7 ngày trước khi hết hạn.

Hệ thống chạy job **đầu mỗi tháng** để expire điểm đến hạn + gửi thông báo.

⚠️ **Chú ý**: Policy expire **không áp dụng hồi tố** — điểm đã có trước khi bật sẽ không bị tính. Chỉ áp cho điểm tích mới.

---

## 6. Tiếp nhận ticket hỗ trợ

Khi khách khiếu nại / hỏi đáp / yêu cầu → tạo **ticket** để theo dõi xử lý.

### 6.1. Tạo ticket thủ công

Sidebar → **CSKH → Ticket** (`/ticket`) → **[+ Tạo ticket]**.

- **Khách hàng**: chọn (hoặc tạo mới)
- **Loại**: Khiếu nại / Hỏi đáp / Yêu cầu / Bảo hành / Đổi trả
- **Kênh tiếp nhận**: Hotline / Zalo / Email / Facebook / Walk-in
- **Đơn hàng liên quan** (tuỳ chọn)
- **Mức ưu tiên**: Thấp / Bình thường / Cao / Khẩn
- **Tiêu đề**
- **Mô tả chi tiết**
- **Đính kèm**: ảnh/video (khách gửi qua Zalo có thể paste vào)

Nhấn **[Tạo ticket]** → hệ thống gán mã (ví dụ `TK-2026-04-0001`) + assign cho CSKH theo rule.

### 6.2. Tạo tự động

Ticket có thể tự tạo từ:

- Khách reply email **support@**
- Khách nhắn Zalo OA
- Khảo sát NPS điểm < 6
- Đơn hàng lỗi (giao thiếu / sai SP)

💡 **Mẹo**: Bật **auto-assign round-robin** để ticket chia đều cho team CSKH.

---

## 7. Workflow xử lý ticket

### 7.1. Các status

```
NEW → IN_PROGRESS → WAITING_CUSTOMER → RESOLVED → CLOSED
                  ↘ ESCALATED (cần manager)
```

### 7.2. Flow xử lý

1. **Nhận ticket** → click vào ticket → nhấn **[Nhận xử lý]** → status → IN_PROGRESS.
2. **Phản hồi khách** — dùng tab **Phản hồi**:
   - Gõ nội dung
   - Chọn kênh gửi (Zalo / Email / SMS / Call log)
   - Nhấn **[Gửi]** → nội dung được log + gửi cho khách.
3. **Chờ khách phản hồi** → status → WAITING_CUSTOMER.
4. **Giải quyết xong** → nhấn **[Đánh dấu giải quyết]** → status → RESOLVED.
5. **Khách confirm OK** (hoặc auto sau 48h) → CLOSED.

### 7.3. Escalate

Nếu vượt khả năng xử lý: nhấn **[Escalate]** → chọn cấp cao hơn (Manager / Tech lead) → ticket chuyển cho họ.

### 7.4. SLA

Mỗi loại ticket có **SLA** (ví dụ: Khiếu nại phản hồi trong 2h, Giải quyết trong 48h).

- Ticket sắp quá SLA → hiện **badge cam**
- Quá SLA → **badge đỏ** + noti cho manager

💡 **Mẹo**: Theo dõi **SLA dashboard** hàng ngày — tỷ lệ on-time là KPI team CSKH.

> 🖼️ *Ảnh minh hoạ: Trang chi tiết ticket — chụp sau*

---

## 8. Tiếp nhận bảo hành

Bảo hành là **subset của ticket** — có extra field về sản phẩm + serial.

Sidebar → **CSKH → Bảo hành** (`/warranty_claim`) → **[+ Tạo yêu cầu bảo hành]**.

### Bước 1: Xác định sản phẩm

- Quét **serial / IMEI** trên sản phẩm — hệ thống tra ra: khách mua lúc nào, đơn nào, còn hạn BH không.
- Hoặc tìm theo **đơn hàng** + chọn SP.

### Bước 2: Điền tình trạng

- **Mô tả lỗi**: text + ảnh/video
- **Tình trạng máy khi giao**: còn nguyên vẹn / đã bóc seal / đã sửa chữa nơi khác
- **Yêu cầu khách**: Sửa / Đổi / Hoàn tiền

### Bước 3: Xác nhận còn hạn BH

Hệ thống tự check:

- ✅ **Còn hạn** (ví dụ 10/12 tháng) → chuyển xử lý
- ❌ **Hết hạn** → thông báo, hỏi khách có sửa tính phí không

### Bước 4: Assign kỹ thuật

Chọn **kỹ thuật viên** xử lý + **xưởng / trung tâm BH** (nếu gửi đi).

### Bước 5: Theo dõi

Trạng thái:

```
TIẾP NHẬN → CHẨN ĐOÁN → ĐANG SỬA → CHỜ LINH KIỆN → HOÀN TẤT → ĐÃ TRẢ KHÁCH
```

Mỗi bước có **timestamp + người thực hiện** — audit đầy đủ.

⚠️ **Chú ý**: In **biên nhận bảo hành** khi tiếp nhận để khách cầm về.

---

## 9. Tracking warranty theo serial

### 9.1. Quản lý serial

Mỗi sản phẩm (nếu bật serial tracking) có **unique serial** ghi nhận lúc nhập kho.

Sidebar → **Kho → Serial** (`/product_serial`) để xem:

- Danh sách serial
- Trạng thái: IN_STOCK / SOLD / IN_REPAIR / RETURNED / SCRAPPED
- Khách đã mua (nếu SOLD)
- Lịch sử di chuyển (nhập kho → bán → sửa BH → trả lại)

### 9.2. Tra cứu nhanh

Ô tìm kiếm Ctrl+K → gõ serial → hệ thống nhảy tới trang chi tiết serial.

Tiện cho CSKH khi khách gọi đến đọc serial.

💡 **Mẹo**: Chụp ảnh hộp có serial **ngay khi nhập kho** — backup khi label rách.

---

## 10. Thu thập feedback

Ngoài khảo sát NPS (xem Part 09), bạn có thể thu feedback qua nhiều channel:

### 10.1. Feedback form trong email bill

Khi gửi bill email, kèm link **"Chấm điểm trải nghiệm"** → mở form 3 câu hỏi nhanh.

### 10.2. QR code tại quầy

In QR ở bàn thu ngân → khách quét → form feedback mobile-friendly.

### 10.3. Import từ Google Review

Sidebar → **CSKH → Feedback → Google Review Import**. Connect Google My Business → review tự pull về CRM.

### 10.4. Xem tổng hợp

Trang **Feedback** hiển thị:

- Điểm trung bình
- Timeline các feedback
- Filter theo kênh, điểm, keyword
- **Wordcloud** các từ hay xuất hiện
- **Sentiment analysis** (AI) — tự phân loại Positive / Negative / Neutral

### 10.5. Phản hồi feedback

Click vào 1 feedback → nhấn **[Phản hồi]** → gửi cảm ơn / xin lỗi qua kênh gốc.

Feedback tiêu cực → option **[Tạo ticket từ feedback]** để follow-up chi tiết.

---

## FAQ

**1. Điểm của khách bị sai — làm sao chỉnh tay?**
Vào chi tiết khách → tab Loyalty → nhấn **[Chỉnh điểm thủ công]** (cần quyền). Nhập +/- điểm + lý do. Bút toán ADJUST lưu vào ledger.

**2. Khách đòi "cộng lại điểm đơn hôm qua" vì tôi quên chọn customer?**
Có 2 cách: (a) Tại chi tiết đơn → Link khách → điểm tự tính lại; (b) Chỉnh điểm tay như câu 1.

**3. Ticket bị quá SLA có penalty gì không?**
Không phạt, nhưng **manager sẽ thấy** trong báo cáo SLA. Tỷ lệ on-time ảnh hưởng KPI team.

**4. Bảo hành đổi máy mới — cần tạo đơn không?**
Có — tạo **đơn đổi (exchange order)** giá 0đ, đồng thời update serial cũ sang SCRAPPED và serial mới sang SOLD.

**5. Tôi muốn gửi card chúc mừng sinh nhật kèm voucher — có không?**
Có — tạo **automation flow** trigger `customer.birthday_today` → send ZNS + voucher (xem Part 09 mục 8).

**6. Khách không nhận được điểm dù đã mua?**
Check: (a) Đơn có gắn customer chưa; (b) SP có bị loại trừ tích điểm không; (c) Config tỷ lệ có đúng không. Ledger sẽ cho biết vì sao.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "Không đủ điểm đổi quà" | Balance < required | Check ledger |
| "Serial không tìm thấy" | Nhập sai / chưa register | Gõ lại, hoặc tra trong kho |
| "Ticket không assign được" | Không có CSKH online | Gán tay cho người cụ thể |
| "Warranty hết hạn" | Quá thời gian BH | Inform khách, chuyển sang sửa có phí |
| "Khách pin hạng nhưng xuống hạng" | Pin setting bị tắt | Bật lại pin trong profile khách |

---

*Hết Part 10. Xem tiếp [Part 11 — Báo cáo & Phân tích](part-11-bao-cao.md).*
