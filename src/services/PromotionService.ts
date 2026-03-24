// =====================================================================
// FILE: src/services/PromotionService.ts
// =====================================================================

import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IPromotionListParams, IPromotionRequest } from "model/promotion/PromotionModel";

/**
 * Lọc object: bỏ các key có value là undefined, null, hoặc chuỗi rỗng ""
 * Giữ lại số 0 và -1 (status=-1 là hợp lệ, có nghĩa "tất cả")
 */
function cleanParams<T extends Record<string, any>>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as Partial<T>;
}

const PromotionService = {

  /**
   * Danh sách chương trình khuyến mãi (phân trang + filter)
   * BE: GET /market/promotion/list
   */
  list: (params: IPromotionListParams, signal?: AbortSignal) =>
    fetch(`${urlsApi.promotionalProgram.list}${convertParamsToString(cleanParams(params))}`, {
      signal,
      method: "GET",
    }).then((r) => r.json()),

  /**
   * Danh sách đang active – dùng cho POS / bán hàng
   * BE: GET /market/promotion/list-active
   */
  listActive: (
    params: { mode?: number; page?: number; sizeLimit?: number },
    signal?: AbortSignal
  ) =>
    fetch(`${urlsApi.promotionalProgram.listActive}${convertParamsToString(cleanParams(params))}`, {
      signal,
      method: "GET",
    }).then((r) => r.json()),

  /**
   * Chi tiết 1 chương trình
   * BE: GET /market/promotion/get?id=xxx
   */
  get: (id: number, signal?: AbortSignal) =>
    fetch(`${urlsApi.promotionalProgram.get}?id=${id}`, {
      signal,
      method: "GET",
    }).then((r) => r.json()),

  /**
   * Tạo mới hoặc cập nhật chương trình
   * BE: POST /market/promotion/update
   *   body.id null/0 → INSERT
   *   body.id > 0    → UPDATE
   */
  update: (body: IPromotionRequest, signal?: AbortSignal) =>
    fetch(urlsApi.promotionalProgram.update, {
      signal,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  /**
   * Xóa chương trình
   * BE: DELETE /market/promotion/delete?id=xxx
   */
  delete: (id: number, signal?: AbortSignal) =>
    fetch(`${urlsApi.promotionalProgram.delete}?id=${id}`, {
      signal,
      method: "DELETE",
    }).then((r) => r.json()),

  /**
   * Đếm theo trạng thái – dùng cho stat cards
   * BE: GET /market/promotion/count-by-status?status=xxx
   *   status: -1=tất cả, 0=Chờ duyệt, 1=Đang chạy, 2=Hết hạn, 99=Sắp diễn ra
   */
  countByStatus: (status: number, signal?: AbortSignal): Promise<number> =>
    fetch(`${urlsApi.promotionalProgram.countByStatus}?status=${status}`, {
      signal,
      method: "GET",
    })
      .then((r) => r.json())
      .then((res) => res?.result ?? 0),
};

export default PromotionService;