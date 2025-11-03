import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  listSource: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.bpmEformMapping.lstSource}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmEformMapping.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.bpmEformMapping.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.bpmEformMapping.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listEform: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.bpmEformMapping.lstEform}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
