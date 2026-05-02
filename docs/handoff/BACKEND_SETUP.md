# Backend Microservice — Handoff Setup Guide cho fitpro

Hướng dẫn cấu hình **máy backend** (server chạy 1 hoặc nhiều microservice của reborn-biz) để đối ứng với cơ chế handoff đã setup ở FE **fitpro**. Tham chiếu chéo với `crm-banking/docs/handoff/BACKEND_SETUP.md` (canonical guide cho toàn bộ multi-FE setup); file này chỉ ghi **những điểm khác biệt riêng cho fitpro**.

> **Đối tượng đọc**: developer/CEO khi sang máy BE, **hoặc** Claude session chạy trên máy BE.

---

## 1. Tổng quan — fitpro khác gì với crm-banking?

| Điểm | crm-banking | fitpro |
|---|---|---|
| FE name (dùng trong label) | `crm-banking` | `fitpro` |
| FE repo | `ducdung872001/crm-banking` (dedicated) | `ducdung872001/cloud-crm` (**dùng chung** với nhiều FE branch khác) |
| FE branch | `master` | `reborn-fitpro` |
| Outbound label (BE repo) | `from-crm-banking` | `from-fitpro` |
| Reply repo | `ducdung872001/crm-banking` | `ducdung872001/cloud-crm` |
| Reply label | `reply-from-<service>` (1 label) | `reply-from-<service>` **AND** `to-fitpro` (**2 label compound**) |

**Tại sao compound label?** Repo `cloud-crm` dùng chung cho nhiều FE branch (banking-fe variant, retail variant, mentorhub, fitpro, …). Nếu BE chỉ gắn `reply-from-customer`, fitpro skill `/handoff-in-ms` sẽ kéo về cả reply dành cho FE khác. Label thứ 2 `to-fitpro` đảm bảo isolation.

## 2. Naming convention (BẮT BUỘC) — phần fitpro

| Loại label | Format | Ai tạo | Ở đâu |
|---|---|---|---|
| Outbound (fitpro → BE) | `from-fitpro` | fitpro `/handoff-out-ms` | Trên repo BE (lazy-create nếu chưa có) |
| Inbound (BE → fitpro) | `reply-from-<service>` **+** `to-fitpro` | BE skill / `/handoff-reply` | Trên repo `ducdung872001/cloud-crm` (lazy-create cả 2 label) |

- `<service>` = 1 trong 12: `billing`, `bpm`, `care`, `contract`, `customer`, `integration`, `inventory`, `logistics`, `market`, `notification`, `operation`, `sales`
- Tất cả repo (FE và BE) cùng owner `ducdung872001`.

## 3. Workflow phía BE khi xử lý handoff từ fitpro

```bash
# 1. cd vào repo microservice đang nhận handoff
cd /path/to/cloud-customer-master

# 2. Mở Claude Code
claude

# 3. Trong Claude:
#    /handoff-in fitpro           → list các handoff đang chờ từ FE fitpro
#    /handoff-in 42               → xem handoff issue #42
#    Sau khi pick 1 issue, Claude sẽ tóm tắt và hỏi (a)/(b)/(c).

# 4. Khi đã commit + (push|merge PR), gửi reply về FE fitpro:
#    /handoff-reply 42
```

## 4. Override khi BE skill `/handoff-reply` chạy cho fitpro

Skill `/handoff-reply` canonical (ở crm-banking/docs/handoff/_be-skills/) hiện chỉ gắn 1 label `reply-from-<service>`. Khi reply về fitpro PHẢI gắn THÊM `to-fitpro`. Có 2 cách:

### Cách A — sửa skill `/handoff-reply` để parse FE từ label gốc (KHUYẾN NGHỊ, lâu dài)

Trong `/handoff-reply` skill, sau khi đọc handoff issue gốc và parse được `<fe>` từ label `from-<fe>`:
- Repo reply = `ducdung872001/<fe>` (dedicated repo flow — vd crm-banking)
- **NGOẠI LỆ multi-FE trên cloud-crm**: nếu `<fe> ∈ {mentorhub, fitpro, ...}` thì repo reply = `ducdung872001/cloud-crm` và GẮN THÊM label `to-<fe>`

Pseudo-code update cho skill BE:

```bash
fe=$(gh issue view <n> --repo <be_repo> --json labels --jq '.labels[].name | select(startswith("from-")) | sub("^from-"; "")')

case "$fe" in
  mentorhub|fitpro)
    reply_repo="ducdung872001/cloud-crm"
    extra_labels="--label to-$fe"
    ;;
  *)
    reply_repo="ducdung872001/$fe"
    extra_labels=""
    ;;
esac

# lazy-create labels
gh label create "reply-from-<service>" --repo "$reply_repo" --color 1D76DB 2>/dev/null || true
[ -n "$extra_labels" ] && gh label create "to-$fe" --repo "$reply_repo" --color FBCA04 --description "Reply gửi cho FE $fe" 2>/dev/null || true

gh issue create --repo "$reply_repo" \
  --title "[reply] <slug> — <status>" \
  --label "reply-from-<service>" $extra_labels \
  --body "$(...)"
```

### Cách B — đọc Reply protocol section trong body issue (FE fitpro đã chèn sẵn)

Mỗi handoff body từ fitpro đều có section "Reply protocol" cuối body, ghi rõ 2 label cần gắn + repo đích. BE Claude (hoặc developer manual) đọc section đó và làm theo. KHÔNG cần sửa skill — phù hợp khi chưa muốn đụng skill canonical.

> Tốt nhất là làm cả 2: cập nhật skill (Cách A) để tự động đúng, đồng thời fitpro vẫn giữ Reply protocol trong body để self-document và phòng khi Claude session BE chưa cập nhật skill.

## 5. Verify quick

Sau khi BE reply xong, fitpro sẽ poll bằng:

```bash
gh issue list --repo ducdung872001/cloud-crm \
  --state open \
  --label to-fitpro \
  --label "reply-from-<service>"
```

Nếu BE quên gắn `to-fitpro`, fitpro sẽ KHÔNG thấy reply → handoff bị treo. Khi nghi ngờ, BE chạy:

```bash
gh issue view <reply-issue-n> --repo ducdung872001/cloud-crm --json labels
# Kỳ vọng thấy CẢ "reply-from-<service>" VÀ "to-fitpro"
```

Nếu thiếu → `gh issue edit <n> --repo ducdung872001/cloud-crm --add-label to-fitpro`.

## 6. Multi-FE coexistence trên cloud-crm

`cloud-crm` đã host các FE branch sau với cùng pattern compound label:
- `reborn-mentorhub` → `from-mentorhub` / `reply-from-<svc>` + `to-mentorhub`
- `reborn-fitpro` → `from-fitpro` / `reply-from-<svc>` + `to-fitpro`

Khi tương lai có thêm FE branch mới (vd `reborn-care`, `reborn-realestate`), áp dụng cùng pattern:
- FE branch X → outbound label `from-X`, reply label compound `reply-from-<service>` + `to-X`
- Update BE skill `/handoff-reply` thêm 1 case cho X (Cách A)

Mỗi FE branch tự maintain thư mục `.claude/commands/handoff-{in,out}-ms.md` + `docs/handoff/MICROSERVICES.md` riêng (commit theo branch của mình, không lan sang branch khác).
