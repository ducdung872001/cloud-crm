# CODE REVIEW REPORT — Cloud CRM

**Dự án:** cloud-crm (React 18.3 + TypeScript 4.5 + Vite 7.1)  
**Ngày review:** 05/04/2026  
**Branch:** reborn-retail  
**Reviewer:** Claude Code (AI-assisted)

---

## 1. TỔNG QUAN DỰ ÁN

| Metric | Giá trị |
|--------|---------|
| Framework | React 18.3 + TypeScript 4.5 + Vite 7.1 |
| Pages | ~165 (19 non-retail: BPM, HR, Treatment) |
| Components | ~130+ |
| Services | 254 files |
| Models | 128 thư mục |
| Dead code | ~13MB (audit sẵn trong DEAD_CODE_AUDIT.md) |
| Strict mode | OFF (strict: false trong tsconfig) |
| State management | React Context (UserContext) — không dùng Redux/Zustand |
| Auth | Azure MSAL + Firebase + Cookie-based token |
| i18n | i18next (Vietnamese) |

---

## 2. BẢO MẬT

### 2.1 CRITICAL

| # | Vấn đề | File | Ghi chú |
|---|--------|------|---------|
| 1_FIX | eval() trực tiếp — chạy formula user nhập | src/pages/SettingProcess/partials/ProcessedObjectList/partials/AddFormObjectBackup/index.tsx dòng 194 | Có thể chạy bất kỳ JS nào — cần thay bằng safe expression parser |
| 2_FIX | XSS qua dangerouslySetInnerHTML — không sanitize | src/pages/SettingSell/partials/Product/DetailProduct/PreviewProduct.tsx dòng 99 | product.content render thẳng HTML không qua DOMPurify |
| 3_FIX | XSS qua dangerouslySetInnerHTML — không sanitize | src/pages/WarehouseReport/components/WarehouseReportSlowView.tsx dòng 298 | String concatenation vào HTML |
| 4 | Firebase API Key lộ trong source code | src/firebase-config.ts dòng 44 | AIzaSyD-7AgYaublHnECoXgCiMpRq9UwHchLvFk |
| 5 | Firebase API Key lộ (key khác) | src/configs/firebaseConfig.js dòng 5 | AIzaSyD9OUVhQ_QR-McUSan_hG1WI_7BLE1D7Ts |
| 6 | Access token lưu localStorage — dễ bị XSS đọc | src/components/header/header.tsx dòng 97 | access_token_athena lưu localStorage |

### 2.2 HIGH

| # | Vấn đề | File | Ghi chú |
|---|--------|------|---------|
| 7 | Azure Client ID + email dev lộ | src/configs/authConfig.js dòng 15 | Comment chứa email cá nhân |
| 8 | VAPID key lộ | src/firebase-config.ts dòng 99 | Firebase push notification key |
| 9 | OmniCXM secret key trong .env | .env.dev, .env.devlocal, .env.prod | VITE_OMNICXM_KEY hardcoded |
| 10 | Thiếu Content-Security-Policy header | index.html, vite.config.ts | Không có CSP, X-Frame-Options |
| 11 | Thiếu CSRF protection | src/configs/fetchConfig.ts | Không có CSRF token trong request |
| 12 | Serveo.net tunnel URL trong env files | .env, .env.dev, .env.devlocal | Public tunnel có thể lộ internal API |

### 2.3 MEDIUM

| # | Vấn đề | File | Ghi chú |
|---|--------|------|---------|
| 13 | External script không có SRI hash | index.html | worldfone.vn WebRTC embed script |
| 14 | Permissions check chỉ ở frontend | src/utils/common.ts dòng 188 | localStorage dễ sửa bằng DevTools |
| 15 | Hardcoded API URLs | src/template/webform.js, src/utils/videoFormData.ts | URL cloud.reborn.vn cố định trong source |
| 16 | Token truyền manual trong header | src/utils/videoFormData.ts, src/services/ImageService.ts | Nên dùng HTTP-only cookie |

### 2.4 Khuyến nghị bảo mật

1. **Thay eval()** bằng thư viện safe expression (math-expression-evaluator hoặc expr-eval)
2. **Dùng DOMPurify** cho mọi dangerouslySetInnerHTML
3. **Rotate tất cả API keys** đã lộ, chuyển sang environment variables
4. **Chuyển token** từ localStorage sang HTTP-only cookie do server set
5. **Thêm CSP header** và CSRF token cho mọi request
6. **Thêm SRI hash** cho external scripts

---

## 3. CHẤT LƯỢNG CODE

### 3.1 CRITICAL

| # | Vấn đề | Số lượng | Ghi chú |
|---|--------|----------|---------|
| 1 | Type "any" tràn lan | ~3,973 instances | tsconfig strict: false cho phép implicit any |

**Các file tiêu biểu dùng any nhiều:**
- src/components/input/input.tsx — tất cả event handlers typed any
- src/components/input/numericInput.tsx — tương tự
- src/components/datepickerCustom/datepickerCustom.tsx — mọi props dùng any
- src/components/ChartComponent/partials/*.tsx — props: any
- src/utils/mapConfigData.ts — heavy any usage
- src/webrtc/useSTWebRTC.ts — callback handlers dùng any

### 3.2 HIGH

| # | Vấn đề | Số lượng | Ghi chú |
|---|--------|----------|---------|
| 2 | console.log trong production code | 100+ instances | Đặc biệt: useSTWebRTC.ts (19 lần), App.tsx, firebase-config.ts |
| 3 | TODO/FIXME chưa xử lý | 100+ instances | AddZaloMarketting.tsx (17 TODO), AddTemplateZalo.tsx (17 TODO) |

**Top offenders console.log:**
- src/webrtc/useSTWebRTC.ts — 19 console.log statements
- src/App.tsx dòng 253 — notification logging
- src/utils/validate.ts dòng 332 — debug log "okokok>"
- src/components/editor/reborn/plugins/withMedias.tsx — 8 debug logs
- src/hooks/useDashBoard.ts — dashboard data logging

### 3.3 MEDIUM

| # | Vấn đề | Số lượng | Ghi chú |
|---|--------|----------|---------|
| 4 | Empty catch blocks | 5 instances | App.tsx:303, BarcodePrintModal.tsx:23, AddProductPage.tsx:255 |
| 5 | Direct DOM manipulation | 67 instances | document.getElementById, getElementsByClassName |
| 6 | Naming convention không nhất quán | 10+ files | snake_case lẫn camelCase (useSTWebRTC.ts, GridFormSetting) |
| 7 | Code bị comment-out để lại | 25+ files | Nhiều block lớn trong BPM, Package, ConfigCondition |
| 8 | Duplicate code patterns | 10+ patterns | Draggable modal copy 5 lần, validation copy 4 lần |

**Chi tiết duplicate code:**
- Draggable modal logic copy giống nhau ở 5 file:
  - src/pages/CallCenter/partials/WebRtcPhoneModal/index.tsx
  - src/pages/CallCenter/partials/AddPhoneModal/index.tsx
  - src/pages/CallCenter/partials/WebRtcCallIncomeModal/index.tsx
  - src/pages/ChatBot/index.tsx
  - src/pages/UserTaskList/partials/.../ModalCallCustomer/index.tsx
- makeValidateField.ts duplicate ít nhất 4 nơi
- Zalo template pattern duplicate 2 file (17 TODO blocks mỗi file)

---

## 4. HIỆU NĂNG

### 4.1 CRITICAL

| # | Vấn đề | Chi tiết |
|---|--------|----------|
| 1 | Không có code splitting | Zero React.lazy(), zero Suspense — 165 pages load đồng bộ |
| 2 | Component khổng lồ | CreateCampaign.tsx có 81 useState calls |
| 3 | React.memo gần như không dùng | Chỉ 12 lần toàn bộ project |

### 4.2 HIGH

| # | Vấn đề | Số lượng | Ghi chú |
|---|--------|----------|---------|
| 4 | key={index} thay vì unique ID | 1,590 instances | Gây lỗi khi reorder/filter list |
| 5 | Full lodash import | 46+ files | import _ from "lodash" — load toàn bộ library |
| 6 | moment.js vẫn dùng | 30+ files | date-fns đã có trong dependencies nhưng không dùng |
| 7 | useCallback gần như không dùng | ~1 lần | Inline functions tạo lại mỗi render |

### 4.3 MEDIUM

| # | Vấn đề | Chi tiết |
|---|--------|----------|
| 8 | Image không lazy load | Toàn bộ img tags không có loading="lazy" |
| 9 | JSON.stringify trong render path | App.tsx dòng 116 — so sánh user object bằng JSON.stringify |
| 10 | useEffect thiếu cleanup / dependency sai | 19+ files — API calls trong [] không abort |
| 11 | Inline style/function objects | 100+ — tạo object mới mỗi render |

### 4.4 Khuyến nghị hiệu năng

1. **Thêm React.lazy() + Suspense** cho route-level code splitting — giảm initial bundle đáng kể
2. **Replace import _ from "lodash"** → import cụ thể: import debounce from "lodash/debounce"
3. **Migrate moment → date-fns** (đã có sẵn trong dependencies)
4. **Tách CreateCampaign.tsx** (81 useState) thành nhiều sub-components
5. **Thêm React.memo** cho components hay re-render (boxTable, header, filter)
6. **Fix key={index}** → dùng item.id hoặc unique key

---

## 5. KIẾN TRÚC & MAINTAINABILITY

### 5.1 Dead Code

| Loại | Số lượng | Chi tiết |
|------|----------|----------|
| Non-retail pages | 19 thư mục (~12MB) | BPM, ProjectList, BusinessRule, Treatment, HR/Timekeeping |
| Unused services | 13 files | Real estate domain: ElectricityMeter, WaterRate, Vehicle, ParkingFee |
| Unused models | 12 thư mục | earnings, rentalType, KPI variants, treatment |
| Backup files | 5+ files | EmailListBackup.tsx, GridAgTable_old.tsx, BusinessProcessList copy.tsx |

### 5.2 Architectural Issues

| # | Vấn đề | Chi tiết |
|---|--------|----------|
| 1 | Monolithic CRM | Retail + Beauty/Spa + Real Estate + BPM + HR trong 1 bundle |
| 2 | 1 Context duy nhất | UserContext — không có state management rõ ràng |
| 3 | 254 service files | Nhiều file duplicate fetch + JSON.stringify pattern |
| 4 | Validation duplicated | makeValidateField.ts copy ít nhất 4+ nơi |
| 5 | Hardcoded URLs | 50+ endpoints trong src/configs/urls.ts, một số dev/test lẫn prod |

---

## 6. TỔNG HỢP ĐỀ XUẤT THEO ƯU TIÊN

### Phải fix ngay (CRITICAL)

| # | Hành động | Lý do |
|---|-----------|-------|
| 1 | Xóa eval() — thay bằng safe expression parser | Lỗ hổng RCE (Remote Code Execution) |
| 2 | Sanitize dangerouslySetInnerHTML bằng DOMPurify | Lỗ hổng XSS |
| 3 | Rotate API keys đã lộ, chuyển sang env vars | Credentials bị lộ public |
| 4 | Chuyển access token từ localStorage → HTTP-only cookie | XSS có thể đánh cắp token |

### Nên fix sớm (HIGH)

| # | Hành động | Lý do |
|---|-----------|-------|
| 5 | Bật strict: true trong tsconfig, fix any types dần | Type safety, giảm runtime bugs |
| 6 | Thêm React.lazy() cho route-level code splitting | Bundle quá lớn, load chậm |
| 7 | Replace full lodash/moment imports | Bundle size optimization |
| 8 | Xóa console.log (prod build đã drop, nhưng dev vẫn nhiễu) | Clean code |
| 9 | Dọn dead code theo DEAD_CODE_AUDIT.md | Giảm ~13MB code thừa |
| 10 | Thêm CSP header, CSRF protection | Bảo mật cơ bản |

### Fix khi có thời gian (MEDIUM)

| # | Hành động | Lý do |
|---|-----------|-------|
| 11 | Thêm React.memo / useCallback cho components hay re-render | Performance |
| 12 | Fix key={index} → unique key (1,590 chỗ) | List rendering bugs |
| 13 | Tách components quá lớn (CreateCampaign 81 useState) | Maintainability |
| 14 | Extract duplicate patterns (draggable, validation) | DRY principle |
| 15 | Replace empty catch blocks bằng proper error handling | Debugging |
| 16 | Chuyển DOM manipulation sang React refs | React best practices |

---

## 7. THỐNG KÊ TỔNG HỢP

| Danh mục | Số lượng vấn đề |
|----------|-----------------|
| Bảo mật CRITICAL | 6 |
| Bảo mật HIGH | 6 |
| Bảo mật MEDIUM | 4 |
| Chất lượng code CRITICAL | 1 (any types) |
| Chất lượng code HIGH | 2 (console.log, TODO) |
| Chất lượng code MEDIUM | 5 |
| Hiệu năng CRITICAL | 3 |
| Hiệu năng HIGH | 4 |
| Hiệu năng MEDIUM | 4 |
| Kiến trúc | 5 |
| **TỔNG** | **40 vấn đề** |

---

*Report generated by Claude Code (AI-assisted review)*  
*Ngày: 05/04/2026*
