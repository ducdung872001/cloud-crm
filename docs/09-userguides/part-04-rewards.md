# Part 04 — Catalog quà & Đổi thưởng

## 1. Catalog quà — Cấu hình

**Menu › Đổi thưởng › Catalog**

### 1.1. Tạo reward mới

Bấm **[+ New Reward]**:

| Trường | Mô tả |
|---|---|
| Mã | `VC-50K-2026Q2` |
| Tên | "Voucher giảm 50.000đ" |
| Type | voucher_discount / voucher_freeship / voucher_giftcard / physical_gift / service / tier_upgrade |
| Điểm cần | 500 |
| Giá trị (VND) | 50.000 |
| Cost-to-company (INTERNAL) | 37.500 (đã trừ margin) |
| Stock limit | 1.000 cái (NULL = unlimited) |
| Per-member limit | 2 cái/tháng |
| Tier eligible | Silver+ (Silver/Gold/Diamond) |
| Scope | Chain / Brand A / Brand B |
| Valid from..to | Hiệu lực |
| Voucher TTL | 30 ngày sau khi đổi |
| Image | Upload ảnh hiển thị |
| Description | Mô tả + terms |

Bấm **[Save]** → catalog hiện trên app sau 5 phút (cache).

### 1.2. Sửa / Inactive

- Sửa fields → save → version mới
- Đặt `active = false` để ẩn (giữ data history)
- ⚠️ Không cho xoá nếu đã có redemption

### 1.3. Featured rewards

Đánh dấu `featured = true` → hiển thị banner top app. Tối đa 5 featured cùng lúc.

## 2. KH đổi thưởng — qua app

KH tự thao tác trên app/web:
1. Mở app → Loyalty → Catalog quà
2. Filter theo tier eligible, điểm, category
3. Bấm "Đổi" → confirm điểm + nhận voucher code
4. Notification SMS/Zalo: "Voucher VC-50K-... có hiệu lực đến..."
5. Voucher hiện trong "Ví voucher" của app

## 3. CSKH đổi giúp KH (offline channel)

Khi KH gọi tổng đài muốn đổi quà:

**Profile KH › Rewards › [Đổi giúp]**

1. Chọn reward (filter theo tier eligible)
2. Confirm balance đủ
3. Bấm **[Đổi]**
4. Hệ thống trừ điểm + sinh voucher
5. Gửi voucher cho KH qua kênh KH chọn (SMS/Zalo/Email)

## 4. Quản lý redemption (đã đổi)

**Menu › Đổi thưởng › Redemptions**

List: redemption_id, member, reward, points_spent, voucher_code, status, created_at, used_at.

Filter status: issued / used / expired / cancelled.

### 4.1. Hủy redemption (refund điểm)

⚠️ Chỉ trong period (default 7 ngày). Sau period → KH chịu.

1. Click redemption → **[Cancel]**
2. Lý do (KH yêu cầu / lỗi / fraud)
3. Confirm
4. Điểm hoàn trả (ledger `adjust_in`)
5. Voucher → status `cancelled`

### 4.2. Bind voucher to phone (optional anti-fraud)

Setting `voucher_bind_to_phone = true`: khi dùng voucher tại POS, phải nhập phone match → tránh resale.

## 5. Reward types — Special workflows

### 5.1. Voucher discount

Auto-generated code. Dùng tại POS:
- POS POST `/voucher/validate` → check valid
- POS POST `/voucher/redeem` → mark used

### 5.2. Voucher freeship

Áp khi đơn online ship. Hệ thống tự apply.

### 5.3. Physical gift

Sau khi KH đổi:
- Reward → status `pending_fulfillment`
- Tạo phiếu xuất quà cho store đã đăng ký của KH
- Store Manager xác nhận giao quà → status `fulfilled`
- SLA: ≤ 7 ngày giao quà

### 5.4. Service (e.g., free buffet)

- Sau đổi: voucher code + lịch booking
- KH đặt lịch + xuất trình voucher khi sử dụng

### 5.5. Tier upgrade

- Reward đặc biệt: đổi điểm để upgrade tier ngay (vd: 5.000 điểm = upgrade Silver → Gold trong 3 tháng)
- Sau đổi: tier_history ghi `reason = manual_upgrade_via_reward`

## 6. Báo cáo redemption

**Menu › Báo cáo › Redemption**

| KPI | Mô tả |
|---|---|
| Total points redeemed | 12m, monthly trend |
| Total VND value issued | Tổng giá trị voucher phát hành |
| Total cost-to-company | Cost thực sau margin |
| Redemption rate | redeemed / earned |
| Top rewards | Đổi nhiều nhất |
| Reward by tier | Phân bổ theo tier KH |
| Avg time to redemption | Khoảng từ earn → redeem |

Export Excel cho Finance.

## 7. Tham chiếu

- URD rewards: [`../02-requirements/part-05-rewards-redemption.md`](../02-requirements/part-05-rewards-redemption.md)
- Loyalty economics (cost-per-redemption): [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md)
