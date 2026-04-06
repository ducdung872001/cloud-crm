import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.approval.lst, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.approval.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.approval.delete}?id=${id}`);
  },
  updateStatus: (body: Record<string, unknown>) => {
    // truyền vào id và status ==> status == 0 (Chưa phê duyệt) <==> status == 1 (Đã phê duyệt)
    return apiPost(urlsApi.approval.updateStatus, body);
  },
  // config
  lstConfig: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.approval.lstConfig, params, signal);
  },
  updateConfig: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.approval.updateConfig, body);
  },
  deleteConfig: (id: number) => {
    return apiDelete(`${urlsApi.approval.deleteConfig}?id=${id}`);
  },
  //link
  lstLink: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.approval.lstLink, params, signal);
  },
  updateLink: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.approval.updateLink, body);
  },
  deleteLink: (id: number) => {
    return apiDelete(`${urlsApi.approval.deleteLink}?id=${id}`);
  },
  //object
  lstObject: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.approval.lstObject, params, signal);
  },
  takeObject: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.approval.takeObject, params);
  },
  checkApproved: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.approval.checkApproved, params);
  },
  updateObject: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.approval.updateObject, body);
  },
  deleteObject: (id: number) => {
    return apiDelete(`${urlsApi.approval.deleteObject}?id=${id}`);
  },
  //log
  lstLog: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.approval.lstLog, params, signal);
  },
  updateLog: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.approval.updateLog, body);
  },
  deleteLog: (id: number) => {
    return apiDelete(`${urlsApi.approval.deleteLog}?id=${id}`);
  },

  updateAlert: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.approval.updateAlert, body);
  },
};
