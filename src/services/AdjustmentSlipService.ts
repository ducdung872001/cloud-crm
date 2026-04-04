import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IAddUpdateProRequest,
  IAdjustmentSlipFilterRequest,
  IAdjustmentSlipRequest,
  IWarehouseProFilterRequest,
} from "model/adjustmentSlip/AdjustmentSlipRequestModel";

export default {
  list: (params?: IAdjustmentSlipFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.adjustmentSlip.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  temp: (inventoryId: number) => {
    return fetch(`${urlsApi.adjustmentSlip.temp}?inventoryId=${inventoryId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  addUpdatePro: (body: IAddUpdateProRequest) => {
    return fetch(urlsApi.adjustmentSlip.addUpdatePro, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deletePro: (id: number) => {
    return fetch(`${urlsApi.adjustmentSlip.deletePro}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  warehouse: (params: IWarehouseProFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // đoạn này dùng để tạo phiếu chính thức
  createAdjSlip: (body: IAdjustmentSlipRequest) => {
    return fetch(urlsApi.adjustmentSlip.createAdjSlip, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
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