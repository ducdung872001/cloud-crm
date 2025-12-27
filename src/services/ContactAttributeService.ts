import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IContactAttributeFilterRequest, IContactAttributeRequest } from "model/contactAttribute/ContactAttributeRequest";

export default {
  list: (params: IContactAttributeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contactAttribute.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContactAttributeRequest) => {
    return fetch(urlsApi.contactAttribute.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contactAttribute.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  listAll: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contactAttribute.listAll}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  checkDuplicated: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contactAttribute.checkDuplicated}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
