import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IContactAttributeFilterRequest, IContactAttributeRequest } from "model/contactAttribute/ContactAttributeRequest";

export default {
  list: (params: IContactAttributeFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.contactAttribute.list, params, signal);
  },
  update: (body: IContactAttributeRequest) => {
    return apiPost(urlsApi.contactAttribute.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contactAttribute.delete}?id=${id}`);
  },
  listAll: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contactAttribute.listAll, params, signal);
  },

  checkDuplicated: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contactAttribute.checkDuplicated, params, signal);
  },
};
