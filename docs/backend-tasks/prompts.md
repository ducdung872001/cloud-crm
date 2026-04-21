# Claude Code CLI prompts — mỗi prompt cho một backend microservice

Mỗi block dưới đây là prompt sẵn để **copy nguyên** và paste vào phiên Claude Code CLI đang mở tại repo BE tương ứng. Mỗi prompt tự contained — BE không cần context từ phiên FE.

**Cách dùng:**
1. Mở terminal, `cd` vào repo BE (ví dụ `cloud-billing-master`)
2. Khởi động Claude Code: `claude`
3. Copy block prompt tương ứng, paste vào
4. Agent sẽ đọc task doc trên repo FE (nếu có cross-reference) hoặc tự làm

Task docs gốc nằm ở repo FE: `d:/Git/reborn/reborn-cloud/cloud-ver2/cloud-crm/docs/backend-tasks/<service>/<file>.md`. BE team có thể mở file này riêng để đọc thêm chi tiết nếu cần.

---

## 1. `cloud-billing-master` — Tenant isolation trên Reconciliation

**Task doc:** [billing/reconciliation-tenant-isolation.md](./billing/reconciliation-tenant-isolation.md)
**Severity:** 🔴 CRITICAL

````
Tôi phát hiện lỗ hổng data leak NGHIÊM TRỌNG trên endpoint billing. Cần anh fix gấp.

## Bug reproducer

Tenant mới provisioning `hub.reborn.vn` (0 giao dịch, 0 phiếu), FE gọi:

  GET https://biz.reborn.vn/billing/reconciliation/list?limit=10&page=1
  Header: Hostname: hub.reborn.vn

BE trả về 2 giao dịch KHÔNG THUỘC tenant này:
- 21/03/2026 21:37 | VQR39fb857fee THANH TOAN DON HANG | +100.000 VND | Đã khớp
- 21/03/2026 21:33 | abc                               |   -1.000 VND | Đã khớp

Data của tenant khác đang bị lộ. CẦN FIX NGAY.

## Việc cần làm

1. Tìm handler của `GET /reconciliation/list` (controller + service + repository).

2. Kiểm tra query đọc bảng `reconciliation_statement` (hoặc tương đương):
   - Có WHERE tenant_id = :tenantId chưa?
   - Nếu chưa → thêm vào

3. Kiểm tra cách service lấy tenant context:
   - Từ header X-Tenant-ID? JWT claim? Header Hostname?
   - Có helper TenantContext.current() không?
   - Request thiếu tenant → đang fallback silent hay reject? Phải reject 403 MISSING_TENANT.

4. Audit cùng pattern cho TẤT CẢ endpoint list trong billing service:
   - GET /reconciliation/list                  ← reproducer
   - GET /reconciliation/get?id=
   - GET /reconciliation/summary (nếu có)
   - POST /reconciliation/manual-match
   - Mọi endpoint /payment/*, /debt/*, /cashbook/*, /fund/* kiểu list/get

5. Check DB các bảng billing (reconciliation_statement, payment, bank_transaction,
   cashbook_entry, debt, fund, ...) — có record nào tenant_id IS NULL không?
   Nếu có → liệt kê cho tôi, tôi quyết định xoá hay gán tenant sandbox.

## Acceptance criteria

- [ ] Mọi query billing có WHERE tenant_id = :ctx.tenantId (hoặc bsnId)
- [ ] Thiếu header tenant → 403 MISSING_TENANT, KHÔNG silent fallback
- [ ] Test 2 tenant khác ngành, tenant mới query list trả rỗng
- [ ] Không đổi response shape { code, message, result: { items, total, page } }
- [ ] Không hardcode business rule ngành (retail/spa/tnpm/community-hub/banking)

## Báo cáo sau khi xong

1. File controller/service/repository đã sửa (tên file + path)
2. Danh sách endpoint đã thêm filter tenant
3. Số record tenant_id IS NULL từng bảng (nếu có)
4. Kết quả test 2 tenant: tenant mới trả rỗng đúng không

Bắt đầu bằng việc tìm handler GET /reconciliation/list.
````

---

## 2. `cloud-inventory-master` — Tenant isolation 7 endpoint

**Task doc:** [inventory/tenant-isolation-audit.md](./inventory/tenant-isolation-audit.md)
**Severity:** 🔴 CRITICAL

````
Cần anh audit tenant isolation toàn service inventory. FE phát hiện data leak cross-tenant.

## Bug reproducer

Tenant mới `hub.reborn.vn` (0 kho, 0 sản phẩm), FE gọi:

  GET https://biz.reborn.vn/inventory/stockTransfer/list?page=0&size=20
  Header: Hostname: hub.reborn.vn

BE trả 6 phiếu chuyển kho thuộc tenant khác: #2 #3 #4 #6, kho "Kho hàng mẫu",
"Kho Hà Nội", "Test", note "hqhq", "thừa hơi nhiều"...

Đáng lẽ phải trả items: [].

## 7 endpoint cần audit (toàn bộ tab trong page Quản lý kho của FE)

| Endpoint | Mô tả |
|---|---|
| GET /inventoryBalance/stockProduct/list | Tồn kho |
| GET /invoice/import/list                | Phiếu nhập |
| GET /inventoryTransaction/sale/list     | Phiếu xuất |
| GET /stockTransfer/list                 | Chuyển kho ← REPRODUCER |
| GET /inventoryTransaction/destroy/list  | Xuất hủy |
| GET /stockAdjust/list                   | Phiếu kiểm |
| GET /inventoryBalance/variant/list      | Giá vốn |

## Việc cần làm

1. Audit 7 endpoint trên — repository query có WHERE tenant_id = :ctx.tenantId không?
   Nếu chưa → thêm.

2. Audit bảng DB (mọi bảng đều cần tenant_id hoặc bsnId):
   stock_transfer, stock_transfer_detail
   inventory_balance, inventory_balance_variant
   invoice_import, invoice_import_detail
   inventory_transaction (sale + destroy)
   stock_adjust, stock_adjust_detail
   warehouse, product, variant, category, unit

3. Chuẩn hoá tenant extraction:
   - Middleware inject tenantId từ header X-Tenant-ID/Hostname/JWT
   - Helper TenantContext.current() — dùng chung
   - Thiếu tenant → reject 403 MISSING_TENANT

4. Clean data seed: record nào tenant_id IS NULL → báo số lượng, tôi quyết.

## Acceptance criteria

- [ ] 7 endpoint trên filter tenant
- [ ] Tenant mới → tất cả endpoint trả items: [], total: 0
- [ ] Stats card tab Xuất hủy: tenant mới trả total=0 pending=0 completed=0 cancelled=0
- [ ] Thiếu tenant header → 403 MISSING_TENANT
- [ ] Không đổi response shape, không hardcode ngành

## Báo cáo

1. File đã sửa
2. Endpoint đã thêm filter (checklist 7 endpoint)
3. Record tenant_id NULL từng bảng
4. Test 2 tenant: kết quả

Bắt đầu từ GET /stockTransfer/list.
````

---

## 3. `cloud-notification-master` — feedbackHistory/count trả 400 rỗng

**Task doc:** [notification/feedback-history-count-400.md](./notification/feedback-history-count-400.md)
**Severity:** 🟠 HIGH

````
FE báo bug HTTP 400 + body rỗng làm crash promise.

## Bug

FE gọi trên mọi trang có header badge notification:

  GET https://biz.reborn.vn/notification/feedbackHistory/count
  Header: Hostname: hub.reborn.vn

BE trả HTTP 400 với body RỖNG. FE await res.json() → SyntaxError: Unexpected end of JSON input.

## Việc cần làm

1. Tìm handler của GET /feedbackHistory/count trong notification service.

2. Chuẩn hoá response — mọi trường hợp (success/fail) PHẢI trả JSON body hợp lệ:

   Success (kể cả count = 0):
   { "code": 0, "message": "OK", "result": { "count": 0 } }

   Fail:
   { "code": 400, "message": "MISSING_PARAM: employeeId", "result": null }

   TUYỆT ĐỐI không để HTTP 400 + body rỗng lan ra FE.

3. Xác nhận contract:
   - URL: GET /notification/feedbackHistory/count
   - Query params nào bắt buộc/optional? (employeeId, userId, fromDate, toDate)
   - Response shape: { code, message, result: { count: number } }
   - Tenant mới 0 feedback → count: 0, không error

4. Audit các endpoint count/list khác trong notification cùng pattern:
   - GET /feedbackHistory/list
   - GET /history/count
   - GET /push/count
   - Mọi endpoint /notification/*/count

   Đảm bảo không có endpoint nào trả body rỗng trên error.

5. Tenant isolation: query /notification/* phải WHERE tenant_id = :ctx.tenantId.
   Tenant mới (0 feedback) → count: 0. Tenant khác không thấy data của nhau.

## Acceptance criteria

- [ ] GET /feedbackHistory/count LUÔN trả JSON body
- [ ] Tenant mới (0 feedback) → result.count === 0, HTTP 200
- [ ] Param sai → HTTP 400 + body { code, message } giải thích
- [ ] Tenant A ≠ Tenant B trong count

## Báo cáo

1. File handler đã sửa
2. Contract đã chốt (query params + response)
3. Audit các endpoint khác cùng pattern
4. Test tenant mới + tenant có data

Bắt đầu từ handler feedbackHistory/count.
````

---

## 4. `cloud-customer-master` — Seed 2 custom attribute cho W-House

**Task doc:** [customer/attribute-seed-mentor.md](./customer/attribute-seed-mentor.md)
**Severity:** 🟢 LOW

````
Cần seed 2 custom attribute cho tenant community-hub (W-House). Task nhẹ, 1-2 giờ.

## Context

Khách hàng W-House (tenant hub.reborn.vn, industry = community-hub) dùng Google Form
đăng ký event, trong đó có 2 field đặc thù:
- Mã số Mentor (VD: 5021, 6272, 6430)
- Số nhà (VD: 255, 288, 322)

Đây KHÔNG phải field chuẩn của Customer. Phải đi qua Customer Attribute mechanism
mà service đã hỗ trợ qua 3 endpoint:
  GET    /customerAttribute/list
  POST   /customerAttribute/update
  DELETE /customerAttribute/delete

## Việc cần làm

Chọn 1 trong 3 option dưới (khuyến nghị Option A hoặc B):

### Option A — SQL script seed 1 lần (idempotent)

SET @tenant_id = (SELECT id FROM tenant WHERE domain = 'hub.reborn.vn' LIMIT 1);

INSERT INTO customer_attribute (tenant_id, code, name, data_type, required, display_order, created_at, updated_at)
VALUES
  (@tenant_id, 'mentorCode',  'Mã số Mentor', 'text', 0, 10, NOW(), NOW()),
  (@tenant_id, 'houseNumber', 'Số nhà',       'text', 0, 11, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), display_order = VALUES(display_order);

→ Anh confirm tên cột customer_attribute (code, data_type, required, display_order, customer_type_id)
có khớp schema thực tế không. Nếu khác, điều chỉnh script.

### Option B — Post-provisioning hook

Nếu service có hook chạy sau khi tenant mới tạo, thêm logic:

  if (tenant.industry === "community-hub") {
    customerAttributeService.upsert(tenant.id, {
      code: "mentorCode", name: "Mã số Mentor", dataType: "text", displayOrder: 10
    });
    customerAttributeService.upsert(tenant.id, {
      code: "houseNumber", name: "Số nhà", dataType: "text", displayOrder: 11
    });
  }

→ Mọi tenant community-hub mới tự có 2 attribute này.

### Option C — Admin tự tạo qua UI (fallback nếu 2 option trên phức tạp)

Hướng dẫn admin vào /setting_customer → "Định nghĩa trường bổ sung" → Thêm mới 2 trường.
Nhưng option này không scale, cần lặp lại cho mỗi tenant mới.

## Acceptance criteria

- [ ] Tenant hub.reborn.vn có 2 record trong customer_attribute: mentorCode, houseNumber
- [ ] GET /customerAttribute/list khi login W-House trả 2 attribute này
- [ ] Tenant khác (retail/spa/tnpm/banking) KHÔNG bị ảnh hưởng
- [ ] Page /setting_customer hiển thị 2 attribute, admin xem/sửa/xoá được

## Liên quan

BE market service sẽ gọi sang customer service để ghi attribute value khi user
đăng ký event (xem task events.md Gap 5 — POST /market/events/{slug}/register).
Nếu attribute chưa seed → skip write + log warning, KHÔNG crash.

## Báo cáo

1. Chọn option nào
2. Script/code đã chạy (nếu Option A/B)
3. Verify query SELECT * FROM customer_attribute WHERE tenant_id = <hub>

Bắt đầu bằng việc mở task doc, confirm schema bảng customer_attribute thực tế.
````

---

## 5. `cloud-market-master` — Events addendum (5 gap mới)

**Task doc:** [market/events.md](./market/events.md) — đọc phần `ADDENDUM 2026-04-21`
**Severity:** 🟠 HIGH

````
Có 5 gap mới trên module Event (events) theo yêu cầu khách hàng W-House.
Chi tiết đã viết ở docs/backend-tasks/market/events.md — phần ADDENDUM 2026-04-21.
Anh đọc phần đó trước rồi làm tuần tự.

## Tóm tắt 5 gap

### Gap 1 — Venue coordinates + images tách riêng

ALTER TABLE marketing_events
  ADD COLUMN venue_latitude  DECIMAL(10, 7) DEFAULT NULL,
  ADD COLUMN venue_longitude DECIMAL(10, 7) DEFAULT NULL,
  ADD COLUMN venue_images    JSON DEFAULT NULL;

Response JSON extend:
  venue: { ..., latitude, longitude, venueImages: ["url1",...] }

### Gap 2 — Tenant-level bankAccount + per-event override

Tenant config (qua operation microservice hoặc tenant_config bảng):
  { bankAccount: { holder, phone, bank, accountNumber } }

Per-event override (optional):
  ALTER TABLE marketing_events
    ADD COLUMN bank_account_override JSON DEFAULT NULL;

FE logic: event.bankAccountOverride ?? tenant.bankAccount.

### Gap 3 — Add-on grouping (multi-level header UI)

EventAddOnItem đã có trong add_on_items JSON. Cần bổ sung field "group":
  [
    { id: "a1", group: "Cư trú W-House 09/05", name: "Ăn trưa", unitPrice: 50000 },
    { id: "a5", group: "Phí tham gia 10/05",   name: "Phí tham gia", unitPrice: 300000 }
  ]

Validate: group là string ≤100 ký tự.

### Gap 4 — Multiple payment proofs (đổi từ single sang array)

EventRegistration hiện có paymentProof single. Đổi thành paymentProofs: PaymentProof[]
(tối đa 4 ảnh — theo Excel gốc khách hàng).

ALTER TABLE marketing_event_registrations
  DROP COLUMN payment_proof_image_url,
  DROP COLUMN payment_proof_submitted_at,
  DROP COLUMN payment_proof_status,
  DROP COLUMN payment_proof_reviewed_at,
  DROP COLUMN payment_proof_reviewed_by,
  DROP COLUMN payment_proof_reject_reason,
  ADD COLUMN payment_proofs JSON DEFAULT NULL;

Backward compat migration (UPDATE ... SET payment_proofs = JSON_ARRAY(JSON_OBJECT(...))).

### Gap 5 — Pipeline register → auto-link customer (QUAN TRỌNG NHẤT)

Endpoint POST /market/events/{slug}/register với logic:

  1. Extract fullName, phone, customerGroupKey, mentorCode, houseNumber từ body
  2. Tìm customer theo (tenant_id, phone):
     a. Có → customerId đã có; UPDATE name/group/attribute nếu đang trống
     b. Chưa → INSERT customer mới status='lead', set customer_group_id, 2 attribute values
  3. INSERT event_registration với customerId, selectedAddOns, dynamicFieldValues,
     paymentProofs, total_amount = ticket_price + sum(addOn.unitPrice × qty)
  4. Return { registration, qrPayload: { qrDataUrl, amount, addInfo } }

Cross-service call: market → customer service để tìm/tạo customer + set attributes.
Dùng sync API call hoặc event bus tuỳ architecture.

## Thứ tự làm khuyến nghị

1. Gap 3 (addOn.group) — dễ nhất, chỉ JSON field
2. Gap 4 (paymentProofs array) — migration + code đồng bộ
3. Gap 1 (venue lat/lng/images) — 3 field mới
4. Gap 2 (bankAccount tenant + override) — cross-service (operation/tenantConfig)
5. Gap 5 (register auto-link customer) — logic phức tạp nhất, cần call customer service

## Acceptance criteria

- [ ] Migration 5 gap chạy thành công, không mất data
- [ ] GET /market/events/{slug} trả venue.latitude/longitude/venueImages, bankAccountOverride
- [ ] GET /market/events/{slug} trả addOnItems có field group
- [ ] POST /market/events/{slug}/register tự tạo/link customer theo SĐT
- [ ] POST register ghi 2 attribute mentorCode + houseNumber (qua customer service)
- [ ] paymentProofs accept tối đa 4 ảnh, mỗi ảnh có status riêng
- [ ] Tenant isolation: tenant khác không thấy events/registrations của nhau
- [ ] QR VietQR reuse endpoint /billing/vietqr/api/generate_qr có sẵn

## Phụ thuộc

Gap 5 cần customer service đã có sẵn 2 attribute mentorCode + houseNumber (task
docs/backend-tasks/customer/attribute-seed-mentor.md). Confirm với customer team xong
chưa trước khi test Gap 5.

## Báo cáo

1. Migration đã chạy (tên file + path)
2. Endpoint đã extend (checklist 5 gap)
3. Test auto-link customer: phone existed → link, phone mới → create with status='lead'
4. Test QR generate với bankAccount tenant

Bắt đầu từ Gap 3 (addOn.group) vì dễ nhất.
````

---

## 6. `cloud-market-master` — Fixed Price Promotion (4 endpoint chưa implement)

**Task doc:** [market/fixed-price-promotion.md](./market/fixed-price-promotion.md)
**Severity:** 🟠 HIGH

````
FE đang gọi 4 endpoint fixedPrice nhưng BE chưa implement — nginx trả 404 HTML.
Task docs/backend-tasks/market/fixed-price-promotion.md đã spec chi tiết.

## Bug reproducer

curl https://biz.reborn.vn/market/fixedPrice/active-entries
Response: nginx 404 HTML (không phải application 404)
→ Endpoint chưa register, hoặc nginx chưa route /market/fixedPrice/* tới service.

## Nghiệp vụ

"Chương trình đồng giá" — CT khuyến mãi gán nhóm SP về cùng 1 giá cố định.
VD: "Đồng giá 29.000đ" cho 20 SP. POS khi quét SP → check xem có thuộc CT active
không, nếu có thì bán theo giá đồng giá (29k) thay vì giá gốc.

## 4 endpoint cần implement

| Method | Path | Mục đích |
|---|---|---|
| GET | /market/fixedPrice/active-entries | POS load 1 lần, cache lookup khi quét SP |
| GET | /market/fixedPrice/products?promotionId={id} | List SP trong 1 CT |
| POST | /market/fixedPrice/products/save?promotionId={id} | Replace SP (atomic) |
| DELETE | /market/fixedPrice/product/delete?id={id} | Xóa 1 SP khỏi CT |

## Response shape

Success: { code: 0, message: "OK", result: <data> }
Fail:    { code: <non-zero>, message: "<reason>", result: null }
CẤM để nginx default 404 HTML lan tới FE. Nếu endpoint chưa có, trả
404 { code: 404, message: "ENDPOINT_NOT_IMPLEMENTED" } có body JSON.

### GET active-entries

  {
    "code": 0,
    "result": [
      {
        "promotionId": 12,
        "promotionName": "Đồng giá 29k cuối tuần",
        "fixedPrice": 29000,
        "productIds": [101, 102, 103],
        "startDate": "2026-04-20 00:00:00",
        "endDate":   "2026-04-27 23:59:59",
        "status": 1
      }
    ]
  }

### GET products?promotionId={id}

  {
    "code": 0,
    "result": [
      { "productId": 101, "variantId": 1001, "productName": "...", "fixedPrice": 29000 }
    ]
  }

### POST products/save, DELETE product/delete

  { "code": 0, "result": 1 }  // số record ảnh hưởng

## Việc cần làm

1. Migration DB — tạo 2 bảng (nếu chưa có):
   - promotion_fixed_price (id, tenant_id, name, fixed_price, start_date, end_date, status)
   - promotion_fixed_price_product (id, tenant_id, promotion_id, product_id, variant_id)

   Index:
   - (tenant_id, status, start_date, end_date) cho query active-entries
   - (tenant_id, promotion_id) cho query theo CT

2. Implement 4 endpoint trên, mỗi endpoint:
   - Filter WHERE tenant_id = :ctx.tenantId
   - Response JSON contract chuẩn (không bao giờ body rỗng / HTML)

3. Logic save atomic — dùng transaction:
   DELETE mapping cũ → INSERT mapping mới. Nếu fail giữa chừng, rollback toàn bộ.

4. Validate:
   - Product phải thuộc tenant (join inventory/product với tenant_id)
   - Product không bị soft-delete
   - Policy: product không được thuộc nhiều CT đồng giá đang active cùng lúc

5. Nginx/gateway: confirm /market/* đã route tới cloud-market-master.
   Module Event chạy được (/market/events/*) nên /market/fixedPrice/* cũng OK —
   chỉ cần deploy service có handler mới.

6. Cache nhẹ cho active-entries (30s–60s) vì POS gọi nhiều, nhưng invalidate ngay
   khi save/delete.

## Acceptance criteria

- [ ] 4 endpoint trả JSON body đúng contract
- [ ] Tenant mới (0 CT đồng giá) → GET active-entries: result: [], HTTP 200
- [ ] POST products/save atomic (fail giữa chừng rollback)
- [ ] Tenant A tạo CT → Tenant B query active-entries → rỗng (isolation)
- [ ] Thiếu tenant header → 403 MISSING_TENANT
- [ ] E2E: tạo CT → thêm SP → POS lookup thấy giá đồng giá → xóa SP → POS không còn

## Báo cáo

1. Migration đã chạy
2. Handler 4 endpoint (file path)
3. Test case E2E chạy pass

Bắt đầu từ migration DB, rồi implement theo thứ tự: active-entries → products →
products/save → product/delete.
````

---

## Tóm tắt ưu tiên tổng thể

Nếu BE team có nhiều người, có thể chia song song:

| Priority | Repo | Task | Ước lượng |
|---|---|---|---|
| P0 | `cloud-billing-master` | Tenant isolation reconciliation | 1-2 ngày |
| P0 | `cloud-inventory-master` | Tenant isolation 7 endpoint | 2-3 ngày |
| P1 | `cloud-notification-master` | Fix 400 body rỗng | 0.5 ngày |
| P1 | `cloud-customer-master` | Seed 2 attribute | 0.5 ngày |
| P1 | `cloud-market-master` | Events addendum 5 gap | 3-5 ngày |
| P2 | `cloud-market-master` | Fixed Price 4 endpoint | 2-3 ngày |

**Khuyến nghị thứ tự làm:**

1. **Tenant isolation (billing + inventory + notification)** trước vì là bug bảo mật.
2. **Customer seed attribute** song song (dễ, không chặn ai).
3. **Market events addendum** sau khi customer đã seed xong (Gap 5 phụ thuộc customer).
4. **Market fixedPrice** cuối, không chặn flow chính.
