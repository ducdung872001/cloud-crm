# Part 04 — Hạng thành viên (Membership Tiers)

## 1. Mục tiêu

Phân hạng KH theo giá trị mang lại để **đặt benefits tương xứng**, thúc đẩy KH nâng hạng, giữ KH cao cấp khỏi churn. Đáp ứng evaluation 3M KH < 30 phút.

## 2. Tier definition

Default 4 hạng (cấu hình được số lượng + tên):

| Tier | Tên gợi ý | Ngưỡng đạt hạng (lifetime points 12 tháng) | Earn multiplier | Benefit ví dụ |
|---|---|---:|---:|---|
| 1 | **Đồng** (Bronze) | 0 — 4.999 | 1.0× | Tích điểm cơ bản, sinh nhật × 2 |
| 2 | **Bạc** (Silver) | 5.000 — 19.999 | 1.2× | + Voucher 5% / tháng, ưu tiên CSKH |
| 3 | **Vàng** (Gold) | 20.000 — 49.999 | 1.5× | + Free ship đơn ≥ 500k, exclusive event |
| 4 | **Kim Cương** (Diamond) | ≥ 50.000 | 2.0× | + Personal shopper, gift box tháng |

## 3. Tier entity

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `tier_id` | UUID | PK |
| `tier_code` | string(20) | bronze/silver/gold/diamond |
| `tier_name` | i18n | Tên hiển thị |
| `tier_order` | int | 1, 2, 3, ... (rank) |
| `threshold_points` | bigint | Ngưỡng đạt hạng |
| `maintain_threshold_points` | bigint | Ngưỡng duy trì (≤ threshold) |
| `evaluation_metric` | enum | `lifetime_points` / `period_points` / `period_spend` / `period_orders` |
| `evaluation_period_months` | int | 6, 12, 24 |
| `earn_multiplier` | decimal(4,2) | Hệ số tích điểm |
| `benefits` | JSON | Object mô tả benefits (free ship, voucher, ...) |
| `scope_id` | FK | Tier có thể khác giữa brand/store group khi scope ≠ chain |
| `active` | bool | |

## 4. Yêu cầu

### UR-TIER-01 — CRUD tier (Must)

| | |
|---|---|
| **Actor** | Tenant Admin, Brand Mgr (own brand) |
| **Mô tả** | Tạo/sửa tier với ngưỡng, multiplier, benefits. Validate `threshold[i] > threshold[i-1]` và `maintain ≤ threshold`. |
| **AC** | • Không cho xoá tier có member đang hold<br>• Đổi threshold không retroactive — chỉ áp dụng từ chu kỳ eval tiếp theo<br>• Preview: số KH ở mỗi tier theo ngưỡng mới |

### UR-TIER-02 — Upgrade tức thời (Must)

| | |
|---|---|
| **Mô tả** | Sau mỗi giao dịch `earn`, engine check `lifetime_points_earned` của KH. Nếu vượt threshold tier cao hơn → upgrade ngay, ghi `tier_history`, trigger notification. |
| **AC** | • Latency < 100 ms (đồng bộ trong earn flow)<br>• Notification qua kênh KH preferred (SMS/Zalo/email)<br>• Idempotent: không duplicate tier upgrade trong cùng giao dịch |

### UR-TIER-03 — Auto tier evaluation (Must)

| | |
|---|---|
| **Actor** | System (cron) |
| **Mô tả** | Cuối mỗi kỳ đánh giá (tháng/quý/năm cấu hình): rà soát toàn bộ KH. Với mỗi KH: tính metric (period_points / period_spend / period_orders) trong kỳ. So với threshold + maintain_threshold. (1) Đạt threshold tier cao hơn → upgrade. (2) Dưới maintain_threshold tier hiện tại → enter grace period (xem UR-TIER-04). |
| **AC** | • Dry-run mode: xem trước số upgrade/downgrade trước khi apply<br>• Performance: 3M KH < 30 phút<br>• Audit log mỗi tier change<br>• Notification batch gửi qua queue (không spam 3M tin nhắn cùng lúc — throttle 100k/giờ) |

### UR-TIER-04 — Grace period (Must)

| | |
|---|---|
| **Mô tả** | KH không đạt maintain_threshold tại kỳ eval không bị downgrade ngay. Thay vào đó, enter "grace period" — giữ tier hiện tại N kỳ ân hạn (cấu hình, default 1). Notify KH "Bạn cần X điểm trong tháng tới để duy trì hạng Vàng". Hết grace period vẫn không đạt → downgrade thực sự. |
| **AC** | • Grace period config: 0 (downgrade ngay), 1 kỳ (default), 2 kỳ<br>• Notification "warning" gửi vào đầu mỗi kỳ grace<br>• KH đạt lại threshold trong grace → exit grace, không downgrade |
| **Behavioral note** | Grace period giảm churn nhưng tăng cost (đang giữ benefit cho KH chưa xứng). Trade-off: xem [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md#tier-grace-period-tradeoff) |

### UR-TIER-05 — Tier history (Must)

| | |
|---|---|
| **Mô tả** | Lưu lịch sử tier của KH trong bảng `member_tier_history`: `{member_id, tier_id, from_date, to_date, reason: upgrade/downgrade/initial/manual_adjust, evaluated_at}`. Hiển thị trên profile 360°. |
| **AC** | • Cho phép drill-down "tại sao tôi bị xuống hạng" → mở chi tiết kỳ eval, metric đạt được vs threshold |

### UR-TIER-06 — Manual tier adjust (Should)

| | |
|---|---|
| **Actor** | Tenant Admin, CSKH Supervisor |
| **Mô tả** | Adjust tier 1 KH thủ công (goodwill, sai sót, VIP boost). Bắt buộc lý do + audit. Tier manual có flag `is_manual = true, manual_expires_at` (sau ngày này quay lại auto eval). |
| **AC** | • Cap: 1 admin adjust max 50 KH/ngày<br>• 2-level approval nếu adjust → tier cao nhất |

### UR-TIER-07 — Tier benefits engine (Should)

| | |
|---|---|
| **Mô tả** | Mỗi tier có benefits JSON. Engine áp benefits trong flow tương ứng: earn (multiplier), redemption (free ship), promotion (exclusive offer). UI: hiển thị danh sách benefits trên profile KH và app KH. |
| **AC** | • Benefits có thể conditional: VD "free ship chỉ áp dụng đơn ≥ 300k"<br>• Audit khi benefit áp dụng: ghi vào `benefit_usage` để báo cáo cost |

### UR-TIER-08 — Tier-based segment (Could)

| | |
|---|---|
| **Mô tả** | Marketing segment auto theo tier: "Diamond customers", "Gold downgrading", "Bronze inactive 60d". Dùng làm input cho campaign. |
| **AC** | • Segment refresh daily<br>• Segment count hiển thị real-time khi tạo campaign |

## 5. Quy tắc nghiệp vụ

- **Tier evaluation metric** thường dùng `period_points` 12 tháng (cuốn) — phản ánh hoạt động gần đây, không chỉ tích luỹ historical
- **Lifetime metric** dùng cho "tier vĩnh viễn" (status), period metric dùng cho "tier hoạt động" — có thể tách 2 system
- **Downgrade chỉ áp dụng vào cuối kỳ** + sau grace period — không downgrade giữa kỳ
- **Tier scope tách biệt khi scope ≠ chain** — KH có thể là Gold ở brand A nhưng Silver ở brand B
- **Khi merge cross-brand:** giữ tier cao hơn của 2 brand cho member primary
- **Tier change notification rate-limited:** không gửi quá 1 lần/tuần cho cùng KH (tránh spam khi border-line)

## 6. Tham chiếu

- **Behavioral analysis (grace period, tier-up game):** [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md)
- **Tier cron job spec:** [`../05-backend-tasks/market/`](../05-backend-tasks/market/)
- **Permission tier.config:** [`part-01-actors-roles.md`](part-01-actors-roles.md#2-permission-matrix-ma-trận-quyền)
