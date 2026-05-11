# Part 03 — Engine tích/tiêu điểm

## 1. Mục tiêu

Engine tính, ghi nhận, tiêu thụ, hết hạn **điểm thưởng** với độ chính xác kế toán, xử lý 500 TPS sustained (peak 1.000 TPS), hỗ trợ rollback khi đơn refund, idempotent với webhook trùng.

## 1bis. Hai lớp Earn Rule — Simple vs Advanced

Engine chia rule tính điểm thành **2 lớp**, phân định rõ ranh giới ai làm gì:

| Tiêu chí | **Simple Rule** (rule engine native) | **Advanced Rule** (BPM Engine) |
|---|---|---|
| **Bản chất** | Stateless, đánh giá trong 1 transaction | Stateful, dài hạn, nhiều bước, nhiều trigger |
| **Đầu vào** | 1 order event | Nhiều event qua thời gian, nhiều channel |
| **Logic** | Công thức (`amount × rate × multiplier`) + cap đơn lẻ | Workflow có rẽ nhánh, vòng lặp, gate, timer, joins |
| **Cấu hình bởi** | Marketing Mgr qua UI form đơn giản | BA + Marketing với BPMN diagram trên BPM Studio |
| **Latency yêu cầu** | < 100 ms trong auto-earn flow | < 500 ms cho immediate award; batch cuối kỳ chấp nhận giờ |
| **Khi đổi rule** | Reload config, không cần deploy | Deploy workflow mới (versioned), KH đang trong workflow cũ vẫn chạy đến kết thúc |
| **Engine** | `market-service` native rule evaluator | **Reborn BPM Engine** qua `/bpmapi` |
| **Khi nào dùng** | 80–90% trường hợp tích điểm | 10–20% case nâng cao, gamification, campaign phức tạp |

### 1.1. Ranh giới quyết định: rule này thuộc lớp nào?

| Câu hỏi | Trả lời "yes" → BPM |
|---|---|
| Rule cần **lưu state** giữa nhiều giao dịch? | ✅ |
| Rule có **nhiều bước có thứ tự** (challenge 1 → 2 → 3)? | ✅ |
| Rule có **time window > 1 giờ** (chờ batch cuối tháng)? | ✅ |
| Rule cần **gate approval** từ người trước khi award? | ✅ |
| Rule **nhận event từ nhiều kênh khác nhau** (POS + app rating + referral)? | ✅ |
| Rule có **nhánh rẽ phức tạp** (nếu A và (B hoặc (C và D))) > 3 điều kiện chồng? | ✅ |
| Rule cần **callback external API** (e.g., social verify, contract system)? | ✅ |
| Rule có thay đổi trong vòng đời (versioned process)? | ✅ |

Nếu **không có gạch chéo nào** → dùng Simple Rule. Nếu **≥ 1 gạch chéo** → cân nhắc BPM.

> 📚 **Case study chi tiết:** Xem [`../06-analysis/advanced-earn-rule-bpm-case-study.md`](../06-analysis/advanced-earn-rule-bpm-case-study.md) — Loyalty Quest 5-challenge tháng, là case bao quát các yếu tố nâng cao điển hình.

## 2. Mô hình ledger (sổ cái điểm)

Mọi biến động điểm ghi vào bảng `points_ledger` — **append-only**, không update, không delete.

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `ledger_id` | UUID | PK |
| `member_id` | FK | KH liên quan |
| `entry_type` | enum | `earn`, `redeem`, `expire`, `adjust_in`, `adjust_out`, `refund`, `transfer_in`, `transfer_out` |
| `points` | bigint (signed) | + cho earn/adjust_in/refund/transfer_in; − cho redeem/expire/adjust_out/transfer_out |
| `balance_after` | bigint | Số dư sau giao dịch (snapshot cho audit) |
| `reference_type` | enum | `order`, `reward`, `cron_expire`, `manual_adjust`, `cross_brand_transfer`, `signup_bonus`, `campaign_bonus` |
| `reference_id` | string | ID của object tham chiếu |
| `earn_rule_id` | FK | Khi `entry_type = earn`, rule nào áp dụng |
| `expires_at` | timestamp | Khi `entry_type = earn`, timestamp hết hạn (NULL nếu không hết hạn) |
| `consumed_from_ledger_id` | FK self | Khi `entry_type = redeem/expire`, dùng FIFO: trỏ về earn entry bị tiêu/hết hạn |
| `branch_scope_id` | FK | Scope khi giao dịch xảy ra (cho per-brand/per-group) |
| `brand_id`, `store_id` | FK | Nơi phát sinh |
| `actor_user_id` | FK user | Người thực hiện (NULL = system/cron) |
| `note` | string(500) | Ghi chú free text |
| `created_at` | timestamp | |

**Quy tắc bất biến:**
- `current_points_balance = SUM(points) WHERE member_id = X AND deleted_at IS NULL`
- Mọi lần ghi ledger, `balance_after` phải = balance_after của entry trước đó + entry.points
- Không có hai entry có cùng `(reference_type, reference_id, entry_type)` — đảm bảo idempotency

## 3. Earn rules — Cấu hình tích điểm

3 loại rule cơ bản, có thể kết hợp:

| Loại rule | Cách tính | Ví dụ |
|---|---|---|
| `invoice_amount` | `floor(amount / divisor)` × multiplier | 10.000đ/đ = 1 điểm → đơn 350.000đ = 35 điểm |
| `category_based` | Mỗi line × rate theo category | SP cao cấp: 5đ/1.000đ; SP khuyến mãi: 0 |
| `fixed_per_order` | Số điểm cố định | 10 điểm/đơn không phụ thuộc giá trị |

**Modifier áp lên kết quả:**

| Modifier | Tác động | Ví dụ |
|---|---|---|
| `tier_multiplier` | × theo tier | Diamond × 2 |
| `birthday_bonus` | × trong tuần sinh nhật | × 3 |
| `campaign_bonus` | × trong campaign period | Cuối tuần × 2 |
| `min_spend_threshold` | Không tích nếu amount < threshold | < 50k → 0 điểm |
| `max_points_per_order` | Cap upper bound | Tối đa 500 điểm/đơn |

**Stack policy** (khi nhiều modifier active):
- Default: chỉ áp dụng **modifier cao nhất** (không nhân chồng) — `stack = false`
- Khi `stack = true`: nhân chồng (Diamond + birthday + weekend campaign = × 2 × 3 × 2 = × 12) — chỉ bật khi muốn campaign mạnh
- Cấu hình trong UR-PROMO-08

## 4. Yêu cầu chi tiết

### UR-PTS-01 — Cấu hình earn rule (Must)

| | |
|---|---|
| **Actor** | Tenant Admin, Marketing Mgr, Brand Mgr |
| **Mô tả** | Tạo/sửa/xoá rule. Mỗi rule có: tên, loại (invoice/category/fixed), tham số, scope (chain/brand/store-group), priority, hiệu lực thời gian, modifier list. Active đồng thời nhiều rule với priority — engine chọn rule priority cao nhất khớp scope. |
| **AC** | • Preview: tính thử với hoá đơn mẫu, hiển thị từng modifier áp dụng<br>• Validate: không 2 rule active cùng scope cùng priority<br>• Audit log mọi thay đổi<br>• Effective date: rule mới tự active từ datetime cấu hình |

### UR-PTS-02 — Auto-earn từ POS webhook (Must)

Đã mô tả chi tiết trong [`part-08-pos-integration.md`](part-08-pos-integration.md) UR-POS-02. Tóm tắt:
- POS POST `/loyaltyPointLedger/autoEarn` với `{phone, order_ref, amount, items[], store_id}`
- Engine: lookup KH → áp rule → ghi ledger → reply `{points_earned, new_balance, tier}`
- Idempotent theo `(reference_type=order, reference_id=order_ref)`
- Latency P95 < 500 ms

### UR-PTS-03 — Tích điểm thủ công (admin) (Should)

| | |
|---|---|
| **Actor** | Tenant Admin, CSKH Supervisor, Brand Mgr |
| **Mô tả** | Cộng/trừ điểm thủ công cho 1 KH (compensation, lỗi POS, goodwill). Bắt buộc nhập lý do. Audit log có actor + lý do + screenshot/file đính kèm. |
| **AC** | • Form: member, +/− amount, reason (dropdown + free text), attachment<br>• Cap: 1 lần adjust ≤ 10.000 điểm; trên ngưỡng phải 2-level approval<br>• Notify KH khi điểm thay đổi qua adjust |

### UR-PTS-04 — Tiêu điểm tại POS (Must)

| | |
|---|---|
| **Actor** | Cashier (qua POS) |
| **Mô tả** | KH chọn dùng N điểm giảm trực tiếp hoá đơn. Tỷ giá quy đổi cấu hình (VD: 1 điểm = 100đ). POS POST `/loyaltyPointLedger/consume` với `{member_id, points, order_ref}`. Engine kiểm tra balance ≥ points → ghi ledger `redeem` → FIFO consume các earn entry cũ nhất trước. |
| **AC** | • Balance không đủ → 400<br>• Tỷ giá quy đổi áp đúng → giảm giá tương ứng<br>• FIFO consume: ưu tiên earn entry sắp hết hạn nhất<br>• Idempotent theo `(order_ref, member_id)` |

### UR-PTS-05 — Tiêu điểm đổi reward (Must)

Xem [`part-05-rewards-redemption.md`](part-05-rewards-redemption.md). Ledger `redeem` ghi `reference_type=reward, reference_id=reward_redemption_id`.

### UR-PTS-06 — Rollback khi đơn refund/cancel (Must)

| | |
|---|---|
| **Actor** | System (trigger từ POS webhook order.refunded/cancelled) |
| **Mô tả** | Khi đơn cancel/refund toàn phần: ghi ledger `refund` với points = − (số điểm đã earn). Refund một phần: trừ tương ứng tỷ lệ amount refunded. |
| **AC** | • Idempotent theo `(reference_type=order, reference_id=order_ref, entry_type=refund)`<br>• Nếu balance hiện tại < số điểm cần rollback (KH đã tiêu): vẫn ghi negative, balance đi âm. Audit alert. Block đơn KH này cho tới khi resolve<br>• Notify KH khi điểm bị trừ do refund |

### UR-PTS-07 — Hạn sử dụng điểm — 3 chế độ (Must)

| | |
|---|---|
| **Actor** | Tenant Admin |
| **Mô tả** | Cấu hình `expiry_mode`: (1) `never` — không hết hạn; (2) `after_months` — hết hạn sau N tháng kể từ ngày tích; (3) `end_of_year` — hết 31/12 hàng năm. Khi chuyển mode, recalc `expires_at` cho ledger entries hiện có. Cron nightly: tìm earn entries có `expires_at < NOW()` chưa consumed → ghi ledger `expire`. |
| **AC** | • Preview trước khi đổi mode: số KH ảnh hưởng + tổng điểm sắp hết hạn<br>• Confirm dialog đỏ "Hành động không thể undo trong 24h"<br>• Notification KH trước 30/14/7/1 ngày khi điểm sắp hết hạn<br>• Cron expire 3M KH < 30 phút<br>• Audit log mỗi entry expired |
| **Lưu ý kế toán** | Điểm hết hạn = breakage = giảm liability. Báo cáo monthly cho Finance: tổng points expired, tổng VND quy đổi |
| **Phân tích sâu** | Xem [`../06-analysis/point-expiry-strategy.md`](../06-analysis/point-expiry-strategy.md) — so sánh 3 chế độ, tác động P&L, behavioral economics |

### UR-PTS-08 — FIFO consume (Must)

| | |
|---|---|
| **Mô tả** | Khi KH tiêu điểm, engine consume theo FIFO: lấy earn entries cũ nhất (sắp hết hạn nhất) trước. Mỗi ledger `redeem`/`expire` có thể tham chiếu nhiều earn entry — split entry. |
| **AC** | • Test case: KH có 3 earn entries (100, 200, 300 điểm, expire 1/6, 1/7, 1/8). Tiêu 250 điểm → consume hết entry 1 (100) + 150/200 entry 2. Remaining: 50/200 entry 2 + 300 entry 3<br>• Performance: consume < 50 ms với KH có < 100 earn entries chưa consumed |

### UR-PTS-09 — Tỷ giá quy đổi điểm → VND (Must)

| | |
|---|---|
| **Actor** | Tenant Admin |
| **Mô tả** | Cấu hình `redemption_rate`: 1 điểm = X VND khi tiêu trực tiếp tại POS. Áp dụng toàn chuỗi hoặc theo scope. Có thể đổi rate theo thời gian (đổi rate không ảnh hưởng giao dịch đã ghi). |
| **AC** | • Default: 1 điểm = 100đ<br>• Range hợp lệ: 1–10.000đ/điểm<br>• Audit log thay đổi rate<br>• Hiển thị rate trên app/POS để KH biết |
| **Sensitivity** | Xem [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md) — tác động đến cost-per-point và redemption rate |

### UR-PTS-10 — Cross-brand transfer (Should)

| | |
|---|---|
| **Mô tả** | Khi scope = per_brand và `cross_brand_enabled = true`: KH có thể transfer điểm từ brand A sang brand B với tỷ giá cấu hình (VD: 1 điểm A = 0.8 điểm B). Ghi 2 ledger entries: `transfer_out` ở brand A + `transfer_in` ở brand B (cùng linked_id). |
| **AC** | • Tỷ giá > 0, cấu hình 2 chiều A→B và B→A<br>• Min transfer 100 điểm, max 10.000 điểm/ngày/KH (chống fraud)<br>• Atomic: cả 2 entries ghi cùng transaction, không split |
| **Phân tích sâu** | [`../06-analysis/cross-brand-strategy.md`](../06-analysis/cross-brand-strategy.md) |

### UR-PTS-11 — Balance không âm (Must)

| | |
|---|---|
| **Mô tả** | Validate `current_points_balance ≥ 0` ở mọi giao dịch tiêu, expire, transfer_out. Exception duy nhất: refund/cancel có thể đẩy balance âm — alert ngay. |

### UR-PTS-12 — Đối soát ledger định kỳ (Must)

| | |
|---|---|
| **Actor** | System (cron daily) |
| **Mô tả** | Cron 02:00 hàng đêm: với mỗi member có hoạt động trong 24h, recalc `current_points_balance = SUM(ledger.points)` và so với cached value. Sai khác → log alert, fix balance, audit. |
| **AC** | • 0 sai khác trong 7 ngày liên tục là KPI<br>• Báo cáo monthly: số discrepancy phát hiện và fix |

### UR-PTS-13 — Đẩy event vào BPM Engine cho rule nâng cao (Must)

| | |
|---|---|
| **Actor** | System (`market-service`) |
| **Mô tả** | Sau khi simple earn xong (UR-PTS-02), `market-service` publish `LedgerEntryCreatedEvent` vào RabbitMQ. BPM Engine (`/bpmapi`) subscribe các event này; nếu KH đang trong process instance (vd: Loyalty Quest tháng 5), workflow tự nhận event, evaluate condition, advance state. |
| **AC** | • Event payload chuẩn: `{member_id, ledger_id, points, order_ref, store_id, brand_id, items, occurred_at}`<br>• Delivery at-least-once với DLQ<br>• BPM consume idempotent — duplicate event không double-progress<br>• Simple earn không bị block bởi BPM (async hand-off) |

### UR-PTS-14 — BPM trigger award điểm qua callback API (Must)

| | |
|---|---|
| **Actor** | BPM Engine → `market-service` |
| **Mô tả** | Khi workflow quyết định award điểm (vd: hoàn thành challenge), BPM gọi `POST /internal/v1/loyalty/award` với payload `{member_id, points, reason_code, reference_type=bpm_process, reference_id=process_instance_id, idempotency_key}`. Market-service ghi ledger entry `entry_type=adjust_in` với metadata trace ngược BPM process. |
| **AC** | • API internal có scope hạn chế (chỉ BPM call được)<br>• Idempotency mandatory — BPM retry không double-award<br>• Audit log link với process_instance_id để trace<br>• Latency < 200 ms |

### UR-PTS-15 — Cấu hình workflow BPM cho campaign nâng cao (Must)

| | |
|---|---|
| **Actor** | BA + Marketing Mgr, Tenant Admin (approve) |
| **Mô tả** | Marketing dùng **BPM Studio** (UI design tool của Reborn BPM Engine) để vẽ BPMN diagram cho quy trình tích điểm phức tạp: định nghĩa start event, gateway, task (call market-service award), timer (chờ cuối tháng), end event. Save → deploy version mới. Workflow versioned: process instances đang chạy với version cũ tiếp tục đến khi end; instances mới dùng version mới. |
| **AC** | • BPMN 2.0 standard, có thể import/export XML<br>• Sandbox test workflow trước deploy production<br>• Version control: history rollback<br>• Tenant Admin approve trước deploy production<br>• Audit log mọi deploy |

### UR-PTS-16 — Monitor & troubleshoot BPM process instances (Must)

| | |
|---|---|
| **Actor** | Marketing Mgr, Tenant Admin |
| **Mô tả** | Dashboard BPM cho phép: list active process instances filter theo workflow + member, drill-down xem state hiện tại + history các bước đã qua, manually advance/terminate instance khi stuck, retry failed external call. |
| **AC** | • Realtime list instances chạy/đã end/failed<br>• Each instance: timeline diagram highlight current step<br>• Terminate cần lý do + audit<br>• Bulk terminate cho workflow bị deprecated |

## 5. Quy tắc nghiệp vụ

- **Không tích điểm cho đơn thanh toán bằng điểm** (tránh vòng lặp dùng điểm → tích điểm → dùng điểm)
- **Min spend áp dụng SAU khi trừ giảm giá khuyến mãi**, không tính theo giá trị gross
- **Earn rule priority unique trong scope** — engine không stack nhiều rule trừ khi rule có flag `stackable = true`
- **Modifier không stack** trừ khi flag `stack_multiplier = true`
- **Birthday bonus** chỉ áp 1 lần/năm, dù KH mua nhiều đơn trong tuần
- **Chỉ điểm `earn` có `expires_at`** — các loại khác không hết hạn
- **Ledger immutable** — không update, không delete. Sửa lỗi = ghi entry ngược chiều với `entry_type = adjust_out` + reason
- **Simple earn ≠ BPM earn** — auto-earn flow KHÔNG đợi BPM completion. BPM chạy async, award qua callback. Failure của BPM không rollback simple earn (UR-PTS-13).
- **BPM-awarded entries** có `reason_code` prefix `bpm_*` và `reference_id = process_instance_id` để audit/trace ngược về workflow.
- **Workflow versioning**: instances đang chạy KHÔNG migrate sang version mới — luôn chạy hết version đã start. Tránh inconsistency state.
- **Không có nested BPM**: BPM workflow không trigger workflow khác để tránh deadlock + cycle. Nếu cần — modeling lại thành 1 workflow lớn.

## 6. Tham chiếu

- **Backend spec & schema:** [`../05-backend-tasks/market/`](../05-backend-tasks/market/)
- **OpenAPI endpoints:** `/loyaltyPointLedger/*` trong [`../04-api/loyalty-openapi.yaml`](../04-api/loyalty-openapi.yaml)
- **Loyalty economics:** [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md)
- **POS integration flow:** [`part-08-pos-integration.md`](part-08-pos-integration.md)
- **BPM case study Loyalty Quest:** [`../06-analysis/advanced-earn-rule-bpm-case-study.md`](../06-analysis/advanced-earn-rule-bpm-case-study.md)
- **SA microservices (BPM binding):** [`../03-architecture/part-04-microservices.md#10-bpm-engine-integration-cho-advanced-earn`](../03-architecture/part-04-microservices.md)
- **ADR-16 BPM Engine cho advanced earn:** [`../03-architecture/part-09-adr.md#adr-16`](../03-architecture/part-09-adr.md)
