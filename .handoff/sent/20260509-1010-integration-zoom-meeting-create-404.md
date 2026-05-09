---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: integration
created: 2026-05-09T10:10:00+07:00
slug: zoom-meeting-create-404
status: posted
gh_issue: https://github.com/ducdung872001/cloud-crm/issues/212#issuecomment-4411252247
note: Token không access được cloud-integration-master → comment fallback trên cloud-crm#212 (BE reply gốc), BE integration sẽ thấy.
severity: HIGH
---

# Bug: `/integration/zoom/meeting/create` trả 404 + HTML khi user bấm "Tạo tự động"

## Triệu chứng

User bấm nút **"✨ Tạo tự động"** ở `CourseEdit` Step 5 (`/crm/mh/courses/:id/edit`) để tạo Zoom meeting. FE call `POST /bizapi/integration/zoom/meeting/create` → BE trả **HTTP 404** với body là HTML (nginx default error page) thay vì JSON envelope.

FE crash JSON.parse → console error: `Unexpected token '<', "<html><bod"... is not valid JSON`. User thấy stack trace gibberish.

## Bằng chứng

- DevTools Network → request `create` → status `404`, type `fetch`, initiator `apiHelper.ts:24`.
- Response body: HTML page (không phải JSON envelope).

## Endpoints FE đang gọi (per `urlsApi.integrationZoom`)

```
POST  /bizapi/integration/zoom/meeting/create
GET   /bizapi/integration/zoom/meeting/get
POST  /bizapi/integration/zoom/meeting/cancel
GET   /bizapi/integration/zoom/account/get
POST  /bizapi/integration/zoom/account/disconnect
GET   /bizapi/integration/zoom/oauth/authorize
```

(Per spec đã chốt ở cloud-crm#212 / cloud-integration-master#10 reply.)

## Status BE đã claim

Reply cloud-crm#212 (closed 2026-05-XX): "Code shipped — Awaiting Zoom Marketplace App + container restart". Commits ship `b4a3712..c06175b` trên master cloud-integration. DDL apply prod, listen port `:9920`.

→ Khả năng cao container chưa restart hoặc nginx route chưa cập nhật để forward `/bizapi/integration/zoom/*` → `:9920`.

## Việc cần BE integration làm

1. **Xác nhận container `cloud-integration` đã restart sau commit `c06175b`** — nếu chưa, restart.
2. **Verify nginx route**: request `https://biz.reborn.vn/integration/zoom/meeting/create` có forward đúng tới service container không. Test:
   ```bash
   curl -sI -X POST "https://biz.reborn.vn/integration/zoom/meeting/create" \
     -H "Authorization: Bearer <jwt-mentorhub>" \
     -H "Content-Type: application/json" \
     -H "hostname: kcn.reborn.vn" \
     --data '{}'
   ```
   Expected: HTTP 200/400/403 với JSON body. Reality: 404 HTML.
3. **Nếu Zoom Marketplace App chưa config** → cần ETA hoặc workaround (vd. trả JSON `{code: -1, message: "Zoom App chưa setup"}` để FE hiện message rõ thay vì 404).

## FE follow-up đã làm

- CourseEdit catch JSON parse error → đổi message "Zoom service BE chưa deploy hoặc 404 — xem cloud-crm#212" thay vì lộ stack trace.
- Vẫn cần BE fix endpoint mới có thể tạo Zoom meeting tự động.

## Phân chia rõ scope theo Microservice

**Trong handoff này (integration-master):**
- [ ] Restart container hoặc verify nginx route cho `/bizapi/integration/zoom/*`.
- [ ] Confirm Zoom Marketplace App status — nếu chưa setup, trả JSON envelope với code != 0 thay vì để nginx 404.
- [ ] Smoke test 6 endpoint Zoom với token mentorhub.

**KHÔNG thuộc handoff này:**

| Việc | Service | Ghi chú |
|------|---------|---------|
| Setup Zoom Marketplace App OAuth credentials | DevOps/Admin | Manual configuration step, không phải code |
| FE error UX cho trường hợp Zoom not linked | FE only | Đã có nhánh check `403\|forbidden\|disabled\|not.*linked` trong CourseEdit |
| Zoom pool USP (mentor account contributors) | integration (handoff cloud-integration#13 đã raise riêng) | Phase 6 USP, tách scope |

## File FE liên quan (chỉ tham chiếu)

- Button + handler: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/MentorHub/CourseEdit/index.tsx (search `autoCreateZoom`)
- Service client: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/services/ZoomClient.ts
- URL config: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/configs/urls.ts (search `integrationZoom`)

## Cross-link

- `cloud-integration-master#10` — origin handoff zoom-oauth-meeting-recording (đã reply)
- `cloud-integration-master#13` — Zoom pool USP (related)
- `cloud-crm#212` — reply gốc claim "code shipped"
