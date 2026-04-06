import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICustomerAttributeFilterRequest, ICustomerAttributeRequest } from "model/customerAttribute/CustomerAttributeRequest";

export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.objectAttribute.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.objectAttribute.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.objectAttribute.delete}?id=${id}`);
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.objectAttribute.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // listAll: (signal?: AbortSignal) => {
  //   return fetch(`${urlsApi.objectAttribute.listAll}`, {
  //     signal,
  //     method: "GET",
  //   }).then((res) => res.json());
  // },

  listAll: (groupId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.objectAttribute.listAll}?groupId=${groupId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  checkDuplicated: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.objectAttribute.checkDuplicated, params, signal);
  },

  updatePosition: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.objectAttribute.updatePosition, body);
  },
};
