# FRONTEND REVIEW RESULT — Cloud CRM (Community Hub)

**Ngày:** 2026-04-09
**Branch:** community-hub
**Checklist:** FRONTEND_REVIEW_CHECKLIST.md

---

## TỔNG QUAN

| Severity | Count |
|----------|:-----:|
| **CRITICAL** | 14 |
| **HIGH** | 18 |
| **MEDIUM** | 15 |
| **PASS** | 21 |

---

## 1. BẢO MẬT

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | eval() / new Function() | `PASS` | Không phát hiện |
| 2 | dangerouslySetInnerHTML qua DOMPurify | `PASS` | 2 chỗ dùng đều có DOMPurify.sanitize() |
| 3 | innerHTML trực tiếp | `MED` | 6 chỗ dùng innerHTML (editor.ts:231, BPM tooltip, Offer style tags) |
| 4 | Token lưu localStorage | `HIGH` | `access_token_athena`, permissions, user.root đều ở localStorage |
| 5 | Logout clear sạch | `HIGH` | Chỉ clear permissions + user.root khi 401. Còn sót SelectedRole, access_token_athena |
| 6 | **SIP password hardcode** | `CRIT` | Không tìm thấy trên nhánh này (đã kiểm tra CallCenter) |
| 7 | Firebase keys trong .env | `CRIT` | API key, VAPID key, project ID expose qua VITE_ vars |
| 8 | Serveo tunnel URL | `HIGH` | `.env:31` chứa serveo.net tunnel URL |
| 9 | CSP header | `HIGH` | Không có trong index.html hay nginx.conf |
| 10 | X-Frame-Options | `HIGH` | Nginx.conf thiếu security headers |
| 11 | CSRF token | `HIGH` | Không có CSRF protection |
| 12 | Permission check FE-only | `CRIT` | 126 files dùng getPermissions() từ localStorage |
| 13 | Hostname hardcode | `MED` | fetchConfig.ts:42 hardcode `kcn.reborn.vn` |

---

## 2. HIỆU NĂNG

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Code splitting | `PASS` | 187 React.lazy() trong routes.tsx |
| 2 | Lodash full import | `CRIT` | **65 files** `import _ from "lodash"` |
| 3 | moment.js vs date-fns | `HIGH` | 40 files dùng moment (67KB), chỉ 3 files dùng date-fns |
| 4 | Font loading | `PASS` | font-display: swap đúng cách |
| 5 | Component quá lớn | `CRIT` | Top: CustomerPersonList (71 useState), CustomerAndSupplier (56), ModalCustomPopup (51) |
| 6 | key={index} | `CRIT` | **597 instances** trong 250+ files |
| 7 | React.memo | `CRIT` | Chỉ **12/2,504** files dùng memo |
| 8 | Inline style={{}} | `HIGH` | **1,264 instances** trong 250+ files |
| 9 | AbortController | `CRIT` | **0 files** dùng AbortController (1,210 fetch calls) |
| 10 | Image lazy loading | `CRIT` | **0 instances** `loading="lazy"` |
| 11 | Debounce | `CRIT` | Chỉ 39 instances / 250+ files search |
| 12 | Timer cleanup | `CRIT` | 220 setTimeout/setInterval, chỉ 24% có cleanup |

---

## 3. CHẤT LƯỢNG CODE

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | strict: true | `PASS` | tsconfig.json bật strict mode |
| 2 | any type | `MED` | 41 instances `: any`. ESLint rule `no-explicit-any` bị TẮT |
| 3 | @ts-ignore | `PASS` | 0 instances |
| 4 | Empty catch blocks | `HIGH` | **52 instances** trong 12+ files |
| 5 | ErrorBoundary | `CRIT` | KHÔNG CÓ ErrorBoundary component |
| 6 | HTTP error handling | `HIGH` | Chỉ xử lý 401. Thiếu 403, 404, 500 |
| 7 | File quá lớn | `CRIT` | CreateCampaign: 5,477 dòng, CustomerPersonList: 3,827 dòng |
| 8 | Excessive useState | `CRIT` | 10 components có 40-71 useState |
| 9 | Commented-out code | `HIGH` | **2,280 instances** |
| 10 | Backup files | `MED` | 2 .bak files, 1 "old" directory |
| 11 | console.log | `MED` | 346 instances (nhưng drop_console: true trong prod build) |
| 12 | alert() | `HIGH` | **13 files** dùng alert() thay vì toast |
| 13 | ESLint exhaustive-deps | `HIGH` | Rule bị **TẮT** — stale closures risk |
| 14 | Husky pre-commit | `MED` | Có config nhưng hook bị comment/không chạy |

---

## 4. KIẾN TRÚC

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Cấu trúc thư mục | `PASS` | Feature-based, services tách biệt UI |
| 2 | API helper centralized | `PASS` | apiHelper.ts (apiGet, apiPost, apiPut, apiDelete) + fetchConfig interceptor |
| 3 | URL centralized | `PASS` | urls.ts tập trung endpoints |
| 4 | State management | `MED` | React Context only. Không có React Query/SWR cho server state |
| 5 | Form library | `HIGH` | KHÔNG CÓ form library. Manual useState cho mọi form |
| 6 | Retry/timeout | `HIGH` | Không có retry logic hay timeout config ở API layer |
| 7 | @types/react mismatch | `CRIT` | @types/react v17 vs React v18.3 |
| 8 | Duplicate libs | `MED` | moment + date-fns cùng tồn tại |

---

## 5. UI/UX & ACCESSIBILITY

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | img alt text | `HIGH` | **112/558** images thiếu alt (20%) |
| 2 | outline: none | `CRIT` | **301 instances** — keyboard navigation bị phá |
| 3 | div onClick | `MED` | 13 instances — nên dùng `<button>` |
| 4 | Semantic HTML | `HIGH` | 0 `<nav>`, 0 `<main>`, 0 `<header>`, 0 `<footer>`. Chỉ 17 files dùng `<section>` |

---

## 6. TESTING

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Test files | `CRIT` | **0 test files** trong toàn bộ src/ |
| 2 | Test framework | `CRIT` | Không có jest, vitest, cypress, playwright |
| 3 | CI chạy test | `CRIT` | Không có CI/CD pipeline |

---

## 7. i18n

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | i18next configured | `PASS` | i18n.ts setup đúng, vi.ts (682 dòng), en.ts (680 dòng) |
| 2 | Hardcoded text | `CRIT` | ~47,558 Vietnamese strings không dùng t() |
| 3 | Date/currency locale | `MED` | Hardcode DD/MM/yyyy, một số chỗ dùng Intl hardcode "vi-VN" |

---

## 8. SEO

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Meta tags | `MED` | Chỉ charset + viewport. Thiếu description, OG tags |
| 2 | Dynamic title | `PASS` | document.title set ở nhiều pages |

> SEO priority thấp cho B2B CRM.

---

## 9. DevOps & CI/CD

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Prettier | `PASS` | .prettierrc.json configured |
| 2 | Vite prod optimizations | `PASS` | drop_console, drop_debugger, terser minify, sourcemap false |
| 3 | CI/CD pipeline | `CRIT` | KHÔNG CÓ (.github/workflows, Jenkinsfile, gitlab-ci) |
| 4 | Error tracking | `HIGH` | KHÔNG CÓ Sentry hay tương đương |
| 5 | Nginx security headers | `HIGH` | Thiếu CSP, X-Frame-Options, X-Content-Type-Options, HSTS |

---

## 10. GIT

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Commit messages | `HIGH` | "Fix", "NL", "D", "Fix lai loi" — không convention |
| 2 | Branch naming | `MED` | 50 branches, naming không nhất quán |
| 3 | .gitignore | `PASS` | Đầy đủ: node_modules, dist, .env, .vscode |

---

## TOP 10 ƯU TIÊN FIX

### Nhóm 1 — Fix ngay

| # | Việc | Severity | Effort |
|---|------|----------|--------|
| 1 | Thêm **ErrorBoundary** component, wrap App root | CRITICAL | Thấp |
| 2 | Bật ESLint: `exhaustive-deps: "warn"`, `no-explicit-any: "warn"` | CRITICAL | Thấp |
| 3 | Thay 13 file **alert()** → showToast | HIGH | Thấp |
| 4 | Install husky, kích hoạt pre-commit hook | HIGH | Thấp |

### Nhóm 2 — Fix sớm (1-2 tuần)

| # | Việc | Severity | Effort |
|---|------|----------|--------|
| 5 | Migrate **moment → date-fns** (40 files) | HIGH | Trung bình |
| 6 | Fix **lodash full import** (65 files) → import cụ thể | CRITICAL | Trung bình |
| 7 | Thêm `loading="lazy"` cho img tags | CRITICAL | Thấp |
| 8 | Fix **@types/react** v17 → v18 | CRITICAL | Thấp |

### Nhóm 3 — Cải tiến dài hạn

| # | Việc | Severity | Effort |
|---|------|----------|--------|
| 9 | Setup **testing** (Vitest + RTL) | CRITICAL | Cao |
| 10 | Setup **CI/CD** pipeline | CRITICAL | Cao |

### Nhóm BE/DevOps (ngoài scope FE)

| Việc | Ai |
|------|-----|
| Chuyển token sang HTTP-only cookie | BE |
| CSP + CSRF + security headers | DevOps + BE |
| Server-side permission validation | BE |
| Sentry error tracking | DevOps |
| Nginx security headers | DevOps |

---

*Review by Claude Code — 2026-04-09*
*Branch: community-hub*
