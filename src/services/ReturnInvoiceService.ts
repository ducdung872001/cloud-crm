import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IReturnInvoiceListParams,
  ICreateReturnRequest,
  ICreateExchangeRequest,
} from "@/types/returnProduct";

/**
 * Service layer cho màn hình Đổi / Trả hàng
 *
 * API backend (cloud-sales):
 *   GET  /sales/invoice/return-exchange/list  — danh sách phiếu
 *   GET  /sales/invoice/get?id=X              — chi tiết 1 phiếu
 *   GET  /sales/invoice/get/return?id=X       — items có thể trả từ HĐ gốc
 *   POST /sales/invoice/create/return         — tạo phiếu trả hàng (IV2)
 *   POST /sales/invoice/create/exchange       — tạo phiếu đổi hàng (IV11)
 */
export default {
  /**
   * Danh sách phiếu trả / đổi hàng
   * returnType: 1=Trả hàng | 2=Đổi hàng | undefined=Tất cả
   */
  list: (params?: IReturnInvoiceListParams, signal?: AbortSignal) => {
    return fetch(`${urlsApi.returnInvoice.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /**
   * Chi tiết 1 phiếu trả / đổi hàng
   */
  detail: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.returnInvoice.detail}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /**
   * Lấy danh sách sản phẩm / dịch vụ còn được phép trả từ HĐ gốc
   * Dùng để pre-populate form khi nhập mã đơn hàng gốc
   */
  getReturnItems: (originalInvoiceId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.returnInvoice.getReturnItems}?id=${originalInvoiceId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /**
   * Tạo phiếu trả hàng (invoice_type = IV2, return_type = 1)
   */
  createReturn: (body: ICreateReturnRequest) => {
    return fetch(urlsApi.returnInvoice.createReturn, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  /**
   * Tạo phiếu đổi hàng (invoice_type = IV11, return_type = 2)
   * Có thể kèm exchangeInvoice (IV1) nếu có sản phẩm đổi mới
   */
  createExchange: (body: ICreateExchangeRequest) => {
    return fetch(urlsApi.returnInvoice.createExchange, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
