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
   * API trả về wrapped response:
   *   { code: 0, message: "OK", result: { code, discountType, discountValue, orderAmount, discountAmount, finalAmount, message } }
   */
  apply: (code: string, orderAmount: number, signal?: AbortSignal) =>
    fetch(urlsApi.couponProgram.apply, {
      signal,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, orderAmount }),
    }).then(r => r.json()) as Promise<{
      code: number;             // 0 = success, khác 0 = error
      message: string;          // "OK", "Áp dụng thành công", etc.
      result: {
        code: string;           // Mã coupon (ví dụ: "REBORN_SPA")
        discountType: number;   // 1 = %, 2 = fixed VNĐ
        discountValue: number;  // Giá trị giảm (%)
        orderAmount: number;    // Tổng đơn hàng
        discountAmount: number; // Số tiền được giảm (VNĐ)
        finalAmount: number;    // Tổng cộng sau giảm
        message: string;        // Thông báo kết quả
      };
    }>,
};

export default CouponService;