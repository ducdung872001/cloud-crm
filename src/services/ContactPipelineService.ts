import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IContactPipelineFilterRequest, IContactPipelineRequest } from "model/contactPipeline/ContactPipelineRequestModel";

export default {
  list: (params?: IContactPipelineFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contactPipeline.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContactPipelineRequest) => {
    return fetch(urlsApi.contactPipeline.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contactPipeline.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contactPipeline.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
