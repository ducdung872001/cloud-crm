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
  productList: (params?: IListWarehouseProductFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warehouse.productList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  infoExpiryDateProductionDate: (params?: IInfoExpiryDateProductionDate, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warehouse.infoExpiryDateProductionDate}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
