import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.saleflowInvoice.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  update: (body: any) => {
    return fetch(urlsApi.saleflowInvoice.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateApproach: (body: any) => {
    return fetch(urlsApi.saleflowInvoice.updateApproach, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateApproachSuccess: (body: any) => {
    return fetch(urlsApi.saleflowInvoice.updateApproachSuccess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateApproachCancel: (body: any) => {
    return fetch(urlsApi.saleflowInvoice.updateApproachCancel, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  
  detail: (id: number) => {
    return fetch(`${urlsApi.saleflowInvoice.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.saleflowInvoice.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  invoiceExchange: (params: any) => {
    return fetch(`${urlsApi.saleflowInvoice.invoiceExchange}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 trao đổi 
  deleteInvoiceExchange: (id: number) => {
    return fetch(`${urlsApi.saleflowInvoice.deleteInvoiceExchange}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // thêm mới trao đổi 
  addInvoiceExchange: (body) => {
    return fetch(urlsApi.saleflowInvoice.addInvoiceExchange, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // cập nhật lại trao đổi 
  updateInvoiceExchange: (id: number) => {
    return fetch(`${urlsApi.saleflowInvoice.updateInvoiceExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  
};
