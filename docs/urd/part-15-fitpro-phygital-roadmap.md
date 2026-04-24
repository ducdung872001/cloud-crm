# Part 15 — Roadmap FitPro Phygital

*URD bổ sung cho nhánh reborn-fitpro — cập nhật 2026-04-24*

Part này tổng hợp **phân tích gap** giữa tài liệu chiến lược Reborn JSC (3 PDF trong `docs/fitpro/info/`) và hiện trạng code, kèm **lộ trình triển khai 4 phase** đã được ban lãnh đạo duyệt.

> **Khác biệt với các Part khác của URD:** Part 01–14 mô tả yêu cầu **hệ thống đã đáp ứng**. Part 15 mô tả yêu cầu **sẽ đáp ứng trong các phiên bản tiếp theo** — dùng làm backlog chính thức cho team dev + BA. Sau khi mỗi phase hoàn tất, nội dung tương ứng sẽ được **di chuyển** sang các Part 01–14 (hoặc thêm Part mới) với trạng thái "Đã đáp ứng".

---

## Mục lục

- [1. Bối cảnh](#1-bối-cảnh)
- [2. Phân tích gap: PDF vs codebase hiện tại](#2-phân-tích-gap-pdf-vs-codebase-hiện-tại)
- [3. Phase 1 — Nền tảng INSIDE (quick wins)](#3-phase-1--nền-tảng-inside-quick-wins)
- [4. Phase 2 — USP sống còn (Money-Back + EGIFT + AI Nutrition)](#4-phase-2--usp-sống-còn)
- [5. Phase 3 — Mở rộng doanh thu](#5-phase-3--mở-rộng-doanh-thu)
- [6. Phase 4.2 — Public web Discover & Book](#6-phase-42--public-web-discover--book)
- [7. Phụ lục — Nguồn yêu cầu](#7-phụ-lục--nguồn-yêu-cầu)

---

## 1. Bối cảnh

### 1.1. Nguồn đầu vào

Ba tài liệu chiến lược đã được Ban lãnh đạo Reborn JSC phát hành tháng 4/2026:

| # | File | Mô tả |
|---|------|-------|
| PDF-1 | `Giới thiệu mô hình mới FitPro.pdf` | Transcript tổng quan HIRO FITNESS — 3 nỗi đau phòng gym, Phygital 20/80, 3 con số 0, tầm nhìn 10.000 trạm |
| PDF-2 | `FitPro_Health_Infrastructure.pdf` | Deck "Kiến tạo hạ tầng sức khỏe cho 100 triệu người Việt" — 3 loại trạm (HOME/CENTER/INSIDE), 5 tầng doanh thu, AI Nutrition Engine, Data Black Gold |
| PDF-3 | `FitPro_Inside_Phygital_Evolution.pdf` | Deck chuyên sâu **FitPro INSIDE** — plugin cấy vào gym có sẵn, hệ sinh thái trợ lực (Herbalife + Medlatec), 7 trải nghiệm Wow, 8 đặc quyền chủ gym |

Chat Zalo nhóm *FitPro - Reborn JSC* (21/04 → 22/04/2026) bổ sung chỉ đạo:
- Ưu tiên triển khai mô hình **FitPro INSIDE** cho chuỗi gym có sẵn.
- Mở rộng sang chuỗi **Spa brand khác** trong tương lai.
- "Hiện chưa ai có **Phygital công nghệ** cho Spa" → lợi thế khác biệt.

### 1.2. Nguyên tắc triển khai

1. **Neutral theo ngành** — kiến trúc phải đa-brand/đa-vertical (Gym / Spa / …) từ đầu, không hardcode FitPro.
2. **Backward compatibility** — các trạm Home/Co-Working đã tạo vẫn chạy; chỉ thêm type INSIDE + rename Co-Working → CENTER qua migration.
3. **Không phá module 7×7×7** — mạng lưới BO hiện có (Part 13 HDSD) độc lập với loại trạm.

---

## 2. Phân tích gap: PDF vs codebase hiện tại

### 2.1. Đã có — không cần làm

| # | Yêu cầu trong PDF | Đáp ứng tại |
|---|-------------------|-------------|
| G1 | Mạng lưới 7×7×7 (Master → Tier 1/2/3) | [URD Part 07](part-07-doi-tac-phan-hoi.md), [HDSD Part 13](../userguides/part-13-mang-luoi-7x7x7.md) |
| G2 | Hành trình 90 ngày (6 giai đoạn) | [HDSD Part 14](../userguides/part-14-hanh-trinh-90-ngay.md) |
| G3 | Thẻ liên thông (cross-station) | [HDSD Part 15.2](../userguides/part-15-fitpro-modules.md#thẻ-liên-thông) |
| G4 | Medlatec integration (chỉ số cơ thể) | [HDSD Part 15.3](../userguides/part-15-fitpro-modules.md#chỉ-số-cơ-thể) |
| G5 | Hoa hồng hệ thống 5%×3 tầng | [HDSD Part 15.6](../userguides/part-15-fitpro-modules.md#hoa-hồng-hệ-thống) |
| G6 | Phễu marketing + thư viện content | [HDSD Part 15.7](../userguides/part-15-fitpro-modules.md#phễu-marketing) |
| G7 | Booking 80k/buổi + Subscription 2.4tr/30 buổi | [URD Part 04](part-04-giao-dich.md), [URD Part 11](part-11-cai-dat-co-ban.md) |
| G8 | Onboarding MF7 — 7 ngày | [HDSD Part 15.9](../userguides/part-15-fitpro-modules.md#onboarding-mf7) |
| G9 | Tuân thủ SOP dashboard | [HDSD Part 15.4](../userguides/part-15-fitpro-modules.md#tuân-thủ-sop) |
| G10 | Khai thuế từng trạm | [HDSD Part 15.8](../userguides/part-15-fitpro-modules.md#khai-thuế-từng-trạm) |

### 2.2. Gap — cần bổ sung

| # | Gap | Nguồn | Phase |
|---|-----|-------|-------|
| A | **Loại trạm FitPro INSIDE** (code chỉ có Home + Co-Working) | PDF-2 tr.5, PDF-3 toàn bộ | 1 |
| B | Rename **Co-Working → CENTER** theo định vị mới | PDF-2 tr.5 | 1 |
| C | BO profile **"Chủ Gym Partner"** cho model INSIDE | PDF-3 tr.5 | 1 |
| D | Dashboard **mix doanh thu 20% Physical / 80% Digital & Nutrition** | PDF-1 mục 3, PDF-2 tr.3 | 1 |
| E | **Money-Back Guarantee** — cam kết hoàn tiền 30 ngày | PDF-2 tr.7, PDF-3 tr.7-9 | 2 |
| F | **EGIFT** — quà tặng Phygital cá nhân hóa | PDF-3 tr.8-9 | 2 |
| G | **AI Nutrition Engine** — tự tính khẩu phần sau mỗi buổi tập | PDF-2 tr.4 | 2 |
| H | **Commerce catalog** — bán dinh dưỡng chuyên sâu (e-commerce flow) | PDF-2 tr.8 | 3 |
| I | **B2B Wellness** — gói chăm sóc sức khỏe cho doanh nghiệp | PDF-2 tr.8 | 3 |
| J | **Data Insights** — analytics dài hạn (Data is Black Gold) | PDF-2 tr.7-8 | 3 |
| K | **Public web** fitpro.reborn.vn — Discover & Book không cần login | PDF-2 tr.4 | 4.2 |

---

## 3. Phase 1 — Nền tảng INSIDE (quick wins)

**Mục tiêu:** Có đủ FE + docs để sales nói chuyện INSIDE model với chủ gym đầu tiên. Thời gian dự kiến: 1-2 tuần.

### UR-FITPRO-01 — Loại trạm FitPro INSIDE

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-01 |
| **Tên yêu cầu** | Hệ thống hỗ trợ 3 loại trạm: HOME / CENTER / INSIDE |
| **Actor** | Master BO, BO, Admin tenant |
| **Mô tả** | Mở rộng enum `stationType` từ 2 giá trị (home, coworking) lên 3 giá trị (home, center, inside). Trạm INSIDE có metadata riêng: tên gym chủ nhà, tỷ lệ chia doanh thu, phạm vi plugin. |
| **Tiền điều kiện** | Tenant đã activate gói FitPro Network. |
| **Đầu vào** | Khi tạo/sửa trạm → chọn 1 trong 3 loại + fill các field tương ứng. |
| **Đầu ra** | Trạm mới lưu với type đúng; hiển thị badge màu + icon riêng trong list/map. |
| **Tiêu chí chấp nhận** | ① Form tạo trạm có radio 3 loại. ② List trạm lọc được theo loại. ③ Trạm INSIDE hiển thị thêm cột "Gym chủ nhà" + "Tỷ lệ chia". ④ Migration không làm hỏng trạm cũ (coworking tự map sang center). |
| **Mức ưu tiên** | **M** |
| **Ghi chú** | Code hiện: `EventVenue.type` trong `types.ts` + `StationType` enum ở storage + UI ở `fp_station_type`. Migration SQL: `UPDATE venue SET type='center' WHERE type='coworking'`. |

### UR-FITPRO-02 — BO profile "Chủ Gym Partner"

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-02 |
| **Tên yêu cầu** | Thêm profile thứ 5 cho Business Owner: "Chủ Gym Partner" |
| **Actor** | Master BO, BO Tier 1 |
| **Mô tả** | Khi mời/tạo BO, cho phép chọn profile thứ 5 là *"Chủ Gym Partner"* — áp dụng cho chủ gym đã có cơ sở vật chất đồng ý cấy plugin FitPro INSIDE. Profile này có chip filter riêng + badge màu nâu đặc thù. |
| **Đầu vào** | Profile enum = `gym_partner`. |
| **Đầu ra** | Badge mới trong card BO, filter chip "🏋️ Chủ Gym Partner" trong `/crm/ch_partners`. |
| **Tiêu chí chấp nhận** | Tạo BO profile này → thấy trong list + filter đúng. |
| **Mức ưu tiên** | **M** |
| **Ghi chú** | Tỷ lệ hoa hồng mặc định **4%** (giữa Dân VP 3% và Chủ DN 4%), chỉnh được tại tenant config. |

### UR-FITPRO-03 — Dashboard Mix Doanh thu 20/80

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-03 |
| **Tên yêu cầu** | Báo cáo doanh thu tách biệt nguồn Physical vs Digital/Nutrition |
| **Actor** | Master BO, BO, Kế toán |
| **Mô tả** | Thêm thẻ KPI mới trong Part 08.A "Doanh thu trạm": tỷ lệ **% Physical / % Digital & Nutrition**. Target mô hình Phygital là 20/80; khi trạm đi lệch xa khỏi ngưỡng này → hiện cảnh báo. |
| **Đầu vào** | Doanh thu trong kỳ, phân loại theo source tag của từng đơn hàng. |
| **Đầu ra** | Stacked bar chart 2 màu + 2 số % + badge "Đang lệch khỏi 20/80" nếu |physical%-20%| > 15%. |
| **Tiêu chí chấp nhận** | Mở `/crm/ch_report_revenue` thấy chart mới; drill-down mở ra list đơn theo nhóm. |
| **Mức ưu tiên** | **S** |

---

## 4. Phase 2 — USP sống còn

**Mục tiêu:** Triển khai 3 phân hệ tạo nên lời hứa bán hàng chính. Thời gian: 3-4 tuần.

### UR-FITPRO-MBG — Money-Back Guarantee

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-MBG |
| **Tên yêu cầu** | Cam kết hoàn tiền 30 ngày nếu không có kết quả |
| **Actor** | Hội viên (claim), Admin tenant (approve), Hệ thống |
| **Mô tả** | Hội viên mua gói FitPro được bảo hiểm 30 ngày: nếu sau ngày 30 không đạt ngưỡng kết quả (cân nặng/BMI/Body Fat), có quyền yêu cầu hoàn tiền 100%. Hệ thống so sánh baseline ↔ ngày 30, nếu không đạt → auto enable nút "Yêu cầu hoàn tiền" trong app hội viên. Admin review → tạo phiếu chi quỹ. |
| **Đầu vào** | Baseline Medlatec ngày 4-7, đo lại ngày 28-30, rule ngưỡng do tenant config. |
| **Đầu ra** | Nếu approved → phiếu chi từ quỹ MBG, status hội viên chuyển "Refunded", khoá gói. |
| **Tiêu chí chấp nhận** | ① Config rule UI có slider "Ngưỡng giảm cân tối thiểu %" / "Ngưỡng giảm body fat %" / "Ngưỡng tổng hợp". ② Workflow claim → review → refund trong 3 ngày. ③ Tích hợp [URD Part 06](part-06-tai-chinh.md) (quỹ "MBG-Reserve"). |
| **Mức ưu tiên** | **M** |
| **Ghi chú** | Cần decision: ngưỡng mặc định. Đề xuất: giảm cân ≥ 3% HOẶC giảm body fat ≥ 2% HOẶC BMI giảm ≥ 1 đơn vị (đạt 1 trong 3 là coi là có kết quả). |

### UR-FITPRO-EGIFT — Quà tặng Phygital cá nhân hóa

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-EGIFT |
| **Tên yêu cầu** | Hệ thống quà tặng theo cá nhân + sự kiện |
| **Actor** | Hội viên (nhận), BO (config rule + review), Hệ thống |
| **Mô tả** | Catalog gift gồm 2 loại: **vật lý** (áo FitPro, bình nước, sách) và **digital** (voucher giảm giá, buổi tư vấn riêng, quyền truy cập content). Rule trigger auto theo milestones Hành trình 90 ngày: complete baseline → gift A, complete re-test → gift B, renew gói → gift C. |
| **Đầu vào** | Catalog + rule + event trigger từ Part 14 Hành trình. |
| **Đầu ra** | Entry trong lịch sử gift của hội viên, status: *Queued / Shipped / Claimed / Expired*. |
| **Tiêu chí chấp nhận** | ① Admin CRUD được catalog. ② Rule khớp milestone → auto add gift. ③ Hội viên thấy gift trong app, redeem được. |
| **Mức ưu tiên** | **M** |

### UR-FITPRO-AI-NUT — AI Nutrition Engine

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-AI-NUT |
| **Tên yêu cầu** | Tự động gợi ý khẩu phần Protein/dinh dưỡng sau mỗi buổi tập |
| **Actor** | HLV, Hội viên |
| **Mô tả** | Dựa trên: (a) chỉ số cơ thể baseline + hiện tại từ Medlatec, (b) mục tiêu (giảm cân/tăng cơ/cải thiện sức khỏe), (c) cường độ buổi tập vừa kết thúc → hệ thống tính khẩu phần: g Protein, kcal, loại thực phẩm ưu tiên, gợi ý Herbalife SKU phù hợp. |
| **Đầu vào** | Profile hội viên + check-in record + baseline/current metrics. |
| **Đầu ra** | Notification đến app hội viên trong 5 phút sau check-out: "Hôm nay bạn nên bổ sung X g Protein; gợi ý: sản phẩm Y". |
| **Tiêu chí chấp nhận** | ① Công thức có thể config ở admin (hệ số g/kg, bổ sung sau tập). ② Gợi ý SKU chính xác từ catalog Herbalife. ③ Tracking: bao nhiêu % gợi ý được hội viên mua/tiêu thụ. |
| **Mức ưu tiên** | **S** |
| **Ghi chú** | V1 dùng công thức rule-based + lookup table; V2 có thể training ML model trên Data Insights sau này. |

---

## 5. Phase 3 — Mở rộng doanh thu

### UR-FITPRO-COMMERCE — Commerce catalog cho dinh dưỡng chuyên sâu

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-COMMERCE |
| **Tên yêu cầu** | E-commerce flow bán dinh dưỡng chuyên sâu |
| **Actor** | Hội viên (mua), Admin kho, BO |
| **Mô tả** | Tách product catalog dinh dưỡng ra khỏi [URD Part 10 Kho](part-10-kho.md) thành giao diện e-commerce: cart, checkout, payment gateway, tracking shipping. Hội viên có thể mua online sản phẩm Herbalife ngoài buổi tập, giao tại trạm hoặc ship tận nhà. |
| **Mức ưu tiên** | **S** |

### UR-FITPRO-B2B — B2B Wellness

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-B2B |
| **Tên yêu cầu** | Gói chăm sóc sức khỏe cho doanh nghiệp |
| **Actor** | HR của DN khách hàng, Admin tenant |
| **Mô tả** | Entity mới: Corporate Customer — mua gói cho N nhân viên. Billing định kỳ (tháng/quý). Dashboard riêng cho HR xem: số nhân viên đang active, tỷ lệ tập, kết quả tổng hợp (anonymized). |
| **Mức ưu tiên** | **S** |

### UR-FITPRO-DATA — Data Insights

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-DATA |
| **Tên yêu cầu** | Dashboard analytics dài hạn + external API |
| **Actor** | Master BO, Đối tác khoa học |
| **Mô tả** | Tổng hợp dữ liệu dinh dưỡng & vận động của toàn mạng lưới thành dataset, xuất bản dashboard + external API (có phí) cho đối tác nghiên cứu. Ẩn danh dữ liệu cá nhân theo chuẩn PDPA. |
| **Mức ưu tiên** | **C** |

---

## 6. Phase 4.2 — Public web Discover & Book

### UR-FITPRO-PUBLIC — Public web tìm trạm + đặt lịch

| Trường | Nội dung |
|--------|----------|
| **ID** | UR-FITPRO-PUBLIC |
| **Tên yêu cầu** | Trang web công khai fitpro.reborn.vn để khách lạ tìm trạm + đặt lịch thử không cần đăng nhập |
| **Actor** | Khách lạ, Hệ thống |
| **Mô tả** | SSR/SSG routes: `/`, `/tram`, `/tram/:slug`, `/dat-lich`. Cho phép: (1) Tìm trạm gần nhất bằng địa chỉ/geolocation, (2) Xem chi tiết trạm (ảnh, giờ mở, HLV, gói), (3) Đặt buổi thử miễn phí mà chỉ cần SĐT + OTP. |
| **Đầu ra** | Lead mới được tạo với source="public_web", gắn vào [Phễu marketing](../userguides/part-15-fitpro-modules.md#phễu-marketing) tầng "Warm lead". |
| **Tiêu chí chấp nhận** | ① SEO-friendly URL. ② Mobile-first responsive. ③ Core Web Vitals "Good". ④ Booking flow < 3 bước. |
| **Mức ưu tiên** | **S** |

---

## 7. Phụ lục — Nguồn yêu cầu

### 7.1. Map yêu cầu ← nguồn

| Requirement ID | PDF-1 | PDF-2 | PDF-3 | Zalo chat 22/04 |
|----------------|:-----:|:-----:|:-----:|:---------------:|
| UR-FITPRO-01 (INSIDE) | — | tr.5 | toàn bộ | ✓ |
| UR-FITPRO-02 (Chủ Gym Partner) | — | — | tr.4-5 | ✓ |
| UR-FITPRO-03 (Mix 20/80) | mục 3 | tr.3 | tr.3 | — |
| UR-FITPRO-MBG | mục 5 | tr.7 | tr.5, tr.7, tr.9 | — |
| UR-FITPRO-EGIFT | — | tr.8 | tr.8-9 | — |
| UR-FITPRO-AI-NUT | — | tr.4, tr.7 | — | — |
| UR-FITPRO-COMMERCE | — | tr.8 | — | — |
| UR-FITPRO-B2B | — | tr.8 | — | — |
| UR-FITPRO-DATA | — | tr.7-8 | — | — |
| UR-FITPRO-PUBLIC | — | tr.4 | — | — |

### 7.2. Lịch triển khai đề xuất

| Tuần | Hoạt động |
|------|-----------|
| T1-T2 | Phase 1 (3 UR) + Phase 2 bắt đầu song song — types, schemas, UI skeleton |
| T3-T4 | Phase 2 hoàn thiện (MBG + EGIFT + AI Nut) |
| T5-T8 | Phase 3 (Commerce + B2B + Data Insights) |
| T9-T10 | Phase 4.2 (Public web Discover & Book) |
| T11 | QA tổng + nghiệm thu + release v1.0 |

### 7.3. Decisions cần từ Ban lãnh đạo

1. **MBG ngưỡng kết quả mặc định** — đề xuất OR của 3 điều kiện (giảm cân ≥3% / giảm body fat ≥2% / BMI giảm ≥1).
2. **EGIFT ngân sách/hội viên** — hiện PDF không nêu; cần set budget mặc định (ví dụ 50.000đ/milestone).
3. **B2B Wellness pricing model** — per-seat hay pool? Deadline decision trước T5.
4. **Public web domain** — dùng `fitpro.reborn.vn` (cùng domain CRM) hay domain riêng `fitpro.vn`?

---

---

## 8. Phân chia Backend theo microservice

Dựa trên danh sách 10 microservice hiện có tại `docs/microservices/list.txt` (billing, care, contract, customer, integration, inventory, logistics, market, notification, sales), Part 15 này map từng UR vào microservice phụ trách. Các UR không fit microservice nào → đề xuất microservice mới ở [mục 8.3](#83-đề-xuất-microservice-mới).

### 8.1. Mapping UR → microservice (v2 — đã được Ban lãnh đạo duyệt lại 2026-04-24)

**Nguyên tắc:** ưu tiên **gộp vào service hiện có** nếu ngữ nghĩa khớp; chỉ tách microservice mới khi thật sự đặc thù ngành (domain knowledge không dùng chung được) hoặc workload khác biệt (OLAP vs OLTP).

| UR | Microservice chính | Microservice phụ | Ghi chú |
|----|---------------------|-------------------|---------|
| UR-FITPRO-01 (INSIDE station type) | `market` | — | Events/trạm đang ở `/bizapi/market/events/*` — mở rộng schema + enum |
| UR-FITPRO-02 (Chủ Gym Partner profile) | `market` | — | Cùng bảng `partner`/`business_owner` với 4 profile cũ |
| UR-FITPRO-03 (Mix 20/80 report) | `sales` | `billing` | Doanh thu lấy từ invoice (`sales`), phân nhóm source; báo cáo chi/quỹ từ `billing` |
| UR-FITPRO-MBG (Money-Back Guarantee) | `care` (claim + rule + workflow) | `billing` (phiếu chi MBG-Reserve), `customer`, `market` | Phân tán: **`care`** chứa rule engine + claim lifecycle (bảo vệ quyền lợi sau bán), **`billing`** chứa quỹ MBG-Reserve + phiếu chi khi approved. Không tách service mới. |
| UR-FITPRO-EGIFT (Quà tặng Phygital) | `market` | `inventory`, `logistics`, `notification` | Quy hoạch vào **`market`** — tư duy: giữ chân khách → bán mới/lại/chéo = marketing retention. Catalog gift + rule trigger đặt cùng voucher/promotion hiện có. |
| UR-FITPRO-AI-NUT (AI Nutrition Engine) | **`nutrition`** (MỚI — đã duyệt) | `market`, `integration` (Medlatec), `inventory`, `sales` | Đặc thù ngành fitness/y tế, thuật toán độc quyền — tách service riêng để scale + bảo mật thuật toán. |
| UR-FITPRO-COMMERCE (E-commerce dinh dưỡng) | `sales` | `inventory`, `logistics` | Cart/checkout/payment dùng sales hiện có, mở rộng API public |
| UR-FITPRO-B2B (B2B Wellness) | `customer` | `sales`, `billing` | Corporate entity mới trong customer; gói & billing dùng sales + billing |
| UR-FITPRO-DATA (Data Insights) | **`analytics`** (MỚI — đã duyệt) | tất cả (read-only) | Aggregation + external API có phí — domain riêng, tách để không làm nặng transaction DBs |
| UR-FITPRO-PUBLIC (Discover & Book) | `market` | `customer`, `sales` | Extend public endpoints `/market/events/public/*` hiện có |

### 8.2. Tóm tắt ảnh hưởng các microservice hiện có

| Microservice | Thay đổi | UR liên quan |
|--------------|----------|--------------|
| `market` | Schema: thêm `station_type=inside`, BO profile `gym_partner`; API public mở rộng cho Discover & Book; **EGIFT** catalog + rule trigger + inbox gift (quy hoạch vào đây, không tách loyalty service) | UR-01, 02, 10, EGIFT |
| `care` | **MBG claim + rule engine + review workflow** (cam kết hoàn tiền = bảo vệ quyền lợi khách sau bán) | UR-MBG |
| `sales` | Invoice source tag (physical/digital/nutrition) + B2B invoice type + public cart | UR-03, 07, 08, 10 |
| `billing` | **Quỹ dự phòng "MBG-Reserve" + phiếu chi khi MBG approved**; B2B billing định kỳ | UR-MBG, 08 |
| `customer` | Corporate customer entity + MBG claim status flag | UR-MBG, 08 |
| `inventory` | Gift catalog vật lý (stock SKU cho EGIFT); nutrition SKU | EGIFT, 06, 07 |
| `logistics` | Ship gift + dinh dưỡng chuyên sâu | EGIFT, 06 |
| `integration` | Medlatec API (đã có) cần mở rộng cho AI Nutrition; external API Data Insights | UR-AI-NUT, 09 |
| `notification` | Push EGIFT trigger + AI Nutrition tip sau buổi tập + MBG claim status change | EGIFT, AI-NUT, MBG |

### 8.3. Đề xuất microservice mới (đã chốt — CHỈ 2 cái)

#### 8.3.1. `nutrition` — AI Nutrition Engine

| Trường | Nội dung |
|--------|----------|
| **Tên gợi ý** | `nutrition` |
| **Domain** | Tính khẩu phần cá nhân hoá + recommend SKU + track compliance. |
| **Responsibility** | (1) Công thức tính Protein/kcal theo profile + chỉ số, (2) Lookup table mapping ngưỡng → SKU Herbalife, (3) Track: bao nhiêu % gợi ý được hội viên tiêu thụ (có mua trong `sales`), (4) Feedback loop để điều chỉnh công thức. |
| **URL prefix dự kiến** | `/bizapi/nutrition/*` |
| **Phụ thuộc** | `market` (check-in event + profile hội viên), `integration` (Medlatec dữ liệu máu), `inventory` (catalog SKU), `sales` (track tiêu thụ). |
| **Tại sao tách microservice riêng?** | Đặc thù ngành fitness/y tế — công thức độc quyền, phụ thuộc dữ liệu sinh trắc không dùng chung cho các ngành khác. |
| **Độ ưu tiên** | 🟡 **Trung bình** — Phase 2 task cuối. |

#### 8.3.2. `analytics` — Data Insights & External API

| Trường | Nội dung |
|--------|----------|
| **Tên gợi ý** | `analytics` |
| **Domain** | Aggregation layer, data warehouse, dashboard nâng cao, external API có phí cho đối tác. |
| **Responsibility** | (1) ETL từ các microservice sang warehouse (read-only), (2) Precompute metrics dài hạn, (3) External API partners (có quota + billing), (4) Data export cho đối tác nghiên cứu (ẩn danh). |
| **URL prefix dự kiến** | `/bizapi/analytics/*` hoặc `api.reborn.vn/analytics/*` (nếu tách gateway) |
| **Phụ thuộc** | Read-only từ tất cả microservice chính. |
| **Tại sao không gộp vào `sales`/`market`?** | Analytics là **workload khác biệt** (OLAP vs OLTP). Gộp vào sẽ làm nặng transactional DB và khó scale. |
| **Độ ưu tiên** | 🟢 **Thấp** — Phase 3, có thể làm đơn giản V1 bằng materialized view trong sales/market, tách sau. |

#### 8.3.3. Hai microservice đã xét và **quyết định không tách**

Trong phiên review 2026-04-24, Ban lãnh đạo đã quyết định **không tạo mới** 2 service sau, thay vào đó phân tán trách nhiệm vào các service hiện có:

**`guarantee` (Money-Back Guarantee) — ĐÃ TỪ CHỐI**
- **Quyết định:** Phân tán — `care` nhận claim + rule + workflow (bảo vệ quyền lợi khách sau bán); `billing` nhận quỹ MBG-Reserve + phiếu chi.
- **Lý do:** Cam kết hoàn tiền không phải domain đặc thù đến mức cần service riêng. Ngữ nghĩa "bảo vệ quyền lợi sau bán" khớp với `care`; phần tiền bạc gộp vào `billing` đúng với nguyên tắc "mọi thứ liên quan thanh toán/kế toán đều ở billing".

**`loyalty` (EGIFT) — ĐÃ TỪ CHỐI**
- **Quyết định:** Quy hoạch vào `market`.
- **Lý do:** Tư duy user: giữ chân khách → bán mới/bán lại/bán chéo = marketing retention. EGIFT là một dạng marketing retention, không cần service riêng.

### 8.4. Quy trình gửi task BE

Khi triển khai từng UR ở các phase, prompts BE sẽ được lưu tại:
- Microservice hiện có: `docs/backend-tasks/<tên-service>/BACKEND-TASK-fitpro-<UR-id>.md`
- Microservice mới: tạo thư mục mới `docs/backend-tasks/<tên-mới>/` kèm file README giải thích domain, rồi đặt task trong đó.

Mỗi task BE kèm thông tin: microservice, endpoint, shape request/response, migration SQL, test case xác nhận.

---

*Hết Part 15 URD. Nội dung được duyệt bởi Ban lãnh đạo Reborn JSC theo chỉ đạo chat Zalo nhóm "FitPro - ReBorn JSC" ngày 22/04/2026.*
