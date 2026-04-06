import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IBoughtProductFilterRequest,
  IBoughtProductRequest,
  IBoughtProductToInvoiceRequest,
  IInsertedItem,
} from "model/boughtProduct/BoughtProductRequestModel";

export default {
  list: (params: IBoughtProductFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.boughtProduct.list, params, signal);
  },
  addProductToInvoice: (body: IBoughtProductToInvoiceRequest) => {
    return apiPost(urlsApi.boughtProduct.addToInvoice, body);
  },
  getByCustomerId: (id: number) => {
    return fetch(`${urlsApi.boughtProduct.getByCustomer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IBoughtProductRequest) => {
    return apiPost(urlsApi.boughtProduct.update, body);
  },
  insert: (body: IInsertedItem[], params?: Record<string, any>) => {
    return apiPost(`${urlsApi.boughtProduct.insert}${convertParamsToString(params)}`, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.boughtProduct.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.boughtProduct.delete}?id=${id}`);
  },
};
