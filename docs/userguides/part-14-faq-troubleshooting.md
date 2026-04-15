# Part 14 — FAQ & Xử lý sự cố

> **Dành cho**: Tất cả người dùng
> **Mức độ**: Cơ bản → Tra cứu
> **Tham chiếu URD**: Toàn bộ

Part này là **kho tổng hợp** các câu hỏi thường gặp và cách xử lý nhanh sự cố phổ biến. Hãy **tìm ở đây trước** khi gọi support — 80% vấn đề có thể tự giải quyết.

## Mục lục
- [1. FAQ tổng hợp](#1-faq-tổng-hợp)
- [2. Troubleshooting chi tiết](#2-troubleshooting-chi-tiết)
- [3. Liên hệ support](#3-liên-hệ-support)
- [4. Checklist trước khi gọi support](#4-checklist-trước-khi-gọi-support)
- [5. Các lỗi hệ thống phổ biến](#5-các-lỗi-hệ-thống-phổ-biến)
- [6. Phím tắt toàn hệ thống](#6-phím-tắt-toàn-hệ-thống)
- [7. Glossary thuật ngữ](#7-glossary-thuật-ngữ)

---

## 1. FAQ tổng hợp

### Q1. Tôi quên mật khẩu — làm sao lấy lại?

1. Tại trang login, nhấn **[Quên mật khẩu]**.
2. Nhập **SĐT** hoặc **email** đã đăng ký.
3. Nhận **OTP** qua SMS/email (có hiệu lực 5 phút).
4. Nhập OTP → đặt **mật khẩu mới** (≥ 8 ký tự, có hoa, thường, số).
5. Login lại bằng mật khẩu mới.

Nếu không nhận được OTP → check spam email, tín hiệu sim. Sau 5 phút không có → nhấn **[Gửi lại]**.

⚠️ Nếu vẫn không được → liên hệ Tenant Admin để **reset thủ công**.

### Q2. Tôi login nhưng không thấy menu nào đó (POS, Kho, Báo cáo...)

Nguyên nhân có thể:

1. **Role không có quyền** — liên hệ Quản lý để cấp permission.
2. **Sai vai trò đang chọn** — click Avatar → **Đổi vai trò** → chọn role đúng.
3. **Sai cơ sở** — chọn lại cơ sở ở header.
4. **Menu bị thu gọn** — click icon ☰ ở header.
5. **Cache trình duyệt cũ** — `Ctrl+Shift+R` để reload cứng.

### Q3. Máy in hoá đơn không in — phải làm sao?

1. **Kiểm tra giấy** — còn đủ, lắp đúng chiều.
2. **Kiểm tra nguồn + USB** — đèn nguồn sáng, cáp cắm chặt.
3. **Test Feed** — nhấn nút Feed trên máy in. Nếu không ra giấy → lỗi phần cứng máy in.
4. **Test in mẫu** — vào chi tiết đơn cũ → **In lại bill**.
5. **Driver/Cài đặt OS** — check Windows/Mac "Printers & scanners" → máy in có hiện không. Nếu không → cài lại driver.
6. **Đổi máy in mặc định** — Cài đặt → In ấn.
7. **Reboot máy in + máy tính** — 80% trường hợp fix được.

### Q4. POS chậm / treo — cách xử lý?

1. **F5 reload** trang POS — thường fix được.
2. **Đóng tab không dùng** — nhiều tab Chrome tốn RAM.
3. **Clear cache** — `Ctrl+Shift+Delete` → chọn "Cached images and files".
4. **Restart trình duyệt** hoặc restart máy.
5. **Check network** — speedtest nếu nghi mạng chậm.
6. **Check số lượng item trong giỏ** — nếu > 100 item, có thể chậm. Chia thành 2 đơn.
7. Vẫn không fix → liên hệ support kèm screenshot + thời điểm.

### Q5. Đơn hàng từ Shopee không đồng bộ về CRM?

1. **Check sync status** tại **Cài đặt → Tích hợp → Shopee** — token còn hiệu lực không.
2. **Reconnect** nếu token hết hạn.
3. **Trigger sync thủ công** — nhấn **[Sync ngay]**.
4. **Check Shopee Partner Center** — có đơn mới không thật sự.
5. Đợi 5 phút — sync thường có delay nhẹ.
6. Nếu vẫn thiếu → xem **Sync log** → lỗi cụ thể → báo support.

### Q6. Khách không nhận được SMS khuyến mãi?

1. **Check danh sách sent** — campaign đã gửi đến khách đó chưa.
2. **Check SĐT** — đúng 10 số, đúng nhà mạng Việt Nam.
3. **Check quota SMS** — còn credit không, Cài đặt → Tích hợp → SMS.
4. **Check brand name** — đã được nhà mạng duyệt chưa.
5. **Check thời gian gửi** — ngoài 22-5h có thể bị block.
6. **Check opt-out** — khách có từng reply "TU CHOI" chưa.
7. Gửi **test đến SĐT của bạn** — nhận được không.

### Q7. Báo cáo hiển thị số sai — tại sao?

1. **Check filter** — kỳ, cơ sở, trạng thái đơn đang filter gì.
2. **Check múi giờ** — report dùng UTC hay VN?
3. **Check công thức tính** — Gross vs Net, có gồm VAT không, có gồm đơn cancelled không.
4. **Check data delay** — data warehouse có thể delay 15 phút.
5. So sánh với **báo cáo khác** — nếu chỉ 1 báo cáo sai → có thể là bug.
6. **Hard refresh** báo cáo — icon refresh ở góc phải.

### Q8. Hoá đơn VAT phát hành lỗi?

1. **Check provider status** — VNPT/M-Invoice/Viettel có hoạt động không, có maintenance?
2. **Check credentials** — MST, mẫu số, ký hiệu đúng không.
3. **Check quota** — còn số hoá đơn trong dải không.
4. **Check data buyer** — MST người mua đúng format 10 hoặc 13 số.
5. **Retry** — nhiều trường hợp lỗi tạm thời, retry là xong.
6. Vẫn lỗi → liên hệ hotline VNPT/M-Invoice kèm **mã tra cứu lỗi**.

### Q9. Chuyển kho không thành công?

1. **Check quyền** — role có `inventory.transfer` không.
2. **Check tồn nguồn** — kho xuất đủ SL không.
3. **Check trạng thái SP** — có SP nào bị lock không.
4. **Check serial** — nếu SP có serial tracking, serial phải có ở kho nguồn.
5. **Check đang có PO pending** — một số SP bị reserved.
6. Đọc error message cụ thể trong lịch sử phiếu.

### Q10. Không đóng được ca?

1. **Còn đơn pending** — phải hoàn tất hoặc cancel trước.
2. **Chưa kiểm kê tiền** — nhập số liệu kiểm kê.
3. **Chênh lệch > 5% không có lý do** — bắt buộc nhập lý do.
4. **Có ticket mở chưa assign** — hoàn tất assign.
5. **Quyền** — chỉ cashier mở ca hoặc manager mới đóng được.

Nếu tất cả OK mà vẫn không đóng → nhờ **Manager force close** (cần lý do).

---

## 2. Troubleshooting chi tiết

### 2.1. Không login được

**Triệu chứng**: Nhập đúng tài khoản/mật khẩu nhưng báo sai.

**Checklist**:
- [ ] Caps Lock tắt?
- [ ] SĐT/email đúng chính tả?
- [ ] Tài khoản có bị **disable** (liên hệ Admin check)?
- [ ] Mật khẩu đã đổi gần đây? (Session cũ bị logout)
- [ ] Trình duyệt có block cookie không?
- [ ] Thử **private/incognito mode**.
- [ ] Thử **trình duyệt khác** (Chrome/Edge).

### 2.2. Sync marketplace fail

**Triệu chứng**: Đơn Shopee/Lazada không vào CRM.

**Checklist**:
- [ ] Token còn hiệu lực (chưa expired)?
- [ ] API quota còn đủ?
- [ ] Product đã map đúng với SP CRM?
- [ ] Có webhook nào bị lỗi (xem **Cài đặt → Webhook log**)?
- [ ] Marketplace có downtime không (xem status page)?

**Fix nhanh**: **[Re-sync 24h qua]** trong trang integration.

### 2.3. QR thanh toán không nhận tiền

**Triệu chứng**: Khách quét, chuyển tiền nhưng POS không nhận được.

**Checklist**:
- [ ] QR chưa hết hạn (5 phút)?
- [ ] Webhook từ bank đã setup chưa?
- [ ] Nội dung chuyển khoản có mã đơn không?
- [ ] Check app bank → tiền đã về chưa?
- [ ] Vào **Tài chính → Đối soát → Unmatched** → có dòng không?

**Fix**: Nếu tiền đã về bank nhưng POS không ghi → vào đối soát **match thủ công** với đơn.

### 2.4. Báo cáo không load

- [ ] Filter quá rộng (> 2 năm)?
- [ ] Data volume lớn → chờ 30s.
- [ ] Role có quyền xem report đó?
- [ ] Check console browser (F12) có lỗi JS không?
- [ ] Thử export PDF/Excel thay vì view trên web.

### 2.5. Popup/modal không mở

- [ ] Browser có block popup không?
- [ ] Zoom trình duyệt 100%?
- [ ] Extension (AdBlock) có can thiệp?
- [ ] Thử Incognito mode.

---

## 3. Liên hệ support

### 3.1. Kênh support

| Kênh | Dùng khi | Giờ phản hồi |
|---|---|---|
| **In-app chat** (góc dưới phải) | Hỏi đáp nhanh | Giờ hành chính |
| **Hotline** | Khẩn cấp (POS die, không bán được) | 24/7 nếu gói Enterprise |
| **Email** `support@reborn.vn` | Vấn đề không khẩn | Trong 4h giờ hành chính |
| **Ticket portal** | Báo bug, request feature | Trong 1 ngày làm việc |
| **Zalo OA "Reborn Support"** | Tiện lợi | Giờ hành chính |

### 3.2. Trang status

Truy cập [status.reborn.vn](https://status.reborn.vn) để xem:

- Dịch vụ nào đang up/down
- Incident đang xử lý
- Lịch bảo trì sắp tới

Nếu sự cố là **system-wide** → trang status sẽ có cảnh báo → bạn không cần gọi support, chỉ cần chờ.

### 3.3. Priority level

| Mức | Định nghĩa | Response time (Enterprise) |
|---|---|---|
| **P1 — Critical** | Không bán hàng được, toàn tenant down | 15 phút |
| **P2 — High** | 1 chức năng chính lỗi (POS slow...) | 1 giờ |
| **P3 — Medium** | Tính năng phụ lỗi | 4 giờ |
| **P4 — Low** | Câu hỏi, request | 1 ngày |

---

## 4. Checklist trước khi gọi support

Chuẩn bị sẵn để support xử lý nhanh — tránh hỏi đi hỏi lại:

### Thông tin cần thiết

- [ ] **Tenant code** (hiển thị ở góc trên trái, dạng `reborn-xxxxx`)
- [ ] **Username** của bạn
- [ ] **Role** đang dùng
- [ ] **Cơ sở** đang làm việc
- [ ] **Thời điểm** xảy ra sự cố (chính xác đến phút)
- [ ] **Đơn hàng / khách / mã liên quan** (nếu có)
- [ ] **Browser + OS** (ví dụ "Chrome 122 trên Windows 11")
- [ ] **Screenshot** hoặc **video** màn hình lỗi
- [ ] **Error message đầy đủ** (copy paste, không tóm tắt)
- [ ] **Các bước để tái hiện** lỗi
- [ ] **Đã thử fix gì** (F5, clear cache...)

### Mô tả đúng cách

❌ **Sai**: "POS bị lỗi, làm sao giờ?"

✅ **Đúng**: "Lúc 14:32 hôm nay (15/04/2026), cashier Nguyễn A tại cơ sở HN01 bấm [Thanh toán QR] cho đơn #SO-20260415-0123, modal QR hiện nhưng không sinh mã. Chrome 122/Win 11. Đã thử F5 2 lần. Screenshot đính kèm."

💡 **Mẹo**: Mô tả chi tiết → fix trong 10 phút. Mô tả mơ hồ → có thể mất cả ngày.

---

## 5. Các lỗi hệ thống phổ biến

### 5.1. `401 Unauthorized`

**Ý nghĩa**: Phiên đăng nhập hết hạn hoặc không có quyền.

**Fix**: Logout → login lại. Nếu vẫn lỗi → check permission.

### 5.2. `403 Forbidden`

**Ý nghĩa**: Role không có quyền truy cập tài nguyên.

**Fix**: Liên hệ Admin để cấp quyền.

### 5.3. `404 Not Found`

**Ý nghĩa**: Đường dẫn không tồn tại, hoặc record đã bị xoá.

**Fix**: Check URL, quay lại danh sách.

### 5.4. `500 Internal Server Error`

**Ý nghĩa**: Lỗi phía server.

**Fix**: Đợi 1 phút rồi thử lại. Nếu lặp → báo support.

### 5.5. `502 Bad Gateway` / `504 Gateway Timeout`

**Ý nghĩa**: Dịch vụ backend tạm thời không reach.

**Fix**: Chờ 1-5 phút, refresh. Check trang status.

### 5.6. `409 Conflict`

**Ý nghĩa**: Conflict data (ví dụ 2 người cùng sửa 1 đơn).

**Fix**: Reload trang, làm lại thao tác.

### 5.7. `422 Validation Error`

**Ý nghĩa**: Data nhập sai format.

**Fix**: Đọc message chi tiết → sửa field.

### 5.8. `Network Error` / `ERR_CONNECTION_REFUSED`

**Ý nghĩa**: Không kết nối được server.

**Fix**: Check mạng, check firewall, thử mạng khác (4G).

### 5.9. `Token expired`

**Ý nghĩa**: JWT token hết hạn.

**Fix**: Logout → login lại.

### 5.10. `Rate limit exceeded`

**Ý nghĩa**: Gọi API quá nhanh/nhiều.

**Fix**: Chờ 1 phút. Nếu lặp lại, có thể extension/script gây ra.

---

## 6. Phím tắt toàn hệ thống

### 6.1. Điều hướng

| Phím | Chức năng |
|---|---|
| `Ctrl + K` / `⌘ + K` | Tìm kiếm nhanh toàn cục |
| `Ctrl + /` | Mở help panel |
| `Alt + 1..9` | Nhảy nhanh vào menu 1..9 |
| `Esc` | Đóng modal / huỷ thao tác |
| `Tab` / `Shift+Tab` | Di chuyển giữa các field |

### 6.2. POS

| Phím | Chức năng |
|---|---|
| `F2` | Focus ô tìm SP |
| `F4` | Chọn khách hàng |
| `F9` | Mở modal thanh toán |
| `Ctrl + P` | Tạm treo đơn |
| `Ctrl + N` | Đơn mới |
| `Ctrl + D` | Xoá dòng SP đang chọn |
| `+` / `−` | Tăng/giảm số lượng |

### 6.3. Danh sách / Table

| Phím | Chức năng |
|---|---|
| `Ctrl + F` | Filter |
| `Ctrl + E` | Export |
| `Ctrl + R` | Refresh |
| `Ctrl + A` | Select all rows |
| `↑` / `↓` | Di chuyển row |
| `Enter` | Mở chi tiết |

### 6.4. Form

| Phím | Chức năng |
|---|---|
| `Ctrl + S` | Lưu |
| `Ctrl + Shift + S` | Lưu và tạo mới |
| `Ctrl + Z` | Undo |
| `Esc` | Huỷ + đóng |

### 6.5. Report

| Phím | Chức năng |
|---|---|
| `Ctrl + P` | Print |
| `Ctrl + E` | Export Excel |
| `Ctrl + Shift + E` | Export PDF |

💡 **Mẹo**: In bảng phím tắt POS dán lên góc máy — nhân viên mới học nhanh.

---

## 7. Glossary thuật ngữ

| Thuật ngữ | Định nghĩa |
|---|---|
| **Tenant** | Một công ty/brand riêng trong hệ thống SaaS. Mỗi tenant có data độc lập. |
| **Cơ sở (Branch)** | Địa điểm vật lý — cửa hàng, kho, xưởng. |
| **POS** | Point of Sale — màn hình bán hàng tại quầy. |
| **SKU** | Stock Keeping Unit — mã duy nhất của mỗi biến thể sản phẩm. |
| **EAN/UPC** | Mã vạch sản phẩm chuẩn quốc tế. |
| **Serial / IMEI** | Số seri duy nhất từng unit của SP (cho điện tử, xe máy...). |
| **PO (Purchase Order)** | Đơn đặt hàng nhà cung cấp. |
| **PR (Purchase Requisition)** | Yêu cầu mua hàng nội bộ. |
| **GRN (Goods Received Note)** | Phiếu nhập kho từ NCC. |
| **Transfer** | Phiếu chuyển kho giữa 2 cơ sở. |
| **Adjustment** | Phiếu điều chỉnh tồn kho (kiểm kê chênh lệch). |
| **SO (Sales Order)** | Đơn bán hàng. |
| **AOV** | Average Order Value — giá trị trung bình/đơn. |
| **UPT** | Unit Per Transaction — số SP/đơn. |
| **COGS** | Cost of Goods Sold — giá vốn hàng bán. |
| **LTV** | Lifetime Value — tổng giá trị khách trong suốt vòng đời. |
| **CAC** | Customer Acquisition Cost. |
| **RFM** | Recency-Frequency-Monetary — phân tích khách. |
| **Churn** | Khách rời bỏ / không mua lại. |
| **Retention** | Tỷ lệ giữ chân khách. |
| **Loyalty ledger** | Sổ cái điểm tích luỹ của khách. |
| **Tier / Hạng thẻ** | Cấp bậc khách (Basic/Silver/Gold/Diamond). |
| **Voucher** | Mã giảm giá cần nhập. |
| **Promotion (KM)** | Khuyến mãi tự động áp dụng khi đủ điều kiện. |
| **Campaign** | Chiến dịch gửi message đến segment khách. |
| **Segment** | Tập con khách filter theo tiêu chí. |
| **ZNS** | Zalo Notification Service. |
| **OA (Official Account)** | Tài khoản doanh nghiệp Zalo. |
| **Webhook** | URL callback khi có event. |
| **SLA** | Service Level Agreement — cam kết thời gian xử lý. |
| **Ticket** | Yêu cầu hỗ trợ / khiếu nại của khách. |
| **Escalate** | Chuyển ticket lên cấp cao hơn. |
| **NPS** | Net Promoter Score — mức độ hài lòng (-100..100). |
| **CSAT** | Customer Satisfaction — điểm hài lòng (1-5 sao). |
| **BPM** | Business Process Management. |
| **BPMN** | Business Process Model and Notation — chuẩn vẽ quy trình. |
| **Role** | Tập hợp permission gán cho user. |
| **Permission** | Quyền cụ thể (ví dụ `pos.sale.create`). |
| **Audit log** | Sổ nhật ký ai làm gì khi nào. |
| **HDĐT VAT** | Hoá đơn điện tử có chức năng VAT (thay thế hoá đơn giấy). |
| **E-invoice** | Alias của HDĐT. |
| **MST** | Mã số thuế. |
| **P&L** | Profit and Loss — báo cáo lãi lỗ. |
| **Dashboard** | Trang tổng quan KPI. |
| **Drip campaign** | Chuỗi email/SMS gửi tự động theo lịch. |
| **Flash sale** | KM giảm sốc trong thời gian ngắn. |
| **Stock alert** | Cảnh báo tồn kho thấp. |
| **Reorder point** | Ngưỡng tồn cần đặt hàng lại. |
| **FIFO** | First In First Out — xuất hàng cũ trước. |
| **LIFO** | Last In First Out — xuất hàng mới trước. |
| **WAC** | Weighted Average Cost — giá vốn trung bình gia quyền. |
| **Multi-channel** | Bán nhiều kênh (POS + web + marketplace). |
| **Omnichannel** | Trải nghiệm nhất quán giữa các kênh. |

---

*Hết HDSD — kết thúc tài liệu. Xem thêm [URD](../urd/README.md) hoặc [SAD](../sa/README.md).*
