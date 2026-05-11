# Part 07 — Cấu hình Cross-brand

> 🎯 **Đối tượng:** Tenant Admin. Chỉ làm 1–2 lần lúc setup hệ thống + khi có thay đổi chiến lược lớn.

## 1. Loyalty Scope là gì?

Scope quyết định **điểm và hạng của KH áp dụng phạm vi nào**:

| Scope | Mô tả |
|---|---|
| `chain_wide` | 1 pool điểm/hạng cho toàn chuỗi (2 brand chung) |
| `per_brand` | Mỗi brand pool riêng (KH có 2 thẻ) — **RECOMMENDED** |
| `per_store_group` | Theo nhóm cửa hàng (vd: miền Bắc / Nam riêng) |

Quyết định framework + phân tích đầy đủ: [`../06-analysis/cross-brand-strategy.md`](../06-analysis/cross-brand-strategy.md).

## 2. Cấu hình lần đầu

**Cài đặt › Loyalty › Scope**

1. Chọn mode (RECOMMEND: per_brand)
2. Mapping store → brand: Reborn import từ POS hoặc admin upload CSV
3. Toggle **Cross-brand transfer**: ON / OFF
   - Tỷ giá A → B: 1.00 (mặc định) hoặc 0.80 (khuyến khích tiêu tại brand gốc)
   - Tỷ giá B → A: như trên
4. Cap transfer:
   - Min per transfer: 100 điểm
   - Max per day per member: 10.000 điểm
   - Cooldown sau transfer: 7 ngày
5. Toggle **Cross-brand profile recognition**: ON (recommended)
   - Khi ON: phone duplicate giữa 2 brand → 1 super-customer, link 2 member entities
   - Profile 360° xem cả 2 brand
6. Save → confirm dialog đỏ → audit log

## 3. Đổi scope mid-flight (rare)

🔴 **Quan trọng:** Đổi scope = quyết định chiến lược, không phải config nhanh. Cần:
- BOD approval
- 2-level admin approval
- 60–90 ngày announce KH
- Dry-run preview tác động
- Backup snapshot
- Rollback plan ready

### 3.1. chain_wide → per_brand

Mọi point pool hiện tại sẽ split theo store đã ghi nhận giao dịch:

1. Bấm **[Đổi scope]** → chọn per_brand
2. **[Preview impact]**:
   - Số KH ảnh hưởng
   - Phân bổ điểm Brand A vs B sau split
   - Tiers possibly downgrade (do split tier metric)
3. Review với BOD, Marketing
4. Confirm với note explanation
5. Migration job background:
   - Mỗi member: tách điểm theo brand giao dịch
   - Tier eval lại cho mỗi brand
6. KH nhận notification giải thích

### 3.2. per_brand → chain_wide

Merge 2 pool thành 1:

1. Bấm **[Đổi scope]** → chain_wide
2. Preview: tổng balance mới = sum 2 pool
3. Tier eval: take max tier hoặc recompute theo lifetime tổng
4. Confirm → migration

🟢 **Reversible trong 24h** sau apply. Sau 24h → finalized.

## 4. Cross-brand merge — Profile

Khi 1 KH phone xuất hiện ở cả 2 brand:

### 4.1. Auto-detect

Cron daily quét → list candidates trong **Hội viên › Duplicates › Cross-brand**.

### 4.2. Manual merge

Bấm vào candidate cặp → compare side-by-side → bấm **[Link as super-customer]** → confirm.

Hậu quả:
- 2 member entities vẫn tồn tại (per brand)
- Link qua super_customer_id
- Profile 360° hiển thị cả 2
- Phone lookup → trả super-customer
- Cross-brand transfer enable cho super-customer

⚠️ **Không tự động merge** — luôn human approval. Threshold similarity ≥ 0.95 mới hiện.

## 5. Cross-brand transfer cho KH

### 5.1. Qua app (KH self-service)

KH thấy 2 wallet (Brand A: 1.500 điểm, Brand B: 800 điểm). Bấm **[🔄 Chuyển điểm]**:

1. From: Brand A
2. To: Brand B
3. Số chuyển: 500 điểm A → nhận 400 B (tỷ giá 1:0.8)
4. Confirm
5. Notification

### 5.2. Qua CSKH

KH gọi tổng đài muốn transfer:

1. CSKH mở profile KH (super-customer)
2. **[Cross-brand transfer]**
3. Submit → audit log

### 5.3. Cap & limit (lại nhắc)

- Min 100 điểm/lần
- Max 10.000 điểm/ngày/KH
- Cooldown 7 ngày
- Lifetime cap 50.000 điểm/năm (cấu hình)

## 6. Báo cáo cross-brand

**Menu › Báo cáo › Cross-brand**

- % super-customer (phone duplicate qua 2 brand)
- % KH active cả 2 brand (có order trong 90 ngày ở cả 2)
- Volume transfer (in/out per brand, monthly)
- Revenue uplift từ cross-brand recognition
- Tier comparison: KH Gold ở A thường tier nào ở B?

🟢 **KPI target:**
- % super-customer: 15–25%
- % active 2 brand: 8–15% year 1, 15–20% year 2
- Transfer volume: 5–10% of total redemption

## 7. Tham chiếu

- URD scope: [`../02-requirements/part-07-cross-brand-scope.md`](../02-requirements/part-07-cross-brand-scope.md)
- Phân tích chiến lược: [`../06-analysis/cross-brand-strategy.md`](../06-analysis/cross-brand-strategy.md)
- ADR-06 cross-brand decision: [`../03-architecture/part-09-adr.md#adr-06`](../03-architecture/part-09-adr.md)
