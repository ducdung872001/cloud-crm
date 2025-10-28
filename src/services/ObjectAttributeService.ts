import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICustomerAttributeFilterRequest, ICustomerAttributeRequest } from "model/customerAttribute/CustomerAttributeRequest";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.objectAttribute.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.objectAttribute.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.objectAttribute.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
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

  checkDuplicated: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.objectAttribute.checkDuplicated}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updatePosition: (body: any) => {
    return fetch(urlsApi.objectAttribute.updatePosition, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
