---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: sales
created: 2026-05-02T14:43:14+00:00
slug: public-student-enrollment
status: replied
gh_issue: https://github.com/ducdung872001/cloud-sales-master/issues/14
reply_issue: https://github.com/ducdung872001/cloud-crm/issues/210
fe_commit: 09643464
severity: HIGH
---

# Handoff: public-student-enrollment → sales

GitHub issue: https://github.com/ducdung872001/cloud-sales-master/issues/14
Body source: /tmp/mh-handoff-sales-public-enrollment.md (full markdown đã embed vào issue qua --body-file)

Mục tiêu: BE sales expose `POST /sales/public/order/register` (no JWT) cho phép học viên submit form từ Portal → tạo customer + order + publish `cloud-bpm-trigger` để workflow `commission-mentor-v1` auto-run. Phase 1 chỉ cần free course flow; paid course/payment provider để Phase 2.

Cross-link:
- `cloud-sales-master#11` (closed) — sales đã wire publisher cloud-bpm-trigger (reuse infrastructure)
- `cloud-crm#209` (closed) — sales đã expose 12 endpoint /sales/service/* cho mentorhub catalog

Reply protocol: BE sales mở issue mới trên `ducdung872001/cloud-crm` với labels CẢ HAI `reply-from-sales` + `to-mentorhub`.

---

## Reply từ sales — 2026-05-02T15:15:11+00:00

- Reply issue: https://github.com/ducdung872001/cloud-crm/issues/210 (CLOSED)
- BE đã ship: commit `5749210` (master) — Phase 1 free-course end-to-end. Endpoints `POST /sales/public/order/register` (HMAC-SHA256 signed, JWT-exempt) + `GET /sales/public/order/status?orderCode=`. Multi-tenant qua `app.portal.tenants` yml (mentorhub seeded bsnId=6, branchId=23). Idempotency `(customerId, courseId)` UNIQUE → return existing. Free course → status=PAID + publish `cloud-bpm-trigger` (reuse #11 publisher).
- Auth chosen: **Option A — HMAC-SHA256**, secret env `APP_PORTAL_SECRET_MENTORHUB`. Compute: `lower(hex(HMAC-SHA256(secret, raw_body)))` → header `X-Portal-Signature`.
- FE đã wire: commit `09643464` (đã push) — `urls.ts` salesPublic block / `SalesPublicClient.ts` mới (HMAC qua crypto.subtle, raw JSON sign, tenantHint thay Hostname header) / `Portal/Register` 5-flow (success/PENDING_PAYMENT/INVALID_SIGNATURE/network/migration localStorage drain).
- Pending phía BE/devops (FE đã ready):
  - Prod /sales/public/order/register hiện 401 → chờ deploy image sales mới
  - Devops set env `APP_PORTAL_SECRET_MENTORHUB` (cùng giá trị FE rebuild với `VITE_PORTAL_SECRET_MENTORHUB`)
  - Smoke prod e2e (free course → register → workflow → commission row) chưa chạy
- Phase 2 chưa làm: paid course payment provider (sales returns paymentUrl=null placeholder); customer phone dedup (recommend handoff customer `internal/upsert_by_phone`); HMAC timestamp/replay protection.
