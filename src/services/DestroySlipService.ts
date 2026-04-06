import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


/**
 * Service cho Phiếu xuất hủy
 * Dùng StockAdjust với adjustType = "DESTROY" trên backend
 */
export default {
  list: (params?: Record<string, any>, signal?: AbortSignal) => {
    return apiGet(urlsApi.destroySlip.list, params, signal);
  },

  // GET /stockAdjust/destroy/temp?inventoryId=:id
  // Tạo/lấy phiếu tạm cho phiếu xuất hủy theo kho
  temp: (inventoryId: number) => {
    return fetch(`${urlsApi.destroySlip.temp}?inventoryId=${inventoryId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // POST /stockAdjust/destroy/create
  // Lên phiếu xuất hủy chính thức
  create: (body: { id: number; inventoryId: number; note?: string }) => {
    return apiPost(urlsApi.destroySlip.create, body);
  },

  // POST /stockAdjustDetail/update — thêm/sửa 1 dòng sản phẩm (reuse từ AdjustmentSlip)
  addUpdatePro: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.destroySlip.addUpdatePro, body);
  },

  // DELETE /stockAdjustDetail/delete?id=:id
  deletePro: (id: number) => {
    return apiDelete(`${urlsApi.destroySlip.deletePro}?id=${id}`);
  },

  // GET /stockAdjust/view?id=:id — xem chi tiết phiếu (dùng khi edit)
  view: (id: number) => {
    return fetch(`${urlsApi.destroySlip.view}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // GET /stockAdjust/get?id=:id — lấy thông tin header phiếu xuất hủy
  get: (id: number) => {
    return fetch(`${urlsApi.destroySlip.get}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // GET /stockAdjust/approved?id=:id — xác nhận phiếu xuất hủy
  approved: (id: number) => {
    return fetch(`${urlsApi.destroySlip.approved}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  cancel: (id: number) => {
    return fetch(`${urlsApi.destroySlip.cancel}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
