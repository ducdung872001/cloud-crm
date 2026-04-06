import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IContractAttributeFilterRequest, IContractAttributeRequest } from "model/contractAttribute/ContractAttributeRequest";

export default {
  list: (params: IContractAttributeFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.warrantyAttribute.list, params, signal);
  },
  update: (body: IContractAttributeRequest) => {
    return apiPost(urlsApi.warrantyAttribute.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.warrantyAttribute.delete}?id=${id}`);
  },
  listAll: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.warrantyAttribute.listAll, params, signal);
  },
  checkDuplicated: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.warrantyAttribute.checkDuplicated, params, signal);
  },
};
