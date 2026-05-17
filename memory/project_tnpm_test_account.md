---
name: project-tnpm-test-account
description: Test login account for tnpm FE smoke runs — Hòa Phạm
metadata:
  type: project
---

User-supplied test credentials for manual smoke-testing the tnpm CRM build:

- Phone / username: `0971234599`
- Password: `Reborn@12345`
- Display name: Hòa Phạm

**Why:** Provided by the user (ceo@reborn.vn) on 2026-05-17 for end-to-end manual verification of the tnpm flow against the pinned `kcn.reborn.vn` tenant ([[project-tnpm-hostname]]).

**How to apply:** When the user asks to "log in and verify" / "monitor errors after login" / similar on the tnpm build, log in with this account at `http://localhost:4000/biz-prop/login` ([[project-crm-basename]]). Treat the password as session-scoped — if it stops working, re-ask the user rather than guessing.
