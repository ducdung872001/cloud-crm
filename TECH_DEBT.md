# TECH DEBT - Ket qua Review Frontend

> Review theo `FRONTEND_REVIEW_CHECKLIST.md`
> Ngay review: 2026-04-09
> Trang thai: `[FIXED]` da fix | `[TODO]` can xu ly

---

## 1. BAO MAT (Security)

### 1.1 Injection & XSS

| STT | Muc do | Trang thai | Van de | File | Ghi chu |
|-----|--------|------------|--------|------|---------|
| 1 | CRITICAL | FIXED | `eval()` thuc thi formula tu user input | `src/pages/SettingProcess/.../AddFormObjectBackup/index.tsx` | Thay bang `expr-eval` |
| 2 | CRITICAL | FIXED | `eval()` | `src/pages/FsQuote/partials/AddFsFormQuoteBackup/index.tsx` | Thay bang `expr-eval` |
| 3 | CRITICAL | FIXED | `eval()` | `src/pages/Quotations/partials/AddFormQuoteBackup/index.tsx` | Thay bang `expr-eval` |
| 4 | HIGH | FIXED | `dangerouslySetInnerHTML` khong sanitize | `src/pages/Test/index.tsx:595,611` | Wrap `DOMPurify.sanitize()` |
| 5 | HIGH | FIXED | `parser()` khong sanitize | `src/pages/LinkSurvey/index.tsx:199` | Wrap `DOMPurify.sanitize()` |
| 6 | HIGH | FIXED | `parser()` khong sanitize | `src/pages/CustomerPerson/.../CustomerEmailList.tsx` (2 file) | Wrap `DOMPurify.sanitize()` |
| 7 | HIGH | FIXED | `parser()` khong sanitize | `src/pages/CustomerPerson/.../ViewDetailPerson.tsx:819` | Wrap `DOMPurify.sanitize()` |
| 8 | HIGH | FIXED | `parser()` khong sanitize | `src/pages/CustomerPerson/.../AddCustomerEmailModal.tsx` (2 file) | Wrap `DOMPurify.sanitize()` |
| 9 | HIGH | FIXED | `parser()` khong sanitize | `src/pages/CustomerSurvey/partials/AddCustomerSurvey.tsx:383` | Wrap `DOMPurify.sanitize()` |
| 10 | MEDIUM | FIXED | postMessage khong validate origin | `src/pages/UserTaskList/.../ModalCustomPopup/index.tsx:907` | Them origin whitelist + URL validation |
| 11 | MEDIUM | FIXED | Open Redirect qua `returnUrl` | `src/App.tsx:54` | Chi chap nhan relative path |

### 1.2 Tokens & Secrets

| STT | Muc do | Trang thai | Van de | File | Ghi chu |
|-----|--------|------------|--------|------|---------|
| 12 | CRITICAL | FIXED | Hardcoded JWT token | `src/services/DocumentService.ts:3` | Xoa token, dung fetch interceptor |
| 13 | CRITICAL | FIXED | JWT token trong comment | `src/pages/CustomerPerson/.../DetailPersonList.tsx:230` | Xoa comment |
| 14 | HIGH | FIXED | console.log expose FB access token | `src/pages/SetttingSocialCrm/.../LoginFacebookModal/index.tsx:40` | Xoa console.log |
| 15 | HIGH | FIXED | console.log expose FB access token | `src/pages/SocialCrm/SocialCrm.tsx:55` | Xoa console.log |
| 16 | HIGH | FIXED | Google OAuth Client ID hardcode | `src/pages/SettingAccount/partials/ConnectGmail.tsx:10` | Chuyen sang VITE_GOOGLE_CLIENT_ID |
| 17 | HIGH | FIXED | Firebase API Keys hardcode | `src/configs/firebaseConfig.js:5` | Chuyen sang env (VITE_FIREBASE_*) |
| 18 | HIGH | FIXED | Firebase API Keys hardcode | `src/firebase-config.ts:37` | Chuyen sang env (VITE_FIREBASE_BPM_*) |
| 19 | HIGH | FIXED | VAPID Keys hardcode | `src/configs/firebaseConfig.js:19`, `src/firebase-config.ts:90` | Chuyen sang env |
| 20 | MEDIUM | TODO | Azure Client ID hardcode | `src/configs/authConfig.js:15-16` | Chuyen vao env variable |
| 21 | MEDIUM | TODO | Access token luu localStorage | `src/pages/CustomerPerson/.../DetailPersonList.tsx:219` | Chuyen sang httpOnly cookie |
| 22 | LOW | TODO | IP noi bo trong comment | `src/template/webform.js:33,79,109` | Xoa comment chua IP |
| 23 | LOW | TODO | Hardcode localhost fallback | `src/utils/common.ts:338` | Dung env variable |
| 24 | LOW | TODO | console.log API URL | `src/configs/urls.ts:16` | Xoa console.log |

---

## 2. HIEU NANG (Performance)

### 2.1 Bundle & Loading

| STT | Muc do | Trang thai | Van de | Chi tiet |
|-----|--------|------------|--------|----------|
| 25 | CRITICAL | TODO | Khong co code splitting | `src/configs/routes.tsx` (1912 dong) import static tat ca routes. Dung `React.lazy()` + `Suspense` |
| 26 | CRITICAL | TODO | Import toan bo lodash | 500+ file dung `import _ from "lodash"`. Thay bang named import hoac lodash-es |
| 27 | CRITICAL | TODO | moment.js qua nang | 419+ file dung moment (39KB). Thay bang dayjs (2KB) hoac date-fns |

### 2.2 Rendering

| STT | Muc do | Trang thai | Van de | Chi tiet |
|-----|--------|------------|--------|----------|
| 28 | CRITICAL | TODO | Array index lam key | 913 instance `key={index}` trong `.map()`. Thay bang unique ID |
| 29 | HIGH | TODO | Component qua lon | `CreateCampaign.tsx` (5,681 dong), `CustomerPersonList.tsx` (3,690 dong), `FilterComponent.tsx` (3,303 dong), `ModalBusinessRuleTask` (3,017 dong), `ConfigEmail` (2,741 dong). Tach < 400 dong/file |
| 30 | HIGH | TODO | Qua nhieu useState | `CreateCampaign.tsx` (60+), `CustomerPersonList.tsx` (66+). Dung useReducer |

### 2.3 Memory

| STT | Muc do | Trang thai | Van de | Chi tiet |
|-----|--------|------------|--------|----------|
| 31 | MEDIUM | TODO | setTimeout khong cleanup | `src/pages/CustomerPerson/CustomerPersonList.tsx:2522` va nhieu file khac. Them clearTimeout trong useEffect return |

---

## 3. CHAT LUONG CODE (Code Quality)

### 3.1 TypeScript

| STT | Muc do | Trang thai | Van de | Chi tiet |
|-----|--------|------------|--------|----------|
| 32 | HIGH | TODO | strict mode tat | `tsconfig.json:8` - `"strict": false`. Bat tung flag: strictNullChecks, noImplicitAny |
| 33 | HIGH | TODO | `any` type tran lan | 4,317 instance `: any` + 521 instance `as any` (360 file). Thay dan bang type cu the |
| 34 | MEDIUM | TODO | ESLint rules qua long | `no-explicit-any` va `exhaustive-deps` deu disabled. Bat lai va fix tung file |

### 3.2 Console & Debug

| STT | Muc do | Trang thai | Van de | Chi tiet |
|-----|--------|------------|--------|----------|
| 35 | HIGH | TODO | 1,440 console.log | Tran lan khap codebase. Xoa hoac dung vite-plugin-strip de strip khi build |
| 36 | LOW | FIXED | alert() calls | `src/utils/image.ts:51`, `src/components/editor/reborn/plugins/withMedias.tsx:92`. Thay bang showToast() |
| 37 | MEDIUM | TODO | Empty catch blocks | `src/App.tsx:340,371`. Them comment giai thich tai sao ignore |

### 3.3 Code Organization

| STT | Muc do | Trang thai | Van de | Chi tiet |
|-----|--------|------------|--------|----------|
| 38 | HIGH | TODO | 4.6MB file/folder backup/old | `src/pages/BPM_old/` (2.1MB), `partials_old/` (1.3MB), `icons_old/` (1MB), `importModalBackup/`, `*Backup/`, `*_old.tsx`. Xoa, dung git history |
| 39 | MEDIUM | TODO | Code comment lon | `src/exports/pdf/index.ts` (66% comment), `src/configs/urls.ts` (521 dong), `src/configs/routes.tsx` (239 dong). Xoa code comment |
| 40 | MEDIUM | TODO | 126 TODO/FIXME khong co ticket | Khong TODO nao co ticket number. Them ticket hoac tao issue |

---

## 4. KIEN TRUC & MAINTAINABILITY

| STT | Muc do | Trang thai | Van de | Chi tiet |
|-----|--------|------------|--------|----------|
| 41 | HIGH | TODO | Khong co server state management | Khong dung React Query / SWR. Moi page tu fetch voi useState + useEffect. Tich hop TanStack Query |
| 42 | MEDIUM | TODO | Context qua it | Chi co `userContext.ts`. State luu nhieu trong localStorage. Tach theo domain |
| 43 | MEDIUM | TODO | Khong co retry/error handling chung | `fetchConfig.ts` chi inject auth + xu ly 401. Them retry, timeout, centralized error |
| 44 | MEDIUM | TODO | Duplicate libraries | `moment` + `date-fns` (date), `fingerprintjs` + `@fingerprintjs/fingerprintjs`. Chon 1 |
| 45 | MEDIUM | TODO | package-lock.json bi gitignore | `.gitignore` co `package-lock.json`. Xoa khoi .gitignore, commit lock file |
| 46 | MEDIUM | TODO | sharp khong dung | `sharp` (0.33.5) native C++ module, khong import trong src/. Kiem tra va xoa |
| 47 | MEDIUM | TODO | Husky config loi thoi | Husky 7 can `.husky/` directory, config dang o package.json (format cu). Migrate |

---

## 5. TESTING

| STT | Muc do | Trang thai | Van de | Chi tiet |
|-----|--------|------------|--------|----------|
| 48 | CRITICAL | TODO | Khong co test | 0 file test. Khong co Jest/Vitest/RTL. Setup Vitest + RTL, viet test cho utils va shared components |

---

## 6. DevOps & CI/CD

| STT | Muc do | Trang thai | Van de | Chi tiet |
|-----|--------|------------|--------|----------|
| 49 | MEDIUM | TODO | Khong co error tracking | Chua tich hop Sentry hoac tuong duong |
| 50 | MEDIUM | TODO | Source map | `sourcemap: false` (tot). Nhung can upload rieng cho error tracking |

---

## TONG KET

### Thong ke

| Trang thai | CRITICAL | HIGH | MEDIUM | LOW | Tong |
|------------|----------|------|--------|-----|------|
| **FIXED** | 5 | 10 | 2 | 1 | **18** |
| **TODO** | 4 | 7 | 16 | 5 | **32** |

### Dependencies da them

| Package | Phien ban | Muc dich |
|---------|-----------|----------|
| `dompurify` | latest | Sanitize HTML chong XSS |
| `@types/dompurify` | latest | TypeScript types |
| `expr-eval` | latest | Thay the eval() cho formula |

### Priority Matrix

| Priority | Noi dung | Trang thai |
|----------|----------|------------|
| **P0** | eval() injection, DOMPurify, hardcoded keys, open redirect, postMessage | **DA FIX** |
| **P1** | Code splitting routes, xoa 1,440 console.log, xoa 4.6MB backup code | TODO |
| **P2** | Lodash tree-shake (500 file), moment -> dayjs (419 file), key={index} (913) | TODO |
| **P3** | TypeScript strict, test setup, TanStack Query, tach component lon | TODO |

---

*Cap nhat: 2026-04-09*
