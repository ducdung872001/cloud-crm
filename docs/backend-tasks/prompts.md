# Claude Code CLI prompts — mỗi prompt cho một backend microservice

> 🎉 **Tất cả task BE đã hoàn thành** tính đến 2026-04-22.
>
> File này được giữ lại làm **template** cho đợt task BE kế tiếp. Khi có task mới, thêm section theo format dưới đây.

## Cách dùng (khi có task mới)

1. Viết task doc tại `docs/backend-tasks/<service>/<file>.md` (spec chi tiết)
2. Thêm 1 section vào file này theo format:

````markdown
## N. `cloud-<service>-master` — <tiêu đề ngắn>

**Task doc:** [<service>/<file>.md](./<service>/<file>.md)
**Severity:** 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW

````
<Prompt block sẵn — BE paste vào Claude Code CLI ở repo của mình>
...
````
````

3. Update bảng ưu tiên ở cuối file.
4. BE dev `cd` vào repo BE, mở `claude` CLI, copy prompt block đầy đủ, paste.

## Meta-prompt dùng chung (cho tương lai)

Nếu có nhiều task cho 1 service, paste block này để agent tự pick section:

````
Đọc file `../cloud-crm/docs/backend-tasks/prompts.md` (hoặc GitHub raw:
https://raw.githubusercontent.com/ducdung872001/cloud-crm/community-hub/docs/backend-tasks/prompts.md).

Detect microservice của repo hiện tại (từ package name / folder), tìm section
`## N. \`cloud-<service>-master\`` tương ứng. Đọc task doc link trong section
để có đủ context. Thực hiện task theo acceptance criteria, báo cáo theo format
"Báo cáo" cuối section.

Quy tắc bất di bất dịch:
- Không hardcode business rule theo ngành
- Không đổi response shape FE đã hardcode
- Tuân thủ tenant isolation
- Không skip git hook (--no-verify)
````

---

## Task đã hoàn thành (lịch sử — chỉ để tham khảo)

Các task dưới đây đã verify done và xoá hẳn khỏi docs. Note lại ngày để lần sau audit.

| Ngày done | Repo | Task | Verify method |
|---|---|---|---|
| 2026-04-21 | `cloud-billing-master` | Tenant isolation `/billing/reconciliation/list` | User confirm; FE đã wire real API |
| 2026-04-22 | `cloud-inventory-master` | Tenant isolation 7 endpoint `/inventory/*/list` | curl all 7 endpoints → `items: []` cho tenant mới |
| 2026-04-22 | `cloud-notification-master` | Fix `firebaseDeliveryHistory/count` trả 400 body rỗng | curl → 200 `{code:0, result:0}` |
| 2026-04-22 | `cloud-customer-master` | Seed `mentorCode` + `houseNumber` attribute cho W-House | curl `/customerAttribute/list` → thấy 2 attribute (id 345, 346, bsnId 336) |
| 2026-04-22 | `cloud-market-master` | Events addendum 5 gap (venue/QR/addon/proofs/register) | curl → endpoints exist, trả JSON body (không còn nginx 404 HTML) |
| 2026-04-22 | `cloud-market-master` | Fixed Price 4 endpoint `/market/fixedPrice/*` | curl → endpoints exist, trả JSON body |

**Deviation lưu ý (không chặn task):**

- Một số endpoint market trả `{error: "..."}` thay vì `{code, message, result}` — FE caller cần handle cả 2 shape (đã có pattern trong codebase cũ).
- Permission `/promotion/ VIEW` cho role `mod` cần admin config — không phải BE bug.
- BE inventory silent-fallback-empty khi thiếu `Hostname` header thay vì `403 MISSING_TENANT` — an toàn hơn leak, accept.
