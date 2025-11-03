import { urlsApi } from "configs/urls";
import { ICashbookFilterRequest, ICashbookRequest } from "model/cashbook/CashbookRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: ICashbookFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.orderRequest.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICashbookRequest) => {
    return fetch(urlsApi.orderRequest.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.orderRequest.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.orderRequest.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  export: (params?: ICashbookFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.orderRequest.export}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
