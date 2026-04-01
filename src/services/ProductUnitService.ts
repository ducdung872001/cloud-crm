import { urlsApi } from "configs/urls";

export interface IProductUnit {
  id?: number;
  productId?: number;
  unitId: number | null;
  unitName?: string;
  isBasis: number;   // 1 = cơ bản, 0 = quy đổi
  exchange: number;  // tỷ lệ quy đổi so với đơn vị cơ bản
  createdTime?: string;
  updatedTime?: string;
}

export default {
  // GET /inventory/unitExchange/listByProduct?productId=xxx
  listByProduct: (productId: number) => {
    return fetch(`${urlsApi.unitExchange.listByProduct}?productId=${productId}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // POST /inventory/unitExchange/update  (insert nếu id null, update nếu có id)
  update: (unit: IProductUnit) => {
    return fetch(urlsApi.unitExchange.update, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unit),
    }).then((res) => res.json());
  },

  // DELETE /inventory/unitExchange/delete?id=xxx
  delete: (id: number) => {
    return fetch(`${urlsApi.unitExchange.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
