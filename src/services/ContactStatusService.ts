import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { IContactFilterRequest } from "model/contact/ContactRequestModel";
import { IContactStatusRequest } from "model/contactStatus/ContactStatusRequestModel";


export default {
  list: (pipelineId: number) => {
    return fetch(`${urlsApi.contactStatus.list}?pipelineId=${pipelineId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  listForContact: (params: IContactFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.contactStatus.list, params, signal);
  },
  update: (body: IContactStatusRequest) => {
    return apiPost(urlsApi.contactStatus.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contactStatus.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contactStatus.delete}?id=${id}`);
  },
};
