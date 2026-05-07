---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: billing
created: 2026-05-07T10:01:05+00:00
slug: credit-wallet-rules-reconcile
status: open
gh_issue: https://github.com/ducdung872001/cloud-billing-master/issues/15
---

# Port credit pool wallet + rule engine + reconcile cho mentorhub USP

## Bối cảnh (Why)

FE mentorhub vừa hoàn tất Phase 6 — USP "Zoom credit pool" — trong `backend-stubs/`. Cần port toàn bộ wallet + rule engine + audit/reconcile xuống billing BE.

Ngữ cảnh USP: mỗi mentor + tenant nhận quota Zoom dạng "credit pool" (1 credit ≈ 1 phút Zoom). Master/Academy có discount khi spend, mentor góp account vào pool ngoài (gọi là WIT volunteer) earn lại 50–70% credit. Đây là cơ chế thanh toán nội bộ — KHÔNG VND, chỉ credit. Cần audit chuẩn (invariant: balance == sum(transactions)).

`billing` đã có cashbook + debt + deposit + reconciliation pattern → credit wallet là loại "sub-cashbook" theo tenant với đơn vị riêng. Mentorhub là FE mentorship platform multi-tenant.

(Đầy đủ spec đã gửi trong issue ducdung872001/cloud-billing-master#15 — body đồng bộ. Audit local này chỉ giữ frontmatter + bối cảnh để lookup nhanh.)

## File FE liên quan (chỉ để BE tham chiếu, KHÔNG sửa)

Stub Phase 6 vừa commit (commit `04632e9a`):
- Wallet service + applyTxn atomic + monthly grant + InsufficientCreditError: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/credit-wallet.ts
- Reconcile report logic: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/credit-reconcile.ts
- Routes: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/credit.ts
- Types: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/types.ts (search CreditTransaction, CreditRule, CreditWallet)
- Plan registry quota matrix: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/config/plans.ts

## Cross-link
- billing#13 (subscription lifecycle): plan tier nguồn của default rule
- billing#14 (financial P&L): credit cost không tính vào USD P&L
- integration handoff Zoom pool (sẽ gửi tiếp): pool slot nằm bên integration

## Tiêu chí done
- [ ] DB migrations 3 bảng wallet/transaction/rule
- [ ] 6 endpoint atomic + reconcile
- [ ] Cron monthly grant idempotent
- [ ] 402 spec cho insufficient
- [ ] Default rule per plan tier seed
- [ ] Postman / curl examples
