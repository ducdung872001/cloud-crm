import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IMailBoxFilterRequest,
  IMailboxViewerFilterRequest,
  IMailboxExchangeFilterRequest,
  IMailBoxRequestModel,
  IMailBoxViewerRequestModel,
  IMailboxExchangeRequestModel,
} from "model/mailBox/MailBoxRequestModel";

export default {
  list: (params: IMailBoxFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.mailBox.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IMailBoxRequestModel) => {
    return fetch(urlsApi.mailBox.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.mailBox.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.mailBox.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  viewer: (id: IMailboxViewerFilterRequest) => {
    return fetch(`${urlsApi.mailBox.viewer}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  updateViewer: (body: IMailBoxViewerRequestModel) => {
    return fetch(urlsApi.mailBox.updateViewer, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  mailboxExchangeList: (params: IMailboxExchangeFilterRequest) => {
    return fetch(`${urlsApi.mailBox.mailboxExchangeList}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  mailboxExchangeUpdate: (body: IMailboxExchangeRequestModel) => {
    return fetch(urlsApi.mailBox.mailboxExchangeUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  mailboxExchangeDelete: (id: number) => {
    return fetch(`${urlsApi.mailBox.mailboxExchangeDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
