import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IServiceFilterRequest, IServiceRequestModel } from "model/service/ServiceRequestModel";

export default {
  filter: (params?: IServiceFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.service.filter}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IServiceRequestModel) => {
    return fetch(urlsApi.service.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.service.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.service.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  ///Danh sách dịch vụ của đối tác
  listShared: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.service.listShared}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateContent: (body: Record<string, unknown>) => {
    return fetch(urlsApi.service.updateContent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
