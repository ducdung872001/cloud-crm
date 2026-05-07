---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: billing
created: 2026-05-07T09:14:57+00:00
slug: financial-pnl-aggregate
status: open
gh_issue: https://github.com/ducdung872001/cloud-billing-master/issues/14
---

# Admin financial P&L endpoint cho mentorhub HQ dashboard

## Bối cảnh (Why)

FE mentorhub Phase 5 hoàn tất, có UI admin/finance dashboard cần endpoint P&L aggregate. Hiện stub có sẵn `services/financial-pnl.ts` compute từ `db.usageLogs` + `db.subscriptions` — cần port logic này xuống billing BE để sử dụng dữ liệu thật từ subscription + invoice + usage log.

Đây là **extension** của handoff `cloud-billing-master#13` (subscription lifecycle) — cùng domain billing. Tách issue mới vì scope rõ ràng (read-only aggregate, không đụng state machine).

Mentorhub là FE mentorship platform — admin platform-level (Reborn HQ) muốn theo dõi MRR / ARR / churn / margin per tier + cost breakdown per AI provider để định giá + tối ưu provider selection.

## Yêu cầu cụ thể (What)

### Endpoint

```
GET /billing/mentorhub/financial/pnl?period=YYYY-MM   [auth: platform admin]
```

`period` optional — default tháng hiện tại UTC.

### Response shape

```ts
interface FinancialPnL {
  period: string;          // 'YYYY-MM'
  generatedAt: string;     // ISO
  totals: {
    activeMentors: number;
    trialMentors: number;
    expiredMentors: number;
    mrrVND: number;        // sum(monthlyPriceVND của active sub)
    arrVND: number;        // mrrVND * 12
    totalCostUSD: number;  // sum(usageLog.costUSD trong period)
    totalCostVND: number;
    grossMarginVND: number;    // mrrVND - totalCostVND
    grossMarginPct: number;
  };
  byProvider: {
    step: string;                 // 'claude' | 'whisper' | 'per_student_breakdown' | 'zalo_push' | 'storage'
    model?: string;               // 'claude-haiku-4-5' | 'whisper-large-v3-turbo' | ...
    callCount: number;
    totalCostUSD: number;
    totalCostVND: number;
  }[];
  byTenant: {
    mentorId: string;
    tier: string;                 // 'trial' | 'free' | 'starter' | 'pro' | 'master' | 'academy'
    monthlyRevenueVND: number;
    monthlyCostUSD: number;
    monthlyCostVND: number;
    marginVND: number;
    marginPct: number;
    status: string;
  }[];
  churn: {
    churnedCount: number;         // sub chuyển expired/canceled trong period
    churnRatePct: number;         // churnedCount / activeAtStart
  };
}
```

### Compute logic

1. **MRR** = sum(plan.monthlyPriceVND) qua tất cả subscription `status='active'` (không pro-rate).
2. **ARR** = MRR * 12.
3. **Cost** = sum(usageLog.costUSD) trong window `[period-start, period-end)`. Group by (step, model) cho `byProvider`.
4. **Per-tenant**: revenue = active sub × monthlyPrice; cost = usageLog filter tenant trong period.
5. **Churn**: count subs có `status IN ('expired','canceled_at_period_end')` AND `currentPeriodEnd ∈ period`. Rate = churned / (active + churned).

Note: stub đang dùng tỷ giá USD→VND fix 25_000. Production billing nên dùng tỷ giá update theo ngày (lưu trong bảng `currency_rate` nếu billing đã có) — fallback 25_000 nếu chưa có.

### Cross-cutting với handoff khác

- **billing#13** (subscription lifecycle): cung cấp MRR + churn data
- **integration#12** (MCP host + AI provider keys): provider key per tenant — billing đọc key tốn nếu cần BYOK cost calculation, hoặc dùng platform-level cost cho v1
- **notification#6** (reminder dispatch): cost ZNS đã tính trong `usage_log` step `zalo_push`

## Ràng buộc & gợi ý

- **Auth**: chỉ platform admin (Reborn HQ) — multi-tenant không filter, view cross tenant
- **Performance**: với >1k mentors, query phải có index `(usage_log.created_at, usage_log.mentor_id)`. Cache result 5 phút (period closed thì cache vĩnh viễn)
- **Data source**: cần join 3 bảng — `mentorhub_subscription`, `mentorhub_invoice`, `mentorhub_usage_log` (sẽ định nghĩa khi handoff phase usage_log riêng — hiện stub có shape ở `db/types.ts` UsageLog interface)
- **Currency**: tất cả số VND integer (không float). USD fields dùng decimal(10,4) đủ cho cost token-level

## File FE liên quan (chỉ để BE tham chiếu, KHÔNG sửa)

Stub Phase 5 vừa commit (commit `16c658d8`):

- P&L compute service (logic chuẩn cần port y hệt): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/financial-pnl.ts
- Admin route mount điểm: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/admin.ts (search `/financial/pnl`)
- UsageLog schema: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/types.ts (search `UsageLog`)
- Plan registry (giá VND cho mỗi tier): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/config/plans.ts
- Legacy → tier mapper: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/middleware/quota.ts (search `mapLegacyPlanToTier`)

## Tiêu chí done

- [ ] Endpoint GET `/billing/mentorhub/financial/pnl` chạy được với `period` optional, default tháng hiện tại
- [ ] Response đúng shape `FinancialPnL` ở trên (totals + byProvider + byTenant + churn)
- [ ] Compute logic match stub: MRR sum active, cost group by step+model, churn count expired/canceled trong period
- [ ] Cache 5 phút cho period mở, vĩnh viễn cho period đóng
- [ ] Index `(usage_log.created_at)` + `(usage_log.mentor_id)` cho performance
- [ ] Postman / curl examples cho FE smoke-test cutover

---
**Reply protocol** (đặc thù mentorhub — đọc kỹ):

Khi xong, BE mở issue mới trên `ducdung872001/cloud-crm` với:
- **Title**: `[reply] financial-pnl-aggregate — <status>`
- **Labels (PHẢI có cả 2)**:
  - `reply-from-billing`
  - `to-mentorhub` ← BẮT BUỘC, vì cloud-crm là repo dùng chung cho nhiều FE branch
- **Body**: link tới issue gốc này (`ducdung872001/cloud-billing-master#14`), tóm tắt thay đổi + commit SHA + breaking change (nếu có)

KHÔNG comment trực tiếp vào issue gốc — FE mentorhub chỉ poll issue OPEN có CẢ HAI label `reply-from-*` AND `to-mentorhub` trên `ducdung872001/cloud-crm`.

Lazy-create label nếu chưa có:
```bash
gh label create to-mentorhub --repo ducdung872001/cloud-crm --color FBCA04 --description "Reply gửi cho FE mentorhub" 2>/dev/null || true
gh label create reply-from-billing --repo ducdung872001/cloud-crm --color 1D76DB --description "Reply từ BE billing" 2>/dev/null || true
```
