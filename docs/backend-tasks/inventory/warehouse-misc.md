# BACKEND-TASK — Warehouse: đa vấn đề

**Phát hiện**: `tests/test-seed-warehouse.mjs`, `tests/.cleanup-wh.mjs`, e2e run.

## 1. BE cho phép trùng tên warehouse
- Test tạo 2 warehouse cùng tên "Kho hàng mẫu" (id=32 và id=99), cả 2 đều được BE chấp nhận code=0.
- Gây rối dropdown `/create_inventory` (không biết chọn cái nào).
- **Fix**: BE nên chặn trùng tên trong cùng tenant (hoặc chặn theo (tenant, branch)), trả về lỗi rõ ràng.

## 2. BE error 500 khi update warehouse với isSelling=1 đã tồn tại
- Payload: `PUT /bizapi/inventory/warehouse/update` với `isSelling: 1`
- Response: **HTTP 500** + body `{ "error": "Đã tồn tại kho hàng bán" }`
- **Bug**: Business rule violation (đã có kho bán) KHÔNG PHẢI server error. Phải trả **HTTP 400 / 409** với `code != 0`.
- FE hiện tại nuốt im lặng vì expects HTTP 200 + code error → xem `PaymentImportInvoices.tsx` / `ModalAddWarehouse.tsx`.

## 3. FE nuốt lỗi 500 khi update warehouse
- File: `src/pages/ProductImport/WarehouseList/ModalAddWarehouse/ModalAddWarehouse.tsx:237`
  ```ts
  const response = await InventoryService.update(body);
  if (response.code === 0) { ... } // else branch?
  ```
- Khi BE trả 500, `response` có thể là undefined hoặc object không có `code`. FE không show toast error, user tưởng save thành công.
- **Fix FE**: thêm try/catch + toast error rõ ràng khi response.code khác 0 hoặc request reject.

## 4. Warehouse delete UI không gọi API
- Test click nút "Xóa" trên row warehouse (/warehouse page) → dialog hiện → click "Xác nhận" → dialog đóng.
- Nhưng record **vẫn còn** trong list (gọi API `/bizapi/inventory/warehouse/delete` trực tiếp thì xóa được).
- → Click "Xác nhận" trên delete dialog không trigger delete API.
- **Fix FE**: kiểm tra handler `onConfirm` của dialog xóa warehouse có gọi API không.

## 5. Dropdown warehouse limit hard-coded 10 (ĐÃ FIX phần CreateReceipt)
Đã fix các file:
- `src/pages/ProductImport/CreateReceipt/PaymentImportInvoices.tsx`
- `src/pages/ManagementSale/.../AddProductInvoiceModal.tsx`
- `src/pages/Offer/.../AddOfferProductModal.tsx`
- `src/pages/Sell/CreateOrderSales/.../AddProductInvoiceModal.tsx`
- `src/pages/ProductImport/InventoryChecking/partials/ModalStockInitImport.tsx`

Từ `InventoryService.list()` → `InventoryService.list({ page: 1, limit: 200 })` để load đầy đủ warehouse (không chỉ 10 đầu).

**Còn việc**: `InventoryService.list()` nên default limit lớn hơn (50-100) ở service layer để tránh bug tương tự trong tương lai.
