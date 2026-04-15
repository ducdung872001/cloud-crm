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
| `/billing/…` | [billing/](./billing/) | Cashbook (sổ thu chi), debt (công nợ), fund (quỹ), payment (thanh toán), hoá đơn VAT (TT78/NĐ123). Owns toàn bộ dòng tiền + settlement | |
| `/care/…` | [care/](./care/) | Ticket, feedback, warranty, chăm sóc sau bán | |
| `/contract/…` | [contract/](./contract/) | Hợp đồng, workflow phê duyệt | |
| `/customer/…` | [customer/](./customer/) | Customer entity CRUD, customer lifecycle, telesale assignment, customer group / source / relationship | **Legacy prefix `/adminapi/customer/*`** cũng thuộc domain này |
| `/finance/…` | [finance/](./finance/) | Hồ sơ tài chính chi tiết của KH | **⚠️ CHỈ dùng riêng domain banking** — không áp dụng retail/spa/tech |
| `/integration/…` | [integration/](./integration/) | Tích hợp bên thứ 3 (Viettel sInvoice, Zalo, Facebook, shipping partners, …) | |
| `/inventory/…` | [inventory/](./inventory/) | Kho, sản phẩm, biến thể, đơn vị, nhập/xuất, stock ledger | |
| `/logistics/…` | [logistics/](./logistics/) | Vận chuyển, shipping order, shipping fee config | |
| `/market/…` | [market/](./market/) | Voucher, promotion (CTKM), campaign, marketing automation, Zalo marketing | |
| `/notification/…` | [notification/](./notification/) | Push, email, SMS, Zalo ZNS | |
| `/operation/…` | [operation/](./operation/) | Vận hành TNPM | **⚠️ CHỈ dành cho nhánh reborn-tnpm** — không áp dụng các ngành khác |
| `/sales/…` | [sales/](./sales/) | Invoice (IV1/IV2/IV11), shift, cart, đơn hàng, dashboard sale, báo cáo POS. **KHÔNG** owns cashbook/debt/fund/payment — đã chuyển sang `billing` | |

### Phân biệt dễ nhầm

- **`sales/` vs `billing/`**: `sales` owns invoice lifecycle (draft → confirm → cancel); `billing` owns cashbook, debt collection, fund management, payment + financial settlement. Nếu task là "thu tiền / sổ quỹ / công nợ" → `billing/`, "quản lý trạng thái hoá đơn" → `sales/`.
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

### [customer/](./customer/) — `cloud-customer-master`

| File | Severity | Tóm tắt |
|------|----------|---------|
| [reset-customer-to-new.md](./customer/reset-customer-to-new.md) | 🟢 FEATURE | Spec API mới `POST /customer/reset_to_new` (hiện legacy là `/adminapi/customer/reset_to_new`) — reset KH về trạng thái lead mới cho Telesale chia lại data |

### Các microservice chưa có task

- [billing/](./billing/) · [care/](./care/) · [contract/](./contract/) · [finance/](./finance/) · [integration/](./integration/) · [inventory/](./inventory/) · [logistics/](./logistics/) · [market/](./market/) · [notification/](./notification/) · [operation/](./operation/) · [sales/](./sales/)

---

### Quy trình khi có task mới

1. Đọc URL endpoint bị bug
2. Lấy segment đầu sau host (`biz.reborn.vn/<PREFIX>/...`)
3. Tạo file ở `docs/backend-tasks/<prefix>/<tên-kebab>.md`
4. Cập nhật bảng "Task đang mở" trong README này
5. Cross-ref nếu task span nhiều microservice (doc chính ở service chủ, pointer ở service phụ)

---

## 📋 Quy ước viết task mới

Mỗi file task phải có frontmatter:

```markdown
# BACKEND TASK — <tên ngắn>

**Discovered:** YYYY-MM-DD — <source: test script / bug report / incident>
**Severity:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW / FEATURE
**Module:** `cloud-<name>-master`
**Endpoints affected:** <list>
```

Sau đó các section: Mô tả → Hard evidence → Root cause → Action → Re-test → Files FE liên quan.

**Tên file:** kebab-case, không prefix `BACKEND-TASK-` (thư mục đã nói rồi).

**Delete policy:** khi task **fully done** (BE deploy + FE retest pass), xóa file khỏi đây. Nếu done một phần, strip phần done chỉ giữ phần còn lại. Cập nhật index trong README.
