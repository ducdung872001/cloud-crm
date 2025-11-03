import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.processedObject.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.processedObject.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateProcess: (body: any) => {
    return fetch(urlsApi.processedObject.updateProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateProcessInstance: (body: any) => {
    return fetch(urlsApi.processedObject.updateProcessInstance, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateStatus: (body: any) => {
    return fetch(urlsApi.processedObject.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  resetSignature: (params: any) => {
    return fetch(`${urlsApi.processedObject.resetSignal}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.processedObject.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },


  bpmStart: (body: any) => {
    return fetch(urlsApi.processedObject.bpmStart, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  bpmExecListNode: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.processedObject.bpmExecListNode}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  bpmProcess: (body: any) => {
    return fetch(urlsApi.processedObject.bpmProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //lấy dữ liệu đã lưu hiển thị lại trên eform bước tiếp theo
  bpmArtifactData: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.processedObject.bpmArtifactData}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //lịch sử xử lý
  bpmParticipantProcesslog: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.processedObject.bpmParticipantProcesslog}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //check đã xử lý đến node nào để hiển thị trên sơ đồ
  processedObjectLog: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.processedObject.processedObjectLog}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
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
