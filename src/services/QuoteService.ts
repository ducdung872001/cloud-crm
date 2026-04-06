import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.quote.lst, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.quote.update, body);
  },
  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.quote.updateStatus, body);
  },
  resetSignature: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.quote.resetSignal, params);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.quote.delete}?id=${id}`);
  },
  cloneQuote: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.quote.cloneQuote, body);
  },
  quoteFormLst: (params?: Record<string, unknown>) => {
    return apiGet(urlsApi.quote.quoteFormLst, params);
  },
  quoteFormUpdate: (body: Record<string, unknown>) => {
    return apiPost(`${urlsApi.quote.quoteFormUpdate}`, body);
  },
  quoteFormDelete: (id: number) => {
    return apiDelete(`${urlsApi.quote.quoteFormDelete}?id=${id}`);
  },
  quoteFormUpdatePostion: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.quote.quoteFormUpdatePostion, body);
  },

  updateQuoteContract: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.quote.updateQuoteContract, body);
  },

  listQuoteContract: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.quote.lstQuoteContract, params, signal);
  },

  deleteQuoteContract: (id: number, contractId: number) => {
    return apiDelete(`${urlsApi.quote.deleteQuoteContract}?quoteId=${id}&contractId=${contractId}`);
  },
};
