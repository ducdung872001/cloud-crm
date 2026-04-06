import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IWarrantyProcFilterRequest, IWarrantyProcRequest } from "model/warrantyProc/WarrantyProcRequestModel";

export default {
  list: (params?: IWarrantyProcFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.warrantyProc.list, params, signal);
  },
  update: (body: IWarrantyProcRequest) => {
    return apiPost(urlsApi.warrantyProc.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.warrantyProc.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.warrantyProc.delete}?id=${id}`);
  },
};
