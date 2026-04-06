import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

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
    return apiGet(urlsApi.inventory.list, params, signal);
  },

  update: (body: IInventoryRequest) => {
    return apiPost(urlsApi.inventory.update, body);
  },

  delete: (id: number) => {
    return apiDelete(`${urlsApi.inventory.delete}?id=${id}`);
  },

  // ── Sổ kho (Ledger) ──────────────────────────────────────────────────────
  // GET /inventoryTransaction/ledger/list
  // refType: "" | "IMPORT" | "SALE" | "RETURN" | "TRANSFER" | "ADJUSTMENT" | "DESTROY"
  ledgerList: (params?: IInventoryLedgerFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.inventory.ledgerList, params, signal);
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
    return apiGet(urlsApi.inventoryBalance.stockProductList, params, signal);
  },

  // ── Chuyển kho ──────────────────────────────────────────────────────────
  // GET /stockTransfer/list
  stockTransferList: (params?: IStockTransferFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.stockTransfer.list, params, signal);
  },

  // GET /stockTransfer/get?id=:id
  stockTransferGet: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.stockTransfer.get}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // POST /stockTransfer/update — tạo mới (id=null) hoặc cập nhật (id!=null)
  stockTransferUpdate: (body: {
    id?: number;
    code?: string;
    fromWarehouseId: number;
    toWarehouseId: number;
    note?: string;
    status?: number;
  }) => {
    return apiPost(urlsApi.stockTransfer.update, body);
  },

  // DELETE /stockTransfer/delete?id=:id
  stockTransferDelete: (id: number) => {
    return apiDelete(`${urlsApi.stockTransfer.delete}?id=${id}`);
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

  // ── Chi tiết chuyển kho ──────────────────────────────────────────────────
  // POST /stockTransferDetail/update — thêm/sửa 1 dòng hàng
  stockTransferDetailUpdate: (body: {
    id?: number;
    transferId: number;
    productId: number;
    variantId?: number;
    unitId?: number;
    quantity: number;
    note?: string;
  }) => {
    return apiPost(urlsApi.stockTransferDetail.update, body);
  },

  // DELETE /stockTransferDetail/delete?id=:id
  stockTransferDetailDelete: (id: number) => {
    return apiDelete(`${urlsApi.stockTransferDetail.delete}?id=${id}`);
  },

  // GET /stockTransferDetail/list?transferId=:id&productId=-1
  stockTransferDetailList: (params: { transferId: number; productId?: number; limit?: number }) => {
    return apiGet(urlsApi.stockTransferDetail.list, params);
  },
  
  // ── Tồn kho theo biến thể + đơn vị bán + giá vốn ───────────────────────
  // GET /inventoryBalance/variant/list
  // Response: inventoryBalanceId, productId, productName, productCode,
  //           variantId, sku, variantLabel, baseUnitId, baseUnitName,
  //           sellingUnitId, sellingUnitName, sellingPrice,
  //           avgCost, quantity, warehouseId, warehouseName, stockStatus
  variantStockList: (params?: IVariantStockFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.inventoryBalance.variantList, params, signal);
  },

  // ── Giá vốn bình quân — tái sử dụng /inventoryBalance/variant/list ────────
  // Tab "Giá vốn" dùng cùng API với tab "Tồn kho" nhưng sort theo avgCost desc,
  // filter bỏ sp hết hàng (stockStatus=2: còn hàng).
  // Không cần API mới — chỉ truyền param khác nhau.

  // GET /inventoryBalance/cost/summary
  // Response: { totalProducts, totalQty, totalCostValue, avgCostOverall }
  costSummary: (params?: { warehouseId?: number }, signal?: AbortSignal) => {
    return apiGet(urlsApi.inventory.costSummary, params, signal);
  },

  // ── Phiếu xuất hủy — aggregate từ inventory_transaction (ref_type=DESTROY) ──
  // Mỗi row = 1 phiếu hủy ghi nhận xuất kho
  //
  // GET /inventoryTransaction/destroy/list
  // Params: warehouseId, keyword, page, size
  exportDestroy: (params?: { warehouseId?: number; keyword?: string; status?: number }, signal?: AbortSignal): Promise<string> => {
    const qs = new URLSearchParams();
    if (params?.warehouseId !== undefined) qs.set("warehouseId", String(params.warehouseId));
    if (params?.keyword)                   qs.set("keyword",     params.keyword);
    if (params?.status !== undefined)      qs.set("status",      String(params.status));
    return fetch(`${urlsApi.inventory.destroyExport}${qs.toString() ? "?" + qs.toString() : ""}`, { method: "GET", signal })
      .then(async r => { const j = await r.json(); if (j.code !== 0) throw new Error(j.message ?? "Xuất Excel thất bại"); return j.result as string; });
  },
  exportTransfer: (params?: { status?: number }, signal?: AbortSignal): Promise<string> => {
    const qs = new URLSearchParams();
    if (params?.status !== undefined) qs.set("status", String(params.status));
    return fetch(`${urlsApi.stockTransfer.export}${qs.toString() ? "?" + qs.toString() : ""}`, { method: "GET", signal })
      .then(async r => { const j = await r.json(); if (j.code !== 0) throw new Error(j.message ?? "Xuất Excel thất bại"); return j.result as string; });
  },
  destroyList: (params?: { warehouseId?: number; keyword?: string; page?: number; size?: number }, signal?: AbortSignal) => {
    return apiGet(urlsApi.inventory.destroyList, params, signal);
  },

  destroyDetail: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.inventory.destroyDetail}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // GET /inventoryTransaction/destroy/summary
  // Response: { totalDestroy, totalQty, totalCost, totalProduct }
  destroySummary: (signal?: AbortSignal) => {
    return apiGet(urlsApi.inventory.destroySummary, undefined, signal);
  },

  // ── Phiếu xuất kho — aggregate từ inventory_transaction (ref_type=SALE) ──
  // Mỗi row = 1 phiếu xuất = 1 đơn bán đã được ghi nhận xuất kho qua Kafka
  // Không có tên KH / mã ĐB vì cross-DB reference (Sales DB khác Inventory DB)
  //
  // GET /inventoryTransaction/sale/list
  // Params: warehouseId, keyword, page, size
  saleExportList: (params?: { warehouseId?: number; keyword?: string; page?: number; size?: number }, signal?: AbortSignal) => {
    return apiGet(urlsApi.inventory.saleExportList, params, signal);
  },

  // GET /inventoryTransaction/sale/summary
  // Response: { totalExport, totalQty, totalCost, totalProduct }
  saleExportSummary: (signal?: AbortSignal) => {
    return apiGet(urlsApi.inventory.saleExportSummary, undefined, signal);
  },

};