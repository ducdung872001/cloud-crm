# Microservices Registry — fitpro

Single source of truth cho 2 skill `/handoff-out-ms` và `/handoff-in-ms` của FE **fitpro**. Khi cần dispatch task xuống backend, FE Claude phải dò bảng + section "Scope chi tiết" dưới đây để chọn `<service>` đúng.

- **FE name (label)**: `fitpro`
- **FE repo**: `ducdung872001/cloud-crm` — **branch active: `reborn-fitpro`** (KHÔNG `master`).
- **Owner GitHub**: `ducdung872001` (chung cho FE và mọi BE microservice).
- **Default branch BE**: hầu hết repo dùng `master`. **NGOẠI LỆ: `bpm` dùng nhánh `cloud`** (repo `bpm-core` có default GitHub branch là `master` nhưng nhánh active của BPM là `cloud`).
- **Multi-tenant BE**: mỗi BE phục vụ nhiều FE khác nhau (mỗi ngành 1 FE), nên handoff PHẢI mang nhãn `from-fitpro` để BE biết reply về đâu.
- **Multi-FE trên cùng repo cloud-crm**: `cloud-crm` còn host nhiều FE branch khác (banking, retail, mentorhub, realestate, …). Vì vậy reply từ BE phải mang **2 label đồng thời** trên repo `cloud-crm`:
  - `reply-from-<service>` — đánh dấu service nào reply
  - `to-fitpro` — đánh dấu reply cho FE fitpro (KHÔNG cho banking/retail/mentorhub)

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
- **Fitpro use case**: Đối chiếu thanh toán gói tập (chuyển khoản VietQR), công nợ học viên trả góp gói VIP/Super VIP, quỹ tiền của trạm Home/Co-Working, payout hoa hồng đại lý cấp dưới (chú ý: hoa hồng hệ thống MF7 do hãng tự tính/trả — chỉ track giá trị tham chiếu).
- **Entity/bảng key**: `cashbook`, `category`, `fund`, `debt`, `debt_payment`, `deposit`, `reconciliation`.
- **API base path**: `/billing/*`.

### `bpm`
- **Mục đích chính**: BPM workflow engine (process design-time + runtime). Tách riêng khỏi mọi domain microservice.
- **Scope chính**: Process design-time (deploy BPMN, version), runtime (start instance, query status, signal task), callback dispatch khi process kết thúc, business process catalog, form-based config.
- **KHÔNG thuộc scope**: Business decision/rule (trong process variables/script — do service domain quyết); customer data (→ `customer`); approval rule (→ domain owner); notification dispatch (→ `notification`).
- **Fitpro use case**: Quy trình onboarding Business Owner mới (đăng ký → duyệt KYC → mở trạm), quy trình duyệt nhượng quyền 7×7×7 (BO trực tiếp → vệ tinh), quy trình intake học viên 90 ngày (đăng ký → baseline test → bàn giao gói → re-test).
- **Entity/bảng key**: `process_definition`, `process_instance`, `task`, `business_process`, `form_definition`, `process_variables`, `bpm_callback_outbox`.
- **API base path**: `/bpm/instance/*`, `/bpm/process/*`, `/bpm/task/*`, `/bpm/business-process/*`.
- **Repo**: `ducdung872001/bpm-core` — nhánh active `cloud`. Clone: `gh repo clone ducdung872001/bpm-core -- -b cloud`.
- **Multi-tenant note**: BPM engine dùng cho mọi ngành. Process variables phải generic `Map<String, Object>`, callback URL configurable per process definition (KHÔNG hardcode fitpro callback).

### `care`
- **Mục đích chính**: Chăm sóc khách hàng và dịch vụ sau bán.
- **Scope chính**: Phiếu hỗ trợ khách (ticket), bảo hành, trao đổi nội bộ, khảo sát trải nghiệm (CXM), VOC feedback, quy trình hỗ trợ SLA, hộp thư nội bộ.
- **KHÔNG thuộc scope**: Khách hàng master (→ `customer`), hợp đồng (→ `contract`), bảng lương, BPM workflow.
- **Fitpro use case**: Ticket khiếu nại của hội viên (gói lỗi, bị thiếu sản phẩm), khảo sát NPS sau chu kỳ 90 ngày, follow-up VOC khi học viên drop, hộp thư trao đổi BO ↔ hội viên.
- **Entity/bảng key**: `ticket`, `warranty`, `support`, `mailbox`, `cxmSurvey`, `voc`, `feedback`, `guarantee`.
- **API base path**: `/care/ticket/*`, `/care/warranty/*`, `/care/support/*`.

### `contract`
- **Mục đích chính**: Vòng đời hợp đồng, báo giá, bảo lãnh, tài chính dự án.
- **Scope chính**: Tạo/sửa/duyệt hợp đồng, phụ lục, thanh toán theo đợt, báo giá, bảo lãnh hợp đồng/ngân hàng, tài chính dự án.
- **KHÔNG thuộc scope**: Khách hàng (→ `customer`), nhân viên (→ `customer`), sản phẩm/dịch vụ catalog (→ `inventory`), luồng BPM.
- **Fitpro use case**: Hợp đồng nhượng quyền giữa hãng và Business Owner (commit doanh số, điều khoản 3 tầng), hợp đồng B2B với doanh nghiệp đặt gói tập theo lô, báo giá gói VIP/Super VIP cho khách lớn.
- **Entity/bảng key**: `contract`, `contract_pipeline`, `contract_appendix`, `contract_payment`, `contract_warranty`, `guarantee`, `quote`, `fs`.
- **API base path**: `/contract/contract/*`, `/contract/contractAppendix/*`, `/contract/guarantee/*`.

### `customer`
- **Mục đích chính**: CRM core — nguồn dữ liệu chủ cho khách hàng và tổ chức.
- **Scope chính**: Hồ sơ khách (master), danh mục, phân quyền/role, nhân viên/phòng ban, campaign sơ cấp, schedule/lịch hẹn, webhook, báo cáo CRM.
- **KHÔNG thuộc scope**: BPM workflow engine, Elasticsearch search service, authenticator, kho/sản phẩm (→ `inventory`).
- **Fitpro use case**: Hồ sơ hội viên (master) — gồm chỉ số sức khỏe baseline/re-test 90 ngày; hồ sơ Business Owner & PT/Yoga huấn luyện viên (employee); phân quyền theo 3 tầng nhượng quyền (BO trực tiếp / vệ tinh / bùng nổ); lịch hẹn ca tập 6h–9h sáng (slot 3 giờ vàng); cây tổ chức 7×7×7 cho dashboard hoa hồng tham chiếu.
- **Entity/bảng key**: `customer`, `employee`, `department`, `permission`, `role`, `campaign`, `schedule`.
- **API base path**: `/customer/*`.

### `integration`
- **Mục đích chính**: Gateway tích hợp với nhà cung cấp bên ngoài.
- **Scope chính**: Tích hợp Lazada/sàn TMĐT, vận chuyển, hóa đơn điện tử sInvoice, cấu hình email/SMS/Zalo (kết nối provider), tổng đài, mẫu tin nhắn provider, webhook nhận từ đối tác.
- **KHÔNG thuộc scope**: Bán hàng nội bộ (→ `sales`), CRM (→ `customer`), kho (→ `inventory`), kế toán (→ `billing`), BPM, phân quyền.
- **Fitpro use case**: Tích hợp Herbalife/OLE supplier feed (lấy giá sỉ, đồng bộ tồn), tích hợp Medlatec lab API (đặt xét nghiệm gói VIP, nhận kết quả baseline/re-test), Zalo OA gửi reminder ca tập sáng, sInvoice cho gói tập, webhook nhận đơn TMĐT bán lẻ sản phẩm.
- **Entity/bảng key**: `order_platform_mapping`, `product_platform_mapping`, `carrier_config`, `email_config`, `sinvoice_log`, template categories.
- **API base path**: `/integration/lazada/*`, `/integration/shipment/*`, `/integration/sinvoice/*`, `/integration/email/*`.

### `inventory`
- **Mục đích chính**: Kho hàng, tồn kho, sản phẩm, nhập/xuất/chuyển kho, sản xuất.
- **Scope chính**: Quản lý kho, tồn kho hiện tại, sản phẩm/biến thể, nhập hàng, điều chỉnh/chuyển kho, sản xuất, nhà cung cấp, báo cáo tồn.
- **KHÔNG thuộc scope**: Đơn hàng (→ `sales`), thanh toán (→ `billing`/`sales`), nhân viên (→ `customer`), Elasticsearch.
- **Fitpro use case**: Catalog 5 gói (Cơ bản/Plus/Pro/VIP/Super VIP) như product bundle có biến thể; SKU sản phẩm Herbalife/OLE (Trà năng lượng, Shake, Hydrate, Phục hồi cơ bắp, Bảo vệ xương khớp); kho hàng cho mỗi trạm (Home/Co-Working) và chuyển kho giữa BO trực tiếp ↔ vệ tinh; nhập hàng sỉ từ supplier. Cần clarify với BE: gói tập có map `product` + `bundle_item` hay table riêng.
- **Entity/bảng key**: `warehouse`, `inventory_balance`, `inventory_transaction`, `inventory_layer`, `product`, `supplier`, `material`.
- **API base path**: `/inventory/warehouse/*`, `/inventory/product/*`, `/inventory/stockTransfer/*`.

### `logistics`
- **Mục đích chính**: Vận chuyển, giao hàng sau khi đơn bán đã tạo.
- **Scope chính**: Tạo/huỷ đơn giao, tracking trạng thái, hãng vận chuyển nội bộ, cấu hình phí ship, nhãn vận đơn, lịch sử di chuyển.
- **KHÔNG thuộc scope**: Đơn bán (→ `sales`), sản phẩm/kho (→ `inventory`), khách hàng (→ `customer`), tích hợp API hãng vận chuyển (→ `integration`).
- **Fitpro use case**: Giao sản phẩm Herbalife/OLE từ trạm BO → hội viên (đơn lẻ), giao theo lô từ kho tổng xuống các trạm vệ tinh khi nhập gói lớn; quà tặng E-Gift gói Super VIP nếu là vật lý.
- **Entity/bảng key**: `shipment`, `shipment_item`, `shipment_label`, `shipping_status_history`, `carrier_partner`, `unified_status`.
- **API base path**: `/logistics/shipment/*`, `/logistics/carrier/*`, `/logistics/fee-config/*`.

### `market`
- **Mục đích chính**: Marketing & customer engagement — loyalty, promotion, event, campaign, marketing automation.
- **Scope chính**: CTKM/voucher, chương trình loyalty/điểm, sự kiện, chiến dịch marketing, workflow automation marketing, kịch bản chăm sóc khách.
- **KHÔNG thuộc scope**: Khách hàng master (→ `customer`), sản phẩm (→ `inventory`), hóa đơn (→ `sales`/`billing`), quy trình BPM, phân quyền.
- **Fitpro use case**: Voucher giảm giá gói tập (chuyển từ Cơ bản → Plus/Pro), chương trình referral 1 BO giới thiệu 7 BO mới (mục tiêu 7×7×7), workshop demo gói VIP/Super VIP tại trạm, marketing automation re-engage hội viên drop sau chu kỳ 90 ngày, kịch bản chăm sóc 21 ngày đầu sau intake.
- **Entity/bảng key**: `promotion`, `loyalty_wallet`, `loyalty_program`, `event`, `marketing`, `ma`, `care_scenario`.
- **API base path**: `/market/promotion/*`, `/market/loyalty*/*`, `/market/events/*`, `/market/campaign/*`.

### `notification`
- **Mục đích chính**: Trung tâm phát hành thông báo qua nhiều kênh.
- **Scope chính**: Gửi email (SMTP/OAuth/Partner), Firebase push, SMS/Zalo ZNS, in-app notification, template email/push, lập lịch thông báo, lịch sử gửi.
- **Channels hỗ trợ**: Email (SMTP, Gmail, Outlook, Azure), FCM, SMS (Viettel), Zalo ZNS, in-app.
- **KHÔNG thuộc scope**: Quyết định nghiệp vụ "khi nào gửi" (do service nguồn quyết), opt-in/opt-out, báo cáo BI.
- **Fitpro use case**: Reminder ca tập 6h–9h sáng (Zalo ZNS / push 1 giờ trước), nhắc baseline/re-test định kỳ 90 ngày, alert BO khi có hội viên drop / chỉ số tụt, thông báo kết quả xét nghiệm Medlatec đã trả về, thông báo hoa hồng tham chiếu hàng tháng.
- **Entity/bảng key**: `NotificationEmail`, `NotificationFirebase`, `EmailConfig`, `FcmDevice`, `FcmTopic`, `SmsDelivery`, `ZaloDelivery`, `TemplateEmail`.
- **API base path**: `/notification/email/*`, `/notification/fcm*/*`, `/notification/sms/*`, `/notification/zns/*`.

### `operation`
- **Mục đích chính**: Vận hành toà nhà / dự án bất động sản.
- **Scope chính**: Dự án/toà nhà/tầng, không gian (căn hộ), công tơ điện/nước, chỉ số, biểu giá, hoá đơn tiện ích, phí quản lý, phương tiện/bãi xe.
- **KHÔNG thuộc scope**: Khách hàng hồ sơ (→ `customer`), hợp đồng (→ `contract`), thanh toán (→ `billing`), BPM.
- **Fitpro use case**: Có thể dùng cho quản lý cơ sở vật chất Co-Working FitPro (mặt bằng thuê, công tơ, phí mặt bằng) khi trạm scale lên >20 thảm. Mặc định fitpro KHÔNG dùng — Home FitPro dùng nhà ở của BO, không cần track tiện ích.
- **Entity/bảng key**: `project`, `building`, `space`, `electric_meter`, `water_meter`, `electric_index`, `management_fee`, `vehicle`.
- **API base path**: `/operation/project/*`, `/operation/space/*`.

### `sales`
- **Mục đích chính**: Bán hàng, hóa đơn, thanh toán, hoa hồng, đặt cọc, chiến dịch & cơ hội bán (opportunity).
- **Scope chính**: Hóa đơn POS, đơn hàng, cấu hình thanh toán, ca làm việc, hoa hồng nhân viên, đặt cọc, chiến dịch/cơ hội bán hàng, báo cáo doanh số.
- **KHÔNG thuộc scope**: Sản phẩm/kho (→ `inventory`), khách hàng hồ sơ (→ `customer`), nhân viên (→ `customer`), voucher (→ `market`), BPM, notification.
- **Fitpro use case**: Đơn đăng ký gói tập (`order` linked với gói trong `inventory`), hóa đơn/thu cọc gói VIP, ca trực BO buổi sáng (`shift`), opportunity BO đang chốt với khách doanh nghiệp (lô 50 hội viên), doanh thu bán lẻ sản phẩm Herbalife/OLE tại trạm. Hoa hồng nhân viên local (PT/Yoga của trạm) — KHÔNG dùng cho hoa hồng nhượng quyền 3 tầng (cái đó hãng tự tính).
- **Entity/bảng key**: `invoice`, `order`, `shift`, `tip_group`, `deposit`, `campaign`, `opportunity`.
- **API base path**: `/sales/invoice/*`, `/sales/order/*`, `/sales/shift/*`, `/sales/deposit/*`, `/sales/campaign/*`.

> 📌 **Fitpro note**: domain "gói tập 90 ngày" có thể trải nhiều service tuỳ shape:
> - Catalog 5 gói (Cơ bản/Plus/Pro/VIP/Super VIP) → ứng viên `inventory.product` + bundle_item (cần handoff `inventory` để clarify)
> - Đơn đăng ký + thanh toán → `sales`
> - Lịch ca tập 6h–9h → `customer.schedule`
> - Chỉ số sức khỏe baseline/re-test → `customer` (extension field) hoặc service mới (cần discuss BE)
> - Tích hợp Medlatec / Herbalife → `integration`
> - Hoa hồng hệ thống 3 tầng → **KHÔNG service nào** (hãng tự tính, FE chỉ render dashboard tham chiếu — KHÔNG handoff)
> - Reminder/feedback → `notification` + `care`
> Khi 1 task chạm nhiều domain, gửi handoff RIÊNG cho từng service và cross-link issue URL.

---

## Convention handoff

**Outbound (FE fitpro → BE)** — qua skill `/handoff-out-ms`:
- Channel: GitHub Issue trên repo BE tương ứng
- Title: `[handoff] <slug> — <one-line goal>`
- Label bắt buộc: `from-fitpro` (BE dùng để biết reply về đâu)
- Body: bao gồm `from: fitpro`, `fe_repo: ducdung872001/cloud-crm`, `fe_branch: reborn-fitpro`, scope, contract, file paths, done criteria, và Reply protocol
- Audit local: `.handoff/sent/<YYYYMMDD-HHMM>-<service>-<slug>.md` (gitignored)

**Inbound (BE → FE fitpro)** — qua skill `/handoff-in-ms`:
- Channel: GitHub Issue mới trên repo `ducdung872001/cloud-crm`
- Title: `[reply] <original-slug> — <status>`
- Label bắt buộc (CẢ HAI): `reply-from-<service>` AND `to-fitpro` ← compound, vì cloud-crm dùng chung nhiều FE
- Body: ref tới issue gốc trên repo BE, tóm tắt thay đổi, commit SHA, breaking changes
- Sau khi FE đọc xong: comment + close issue reply, audit log local move từ `sent/` sang `replied/`

**Cross-service tasks**: Nếu 1 task FE chạm nhiều domain (vd "tạo catalog gói VIP kèm gửi reminder Zalo"), tạo HANDOFF RIÊNG cho từng service và cross-link issue URL trong body — KHÔNG gộp vào 1 issue đơn lẻ.
