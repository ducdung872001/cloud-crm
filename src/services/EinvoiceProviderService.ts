/**
 * EinvoiceProviderService
 * Theo pattern của VatInvoiceService / fetchSinvoiceLogs trong project
 */

const PREFIX = "/bizapi/integration/einvoice";

export interface ProviderItem {
  id: number;
  code: string;
  name: string;
  logoText: string;
  logoColor: string;
  description: string;
  tags: string | string[];
  baseUrl: string;
  authType: string;
  isActive: number;
  sortOrder: number;
  // config của bsnId (null nếu chưa cấu hình)
  configId: number | null;
  username: string | null;
  taxCode: string | null;
  endpointUrl: string | null;
  serialNo: string | null;
  templateCode: string | null;
  configActive: number | null;   // 1 = NCC đang được chọn
  lastTestAt: string | null;
  lastTestStatus: "success" | "error" | "pending" | null;
  lastTestMessage: string | null;
}

export interface EinvoiceConfigRequest {
  configId: number | null;
  providerId: number;
  providerCode: string;
  username: string;
  password: string;
  taxCode: string;
  endpointUrl: string;
  serialNo: string;
  templateCode: string;
}

const EinvoiceProviderService = {
  /**
   * Lấy danh sách NCC + config hiện tại của bsnId
   * GET /bizapi/integration/einvoice/providers
   */
  listProviders: (): Promise<ProviderItem[]> => {
    return fetch(`${PREFIX}/providers`, { method: "GET" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.code === 0 && Array.isArray(json.result)) return json.result as ProviderItem[];
        return [];
      })
      .catch(() => []);
  },

  /**
   * Lưu & kết nối NCC được chọn
   * POST /bizapi/integration/einvoice/config/save
   */
  saveConfig: (body: EinvoiceConfigRequest): Promise<{ ok: boolean; message?: string }> => {
    return fetch(`${PREFIX}/config/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((json) => ({ ok: json?.code === 0, message: json?.message }))
      .catch((e) => ({ ok: false, message: e?.message ?? "Lỗi kết nối" }));
  },

  /**
   * Kiểm tra kết nối (không lưu credential)
   * POST /bizapi/integration/einvoice/config/test
   */
  testConnection: (body: EinvoiceConfigRequest): Promise<{ success: boolean; message: string }> => {
    return fetch(`${PREFIX}/config/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json?.code === 0 && json.result?.success) {
          return { success: true, message: json.result.message ?? "Kết nối thành công. Cổng CQT phản hồi bình thường." };
        }
        return { success: false, message: json?.result?.message ?? json?.message ?? "Kết nối thất bại." };
      })
      .catch((e) => ({ success: false, message: e?.message ?? "Lỗi kết nối" }));
  },
};

export default EinvoiceProviderService;
