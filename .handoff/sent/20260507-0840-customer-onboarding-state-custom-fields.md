---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: customer
created: 2026-05-07T08:40:01+00:00
slug: onboarding-state-custom-fields
status: open
gh_issue: https://github.com/ducdung872001/cloud-customer-master/issues/6
---

# Port mentor onboarding state machine + custom fields per tenant từ FE stub xuống customer BE

## Bối cảnh (Why)

FE mentorhub vừa hoàn tất Phase 4 trong `backend-stubs/`. 2 mảng thuộc CRM master scope của `customer` cần port xuống production:

1. **Mentor onboarding state**: 5-step linear wizard (zoom → zalo → first-course → first-student → first-session). Hiện stub dùng in-memory map. Mentor-as-employee profile thuộc CRM core → `customer` là chỗ chứa state này.
2. **Custom fields per tenant**: cho mentor thêm field tuỳ ý vào hồ sơ học viên (`student`) hoặc khoá học (`course`). Đây là extension của customer master profile — convention BE customer hiện đã có khái niệm dynamic field cho `customer` entity, mentorhub muốn re-use cùng cơ chế.

Mentorhub là FE mentorship platform multi-tenant: mỗi mentor là 1 tenant. Cần customer BE expose 2 module trên qua endpoint cho FE consume thay vì tự maintain in-memory.

## Yêu cầu cụ thể (What)

### A) Mentor onboarding state

```
GET   /customer/mentorhub/onboarding/:mentorId
PATCH /customer/mentorhub/onboarding/:mentorId/:step
```

State shape:
```ts
type StepKey =
  | 'zoom_connected'
  | 'zalo_connected'
  | 'first_course_created'
  | 'first_student_invited'
  | 'first_session_scheduled';

interface OnboardingState {
  mentorId: string;
  tenantId: string;
  steps: Record<StepKey, boolean>;
  completedAt?: string;   // set khi tất cả 5 step done
  updatedAt: string;
}

interface OnboardingProgress {
  mentorId: string;
  steps: { key: StepKey; order: number; done: boolean; label: string }[];
  completedSteps: number;
  totalSteps: number;
  nextStep: StepKey | null;
  completedAt?: string;
  progressPct: number;     // 0..100
}
```

PATCH body: `{ done: boolean }`. Response: `OnboardingProgress`.

Auto-advance từ event domain khác (sẽ qua webhook/event, không cần FE PATCH thủ công):
- Zoom OAuth callback → `zoom_connected = true` (qua integration service event)
- Zalo OA bind → `zalo_connected = true`
- Course CRUD create đầu tiên → `first_course_created = true` (sales service event)
- Student invite gửi đầu → `first_student_invited = true`
- Session schedule đầu → `first_session_scheduled = true`

→ Customer BE SUBSCRIBE event từ các service trên, hoặc expose internal `POST /customer/mentorhub/onboarding/:mentorId/auto-advance/:step` để service khác gọi.

Step labels (tiếng Việt, FE đang hiển thị):
```
zoom_connected:           "Kết nối tài khoản Zoom"
zalo_connected:           "Kết nối Zalo OA"
first_course_created:     "Tạo khoá học đầu tiên"
first_student_invited:    "Mời học viên đầu tiên"
first_session_scheduled:  "Lên lịch buổi học đầu tiên"
```

### B) Custom fields per tenant

```
GET    /customer/mentorhub/custom-fields/definitions?scope=student|course
POST   /customer/mentorhub/custom-fields/definitions
DELETE /customer/mentorhub/custom-fields/definitions/:id

GET    /customer/mentorhub/custom-fields/values/:entityType/:entityId
PUT    /customer/mentorhub/custom-fields/values/:entityType/:entityId/:fieldKey
```

Definition shape:
```ts
interface CustomFieldDefinition {
  id: string;
  tenantId: string;
  scope: 'student' | 'course';
  name: string;             // tiếng Việt: "Mục tiêu", "Trình độ", ...
  key: string;              // snake_case [a-z][a-z0-9_]{0,40}
  type: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'boolean';
  required: boolean;
  options?: string[];       // bắt buộc cho select / multi_select
  description?: string;
  createdAt: string;
}
```

Validation rule (BE phải enforce y hệt FE stub):
- `key` regex `^[a-z][a-z0-9_]{0,40}$`
- `select` / `multi_select` không có `options` → 400
- (tenantId, scope, key) duplicate → 409
- Khi delete definition → cascade xoá values liên quan (cùng tenant + scope + key)

Value shape:
```ts
interface CustomFieldValue {
  tenantId: string;
  entityType: 'student' | 'course';
  entityId: string;
  fieldKey: string;
  value: string | number | boolean | string[] | null;
  updatedAt: string;
}
```

Type validation khi PUT value:
- `text` → string
- `number` → number
- `boolean` → boolean
- `date` → ISO date string parseable
- `select` → string ∈ definition.options
- `multi_select` → array of string ∈ definition.options
- value=null + required=true → 400

### C) DB schema gợi ý (postgres)

```sql
CREATE TABLE mentorhub_onboarding (
  mentor_id text PRIMARY KEY,
  tenant_id text NOT NULL,
  steps jsonb NOT NULL,         -- { zoom_connected: bool, ... }
  completed_at timestamptz,
  updated_at timestamptz NOT NULL
);

CREATE TABLE mentorhub_custom_field_def (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('student','course')),
  name text NOT NULL,
  key text NOT NULL,
  type text NOT NULL CHECK (type IN ('text','number','date','select','multi_select','boolean')),
  required boolean NOT NULL,
  options jsonb,
  description text,
  created_at timestamptz NOT NULL,
  UNIQUE (tenant_id, scope, key)
);

CREATE TABLE mentorhub_custom_field_value (
  tenant_id text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('student','course')),
  entity_id text NOT NULL,
  field_key text NOT NULL,
  value jsonb,                  -- string | number | bool | array
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, entity_type, entity_id, field_key)
);

CREATE INDEX ON mentorhub_custom_field_def (tenant_id, scope);
CREATE INDEX ON mentorhub_custom_field_value (tenant_id, entity_type, entity_id);
```

## Ràng buộc & gợi ý

- **Multi-tenant**: tất cả query filter `tenant_id`. FE gửi `x-mentor-id` header (mock auth) → BE resolve `tenantId = TENANT-${mentorId}` (production: từ JWT/lookup mentor record).
- **Idempotency**: PATCH onboarding step + PUT custom-field value đều idempotent — gọi nhiều lần với cùng body không tạo duplicate.
- **Response envelope**: BE customer hiện dùng `{ data, meta, error }` envelope chuẩn — FE sẽ adapt khi cutover.
- **Auto-advance event flow**: nếu customer BE không sẵn sàng nhận event từ service khác (Zoom/Zalo/Sales), FE sẽ giữ tạm ở mentorhub-be stub + sync về customer định kỳ. Long-term: subscribe Kafka/Rabbit event hoặc internal HTTP webhook.
- **Cross-link**: handoff song song `notification` (issue khác) chỉ liên quan reminder dispatch — không đụng onboarding/custom-fields.

## File FE liên quan (chỉ để BE tham chiếu, KHÔNG sửa)

Stub Phase 4 vừa commit (commit `fc53b6c9`):

- Onboarding state machine: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/onboarding.ts
- Onboarding routes: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/onboarding.ts
- Custom fields service: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/custom-fields.ts
- Custom fields routes: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/custom-fields.ts
- Type definitions: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/types.ts (search `MentorOnboardingState`, `CustomFieldDefinition`, `CustomFieldValue`)

## Tiêu chí done

- [ ] DB migrations cho 3 bảng `mentorhub_onboarding`, `mentorhub_custom_field_def`, `mentorhub_custom_field_value`
- [ ] 2 endpoint onboarding (GET state + PATCH step) chạy được, response shape đúng + auto-advance internal endpoint
- [ ] 5 endpoint custom-fields (def CRUD + value get/put) + validation rule đúng spec (key regex, options check, type validate)
- [ ] Cascade delete: xoá definition → xoá values matching
- [ ] Postman / curl examples cho FE smoke-test cutover

---
**Reply protocol** (đặc thù mentorhub — đọc kỹ):

Khi xong, BE mở issue mới trên `ducdung872001/cloud-crm` với:
- **Title**: `[reply] onboarding-state-custom-fields — <status>`
- **Labels (PHẢI có cả 2)**:
  - `reply-from-customer`
  - `to-mentorhub` ← BẮT BUỘC, vì cloud-crm là repo dùng chung cho nhiều FE branch
- **Body**: link tới issue gốc này (`ducdung872001/cloud-customer-master#6`), tóm tắt thay đổi + commit SHA + breaking change (nếu có)

KHÔNG comment trực tiếp vào issue gốc — FE mentorhub chỉ poll issue OPEN có CẢ HAI label `reply-from-*` AND `to-mentorhub` trên `ducdung872001/cloud-crm`.

Lazy-create label nếu chưa có:
```bash
gh label create to-mentorhub --repo ducdung872001/cloud-crm --color FBCA04 --description "Reply gửi cho FE mentorhub" 2>/dev/null || true
gh label create reply-from-customer --repo ducdung872001/cloud-crm --color 1D76DB --description "Reply từ BE customer" 2>/dev/null || true
```
