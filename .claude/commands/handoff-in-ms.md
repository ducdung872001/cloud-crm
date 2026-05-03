---
description: Đọc reply từ microservice backend. Backend tạo issue mới trên repo cloud-crm với label reply-from-<service> + to-tnpm. Skill này list, tóm tắt, và đóng issue khi user đã xử lý.
argument-hint: "[issue-number | service-name | slug] — vd: /handoff-in-ms 42  hoặc  /handoff-in-ms operation"
---

Bạn đang đứng tại FE `tnpm` (nhánh `reborn-tnpm` trên repo `ducdung872001/cloud-crm`) và cần xử lý phản hồi từ 1 microservice backend. Backend đã hoàn tất task được giao (qua `/handoff-out-ms`) và mở 1 issue reply trên repo `ducdung872001/cloud-crm` với 2 label: `reply-from-<service>` AND `to-tnpm`.

> ⚠️ **Đặc thù tnpm**: repo `cloud-crm` dùng chung cho nhiều FE branch. PHẢI lọc bằng compound label (cả 2 label) để không nuốt phải reply của FE khác (banking, retail, mentorhub, fitpro, …).

## Step 0 — Sanity checks

```bash
test "$(git config --get remote.origin.url)" = "https://github.com/ducdung872001/cloud-crm.git" || echo "ERR_WRONG_REPO"
test "$(git branch --show-current)" = "reborn-tnpm" || echo "ERR_WRONG_BRANCH"
gh auth status >/dev/null 2>&1 || echo "ERR_NO_GH_AUTH"
```

`ERR_*` → STOP, báo user (như skill /handoff-out-ms).

## Step 1 — Resolve issue cần đọc

Phân tích `$ARGUMENTS`:

- **Rỗng** → list tất cả issue OPEN có CẢ HAI label `to-tnpm` AND match `reply-from-*` trên repo cloud-crm:
  ```bash
  # Cách 1: dùng search syntax (filter compound labels)
  gh issue list \
    --repo ducdung872001/cloud-crm \
    --state open \
    --label to-tnpm \
    --search "label:reply-from-billing label:reply-from-bpm label:reply-from-care label:reply-from-contract label:reply-from-customer label:reply-from-integration label:reply-from-inventory label:reply-from-logistics label:reply-from-market label:reply-from-notification label:reply-from-operation label:reply-from-sales" \
    --json number,title,labels,createdAt,url \
    --limit 50
  ```
  (gh search dùng OR ngầm cho nhiều label cùng prefix — kết hợp với `--label to-tnpm` để AND. Nếu output rỗng và bạn nghi có reply sót, fallback: `gh issue list --repo ducdung872001/cloud-crm --state open --label to-tnpm --json number,title,labels,url --limit 50` rồi filter client-side bằng regex `reply-from-*`.)

  Hiển thị bảng cho user, chọn issue oldest hoặc hỏi chọn.

- **Số nguyên** → coi là issue number. `gh issue view <n> --repo ducdung872001/cloud-crm --json number,title,body,labels,state,url`

- **Khớp 1 trong 12 service** (`billing`, `bpm`, `care`, `contract`, `customer`, `integration`, `inventory`, `logistics`, `market`, `notification`, `operation`, `sales`) → list issue OPEN với label `reply-from-<service>` AND `to-tnpm`:
  ```bash
  gh issue list --repo ducdung872001/cloud-crm --state open \
    --label "reply-from-<service>" --label "to-tnpm" \
    --json number,title,labels,createdAt,url --limit 50
  ```
  Pick oldest hoặc hỏi user chọn nếu nhiều.

- **Trường hợp khác** → coi là slug fragment, search issue title:
  ```bash
  gh issue list --repo ducdung872001/cloud-crm --state open \
    --label to-tnpm \
    --search "<slug> in:title" \
    --json number,title,labels,url
  ```

Nếu không tìm thấy → "Không có reply mới từ microservice nào cho tnpm." và STOP.

## Step 2 — Đọc & verify

`gh issue view <n> --repo ducdung872001/cloud-crm --json number,title,body,labels,state,url`

- Verify labels có CẢ `to-tnpm` AND pattern `reply-from-<service>`.
  - Nếu thiếu `to-tnpm` → cảnh báo "Issue #<n> không có label to-tnpm — có thể đây là reply cho FE khác (banking/retail/mentorhub/fitpro). Skip để không đụng nhầm."
  - Nếu thiếu `reply-from-*` → cảnh báo "Issue #<n> không có label reply-from-*, có thể không phải reply handoff."
- Verify state = `open` (nếu đã closed → báo user "Issue #<n> đã closed, có thể đã xử lý trước.")

## Step 3 — Tóm tắt cho user (5–8 dòng)

- **From service**: lấy từ label (vd `reply-from-operation` → `operation`)
- **Issue**: link `url`
- **Title**: title issue
- **Original handoff issue** (nếu body có ref dạng `ducdung872001/cloud-*-master#<n>` hoặc URL) → ghi rõ
- **Đã ship**: bullet rút từ body
- **Cần FE làm**: bullet rút từ body (nếu có)
- **Breaking change?**: yes/no

Đối chiếu với audit log local: tìm file `.handoff/sent/*-<service>-*.md` mà `gh_issue` frontmatter trỏ đến issue gốc tương ứng. Nếu thấy → mention path; nếu không → bỏ qua, không bịa.

Hỏi user: *"Bạn muốn (a) ngấm reply này và bắt đầu wire FE theo, (b) đọc kỹ thêm body trước, hay (c) skip / xử lý sau?"*

## Step 4 — Nếu user chọn (a) — bắt tay làm

Treat danh sách "Cần FE làm" trong body như acceptance test. Dùng TaskCreate cho multi-step. Có thể clone read-only repo BE qua `gh` để đọc PR/commit nếu cần đối chiếu shape thật, NHƯNG không sửa code BE từ session này.

## Step 5 — Khi user xác nhận đã xử lý xong reply

a. **Comment + close issue reply**:
   ```bash
   gh issue close <n> \
     --repo ducdung872001/cloud-crm \
     --comment "$(cat <<'EOF'
   FE tnpm đã wire/áp dụng theo reply này.
   <1 đoạn ngắn: file FE đã đổi, commit SHA, lệch spec gì không>
   EOF
   )"
   ```

b. **Move audit log local**: nếu tìm được file gốc trong `.handoff/sent/` (qua gh_issue khớp issue gốc trên repo BE), move sang `.handoff/replied/`:
   ```bash
   mv .handoff/sent/<original-file> .handoff/replied/<original-file>
   ```
   Append vào file đó 1 section mới:
   ```markdown
   ---

   ## Reply từ <service> — <ISO timestamp>
   - Reply issue: <url cloud-crm issue>
   - Đã ship: <tóm tắt>
   - FE đã wire xong: <commit SHA hoặc "đang dở">
   ```

c. **Báo user (≤3 dòng)**:
   ```
   ✓ Đã đóng reply #<n> (<service>) trên cloud-crm
   ✓ Audit moved: .handoff/replied/<filename>
   ```

## Rules

- KHÔNG tự đoán content reply nếu body issue rỗng/mơ hồ — báo user và yêu cầu BE bổ sung
- KHÔNG đóng issue reply nếu user chưa xác nhận đã wire FE xong
- KHÔNG đụng vào issue thiếu label `to-tnpm` (có thể của FE khác trên cùng repo)
- KHÔNG sửa code BE từ session này (chỉ Read qua github web/api để đối chiếu)
- Nếu reply mention breaking change → cảnh báo user RẤT rõ, tạo task riêng để verify regression
