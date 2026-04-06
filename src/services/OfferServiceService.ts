import { apiDelete, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { IOfferServiceRequest, IOfferServiceToInvoiceRequest } from "model/offerService/OfferServiceRequestModel";

export default {
  addProductToInvoice: (body: IOfferServiceToInvoiceRequest) => {
    return apiPost(urlsApi.offerService.addToInvoice, body);
  },
  getByCustomerId: (id: number) => {
    return fetch(`${urlsApi.offerService.getByCustomer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IOfferServiceRequest) => {
    return apiPost(`${urlsApi.offerService.update}`, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.offerService.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.offerService.delete}?id=${id}`);
  },
};
