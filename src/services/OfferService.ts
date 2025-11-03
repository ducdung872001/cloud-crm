import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IOfferFilterRequest,
  IOfferDetailFilterRequest,
  IOfferCreateRequest,
  ITemporarilyOfferRequest,
} from "model/offer/OfferRequestModel";

export default {
  list: (params: IOfferFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.offer.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  offerDetail: (params: IOfferDetailFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.offer.offerDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Xem chi tiết hóa đơn
  listOfferDetail: (id: number) => {
    return fetch(`${urlsApi.offer.offerDetailList}?offerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  create: (body: IOfferCreateRequest) => {
    return fetch(urlsApi.offer.create, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
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
    return fetch(`${urlsApi.offer.cancelOffer}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // lấy danh sách thu tiền, chi tiền của khách
  debtOffer: (id: number) => {
    return fetch(`${urlsApi.offer.debtOffer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // lưu tạm hóa đơn
  temporarilyOffers: (body: ITemporarilyOfferRequest) => {
    return fetch(urlsApi.offer.temporarilyOffer, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  }, 
};
