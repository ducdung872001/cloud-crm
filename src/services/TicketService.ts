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
    return fetch(`${urlsApi.ticket.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITicketRequestModel) => {
    return fetch(urlsApi.ticket.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.ticket.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.ticket.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  ticketProcessUpdate: (body: ITicketProcessRequestModel) => {
    return fetch(urlsApi.ticket.ticketProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateStatus: (body: ITicketStatusRequestModel) => {
    return fetch(urlsApi.ticket.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  ticketExchangeList: (params?: ITicketExchangeFilterRequestModel, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ticket.ticketExchangeList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  ticketExchangeUpdate: (body: ITicketExchangeUpdateRequestModel) => {
    return fetch(urlsApi.ticket.ticketExchangeUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  ticketExchangeDelete: (id: number) => {
    return fetch(`${urlsApi.ticket.ticketExchangeDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  resetTransferVotes: (params: any) => {
    return fetch(`${urlsApi.ticket.resetTransferVotes}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
