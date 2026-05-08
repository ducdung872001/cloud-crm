---
from: reborn-hub (FE community-hub)
to: cloud-market-master (microservice /market/* — biz.reborn.vn)
created: 2026-05-08T15:00:00+07:00
slug: comments-not-persisted
status: open
fe_branch: community-hub
fe_commit: c00f51fe
priority: P1
blocking: bình luận tạo từ trang public không persist trên BE → admin không thấy được, không quản lý/duyệt được
related: docs/handoff/20260506-1850-events-yc-tester-2026-05-06.md (BE-3)
---

# Comments không persist trên BE — split brain LS vs DB

## Triệu chứng

User test trên 2 trình duyệt cùng tenant `hub.reborn.vn` (bsnId tương ứng W-House):

- **Trình duyệt A — `https://hub.reborn.vn/crm/events/m-khp-v-squat-a9s`** (ShareEventPage public)
  → Tab "Bình luận" hiện 1 comment: `Bùi Đức Năng — "Nội dung sự kiện rất hay"`.
- **Trình duyệt B — `http://localhost:4000/crm/ch_events/21`** (EventDetailPage admin, Hostname header force = `hub.reborn.vn` — trỏ cùng BE biz.reborn.vn)
  → Tab "💬 Bình luận (0)" — KHÔNG thấy comment nào.

Cùng tenant, cùng eventId=21, cùng BE. Đáng lẽ phải thấy giống nhau.

## Nguyên nhân FE đã phân tích

Comment chỉ tồn tại trong `localStorage` của trình duyệt A (key
`reborn.community_hub.event_comments`). FE workaround LS-cache khi user post:

```ts
// src/pages/CommunityHub/Events/components/EventComments.tsx — addAsync
const res = await EventService.createCommentPublic(input.eventId, {...});
if (isApiOk(res)) {
  const created = normalizeComment(res?.result ?? res);
  // Cache LS để reload không mất — listAsync sẽ merge vào.
  const all = readLS<EventComment[]>(KEY_COMMENTS, []);
  if (!all.some((c) => c.id === created.id)) {
    writeLS(KEY_COMMENTS, [...all, created]);
  }
  return created;
}
```

→ Tin tưởng rằng khi `isApiOk(res)` → BE đã `INSERT` xong. Nhưng thực tế khi
gọi `GET .../comments/public/list?eventId=21&includeHidden=true` từ trình
duyệt khác, BE trả `[]`. LS scope theo origin → trình duyệt B không có entry
→ admin thấy 0.

## Endpoint liên quan

```
POST /bizapi/market/events/comments/public/create?eventId={id}
  Body (FE gửi):
    {
      parentId?: string,
      authorName: string,
      authorPhone?: string,
      authorMemberCode?: string,
      authorRole: "guest" | "member" | "admin" | "moderator",
      content: string,
    }
  FE check `isApiOk(res)` = `res.code === 0` || `res.code === 200` ||
                            `res.result` truthy → coi là thành công.

GET  /bizapi/market/events/comments/public/list?eventId={id}&includeHidden={bool}&status={string?}
  Response (FE expect):
    { code: 0, result: { items: EventComment[] } }
  hoặc
    { code: 0, result: EventComment[] }
```

Mapping FE: `src/services/EventService.ts:115-129`.

## Hypothesis / Cần BE verify

### H1. POST create không thực sự `INSERT` row

- BE handler trả response có code=0 hoặc result≠null nhưng exception
  bị swallow hoặc tx không commit.
- Cần check log BE khi user post comment, có dòng `INSERT INTO event_comments`
  thật không.
- Nếu không INSERT → FE đang được "gạt" coi là thành công → cache LS sai.

### H2. POST insert đúng nhưng tenant bsnId lệch

- BE có thể resolve tenant theo header `Hostname`. FE gửi
  `Hostname: hub.reborn.vn` cho cả prod (`hub.reborn.vn`) và localhost (force
  qua `src/configs/fetchConfig.ts`).
- Nếu BE create dùng tenant=A nhưng list query lọc tenant=B → row có nhưng
  không trả về.
- Verify: dump row vừa insert (event_id=21, content LIKE '%sự kiện rất hay%')
  → check `bsn_id` / `tenant_id`.

### H3. List endpoint filter quá chặt

- BE `listCommentsPublic` có thể chỉ return `WHERE status = 'approved' AND is_hidden = false`.
- Comment vừa tạo có status mặc định gì? Nếu `pending` (event bật
  `commentsModerated`) → bị filter ra.
- FE đã gửi `includeHidden=true` cho admin context — BE có honor flag này không?
  Hay đang ignore và luôn filter `is_hidden=false`?
- Tương tự cho status: FE đôi khi gửi `status=undefined` → BE phải hiểu là
  "không filter status" — kiểm tra xem có nhầm thành filter NULL không.

### H4. BE chưa deploy endpoint `comments/public/*`

- Khả năng thấp vì FE đã tích hợp từ commit `ac12a575` (2026-05-06).
- Verify route mounted: `curl -X GET 'https://biz.reborn.vn/market/events/comments/public/list?eventId=21' -H 'Hostname: hub.reborn.vn'`.

## Test plan đề xuất

### B1. Black-box test ngay không cần FE

```bash
# 1. Tạo comment qua API trực tiếp:
curl -X POST 'https://biz.reborn.vn/market/events/comments/public/create?eventId=21' \
  -H 'Content-Type: application/json' \
  -H 'Hostname: hub.reborn.vn' \
  -d '{"authorName":"BE Test","authorRole":"guest","content":"BE handoff probe"}'

# Mong đợi: response { code: 0, result: { id: <new>, ... } }

# 2. List ngay sau đó:
curl -X GET 'https://biz.reborn.vn/market/events/comments/public/list?eventId=21' \
  -H 'Hostname: hub.reborn.vn'

# Mong đợi: trả comment vừa tạo trong items[]
# Nếu items rỗng → confirm bug.

# 3. Query trực tiếp DB (BE side):
SELECT id, event_id, bsn_id, author_name, content, status, is_hidden, created_at
FROM event_comments
WHERE author_name = 'BE Test'
ORDER BY created_at DESC LIMIT 5;
```

3 outcome có thể xảy ra:

- **A. DB không có row** → bug INSERT (H1 / handler không commit).
- **B. DB có row nhưng `bsn_id` khác với expected** → tenant resolve sai (H2).
- **C. DB có row đúng tenant, nhưng list không trả** → filter sai (H3).

### B2. Verify schema tồn tại

```sql
DESCRIBE event_comments;
-- Hoặc
\d event_comments
```

Chú ý các cột cần có: `bsn_id` (tenant), `event_id`, `parent_id`, `author_name`,
`author_phone`, `author_role`, `content`, `status`, `is_hidden`, `created_at`,
`updated_at`, `reviewed_by`, `reviewed_at`, `hidden_reason`.

## Nếu BE confirm cần FE thay đổi gì

- FE hiện tin `isApiOk(res)` để cache LS → có thể đang false positive nếu
  BE trả 200 nhưng error trong body. Nếu BE đề xuất shape error mới (vd
  `{code: 0, error: "..."}`) → FE sẽ swap detection. Nhưng ưu tiên: BE phải
  trả non-zero code khi thất bại để FE biết.

- FE đang merge BE + LS để bảo toàn comment optimistic. Khi BE persist đúng,
  merge dedup theo `id` → không nhân đôi. Khi BE persist OK, có thể bỏ workaround LS
  cache (nhưng giữ LS-fallback offline thì tốt). FE sẽ làm phase sau khi BE confirm.

## Tham khảo

- FE addAsync: `src/pages/CommunityHub/Events/components/EventComments.tsx:112-130`
- FE listAsync: `src/pages/CommunityHub/Events/components/EventComments.tsx:84-110`
- Service: `src/services/EventService.ts:114-129`
- URL config: `src/configs/urls.ts:2536-2541` (events.listCommentsPublic, createCommentPublic)
- Handoff trước có cover events tester bugs: `docs/handoff/20260506-1850-events-yc-tester-2026-05-06.md`
