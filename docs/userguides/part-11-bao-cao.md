# Part 11 — Báo cáo & Phân tích

> **Dành cho**: Store Manager, Chủ cửa hàng, Marketing Manager, Accountant
> **Mức độ**: Trung cấp
> **Tham chiếu URD**: [Part 11 — Báo cáo](../urd/part-11-bao-cao.md) (UR-REP-01 → UR-REP-22)

"Không đo lường — không quản lý." Part này giúp bạn **đọc các báo cáo chính**, **filter đúng cách**, **export** ra Excel/PDF và **schedule gửi báo cáo tự động** hàng ngày/tuần/tháng.

## Mục lục
- [1. Tổng quan trung tâm báo cáo](#1-tổng-quan-trung-tâm-báo-cáo)
- [2. Báo cáo doanh thu theo kỳ](#2-báo-cáo-doanh-thu-theo-kỳ)
- [3. Doanh thu theo cơ sở / nhân viên / kênh](#3-doanh-thu-theo-cơ-sở--nhân-viên--kênh)
- [4. Top sản phẩm bán chạy](#4-top-sản-phẩm-bán-chạy)
- [5. Báo cáo khách hàng](#5-báo-cáo-khách-hàng)
- [6. Phân tích RFM](#6-phân-tích-rfm)
- [7. Báo cáo tồn kho](#7-báo-cáo-tồn-kho)
- [8. Báo cáo khuyến mãi](#8-báo-cáo-khuyến-mãi)
- [9. Báo cáo marketing](#9-báo-cáo-marketing)
- [10. Export Excel/PDF](#10-export-excelpdf)
- [11. Schedule gửi báo cáo tự động](#11-schedule-gửi-báo-cáo-tự-động)
- [FAQ](#faq)

---

## 1. Tổng quan trung tâm báo cáo

Sidebar → **Báo cáo** (`/report`).

Trang trung tâm chia làm **6 nhóm**:

| Nhóm | Gồm |
|---|---|
| **Bán hàng** | Doanh thu, đơn hàng, top SP, AOV |
| **Khách hàng** | Mới, quay lại, churn, RFM |
| **Kho** | Tồn, tốc độ quay vòng, giá trị |
| **Tài chính** | Thu chi, dòng tiền, công nợ, P&L |
| **Marketing** | Campaign, voucher, automation flow |
| **Vận hành** | Ca, cashier KPI, ticket SLA |

Click vào nhóm → danh sách report chi tiết → click report → mở trang với filter.

💡 **Mẹo**: Đánh dấu **⭐ yêu thích** các báo cáo hay xem → xuất hiện đầu trang cho lần sau.

---

## 2. Báo cáo doanh thu theo kỳ

Sidebar → **Báo cáo → Doanh thu theo kỳ** (`/report_revenue`).

### 2.1. Filter

- **Kỳ**: Ngày / Tuần / Tháng / Quý / Năm / Tuỳ chỉnh
- **Từ ngày → đến ngày**
- **So sánh**: không / kỳ trước / cùng kỳ năm trước
- **Cơ sở**: all / cụ thể

### 2.2. Các chỉ số

| Chỉ số | Ý nghĩa |
|---|---|
| **Gross revenue** | Doanh số trước giảm giá |
| **Net revenue** | Sau giảm giá, trước thuế |
| **Số đơn** | Tổng đơn PAID |
| **AOV** | Trung bình tiền/đơn |
| **UPT** | SP/đơn (Unit Per Transaction) |
| **Số khách unique** | Khách riêng biệt |
| **% tăng trưởng** | So với kỳ so sánh |

### 2.3. Biểu đồ

- **Line chart**: doanh thu theo ngày trong kỳ
- **Bar chart**: so sánh cùng kỳ
- **Heatmap**: giờ-ngày trong tuần (giờ vàng bán hàng)

💡 **Mẹo**: Heatmap giúp quyết định **khung giờ KM** hoặc **xếp ca nhân viên** hợp lý.

> 🖼️ *Ảnh minh hoạ: Báo cáo doanh thu với chart so sánh — chụp sau*

---

## 3. Doanh thu theo cơ sở / nhân viên / kênh

### 3.1. Theo cơ sở

Sidebar → **Báo cáo → Doanh thu theo cơ sở** (`/report_revenue_branch`).

Bảng: mỗi row là 1 cơ sở với các cột: Doanh thu, Số đơn, AOV, % contribution, % growth.

### 3.2. Theo nhân viên (cashier KPI)

Sidebar → **Báo cáo → Cashier KPI** (`/report_cashier`).

Cột: Nhân viên, Cơ sở, Số đơn, Doanh thu, AOV, SP/đơn, Điểm đánh giá khách.

💡 **Mẹo**: Dùng để thưởng KPI cuối tháng cho top cashier.

### 3.3. Theo kênh

Sidebar → **Báo cáo → Doanh thu theo kênh** (`/report_channel`).

Kênh: POS tại quầy / Web / Shopee / Lazada / TikTok Shop / Zalo Mini App.

Bảng pivot: kênh × tháng, giúp so sánh growth từng kênh.

---

## 4. Top sản phẩm bán chạy

Sidebar → **Báo cáo → Top sản phẩm** (`/report_top_product`).

### Filter

- Kỳ
- Cơ sở
- **Metric**: số lượng bán / doanh thu / lợi nhuận
- **Giới hạn**: top 10 / 50 / 100

### Bảng kết quả

| Rank | SP | SKU | SL bán | Doanh thu | Lợi nhuận | % đóng góp |
|---|---|---|---|---|---|---|

Kèm **biểu đồ Pareto** (80/20 rule): 20% SP tạo 80% doanh thu.

💡 **Mẹo**: Xem report này **hàng tuần** để quyết định SP nào cần đẩy mạnh / bỏ bán.

### Top sản phẩm chậm (slow mover)

Tab bên cạnh — SP bán ít hoặc **không bán trong 30/60/90 ngày**. Cân nhắc giảm giá clearance hoặc ngừng nhập.

---

## 5. Báo cáo khách hàng

Sidebar → **Báo cáo → Khách hàng** (`/report_customer`).

### 5.1. Khách mới

Biểu đồ cột: số khách mới đăng ký theo ngày/tuần/tháng.

Chỉ số: **Cost per acquisition** (CAC) = chi phí marketing / khách mới.

### 5.2. Khách quay lại (retention)

Cohort analysis:

- Khách mua tháng 1 — bao nhiêu % quay lại tháng 2, 3, 4...
- Retention rate = quay lại / tổng khách

💡 **Mẹo**: Retention < 20% sau 3 tháng → cần tăng cường loyalty + automation nhắc nhở.

### 5.3. Churn (khách rời)

Khách **không mua trong X ngày** (default 90 ngày) được coi là churned.

Báo cáo hiển thị:

- Số khách churn theo kỳ
- Churn rate
- Danh sách khách churn → có thể export → gửi winback campaign

---

## 6. Phân tích RFM

RFM = **Recency** (gần đây nhất mua khi nào) + **Frequency** (tần suất) + **Monetary** (giá trị).

Sidebar → **Báo cáo → RFM** (`/report_rfm`).

### 6.1. Cách đọc

Hệ thống chia mỗi chiều thành **5 mức (1-5)** → 125 tổ hợp → nhóm lại thành **11 segment điển hình**:

| Segment | R | F | M | Chiến lược |
|---|---|---|---|---|
| **Champions** | 5 | 5 | 5 | Chăm sóc VIP, upsell |
| **Loyal** | 3-5 | 4-5 | 3-5 | Giữ chân, ưu đãi |
| **Potential loyalist** | 4-5 | 2-3 | 2-3 | Khuyến khích mua thêm |
| **New customers** | 5 | 1 | 1-2 | Onboarding, chào mừng |
| **At risk** | 2 | 4-5 | 4-5 | Winback gấp |
| **Can't lose them** | 1 | 5 | 5 | Ưu đãi đặc biệt giữ lại |
| **Hibernating** | 1-2 | 1-2 | 1-2 | Winback rẻ, hoặc cho rời |
| ... | | | | |

### 6.2. Thao tác

- Click 1 segment → xem danh sách khách trong đó
- Nhấn **[Tạo segment marketing]** → đưa vào campaign

💡 **Mẹo**: RFM update **hàng tuần**. Chạy campaign winback cho *At risk* mỗi tháng.

> 🖼️ *Ảnh minh hoạ: Ma trận RFM với 11 segment — chụp sau*

---

## 7. Báo cáo tồn kho

Sidebar → **Báo cáo → Tồn kho** (`/report_inventory`).

### 7.1. Tồn hiện tại

Bảng: SP, SKU, Tồn các cơ sở, Tổng, Giá trị tồn (theo giá vốn).

### 7.2. Tốc độ quay vòng

**Inventory turnover** = COGS / Tồn trung bình.

- Cao → hàng bán chạy, tốt
- Thấp → hàng chết, cần clearance

### 7.3. Age of inventory

Chia tồn theo **tuổi**: < 30 ngày / 30-60 / 60-90 / > 90.

Hàng > 90 ngày = **nguy cơ dead stock**.

### 7.4. Stock alert

Bảng SP **sắp hết** (tồn < ngưỡng reorder) hoặc **đã hết** → gợi ý tạo PO.

💡 **Mẹo**: Xuất Excel → gửi Purchaser hàng tuần.

---

## 8. Báo cáo khuyến mãi

Sidebar → **Báo cáo → Khuyến mãi** (`/report_promotion`).

### Chỉ số chính

- **Số lần áp dụng**
- **Doanh thu từ đơn có KM**
- **Tổng tiền giảm**
- **Uplift**: chênh lệch doanh thu giữa kỳ có KM và kỳ không
- **ROI KM** = (Doanh thu uplift − Chi phí KM) / Chi phí KM

### Bảng chi tiết

Mỗi KM có: tên, thời gian, số đơn, doanh thu, % uplift, ROI.

⚠️ **Chú ý**: KM ROI **âm** → cân nhắc dừng. Nhưng đôi khi ROI âm vẫn chấp nhận được nếu mục tiêu là **acquire** khách mới (xem LTV).

### Báo cáo voucher

Tab riêng — voucher nào có tỷ lệ redeem cao, conversion tốt.

---

## 9. Báo cáo marketing

Sidebar → **Báo cáo → Marketing** (`/report_marketing`).

### 9.1. Campaign performance

Bảng: mỗi campaign có Sent, Delivered, Open, Click, Conversion, Revenue, ROI.

### 9.2. Funnel analysis

Sent → Delivered → Opened → Clicked → Converted — tỷ lệ drop ở từng bước.

### 9.3. Automation flow performance

Mỗi flow: số người vào flow, completion rate, revenue sinh ra.

### 9.4. Channel performance

So sánh **email vs SMS vs Zalo vs push** về:

- Chi phí / recipient
- Open / click rate
- Revenue / message

💡 **Mẹo**: Dùng để **allocate budget** kênh nào hiệu quả hơn.

---

## 10. Export Excel/PDF

Gần như **mọi báo cáo** đều có 2 nút ở góc phải trên:

- 📊 **Export Excel** (.xlsx)
- 📄 **Export PDF**

### Excel

- Giữ nguyên filter đang áp dụng
- Có sheet **"Data"** (raw) + sheet **"Chart"** (biểu đồ)
- Công thức Excel live — có thể sửa lại sau khi download

### PDF

- Layout đẹp để in / gửi sếp
- Có header cửa hàng, ngày xuất, filter đã dùng

💡 **Mẹo**: Khi gửi manager, PDF đẹp hơn. Khi cần phân tích sâu, Excel linh hoạt hơn.

⚠️ **Chú ý**: Export file **> 10.000 dòng** sẽ chạy background → nhận link qua notification sau 1-5 phút.

---

## 11. Schedule gửi báo cáo tự động

Không cần login mỗi ngày để xem báo cáo — setup **gửi tự động** qua email.

### Bước 1: Mở schedule

Tại bất kỳ báo cáo nào, nhấn icon **[⏰ Schedule]** ở góc phải.

### Bước 2: Cấu hình

- **Tần suất**: Hàng ngày / Hàng tuần / Hàng tháng / Cron custom
- **Giờ gửi**: ví dụ 8h sáng
- **Người nhận**: danh sách email (có thể thêm nhiều)
- **Format**: Excel / PDF / cả 2
- **Subject** email
- **Body** email (hỗ trợ biến: `{{date}}`, `{{revenue}}`)
- **Filter cố định**: ví dụ luôn là cơ sở HN

### Bước 3: Save & activate

Nhấn **[Lưu & Kích hoạt]** → schedule chạy tự động từ ngày tiếp theo.

### Quản lý schedule

Sidebar → **Báo cáo → Schedule** (`/report_schedule`):

- Xem tất cả schedule đã tạo
- Pause / resume / delete
- Xem history lần gửi gần nhất

💡 **Mẹo chuẩn công ty nhỏ**:
- **Hàng ngày 8h sáng**: báo cáo doanh thu ngày hôm trước cho Store Manager
- **Thứ 2 hàng tuần**: top SP + tồn kho cho Purchaser
- **Ngày 1 hàng tháng**: P&L + KPI cho Chủ cửa hàng

> 🖼️ *Ảnh minh hoạ: Form schedule báo cáo — chụp sau*

---

## FAQ

**1. Báo cáo hiện số liệu khác với sổ kế toán — tại sao?**
Thường do: (a) Report dùng **ngày đơn hàng**, sổ kế toán dùng **ngày xuất hoá đơn** — lệch nhau; (b) Report gồm cả đơn CANCELLED nhưng chưa filter; (c) Khác kỳ (1-31 vs week-based). Check filter trước khi so sánh.

**2. Tôi có thể tạo báo cáo tuỳ chỉnh (custom) không?**
Có — dùng **Report Builder** (Sidebar → Báo cáo → Custom). Kéo thả dimension + metric, preview, save. Yêu cầu role `report.builder`.

**3. Export PDF bị lỗi font tiếng Việt?**
Kiểm tra trình duyệt Chrome ≥ 110. Nếu vẫn lỗi, đổi sang PDF engine khác ở **Cài đặt → Report config**.

**4. Tại sao báo cáo real-time có delay?**
Một số báo cáo dùng **data warehouse** sync mỗi 15 phút — không real-time 100%. Check góc trên phải có dòng "Cập nhật lần cuối: HH:MM".

**5. Schedule gửi email nhưng người nhận không thấy?**
Check: (a) Spam folder; (b) Email đúng chính tả; (c) Log schedule có báo sent OK không; (d) Dung lượng file < 20MB.

**6. Có thể gửi schedule qua Zalo thay email không?**
Hiện tại chỉ email. Zalo OA chỉ hỗ trợ ZNS cho template ngắn — không phù hợp file báo cáo.

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| "Kỳ quá dài, tối đa 2 năm" | Range > 730 ngày | Chia nhỏ kỳ |
| "Không có dữ liệu" | Filter loại hết | Nới filter |
| "Export timeout" | > 100k dòng | Chia nhỏ hoặc xuất background |
| "Quyền không đủ" | Role thiếu `report.view` | Liên hệ Admin |
| "Schedule không chạy" | Cron bị pause | Vào Schedule resume |

---

*Hết Part 11. Xem tiếp [Part 12 — Cài đặt](part-12-cai-dat.md).*
