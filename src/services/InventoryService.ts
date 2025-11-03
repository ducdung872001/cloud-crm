import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IInventoryFilterRequest, IInventoryRequest } from "model/inventory/InventoryRequestModel";

export default {
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
};
