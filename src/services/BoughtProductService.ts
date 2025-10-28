import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IBoughtProductFilterRequest, IBoughtProductRequest, IBoughtProductToInvoiceRequest } from "model/boughtProduct/BoughtProductRequestModel";

export default {
  list: (params: IBoughtProductFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.boughtProduct.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  addProductToInvoice: (body: IBoughtProductToInvoiceRequest) => {
    return fetch(urlsApi.boughtProduct.addToInvoice, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  getByCustomerId: (id: number) => {
    return fetch(`${urlsApi.boughtProduct.getByCustomer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IBoughtProductRequest) => {
    return fetch(urlsApi.boughtProduct.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.boughtProduct.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.boughtProduct.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
