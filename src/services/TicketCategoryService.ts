import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ITicketCategoryFilterRequest, ITicketCategoryRequest } from "model/ticketCategory/TicketCategoryRequestModel";

export default {
  list: (params?: ITicketCategoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ticketCategory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITicketCategoryRequest) => {
    return fetch(urlsApi.ticketCategory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.ticketCategory.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.ticketCategory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
