# BACKEND TASK — Market: Referral (giới thiệu bạn bè)

**Discovered:** 2026-04-22 — Q&A khách hàng chuỗi siêu thị (GAP #4)
**Severity:** 🟡 MEDIUM (post-demo, P2)
**Module:** `cloud-market-master`
**Prefix:** `/market/referral*`
**FE consumer:** [src/pages/LoyaltyReferral/index.tsx](../../../src/pages/LoyaltyReferral/index.tsx) — route `/loyalty_referral`

---

## BỐI CẢNH

Q&A câu 3: "dịch vụ không đủ hấp dẫn với khách hàng". Referral program là **đòn bẩy tăng trưởng số 1 của loyalty bán lẻ** — khách hiện hữu kéo khách mới, cả 2 đều nhận thưởng, chi phí CAC (cost-per-acquisition) thấp hơn 40–60% so với paid ads.

---

## PHẦN 1: Schema

```sql
-- Mã giới thiệu + trạng thái
CREATE TABLE referral (
  id                BIGSERIAL PRIMARY KEY,
  referrer_id       BIGINT NOT NULL,      -- customer_id của người giới thiệu
  referred_id       BIGINT,               -- customer_id của người được giới thiệu (NULL đến khi đăng ký)
  referral_code     VARCHAR(16) NOT NULL UNIQUE,
  status            VARCHAR(24) NOT NULL, -- pending | registered | first_purchase | rewarded | expired
  reward_points     INT NOT NULL DEFAULT 0,
  reward_voucher_code VARCHAR(32),
  invited_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registered_at     TIMESTAMPTZ,
  first_purchase_at TIMESTAMPTZ,
  rewarded_at       TIMESTAMPTZ,
  expire_at         TIMESTAMPTZ NOT NULL,
  channel           VARCHAR(16),          -- app | sms | zalo | facebook | qr
  tenant_id         BIGINT NOT NULL,

  INDEX idx_ref_referrer (referrer_id),
  INDEX idx_ref_referred (referred_id),
  INDEX idx_ref_status   (status, expire_at)
);

-- Quy tắc thưởng — 1 dòng/tenant
CREATE TABLE referral_rule (
  tenant_id              BIGINT PRIMARY KEY,
  enabled                BOOLEAN NOT NULL DEFAULT FALSE,
  referrer_reward        INT NOT NULL,
  referee_reward         INT NOT NULL,
  reward_trigger         VARCHAR(16) NOT NULL,  -- registered | first_purchase
  first_purchase_min_value NUMERIC(18,2),
  expiry_days            INT NOT NULL DEFAULT 30,
  referee_voucher_code   VARCHAR(32),
  max_invites_per_month  INT NOT NULL DEFAULT 20,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## PHẦN 2: Sinh mã + gửi mời

### `POST /market/referral/invite`
Body:
```json
{
  "referrerId": 12345,
  "channel": "app",
  "invitedPhone": "0903111222",   // optional — nếu có, pre-fill khi bạn đó đăng ký
  "invitedName": "Trần Văn B"
}
```

Logic:
1. Check `referral_rule.enabled = true`, không thì 400.
2. Check số lượt mời trong tháng của referrer ≤ `max_invites_per_month`, nếu vượt → 400 "Bạn đã mời đủ số lượng tháng này".
3. Gen code 8 ký tự (base32, loại trừ 0/O/1/I).
4. Insert `referral` với `status=pending, expire_at = NOW() + expiry_days`.
5. Return `{ code, shareUrl: "https://app.reborn.vn/r/{code}", qrImageUrl }`.

### `POST /market/referral/attach`
Khi khách mới đăng ký và nhập mã:
```json
{ "referredId": 98765, "referralCode": "AB12CD34" }
```

Logic:
1. Validate code: còn hạn, status = `pending`, referrer ≠ referred (không tự mời mình).
2. Update `referral.status = 'registered', referred_id, registered_at = NOW()`.
3. Nếu `rule.reward_trigger = 'registered'` → trao thưởng ngay (step 4 phần dưới).

### Hook `invoice.completed` — trigger reward (first purchase)

Khi 1 invoice hoàn thành:
- Query `referral WHERE referred_id = invoice.customer_id AND status = 'registered'`.
- Nếu `rule.reward_trigger='first_purchase'` và `invoice.total >= rule.first_purchase_min_value`:
  - Cộng `referrer_reward` điểm vào ví referrer (qua `loyalty` service).
  - Cộng `referee_reward` điểm vào ví referred.
  - Nếu có `referee_voucher_code` → gắn voucher cho referred.
  - Update `referral.status='rewarded', rewarded_at=NOW(), reward_points = tổng điểm đã trao`.
  - Emit event `referral.rewarded` để MA trigger thông báo cả 2 bên.

---

## PHẦN 3: API đọc

### `GET /market/referral/list`
Query: `page`, `limit`, `status`, `referrerId`, `fromDate`, `toDate`.

Response: `{ items: [...], total }` — mỗi item đầy đủ field như FE ([LoyaltyReferral/index.tsx](../../../src/pages/LoyaltyReferral/index.tsx) IReferralItem).

### `GET /market/referral/stats`
Response:
```json
{
  "code": 0,
  "result": {
    "totalInvites":         12480,
    "totalRegistered":       4521,
    "totalFirstPurchase":    2103,
    "totalRewarded":         2103,
    "totalPointsPaid":     210300000,
    "conversionRate":           36.2
  }
}
```

### `GET /market/referralRule/get`
Return `referral_rule` của tenant hiện tại (tạo default nếu chưa có).

### `POST /market/referralRule/update`
Body = full referral_rule. Validate và upsert.

---

## PHẦN 4: Cron job

- **Mỗi 1 giờ:** scan `referral WHERE status IN ('pending','registered') AND expire_at < NOW()` → set `status='expired'`.
- **Mỗi ngày:** emit event `referral.expiring` cho các referral còn 3 ngày hết hạn → MA nhắc referrer chia sẻ lại.

---

## PHẦN 5: Anti-fraud

Quy định cứng để chống gian lận:
- Referrer ≠ referred (check customer_id và cả số điện thoại, email)
- 1 customer chỉ được là `referred` duy nhất 1 lần trong đời — check unique(referred_id) với status ≥ registered.
- Mỗi cặp (phone referrer, phone referred) chỉ được hưởng 1 lần.
- Hạn chế: 1 số điện thoại / device_id không được là referrer > 20 lượt/tháng.
- Blacklist các device_id đăng ký bất thường (>5 tài khoản/24h).

---

## PHẦN 6: Test cases

| TC | Hành động | Expected |
|---|---|---|
| TC-01 | Referrer A tạo mã | Code 8 ký tự, status=pending, expire_at=NOW+30 ngày |
| TC-02 | Friend B đăng ký với mã A | status → registered, referred_id=B |
| TC-03 | B hoàn thành đơn đầu tiên ≥ min_value | status → rewarded, A nhận điểm, B nhận điểm + voucher |
| TC-04 | B hoàn thành đơn dưới min_value | status vẫn registered, không thưởng |
| TC-05 | A tự điền mã của A | 400, không attach |
| TC-06 | B đã có referral trước đó | 400 "Bạn đã được giới thiệu trước đó" |
| TC-07 | A mời 21 lượt/tháng | Lượt 21 → 400 |
| TC-08 | Cron chạy khi expire | pending → expired |
