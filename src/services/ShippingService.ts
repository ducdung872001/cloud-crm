import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IShippingOrderFilterRequest,
  IShippingOrderCreateRequest,
  IShippingBulkActionRequest,
} from "model/shipping/ShippingRequestModel";

export default {
  // Danh sách / lọc đơn vận chuyển
  filter: (params: IShippingOrderFilterRequest, signal?: AbortSignal) => {
      return fetch(`${urlsApi.shipping.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // Chi tiết đơn vận chuyển
  tracking: (id: string) => {
    return fetch(`${urlsApi.shipping.shipment}/${id}/tracking`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // Tạo đơn vận chuyển
  create: (body: IShippingOrderCreateRequest) => {
    return fetch(urlsApi.shipping.create, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Cập nhật đơn vận chuyển
  // update: (body: IShippingOrderCreateRequest) => {
  //   return fetch(urlsApi.shipping.update, {
  //     method: "PUT",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  // Hủy đơn vận chuyển
  cancel: (id: string) => {
    return fetch(`${urlsApi.shipping.shipment}/${id}/cancel`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // Đẩy đơn sang hãng vận chuyển
  // push: (id: number) => {
  //   return fetch(`${urlsApi.shipping.push}?id=${id}`, {
  //     method: "POST",
  //   }).then((res) => res.json());
  // },

  // Đẩy nhiều đơn hàng loạt
  // pushBulk: (body: IShippingBulkActionRequest) => {
  //   return fetch(urlsApi.shipping.pushBulk, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  // In mã vận đơn
  // printLabel: (id: number) => {
  //   return fetch(`${urlsApi.shipping.printLabel}?id=${id}`, {
  //     method: "GET",
  //   }).then((res) => res.json());
  // },

  // In nhiều mã vận đơn hàng loạt
  // printLabelBulk: (body: IShippingBulkActionRequest) => {
  //   return fetch(urlsApi.shipping.printLabelBulk, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  // Đồng bộ trạng thái từ hãng vận chuyển
  // syncStatus: (id: number) => {
  //   return fetch(`${urlsApi.shipping.syncStatus}?id=${id}`, {
  //     method: "POST",
  //   }).then((res) => res.json());
  // },

  // Danh sách hãng vận chuyển đã kết nối
  // getCarriers: (signal?: AbortSignal) => {
  //   return fetch(urlsApi.shipping.carriers, {
  //     signal,
  //     method: "GET",
  //   }).then((res) => res.json());
  // },

  // Kết nối hãng vận chuyển
  // connectCarrier: (body: { carrierId: string; apiKey: string; token?: string }) => {
  //   return fetch(urlsApi.shipping.connectCarrier, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  // Ngắt kết nối hãng vận chuyển
  // disconnectCarrier: (carrierId: string) => {
  //   return fetch(`${urlsApi.shipping.disconnectCarrier}?carrierId=${carrierId}`, {
  //     method: "DELETE",
  //   }).then((res) => res.json());
  // },

  // Lấy cấu hình phí vận chuyển
  // getShippingFeeConfig: (signal?: AbortSignal) => {
  //   return fetch(urlsApi.shipping.feeConfig, {
  //     signal,
  //     method: "GET",
  //   }).then((res) => res.json());
  // },

  // Cập nhật cấu hình phí vận chuyển
  // updateShippingFeeConfig: (body: any) => {
  //   return fetch(urlsApi.shipping.feeConfig, {
  //     method: "PUT",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  // Tính phí trước khi tạo đơn
  // estimateFee: (body: { carrierId: string; weightGram: number; province: string }) => {
  //   return fetch(urlsApi.shipping.estimateFee, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  districts: (id: number) => {
    return fetch(`${urlsApi.shipping.districts}?provinceId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  wards: (id: number) => {
    return fetch(`${urlsApi.shipping.wards}?districtId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  provinces: () => {
    return fetch(`${urlsApi.shipping.provinces}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};

// Map status UI → statusCode API
// UI: pending | in_transit | delivered | returned | cancelled
// API: SUBMITTED | PENDING | IN_TRANSIT | DELIVERED | RETURNED | CANCELLED
export const STATUS_MAP: Record<string, string> = {
  pending:    "PENDING",
  in_transit: "IN_TRANSIT",
  delivered:  "DELIVERED",
  returned:   "RETURNED",
  cancelled:  "CANCELLED",
  submitted:  "SUBMITTED",
};

// Map ngược: statusCode API → key UI (dùng khi render badge)
export const STATUS_CODE_TO_UI: Record<string, string> = {
  SUBMITTED:  "pending",
  PENDING:    "pending",
  IN_TRANSIT: "in_transit",
  DELIVERED:  "delivered",
  RETURNED:   "returned",
  CANCELLED:  "cancelled",
};