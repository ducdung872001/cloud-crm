# Part 03 — Tích điểm & Hạng thành viên

## 1. Tích điểm — tự động (auto-earn)

**99% giao dịch tích điểm là tự động** qua POS. Không cần thao tác tại admin.

Flow:
```
KH mua hàng tại POS → Cashier scan thẻ (hoặc nhập phone) →
POS thanh toán → POS gửi webhook về Reborn → Reborn tính điểm, cộng vào balance
```

## 2. Sổ cái điểm (Ledger)

**Menu › Điểm & Hạng › Sổ cái**

Hiển thị mọi biến động điểm toàn chuỗi. Filter: member, entry_type, store, brand, date range.

| Entry type | Ý nghĩa |
|---|---|
| `earn` | Tích từ giao dịch |
| `redeem` | Tiêu cho reward/giảm trực tiếp |
| `expire` | Hết hạn |
| `adjust_in` | Cộng thủ công (CSKH/Admin) |
| `adjust_out` | Trừ thủ công |
| `refund` | Trừ khi đơn refund/cancel |
| `transfer_in` / `transfer_out` | Cross-brand transfer |

Click entry → drill-down về source (order, reward, ticket).

Export Excel filtered.

## 3. Cộng/Trừ điểm thủ công (manual adjust)

⚠️ **Chỉ dùng khi**: KH khiếu nại đúng (compensation), lỗi POS, goodwill VIP.

### 3.1. Bước

**Profile KH › [Adjust điểm]** (hoặc Menu › Điểm › Manual adjust)

1. Nhập member (phone hoặc auto-fill nếu vào từ profile)
2. Chọn +/− số điểm
3. Chọn lý do (dropdown):
   - `compensation_complaint` — bồi thường khiếu nại
   - `pos_error_correction` — sửa lỗi POS
   - `goodwill_vip` — quà cho VIP
   - `manual_promotion` — promotion thủ công
   - `other` — phải nhập note
4. Note bắt buộc (free text, audit)
5. Attachment (optional, support evidence)
6. Bấm **[Submit]**

### 3.2. Cap

| Role | Cap mỗi adjust | Cap daily | Cần approval |
|---|---|---|---|
| CSKH Agent | 1.000 điểm | 5.000 điểm | Không |
| CSKH Sup | 10.000 điểm | 50.000 điểm | Không |
| Tenant Admin | Bất kỳ | Bất kỳ | 2nd Admin nếu > 50K |

### 3.3. Sau adjust

- Ghi ledger với `entry_type = adjust_in` hoặc `adjust_out`
- Audit log đầy đủ (actor, reason, before/after)
- Notify KH qua kênh preferred ("Cảm ơn bạn, +N điểm bồi thường — Reborn")

🔴 **Cấm:**
- Adjust điểm cho chính mình hoặc người thân (vi phạm code of conduct)
- Adjust không note / không lý do
- Bỏ qua approval workflow

## 4. Cấu hình Earn Rule

**Menu › Cài đặt › Earn Rules**

### 4.1. Tạo rule mới

1. Bấm **[+ New Rule]**
2. Điền form:
   - **Tên**: e.g., "Standard earn — Brand A"
   - **Type**: `invoice_amount` / `category_based` / `fixed_per_order`
   - **Params** (theo type):
     - `invoice_amount`: divisor (10.000đ/điểm), multiplier (1.0)
     - `category_based`: list category với rate riêng
     - `fixed_per_order`: số điểm cố định
   - **Scope**: chain / brand_a / brand_b / store_group_X
   - **Priority**: 1-10 (cao = áp dụng trước)
   - **Modifiers** (optional):
     - Min spend: 50.000đ
     - Max points per order: 1.000 điểm
     - Tier multipliers: Bronze 1×, Silver 1.2×, Gold 1.5×, Diamond 2×
     - Time window: VD chỉ áp 7h-22h
   - **Valid from..to**: hiệu lực thời gian
   - **Active**: bật/tắt
3. **[Preview]**: tính thử với 1 hoá đơn mẫu → hiển thị từng modifier áp dụng
4. **[Save]** → audit log

### 4.2. Stack policy

**Cài đặt › Loyalty › Stack mode**:
- `single_highest` (RECOMMENDED — default) — chỉ áp modifier cao nhất
- `multiplicative` — nhân chồng (rủi ro, cần cap)

⚠️ Đổi stack mode = quyết định chiến lược, cần 2-level approval + audit.

🟢 **Tip:** Bắt đầu với `single_highest`. Sau 60 ngày data, A/B test `multiplicative` cho campaign nhỏ.

### 4.3. Đổi tỷ giá quy đổi (1 điểm = X đồng)

**Cài đặt › Loyalty › Redemption rate**

Default: 1 điểm = 100đ. Đổi rate cần audit + announce KH.

⚠️ **Lưu ý:** Đổi rate không retroactive — điểm cũ vẫn theo rate cũ tại thời điểm phát hành. Để tránh confusion, ít khi đổi.

## 5. Hạng thành viên (Tier)

### 5.1. Cấu hình tier

**Menu › Cài đặt › Tier**

Default 4 tier (cấu hình được):

| Tier | Threshold (lifetime 12m) | Maintain | Multiplier | Benefits |
|---|---|---|---|---|
| Bronze | 0 | — | 1.0× | Tích điểm cơ bản |
| Silver | 5.000 | 4.000 | 1.2× | + voucher 5%/tháng |
| Gold | 20.000 | 16.000 | 1.5× | + free ship đơn ≥ 500K |
| Diamond | 50.000 | 40.000 | 2.0× | + personal shopper |

Bấm vào tier để edit:
- Tên (i18n)
- Threshold + maintain
- Earn multiplier
- Benefits (JSON / form builder)
- Evaluation metric: `lifetime_points` / `period_points` / `period_spend` / `period_orders`
- Period: monthly / quarterly / yearly

### 5.2. Auto tier evaluation

Cron tự động chạy cuối kỳ. Trước khi áp dụng:

**Menu › Điểm & Hạng › Tier Evaluation › Dry-run**

1. Bấm **[Run Dry-run]**
2. Chờ 5-30 phút (3M KH)
3. Kết quả:
   - Số KH upgrade
   - Số KH downgrade
   - Số KH enter grace period
   - Sample list
4. Review với Marketing Mgr
5. **[Apply]** → background job thực thi với notification

### 5.3. Manual tier adjust

**Profile KH › Tier › [Adjust]**

⚠️ Cần permission cao + lý do. Cap 50 KH/ngày/admin.

### 5.4. Grace period

KH không đạt maintain → enter grace 1 kỳ (cấu hình). Trong grace:
- Giữ tier hiện tại
- Notification: "Bạn cần X điểm trong tháng tới để duy trì hạng Vàng"
- Cuối grace vẫn không đạt → downgrade

🟢 **Tip:** Grace period 1 kỳ cho retail; 2 kỳ cho lux/B2B.

## 6. Hạn sử dụng điểm

**Cài đặt › Loyalty › Point Expiry**

3 mode (xem [`../06-analysis/point-expiry-strategy.md`](../06-analysis/point-expiry-strategy.md)):

- `never`
- `after_months` (RECOMMENDED, N=12)
- `end_of_year`

### 6.1. Đổi mode

1. Chọn mode mới
2. **[Preview impact]** — hiển thị:
   - Số KH ảnh hưởng
   - Tổng điểm sắp expire trong 90 ngày tới
   - Estimated revenue impact
3. Confirm dialog đỏ "Không thể undo trong 24h"
4. Audit log

🔴 **Quan trọng:** Trước khi đổi từ `never` → `after_months`, **announce KH 60-90 ngày trước**, gửi reminder.

### 6.2. Notification trước expire

Hệ thống auto gửi:
- 30 ngày trước
- 14 ngày trước
- 7 ngày trước
- 1 ngày trước

Template trong **Cài đặt › Notification › Templates**.

## 7. Cross-brand transfer (nếu bật)

**Profile KH › Cross-brand wallet › [Transfer]**

Hoặc KH tự transfer qua app.

Form:
- From: Brand A wallet (1.000 điểm available)
- To: Brand B wallet
- Số điểm chuyển: 500
- Tỷ giá: 1:0.8 → nhận 400 ở Brand B
- Confirm

⚠️ Cooldown 7 ngày sau transfer.

## 8. Tham chiếu

- URD points engine: [`../02-requirements/part-03-points-engine.md`](../02-requirements/part-03-points-engine.md)
- URD tier: [`../02-requirements/part-04-membership-tiers.md`](../02-requirements/part-04-membership-tiers.md)
- Expiry strategy: [`../06-analysis/point-expiry-strategy.md`](../06-analysis/point-expiry-strategy.md)
- Loyalty economics: [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md)
