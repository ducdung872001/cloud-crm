import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.processedObject.lst, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.processedObject.update, body);
  },
  updateProcess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.processedObject.updateProcess, body);
  },
  updateProcessInstance: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.processedObject.updateProcessInstance, body);
  },
  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.processedObject.updateStatus, body);
  },
  resetSignature: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.processedObject.resetSignal, params);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.processedObject.delete}?id=${id}`);
  },


  bpmStart: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.processedObject.bpmStart, body);
  },

  bpmExecListNode: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.processedObject.bpmExecListNode, params, signal);
  },

  bpmProcess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.processedObject.bpmProcess, body);
  },

  //lấy dữ liệu đã lưu hiển thị lại trên eform bước tiếp theo
  bpmArtifactData: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.processedObject.bpmArtifactData, params, signal);
  },

  //lịch sử xử lý
  bpmParticipantProcesslog: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.processedObject.bpmParticipantProcesslog, params, signal);
  },

  //check đã xử lý đến node nào để hiển thị trên sơ đồ
  processedObjectLog: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.processedObject.processedObjectLog, params, signal);
  },

  // cloneQuote: (body: any) => {
  //   return fetch(urlsApi.processedObject.cloneQuote, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },
  // quoteFormLst: (params?: any) => {
  //   return fetch(`${urlsApi.quote.quoteFormLst}${convertParamsToString(params)}`, {
  //     method: "GET",
  //   }).then((res) => res.json());
  // },
  // quoteFormUpdate: (body: any) => {
  //   return fetch(`${urlsApi.quote.quoteFormUpdate}`, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },
  // quoteFormDelete: (id: number) => {
  //   return fetch(`${urlsApi.quote.quoteFormDelete}?id=${id}`, {
  //     method: "DELETE",
  //   }).then((res) => res.json());
  // },
  // quoteFormUpdatePostion: (body) => {
  //   return fetch(urlsApi.quote.quoteFormUpdatePostion, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  // updateQuoteContract: (body: any) => {
  //   return fetch(urlsApi.quote.updateQuoteContract, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  // listQuoteContract: (params?: any, signal?: AbortSignal) => {
  //   return fetch(`${urlsApi.quote.lstQuoteContract}${convertParamsToString(params)}`, {
  //     signal,
  //     method: "GET",
  //   }).then((res) => res.json());
  // },

  // deleteQuoteContract: (id: number, contractId: number) => {
  //   return fetch(`${urlsApi.quote.deleteQuoteContract}?quoteId=${id}&contractId=${contractId}`, {
  //     method: "DELETE",
  //   }).then((res) => res.json());
  // },
};
