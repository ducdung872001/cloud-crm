import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.bpmInvestor.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.bpmInvestor.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.bpmInvestor.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  updateStatus: (body: any) => {
    return fetch(urlsApi.bpmInvestor.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmInvestor.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
