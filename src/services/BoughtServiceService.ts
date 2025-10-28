import { urlsApi } from "configs/urls";
import { IBoughtServiceRequest, IBoughtServiceToInvoiceRequest } from "model/boughtService/BoughtServiceRequestModel";

export default {
  addProductToInvoice: (body: IBoughtServiceToInvoiceRequest) => {
    return fetch(urlsApi.boughtService.addToInvoice, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  getByCustomerId: (id: number) => {
    return fetch(`${urlsApi.boughtService.getByCustomer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IBoughtServiceRequest) => {
    return fetch(`${urlsApi.boughtService.update}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.boughtService.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.boughtService.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
