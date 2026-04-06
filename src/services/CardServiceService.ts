import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICardServiceFilterRequest, ICardServiceRequest } from "model/cardService/CardServiceRequestModel";

export default {
  list: (params?: ICardServiceFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.cardService.list, params, signal);
  },
  update: (body: ICardServiceRequest) => {
    return apiPost(urlsApi.cardService.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.cardService.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.cardService.delete}?id=${id}`);
  },
};
