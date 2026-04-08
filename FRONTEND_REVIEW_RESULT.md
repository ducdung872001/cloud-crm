# FRONTEND REVIEW RESULT — Cloud CRM

**Dự án:** cloud-crm (React 18.3 + TypeScript + Vite 7.1)
**Ngày review:** 2026-04-08
**Branch:** community-hub
**Checklist áp dụng:** FRONTEND_REVIEW_CHECKLIST.md
**Tổng files phân tích:** ~2,471 TS/TSX + ~1,386 SCSS

> **Ký hiệu:** `[x]` = PASS | `[!]` = CẦN FIX | `[-]` = KHÔNG ÁP DỤNG | `[~]` = ĐÃ FIX 1 PHẦN

---

## 1. BẢO MẬT (Security)

### 1.1 Injection & XSS

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Không dùng `eval()`, `new Function()` | `[x]` | Đã fix trước đó — không còn eval/Function trong code active |
| 2 | `dangerouslySetInnerHTML` qua DOMPurify | `[x]` | 2 chỗ dùng đều có `DOMPurify.sanitize()` (PreviewProduct.tsx:100, WarehouseReportSlowView.tsx:299) |
| 3 | User input không nối trực tiếp vào HTML/URL | `[x]` | Không phát hiện injection trực tiếp |
| 4 | URL từ user được validate scheme | `[~]` | Không có validate scheme rõ ràng cho URL dynamic |
| 5 | Không dùng `innerHTML` trực tiếp | `[x]` | Không phát hiện |
| 6 | Query params encode đúng | `[x]` | Dùng `URLSearchParams` đúng cách |

### 1.2 Authentication & Token

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 7 | Access token KHÔNG ở localStorage | `[!]` | **CRITICAL** — `access_token_athena` lưu localStorage (header.tsx:148). Cần chuyển sang HTTP-only cookie |
| 8 | Refresh token flow | `[~]` | Có refresh logic nhưng token vẫn ở client-accessible storage |
| 9 | Token hết hạn → redirect login | `[x]` | fetchConfig.ts:74 xử lý 401 → clear token → redirect |
| 10 | Logout xóa sạch | `[x]` | header.tsx:154-173 clear localStorage, cookie, redirect login |
| 11 | Không log token ra console | `[x]` | Không phát hiện token leak qua console |

### 1.3 Secrets & Credentials

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 12 | Không hardcode API key/secret | `[!]` | **CRITICAL** — SIP password hardcode plaintext (ListCustomer/index.tsx:301): `B44pW9dkW9G9X1dGPo6vcnYFgDES9eDR` |
| 13 | .env trong .gitignore | `[x]` | .gitignore có `.env` và `.env.*` |
| 14 | VITE\_ vars chỉ chứa public key | `[!]` | `VITE_OMNICXM_KEY` chứa secret key `10a3792393a2056d8e657df43dd30d64` — nên chuyển sang server-side |
| 15 | Firebase config chỉ public keys | `[~]` | API key, VAPID key là public-facing nhưng nên restrict domain trong Firebase Console |
| 16 | Không có email/IP nội bộ/tunnel URL | `[!]` | Serveo tunnel URL trong .env files; Google OAuth hardcode `localhost:4000` redirect (ConnectGmail.tsx:10) |

### 1.4 HTTP Security

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 17 | CSP header | `[!]` | **HIGH** — Không có CSP header trong index.html hay nginx.conf |
| 18 | X-Frame-Options | `[!]` | **HIGH** — Không có. nginx.conf thiếu security headers |
| 19 | CSRF token | `[!]` | **HIGH** — Không có CSRF token trong bất kỳ request nào |
| 20 | External scripts có SRI | `[~]` | Không có external CDN scripts hiện tại (tốt), nhưng nếu thêm thì cần SRI |
| 21 | API calls dùng HTTPS | `[x]` | Mọi production URL dùng HTTPS |
| 22 | CORS không phải wildcard | `[-]` | Server-side config, ngoài scope FE review |

### 1.5 Authorization

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 23 | Permission check cả server | `[!]` | **CRITICAL** — Permissions chỉ check localStorage FE-only (utils/common.ts:188). DevTools có thể sửa |
| 24 | Không dùng localStorage làm auth gate duy nhất | `[!]` | Role + Permission đều từ localStorage. FE là UX, không phải security |
| 25 | Route guard chặn trang không quyền | `[~]` | Có route guard nhưng dựa trên localStorage permissions |

### 1.6 Sensitive Data

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 26 | PII được mask | `[~]` | Không có mask SĐT/CMND rõ ràng khi hiển thị |
| 27 | Không cache sensitive data vào storage | `[!]` | Permissions, role, user data đều ở localStorage |
| 28 | Console không log PII | `[x]` | Không phát hiện |

### Tóm tắt Section 1

| Severity | Số lượng |
|----------|:--------:|
| CRITICAL | 3 (token localStorage, SIP password, FE-only permission) |
| HIGH | 3 (CSP, X-Frame-Options, CSRF) |
| MEDIUM | 4 |
| PASS | 11 |

---

## 2. HIỆU NĂNG (Performance)

### 2.1 Bundle & Loading

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Route-level code splitting | `[x]` | 172 routes dùng `React.lazy()` + Suspense (routes.tsx) |
| 2 | Dynamic import cho lib nặng | `[~]` | Có chunk splitting trong vite.config.ts nhưng chưa triệt để |
| 3 | Tree-shaking — không import toàn bộ lib | `[!]` | **HIGH** — 65 files vẫn `import _ from "lodash"` thay vì import cụ thể |
| 4 | Không dùng lib quá nặng | `[!]` | **HIGH** — `moment.js` (300KB) vẫn dùng ở 40 files, dù `date-fns` đã có |
| 5 | Bundle analyzer đã chạy | `[~]` | Có chunk config nhưng không có report gần đây |
| 6 | Font loading strategy | `[x]` | `font-display: swap` đúng cách (\_typography.scss) |

### 2.2 Rendering

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 7 | Component lớn được tách | `[!]` | **CRITICAL** — 6 files >2,000 dòng: CustomerPersonList (3,827), CreateCampaign (5,477), FilterComponent (3,304) |
| 8 | React.memo dùng đúng chỗ | `[!]` | **HIGH** — Chỉ 12 lần dùng memo trong toàn bộ 2,471 files |
| 9 | key dùng unique ID | `[!]` | **HIGH** — 403 chỗ dùng `key={index}` / `key={i}` / `key={idx}` trong 250 files |
| 10 | Không JSON.stringify trong render | `[~]` | 61 instances trong 41 files — giảm so với trước nhưng vẫn còn |
| 11 | Inline object/function extract ra ngoài | `[!]` | **HIGH** — 1,334 inline `style={{ }}` trong 250+ files |
| 12 | Virtualized list cho danh sách lớn | `[~]` | ag-grid có built-in virtualization. Không có react-window/react-virtuoso cho list thường |
| 13 | useEffect dependency chính xác | `[!]` | ESLint rule `react-hooks/exhaustive-deps` bị **TẮT** (.eslintrc.json) |

### 2.3 Network & Data

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 14 | API calls có AbortController | `[!]` | **CRITICAL** — Chỉ 12/2,471 files dùng AbortController. Hầu hết fetch không cancel khi unmount |
| 15 | Không gọi API trùng lặp | `[~]` | Không có React Query/SWR — dễ bị duplicate calls |
| 16 | Cache cho data ít thay đổi | `[!]` | Không có caching layer (React Query/SWR) — mọi navigate đều fetch lại |
| 17 | Pagination cho danh sách lớn | `[x]` | Có pagination nhất quán qua DataPaginationDefault |
| 18 | Debounce cho search/resize | `[~]` | Chỉ 39 chỗ dùng debounce — nhiều search input chưa có |
| 19 | Image `loading="lazy"` | `[!]` | **HIGH** — 0 instance `loading="lazy"` trên img tags |
| 20 | Image optimize (WebP, srcset) | `[!]` | Không dùng WebP/AVIF, không có srcset responsive |
| 21 | Idempotency key cho API mutation | `[~]` | Vừa thêm `requestId` cho debt/pay. Chưa có cho các mutation khác |

### 2.4 Memory

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 22 | useEffect có cleanup | `[!]` | **HIGH** — Nhiều useEffect thiếu cleanup, đặc biệt API calls |
| 23 | EventListener được remove | `[!]` | 40+ addEventListener patterns, một số thiếu removeEventListener (components/hooks/index.ts: resize handler) |
| 24 | setInterval/setTimeout có clear | `[!]` | **HIGH** — 270 timer instances trong 137 files, không đảm bảo cleanup |
| 25 | WebSocket connection đóng đúng | `[~]` | 2 files dùng WebSocket (CallCenter, SocialCrmZalo) — cần verify cleanup |

### Tóm tắt Section 2

| Severity | Số lượng |
|----------|:--------:|
| CRITICAL | 2 (component khổng lồ, thiếu AbortController) |
| HIGH | 7 (lodash, moment, memo, key index, inline style, image lazy, timer cleanup) |
| MEDIUM | 7 |
| PASS | 3 |

---

## 3. CHẤT LƯỢNG CODE (Code Quality)

### 3.1 TypeScript / Type Safety

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | `strict: true` trong tsconfig | `[x]` | Đã bật strict mode |
| 2 | Không dùng `any` | `[x]` | ~41 instances nhưng hầu hết trong code bị comment — code active gần như sạch |
| 3 | API response có type rõ ràng | `[x]` | Interface/Type cho request/response ở các service files |
| 4 | Không `@ts-ignore` / `@ts-nocheck` | `[x]` | Không phát hiện |
| 5 | Enum/union cho giá trị cố định | `[~]` | Có dùng nhưng chưa nhất quán — một số dùng magic string |
| 6 | Type assertion có comment | `[~]` | Một số `as Type` không có giải thích |

### 3.2 Error Handling

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 7 | Không empty catch block | `[!]` | **HIGH** — 20+ empty catch blocks (App.tsx:142, GridAgTable.tsx, ReceiptModal, CareAutomationPage...) + 15 `.catch(() => {})` |
| 8 | API error xử lý cụ thể (401/403/500) | `[!]` | Chỉ xử lý 401 (fetchConfig.ts:74). **Thiếu** 403, 404, 500 handling |
| 9 | Error Boundary | `[!]` | **HIGH** — Không có ErrorBoundary component nào trong project |
| 10 | Form validation inline | `[~]` | Có validation nhưng không dùng form library — manual và inconsistent |
| 11 | Loading/error state cho async | `[~]` | Hầu hết có loading state, nhưng error state chưa đồng nhất |
| 12 | Toast/notification cho kết quả | `[x]` | react-toastify + showToast helper dùng tốt |

### 3.3 Code Organization

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 13 | File không quá 400 dòng | `[!]` | **CRITICAL** — 6+ files >2,000 dòng: CreateCampaign.tsx (5,477), CustomerPersonList.tsx (3,827), urls.ts (3,757), FilterComponent.tsx (3,304) |
| 14 | Component không quá 15 useState | `[!]` | **CRITICAL** — CustomerPersonList: 71 useState, CustomerAndSupplier: 55, ModalCustomPopup: 51, AddEditSendEmail: 48 |
| 15 | Custom hook cho logic tái sử dụng | `[~]` | Có /hooks/ nhưng nhiều logic vẫn duplicate giữa pages |
| 16 | Naming file/folder nhất quán | `[!]` | Mixed: `/components/input` (lowercase) vs `/components/ButtonComponent` (PascalCase) |
| 17 | Không code comment-out | `[!]` | **HIGH** — 1,492 instances commented-out code (// const, // let, // function, // if) |
| 18 | Không file backup | `[x]` | Đã dọn — không còn \_old, Backup, copy files |
| 19 | Import order nhất quán | `[!]` | Không có rule import order. Inconsistent across files |

### 3.4 Naming & Readability

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 20 | Tên biến rõ nghĩa | `[~]` | Phần lớn OK nhưng có style variable dài: `style_fontSize_fontWeight_marginLeft` |
| 21 | Boolean prefix is/has/should | `[x]` | Tuân thủ tốt: isLogin, isLoading, hasError, isChecking |
| 22 | Handler prefix handle/on | `[x]` | handlePay, handleSubmit, onClose — nhất quán |
| 23 | Constant UPPER_SNAKE_CASE | `[~]` | Chưa nhất quán — nhiều constant dùng camelCase |
| 24 | Không magic number | `[!]` | Hardcoded RGB colors, timeout values (5000), numeric thresholds không có tên |
| 25 | Comment giải thích why | `[~]` | Ít comment nói chung — cần thêm ở logic phức tạp |

### 3.5 Console & Debug

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 26 | Không console.log production | `[~]` | Source code còn ~488 statements NHƯNG vite.config bật `drop_console: true` khi build — production sạch |
| 27 | Không debugger | `[x]` | `drop_debugger: true` trong vite.config + không có active debugger |
| 28 | Không alert() | `[!]` | **14 alert() calls** trong production code: image upload, BPM, CampaignManagement, CustomerReview, MultiChannelSales, ReturnProduct, ContentTemplate |
| 29 | TODO/FIXME có ticket number | `[~]` | Một số TODO có context nhưng không có ticket/issue number |

### Tóm tắt Section 3

| Severity | Số lượng |
|----------|:--------:|
| CRITICAL | 2 (file/component quá lớn, excessive useState) |
| HIGH | 4 (empty catch, Error Boundary, commented-out code, alert()) |
| MEDIUM | 9 |
| PASS | 8 |

---

## 4. KIẾN TRÚC & MAINTAINABILITY

### 4.1 Project Structure

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Cấu trúc thư mục rõ ràng | `[x]` | Feature-based: /pages/ (165 modules), /components/ (74 shared), /services/ (258), /utils/, /configs/ |
| 2 | Shared components tách riêng | `[x]` | /components/ cho shared, pages chứa page-specific |
| 3 | Service/API layer tách biệt | `[x]` | /services/ + apiHelper.ts. Component không gọi fetch trực tiếp (hầu hết) |
| 4 | Config tập trung | `[~]` | urls.ts tập trung URL. Nhưng một số hardcode trong template (webform.js: `cloud.reborn.vn`) |
| 5 | Type/interface tổ chức tốt | `[x]` | /model/ với subdirectories theo domain |

### 4.2 State Management

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 6 | Chiến lược state rõ ràng | `[!]` | Không có server state management. 14,333 useState calls — quá phụ thuộc local state |
| 7 | Global state chỉ chứa data global | `[~]` | 4 Context (Auth, UI, Call, User) — UserContext vẫn quá lớn |
| 8 | Context tách theo domain | `[x]` | Đã tách: AuthContext, UIContext, CallContext (fix trước đó) |
| 9 | Server state dùng React Query/SWR | `[!]` | **HIGH** — Không có. Mọi API state quản lý bằng useState + useEffect thủ công |
| 10 | Form state dùng form library | `[!]` | **HIGH** — Không có form library. 25+ validation functions duplicate manual |

### 4.3 API Layer

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 11 | Base API client xử lý chung | `[x]` | apiHelper.ts (apiGet, apiPost, apiPut, apiDelete) + fetchConfig.ts interceptor |
| 12 | Không duplicate fetch pattern | `[~]` | apiHelper giảm ~80% duplication. Nhưng ~20 files vẫn dùng fetch trực tiếp |
| 13 | API URL tập trung, dùng env | `[~]` | urls.ts tập trung. Nhưng hostname hardcode `kcn.reborn.vn` (fetchConfig.ts:42) và webform URLs |
| 14 | Request/Response types mỗi endpoint | `[x]` | Interface define ở service files |
| 15 | Retry logic + backoff | `[!]` | Không có retry logic hay exponential backoff |
| 16 | Timeout config | `[~]` | AbortSignal hỗ trợ nhưng không có default timeout |

### 4.4 Reusability & DRY

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 17 | Validation tập trung | `[!]` | 4 file validation: validate.ts, makeValidateField.ts, validateInputRule.ts + 1 bản copy trong BPM |
| 18 | Format functions shared | `[~]` | formatCurrency, formatDate ở utils nhưng cũng có scattered copies |
| 19 | UI patterns extract thành component | `[~]` | 3 table components (boxTable, boxTableAdvanced, boxTableBusinessRule) — nên consolidate |
| 20 | Không 3+ file logic giống nhau | `[!]` | Modal patterns duplicate, validation duplicate, date formatting duplicate |

### 4.5 Dependencies

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 21 | Không unused dependency | `[~]` | Cần audit — 104 direct dependencies là nhiều |
| 22 | Không 2 lib cùng chức năng | `[!]` | **moment + date-fns** (cùng date handling), **react-color + react-colorful** (cùng color picker), **react-datepicker + react-big-calendar** |
| 23 | Deps update, không vulnerability | `[~]` | Cần chạy `npm audit` |
| 24 | Lock file committed | `[x]` | yarn.lock có trong repo |
| 25 | dependencies vs devDependencies đúng | `[!]` | `@types/react`: "^17.0.37" **MISMATCH** React 18.3.1. `@types/react-dom`: "^17.0.11" **MISMATCH** |

### Tóm tắt Section 4

| Severity | Số lượng |
|----------|:--------:|
| CRITICAL | 0 |
| HIGH | 3 (React Query/SWR, form library, duplicate libs) |
| MEDIUM | 9 |
| PASS | 7 |

---

## 5. UI/UX & ACCESSIBILITY

### 5.1 Responsive & Cross-browser

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Layout responsive | `[~]` | Có responsive cho một số trang nhưng chưa kiểm tra toàn diện |
| 2 | Không horizontal scroll bất ngờ | `[~]` | Cần test manual |
| 3 | Cross-browser test | `[-]` | Ngoài scope automated review |
| 4 | Touch target ≥ 44x44px | `[~]` | Cần audit manual |
| 5 | Font size dùng rem | `[~]` | Mix px và rem — chưa nhất quán |

### 5.2 Accessibility (a11y)

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 6 | `<img>` có alt text | `[!]` | **HIGH** — 20+ img tags thiếu `alt` (attachmentUpload, editor Image/Video, BPM modals, AdjustmentSlip) |
| 7 | Form input có label | `[~]` | Hầu hết OK nhưng cần audit kỹ hơn |
| 8 | Button/link có text rõ nghĩa | `[~]` | Phần lớn có text, icon-only buttons cần kiểm tra aria-label |
| 9 | Semantic HTML | `[!]` | **HIGH** — Chỉ ~10 files dùng `<nav>`, `<main>`, `<section>`. Phần lớn dùng `<div>` |
| 10 | Không dùng `<div onClick>` | `[!]` | 6 instances dùng `<div onClick>` thay vì `<button>` (BPM UploadDocument, SocialCrmZalo, CounterSales, MembershipClass, Webhook) |
| 11 | Color contrast đủ | `[-]` | Cần Lighthouse audit |
| 12 | Focus visible | `[!]` | **CRITICAL** — 30+ chỗ `outline: none` / `outline: 0` KHÔNG CÓ thay thế. Đặc biệt `_common.scss: outline: 0 !important;` ảnh hưởng toàn bộ app |
| 13 | Tab order hợp lý | `[~]` | Cần manual test |
| 14 | aria-live cho dynamic content | `[!]` | Không tìm thấy `aria-live` — toast, loading, error không announce cho screen reader |
| 15 | Heading hierarchy đúng | `[~]` | Cần manual audit |

### 5.3 UX Patterns

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 16 | Loading state cho async | `[x]` | Hầu hết có loading spinner/skeleton |
| 17 | Empty state khi list trống | `[~]` | Một số trang có, không nhất quán |
| 18 | Confirm dialog cho destructive action | `[x]` | Có DeleteHandler component |
| 19 | Unsaved changes warning | `[!]` | Không có — navigate away mất data form |
| 20 | Double-click prevention | `[x]` | `disabled={submitting}` pattern dùng khá nhất quán |
| 21 | Error message dễ hiểu | `[~]` | Hầu hết OK, nhưng 14 chỗ dùng `alert()` raw |
| 22 | Optimistic UI | `[-]` | Chưa implement — không bắt buộc |

### Tóm tắt Section 5

| Severity | Số lượng |
|----------|:--------:|
| CRITICAL | 1 (focus outline bị remove toàn app) |
| HIGH | 3 (img alt, semantic HTML, div onClick) |
| MEDIUM | 7 |
| PASS | 4 |

---

## 6. TESTING

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Utility functions có unit test | `[!]` | **CRITICAL** — KHÔNG CÓ bất kỳ test file nào (0 .test.ts, 0 .spec.ts, 0 __tests__/) |
| 2 | Custom hooks có test | `[!]` | KHÔNG CÓ |
| 3 | Business logic có test | `[!]` | KHÔNG CÓ |
| 4 | Edge cases tested | `[!]` | KHÔNG CÓ |
| 5 | Shared components có test | `[!]` | KHÔNG CÓ |
| 6 | Form component test | `[!]` | KHÔNG CÓ |
| 7 | Conditional rendering test | `[!]` | KHÔNG CÓ |
| 8 | Critical flows có E2E | `[!]` | KHÔNG CÓ |
| 9 | API integration test | `[!]` | KHÔNG CÓ |
| 10 | CI chạy test tự động | `[!]` | KHÔNG CÓ CI/CD pipeline |

> **Kết luận Section 6: CRITICAL** — Dự án có 2,471 source files và **0 tests**. Không có test framework, không có test config, không có CI chạy test. Đây là rủi ro lớn nhất của dự án.

---

## 7. INTERNATIONALIZATION (i18n)

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Text dùng i18n key, không hardcode | `[!]` | **CRITICAL** — ~4,300 hardcoded Vietnamese strings trong components, không qua `t()` |
| 2 | Date/time format theo locale | `[!]` | Hardcode `DD/MM/yyyy` format (795+ chỗ). Không dùng Intl.DateTimeFormat |
| 3 | Currency format theo locale | `[~]` | Một số chỗ dùng `Intl.NumberFormat("vi-VN")` hardcode |
| 4 | Pluralization | `[-]` | Tiếng Việt không cần plural rules phức tạp |
| 5 | RTL support | `[-]` | Không cần cho market VN |
| 6 | Translation file không thiếu key | `[~]` | vi.ts (657 dòng) và en.ts (656 dòng) gần bằng nhau — cần verify missing keys |
| 7 | Không nối string tạo câu | `[!]` | Có string concatenation cho sentences (cashbook export, report titles) |

### Tóm tắt Section 7

> i18next đã setup đúng cách nhưng adoption rate rất thấp. 4,300+ strings chưa localize.

---

## 8. SEO & META

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Mỗi trang có title/description | `[!]` | Chỉ 1 static title trong index.html. Không dynamic title per page |
| 2 | Open Graph tags | `[!]` | Không có OG tags |
| 3 | Canonical URL | `[!]` | Không có |
| 4 | Structured data | `[-]` | B2B CRM — không cần |
| 5 | Sitemap / robots.txt | `[-]` | B2B CRM — không cần |
| 6 | Trang crawl được | `[-]` | SPA client-side — B2B nên không cần SEO |

> **Kết luận Section 8:** SEO priority thấp cho B2B CRM. Nhưng nên thêm dynamic `<title>` per page cho UX (user nhìn tab browser).

---

## 9. DevOps & CI/CD

### 9.1 Build & Deploy

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Build production không warning | `[~]` | Cần verify — console drop configured |
| 2 | Env vars khác nhau dev/staging/prod | `[x]` | Có .env.dev, .env.staging, .env.prod |
| 3 | Source map không expose production | `[x]` | vite.config: không generate source map cho production |
| 4 | Assets có content hash | `[x]` | Vite default behavior — hash trong filename |
| 5 | Gzip/Brotli compression | `[~]` | nginx.conf không có gzip config rõ ràng |

### 9.2 Code Quality Gates

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 6 | ESLint/Prettier trong CI | `[!]` | **CRITICAL** — Không có CI/CD pipeline. Không có `.github/workflows`, không Jenkinsfile, không GitLab CI |
| 7 | TypeScript compile check CI | `[!]` | Không có CI |
| 8 | Pre-commit hook (husky) | `[!]` | **HIGH** — Husky configured trong package.json NHƯNG `.husky/` directory KHÔNG TỒN TẠI. Hooks chưa được install |
| 9 | PR template | `[!]` | Không có PR template |
| 10 | Branch protection | `[~]` | Cần verify trên Git server |

### 9.3 Monitoring & Error Tracking

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 11 | Error tracking (Sentry) | `[!]` | **HIGH** — Không có error tracking service |
| 12 | Source map upload cho tracking | `[-]` | Không có tracking service |
| 13 | Performance monitoring (CWV) | `[!]` | Không có Web Vitals monitoring |
| 14 | Alert khi error rate tăng | `[!]` | Không có alerting |

### Tóm tắt Section 9

| Severity | Số lượng |
|----------|:--------:|
| CRITICAL | 1 (không có CI/CD) |
| HIGH | 2 (husky broken, không error tracking) |
| MEDIUM | 3 |
| PASS | 4 |

---

## 10. GIT & WORKFLOW

| # | Item | Status | Chi tiết |
|---|------|:------:|----------|
| 1 | Commit message convention | `[!]` | **Kém** — "Fix", "Fixbug", "D", "HC", "NL" — không theo Conventional Commits |
| 2 | Branch naming nhất quán | `[!]` | Mix: `bach1`, `chau`, `chu`, `hieu-retail`, `huy-retail2`, `to-merge` — không convention |
| 3 | PR size hợp lý | `[~]` | Cần verify — không có PR template enforce |
| 4 | PR description đầy đủ | `[~]` | Không có template |
| 5 | Không commit file generated | `[x]` | .gitignore đầy đủ: node_modules, dist, .env |
| 6 | .gitignore đúng | `[x]` | Tốt — bao gồm cả .env.*, node_modules, dist, .vscode, .DS_Store |
| 7 | Không force push shared branch | `[~]` | Cần branch protection verify |

---

## ESLint Config Issues

Cần đặc biệt lưu ý — 2 rules quan trọng bị TẮT:

```json
// .eslintrc.json
"react-hooks/exhaustive-deps": "off"     // ← NGUY HIỂM: stale closures, infinite loops
"@typescript-eslint/no-explicit-any": "off"  // ← Cho phép any type
```

**Khuyến nghị:** Bật lại cả 2 rules và fix dần.

---

## TỔNG HỢP TOÀN DỰ ÁN

### Theo severity

| Severity | Count | Chi tiết |
|----------|:-----:|----------|
| **CRITICAL** | **11** | Token localStorage, SIP password hardcode, FE-only permission, component khổng lồ, AbortController thiếu, focus outline bị xóa, 0 tests, 4,300 hardcoded strings, CI/CD không có, excessive useState |
| **HIGH** | **22** | CSP, CSRF, X-Frame, lodash full import, moment.js, React.memo thiếu, key={index}, inline style, image lazy, timer cleanup, empty catch, Error Boundary, commented-out code, alert(), React Query, form library, duplicate libs, img alt, semantic HTML, div onClick, husky broken, error tracking |
| **MEDIUM** | **39** | Các vấn đề code quality, naming, DRY, i18n chi tiết, debounce, type assertion, magic number... |
| **PASS** | **46** | Strict TS, DOMPurify, route splitting, pagination, boolean naming, handler naming, toast system, .gitignore... |

### Theo section

| Section | CRITICAL | HIGH | MEDIUM | PASS | Score |
|---------|:--------:|:----:|:------:|:----:|:-----:|
| 1. Bảo mật | 3 | 3 | 4 | 11 | ⚠️ |
| 2. Hiệu năng | 2 | 7 | 7 | 3 | ❌ |
| 3. Chất lượng code | 2 | 4 | 9 | 8 | ⚠️ |
| 4. Kiến trúc | 0 | 3 | 9 | 7 | ⚠️ |
| 5. UI/UX & A11y | 1 | 3 | 7 | 4 | ⚠️ |
| 6. Testing | 10 | 0 | 0 | 0 | ❌❌ |
| 7. i18n | 1 | 0 | 2 | 0 | ❌ |
| 8. SEO | 0 | 0 | 2 | 0 | ➖ |
| 9. DevOps & CI/CD | 1 | 2 | 3 | 4 | ❌ |
| 10. Git & Workflow | 0 | 0 | 3 | 2 | ⚠️ |
| **TỔNG** | **11** | **22** | **39** | **46** | |

---

## TOP 10 VIỆC CẦN LÀM (Ưu tiên)

### Nhóm 1 — Fix ngay (tuần này)

| # | Hành động | Impact |
|---|-----------|--------|
| 1 | **Xóa SIP password hardcode** khỏi ListCustomer/index.tsx — chuyển sang server-side | Bảo mật CRITICAL |
| 2 | **Rotate OMNICXM key** — chuyển sang server-side, không để ở VITE\_ env | Bảo mật CRITICAL |
| 3 | **Install husky** — `npx husky install` + tạo `.husky/pre-commit` | Quality gate |
| 4 | **Bật ESLint rules**: `exhaustive-deps: "warn"`, `no-explicit-any: "warn"` | Ngăn bug mới |

### Nhóm 2 — Fix sớm (2 tuần)

| # | Hành động | Impact |
|---|-----------|--------|
| 5 | **Thêm Error Boundary** cho App root + các section chính | UX khi crash |
| 6 | **Xóa moment.js** — migrate 40 files sang date-fns (đã có sẵn) | -300KB bundle |
| 7 | **Replace lodash full import** 65 files → import cụ thể | Bundle size |
| 8 | **Thêm `loading="lazy"` cho img tags** | Performance |

### Nhóm 3 — Fix khi có thời gian (1-2 tháng)

| # | Hành động | Impact |
|---|-----------|--------|
| 9 | **Setup Vitest + React Testing Library** — bắt đầu test utils + critical flows | Regression protection |
| 10 | **Setup CI/CD** (GitHub Actions) — lint + type-check + test on PR | Quality automation |

### Nhóm 4 — Cải tiến dài hạn

| Hành động | Impact |
|-----------|--------|
| Chuyển token sang HTTP-only cookie (cần BE phối hợp) | Bảo mật |
| Thêm CSP + CSRF (cần BE + DevOps) | Bảo mật |
| Thêm React Query/SWR cho server state | Performance + DX |
| Thêm form library (React Hook Form) | DX + Validation |
| Tách components >2,000 dòng | Maintainability |
| Fix accessibility (outline, alt, semantic HTML) | A11y compliance |
| Localize 4,300 hardcoded strings | i18n |
| Thêm Sentry error tracking | Monitoring |
| Commit convention + branch naming | Team workflow |

---

*Report generated by Claude Code (AI-assisted review)*
*Checklist: FRONTEND_REVIEW_CHECKLIST.md v1.0*
*Ngày: 2026-04-08*
