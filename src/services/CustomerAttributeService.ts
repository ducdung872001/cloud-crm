import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICustomerAttributeFilterRequest, ICustomerAttributeRequest } from "model/customerAttribute/CustomerAttributeRequest";

export default {
  list: (params: ICustomerAttributeFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.customerAttribute.list, params, signal);
  },
  update: (body: ICustomerAttributeRequest) => {
    return apiPost(urlsApi.customerAttribute.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.customerAttribute.delete}?id=${id}`);
  },
  // listAll: (signal?: AbortSignal) => {
  //   return fetch(`${urlsApi.customerAttribute.listAll}`, {
  //     signal,
  //     method: "GET",
  //   }).then((res) => res.json());
  // },
  listAll: (custType: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customerAttribute.listAll}?custType=${custType}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  checkDuplicated: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.customerAttribute.checkDuplicated, params, signal);
  },
};
