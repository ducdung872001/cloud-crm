# FRONTEND CODE REVIEW CHECKLIST

> Checklist review toàn diện cho dự án Frontend (React / Vue / Angular).
> Dùng cho: code review, PR review, audit định kỳ, onboard dự án mới.
>
> **Cách dùng:** Mỗi mục đánh dấu `[ ]` khi chưa kiểm, `[x]` khi đã pass, `[!]` khi cần fix.
> Không phải mọi mục đều áp dụng cho mọi dự án — bỏ qua mục không liên quan.

---

## 1. BẢO MẬT (Security)

### 1.1 Injection & XSS

- [ ] Không dùng `eval()`, `new Function()`, `setTimeout(string)` để thực thi code động
- [ ] Mọi `dangerouslySetInnerHTML` (React) / `v-html` (Vue) đều qua sanitizer (DOMPurify)
- [ ] User input không được nối trực tiếp vào HTML, URL, hay SQL query string
- [ ] URL từ user/API được validate scheme (chỉ `http:`, `https:`) trước khi dùng cho `href`, `src`, `window.open`
- [ ] Không dùng `innerHTML` trực tiếp trên DOM element — dùng framework rendering
- [ ] Query parameters được encode đúng cách (`encodeURIComponent`)

### 1.2 Authentication & Token

- [ ] Access token **không** lưu trong `localStorage` (dễ bị XSS đọc) — ưu tiên HTTP-only cookie
- [ ] Refresh token flow hoạt động đúng, không lộ token trong URL
- [ ] Token hết hạn → redirect login, không để trạng thái treo
- [ ] Logout xóa sạch token, session, cached data nhạy cảm
- [ ] Không log token ra console, error tracking, hay analytics

### 1.3 Secrets & Credentials

- [ ] Không có API key, secret, password hardcode trong source code
- [ ] File `.env` nằm trong `.gitignore`, không commit lên repo
- [ ] Chỉ biến `VITE_` / `NEXT_PUBLIC_` / `REACT_APP_` mới expose ra client — không chứa secret
- [ ] Firebase config, Azure Client ID, VAPID key → chỉ chứa public keys, không chứa private keys
- [ ] Không có email cá nhân, IP nội bộ, tunnel URL (ngrok, serveo) trong code

### 1.4 HTTP Security

- [ ] Có Content-Security-Policy (CSP) header phù hợp
- [ ] Có `X-Frame-Options` hoặc CSP `frame-ancestors` chống clickjacking
- [ ] CSRF token gửi kèm mọi request mutation (POST/PUT/DELETE)
- [ ] External scripts có Subresource Integrity (SRI) hash
- [ ] API calls dùng HTTPS, không có mixed content
- [ ] CORS config ở server không phải `*` cho production

### 1.5 Authorization

- [ ] Permission check xảy ra ở **cả server** — FE chỉ là UX, không phải security boundary
- [ ] Không lưu role/permission trong localStorage rồi dùng làm auth gate duy nhất
- [ ] Route guard / middleware chặn truy cập trang không có quyền
- [ ] API response không trả data vượt quyền (kiểm tra ở server, nhưng FE nên verify)

### 1.6 Sensitive Data

- [ ] Dữ liệu nhạy cảm (CMND, SĐT, email, số tài khoản) được mask khi hiển thị
- [ ] Không cache dữ liệu nhạy cảm vào `localStorage`/`sessionStorage` khi không cần thiết
- [ ] Form password có `autocomplete="new-password"` hoặc `"current-password"` phù hợp
- [ ] Console không log dữ liệu nhạy cảm của user

---

## 2. HIỆU NĂNG (Performance)

### 2.1 Bundle & Loading

- [ ] Route-level code splitting bằng `React.lazy()` + `Suspense` (hoặc tương đương framework)
- [ ] Dynamic import cho thư viện nặng chỉ dùng ở một vài trang (chart, editor, PDF viewer)
- [ ] Tree-shaking hoạt động — không import toàn bộ library lớn (`import _ from "lodash"` → `import debounce from "lodash/debounce"`)
- [ ] Không dùng thư viện quá nặng khi có alternative nhẹ hơn (`moment.js` → `date-fns` hoặc `dayjs`)
- [ ] Bundle analyzer đã chạy, không có chunk bất thường (> 500KB gzipped)
- [ ] Font chỉ load weight/subset cần thiết, dùng `font-display: swap`

### 2.2 Rendering

- [ ] Component lớn (> 300 dòng hoặc > 10 useState) được tách thành sub-components
- [ ] `React.memo()` / `useMemo()` / `useCallback()` dùng đúng chỗ cho expensive computation hoặc component hay re-render
- [ ] `key` prop dùng unique stable ID, **không dùng array index** cho list có thể thay đổi thứ tự
- [ ] Không có `JSON.stringify()` trong render path để so sánh objects
- [ ] Inline object/array/function trong JSX được extract ra ngoài khi gây re-render
- [ ] Virtualized list (react-window, react-virtuoso) cho danh sách > 100 items
- [ ] `useEffect` dependency array chính xác — không thiếu, không thừa, không dùng object/array trực tiếp

### 2.3 Network & Data

- [ ] API calls có abort/cancel khi component unmount (`AbortController`, cleanup trong useEffect)
- [ ] Không gọi API trùng lặp (duplicate requests) khi mount/re-render
- [ ] Dữ liệu tĩnh hoặc ít thay đổi được cache (SWR, React Query, hoặc manual cache)
- [ ] Pagination / infinite scroll cho danh sách lớn — không load tất cả cùng lúc
- [ ] Debounce cho search input, resize handler, scroll handler
- [ ] Image dùng `loading="lazy"`, có `width`/`height` tránh layout shift
- [ ] Image được optimize (WebP/AVIF), dùng srcset cho responsive
- [ ] Idempotency key (`requestId`) cho các API mutation quan trọng (thanh toán, tạo đơn)

### 2.4 Memory

- [ ] `useEffect` có cleanup function (unsubscribe, clearInterval, clearTimeout, abort)
- [ ] EventListener được remove khi component unmount
- [ ] Không có `setInterval` / `setTimeout` chạy mãi không clear
- [ ] WebSocket / SSE connection được đóng khi không dùng
- [ ] Large object references được giải phóng khi không cần (set null)

---

## 3. CHẤT LƯỢNG CODE (Code Quality)

### 3.1 TypeScript / Type Safety

- [ ] `tsconfig.json` bật `strict: true` (bao gồm `strictNullChecks`, `noImplicitAny`)
- [ ] Không dùng `any` — thay bằng `unknown`, generic, hoặc type cụ thể
- [ ] API response có type/interface rõ ràng, không dùng `as any` để bypass
- [ ] Props interface được define đầy đủ, có JSDoc cho props phức tạp
- [ ] Enum hoặc union type cho các giá trị cố định (status, role, type)
- [ ] Type assertion (`as Type`) chỉ dùng khi thực sự cần và có comment giải thích

### 3.2 Error Handling

- [ ] Không có empty catch block (`catch {}` hoặc `catch (e) {}` rồi bỏ trống)
- [ ] API error được xử lý cụ thể: network error, 401, 403, 404, 500 có UX khác nhau
- [ ] Error boundary bao bọc các section chính, hiển thị fallback UI thay vì trắng trang
- [ ] Form validation hiển thị lỗi rõ ràng, inline tại field lỗi
- [ ] Async operation (API call, file upload) có loading state và error state
- [ ] Toast/notification cho user biết kết quả action (thành công / thất bại)

### 3.3 Code Organization

- [ ] Một file không quá 400 dòng — tách nếu vượt
- [ ] Một component không quá 15 useState — dùng useReducer hoặc tách sub-component
- [ ] Custom hook cho logic tái sử dụng, không copy-paste giữa components
- [ ] Tên file, folder, component nhất quán (PascalCase cho component, camelCase cho utils)
- [ ] Không có code bị comment-out — dùng git history thay vì giữ code cũ
- [ ] Không có file backup (`*_old.tsx`, `*Backup.tsx`, `* copy.tsx`)
- [ ] Import order nhất quán (external → internal → relative → styles)

### 3.4 Naming & Readability

- [ ] Biến, hàm đặt tên rõ nghĩa — đọc tên biết chức năng, không viết tắt quá mức
- [ ] Boolean biến bắt đầu bằng `is`, `has`, `should`, `can` (`isLoading`, `hasError`)
- [ ] Handler function bắt đầu bằng `handle` hoặc `on` (`handleSubmit`, `onClose`)
- [ ] Constant dùng UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `API_TIMEOUT`)
- [ ] Không có magic number — extract thành named constant với ý nghĩa
- [ ] Comment chỉ giải thích **tại sao** (why), không giải thích **cái gì** (what)

### 3.5 Console & Debug

- [ ] Không có `console.log` trong production code — dùng logger service có log level
- [ ] Không có `debugger` statement
- [ ] Không có `alert()` ngoài mục đích debug
- [ ] TODO/FIXME có ticket/issue number kèm theo, không để TODO trống

---

## 4. KIẾN TRÚC & MAINTAINABILITY (Architecture)

### 4.1 Project Structure

- [ ] Cấu trúc thư mục rõ ràng, nhất quán (feature-based hoặc layer-based)
- [ ] Shared components tách riêng khỏi page-specific components
- [ ] Service/API layer tách biệt khỏi UI layer — component không gọi `fetch` trực tiếp
- [ ] Config (URL, constant, env) tập trung một chỗ, không rải rác
- [ ] Type/interface/model definitions tập trung hoặc co-locate với feature

### 4.2 State Management

- [ ] Có chiến lược state rõ ràng: local state vs global state vs server state
- [ ] Global state chỉ chứa data thực sự global (auth, theme, locale) — không nhét mọi thứ
- [ ] Context không quá lớn — tách theo domain (AuthContext, UIContext) tránh re-render cascade
- [ ] Server state dùng React Query / SWR / tương đương — không tự quản lý cache
- [ ] Form state dùng form library (React Hook Form, Formik) cho form phức tạp

### 4.3 API Layer

- [ ] Có base API client / helper xử lý chung: auth header, error handling, retry, timeout
- [ ] Không duplicate fetch + parse pattern ở mỗi service file
- [ ] API URL tập trung, dùng env variable cho domain — không hardcode
- [ ] Request/Response types được define cho mỗi endpoint
- [ ] Retry logic cho network error, có exponential backoff
- [ ] Timeout config cho mọi API call

### 4.4 Reusability & DRY

- [ ] Logic validation tập trung một chỗ, không copy giữa các form
- [ ] Format functions (currency, date, phone) là shared utils
- [ ] UI patterns lặp lại được extract thành component (Modal, Table, Filter)
- [ ] Không có 3+ file chứa logic gần giống nhau — extract common pattern

### 4.5 Dependencies

- [ ] Không có dependency không dùng trong `package.json`
- [ ] Không có 2 library cùng chức năng (VD: cả `moment` và `date-fns`)
- [ ] Dependencies được update định kỳ, không có known vulnerability (`npm audit`)
- [ ] Lock file (`yarn.lock`, `package-lock.json`) được commit
- [ ] Phân biệt rõ `dependencies` vs `devDependencies`

---

## 5. UI/UX & ACCESSIBILITY (Giao diện & Truy cập)

### 5.1 Responsive & Cross-browser

- [ ] Layout hoạt động tốt trên mobile, tablet, desktop
- [ ] Không có horizontal scroll bất ngờ trên mobile
- [ ] Test trên các browser chính (Chrome, Firefox, Safari, Edge)
- [ ] Touch target đủ lớn trên mobile (tối thiểu 44x44px)
- [ ] Font size không dùng `px` cố định cho body text — ưu tiên `rem`

### 5.2 Accessibility (a11y)

- [ ] Mọi `<img>` có `alt` text mô tả (hoặc `alt=""` cho decorative)
- [ ] Form input có `<label>` liên kết (hoặc `aria-label`)
- [ ] Button/link có text rõ nghĩa, không chỉ có icon mà thiếu `aria-label`
- [ ] Semantic HTML: dùng `<button>` cho action, `<a>` cho navigation, `<nav>`, `<main>`, `<section>`
- [ ] Không dùng `<div onClick>` thay cho `<button>` — keyboard không navigate được
- [ ] Color contrast đủ (WCAG AA: 4.5:1 cho text thường, 3:1 cho text lớn)
- [ ] Focus visible khi dùng keyboard (không `outline: none` không thay thế)
- [ ] Tab order hợp lý, modal trap focus đúng
- [ ] `aria-live` cho nội dung dynamic (toast, loading state, error message)
- [ ] Heading hierarchy đúng (`h1` → `h2` → `h3`, không nhảy cấp)

### 5.3 UX Patterns

- [ ] Loading state rõ ràng cho mọi async operation (skeleton, spinner)
- [ ] Empty state khi danh sách trống — không hiển thị trang trắng
- [ ] Confirm dialog cho destructive action (xóa, hủy)
- [ ] Form không mất dữ liệu khi navigate away bất ngờ (unsaved changes warning)
- [ ] Double-click prevention cho submit button (disable sau click đầu tiên)
- [ ] Error message dễ hiểu với user, không hiện raw error / stack trace
- [ ] Optimistic UI update khi phù hợp (toggle, like, simple update)

---

## 6. TESTING (Kiểm thử)

### 6.1 Unit Tests

- [ ] Utility functions có unit test (format, validate, parse, transform)
- [ ] Custom hooks có test (renderHook)
- [ ] Business logic functions có test coverage
- [ ] Edge cases được test: null, undefined, empty string, empty array, boundary values

### 6.2 Component Tests

- [ ] Shared components có test: render đúng, props hoạt động, event fire đúng
- [ ] Form component test: validation, submit, error display
- [ ] Conditional rendering được test (show/hide, role-based UI)

### 6.3 Integration / E2E Tests

- [ ] Critical user flows có E2E test (login, checkout, CRUD chính)
- [ ] API integration test với mock server hoặc MSW
- [ ] Cross-page navigation hoạt động đúng

### 6.4 Test Quality

- [ ] Test không phụ thuộc implementation detail (không test state nội bộ)
- [ ] Test có assertion rõ ràng, không chỉ "renders without crashing"
- [ ] Test data không hardcode giá trị thật (dùng faker, factory)
- [ ] CI chạy test tự động trước khi merge

---

## 7. INTERNATIONALIZATION & LOCALIZATION (i18n / l10n)

- [ ] Mọi text hiển thị cho user dùng i18n key, không hardcode tiếng Việt/Anh
- [ ] Date/time format theo locale (`Intl.DateTimeFormat` hoặc date-fns locale)
- [ ] Currency format theo locale (`Intl.NumberFormat`)
- [ ] Pluralization xử lý đúng (1 item vs 2 items)
- [ ] RTL layout support nếu cần (Arabic, Hebrew)
- [ ] Translation file không thiếu key — có tool check missing keys
- [ ] Không nối string để tạo câu (`"Hello " + name` → dùng interpolation `t('hello', { name })`)

---

## 8. SEO & META (nếu áp dụng — SSR/SSG projects)

- [ ] Mỗi trang có `<title>` và `<meta description>` unique
- [ ] Open Graph tags cho social sharing
- [ ] Canonical URL đúng
- [ ] Structured data (JSON-LD) cho trang sản phẩm, bài viết
- [ ] Sitemap.xml và robots.txt được config
- [ ] Các trang quan trọng crawl được (không chỉ client-side render)

---

## 9. DevOps & CI/CD

### 9.1 Build & Deploy

- [ ] Build production không có warning
- [ ] Environment variables khác nhau cho dev / staging / production
- [ ] Source map không expose ra production (hoặc upload riêng cho error tracking)
- [ ] Assets có content hash trong filename cho cache busting
- [ ] Gzip / Brotli compression enabled trên server

### 9.2 Code Quality Gates

- [ ] ESLint / Prettier chạy trong CI, block merge nếu fail
- [ ] TypeScript compile check (`tsc --noEmit`) trong CI
- [ ] Pre-commit hook (husky + lint-staged) chạy lint trước khi commit
- [ ] PR template có checklist cơ bản
- [ ] Branch protection: require review, require CI pass

### 9.3 Monitoring & Error Tracking

- [ ] Error tracking service (Sentry, Datadog, LogRocket) đã tích hợp
- [ ] Source map upload cho error tracking để đọc stack trace production
- [ ] Performance monitoring (Core Web Vitals: LCP, FID/INP, CLS)
- [ ] Alert khi error rate tăng đột biến

---

## 10. GIT & WORKFLOW

- [ ] Commit message rõ ràng, theo convention (Conventional Commits: `feat:`, `fix:`, `refactor:`)
- [ ] Branch naming nhất quán (`feature/xxx`, `fix/xxx`, `hotfix/xxx`)
- [ ] PR size hợp lý (< 400 dòng changed) — tách nếu quá lớn
- [ ] PR description mô tả: what changed, why, how to test
- [ ] Không commit file generated (node_modules, dist, .env, IDE config)
- [ ] `.gitignore` đầy đủ và đúng
- [ ] Không force push lên branch shared (main, develop)

---

## PHỤ LỤC A: CHECKLIST NHANH CHO PR REVIEW

Dùng khi review Pull Request hàng ngày — chỉ các mục quan trọng nhất:

```
### PR Review Quick Check
- [ ] Không có secret/key/token trong code
- [ ] Không có console.log, debugger
- [ ] Không có `any` type mới
- [ ] Error handling đầy đủ (không empty catch)
- [ ] Loading/error state cho async operations
- [ ] Key prop dùng unique ID, không dùng index
- [ ] useEffect có cleanup và đúng dependencies
- [ ] Tên biến/hàm rõ nghĩa
- [ ] Không duplicate logic đã có sẵn trong utils/shared
- [ ] UI hoạt động đúng trên mobile (nếu áp dụng)
```

---

## PHỤ LỤC B: SEVERITY LEVELS

| Level | Ý nghĩa | Hành động |
|-------|----------|-----------|
| **CRITICAL** | Lỗ hổng bảo mật, mất dữ liệu, crash production | Block merge, fix ngay |
| **HIGH** | Bug logic, performance nghiêm trọng, code không maintainable | Block merge, fix trước khi merge |
| **MEDIUM** | Code smell, thiếu best practice, UX chưa tốt | Nên fix, có thể tạo ticket follow-up |
| **LOW** | Style, naming, minor improvement | Nice to have, không block merge |

---

## PHỤ LỤC C: TOOLS KHUYẾN NGHỊ

| Mục đích | Tools |
|----------|-------|
| Linting | ESLint + typescript-eslint + eslint-plugin-react-hooks |
| Formatting | Prettier |
| Type checking | TypeScript strict mode |
| Testing | Vitest / Jest + React Testing Library + Playwright/Cypress |
| Bundle analysis | vite-bundle-visualizer / webpack-bundle-analyzer |
| Accessibility | eslint-plugin-jsx-a11y + axe-core + Lighthouse |
| Security | npm audit + Snyk + eslint-plugin-security |
| Performance | Lighthouse CI + Web Vitals |
| Error tracking | Sentry |
| Pre-commit | Husky + lint-staged |
| API mocking | MSW (Mock Service Worker) |
| i18n check | i18next-parser / eslint-plugin-i18next |

---

*Checklist version: 1.0*
*Cập nhật: 2026-04-08*
*Tham khảo: OWASP Top 10, Google Web Dev, Airbnb Style Guide, React Docs, WCAG 2.1*
