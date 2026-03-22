import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IInventoryFilterRequest, IInventoryLedgerFilterRequest, IInventoryRequest } from "model/inventory/InventoryRequestModel";

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

  import: () => {
    return fetch(urlsApi.inventory.import, {
      method: "GET",
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

  // POST /stockTransfer/approve?id=:id
  stockTransferApprove: (id: number) => {
    return fetch(`${urlsApi.stockTransfer.approve}?id=${id}`, {
      method: "POST",
    }).then((res) => res.json());
  },

  // POST /stockTransfer/cancel?id=:id
  stockTransferCancel: (id: number) => {
    return fetch(`${urlsApi.stockTransfer.cancel}?id=${id}`, {
      method: "POST",
    }).then((res) => res.json());
  },
};
