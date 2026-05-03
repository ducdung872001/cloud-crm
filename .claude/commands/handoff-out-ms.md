---
description: Phát handoff từ FE tnpm xuống 1 microservice backend (qua GitHub Issue). Đọc registry docs/handoff/MICROSERVICES.md để chọn repo. Lưu audit log local trong .handoff/sent/.
argument-hint: "<service> [topic-slug] — vd: /handoff-out-ms operation add-meter-reading-bulk"
---

Bạn đang đứng tại FE `tnpm` (nhánh `reborn-tnpm` trên repo `ducdung872001/cloud-crm`) và cần đẩy 1 task xuống 1 microservice backend (BE chạy trên server khác, không có shared filesystem). Channel duy nhất: **GitHub Issue trên repo BE**, kèm audit log local.

> ⚠️ **Đặc thù tnpm**: repo FE `cloud-crm` dùng chung cho nhiều FE branch khác (banking, retail, mentorhub, fitpro, realestate, …). Do đó reply từ BE phải mang **2 label đồng thời**: `reply-from-<service>` **và** `to-tnpm` để skill `/handoff-in-ms` chỉ pick đúng reply của tnpm. Mọi handoff body PHẢI nêu rõ điều này ở section "Reply protocol".

## Step 0 — Sanity checks (REQUIRED)

Chạy đồng thời các check sau bằng Bash, tất cả phải pass trước khi tiếp tục:

```bash
# (a) đúng repo FE cloud-crm
test "$(git config --get remote.origin.url)" = "https://github.com/ducdung872001/cloud-crm.git" || echo "ERR_WRONG_REPO"

# (b) đúng branch reborn-tnpm
test "$(git branch --show-current)" = "reborn-tnpm" || echo "ERR_WRONG_BRANCH"

# (c) gh đã auth
gh auth status >/dev/null 2>&1 || echo "ERR_NO_GH_AUTH"

# (d) registry tồn tại
test -f docs/handoff/MICROSERVICES.md || echo "ERR_NO_REGISTRY"
```

Nếu thấy bất kỳ `ERR_*` nào → STOP, báo user lỗi tương ứng:
- `ERR_WRONG_REPO`: "Skill này chỉ chạy trong repo cloud-crm. cwd hiện tại: $(pwd)"
- `ERR_WRONG_BRANCH`: "Skill này chỉ chạy trên branch reborn-tnpm. branch hiện tại: $(git branch --show-current). Nếu bạn đang phát triển FE khác trên cùng repo cloud-crm, dùng skill handoff của FE đó."
- `ERR_NO_GH_AUTH`: "Cần `gh auth login` trước khi handoff. Gợi ý chạy `! gh auth login` trong prompt."
- `ERR_NO_REGISTRY`: "Thiếu docs/handoff/MICROSERVICES.md. Re-run setup handoff."

## Step 1 — Resolve service & repo

Parse `$ARGUMENTS` thành 2 phần: `<service>` (token đầu) và `<topic-slug>` (phần còn lại, optional).

Đọc `docs/handoff/MICROSERVICES.md` (Read tool) để lấy registry. Nếu `<service>` rỗng hoặc không khớp dòng nào trong bảng:
- List tên các service hợp lệ cho user (`billing`, `bpm`, `care`, `contract`, `customer`, `integration`, `inventory`, `logistics`, `market`, `notification`, `operation`, `sales`)
- ⚠️ `bpm` đặc biệt: repo `bpm-core` (KHÔNG `cloud-bpm-master`), nhánh active `cloud` (KHÔNG `master`). Khi tạo issue dùng `--repo ducdung872001/bpm-core` (issue tự gắn với default branch). Khi reference file code qua URL trong body, dùng `blob/cloud/...` thay vì `blob/master/...`.
- Hỏi user muốn gửi xuống service nào, dừng lại đợi reply

Sau khi có `<service>` hợp lệ, lấy `<be_repo>` từ bảng (vd `ducdung872001/cloud-operation-master`, lưu ý `notification` → `reborn-notihub`, `bpm` → `bpm-core`).

## Step 2 — Slug & timestamp

- Nếu `<topic-slug>` rỗng → suy luận từ topic gần nhất trong conversation, kebab-case ≤40 chars
- Slug cuối cùng = `<topic-slug>` (không tự ghép `<service>` vào, vì service đã nằm trong filename + label)
- Timestamp: `date -u +%Y%m%d-%H%M`
- Filename audit local = `.handoff/sent/<timestamp>-<service>-<slug>.md`

## Step 3 — Synthesize prompt body

Brief BE Claude như đồng nghiệp mới: họ KHÔNG có context conversation này, KHÔNG có code FE trên máy họ. Body skeleton (Vietnamese OK):

```markdown
---
from: tnpm
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-tnpm
to: <service>
created: <ISO từ `date -u -Iseconds`>
slug: <slug>
status: open
gh_issue: <điền sau khi tạo issue ở step 4>
---

# <Một câu mục tiêu — động từ + đối tượng>

## Bối cảnh (Why)
<2–4 câu: vì sao FE tnpm cần BE <service> làm việc này; FE đang làm tới đâu, đang chặn ở đâu. Lưu ý tnpm là FE quản lý bất động sản TNPM — quản lý project/building/space/unit, lease contract (escalation/deposit/auto-renew), turnover rent, CAM charges allocation, billing engine + meter reading, debt management, vendor management (5-tab detail + KPI dashboard), vendor contract/invoice 3-way match + 4-step approval, B2G compliance, payment gateway MSB/Timi/VNPay/MoMo, fee notification engine, audit log, vendor portal preview, owner dashboard role-based.>

## Yêu cầu cụ thể (What)
<Liệt kê việc BE cần làm:
- Method + path mới hoặc sửa
- Request shape (kèm field bắt buộc/tuỳ chọn, type)
- Response shape (kèm envelope nếu có)
- Auth/role yêu cầu
- DB tables/schemas chịu ảnh hưởng (nếu biết)>

## Ràng buộc & gợi ý
<Convention FE đang giả định: response envelope, status code, naming, pagination,
edge cases, mock/seed data hiện tại trên FE để BE đối chiếu shape. Mock data tập trung
ở src/assets/mock/TNPMData.ts (~900 dòng, 22 dataset) và services orphan ở src/services/tnpm/*.ts>

## File FE liên quan (chỉ để BE tham chiếu, KHÔNG sửa)
<Đường dẫn tuyệt đối + line range. BE sẽ Read qua GitHub web UI hoặc clone read-only.
LƯU Ý: nhánh active của tnpm là `reborn-tnpm`, KHÔNG `master`.
Vd:
- https://github.com/ducdung872001/cloud-crm/blob/reborn-tnpm/src/pages/LeaseContractList/index.tsx#L24-L43
- https://github.com/ducdung872001/cloud-crm/blob/reborn-tnpm/src/assets/mock/TNPMData.ts
- https://github.com/ducdung872001/cloud-crm/blob/reborn-tnpm/src/services/tnpm/lease.ts>

## Tiêu chí done
<Checklist 3–5 dòng để BE self-verify trước khi reply>

---
**Reply protocol** (đặc thù tnpm — đọc kỹ):

Khi xong, BE mở issue mới trên `ducdung872001/cloud-crm` với:
- **Title**: `[reply] <slug> — <status>`
- **Labels (PHẢI có cả 2)**:
  - `reply-from-<service>` (vd `reply-from-operation`)
  - `to-tnpm` ← BẮT BUỘC, vì cloud-crm là repo dùng chung cho nhiều FE branch
- **Body**: link tới issue gốc này (`<be_repo>#<n>` hoặc URL), tóm tắt thay đổi + commit SHA + breaking change (nếu có)

KHÔNG comment trực tiếp vào issue gốc — FE tnpm chỉ poll issue OPEN có CẢ HAI label `reply-from-*` AND `to-tnpm` trên `ducdung872001/cloud-crm`.

Lazy-create label nếu chưa có:
```bash
gh label create to-tnpm --repo ducdung872001/cloud-crm --color FBCA04 --description "Reply gửi cho FE tnpm" 2>/dev/null || true
gh label create reply-from-<service> --repo ducdung872001/cloud-crm --color 1D76DB --description "Reply từ BE <service>" 2>/dev/null || true
```
```

## Step 4 — Tạo GitHub issue trên repo BE

Đảm bảo label `from-tnpm` tồn tại trên repo BE (lần đầu sẽ phải tạo):

```bash
gh label create from-tnpm \
  --repo <be_repo> \
  --color 5319E7 \
  --description "Handoff từ FE tnpm" 2>/dev/null || true
```

Tạo issue (HEREDOC để giữ nguyên backticks/quotes):

```bash
gh issue create \
  --repo <be_repo> \
  --title "[handoff] <slug> — <one-line goal>" \
  --label from-tnpm \
  --body "$(cat <<'EOF'
<full body từ Step 3, KHÔNG kèm frontmatter — frontmatter chỉ vào file local>
EOF
)"
```

Capture URL issue trả về (dạng `https://github.com/<be_repo>/issues/<n>`).

## Step 5 — Ghi audit log local

Dùng Write để tạo `.handoff/sent/<timestamp>-<service>-<slug>.md` với frontmatter ĐẦY ĐỦ (kể cả `gh_issue: <url>` vừa lấy ở Step 4) + toàn bộ body.

## Step 6 — Báo lại user (≤4 dòng)

```
✓ Handoff → <service> (<be_repo>)
  Issue: <url>
  Audit: .handoff/sent/<filename>
  BE sẽ reply bằng issue mới trên cloud-crm với label reply-from-<service> + to-tnpm. Chạy /handoff-in-ms để đọc.
```

## Rules

- KHÔNG tự đoán service nếu user không chỉ rõ và conversation không xác định được — HỎI user
- KHÔNG fabricate endpoint/path/SHA — chỉ ghi cái bạn thật sự thấy trong conversation hoặc code FE
- KHÔNG `git add` file `.handoff/` (đã gitignore)
- KHÔNG commit/push hộ user trừ khi user yêu cầu rõ ràng
- Mỗi handoff = 1 issue mới. KHÔNG gộp nhiều task khác nhau vào 1 issue (dùng nhiều lần `/handoff-out-ms`)
- Nếu user đang muốn gửi cùng spec xuống >1 service (vd customer + operation cùng schema) → vẫn tạo issue riêng cho từng service nhưng cross-link trong body
- File reference trong body PHẢI dùng `blob/reborn-tnpm/...`, KHÔNG `blob/master/...` (nhánh master của cloud-crm là project khác) và cũng KHÔNG `blob/reborn-fitpro/...`
- Body PHẢI giữ nguyên section "Reply protocol" với compound label requirement — nếu BE chỉ gắn 1 label `reply-from-<service>`, tnpm không pick được
