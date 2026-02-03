import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.businessRuleItem.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.businessRuleItem.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateActive: (body: any) => {
    return fetch(urlsApi.businessRuleItem.updateActive, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.businessRuleItem.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.businessRuleItem.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
