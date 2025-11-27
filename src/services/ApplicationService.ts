import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.application.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listAll: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.application.lstAll}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body) => {
    return fetch(`${urlsApi.application.update}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  confirmBill: (body) => {
    return fetch(`${urlsApi.application.confirmBill}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.application.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
