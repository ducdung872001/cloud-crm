import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITicketCategoryFilterRequest, ITicketCategoryRequest } from "model/ticketCategory/TicketCategoryRequestModel";

export default {
  list: (params?: ITicketCategoryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.ticketCategory.list, params, signal);
  },
  update: (body: ITicketCategoryRequest) => {
    return apiPost(urlsApi.ticketCategory.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.ticketCategory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.ticketCategory.delete}?id=${id}`);
  },
};
