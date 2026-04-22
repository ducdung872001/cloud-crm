# ĐỀ XUẤT GIẢI PHÁP: Nền tảng Loyalty cho chuỗi siêu thị bán lẻ

**Phiên bản:** 1.1 (cập nhật theo Q&A khảo sát khách hàng)  
**Ngày:** 23/04/2026  
**Đơn vị triển khai:** Reborn JSC  
**Liên hệ:** ceo@reborn.vn  

---

## MỤC LỤC

1. [Tóm tắt điều hành](#1-tóm-tắt-điều-hành)
2. [Hiểu biết về bài toán](#2-hiểu-biết-về-bài-toán)
3. [Giải pháp đề xuất](#3-giải-pháp-đề-xuất)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Chi tiết tính năng](#5-chi-tiết-tính-năng)
6. [Tích hợp hệ thống hiện có](#6-tích-hợp-hệ-thống-hiện-có)
7. [Lộ trình triển khai](#7-lộ-trình-triển-khai)
8. [Yêu cầu từ phía khách hàng](#8-yêu-cầu-từ-phía-khách-hàng)
9. [Cam kết & SLA](#9-cam-kết--sla)
10. [Phụ lục A: Demo screenshots](#10-phụ-lục-a-demo-screenshots)
11. [Phụ lục B: Đối chiếu Q&A khảo sát](#11-phụ-lục-b-đối-chiếu-qa-khảo-sát)

---

## 1. TÓM TẮT ĐIỀU HÀNH

### Bài toán
Quý khách đang vận hành chuỗi siêu thị bán lẻ với **2 thương hiệu**, **~300 cửa hàng** (kế hoạch 1.000–1.500 điểm bán trong 1–3 năm), phục vụ **~3 triệu hội viên**, xử lý **~150.000 giao dịch/ngày** (peak lễ/sale ~300.000/ngày). Hạ tầng loyalty hiện tại chạy rời rạc trên nhiều công cụ:

- **Goldmem** — quản lý thông tin KHTV, đăng ký, thay đổi thông tin, quyền lợi sinh nhật, lịch sử mua hàng
- **Microsoft Access** — tổng hợp danh mục KHTV, lịch sử quyền lợi tích lũy/phát sinh
- **Microsoft Excel** — tổng hợp, xử lý, dashboard KHTV
- **Supporter** — ghi nhận khiếu nại KH (tên, SĐT, nội dung, mức độ, kết quả)

**Hệ quả:**
- Dữ liệu **rải rác ở nhiều hệ thống, không liên kết** → mọi thao tác đều thủ công, chậm, phụ thuộc kỹ năng nhân sự
- **2 brand loyalty hoạt động độc lập** — khách cùng 1 người nhưng mỗi brand nhận diện riêng, không upsell chéo được
- **Marketing hiện phải thuê agency ngoài** — mất quyền chủ động nội dung/lịch/phân khúc
- **Ứng dụng CNTT chưa cao** — dịch vụ thủ công, thiếu hấp dẫn khách hàng

### Giải pháp
**Reborn Loyalty Platform** — nền tảng loyalty tập trung, **hợp nhất data từ Goldmem + Access + Excel + Supporter** vào 1 kho duy nhất, tích hợp POS/e-commerce/app qua API. Không thay thế POS bán hàng, chỉ thay thế lớp quản lý KHTV + loyalty + CSKH rời rạc hiện tại bằng 1 nền tảng thống nhất, tự động hoá tối đa — giảm phụ thuộc thủ công và agency ngoài.

### Điểm nổi bật

| | |
|---|---|
| **Tích hợp, không thay POS** | Kết nối POS hiện có qua REST API — không cần đổi phần mềm bán hàng ở quầy |
| **Thay thế Goldmem/Access/Excel** | Gộp 4 công cụ rời rạc thành 1 nền tảng, giảm thao tác thủ công |
| **Đa thương hiệu native** | 1 nền tảng quản lý loyalty cho nhiều brand, điểm dùng chéo hoặc riêng theo cấu hình |
| **Scale 3M khách, 150K giao dịch/ngày** | Kiến trúc đã tối ưu cho dataset lớn, chịu được peak x2 trong dịp lễ/sale |
| **Online + Offline + App** | Tích điểm tại quầy, website e-com, app di động đồng bộ realtime |
| **Marketing automation nội bộ** | Email/SMS/Push/Zalo OA tự vận hành — giảm phụ thuộc agency ngoài |
| **Mở rộng đến 1.500 điểm bán** | Kiến trúc multi-tenant, multi-branch sẵn sàng cho kế hoạch 3 năm |
| **Có sẵn, deploy nhanh** | Platform đã xây dựng, cấu hình theo nhu cầu — không code lại từ đầu |
| **Team IT khách tự vận hành** | Admin dashboard + API docs đầy đủ, phòng CNTT&CĐS tự quản lý |

---

## 2. HIỂU BIẾT VỀ BÀI TOÁN

### 2.1. Hiện trạng hệ thống (ghi nhận từ Q&A khảo sát)

```
           ┌───────────────────────────────────────────────┐
           │    DỮ LIỆU KHTV PHÂN TÁN TẠI 4+ CÔNG CỤ       │
           │                                               │
  ┌────────┴────────┐  ┌──────────────┐  ┌──────────────┐  │
  │   Goldmem       │  │  MS Access   │  │  MS Excel    │  │
  │ Thông tin KHTV  │  │ Tổng hợp     │  │ Dashboard    │  │
  │ Đăng ký, sửa    │  │ quyền lợi,   │  │ xử lý dữ     │  │
  │ Quyền lợi       │  │ lịch sử tích │  │ liệu         │  │
  │ Lịch sử mua     │  │ lũy          │  │              │  │
  └────────┬────────┘  └──────┬───────┘  └──────┬───────┘  │
           │  ┌──────────────┐│                 │          │
           │  │  Supporter   ││                 │          │
           │  │  Khiếu nại   ││                 │          │
           │  │  CSKH        ││                 │          │
           │  └──────┬───────┘│                 │          │
           │         │        │                 │          │
           │    LIÊN KẾT THỦ CÔNG, THIẾU CÔNG CỤ          │
           └────────────────────────────────────────────────┘
                              │
  ┌──────────────┐           │           ┌──────────────┐
  │   Brand A    │           │           │   Brand B    │
  │ POS, website,│───────────┴───────────│ POS, website,│
  │ mobile app   │   (hoạt động riêng)   │ mobile app   │
  │ ~3M KHTV chung                       │
  └──────────────┘                       └──────────────┘
```

**Vấn đề cốt lõi (tổng hợp từ trả lời khảo sát):**

| # | Vấn đề | Hệ quả |
|---|--------|--------|
| 1 | Dữ liệu KHTV **rải rác Goldmem + Access + Excel + Supporter**, liên kết thủ công | Mỗi lần truy vấn 1 KH phải tra 3–4 nơi, mất thời gian, dễ sai |
| 2 | 2 brand loyalty độc lập, khách cùng 1 người nhận diện riêng | Không upsell chéo, không khuyến khích khách mua cả 2 brand |
| 3 | Thao tác KHTV **chủ yếu thủ công**, phụ thuộc kỹ năng nhân sự | Không scale được, nghỉ việc là gãy quy trình |
| 4 | Không có dashboard/báo cáo hợp nhất toàn chuỗi | BOD thiếu data ra quyết định chiến lược |
| 5 | **Dịch vụ chưa ứng dụng CNTT cao** — marketing phải thuê agency | Chi phí cao, không chủ động nội dung, không cá nhân hoá |
| 6 | Khiếu nại ghi trong Supporter, tách khỏi profile KH | CSKH không biết khách đó hạng gì, lịch sử mua thế nào khi tiếp nhận khiếu nại |

### 2.2. Khảo sát nhanh (kết quả Q&A)

| Tiêu chí | Kết quả khách hàng cung cấp |
|----------|-------------------------|
| Mô hình kinh doanh | Bán lẻ Online + Offline (POS + website + mobile app) |
| Số thương hiệu | 2 brand |
| Số cửa hàng hiện tại | ~300 store |
| Kế hoạch mở rộng 1–3 năm | **1.000–1.500 điểm bán** + mở rộng online, đối tác, hệ sinh thái |
| Số hội viên | ~3 triệu KHTV |
| Tỷ lệ KHTV có phát sinh mua | **70–80%** (rất cao) |
| Giao dịch trung bình/ngày | **~150.000 giao dịch** (năm 2025) |
| Giao dịch peak (lễ/sale) | **~300.000 giao dịch/ngày** (gấp đôi) |
| Hệ thống đang dùng | Goldmem, MS Access, MS Excel, Supporter |
| Loyalty hiện tại | Đã có tại **tất cả** điểm bán lẻ + website + app |
| Khả năng tích hợp API | Có, tuỳ chức năng (POS real-time: Phòng CNTT&CĐS nắm) |
| Marketing automation | Đang thuê agency ngoài |
| Hạ tầng on-prem / cloud | Phòng CNTT&CĐS nắm (đang xác nhận) |
| Team công nghệ | Có **Phòng CNTT&CĐS** chuyên trách |

### 2.3. Insight rút ra

- **70–80% KHTV active** — tài sản khách hàng đã rất tốt, bài toán không phải "giữ chân" mà là **nâng giá trị vòng đời** (CLV), cá nhân hoá và upsell
- **150K giao dịch/ngày, peak 300K** — yêu cầu kiến trúc chịu tải cao, latency < 500ms, không được nghẽn POS giờ vàng
- **Kế hoạch 1.000–1.500 điểm bán** — nền tảng cần **multi-tenant + multi-branch native** để cấu hình theo từng cửa hàng/vùng mà không phải deploy riêng
- **4 công cụ rời rạc** — chọn giải pháp hợp nhất dữ liệu, có migration tự động từ Goldmem/Access/Excel
- **Marketing phụ thuộc agency** — cần marketing automation nội bộ để khách chủ động chiến dịch, phân khúc, kịch bản
- **Có Phòng CNTT&CĐS** — khách có năng lực tiếp nhận, ưu tiên giải pháp **API-first + docs chi tiết** để team IT tự tích hợp, mở rộng

---

## 3. GIẢI PHÁP ĐỀ XUẤT

### 3.1. Tổng quan kiến trúc

```
                    ┌──────────────────────────────┐
                    │     REBORN LOYALTY PLATFORM   │
                    │                              │
  ┌──────────┐     │  ┌────────────────────────┐  │     ┌──────────┐
  │ Brand A  │     │  │  Loyalty Engine        │  │     │ Brand B  │
  │ POS      │◄────┼──│  - Tích điểm tự động   │──┼────►│ POS      │
  │ (giữ     │ API │  │  - Hạng thành viên     │  │ API │ (giữ     │
  │  nguyên) │     │  │  - Đổi thưởng          │  │     │  nguyên) │
  └──────────┘     │  │  - Hạn điểm            │  │     └──────────┘
                    │  └────────────────────────┘  │
  ┌──────────┐     │  ┌────────────────────────┐  │     ┌──────────┐
  │ Website  │     │  │  Admin Dashboard       │  │     │ App KH   │
  │ e-com    │◄────┼──│  - Quản lý hội viên    │──┼────►│ (tương   │
  └──────────┘     │  │  - Cấu hình rules      │  │     │  lai)    │
                    │  │  - Báo cáo & phân tích │  │     └──────────┘
                    │  │  - API docs            │  │
                    │  └────────────────────────┘  │
                    │                              │
                    │  ┌────────────────────────┐  │
                    │  │  Data Hub              │  │
                    │  │  - 3M+ hội viên        │  │
                    │  │  - Cross-brand merge   │  │
                    │  │  - Webhook events      │  │
                    │  └────────────────────────┘  │
                    └──────────────────────────────┘
```

### 3.2. Nguyên tắc thiết kế

| Nguyên tắc | Giải thích | Giải bài toán nào |
|------------|-----------|-------------------|
| **Tích hợp, không thay POS** | POS hiện tại giữ nguyên. Loyalty chỉ nhận data qua API sau khi thanh toán | Không làm gián đoạn ~150K giao dịch/ngày |
| **Tự động hoá tối đa, giảm thủ công** | Mọi thao tác KHTV (đăng ký, tích điểm, thăng hạng, hết hạn, đổi thưởng) chạy bằng cron + rule engine | Giải vấn đề "chủ yếu thao tác thủ công, phụ thuộc kỹ năng nhân sự" |
| **Hợp nhất dữ liệu về 1 nguồn** | Goldmem + Access + Excel + Supporter → 1 hồ sơ KH duy nhất (360° view) | Giải vấn đề dữ liệu rải rác, liên kết thủ công |
| **Cấu hình, không code** | Mọi rule (tích điểm, hạng, hạn, scope, campaign) cấu hình trên giao diện | Team nghiệp vụ tự thay đổi, không phụ thuộc IT/agency |
| **Đa thương hiệu + đa chi nhánh native** | Multi-tenant + multi-brand + multi-branch từ đầu | Sẵn sàng cho 1.000–1.500 điểm bán trong 3 năm |
| **API-first** | Mọi tính năng đều có API — Phòng CNTT&CĐS tự tích hợp thêm hệ thống | Tận dụng năng lực IT nội bộ khách |
| **Scale 3M KH, 300K txn/ngày peak** | Batch processing, async jobs, index tối ưu, Redis cache | Chịu được peak lễ/sale, không nghẽn POS |

---

## 4. KIẾN TRÚC HỆ THỐNG

### 4.1. Stack công nghệ

| Layer | Công nghệ | Lý do |
|-------|----------|-------|
| Frontend | React 18 + TypeScript + Vite | SPA hiệu năng cao, code-split theo route |
| API Gateway | REST + JWT + Hostname routing | Multi-tenant, mỗi brand 1 hostname |
| Backend | Java Spring Boot microservices | Ổn định, scale tốt, ecosystem Java phong phú |
| Database | MySQL 8 | Proven ở scale 3M+ records, JSON column hỗ trợ config linh hoạt |
| Cache | Redis | Session, rate limit, point balance cache |
| Queue | RabbitMQ | Async: point calculation, webhook delivery, batch import |
| Hosting | Cloud VPS / On-premise | Linh hoạt theo yêu cầu bảo mật data |

### 4.2. Microservice liên quan

| Service | Chức năng | Endpoint prefix |
|---------|----------|----------------|
| **Market** | Loyalty engine: wallet, points, tiers, rewards, config | `/bizapi/market/loyalty*` |
| **Customer** | Quản lý thông tin khách hàng, merge cross-brand | `/bizapi/customer/*` |
| **Notification** | SMS, Email, Push thông báo điểm/hạng/KM | `/bizapi/notification/*` |
| **Auth** | SSO, JWT, API key management | `/authenticator/*` |

### 4.3. Bảo mật

- **JWT + API Key**: 2 cơ chế auth — JWT cho admin dashboard, API key cho POS integration
- **Hostname isolation**: Mỗi brand 1 hostname → data tách biệt ở application level
- **HTTPS only**: Mọi API call encrypt
- **Rate limit**: 1000 req/min/key — chống abuse
- **Audit log**: Mọi thay đổi config đều log ai, khi nào, thay đổi gì

---

## 5. CHI TIẾT TÍNH NĂNG

### 5.1. Quản lý hội viên

| Tính năng | Mô tả |
|-----------|-------|
| **Danh sách hội viên** | Tra cứu, lọc, phân trang 3M+ records |
| **Thẻ hội viên ảo** | Barcode/QR cho mỗi hội viên — scan tại quầy POS |
| **In thẻ** | In thẻ vật lý (batch hoặc từng thẻ) |
| **Import hàng loạt** | Upload CSV 3M khách từ hệ thống cũ, tự dedupe theo SĐT |
| **Merge cross-brand** | Gộp profile trùng SĐT từ 2 brand → 1 hồ sơ |
| **Lịch sử điểm** | Sổ cái chi tiết mọi giao dịch tích/tiêu/hết hạn |
| **Export Excel** | Xuất danh sách hội viên + lịch sử điểm |

### 5.2. Tích điểm

| Tính năng | Mô tả |
|-----------|-------|
| **Tích tự động** | POS gửi hoá đơn qua API → hệ thống tự tính điểm theo rule |
| **Tích theo hoá đơn** | VD: 10,000đ = 1 điểm |
| **Tích theo danh mục** | SP cao cấp tích gấp đôi, SP khuyến mãi không tích |
| **Min spend** | Đơn dưới 50,000đ không tích điểm (configurable) |
| **Nhân hệ số** | x2 cuối tuần, x3 sinh nhật, tùy cấu hình |
| **Nhiều rule song song** | Ưu tiên theo priority, áp dụng đồng thời |

### 5.3. Hạng thành viên (Tier)

| Tính năng | Mô tả |
|-----------|-------|
| **4+ hạng tùy chỉnh** | VD: Đồng → Bạc → Vàng → Kim Cương (tên + ngưỡng + quyền lợi) |
| **Thăng hạng tự động** | Đạt ngưỡng chi tiêu/điểm → lên hạng ngay |
| **Hạ hạng tự động** | Cuối kỳ đánh giá không đạt → hạ (có ân hạn 30 ngày cảnh báo) |
| **Chu kỳ đánh giá** | Tháng / Quý / Năm — cấu hình linh hoạt |
| **Tiêu chí** | Tổng chi tiêu / Tổng điểm / Số đơn hàng |
| **Quyền lợi theo hạng** | Tỷ lệ tích khác nhau, giảm giá birthday, ưu tiên CSKH |

### 5.4. Hạn sử dụng điểm

| Tính năng | Mô tả |
|-----------|-------|
| **3 chế độ** | Không hết hạn / Hết hạn sau X tháng / Hết hạn cuối năm |
| **FIFO** | Điểm cũ trừ trước khi đổi thưởng |
| **Thông báo** | Nhắc khách 30/14/7 ngày trước khi điểm hết hạn |
| **Cron tự động** | Hệ thống chạy hàng đêm, tự trừ điểm hết hạn |

### 5.5. Phạm vi áp dụng (Multi-brand)

| Tính năng | Mô tả |
|-----------|-------|
| **Toàn chuỗi** | 1 chương trình loyalty chung cho tất cả store, tất cả brand |
| **Theo thương hiệu** | Mỗi brand có rule riêng (tỷ lệ tích, hạng, rewards khác nhau) |
| **Theo nhóm cửa hàng** | VD: miền Bắc / miền Nam rule khác nhau |
| **Điểm dùng chéo** | Tích ở Brand A → đổi thưởng ở Brand B (bật/tắt) |

### 5.6. Đổi thưởng

| Tính năng | Mô tả |
|-----------|-------|
| **Catalog quà** | Voucher giảm giá, quà vật lý, dịch vụ, thăng hạng |
| **Điểm → VND** | Tỷ giá quy đổi cấu hình (VD: 1 điểm = 1,000đ) |
| **Trừ trực tiếp** | Khách dùng điểm trừ vào hoá đơn tại POS |
| **Giới hạn** | Số lượng quà có hạn, hạn đổi, min điểm |

### 5.7. Dashboard & Báo cáo

| Tính năng | Mô tả |
|-----------|-------|
| **KPI tổng hợp** | Tổng hội viên, active rate, điểm lưu hành, điểm đã đổi |
| **Phân bổ hạng** | Donut chart Đồng/Bạc/Vàng/Kim Cương |
| **Retention rate** | Tỷ lệ khách quay lại theo tháng |
| **CLV** | Customer Lifetime Value theo phân khúc |
| **Xu hướng điểm** | Biểu đồ tích/tiêu điểm theo thời gian |
| **Export** | Xuất báo cáo Excel |

### 5.8. Chế độ hoạt động linh hoạt

| Chế độ | Mô tả |
|--------|-------|
| **Loyalty thuần** | Chỉ bật phân hệ Loyalty + Cài đặt — dành cho khách đã có POS riêng |
| **Loyalty + Marketing** | Thêm marketing campaign, phân tích khách hàng |
| **Đầy đủ** | Bật tất cả: bán hàng, kho, tài chính, loyalty, báo cáo — cho khách muốn 1 hệ thống tổng |

→ **Chuyển đổi bằng 1 click** trong Cấu hình, không cần cài đặt lại.

---

## 6. TÍCH HỢP HỆ THỐNG HIỆN CÓ

### 6.1. Luồng tích hợp POS

```
  Khách mua hàng tại quầy
         │
         ▼
  ┌──────────────┐
  │ POS hiện tại │  Thanh toán bình thường
  │ (giữ nguyên) │
  └──────┬───────┘
         │ Sau khi thanh toán xong
         ▼
  ┌──────────────────────────────────────┐
  │ POST /market/loyaltyPointLedger/     │
  │      autoEarn                        │
  │                                      │
  │ { phone, orderAmount, orderId,       │
  │   branchId, items[] }                │
  └──────────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │ Reborn Loyalty Engine                │
  │                                      │
  │ 1. Tra cứu hội viên by phone        │
  │ 2. Áp dụng rule tích điểm           │
  │ 3. Cộng điểm vào wallet             │
  │ 4. Kiểm tra thăng hạng              │
  │ 5. Response: { pointsEarned,         │
  │                newBalance, tier }     │
  └──────────────┬───────────────────────┘
                 │
                 ▼
  POS hiển thị: "Bạn vừa tích 52 điểm. Số dư: 1,302 điểm. Hạng: Bạc"
```

### 6.2. API có sẵn

| Nhóm | Endpoint | Mô tả |
|------|----------|-------|
| **Tra cứu** | `GET /loyaltyWallet/getByCustomer` | Tra cứu hội viên theo SĐT/ID |
| **Tích điểm** | `POST /loyaltyPointLedger/autoEarn` | POS gửi hoá đơn → tự tích |
| **Tiêu điểm** | `POST /loyaltyPointLedger/consumePoint` | Dùng điểm thanh toán |
| **Đổi thưởng** | `GET /loyaltyReward/list` | DS phần thưởng khả dụng |
| **Hạng** | `GET /loyaltySegment/list` | DS hạng thành viên |
| **Config** | `GET /loyaltyConfig/get` | Tỷ giá, hạn điểm, scope |
| **Webhook** | Events: points.earned, tier.changed, etc. | Realtime notification |
| **Import** | `POST /loyaltyWallet/import` | Bulk import CSV |

### 6.3. Tài liệu API

Hệ thống có **trang API Docs tích hợp sẵn** trong admin dashboard:
- 7 tab: Tổng quan, Xác thực, Hội viên, Tích/Tiêu điểm, Đổi thưởng, Webhook, SDK
- Code mẫu: cURL, JavaScript, Python
- Hướng dẫn flow POS step-by-step

→ Team IT của khách đọc docs + tích hợp độc lập, không cần hỗ trợ liên tục.

### 6.4. Migration từ Goldmem / Access / Excel / Supporter

```
   Goldmem (KHTV, lịch sử) ──┐
   MS Access (quyền lợi)    ──┤
   MS Excel (bảng tổng hợp)  ──┼─► ETL + Dedupe ─► Bulk Import ─► Reborn
   Supporter (khiếu nại)    ──┘   (theo SĐT)       (preview,      Loyalty
                                                    confirm)    (1 hồ sơ KH
                                                                  360°)
```

**Bước 1 — Khảo sát & mapping (Tuần 1–2):** 
Làm việc với Phòng CNTT&CĐS để lấy schema từng hệ thống, mapping trường dữ liệu về data model chuẩn của Reborn (customer, wallet, point, tier, complaint).

**Bước 2 — Export & ETL (Tuần 3):** 
Export full data từ Goldmem (KHTV + lịch sử mua), Access (quyền lợi), Excel (bảng tổng hợp), Supporter (khiếu nại). ETL pipeline tự làm sạch, chuẩn hoá SĐT, loại trùng.

**Bước 3 — Import + dedupe (Tuần 4):**
Upload vào Reborn → preview 3 triệu record, highlight các profile trùng SĐT giữa Brand A và Brand B → confirm → hệ thống tự merge, gộp điểm, gộp lịch sử.

**Bước 4 — Chạy song song (Tuần 5–8):**
Cả 2 hệ thống cũ + Reborn cùng chạy 1 tháng. POS tạm gửi data đến cả 2 để đối soát. Team nghiệp vụ kiểm tra số liệu, tính đúng.

**Bước 5 — Cutover (Tuần 9):**
Chuyển hoàn toàn sang Reborn. Goldmem/Access/Excel/Supporter tắt dần, chỉ giữ chế độ chỉ đọc (archive) trong 6 tháng để tra cứu ngược.

**Bước 6 — Mở rộng (Tuần 10–24):**
Rollout ra toàn bộ ~300 cửa hàng, bật dần các module nâng cao (marketing automation, RFM, CLV).

---

## 7. LỘ TRÌNH TRIỂN KHAI

### Phase 1: Nền tảng + Migration (Tháng 1–2)

| Tuần | Công việc |
|------|----------|
| T1–2 | Khảo sát Goldmem/Access/Excel/Supporter, mapping schema, làm việc Phòng CNTT&CĐS về POS API |
| T3 | Export data 4 hệ thống, xây ETL pipeline, dedupe theo SĐT |
| T4 | Deploy Reborn Loyalty, cấu hình 2 brand, import 3M hội viên (preview + confirm) |
| T5–6 | Cấu hình rule tích điểm, hạng thành viên, hạn điểm (theo chính sách hiện hành của khách) |
| T7–8 | Tích hợp API với POS Brand A (pilot 5–10 store) |

**Milestone:** 3M KHTV đã import, merge cross-brand xong. POS pilot Brand A tích/tiêu điểm realtime thành công. Admin dashboard hoạt động.

### Phase 2: Chạy song song + Rollout (Tháng 3–4)

| Tuần | Công việc |
|------|----------|
| T9–10 | Chạy song song Reborn + hệ cũ, đối soát số liệu hàng ngày |
| T11 | Tích hợp POS Brand B, mở rộng đến 50 store |
| T12 | Rollout 100 store tiếp theo |
| T13 | Rollout nốt đến đủ ~300 store |
| T14 | Cấu hình cross-brand points, bật điểm dùng chéo |
| T15–16 | Training team vận hành, UAT, tắt dần hệ cũ |

**Milestone:** Toàn bộ ~300 cửa hàng chạy loyalty thống nhất. Cross-brand points hoạt động. Goldmem/Access/Excel/Supporter chuyển sang chế độ archive.

### Phase 3: Marketing Automation + Tối ưu (Tháng 5–6)

| Tuần | Công việc |
|------|----------|
| T17–18 | Kích hoạt marketing automation nội bộ (Email/SMS/Push/Zalo OA) — giảm phụ thuộc agency |
| T19 | Tích hợp website e-commerce, mobile app của 2 brand (nếu chưa trong Phase 1) |
| T20 | Chuyển Supporter → module CSKH có sẵn trong Reborn, gắn khiếu nại vào hồ sơ KH |
| T21–22 | Dashboard nâng cao: RFM segmentation, CLV, churn prediction |
| T23 | Đào tạo chiến dịch marketing, kịch bản automation cho đội nghiệp vụ |
| T24 | Bàn giao, training nâng cao, tài liệu vận hành, cam kết SLA hậu mãi |

**Milestone:** Hệ thống ổn định, 1 nền tảng duy nhất thay cho 4 công cụ cũ + agency marketing. Phòng CNTT&CĐS tự vận hành 100%.

### Lộ trình mở rộng (sau nghiệm thu, đồng hành 3 năm)

| Giai đoạn | Quy mô | Công việc chính |
|-----------|--------|-----------------|
| Năm 1 (baseline) | ~300 store, 3M KH | Vận hành ổn định, tối ưu rule, A/B test campaign |
| Năm 2 | 500–800 điểm bán | Mở rộng multi-branch, tự động hoá onboarding cửa hàng mới, mở API cho đối tác |
| Năm 3 | 1.000–1.500 điểm bán | Tích hợp hệ sinh thái (ví điện tử, đối tác online), cross-sell qua API |

---

## 8. YÊU CẦU TỪ PHÍA KHÁCH HÀNG

### 8.1. Cần cung cấp

| # | Hạng mục | Mục đích | Ghi chú từ Q&A |
|---|----------|----------|----------------|
| 1 | Schema + export data **Goldmem** (KHTV, lịch sử mua, quyền lợi) | Migration chính | Nguồn dữ liệu KHTV chủ yếu |
| 2 | Schema + export **MS Access** (quyền lợi tích lũy, lịch sử phát sinh) | Bổ sung lịch sử | |
| 3 | File **MS Excel** dashboard + bảng tổng hợp | Hiểu cách khách đang phân tích số liệu | Tham chiếu thiết kế dashboard mới |
| 4 | Schema + export **Supporter** (khiếu nại, CSKH) | Chuyển module CSKH | |
| 5 | Thông tin POS + API docs (real-time/batch) | Thiết kế luồng auto-earn | Q7: Phòng CNTT&CĐS cung cấp |
| 6 | Thông tin hạ tầng (on-prem / cloud / data warehouse) | Quyết định mô hình deploy | Q9: Phòng CNTT&CĐS cung cấp |
| 7 | Bảng rule tích điểm + hạng thành viên + quyền lợi hiện hành | Cấu hình sang hệ mới | |
| 8 | Hợp đồng/phạm vi công việc với agency marketing hiện tại | Lên kế hoạch thay thế/bổ sung | Q8: agency ngoài |
| 9 | 1–2 nhân sự Phòng CNTT&CĐS làm đầu mối kỹ thuật | Phối hợp tích hợp + ETL | |
| 10 | 1 người nghiệp vụ (Marketing/KHTV) làm đầu mối nghiệp vụ | Validate rule + UAT + training | |

### 8.2. Hạ tầng

| Option | Mô tả | Phù hợp khi |
|--------|-------|-------------|
| **Cloud (đề xuất)** | Reborn hosting trên cloud VN, data tại VN | Muốn nhanh, không lo hạ tầng |
| **On-premise** | Deploy trên server khách | Yêu cầu data không ra ngoài |
| **Hybrid** | App trên cloud, DB trên server khách | Cân bằng tốc độ + bảo mật |

---

## 9. CAM KẾT & SLA

### 9.1. SLA hệ thống

| Chỉ số | Cam kết | Căn cứ từ Q&A |
|--------|---------|---------------|
| Uptime | 99.5% (không tính bảo trì planned) | |
| API response time | P95 < 500ms | |
| Batch import 3M records | < 2 giờ | Q5: 3M KHTV |
| Point calculation (auto-earn) | < 200ms/transaction | Q5: 150K txn/ngày → ~2 txn/giây TB, đảm bảo không nghẽn |
| Tải chịu đựng peak | **≥ 500 txn/giây** (sustained) | Q6: peak ~300K/ngày lễ/sale, đảm bảo dự phòng 2–3 lần |
| Thời gian lên hạng / hết hạn điểm | Cron chạy hằng đêm, hoàn thành < 3 giờ | |
| Support response | Trong giờ hành chính: < 2 giờ; sự cố P1: < 30 phút 24/7 | |

### 9.2. Bảo hành & hỗ trợ

- **6 tháng bảo hành** sau nghiệm thu — fix bug miễn phí
- **Hỗ trợ kỹ thuật** qua Zalo/Email trong giờ hành chính
- **Training** 2 buổi: admin operation + API integration
- **Tài liệu đầy đủ**: SA, URD, User Guide, API Docs, Test Cases

### 9.3. Quyền sở hữu

- Khách hàng sở hữu **toàn bộ data** (hội viên, giao dịch, config)
- Source code: theo thoả thuận license
- Data export bất kỳ lúc nào (CSV, API)

---

## 10. PHỤ LỤC A: DEMO SCREENSHOTS

### 10.1. Danh sách tính năng chi tiết

| # | Tính năng | Trạng thái |
|---|-----------|------------|
| 1 | Dashboard Loyalty (KPI, chart, quick actions) | Sẵn sàng |
| 2 | Quản lý hội viên (list, search, export) | Sẵn sàng |
| 3 | Thẻ hội viên barcode | Sẵn sàng |
| 4 | Import hội viên CSV (3M+) | Sẵn sàng |
| 5 | Sổ điểm (ledger) | Sẵn sàng |
| 6 | Rule tích điểm (hoá đơn/danh mục/cố định) | Sẵn sàng |
| 7 | Min spend + nhân hệ số | Sẵn sàng |
| 8 | Hạng thành viên (4+ tier) | Sẵn sàng |
| 9 | Thăng/hạ hạng tự động | Sẵn sàng |
| 10 | Hạn sử dụng điểm (3 chế độ) | Sẵn sàng |
| 11 | Phạm vi brand/store group | Sẵn sàng |
| 12 | Đổi thưởng (voucher, quà, dịch vụ) | Sẵn sàng |
| 13 | Tỷ giá quy đổi điểm | Sẵn sàng |
| 14 | Khuyến mãi (discount, combo, flash sale) | Sẵn sàng |
| 15 | Chế độ Loyalty thuần / Đầy đủ | Sẵn sàng |
| 16 | API Docs + SDK (cURL, JS, Python) | Sẵn sàng |
| 17 | Webhook events | Sẵn sàng |
| 18 | POS integration (auto-earn) | Sẵn sàng |
| 19 | Báo cáo CLV, retention, xu hướng | Sẵn sàng |
| 20 | Multi-tenant, multi-brand | Sẵn sàng |

### 10.2. Tài liệu kèm theo

| Tài liệu | Mô tả |
|-----------|-------|
| SA (System Architecture) | 15 phần, kiến trúc kỹ thuật chi tiết |
| URD (User Requirements) | 15 phần, yêu cầu nghiệp vụ + loyalty mở rộng (UR-LOY-01→20) |
| HDSD (User Guide) | 14 phần, hướng dẫn sử dụng từng bước |
| Test Cases | 51 bộ test, 895+ test steps |
| Backend Tasks | Spec kỹ thuật BE: schema, endpoint, cron jobs |
| API Docs | Tích hợp trong admin dashboard |

---

**Reborn JSC** cam kết đồng hành cùng Quý khách xây dựng hệ thống Loyalty thống nhất, nâng cao trải nghiệm 3 triệu khách hàng trên toàn chuỗi.

*Mọi thắc mắc xin liên hệ: ceo@reborn.vn*
