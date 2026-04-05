import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.bpmFormArtifact.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: Record<string, unknown>) => {
    return fetch(urlsApi.bpmFormArtifact.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmFormArtifact.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.bpmFormArtifact.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  updatePosition: (body: Record<string, unknown>) => {
    return fetch(urlsApi.bpmFormArtifact.updatePosition, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateConfig: (body: Record<string, unknown>) => {
    return fetch(urlsApi.bpmFormArtifact.updateConfig, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateEform: (body: Record<string, unknown>) => {
    return fetch(urlsApi.bpmFormArtifact.updateEform, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
