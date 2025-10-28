import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IOfferProductFilterRequest, IOfferProductRequest, IOfferProductToInvoiceRequest } from "model/offerProduct/OfferProductRequestModel";

export default {
  list: (params: IOfferProductFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.offerProduct.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  addProductToInvoice: (body: IOfferProductToInvoiceRequest) => {
    return fetch(urlsApi.offerProduct.addToInvoice, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  getByCustomerId: (id: number) => {
    return fetch(`${urlsApi.offerProduct.getByCustomer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IOfferProductRequest) => {
    return fetch(urlsApi.offerProduct.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.offerProduct.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.offerProduct.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
