# Part 03 — Tech Stack Inventory

## Executive Summary

Tài liệu này liệt kê toàn bộ thư viện, runtime, tooling dùng trong Reborn Retail CRM, có version chính xác lấy từ `package.json`. Stack chính: **React 18.3 + TypeScript 4.5 + Vite 7 + react-router-dom 7**, HTTP qua `fetch` + `fetch-intercept` (không có axios), i18n qua `react-i18next`, bảng lớn qua `ag-grid 30`, editor qua `slate 0.91`, BPM qua `reactflow 11` + `bpmn-js 17`. Push notification qua Firebase 9. Auth MSAL 3 cho tích hợp Microsoft 365.

## 1. Core runtime

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `react` | 18.3.1 | UI library |
| `react-dom` | 18.3.1 | DOM render |
| `typescript` | 4.5.4 (devDep) | Type system |
| `vite` | 7.1.3 (devDep) | Dev server + bundler |
| `@vitejs/plugin-react` | 5.1.4 | JSX/Fast Refresh |
| `vite-plugin-svgr` | 4.5.0 | Import SVG as component |

> ⚠️ Note: `package.json` devDependencies có `@types/react 17.0.37` nhưng runtime là React 18 — lệch pha types (tech debt).

## 2. Routing & Navigation

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `react-router-dom` | 7.13.1 | SPA routing |
| `react-cookie` | 4.1.1 | Cookie hook (đọc token) |
| `universal-cookie` | 4.0.4 | Server/client cookie |

## 3. HTTP & API

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `whatwg-fetch` | 3.6.2 | Fetch polyfill cho trình duyệt cũ |
| `fetch-intercept` | 2.4.0 | Interceptor cho fetch (thêm header, xử lý 401) |

> ⚠️ Không có `axios` trong dependency — toàn bộ HTTP dùng fetch + interceptor. Xem [Part 06](part-06-service-api.md).

## 4. State & Form

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `reborn-util` | 1.1.3 | Helper nội bộ (cookie, domain) |
| `reborn-validation` | 1.0.5 | Validate form nội bộ |
| `use-debounce` | 7.0.1 | Debounce hook |

> Không có Redux, Zustand, SWR, React Query, Formik, react-hook-form, yup, zod.

## 5. UI component libraries

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `ag-grid-community` | 30.2.1 | Bảng ảo (POS, kho, hoá đơn) |
| `ag-grid-react` | 30.2.1 | Bindings React cho ag-grid |
| `react-select` | 5.2.1 | Select dropdown nâng cao |
| `react-select-async-paginate` | 0.7.2 | Select với async pagination |
| `react-datepicker` | 8.10.0 | Chọn ngày/giờ |
| `react-number-format` | 4.9.0 | Format tiền tệ |
| `react-text-mask` | 5.4.3 | Mask nhập liệu (CCCD, SĐT) |
| `text-mask-addons` | 3.8.0 | Addon mask |
| `rc-slider` | 10.5.0 | Slider |
| `react-color` | 2.19.3 | Chọn màu |
| `react-colorful` | 5.6.1 | Chọn màu (nhẹ hơn) |
| `react-big-calendar` | 1.6.8 | Lịch tháng / tuần |
| `react-beautiful-dnd` | 13.1.1 | Kéo thả |
| `react-grid-layout` | 1.4.4 | Dashboard grid |
| `react-custom-scrollbars` | 4.2.1 | Custom scrollbar |
| `react-toastify` | 11.0.5 | Toast notification |
| `react-tooltip` | 4.2.21 | Tooltip cổ điển |
| `react-popper-tooltip` | 4.3.1 | Tooltip với popper |
| `@tippyjs/react` | 4.2.6 | Tooltip / popover nâng cao |
| `react-overlays` | 5.1.1 | Modal / Dropdown primitives |
| `swiper` | 11.2.10 | Slider / carousel |
| `@fancyapps/ui` | 5.0.33 | Lightbox ảnh |
| `react-to-print` | 2.14.13 | In tài liệu |
| `react-circular-progressbar` | 2.1.0 | Progress bar vòng |
| `reactour` | 1.19.0 | Tour hướng dẫn |
| `qrcode.react` | 3.1.0 | Render QR code |
| `material-icons` | 1.13.1 | Icon set |

## 6. Form editor / Rich content

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `slate` | 0.91.3 | Rich text model |
| `slate-react` | 0.91.3 | Bindings React |
| `slate-history` | 0.86.0 | Undo/redo |
| `slate-html-serializer` | 0.8.13 | HTML ↔ Slate |
| `slate-hyperscript` | 0.77.0 | Factory node |
| `dompurify` | 3.3.3 | Sanitize HTML |
| `html-react-parser` | 3.0.15 | Parse HTML → React |
| `escape-html` | 1.0.3 | Escape |
| `is-url` | 1.2.4 | Detect URL |
| `image-extensions` | 1.1.0 | Detect ảnh |
| `is-hotkey` | 0.2.0 | Hotkey cho editor |
| `jsoneditor` | 10.1.0 | JSON editor (cài đặt kỹ thuật) |
| `react-json-view` | 1.21.3 | View JSON |
| `react18-json-view` | 0.2.8 | View JSON (bản React 18) |
| `emoji-mart` | 5.4.0 | Emoji picker |
| `@emoji-mart/data` / `/react` | 1.1.0 | Data + wrapper |

## 7. Charts & Visualization

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `highcharts` | 9.3.2 | Chart engine |
| `highcharts-react-official` | 3.1.0 | React wrapper |
| `react-google-charts` | 4.0.1 | Google Charts |
| `react-funnel-pipeline` | 0.2.0 | Biểu đồ funnel (pipeline CRM) |
| `gantt-task-react` | 0.3.9 | Biểu đồ Gantt |
| `reactflow` | 11.10.1 | Biểu đồ node (BPM, automation) |

> Không dùng `recharts`, `chart.js`. Không có `leaflet` / bản đồ.

## 8. Date & Time

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `moment` | 2.29.3 | Format / parse date (legacy) |
| `date-fns` | 4.1.0 | Format / parse date (mới) |

> Đồng thời có `moment` + `date-fns` → bundle dư thừa. `vite.config.ts` tự viết plugin `momentLocaleStrip` bỏ locale không cần → tiết kiệm ~250KB.

## 9. BPM & Workflow

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `bpmn-js` | 17.8.1 | BPMN 2.0 diagram |
| `bpmn-js-properties-panel` | 5.17.1 | Properties panel BPMN |
| `camunda-bpmn-moddle` | 7.0.1 | Camunda extension |
| `react-bpmn` | 0.2.0 | Wrapper React |
| `@bpmn-io/form-js` | 1.17.0 | BPM Form engine |
| `@bpmn-io/form-js-editor` | 1.15.1 | Form editor |
| `@bpmn-io/form-js-viewer` | 1.15.0 | Form viewer |
| `@bpmn-io/properties-panel` | 3.24.0 | Properties panel shared |
| `formula-functionizer` | 1.0.4 | Compile formula |

## 10. Auth & Security

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `@azure/msal-browser` | 3.7.0 | Microsoft Auth (OAuth2) |
| `@azure/msal-react` | 2.0.9 | Wrapper React |
| `@fingerprintjs/fingerprintjs` | 5.0.1 | Device fingerprint |
| `fingerprintjs` | 0.5.3 | (Bản cũ — trùng lặp) |
| `object-hash` | 3.0.0 | Hash object |

## 11. Integration (3rd party)

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `firebase` | 9.16.0 | FCM push notification |
| `firebase-config` | 1.0.0 | Cấu hình nội bộ |
| `react-facebook-login` | 4.1.1 | Login FB (legacy) |
| `jssip` / `sip.js` | 3.10.1 / 0.8.3 | WebRTC SIP (call center) |

## 12. File, Image, Office

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `exceljs` | 4.3.0 | Export Excel (xlsx) |
| `xlsx` | 0.18.5 | Đọc Excel |
| `file-saver` | 2.0.5 | Save as |
| `favicons` | 7.2.0 | Generate favicon |
| `sharp` | 0.33.5 | Resize ảnh (build-time) |
| `exif-js` | 2.3.0 | Đọc metadata ảnh |
| `react-doc-viewer` | 0.1.5 | View PDF/Doc |

## 13. i18n & Locale

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `i18next` | 23.11.4 | Core i18n |
| `react-i18next` | 14.1.1 | Hooks cho React |

## 14. Tooling / Lint / Format

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `eslint` | 8.5.0 | Lint |
| `@typescript-eslint/*` | 5.8.0 | Rule TS |
| `eslint-plugin-react` | 7.27.1 | React rule |
| `eslint-plugin-react-hooks` | 4.3.0 | Hook rule |
| `prettier` | 2.5.1 | Format |
| `husky` | 7.0.4 | Git hook |
| `lint-staged` | 12.1.3 | Lint trên staged file |
| `playwright` | 1.59.1 (devDep) | E2E test |

## 15. Scripts

🟢 Từ `package.json`:

```json
"scripts": {
  "build": "vite build",
  "dev": "vite --mode devlocal",
  "locallaptop": "vite --mode locallaptop",
  "build:dev": "vite build --mode dev",
  "build:uat": "vite build --mode uat",
  "build:prod": "vite build --mode prod",
  "lint": "eslint --ext js,jsx,ts,tsx src/",
  "lint:fix": "eslint --fix ...",
  "type-check": "tsc --noEmit"
}
```

## 16. Version Matrix — health

| Chỉ số | Trạng thái | Ghi chú |
|--------|-----------|---------|
| React major | 18 | (React 19 đã ra) |
| TypeScript major | 4.5 | (Hiện tại 5.x) |
| Vite major | 7 | Mới, tốt |
| ag-grid | 30 | (Hiện 31+) — xem changelog breaking |
| moment | 2.29 | Legacy — nên migrate sang `date-fns` |
| react-router-dom | 7 | Mới |
| firebase | 9.16 | (Đã ra v10) |

## Tham chiếu

- Files: `package.json`, `vite.config.ts`, `tsconfig.json`.

---
*Hết Part 03. Xem tiếp [Part 04 — Routing & Navigation](part-04-routing-navigation.md).*
