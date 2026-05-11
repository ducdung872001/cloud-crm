# Cross-brand Strategy — Pool chung vs riêng

## TL;DR

> 2 thương hiệu → câu hỏi cốt lõi: điểm CHUNG hay RIÊNG? Khuyến nghị: **per_brand + cross_brand_transfer ratio 1:0.8 bật mặc định**. Lý do: brands có DNA khác (rule, tier khác) nhưng KH cùng người → cần cross-sell incentive. Pattern này dùng bởi Sephora-Beauty Insider (multi-banner), Marriott Bonvoy (Marriott + Sheraton + Ritz), Starbucks (Starbucks + Princi). Tránh chain_wide vì mất brand identity, tránh per_brand-no-transfer vì lãng phí cross-sell opportunity.

## 1. 3 phương án

### 1.1. Chain-wide pool

```
              ┌──────────────────────┐
              │  CHAIN POINT POOL    │
              │  1 wallet            │
              │  1 tier system       │
              │  1 reward catalog    │
              └──────────┬───────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         Brand A POS           Brand B POS
```

**Khi nào dùng:**
- 2 brand cùng concept, target audience (VD: 2 brand cafe specialty)
- Operational efficiency là ưu tiên cao nhất
- Marketing centralized

**Pros:** Simple, KH 1 thẻ, cross-sell tự nhiên, dashboard 1 chỗ.

**Cons:** Mất brand identity, không thể có rule khác (multiplier, tier benefits), khó migrate khi acquire brand mới với DNA khác.

### 1.2. Per-brand isolated

```
   ┌────────────────────┐   ┌────────────────────┐
   │   BRAND A POOL     │   │   BRAND B POOL     │
   │   Wallet A         │   │   Wallet B         │
   │   Tier A           │   │   Tier B           │
   │   Catalog A        │   │   Catalog B        │
   └────────────────────┘   └────────────────────┘
            │                          │
            └── separate, no transfer ──┘
```

**Khi nào dùng:**
- 2 brand totally different (luxury vs mass)
- Acquired brand cần giữ legacy program
- Regulatory issue (brand A và B khác legal entity)

**Pros:** Maximum brand autonomy, accounting separate.

**Cons:** KH cùng người có 2 thẻ → confusion, miss cross-sell completely.

### 1.3. Per-brand + cross-brand transfer (HYBRID — RECOMMENDED)

```
   ┌────────────────────┐   transfer   ┌────────────────────┐
   │   BRAND A POOL     │ ───────────► │   BRAND B POOL     │
   │   Wallet A: 1000đ  │   ratio       │   Wallet B: 800đ   │
   │   Tier: Gold       │   1:0.8       │   Tier: Silver     │
   └────────────────────┘ ◄─────────── └────────────────────┘
            │                          │
            │   Super-customer link    │
            └────── 1 phone identity ───┘
```

**Pros:**
- Brand keeps DNA + rules
- Cross-sell qua transfer mechanism
- KH có thể chọn: keep separate hoặc transfer
- Tier per brand vẫn track
- 1 hồ sơ profile 360°

**Cons:**
- UI complexity: KH thấy 2 wallet
- Transfer rate < 1 → KH thiệt nhẹ (cần educate)
- Cần config 2 chiều A→B, B→A

## 2. Industry benchmark

| Brand | Strategy | Notes |
|---|---|---|
| **Sephora Beauty Insider** | Single pool, multi-store banner | Beauty Insider works across Sephora, Sephora-inside-Kohl's |
| **Marriott Bonvoy** | Single pool, **multiple sub-brands** (Marriott, Sheraton, Ritz, Westin, ...) | Tier benefits differ slightly by brand but 1 wallet |
| **Starbucks Rewards** | Single pool across Starbucks + Princi + Reserve | Acquired brands merge into main |
| **Hilton Honors** | Single pool 22 sub-brands | Same |
| **AAdvantage (American Airlines + alliance)** | Multi-pool with redemption parity | Codeshare model |
| **Loblaw PC Optimum (Canada)** | Single pool **across grocery + pharmacy + travel + financial** | One of the most multi-vertical examples |
| **WinMart + WinMart+ (VN)** | Hybrid single pool with banner-specific promotions | Domestic example |

→ Pattern dominant: **Single pool with sub-brand differentiation in rules**, không phải hoàn toàn separate.

→ Cho 2 brand siêu thị Việt Nam: hybrid `per_brand + transfer` cho phép linh hoạt, có thể chuyển sang single pool sau (config-driven).

## 3. Quyết định framework

| Câu hỏi | Trả lời "yes" → suggest | Trả lời "no" → suggest |
|---|---|---|
| 2 brand cùng category SP overlap > 60%? | chain_wide | per_brand |
| 2 brand cùng đối tượng KH? | chain_wide | per_brand |
| 2 brand cùng legal entity / accounting? | chain_wide | per_brand |
| Có muốn tier benefits khác? | per_brand | chain_wide |
| Có muốn báo cáo P&L tách? | per_brand | chain_wide |
| Có nhiều brand sẽ acquire trong 3 năm? | per_brand (template) | chain_wide |

Cho khách hàng cụ thể: từ context (2 brand siêu thị, mỗi brand >100 store, sản phẩm overlap nhiều nhưng khác positioning), → **per_brand + transfer recommended** với option chain_wide nếu khách prefer simplicity.

## 4. Cross-brand transfer rate

### 4.1. Tại sao ratio < 1?

- Khuyến khích KH tiêu tại brand gốc (loyalty primary)
- Phản ánh khác biệt cost per point giữa 2 brand
- Standard industry practice

### 4.2. Pricing transfer ratio

Công thức:
```
ratio_A_to_B = (cost_per_point_A / cost_per_point_B) × discount_factor
```

`discount_factor` thường 0.8-0.9 để tạo soft barrier.

Ví dụ:
- Brand A CPP = 50đ, Brand B CPP = 50đ → base ratio 1:1
- Áp discount 0.8 → ratio 1 A = 0.8 B
- Tức KH chuyển 1.000 điểm A → nhận 800 điểm B (nhưng phía B lễ Brand A vẫn cost ngang)

### 4.3. Cap & limit

| Cap | Lý do |
|---|---|
| Min transfer 100 điểm | Tránh micro-abuse |
| Max 10.000 điểm/ngày/KH | Tránh launder cấp tốc |
| Cooldown 7 ngày sau mỗi transfer | Tránh ping-pong abuse |
| Transfer hủy: KHÔNG cho phép | Audit complexity |

## 5. Cross-brand recognition (profile level)

Tách biệt với "cross-brand points":

| Feature | Áp dụng |
|---|---|
| **Cross-brand recognition** | Phone duplicate → 1 super-customer, link profile A và B |
| **Cross-brand points** | Điểm dùng được giữa brand (with/without transfer) |

→ Có thể bật **recognition** (luôn nên bật) mà không cần bật points sharing. Profile 360° vẫn thấy cả 2 brand.

### Super-customer model

```
customer (super)
   ├─ identity: phone, dob, gender, ... (shared)
   │
   ├─ member_brand_A
   │     ├─ home_brand_id = A
   │     ├─ barcode, card_no
   │     ├─ tier_A: Gold
   │     ├─ balance_A: 1.500 điểm
   │     └─ ledger_A entries
   │
   └─ member_brand_B
         ├─ home_brand_id = B
         ├─ barcode, card_no (riêng)
         ├─ tier_B: Silver
         ├─ balance_B: 800 điểm
         └─ ledger_B entries
```

CSKH lookup phone → trả super-customer → list 2 member entities → CSKH chọn context để thao tác.

## 6. Migration / acquisition scenarios

### 6.1. Brand A và B đã có legacy loyalty (current khách hàng)

Procedure:
1. Export 2 hệ thống cũ
2. Dedupe phone giữa 2 → identify overlap (~15-20% typically)
3. Decision: 2 member entities riêng (per_brand) hay merge điểm (chain_wide)
4. Default: tạo 2 entities, link super-customer, để cũ ngân điểm rồi cho transfer

### 6.2. Tương lai acquire brand C

- Tạo brand C trong scope config
- Migrate KH brand C → member_C
- Áp dụng cùng pattern: super-customer + transfer
- Không phải refactor

## 7. UI/UX considerations

### 7.1. App member-facing

```
┌─────────────────────────────────┐
│  Xin chào, Anh A                │
│                                 │
│  [Brand A]                      │
│  💎 Hạng Vàng                   │
│  1.500 điểm                     │
│  [Đổi quà] [Xem lịch sử]        │
│                                 │
│  [Brand B]                      │
│  ⭐ Hạng Bạc                    │
│  800 điểm                       │
│  [Đổi quà] [Xem lịch sử]        │
│                                 │
│  [🔄 Chuyển điểm giữa 2 thẻ]    │
└─────────────────────────────────┘
```

### 7.2. POS

Cashier scan thẻ → context tự động (Brand A POS chỉ thấy Brand A wallet). KH muốn dùng Brand B điểm tại Brand A → cần transfer trước (qua app).

### 7.3. Admin / CSKH

Toggle "View all brands" trên profile để Supervisor xem cross-brand.

## 8. Compliance & legal

- Privacy: super-customer share PII giữa 2 brand → cần consent rõ ràng khi đăng ký
- Nếu 2 brand khác legal entity → cần Data Processing Agreement intercompany
- Cross-brand point transfer = "asset transfer" → kế toán cần audit trail

## 9. KPI to track

| KPI | Target |
|---|---|
| % super-customer (qua dedupe) | 15–25% |
| % KH active cả 2 brand | 8–15% (year 1), 15–20% (year 2) |
| Cross-brand transfer volume | 5–10% of redemption |
| Cross-brand sale uplift | +3–7% revenue |

## 10. Decision matrix cho khách hàng cụ thể

| Brand A specs | Brand B specs | Recommendation |
|---|---|---|
| ✅ 2 siêu thị Việt Nam | ✅ Sản phẩm overlap | per_brand + transfer 1:1 (recommend default) |
| 🟡 Different price positioning | 🟡 Different geo | per_brand + transfer 1:0.8 (recommended) |
| 🔴 1 luxury 1 mass | — | per_brand no transfer (avoid devaluing tier) |
| ✅ 1 owner, same accounting | — | chain_wide OK if want simplicity |

## 11. Tham chiếu

- URD scope: [`../02-requirements/part-07-cross-brand-scope.md`](../02-requirements/part-07-cross-brand-scope.md)
- ADR-06 cross-brand decision: [`../03-architecture/part-09-adr.md#adr-06`](../03-architecture/part-09-adr.md)
- SA data isolation: [`../03-architecture/part-03-data-architecture.md`](../03-architecture/part-03-data-architecture.md)
- Industry: Marriott Bonvoy whitepaper, Sephora case study (HBS)
