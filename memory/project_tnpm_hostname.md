---
name: project-tnpm-hostname
description: tnpm FE hard-codes Hostname header to kcn.reborn.vn for all API calls (temporary tenant pin)
metadata:
  type: project
---

The `Hostname` header sent on every fetch is hard-coded to `"kcn.reborn.vn"` in `src/configs/fetchConfig.ts:43`, not derived from `location.hostname`.

**Why:** BE for tenant `tnpm.reborn.vn` was not yet configured when tnpm FE went live, so all requests are pinned to the existing `kcn.reborn.vn` tenant. The inline comment marks this as temporary — revert to `location.hostname` once BE supports `tnpm.reborn.vn`.

**How to apply:** When debugging "wrong tenant" / "no data" / 4xx issues on local or live tnpm, remember the request is always tagged `kcn.reborn.vn` regardless of where the FE is served. To exercise another tenant, change that header. Related: [[project-crm-basename]].
