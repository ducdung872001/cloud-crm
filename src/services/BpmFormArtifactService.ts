import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.bpmFormArtifact.lst, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmFormArtifact.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.bpmFormArtifact.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.bpmFormArtifact.delete}?id=${id}`);
  },

  updatePosition: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmFormArtifact.updatePosition, body);
  },

  updateConfig: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmFormArtifact.updateConfig, body);
  },
  updateEform: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.bpmFormArtifact.updateEform, body);
  },
};
