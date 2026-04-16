# Part 13 — Architecture Decision Records (ADR)

> Ghi nhận các quyết định kiến trúc quan trọng của hệ thống,
> bao gồm bối cảnh, quyết định, và hậu quả (pros/cons).

---

## Format

Mỗi ADR theo template:
- **Context:** Vấn đề / tình huống cần quyết định
- **Decision:** Lựa chọn đã thực hiện
- **Consequences:** Ưu điểm và nhược điểm
- **Status:** Accepted / Deprecated / Superseded

---

## ADR-01: Chọn React SPA thay vì Server-Side Rendering

**Date:** 2022-06

### Context

Hệ thống CRM là ứng dụng nội bộ (internal tool), không cần SEO.
Yêu cầu chính: trải nghiệm người dùng mượt, tương tác phức tạp
(drag-drop, inline edit, real-time update). Team có kinh nghiệm React.

### Decision

Chọn **React SPA** (Single Page Application) với Vite làm build tool.
Không dùng Next.js hay SSR framework.

### Consequences

| Ưu điểm                                    | Nhược điểm                              |
|-------------------------------------------|-----------------------------------------|
| UX mượt, chuyển trang không reload         | Initial load chậm hơn SSR (~1.8s FCP)   |
| Frontend/backend tách biệt, deploy độc lập | Không có SEO (chấp nhận được — internal)|
| Ecosystem React lớn, dễ tuyển developer    | Bundle size lớn nếu không code-split kỹ  |
| Vite HMR nhanh, DX tốt                    | Client cần JS enabled                   |

**Status:** Accepted

---

## ADR-02: Client-side API Routing thay vì Server-side API Gateway

**Date:** 2022-08

### Context

Hệ thống có 12 microservice, cần 1 điểm truy cập thống nhất.
2 phương án: (A) API Gateway server-side (Kong, Nginx), (B) client-side
routing qua Axios interceptor + URL config.

### Decision

Chọn **client-side routing**: frontend tự biết gọi service nào
qua URL mapping trong `urls.ts`. Nginx chỉ làm reverse proxy đơn giản,
không có logic routing phức tạp.

### Consequences

| Ưu điểm                                    | Nhược điểm                              |
|-------------------------------------------|-----------------------------------------|
| Đơn giản, không thêm infra component       | Frontend phải biết URL từng service     |
| Không có single point of failure ở gateway | Khó aggregate nhiều API trong 1 call    |
| Dễ debug — URL rõ ràng trong DevTools      | Rate limiting phải làm per-service      |
| Tiết kiệm resource server                  | CORS config phải cấu hình từng service  |

**Status:** Accepted — xem xét lại khi scale > 500 concurrent users

---

## ADR-03: Row-level Multi-tenant thay vì Database-per-tenant

**Date:** 2022-07

### Context

SaaS platform phục vụ nhiều tenant (doanh nghiệp). 2 phương án:
(A) Mỗi tenant 1 database riêng, (B) Chung database, phân biệt bằng `tenant_id`.

### Decision

Chọn **row-level multi-tenant**: tất cả tenant dùng chung MySQL instance,
mỗi bảng có column `tenant_id`. Backend tự động filter theo tenant
của user đang login (inject qua interceptor).

### Consequences

| Ưu điểm                                    | Nhược điểm                              |
|-------------------------------------------|-----------------------------------------|
| Tiết kiệm resource — 1 DB cho nhiều tenant | Bug filter → leak data giữa tenant      |
| Schema migration 1 lần cho tất cả          | Query phải luôn có WHERE tenant_id      |
| Backup/restore đơn giản                    | Tenant lớn có thể ảnh hưởng tenant nhỏ  |
| Connection pool chia sẻ hiệu quả           | Khó custom schema per-tenant            |

**Mitigation:** Unit test bắt buộc kiểm tra tenant isolation cho mỗi query.

**Status:** Accepted

---

## ADR-04: BPM Engine tích hợp thay vì Hardcode Workflow

**Date:** 2023-09

### Context

Hệ thống có nhiều workflow phức tạp: phê duyệt đơn hàng, quy trình tuyển dụng,
luồng công việc SLA. Ban đầu hardcode if/else trong code → khó thay đổi,
khó customize per-tenant.

### Decision

Xây dựng **BPM service** (bpm-service) với workflow engine tự thiết kế.
Workflow định nghĩa bằng JSON/BPMN, lưu trong database, tenant tự cấu hình
qua UI drag-drop.

### Consequences

| Ưu điểm                                    | Nhược điểm                              |
|-------------------------------------------|-----------------------------------------|
| Tenant tự tùy chỉnh workflow không cần dev | Thêm complexity cho hệ thống            |
| Thay đổi workflow không cần deploy code    | BPM engine tự xây → cần maintain        |
| Audit trail cho mỗi bước phê duyệt         | Learning curve cho developer mới        |
| Tái sử dụng pattern cho nhiều module       | Performance overhead so với hardcode    |

**Status:** Accepted — đang trong giai đoạn 2 (MVP đã có basic approval flow)

---

## ADR-05: Dual Date Library (moment.js + date-fns)

**Date:** 2024-01

### Context

Code cũ (2022-2024) dùng `moment.js` rộng rãi. moment.js đã deprecated
và nặng (300KB+). Team muốn chuyển sang `date-fns` (nhẹ, tree-shakeable).

### Decision

**Không big-bang migrate** — quá nhiều code dùng moment. Thay vào đó:
- Module mới bắt buộc dùng `date-fns`
- Module cũ migrate dần khi có refactor
- Cho phép cả 2 library tồn tại song song

### Consequences

| Ưu điểm                                    | Nhược điểm                              |
|-------------------------------------------|-----------------------------------------|
| Không break code hiện tại                  | Bundle chứa cả 2 library (tăng ~300KB)  |
| Team làm quen date-fns từ từ              | Inconsistent API giữa module cũ và mới  |
| Không mất sprint để migrate               | Tech debt kéo dài                       |

**Status:** Accepted — tech debt acknowledged, target migrate hết trong Q4/2026

---

## ADR-06: Cookie-based Auth thay vì Token-only

**Date:** 2022-07

### Context

Hệ thống SaaS multi-subdomain: `tenant1.reborn.vn`, `tenant2.reborn.vn`.
Cần SSO — login 1 lần, truy cập nhiều subdomain. 2 phương án:
(A) JWT trong localStorage, (B) HttpOnly cookie với domain `.reborn.vn`.

### Decision

Chọn **cookie-based authentication**:
- Access token lưu trong HttpOnly cookie, domain `.reborn.vn`
- Refresh token cũng là HttpOnly cookie
- CSRF protection bằng double-submit pattern

### Consequences

| Ưu điểm                                    | Nhược điểm                              |
|-------------------------------------------|-----------------------------------------|
| SSO tự động cross-subdomain               | Phức tạp hơn token-only approach        |
| HttpOnly → JavaScript không đọc được token | CSRF attack surface (cần CSRF token)    |
| Browser tự động gửi cookie — ít code FE   | Cookie size limit (4KB)                 |
| Refresh token an toàn hơn localStorage    | Không dùng cho mobile app (cần API key) |

**Status:** Accepted

---

## ADR-07: localStorage cho Permissions

**Date:** 2023-03

### Context

Sau khi login, backend trả về danh sách permission (200-500 items).
Frontend cần check permission ở nhiều nơi (menu, button, route guard).
2 phương án: (A) Lưu trong Redux/Context, (B) Lưu trong localStorage.

### Decision

Chọn **localStorage** để lưu permission list dạng JSON.
Đọc bằng `JSON.parse(localStorage.getItem("permissions"))`.

### Consequences

| Ưu điểm                                    | Nhược điểm                              |
|-------------------------------------------|-----------------------------------------|
| Persist qua page refresh — không cần re-fetch| User có thể sửa localStorage (inspect) |
| Truy cập từ bất kỳ component nào           | Không reactive — thay đổi cần reload    |
| Đơn giản implement                         | localStorage bị clear → mất permission  |
| Nhanh — không async                        | Security: sensitive data ở client       |

**Mitigation:**
- Backend LUÔN verify permission server-side (không tin client)
- localStorage chỉ dùng cho UI show/hide, không phải security gate
- Permission re-sync mỗi lần login và mỗi 15 phút

**Status:** Accepted — chấp nhận trade-off convenience vs security

---

## Tổng hợp ADR

| ADR  | Quyết định                       | Status   |
|------|----------------------------------|----------|
| 01   | React SPA, không SSR             | Accepted |
| 02   | Client-side API routing          | Accepted |
| 03   | Row-level multi-tenant           | Accepted |
| 04   | BPM engine tích hợp              | Accepted |
| 05   | Dual date lib (tech debt)        | Accepted |
| 06   | Cookie-based auth (SSO)          | Accepted |
| 07   | localStorage permissions         | Accepted |
