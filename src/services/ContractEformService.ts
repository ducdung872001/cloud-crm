import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractEform.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.contractEform.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractEform.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contractEform.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listEformExtraInfo: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractEform.listEformExtraInfo}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateEformExtraInfo: (body: any) => {
    return fetch(urlsApi.contractEform.updateEformExtraInfo, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateEformExtraInfoPosition: (body: any) => {
    return fetch(urlsApi.contractEform.updateEformExtraInfoPosition, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailEformExtraInfo: (id: number) => {
    return fetch(`${urlsApi.contractEform.detailEformExtraInfo}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteEformExtraInfo: (id: number) => {
    return fetch(`${urlsApi.contractEform.deleteEformExtraInfo}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listEformAttribute: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractEform.listEformAttribute}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateEformAttribute: (body: any) => {
    return fetch(urlsApi.contractEform.updateEformAttribute, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailEformAttribute: (id: number) => {
    return fetch(`${urlsApi.contractEform.detailEformAttribute}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteEformAttribute: (id: number) => {
    return fetch(`${urlsApi.contractEform.deleteEformAttribute}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listEformAttributeAll: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractEform.listEformAttributeAll}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  checkDuplicated: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractEform.checkDuplicated}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  ContractEformUpdate: (body: any) => {
    return fetch(urlsApi.contractEform.contractEformUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  ContractEformDetail: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractEform.contractEformDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
