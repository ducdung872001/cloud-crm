import { urlsApi } from "configs/urls";

// ---- Response types từ API ----

/** Từ GET /logistics/carrier/list */
export interface ICarrierPartnerResponse {
  id: number;
  code: string;           // GHN | GHTK | VTP | JT | SPX | NJV
  name: string;           // Giao Hàng Nhanh
  shortName: string;
  avatar: string;
  baseFeeLabel: string;   // 20.000 - 25.000đ
  avgTimeLabel: string;   // 1-2 ngày
  rating: number;
  isActive: number;
  // Stats hôm nay (nullable — ngày đầu chưa có data)
  todayNewOrders: number | null;
  todayDeliveredCount: number | null;
  todayReturnedCount: number | null;
  todayTotalShippingFee: number | null;
}

/** Từ GET /integration/carrier/configs */
export interface ICarrierConfigResponse {
  id: number;
  carrierCode: string;
  isConnected: boolean;
  apiKeyMasked: string;   // ••••••••abcd
  hasToken: boolean;
  connectedAt: string | null;
}

/** Dữ liệu merge tại client — dùng trong UI */
export interface ICarrierPartnerMerged extends ICarrierPartnerResponse {
  isConnected: boolean;
  apiKeyMasked: string;
  hasToken: boolean;
  connectedAt: string | null;
  configId: number | null;
}

/** Body gửi lên khi kết nối */
export interface ICarrierConnectRequest {
  carrierCode: string;
  apiKey: string;
  token?: string;
}

// ---- Service ----

const ShippingPartnerService = {
  /**
   * Lấy danh sách hãng VC + stats hôm nay
   * GET /logistics/carrier/list
   */
  getCarrierList: (signal?: AbortSignal): Promise<any> => {
    return fetch(urlsApi.shippingPartner.carrierList, {
      method: "GET",
      signal,
    }).then((res) => res.json());
  },

  /**
   * Lấy trạng thái kết nối API key theo bsnId (từ JWT)
   * GET /integration/carrier/configs
   */
  getCarrierConfigs: (signal?: AbortSignal): Promise<any> => {
    return fetch(urlsApi.shippingPartner.carrierConfigs, {
      method: "GET",
      signal,
    }).then((res) => res.json());
  },

  /**
   * Kết nối / cập nhật API key hãng VC
   * POST /integration/carrier/connect
   */
  connectCarrier: (body: ICarrierConnectRequest): Promise<any> => {
    return fetch(urlsApi.shippingPartner.connect, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  /**
   * Ngắt kết nối hãng VC
   * DELETE /integration/carrier/disconnect?carrierCode=GHN
   */
  disconnectCarrier: (carrierCode: string): Promise<any> => {
    return fetch(`${urlsApi.shippingPartner.disconnect}?carrierCode=${carrierCode}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  /**
   * Merge dữ liệu logistics + integration thành một mảng dùng trong UI
   */
  mergeCarrierData: (
    carriers: ICarrierPartnerResponse[],
    configs: ICarrierConfigResponse[]
  ): ICarrierPartnerMerged[] => {
    const configMap = new Map<string, ICarrierConfigResponse>();
    configs.forEach((c) => configMap.set(c.carrierCode, c));

    return carriers.map((carrier) => {
      const config = configMap.get(carrier.code);
      return {
        ...carrier,
        isConnected: config?.isConnected ?? false,
        apiKeyMasked: config?.apiKeyMasked ?? "",
        hasToken: config?.hasToken ?? false,
        connectedAt: config?.connectedAt ?? null,
        configId: config?.id ?? null,
      };
    });
  },
};

export default ShippingPartnerService;
