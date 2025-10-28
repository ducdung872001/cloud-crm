import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractAttachment.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.contractAttachment.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractAttachment.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contractAttachment.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },


  contractAttachmentList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractAttachment.contractAttachmentList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  contractAttachmentUpdate: (body: any) => {
    return fetch(urlsApi.contractAttachment.contractAttachmentUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  contractAttachmentDelete: (id: number) => {
    return fetch(`${urlsApi.contractAttachment.contractAttachmentDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
