# Part 05 — Catalog quà & Đổi thưởng

## 1. Mục tiêu

Cho phép KH **đổi điểm lấy giá trị** dưới các hình thức: voucher giảm giá, hiện vật, dịch vụ, thăng hạng. Đảm bảo tính toán cost-per-redemption chính xác và tracking ROI.

## 2. Reward catalog model

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `reward_id` | UUID | PK |
| `reward_code` | string(40) | Unique — VD `VC-50K-2026Q2` |
| `reward_name` | i18n | |
| `reward_type` | enum | `voucher_discount`, `voucher_freeship`, `voucher_giftcard`, `physical_gift`, `service`, `tier_upgrade`, `cash_back` |
| `points_required` | bigint | Điểm cần để đổi |
| `value_vnd` | bigint | Giá trị tiền tương đương (cho báo cáo cost) |
| `cost_to_company_vnd` | bigint | Chi phí thực doanh nghiệp (≤ value_vnd) |
| `stock_limit` | bigint | NULL = unlimited |
| `stock_remaining` | bigint | Decrement mỗi redemption |
| `per_member_limit` | int | Tối đa /KH (NULL = unlimited) |
| `per_member_period` | enum | `day`, `week`, `month`, `year`, `lifetime` |
| `eligible_tiers` | JSON array | Tier nào được đổi (NULL = all) |
| `eligible_scope` | FK | Scope áp dụng (brand/store-group/chain) |
| `valid_from`, `valid_to` | timestamp | Hiệu lực |
| `voucher_valid_days` | int | Nếu là voucher: số ngày sống của voucher sau khi đổi |
| `image_url` | url | Hình ảnh hiển thị |
| `description` | text | Mô tả chi tiết, terms |
| `active` | bool | |

## 3. Redemption flow

```
KH chọn reward → POST /loyaltyReward/redeem {member_id, reward_id}
                ↓
        Engine validate:
        - Member active
        - Balance ≥ points_required
        - Tier eligible
        - Stock_remaining > 0
        - Per-member limit chưa vượt
        - Trong valid_from..valid_to
                ↓
        Ghi ledger entry_type=redeem
        Decrement stock
        Tạo voucher_code unique (nếu voucher type)
                ↓
        Response: {redemption_id, voucher_code?, voucher_expires_at?, new_balance}
                ↓
        Notification KH: SMS/Zalo/email với voucher_code
        Webhook outbound: reward.redeemed event
```

## 4. Yêu cầu

### UR-RWD-01 — CRUD catalog (Must)

| | |
|---|---|
| **Actor** | Tenant Admin, Marketing Mgr |
| **Mô tả** | Tạo/sửa reward với tất cả trường. Upload image. Preview trên app KH trước khi public. |
| **AC** | • Không cho xoá reward đã có redemption — chỉ inactive<br>• Audit log thay đổi `points_required` (chống abuse: giảm điểm yêu cầu rồi KH đổi hàng loạt) |

### UR-RWD-02 — Browse catalog (Must)

| | |
|---|---|
| **Actor** | KHTV, CSKH |
| **Mô tả** | List reward filter theo: tier eligibility, price range (điểm), category, stock available. Sort: điểm tăng/giảm, mới nhất, sắp hết. |
| **AC** | • Pagination 20/page<br>• Reward không eligible vẫn hiện nhưng disable + tooltip "Cần lên Bạc"<br>• Stock < 10 hiển thị "Sắp hết" warning |

### UR-RWD-03 — Redeem reward (Must)

Xem flow §3. AC bổ sung:
- Atomic transaction: ghi ledger + decrement stock + tạo voucher cùng transaction
- Idempotent retry: client gửi lại request trong 30s với cùng `idempotency_key` → trả response cũ
- Race condition: concurrent redeem stock cuối cùng → 1 thành công, các request khác trả 409 + thông báo hết
- Notification trong < 30s sau redeem

### UR-RWD-04 — Voucher lifecycle (Must)

| | |
|---|---|
| **Mô tả** | Voucher code unique (UUID hoặc nano-id 12 ký tự). Trạng thái: `issued → used → expired`. KH dùng voucher tại POS: POS POST `/voucher/validate {code, order_amount}` → engine check valid (chưa used, chưa expired, eligible amount). POS POST `/voucher/redeem {code, order_ref}` → mark used. |
| **AC** | • Voucher dùng 1 lần (single-use) trừ khi flag `multi_use = true`<br>• POS validate < 200 ms<br>• Voucher expire cron daily → mark expired<br>• Notification KH trước 3 ngày khi voucher sắp hết |

### UR-RWD-05 — Cancel redemption (Should)

| | |
|---|---|
| **Mô tả** | KH yêu cầu huỷ voucher chưa dùng → refund điểm. Bắt buộc trong vòng N ngày sau redeem (cấu hình, default 7). Voucher → status cancelled, không dùng được. Ghi ledger `adjust_in` reverse. |
| **AC** | • Self-service trong app (≤ 7 ngày) hoặc qua CSKH<br>• Audit + lý do<br>• Block nếu voucher đã `used` |

### UR-RWD-06 — Physical gift fulfillment (Should)

| | |
|---|---|
| **Mô tả** | Reward type `physical_gift`: sau redeem, tạo phiếu xuất quà cho store của KH. Store nhân viên xác nhận giao quà → mark fulfilled. Có SLA giao quà ≤ 7 ngày. |
| **AC** | • Workflow: redeemed → ready_for_pickup → fulfilled (hoặc shipped)<br>• Notification KH các bước<br>• Báo cáo SLA giao quà |

### UR-RWD-07 — Service redemption (Could)

| | |
|---|---|
| **Mô tả** | Reward type `service` (VD: free buffet, spa session). Sau redeem, tạo booking ràng buộc với KH + lịch dịch vụ. |
| **AC** | • Tích hợp với booking system (nếu có)<br>• Hoặc gửi voucher code, KH đến store xuất trình |

### UR-RWD-08 — Per-member limit (Must)

| | |
|---|---|
| **Mô tả** | Chống abuse: 1 KH chỉ đổi N reward/period. VD: voucher 50k tối đa 2 cái/tháng. Check trước khi cho redeem. |
| **AC** | • Count theo `created_at` trong period<br>• Error message rõ: "Bạn đã đổi 2 voucher 50k trong tháng này. Quay lại 01/06" |

### UR-RWD-09 — Cost & ROI tracking (Must)

| | |
|---|---|
| **Mô tả** | Mỗi redemption ghi `cost_to_company_vnd` để báo cáo. Dashboard tổng hợp: total points redeemed, total VND value issued, total cost actually borne, breakage offset. |
| **AC** | • Báo cáo monthly cho Finance<br>• KPI: redemption_rate = points_redeemed / points_earned (target 30–60%)<br>• Cost-per-active-member |
| **Phân tích sâu** | [`../06-analysis/loyalty-economics.md#redemption-rate-and-breakage`](../06-analysis/loyalty-economics.md) |

### UR-RWD-10 — Featured & seasonal rewards (Should)

| | |
|---|---|
| **Mô tả** | Đánh dấu reward là `featured = true` → hiển thị banner top app. Seasonal: hiệu lực ngắn (Tết, Black Friday, 8/3). |
| **AC** | • Tối đa 5 featured cùng lúc<br>• Auto unfeatured sau valid_to |

## 5. Quy tắc nghiệp vụ

- **Reward voucher discount KHÔNG cộng dồn với khuyến mãi đang chạy** trừ khi flag `stackable_with_promotion = true`
- **Tier-restricted reward**: chỉ tier `eligible_tiers` redeem được, không cho phép lưu lại nếu downgrade
- **Stock < 0 không cho phép** — atomic decrement
- **Refund voucher chỉ trong period** sau khi redeem; sau period → KH chịu
- **Voucher trùng với promotion period**: KH dùng voucher trong period KM → KM vẫn áp, voucher trừ thêm (nếu stackable)
- **Cost-to-company KHÁC value_vnd**: VD voucher 50k giảm giá → cost = 50k × gross_margin của đơn, không phải 50k.

## 6. Tham chiếu

- **API spec:** `/loyaltyReward/*` trong [`../04-api/loyalty-openapi.yaml`](../04-api/loyalty-openapi.yaml)
- **Loyalty economics — cost-per-point, breakage offset:** [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md)
- **UI/HDSD:** [`../09-userguides/part-04-rewards.md`](../09-userguides/part-04-rewards.md)
