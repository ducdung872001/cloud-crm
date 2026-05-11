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
→ task vào docs/05-backend-tasks/inventory/
```

**Host convention** — Reborn ecosystem có 2 host tách bạch:

| Host | Owns |
|---|---|
| `https://reborn.vn/authenticator/*` | **Auth/SSO only** — không migrate sang biz |
| `https://biz.reborn.vn/<service>/*` | Mọi business service (customer, market, care, sales, inventory, ...) |
| `https://biz.reborn.vn/org/*` | Org chart / RBAC / permission (service riêng, pattern mentorhub) |

> ⚠️ `reborn.vn/adminapi/*` đã **deprecated** — task nào nói về `/adminapi/<svc>/*` map về `biz.reborn.vn/<svc>/*`.

## 📁 12 microservice

| Prefix | Thư mục | Domain | Ghi chú |
|--------|---------|--------|---------|
| `/billing/…` | [billing/](./billing/) | Thanh toán, hoá đơn tài chính, settlement | |
| `/care/…` | [care/](./care/) | Ticket, feedback, warranty, chăm sóc **sau bán**. KHÔNG owns customer entity (thuộc `customer/`) |
| `/contract/…` | [contract/](./contract/) | Hợp đồng | |
| `/customer/…` | [customer/](./customer/) | Customer entity CRUD, lifecycle, telesale assignment, segment/source/relationship | **Legacy prefix `/adminapi/customer/*`** cũng thuộc domain này |
| `/finance/…` | [finance/](./finance/) | Hồ sơ tài chính chi tiết của KH | **⚠️ CHỈ dùng riêng domain banking** — không áp dụng retail/spa/tech |
| `/integration/…` | [integration/](./integration/) | Tích hợp bên thứ 3 (Viettel sInvoice, Zalo, Facebook, shipping partners, …) | |
| `/inventory/…` | `inventory/` (chưa có task) | Kho, sản phẩm, biến thể, đơn vị, nhập/xuất, stock ledger | |
| `/logistics/…` | [logistics/](./logistics/) | Vận chuyển, shipping order, shipping fee config | |
| `/market/…` | [market/](./market/) | Voucher, promotion (CTKM), campaign, marketing automation, Zalo marketing | |
| `/notification/…` | [notification/](./notification/) | Push, email, SMS, Zalo ZNS | |
| `/operation/…` | [operation/](./operation/) | Vận hành TNPM | **⚠️ CHỈ dành cho nhánh reborn-tnpm** — không áp dụng các ngành khác |
| `/sales/…` | `sales/` (chưa có task) | Invoice (IV1/IV2/IV11), shift, cart, đơn hàng, dashboard sale, báo cáo POS | |

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

## 📋 Task đang mở — dự án Loyalty

### [market/](./market/) — `cloud-market-master`

| File | Severity | Tóm tắt |
|------|----------|---------|
| [loyalty-supermarket.md](./market/loyalty-supermarket.md) | 🟠 HIGH | Mở rộng loyalty cho chuỗi siêu thị (2 brand, 300+ store, 3M KH) |
| [loyalty-gamification.md](./market/loyalty-gamification.md) | 🟡 MEDIUM | Quest/achievement system |
| [loyalty-referral.md](./market/loyalty-referral.md) | 🟡 MEDIUM | Referral chain bonus |
| [loyalty-rfm-analytics.md](./market/loyalty-rfm-analytics.md) | 🟠 HIGH | RFM segmentation backend |
| [voucher-promotion-unified.md](./market/voucher-promotion-unified.md) | 🔴 CRITICAL | Unified voucher + promotion schema, reverse flow, reports |

### [customer/](./customer/) — `cloud-customer-master`

| File | Severity | Tóm tắt |
|------|----------|---------|
| [customer-change-log.md](./customer/customer-change-log.md) | 🟡 MEDIUM | Audit log cho thay đổi customer profile |

### [care/](./care/) — `cloud-care-master`

| File | Severity | Tóm tắt |
|------|----------|---------|
| [ticket-complaint-fields.md](./care/ticket-complaint-fields.md) | 🟡 MEDIUM | Bổ sung fields cho ticket complaint workflow |

### Microservice khác (chưa có task loyalty)

`billing/`, `contract/`, `finance/` (banking), `integration/`, `logistics/`, `notification/`, `operation/` (tnpm), `sales/`, `inventory/` — không có task active cho bài toán loyalty hiện tại. Nếu cần tạo task mới, mkdir folder tương ứng theo prefix.

> 📝 **Lưu ý:** Backend tasks cho các bug retail (POS/Kho/Sales) đã được xóa khỏi folder này — di chuyển ngữ cảnh đó về nhánh `reborn-retail`. Lịch sử git vẫn giữ.

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
