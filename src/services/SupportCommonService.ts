import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  // config
  lstConfig: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.supportCommon.supportConfigLst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateConfig: (body: Record<string, unknown>) => {
    return fetch(urlsApi.supportCommon.supportConfigUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteConfig: (id: number) => {
    return fetch(`${urlsApi.supportCommon.supportConfigDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  detailConfig: (id: number) => {
    return fetch(`${urlsApi.supportCommon.supportConfigDetail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //link
  lstLink: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.supportCommon.supportLinkLst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateLink: (body: Record<string, unknown>) => {
    return fetch(urlsApi.supportCommon.supportLinkUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLink: (id: number) => {
    return fetch(`${urlsApi.supportCommon.supportLinkDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //object
  lstObject: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.supportCommon.supportObjectLst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  takeObject: (params: Record<string, unknown>) => {
    return fetch(`${urlsApi.supportCommon.takeObject}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  checkApproved: (params: Record<string, unknown>) => {
    return fetch(`${urlsApi.supportCommon.checkApproved}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  updateObject: (body: Record<string, unknown>) => {
    return fetch(urlsApi.supportCommon.supportObjectUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteObject: (id: number) => {
    return fetch(`${urlsApi.supportCommon.supportObjectDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //log
  lstLog: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.supportCommon.supportLogLst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateLog: (body: Record<string, unknown>) => {
    return fetch(urlsApi.supportCommon.supportLogUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLog: (id: number) => {
    return fetch(`${urlsApi.supportCommon.supportLogDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // cập nhật trạng thái
  updateStatusSupport: (body: Record<string, unknown>) => {
    return fetch(urlsApi.supportCommon.updateStatusSupport, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // đoạn này là action confirm nút
  processDone: (body: Record<string, unknown>) => {
    return fetch(urlsApi.supportCommon.processDone, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  processReceive: (body: Record<string, unknown>) => {
    return fetch(urlsApi.supportCommon.processReceive, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  processRejected: (body: Record<string, unknown>) => {
    return fetch(urlsApi.supportCommon.processRejected, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
