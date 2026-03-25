// FILE: src/services/CouponService.ts  (TẠO MỚI)

import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICouponListParams, ICouponRequest } from "model/coupon/CouponModel";

function cleanParams<T extends Record<string, any>>(p: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as Partial<T>;
}

const CouponService = {
  list: (params: ICouponListParams, signal?: AbortSignal) =>
    fetch(`${urlsApi.couponProgram.list}${convertParamsToString(cleanParams(params))}`, {
      signal, method: "GET",
    }).then(r => r.json()),

  get: (id: number, signal?: AbortSignal) =>
    fetch(`${urlsApi.couponProgram.get}?id=${id}`, { signal, method: "GET" }).then(r => r.json()),

  update: (body: ICouponRequest, signal?: AbortSignal) =>
    fetch(urlsApi.couponProgram.update, {
      signal, method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),

  delete: (id: number, signal?: AbortSignal) =>
    fetch(`${urlsApi.couponProgram.delete}?id=${id}`, { signal, method: "DELETE" }).then(r => r.json()),

  updateStatus: (id: number, status: number, signal?: AbortSignal) =>
    fetch(urlsApi.couponProgram.updateStatus, {
      signal, method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).then(r => r.json()),

  countByStatus: (status: number, signal?: AbortSignal): Promise<number> =>
    fetch(`${urlsApi.couponProgram.countByStatus}?status=${status}`, { signal, method: "GET" })
      .then(r => r.json()).then(res => res?.result ?? 0),

  sumUsed: (signal?: AbortSignal): Promise<number> =>
    fetch(urlsApi.couponProgram.sumUsed, { signal, method: "GET" })
      .then(r => r.json()).then(res => res?.result ?? 0),

  /**
   * Áp dụng mã coupon vào đơn hàng.
   * POST /bizapi/market/coupon/apply
   *
   * API trả về flat object (không wrap trong data/success):
   *   { code, orderAmount, discountAmount?, finalAmount?, discountType?, discountValue?, message? }
   * Nếu mã không hợp lệ API trả về lỗi HTTP (4xx) hoặc có field error/message.
   */
  apply: (code: string, orderAmount: number, signal?: AbortSignal) =>
    fetch(urlsApi.couponProgram.apply, {
      signal,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, orderAmount }),
    }).then(r => r.json()) as Promise<{
      // Flat response thực tế từ API
      code?: string;
      orderAmount?: number;
      discountAmount?: number;   // Số tiền được giảm (nếu API trả về)
      finalAmount?: number;      // Số tiền sau giảm (nếu API trả về)
      discountType?: number;     // 1 = %, 2 = fixed
      discountValue?: number;
      message?: string;
      error?: string;
      // Wrapper response (nếu API đổi format về sau)
      success?: boolean;
      data?: {
        code: string;
        discountAmount: number;
        finalAmount: number;
        orderAmount: number;
        discountType?: number;
        discountValue?: number;
        message?: string;
      };
    }>,
};

export default CouponService;