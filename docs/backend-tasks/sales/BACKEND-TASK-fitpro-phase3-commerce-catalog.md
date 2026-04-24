# [BE · `sales` + `inventory` + `logistics`] FitPro Phase 3.1 — Commerce catalog dinh dưỡng chuyên sâu

**Microservices:** `sales` (chính), `inventory` (stock), `logistics` (ship)
**URL prefix:** `/bizapi/sales/commerce/*` (public + member)
**URD:** [Part 15 §5 UR-FITPRO-COMMERCE](../../urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-commerce--commerce-catalog-cho-dinh-dưỡng-chuyên-sâu)

## 1. Mục tiêu

Tách flow mua nutrition SKU ra khỏi flow bán gói tập. Hội viên mua online sản phẩm Herbalife, giao tận nhà hoặc nhận tại trạm.

## 2. Schema thêm

Sales service đã có `order`, `order_item`, `invoice`. Thêm:

```sql
-- Cart (ephemeral, có thể để Redis hoặc DB)
CREATE TABLE commerce_cart (
  id UUID PRIMARY KEY,
  member_id VARCHAR(32) NOT NULL,
  items JSONB NOT NULL,  -- [{ skuId, qty, unitPriceVnd }]
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tag loại đơn — extend order với cột `source_type`
ALTER TABLE `order` ADD COLUMN source_type VARCHAR(32) DEFAULT 'pos';
-- Giá trị: pos | commerce | b2b | public_web
-- Dùng cho báo cáo tách doanh thu (xem UR-FITPRO-03 Mix 20/80)
```

## 3. API mới

| Endpoint | Mô tả |
|----------|-------|
| `GET /bizapi/sales/commerce/products?category=` | List catalog nutrition SKU (public hoặc member) |
| `POST /bizapi/sales/commerce/cart` | Add to cart |
| `GET /bizapi/sales/commerce/cart/:memberId` | Lấy cart |
| `POST /bizapi/sales/commerce/checkout` | Tạo order + invoice từ cart |
| `POST /bizapi/sales/commerce/orders/:id/pay` | Payment gateway webhook |

## 4. Integration

- `inventory`: check stock + reserve khi checkout
- `logistics`: tạo shipping order sau khi pay
- `billing`: tạo phiếu thu từ payment gateway
- `notification`: gửi xác nhận đơn

## 5. FE

FE Phase 3 sẽ có page `/fp_commerce` (catalog + cart + checkout). Placeholder sẽ làm sau khi BE contract confirm.
