import { apiDelete, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { IBoughtServiceRequest, IBoughtServiceToInvoiceRequest } from "model/boughtService/BoughtServiceRequestModel";

export default {
  addProductToInvoice: (body: IBoughtServiceToInvoiceRequest) => {
    return apiPost(urlsApi.boughtService.addToInvoice, body);
  },
  getByCustomerId: (id: number) => {
    return fetch(`${urlsApi.boughtService.getByCustomer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IBoughtServiceRequest) => {
    return apiPost(`${urlsApi.boughtService.update}`, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.boughtService.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.boughtService.delete}?id=${id}`);
  },
};
