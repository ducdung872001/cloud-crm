import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITicketStepFilterRequest, ITicketStepRequest } from "model/ticketStep/TicketStepRequestModel";

export default {
  list: (params?: ITicketStepFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.ticketStep.list, params, signal);
  },
  update: (body: ITicketStepRequest) => {
    return apiPost(urlsApi.ticketStep.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.ticketStep.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.ticketStep.delete}?id=${id}`);
  },
};
