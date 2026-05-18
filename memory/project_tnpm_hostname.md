---
name: project-tnpm-hostname
description: tnpm FE hard-codes Hostname header to tnpm.reborn.vn for all API calls
metadata:
  type: project
---

The `Hostname` header sent on every fetch is hard-coded to `"tnpm.reborn.vn"` in `src/configs/fetchConfig.ts:43`, not derived from `location.hostname`.

**Why:** All API calls must be tagged with the tnpm tenant regardless of where the FE is served (local dev, dev/prod builds). Previously the value was pinned to `"kcn.reborn.vn"` while the `tnpm.reborn.vn` tenant was being configured on BE; switched to `"tnpm.reborn.vn"` on 2026-05-18 once BE was ready.

**How to apply:** When debugging "wrong tenant" / "no data" / 4xx issues on local or live tnpm, remember every request carries `Hostname: tnpm.reborn.vn`. To exercise another tenant, change that header. Related: [[project-crm-basename]].
