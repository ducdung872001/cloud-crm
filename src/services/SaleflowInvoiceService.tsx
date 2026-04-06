import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.saleflowInvoice.list, params, signal);
  },

  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflowInvoice.update, body);
  },
  updateApproach: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflowInvoice.updateApproach, body);
  },

  updateApproachSuccess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflowInvoice.updateApproachSuccess, body);
  },

  updateApproachCancel: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflowInvoice.updateApproachCancel, body);
  },
  
  detail: (id: number) => {
    return fetch(`${urlsApi.saleflowInvoice.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.saleflowInvoice.delete}?id=${id}`);
  },

  invoiceExchange: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.saleflowInvoice.invoiceExchange, params);
  },
  // xóa đi 1 trao đổi 
  deleteInvoiceExchange: (id: number) => {
    return apiDelete(`${urlsApi.saleflowInvoice.deleteInvoiceExchange}?id=${id}`);
  },
  // thêm mới trao đổi 
  addInvoiceExchange: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflowInvoice.addInvoiceExchange, body);
  },

  // cập nhật lại trao đổi 
  updateInvoiceExchange: (id: number) => {
    return fetch(`${urlsApi.saleflowInvoice.updateInvoiceExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  
};
