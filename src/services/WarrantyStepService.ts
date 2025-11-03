import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IWarrantyStepFilterRequest, IWarrantyStepRequest } from "model/warrantyStep/WarrantyStepRequestModel";

export default {
  list: (params?: IWarrantyStepFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warrantyStep.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET", 
    }).then((res) => res.json());
  },
  update: (body: IWarrantyStepRequest) => {
    return fetch(urlsApi.warrantyStep.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.warrantyStep.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.warrantyStep.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
