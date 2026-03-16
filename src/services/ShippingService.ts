import { IShippingOrderCreateRequest } from "@/model/shipping/ShippingRequestModel";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  // ─── Danh sách vận đơn ─────────────────────────────────────
  list: (params: any) => {
    return fetch(`${urlsApi.shipping}/orders${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // ─── Chi tiết vận đơn ──────────────────────────────────────
  detail: (id: number) => {
    return fetch(`${urlsApi.shipping}/orders/${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  create: (body: IShippingOrderCreateRequest) => {
    return fetch(urlsApi.shipping.create, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // ─── Cập nhật đơn vận chuyển ───────────────────────────────
  update: (id: number, data: any) => {
    return fetch(`${urlsApi.shipping}/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  // ─── Hủy đơn vận chuyển ────────────────────────────────────
  cancel: (id: number) => {
    return fetch(`${urlsApi.shipping}/orders/${id}/cancel`, {
      method: "PATCH",
    }).then((res) => res.json());
  },

  // ─── Đẩy đơn sang hãng vận chuyển ─────────────────────────
  push: (id: number) => {
    return fetch(`${urlsApi.shipping}/orders/${id}/push`, {
      method: "POST",
    }).then((res) => res.json());
  },

  // ─── Đẩy nhiều đơn hàng loạt ──────────────────────────────
  pushBulk: (ids: number[]) => {
    return fetch(`${urlsApi.shipping}/orders/push-bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    }).then((res) => res.json());
  },

  // ─── Đồng bộ trạng thái từ hãng (Webhook manual) ──────────
  syncStatus: (id: number) => {
    return fetch(`${urlsApi.shipping}/orders/${id}/sync`, {
      method: "POST",
    }).then((res) => res.json());
  },

  // ─── In mã vận đơn ─────────────────────────────────────────
  printLabel: (id: number) => {
    return fetch(`${urlsApi.shipping}/orders/${id}/print-label`, {
      method: "GET",
    }).then((res) => res.json());   // hoặc res.blob() nếu trả về file PDF
  },

  // ─── In nhiều mã vận đơn ───────────────────────────────────
  printLabelBulk: (ids: number[]) => {
    return fetch(`${urlsApi.shipping}/orders/print-label-bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    }).then((res) => res.json());   // hoặc res.blob() tùy response
  },

  // ─── Danh sách hãng vận chuyển đã kết nối ─────────────────
  getCarriers: () => {
    return fetch(`${urlsApi.shipping}/carriers`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // ─── Kết nối hãng vận chuyển ───────────────────────────────
  connectCarrier: (carrierId: string, credentials: { apiKey: string; token?: string }) => {
    return fetch(`${urlsApi.shipping}/carriers/${carrierId}/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }).then((res) => res.json());
  },

  // ─── Ngắt kết nối hãng vận chuyển ─────────────────────────
  disconnectCarrier: (carrierId: string) => {
    return fetch(`${urlsApi.shipping}/carriers/${carrierId}/connect`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // ─── Cấu hình phí vận chuyển ───────────────────────────────
  getShippingFeeConfig: () => {
    return fetch(`${urlsApi.shipping}/fee-config`, {
      method: "GET",
    }).then((res) => res.json());
  },

  updateShippingFeeConfig: (data: any) => {
    return fetch(`${urlsApi.shipping}/fee-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  // ─── Tính phí trước khi tạo đơn ───────────────────────────
  estimateFee: (data: { carrierId: string; weightGram: number; province: string }) => {
    return fetch(`${urlsApi.shipping}/estimate-fee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
};