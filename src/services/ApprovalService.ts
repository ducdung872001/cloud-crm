import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.approval.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.approval.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.approval.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  updateStatus: (body: any) => {
    // truyền vào id và status ==> status == 0 (Chưa phê duyệt) <==> status == 1 (Đã phê duyệt)
    return fetch(urlsApi.approval.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // config
  lstConfig: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.approval.lstConfig}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateConfig: (body: any) => {
    return fetch(urlsApi.approval.updateConfig, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteConfig: (id: number) => {
    return fetch(`${urlsApi.approval.deleteConfig}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //link
  lstLink: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.approval.lstLink}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateLink: (body: any) => {
    return fetch(urlsApi.approval.updateLink, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLink: (id: number) => {
    return fetch(`${urlsApi.approval.deleteLink}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //object
  lstObject: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.approval.lstObject}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  takeObject: (params: any) => {
    return fetch(`${urlsApi.approval.takeObject}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  checkApproved: (params: any) => {
    return fetch(`${urlsApi.approval.checkApproved}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  updateObject: (body: any) => {
    return fetch(urlsApi.approval.updateObject, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteObject: (id: number) => {
    return fetch(`${urlsApi.approval.deleteObject}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //log
  lstLog: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.approval.lstLog}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateLog: (body: any) => {
    return fetch(urlsApi.approval.updateLog, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLog: (id: number) => {
    return fetch(`${urlsApi.approval.deleteLog}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  updateAlert: (body: any) => {
    return fetch(urlsApi.approval.updateAlert, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
