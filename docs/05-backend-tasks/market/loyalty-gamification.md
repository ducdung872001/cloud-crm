# BACKEND TASK — Market: Gamification (huy hiệu + bảng xếp hạng)

**Discovered:** 2026-04-22 — Q&A khách hàng chuỗi siêu thị (GAP #7)
**Severity:** 🟢 LOW (post-demo, P2 — nice-to-have, khác biệt cạnh tranh)
**Module:** `cloud-market-master`
**Prefix:** `/market/gamification/*`
**FE consumer:** [src/pages/LoyaltyLeaderboard/index.tsx](../../../src/pages/LoyaltyLeaderboard/index.tsx) — route `/loyalty_leaderboard`

---

## BỐI CẢNH

Q&A câu 3: "dịch vụ không đủ hấp dẫn". Gamification biến hành vi mua sắm thành "game" — KH cạnh tranh thứ hạng, sưu tập huy hiệu, giữ streak. Theo benchmark ngành, gamification tăng retention 15–25% và tăng AOV (avg order value) 8–12%.

---

## PHẦN 1: Schema — huy hiệu (badge)

```sql
-- Định nghĩa huy hiệu — do admin cấu hình
CREATE TABLE gamification_badge (
  code         VARCHAR(32) PRIMARY KEY,   -- "first_purchase", "10_orders", "big_spender_1m", ...
  name         VARCHAR(128) NOT NULL,
  description  VARCHAR(512),
  icon         VARCHAR(64) NOT NULL,      -- tên icon trong FE icon set
  color        VARCHAR(16) NOT NULL,      -- hex #HHHHHH
  rule_json    JSON NOT NULL,             -- điều kiện đạt — xem phần 2
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  tenant_id    BIGINT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KH đã đạt huy hiệu nào
CREATE TABLE customer_badge (
  customer_id  BIGINT NOT NULL,
  badge_code   VARCHAR(32) NOT NULL,
  earned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_when_earned JSON,
  PRIMARY KEY (customer_id, badge_code)
);

-- Snapshot điểm / chi tiêu theo period để build leaderboard
CREATE TABLE gamification_score_snapshot (
  customer_id  BIGINT NOT NULL,
  period_key   VARCHAR(16) NOT NULL,  -- "2026W17" (tuần), "2026M04" (tháng), "2026Q2" (quý), "ALL"
  points       BIGINT NOT NULL DEFAULT 0,
  spend        NUMERIC(18,2) NOT NULL DEFAULT 0,
  tx_count     INT NOT NULL DEFAULT 0,
  computed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (customer_id, period_key)
);
CREATE INDEX idx_score_period_points ON gamification_score_snapshot(period_key, points DESC);
```

---

## PHẦN 2: Rule DSL cho badge

`rule_json` thể hiện điều kiện đạt — DSL đơn giản:

```json
// Ví dụ 1: đơn hàng đầu tiên
{ "type": "first_event", "event": "invoice.completed" }

// Ví dụ 2: 10 đơn trong 12 tháng
{ "type": "count", "event": "invoice.completed", "window": "12M", "threshold": 10 }

// Ví dụ 3: chi tiêu ≥ 10 triệu / năm
{ "type": "sum", "field": "invoice.total", "window": "12M", "threshold": 10000000 }

// Ví dụ 4: streak mua 3 tháng liên tiếp
{ "type": "streak", "event": "invoice.completed", "interval": "month", "threshold": 3 }

// Ví dụ 5: dùng voucher 5 lần
{ "type": "count", "event": "voucher.redeemed", "window": "ALL", "threshold": 5 }
```

Evaluator chạy async trên Kafka — consumer của topic `invoice.completed`, `voucher.redeemed`, `loyalty.earned` check từng rule, nếu đạt → insert `customer_badge` + emit event `badge.earned` cho MA (push notification "Chúc mừng!").

---

## PHẦN 3: API

### `GET /market/gamification/badges`
List tất cả badge + số KH đã đạt:
```json
{ "code": 0, "result": {
  "items": [
    { "code": "first_purchase", "name": "Mua hàng lần đầu", "description": "...", "icon": "Shopping", "color": "#10B981", "earnedCount": 245000 },
    ...
  ]
}}
```

### `GET /market/gamification/leaderboard`
Query:
- `period` = `week` | `month` | `quarter` | `all` (required)
- `limit` (default 50, max 200)
- `branchId` (optional — lọc theo cửa hàng)
- `tierId` (optional — lọc theo hạng)

Response:
```json
{ "code": 0, "result": {
  "period": "month",
  "periodKey": "2026M04",
  "items": [
    {
      "rank": 1, "customerId": 12345, "customerName": "Nguyễn Văn A",
      "customerAvatar": "https://...",
      "tierName": "Kim Cương", "tierColor": "#06B6D4",
      "points": 125000, "spend": 12500000,
      "badges": ["Mua hàng lần đầu", "10 đơn trong tháng", "VIP"]
    },
    ...
  ]
}}
```

### `GET /market/gamification/customer/:customerId`
Chi tiết gamification của 1 KH (để FE hiển thị badge panel trên hồ sơ KH):
```json
{ "code": 0, "result": {
  "customerId": 12345,
  "earnedBadges": [ { "code": "first_purchase", "name": "...", "icon": "...", "earnedAt": "..." }, ... ],
  "inProgressBadges": [
    { "code": "10_orders", "name": "10 đơn", "progress": 7, "target": 10 },
    ...
  ],
  "currentRank": { "period": "month", "rank": 45, "totalCompetitors": 100000 },
  "tierProgress": { "currentTier": "Vàng", "nextTier": "Kim Cương", "pointsToNext": 35000 }
}}
```

---

## PHẦN 4: Cron refresh leaderboard

- **Realtime stream:** mọi `invoice.completed` → update `gamification_score_snapshot` cho period hiện tại (week/month/quarter/all) — cộng dồn điểm và spend.
- **Materialize:** job chạy mỗi 5 phút recompute top 200 rank cho mỗi period — cache Redis `leaderboard:{period}:{branchId|all}:{tierId|all}` TTL 5 phút.
- Endpoint `GET leaderboard` đọc từ Redis trước, fallback DB.

---

## PHẦN 5: Seed badge mặc định (tenant mới)

Khi 1 tenant bật feature gamification, seed 8 badge cơ bản:

| Code | Name | Rule | Icon | Color |
|---|---|---|---|---|
| `first_purchase` | Đơn hàng đầu tiên | first_event invoice.completed | Cart | #10B981 |
| `10_orders_year` | 10 đơn / năm | count 10 in 12M | ShoppingBag | #3B82F6 |
| `50_orders_year` | 50 đơn / năm | count 50 in 12M | Trophy | #F59E0B |
| `big_spender_5m` | Chi tiêu 5 triệu / năm | sum 5M in 12M | Coin | #8B5CF6 |
| `big_spender_20m` | VIP 20 triệu / năm | sum 20M in 12M | Diamond | #06B6D4 |
| `streak_3m` | 3 tháng liên tiếp | streak month=3 | Fire | #EF4444 |
| `streak_12m` | Năm vàng | streak month=12 | Star | #F59E0B |
| `birthday_visitor` | Sinh nhật có mua | invoice in birthday window | Gift | #EC4899 |

---

## PHẦN 6: Test cases

| TC | Hành động | Expected |
|---|---|---|
| TC-01 | KH hoàn thành đơn hàng đầu | badge `first_purchase` earned, event `badge.earned` |
| TC-02 | KH đạt đơn thứ 10 | badge `10_orders_year` earned |
| TC-03 | Leaderboard week — top 1 | rank=1, points cao nhất trong tuần |
| TC-04 | Đổi period week → month | danh sách thay đổi, không cache lẫn |
| TC-05 | 200k KH cùng lúc hoàn thành đơn (peak) | Không leak điểm, event exactly-once |

---

## PHẦN 7: Privacy

Leaderboard mặc định hiển thị:
- Tên KH dạng viết tắt ("Nguyễn V. A")
- Avatar hoặc icon tier
- KH có thể opt-out qua setting cá nhân (flag `customer.gamification_public = false` → loại khỏi leaderboard).

Luật bảo vệ dữ liệu cá nhân: không hiển thị SĐT / email / địa chỉ trên leaderboard.
