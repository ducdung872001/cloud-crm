> Handoff từ FE mentorhub — branch `reborn-mentorhub`.
> Source: `.handoff/sent/20260511-2230-sales-mentorhub-session-entity-crud.md`


# Cần entity `session` + CRUD endpoints cho MentorHub Calendar

## Bối cảnh (Why)

Trang `MentorHub/Calendar/index.tsx` (route `/crm/mh/calendar`) hiển thị lưới tháng các buổi học của mentor + sidebar "Sắp diễn ra". Hiện tại 100% mock data — refresh page là mất hết.

Owner-entity rule (per `cloud-sales-master#23`): course là **service** thuộc sales, nên **session = instance lịch của 1 service** cũng do `sales` sở hữu. Không reroute sang inventory/integration.

Đã loại trừ các phương án workaround:

| Phương án | Lý do loại |
|---|---|
| Lưu `sessions[]` trong `metadata` của `service` | Query "sessions trong tháng X cross-courses" phải fetch toàn bộ courses của mentor rồi filter FE → không scale, không index được theo date |
| Dùng Zoom Meeting list làm nguồn truth | Mất thông tin domain (capacity, registered, courseId, AI session-review link). Course không có Zoom (offline / chưa link) thì biến mất khỏi calendar |
| Suy ra session từ `order` records | Order là enrollment của học viên, không phải lịch buổi. 1 buổi có nhiều orders |

## Việc cần BE sales làm

### 1. Schema mới: `prod_clouddb_sales.service_session`

| Cột | Type | Note |
|---|---|---|
| `id` | BIGINT PK auto | |
| `bsn_id` | BIGINT | tenant — index |
| `service_id` | BIGINT FK → `service.id` | course owner. Index composite `(bsn_id, service_id)` |
| `supplier_id` | BIGINT | mentor (employee). Index `(bsn_id, supplier_id, start_at)` cho calendar query |
| `start_at` | DATETIME | UTC, FE format ISO-8601 |
| `duration_min` | INT | 15–480 |
| `zoom_meeting_id` | VARCHAR(64) NULL | nullable nếu offline / chưa tạo zoom |
| `zoom_join_url` | VARCHAR(512) NULL | cache lại để FE render trực tiếp |
| `capacity` | INT | snapshot từ service.capacity tại thời điểm tạo (có thể override) |
| `registered_count` | INT default 0 | đếm từ `order` table — BE compute hoặc trigger |
| `status` | VARCHAR(16) | `SCHEDULED` / `LIVE` / `DONE` / `CANCELLED` |
| `agenda_item_id` | VARCHAR(64) NULL | link tới `service.metadata.agenda[].id` nếu muốn bind với giáo trình |
| `notes` | TEXT NULL | mentor note |
| `created_at`, `updated_at`, `deleted_at` | DATETIME | soft delete |

### 2. REST endpoints

Prefix: `/sales/service-session/*` (đồng nhất với `/sales/service/*`, `/sales/service-category/*`).

```
GET    /sales/service-session/list
       ?supplierId={mentorId}&from=2026-05-01&to=2026-05-31&serviceId={optional}
       → { result: { items: ServiceSession[], total } }

GET    /sales/service-session/get?id={id}
       → { result: ServiceSession }

POST   /sales/service-session/create
       body: { serviceId, startAt, durationMin, zoomMeetingId?, zoomJoinUrl?, capacity?, agendaItemId?, notes? }
       BE infer supplierId từ service.supplierId
       → { result: ServiceSession }

POST   /sales/service-session/update
       body: { id, ...partialFields }
       → { result: ServiceSession }

DELETE /sales/service-session/delete?id={id}
       soft-delete; nếu status=DONE thì 400
       → { result: { id, deletedAt } }

GET    /sales/service-session/upcoming
       ?supplierId={mentorId}&limit=6
       Convenience cho sidebar "Sắp diễn ra"
       → { result: { items: ServiceSession[] } }
```

Tất cả endpoint require JWT mentorhub. List query phải support range filter theo `start_at` để FE chỉ load đúng tháng đang xem.

### 3. Validation rules

- `startAt` ≥ now (chỉ khi create; update cho phép edit session quá khứ với role admin)
- `durationMin` ∈ [15, 480]
- `serviceId` phải thuộc `bsn_id` của caller, type `COURSE_LIVE`, không archived
- `capacity` mặc định = `service.capacity` nếu không truyền
- Conflict check: cùng `supplierId` + overlap time-range → trả `code: -2, message: "Trùng giờ với buổi {id}"` (FE sẽ confirm trước khi force)

### 4. Permission

| Key | Action |
|---|---|
| `SALES_SERVICE_SESSION_READ` | list, get, upcoming |
| `SALES_SERVICE_SESSION_WRITE` | create, update |
| `SALES_SERVICE_SESSION_DELETE` | delete |

Mentor role mặc định có cả 3.

### 5. `registered_count` accuracy

2 lựa chọn — sales tự chọn:
- **Option A** (đơn giản, em prefer): trigger trên `order` table — khi order chuyển status `PAID` và có metadata `sessionId` thì increment `service_session.registered_count`.
- **Option B**: compute on-read — `SELECT COUNT(*) FROM order WHERE metadata->>'sessionId' = ?`. Chậm hơn nhưng không cần trigger.

Nếu chọn B, FE chấp nhận latency, không cần webhook.

## Phân chia rõ scope theo Microservice

**Trong handoff này (sales):**
- [ ] Migration `V?__create_service_session.sql`
- [ ] 6 endpoints REST + DTO + permission keys
- [ ] Validation rules + conflict detection
- [ ] `registered_count` strategy (A hoặc B)

**KHÔNG thuộc handoff này:**

| Việc | Service | Ghi chú |
|---|---|---|
| Tạo Zoom meeting auto khi create session | integration | FE sẽ call `/integration/zoom/meeting/create` riêng rồi truyền `zoomMeetingId` vào POST session — không bundle |
| Reminder Zalo/Email 24h + 30p trước session | notification | Đã có handoff cũ `20260507-0843-notification-pre-class-reminder-events` — chỉ cần BE sales emit event `service_session.created` lên message bus |
| AI session-review note generation | ai | Đã có pipeline riêng, FE link trực tiếp `/crm/mh/session-review?sessionId=X` |
| Public marketplace render lịch buổi học | sales (public endpoints) | Phase 2, chưa cần ngay |

## FE plan (đã đồng bộ với BE spec)

Sau khi BE ship 6 endpoints, FE refactor theo thứ tự:

1. Tạo `src/services/mentorhub/sessionApi.ts` — wrapper `apiHelper.ts` cho 6 endpoint
2. Type `ServiceSession` extract ra `src/types/mentorhub/session.ts` (hiện inline trong `Calendar/index.tsx:6`)
3. `Calendar/index.tsx` thay `genInitialSessions` bằng `useEffect(() => sessionApi.list({ from, to, supplierId }))` khi `month` thay đổi
4. `addSession` → `await sessionApi.create(...)` + optimistic update
5. `deleteSession` → `await sessionApi.delete(id)` + revert on error
6. Sidebar "Sắp diễn ra" → `sessionApi.upcoming({ limit: 6 })` thay vì filter local

ETA FE: 4-6h sau khi BE deploy lên dev.

## File FE liên quan (chỉ tham chiếu)

- Calendar page: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/MentorHub/Calendar/index.tsx
- API helper: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/services/apiHelper.ts
- URL config (sẽ thêm `salesServiceSession`): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/configs/urls.ts
- Sibling reference (cùng pattern): `salesService` block ở `urls.ts:884`, `SalesServiceClient` ở `src/services/SalesServiceClient.ts`

## Cross-link

- Owner-entity rule: `cloud-sales-master#23`, `cloud-crm#226`
- Course catalog wire-up đã ship: handoff `20260502-1138-sales-course-catalog-mentorhub-rerouted` + commit `f24f6f41`
- Seed data: handoff `20260508-2006-sales-mentorhub-seed-sample-courses` (`cloud-sales-master#24`)
- Reminder events tiếp theo: `20260507-0843-notification-pre-class-reminder-events`
