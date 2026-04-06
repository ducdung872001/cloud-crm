import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IOfferCardFilterRequest, IOfferCardRequest, IOfferCardUpdateRequest } from "model/offerCard/OfferCardRequestModel";

export default {
  list: (params: IOfferCardFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.offerCard.list, params, signal);
  },
  add: (body: IOfferCardRequest) => {
    return apiPost(urlsApi.offerCard.add, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.offerCard.delete}?id=${id}`);
  },
  update: (body: IOfferCardUpdateRequest) => {
    return apiPost(`${urlsApi.offerCard.update}`, body);
  },
};
