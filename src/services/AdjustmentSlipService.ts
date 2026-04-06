import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  IAddUpdateProRequest,
  IAdjustmentSlipFilterRequest,
  IAdjustmentSlipRequest,
  IWarehouseProFilterRequest,
} from "model/adjustmentSlip/AdjustmentSlipRequestModel";

export default {
  list: (params?: IAdjustmentSlipFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.adjustmentSlip.list, params, signal);
  },
  temp: (inventoryId: number) => {
    return fetch(`${urlsApi.adjustmentSlip.temp}?inventoryId=${inventoryId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  addUpdatePro: (body: IAddUpdateProRequest) => {
    return apiPost(urlsApi.adjustmentSlip.addUpdatePro, body);
  },
  deletePro: (id: number) => {
    return apiDelete(`${urlsApi.adjustmentSlip.deletePro}?id=${id}`);
  },
  warehouse: (params: IWarehouseProFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.product.list, params, signal);
  },
  // đoạn này dùng để tạo phiếu chính thức
  createAdjSlip: (body: IAdjustmentSlipRequest) => {
    return apiPost(urlsApi.adjustmentSlip.createAdjSlip, body);
  },
  // xem chi tiết phiếu
  view: (id: number) => {
    return fetch(`${urlsApi.adjustmentSlip.view}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // duyệt phiếu điều chỉnh kho
  approved: (id: number) => {
    return fetch(`${urlsApi.adjustmentSlip.approved}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  exportCheck: (params?: { inventoryId?: number; keyword?: string; status?: number }, signal?: AbortSignal): Promise<string> => {
    const qs = new URLSearchParams();
    if (params?.inventoryId !== undefined) qs.set("inventoryId", String(params.inventoryId));
    if (params?.keyword)                   qs.set("keyword",     params.keyword);
    if (params?.status !== undefined)      qs.set("status",      String(params.status));
    return fetch(`${urlsApi.adjustmentSlip.export}${qs.toString() ? "?" + qs.toString() : ""}`, { method: "GET", signal })
      .then(async r => { const j = await r.json(); if (j.code !== 0) throw new Error(j.message ?? "Xuất Excel thất bại"); return j.result as string; });
  },
  // từ chối điều chỉnh kho
  cancel: (id: number) => {
    return fetch(`${urlsApi.adjustmentSlip.cancel}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};