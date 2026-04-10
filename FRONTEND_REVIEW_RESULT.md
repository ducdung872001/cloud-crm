# FRONTEND REVIEW RESULT — Cloud CRM (Community Hub)

**Ngay:** 2026-04-09
**Branch:** community-hub
**Checklist:** FRONTEND_REVIEW_CHECKLIST.md

---

## TONG QUAN

| Severity | Count |
|----------|:-----:|
| **CRITICAL** | 14 |
| **HIGH** | 18 |
| **MEDIUM** | 15 |

---

## 1. BAO MAT

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 2 | Token luu localStorage | `HIGH` | `access_token_athena`, permissions, user.root deu o localStorage |
| 3 | Logout clear sach | `HIGH` | Chi clear permissions + user.root khi 401. Con sot SelectedRole, access_token_athena |
| 4 | Firebase keys trong .env | `CRIT` | API key, VAPID key, project ID expose qua VITE_ vars |
| 5 | Serveo tunnel URL | `HIGH` | `.env:31` chua serveo.net tunnel URL |
| 6 | CSP header | `HIGH` | Khong co trong index.html hay nginx.conf |
| 7 | X-Frame-Options | `HIGH` | Nginx.conf thieu security headers |
| 8 | CSRF token | `HIGH` | Khong co CSRF protection |
| 9 | Permission check FE-only | `CRIT` | 126 files dung getPermissions() tu localStorage |
| 10 | Hostname hardcode | `MED` | fetchConfig.ts:42 hardcode `kcn.reborn.vn` |

---

## 2. HIEU NANG

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 3 | Component qua lon | `CRIT` | Top: CustomerPersonList (71 useState), CustomerAndSupplier (56), ModalCustomPopup (51) |
| 4 | key={index} | `CRIT` | **597 instances** trong 250+ files |
| 5 | React.memo | `CRIT` | Chi **12/2,504** files dung memo |
| 6 | Inline style={{}} | `HIGH` | **1,264 instances** trong 250+ files |
| 7 | AbortController | `CRIT` | **0 files** dung AbortController (1,210 fetch calls) |
| 8 | Image lazy loading | `CRIT` | **0 instances** `loading="lazy"` |
| 9 | Debounce | `CRIT` | Chi 39 instances / 250+ files search |
| 10 | Timer cleanup | `CRIT` | 220 setTimeout/setInterval, chi 24% co cleanup |

---

## 3. CHAT LUONG CODE

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 1 | any type | `MED` | 41 instances `: any`. ESLint rule `no-explicit-any` bi TAT |
| 2 | Empty catch blocks | `HIGH` | **52 instances** trong 12+ files |
| 3 | ErrorBoundary | `CRIT` | KHONG CO ErrorBoundary component |
| 4 | HTTP error handling | `HIGH` | Chi xu ly 401. Thieu 403, 404, 500 |
| 5 | File qua lon | `CRIT` | CreateCampaign: 5,477 dong, CustomerPersonList: 3,827 dong |
| 6 | Excessive useState | `CRIT` | 10 components co 40-71 useState |
| 7 | Commented-out code | `HIGH` | **2,280 instances** |
| 8 | Backup files | `MED` | 2 .bak files, 1 "old" directory |
| 9 | console.log | `MED` | 346 instances (nhung drop_console: true trong prod build) |
| 10 | alert() | `HIGH` | **13 files** dung alert() thay vi toast |
| 11 | ESLint exhaustive-deps | `HIGH` | Rule bi **TAT** — stale closures risk |
| 12 | Husky pre-commit | `MED` | Co config nhung hook bi comment/khong chay |

---

## 4. KIEN TRUC

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 1 | State management | `MED` | React Context only. Khong co React Query/SWR cho server state |
| 2 | Form library | `HIGH` | KHONG CO form library. Manual useState cho moi form |
| 3 | Retry/timeout | `HIGH` | Khong co retry logic hay timeout config o API layer |
| 4 | @types/react mismatch | `CRIT` | @types/react v17 vs React v18.3 |
| 5 | Duplicate libs | `MED` | moment + date-fns cung ton tai |

---

## 5. UI/UX & ACCESSIBILITY

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 1 | img alt text | `HIGH` | **112/558** images thieu alt (20%) |
| 2 | outline: none | `CRIT` | **301 instances** — keyboard navigation bi pha |
| 3 | div onClick | `MED` | 13 instances — nen dung `<button>` |
| 4 | Semantic HTML | `HIGH` | 0 `<nav>`, 0 `<main>`, 0 `<header>`, 0 `<footer>`. Chi 17 files dung `<section>` |

---

## 6. TESTING

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 1 | Test files | `CRIT` | **0 test files** trong toan bo src/ |
| 2 | Test framework | `CRIT` | Khong co jest, vitest, cypress, playwright |
| 3 | CI chay test | `CRIT` | Khong co CI/CD pipeline |

---

## 7. i18n

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 1 | Hardcoded text | `CRIT` | ~47,558 Vietnamese strings khong dung t() |
| 2 | Date/currency locale | `MED` | Hardcode DD/MM/yyyy, mot so cho dung Intl hardcode "vi-VN" |

---

## 8. SEO

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 1 | Meta tags | `MED` | Chi charset + viewport. Thieu description, OG tags |

> SEO priority thap cho B2B CRM.

---

## 9. DevOps & CI/CD

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 1 | CI/CD pipeline | `CRIT` | KHONG CO (.github/workflows, Jenkinsfile, gitlab-ci) |
| 2 | Error tracking | `HIGH` | KHONG CO Sentry hay tuong duong |
| 3 | Nginx security headers | `HIGH` | Thieu CSP, X-Frame-Options, X-Content-Type-Options, HSTS |

---

## 10. GIT

| # | Item | Status | Chi tiet |
|---|------|:------:|----------|
| 1 | Commit messages | `HIGH` | "Fix", "NL", "D", "Fix lai loi" — khong convention |
| 2 | Branch naming | `MED` | 50 branches, naming khong nhat quan |

---

## TOP 10 UU TIEN FIX

### Nhom 1 — Fix ngay

| # | Viec | Severity | Effort |
|---|------|----------|--------|
| 1 | Them **ErrorBoundary** component, wrap App root | CRITICAL | Thap |
| 2 | Bat ESLint: `exhaustive-deps: "warn"`, `no-explicit-any: "warn"` | CRITICAL | Thap |
| 3 | Thay 13 file **alert()** -> showToast | HIGH | Thap |
| 4 | Install husky, kich hoat pre-commit hook | HIGH | Thap |

### Nhom 2 — Fix som (1-2 tuan)

| # | Viec | Severity | Effort |
|---|------|----------|--------|
| 5 | Migrate **moment -> date-fns** (40 files) | HIGH | Trung binh |
| 6 | Fix **lodash full import** (65 files) -> import cu the | CRITICAL | Trung binh |
| 7 | Them `loading="lazy"` cho img tags | CRITICAL | Thap |
| 8 | Fix **@types/react** v17 -> v18 | CRITICAL | Thap |

### Nhom 3 — Cai tien dai han

| # | Viec | Severity | Effort |
|---|------|----------|--------|
| 9 | Setup **testing** (Vitest + RTL) | CRITICAL | Cao |
| 10 | Setup **CI/CD** pipeline | CRITICAL | Cao |

### Nhom BE/DevOps (ngoai scope FE)

| Viec | Ai |
|------|-----|
| Chuyen token sang HTTP-only cookie | BE |
| CSP + CSRF + security headers | DevOps + BE |
| Server-side permission validation | BE |
| Sentry error tracking | DevOps |
| Nginx security headers | DevOps |

---

*Review by Claude Code — 2026-04-09*
*Branch: community-hub*
