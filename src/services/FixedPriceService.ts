// FILE: src/services/FixedPriceService.ts

import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IFixedPriceProduct, IFixedPriceEntry } from "model/promotion/PromotionModel";

const FixedPriceService = {
  /** Lấy danh sách SP của 1 CT đồng giá */
  getProducts: (promotionId: number): Promise<{ code: number; result: IFixedPriceProduct[] }> =>
    fetch(`${urlsApi.fixedPricePromotion.getProducts}?promotionId=${promotionId}`, {
      method: "GET",
    }).then((r) => r.json()),

  /**
   * Lưu (replace) danh sách SP vào CT đồng giá.
   * Gửi toàn bộ danh sách mới — backend xóa list cũ rồi insert lại.
   */
  saveProducts: (
    promotionId: number,
    products: IFixedPriceProduct[]
  ): Promise<{ code: number; result: number }> =>
    fetch(
      `${urlsApi.fixedPricePromotion.saveProducts}?promotionId=${promotionId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(products),
      }
    ).then((r) => r.json()),

  /**
   * Lấy tất cả entry đồng giá đang active.
   * POS gọi khi load trang, cache trong state để lookup khi thêm SP vào giỏ.
   */
  getActiveEntries: (): Promise<{ code: number; result: IFixedPriceEntry[] }> =>
    fetch(urlsApi.fixedPricePromotion.activeEntries, {
      method: "GET",
    }).then((r) => r.json()),

  /** Xóa 1 SP khỏi danh sách đồng giá */
  deleteProduct: (id: number): Promise<{ code: number; result: number }> =>
    fetch(`${urlsApi.fixedPricePromotion.deleteProduct}?id=${id}`, {
      method: "DELETE",
    }).then((r) => r.json()),
};

export default FixedPriceService;
