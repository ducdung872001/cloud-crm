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

  /**
   * Export danh sách hóa đơn ra file Excel (.xlsx).
   * Backend trả Base64 string (do framework wrap JSON) → FE decode → download.
   */
  exportExcel: async (
    params: IInvoiceFilterRequest,
    signal?: AbortSignal
  ): Promise<void> => {
    // Loại bỏ param phân trang — backend export không cần
    const { page, limit, ...exportParams } = params;

    const res = await fetch(
      `${urlsApi.invoice.export}${convertParamsToString(exportParams)}`,
      { signal, method: "GET" }
    );

    const json = await res.json();

    if (!res.ok || json.code !== 0) {
      throw new Error(json.message || `Export thất bại (HTTP ${res.status})`);
    }

    // json.result là Base64 string của file .xlsx
    const base64: string = json.result;
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");

    const today = new Date();
    const dd    = String(today.getDate()).padStart(2, "0");
    const mm    = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy  = today.getFullYear();
    a.download  = `DanhSachHoaDon_${dd}${mm}${yyyy}.xlsx`;
    a.href      = url;

    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  createInvoice: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.invoice.createInvoice}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  invoiceDetail: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.invoice.invoiceDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Xem chi tiết hóa đơn
  listInvoiceDetail: (id: number) => {
    return fetch(`${urlsApi.invoice.invoiceDetailList}?id=${id}`, {
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
    return fetch(`${urlsApi.invoice.invoiceDetailCustomer}?customerId=${id}${invoiceId ? `&id=${invoiceId}` : ""}`, {
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
  importUpdate: (body: Record<string, any>) => {
    return fetch(urlsApi.invoiceImport.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  importGet: (id: number) => {
    return fetch(`${urlsApi.invoiceImport.get}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  importList: (params?: Record<string, any>) => {
    return fetch(`${urlsApi.invoiceImport.list}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  importApprove: (invoiceId: number) => {
    return fetch(`${urlsApi.invoiceImport.approve}?invoiceId=${invoiceId}`, {
      method: "POST",
    }).then((res) => res.json());
  },
  importCancel: (invoiceId: number) => {
    return fetch(`${urlsApi.invoiceImport.cancel}?invoiceId=${invoiceId}`, {
      method: "POST",
    }).then((res) => res.json());
  },
  // KPI summary cho tab Phiếu nhập — 1 call lấy đủ tổng tất cả trạng thái
  // GET /invoice/import/summary
  // Response: { totalSlip, totalAmount, completed, pending, cancelled }
  importSummary: (signal?: AbortSignal) => {
    return fetch(urlsApi.invoiceImport.summary, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

};