# Part 07 — Data Architecture

## Executive Summary

Dữ liệu phía frontend được mô tả bằng **TypeScript model** gom vào `src/model/` theo domain (~80 thư mục con). Không có state manager tập trung — dữ liệu lấy từ BE được giữ trong local state của page/component, Context API chỉ giữ dữ liệu xuyên app như user, permission, UI flag. Không có SWR / React Query; caching tạm thời nhờ `useRef` + `localStorage` cho UI preference. Các entity trung tâm của biến thể Retail: **Customer, Product, Order, OrderItem, Warehouse, StockMovement, CashBook, Payment, PurchaseOrder, LoyaltyPoint, Campaign**.

## 1. Vị trí model

🟢 **Cao** — `src/model/` có ~80 folder + 2 file gốc:

```
src/model/
├── OtherModel.ts       # IRouter, IMenuItem, IResponseData, ...
├── FormModel.ts        # Form primitive type
├── customer/           # ICustomer, ICustomerRequest, ICustomerResponse...
├── product/            # IProduct, variant, attribute
├── invoice/            # IOrder, IOrderItem (tên "invoice" cho đơn bán)
├── warehouse/          # IWarehouse, IBranch
├── inventory/          # IStock, IStockMovement
├── cashbook/           # ICashBook, transaction
├── loyalty/            # ILoyaltyAccount, point ledger
├── loyaltyPoint/       # earn/spend rule
├── campaign/           # ICampaign
├── contact/, contactAttribute/, contactPipeline/, contactStatus/
├── email/, customerEmail/, customerSMS/, customerZalo/
├── coupon/, offer/, offerCard/, offerProduct/
├── estimate/, invoice/, offer/
├── contract/, contractAttribute/, contractPipeline/
├── kpi/, kpiGoal/, kpiSetup/
├── gift/, brandName/, category/
├── …
```

Mỗi folder thường có 3-6 file:

- `<Entity>.ts` — interface chính.
- `<Entity>Request.ts` — payload khi POST/PUT.
- `<Entity>Response.ts` — shape response từ BE.
- `<Entity>Filter.ts` — query filter.
- `Create<Entity>Model.ts` — model dùng trong form tạo mới.

## 2. Sơ đồ quan hệ thực thể (ERD suy luận)

🟡 Suy luận từ reference trong TS model + URL.

### 2.1. Retail core — bán hàng & tồn kho

```
    ┌──────────┐         ┌──────────┐
    │ Customer │◄────────┤  Order   │
    │          │ M    1  │(Invoice) │
    └──────────┘         └────┬─────┘
                              │ 1
                              │
                              │ N
                         ┌────▼─────┐
                         │OrderItem │
                         └────┬─────┘
                              │ N
                              │
                              │ 1
                         ┌────▼─────┐
                         │ Product  │◄────┐
                         │          │     │
                         └────┬─────┘     │
                              │ N         │
                              │           │
                              │ 1         │
                         ┌────▼─────┐     │
                         │Category  │     │
                         └──────────┘     │
                                          │
    ┌──────────┐     ┌──────────┐   N     │
    │Warehouse │◄────┤StockMove │─────────┘
    │          │ 1  N│  ment    │
    └──────────┘     └────┬─────┘
                          │
                          │ M
                          ▼
                    ┌───────────┐
                    │  Branch   │
                    └───────────┘
```

### 2.2. Mua hàng — NCC

```
   ┌──────────┐       ┌────────────────┐
   │ Supplier │───1 N─│ PurchaseOrder  │
   │          │       │    (PO)        │
   └──────────┘       └───────┬────────┘
                              │ 1
                              │
                              │ N
                      ┌───────▼────────┐
                      │PurchaseOrderItm│
                      └───────┬────────┘
                              │ N
                              │
                              │ 1
                      ┌───────▼────────┐
                      │   Product      │
                      └────────────────┘
```

### 2.3. Tài chính — sổ quỹ & công nợ

```
   ┌──────────┐        ┌──────────────┐
   │   Order  │──1  N──│   Payment    │
   └──────────┘        └──────┬───────┘
                              │ N
                              │
                              │ 1
                       ┌──────▼───────┐
                       │  CashBook    │
                       │ (thu/chi)    │
                       └──────┬───────┘
                              │ N
                              │
                              │ 1
                       ┌──────▼───────┐
                       │    Fund      │
                       └──────────────┘

   Customer ──1  N── Debt (công nợ khách)
   Supplier ──1  N── Debt (công nợ NCC)
```

### 2.4. Loyalty

```
   ┌──────────┐   1    N  ┌──────────────┐
   │ Customer │──────────►│ LoyaltyAccnt │
   └──────────┘           └──────┬───────┘
                                 │ 1
                                 │
                                 │ N
                          ┌──────▼────────┐
                          │LoyaltyPointLe │
                          │  dger (earn / │
                          │   spend)      │
                          └──────┬────────┘
                                 │ N
                                 │
                                 │ 1
                          ┌──────▼────────┐
                          │LoyaltyTier /  │
                          │   Segment     │
                          └───────────────┘
```

### 2.5. Marketing

```
  Campaign ──1  N── CampaignApproach ──N  1── Customer
  Campaign ──1  N── CrmCampaign (chiến dịch CSKH)
  Coupon   ──1  N── Offer ──1  N── OfferProduct / OfferCard
  Segment  ──1  N── Customer (thành viên)
```

## 3. Model chi tiết — một số entity chính

🟡 Các interface dưới đây là **minh hoạ** suy luận theo convention, không copy nguyên xi.

```ts
// model/customer/ICustomer.ts
export interface ICustomer {
  id: number;
  code: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;         // yyyy-MM-dd
  gender?: 0 | 1 | 2;
  address?: string;
  groupId?: number;
  sourceId?: number;
  loyaltyPoint?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

// model/invoice/IOrder.ts
export interface IOrder {
  id: number;
  code: string;               // INV-2026-xxxx
  customerId: number;
  branchId: number;
  warehouseId: number;
  items: IOrderItem[];
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  debt: number;
  status: "draft" | "confirmed" | "shipped" | "completed" | "cancelled";
  channel: "pos" | "online" | "shopee" | "lazada" | "tiktok";
  createdBy: number;
  createdAt: string;
}

export interface IOrderItem {
  id: number;
  productId: number;
  variantId?: number;
  sku: string;
  name: string;
  qty: number;
  price: number;
  discount: number;
  total: number;
}

// model/warehouse/IWarehouse.ts
export interface IWarehouse {
  id: number;
  code: string;
  name: string;
  branchId: number;
  address?: string;
  managerId?: number;
  isDefault?: boolean;
}

// model/inventory/IStockMovement.ts
export interface IStockMovement {
  id: number;
  refType: "import" | "export" | "transfer" | "adjustment" | "destroy";
  refId: number;
  warehouseId: number;
  productId: number;
  variantId?: number;
  qty: number;         // âm cho xuất
  balanceAfter: number;
  createdAt: string;
}

// model/cashbook/ICashBook.ts
export interface ICashBookEntry {
  id: number;
  type: "income" | "expense";
  fundId: number;
  amount: number;
  refType?: "order" | "po" | "manual";
  refId?: number;
  description?: string;
  createdAt: string;
}
```

## 4. Luồng dữ liệu (data flow)

### 4.1. Đọc — list page

```
User → HeaderFilter (onChange)
         │
         ▼
Page setState({filter})
         │
         ▼
useEffect → Service.getList(filter)
         │
         ▼
Response { code: 0, result: [...], total: N }
         │
         ▼
setState({rows, total})
         │
         ▼
<BoxTable rowData={rows}/>
```

### 4.2. Ghi — create form

```
User điền form → local useState per field
         │
         ▼
Submit → validate (reborn-validation)
         │
         ▼
Service.create(payload)
         │
         ▼
BE persist → trả code: 0 + id
         │
         ▼
showToast("Thành công") + navigate('/list')
```

### 4.3. Trang chi tiết — share state

```
List → click row → navigate('/detail?id=N') || openSlidePanel
                           │
                           ▼
                  useGetDetailInvoice(id)
                           │
                           ▼
                  Service.getDetail(id) → data
                           │
                           ▼
                  SlidePanel render
```

## 5. Caching & state lifetime

| Loại | Vị trí | Lifetime | Ghi chú |
|------|--------|----------|---------|
| User, role, permission | `AuthContext` + localStorage | Session | Load 1 lần sau login |
| Language | `AuthContext.valueLanguage` + localStorage `lang` | Persistent | Switch runtime |
| Sidebar collapsed | `UIContext` + localStorage | Persistent | |
| Filter list gần nhất | `useState` của page | Component unmount | Không persist |
| Dashboard data | `useDashBoard` hook | Component unmount | Re-fetch khi back |
| Danh mục (category, branch, warehouse) | Thường load mỗi lần mở form | Không persist | 🔴 tốn request |
| Shortcut POS | localStorage | Persistent | `useShortcut` |
| SelectedRole | localStorage | Persistent | Header `Selectedrole` |

🔴 **Thiếu**: không có cache chung cho master data (category, branch, warehouse). Mỗi lần mở form có thể gọi lại. Gợi ý: một `MasterDataContext` load 1 lần sau login, invalidate bằng timestamp hoặc nút refresh.

## 6. Normalization

Dữ liệu trong state **không** được normalize kiểu Redux (entities / ids). Mỗi page giữ mảng đầy đủ object. Ưu điểm: đơn giản; nhược điểm: trùng lặp khi nhiều component cùng dùng 1 entity.

## 7. Model sharing giữa domain

Các entity dùng xuyên domain có model chung — ví dụ `ICustomer` được import bởi `pages/Sell/`, `pages/Ticket/`, `pages/Campaign/`. Không có DTO tách client/server.

## 8. Validation rule

🟢 Dùng `reborn-validation` 1.0.5:

```ts
import validate from "reborn-validation";

const errors = validate(formData, {
  name:  { required: true, maxLength: 100 },
  phone: { required: true, pattern: /^\d{9,11}$/ },
  price: { required: true, min: 0 },
});
```

Kết quả là map `{ fieldName: errorMessage }` hiển thị inline dưới input.

## 9. Type safety health

🟡 — nhiều service có `any` ở request/response, đặc biệt ở service cũ. Tech debt: chuẩn hoá `ApiResponse<T>` + generic hoá `BaseService`.

## 10. Suy luận về database (🔴 thấp)

Frontend không thấy DB schema. Suy luận:

- **PostgreSQL** relational — vì shape model có foreign key int, created_at timestamp.
- **Row-level filter theo tenantId** — tenancy mô hình shared DB, shared schema.
- **Read replica** cho report — khi có báo cáo nặng.
- **Redis** cache cho session, permission, master data.
- **Object storage** (S3 / MinIO) cho ảnh SP, file đính kèm — endpoint `APP_UPLOAD_URL`.
- **Search index**: có thể Elasticsearch / Meilisearch cho search SKU nhanh, nhưng chưa có bằng chứng trong FE.

## 11. Data volume giả định

| Entity | Tầm cỡ (tenant lớn) |
|--------|---------------------|
| Customer | 100k - 1M |
| Product | 1k - 100k (biến thể x10) |
| Order / Invoice | 10k/tháng |
| OrderItem | 50k/tháng |
| StockMovement | 100k/tháng |
| CashBook | 20k/tháng |

→ Hệ quả: các query list **bắt buộc** pagination server-side. ag-grid infinite model có thể dùng cho tồn kho chi tiết (🟡).

## 12. Data retention

🔴 Không thấy cấu hình ở FE. Luật TT78 e-invoice yêu cầu ≥ 10 năm. Audit log ≥ 2 năm. Tham khảo [Part 10](part-10-security.md) (khi bạn viết).

## Tham chiếu

- Files:
  - `src/model/*` (~80 folder)
  - `src/services/*Service.ts` (type đầu vào/ra)
- Diagrams: `docs/sa/diagrams/07-erd.png` (chưa tạo).

---
*Hết Part 07. Xem tiếp [Part 08 — Backend Architecture (suy luận)](part-08-backend-architecture.md).*
