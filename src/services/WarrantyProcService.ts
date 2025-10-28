import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IWarrantyProcFilterRequest, IWarrantyProcRequest } from "model/warrantyProc/WarrantyProcRequestModel";

export default {
  list: (params?: IWarrantyProcFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warrantyProc.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IWarrantyProcRequest) => {
    return fetch(urlsApi.warrantyProc.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.warrantyProc.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.warrantyProc.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
