# Microservices Registry — mentorhub

Single source of truth cho 2 skill `/handoff-out-ms` và `/handoff-in-ms` của FE **mentorhub**. Khi cần dispatch task xuống backend, FE Claude phải dò bảng + section "Scope chi tiết" dưới đây để chọn `<service>` đúng.

- **FE name (label)**: `mentorhub`
- **FE repo**: `ducdung872001/cloud-crm` — **branch active: `reborn-mentorhub`** (KHÔNG `master`).
- **Owner GitHub**: `ducdung872001` (chung cho FE và mọi BE microservice).
- **Default branch BE**: hầu hết repo dùng `master`. **NGOẠI LỆ: `bpm` dùng nhánh `cloud`** (repo `bpm-core` có default GitHub branch là `master` nhưng nhánh active của BPM là `cloud`).
- **Multi-tenant BE**: mỗi BE phục vụ nhiều FE khác nhau (mỗi ngành 1 FE), nên handoff PHẢI mang nhãn `from-mentorhub` để BE biết reply về đâu.
- **Multi-FE trên cùng repo cloud-crm**: `cloud-crm` còn host nhiều FE branch khác (banking, retail, realestate, …). Vì vậy reply từ BE phải mang **2 label đồng thời** trên repo `cloud-crm`:
  - `reply-from-<service>` — đánh dấu service nào reply
  - `to-mentorhub` — đánh dấu reply cho FE mentorhub (KHÔNG cho banking/retail)

  Skill `/handoff-in-ms` chỉ pick issue có CẢ HAI label.

## Quick lookup

| service | Repo BE | Mô tả gốc |
|---|---|---|
| `billing` | `ducdung872001/cloud-billing-master` (master) | [SERVICE_PROFILE.txt](https://github.com/ducdung872001/cloud-billing-master/blob/master/docs/SERVICE_PROFILE.txt) |
| `bpm` | `ducdung872001/bpm-core` **(branch: `cloud`)** | [README.md](https://github.com/ducdung872001/bpm-core/blob/cloud/README.md) |
| `care` | `ducdung872001/cloud-care-master` | [MICROSERVICE_OVERVIEW.md](https://github.com/ducdung872001/cloud-care-master/blob/master/docs/MICROSERVICE_OVERVIEW.md) |
| `contract` | `ducdung872001/cloud-contract-master` | [MICROSERVICE_OVERVIEW.md](https://github.com/ducdung872001/cloud-contract-master/blob/master/docs/MICROSERVICE_OVERVIEW.md) |
| `customer` | `ducdung872001/cloud-customer-master` | [SERVICE_OVERVIEW.md](https://github.com/ducdung872001/cloud-customer-master/blob/master/docs/SERVICE_OVERVIEW.md) |
| `integration` | `ducdung872001/cloud-integration-master` | [CLOUD_INTEGRATION_OVERVIEW.md](https://github.com/ducdung872001/cloud-integration-master/blob/master/docs/CLOUD_INTEGRATION_OVERVIEW.md) |
| `inventory` | `ducdung872001/cloud-inventory-master` | [SERVICE_OVERVIEW.md](https://github.com/ducdung872001/cloud-inventory-master/blob/master/docs/SERVICE_OVERVIEW.md) |
| `logistics` | `ducdung872001/cloud-logistics-master` | [MICROSERVICE_OVERVIEW.md](https://github.com/ducdung872001/cloud-logistics-master/blob/master/docs/MICROSERVICE_OVERVIEW.md) |
| `market` | `ducdung872001/cloud-market-master` | [MICROSERVICE_PROFILE.md](https://github.com/ducdung872001/cloud-market-master/blob/master/MICROSERVICE_PROFILE.md) |
| `notification` | `ducdung872001/reborn-notihub` | [SERVICE_PROFILE.md](https://github.com/ducdung872001/reborn-notihub/blob/master/SERVICE_PROFILE.md) |
| `operation` | `ducdung872001/cloud-operation-master` | [SERVICE_OVERVIEW.md](https://github.com/ducdung872001/cloud-operation-master/blob/master/docs/SERVICE_OVERVIEW.md) |
| `sales` | `ducdung872001/cloud-sales-master` | [MICROSERVICE_OVERVIEW.md](https://github.com/ducdung872001/cloud-sales-master/blob/master/docs/MICROSERVICE_OVERVIEW.md) |

> ⚠️ `notification` lệch naming: repo là `reborn-notihub`, KHÔNG phải `cloud-notification-master`.
> ⚠️ `bpm` lệch naming + branch: repo là `bpm-core` (KHÔNG `cloud-bpm-master`); nhánh active là **`cloud`** (KHÔNG `master`).

---

## Scope chi tiết — chọn service nào?

Trích từ overview docs của từng repo BE. Khi không chắc service nào, đọc kỹ "Scope chính" và "KHÔNG thuộc scope" của các candidate.

### `billing`
- **Mục đích chính**: Quản lý tài chính nội bộ — dòng tiền, quỹ, công nợ, đối chiếu ngân hàng, hóa đơn điện tử.
- **Scope chính**: Phiếu thu/chi và thống kê, quản lý quỹ tiền, công nợ phải thu/trả, đặt cọc tài chính, VietQR callback, dashboard tài chính.
- **KHÔNG thuộc scope**: Hóa đơn bán hàng (→ `sales`), sản phẩm (→ `inventory`), khách hàng (→ `customer`), nhân sự (→ `customer`).
- **Mentorhub use case**: Payout cho mentor, công nợ học phí, đối chiếu giao dịch ngân hàng cho thanh toán khoá học.
- **Entity/bảng key**: `cashbook`, `category`, `fund`, `debt`, `debt_payment`, `deposit`, `reconciliation`.
- **API base path**: `/billing/*`.

### `bpm`
- **Mục đích chính**: BPM workflow engine (process design-time + runtime). Tách riêng khỏi mọi domain microservice.
- **Scope chính**: Process design-time (deploy BPMN, version), runtime (start instance, query status, signal task), callback dispatch khi process kết thúc, business process catalog, form-based config.
- **KHÔNG thuộc scope**: Business decision/rule (trong process variables/script — do service domain quyết); customer data (→ `customer`); approval rule (→ domain owner); notification dispatch (→ `notification`).
- **Mentorhub use case**: Quy trình duyệt khoá học (mentor submit → admin approve → publish), quy trình refund học phí, onboarding mentor.
- **Entity/bảng key**: `process_definition`, `process_instance`, `task`, `business_process`, `form_definition`, `process_variables`, `bpm_callback_outbox`.
- **API base path**: `/bpm/instance/*`, `/bpm/process/*`, `/bpm/task/*`, `/bpm/business-process/*`.
- **Repo**: `ducdung872001/bpm-core` — nhánh active `cloud`. Clone: `gh repo clone ducdung872001/bpm-core -- -b cloud`.
- **Multi-tenant note**: BPM engine dùng cho mọi ngành. Process variables phải generic `Map<String, Object>`, callback URL configurable per process definition (KHÔNG hardcode mentorhub callback).

### `care`
- **Mục đích chính**: Chăm sóc khách hàng và dịch vụ sau bán.
- **Scope chính**: Phiếu hỗ trợ khách (ticket), bảo hành, trao đổi nội bộ, khảo sát trải nghiệm (CXM), VOC feedback, quy trình hỗ trợ SLA, hộp thư nội bộ.
- **KHÔNG thuộc scope**: Khách hàng master (→ `customer`), hợp đồng (→ `contract`), bảng lương, BPM workflow.
- **Mentorhub use case**: Ticket hỗ trợ học viên, NPS/feedback khoá học, hộp thư trao đổi mentor ↔ học viên.
- **Entity/bảng key**: `ticket`, `warranty`, `support`, `mailbox`, `cxmSurvey`, `voc`, `feedback`, `guarantee`.
- **API base path**: `/care/ticket/*`, `/care/warranty/*`, `/care/support/*`.

### `contract`
- **Mục đích chính**: Vòng đời hợp đồng, báo giá, bảo lãnh, tài chính dự án.
- **Scope chính**: Tạo/sửa/duyệt hợp đồng, phụ lục, thanh toán theo đợt, báo giá, bảo lãnh hợp đồng/ngân hàng, tài chính dự án.
- **KHÔNG thuộc scope**: Khách hàng (→ `customer`), nhân viên (→ `customer`), sản phẩm/dịch vụ catalog (→ `inventory`), luồng BPM.
- **Mentorhub use case**: Hợp đồng mentor (TOS, doanh thu chia sẻ), hợp đồng B2B với doanh nghiệp đặt khoá học.
- **Entity/bảng key**: `contract`, `contract_pipeline`, `contract_appendix`, `contract_payment`, `contract_warranty`, `guarantee`, `quote`, `fs`.
- **API base path**: `/contract/contract/*`, `/contract/contractAppendix/*`, `/contract/guarantee/*`.

### `customer`
- **Mục đích chính**: CRM core — nguồn dữ liệu chủ cho khách hàng và tổ chức.
- **Scope chính**: Hồ sơ khách (master), danh mục, phân quyền/role, nhân viên/phòng ban, campaign sơ cấp, schedule/lịch hẹn, webhook, báo cáo CRM.
- **KHÔNG thuộc scope**: BPM workflow engine, Elasticsearch search service, authenticator, kho/sản phẩm (→ `inventory`).
- **Mentorhub use case**: Hồ sơ học viên (master), hồ sơ mentor (employee), phân quyền mentor/admin/học viên, lịch hẹn 1-1, segment học viên cho CRM marketing.
- **Entity/bảng key**: `customer`, `employee`, `department`, `permission`, `role`, `campaign`, `schedule`.
- **API base path**: `/customer/*`.

### `integration`
- **Mục đích chính**: Gateway tích hợp với nhà cung cấp bên ngoài.
- **Scope chính**: Tích hợp Lazada/sàn TMĐT, vận chuyển, hóa đơn điện tử sInvoice, cấu hình email/SMS/Zalo (kết nối provider), tổng đài, mẫu tin nhắn provider, webhook nhận từ đối tác.
- **KHÔNG thuộc scope**: Bán hàng nội bộ (→ `sales`), CRM (→ `customer`), kho (→ `inventory`), kế toán (→ `billing`), BPM, phân quyền.
- **Mentorhub use case**: Tích hợp Zalo OA / Mini App (đã có docs/zalo-*), Email provider OAuth, webhook nhận event từ Zalo.
- **Entity/bảng key**: `order_platform_mapping`, `product_platform_mapping`, `carrier_config`, `email_config`, `sinvoice_log`, template categories.
- **API base path**: `/integration/lazada/*`, `/integration/shipment/*`, `/integration/sinvoice/*`, `/integration/email/*`.

### `inventory`
- **Mục đích chính**: Kho hàng, tồn kho, sản phẩm, nhập/xuất/chuyển kho, sản xuất.
- **Scope chính**: Quản lý kho, tồn kho hiện tại, sản phẩm/biến thể, nhập hàng, điều chỉnh/chuyển kho, sản xuất, nhà cung cấp, báo cáo tồn.
- **KHÔNG thuộc scope**: Đơn hàng (→ `sales`), thanh toán (→ `billing`/`sales`), nhân viên (→ `customer`), Elasticsearch.
- **Mentorhub use case**: Catalog "khoá học" như product (vì khoá học là digital product có biến thể: cấp độ, gói combo). Cần clarify với BE liệu "course" có map vào `product` table hay tách riêng.
- **Entity/bảng key**: `warehouse`, `inventory_balance`, `inventory_transaction`, `inventory_layer`, `product`, `supplier`, `material`.
- **API base path**: `/inventory/warehouse/*`, `/inventory/product/*`, `/inventory/stockTransfer/*`.

### `logistics`
- **Mục đích chính**: Vận chuyển, giao hàng sau khi đơn bán đã tạo.
- **Scope chính**: Tạo/huỷ đơn giao, tracking trạng thái, hãng vận chuyển nội bộ, cấu hình phí ship, nhãn vận đơn, lịch sử di chuyển.
- **KHÔNG thuộc scope**: Đơn bán (→ `sales`), sản phẩm/kho (→ `inventory`), khách hàng (→ `customer`), tích hợp API hãng vận chuyển (→ `integration`).
- **Mentorhub use case**: Hiếm — chỉ khi mentorhub bán kèm sản phẩm vật lý (giáo trình in, voucher giấy). Mặc định mentorhub là digital, KHÔNG dùng.
- **Entity/bảng key**: `shipment`, `shipment_item`, `shipment_label`, `shipping_status_history`, `carrier_partner`, `unified_status`.
- **API base path**: `/logistics/shipment/*`, `/logistics/carrier/*`, `/logistics/fee-config/*`.

### `market`
- **Mục đích chính**: Marketing & customer engagement — loyalty, promotion, event, campaign, marketing automation.
- **Scope chính**: CTKM/voucher, chương trình loyalty/điểm, sự kiện, chiến dịch marketing, workflow automation marketing, kịch bản chăm sóc khách.
- **KHÔNG thuộc scope**: Khách hàng master (→ `customer`), sản phẩm (→ `inventory`), hóa đơn (→ `sales`/`billing`), quy trình BPM, phân quyền.
- **Mentorhub use case**: Voucher giảm giá khoá học, referral chương trình giới thiệu, điểm thưởng học viên, marketing automation re-engagement học viên ngừng học.
- **Entity/bảng key**: `promotion`, `loyalty_wallet`, `loyalty_program`, `event`, `marketing`, `ma`, `care_scenario`.
- **API base path**: `/market/promotion/*`, `/market/loyalty*/*`, `/market/events/*`, `/market/campaign/*`.

### `notification`
- **Mục đích chính**: Trung tâm phát hành thông báo qua nhiều kênh.
- **Scope chính**: Gửi email (SMTP/OAuth/Partner), Firebase push, SMS/Zalo ZNS, in-app notification, template email/push, lập lịch thông báo, lịch sử gửi.
- **Channels hỗ trợ**: Email (SMTP, Gmail, Outlook, Azure), FCM, SMS (Viettel), Zalo ZNS, in-app.
- **KHÔNG thuộc scope**: Quyết định nghiệp vụ "khi nào gửi" (do service nguồn quyết), opt-in/opt-out, báo cáo BI.
- **Mentorhub use case**: Reminder buổi học live sắp diễn ra (Zalo ZNS/email/in-app), chat 2 chiều mentor↔học viên (in-app + email fallback), thông báo có review NPS mới.
- **Entity/bảng key**: `NotificationEmail`, `NotificationFirebase`, `EmailConfig`, `FcmDevice`, `FcmTopic`, `SmsDelivery`, `ZaloDelivery`, `TemplateEmail`.
- **API base path**: `/notification/email/*`, `/notification/fcm*/*`, `/notification/sms/*`, `/notification/zns/*`.

### `operation`
- **Mục đích chính**: Vận hành toà nhà / dự án bất động sản.
- **Scope chính**: Dự án/toà nhà/tầng, không gian (căn hộ), công tơ điện/nước, chỉ số, biểu giá, hoá đơn tiện ích, phí quản lý, phương tiện/bãi xe.
- **KHÔNG thuộc scope**: Khách hàng hồ sơ (→ `customer`), hợp đồng (→ `contract`), thanh toán (→ `billing`), BPM.
- **Mentorhub use case**: KHÔNG dùng — operation là ngành BĐS, không liên quan mentorhub.
- **Entity/bảng key**: `project`, `building`, `space`, `electric_meter`, `water_meter`, `electric_index`, `management_fee`, `vehicle`.
- **API base path**: `/operation/project/*`, `/operation/space/*`.

### `sales`
- **Mục đích chính**: Bán hàng, hóa đơn, thanh toán, hoa hồng, đặt cọc, chiến dịch & cơ hội bán (opportunity).
- **Scope chính**: Hóa đơn POS, đơn hàng, cấu hình thanh toán, ca làm việc, hoa hồng nhân viên, đặt cọc, chiến dịch/cơ hội bán hàng, báo cáo doanh số.
- **KHÔNG thuộc scope**: Sản phẩm/kho (→ `inventory`), khách hàng hồ sơ (→ `customer`), nhân viên (→ `customer`), voucher (→ `market`), BPM, notification.
- **Mentorhub use case**: Đơn đăng ký khoá học (`order`), invoice học phí, hoa hồng mentor, opportunity mentor đang chốt với học viên doanh nghiệp, doanh thu khoá học.
- **Entity/bảng key**: `invoice`, `order`, `shift`, `tip_group`, `deposit`, `campaign`, `opportunity`.
- **API base path**: `/sales/invoice/*`, `/sales/order/*`, `/sales/shift/*`, `/sales/deposit/*`, `/sales/campaign/*`.

> 📌 **Mentorhub note**: domain "khoá học live" có thể trải nhiều service tuỳ shape:
> - Catalog khoá học (tên, mô tả, giá) → ứng viên `inventory.product` hoặc table riêng (cần handoff `inventory` để clarify)
> - Đơn đăng ký + thanh toán → `sales`
> - Lịch dạy live → `customer.schedule`
> - AI Meeting Notes (phần lõi) → KHÔNG service nào hiện có; có thể cần service mới hoặc tạm host trên `care`/`customer` — thảo luận BE trước khi handoff
> - Review NPS → `care`
> Khi 1 task chạm nhiều domain, gửi handoff RIÊNG cho từng service và cross-link issue URL.

---

## Convention handoff

**Outbound (FE mentorhub → BE)** — qua skill `/handoff-out-ms`:
- Channel: GitHub Issue trên repo BE tương ứng
- Title: `[handoff] <slug> — <one-line goal>`
- Label bắt buộc: `from-mentorhub` (BE dùng để biết reply về đâu)
- Body: bao gồm `from: mentorhub`, `fe_repo: ducdung872001/cloud-crm`, `fe_branch: reborn-mentorhub`, scope, contract, file paths, done criteria, và Reply protocol
- Audit local: `.handoff/sent/<YYYYMMDD-HHMM>-<service>-<slug>.md` (gitignored)

**Inbound (BE → FE mentorhub)** — qua skill `/handoff-in-ms`:
- Channel: GitHub Issue mới trên repo `ducdung872001/cloud-crm`
- Title: `[reply] <original-slug> — <status>`
- Label bắt buộc (CẢ HAI): `reply-from-<service>` AND `to-mentorhub` ← compound, vì cloud-crm dùng chung nhiều FE
- Body: ref tới issue gốc trên repo BE, tóm tắt thay đổi, commit SHA, breaking changes
- Sau khi FE đọc xong: comment + close issue reply, audit log local move từ `sent/` sang `replied/`

**Cross-service tasks**: Nếu 1 task FE chạm nhiều domain (vd "tạo course catalog kèm gửi notification reminder"), tạo HANDOFF RIÊNG cho từng service và cross-link issue URL trong body — KHÔNG gộp vào 1 issue đơn lẻ.
