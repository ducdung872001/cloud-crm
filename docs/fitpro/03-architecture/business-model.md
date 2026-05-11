# 03.1 — Mô hình kinh doanh

> Business Model Canvas + Dual Cash-Flow + Pricing 5 tier + Go-to-Market Hub & Spoke.

---

## 3.1. Business Model Canvas

| Khối | Nội dung |
|---|---|
| **Customer Segments** | (1) Giới chủ 35–55 tuổi (W-house, tinh hoa); (2) Doanh nghiệp đặt FitPro Inside; (3) Gia đình hạt nhân muốn lan tỏa thế hệ con cháu |
| **Value Proposition** | "Trưởng thành tận cùng" 4 trụ cột Sức khỏe Toàn diện; "Đưa FitPro về nhà"; Y học 3.0 chỉ cần 2m² |
| **Channels** | App FitPro (digital) + 3 không gian vật lý: Center / Inside / Home; Affiliate Mã A007 |
| **Customer Relationships** | Gamification (Streak), Bảng vàng Danh vọng, Coach 1-1 thấu cảm, cộng đồng "Nhà" (Mã N) |
| **Revenue Streams** | (1) Phí nhượng quyền + SaaS (FitPro thu); (2) Phí check-in 80k+/buổi (Coach giữ); (3) Gói 30/60/90 ngày (Coach/Elite giữ); (4) Setup vật chất (đối tác thầu); (5) HBL commission 37% (NPP cá nhân) |
| **Key Resources** | Siêu ứng dụng FitPro; Bộ SOP chuẩn hóa; Mạng lưới Co-Founder + Elite; Big Data vòng đời KH |
| **Key Activities** | Đào tạo Elite/Coach; Chuẩn hóa SOP; Vận hành Center mẫu (Hà Nội); Customize tech (Reborn); Truyền thông triết lý |
| **Key Partners** | Herbalife VN, Medlatec, Adorn, W-house, Reborn JSC, đối tác thi công Setup |
| **Cost Structure** | Vận hành Center lõi mẫu; R&D công nghệ (Reborn); Truyền thông kickoff; Đào tạo SOP; Cloud hosting |

---

## 3.2. Dual Cash-Flow — 2 luồng tiền tách biệt 100%

```
┌─────────────────────────────────────────────────────────────┐
│ LUỒNG 1: Dịch vụ FitPro & SaaS (qua App FitPro)            │
│ ─────────────────────────────────────────────────────────── │
│  KH ──80k/buổi──► Coach (giữ 100%, ca nào nhận ca đó)       │
│  KH ──gói 30/60/90──► Coach hoặc Elite Member               │
│  KH ──Setup vật chất──► Đối tác thi công                    │
│  Chủ Center ──Phí nhượng quyền + Phí SaaS/tháng──► FitPro  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ LUỒNG 2: Sản phẩm dinh dưỡng (qua hệ thống HBL)             │
│ ─────────────────────────────────────────────────────────── │
│  KH ──mở mã dưới tuyến──► Đặt hàng trực tiếp HBL            │
│  HBL ──37% trên 73% lợi nhuận NPP──► Tài khoản cá nhân     │
│                                                              │
│  ⚠️ App FitPro: KHÔNG can thiệp, không thu phí, không hiển  │
│     thị commission — chỉ là "bể chứa" nuôi dưỡng KH         │
└─────────────────────────────────────────────────────────────┘
```

### Vì sao tách biệt?

| Lý do | Hệ quả |
|---|---|
| Tuân thủ pháp lý đa cấp VN (HBL phải giữ nguyên cấu trúc gốc) | Tránh bị xếp vào ví điện tử / trung gian thanh toán |
| Loại bỏ rủi ro đọng vốn tại FitPro | KH không gửi tiền vào ví FitPro |
| Định vị App = SaaS thuần | Bội số định giá Tech 6–10x ARR (vs Retail 0,5–1,5x) |

> **Nguyên tắc thép**: Không có dòng code nào trong App ghi nhận, hiển thị, hay điều phối commission HBL. Mọi luồng tiền HBL là zero-touch với App.

### Luồng 2 mở rộng — đối soát HBL (F5.2)

Vì HBL không có public API, hệ thống FitPro chỉ làm **tính năng đối soát**, không trung gian:
- Import file commission HBL (CSV/Excel) → ledger entry trong `billing`.
- Engine phân phối **tham chiếu** xuống đúng người trong cây — chỉ ghi nhận, KHÔNG chi trả.
- Báo cáo đối soát: "tổng HBL trả về anh A" vs "tổng anh A phân phối thực tế" — chênh lệch để anh A tự xử lý.
- App không cầm bất kỳ đồng nào của luồng 2.

---

## 3.3. Pricing — Bảng giá 5 tier chuẩn quốc gia

| # | Gói | Giá/buổi | Thành phần | Công dụng |
|---:|---|---:|---|---|
| 1 | **BASIC** ⭐ | **80.000** đ | Trà NRG + F1 Sport | Năng lượng sạch, duy trì tỉnh táo |
| 2 | **PLUS** ⭐⭐ | **140.000** đ | BASIC + Hydrate | Bù khoáng/điện giải chuyên sâu |
| 3 | **PRO** ⭐⭐⭐ | **260.000** đ | PLUS + Rebuild Strength | Phục hồi cơ bắp thần tốc |
| 4 | **VIP** ⭐⭐⭐⭐ | **315.000** đ | PRO + Xtra-Cal + Herbalifeline | Tối ưu xương khớp, tim mạch |
| 5 | **SUPER VIP** ⭐⭐⭐⭐⭐ | **500.000** đ | VIP + Joint Support + Niteworks | Vận động đỉnh cao, phục hồi sâu |

### Đặc quyền gắn tier

| Hạng | Điều kiện | Quyền lợi |
|---|---|---|
| **VIP Member** | Đăng ký ≥30 buổi (bất kỳ tier) | Thẻ VIP quyền năng; có thể đăng ký mở Center |
| **Elite Member** | Đăng ký từ **PRO trở lên** | Quyền kinh doanh; gửi khách toàn quốc tới mọi Center |
| **Xét nghiệm Medlatec** | Sử dụng **VIP / SUPER VIP** | Kiểm tra chỉ số sức khỏe → cá nhân hóa lộ trình |

### Logic chiến lược giá

| Lớp | Cơ chế |
|---|---|
| **Penetration** (tier BASIC) | 80k ≈ 1 ly cà phê specialty → loại bỏ rào cản chạm thử |
| **Anchor & upsell** | 5 bậc tăng 1,75× → 1,86× → 1,21× → 1,59×. Bậc nhảy lớn nhất từ PLUS (140k) lên PRO (260k) = **cổng Elite Member** |
| **Bundled value** | Mỗi tier thêm sản phẩm HBL nhưng giá có kiểm soát — KH thấy "đáng tiền", Coach có biên gộp tốt hơn |
| **Hidden revenue layer** | Bảng giá KHÔNG bao gồm: gói 30/60/90 ngày, HBL retail/wholesale, Setup vật chất |
| **Premium positioning** | 500k/buổi SUPER VIP rẻ hơn PT cao cấp Hà Nội (700k–1tr) — premium nhưng accessible |

---

## 3.4. Go-to-Market — Hub & Spoke

```
        ┌─────────────── 500 Hub lõi ───────────────┐
        │   FitPro Center (C007)  │  FitPro Inside  │
        │   21 nhân sự, lò đào tạo│  trong DN       │
        └──────────────┬──────────┴─────────────────┘
                       │ Mỗi Hub × 20 vệ tinh
                       ▼
        ┌─────────── 10.000 FitPro Home ────────────┐
        │   2m² thảm tập + Protein Bar gia đình      │
        │   Không kinh doanh, hạt nhân lan tỏa        │
        └─────────────────────────────────────────────┘
```

### 3 mũi giáo thâm nhập thị trường

1. **Mũi B2C cao cấp**: Tệp doanh nhân W-house + Doanh nhân Văn hóa → mua VIP/SUPER VIP → lột xác → mở Home → mở Center.
2. **Mũi B2B (FitPro Inside)**: Đặt trạm trong văn phòng các tập đoàn → phúc lợi nhân viên + lan tỏa xuống gia đình họ.
3. **Mũi cộng đồng (FitPro Home)**: Mỗi Elite thành công đưa FitPro về nhà → 7 Elite F1-F7 → mở "Nhà" → tự nhân bản.

### Đặc quyền mạng lưới — Gửi khách Vạn Dặm

- Coach Hà Nội có thể chốt gói VIP cho khách ở TPHCM/Đà Nẵng.
- Coach giữ **100% doanh thu gói** (vd: 30 buổi × 315k = 9,45 triệu).
- Trích lại **80k/buổi cho Coach trực** tại Center sở tại qua App (Inter-Coach payout).
- Khách hàng được chăm sóc theo **SOP đồng nhất** dù ở đâu.

→ Tạo **network effects** mạnh: càng nhiều Center, mỗi Elite/Coach càng có giá trị.

---

## 3.5. Văn hóa vận hành — Power, không Force

Hệ thống vận hành ở tần số ≥200 (Can đảm, Tình yêu thương, Niềm vui phụng sự) thay vì <200 (Áp lực doanh số, Ép buộc):

- **Không KPI ép Coach** — Coach kiếm tiền trực tiếp từ ca trực (80k+/buổi).
- **Đẳng cấp đo bằng tần số**, không phải tiền — Trial → VIP → Elite → Coach → Co-Founder.
- **Đỉnh cao Co-Founder** = bảo trợ thành công 7 nhánh dọc, mở "Nhà" (Mã N007).

→ Đây là **anti-MLM aesthetic** trên xương sống MLM (HBL) — vẫn nhân bản cấp số nhân nhưng động cơ vận hành ở tần số văn hóa/tinh thần.
