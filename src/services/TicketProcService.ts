import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITicketProcFilterRequest, ITicketProcRequest } from "model/ticketProc/TicketProcRequestModel";

export default {
  list: (params?: ITicketProcFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.ticketProc.list, params, signal);
  },
  update: (body: ITicketProcRequest) => {
    return apiPost(urlsApi.ticketProc.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.ticketProc.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.ticketProc.delete}?id=${id}`);
  },
};
