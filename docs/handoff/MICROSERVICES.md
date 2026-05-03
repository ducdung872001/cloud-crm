# Microservices Registry — tnpm

Single source of truth cho 2 skill `/handoff-out-ms` và `/handoff-in-ms` của FE **tnpm**. Khi cần dispatch task xuống backend, FE Claude phải dò bảng + section "Scope chi tiết" dưới đây để chọn `<service>` đúng.

- **FE name (label)**: `tnpm`
- **FE repo**: `ducdung872001/cloud-crm` — **branch active: `reborn-tnpm`** (KHÔNG `master`).
- **Owner GitHub**: `ducdung872001` (chung cho FE và mọi BE microservice).
- **Default branch BE**: hầu hết repo dùng `master`. **NGOẠI LỆ: `bpm` dùng nhánh `cloud`** (repo `bpm-core` có default GitHub branch là `master` nhưng nhánh active của BPM là `cloud`).
- **Multi-tenant BE**: mỗi BE phục vụ nhiều FE khác nhau (mỗi ngành 1 FE), nên handoff PHẢI mang nhãn `from-tnpm` để BE biết reply về đâu.
- **Multi-FE trên cùng repo cloud-crm**: `cloud-crm` còn host nhiều FE branch khác (banking, retail, mentorhub, fitpro, realestate, …). Vì vậy reply từ BE phải mang **2 label đồng thời** trên repo `cloud-crm`:
  - `reply-from-<service>` — đánh dấu service nào reply
  - `to-tnpm` — đánh dấu reply cho FE tnpm (KHÔNG cho banking/retail/mentorhub/fitpro)

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
> ⭐ Đối với tnpm, `operation` là service CORE nhất (project/building/space/meter/management fee) — khác fitpro hầu như không dùng `operation`.

---

## Scope chi tiết — chọn service nào?

Trích từ overview docs của từng repo BE. Khi không chắc service nào, đọc kỹ "Scope chính" và "KHÔNG thuộc scope" của các candidate.

### `billing`
- **Mục đích chính**: Quản lý tài chính nội bộ — dòng tiền, quỹ, công nợ, đối chiếu ngân hàng, hóa đơn điện tử.
- **Scope chính**: Phiếu thu/chi và thống kê, quản lý quỹ tiền, công nợ phải thu/trả, đặt cọc tài chính, VietQR callback, dashboard tài chính.
- **KHÔNG thuộc scope**: Hóa đơn bán hàng (→ `sales`), sản phẩm (→ `inventory`), khách hàng (→ `customer`), nhân sự (→ `customer`).
- **Tnpm use case**: Công nợ phải thu (cư dân/khách thuê chậm trả phí thuê + phí quản lý CAM), công nợ phải trả (vendor invoice sau approval), đặt cọc lease contract (deposit ledger), đối chiếu thanh toán MSB/Timi/VNPay/MoMo (gateway chuyển sang `integration` config nhưng cashbook entry phát sinh ở đây), dashboard P&L per-project liên thông Portfolio Dashboard.
- **Entity/bảng key**: `cashbook`, `category`, `fund`, `debt`, `debt_payment`, `deposit`, `reconciliation`.
- **API base path**: `/billing/*`.

### `bpm`
- **Mục đích chính**: BPM workflow engine (process design-time + runtime). Tách riêng khỏi mọi domain microservice.
- **Scope chính**: Process design-time (deploy BPMN, version), runtime (start instance, query status, signal task), callback dispatch khi process kết thúc, business process catalog, form-based config.
- **KHÔNG thuộc scope**: Business decision/rule (trong process variables/script — do service domain quyết); customer data (→ `customer`); approval rule (→ domain owner); notification dispatch (→ `notification`).
- **Tnpm use case**: 4-step workflow duyệt **Vendor Invoice** (3-way match → approval level 1/2/3 → posting), 4-step workflow **B2G Compliance** (submit → review → approve → file), workflow **Lease Contract** auto-renew/escalation trigger định kỳ, workflow approval **Service Request** chuyển vendor xử lý, workflow **CAM allocation** preview → confirm → post.
- **Entity/bảng key**: `process_definition`, `process_instance`, `task`, `business_process`, `form_definition`, `process_variables`, `bpm_callback_outbox`.
- **API base path**: `/bpm/instance/*`, `/bpm/process/*`, `/bpm/task/*`, `/bpm/business-process/*`.
- **Repo**: `ducdung872001/bpm-core` — nhánh active `cloud`. Clone: `gh repo clone ducdung872001/bpm-core -- -b cloud`.
- **Multi-tenant note**: BPM engine dùng cho mọi ngành. Process variables phải generic `Map<String, Object>`, callback URL configurable per process definition (KHÔNG hardcode tnpm callback).

### `care`
- **Mục đích chính**: Chăm sóc khách hàng và dịch vụ sau bán.
- **Scope chính**: Phiếu hỗ trợ khách (ticket), bảo hành, trao đổi nội bộ, khảo sát trải nghiệm (CXM), VOC feedback, quy trình hỗ trợ SLA, hộp thư nội bộ.
- **KHÔNG thuộc scope**: Khách hàng master (→ `customer`), hợp đồng (→ `contract`), bảng lương, BPM workflow.
- **Tnpm use case**: Ticket cư dân khiếu nại (thang máy hỏng, sự cố điện nước, bãi xe), khảo sát hài lòng cư dân định kỳ, VOC khi tenant churn, hộp thư trao đổi vendor ↔ owner property, **Service Request** từ cư dân (mặc dù FE để page riêng `ServiceRequestList`, body domain vẫn map sang `care.ticket` extension fields).
- **Entity/bảng key**: `ticket`, `warranty`, `support`, `mailbox`, `cxmSurvey`, `voc`, `feedback`, `guarantee`.
- **API base path**: `/care/ticket/*`, `/care/warranty/*`, `/care/support/*`.

### `contract`
- **Mục đích chính**: Vòng đời hợp đồng, báo giá, bảo lãnh, tài chính dự án.
- **Scope chính**: Tạo/sửa/duyệt hợp đồng, phụ lục, thanh toán theo đợt, báo giá, bảo lãnh hợp đồng/ngân hàng, tài chính dự án.
- **KHÔNG thuộc scope**: Khách hàng (→ `customer`), nhân viên (→ `customer`), sản phẩm/dịch vụ catalog (→ `inventory`), luồng BPM.
- **Tnpm use case**: **Lease Contract** với 4 tab (escalation rule, deposit ledger, auto-renew config, payment schedule), **Service Contract** dài hạn cho cư dân (phí quản lý hàng tháng), **Vendor Contract** (master service agreement, SLA, đơn giá per-task), **Partner Contract** (operator nhà thầu phụ, bonus). Phụ lục điều chỉnh giá thuê khi escalate. Bảo lãnh thi công/bảo hành cho vendor lớn (chiller, thang máy).
- **Entity/bảng key**: `contract`, `contract_pipeline`, `contract_appendix`, `contract_payment`, `contract_warranty`, `guarantee`, `quote`, `fs`.
- **API base path**: `/contract/contract/*`, `/contract/contractAppendix/*`, `/contract/guarantee/*`.

### `customer`
- **Mục đích chính**: CRM core — nguồn dữ liệu chủ cho khách hàng và tổ chức.
- **Scope chính**: Hồ sơ khách (master), danh mục, phân quyền/role, nhân viên/phòng ban, campaign sơ cấp, schedule/lịch hẹn, webhook, báo cáo CRM.
- **KHÔNG thuộc scope**: BPM workflow engine, Elasticsearch search service, authenticator, kho/sản phẩm (→ `inventory`).
- **Tnpm use case**: Hồ sơ cư dân/khách thuê (master) + cá nhân ký lease, hồ sơ **Vendor master** (5-tab detail: profile, contract, KPI, invoice, blacklist), hồ sơ **Partner** (operator vận hành), employee BĐS team (project manager, kế toán, kỹ thuật toà nhà), phân quyền theo role (admin, owner, vendor portal user, finance, technical), lịch hẹn xem nhà / hẹn bàn giao căn / hẹn vendor đến bảo trì, **Owner Dashboard** role-based row security.
- **Entity/bảng key**: `customer`, `employee`, `department`, `permission`, `role`, `campaign`, `schedule`.
- **API base path**: `/customer/*`.

### `integration`
- **Mục đích chính**: Gateway tích hợp với nhà cung cấp bên ngoài.
- **Scope chính**: Tích hợp Lazada/sàn TMĐT, vận chuyển, hóa đơn điện tử sInvoice, cấu hình email/SMS/Zalo (kết nối provider), tổng đài, mẫu tin nhắn provider, webhook nhận từ đối tác.
- **KHÔNG thuộc scope**: Bán hàng nội bộ (→ `sales`), CRM (→ `customer`), kho (→ `inventory`), kế toán (→ `billing`), BPM, phân quyền.
- **Tnpm use case**: Cấu hình **Payment Gateway** MSB / Timi / VNPay / MoMo (`SettingPaymentMethods` UI), webhook nhận callback thanh toán phí cư dân, **sInvoice** phát hành cho từng kỳ phí thuê / phí quản lý, Zalo OA gửi thông báo phí + reminder hạn nộp, **Hotline integration** (HLD Phase 4 — chưa triển khai), webhook B2G nộp dữ liệu lên cơ quan thuế / quản lý nhà nước.
- **Entity/bảng key**: `order_platform_mapping`, `product_platform_mapping`, `carrier_config`, `email_config`, `sinvoice_log`, template categories.
- **API base path**: `/integration/lazada/*`, `/integration/shipment/*`, `/integration/sinvoice/*`, `/integration/email/*`.

### `inventory`
- **Mục đích chính**: Kho hàng, tồn kho, sản phẩm, nhập/xuất/chuyển kho, sản xuất.
- **Scope chính**: Quản lý kho, tồn kho hiện tại, sản phẩm/biến thể, nhập hàng, điều chỉnh/chuyển kho, sản xuất, nhà cung cấp, báo cáo tồn.
- **KHÔNG thuộc scope**: Đơn hàng (→ `sales`), thanh toán (→ `billing`/`sales`), nhân viên (→ `customer`), Elasticsearch.
- **Tnpm use case**: Mặc định tnpm KHÔNG dùng `inventory` cho domain chính (BĐS không có sản phẩm bán). Có thể dùng cho **vật tư bảo trì** (bóng đèn, thiết bị HVAC, vật liệu sửa chữa) tồn ở kho kỹ thuật toà nhà — phục vụ Maintenance Plan và Service Request execution. Catalog vendor service (vd "thay bóng đèn LED 18W") cũng có thể map sang `product` nếu BE chấp nhận; hiện tại FE giả định catalog dịch vụ nằm trong `contract` (vendor contract line items).
- **Entity/bảng key**: `warehouse`, `inventory_balance`, `inventory_transaction`, `inventory_layer`, `product`, `supplier`, `material`.
- **API base path**: `/inventory/warehouse/*`, `/inventory/product/*`, `/inventory/stockTransfer/*`.

### `logistics`
- **Mục đích chính**: Vận chuyển, giao hàng sau khi đơn bán đã tạo.
- **Scope chính**: Tạo/huỷ đơn giao, tracking trạng thái, hãng vận chuyển nội bộ, cấu hình phí ship, nhãn vận đơn, lịch sử di chuyển.
- **KHÔNG thuộc scope**: Đơn bán (→ `sales`), sản phẩm/kho (→ `inventory`), khách hàng (→ `customer`), tích hợp API hãng vận chuyển (→ `integration`).
- **Tnpm use case**: Mặc định KHÔNG dùng. Có thể dùng nếu vendor giao vật tư bảo trì từ kho tổng → kho toà nhà (chuyển kho nội bộ — thường dùng `inventory.stockTransfer` thay vì `logistics.shipment`). Nếu portfolio tnpm có gửi tài liệu pháp lý / ấn phẩm cho cư dân (vd hợp đồng giấy ký lại) → có thể dùng `logistics`.
- **Entity/bảng key**: `shipment`, `shipment_item`, `shipment_label`, `shipping_status_history`, `carrier_partner`, `unified_status`.
- **API base path**: `/logistics/shipment/*`, `/logistics/carrier/*`, `/logistics/fee-config/*`.

### `market`
- **Mục đích chính**: Marketing & customer engagement — loyalty, promotion, event, campaign, marketing automation.
- **Scope chính**: CTKM/voucher, chương trình loyalty/điểm, sự kiện, chiến dịch marketing, workflow automation marketing, kịch bản chăm sóc khách.
- **KHÔNG thuộc scope**: Khách hàng master (→ `customer`), sản phẩm (→ `inventory`), hóa đơn (→ `sales`/`billing`), quy trình BPM, phân quyền.
- **Tnpm use case**: Voucher giảm phí thuê tháng đầu (chương trình "thuê 12 tháng tặng 1"), loyalty point cho cư dân lâu năm (giảm phí dịch vụ), event tổ chức tại sảnh toà nhà / cộng đồng cư dân, chiến dịch marketing thu hút khách thuê mới (quảng bá unit trống), kịch bản chăm sóc cư dân năm đầu (welcome → 30/60/90 ngày → renewal nudge).
- **Entity/bảng key**: `promotion`, `loyalty_wallet`, `loyalty_program`, `event`, `marketing`, `ma`, `care_scenario`.
- **API base path**: `/market/promotion/*`, `/market/loyalty*/*`, `/market/events/*`, `/market/campaign/*`.

### `notification`
- **Mục đích chính**: Trung tâm phát hành thông báo qua nhiều kênh.
- **Scope chính**: Gửi email (SMTP/OAuth/Partner), Firebase push, SMS/Zalo ZNS, in-app notification, template email/push, lập lịch thông báo, lịch sử gửi.
- **Channels hỗ trợ**: Email (SMTP, Gmail, Outlook, Azure), FCM, SMS (Viettel), Zalo ZNS, in-app.
- **KHÔNG thuộc scope**: Quyết định nghiệp vụ "khi nào gửi" (do service nguồn quyết), opt-in/opt-out, báo cáo BI.
- **Tnpm use case**: **Fee Notification Engine** (4-tab wizard FE) — phát hành đợt thông báo phí định kỳ cho nhiều cư dân cùng lúc qua email + Zalo ZNS + push, reminder hạn thanh toán T-7 / T-3 / T-1, alert vendor khi có service request mới được approve, alert finance khi vendor invoice cần duyệt cấp 2/3, alert owner khi P&L lệch ngưỡng cảnh báo, thông báo lease auto-renew / escalation áp dụng. Template email phải hỗ trợ variable cư dân + project + kỳ phí.
- **Entity/bảng key**: `NotificationEmail`, `NotificationFirebase`, `EmailConfig`, `FcmDevice`, `FcmTopic`, `SmsDelivery`, `ZaloDelivery`, `TemplateEmail`.
- **API base path**: `/notification/email/*`, `/notification/fcm*/*`, `/notification/sms/*`, `/notification/zns/*`.

### `operation` ⭐ CORE cho tnpm
- **Mục đích chính**: Vận hành toà nhà / dự án bất động sản — quản lý dữ liệu vận hành cư dân, mặt bằng, tiện ích, thu phí ở tầng nghiệp vụ.
- **Scope chính (7 domain — `prod_clouddb_operation` ~23 bảng)**:
  1. **Dự án – Toà nhà – Tầng**: `project`, `building`, `building_floor` (cây phân cấp BĐS)
  2. **Không gian (căn hộ / mặt bằng)**: `space`, `space_type`, `space_customer` (đơn vị + lịch sử thuê)
  3. **Điện**: `electric_meter`, `meter_space`, `electric_index`, `electricity_rate`, `electric_fee`
  4. **Nước**: `water_meter`, `water_meter_space`, `water_index`, `water_rate`, `water_fee`
  5. **Phí quản lý + phí khác**: `management_fee`, `management_fee_rate`, `other_fee`
  6. **Phương tiện / bãi xe**: `vehicle`, `vehicle_registration`, `parking_fee`
  7. **Tiện ích tổng hợp**: `utility_reading`
- **KHÔNG thuộc scope**: Hồ sơ cư dân/khách (→ `customer`), hợp đồng thuê (→ `contract`), phát hành invoice ra cổng + đối soát NH (→ `sales`/`billing`), BPM workflow (→ `bpm`), upload media, BI tổng hợp.
- **Tnpm use case**: **Service CHÍNH** — `PropertyProjectList`, `PropertyUnitList`, `MeterReadingList`, `BillingEngineList` (line items lấy từ meter + management fee), CAM allocation, parking management. Mọi entity gắn `bsn_id` từ JWT (multi-tenant).
- **Convention CRUD chuẩn (TẤT CẢ 23 resource đều theo pattern này)**:
  - `GET  /operation/<resource>/list` — paged (`page`, `size`, `sort`, kèm filter `name`/`customerId`/...)
  - `GET  /operation/<resource>/get?id=<int>` — 1 record theo id
  - `POST /operation/<resource>/update` — body=entity; `id≤0` = INSERT, `id>0` = UPDATE
  - `DELETE /operation/<resource>/delete?id=<int>`
  - Response: `DfResponse<T>` (envelope `{code,message,data}`); list trả `DfResponse<Page<T>>`
- **API base path**: `/operation/{project|building|buildingFloor|space|spaceType|spaceCustomer|electricMeter|meterSpace|electricIndex|electricityRate|electricFee|waterMeter|waterMeterSpace|waterIndex|waterRate|waterFee|managementFee|managementFeeRate|otherFee|utilityReading|vehicle|vehicleRegistration|parkingFee}/{list,get,update,delete}`
- **Auth**: Bearer JWT (Authorization header). Service tự gọi `biz.reborn.vn/customer/employee/permission/checker` xác thực quyền theo `bsn_id` + `selectedRole`. Action ∈ `VIEW/ADD/UPDATE/DELETE`, URI `/management/`.
- **Repo & docs**: `ducdung872001/cloud-operation-master` (default `master`). Docs: [SERVICE_OVERVIEW.md](https://github.com/ducdung872001/cloud-operation-master/blob/master/docs/SERVICE_OVERVIEW.md), [ERD.md](https://github.com/ducdung872001/cloud-operation-master/blob/master/docs/ERD.md), [erd.dbml](https://github.com/ducdung872001/cloud-operation-master/blob/master/docs/erd.dbml).
- **Stack**: Spring Boot 3.2 + Vert.x + jOOQ + Kafka, Java 21, MySQL.
- **Kafka topics phát đi**: `action-log`, `log-capture`, `upload-customer-api`, `upload-work-order`, `cloud-bpm-trigger`.

### `sales`
- **Mục đích chính**: Bán hàng, hóa đơn, thanh toán, hoa hồng, đặt cọc, chiến dịch & cơ hội bán (opportunity).
- **Scope chính**: Hóa đơn POS, đơn hàng, cấu hình thanh toán, ca làm việc, hoa hồng nhân viên, đặt cọc, chiến dịch/cơ hội bán hàng, báo cáo doanh số.
- **KHÔNG thuộc scope**: Sản phẩm/kho (→ `inventory`), khách hàng hồ sơ (→ `customer`), nhân viên (→ `customer`), voucher (→ `market`), BPM, notification.
- **Tnpm use case**: **Invoice** phát hành cho cư dân mỗi kỳ (gồm phí thuê + phí quản lý + tiện ích — line item ghép từ `operation.management_fee` + meter reading), **Deposit** đặt cọc khi ký lease (cross-ref với `contract.contract_payment`), **Opportunity** pipeline khách thuê tiềm năng (lead → tham quan → ký → thu cọc), **Vendor Invoice** (input từ vendor — workflow 3-way match + 4-step approval; approval xong post sang `billing.cashbook`). Hoa hồng nhân viên môi giới khi chốt được hợp đồng cho thuê dài hạn.
- **Entity/bảng key**: `invoice`, `order`, `shift`, `tip_group`, `deposit`, `campaign`, `opportunity`.
- **API base path**: `/sales/invoice/*`, `/sales/order/*`, `/sales/shift/*`, `/sales/deposit/*`, `/sales/campaign/*`.

> 📌 **Tnpm note**: domain "billing kỳ phí cư dân" trải nhiều service:
> - Master toà nhà / căn / công tơ → `operation`
> - Meter reading + biểu giá + management fee config → `operation`
> - Lease contract (giá thuê, escalation, deposit) → `contract`
> - Invoice line items (phí thuê + tiện ích + CAM) phát hành cho cư dân → `sales.invoice`
> - Đặt cọc tiền tệ + công nợ phải thu → `billing`
> - Payment gateway callback MSB/Timi/VNPay/MoMo → `integration` (config) + `billing` (cashbook entry)
> - Phát hành thông báo phí (email/Zalo) → `notification`
> - sInvoice E-invoice → `integration.sinvoice`
> - Workflow approval vendor invoice / B2G → `bpm`
> - Service request từ cư dân → `care` (ticket extension)
> - Vendor master + KPI + blacklist → `customer` (employee/vendor extension)
> - Vendor contract + SLA + line items → `contract`
> Khi 1 task chạm nhiều domain, gửi handoff RIÊNG cho từng service và cross-link issue URL.

---

## Convention handoff

**Outbound (FE tnpm → BE)** — qua skill `/handoff-out-ms`:
- Channel: GitHub Issue trên repo BE tương ứng
- Title: `[handoff] <slug> — <one-line goal>`
- Label bắt buộc: `from-tnpm` (BE dùng để biết reply về đâu)
- Body: bao gồm `from: tnpm`, `fe_repo: ducdung872001/cloud-crm`, `fe_branch: reborn-tnpm`, scope, contract, file paths, done criteria, và Reply protocol
- Audit local: `.handoff/sent/<YYYYMMDD-HHMM>-<service>-<slug>.md` (gitignored)

**Inbound (BE → FE tnpm)** — qua skill `/handoff-in-ms`:
- Channel: GitHub Issue mới trên repo `ducdung872001/cloud-crm`
- Title: `[reply] <original-slug> — <status>`
- Label bắt buộc (CẢ HAI): `reply-from-<service>` AND `to-tnpm` ← compound, vì cloud-crm dùng chung nhiều FE
- Body: ref tới issue gốc trên repo BE, tóm tắt thay đổi, commit SHA, breaking changes
- Sau khi FE đọc xong: comment + close issue reply, audit log local move từ `sent/` sang `replied/`

**Cross-service tasks**: Nếu 1 task FE chạm nhiều domain (vd "phát hành kỳ phí tháng kèm reminder Zalo"), tạo HANDOFF RIÊNG cho từng service và cross-link issue URL trong body — KHÔNG gộp vào 1 issue đơn lẻ.
