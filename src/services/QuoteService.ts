import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.quote.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.quote.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateStatus: (body: any) => {
    return fetch(urlsApi.quote.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  resetSignature: (params: any) => {
    return fetch(`${urlsApi.quote.resetSignal}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.quote.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  cloneQuote: (body: any) => {
    return fetch(urlsApi.quote.cloneQuote, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  quoteFormLst: (params?: any) => {
    return fetch(`${urlsApi.quote.quoteFormLst}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  quoteFormUpdate: (body: any) => {
    return fetch(`${urlsApi.quote.quoteFormUpdate}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  quoteFormDelete: (id: number) => {
    return fetch(`${urlsApi.quote.quoteFormDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  quoteFormUpdatePostion: (body) => {
    return fetch(urlsApi.quote.quoteFormUpdatePostion, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateQuoteContract: (body: any) => {
    return fetch(urlsApi.quote.updateQuoteContract, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listQuoteContract: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.quote.lstQuoteContract}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  deleteQuoteContract: (id: number, contractId: number) => {
    return fetch(`${urlsApi.quote.deleteQuoteContract}?quoteId=${id}&contractId=${contractId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
