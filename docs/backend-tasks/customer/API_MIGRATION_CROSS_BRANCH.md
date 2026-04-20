# Migration đầu API `/customer` — hướng dẫn áp dụng cho mọi nhánh CRM

**Ngày tạo:** 2026-04-20
**Nhánh gốc áp dụng đầu tiên:** `hotfix/migrate-customer-api-biz-reborn` (từ `reborn-retail`)
**Commit gốc:** `460ecb59` (4 module) + `5cc54d78` (fix upload URL) + commit contact bổ sung
**Nhánh cần áp dụng sau:** `community-hub`, `reborn-loyalty`, `reborn-fitpro`, `reborn-retail` (merge back từ hotfix), các nhánh CRM tenant khác dùng chung `cloud-crm`.

---

## 1. Mục tiêu

Chuyển 5 module **Khách hàng / Người liên hệ / Phân quyền / Nhân viên / Phòng ban** từ đầu API cũ `https://cloud.reborn.vn/adminapi/*` sang đầu API mới `https://biz.reborn.vn/customer/*`. Các module khác giữ nguyên.

> **Cập nhật 2026-04-20**: Module **Người liên hệ (contact)** bổ sung sau, +27 endpoint trong 5 block `contact`, `contactPipeline`, `contactStatus`, `contactAttribute`, `contactExtraInfo`. Script dưới đây đã bao gồm.

---

## 2. Thay đổi cốt lõi — apply nguyên văn cho mọi nhánh

### 2.1 `src/configs/urls.ts`
Thêm hằng số ngay sau `prefixAdmin`:
```ts
const prefixAdmin = "/adminapi";
// Đầu API mới cho Customer/Employee/Department/Role/Permission
// Prod mặc định: https://biz.reborn.vn/customer; override bằng env APP_CUSTOMER_API_URL.
const prefixCustomer = (process.env.APP_CUSTOMER_API_URL || "https://biz.reborn.vn") + "/customer";
```

Swap `prefixAdmin` → `prefixCustomer` trong 17 block (181 endpoint). Dùng script này tại `cloud-crm` root:

```bash
# Script này tìm block bằng tên key top-level rồi swap prefix, auto-detect braces.
# Đã chạy trên hotfix gốc; nếu nhánh khác có struct giống sẽ cho số count tương đương.
node -e "$(cat <<'JS'
const fs = require('fs');
const F = 'src/configs/urls.ts';
const lines = fs.readFileSync(F, 'utf8').split(/\r?\n/);
const targets = [
  {key:'customer'}, {key:'historySend'}, {key:'employee'}, {key:'employeeAgent'},
  {key:'teamEmployee'}, {key:'department'}, {key:'role'}, {key:'customerGroup'},
  {key:'customerSource'}, {key:'customerMarketingLead'}, {key:'customerView'},
  {key:'reportCustomer', filter: /"\/customer\//},
  {key:'customerField'}, {key:'customerAttribute'}, {key:'customerExtraInfo'},
  {key:'permission'}, {key:'rolePermission'},
  // Bổ sung 2026-04-20: module contact
  {key:'contact'}, {key:'contactPipeline'}, {key:'contactStatus'},
  {key:'contactAttribute'}, {key:'contactExtraInfo'},
];
function findBlock(k){const re=new RegExp('^  '+k+':\\\\s*\\\\{');const s=lines.findIndex(l=>re.test(l));if(s<0)return null;let d=0;for(let i=s;i<lines.length;i++){for(const c of lines[i]){if(c==='{')d++;else if(c==='}'){d--;if(d===0)return{s,e:i}}}}return null}
let total=0;
for(const t of targets){const b=findBlock(t.key);if(!b){console.log(t.key+': NOT FOUND');continue}let c=0;for(let i=b.s;i<=b.e;i++){const l=lines[i];if(!l.includes('prefixAdmin +'))continue;if(t.filter&&!t.filter.test(l))continue;lines[i]=l.replace('prefixAdmin +','prefixCustomer +');c++}console.log(t.key+': '+c);total+=c}
fs.writeFileSync(F, lines.join('\n'));
console.log('TOTAL: '+total);
JS
)"
```
Trên nhánh gốc (sau khi thêm contact) cho output `TOTAL: 208` (181 + 27). Nếu nhánh khác cho số khác → đối chiếu cụ thể.

### 2.2 `vite.config.ts`
Thêm `APP_CUSTOMER_API_URL` vào 2 chỗ: mảng `requiredEnvVars` và object `productionDefaults`:
```diff
       "APP_UPLOAD_URL",
       "APP_ATHENA_URL",
+      "APP_CUSTOMER_API_URL",
     ];
     ...
       APP_SSO_LINK: "https://sso.reborn.vn",
       APP_DOMAIN: "reborn.vn",
+      APP_CUSTOMER_API_URL: "https://biz.reborn.vn",
     } : {};
```

### 2.3 `src/utils/document.ts` — 2 URL hard-code
Hai hàm `uploadDocumentFormData` (line ~58) và `uploadDocumentDirectFormData` (line ~148) vẫn trỏ trực tiếp vào `/adminapi/customer/import*`. Fix:

```diff
 let xhr = new XMLHttpRequest();
 const linkUpload = process.env.APP_API_URL;
+const customerApiBase = process.env.APP_CUSTOMER_API_URL || "https://biz.reborn.vn";
 const importBPM = process.env.APP_BPM_URL;
 xhr.open("POST",
   `${type ? type === "customer"
-    ? `${linkUpload}/adminapi/customer/import/uploadFile?custType=${parmas}`
+    ? `${customerApiBase}/customer/customer/import/uploadFile?custType=${parmas}`
```
```diff
-xhr.open("POST", `https://cloud.reborn.vn/adminapi/customer/import`);
+const customerApiBase = process.env.APP_CUSTOMER_API_URL || "https://biz.reborn.vn";
+xhr.open("POST", `${customerApiBase}/customer/customer/import`);
```

> **Ghi chú:** `uploadDocumentDirectFormData` hiện là dead code trong nhánh `reborn-retail` (không component active nào import). Vẫn fix cho nhất quán, vì nhánh khác có thể còn đang dùng.

---

## 3. Issue còn treo — cần quyết định ở cấp tổ chức, chưa tự fix

### 3.1 `src/template/webform.js` — script nhúng cho landing page của khách hàng
File này là **embed script public** được các trang landing của khách hàng nhúng sẵn qua CDN. Hiện hard-code:

```js
// line 10
t.open("POST", "https://cloud.reborn.vn/adminapi/customer/update/webform", true);
// line 80
const response = await fetch("https://cloud.reborn.vn/adminapi/contact/update/landingPage", ...);
// line 108
const response = await fetch("https://cloud.reborn.vn/adminapi/contact/update/webform", ...);
```

**Vấn đề:** Nếu backend shutdown `cloud.reborn.vn/adminapi/customer/update/webform`, **mọi landing page đang sống của khách hàng** sẽ mất khả năng submit form → mất lead.

**Các lựa chọn (cần PM/backend confirm trước khi action):**
- **(A) BE giữ proxy song song:** Cho `cloud.reborn.vn/adminapi/customer/update/webform` forward sang `biz.reborn.vn/customer/customer/update/webform` → không đổi script, zero impact khách hàng.
- **(B) Đổi script + chạy campaign re-embed:** Cần gửi notice cho mọi khách hàng đã nhúng script, kèm version mới. Rủi ro cao vì khách có thể không update.
- **(C) Versioned script URL:** Phát hành `webform.v2.js` trỏ endpoint mới, giữ `webform.js` cũ chạy song song trên endpoint cũ. Cần BE giữ 2 service.

**Action item:**
- [ ] PM/BE chọn phương án A/B/C trước `2026-04-27`.
- [ ] Nếu chọn A: xác nhận proxy đã dựng, script giữ nguyên.
- [ ] Nếu chọn B/C: CRM team build bản mới; Marketing gửi announcement.

### 3.2 `src/template/other.html` và `src/template/index.html` — tracking pixel
Cả 2 template email chứa:
```html
<img src="https://cloud.reborn.vn/adminapi/email/tracking?trackingId={{tracking_id}}" />
```
`/adminapi/email/tracking` KHÔNG thuộc 4 module đã migrate (nó là module Email/Marketing). **Giữ nguyên** — không sửa.

### 3.3 `src/pages/SocialCrmZalo/partials/ListChat/index.tsx:147`
WebSocket `wss://cloud.reborn.vn/chat/ws/zalo/${id}` — thuộc service Chat, không thuộc 4 module. **Giữ nguyên**.

### 3.4 `src/pages/SocialCrm/SocialCrm.tsx:83`
OAuth redirect dùng `betacloud.reborn.vn/adminapi/zalo/redirect` — thuộc module Zalo Integration, không thuộc 4 module. **Giữ nguyên**.

### 3.5 `src/configs/urls.ts:1628` (và một số dòng khác ngoài 4 module)
Các dòng sau vẫn dùng `prefixAdmin` và gọi endpoint có chữ `customer` hoặc `employee`, nhưng **thuộc về module khác** (campaign, invoice, placeholder, callCenter, userTask, v.v.) — đã xác nhận giữ nguyên:
- `estimate.takeEstimate: prefixAdmin + "/customer/estimate"`
- `reportCustomer.totalContract/Revenue/pipeline/*: prefixAdmin + "/contract/..."`
- `placeholder.customer: prefixAdmin + "/customer/placeholder"`
- `campaign.sendEmail: prefixAdmin + "/customer/campaign/send/email"`
- `userTask.employeeManagers/Assignees: prefixAdmin + "/employee/..."`
- `callCenter.customerCallList: prefixAdmin + "/customerCall/list"`
- `marketingAutomation.*Customer: prefixAdmin + "/maCustomer/..."`

Nếu về sau backend tiếp tục tách service (ví dụ campaign về `biz.reborn.vn/campaign`), sẽ cần migrate đợt tiếp theo.

---

## 4. Kiểm tra CORS & Auth — cross-cutting concern

Khi chuyển từ URL relative (`/adminapi/*`) sang URL tuyệt đối (`https://biz.reborn.vn/*`), browser chuyển từ same-origin sang cross-origin. BE phải bảo đảm:

1. **CORS preflight**: `Access-Control-Allow-Origin` phải list đủ domain frontend (prod + staging + các tenant whitelabel).
2. **Credentials**: `Access-Control-Allow-Credentials: true` + FE gọi `withCredentials: true` trong RestService. Kiểm tra `src/services/RestService.ts`.
3. **Auth header**: `Authorization: Bearer {token}` phải được forward đúng. Nếu BE cũ dùng session cookie same-origin, BE mới phải chuyển sang token-based hoặc share cookie qua subdomain `.reborn.vn`.
4. **Tenant routing (`Hostname` header)**: các script dùng `xhr.setRequestHeader("Hostname", location.hostname)` — BE mới phải hiểu header này để route đúng tenant.

**Action item (backend):**
- [ ] BE confirm `https://biz.reborn.vn/customer/*` đã dựng đủ 181 endpoint (list đầy đủ trong `tests/cases/TC-MIGRATE-CUSTOMER-API.md`).
- [ ] BE confirm CORS + credentials + Hostname header hoạt động OK.
- [ ] BE cung cấp endpoint healthcheck `GET /customer/health` để FE smoke-test.

---

## 5. Quy trình apply cho nhánh khác

Với mỗi nhánh `community-hub`, `reborn-loyalty`, `reborn-fitpro`, v.v.:

```bash
git checkout <nhánh đích>
git pull

# Tuỳ chọn A: cherry-pick commit từ hotfix (nếu file configs/urls.ts chưa phân hoá quá)
git cherry-pick 460ecb59

# Tuỳ chọn B: apply tay theo mục 2.1, 2.2, 2.3 + chạy script Node trong 2.1

# Sau khi apply:
npm install --legacy-peer-deps
NODE_OPTIONS="--max-old-space-size=8192" npx vite build
# Kiểm chứng bundle:
grep -oE "/adminapi/(customer|employee|department|role|permission|groupEmployee|roleEmployee)[A-Za-z_/-]*" bundle/assets/*.js | sort -u
# Kết quả mong đợi: chỉ còn vài dòng NGOÀI 4 module (campaign/invoice/placeholder/callCenter/...).
```

---

## 6. Definition of Done cho cross-branch rollout

- [ ] Hotfix gốc merge vào `reborn-retail` sau test PASS.
- [ ] Apply cho `community-hub` + tạo TC-MIGRATE-CUSTOMER-API tương ứng.
- [ ] Apply cho `reborn-loyalty` + test 4 module với dataset supermarket.
- [ ] Apply cho `reborn-fitpro`.
- [ ] Phương án cho `webform.js` (mục 3.1) đã được PM approve.
- [ ] Backend confirm CORS + 181 endpoint healthcheck OK.
- [ ] Tài liệu này được update với các lesson learned sau rollout đầu tiên.
