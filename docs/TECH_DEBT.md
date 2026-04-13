# TECH DEBT — Cloud CRM (Community Hub)

> Danh sach cac van de can xu ly nhung **qua rui ro hoac mat nhieu effort** de fix ngay.
> Chia theo do uu tien va effort.

---

## PHAN 1: CAN FIX — EFFORT TRUNG BINH (1-2 tuan)

### ~~1.1 Migrate moment.js → date-fns~~ DA XONG
- 40 files migrated, `moment` removed from package.json + vite.config plugin
- Bundle giam ~67KB (300KB → 7KB tree-shaked date-fns)

### 1.2 Lodash full import → import cu the
- **65 files** `import _ from "lodash"` hoac `import { x, y } from "lodash"`
- **Rui ro thap** nhung nhieu files can sua
- **Cach lam:** Thay `import _ from "lodash"` → `import debounce from "lodash/debounce"` etc.
- **Luu y:** Mot so cho dung `_.get()`, `_.set()` can thay bang optional chaining

### 1.3 Image loading="lazy"
- **0/558 img tags** co `loading="lazy"`
- **Rui ro thap** — chi them attribute
- **Cach lam:** Tim tat ca `<img` khong co `loading=`, them `loading="lazy"`
- **Ngoai tru:** Above-the-fold images (logo, avatar header) nen giu eager

### 1.4 Empty catch blocks
- **52 instances** catch block trong hoac chi console.log
- **Rui ro:** Fix sai co the thay doi error flow
- **Cach lam:** Tung file review — them showToast error hoac log lai
- **Files chinh:** WarehouseReport, Finance, CounterSales, ManagementMaterial, BPM

---

## PHAN 2: CAN DANH GIA — EFFORT CAO

### 2.1 key={index} → unique key
- **597 instances** dung array index lam key
- **Rui ro:** Fix sai se break rendering. Can biet data structure de chon key dung
- **Cach lam:** Tung component review — dung `item.id`, `item.code`, hoac `item.value`
- **Uu tien:** Fix truoc cho lists co sort/filter/reorder (CustomerList, ProductList, InvoiceList)

### 2.2 AbortController cho fetch
- **0/1,210 fetch calls** co AbortController
- **Rui ro:** Them AbortController co the cause race conditions neu khong can than
- **Cach lam:** Bat dau voi useEffect co API call — them cleanup function
- **Pattern:**
  ```tsx
  useEffect(() => {
    const ctrl = new AbortController();
    fetchData(ctrl.signal);
    return () => ctrl.abort();
  }, [deps]);
  ```

### 2.3 Timer cleanup (setTimeout/setInterval)
- **220 timers**, chi 24% co cleanup
- **Rui ro cao:** Xoa timer sai co the break functionality (polling, debounce, animation)
- **Cach lam:** Review tung file — chi fix timers trong useEffect/component lifecycle
- **Top offenders:** CashBookList (5), CreateProductionOrderModal (4), BPM components

### 2.4 React.memo
- Chi **12/2,504 files** dung React.memo
- **Rui ro:** Them memo cho component nhan non-primitive props co the KHONG co tac dung hoac tao bug
- **Cach lam:** Profile truoc bang React DevTools, chi memo components co re-render nhieu
- **Uu tien:** List item components, table row, card components trong kanban

### 2.5 Tach component qua lon
- **10 components** co 40-71 useState
- CreateCampaign: 5,477 dong, CustomerPersonList: 3,827 dong
- **Rui ro rat cao:** Refactor component lon de gay regression
- **Cach lam:** Extract tung phan nho (form section → custom hook, tab content → sub-component)
- **Bat dau voi:** Components ban than viet (khong phai code cu) — de hieu logic hon

---

## PHAN 3: CAN BE/DEVOPS HO TRO

### 3.1 Token storage
- access_token, permissions luu localStorage — XSS co the doc
- **Can BE:** Set HTTP-only cookie, FE bo localStorage token
- **Effort:** Trung binh (can thay doi ca FE + BE auth flow)

### 3.2 Security headers
- nginx.conf thieu CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- **Can DevOps:** Update nginx.conf
- **Mau:**
  ```nginx
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
  ```

### 3.3 CSRF protection
- Khong co CSRF token trong bat ky request nao
- **Can BE:** Generate CSRF token, FE gui kem moi mutation request

### 3.4 Server-side permission validation
- 126 files check permission tu localStorage — co the bypass bang DevTools
- **Can BE:** Validate permission moi request, khong tin FE

### 3.5 Error tracking (Sentry)
- Khong co error tracking service
- **Can DevOps:** Setup Sentry, FE tich hop `@sentry/react`
- **Ket hop:** ErrorBoundary component gui error len Sentry

---

## PHAN 4: BACKLOG DAI HAN

### 4.1 Testing
- 0 test files / 2,504 source files
- **Bat dau:** Setup Vitest + React Testing Library
- **Uu tien test:** Utils (dateUtils, validate, common), custom hooks, critical flows (login, tao don)

### 4.2 CI/CD Pipeline
- Khong co automated pipeline
- **Bat dau:** GitHub Actions hoac GitLab CI
- **Pipeline co ban:** lint → type-check → test → build

### 4.3 i18n completion
- ~47,558 hardcoded Vietnamese strings
- **Cach lam:** Tung module chuyen sang t() — bat dau tu module moi nhat (Community Hub)

### 4.4 Accessibility
- 301 `outline: none/0` — keyboard navigation bi pha
- 112 img thieu alt text
- 13 div onClick thay vi button
- 0 nav, main, header, footer semantic tags
- **Uu tien:** Fix outline truoc (anh huong nhieu user nhat)

### 4.5 Commit convention
- Messages: "Fix", "NL", "D" — khong co convention
- **De xuat:** Conventional Commits (feat:, fix:, refactor:) + commitlint

---

## TONG KET

| Phan | Items | Effort | Rui ro |
|------|:-----:|--------|--------|
| 1. Can fix (trung binh) | 4 | 1-2 tuan | Thap |
| 2. Can danh gia (cao) | 5 | 2-4 tuan | Trung binh - Cao |
| 3. Can BE/DevOps | 5 | Tuy BE | Thap (FE side) |
| 4. Backlog dai han | 5 | 1-3 thang | Thap |

---

*Tao: 2026-04-09 — Branch: community-hub*
