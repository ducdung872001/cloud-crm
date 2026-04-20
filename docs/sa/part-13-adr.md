# Part 13 — Architectural Decision Records (ADRs)

## Executive Summary

Part này ghi lại **18 quyết định kiến trúc** quan trọng đã/đang áp dụng trong Reborn CRM. Mỗi ADR theo template Michael Nygard: **Trạng thái, Bối cảnh, Quyết định, Hậu quả**. Một số ADR phản ánh quyết định **đã có** trong code (vd dùng React, dùng Vite, dùng Context thay Redux); một số là **đề xuất** dựa trên phân tích — đánh dấu rõ.

---

## Format ADR

```
## ADR-NN — Tiêu đề

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | Proposed / Accepted / Deprecated / Superseded by ADR-XX |
| **Ngày** | YYYY-MM-DD |
| **Tác giả** | Tên |
| **Bối cảnh** | Tại sao cần quyết định? Vấn đề gì? |
| **Quyết định** | Chọn cái gì? |
| **Lựa chọn khác** | Đã cân nhắc gì khác? Tại sao không chọn? |
| **Hậu quả** | Gì tốt lên? Gì tệ đi? Cần chuẩn bị gì? |
```

---

## ADR-01 — Dùng React 17 + TypeScript làm framework frontend

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted (đã triển khai) |
| **Ngày** | 2021-2022 (estimated) |
| **Bối cảnh** | Cần SPA framework cho enterprise CRM với hàng trăm trang, tích hợp nhiều thư viện UI, ecosystem mature, TypeScript hỗ trợ tốt. |
| **Quyết định** | Dùng **React 17** + **TypeScript 4.5**. |
| **Lựa chọn khác** | Vue 3 (ecosystem nhỏ hơn cho enterprise), Angular 13 (quá cồng kềnh), Svelte (chưa mature đủ thời điểm 2021). |
| **Hậu quả** | ✅ Ecosystem cực lớn, dễ tuyển dev<br>✅ TypeScript tích hợp tốt<br>⚠️ React 17 đã cũ (hiện tại đã có React 19), thiếu concurrent features<br>📋 **Action**: lên kế hoạch upgrade React 18+ |

---

## ADR-02 — Migrate từ Webpack sang Vite

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted (vừa hoàn thành 2026-04) |
| **Ngày** | 2026-04 |
| **Tác giả** | Đội Reborn |
| **Bối cảnh** | Webpack dev server cold start mất hơn 30s. HMR chậm. Build production nặng. Vite dùng ESM native + esbuild → faster. |
| **Quyết định** | Migrate toàn bộ build sang **Vite 8** + Rollup. |
| **Lựa chọn khác** | Tiếp tục Webpack 5 (status quo), Turbopack (chưa ổn định), esbuild thuần (thiếu plugin). |
| **Hậu quả** | ✅ Dev cold start < 3s<br>✅ HMR < 200ms<br>✅ Build production nhanh hơn ~3x<br>⚠️ Một số plugin Webpack không có equivalent → phải tìm thay thế (vd swiper module imports phải sửa)<br>⚠️ Bundle output cấu trúc khác → cần update nginx config |

> **Migration log**: Quá trình migration đã được thực hiện trong session này (2026-04-14), bao gồm sửa Vite config nhiều lần để khớp với layout webpack cũ, fix lỗi Swiper v11 import, xử lý nginx fallback `try_files`.

---

## ADR-03 — Dùng react-router-dom v6 (single Route table)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | App có 167 page module cần URL routing client-side. |
| **Quyết định** | Dùng **react-router-dom v6** với 1 file [`configs/routes.tsx`](../../src/configs/routes.tsx) chứa cả menu config + route table flat. |
| **Lựa chọn khác** | Next.js (file-based routing, SSR — nhưng đây không phải Next, Reborn dùng SPA pure), TanStack Router (mới, chưa mature). |
| **Hậu quả** | ✅ Centralized routing dễ maintain<br>✅ Permission filter trên menu dễ implement<br>⚠️ File 1179 dòng đang phình to → cân nhắc tách theo bounded context<br>⚠️ Không có file-based routing — phải nhớ thêm route khi tạo page mới |

---

## ADR-04 — Không dùng Redux mà dùng Context API

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Cần global state cho user, auth, UI flags, call session. |
| **Quyết định** | Dùng **React Context API** với 5 contexts (`auth`, `user`, `ui`, `call`, `index`) + custom hooks cho data fetching. |
| **Lựa chọn khác** | Redux (boilerplate nhiều, learning curve), MobX (magic), Zustand (nhỏ nhưng mới với team), Recoil (Facebook bỏ rơi). |
| **Hậu quả** | ✅ Đơn giản, dev mới dễ hiểu<br>✅ Không cần action/reducer/selector boilerplate<br>⚠️ Re-render mọi consumer khi context value đổi → hiệu năng kém với data thay đổi nhiều<br>⚠️ Không có dev tool tốt như Redux DevTools<br>📋 **Mitigation**: Tách `callContext` riêng vì call state thay đổi liên tục, không trộn vào userContext |

---

## ADR-05 — Multi-tenant qua row-level isolation (`tenantId` column)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted (suy luận) |
| **Bối cảnh** | Reborn có hàng nghìn tenant. Cần cô lập dữ liệu nhưng không thể có nghìn DB. |
| **Quyết định** | Mọi entity có cột `tenant_id` + `branch_id`. Mọi query filter qua. Header `Hostname` xác định tenant ở mức request. |
| **Lựa chọn khác** | Database per tenant (đắt, ops phức tạp), Schema per tenant (giới hạn ~1000 schema), Hybrid. |
| **Hậu quả** | ✅ Scale tốt, dùng chung tài nguyên<br>✅ Đơn giản query<br>⚠️ Lỗi query thiếu `WHERE tenant_id` → leak data tenant<br>📋 **Mitigation**: Đề xuất dùng **PostgreSQL Row Level Security** để DB tự enforce |

---

## ADR-06 — Client-side API Gateway (URL prefix routing)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ⚠️ Accepted hiện tại, đề xuất review |
| **Bối cảnh** | Backend là microservices (sales, finance, inventory...). Frontend cần biết gọi service nào. |
| **Quyết định** | Frontend tự routing qua URL prefix (`/bizapi/sales`, `/bizapi/finance`...) trong [`fetchConfig.ts`](../../src/configs/fetchConfig.ts). Mỗi prefix map sang env var khác nhau. |
| **Lựa chọn khác** | Server-side API Gateway (Kong, Nginx, Traefik, Apigee). |
| **Hậu quả** | ✅ Đơn giản, không cần thêm hop<br>⚠️ Frontend phải biết tất cả service URLs<br>⚠️ CORS phải config nhiều subdomain<br>⚠️ Khó áp common policy (rate limit, logging) ở 1 chỗ<br>📋 **Đề xuất**: Migrate sang server-side gateway khi scale > 20 services |

---

## ADR-07 — Service layer pattern với apiHelper wrapper

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | 240 service file gọi API. Cần tránh duplicate code fetch + JSON parse. |
| **Quyết định** | Mọi service dùng `apiGet`/`apiPost`/`apiPut`/`apiDelete` từ `services/apiHelper.ts`. Không gọi `fetch()` trực tiếp. |
| **Hậu quả** | ✅ DRY, dễ maintain<br>✅ Có 1 chỗ duy nhất để add interceptor, retry, cache<br>⚠️ Một số service legacy còn dùng `fetch()` trực tiếp → cần audit và migrate |

---

## ADR-08 — ag-grid cho bảng lớn

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Một số trang (Customer list, Invoice list) có hàng nghìn dòng. HTML table render chậm. |
| **Quyết định** | Dùng **ag-grid-community 30** (free version) với React wrapper. Virtual scrolling, không re-render mọi cell. |
| **Lựa chọn khác** | TanStack Table (headless, phải tự style), MUI DataGrid (đẹp nhưng cần MUI ecosystem), react-table (cũ). |
| **Hậu quả** | ✅ Render mượt với 10k+ dòng<br>✅ Built-in sort, filter, pagination<br>⚠️ Bundle size lớn (~500KB)<br>⚠️ Style customization khó<br>⚠️ Một số feature bị paywall (Enterprise version) |

---

## ADR-09 — Không có refresh token logic ở frontend (gap)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ⚠️ Accepted nhưng có technical debt |
| **Bối cảnh** | Khi access token hết hạn, frontend nhận 401 → interceptor xóa cookie → user bị đẩy về login. UX kém vì user đang gõ form bị mất hết. |
| **Quyết định** (hiện tại) | Khi 401: clear cookie, để user redirect login ở next render. |
| **Đề xuất tương lai** | Implement refresh token rotation: catch 401 → call `/oauth/refresh` → retry original request → user không bị logout. |
| **Hậu quả hiện tại** | ❌ UX kém với session dài<br>📋 **Action**: implement trong sprint tới |

---

## ADR-10 — Soft delete cho hầu hết entity

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Cần audit trail. Khách hàng / đơn hàng / hóa đơn không được mất. Pháp luật yêu cầu giữ. |
| **Quyết định** | Mọi entity nghiệp vụ có cột `deleted_at TIMESTAMPTZ NULL`. Query mặc định filter `deleted_at IS NULL`. |
| **Lựa chọn khác** | Hard delete + audit log table. |
| **Hậu quả** | ✅ Recover dễ (chỉ set lại `deleted_at = NULL`)<br>✅ Audit trail tự nhiên<br>⚠️ Index phải có `WHERE deleted_at IS NULL` (partial index)<br>⚠️ Query không cẩn thận → return cả deleted row |

---

## ADR-11 — Lazy load mọi page qua React.lazy()

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | 167 page → bundle initial sẽ rất nặng nếu load hết. |
| **Quyết định** | Mọi page trong [`routes.tsx`](../../src/configs/routes.tsx) đều dùng `React.lazy(() => import("..."))`. Mỗi page = 1 chunk JS. |
| **Hậu quả** | ✅ Initial bundle nhỏ hơn nhiều<br>✅ Cache hit cao (trang user không vào không cần load)<br>⚠️ Lần đầu load page chậm hơn (cần download chunk)<br>📋 **Mitigation**: Suspense fallback hiển thị loading; preload chunks khi hover menu |

---

## ADR-12 — Camunda BPM Engine cho workflow phức tạp

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Có nghiệp vụ cần workflow approval (phê duyệt giảm giá, hợp đồng, quy trình duyệt khách VIP). Hardcode if-else không scale. |
| **Quyết định** | Tích hợp **Camunda BPMN Engine** chạy ở service riêng (`process.env.APP_BPM_URL`). Frontend dùng **bpmn-js** + **@bpmn-io/form-js** để thiết kế workflow trực quan. |
| **Lựa chọn khác** | Hardcode Java/Node logic, n8n (lighter), Temporal (code-first), Zeebe (Camunda Cloud). |
| **Hậu quả** | ✅ Business analyst tự thiết kế workflow không cần code<br>✅ Visual diagram dễ hiểu<br>⚠️ Camunda nặng (Java), thêm 1 service phải maintain<br>⚠️ Bundle frontend lớn vì bpmn-js (~2MB) |

---

## ADR-13 — Custom field model cho hồ sơ khách hàng

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ✅ Accepted |
| **Bối cảnh** | Khách hàng Reborn có nhiều ngành (spa, gym, co-working, homestay) — mỗi ngành cần trường data khác nhau cho khách. Không thể có 1 schema cứng. |
| **Quyết định** | Có core fields cố định (name, phone, email, gender) + **custom fields động** lưu trong table `customer_extra_info` với cấu trúc EAV (Entity-Attribute-Value). Tenant tự định nghĩa fields ở [`SettingCustomer → Định nghĩa trường bổ sung`](../urd/part-03-thanh-vien.md#ur-member-15--định-nghĩa-trường-thông-tin-bổ-sung). |
| **Lựa chọn khác** | JSON column (Postgres JSONB) — query khó, không index theo field cụ thể. |
| **Hậu quả** | ✅ Linh hoạt cho mọi ngành<br>⚠️ Query phức tạp (cần JOIN extra table)<br>⚠️ Performance kém với khách có nhiều custom field<br>⚠️ `fieldCode` không được đổi sau khi tạo (CN-07) — gây ràng buộc UX |

---

## ADR-14 — Hardcode Hostname header (BUG, sẽ fix)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | ⚠️ Bug — cần fix trước production |
| **Bối cảnh** | Trong [`fetchConfig.ts:42`](../../src/configs/fetchConfig.ts#L42), header `Hostname` đang hardcode `"kcn.reborn.vn"` cho dev. |
| **Quyết định** (đề xuất) | Đọc từ `location.hostname` runtime, không hardcode. |
| **Hậu quả nếu không fix** | 🔴 **Critical**: deploy production sẽ load nhầm tenant<br>📋 **Action**: fix trong sprint tới, ưu tiên cao |

---

## ADR-15 — API Versioning (chưa có, đề xuất)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | 📋 Proposed |
| **Bối cảnh** | Hiện tại API URL không có version (`/api/customer/filter`). Khi backend đổi shape → frontend break ngay. Không có gradual rollout. |
| **Đề xuất** | URL versioning: `/api/v1/customer/filter`, `/api/v2/customer/filter`. Frontend bind vào version cụ thể qua env var. |
| **Lựa chọn khác** | Header versioning (`Accept: application/vnd.reborn.v2+json`), Query param (`?version=2`). |
| **Hậu quả** | ✅ Backend có thể deploy v2 song song v1 → migrate dần frontend<br>⚠️ Phải maintain 2 version song song một thời gian<br>📋 **Cần**: tài liệu rõ deprecation policy |

---

## ADR-16 — Không có refresh token rotation (đề xuất)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | 📋 Proposed |
| **Bối cảnh** | Refresh token nếu bị steal có thể dùng vô thời hạn. Best practice là rotate mỗi lần dùng. |
| **Đề xuất** | Khi frontend gọi `/oauth/refresh` với refresh_token A → backend trả về access_token mới + refresh_token B. A bị invalidate. Nếu attacker dùng A → biết là leak → revoke toàn bộ session user. |
| **Hậu quả** | ✅ Bảo mật cao hơn<br>⚠️ Phức tạp hơn — phải store toàn bộ refresh token<br>📋 **Cần**: thiết kế DB schema cho token rotation |

---

## ADR-17 — Bundle size optimization (đề xuất action)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | 📋 Proposed |
| **Bối cảnh** | Bundle production hiện ~20MB raw / 5MB gzip — quá lớn so với best practice. Lý do: bpmn-js, ag-grid, slate, exceljs đều load eager. |
| **Đề xuất** | Lazy load các module nặng:<br>1. **bpmn-js** chỉ load khi vào page BPM<br>2. **slate** chỉ khi mở rich text editor<br>3. **exceljs/xlsx** chỉ khi user export<br>4. **highcharts** chỉ khi vào trang báo cáo<br>5. Tách thêm `manualChunks`: `editor`, `chart`, `bpmn`, `excel`<br>6. Cân nhắc dynamic import |
| **Lợi ích dự kiến** | Initial bundle giảm 60-70%, page load lần đầu ≤ 3s |
| **Effort** | 1-2 sprint |

---

## ADR-18 — Chuẩn hóa date library (đề xuất)

| Trường | Nội dung |
|--------|----------|
| **Trạng thái** | 📋 Proposed |
| **Bối cảnh** | Codebase đang dùng **đồng thời** `moment` 2.29 và `date-fns` 4.1. Tăng bundle size, gây nhầm lẫn. |
| **Đề xuất** | Thống nhất về **date-fns** (lighter, modular, immutable, treeshakable). Migrate dần các chỗ dùng moment. |
| **Lựa chọn khác** | Day.js (API tương tự moment, 2KB), Temporal API (proposal, chưa stable). |
| **Hậu quả** | ✅ Bundle nhỏ hơn ~70KB<br>✅ API nhất quán<br>⚠️ Effort migration lớn vì moment dùng khắp nơi |

---

## Bảng tổng hợp ADR

| ID | Tiêu đề | Trạng thái | Mức ưu tiên |
|----|---------|:----------:|:-----------:|
| ADR-01 | React 17 + TypeScript | ✅ Accepted | — |
| ADR-02 | Migrate Webpack → Vite | ✅ Accepted | Done |
| ADR-03 | react-router-dom v6 | ✅ Accepted | — |
| ADR-04 | Context API thay Redux | ✅ Accepted | — |
| ADR-05 | Multi-tenant row-level | ✅ Accepted | — |
| ADR-06 | Client-side API Gateway | ⚠️ Review | Med |
| ADR-07 | Service layer + apiHelper | ✅ Accepted | — |
| ADR-08 | ag-grid cho bảng lớn | ✅ Accepted | — |
| ADR-09 | Không có refresh token logic | ⚠️ Bug | High |
| ADR-10 | Soft delete | ✅ Accepted | — |
| ADR-11 | Lazy load page | ✅ Accepted | — |
| ADR-12 | Camunda BPM Engine | ✅ Accepted | — |
| ADR-13 | Custom field EAV model | ✅ Accepted | — |
| ADR-14 | Hardcode Hostname (BUG) | 🔴 Bug | **Critical** |
| ADR-15 | API versioning | 📋 Proposed | High |
| ADR-16 | Refresh token rotation | 📋 Proposed | Med |
| ADR-17 | Bundle size optimization | 📋 Proposed | High |
| ADR-18 | Chuẩn hóa date library | 📋 Proposed | Low |

**Thống kê:**
- ✅ Accepted: 12
- ⚠️ Review/Bug: 2
- 🔴 Critical bug: 1
- 📋 Proposed: 4

---

## Cách viết ADR mới

Khi đội cần ra quyết định kiến trúc mới:

1. **Tạo file** `docs/sa/adr/ADR-NN-<title>.md`
2. **Format** theo template trên
3. **Submit PR** để team review
4. **Sau khi merge**: cập nhật bảng tổng hợp này
5. **Trạng thái thay đổi**: thay vì sửa ADR cũ, tạo ADR mới với link `Superseded by ADR-XX`

---

*Hết Part 13.*
