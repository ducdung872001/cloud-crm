import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IWarehouseFilterRequest, IListWarehouseProductFilterRequest, IInfoExpiryDateProductionDate } from "model/warehouse/WarehouseRequestModel";

export default {
  list: (params?: IWarehouseFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warehouse.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listInternal: (params?: IWarehouseFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.adjustmentSlip.productList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  productList: (params?: IListWarehouseProductFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warehouse.productList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
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
    return fetch(`${urlsApi.warehouse.infoExpiryDateProductionDate}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};