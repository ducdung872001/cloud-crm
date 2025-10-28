import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IOfferCardFilterRequest, IOfferCardRequest, IOfferCardUpdateRequest } from "model/offerCard/OfferCardRequestModel";

export default {
  list: (params: IOfferCardFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.offerCard.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  add: (body: IOfferCardRequest) => {
    return fetch(urlsApi.offerCard.add, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.offerCard.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  update: (body: IOfferCardUpdateRequest) => {
    return fetch(`${urlsApi.offerCard.update}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
