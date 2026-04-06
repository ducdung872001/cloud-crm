import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractEform.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractEform.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractEform.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contractEform.delete}?id=${id}`);
  },

  listEformExtraInfo: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractEform.listEformExtraInfo, params, signal);
  },
  updateEformExtraInfo: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractEform.updateEformExtraInfo, body);
  },

  updateEformExtraInfoPosition: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractEform.updateEformExtraInfoPosition, body);
  },

  detailEformExtraInfo: (id: number) => {
    return fetch(`${urlsApi.contractEform.detailEformExtraInfo}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteEformExtraInfo: (id: number) => {
    return apiDelete(`${urlsApi.contractEform.deleteEformExtraInfo}?id=${id}`);
  },

  listEformAttribute: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractEform.listEformAttribute, params, signal);
  },
  updateEformAttribute: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractEform.updateEformAttribute, body);
  },

  detailEformAttribute: (id: number) => {
    return fetch(`${urlsApi.contractEform.detailEformAttribute}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteEformAttribute: (id: number) => {
    return apiDelete(`${urlsApi.contractEform.deleteEformAttribute}?id=${id}`);
  },

  listEformAttributeAll: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractEform.listEformAttributeAll, params, signal);
  },

  checkDuplicated: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractEform.checkDuplicated, params, signal);
  },

  ContractEformUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractEform.contractEformUpdate, body);
  },

  ContractEformDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractEform.contractEformDetail, params, signal);
  },
};
