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
- [11. Cấu hình hạn sử dụng điểm](#11-cấu-hình-hạn-sử-dụng-điểm)
- [12. Cấu hình thăng/hạ hạng tự động](#12-cấu-hình-thănghạ-hạng-tự-động)
- [13. Phạm vi áp dụng Loyalty](#13-phạm-vi-áp-dụng-loyalty)
- [14. Thẻ hội viên ảo (barcode)](#14-thẻ-hội-viên-ảo-barcode)
- [15. Import hội viên từ CSV](#15-import-hội-viên-từ-csv)
- [16. Chế độ hiển thị](#16-chế-độ-hiển-thị)
- [17. Tích hợp hệ thống bên ngoài (API)](#17-tích-hợp-hệ-thống-bên-ngoài-api)
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

## 11. Cấu hình hạn sử dụng điểm

Sidebar → **Loyalty → Cấu hình Loyalty** → tab **Hạn sử dụng điểm** (`/loyalty_config?tab=point_expiry`).

Điểm thưởng nên có hạn để khuyến khích khách quay lại mua sắm. Tab này cho phép cấu hình chi tiết hơn so với toggle Expire cơ bản ở mục 5.

### 11.1. Chọn chính sách hạn sử dụng

| Chính sách | Mô tả | Phù hợp khi |
|---|---|---|
| **Không hết hạn** | Điểm giữ mãi | Chuỗi mới launch loyalty, chưa muốn gây phản cảm |
| **Sliding (Trượt)** | Mỗi lô điểm hết hạn sau X tháng kể từ ngày tích | Siêu thị lớn, khách mua thường xuyên |
| **Fixed (Cố định)** | Toàn bộ điểm reset vào ngày cố định hàng năm (VD: 31/12) | Chuỗi muốn "mùa đốt điểm" cuối năm |
| **Hybrid** | Sliding + tự động gia hạn nếu khách có giao dịch trong kỳ | Cân bằng giữa giữ chân và kiểm soát nợ điểm |

### 11.2. Điền thông số

- **Thời hạn (tháng)**: áp dụng cho Sliding/Hybrid — VD: 12 tháng.
- **Ngày reset**: áp dụng cho Fixed — VD: 31/12 hàng năm.
- **Gia hạn khi có giao dịch**: bật/tắt (Hybrid) — nếu khách mua hàng trong kỳ, điểm cũ được gia hạn thêm X tháng.
- **Ngưỡng điểm tối thiểu để expire**: VD 10 điểm — điểm lẻ dưới ngưỡng tự expire, tránh tồn điểm rác.

### 11.3. Cảnh báo trước khi hết hạn

Cấu hình gửi thông báo nhắc nhở trước khi điểm expire:

- **30 ngày trước**: thông báo đầu tiên (SMS / Zalo / Push)
- **14 ngày trước**: nhắc lần 2
- **7 ngày trước**: cảnh báo cuối

Mẫu tin nhắn có thể tuỳ chỉnh — sử dụng biến `{ten_khach}`, `{so_diem}`, `{ngay_het_han}`.

### 11.4. Xem trước tác động

Nhấn **[Xem trước]** trước khi lưu — hệ thống hiển thị:

- Số hội viên bị ảnh hưởng
- Tổng điểm sẽ expire trong 30/60/90 ngày tới
- Biểu đồ phân bổ điểm theo thời gian tích

⚠️ **Chú ý**: Thay đổi chính sách expire **chỉ áp dụng cho điểm tích mới** sau thời điểm lưu. Điểm đã tích trước đó giữ nguyên chính sách cũ, trừ khi bạn tick **[Áp dụng hồi tố]** (cần xác nhận 2 lần).

🔒 **Quyền**: `loyalty.config.edit` — Tenant Admin.

---

## 12. Cấu hình thăng/hạ hạng tự động

Sidebar → **Loyalty → Cấu hình Loyalty** → tab **Thăng/hạ hạng tự động** (`/loyalty_config?tab=tier_eval`).

Thay vì chỉ chạy job đêm cố định (mục 2.4), tab này cho phép cấu hình linh hoạt hơn cho chuỗi siêu thị nhiều chi nhánh.

### 12.1. Chu kỳ đánh giá

- **Thời gian đánh giá**: Hàng tháng / Hàng quý / Hàng năm / Tuỳ chỉnh
- **Ngày chạy**: VD ngày 1 hàng tháng, hoặc 01/01, 01/04, 01/07, 01/10 (hàng quý)
- **Cửa sổ dữ liệu**: rolling 365 ngày / năm dương lịch / 6 tháng gần nhất

### 12.2. Tiêu chí thăng hạng

Cấu hình bảng điều kiện cho từng hạng:

| Trường | Mô tả |
|---|---|
| **Tổng chi tiêu** | Tổng giá trị đơn hàng trong cửa sổ dữ liệu |
| **Số lần mua** | Tần suất giao dịch (VD: ≥ 12 lần/năm) |
| **Điểm tích luỹ** | Tổng điểm đã tích (chưa trừ redeem) |
| **Toán tử kết hợp** | VÀ (tất cả điều kiện) / HOẶC (ít nhất 1 điều kiện) |

### 12.3. Tiêu chí hạ hạng & bảo vệ

- **Ngưỡng giữ hạng**: chi tiêu / số đơn tối thiểu để không bị hạ. VD: Gold cần ≥ 10tr/năm để giữ.
- **Grace period**: cho phép khách thêm X tháng trước khi thực sự hạ hạng (VD: 3 tháng ân hạn).
- **Hạ tối đa**: chỉ hạ 1 bậc mỗi chu kỳ (tránh khách từ Diamond rớt thẳng Basic).
- **Pin hạng**: danh sách khách VIP được pin — không bao giờ hạ dù không mua.

### 12.4. Thông báo khi thay đổi hạng

| Sự kiện | Hành động mặc định |
|---|---|
| **Thăng hạng** | Gửi Zalo/SMS chúc mừng + voucher kèm theo (tuỳ chỉnh) |
| **Sắp hạ hạng** (trước 30 ngày) | Nhắc nhở "Bạn cần mua thêm X để giữ hạng Y" |
| **Hạ hạng** | Thông báo hạng mới + quyền lợi còn lại |

Mẫu tin nhắn tuỳ chỉnh được — sử dụng biến `{ten_khach}`, `{hang_cu}`, `{hang_moi}`, `{quyen_loi}`.

### 12.5. Chạy thủ công

Nhấn **[Chạy đánh giá ngay]** để trigger job đánh giá ngoài lịch. Hệ thống hiển thị preview danh sách thay đổi trước khi xác nhận.

💡 **Mẹo**: Sau dịp lễ lớn (Tết, Black Friday), chạy thủ công để cập nhật hạng kịp thời — khách vui khi được thăng hạng ngay.

🔒 **Quyền**: `loyalty.config.edit` — Tenant Admin.

---

## 13. Phạm vi áp dụng Loyalty

Sidebar → **Loyalty → Cấu hình Loyalty** → tab **Phạm vi áp dụng** (`/loyalty_config?tab=scope`).

Chuỗi siêu thị có nhiều thương hiệu con hoặc nhiều cụm cửa hàng — tab này cho phép quyết định Loyalty chạy ở phạm vi nào.

### 13.1. Các chế độ phạm vi

| Chế độ | Mô tả | Khi nào dùng |
|---|---|---|
| **Toàn chuỗi** | 1 chương trình Loyalty duy nhất, điểm dùng chung tất cả chi nhánh + thương hiệu | Chuỗi 1 brand, muốn đơn giản |
| **Theo thương hiệu (Brand)** | Mỗi brand có chương trình riêng (công thức, hạng, catalog đổi quà) | Tập đoàn có nhiều brand khác nhau (VD: siêu thị + cửa hàng tiện lợi) |
| **Theo cụm cửa hàng (Store Group)** | Nhóm các cửa hàng thành cụm, mỗi cụm có Loyalty riêng | Chuỗi nhượng quyền, mỗi vùng có chính sách khác nhau |

### 13.2. Cấu hình

1. Chọn **chế độ phạm vi** từ dropdown.
2. Nếu chọn **Theo Brand** hoặc **Theo Store Group** → bảng bên dưới hiển thị danh sách brand/nhóm.
3. Click vào từng brand/nhóm để cấu hình riêng:
   - Công thức tích điểm
   - Bảng hạng thẻ
   - Catalog đổi quà
   - Chính sách expire

### 13.3. Chuyển đổi điểm giữa các phạm vi

Khi chế độ **Theo Brand**, có thể bật **Cross-brand redemption**:

- **Tắt**: điểm tích ở brand A chỉ dùng được ở brand A.
- **Bật**: điểm dùng chung, nhưng tỷ lệ quy đổi có thể khác (VD: 1 điểm brand A = 0.8 điểm brand B).

Cấu hình tỷ lệ quy đổi tại bảng **Ma trận chuyển đổi** bên dưới.

⚠️ **Chú ý**: Chuyển từ **Toàn chuỗi** sang **Theo Brand** là thao tác **không thể hoàn tác** dễ dàng. Hệ thống yêu cầu:
1. Chọn brand mặc định nhận toàn bộ điểm hiện tại.
2. Xác nhận 2 lần.
3. Lưu audit log.

💡 **Mẹo**: Nếu mới bắt đầu, chọn **Toàn chuỗi** cho đơn giản. Chỉ tách khi có nhu cầu kinh doanh rõ ràng.

🔒 **Quyền**: `loyalty.config.edit` — Tenant Admin.

---

## 14. Thẻ hội viên ảo (barcode)

Sidebar → **Loyalty → Hội viên** (`/loyalty_member`).

Mỗi hội viên được cấp **thẻ ảo** dạng barcode/QR — dùng để quét tại POS thay vì tìm tên/SĐT.

### 14.1. Cấp thẻ tự động

Khi khách được thêm vào chương trình Loyalty, hệ thống tự sinh:

- **Mã thẻ**: chuỗi số duy nhất (VD: `8936001234567`)
- **Barcode**: Code-128 hoặc EAN-13 (tuỳ cấu hình)
- **QR code**: chứa mã thẻ + link trang hội viên

### 14.2. Hiển thị thẻ

Khách xem thẻ qua:

- **Zalo Mini App / WebApp**: mở app → mục "Thẻ hội viên" → hiển thị barcode + tên + hạng + điểm.
- **Email**: gửi thẻ dạng ảnh kèm email chào mừng.
- **In thẻ nhựa** (tuỳ chọn): xuất file PDF barcode → gửi nhà in.

### 14.3. Quét thẻ tại POS

Tại màn hình POS:

1. Nhấn ô **Khách hàng** hoặc phím tắt `F4`.
2. Dùng máy quét barcode quét thẻ hội viên.
3. Hệ thống tự điền khách → hiển thị hạng + điểm + ưu đãi áp dụng.

Nếu không có máy quét → nhập tay mã thẻ vào ô tìm kiếm.

### 14.4. Cấu hình định dạng barcode

Sidebar → **Loyalty → Cấu hình Loyalty** → tab **Chế độ hiển thị** → mục **Thẻ hội viên**:

- **Loại barcode**: Code-128 / EAN-13 / QR
- **Prefix mã thẻ**: VD `893600` (theo mã quốc gia hoặc mã riêng chuỗi)
- **Độ dài**: 10 / 13 / 16 ký tự
- **Hiển thị trên thẻ**: Tên khách, hạng, điểm, ngày hết hạn

💡 **Mẹo**: Dùng **EAN-13** nếu POS đã có máy quét barcode sản phẩm — máy quét hoạt động luôn, không cần cấu hình thêm.

⚠️ **Chú ý**: Mã thẻ một khi đã cấp **không thể đổi** — nếu cần huỷ thẻ cũ, tạo thẻ mới cho khách.

---

## 15. Import hội viên từ CSV

Sidebar → **Loyalty → Hội viên** (`/loyalty_member`) → **[Import CSV]**.

Dùng khi chuỗi siêu thị đã có dữ liệu hội viên từ hệ thống POS cũ và muốn chuyển sang CRM.

### 15.1. Tải file mẫu

Nhấn **[Tải file mẫu]** — file CSV mẫu gồm các cột:

| Cột | Bắt buộc | Mô tả |
|---|---|---|
| `ho_ten` | ✅ | Họ tên hội viên |
| `so_dien_thoai` | ✅ | SĐT (dùng để match khách hiện có) |
| `email` | | Email |
| `ngay_sinh` | | Ngày sinh (DD/MM/YYYY) |
| `gioi_tinh` | | Nam / Nữ / Khác |
| `hang_the` | | Tên hạng (Basic / Silver / Gold / Diamond) — để trống = Basic |
| `diem_hien_tai` | | Số điểm mang sang — để trống = 0 |
| `ngay_tham_gia` | | Ngày tham gia chương trình cũ (DD/MM/YYYY) |
| `ma_the_cu` | | Mã thẻ cũ (để đối chiếu) |
| `chi_nhanh` | | Tên hoặc mã chi nhánh gắn khách |

### 15.2. Upload và kiểm tra

1. Chọn file CSV (UTF-8, tối đa 50.000 dòng).
2. Hệ thống đọc file → hiển thị bảng **preview 10 dòng đầu**.
3. Map cột: nếu tên cột khác file mẫu → kéo thả để map đúng trường.
4. Nhấn **[Kiểm tra dữ liệu]** → hệ thống validate:
   - SĐT trùng khách hiện có → **merge** (cập nhật, không tạo mới)
   - SĐT không hợp lệ → đánh dấu lỗi
   - Hạng thẻ không tồn tại → đánh dấu lỗi
   - Điểm âm → đánh dấu lỗi

### 15.3. Xác nhận import

Sau khi validate, hiển thị tổng kết:

- ✅ Hợp lệ: X dòng (tạo mới: Y, cập nhật: Z)
- ❌ Lỗi: N dòng — nhấn **[Tải file lỗi]** để xem chi tiết + sửa + import lại.

Nhấn **[Xác nhận import]** → hệ thống xử lý nền (background job). Khi xong → thông báo trên giao diện + email kết quả.

### 15.4. Sau khi import

- Kiểm tra tại danh sách **Hội viên** — filter theo ngày import.
- Mỗi hội viên import có ghi chú `Nguồn: CSV Import [ngày]` trong lịch sử.
- Điểm mang sang được ghi nhận dạng bút toán **MIGRATE** trong ledger.

⚠️ **Chú ý**: Import **không gửi thông báo** cho khách. Nếu muốn gửi SMS/Zalo chào mừng, tạo **campaign** riêng sau khi import xong (xem Part 09).

💡 **Mẹo**: Import thử 10 dòng trước để kiểm tra mapping đúng, sau đó mới import toàn bộ.

🔒 **Quyền**: `loyalty.member.import` — Tenant Admin, Store Manager.

---

## 16. Chế độ hiển thị

Sidebar → **Loyalty → Cấu hình Loyalty** → tab **Chế độ hiển thị** (`/loyalty_config?tab=display_mode`).

Không phải tenant nào cũng cần toàn bộ tính năng CRM. Tab này cho phép bật/tắt các module theo nhu cầu.

### 16.1. Hai chế độ chính

| Chế độ | Hiển thị | Phù hợp khi |
|---|---|---|
| **Loyalty thuần** | Chỉ hiện menu Loyalty (Hội viên, Sổ điểm, Khuyến mãi, Cấu hình) — ẩn CSKH, Ticket, Bảo hành | Siêu thị chỉ cần tích điểm + đổi quà, chưa cần helpdesk |
| **Đầy đủ** | Hiện tất cả menu: Loyalty + CSKH + Ticket + Bảo hành + Feedback | Chuỗi đã có team CSKH, cần quản lý ticket + bảo hành |

### 16.2. Bật/tắt từng module

Ngoài 2 chế độ preset, bạn có thể bật/tắt riêng từng module:

| Module | Mặc định (Đầy đủ) | Mô tả |
|---|---|---|
| **Dashboard Loyalty** | ✅ Bật | KPI tiles + biểu đồ phân bổ hạng |
| **Hội viên** | ✅ Bật | Danh sách + chi tiết hội viên |
| **Sổ điểm** | ✅ Bật | Loyalty ledger toàn hệ thống |
| **Khuyến mãi** | ✅ Bật | Catalog đổi quà + chương trình KM |
| **Ticket hỗ trợ** | ✅ Bật | Helpdesk CSKH |
| **Bảo hành** | ✅ Bật | Warranty tracking |
| **Feedback** | ✅ Bật | Thu thập + phân tích feedback |
| **Tích hợp & API** | ❌ Tắt | Trang quản lý API key + webhook (bật khi cần kết nối POS ngoài) |

Toggle bật/tắt → sidebar tự ẩn/hiện menu tương ứng. Không ảnh hưởng dữ liệu — tắt module chỉ ẩn giao diện, dữ liệu vẫn còn.

### 16.3. Tuỳ chỉnh Dashboard Loyalty

Khi module Dashboard bật, trang `/loyalty_dashboard` hiển thị:

- **KPI tiles**: Tổng hội viên | Active 30 ngày | Điểm đang lưu hành | Điểm đã đổi
- **Donut chart**: Phân bổ hội viên theo hạng (Basic / Silver / Gold / Diamond)
- **Quick actions**: Tạo hội viên, Import CSV, Chạy đánh giá hạng, Xem báo cáo

Kéo thả để sắp xếp lại vị trí các widget trên dashboard.

💡 **Mẹo**: Bắt đầu với **Loyalty thuần** — khi team CSKH sẵn sàng thì bật thêm Ticket + Bảo hành sau.

🔒 **Quyền**: `loyalty.config.edit` — Tenant Admin.

---

## 17. Tích hợp hệ thống bên ngoài (API)

Sidebar → **Loyalty → Tích hợp & API** (`/loyalty_integration`).

Dành cho chuỗi siêu thị đã có hệ thống POS riêng (VD: POS của Sapo, KiotViet, hệ thống tự phát triển) và muốn kết nối Loyalty qua API.

### 17.1. Quản lý API Key

Nhấn **[+ Tạo API Key]**:

- **Tên key**: mô tả mục đích (VD: "POS chi nhánh Quận 7")
- **Quyền**: chọn scope — `member:read`, `member:write`, `point:earn`, `point:redeem`, `tier:read`
- **IP whitelist** (tuỳ chọn): giới hạn IP được gọi API

Hệ thống sinh **API Key** + **Secret** — hiển thị 1 lần duy nhất, copy lưu lại.

⚠️ **Chú ý**: Secret **chỉ hiển thị khi tạo**. Nếu mất → phải tạo key mới.

### 17.2. Các API endpoint chính

| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/v1/loyalty/members` | GET | Danh sách hội viên (phân trang) |
| `/api/v1/loyalty/members/{id}` | GET | Chi tiết hội viên + điểm + hạng |
| `/api/v1/loyalty/members` | POST | Tạo / đăng ký hội viên mới |
| `/api/v1/loyalty/points/earn` | POST | Tích điểm cho hội viên (gửi kèm mã đơn, số tiền) |
| `/api/v1/loyalty/points/redeem` | POST | Đổi / trừ điểm |
| `/api/v1/loyalty/points/balance/{member_id}` | GET | Xem số dư điểm |
| `/api/v1/loyalty/tiers` | GET | Danh sách hạng thẻ + điều kiện |
| `/api/v1/loyalty/transactions` | GET | Lịch sử giao dịch điểm |

Tài liệu API đầy đủ (Swagger) tại: **Tích hợp & API → tab [Tài liệu API]** hoặc truy cập `/api/docs/loyalty`.

### 17.3. Webhook

Cấu hình webhook để nhận thông báo realtime khi có sự kiện:

Nhấn **[+ Thêm Webhook]**:

- **URL nhận**: endpoint phía hệ thống bạn (HTTPS bắt buộc)
- **Sự kiện đăng ký**:
  - `member.created` — hội viên mới
  - `member.tier_changed` — thay đổi hạng
  - `points.earned` — tích điểm
  - `points.redeemed` — đổi/trừ điểm
  - `points.expired` — điểm hết hạn
- **Secret key**: dùng để verify signature (HMAC-SHA256)

Mỗi webhook call gửi kèm header `X-Signature` — hệ thống nhận cần verify để đảm bảo request đến từ CRM.

### 17.4. Test kết nối

Nhấn **[Gửi test]** cạnh mỗi webhook → hệ thống gửi 1 request mẫu. Kiểm tra:

- ✅ Response 200 → OK
- ❌ Timeout / 4xx / 5xx → kiểm tra URL, firewall, auth

### 17.5. Log API

Tab **Log** hiển thị lịch sử các API call + webhook delivery:

- Timestamp
- Endpoint / Event
- Request body (ẩn sensitive)
- Response status
- Thời gian xử lý

Filter theo ngày, status, endpoint để debug khi gặp lỗi.

💡 **Mẹo**: Bật **retry tự động** cho webhook — nếu endpoint trả lỗi, hệ thống retry 3 lần (sau 1 phút, 5 phút, 30 phút).

⚠️ **Chú ý**: API key có rate limit **1.000 request/phút** mặc định. Nếu chuỗi lớn cần nâng limit → liên hệ admin hệ thống.

🔒 **Quyền**: `loyalty.integration.manage` — Tenant Admin.

> 🖼️ *Ảnh minh hoạ: Trang Tích hợp & API với danh sách key + webhook — chụp sau*

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
