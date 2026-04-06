import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IContactPipelineFilterRequest, IContactPipelineRequest } from "model/contactPipeline/ContactPipelineRequestModel";

export default {
  list: (params?: IContactPipelineFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.contactPipeline.list, params, signal);
  },
  update: (body: IContactPipelineRequest) => {
    return apiPost(urlsApi.contactPipeline.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contactPipeline.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contactPipeline.delete}?id=${id}`);
  },
};
