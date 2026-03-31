import { urlsApi } from "configs/urls";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IRegionFeeDTO {
  id?: number;
  regionName: string;
  fee: number;           // VND
  deliveryDays: number;
  freeShipThreshold: number; // 0 = không áp dụng
  sortOrder?: number;
}

export interface IOrderValueFeeDTO {
  id?: number;
  minOrderValue: number;
  maxOrderValue: number | null; // null = không giới hạn
  fee: number;                  // 0 = miễn ship
  deliveryDays: number;
}

export interface IShippingFeeConfigResponse {
  regionFees: IRegionFeeDTO[];
  orderValueFees: IOrderValueFeeDTO[];
}

export interface IShippingFeeConfigSaveRequest {
  regionFees: IRegionFeeDTO[];
  orderValueFees: IOrderValueFeeDTO[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

const ShippingFeeConfigService = {
  /**
   * Lấy cấu hình phí ship hiện tại của bsnId (từ JWT)
   * GET /logistics/fee-config
   */
  get: (signal?: AbortSignal): Promise<any> =>
    fetch(urlsApi.shippingFeeConfig.get, { method: "GET", signal })
      .then((r) => r.json()),

  /**
   * Lưu cấu hình phí ship (replace all)
   * POST /logistics/fee-config/save
   */
  save: (body: IShippingFeeConfigSaveRequest): Promise<any> =>
    fetch(urlsApi.shippingFeeConfig.save, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  /**
   * Gợi ý phí ship khi tạo đơn hàng
   * GET /logistics/fee-config/suggest?provinceName=...&orderValue=...
   * Trả về: số VND (0 = miễn ship), null = không có rule nào match
   *
   * Dùng ở:
   *   - AddShippingOrder: khi chọn tỉnh nhận hàng → pre-fill shippingFee
   *   - Fanpage/TotalChat: khi lên đơn qua chat
   */
  suggest: (params: {
    provinceName?: string;
    orderValue?: number;
  }): Promise<any> => {
    const qs = new URLSearchParams();
    if (params.provinceName) qs.set("provinceName", params.provinceName);
    if (params.orderValue != null) qs.set("orderValue", String(params.orderValue));
    return fetch(`${urlsApi.shippingFeeConfig.suggest}?${qs.toString()}`, {
      method: "GET",
    }).then((r) => r.json());
  },
};

export default ShippingFeeConfigService;
