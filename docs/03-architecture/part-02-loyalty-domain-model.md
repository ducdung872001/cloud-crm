# Part 02 — Loyalty Domain Model (DDD)

## 1. Bounded contexts

Domain Loyalty được phân thành 6 bounded context theo Domain-Driven Design:

```
┌──────────────────────────────────────────────────────────────────┐
│                        LOYALTY DOMAIN                             │
│                                                                   │
│  ┌────────────────────┐   ┌────────────────────┐                 │
│  │  Customer Profile  │   │  Points Ledger     │                 │
│  │  (member, dedupe,  │   │  (earn/redeem/     │                 │
│  │   cross-brand)     │◄──┤   expire/transfer) │                 │
│  └─────────┬──────────┘   └─────────┬──────────┘                 │
│            │                         │                            │
│            │       ┌─────────────────┴──────┐                    │
│            │       │                        │                     │
│            ▼       ▼                        ▼                     │
│  ┌────────────────────┐         ┌────────────────────┐           │
│  │   Tier Management  │         │  Rewards Catalog   │           │
│  │   (definition, eval│         │  (catalog, redempt)│           │
│  │    grace period)   │         │                    │           │
│  └────────────────────┘         └────────────────────┘           │
│                                                                   │
│  ┌────────────────────┐         ┌────────────────────┐           │
│  │ Promotion/Campaign │         │ Customer Care      │           │
│  │ (rules, A/B test,  │         │ (ticket, warranty, │           │
│  │  segment, throttle)│         │  NPS)              │           │
│  └────────────────────┘         └────────────────────┘           │
└──────────────────────────────────────────────────────────────────┘

  Support contexts:
  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │ Notification │   │  Analytics   │   │   Audit      │
  └──────────────┘   └──────────────┘   └──────────────┘
```

## 2. Aggregates per context

### 2.1. Customer Profile

**Aggregate root:** `Member`

```
Member
├─ member_id (UUID, identity)
├─ phone (natural key, unique in scope)
├─ profile (name, dob, gender, email, ...)
├─ barcode (auto-gen, unique chain-wide)
├─ status (active/inactive/blocked/merged)
├─ home_brand, home_store
├─ tags (array)
├─ external_refs (goldmem_id, supporter_id, ...)
├─ merged_into_member_id (when status=merged)
└─ cached: current_tier_id, lifetime_points_earned, current_balance

Value objects:
- Phone (E.164 format)
- Address (province, district, ward)
- Barcode (Code128/QR)

Domain events:
- MemberRegistered
- MemberMerged
- MemberBlocked
- MemberUnblocked
- MemberDeleted (soft)
```

### 2.2. Points Ledger

**Aggregate root:** `PointsLedger` (per member)

```
PointsLedger (member)
└─ entries[] (LedgerEntry, append-only)
    ├─ ledger_id
    ├─ entry_type (earn/redeem/expire/adjust/refund/transfer)
    ├─ points (signed bigint)
    ├─ balance_after
    ├─ reference (order_ref / reward_redemption_id / ticket_id / ...)
    ├─ earn_rule_id (if earn)
    ├─ expires_at (if earn)
    ├─ consumed_from_ledger_id (if redeem/expire, FIFO trace)
    ├─ scope_id
    └─ created_at, actor

Invariants:
- balance_after_n = balance_after_(n-1) + points_n
- current_balance = SUM(points) WHERE member_id = X
- unique(reference_type, reference_id, entry_type) — idempotent

Domain events:
- PointsEarned
- PointsRedeemed
- PointsExpired
- PointsRefunded
- PointsTransferred
```

### 2.3. Tier Management

**Aggregate root:** `TierProgram`

```
TierProgram (per scope)
├─ tiers[] (Tier definitions)
│   ├─ tier_code, name, order
│   ├─ threshold_points, maintain_threshold_points
│   ├─ earn_multiplier
│   ├─ benefits (JSON)
│   └─ evaluation_metric, period
└─ rules (grace_period, evaluation_cycle)

MemberTierState (separate entity, per member-scope)
├─ member_id
├─ scope_id
├─ current_tier_id
├─ tier_since
├─ in_grace_period (bool)
├─ grace_periods_remaining
└─ next_evaluation_at

Domain events:
- TierUpgraded
- TierDowngraded (from grace)
- TierGraceEntered
- TierGraceExited
```

### 2.4. Rewards Catalog

**Aggregate root:** `RewardCatalog` + `RewardRedemption`

```
Reward
├─ reward_id
├─ type (voucher/physical/service/cashback/tier_upgrade)
├─ points_required
├─ value_vnd, cost_to_company_vnd
├─ stock_remaining (count down)
├─ per_member_limit + period
├─ eligible_tiers, eligible_scope
└─ valid_from, valid_to

RewardRedemption
├─ redemption_id
├─ member_id, reward_id
├─ points_spent
├─ voucher_code (if voucher)
├─ status (issued/used/expired/cancelled)
└─ used_at, used_order_ref

Domain events:
- RewardRedeemed
- VoucherUsed
- VoucherExpired
- RedemptionCancelled
```

### 2.5. Promotion / Campaign

**Aggregate root:** `Campaign`

```
Campaign
├─ campaign_id
├─ type (earn/burn/re_engage/acquisition/birthday/tier_up/bxgy/bundle)
├─ target_segment_id
├─ rules_json (multiplier, conditions, ...)
├─ budget_vnd, current_spend_vnd
├─ status (draft/scheduled/running/paused/ended)
├─ start_at, end_at
└─ notification_template_id, channels

Segment
├─ segment_id
├─ filter_rules_json (RFM, tier, last_order, ...)
└─ refresh_cron

Domain events:
- CampaignCreated, CampaignLaunched, CampaignPaused, CampaignEnded
- CampaignApplied (per order)
- SegmentRefreshed
```

### 2.6. Customer Care

**Aggregate root:** `Ticket`

```
Ticket
├─ ticket_id
├─ member_id (or walk_in info)
├─ channel, category, subcategory
├─ status (new/assigned/in_progress/waiting_customer/resolved/closed)
├─ sla_deadline, first_response_at, resolved_at
├─ assigned_to_user_id
├─ timeline[] (TicketEvent: assigned/replied/escalated/...)
├─ compensation_points (if any)
└─ customer_satisfaction (NPS post-resolve)

Domain events:
- TicketCreated, TicketAssigned, TicketResolved, TicketReopened
- SLABreached
- CompensationGranted
```

## 3. Cross-aggregate flows

### 3.1. Auto-earn flow

```
POS Webhook (order.completed)
    │
    ▼
[Customer Profile]   Lookup Member by phone
    │                If not exist + auto_create=true → create Member
    ▼
[Promotion]          Find applicable Campaigns for context (scope/time/segment)
    │
    ▼
[Tier Mgmt]          Get current tier_multiplier of Member
    │
    ▼
[Points Ledger]      Calculate points = base × tier_mult × campaign_mult
                     Apply min_spend, max_points_per_order caps
                     Write LedgerEntry (entry_type=earn)
    │
    ▼
[Tier Mgmt]          Check lifetime_points_earned vs next tier threshold
                     If upgrade → write tier_history + emit TierUpgraded
    │
    ▼
[Notification]       Emit PointsEarned event
                     Send via configured channel (throttled)
    │
    ▼
Response to POS
```

### 3.2. Cross-aggregate consistency

| Pattern | Áp dụng cho | Lý do |
|---|---|---|
| **Strong consistency (transaction)** | Customer Profile + Points Ledger trong cùng tenant | Balance phải đúng tức thời |
| **Eventual consistency (event)** | Notification, Analytics | Có thể lag vài giây, không critical |
| **Saga pattern** | Cross-brand transfer (2 ledger 2 scope) | Compensating action nếu fail |
| **Outbox pattern** | Domain events → Notification | Đảm bảo at-least-once delivery |

## 4. Ubiquitous language

| Khái niệm domain | Tên trong code | Tránh dùng |
|---|---|---|
| Hội viên | `Member` | "Customer", "User" (User = admin) |
| Khách thường (chưa đăng ký) | `WalkInCustomer` | "Guest" |
| Điểm thưởng | `Points` | "Credits", "Coins" |
| Sổ cái điểm | `PointsLedger` | "Balance history" |
| Lần biến động | `LedgerEntry` | "Transaction" (= order transaction) |
| Hạng thẻ | `Tier` | "Level", "Rank", "Status" |
| Quà / Phần thưởng | `Reward` | "Gift", "Prize" |
| Mã đổi quà | `RewardRedemption` | "Order" |
| Phiếu giảm giá | `Voucher` | "Coupon", "Discount code" |
| Chiến dịch | `Campaign` | "Promotion" (= rule) |
| Phân khúc KH | `Segment` | "Group", "Cohort" (cohort = thời gian) |
| Phạm vi áp dụng | `Scope` | "Domain", "Boundary" |

## 5. Anti-corruption layer (ACL)

Khi tích hợp với POS bên ngoài (legacy schema khác nhau), build **ACL adapter** mỗi POS:

```
POS Brand A ──webhook──► ACL Adapter A ──standardize──► Loyalty domain events
POS Brand B ──webhook──► ACL Adapter B ──standardize──► Loyalty domain events
```

ACL adapter responsibility:
- Map field names khác biệt (POS_A: `customerPhone` vs POS_B: `cust_mobile`)
- Convert units (cents vs VND)
- Validate against loyalty schema
- Reject malformed payload

## 6. Tham chiếu

- Implementation: [`../05-backend-tasks/`](../05-backend-tasks/)
- Data schema chi tiết: [`part-03-data-architecture.md`](part-03-data-architecture.md)
- Sequence diagrams: [`part-05-api-integration.md`](part-05-api-integration.md)
- ADR domain-driven decisions: [`part-09-adr.md`](part-09-adr.md)
