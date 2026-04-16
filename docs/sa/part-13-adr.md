# Part 13 — Architecture Decision Records (ADR)

> Ghi nhan cac quyet dinh kien truc quan trong cua he thong,
> bao gom boi canh, quyet dinh, va hau qua (pros/cons).

---

## Format

Moi ADR theo template:
- **Context:** Van de / tinh huong can quyet dinh
- **Decision:** Lua chon da thuc hien
- **Consequences:** Uu diem va nhuoc diem
- **Status:** Accepted / Deprecated / Superseded

---

## ADR-01: Chon React SPA thay vi Server-Side Rendering

**Date:** 2022-06

### Context

He thong CRM la ung dung noi bo (internal tool), khong can SEO.
Yeu cau chinh: trai nghiem nguoi dung muot, tuong tac phuc tap
(drag-drop, inline edit, real-time update). Team co kinh nghiem React.

### Decision

Chon **React SPA** (Single Page Application) voi Vite lam build tool.
Khong dung Next.js hay SSR framework.

### Consequences

| Uu diem                                    | Nhuoc diem                              |
|-------------------------------------------|-----------------------------------------|
| UX muot, chuyen trang khong reload         | Initial load cham hon SSR (~1.8s FCP)   |
| Frontend/backend tach biet, deploy doc lap | Khong co SEO (chap nhan duoc — internal)|
| Ecosystem React lon, de tuyen developer    | Bundle size lon neu khong code-split ky  |
| Vite HMR nhanh, DX tot                    | Client can JS enabled                   |

**Status:** Accepted

---

## ADR-02: Client-side API Routing thay vi Server-side API Gateway

**Date:** 2022-08

### Context

He thong co 12 microservice, can 1 diem truy cap thong nhat.
2 phuong an: (A) API Gateway server-side (Kong, Nginx), (B) client-side
routing qua Axios interceptor + URL config.

### Decision

Chon **client-side routing**: frontend tu biet goi service nao
qua URL mapping trong `urls.ts`. Nginx chi lam reverse proxy don gian,
khong co logic routing phuc tap.

### Consequences

| Uu diem                                    | Nhuoc diem                              |
|-------------------------------------------|-----------------------------------------|
| Don gian, khong them infra component       | Frontend phai biet URL tung service     |
| Khong co single point of failure o gateway | Kho aggregate nhieu API trong 1 call    |
| De debug — URL ro rang trong DevTools      | Rate limiting phai lam per-service      |
| Tiet kiem resource server                  | CORS config phai cau hinh tung service  |

**Status:** Accepted — xem xet lai khi scale > 500 concurrent users

---

## ADR-03: Row-level Multi-tenant thay vi Database-per-tenant

**Date:** 2022-07

### Context

SaaS platform phuc vu nhieu tenant (doanh nghiep). 2 phuong an:
(A) Moi tenant 1 database rieng, (B) Chung database, phan biet bang `tenant_id`.

### Decision

Chon **row-level multi-tenant**: tat ca tenant dung chung MySQL instance,
moi bang co column `tenant_id`. Backend tu dong filter theo tenant
cua user dang login (inject qua interceptor).

### Consequences

| Uu diem                                    | Nhuoc diem                              |
|-------------------------------------------|-----------------------------------------|
| Tiet kiem resource — 1 DB cho nhieu tenant | Bug filter → leak data giua tenant      |
| Schema migration 1 lan cho tat ca          | Query phai luon co WHERE tenant_id      |
| Backup/restore don gian                    | Tenant lon co the anh huong tenant nho  |
| Connection pool chia se hieu qua           | Kho custom schema per-tenant            |

**Mitigation:** Unit test bat buoc kiem tra tenant isolation cho moi query.

**Status:** Accepted

---

## ADR-04: BPM Engine tich hop thay vi Hardcode Workflow

**Date:** 2023-09

### Context

He thong co nhieu workflow phuc tap: phe duyet don hang, quy trinh tuyen dung,
luong cong viec SLA. Ban dau hardcode if/else trong code → kho thay doi,
kho customize per-tenant.

### Decision

Xay dung **BPM service** (bpm-service) voi workflow engine tu thiet ke.
Workflow dinh nghia bang JSON/BPMN, luu trong database, tenant tu cau hinh
qua UI drag-drop.

### Consequences

| Uu diem                                    | Nhuoc diem                              |
|-------------------------------------------|-----------------------------------------|
| Tenant tu tuy chinh workflow khong can dev | Them complexity cho he thong            |
| Thay doi workflow khong can deploy code    | BPM engine tu xay → can maintain        |
| Audit trail cho moi buoc phe duyet         | Learning curve cho developer moi        |
| Tai su dung pattern cho nhieu module       | Performance overhead so voi hardcode    |

**Status:** Accepted — dang trong giai doan 2 (MVP da co basic approval flow)

---

## ADR-05: Dual Date Library (moment.js + date-fns)

**Date:** 2024-01

### Context

Code cu (2022-2024) dung `moment.js` rong rai. moment.js da deprecated
va nang (300KB+). Team muon chuyen sang `date-fns` (nhe, tree-shakeable).

### Decision

**Khong big-bang migrate** — qua nhieu code dung moment. Thay vao do:
- Module moi bat buoc dung `date-fns`
- Module cu migrate dan khi co refactor
- Cho phep ca 2 library ton tai song song

### Consequences

| Uu diem                                    | Nhuoc diem                              |
|-------------------------------------------|-----------------------------------------|
| Khong break code hien tai                  | Bundle chua ca 2 library (tang ~300KB)  |
| Team lam quen date-fns tu tu              | Inconsistent API giua module cu va moi  |
| Khong mat sprint de migrate               | Tech debt keo dai                       |

**Status:** Accepted — tech debt acknowledged, target migrate het trong Q4/2026

---

## ADR-06: Cookie-based Auth thay vi Token-only

**Date:** 2022-07

### Context

He thong SaaS multi-subdomain: `tenant1.reborn.vn`, `tenant2.reborn.vn`.
Can SSO — login 1 lan, truy cap nhieu subdomain. 2 phuong an:
(A) JWT trong localStorage, (B) HttpOnly cookie voi domain `.reborn.vn`.

### Decision

Chon **cookie-based authentication**:
- Access token luu trong HttpOnly cookie, domain `.reborn.vn`
- Refresh token cung la HttpOnly cookie
- CSRF protection bang double-submit pattern

### Consequences

| Uu diem                                    | Nhuoc diem                              |
|-------------------------------------------|-----------------------------------------|
| SSO tu dong cross-subdomain               | Phuc tap hon token-only approach        |
| HttpOnly → JavaScript khong doc duoc token | CSRF attack surface (can CSRF token)    |
| Browser tu dong gui cookie — it code FE   | Cookie size limit (4KB)                 |
| Refresh token an toan hon localStorage    | Khong dung cho mobile app (can API key) |

**Status:** Accepted

---

## ADR-07: localStorage cho Permissions

**Date:** 2023-03

### Context

Sau khi login, backend tra ve danh sach permission (200-500 items).
Frontend can check permission o nhieu noi (menu, button, route guard).
2 phuong an: (A) Luu trong Redux/Context, (B) Luu trong localStorage.

### Decision

Chon **localStorage** de luu permission list dang JSON.
Doc bang `JSON.parse(localStorage.getItem("permissions"))`.

### Consequences

| Uu diem                                    | Nhuoc diem                              |
|-------------------------------------------|-----------------------------------------|
| Persist qua page refresh — khong can re-fetch| User co the sua localStorage (inspect) |
| Truy cap tu bat ky component nao           | Khong reactive — thay doi can reload    |
| Don gian implement                         | localStorage bi clear → mat permission  |
| Nhanh — khong async                        | Security: sensitive data o client       |

**Mitigation:**
- Backend LUON verify permission server-side (khong tin client)
- localStorage chi dung cho UI show/hide, khong phai security gate
- Permission re-sync moi lan login va moi 15 phut

**Status:** Accepted — chap nhan trade-off convenience vs security

---

## Tong hop ADR

| ADR  | Quyet dinh                       | Status   |
|------|----------------------------------|----------|
| 01   | React SPA, khong SSR             | Accepted |
| 02   | Client-side API routing          | Accepted |
| 03   | Row-level multi-tenant           | Accepted |
| 04   | BPM engine tich hop              | Accepted |
| 05   | Dual date lib (tech debt)        | Accepted |
| 06   | Cookie-based auth (SSO)          | Accepted |
| 07   | localStorage permissions         | Accepted |
