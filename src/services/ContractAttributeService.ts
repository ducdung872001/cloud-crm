import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IContractAttributeFilterRequest, IContractAttributeRequest } from "model/contractAttribute/ContractAttributeRequest";

export default {
  list: (params: IContractAttributeFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractAttribute.list, params, signal);
  },
  update: (body: IContractAttributeRequest) => {
    return apiPost(urlsApi.contractAttribute.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contractAttribute.delete}?id=${id}`);
  },
  listAll: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractAttribute.listAll, params, signal);
  },
  checkDuplicated: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractAttribute.checkDuplicated, params, signal);
  },
};
