# BACKEND TASK — Market: Loyalty mở rộng cho chuỗi siêu thị bán lẻ

**Discovered:** 2026-04-16 — Yêu cầu khách hàng chuỗi siêu thị (2 brand, 300+ store, 3M KH)  
**Severity:** 🟠 HIGH  
**Module:** `cloud-market-master`  
**Prefix:** `/bizapi/market/loyalty*`

---

## NGUYÊN TẮC: KHÔNG XÂM LẤN ĐA NGÀNH

Microservice `market` dùng chung cho **mọi ngành** (retail, spa, F&B, community hub...).
Mọi thay đổi phải **additive** — KHÔNG SỬA field cũ, chỉ thêm field mới (optional).

| Quy tắc | Giải thích |
|----------|------------|
| Thêm column → DEFAULT NULL | Ngành khác không dùng → null, không ảnh hưởng |
| Thêm API endpoint → path mới | Không sửa path/response cũ |
| Thêm config field → JSON column | Flexible, mỗi ngành tự định nghĩa |
| Cron job → gated by config | Chỉ chạy nếu tenant bật feature |

---

## PHẦN 1: Mở rộng `loyalty_config` (table hiện có)

Thêm fields vào bảng config hiện tại (hoặc table `loyalty_config` nếu đã có).
Dùng 1 JSON column `extended_config` để tránh ALTER TABLE nhiều lần:

```sql
ALTER TABLE loyalty_config
  ADD COLUMN extended_config JSON DEFAULT NULL
  COMMENT 'Config mở rộng. Mỗi ngành tự thêm key riêng, không xung đột';
```

### Cấu trúc JSON `extended_config`:

```json
{
  "pointExpiry": {
    "expiryType": "never|after_months|end_of_year",
    "expiryMonths": 12,
    "expiryAnnualDate": "12-31",
    "notifyBeforeDays": 30
  },
  "tierEval": {
    "enabled": false,
    "evalPeriod": "monthly|quarterly|yearly",
    "evalMetric": "total_spend|total_points|order_count",
    "autoUpgrade": true,
    "autoDowngrade": true,
    "downgradeGraceDays": 30,
    "notifyOnChange": true
  },
  "loyaltyScope": "chain_wide|per_brand|per_store_group",
  "crossBrandPoints": true,
  "scopeNote": ""
}
```

### API ảnh hưởng (SỬA — backward compatible)

**GET `/market/loyaltyConfig/get`** — response thêm field `extendedConfig` (JSON):
```json
{
  "code": 0,
  "result": {
    "exchangeRate": 1000,
    "extendedConfig": { ... }
  }
}
```
- Nếu `extendedConfig` null → FE dùng default → ngành khác không bị ảnh hưởng

**POST `/market/loyaltyConfig/update`** — nhận thêm field `extendedConfig` (optional):
- Nếu request không gửi `extendedConfig` → KHÔNG đụng đến field này → ngành khác không bị ảnh hưởng
- Nếu request gửi → merge vào JSON hiện tại (deep merge, không overwrite toàn bộ)

---

## PHẦN 2: Point Expiry (điểm có hạn)

### Cron Job mới: `loyalty_point_expiry_check`
- **Chạy:** Daily, 00:00
- **Gate:** Chỉ chạy nếu `extendedConfig.pointExpiry.expiryType != "never"`
- **Logic:**
  1. Lấy tất cả point ledger entries chưa expired
  2. Kiểm tra expiry date:
     - `after_months`: `created_at + expiryMonths tháng < now()`
     - `end_of_year`: `year(created_at) < year(now())` và now > expiryAnnualDate
  3. Entries hết hạn → insert ledger entry âm (debit) + update wallet balance
  4. Notify trước `notifyBeforeDays` ngày (qua notification service)

### DB Schema bổ sung
```sql
ALTER TABLE loyalty_point_ledger
  ADD COLUMN expires_at DATETIME DEFAULT NULL
  COMMENT 'Ngày hết hạn. NULL = không hết hạn. Tính khi insert dựa trên config',
  ADD COLUMN expired TINYINT(1) DEFAULT 0
  COMMENT 'Đã hết hạn? Cron set = 1 khi xử lý';

CREATE INDEX idx_expires ON loyalty_point_ledger (expires_at, expired);
```

**Khi insert point ledger** (earn): tính `expires_at` dựa trên config hiện tại → gán vào row.
Nếu config = `never` → `expires_at = NULL`.

---

## PHẦN 3: Auto Tier Evaluation (thăng/hạ hạng)

### Cron Job mới: `loyalty_tier_evaluation`
- **Chạy:** Theo `evalPeriod`: monthly (ngày 1), quarterly (ngày 1 quý), yearly (ngày 1/1)
- **Gate:** Chỉ chạy nếu `extendedConfig.tierEval.enabled = true`
- **Logic:**
  1. Lấy danh sách segments (tiers) sorted by point threshold DESC
  2. Cho mỗi wallet:
     a. Tính metric trong kỳ (total_spend / total_points / order_count)
     b. Match tier mới dựa trên metric
     c. Nếu tier mới > current → upgrade (nếu `autoUpgrade`)
     d. Nếu tier mới < current → schedule downgrade sau `downgradeGraceDays` (nếu `autoDowngrade`)
  3. Update `loyalty_wallet.segment_id`
  4. Notify nếu `notifyOnChange` (qua notification service)

### DB Schema bổ sung
```sql
ALTER TABLE loyalty_wallet
  ADD COLUMN scheduled_downgrade_tier_id BIGINT DEFAULT NULL,
  ADD COLUMN scheduled_downgrade_at DATETIME DEFAULT NULL
  COMMENT 'Ngày dự kiến hạ hạng (sau grace period). Cron check daily';
```

---

## PHẦN 4: Bulk Import hội viên

### Endpoint MỚI (additive — không đụng endpoint cũ)

**POST `/market/loyaltyWallet/import`**
- Auth: JWT + permission LOYALTY_IMPORT
- Content-Type: `multipart/form-data`
- Request: file CSV/Excel
- Logic:
  1. Parse file → extract name, phone, email, points, tier
  2. Dedupe by phone trong tenant
  3. Cho mỗi row:
     a. Tìm customer by phone → nếu chưa có → tạo customer mới (gọi CustomerService)
     b. Tìm wallet by customerId → nếu chưa có → tạo wallet
     c. Nếu có points → insert ledger entry (source: "import")
     d. Nếu có tier → match segment by name → update wallet.segment_id
  4. Response:
```json
{
  "code": 0,
  "result": {
    "total": 1500,
    "imported": 1480,
    "skipped": 20,
    "errors": [
      { "row": 42, "phone": "0901...", "reason": "DUPLICATE_PHONE" },
      { "row": 88, "phone": "abc", "reason": "INVALID_PHONE" }
    ]
  }
}
```

**Lưu ý performance:** 3 triệu khách → batch insert, không loop 1-by-1.
Gợi ý: chunk 1000 rows, insert batch, progress tracking qua WebSocket/polling.

---

## PHẦN 5: Auto-earn points khi thanh toán

### Hiện trạng
POS FE đã gọi `fluctuatePoint` sau khi order paid (CounterSales line 660-664).
Nhưng chỉ hoạt động khi bán hàng qua CRM POS.

### Cần bổ sung cho siêu thị
Siêu thị dùng POS riêng (Misa, KiotViet...) → cần webhook/API để POS bên ngoài gọi:

**POST `/market/loyaltyPointLedger/autoEarn`** (endpoint MỚI)
- Auth: API key (không cần JWT — POS bên ngoài gọi)
- Request:
```json
{
  "phone": "0901234567",
  "orderAmount": 520000,
  "orderId": "INV-2026-001234",
  "orderDate": "2026-04-16T14:30:00Z",
  "branchId": 42,
  "items": [
    { "sku": "SP001", "categoryId": 5, "amount": 320000 },
    { "sku": "SP002", "categoryId": 8, "amount": 200000 }
  ]
}
```
- Logic:
  1. Tìm wallet by phone
  2. Nếu không có wallet → bỏ qua (hoặc auto-create nếu config cho phép)
  3. Áp dụng loyalty program rules:
     - Tính điểm theo `orderAmount / exchangeRate`
     - Áp multiplier nếu có (birthday, weekend, category-specific)
     - Loại trừ items theo category blacklist
  4. Insert ledger entry + update wallet balance
  5. Response: `{ ok: true, pointsEarned: 52, newBalance: 1348 }`

**Đây là endpoint mới hoàn toàn → không ảnh hưởng ngành khác.**
Ngành nào không dùng → không gọi → không có side effect.

---

## PHẦN 6: Loyalty Scope (phạm vi áp dụng)

### Logic BE

Khi query loyalty data (wallets, ledger, rewards), kiểm tra `loyaltyScope`:

- `chain_wide`: query bình thường (tenant-level, như hiện tại) → **KHÔNG CẦN SỬA GÌ**
- `per_brand`: filter thêm `brand_id` → cần thêm `brand_id` vào wallet + ledger
- `per_store_group`: filter thêm `store_group_id`

### DB Schema bổ sung (chỉ cần nếu dùng per_brand/per_store_group)
```sql
ALTER TABLE loyalty_wallet
  ADD COLUMN brand_id BIGINT DEFAULT NULL,
  ADD COLUMN store_group_id BIGINT DEFAULT NULL;

ALTER TABLE loyalty_point_ledger
  ADD COLUMN brand_id BIGINT DEFAULT NULL,
  ADD COLUMN store_group_id BIGINT DEFAULT NULL;

-- Index cho query nhanh
CREATE INDEX idx_wallet_brand ON loyalty_wallet (tenant_id, brand_id);
CREATE INDEX idx_wallet_store_group ON loyalty_wallet (tenant_id, store_group_id);
```

**Mặc định NULL → chain_wide → không ảnh hưởng ngành khác.**

---

## PHẦN 7: Permissions bổ sung

| Code | Mô tả |
|------|-------|
| LOYALTY_CONFIG_EXPIRY | Cấu hình hạn sử dụng điểm |
| LOYALTY_CONFIG_TIER_EVAL | Cấu hình thăng/hạ hạng tự động |
| LOYALTY_CONFIG_SCOPE | Cấu hình phạm vi áp dụng |
| LOYALTY_IMPORT | Import hội viên từ CSV |
| LOYALTY_AUTO_EARN | Webhook tích điểm tự động (API key) |

---

## THỨ TỰ ƯU TIÊN

| # | Việc | Ảnh hưởng ngành khác? | Priority |
|---|------|-----------------------|----------|
| 1 | Thêm `extended_config` JSON column | Không — NULL mặc định | P0 |
| 2 | Sửa GET/POST loyaltyConfig | Không — field mới optional | P0 |
| 3 | Endpoint `/loyaltyWallet/import` | Không — endpoint mới | P0 |
| 4 | Endpoint `/loyaltyPointLedger/autoEarn` | Không — endpoint mới | P1 |
| 5 | Cron `point_expiry_check` | Không — gated by config | P1 |
| 6 | Cron `tier_evaluation` | Không — gated by config | P1 |
| 7 | Thêm `brand_id` columns | Không — NULL mặc định | P2 |
| 8 | Thêm `expires_at` column | Không — NULL mặc định | P1 |
