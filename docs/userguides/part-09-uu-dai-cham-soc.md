# Part 09 — Ưu đãi & Chăm sóc

*Phiên bản: Cửa hàng & Spa — Tenant "Viettel Store"*

Phân hệ **Ưu đãi & Chăm sóc** là công cụ để bạn **giữ chân khách hàng** và **kéo khách mới**. Đây là nơi tạo ra các hoạt động "tấn công chủ động" thay vì chỉ ngồi đợi khách đến quầy.

Sidebar có **4 mục con**:

| # | Mục | URL | Dùng để |
|---|-----|-----|---------|
| 1 | **Khuyến mãi & Voucher** | `/crm/promotional_program` | Tạo chương trình khuyến mãi, mã giảm giá |
| 2 | **Tích điểm hội viên** | `/crm/member_list` | Quản lý ví điểm của khách, quy tắc tích/đổi |
| 3 | **Chiến dịch marketing** | `/crm/marketing_campaign` | Gửi SMS/Email/Zalo/thông báo đẩy hàng loạt |
| 4 | **Chăm sóc thành viên** | `/crm/customer_care_page` | Lịch công việc chăm sóc, reminder tự động |

---

## A. Khuyến mãi & Voucher

**URL:** `/crm/promotional_program`

![Khuyến mãi & Voucher](./images/part-09-uu-dai-cham-soc/A01-promo-program.png)

### A.1. Các loại khuyến mãi thường dùng

- **Giảm giá theo %** — vd *"Giảm 20% toàn bộ đơn"*.
- **Giảm giá theo số tiền** — vd *"Giảm 50.000đ"*.
- **Mua N tặng M** — vd *"Mua 2 tặng 1"*.
- **Combo giá** — vd *"Set 3 dịch vụ chỉ còn 500k"*.
- **Flash sale** — giảm giá trong khoảng giờ cụ thể.
- **Voucher code** — mã giấy để khách nhập khi thanh toán.
- **Freebies** — tặng quà (sản phẩm phụ) khi mua đủ ngưỡng.

### A.2. Các bước tạo chương trình khuyến mãi

1. Bấm **+ Tạo chương trình**.
2. Điền form:

#### Quy định nhập liệu — Chương trình khuyến mãi

| Trường | Bắt buộc | Kiểu | Ghi chú |
|--------|:--------:|------|---------|
| **Tên chương trình** | ✓ | Text ≤ 255 | Vd *"Black Friday — giảm 30%"* |
| **Mã chương trình** | — | Text slug | Tự sinh nếu bỏ trống |
| **Loại khuyến mãi** | ✓ | Select | Giảm % / Giảm tiền / Mua tặng / Combo / Flash sale |
| **Giá trị giảm** | ✓ | Number | Tùy loại: % (0-100) hoặc VNĐ |
| **Áp dụng cho** | ✓ | Select | Toàn bộ / Danh mục cụ thể / Sản phẩm cụ thể |
| **Điều kiện tối thiểu** | — | Number | Vd *"Đơn tối thiểu 200.000đ"* |
| **Giới hạn giảm tối đa** | — | Number | Vd *"Giảm tối đa 100.000đ"* |
| **Đối tượng khách** | ✓ | Multi-select | Tất cả / Theo hạng / Theo nhóm / Khách mới |
| **Ngày bắt đầu** | ✓ | Datetime | |
| **Ngày kết thúc** | ✓ | Datetime | Phải > Ngày bắt đầu |
| **Giới hạn số lượt dùng** | — | Number | Tổng số lượt toàn chương trình |
| **Giới hạn / khách** | — | Number | Mỗi khách dùng tối đa N lần |
| **Mã voucher (nếu có)** | — | Text ≤ 20 | In hoa, không dấu, không khoảng trắng |
| **Mô tả / Điều khoản** | — | Textarea ≤ 2000 | Hiển thị cho khách |
| **Ảnh banner** | — | Upload ≤ 5 MB | |
| **Trạng thái** | ✓ | Select | Nháp / Đang chạy / Đã kết thúc / Tạm dừng |

3. Bấm **Lưu nháp** để lưu mà chưa chạy, hoặc **Kích hoạt** để chạy ngay.

### A.3. Theo dõi hiệu quả chương trình

Sau khi chương trình chạy, trong danh sách có cột:
- **Số lượt dùng** / Tổng cho phép.
- **Doanh thu từ chương trình**.
- **Số tiền đã giảm** (chi phí khuyến mãi).
- **ROI** = Doanh thu / Chi phí giảm.

### A.4. Voucher lẻ (giấy)

Ngoài chương trình tự động, bạn có thể in **voucher giấy** phát cho khách. Mỗi voucher có mã riêng:

1. Trong chương trình, bấm **Tạo lô voucher**.
2. Số lượng, prefix mã (vd `TET2026-`), thời hạn từng voucher.
3. **Xuất** danh sách mã để in.

---

## B. Tích điểm hội viên (Loyalty)

**URL:** `/crm/member_list`

![Tích điểm hội viên](./images/part-09-uu-dai-cham-soc/A02-member-list.png)

### B.1. Các thành phần

- **Ví điểm của từng khách** — xem/điều chỉnh số điểm, lịch sử tích/đổi.
- **Quy tắc tích điểm** — bao nhiêu tiền được bao nhiêu điểm.
- **Danh mục đổi quà** — khách có thể đổi điểm lấy quà/voucher.
- **Hạng thành viên** — level theo tổng điểm hoặc tổng chi tiêu (Basic/Silver/Gold/Diamond).
- **Lịch sử** — log mọi thao tác tăng/giảm điểm.

### B.2. Cấu hình quy tắc tích điểm

1. Vào tab **Quy tắc**.
2. Thêm quy tắc:

#### Quy định nhập liệu — Quy tắc tích điểm

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Tên quy tắc** | ✓ | Text |
| **Loại** | ✓ | Tích / Đổi |
| **Điều kiện áp dụng** | ✓ | Vd *"Mọi đơn từ 100.000đ trở lên"* |
| **Tỷ lệ** | ✓ | Vd *"10.000đ = 1 điểm"* hoặc *"100 điểm = 10.000đ giảm giá"* |
| **Nhóm khách áp dụng** | — | All / theo hạng |
| **Thời gian hiệu lực** | — | Từ ngày – Đến ngày |
| **Mức trần / đơn** | — | Tối đa bao nhiêu điểm mỗi đơn |

3. **Lưu**.

### B.3. Điều chỉnh điểm thủ công

Khi có sự cố (khách khiếu nại, tặng điểm khuyến mãi):

1. Tìm khách → bấm **+/- điểm**.
2. Nhập số điểm + lý do bắt buộc.
3. Xác nhận → ghi log vĩnh viễn.

### B.4. Đổi điểm lấy quà

Ở quầy, khi khách muốn đổi:

1. Tìm khách → xem số điểm hiện tại.
2. Bấm **Đổi điểm** → chọn quà từ danh mục.
3. Xác nhận → trừ điểm, xuất phiếu quà.

---

## C. Chiến dịch Marketing

**URL:** `/crm/marketing_campaign`

![Chiến dịch Marketing](./images/part-09-uu-dai-cham-soc/A03-marketing-campaign.png)

### C.1. Loại chiến dịch

- **SMS** — tin nhắn văn bản.
- **Email** — email marketing.
- **Zalo OA** — tin nhắn Zalo.
- **Thông báo đẩy (Push)** — nếu có app di động.
- **Facebook Message** — nếu đã tích hợp Fanpage.

### C.2. Các bước tạo chiến dịch

1. Bấm **+ Tạo chiến dịch**.
2. Chọn **Kênh** → chọn loại.
3. Điền **thông tin chiến dịch**:

#### Quy định nhập liệu — Chiến dịch Marketing

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Tên chiến dịch** | ✓ | Text |
| **Kênh** | ✓ | SMS / Email / Zalo / Push / Facebook |
| **Đối tượng khách** | ✓ | Tất cả / Theo nhóm / Theo hạng / Theo bộ lọc nâng cao |
| **Mục đích** | — | Khuyến mãi / Nhắc gia hạn / Sinh nhật / Winback / Cảm ơn |
| **Nội dung (template)** | ✓ | Nội dung tin. SMS ≤ 160 ký tự, Email HTML đầy đủ, Zalo 500 ký tự |
| **Tiêu đề (email/push)** | ✓ (nếu email) | Text |
| **Biến thay thế** | — | `{{tên khách}}`, `{{điểm}}`, `{{gói}}` — tự động replace |
| **Thời gian gửi** | ✓ | Gửi ngay / Lên lịch |
| **Giới hạn/kỳ** | — | Số tin tối đa 1 khách nhận trong 1 khoảng thời gian |

4. **Xem trước** — kiểm tra nội dung với 1 mẫu khách.
5. **Test gửi** — gửi cho 1 số điện thoại cụ thể trước khi gửi hàng loạt.
6. **Xác nhận gửi** → hệ thống đẩy vào hàng đợi, gửi dần theo giới hạn tốc độ của kênh.

### C.3. Theo dõi kết quả

Sau khi chiến dịch chạy, tab **Báo cáo** cho biết:

- **Đã gửi thành công** / **Thất bại**.
- **Tỷ lệ mở** (email) / **Tỷ lệ click**.
- **Tỷ lệ chuyển đổi** — có bao nhiêu khách sau khi nhận đã vào mua hàng.
- **Doanh thu mang về từ chiến dịch**.
- **Chi phí** (phí gửi SMS/Zalo) → tính ROI.

---

## D. Chăm sóc thành viên

**URL:** `/crm/customer_care_page`

![Chăm sóc thành viên](./images/part-09-uu-dai-cham-soc/A04-customer-care-page.png)

### D.1. Mục đích

Quản lý **các công việc chăm sóc khách định kỳ / sự kiện**:

- Gọi điện hỏi thăm sau lần đầu đến.
- Nhắc sinh nhật (tặng voucher).
- Nhắc ngày kỷ niệm.
- Nhắc gia hạn gói sắp hết hạn.
- Theo dõi khách không đến > 30 ngày (churn warning).

### D.2. Các cột danh sách công việc

| Cột | Ghi chú |
|-----|---------|
| **Khách hàng** | Avatar + tên |
| **Loại** | Chăm sóc sau bán / Sinh nhật / Gia hạn / Winback... |
| **Người phụ trách** | Nhân viên được giao |
| **Hạn thực hiện** | Deadline |
| **Trạng thái** | Mới / Đang làm / Đã xong / Bỏ qua |
| **Kết quả** | Ghi chú sau khi thực hiện |

### D.3. Tạo nhiệm vụ chăm sóc

**Thủ công:**
1. Bấm **+ Tạo nhiệm vụ** → chọn khách → loại → hạn → người phụ trách → mô tả.

**Tự động:**
1. Vào **Cấu hình automation** trong phân hệ này.
2. Thêm quy tắc, vd:
   - *"Sau khi bán đơn > 1tr → tạo nhiệm vụ Gọi hỏi thăm sau 3 ngày"*.
   - *"Trước sinh nhật 7 ngày → tạo nhiệm vụ Chuẩn bị voucher"*.
   - *"Gói sắp hết hạn trong 15 ngày → tạo nhiệm vụ Nhắc gia hạn"*.
3. Các nhiệm vụ tự sinh theo sự kiện.

### D.4. Thực hiện nhiệm vụ

1. Nhân viên vào danh sách → thấy nhiệm vụ của mình.
2. Bấm vào → thấy thông tin khách + hướng dẫn (nếu có trong template).
3. Thực hiện (gọi, nhắn, v.v.) → ghi **kết quả** → chuyển **Đã xong**.

---

## E. Luồng marketing điển hình

### E.1. "Gửi SMS nhắc gia hạn cho khách sắp hết thẻ"

1. Vào **Báo cáo Thành viên** → tìm danh sách **sắp hết hạn trong 15 ngày** → **Xuất** hoặc nhớ bộ lọc.
2. Vào **Chiến dịch Marketing** → **+ Tạo chiến dịch** → SMS.
3. Đối tượng: chọn **Theo bộ lọc** → *"Gói sắp hết hạn trong 15 ngày"*.
4. Nội dung: *"Xin chào {{tên}}, gói {{gói}} của bạn sẽ hết hạn vào {{ngày_hết_hạn}}. Gia hạn ngay hôm nay để được giảm 10% và duy trì ưu đãi."*
5. Lên lịch gửi 9h sáng mai → Lưu → Kích hoạt.
6. Theo dõi kết quả sau 3 ngày — xem có bao nhiêu khách gia hạn.

### E.2. "Tặng voucher sinh nhật tự động"

1. Vào **Chăm sóc → Cấu hình automation** → thêm quy tắc *"Sinh nhật khách"*.
2. Hành động: **Tạo voucher 100k** + **Gửi Zalo OA** với nội dung chúc mừng.
3. Bật automation.
4. Hệ thống tự chạy mỗi ngày, mọi khách có sinh nhật hôm đó đều nhận voucher + tin nhắn.

---

## F. Quản lý Sự kiện (Community Hub — Events)

**URL:** `/crm/community-hub/events`

Phân hệ **Sự kiện** giúp bạn tổ chức workshop, hội thảo, lớp học, networking... với quy trình khép kín: tạo sự kiện → chia sẻ link → nhận đăng ký → duyệt → check-in → chuyển thành hội viên.

Sidebar có **2 mục con**:

| # | Mục | URL | Dùng để |
|---|-----|-----|---------|
| 1 | **Danh sách sự kiện** | `/crm/community-hub/events` | Tạo, quản lý, công bố sự kiện |
| 2 | **Trang chia sẻ** | `/share_event?slug=xxx` | Link công khai cho khách đăng ký (không cần đăng nhập) |

---

### F.1. Tạo sự kiện với dynamic fields + add-ons

1. Bấm **+ Tạo sự kiện**.
2. Điền thông tin cơ bản:

#### Quy định nhập liệu — Sự kiện

| Trường | Bắt buộc | Kiểu | Ghi chú |
|--------|:--------:|------|---------|
| **Tiêu đề** | ✓ | Text 3–255 | Vd *"Workshop Yoga cho người mới"* |
| **Mô tả ngắn** | ✓ | Textarea | Dùng cho preview + SEO |
| **Nội dung chi tiết** | — | HTML Editor | RebornEditor, hỗ trợ ảnh/video inline |
| **Ảnh bìa** | — | Upload ≤ 5 MB | Hiển thị trên trang chia sẻ |
| **Gallery ảnh** | — | Upload nhiều ảnh | Ảnh giới thiệu hoạt động |
| **Ngày bắt đầu** | ✓ | Datetime | |
| **Ngày kết thúc** | ✓ | Datetime | Phải sau ngày bắt đầu |
| **Ngày mở đăng ký** | ✓ | Datetime | |
| **Ngày đóng đăng ký** | ✓ | Datetime | Phải sau ngày mở |
| **Danh sách ngày chọn** | — | Multi-date | Cho sự kiện nhiều ngày, khách chọn ngày muốn tham gia |
| **Hình thức** | ✓ | Toggle | Offline (cần địa điểm) / Online (cần link meeting) |
| **Địa điểm** | ✓ (offline) | Text | Tên + địa chỉ + thành phố + link Maps |
| **Link online** | ✓ (online) | URL | Zoom/Google Meet |
| **Người liên hệ** | ✓ | Text | Tên + SĐT (bắt buộc), email + vai trò (tuỳ chọn) |
| **Sức chứa tối đa** | — | Number | Bỏ trống = không giới hạn |
| **Giá vé** | ✓ | Number (VND) | 0 = miễn phí |
| **Danh mục** | — | Select | Workshop / Hội thảo / Lớp học / Networking / Training / Khác |
| **Tags** | — | Multi-tag | Vd *yoga, beginner, wellness* |
| **Yêu cầu bằng chứng TT** | — | Toggle | Bật nếu muốn khách upload ảnh chuyển khoản |

3. **Cấu hình trường tùy biến (Dynamic Fields):**

   Bấm **+ Thêm trường** để thêm câu hỏi bổ sung trên form đăng ký. Mỗi trường có:
   - **Tên trường** — vd *"Size áo"*, *"Level kinh nghiệm"*.
   - **Kiểu** — Text / Textarea / Number / Dropdown / Checkbox / Date / Email / Phone.
   - **Bắt buộc** — toggle.
   - **Lựa chọn** (nếu Dropdown) — vd *S, M, L, XL*.
   - **Placeholder / Giá trị mặc định** — tuỳ chọn.

   Kéo thả để sắp xếp thứ tự hiển thị. Trường tùy biến sẽ xuất hiện trên form đăng ký công khai.

4. **Cấu hình sản phẩm/dịch vụ bổ sung (Add-ons):**

   Bấm **+ Thêm add-on** để thêm sản phẩm/dịch vụ bán thêm. Mỗi add-on có:
   - **Tên** — vd *"Bữa trưa"*, *"Áo event"*.
   - **Mô tả** — tuỳ chọn.
   - **Đơn giá** (VND).
   - **Đơn vị** — vd *"phần"*, *"cái"*.
   - **Số lượng tối đa / người** — tuỳ chọn.
   - **Ảnh** — tuỳ chọn.

   Khách sẽ thấy danh sách add-on trên form đăng ký và chọn số lượng. Hệ thống tự tính tổng tiền.

5. Bấm **Lưu nháp** hoặc **Công bố** để xuất bản ngay.

---

### F.2. Quản lý trạng thái sự kiện

| Trạng thái | Ý nghĩa | Hành động |
|------------|----------|-----------|
| **Nháp** | Chưa công khai, chỉ admin thấy | Bấm **Công bố** để xuất bản |
| **Đã công bố** | Trang public hiển thị, khách có thể đăng ký | Bấm **Ẩn** để chuyển về nháp |
| **Đang diễn ra** | Tự chuyển khi đến ngày bắt đầu | — |
| **Đã kết thúc** | Tự chuyển khi qua ngày kết thúc | — |
| **Đã huỷ** | Admin huỷ, thông báo cho tất cả người đăng ký | Bấm **Huỷ sự kiện** |

---

### F.3. Chia sẻ link công khai

Sau khi sự kiện được **Công bố**, hệ thống sinh link dạng:

```
https://ten-tenant.reborn.vn/share_event?slug=workshop-yoga-abcd
```

- Bấm **Sao chép link** để lấy URL chia sẻ lên Facebook, Zalo, Email...
- Khách truy cập link → xem thông tin sự kiện → điền form đăng ký → nhận thông báo "BTC sẽ liên hệ xác nhận".
- Khách **không cần đăng nhập** để đăng ký.
- Nếu event multi-day, khách chọn ngày muốn tham gia.
- Nếu có add-on, khách chọn sản phẩm + số lượng, thấy tổng tiền trước khi gửi.

---

### F.4. Xem & duyệt bằng chứng thanh toán

Áp dụng khi sự kiện bật **"Yêu cầu bằng chứng thanh toán"**:

1. Vào **Chi tiết sự kiện** → tab **Người đăng ký**.
2. Cột **Thanh toán** hiển thị trạng thái:
   - **Chờ gửi** — khách chưa upload.
   - **Đã gửi** — khách đã upload ảnh, chờ duyệt.
   - **Đã duyệt** — admin đã xác nhận.
   - **Từ chối** — admin từ chối kèm lý do.
3. Bấm vào đăng ký có trạng thái **Đã gửi** → xem ảnh bằng chứng.
4. Bấm **Duyệt** nếu hợp lệ, hoặc **Từ chối** + nhập lý do.

---

### F.5. Check-in khách tại sự kiện

Vào ngày sự kiện, nhân viên BTC check-in khách bằng 2 cách:

**Cách 1 — Scan QR:**
1. Mở trang sự kiện → tab **Check-in**.
2. Dùng camera quét mã QR trên vé điện tử của khách.
3. Hệ thống tự nhận diện → hiển thị tên khách → bấm **Xác nhận check-in**.

**Cách 2 — Nhập thủ công:**
1. Tìm khách trong danh sách đăng ký (theo tên hoặc SĐT).
2. Bấm nút **Check-in** bên cạnh tên khách.

**Check-out:**
- Khi khách rời sự kiện, bấm **Check-out** để ghi nhận thời gian ra.

**Sự kiện nhiều ngày:**
- Mỗi ngày check-in riêng biệt — hệ thống ghi nhận theo ngày.

---

### F.6. Duyệt đăng ký & Phát hành vé

1. Vào **Chi tiết sự kiện** → tab **Người đăng ký**.
2. Danh sách hiển thị: Tên, SĐT, Email, Trạng thái, Mã vé, Nguồn, Ngày đăng ký.
3. Với mỗi đăng ký trạng thái **Chờ xác nhận**:
   - Bấm **Phát hành vé** → hệ thống sinh mã vé + QR code.
   - Nếu sự kiện có giá vé → tự tạo đơn hàng bên Sales.
   - Nếu miễn phí → xác nhận ngay.
4. Bấm **Chuyển thành hội viên** để convert lead → customer trong hệ thống CRM.

---

### F.7. Tracking dịch vụ sử dụng (ngành fitness/spa)

Nếu bạn thuộc ngành fitness, spa, wellness:

1. Vào **Chi tiết đăng ký** của một khách đã check-in.
2. Tab **Dịch vụ sử dụng** → bấm **+ Ghi nhận dịch vụ**.
3. Chọn dịch vụ từ catalog (vd: *Massage 60 phút*, *Tập thử CrossFit*).
4. Nhập số lượng, đơn giá.
5. Lưu → dùng để phân tích quan tâm của khách và gợi ý upsell sau event.

---

### F.8. Luồng tổ chức sự kiện điển hình

#### "Tổ chức Workshop Yoga cho người mới bắt đầu"

1. **Tạo sự kiện** → điền thông tin: Workshop Yoga, ngày 29/04, 08:00–11:00, địa điểm Home FitPro Thảo Điền, 30 chỗ, giá vé 150.000đ.
2. **Thêm dynamic fields**: "Level kinh nghiệm" (dropdown: Chưa biết gì / Cơ bản / Trung cấp), "Size áo" (dropdown: S/M/L/XL).
3. **Thêm add-ons**: "Bữa trưa 65.000đ", "Áo event 120.000đ".
4. **Bật** "Yêu cầu bằng chứng thanh toán" vì thu phí qua chuyển khoản.
5. **Công bố** → **Sao chép link** → đăng lên Facebook + Zalo.
6. Khách truy cập → đăng ký → chọn add-on → upload ảnh chuyển khoản.
7. Admin **duyệt bằng chứng** → **Phát hành vé** (hệ thống gửi QR qua email).
8. Ngày event → nhân viên **scan QR check-in** khách tại cửa.
9. Trong event → **ghi nhận dịch vụ** khách dùng thử (Massage 30 phút miễn phí).
10. Sau event → **Chuyển thành hội viên** những khách tiềm năng → bán gói tập tiếp.

---

*Hết Part 09.*
