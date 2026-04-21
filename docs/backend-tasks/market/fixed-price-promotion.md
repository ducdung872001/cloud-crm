# [market] Fixed Price Promotion (Đồng giá) — 4 endpoint chưa implement

**Severity:** 🟠 HIGH
**Service:** `cloud-market-master`
**Phát hiện:** 2026-04-21, nhánh community-hub — POS gọi `/market/fixedPrice/active-entries` nhận 404 từ nginx (request chưa tới service)
**Module:** `fixedPrice` (Chương trình đồng giá)

---

## Hiện tượng

POS page (`/crm/create_sale_add`) load xong, FE gọi:

```
GET https://biz.reborn.vn/market/fixedPrice/active-entries
Headers:
  Authorization: Bearer <jwt>
  Hostname: hub.reborn.vn
```

Response:

```
HTTP/1.1 404 Not Found
Server: nginx/1.18.0
Content-Type: text/html

<html><head><title>404 Not Found</title></head>
<body><center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.18.0</center></body></html>
```

→ 404 trả về từ **nginx**, không phải từ application → request chưa vào được service. Nghĩa là:
- Endpoint chưa register trong `cloud-market-master`, hoặc
- Nginx config chưa route `/market/fixedPrice/*` tới service.

## Context — chương trình đồng giá là gì

Nghiệp vụ: CT khuyến mãi cho phép gán một nhóm sản phẩm về **cùng một giá cố định** (ví dụ: "Đồng giá 29.000đ" cho 20 SP được chọn).

POS cần biết khi khách quét/chọn 1 SP → SP đó có nằm trong CT đồng giá đang active không → nếu có thì giá bán = giá đồng giá thay vì giá gốc.

## 4 endpoint FE đang gọi

Định nghĩa tại [src/services/FixedPriceService.ts](../../../src/services/FixedPriceService.ts) và [src/configs/urls.ts:2530-2535](../../../src/configs/urls.ts#L2530-L2535).

| # | Method | Path | Mục đích | Caller FE |
|---|--------|------|----------|-----------|
| 1 | GET | `/market/fixedPrice/active-entries` | Lấy mọi entry đồng giá đang active — POS load 1 lần, cache trong state | [CounterSales/index.tsx](../../../src/pages/CounterSales/index.tsx) |
| 2 | GET | `/market/fixedPrice/products?promotionId={id}` | Danh sách SP thuộc 1 CT đồng giá (màn cấu hình) | [FixedPricePage/index.tsx:105](../../../src/pages/FixedPricePage/index.tsx#L105) |
| 3 | POST | `/market/fixedPrice/products/save?promotionId={id}` | Replace toàn bộ danh sách SP của CT — BE xóa list cũ rồi insert mới | [FixedPricePage](../../../src/pages/FixedPricePage/index.tsx) |
| 4 | DELETE | `/market/fixedPrice/product/delete?id={id}` | Xóa 1 SP khỏi CT đồng giá | [FixedPricePage](../../../src/pages/FixedPricePage/index.tsx) |

Response shape mong đợi (theo FE type [IFixedPriceEntry](../../../src/model/promotion/PromotionModel.ts) / [IFixedPriceProduct](../../../src/model/promotion/PromotionModel.ts)):

```jsonc
// 1. GET active-entries
{
  "code": 0,
  "result": [
    {
      "promotionId": 12,
      "promotionName": "Đồng giá 29k cuối tuần",
      "fixedPrice": 29000,
      "productIds": [101, 102, 103, ...],   // tối thiểu danh sách productId
      "startDate": "2026-04-20 00:00:00",
      "endDate":   "2026-04-27 23:59:59",
      "status": 1                            // 1 = active
    }
  ]
}

// 2. GET products?promotionId=…
{
  "code": 0,
  "result": [
    { "productId": 101, "variantId": 1001, "productName": "...", "fixedPrice": 29000 }
  ]
}

// 3. POST products/save?promotionId=… body: [IFixedPriceProduct, ...]
{ "code": 0, "result": 1 }     // số bản ghi insert

// 4. DELETE product/delete?id=…
{ "code": 0, "result": 1 }
```

## Việc cần làm

### 1. Migration DB

Tạo các bảng (nếu chưa có):

- `promotion_fixed_price` — metadata CT (id, name, fixed_price, start_date, end_date, status, tenant_id)
- `promotion_fixed_price_product` — mapping product/variant thuộc CT (id, promotion_id, product_id, variant_id, tenant_id)

Index gợi ý:
- `(tenant_id, status, start_date, end_date)` cho query active-entries
- `(tenant_id, promotion_id)` cho query theo CT

### 2. 4 endpoint implementation

#### `GET /market/fixedPrice/active-entries`

- Lọc `tenant_id = :ctx.tenantId` và `status = 1` và `now BETWEEN start_date AND end_date`
- Join với bảng product mapping, group theo `promotion_id`, trả kèm `productIds` array
- Cache nhẹ (30s–60s) nếu cần — POS gọi nhiều.

#### `GET /market/fixedPrice/products?promotionId=:id`

- Lọc `tenant_id = :ctx.tenantId` và `promotion_id = :id`
- Join bảng product / variant lấy `productName`, `variantName`

#### `POST /market/fixedPrice/products/save?promotionId=:id`

- Lọc `tenant_id = :ctx.tenantId` và `promotion_id = :id`
- **Atomic** (transaction): DELETE toàn bộ mapping cũ → INSERT mapping mới từ body
- Validate: product thuộc tenant, không bị soft-delete, chưa thuộc CT đồng giá khác đang active (policy sau)

#### `DELETE /market/fixedPrice/product/delete?id=:id`

- Lọc `tenant_id = :ctx.tenantId`
- Xóa 1 record trong `promotion_fixed_price_product`

### 3. Tenant isolation

Toàn bộ 4 endpoint phải:
- Trích `tenantId` từ `TenantContext` (header `X-Tenant-ID` / `Hostname`)
- Filter `WHERE tenant_id = :ctx.tenantId` trên mọi query
- Reject `403 MISSING_TENANT` nếu thiếu context (không silent fallback)

Tham khảo pattern: [billing/reconciliation-tenant-isolation.md](../billing/reconciliation-tenant-isolation.md), [inventory/tenant-isolation-audit.md](../inventory/tenant-isolation-audit.md)

### 4. Nginx / Gateway routing

Xác nhận cấu hình nginx/gateway đã route `/market/*` → `cloud-market-master`. Nếu đã có sẵn (route cho Event module đã chạy) thì chỉ cần deploy service có handler mới; không đúng → cần bổ sung location block.

### 5. Response contract chuẩn

Tất cả response đều theo format dự án:

```jsonc
{ "code": 0, "message": "OK", "result": <data> }       // success
{ "code": <non-zero>, "message": "<lý do>", "result": null }   // fail
```

KHÔNG bao giờ để nginx default 404 lan tới FE — nếu endpoint chưa implement, trả `404 { code: 404, message: "ENDPOINT_NOT_IMPLEMENTED" }` có body JSON để FE bắt được.

## Acceptance Criteria

- [ ] 4 endpoint trên trả JSON body đúng contract (không phải HTML nginx 404)
- [ ] Tenant A tạo 1 CT đồng giá → Tenant B query `active-entries` → rỗng
- [ ] POS load tenant mới (0 promotion) → `result: []`, HTTP 200
- [ ] `POST products/save` chạy atomic — nếu fail giữa chừng, rollback toàn bộ
- [ ] Request thiếu tenant → `403 MISSING_TENANT`
- [ ] Integration test: tạo CT → thêm SP → POS thấy giá đồng giá → xóa SP → POS không còn thấy

## Không được làm

- Không hardcode business rule ngành nào (retail/spa/tnpm/community-hub đều có thể dùng)
- Không đổi URL path hoặc response shape (FE đã hardcode)
- Không cho phép product thuộc nhiều CT đồng giá đang active cùng lúc (conflict)

## Reference

- FE service: [src/services/FixedPriceService.ts](../../../src/services/FixedPriceService.ts)
- FE URL map: [src/configs/urls.ts:2530-2535](../../../src/configs/urls.ts#L2530-L2535)
- FE model: [src/model/promotion/PromotionModel.ts](../../../src/model/promotion/PromotionModel.ts)
- FE caller (POS): [src/pages/CounterSales/index.tsx](../../../src/pages/CounterSales/index.tsx)
- FE caller (cấu hình): [src/pages/FixedPricePage/index.tsx](../../../src/pages/FixedPricePage/index.tsx)
