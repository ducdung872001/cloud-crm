import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  ITicketFilterRequest,
  ITicketRequestModel,
  ITicketProcessRequestModel,
  ITicketStatusRequestModel,
  ITicketExchangeUpdateRequestModel,
  ITicketExchangeFilterRequestModel,
} from "model/ticket/TicketRequestModel";

export default {
  list: (params?: ITicketFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.ticket.list, params, signal);
  },
  update: (body: ITicketRequestModel) => {
    return apiPost(urlsApi.ticket.update, body);
  },
  collect: (body: ITicketRequestModel, params?: Record<string, unknown>) => {
    return apiPost(`${urlsApi.ticket.collect}${convertParamsToString(params)}`, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.ticket.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.ticket.delete}?id=${id}`);
  },
  ticketProcessUpdate: (body: ITicketProcessRequestModel) => {
    return apiPost(urlsApi.ticket.ticketProcess, body);
  },
  updateStatus: (body: ITicketStatusRequestModel) => {
    return apiPost(urlsApi.ticket.updateStatus, body);
  },
  ticketExchangeList: (params?: ITicketExchangeFilterRequestModel, signal?: AbortSignal) => {
    return apiGet(urlsApi.ticket.ticketExchangeList, params, signal);
  },
  ticketExchangeUpdate: (body: ITicketExchangeUpdateRequestModel) => {
    return apiPost(urlsApi.ticket.ticketExchangeUpdate, body);
  },
  ticketExchangeDelete: (id: number) => {
    return apiDelete(`${urlsApi.ticket.ticketExchangeDelete}?id=${id}`);
  },
  resetTransferVotes: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.ticket.resetTransferVotes, params);
  },
};
