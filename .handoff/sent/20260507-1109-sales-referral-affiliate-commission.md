---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: sales
created: 2026-05-07T11:09:54+00:00
slug: referral-affiliate-commission
status: open
gh_issue: https://github.com/ducdung872001/cloud-sales-master/issues/22
---

# Port referral / affiliate engine + commission rule cho mentorhub

Đầy đủ spec trong issue ducdung872001/cloud-sales-master#22.

## Tóm tắt
- Referral link CRUD (code unique, auto-gen, campaign tag)
- Attribution state machine: click → signed_up → converted → paid_out
- Commission rule per tenant + platform fallback (ratesByPlan, recurring, maxRecurringMonths, minPayoutVND)
- DB: 3 bảng (link, attribution, rule) với index status+paidOut cho queue

## File FE liên quan
- https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/referral.ts
- https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/referral.ts
- https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/types.ts (ReferralLink, ReferralAttribution, CommissionRule)

## Cross-link
- billing#13/14/15: convert event nguồn từ billing webhook
- customer#6: signup event nguồn từ customer service
