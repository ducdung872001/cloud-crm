# [BE · `market`] FitPro Phase 2.2 — EGIFT (Quà tặng Phygital)

**Microservice:** `market` (có sẵn)
**URL prefix:** `/bizapi/market/egift/*`
**URD:** [Part 15 §8.1 UR-FITPRO-EGIFT](../../urd/part-15-fitpro-phygital-roadmap.md#81-mapping-ur--microservice-v2--đã-được-ban-lãnh-đạo-duyệt-lại-2026-04-24)

## 1. Lý do nằm ở `market`

Quyết định 2026-04-24: **không** tạo microservice `loyalty` riêng. EGIFT quy hoạch vào `market` theo tư duy: giữ chân khách → bán mới/bán lại/bán chéo = marketing retention. EGIFT là một dạng marketing retention giống voucher/promotion hiện có ở `market`.

## 2. Schema bổ sung (trong DB của `market`)

```sql
CREATE TYPE gift_type AS ENUM ('physical', 'digital');
CREATE TYPE gift_status AS ENUM ('queued', 'shipped', 'claimed', 'expired');
CREATE TYPE trigger_milestone AS ENUM (
  'baseline_done', 'month_1_complete', 'retest_done',
  'package_renewed', 'birthday', 'referral_success', 'first_checkin'
);

CREATE TABLE gift_catalog (
  id VARCHAR(32) PRIMARY KEY,
  tenant_id VARCHAR(32) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type gift_type NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  value_vnd BIGINT DEFAULT 0,
  trigger_milestone trigger_milestone NOT NULL,
  stock_qty INT DEFAULT 0,                 -- chỉ dùng cho physical
  inventory_sku VARCHAR(64),                -- link tới inventory service cho physical
  digital_content TEXT,                     -- voucher code / URL / session id
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE gift_assignment (
  id VARCHAR(32) PRIMARY KEY,
  tenant_id VARCHAR(32) NOT NULL,
  gift_id VARCHAR(32) REFERENCES gift_catalog(id),
  member_id VARCHAR(32) NOT NULL,
  trigger_milestone trigger_milestone NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  status gift_status DEFAULT 'queued',
  shipped_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  tracking_number VARCHAR(64),
  logistics_order_id VARCHAR(64)            -- link sang logistics service
);

CREATE INDEX idx_gift_assign_member ON gift_assignment (member_id);
CREATE INDEX idx_gift_assign_status ON gift_assignment (status);
```

## 3. API contract

| Endpoint | Quyền | Mô tả |
|----------|-------|-------|
| `GET/POST/PUT/DELETE /bizapi/market/egift/catalog` | Master BO | Catalog CRUD |
| `GET /bizapi/market/egift/assignments?memberId=&status=` | BO+ | List assignment |
| `POST /bizapi/market/egift/assignments/:id/ship` | Admin | Mark shipped (auto tạo order `logistics`) |
| `POST /bizapi/market/egift/assignments/:id/claim` | Member | Member redeem |
| `GET /bizapi/market/egift/members/:memberId/inbox` | Member | Inbox gift của member cho app mobile |

## 4. Event subscription (nội bộ + cross-service)

`market` subscribe events để auto-assign gift:

| Event source | Event | Action |
|-------------|-------|--------|
| `market` (self — Journey module) | `journey.baseline_done` | Assign gift trigger=baseline_done |
| `market` (self) | `journey.retest_done` | Assign gift trigger=retest_done |
| `market` (self) | `journey.month_1_complete` | Assign gift trigger=month_1_complete |
| `sales` | `package.renewed` | Assign gift trigger=package_renewed |
| `customer` | `member.birthday_today` | Assign gift trigger=birthday |
| `market` (self — checkin) | `member.first_checkin` | Assign gift trigger=first_checkin |

## 5. Integration với services khác

- **`inventory`**: khi `gift_catalog.type=physical` và `inventory_sku` set → assign gọi `inventory` check stock + reserve.
- **`logistics`**: khi ship physical → tạo shipping order; track `logistics_order_id`.
- **`notification`**: khi assign + khi claim → push tin.
- Nếu gift digital là voucher → claim sẽ emit event `market.voucher.issued` cho voucher engine hiện có trong `market` xử lý.

## 6. Sự khác biệt với voucher/promotion hiện có của `market`

| Loại | Mục đích | Ngữ cảnh kích hoạt |
|------|----------|-------------------|
| Voucher / Promotion cũ | Giảm giá đơn hàng | Khách nhập mã / bấm nút "Áp dụng" |
| **EGIFT** (mới) | Quà tặng theo milestone, tăng cảm xúc + retention | Hệ thống **tự động** gán khi hội viên đạt mốc Hành trình 90 ngày |

→ Cùng nằm trong `market` (cùng domain marketing) nhưng trigger logic khác.

## 7. Test cases

| Test | Expected |
|------|----------|
| CRUD catalog item | OK, validate stock ≥ 0, trigger enum hợp lệ |
| Event `journey.baseline_done` fire → assignment tạo tự động | ✅ |
| Ship gift physical → `logistics` order tạo | ✅ |
| Claim digital gift (voucher) → emit event `market.voucher.issued` → member có thể dùng voucher ở lần mua kế tiếp | ✅ |

## 8. Liên quan FE

- Page: [src/pages/CommunityHub/EGift/index.tsx](../../../src/pages/CommunityHub/EGift/index.tsx)
- Mock: [src/mocks/community-hub/egift.ts](../../../src/mocks/community-hub/egift.ts)
- Route: `/fp_egift`
