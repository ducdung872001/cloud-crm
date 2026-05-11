# 05-Backend Tasks — Spec kỹ thuật BE theo Microservice

> **Trong dự án Reborn Loyalty:** Các task BE chính nằm trong [`market/`](./market/) (loyalty engine), [`customer/`](./customer/) (member 360°), [`care/`](./care/) (CSKH ticket). Các microservice khác chỉ tham chiếu khi có touch point.
>
> Đầy đủ trong: [`market/loyalty-supermarket.md`](./market/loyalty-supermarket.md), [`market/loyalty-gamification.md`](./market/loyalty-gamification.md), [`market/loyalty-rfm-analytics.md`](./market/loyalty-rfm-analytics.md), [`market/loyalty-referral.md`](./market/loyalty-referral.md).

Tài liệu được tổ chức theo **ranh giới DDD** — mỗi microservice tự quản task domain của mình. Backend là **code dùng chung** cho mọi ngành (retail, community-hub, tech, reborn-tnpm, banking, loyalty …), mỗi fix phải **neutral theo ngành**: không hardcode business rule của một ngành cụ thể, phải config hóa qua tenant setting hoặc feature flag.

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

---

## 📋 Task đang mở (cập nhật khi có task mới)

### [sales/](./sales/) — `cloud-sales-master`

_Không còn task mở. Xem [sales/resolved/](./sales/resolved/) cho 3 task đã fix (verified 2026-04-15)._

### [inventory/](./inventory/) — `cloud-inventory-master`

| File | Severity | Tóm tắt |
|------|----------|---------|
| [stock-product-list-NA.md](./inventory/stock-product-list-NA.md) | 🔴 HIGH | `/inventoryBalance/stockProduct/list` trả `"N/A"` cho `productName`, `batchNo`, `expiryDate` |
| [import-invoice-error-response.md](./inventory/import-invoice-error-response.md) | 🟡 MEDIUM | Error response của `/invoice/import/update` mơ hồ + stock ledger không tạo khi approve |
| [warehouse-create-api.md](./inventory/warehouse-create-api.md) | 🟡 MEDIUM | Các bug nhỏ Playwright (warehouse create, unit_type, barcode) |
| [warehouse-list-code-missing.md](./inventory/warehouse-list-code-missing.md) | 🔴 CRITICAL | `GET /warehouse/list` không trả field `code` dù create đã lưu |
| [product-delete-safety.md](./inventory/product-delete-safety.md) | 🟡 MEDIUM | Validate safe-delete cho product khi có transaction |
| [unit-delete-safety.md](./inventory/unit-delete-safety.md) | 🟡 MEDIUM | Validate safe-delete cho unit khi đang được tham chiếu |

### [market/](./market/) — `cloud-market-master`

| File | Severity | Tóm tắt |
|------|----------|---------|
| [voucher-promotion-unified.md](./market/voucher-promotion-unified.md) | 🔴 CRITICAL | **Unified design** cho voucher + promotion: schema `*_usage`, reverse flow, reports, audit log, budget enforcement, alerting |

### Các microservice chưa có task

- [billing/](./billing/) — chưa có task
- [care/](./care/) — chưa có task
- [contract/](./contract/) — chưa có task
- [finance/](./finance/) — chưa có task (chỉ banking dùng)
- [integration/](./integration/) — chưa có task
- [logistics/](./logistics/) — chưa có task
- [notification/](./notification/) — chưa có task
- [operation/](./operation/) — chưa có task (chỉ reborn-tnpm dùng)

---

## 🔗 Cross-service tasks

Một số task yêu cầu phối hợp nhiều microservice. Doc chính sống ở microservice **chủ** (nơi có business logic chính), các service khác chỉ có doc pointer ngắn.

| Task | Sales | Market | Inventory |
|------|:-:|:-:|:-:|
| Voucher/Promotion tracking per invoice | ✅ [resolved](./sales/resolved/invoice-create-voucher-promotion-fields.md) | ✅ [market](./market/voucher-promotion-unified.md) | — |
| Cancel via return (IV2) reverse usage | ✅ sales (reverse call) | ✅ market (reverse service) | ✅ inventory (restock) |
| Import invoice approve → stock ledger | — | — | ✅ inventory (ledger write) |

---

## ✅ Task đã giải quyết (resolved)

### [sales/resolved/](./sales/resolved/)

| File | Fix date | Verified by |
|------|----------|-------------|
| [shift-close-cash-diff.md](./sales/resolved/shift-close-cash-diff.md) | 2026-04-15 | `test-e2e-shift-flow.mjs` 20/20 PASS (S6-04 cashDifference=0) |
| [invoice-list-cancelled-filter.md](./sales/resolved/invoice-list-cancelled-filter.md) | 2026-04-15 | `test-e2e-cancel-dashboard-sync.mjs` 5/5 PASS (T3 list+1, T4 total+200k) |
| [invoice-create-voucher-promotion-fields.md](./sales/resolved/invoice-create-voucher-promotion-fields.md) | 2026-04-15 | `test-e2e-voucher-flow.mjs` 20/20 PASS + `test-e2e-promotion-flow.mjs` 26/26 PASS |

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

**Delete policy:** khi task **fully done** (BE deploy + FE retest pass), xóa file khỏi đây. Nếu done một phần, strip phần done chỉ giữ phần còn lại. Cập nhật index trong README này.
