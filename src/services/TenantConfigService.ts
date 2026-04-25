// [CH] Community Hub - Cấu hình toàn cục tenant
// Mock: lưu localStorage. Sau thay bằng API: GET/POST /tenant/config

export interface ITenantConfig {
  // ── Phân hệ Kho ──
  warehouse_enabled: boolean;           // Bật/tắt phân hệ Kho & NVL
  warehouse_auto_deduct: boolean;       // Tự động trừ kho khi bán hàng (nếu warehouse_enabled = true)

  // ── Hóa đơn điện tử ──
  einvoice_enabled: boolean;            // Có sử dụng HĐ điện tử không
  einvoice_auto_issue: boolean;         // Tự động xuất HĐĐT sau khi hoàn thành đơn
  einvoice_provider: string;            // Nhà cung cấp HĐĐT (viettel, vnpt, bkav, fpt, ...)

  // ── Quản lý thành viên ──
  membership_enabled: boolean;          // Bật/tắt quản lý thẻ thành viên & gói
  loyalty_enabled: boolean;             // Bật/tắt tích điểm hội viên

  // ── Vận hành ──
  multi_branch: boolean;                // Có nhiều chi nhánh/cơ sở không
  shift_management: boolean;            // Bật/tắt quản lý ca làm việc
  accommodation_enabled: boolean;       // Bật/tắt phân hệ Lưu trú
}

const STORAGE_KEY = "ch_tenant_config";

const DEFAULT_CONFIG: ITenantConfig = {
  warehouse_enabled: true,
  warehouse_auto_deduct: true,
  einvoice_enabled: true,
  einvoice_auto_issue: false,       // mặc định: thủ công
  einvoice_provider: "",
  membership_enabled: true,
  loyalty_enabled: true,
  multi_branch: false,
  shift_management: true,
  accommodation_enabled: true,
};

const TenantConfigService = {
  /** Lấy cấu hình hiện tại (từ localStorage, sau thay API) */
  get: (): ITenantConfig => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch { /* silent */ }
    return { ...DEFAULT_CONFIG };
  },

  /** Lưu cấu hình (vào localStorage, sau thay API POST) */
  save: (config: Partial<ITenantConfig>): Promise<{ code: number }> => {
    return new Promise((resolve) => {
      const current = TenantConfigService.get();
      const merged = { ...current, ...config };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      resolve({ code: 0 });
    });
  },

  /** Reset về mặc định */
  reset: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  /** Kiểm tra nhanh 1 key */
  is: (key: keyof ITenantConfig): boolean => {
    return !!TenantConfigService.get()[key];
  },
};

export default TenantConfigService;
