---
from: reborn-hub (FE community-hub)
to: cloud-market-master (microservice /market/* — biz.reborn.vn)
created: 2026-05-11T11:30:00+07:00
slug: events-recap-field
status: open
fe_branch: community-hub
fe_commit: 808be2c4
priority: P2
blocking: không (FE tạm ổn — recap rỗng cho mọi event cho đến khi BE deploy)
---

# Thêm field `recap` (JSON) cho events — chứa nội dung "sau sự kiện"

## Mục tiêu

Khi sự kiện kết thúc, admin muốn cộng đồng vẫn xem được kết quả (ảnh, video,
danh sách đoạt giải, bài viết recap). FE đã build UI:

- **Admin form** (`EventFormPage` → Section "8. 📌 Recap sau sự kiện"): up ảnh, video URL, winners, bài viết kéo-thả block, slug sự kiện tiếp theo + nút "Công bố recap".
- **Public detail** (`ShareEventPage`): khi `now > endDate` AND `recap.publishedAt` → render `<EventRecapBlock>` ở đầu trang thay cho form đăng ký.

FE gửi/nhận `recap` y hệt pattern hiện có cho `contentBlocks` / `dynamicFields`
(JSON-string trong cột TEXT). **Không có endpoint mới.** Reuse `POST /market/events/update?id=`.

## Schema cần thêm

```ts
interface EventRecap {
  summary?: string;             // tóm tắt 1-2 câu sau sự kiện
  attendeeCount?: number;       // số người thực tế (có thể khác activeRegistrations)
  highlightImages?: string[];   // CDN URLs
  videoUrls?: string[];         // YouTube/Vimeo/Facebook video URLs
  winners?: Array<{
    id: string;
    rank?: string;              // "Giải nhất" / "HCV" / "Top 1"
    name: string;
    achievement?: string;
    imageUrl?: string;
  }>;
  blocks?: ContentBlock[];      // shape giống event.contentBlocks
  nextEventSlug?: string;       // FE render CTA → /events/{slug}
  publishedAt?: string;         // ISO — khi admin bấm "Công bố"; thiếu = draft
}
```

Đầy đủ type ở `src/pages/CommunityHub/Events/types.ts` (interface `EventRecap`,
`EventRecapWinner`).

## Việc BE cần làm

### 1. Migration

```sql
ALTER TABLE market_events ADD COLUMN recap TEXT NULL;
```

(tên bảng theo convention hiện tại — vui lòng align với bảng đang chứa `content_blocks` / `dynamic_fields`.)

### 2. Whitelist field trong update DTO

Trong DTO/Resource của `POST /market/events/update`, cho phép field `recap`:

- Validation: nullable, max ~1MB (gallery URLs + base64 ảnh ko khuyến nghị — FE upload trước qua `uploadDocumentFormData`, chỉ lưu URL).
- Serialize: `JSON.stringify(recap)` lưu vào column, **không strip key** — admin có thể chỉ set 1 field (ví dụ chỉ `publishedAt` để toggle publish/unpublish mà không đổi nội dung).

### 3. Trả về trong response get/list

- `GET /market/events/get?id=` → trả `recap` (raw JSON string hoặc parsed — FE đã có `parseJson` defensive).
- `GET /market/events/list` (admin) → trả `recap`.
- `GET /market/events/public/get?slug=` (public, ShareEventPage) → trả `recap`. **Đây là path quan trọng** vì block recap hiển thị cho khách hàng không login.
- `GET /market/events/public/list` (public, PublicEvents) → **không bắt buộc** trả full recap (tiết kiệm bandwidth). Có thể chỉ trả `recap_published` boolean hoặc `recap.publishedAt` nếu BE muốn FE list page hiện badge "Đã có recap". Hiện FE list page chưa cần.

### 4. (Optional) Auto-update `status = "ended"`

Hiện FE phải tự tính `isEnded = now > endDate`. Nếu BE có cron đẩy `status` sang
`"ended"` khi vượt `endDate` thì FE chỉ cần kiểm `event.status` đơn giản hơn. Không bắt buộc — FE đã có fallback.

## Test cases mong đợi

Sau khi BE deploy:

1. Update event với body `{ recap: { summary: "test", publishedAt: "2026-05-11T..." } }` → GET trả lại đúng.
2. Update tiếp với `{ recap: null }` → field bị xoá / set null. GET trả `recap: null` hoặc bỏ field.
3. Update với body **không có** key `recap` → field giữ nguyên (partial update).
4. Public endpoint `/public/get?slug=` trả `recap` cho event đã ended.
5. Field tags/dynamicFields/contentBlocks không bị ảnh hưởng (regression).

## FE liên quan

- `src/pages/CommunityHub/Events/types.ts` — `EventRecap`, `EventRecapWinner`, thêm `recap?` vào `EventEntity`.
- `src/pages/CommunityHub/Events/storage.ts` — parse `recap` JSON-string trong `normalizeEvent`.
- `src/pages/CommunityHub/Events/components/RecapEditor.tsx` — UI nhập liệu admin.
- `src/pages/CommunityHub/Events/components/EventRecapBlock.tsx` — render public.
- `src/pages/CommunityHub/Events/EventFormPage.tsx` — gửi `recap` trong payload create/update.
- `src/pages/ShareEventPage/index.tsx` — đọc `event.recap.publishedAt` để switch UI.

## Estimate

BE ~15-30 phút: 1 migration + 1 dòng whitelist + verify response.

## FE workaround đang chạy

Cho đến khi BE deploy, FE giữ recap trong localStorage shadow (key
`reborn.events.recap_shadow`) — xem `storage.ts`:

- `updateEventAsync` ghi `patch.recap` vào shadow **trước khi** gọi BE.
- `getEventAsync` / `getEventBySlugAsync` hydrate `recap` từ shadow nếu BE response không có field.

Hệ quả:

- Admin lưu được + reload vẫn thấy recap **trên trình duyệt đang dùng**.
- Đồng nghiệp / khách hàng máy khác **KHÔNG thấy** vì shadow là per-browser.
- Khi BE deploy + trả `recap` đúng → hydrate tự skip (check `!normalized.recap`), shadow trở thành no-op.

Nói cách khác: FE đã ready và sẽ hoạt động đúng ngay khi BE merge — không cần FE deploy lại.
