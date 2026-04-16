# ĐỀ XUẤT GIẢI PHÁP: Nền tảng Loyalty cho chuỗi siêu thị bán lẻ

**Phiên bản:** 1.0  
**Ngày:** 16/04/2026  
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
10. [Phụ lục: Demo screenshots](#10-phụ-lục)

---

## 1. TÓM TẮT ĐIỀU HÀNH

### Bài toán
Quý khách đang vận hành chuỗi siêu thị bán lẻ với **2 thương hiệu**, **100+ cửa hàng**, phục vụ **~3 triệu khách hàng**. Hệ thống loyalty hiện tại của 2 brand hoạt động **độc lập, không đồng bộ** — dẫn đến:
- Khách hàng cùng 1 người nhưng mỗi brand lưu riêng → không nhận diện được
- Chương trình tích điểm không thống nhất → trải nghiệm khách hàng rời rạc
- Không có cái nhìn toàn chuỗi về hành vi mua sắm → khó ra quyết định marketing

### Giải pháp
**Reborn Loyalty Platform** — nền tảng loyalty tập trung, tích hợp với hệ thống POS/bán hàng hiện có qua API. Không thay thế phần mềm bán hàng, chỉ bổ sung lớp loyalty thống nhất trên toàn chuỗi.

### Điểm nổi bật

| | |
|---|---|
| **Tích hợp, không thay thế** | Kết nối POS hiện có qua REST API — không cần đổi phần mềm bán hàng |
| **Đa thương hiệu** | 1 nền tảng quản lý loyalty cho nhiều brand, điểm dùng chéo hoặc riêng |
| **3 triệu khách** | Kiến trúc xử lý dữ liệu lớn, import hàng loạt, xử lý batch nền |
| **Online + Offline** | Tích điểm tại quầy (POS) + trên web/app đồng bộ realtime |
| **Có sẵn, deploy nhanh** | Platform đã xây dựng, cấu hình theo nhu cầu — không code từ đầu |
| **Team IT tự vận hành** | Admin dashboard + API docs đầy đủ, team khách tự quản lý |

---

## 2. HIỂU BIẾT VỀ BÀI TOÁN

### 2.1. Hiện trạng

```
  ┌─────────────┐         ┌─────────────┐
  │  Brand A    │         │  Brand B    │
  │  ~60 store  │         │  ~40 store  │
  │  POS riêng  │         │  POS riêng  │
  │  Loyalty cũ │         │  Loyalty cũ │
  │  DB riêng   │         │  DB riêng   │
  └──────┬──────┘         └──────┬──────┘
         │     KHÔNG ĐỒNG BỘ     │
         └───────────────────────┘
```

**Vấn đề cốt lõi:**
- Khách mua ở Brand A → tích điểm A. Sang Brand B → không được gì → mất cơ hội upsell
- 2 hệ thống loyalty khác rules → nhân viên phải nhớ 2 bộ chính sách
- Không có dashboard tổng hợp toàn chuỗi → ban lãnh đạo thiếu data ra quyết định
- Muốn chạy campaign "mua ở A, đổi quà ở B" → không thể vì data tách rời

### 2.2. Khảo sát nhanh

| Tiêu chí | Kết quả |
|----------|---------|
| Mô hình kinh doanh | Online + Offline |
| Số cửa hàng | 100+ (kế hoạch mở rộng) |
| Số khách hàng | ~3 triệu |
| Tỷ lệ khách quay lại | ~80% (rất cao) |
| Chương trình thành viên | Đã có (mỗi brand riêng) |
| Team công nghệ | Có (tự vận hành) |
| Ngân sách | Dưới 1 tỷ VND |
| Timeline | 6 tháng |
| Yêu cầu chính | Nền tảng loyalty tích hợp các hệ thống cũ |

### 2.3. Insight từ dữ liệu

- **Retention 80%** rất cao cho ngành bán lẻ → khách hàng đã trung thành, cần **nâng giá trị** chứ không chỉ **giữ chân**
- **3 triệu KH** là tài sản lớn → nền tảng phải xử lý scale, không chấp nhận chậm/lag
- **Đã có loyalty cũ** → bài toán là **tích hợp & hợp nhất**, không phải xây mới từ zero
- **Online + Offline** → loyalty phải hoạt động seamless cả 2 kênh

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

| Nguyên tắc | Giải thích |
|------------|-----------|
| **Tích hợp, không thay thế** | POS hiện tại giữ nguyên. Loyalty chỉ nhận data qua API sau khi thanh toán |
| **Cấu hình, không code** | Mọi rule (tích điểm, hạng, hạn, scope) cấu hình trên giao diện, không cần lập trình |
| **Đa thương hiệu native** | Kiến trúc multi-tenant + multi-brand từ đầu, không phải hack thêm |
| **API-first** | Mọi tính năng đều có API — team IT khách tự tích hợp thêm bất kỳ hệ thống nào |
| **Scale 3M+** | Batch processing, async jobs, index tối ưu cho dataset lớn |

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

### 6.4. Migration từ hệ thống cũ

```
  Brand A Loyalty DB ──┐
                       ├── Export CSV ──► Bulk Import ──► Reborn Loyalty
  Brand B Loyalty DB ──┘                                  (dedupe by phone,
                                                           merge profiles)
```

**Bước 1:** Export data hội viên từ 2 brand (name, phone, email, điểm, hạng)  
**Bước 2:** Upload CSV vào Reborn → preview + highlight trùng SĐT  
**Bước 3:** Confirm import → hệ thống tự merge, gộp điểm  
**Bước 4:** Cấu hình rule mới → chạy song song 2 hệ thống 1 tháng  
**Bước 5:** Chuyển đổi hoàn toàn → tắt loyalty cũ  

---

## 7. LỘ TRÌNH TRIỂN KHAI

### Phase 1: Nền tảng (Tháng 1-2)

| Tuần | Công việc |
|------|----------|
| T1-2 | Khảo sát chi tiết POS hiện tại, mapping data, setup môi trường |
| T3-4 | Deploy hệ thống, cấu hình 2 brand, import data hội viên (3M) |
| T5-6 | Cấu hình rule tích điểm, hạng thành viên, hạn điểm |
| T7-8 | Tích hợp API với POS Brand A (pilot 5-10 store) |

**Milestone:** POS Brand A tích/tiêu điểm thành công, admin dashboard hoạt động.

### Phase 2: Mở rộng (Tháng 3-4)

| Tuần | Công việc |
|------|----------|
| T9-10 | Tích hợp POS Brand B |
| T11-12 | Rollout toàn bộ 100+ store |
| T13-14 | Cấu hình cross-brand points, campaign đầu tiên |
| T15-16 | Training team vận hành, UAT |

**Milestone:** Toàn chuỗi chạy loyalty thống nhất, cross-brand points hoạt động.

### Phase 3: Tối ưu (Tháng 5-6)

| Tuần | Công việc |
|------|----------|
| T17-18 | Phân tích data 2 tháng đầu, điều chỉnh rule |
| T19-20 | Tích hợp website e-commerce (nếu có) |
| T21-22 | Dashboard nâng cao, RFM segmentation |
| T23-24 | Bàn giao, training nâng cao, tài liệu vận hành |

**Milestone:** Hệ thống ổn định, team IT khách tự vận hành 100%.

---

## 8. YÊU CẦU TỪ PHÍA KHÁCH HÀNG

### 8.1. Cần cung cấp

| # | Hạng mục | Mục đích |
|---|----------|----------|
| 1 | Thông tin POS đang dùng (tên, API docs nếu có) | Để thiết kế integration |
| 2 | Data hội viên 2 brand (CSV export) | Để import + merge |
| 3 | Bảng rule tích điểm hiện tại | Để map sang hệ thống mới |
| 4 | Bảng hạng thành viên + quyền lợi | Để cấu hình tier |
| 5 | 1-2 người IT làm đầu mối kỹ thuật | Để phối hợp tích hợp |
| 6 | 1 người nghiệp vụ (Marketing/Ops) | Để validate rule + UAT |

### 8.2. Hạ tầng

| Option | Mô tả | Phù hợp khi |
|--------|-------|-------------|
| **Cloud (đề xuất)** | Reborn hosting trên cloud VN, data tại VN | Muốn nhanh, không lo hạ tầng |
| **On-premise** | Deploy trên server khách | Yêu cầu data không ra ngoài |
| **Hybrid** | App trên cloud, DB trên server khách | Cân bằng tốc độ + bảo mật |

---

## 9. CAM KẾT & SLA

### 9.1. SLA hệ thống

| Chỉ số | Cam kết |
|--------|---------|
| Uptime | 99.5% (không tính bảo trì planned) |
| API response time | P95 < 500ms |
| Batch import 3M records | < 2 giờ |
| Point calculation | < 200ms/transaction |
| Support response | Trong giờ hành chính: < 2 giờ |

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

## 10. PHỤ LỤC

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
