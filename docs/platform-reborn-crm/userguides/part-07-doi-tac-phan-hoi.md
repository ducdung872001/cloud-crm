# Part 07 — Business Owner & Phản hồi

*Phiên bản 0.6 — Tenant "FitPro"*

Phần này gom **2 mục độc lập trên sidebar** liên quan đến "những người vận hành ngoài vai trò nhân viên thuần":

| Mục | URL | Đối tượng |
|-----|-----|-----------|
| **Business Owner** | `/crm/ch_partners` | Chủ trạm — các BO trong mạng lưới 7×7×7 |
| **Đánh giá & Phản hồi** | `/crm/ch_feedback` | Phản hồi / đánh giá của hội viên |

> **Khác biệt quan trọng với tenant khác:** Ở các tenant retail / spa truyền thống, mục này là "Đối tác (KOL/PO/Đại lý)". Ở FitPro, nó là **Business Owner (BO)** — chủ các trạm thuộc mạng lưới 7×7×7 của bạn. Mỗi BO là một người đã được Onboarding MF7 và đang điều hành 1 hoặc nhiều trạm downline.

---

## A. Business Owner

**URL:** `/crm/ch_partners`

![Business Owners — mạng lưới chủ trạm MF7](./images/part-07-business-owner/01-business-owner-list.png)

### A.1. BO là gì? Khác gì với Thành viên ở Part 03?

- **Thành viên** (Part 03): là **hội viên** đến tập ở trạm, mua gói tập, không sở hữu trạm.
- **Business Owner**: là **chủ trạm** — người đứng ra vận hành 1 hoặc nhiều trạm FitPro, hưởng doanh thu + hoa hồng từ downline.

Một thành viên có thể **tiến hoá thành BO** (giống Amway/Herbalife) sau khi hoàn thành MF7 Onboarding + đồng ý mở trạm. Khi đó hồ sơ thành viên được **liên kết** với hồ sơ BO.

### A.2. 4 profile BO

Dòng subtitle: *"Mạng lưới chủ trạm MF7 — 4 profiles từ Dân VP đến Đại sứ lối sống"*.

Mỗi BO có 1 profile thể hiện **background** và **mức độ gắn bó với hệ thống**:

| Profile | Màu badge | Đặc điểm | % doanh thu hãng trả |
|---------|-----------|----------|---------------------|
| 💼 **Dân VP** | Xanh dương | Nhân viên văn phòng làm thêm, trạm Home FitPro | 3% |
| 🎯 **Chủ DN** | Tím | Có kinh doanh khác, coi FitPro là kênh mở rộng | 4% |
| 🏃 **PT/Yoga** | Cam | HLV thể hình / yoga chuyên nghiệp chuyển sang mô hình trạm | 5% |
| 💚 **Đại sứ lối sống** | Xanh lá | Đã chọn FitPro làm sự nghiệp chính, toàn thời gian | 5-7% |

### A.3. Bộ lọc profile (chip filter)

Góc trên phải có **5 chip lọc**:

- **Tất cả** (mặc định chọn)
- **💼 Dân VP**
- **🎯 Chủ DN**
- **🏃 PT/Yoga**
- **💚 Đại sứ lối sống**

Bấm chip để lọc danh sách BO theo profile.

### A.4. Cấu trúc 1 card BO

Mỗi BO hiển thị dạng card lớn với các thông tin:

```
┌────────────────────────────────────────┐
│ 🎯  Nguyễn Văn A                       │
│     [Dân VP]  📍 Hà Nội · Tier 1       │
├────────────────────────────────────────┤
│ 💼 Trạm sở hữu:          1             │
│ 🌱 Downline:             4/7 trạm      │
│ 👥 Thành viên phục vụ:   82            │
│ 💰 Hoa hồng tháng:  18.500.000đ        │
├────────────────────────────────────────┤
│ [Xem chi tiết]  [Thanh toán HH]        │
└────────────────────────────────────────┘
```

| Trường | Ghi chú |
|--------|---------|
| **Tên BO** + **Icon profile** | Màu icon theo profile |
| **Badge profile** | Dân VP / Chủ DN / PT/Yoga / Đại sứ lối sống |
| **Địa điểm · Tier** | VD *"Hà Nội · Tier 1"* |
| **Trạm sở hữu** | Số trạm BO trực tiếp đứng tên |
| **Downline** | Số BO đã mời / target 7 |
| **Thành viên phục vụ** | Tổng hội viên đang tập ở các trạm của BO và downline |
| **Hoa hồng tháng** | Hoa hồng phải trả cho BO tháng này |
| **[Xem chi tiết]** | Mở panel chi tiết |
| **[Thanh toán HH]** | Mở form tạo phiếu chi trả hoa hồng |

### A.5. Thêm BO mới

Cuối danh sách có ô **➕ Thêm Business Owner** (nét đứt). Bấm vào đó → form tạo BO mới.

> **Lưu ý:** Tạo BO ở đây **khác** với "Mời BO" ở [Part 13 — Mạng lưới 7×7×7](part-13-mang-luoi-7x7x7.md#5-mời-business-owner-mới). Ở Part 13, bạn mời BO **vào slot mạng lưới** (có upline, tier, Onboarding MF7...). Ở đây, bạn tạo BO **độc lập** — dùng khi BO đã tự onboard bên ngoài hoặc chuyển từ nhân viên lên.

#### Quy định nhập liệu — Tạo BO thủ công

| Trường | Bắt buộc | Kiểu | Ghi chú |
|--------|:--------:|------|---------|
| **Họ tên** | ✓ | Text ≤ 255 | |
| **Profile** | ✓ | Select | Dân VP / Chủ DN / PT/Yoga / Đại sứ lối sống |
| **Số điện thoại** | ✓ | Tel | Đúng định dạng VN |
| **Email** | — | Email | Dùng để gửi báo cáo hoa hồng hàng tháng |
| **Ngày sinh** | — | Date | |
| **Địa chỉ** | — | Text | |
| **Tier trong mạng lưới** | ✓ | Select | Tier 1 / Tier 2 / Tier 3 |
| **Upline BO** | ✓ | Select | Chọn BO đã tồn tại (trừ khi là Master BO) |
| **Mã số thuế cá nhân** | — | Text, 10 số | Để xuất báo cáo thuế TNCN |
| **Số TK ngân hàng** | — | Text | Để trả hoa hồng |
| **Tên NH + Chủ TK** | — | Text | |
| **Ảnh đại diện** | — | Upload ≤ 5MB | |
| **Ghi chú** | — | Textarea | |

Bấm **Lưu**. BO mới được tạo, hiện trong danh sách. Nếu có **Upline**, cây mạng lưới ở Part 13 cũng tự update.

### A.6. Xem chi tiết một BO

Bấm **Xem chi tiết** → panel mở ra bên phải hoặc màn hình full-page với các tab:

| Tab | Nội dung |
|-----|----------|
| **Thông tin** | Profile, tier, upline, contact, ngân hàng |
| **Trạm sở hữu** | Danh sách trạm + số thành viên + doanh thu mỗi trạm |
| **Downline** | Cây các BO downline + tier của họ |
| **Hoa hồng** | Lịch sử hoa hồng 12 tháng + số dư phải trả |
| **Hội viên phục vụ** | Tổng hội viên ở các trạm của BO + downline |
| **Lịch sử hoạt động** | Audit log: BO đã làm gì trên hệ thống |

### A.7. Thanh toán hoa hồng cho BO

Khác với tenant thông thường (kế toán chủ động tính), FitPro có 2 luồng hoa hồng:

**Luồng 1 — Hoa hồng hệ thống (tự động, từ hãng Herbalife):**
- Herbalife tự tính và trả 5% × 3 tầng mỗi tháng.
- BO chỉ xem ở [Part 15.6 — Hoa hồng hệ thống](part-15-fitpro-modules.md#hoa-hồng-hệ-thống), không cần nhập liệu.

**Luồng 2 — Hoa hồng nội bộ (bạn trả BO cho dịch vụ ngoài gói Herbalife):**

VD: BO A giới thiệu một doanh nghiệp thuê trạm của bạn cho event team building → bạn trả hoa hồng ngoài cho A. Luồng này xử lý ở đây:

1. Vào card BO → bấm **[Thanh toán HH]**.
2. Form hiện ra:
   - **Số tiền**: nhập thủ công hoặc hệ thống đề xuất dựa trên config hoa hồng.
   - **Kỳ thanh toán**: Chọn tháng/quý.
   - **Nội dung**: Ghi lý do (VD *"Hoa hồng event team building công ty XYZ"*).
   - **Chọn quỹ chi**: từ [Part 06 — Quản lý quỹ](part-06-tai-chinh.md).
3. Bấm **Xác nhận**.
4. Hệ thống tạo phiếu chi ở **Sổ thu chi** (Part 06), update số dư phải trả của BO.

---

## B. Đánh giá & Phản hồi

**URL:** `/crm/ch_feedback`

![Màn hình Đánh giá & Phản hồi](./images/part-07-business-owner/02-danh-gia-phan-hoi.png)

### B.1. Mục đích

Thu thập, phân loại và xử lý **phản hồi của hội viên**:

- **Đánh giá** — điểm sao + nội dung kèm, từ 1-5 sao.
- **Góp ý** — đề xuất cải thiện, Master BO cần xem.
- **Khiếu nại** — vấn đề nghiêm trọng, cần xử lý nhanh.

### B.2. Các kênh thu thập

Phản hồi có thể đến từ nhiều nguồn, đổ về cùng một nơi để dễ quản lý:

- **Form trên app FitPro mobile** của hội viên (sau mỗi buổi tập).
- **Khảo sát sau khi dùng dịch vụ** (gửi qua SMS/email/Zalo).
- **Nhập thủ công** — lễ tân nghe hội viên nói trực tiếp thì ghi vào.
- **Tự động khi hội viên đánh giá buổi tập trên app** (rating 1-5 sao sau check-out).
- **Social listening** — comment từ Facebook / Zalo fanpage (nếu đã tích hợp Social CRM).

### B.3. Các cột / trạng thái

| Cột | Ghi chú |
|-----|---------|
| **Mã phản hồi** | Tự sinh |
| **Ngày giờ** | |
| **Hội viên** | Gắn vào hồ sơ hội viên (nếu xác định được) |
| **Trạm** | Trạm mà hội viên nhắc đến |
| **Kênh** | Form / App / SMS / Nhân viên / FB... |
| **Điểm sao** | 1-5 sao (nếu đánh giá) |
| **Loại** | Đánh giá / Góp ý / Khiếu nại |
| **Mức độ** | Nhẹ / Trung bình / Nghiêm trọng |
| **Nội dung** | Text hội viên viết |
| **Trạng thái xử lý** | Mới / Đang xử lý / Đã xử lý / Bỏ qua |
| **Người phụ trách** | BO hoặc nhân viên được giao xử lý |

### B.4. Các bước xử lý một phản hồi

1. Bấm vào phản hồi ở danh sách → mở panel chi tiết.
2. **Phân loại**: chọn Loại, Mức độ.
3. **Gán người phụ trách**: chọn từ BO của trạm bị đề cập hoặc Master BO.
4. Chuyển trạng thái sang **Đang xử lý**.
5. **Viết note**: mỗi lần có hành động, ghi vào phần **Lịch sử xử lý** (vd *"Đã gọi điện xin lỗi và tặng voucher 1 buổi tập miễn phí"*).
6. Khi xong, chuyển sang **Đã xử lý** + ghi kết quả cuối.

#### Quy định nhập liệu — Tạo phản hồi thủ công

| Trường | Bắt buộc | Ghi chú |
|--------|:--------:|---------|
| **Hội viên** | — | Select hoặc để trống nếu vô danh |
| **Trạm** | ✓ | Select — trạm nào |
| **Kênh** | ✓ | Select |
| **Điểm sao** | — | Số 1-5 |
| **Loại** | ✓ | Đánh giá / Góp ý / Khiếu nại |
| **Mức độ** | ✓ | Nhẹ / Trung bình / Nghiêm trọng |
| **Nội dung** | ✓ | Textarea ≤ 2000 ký tự |
| **Ảnh đính kèm** | — | Upload, max 5 file × 5MB |
| **Ngày phát sinh** | ✓ | Date |

### B.5. Liên kết với SOP Compliance

Phản hồi điểm sao của hội viên **tự động chảy vào** điểm Feedback KH của [Part 15.4 — Tuân thủ SOP](part-15-fitpro-modules.md#tuân-thủ-sop). Trạm nào có trung bình rating < 4.0/5 sẽ bị cảnh báo.

### B.6. Báo cáo phản hồi

- **Số phản hồi theo tháng** — biểu đồ cột.
- **Tỷ lệ Đánh giá / Góp ý / Khiếu nại** — pie chart.
- **Thời gian xử lý trung bình** — từ Mới → Đã xử lý.
- **Top trạm có rating cao nhất / thấp nhất**.
- **Top BO xử lý phản hồi nhanh nhất**.

Chi tiết các báo cáo này xem [Part 08 — Báo cáo](part-08-bao-cao.md).

---

## C. Luồng công việc thường gặp

### C.1. "BO A mời thành công 1 downline tháng này — trả hoa hồng nội bộ?"

Hãng Herbalife đã trả hoa hồng 5% cho luồng chuẩn (xem [Part 15.6](part-15-fitpro-modules.md#hoa-hồng-hệ-thống)). Nếu bạn (Master BO) có chính sách **thưởng thêm** 500k cho mỗi downline thành công:

1. Vào **Business Owner** → tìm A → **[Thanh toán HH]**.
2. Nhập 500.000đ, nội dung *"Thưởng mời downline tháng 04/2026"*.
3. Chọn quỹ → Xác nhận.
4. Phiếu chi tự tạo trong **Sổ thu chi** (Part 06).

### C.2. "Hội viên khiếu nại trạm FP-HN-002 không mở đúng giờ 3 buổi liên tiếp"

1. Lễ tân ghi nhận: vào **Đánh giá & Phản hồi** → **+ Tạo phản hồi** → gắn hội viên → Trạm: *FP-HN-002* → Loại: *Khiếu nại* → Mức độ: *Trung bình* → nội dung.
2. Gán người phụ trách: BO của trạm FP-HN-002.
3. Song song: hệ thống tự hạ điểm **Tuân thủ SOP — Đúng giờ 6-9h** của trạm (xem [Part 15.4](part-15-fitpro-modules.md#tuân-thủ-sop)).
4. BO vào xem, gọi điện xin lỗi → tặng hội viên 1 buổi tập miễn phí → ghi note → chuyển **Đã xử lý**.
5. Nếu lặp lại 2-3 lần trong tháng, Master BO nhận cảnh báo tại SOP dashboard và audit trạm đó.

### C.3. "Muốn xem toàn bộ BO có profile PT/Yoga ở Hà Nội"

1. Vào **Business Owner**.
2. Chip filter → chọn **PT/Yoga**.
3. Dùng search box → gõ "Hà Nội".
4. Danh sách lọc xuống còn các BO profile PT/Yoga ở Hà Nội.

---

*Hết Part 07.*
