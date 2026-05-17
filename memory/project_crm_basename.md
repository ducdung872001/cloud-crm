---
name: project-crm-basename
description: BrowserRouter uses basename="/biz-prop/" — all app URLs must include the /biz-prop prefix
metadata:
  type: project
---

`src/main.tsx:34` wraps the app in `<BrowserRouter basename="/biz-prop/">`. Login route is registered as `/login` in `App.tsx:395`, so the working URL is `http://localhost:4000/biz-prop/login` (not `/login`).

**Why:** Adopted the "product-type / domain" naming rule on 2026-05-17 (renamed from the legacy `/crm/` basename). `biz-prop` = "business property" (bất động sản), matching the actual product line. The SSO redirect builder in `App.tsx:214` constructs `${APP_CRM_LINK}/biz-prop/login` (localhost) or `https://${sourceDomain}/biz-prop/login` (live).

**How to apply:** Vite's `server.open: true` opens `http://localhost:4000/` which falls outside the basename and renders nothing useful — always go to `/biz-prop/login` (or `/biz-prop/`). When writing internal links, navigate to paths *relative to the basename* (e.g. `navigate("/login")` resolves to `/biz-prop/login`). For raw `window.location.pathname` checks, use the full `/biz-prop/...` path because basename trimming applies to React Router only. Note: OAuth callbacks for Microsoft 365 (`customConfig.json`) and Google Gmail (`ConnectGmail.tsx`) still use `/crm/...` — those need portal-side reconfig before changing.
