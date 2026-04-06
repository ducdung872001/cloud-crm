import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IServiceFilterRequest, IServiceRequestModel } from "model/service/ServiceRequestModel";

export default {
  filter: (params?: IServiceFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.service.filter, params, signal);
  },
  update: (body: IServiceRequestModel) => {
    return apiPost(urlsApi.service.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.service.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.service.delete}?id=${id}`);
  },

  ///Danh sách dịch vụ của đối tác
  listShared: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.service.listShared, params, signal);
  },

  updateContent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.service.updateContent, body);
  },
};
