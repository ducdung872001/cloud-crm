# Case Study — Advanced Earn Rule qua BPM Engine: "Loyalty Quest tháng 5"

## TL;DR

> Một campaign "Loyalty Quest" trong 30 ngày, 5 challenge song song + 1 bundle bonus cuối tháng, đa kênh đầu vào (POS Brand A + B), tracking state per-member, award immediate khi hoàn thành từng challenge + award bundle cuối kỳ. **Đây là case mà rule engine simple KHÔNG xử lý nổi** — cần stateful long-running workflow, multi-event correlation, time-bound batch, versioned process. Bài này phân tích: bài toán → tại sao BPM → workflow BPMN diagram → tích hợp với market-service → state management → failure handling → vận hành. Áp dụng pattern này cho mọi quest/journey/family-pool/B2B-contract case tương lai.

## 1. Bối cảnh kinh doanh

Marketing chuỗi siêu thị muốn launch **"Hành trình Thám hiểm Chuỗi Tháng 5/2026"** — chương trình gamification:

> "Hoàn thành 5 thử thách trong tháng 5/2026 để nhận **+5.000 điểm bonus + huy hiệu Explorer + voucher freeship 1 tháng**. Đã hoàn thành tất cả → tự động lên hạng Silver (nếu chưa Silver)."

**5 thử thách (challenges):**

| # | Tên | Điều kiện | Award khi đạt |
|---|---|---|---|
| 1 | **First Steps** | Phát sinh đơn đầu tiên trong tháng 5 | +200 điểm immediate |
| 2 | **Big Spender** | 1 đơn ≥ 1.000.000 VND | +500 điểm immediate |
| 3 | **Cross-brand Explorer** | Có đơn ở CẢ Brand A và Brand B trong tháng | +800 điểm immediate |
| 4 | **Diversity Hunter** | Mua sản phẩm thuộc ≥ 5 category khác nhau | +500 điểm immediate |
| 5 | **Frequent Visitor** | Phát sinh ≥ 8 đơn trong tháng | +1.000 điểm immediate |

**Bundle bonus** (cuối tháng 31/05/2026 23:59):
- Hoàn thành cả 5/5 → +5.000 điểm + badge `quest_may_2026_explorer` + voucher freeship 30 ngày + auto-upgrade Silver (nếu Bronze)
- Hoàn thành 3-4/5 → +1.500 điểm consolation + badge `quest_may_2026_explorer_partial`
- Hoàn thành 0-2/5 → không có bundle bonus, các challenge awards individual đã ghi

**Target segment:** 1.5M KH active trong 90 ngày qua (loại Hibernating + Lost).

**Mục tiêu kinh doanh:**
- Tăng frequency: +20% so với tháng 4 baseline
- Push cross-brand: +30% KH active cả 2 brand
- AOV uplift: +15% từ Big Spender pressure

## 2. Tại sao Simple Rule Engine không đủ?

Thử nhồi vào engine native — gặp các giới hạn:

| Yêu cầu | Simple engine | Vấn đề |
|---|---|---|
| Track 5 challenge state per KH × 1.5M KH | Stateless rule eval | Không có state storage native |
| Challenge "≥ 8 đơn trong tháng" | Cần aggregate query mỗi giao dịch | Performance + duplicate award risk |
| "Cross-brand A và B" | Multi-event correlation across brand | Engine eval per-transaction, không thấy lịch sử |
| Award bundle cuối tháng | Time-trigger không có trong rule engine | Cần cron riêng, code-based |
| Hủy quest khi KH opt-out giữa kỳ | Cần terminate workflow | Không có lifecycle quản lý |
| A/B test variants (5 challenges A vs 4 challenges B) | Multi-version rule | Engine không versioned |
| KH thấy progress real-time "3/5 challenge done" | Cần read state | State không persistent |
| Manual intervention "force-award KH X badge" | Cần workflow control | Không có process control plane |

**Kết luận:** Đây không phải "earn rule" — đây là **business process có state machine + timer + correlation**. Đúng case BPM.

## 3. Workflow BPMN (Reborn BPM Studio)

### 3.1. Diagram tổng quan

```
                           ╔════════════════════════════════╗
                           ║  Loyalty Quest "May 2026"      ║
                           ║   Process: quest-may-2026-v1   ║
                           ╚════════════════════════════════╝

  ┌──────────┐                                                    ┌──────────┐
  │  ⭐ START │                                                    │  🏁 END   │
  │ Enroll   │                                                    │ Cleanup  │
  │ member   │                                                    │ + report │
  └────┬─────┘                                                    └────▲─────┘
       │                                                               │
       ▼                                                               │
  ╔════════════════════════════════════════════════════════════════╗  │
  ║  ⏰ TIMER START — runs from 2026-05-01 00:00 to 2026-05-31 23:59 ║  │
  ╚════════════════════════════════════════════════════════════════╝  │
       │                                                               │
       ▼                                                               │
  ╔════════════════════════════════════════════════════════════════╗  │
  ║  📥 PARALLEL GATEWAY (Fork) — Spawn 5 challenge branches        ║  │
  ╚═╦═══════╦═══════╦═══════╦═══════╦═══════════════════════════════╝  │
    │       │       │       │       │                                  │
    ▼       ▼       ▼       ▼       ▼                                  │
  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                                   │
  │ C1 │ │ C2 │ │ C3 │ │ C4 │ │ C5 │  (each challenge = subprocess)    │
  │    │ │    │ │    │ │    │ │    │                                   │
  │First│ │Big │ │X-  │ │Div-│ │Freq│                                  │
  │Step │ │Spnd│ │Brnd│ │Hunt│ │Vist│                                  │
  └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘                                   │
    │      │      │      │      │                                       │
    │ each subprocess details: see §3.2                                  │
    │      │      │      │      │                                       │
    ▼      ▼      ▼      ▼      ▼                                       │
  ┌──────────────────────────────────┐                                  │
  │  📥 PARALLEL GATEWAY (Join)       │                                 │
  │  Wait until all 5 done OR timer  │                                 │
  │  reached month-end                │                                 │
  └────────────┬──────────────────────┘                                 │
               │                                                         │
               ▼                                                         │
        ╔══════════════╗                                                 │
        ║ ⏰ Boundary    ║──► (event: month_end_reached at 23:59 31/05) │
        ║  Timer        ║                                                │
        ║ "month_end"   ║                                                │
        ╚══════╤═══════╝                                                │
               │                                                         │
               ▼                                                         │
  ╔══════════════════════════════════╗                                  │
  │  🔀 EXCLUSIVE GATEWAY (Decision)  │                                 │
  │  count(completed_challenges) =   │                                 │
  │    5? → path FULL                │                                 │
  │    3-4? → path PARTIAL           │                                 │
  │    0-2? → path NONE              │                                 │
  ╚══╤══════════╤══════════╤═════════╝                                  │
     │ FULL     │ PARTIAL  │ NONE                                       │
     ▼          ▼          ▼                                            │
  ┌───────┐ ┌────────┐ ┌──────┐                                         │
  │ Award │ │ Award  │ │ Skip │                                         │
  │ +5K + │ │ +1.5K +│ │ award│                                         │
  │ badge+│ │ partial│ │      │                                         │
  │vouchr+│ │  badge │ │      │                                         │
  │tier-up│ │        │ │      │                                         │
  └───┬───┘ └────┬───┘ └──┬───┘                                         │
      │         │         │                                              │
      └─────────┴─────────┴──────────────────────────────────────────────┘
                                                          (END)
```

### 3.2. Subprocess "Challenge" (template, lặp 5 lần)

```
                  ╔════════════════════════════════════╗
                  ║   Subprocess: Challenge_<N>         ║
                  ║   Variables:                        ║
                  ║   - challenge_state: in_progress    ║
                  ║   - progress_value: 0               ║
                  ║   - target_value: <from config>     ║
                  ║   - awarded: false                  ║
                  ╚════════════════════════════════════╝

  ┌──────────┐
  │  ⭐ START │
  │ subproc. │
  └────┬─────┘
       │
       ▼
  ╔════════════════════════════════════════════════════════╗
  ║  📨 MESSAGE EVENT (Catch)                                ║
  ║                                                          ║
  ║  Subscribes: LedgerEntryCreatedEvent                    ║
  ║  Correlation key: member_id                             ║
  ║  Filter: entry_type == "earn"                           ║
  ╚══════════════╤═══════════════════════════════════════════╝
                 │
                 ▼
  ┌─────────────────────────────────────────┐
  │  ⚙️ SCRIPT TASK                          │
  │  Evaluate challenge progress:           │
  │    if challenge == "First Steps":       │
  │      progress_value = 1                 │
  │    elif challenge == "Big Spender":     │
  │      progress_value = max(progress,     │
  │                          event.amount)  │
  │    elif challenge == "Cross-brand":     │
  │      brands_seen.add(event.brand_id)    │
  │      progress_value = brands_seen.size  │
  │    elif challenge == "Diversity":       │
  │      cats.add(event.items.categories)   │
  │      progress_value = cats.size         │
  │    elif challenge == "Frequent":        │
  │      progress_value += 1                │
  └────────────────┬────────────────────────┘
                   │
                   ▼
       ╔════════════════════════╗
       ║ 🔀 EXCLUSIVE GATEWAY    ║
       ║ progress >= target?    ║
       ╚═══╤══════════════╤═════╝
           │ YES          │ NO
           ▼              │
  ┌───────────────┐       │
  │ 🌐 SERVICE     │       │
  │ TASK           │       │
  │ Call:          │       │
  │ POST /internal │       │
  │ /loyalty/award │       │
  │                │       │
  │ payload: {     │       │
  │  member_id,    │       │
  │  points: cfg,  │       │
  │  reason:       │       │
  │   bpm_quest_c1,│       │
  │  ref_type:     │       │
  │   bpm_process, │       │
  │  ref_id:       │       │
  │   instance_id, │       │
  │  idempotency:  │       │
  │   uuid }       │       │
  └───────┬───────┘       │
          │ 200 OK         │
          ▼                │
  ┌───────────────┐       │
  │ 🔔 SEND TASK  │       │
  │ Notify KH     │       │
  │ "Challenge    │       │
  │ done — +N đ"  │       │
  └───────┬───────┘       │
          │                │
          ▼                │
       ┌──────┐            │
       │ 🏁END │            │
       │ state │            │
       │ =done │            │
       └──────┘            │
                           │   (subprocess không end — loop về Message Event chờ event tiếp theo)
                           └────────────────────────────┘
```

### 3.3. Workflow variables

```yaml
process_instance_variables:
  campaign_id: "quest_may_2026"
  member_id: "uuid-of-member"
  enrolled_at: "2026-05-01T08:00:00+07:00"
  challenges:
    c1_first_step:
      target: 1
      progress: 0          # auto-update bởi script
      awarded: false
      award_points: 200
      completed_at: null
    c2_big_spender:
      target: 1000000       # VND
      progress: 0           # max order amount seen
      awarded: false
      award_points: 500
      completed_at: null
    c3_cross_brand:
      target: 2             # = 2 distinct brand
      brands_seen: []
      awarded: false
      award_points: 800
      completed_at: null
    c4_diversity:
      target: 5
      categories_seen: []
      awarded: false
      award_points: 500
      completed_at: null
    c5_frequent:
      target: 8
      progress: 0           # order count
      awarded: false
      award_points: 1000
      completed_at: null
  bundle_evaluated: false
  bundle_award:
    full: { points: 5000, badge: "quest_may_2026_explorer", voucher: "FREESHIP30", upgrade_tier: "silver" }
    partial: { points: 1500, badge: "quest_may_2026_explorer_partial" }
```

## 4. Sequence diagram — 1 giao dịch tới end of month

```
KH                POS               market-svc        RabbitMQ          BPM Engine         notification-svc
 │                 │                  │                  │                  │                    │
 │ Mua tại Brand A │                  │                  │                  │                    │
 ├────────────────►│                  │                  │                  │                    │
 │                 │ POST /autoEarn   │                  │                  │                    │
 │                 ├─────────────────►│                  │                  │                    │
 │                 │                  │                  │                  │                    │
 │                 │                  │ Earn simple flow │                  │                    │
 │                 │                  │ ledger entry +35 │                  │                    │
 │                 │                  │ COMMIT           │                  │                    │
 │                 │                  │                  │                  │                    │
 │                 │                  │ Publish event    │                  │                    │
 │                 │                  ├─────────────────►│                  │                    │
 │                 │                  │   LedgerEntry    │                  │                    │
 │                 │                  │   Created        │                  │                    │
 │                 │ 200 OK          │                  │                  │                    │
 │                 │◄─────────────────┤                  │                  │                    │
 │  ────[35 đ]    │                  │                  │                  │                    │
 │                 │                  │                  │                  │                    │
 │                 │                  │                  │ Route to BPM     │                    │
 │                 │                  │                  ├─────────────────►│                    │
 │                 │                  │                  │                  │ Correlate by       │
 │                 │                  │                  │                  │ member_id          │
 │                 │                  │                  │                  │                    │
 │                 │                  │                  │                  │ Process instance   │
 │                 │                  │                  │                  │ quest-may-2026     │
 │                 │                  │                  │                  │ found for KH       │
 │                 │                  │                  │                  │                    │
 │                 │                  │                  │                  │ Eval 5 challenge:  │
 │                 │                  │                  │                  │ - C1 First Steps: │
 │                 │                  │                  │                  │   progress 0→1    │
 │                 │                  │                  │                  │   target reached!  │
 │                 │                  │                  │                  │                    │
 │                 │                  │                  │                  │ SERVICE TASK:     │
 │                 │                  │ POST /internal/  │                  │                    │
 │                 │                  │ loyalty/award    │                  │                    │
 │                 │                  │◄─────────────────┼──────────────────┤                    │
 │                 │                  │  member, +200,   │                  │                    │
 │                 │                  │  reason=bpm_quest│                  │                    │
 │                 │                  │  _c1, idempotency│                  │                    │
 │                 │                  │                  │                  │                    │
 │                 │                  │ Ledger entry     │                  │                    │
 │                 │                  │ adjust_in +200   │                  │                    │
 │                 │                  │ ref=process_inst │                  │                    │
 │                 │                  │                  │                  │                    │
 │                 │                  │ 200 OK          │                  │                    │
 │                 │                  ├──────────────────┼─────────────────►│                    │
 │                 │                  │                  │                  │                    │
 │                 │                  │                  │                  │ SEND TASK:        │
 │                 │                  │                  │                  │ Notify member     │
 │                 │                  │                  │                  ├───────────────────►│
 │                 │                  │                  │                  │                    │ SMS/Zalo
 │                 │                  │                  │                  │                    │ "🎉 +200 First Steps"
 │ "🎉 +200..."   │                  │                  │                  │                    │
 │◄────────────────┼──────────────────┼──────────────────┼──────────────────┼────────────────────┤
 │                 │                  │                  │                  │                    │
 │ ...(KH tiếp tục mua qua tháng)...                                                              │
 │                 │                  │                  │                  │                    │
 │                 │                  │                  │                  │ 31/05 23:59:       │
 │                 │                  │                  │                  │ ⏰ Boundary timer   │
 │                 │                  │                  │                  │ fires               │
 │                 │                  │                  │                  │                    │
 │                 │                  │                  │                  │ Eval bundle:       │
 │                 │                  │                  │                  │ completed = 5/5    │
 │                 │                  │                  │                  │ → path FULL        │
 │                 │                  │                  │                  │                    │
 │                 │                  │ POST /internal/  │                  │                    │
 │                 │                  │ loyalty/award    │                  │                    │
 │                 │                  │◄─────────────────┼──────────────────┤                    │
 │                 │                  │  +5.000 bundle   │                  │                    │
 │                 │                  │  bonus + badge   │                  │                    │
 │                 │                  │  + voucher       │                  │                    │
 │                 │                  │  + tier upgrade  │                  │                    │
 │                 │                  │                  │                  │                    │
 │                 │                  │ Apply all atomic │                  │                    │
 │                 │                  │ 200 OK          │                  │                    │
 │                 │                  ├──────────────────┼─────────────────►│                    │
 │                 │                  │                  │                  │ Process END       │
 │                 │                  │                  │                  │                    │
 │                 │                  │                  │                  │ Final notification│
 │                 │                  │                  │                  ├───────────────────►│
 │ "🏆 Quest done!"│                  │                  │                  │                    │ Push + SMS
 │◄────────────────┴──────────────────┴──────────────────┴──────────────────┴────────────────────┘
```

## 5. State persistence

BPM Engine lưu state vào DB riêng `bpm_db` (PostgreSQL):

| Table | Mô tả | Volume estimate |
|---|---|---|
| `process_definition` | BPMN XML versions | < 100 rows |
| `process_instance` | Mỗi KH enrolled = 1 instance | 1.5M × 1 quest = 1.5M rows |
| `variable_instance` | Variables của mỗi instance (challenges state) | 1.5M × ~20 vars = 30M rows |
| `historic_activity_instance` | Audit trail mỗi step | 1.5M × ~10 steps = 15M rows |
| `event_subscription` | Đăng ký Message events | 1.5M × 5 challenges = 7.5M rows |
| `timer` | Active timers (month_end boundary) | 1.5M timers |
| `incident` | Lỗi runtime (retry exhausted) | < 1.000 rows |

→ **Sizing:** `bpm_db` cần ~50GB cho quest này. Cleanup policy: archive sau end + 90 ngày retention.

## 6. Tích hợp chi tiết với market-service

### 6.1. Event publish (market-service → BPM)

```java
// Pseudocode trong market-service sau khi simple earn xong
@EventListener
public void onLedgerEntryCreated(LedgerEntry entry) {
    if (entry.entryType() != EntryType.EARN) return;
    
    var event = LedgerEntryCreatedEvent.builder()
        .memberId(entry.memberId())
        .ledgerId(entry.id())
        .points(entry.points())
        .orderRef(entry.referenceId())
        .storeId(entry.storeId())
        .brandId(entry.brandId())
        .itemCategories(extractCategoriesFromOrder(entry))  // cho C4
        .occurredAt(entry.createdAt())
        .build();
    
    rabbitTemplate.convertAndSend(
        "loyalty.events",
        "points.earned",
        event,
        msg -> {
            msg.getMessageProperties().setMessageId(entry.id().toString());  // dedupe at BPM
            return msg;
        }
    );
}
```

### 6.2. Award callback (BPM → market-service)

```http
POST /internal/v1/loyalty/award HTTP/1.1
Authorization: Bearer <internal-service-token>
Idempotency-Key: <process_instance_id>:<challenge_id>:<event_id>
Content-Type: application/json

{
  "member_id": "uuid",
  "points": 200,
  "reason_code": "bpm_quest_c1_first_step",
  "reference_type": "bpm_process",
  "reference_id": "process-instance-uuid",
  "scope_id": "chain_or_brand",
  "metadata": {
    "campaign_id": "quest_may_2026",
    "challenge_id": "c1_first_step",
    "process_definition_version": "v1"
  }
}
```

Response:
```json
{
  "ledger_id": "uuid",
  "new_balance": 1735,
  "tier_changed": false
}
```

`market-service` ghi vào `points_ledger`:
- `entry_type = adjust_in`
- `points = +200`
- `reference_type = bpm_process`
- `reference_id = process-instance-uuid`
- `note = "Loyalty Quest May 2026 — Challenge: First Steps"`

→ Khi audit, có thể trace ngược về BPM process instance để xem full history.

### 6.3. Bundle award flow

Bundle bonus phức tạp hơn — cần atomic apply nhiều thứ:

```http
POST /internal/v1/loyalty/award-bundle HTTP/1.1
Idempotency-Key: <process_instance_id>:bundle

{
  "member_id": "uuid",
  "actions": [
    { "type": "award_points", "points": 5000, "reason": "bpm_quest_may_2026_bundle_full" },
    { "type": "award_badge", "badge_code": "quest_may_2026_explorer" },
    { "type": "issue_voucher", "voucher_template": "FREESHIP30" },
    { "type": "tier_upgrade", "from_tier": "bronze", "to_tier": "silver", "until": "2026-08-31T23:59" }
  ],
  "reference_id": "process-instance-uuid"
}
```

market-service xử lý **atomic** — hoặc tất cả thành công, hoặc rollback (nếu 1 action fail).

## 7. Failure modes & handling

| Failure | Phát hiện | Xử lý |
|---|---|---|
| BPM Engine down 30 phút | Health check + alert | Events dồn DLQ; khi BPM up → consume DLQ drain; KH có thể nhận award trễ vài phút (acceptable cho async) |
| Event correlation fail (KH chưa enroll quest) | BPM trả "no matching process" | Drop event (KH này không trong quest, không cần process) |
| Award API trả 5xx | BPM retry exp backoff 3 lần | Sau 3 lần fail → BPM incident; admin manual investigate |
| Award API trả 4xx (invalid request) | BPM | Mark process as failed, notify ops |
| Duplicate event delivery | At-least-once delivery | BPM idempotent (event_id dedupe); market-service idempotency_key dedupe |
| KH bị block giữa kỳ quest | market-service reject award | BPM nhận 403, mark instance terminated, không award thêm |
| Workflow bug logic (infinite loop) | Process active > expected duration alert | Manual terminate + fix workflow + deploy v2 (instances cũ vẫn chạy đến hết, v2 cho instances mới) |
| Bundle award partial fail (3/4 action ok, 1 fail) | market-service transaction rollback | BPM nhận error → retry → nếu lỗi persistent → mark instance error, notify ops |
| Timer fail (end-of-month timer không fire) | Monitor alert "instances stuck after month_end" | Manual force-fire + post-mortem |

## 8. Performance

| Metric | Target | Cách đạt |
|---|---|---|
| Event ingestion vào BPM | ~150 EPS (peak ~500 EPS lễ) | Queue partitioning theo member_id |
| Correlation lookup | < 10 ms | Index `event_subscription(member_id, process_definition_id)` |
| Award API call | < 200 ms | Same as auto-earn |
| Bundle award (end-of-month) | 1.5M instances trong 4 giờ | Parallel timer workers, batch 1000/transaction |
| Process instance memory | < 50 KB / instance | Trim variable history, archive sau end |

Sizing BPM Engine cluster cho quest này:
- 3 worker nodes × 8 vCPU / 32GB RAM
- PostgreSQL `bpm_db`: 16 vCPU / 64 GB / 500 GB SSD
- Active instances cap: 5M (đủ headroom cho multiple quest đồng thời)

## 9. Vận hành (operations)

### 9.1. Trước launch

- [ ] Marketing design workflow trong BPM Studio sandbox
- [ ] Review business logic: BA + Marketing + Finance (cost projection)
- [ ] Test workflow trong sandbox với 1000 synthetic member
- [ ] Load test 500 EPS event ingestion
- [ ] Tenant Admin approve deploy production
- [ ] Cron schedule enroll: 01/05/2026 00:00 spawn process instances cho 1.5M target members

### 9.2. Trong campaign

Dashboard monitor (admin UI):
- Active instances count
- Progress distribution: 0/5, 1/5, ..., 5/5
- Event ingestion rate
- Failed instances + reasons
- Award TPS, total points awarded so far
- Budget tracker (estimated cost projection)

### 9.3. Cuối campaign (31/05 23:59)

- Timer boundary fire → bundle eval cho 1.5M instances trong 4 giờ batch
- Notification gửi throttle 100K/giờ → 1.5M sẽ mất ~15 giờ → start trước 1 ngày
- Post-mortem report sau 7 ngày:
  - Completion rate (% KH 5/5, 3-4/5, 0-2/5)
  - Revenue uplift vs baseline
  - Cost actual vs budget
  - KPI: frequency, cross-brand penetration, AOV
  - Lesson learned cho quest tiếp theo

### 9.4. Sau campaign

- Archive process instances data → cold storage sau 90 ngày
- Deprecate workflow `quest-may-2026-v1` (no new instances spawn)
- Workflow `quest-june-2026-v1` deploy (có thể clone từ v1 và adjust)

## 10. Lessons learned & best practices

### 10.1. Design BPM workflow

- ✅ **Keep tasks small & idempotent** — mỗi task có thể retry safely
- ✅ **Externalize biz logic to script tasks** — không hardcode trong gateway condition
- ✅ **Use correlation key cẩn thận** — `member_id` đủ; không cần composite
- ✅ **Time boundary explicit** — đừng dựa vào internal cron, dùng BPMN timer
- ✅ **Variable size hạn chế** — không lưu full order list, chỉ aggregate
- ✅ **Versioning policy clear** — instances cũ chạy đến hết, không hot-migrate

### 10.2. Anti-patterns

- ❌ **Sync HTTP call từ market-service tới BPM** — coupling latency, BPM down = simple earn fail
- ❌ **BPM ghi trực tiếp ledger** — phá isolation, BPM không own ledger schema
- ❌ **Nested workflow** — workflow A trigger workflow B trigger A → cycle
- ❌ **State trong variable quá lớn** (vd: full order history) — performance + storage bloat
- ❌ **Logic phức tạp trong gateway condition** — khó test, di chuyển ra script task
- ❌ **Workflow không có timeout** — instance stuck mãi → memory leak

### 10.3. Migration & rollout

- Pilot với 1.000 KH random trước full launch
- A/B test variant: full 5 challenges (A) vs simplified 3 challenges (B) → đo engagement
- Rollback plan: terminate all instances + manual award fairness (nếu workflow có bug nghiêm trọng)

## 11. Pattern này áp dụng cho case nào khác?

Pattern Event-driven + Stateful Workflow + Callback Award có thể tái sử dụng cho:

| Case | Tính chất tương tự |
|---|---|
| **Family Plan pooling** | Multi-actor (4 KH cùng pool); aggregate cuối tháng; threshold-based unlock |
| **B2B đơn lớn contract** | Approval gate (Sales rep); external API call (contract rate); multi-step (validate → approve → award) |
| **Journey-based reward** | Multi-channel input; long-running; conditional path |
| **Referral chain bonus** | KH A refer B refer C; chain depth tracking; time-bound |
| **Subscription milestones** | "Mua hàng đều đặn 3/6/12 tháng" — time-based progression |
| **Tier upgrade fast-track** | "Đạt X điểm trong 30 ngày → instant upgrade" — accelerated tier promotion |
| **Seasonal challenges** | Tết / Trung Thu / Black Friday — multi-challenge events |
| **Achievement badges** | Hoàn thành milestone đầu tiên (đơn 1M đầu tiên, mua 100 đơn đầu tiên, ...) |
| **Social engagement reward** | Refer + share + review → multi-source aggregate |

→ Khi gặp case mới, dùng decision tree ở [URD part-03 §1bis](../02-requirements/part-03-points-engine.md#11-ranh-giới-quyết-định-rule-này-thuộc-lớp-nào) để quyết định BPM hay simple.

## 12. Tham chiếu

- URD points engine — Simple vs Advanced: [`../02-requirements/part-03-points-engine.md#1bis`](../02-requirements/part-03-points-engine.md)
- URD BPM-specific requirements UR-PTS-13→16: [`../02-requirements/part-03-points-engine.md#ur-pts-13-đẩy-event-vào-bpm-engine-cho-rule-nâng-cao-must`](../02-requirements/part-03-points-engine.md)
- SA Microservices §10 BPM integration: [`../03-architecture/part-04-microservices.md#10-bpm-engine-integration-cho-advanced-earn`](../03-architecture/part-04-microservices.md)
- ADR-16 BPM Engine decision: [`../03-architecture/part-09-adr.md#adr-16`](../03-architecture/part-09-adr.md)
- Reborn BPM platform docs: (internal — `/bpmapi` reference, BPM Studio guide)
- BPMN 2.0 standard: https://www.omg.org/spec/BPMN/2.0/
