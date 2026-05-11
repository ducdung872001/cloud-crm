# Part 09 — ADR (Architecture Decision Records)

Mỗi quyết định kiến trúc được ghi nhận với format ADR (Michael Nygard).

---

## ADR-01 — Tích hợp POS qua REST API thay vì replace POS

**Status:** Accepted (2026-04-15)

**Context:** Khách hàng vận hành 2 brand POS độc lập, 300 store. Replace POS = rủi ro gián đoạn 150K txn/ngày. Migration cost lớn, kéo dài.

**Decision:** Reborn Loyalty **không thay POS** — tích hợp qua REST API (auto-earn webhook + lookup API). POS hiện tại của khách giữ nguyên, chỉ cần phát triển adapter gửi event sau khi thanh toán.

**Consequences:**
- ✅ Không gián đoạn vận hành POS hiện tại
- ✅ Time-to-market nhanh (6 tháng vs 18+ tháng nếu replace)
- ✅ Khách giữ vendor POS cũ → quan hệ
- ⚠️ Phụ thuộc POS hiện tại có khả năng integration (cần xác nhận từ Phòng CNTT&CĐS)
- ⚠️ Adapter mỗi brand POS khác nhau (anti-corruption layer)
- ⚠️ POS offline → loyalty miss event (cần local queue ở POS side)

**Alternatives considered:**
- Replace POS: rejected (risk + cost)
- POS plugin/extension: phụ thuộc vendor POS, không kiểm soát được

---

## ADR-02 — Append-only Points Ledger

**Status:** Accepted

**Context:** Cần audit chính xác mọi biến động điểm, hỗ trợ kế toán liability, không cho phép tampering.

**Decision:** `points_ledger` là **append-only** — không update/delete entries. Sửa lỗi = ghi entry mới `adjust_in` hoặc `adjust_out` với reason. `current_balance` cached + recompute định kỳ để đối soát.

**Consequences:**
- ✅ Audit trail 100% chính xác
- ✅ Đáp ứng compliance kế toán
- ✅ Cho phép replay/rebuild balance từ ledger
- ⚠️ Storage lớn hơn (≈ 3-5TB sau 3 năm)
- ⚠️ Sửa lỗi phức tạp hơn — cần thiết kế compensation cẩn thận
- ⚠️ Cached balance có thể drift → cron daily reconcile

**Alternatives:** Update-in-place balance (rejected — không audit), event sourcing pure (rejected — phức tạp, không cần thiết với volume này).

---

## ADR-03 — PostgreSQL OLTP + ClickHouse OLAP

**Status:** Accepted

**Context:** OLTP cần ACID + relational; analytics cần aggregate nhanh trên hàng tỷ row.

**Decision:** PostgreSQL 14 cho OLTP (member, ledger, tier, ...). ClickHouse cho OLAP (RFM, CLV, cohort, dashboard analytics). CDC stream PG → Kafka → ClickHouse.

**Consequences:**
- ✅ Strong OLTP guarantee (PG ACID)
- ✅ Analytics scale linearly (CH columnar, parallel)
- ✅ Tách load: heavy analytics không impact write path
- ⚠️ 2 hệ thống cần maintain
- ⚠️ Eventual consistency CH lag (acceptable cho analytics)
- ⚠️ Học thêm CH operationally

**Alternatives:** PostgreSQL all-in (rejected — analytics query 3M KH slow), MongoDB (rejected — không ACID đủ).

---

## ADR-04 — RabbitMQ over Kafka cho năm 1

**Status:** Accepted (revisit năm 2)

**Context:** Cần message broker cho event-driven + DLQ. Kafka mạnh nhưng phức tạp ops. RabbitMQ đơn giản hơn.

**Decision:** Năm 1 dùng RabbitMQ cho: webhook DLQ, notification queue, domain events. Năm 2+ migrate to Kafka nếu cần: high throughput streaming, replay events, multiple consumer groups, longer retention.

**Consequences:**
- ✅ Setup nhanh, dev familiar
- ✅ Mirrored queue cho HA
- ✅ Đủ throughput cho 500 TPS
- ⚠️ Migration tới Kafka khi scale lên — cost
- ⚠️ Không có "replay history" như Kafka

**Alternatives:** Kafka (rejected năm 1 — overhead), Redis Streams (rejected — đã dùng Redis cho cache, mixing roles).

---

## ADR-05 — Multi-tenancy by `tenant_id` column (shared DB)

**Status:** Accepted

**Context:** Reborn hỗ trợ nhiều khách hàng (tenant). Loyalty cho 1 tenant duy nhất (chuỗi siêu thị) nhưng phải tương thích nền tảng multi-tenant.

**Decision:** Shared DB, shared schema, isolated by `tenant_id` column ở mọi table. Mọi query filter mandatory. Tenant config (scope, branding) trong `tenant` table.

**Consequences:**
- ✅ Cost-effective vận hành
- ✅ Easy backup + migration
- ✅ Cross-tenant analytics possible (Reborn internal)
- ⚠️ Risk leak data nếu quên filter — mitigated bằng row-level security policy + test
- ⚠️ Resource contention nếu 1 tenant chiếm tài nguyên (mitigation: rate limit, future sharding)

**Alternatives:** Schema-per-tenant (rejected — backup/migration phức tạp), DB-per-tenant (rejected — cost ops, 1 tenant trên DB lớn = waste).

---

## ADR-06 — Cross-brand: per_brand pool + transfer

**Status:** Accepted (default config)

**Context:** Câu hỏi cốt lõi: điểm 2 brand chung hay riêng?

**Decision:** Default scope = **per_brand** với **cross_brand_transfer** bật, ratio 1:0.8 (cấu hình theo chính sách khách).

**Reasoning:**
- 2 brand có DNA khác → cần rule riêng (multiplier, tier, reward)
- KH cùng là người → cần cross-sell incentive (transfer)
- Ratio < 1 (1:0.8) khuyến khích tiêu tại brand gốc
- Pattern dùng phổ biến: Sephora Beauty Insider, Marriott Bonvoy

**Consequences:**
- ✅ Brand identity giữ
- ✅ Flexibility cao
- ✅ Cross-sell qua transfer
- ⚠️ KH có 2 tier/balance → complexity UI
- ⚠️ Transfer ratio < 1 → KH thiệt nhẹ, cần educate

**Alternatives:** chain_wide (rejected — mất brand identity), per_brand no transfer (rejected — no cross-sell, bad CX).

> Phân tích đầy đủ: [`../06-analysis/cross-brand-strategy.md`](../06-analysis/cross-brand-strategy.md)

---

## ADR-07 — Idempotency mandatory cho mọi POS API

**Status:** Accepted

**Context:** POS gửi webhook qua mạng → retry có thể duplicate. Tích điểm 2 lần cho cùng đơn = sai sót lớn.

**Decision:** Mọi POST write endpoint (autoEarn, consume, refund) **require** `Idempotency-Key` header. Server cache key + response 24h. Duplicate key → return cached. Same business id (order_ref) khác key → 409.

**Consequences:**
- ✅ Safe retry
- ✅ Network glitch không double-count
- ⚠️ Client phải gen UUID per request (educate vendor)
- ⚠️ Redis storage overhead (acceptable: ~10MB/ngày)

**Alternatives:** Optimistic dedup by `(reference_type, reference_id, entry_type)` only (kept as fallback — second layer of defense), no idempotency (rejected — high risk).

---

## ADR-08 — JWT cookie HttpOnly thay vì localStorage

**Status:** Accepted

**Context:** Admin SPA cần session auth.

**Decision:** JWT trong HttpOnly + Secure + SameSite=Lax cookie. Refresh token riêng.

**Reasoning:** Tránh XSS đánh cắp token (localStorage accessible từ JS).

**Consequences:** ✅ Secure · ⚠️ Phải implement CSRF protection (SameSite + custom header).

---

## ADR-09 — Notification throttle 100k/giờ via queue

**Status:** Accepted

**Context:** Campaign 3M KH → 3M SMS = quá tải SMS gateway + cost spike + spam complaint.

**Decision:** Notification queue với throttle 100k message/giờ. Campaign launch → push toàn segment vào queue → worker pool drain với rate limit. Total 3M = 30 giờ — acceptable batch.

**Consequences:** ✅ Predictable cost · ✅ Gateway happy · ⚠️ Campaign reach 3M không phải instant — educate marketing team.

---

## ADR-10 — Stateless services + sticky session via JWT

**Status:** Accepted

**Context:** Horizontal scaling cần stateless services.

**Decision:** Mọi service stateless. Session state trong JWT (admin) hoặc Redis (member). Không in-memory session, không sticky LB.

**Consequences:** ✅ Easy scale, restart any time · ⚠️ JWT size lớn (claim nhiều) — mitigation: ref token với short claim.

---

## ADR-11 — Frontend React 18 + Vite (giữ stack hiện tại)

**Status:** Accepted (kế thừa)

**Context:** Codebase hiện tại đã dùng React + Vite migrated từ Webpack.

**Decision:** Giữ stack React 18 + TypeScript + Vite. Không migrate sang Next.js / Remix.

**Reasoning:** Codebase 167+ page module, migration cost > benefit; React 18 stable + ecosystem mạnh.

---

## ADR-12 — Soft delete with anonymization (PDPA compliance)

**Status:** Accepted

**Context:** NĐ 13/2023 cho phép KH yêu cầu xoá data.

**Decision:** Soft delete + anonymize PII immediately. Hard delete sau 5 năm. Ledger giữ với anonymized member reference cho audit.

**Consequences:** ✅ Compliant · ✅ Audit trail giữ · ⚠️ Aggregate analytics có thể còn KH "đã xoá" → thông báo trong privacy policy.

---

## ADR-13 — Anti-corruption layer per POS brand

**Status:** Accepted

**Context:** 2 brand POS có schema khác (POS_A `customerPhone` vs POS_B `cust_mobile`).

**Decision:** Mỗi brand có ACL adapter riêng — map/validate/standardize trước khi pass vào loyalty domain.

**Consequences:** ✅ Domain model clean · ⚠️ 2 adapter cần maintain.

---

## ADR-14 — Java Spring Boot cho backend (kế thừa platform)

**Status:** Accepted

**Context:** Reborn platform stack standard.

**Decision:** Backend Java 17 + Spring Boot 3. Notification service có thể Go (high concurrency).

**Reasoning:** Team familiar, ecosystem mạnh, ổn định, scale tốt với 3M KH proven by other tenants.

---

## ADR-15 — OpenAPI 3.0 contract-first

**Status:** Accepted

**Context:** Multiple integration partners.

**Decision:** API contract định nghĩa trong OpenAPI 3.0 YAML, generate client SDK + server stubs.

**Consequences:** ✅ Single source of truth · ✅ SDK auto-gen · ✅ Mock server cho FE dev · ⚠️ Phải maintain spec đồng bộ code.

---

## ADR-16 — BPM Engine cho Advanced Earn Rules

**Status:** Accepted (2026-05-11)

**Context:** Engine rule native của `market-service` xử lý rất tốt earn rule đơn giản (amount × rate × multiplier + cap + min_spend) — chiếm 80–90% trường hợp. Tuy nhiên có 10–20% case nâng cao **không phù hợp embed trong rule engine native**:

- **Long-running stateful**: Loyalty Quest 30 ngày tracking 5 challenges, Family Pool aggregation cuối tháng, Journey-based reward
- **Multi-event correlation**: Nhiều giao dịch + nhiều channel cùng đẩy progress 1 process
- **Time-bound batch**: Cuối kỳ tính tổng + award bundle bonus
- **Approval gates**: B2B đơn lớn cần Sales rep approve trước award
- **External callback**: Gọi social verify API, contract system của khách

Nhồi vào `market-service` sẽ:
- Phức tạp hoá business logic → khó test/maintain
- Coupling time-window/state vào OLTP transaction → impact latency simple flow
- Khó cho Marketing tự cấu hình (cần code change mỗi quest)
- Không version được workflow

**Decision:**

Phân lớp 2 đường tích điểm:

1. **Simple earn** → giữ trong `market-service` native rule (stateless, trong-1-transaction, < 100ms)
2. **Advanced earn** → đẩy qua **Reborn BPM Engine** (`/bpmapi`) — đã có sẵn trong platform, BPMN 2.0 standard

**Tích hợp pattern** = **Event-driven + Callback**:

- `market-service` xử lý simple earn xong → publish `LedgerEntryCreatedEvent` qua RabbitMQ
- BPM Engine subscribe events, correlate với running process instances của KH đó (theo `member_id`)
- Workflow advance state, evaluate condition
- Khi quyết định award → BPM callback `POST /internal/v1/loyalty/award` (idempotent)
- `market-service` ghi ledger entry `adjust_in` với `reason_code = bpm_*`, `reference_id = process_instance_id`

**Why Reborn BPM Engine (not Camunda standalone):**

- Đã có sẵn trong Reborn Platform (reuse, không thêm vendor)
- Studio UI Marketing đã quen (BPMN visual)
- Native integration với SSO + audit của platform
- Phù hợp scale ~100K active process instances

**Consequences:**

- ✅ Marketing **tự thiết kế quest/journey** qua BPM Studio không cần dev
- ✅ Workflow versioned, A/B test dễ
- ✅ Audit trace end-to-end qua process_instance_id
- ✅ Failure isolation: BPM down KHÔNG ảnh hưởng simple earn (async hand-off)
- ✅ Latency simple flow vẫn < 500ms (không bị BPM block)
- ⚠️ Phức tạp hoá kiến trúc: thêm 1 service + 1 DB (`bpm_db`)
- ⚠️ Event eventual consistency: BPM hand-off lag 200–500ms — KH thấy điểm bonus sau vài giây, không real-time
- ⚠️ Workflow versioning policy: instances cũ chạy đến hết version cũ, không migrate (tránh inconsistency)
- ⚠️ Cần training BA + Marketing về BPMN design
- ⚠️ Đòi hỏi monitoring BPM riêng (process stuck, retry exhausted)

**Alternatives considered:**

1. **All in market-service** (rejected): tích hợp tất cả vào rule engine native — quá phức tạp, test/version khó, coupling state vào OLTP
2. **Camunda Cloud standalone** (rejected): tốt nhưng phải maintain thêm vendor; Reborn BPM đã đủ cho scale dự án
3. **AWS Step Functions / Temporal** (rejected): cloud lock-in, KH có thể on-prem
4. **Code-based workflow trong market-service** (rejected): không cho phép Marketing tự cấu hình, mỗi quest cần dev → defeats purpose

**Anti-patterns avoided:**

- ❌ BPM gọi BPM (nested workflow) → deadlock risk
- ❌ BPM transactionally couple với ledger write → phá isolation
- ❌ Sync HTTP từ market-service tới BPM trong auto-earn flow → tăng P95 latency, BPM down = simple earn fail
- ❌ Workflow hot-migrate giữa versions → state inconsistency

**Case study:** [`../06-analysis/advanced-earn-rule-bpm-case-study.md`](../06-analysis/advanced-earn-rule-bpm-case-study.md) — Loyalty Quest tháng 5, 5-challenge, 30 ngày, là case bao quát điển hình.

---

## Template ADR mới

```markdown
## ADR-NN — <Tiêu đề>

**Status:** Proposed / Accepted / Deprecated / Superseded by ADR-XX

**Context:** Vấn đề + lực lượng tác động + constraint

**Decision:** Quyết định cụ thể

**Consequences:**
- ✅ Positive
- ⚠️ Trade-off / risk

**Alternatives considered:** Liệt kê + lý do reject
```
