import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.bpmFormMapping.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listSource: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.bpmFormMapping.listSource}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listTarget: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.bpmFormMapping.listTarget}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmFormMapping.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.bpmFormMapping.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.bpmFormMapping.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
