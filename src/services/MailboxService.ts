import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

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
    return apiGet(urlsApi.mailBox.list, params, signal);
  },
  update: (body: IMailBoxRequestModel) => {
    return apiPost(urlsApi.mailBox.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.mailBox.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.mailBox.delete}?id=${id}`);
  },
  viewer: (id: IMailboxViewerFilterRequest) => {
    return fetch(`${urlsApi.mailBox.viewer}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  updateViewer: (body: IMailBoxViewerRequestModel) => {
    return apiPost(urlsApi.mailBox.updateViewer, body);
  },
  mailboxExchangeList: (params: IMailboxExchangeFilterRequest) => {
    return apiGet(urlsApi.mailBox.mailboxExchangeList, params);
  },
  mailboxExchangeUpdate: (body: IMailboxExchangeRequestModel) => {
    return apiPost(urlsApi.mailBox.mailboxExchangeUpdate, body);
  },
  mailboxExchangeDelete: (id: number) => {
    return apiDelete(`${urlsApi.mailBox.mailboxExchangeDelete}?id=${id}`);
  },
};
