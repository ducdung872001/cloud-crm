import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IOfferProductFilterRequest, IOfferProductRequest, IOfferProductToInvoiceRequest } from "model/offerProduct/OfferProductRequestModel";

export default {
  list: (params: IOfferProductFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.offerProduct.list, params, signal);
  },
  addProductToInvoice: (body: IOfferProductToInvoiceRequest) => {
    return apiPost(urlsApi.offerProduct.addToInvoice, body);
  },
  getByCustomerId: (id: number) => {
    return fetch(`${urlsApi.offerProduct.getByCustomer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IOfferProductRequest) => {
    return apiPost(urlsApi.offerProduct.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.offerProduct.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.offerProduct.delete}?id=${id}`);
  },
};
