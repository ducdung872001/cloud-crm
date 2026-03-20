import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IReturnInvoiceListParams,
  ICreateReturnRequest,
  ICreateExchangeRequest,
} from "@/types/returnProduct";

export default {
  /** Danh sách phiếu trả / đổi hàng */
  list: (params?: IReturnInvoiceListParams, signal?: AbortSignal) => {
    return fetch(`${urlsApi.returnInvoice.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /** Chi tiết 1 phiếu */
  detail: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.returnInvoice.detail}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /**
   * Bước 1 của auto-fill: Tìm hóa đơn gốc theo mã invoice code
   * Gọi API list với invoiceCode filter + invoiceTypes IV1 (chỉ HĐ bán hàng)
   *
   * GET /sales/invoice/list/v2?invoiceCode={code}&invoiceTypes=["IV1"]&page=0&limit=1
   */
  findByCode: (invoiceCode: string, signal?: AbortSignal) => {
    const params = {
      invoiceCode: invoiceCode.trim(),
      invoiceTypes: JSON.stringify(["IV1"]),
      page: 0,
      limit: 1,
    };
    return fetch(`${urlsApi.invoice.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /**
   * Bước 2 của auto-fill: Lấy items còn được phép trả từ HĐ gốc (theo invoiceId)
   * Response: InvoiceReturnItem {
   *   invoice: Invoice,
   *   lstBoughtProduct: BoughtProductResponse[],
   *   lstBoughtService: BoughtServiceResponse[],
   *   lstBoughtCardService: BoughtCardServiceResponse[]
   * }
   *
   * GET /sales/invoice/get/return?id={invoiceId}
   */
  getReturnItems: (originalInvoiceId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.returnInvoice.getReturnItems}?id=${originalInvoiceId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /** Tạo phiếu trả hàng (IV2) */
  createReturn: (body: ICreateReturnRequest) => {
    return fetch(urlsApi.returnInvoice.createReturn, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  /** Tạo phiếu đổi hàng (IV11) */
  createExchange: (body: ICreateExchangeRequest) => {
    return fetch(urlsApi.returnInvoice.createExchange, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
