import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractAttachment.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractAttachment.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractAttachment.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contractAttachment.delete}?id=${id}`);
  },


  contractAttachmentList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractAttachment.contractAttachmentList, params, signal);
  },

  contractAttachmentUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractAttachment.contractAttachmentUpdate, body);
  },
  contractAttachmentDelete: (id: number) => {
    return apiDelete(`${urlsApi.contractAttachment.contractAttachmentDelete}?id=${id}`);
  },
};
