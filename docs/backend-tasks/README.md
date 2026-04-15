# Backend Tasks — Phân theo Microservice

Tài liệu được tổ chức theo **ranh giới DDD** — mỗi microservice tự quản task domain của mình. Backend là **code dùng chung** cho mọi ngành (retail, community-hub, tech, reborn-tnpm, reborn-fitpro, banking, …), mỗi fix phải **neutral theo ngành**: không hardcode business rule của một ngành cụ thể, phải config hóa qua tenant setting hoặc feature flag.

## 🔑 Quy tắc phân task theo URL prefix

URL endpoint bị bug → phần prefix đầu tiên sau host = microservice owner → thư mục tương ứng.

```
POST https://biz.reborn.vn/inventory/warehouse/create
                         └─ inventory ─┘
→ task vào docs/backend-tasks/inventory/
```

## 📁 12 microservice

| Prefix | Thư mục | Domain | Ghi chú |
|--------|---------|--------|---------|
| `/billing/…` | [billing/](./billing/) | Thanh toán, hoá đơn tài chính, settlement | |
| `/care/…` | [care/](./care/) | Ticket, feedback, warranty, chăm sóc **sau bán**. KHÔNG owns customer entity (thuộc `customer/`) |
| `/contract/…` | [contract/](./contract/) | Hợp đồng | |
| `/customer/…` | [customer/](./customer/) | Customer entity CRUD, lifecycle, telesale assignment, segment/source/relationship | **Legacy prefix `/adminapi/customer/*`** cũng thuộc domain này |
| `/finance/…` | [finance/](./finance/) | Hồ sơ tài chính chi tiết của KH | **⚠️ CHỈ dùng riêng domain banking** — không áp dụng retail/spa/tech |
| `/integration/…` | [integration/](./integration/) | Tích hợp bên thứ 3 (Viettel sInvoice, Zalo, Facebook, shipping partners, …) | |
| `/inventory/…` | [inventory/](./inventory/) | Kho, sản phẩm, biến thể, đơn vị, nhập/xuất, stock ledger | |
| `/logistics/…` | [logistics/](./logistics/) | Vận chuyển, shipping order, shipping fee config | |
| `/market/…` | [market/](./market/) | Voucher, promotion (CTKM), campaign, marketing automation, Zalo marketing | |
| `/notification/…` | [notification/](./notification/) | Push, email, SMS, Zalo ZNS | |
| `/operation/…` | [operation/](./operation/) | Vận hành TNPM | **⚠️ CHỈ dành cho nhánh reborn-tnpm** — không áp dụng các ngành khác |
| `/sales/…` | [sales/](./sales/) | Invoice (IV1/IV2/IV11), shift, cart, đơn hàng, dashboard sale, báo cáo POS | |

### Phân biệt dễ nhầm

- **`sales/` vs `billing/`**: `sales` owns invoice lifecycle (draft → confirm → cancel); `billing` owns payment collection + financial settlement. Nếu task là "thu tiền" → `billing/`, "quản lý trạng thái hoá đơn" → `sales/`.
- **`billing/` vs `finance/`**: `billing` là thanh toán / công nợ chung cho mọi ngành; `finance` là hồ sơ tài chính cá nhân khách banking (thu nhập, khoản vay, tài sản, …) — **chỉ banking dùng**.
- **`customer/` vs `care/`**: `customer` owns data entity + lifecycle (CRUD, assignment, segment, source, telesale pipeline); `care` owns post-sale support (ticket, feedback, warranty, complaint).
- **`care/` vs `notification/`**: `care` chăm KH qua ticket / workflow có người xử lý; `notification` chỉ gửi thông báo một chiều (push/email/SMS/ZNS).

## ⚠️ Lưu ý trước khi fix

1. **Không phá ngành khác** — test regression trên ít nhất 2 tenant thuộc 2 ngành khác nhau trước khi merge.
2. **API contract stable** — nếu thay đổi breaking, bump version endpoint (`/v2/…`) và giữ legacy cho tới khi mọi FE ngành migrate xong.
3. **Config > hardcode** — rule khác nhau giữa các ngành (VAT %, voucher stacking, return window, …) phải đọc từ bảng config/tenant setting, không `if/else` theo tenant.
4. **Outbox pattern** cho cross-service writes — tránh inconsistency khi sale/market/inventory không share DB.

## 🔀 Cross-branch consistency

Tất cả các nhánh CRM (reborn-retail, reborn-tnpm, reborn-fitpro, community-hub, reborn-tech, crm-banking, …) dùng **chung structure này**. Khi viết task, phải nhớ:

- **Không** hardcode business rule của một ngành — BE dùng chung
- **Không** viết kiểu "ở ngành X thì…" — phải config hóa
- **Luôn** verify trên ít nhất 2 tenant ngành khác nhau trước khi deploy

---

## 📋 Task đang mở

### [inventory/](./inventory/) — `cloud-inventory-master`

| File | Severity | Tóm tắt |
|------|----------|---------|
| [warehouse-emoji-strip.md](./inventory/warehouse-emoji-strip.md) | 🟡 MEDIUM | Tên kho có emoji bị strip sau save (utf8mb4 hoặc sanitizer) |
| [warehouse-misc.md](./inventory/warehouse-misc.md) | 🟠 HIGH | Cho phép trùng tên + HTTP 500 cho business error (`isSelling` conflict) |
| [error-input-wrong-vague.md](./inventory/error-input-wrong-vague.md) | 🟡 MEDIUM | Error `"Input wrong"` quá mơ hồ — không nói field nào sai (cross-cutting) |

### [integration/](./integration/) — `cloud-integration-master`

_Không còn task mở. Xem [integration/resolved/](./integration/resolved/)._

### [billing/](./billing/) — `cloud-billing-master`

| File | Severity | Tóm tắt |
|------|----------|---------|
| [finance-dashboard-500.md](./billing/finance-dashboard-500.md) | 🟠 HIGH | Finance Dashboard API (`financeDashboard.full`/`chart`) trả 500 |

### Các microservice chưa có task

- [care/](./care/) · [contract/](./contract/) · [finance/](./finance/) · [logistics/](./logistics/) · [market/](./market/) · [notification/](./notification/) · [operation/](./operation/) · [sales/](./sales/)

---

## ✅ Task đã giải quyết (resolved)

| File | Fix date | Verified by |
|------|----------|-------------|
| [integration/resolved/invoice-vat-500.md](./integration/resolved/invoice-vat-500.md) | 2026-04-15 | `test-smoke-nav.mjs` trên community-hub + reborn-fitpro — SMK-INVOICE-VAT PASS |

---

### Quy trình khi có task mới

1. Đọc URL endpoint bị bug
2. Lấy segment đầu sau host (`biz.reborn.vn/<PREFIX>/...`)
3. Tạo file ở `docs/backend-tasks/<prefix>/<tên-kebab>.md`
4. Cập nhật bảng "Task đang mở" trong README này
5. Cross-ref nếu task span nhiều microservice

---

## 📋 Quy ước viết task mới

Mỗi file task phải có frontmatter:

```markdown
# BACKEND TASK — <tên ngắn>

**Discovered:** YYYY-MM-DD — <source: test script / bug report / incident>
**Severity:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW
**Module:** `cloud-<name>-master`
**Endpoints affected:** <list>
```

Sau đó các section: Mô tả → Hard evidence → Root cause → Action → Re-test → Files FE liên quan.

**Tên file:** kebab-case, không prefix `BACKEND-TASK-` (thư mục đã nói rồi).

**Delete policy:** khi task **fully done** (BE deploy + FE retest pass), xóa file khỏi đây. Nếu done một phần, strip phần done chỉ giữ phần còn lại. Cập nhật index trong README.
