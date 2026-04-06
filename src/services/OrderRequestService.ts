import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { ICashbookFilterRequest, ICashbookRequest } from "model/cashbook/CashbookRequestModel";


export default {
  list: (params?: ICashbookFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.orderRequest.list, params, signal);
  },
  listOne: (params?: ICashbookFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.orderRequest.listOne, params, signal);
  },
  update: (body: ICashbookRequest) => {
    return apiPost(urlsApi.orderRequest.update, body);
  },
  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.orderRequest.updateStatus, body);
  },
  confirm: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.orderRequest.confirm, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.orderRequest.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.orderRequest.delete}?id=${id}`);
  },
  export: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.orderRequest.export, params, signal);
  },
};