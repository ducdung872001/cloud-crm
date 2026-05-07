# Backend Microservice — Handoff Setup Guide cho mentorhub

Hướng dẫn cấu hình **máy backend** (server chạy 1 hoặc nhiều microservice của reborn-biz) để đối ứng với cơ chế handoff đã setup ở FE **mentorhub**. Tham chiếu chéo với `crm-banking/docs/handoff/BACKEND_SETUP.md` (canonical guide cho toàn bộ multi-FE setup); file này chỉ ghi **những điểm khác biệt riêng cho mentorhub**.

> **Đối tượng đọc**: developer/CEO khi sang máy BE, **hoặc** Claude session chạy trên máy BE.

---

## 1. Tổng quan — mentorhub khác gì với crm-banking?

| Điểm | crm-banking | mentorhub |
|---|---|---|
| FE name (dùng trong label) | `crm-banking` | `mentorhub` |
| FE repo | `ducdung872001/crm-banking` (dedicated) | `ducdung872001/cloud-crm` (**dùng chung** với nhiều FE branch khác) |
| FE branch | `master` | `reborn-mentorhub` |
| Outbound label (BE repo) | `from-crm-banking` | `from-mentorhub` |
| Reply repo | `ducdung872001/crm-banking` | `ducdung872001/cloud-crm` |
| Reply label | `reply-from-<service>` (1 label) | `reply-from-<service>` **AND** `to-mentorhub` (**2 label compound**) |

**Tại sao compound label?** Repo `cloud-crm` dùng chung cho nhiều FE branch (banking-fe variant, retail variant, mentorhub, …). Nếu BE chỉ gắn `reply-from-customer`, mentorhub skill `/handoff-in-ms` sẽ kéo về cả reply dành cho FE khác. Label thứ 2 `to-mentorhub` đảm bảo isolation.

## 2. Naming convention (BẮT BUỘC) — phần mentorhub

| Loại label | Format | Ai tạo | Ở đâu |
|---|---|---|---|
| Outbound (mentorhub → BE) | `from-mentorhub` | mentorhub `/handoff-out-ms` | Trên repo BE (lazy-create nếu chưa có) |
| Inbound (BE → mentorhub) | `reply-from-<service>` **+** `to-mentorhub` | BE skill / `/handoff-reply` | Trên repo `ducdung872001/cloud-crm` (lazy-create cả 2 label) |

- `<service>` = 1 trong 12: `billing`, `bpm`, `care`, `contract`, `customer`, `integration`, `inventory`, `logistics`, `market`, `notification`, `operation`, `sales`
- Tất cả repo (FE và BE) cùng owner `ducdung872001`.

## 3. Workflow phía BE khi xử lý handoff từ mentorhub

```bash
# 1. cd vào repo microservice đang nhận handoff
cd /path/to/cloud-customer-master

# 2. Mở Claude Code
claude

# 3. Trong Claude:
#    /handoff-in mentorhub        → list các handoff đang chờ từ FE mentorhub
#    /handoff-in 42               → xem handoff issue #42
#    Sau khi pick 1 issue, Claude sẽ tóm tắt và hỏi (a)/(b)/(c).

# 4. Khi đã commit + (push|merge PR), gửi reply về FE mentorhub:
#    /handoff-reply 42
```

## 4. Override khi BE skill `/handoff-reply` chạy cho mentorhub

Skill `/handoff-reply` canonical (ở crm-banking/docs/handoff/_be-skills/) hiện chỉ gắn 1 label `reply-from-<service>`. Khi reply về mentorhub PHẢI gắn THÊM `to-mentorhub`. Có 2 cách:

### Cách A — sửa skill `/handoff-reply` để parse FE từ label gốc (KHUYẾN NGHỊ, lâu dài)

Trong `/handoff-reply` skill, sau khi đọc handoff issue gốc và parse được `<fe>` từ label `from-<fe>`:
- Repo reply = `ducdung872001/<fe>` (dedicated repo flow — vd crm-banking)
- **NGOẠI LỆ mentorhub**: nếu `<fe> == "mentorhub"` thì repo reply = `ducdung872001/cloud-crm` và GẮN THÊM label `to-mentorhub`

Pseudo-code update cho skill BE:

```bash
fe=$(gh issue view <n> --repo <be_repo> --json labels --jq '.labels[].name | select(startswith("from-")) | sub("^from-"; "")')

if [ "$fe" = "mentorhub" ]; then
  reply_repo="ducdung872001/cloud-crm"
  extra_labels="--label to-mentorhub"
else
  reply_repo="ducdung872001/$fe"
  extra_labels=""
fi

# lazy-create labels
gh label create "reply-from-<service>" --repo "$reply_repo" --color 1D76DB 2>/dev/null || true
[ -n "$extra_labels" ] && gh label create to-mentorhub --repo "$reply_repo" --color FBCA04 --description "Reply gửi cho FE mentorhub" 2>/dev/null || true

gh issue create --repo "$reply_repo" \
  --title "[reply] <slug> — <status>" \
  --label "reply-from-<service>" $extra_labels \
  --body "$(...)"
```

### Cách B — đọc Reply protocol section trong body issue (FE mentorhub đã chèn sẵn)

Mỗi handoff body từ mentorhub đều có section "Reply protocol" cuối body, ghi rõ 2 label cần gắn + repo đích. BE Claude (hoặc developer manual) đọc section đó và làm theo. KHÔNG cần sửa skill — phù hợp khi chưa muốn đụng skill canonical.

> Tốt nhất là làm cả 2: cập nhật skill (Cách A) để tự động đúng, đồng thời mentorhub vẫn giữ Reply protocol trong body để self-document và phòng khi Claude session BE chưa cập nhật skill.

## 5. Verify quick

Sau khi BE reply xong, mentorhub sẽ poll bằng:

```bash
gh issue list --repo ducdung872001/cloud-crm \
  --state open \
  --label to-mentorhub \
  --label "reply-from-<service>"
```

Nếu BE quên gắn `to-mentorhub`, mentorhub sẽ KHÔNG thấy reply → handoff bị treo. Khi nghi ngờ, BE chạy:

```bash
gh issue view <reply-issue-n> --repo ducdung872001/cloud-crm --json labels
# Kỳ vọng thấy CẢ "reply-from-<service>" VÀ "to-mentorhub"
```

Nếu thiếu → `gh issue edit <n> --repo ducdung872001/cloud-crm --add-label to-mentorhub`.

## 6. Multi-FE coexistence trên cloud-crm

Khi tương lai có thêm FE branch mới trên cloud-crm (vd `reborn-fitpro`, `reborn-care`), áp dụng cùng pattern:
- FE branch X → outbound label `from-X`, reply label compound `reply-from-<service>` + `to-X`
- Update BE skill `/handoff-reply` thêm 1 case cho X

Mỗi FE branch tự maintain thư mục `.claude/commands/handoff-{in,out}-ms.md` + `docs/handoff/MICROSERVICES.md` riêng (commit theo branch của mình, không lan sang branch khác).
