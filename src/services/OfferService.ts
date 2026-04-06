import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  IOfferFilterRequest,
  IOfferDetailFilterRequest,
  IOfferCreateRequest,
  ITemporarilyOfferRequest,
} from "model/offer/OfferRequestModel";

export default {
  list: (params: IOfferFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.offer.list, params, signal);
  },
  offerDetail: (params: IOfferDetailFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.offer.offerDetail, params, signal);
  },
  // Xem chi tiết hóa đơn
  listOfferDetail: (id: number) => {
    return fetch(`${urlsApi.offer.offerDetailList}?offerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  create: (body: IOfferCreateRequest) => {
    return apiPost(urlsApi.offer.create, body);
  },
  cardService: (id: number) => {
    return fetch(`${urlsApi.offer.cardService}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Lấy ra danh sách dịch vụ, sản phẩm trong lúc tạo hóa đơn
  offerDetailCustomer: (id: number) => {
    return fetch(`${urlsApi.offer.offerDetailCustomer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //Hủy hóa đơn
  cancelOffer: (id: number) => {
    return apiDelete(`${urlsApi.offer.cancelOffer}?id=${id}`);
  },
  // lấy danh sách thu tiền, chi tiền của khách
  debtOffer: (id: number) => {
    return fetch(`${urlsApi.offer.debtOffer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // lưu tạm hóa đơn
  temporarilyOffers: (body: ITemporarilyOfferRequest) => {
    return apiPost(urlsApi.offer.temporarilyOffer, body);
  }, 
};
