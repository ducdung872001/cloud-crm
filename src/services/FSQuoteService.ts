import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.fs.lst, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.fs.update, body);
  },
  updateAndInit: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.fs.updateAndInit, body);
  },
  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.fs.updateStatus, body);
  },
  resetSignature: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.fs.resetSignal, params);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.fs.delete}?id=${id}`);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.fs.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneFs: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.fs.cloneFs, body);
  },
  fsFormLst: (params?: Record<string, unknown>) => {
    return apiGet(urlsApi.fs.fsFormLst, params);
  },
  fsFormUpdate: (body: Record<string, unknown>) => {
    return apiPost(`${urlsApi.fs.fsFormUpdate}`, body);
  },
  fsFormDelete: (id: number) => {
    return apiDelete(`${urlsApi.fs.fsFormDelete}?id=${id}`);
  },
  fsFormUpdatePostion: (body) => {
    return apiPost(urlsApi.fs.fsFormUpdatePostion, body);
  },
};
