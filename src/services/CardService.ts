import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICardFilterRequest, ICardRequest } from "model/card/CardRequestModel";

export default {
  list: (params: ICardFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.card.list, params, signal);
  },
  update: (body: ICardRequest) => {
    return apiPost(urlsApi.card.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.card.delete}?id=${id}`);
  },
};
