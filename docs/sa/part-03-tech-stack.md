# Part 03 — Tech Stack & Dependencies

## Executive Summary

Reborn CRM frontend dùng **React 17 + TypeScript 4.5 + Vite 8.0**. Quản lý dependency qua **yarn**. Có **~120 production dependencies** và **15+ devDependencies**. Stack chia thành 7 nhóm: Core (React/TS/Vite), Routing & State, UI library, Form & Input, Data viz & Tables, Communication (call, chat, email, SMS), và Integration (Firebase, MS, Facebook, Highcharts...).

---

## 1. Core stack

### 1.1. Language & Framework

| Package | Version | Vai trò |
|---------|---------|---------|
| `react` | 17.0.2 | Framework UI chính |
| `react-dom` | 17.0.2 | Render React vào DOM |
| `typescript` | 4.5.4 | Static typing |
| `@types/react` | 17.0.37 | Type definitions |
| `@types/react-dom` | 17.0.11 | Type definitions |

> ⚠️ **React 17 vs 18**: Đang dùng React 17 — không có concurrent features (Suspense for data, automatic batching nâng cao, transitions). Nâng cấp lên 18 là technical debt cần cân nhắc. Xem [Part 14 — Risks](part-14-quality-risks.md).

### 1.2. Build tool

| Package | Version | Vai trò |
|---------|---------|---------|
| `vite` | 8.0.7 | Dev server + production bundler |
| `@vitejs/plugin-react` | 6.0.1 | React fast refresh + JSX |
| `vite-plugin-svgr` | 5.2.0 | Import SVG as React component |

> Vừa migrate từ Webpack 5 sang Vite — xem [ADR-02](part-13-adr.md#adr-02--migrate-từ-webpack-sang-vite) cho lý do và hậu quả.

---

## 2. Routing & State Management

| Package | Version | Vai trò |
|---------|---------|---------|
| `react-router-dom` | 6.2.1 | Client-side routing |

**Không dùng:** Redux, MobX, Zustand, Jotai, Recoil. State management qua React Context API và custom hooks. Xem [ADR-04](part-13-adr.md#adr-04--không-dùng-redux-mà-dùng-context-api).

---

## 3. UI Library & Styling

### 3.1. Styling

| Package | Version | Vai trò |
|---------|---------|---------|
| `sass` | 1.45 | SCSS preprocessor |
| `@emotion/css` | 11.10 | CSS-in-JS (cho dynamic styles) |
| `material-icons` | 1.13 | Icon font |

### 3.2. UI Components

| Package | Version | Vai trò |
|---------|---------|---------|
| `react-overlays` | 5.1 | Modal/popover primitives |
| `react-popper-tooltip` | 4.3 | Tooltip positioning |
| `@tippyjs/react` | 4.2 | Tooltip ready-to-use |
| `react-toastify` | 8.1 | Toast notification |
| `react-circular-progressbar` | 2.1 | Progress circle |
| `rc-slider` | 10.5 | Slider control |

### 3.3. Form & Input

| Package | Version | Vai trò |
|---------|---------|---------|
| `react-select` | 5.2 | Select dropdown nâng cao |
| `react-select-async-paginate` | 0.7 | Select với pagination + lazy load |
| `react-datepicker` | 8.10 | Date picker |
| `react-text-mask` | 5.4 | Input masking (SĐT, CMND...) |
| `text-mask-addons` | 3.8 | Mask helpers |
| `react-number-format` | 4.9 | Number input formatting |
| `react-color` | 2.19 | Color picker (cho cấu hình badge nhóm) |
| `react-colorful` | 5.6 | Color picker thay thế |
| `react-cookie` | 4.1 | Đọc/ghi cookie |
| `universal-cookie` | 4.0 | Cookie helper SSR-friendly |

### 3.4. Layout & Drag-drop

| Package | Version | Vai trò |
|---------|---------|---------|
| `react-grid-layout` | 1.4 | Drag-drop dashboard |
| `react-beautiful-dnd` | 13.1 | Drag-drop list (kanban) |
| `react-custom-scrollbars` | 4.2 | Custom scrollbar |
| `react-resizable` | (transitive) | Resizable panels |

---

## 4. Data Visualization & Tables

### 4.1. Tables

| Package | Version | Vai trò |
|---------|---------|---------|
| `ag-grid-community` | 30.2.1 | Bảng dữ liệu lớn (virtual scroll) |
| `ag-grid-react` | 30.2.1 | React wrapper cho ag-grid |

> Dùng cho mọi page có bảng > 100 dòng (Customer list, Invoice list, Inventory). Xem [ADR-08](part-13-adr.md#adr-08--ag-grid-cho-bảng-lớn).

### 4.2. Charts

| Package | Version | Vai trò |
|---------|---------|---------|
| `highcharts` | 9.3 | Chart library chính (line/bar/pie/heatmap) |
| `highcharts-react-official` | 3.1 | React wrapper |
| `react-google-charts` | 4.0 | Backup chart library |
| `react-funnel-pipeline` | 0.2 | Funnel chart cho sales pipeline |
| `gantt-task-react` | 0.3 | Gantt chart cho project mgmt |

### 4.3. Carousel & Slider

| Package | Version | Vai trò |
|---------|---------|---------|
| `swiper` | 11.2.10 | Carousel chính |
| `react-big-calendar` | 1.6 | Lịch tháng/tuần (booking, event) |

---

## 5. Specialized Modules

### 5.1. Workflow / BPM

| Package | Version | Vai trò |
|---------|---------|---------|
| `bpmn-js` | 17.8 | BPMN diagram editor |
| `bpmn-js-properties-panel` | 5.17 | Properties editor cho BPMN |
| `@bpmn-io/form-js` | 1.13 | Form builder |
| `@bpmn-io/form-js-editor` | 1.13 | Form editor visual |
| `@bpmn-io/properties-panel` | 3.25 | Form properties panel |
| `camunda-bpmn-moddle` | 7.0 | Camunda BPMN extensions |
| `react-bpmn` | 0.2 | React wrapper |
| `reactflow` | 11.10 | Flow diagram (alternative cho BPMN) |
| `formula-functionizer` | 1.0 | Eval formula trong form |

> Module **BPM** (`pages/BPM/`) là một sub-app khá lớn dùng Camunda BPMN engine. Backend tương ứng ở `/bpmapi`.

### 5.2. Rich Text Editor (Slate)

| Package | Version | Vai trò |
|---------|---------|---------|
| `slate` | 0.91 | Rich text core |
| `slate-react` | 0.91 | React bindings |
| `slate-history` | 0.86 | Undo/redo |
| `slate-html-serializer` | 0.8 | Serialize ↔ HTML |
| `slate-hyperscript` | 0.77 | DSL helpers |

> Dùng cho email marketing, mô tả sản phẩm, ghi chú dài.

### 5.3. Call Center & Communication

| Package | Version | Vai trò |
|---------|---------|---------|
| `jssip` | 3.10 | SIP signaling cho VoIP |
| `sip.js` | 0.8 | SIP alternative |

> Module `pages/CallCenter/` + `src/webrtc/` dùng để tích hợp tổng đài ảo (Viettel / VoIP). Xem [Part 09 — Integration](part-09-integration.md).

### 5.4. File handling

| Package | Version | Vai trò |
|---------|---------|---------|
| `xlsx` | 0.18 | Đọc/ghi Excel (cho import/export) |
| `exceljs` | 4.3 | Excel nâng cao (style, formula) |
| `file-saver` | 2.0 | Trigger download file |
| `react-doc-viewer` | 0.1.5 | Xem PDF/Word/Excel inline |
| `react-to-print` | 2.14 | In hóa đơn |
| `qrcode.react` | 3.1 | Generate QR |
| `exif-js` | 2.3 | Đọc metadata ảnh |
| `image-extensions` | 1.1 | List image MIME types |
| `is-url` | 1.2 | URL validation |
| `escape-html` | 1.0 | XSS escape |

### 5.5. Date & Time

| Package | Version | Vai trò |
|---------|---------|---------|
| `moment` | 2.29 | Date library cũ |
| `date-fns` | 4.1 | Date library mới (đang migrate?) |

> Đang có **2 date library cùng tồn tại** — đây là technical debt nhỏ. Nên thống nhất về `date-fns` (lighter, modular, immutable). Xem [Part 14 — Risks](part-14-quality-risks.md).

---

## 6. Authentication & Security

| Package | Version | Vai trò |
|---------|---------|---------|
| `@azure/msal-browser` | 3.7 | Microsoft auth (Outlook integration) |
| `@azure/msal-react` | 2.0 | React wrapper |
| `@fingerprintjs/fingerprintjs` | 5.0 | Browser fingerprint (anti-fraud) |
| `fingerprintjs` | 0.5 | Legacy fingerprint |
| `react-facebook-login` | 4.1 | Facebook OAuth |

> Lưu ý: **không thấy library OAuth/OIDC chuyên dụng** — đăng nhập SSO của Reborn dùng cookie + redirect manual qua `pages/Login/index.tsx`.

---

## 7. Integration Libraries

### 7.1. Firebase (Push Notification)

| Package | Version | Vai trò |
|---------|---------|---------|
| `firebase` | 9.16 | Firebase Cloud Messaging cho push notification |

**File config:** `src/firebase-config.ts`, `src/firebase-messaging-sw.js`

### 7.2. Reborn internal libraries

| Package | Version | Vai trò |
|---------|---------|---------|
| `reborn-util` | 1.1.3 | Helpers nội bộ Reborn (formatCurrency, getDomain, getCookie, getSearchParameters...) |
| `reborn-validation` | 1.0.5 | Validation framework nội bộ (Validate function, IValidation type) |

> 2 package này được publish riêng bởi đội Reborn và dùng chung cho các sản phẩm Reborn khác. Xem code trong `node_modules/reborn-util/` để hiểu API.

---

## 8. Testing & Quality

### 8.1. Linting & Formatting

| Package | Version | Vai trò |
|---------|---------|---------|
| `eslint` | 8.5 | Linter |
| `@typescript-eslint/eslint-plugin` | 5.8 | TS rules |
| `@typescript-eslint/parser` | 5.8 | TS parser |
| `eslint-plugin-react` | 7.27 | React rules |
| `eslint-plugin-react-hooks` | 4.3 | Hooks rules |
| `eslint-config-prettier` | 8.3 | Prettier integration |
| `eslint-plugin-prettier` | 4.0 | Prettier as ESLint |
| `prettier` | 2.5 | Code formatter |

### 8.2. Pre-commit

| Package | Version | Vai trò |
|---------|---------|---------|
| `husky` | 7.0 | Git hooks |
| `lint-staged` | 12.1 | Run lint on staged files |

**Pre-commit hook:**
```json
"lint-staged": {
  "*.{js,ts,tsx}": ["npm run lint:fix"]
}
```

### 8.3. Test (chưa có)

> ⚠️ **Quan sát:** Không có `vitest`, `jest`, `@testing-library/react`, hoặc `playwright` trong `devDependencies`. Có Playwright nhưng cài tách trong `docs/userguides/tooling/` cho mục đích chụp ảnh HDSD, không phải production test suite. Đây là **gap lớn** cần xử lý — xem [Part 14](part-14-quality-risks.md).

---

## 9. Polyfill & Compatibility

| Package | Version | Vai trò |
|---------|---------|---------|
| `whatwg-fetch` | 3.6 | fetch polyfill cho browser cũ |
| `fetch-intercept` | 2.4 | Interceptor cho fetch (dùng cho auth header) |
| `core-js` | (transitive) | ES polyfills |

---

## 10. Build & dev scripts

`package.json`:

```json
"scripts": {
  "dev": "vite --mode development",
  "build": "vite build --mode production",
  "build-beta": "vite build --mode staging",
  "preview": "vite preview",
  "lint": "eslint --ext js,jsx,ts,tsx src/",
  "lint:fix": "eslint --fix --ext js,jsx,ts,tsx src/",
  "prettier": "prettier --check ...",
  "prettier:fix": "prettier --write ..."
}
```

**Mode triggers env file:**

- `development` → `.env.development`
- `staging` → `.env.staging`
- `production` → `.env.production`

---

## 11. Phân tích bundle size

> ⚠️ **Quan sát hiện tại:** Sau khi build production:
>
> - `bundle/crm/js/index.<hash>.js` ≈ **20.7 MB raw / 5 MB gzip** ❗
> - `bundle/crm/css/index.<hash>.css` ≈ **4.6 MB raw / 446 KB gzip**
>
> Đây là bundle **cực lớn** so với mức acceptable cho web app (thường < 1 MB raw). Lý do:
>
> 1. Quá nhiều thư viện UI (highcharts + ag-grid + bpmn-js + reactflow + slate + ...)
> 2. **Chưa lazy load** đủ — manualChunks chỉ tách 3 vendor
> 3. Một số module nặng (bpmn-js, slate, exceljs) không cần load trừ khi user vào page tương ứng

**Đề xuất tối ưu** (chi tiết ở [Part 14](part-14-quality-risks.md)):

1. Lazy load **bpmn-js** chỉ khi vào page BPM
2. Lazy load **slate** chỉ khi mở rich text editor
3. Lazy load **exceljs/xlsx** chỉ khi user bấm Export
4. Lazy load **highcharts** chỉ khi vào trang báo cáo
5. Tách thêm `manualChunks`: `editor`, `chart`, `bpmn`, `excel`
6. Cân nhắc dynamic import cho route-level

---

## 12. Bảng tổng hợp dependencies theo nhóm

| Nhóm | Số package | Tỷ lệ |
|------|:----------:|:-----:|
| Core (React/TS/Vite) | 6 | 5% |
| Routing | 1 | 1% |
| UI components | 15 | 13% |
| Form & input | 12 | 10% |
| Data viz & tables | 8 | 7% |
| BPM | 9 | 8% |
| Slate (rich text) | 5 | 4% |
| Communication (SIP) | 2 | 2% |
| File handling | 11 | 9% |
| Date/time | 2 | 2% |
| Auth/Security | 5 | 4% |
| Firebase + Reborn util | 3 | 3% |
| Lint/format | 8 | 7% |
| Polyfill/compat | 3 | 3% |
| Khác | ~30 | 25% |
| **Tổng** | **~120** | **100%** |

---

## 13. Phụ thuộc vào dịch vụ Reborn nội bộ

Ngoài npm package, frontend còn phụ thuộc các API/service nội bộ:

| Service Reborn | Vai trò | URL prefix |
|---------------|---------|-----------|
| **SSO Reborn** | Đăng nhập, OAuth | `process.env.APP_AUTHENTICATOR_URL` |
| **Cloud API** | Main backend | `process.env.APP_API_URL` |
| **Biz API** | Microservices nghiệp vụ | `process.env.APP_BIZ_URL` |
| **BPM Engine** | Workflow | `process.env.APP_BPM_URL` |
| **Connect Service** | Tích hợp 3rd party | `process.env.APP_CONNECT_URL` |
| **Upload Service** | Upload file | `process.env.APP_UPLOAD_URL` |
| **Athena** | Analytics | `process.env.APP_ATHENA_URL` |

---

*Hết Part 03.*
