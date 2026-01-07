import { urlsApi } from "configs/urls";
import { IContactFilterRequest } from "model/contact/ContactRequestModel";
import { IContactStatusRequest } from "model/contactStatus/ContactStatusRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  list: (pipelineId: number) => {
    return fetch(`${urlsApi.contactStatus.list}?pipelineId=${pipelineId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  listForContact: (params: IContactFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contactStatus.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContactStatusRequest) => {
    return fetch(urlsApi.contactStatus.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contactStatus.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contactStatus.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
