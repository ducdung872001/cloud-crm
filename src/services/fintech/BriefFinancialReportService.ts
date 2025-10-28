import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.briefFinancialReport.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  get: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.briefFinancialReport.get}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.briefFinancialReport.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.briefFinancialReport.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
