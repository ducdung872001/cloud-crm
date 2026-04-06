import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  warrantyAttachmentList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.warrantyAttachment.warrantyAttachmentList, params, signal);
  },

  warrantyAttachmentUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.warrantyAttachment.warrantyAttachmentUpdate, body);
  },
  warrantyAttachmentDelete: (id: number) => {
    return apiDelete(`${urlsApi.warrantyAttachment.warrantyAttachmentDelete}?id=${id}`);
  },
};
