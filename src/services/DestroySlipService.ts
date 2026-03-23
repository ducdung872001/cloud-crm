import { urlsApi } from "configs/urls";

/**
 * Service cho Phiếu xuất hủy
 * Dùng StockAdjust với adjustType = "DESTROY" trên backend
 */
export default {

  // GET /stockAdjust/destroy/temp?inventoryId=:id
  // Tạo/lấy phiếu tạm cho phiếu xuất hủy theo kho
  temp: (inventoryId: number) => {
    return fetch(`${urlsApi.destroySlip.temp}?inventoryId=${inventoryId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // POST /stockAdjust/destroy/create
  // Lên phiếu xuất hủy chính thức
  create: (body: { id: number; inventoryId: number }) => {
    return fetch(urlsApi.destroySlip.create, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // POST /stockAdjustDetail/update — thêm/sửa 1 dòng sản phẩm (reuse từ AdjustmentSlip)
  addUpdatePro: (body: any) => {
    return fetch(urlsApi.destroySlip.addUpdatePro, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // DELETE /stockAdjustDetail/delete?id=:id
  deletePro: (id: number) => {
    return fetch(`${urlsApi.destroySlip.deletePro}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // GET /stockAdjust/view?id=:id — xem chi tiết phiếu (dùng khi edit)
  view: (id: number) => {
    return fetch(`${urlsApi.destroySlip.view}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
