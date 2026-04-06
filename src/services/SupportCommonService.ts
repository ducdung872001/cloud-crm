import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  // config
  lstConfig: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.supportCommon.supportConfigLst, params, signal);
  },
  updateConfig: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supportCommon.supportConfigUpdate, body);
  },
  deleteConfig: (id: number) => {
    return apiDelete(`${urlsApi.supportCommon.supportConfigDelete}?id=${id}`);
  },
  detailConfig: (id: number) => {
    return fetch(`${urlsApi.supportCommon.supportConfigDetail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //link
  lstLink: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.supportCommon.supportLinkLst, params, signal);
  },
  updateLink: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supportCommon.supportLinkUpdate, body);
  },
  deleteLink: (id: number) => {
    return apiDelete(`${urlsApi.supportCommon.supportLinkDelete}?id=${id}`);
  },
  //object
  lstObject: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.supportCommon.supportObjectLst, params, signal);
  },
  takeObject: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.supportCommon.takeObject, params);
  },
  checkApproved: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.supportCommon.checkApproved, params);
  },
  updateObject: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supportCommon.supportObjectUpdate, body);
  },
  deleteObject: (id: number) => {
    return apiDelete(`${urlsApi.supportCommon.supportObjectDelete}?id=${id}`);
  },
  //log
  lstLog: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.supportCommon.supportLogLst, params, signal);
  },
  updateLog: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supportCommon.supportLogUpdate, body);
  },
  deleteLog: (id: number) => {
    return apiDelete(`${urlsApi.supportCommon.supportLogDelete}?id=${id}`);
  },

  // cập nhật trạng thái
  updateStatusSupport: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supportCommon.updateStatusSupport, body);
  },

  // đoạn này là action confirm nút
  processDone: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supportCommon.processDone, body);
  },
  processReceive: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supportCommon.processReceive, body);
  },
  processRejected: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.supportCommon.processRejected, body);
  },
};
