import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IBoughtCardFilterRequest, IBoughtCardRequest, IBoughtCardUpdateRequest } from "model/boughtCard/BoughtCardRequestModel";
import { IBoughtCustomerCardRequest } from "model/boughtCustomerCard/BoughtCustomerCardRequest";
import { IRoyaltyPointFilterRequest } from "model/loyaltyPoint/RoyaltyPointRequest";

export default {
  list: (params: IBoughtCardFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.boughtCard.list, params, signal);
  },
  add: (body: IBoughtCardRequest) => {
    return apiPost(urlsApi.boughtCard.add, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.boughtCard.delete}?id=${id}`);
  },
  update: (body: IBoughtCardUpdateRequest) => {
    return apiPost(`${urlsApi.boughtCard.update}`, body);
  },
  listBoughtCardByCustomerId: (params: IBoughtCardFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.boughtCard.listBoughtCardByCustomerId, params, signal);
  },
  updateCustomerCard: (body: IBoughtCustomerCardRequest) => {
   return apiPost(urlsApi.boughtCard.updateCustomerCard, body);
  },
  listLoyaltyPoint: (params: IRoyaltyPointFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.boughtCard.listLoyaltyPoint, params, signal);
  },
};
