import { apiGet, apiPost, apiDelete } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IWarehouseFilterRequest, IListWarehouseProductFilterRequest, IInfoExpiryDateProductionDate } from "model/warehouse/WarehouseRequestModel";

export default {
  list: (params?: IWarehouseFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.warehouse.list, params, signal);
  },
  create: (body: { name: string; address?: string; code?: string }) => {
    return apiPost(urlsApi.warehouse.create, body);
  },
  update: (body: { id: number; name?: string; address?: string; code?: string; status?: number }) => {
    return apiPost(urlsApi.warehouse.update, body);
  },
  delete: (id: number) => {
    return apiDelete(urlsApi.warehouse.delete + "/" + id);
  },
  /** Chuyen kho sang trang thai "Ngung su dung" (status = 0) */
  deactivate: (id: number) => {
    return apiPost(urlsApi.warehouse.update, { id, status: 0 });
  },
  listInternal: (params?: IWarehouseFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.adjustmentSlip.productList, params, signal);
  },
  productList: (params?: IListWarehouseProductFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.warehouse.productList, params, signal);
  },
  /**
   * GET /inventory/inventoryBalance/stockProduct/export
   * Xuất tồn kho hiện tại ra Base64 xlsx.
   * FE decode → Blob → download.
   */
  exportStockProduct: (params?: {
    warehouseId?: number;
    keyword?: string;
    stockStatus?: number;
  }, signal?: AbortSignal): Promise<string> => {
    const qs = new URLSearchParams();
    if (params?.warehouseId !== undefined) qs.set("warehouseId", String(params.warehouseId));
    if (params?.keyword)                   qs.set("keyword",     params.keyword);
    if (params?.stockStatus !== undefined) qs.set("stockStatus", String(params.stockStatus));
    const url = `${urlsApi.inventoryBalance.stockProductExport}${qs.toString() ? "?" + qs.toString() : ""}`;
    return fetch(url, { method: "GET", signal })
      .then(async (res) => {
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message ?? "Xuất Excel thất bại");
        return json.result as string;
      });
  },

  infoExpiryDateProductionDate: (params?: IInfoExpiryDateProductionDate, signal?: AbortSignal) => {
    return apiGet(urlsApi.warehouse.infoExpiryDateProductionDate, params, signal);
  },
};