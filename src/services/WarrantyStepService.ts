import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IWarrantyStepFilterRequest, IWarrantyStepRequest } from "model/warrantyStep/WarrantyStepRequestModel";

export default {
  list: (params?: IWarrantyStepFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.warrantyStep.list, params, signal);
  },
  update: (body: IWarrantyStepRequest) => {
    return apiPost(urlsApi.warrantyStep.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.warrantyStep.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.warrantyStep.delete}?id=${id}`);
  },
};
