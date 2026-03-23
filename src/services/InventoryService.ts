import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IInventoryFilterRequest, IInventoryLedgerFilterRequest, IInventoryRequest } from "model/inventory/InventoryRequestModel";

export interface IVariantStockFilterRequest {
  keyword?: string;
  warehouseId?: number;
  productId?: number;
  stockStatus?: number; // -1: all, 0: out-of-stock, 1: low-stock (<=10), 2: in-stock
  sortBy?: "productName" | "sku" | "quantity";
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
}

export interface IStockProductFilterRequest {
  keyword?: string;
  warehouseId?: number;
  productId?: number;
  stockStatus?: number; // -1: all, 0: out-of-stock, 1: low-stock, 2: in-stock
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
}

export interface IStockTransferFilterRequest {
  fromWarehouseId?: number;
  toWarehouseId?: number;
  status?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export default {
  // ── Warehouse list (danh sách kho) ──────────────────────────────────────
  list: (params?: IInventoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.inventory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  update: (body: IInventoryRequest) => {
    return fetch(urlsApi.inventory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  delete: (id: number) => {
    return fetch(`${urlsApi.inventory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // ── Sổ kho (Ledger) ──────────────────────────────────────────────────────
  // GET /inventoryTransaction/ledger/list
  // refType: "" | "IMPORT" | "SALE" | "RETURN" | "TRANSFER" | "ADJUSTMENT" | "DESTROY"
  ledgerList: (params?: IInventoryLedgerFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.inventory.ledgerList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // GET /inventoryTransaction/ledger/get?id=:id
  ledgerDetail: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.inventory.ledgerDetail}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // ── Tồn kho theo sản phẩm ───────────────────────────────────────────────
  // GET /inventoryBalance/stockProduct/list
  // Response fields: inventoryBalanceId, productId, variantId, warehouseId,
  //                  productName, batchNo, expiryDate, unitName, quantity,
  //                  warehouseName, updatedTime
  stockProductList: (params?: IStockProductFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.inventoryBalance.stockProductList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // ── Chuyển kho ──────────────────────────────────────────────────────────
  // GET /stockTransfer/list
  stockTransferList: (params?: IStockTransferFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.stockTransfer.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // GET /stockTransfer/get?id=:id
  stockTransferGet: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.stockTransfer.get}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // GET /stockTransfer/approve?id=:id
  stockTransferApprove: (id: number) => {
    return fetch(`${urlsApi.stockTransfer.approve}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // GET /stockTransfer/cancel?id=:id
  stockTransferCancel: (id: number) => {
    return fetch(`${urlsApi.stockTransfer.cancel}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  
  // ── Tồn kho theo biến thể + đơn vị bán + giá vốn ───────────────────────
  // GET /inventoryBalance/variant/list
  // Response: inventoryBalanceId, productId, productName, productCode,
  //           variantId, sku, variantLabel, baseUnitId, baseUnitName,
  //           sellingUnitId, sellingUnitName, sellingPrice,
  //           avgCost, quantity, warehouseId, warehouseName, stockStatus
  variantStockList: (params?: IVariantStockFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.inventoryBalance.variantList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // ── Giá vốn bình quân — tái sử dụng /inventoryBalance/variant/list ────────
  // Tab "Giá vốn" dùng cùng API với tab "Tồn kho" nhưng sort theo avgCost desc,
  // filter bỏ sp hết hàng (stockStatus=2: còn hàng).
  // Không cần API mới — chỉ truyền param khác nhau.

  // GET /inventoryBalance/cost/summary
  // Response: { totalProducts, totalQty, totalCostValue, avgCostOverall }
  costSummary: (params?: { warehouseId?: number }, signal?: AbortSignal) => {
    return fetch(`${urlsApi.inventory.costSummary}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // ── Phiếu xuất hủy — aggregate từ inventory_transaction (ref_type=DESTROY) ──
  // Mỗi row = 1 phiếu hủy ghi nhận xuất kho
  //
  // GET /inventoryTransaction/destroy/list
  // Params: warehouseId, keyword, page, size
  destroyList: (params?: { warehouseId?: number; keyword?: string; page?: number; size?: number }, signal?: AbortSignal) => {
    return fetch(`${urlsApi.inventory.destroyList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // GET /inventoryTransaction/destroy/summary
  // Response: { totalDestroy, totalQty, totalCost, totalProduct }
  destroySummary: (signal?: AbortSignal) => {
    return fetch(urlsApi.inventory.destroySummary, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // ── Phiếu xuất kho — aggregate từ inventory_transaction (ref_type=SALE) ──
  // Mỗi row = 1 phiếu xuất = 1 đơn bán đã được ghi nhận xuất kho qua Kafka
  // Không có tên KH / mã ĐB vì cross-DB reference (Sales DB khác Inventory DB)
  //
  // GET /inventoryTransaction/sale/list
  // Params: warehouseId, keyword, page, size
  saleExportList: (params?: { warehouseId?: number; keyword?: string; page?: number; size?: number }, signal?: AbortSignal) => {
    return fetch(`${urlsApi.inventory.saleExportList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // GET /inventoryTransaction/sale/summary
  // Response: { totalExport, totalQty, totalCost, totalProduct }
  saleExportSummary: (signal?: AbortSignal) => {
    return fetch(urlsApi.inventory.saleExportSummary, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

};