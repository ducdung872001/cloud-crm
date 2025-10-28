import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IInvoiceFilterRequest,
  IInvoiceDetailFilterRequest,
  IInvoiceCreateRequest,
  ITemporarilyInvoiceRequest,
} from "model/invoice/InvoiceRequestModel";

export default {
  list: (params: IInvoiceFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.invoice.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  invoiceDetail: (params: IInvoiceDetailFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.invoice.invoiceDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Xem chi tiết hóa đơn
  listInvoiceDetail: (id: number) => {
    return fetch(`${urlsApi.invoice.invoiceDetailList}?invoiceId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  create: (body: IInvoiceCreateRequest) => {
    return fetch(urlsApi.invoice.create, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  cardService: (id: number) => {
    return fetch(`${urlsApi.invoice.cardService}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Lấy ra danh sách dịch vụ, sản phẩm trong lúc tạo hóa đơn
  invoiceDetailCustomer: (id: number, invoiceId?: number) => {
    return fetch(`${urlsApi.invoice.invoiceDetailCustomer}?customerId=${id}${invoiceId ? `&id=${invoiceId}` : ''}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //Hủy hóa đơn
  cancelInvoice: (id: number) => {
    return fetch(`${urlsApi.invoice.cancelInvoice}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // lấy danh sách thu tiền, chi tiền của khách
  debtInvoice: (id: number) => {
    return fetch(`${urlsApi.invoice.debtInvoice}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // lưu tạm hóa đơn
  temporarilyInvoices: (body: ITemporarilyInvoiceRequest) => {
    return fetch(urlsApi.invoice.temporarilyInvoice, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // lịch sử tiêu dùng thẻ
  historyUseCard: (id: number) => {
    return fetch(`${urlsApi.invoice.historyUseCard}?bcseId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy mã hoá đơn
  getInvoiceCode: (id: number) => {
    return fetch(`${urlsApi.invoice.invoiceCode}?productId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
