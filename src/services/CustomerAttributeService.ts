import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICustomerAttributeFilterRequest, ICustomerAttributeRequest } from "model/customerAttribute/CustomerAttributeRequest";

export default {
  list: (params: ICustomerAttributeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customerAttribute.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICustomerAttributeRequest) => {
    return fetch(urlsApi.customerAttribute.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.customerAttribute.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
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

  checkDuplicated: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customerAttribute.checkDuplicated}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
