import { urlsApi } from "configs/urls";
import { IOfferServiceRequest, IOfferServiceToInvoiceRequest } from "model/offerService/OfferServiceRequestModel";

export default {
  addProductToInvoice: (body: IOfferServiceToInvoiceRequest) => {
    return fetch(urlsApi.offerService.addToInvoice, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  getByCustomerId: (id: number) => {
    return fetch(`${urlsApi.offerService.getByCustomer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IOfferServiceRequest) => {
    return fetch(`${urlsApi.offerService.update}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.offerService.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.offerService.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
