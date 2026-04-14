// [FitPro] Tenant config (rebranded from Community Hub)
// Mock: lưu localStorage. Sau thay bằng API: GET/POST /tenant/config

export type TenantVertical = "community-hub" | "fitpro" | "generic";

export interface ITenantConfig {
  // ── Vertical / ngành ──
  vertical: TenantVertical;             // Định vị ngành nghề tenant
  brand_name: string;                   // Tên brand hiển thị (FitPro, Community Hub, ...)
  brand_tagline: string;                // Tagline hiển thị ở header/login

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
  accommodation_enabled: boolean;       // Bật/tắt phân hệ Lưu trú (FitPro: false)

  // ── FitPro-specific (Phase 3 modules) ──
  fp_network_tree_enabled: boolean;     // Network 7×7×7 multi-level
  fp_journey_tracker_enabled: boolean;  // 90-day journey tracker
  fp_body_metrics_enabled: boolean;     // Body metrics + Medlatec integration
  fp_sop_compliance_enabled: boolean;   // SOP compliance monitoring
  fp_cross_station_card: boolean;       // Thẻ liên thông cross-station
}

const STORAGE_KEY = "fitpro_tenant_config";

const DEFAULT_CONFIG: ITenantConfig = {
  // FitPro defaults
  vertical: "fitpro",
  brand_name: "FitPro",
  brand_tagline: "Trạm sạc siêu xe con người MF7",

  // FitPro không dùng warehouse (Herbalife hãng tự quản)
  warehouse_enabled: false,
  warehouse_auto_deduct: false,

  // HĐĐT vẫn dùng (hộ kinh doanh khai thuế)
  einvoice_enabled: true,
  einvoice_auto_issue: false,
  einvoice_provider: "",

  // Gói + điểm tích luỹ
  membership_enabled: true,
  loyalty_enabled: true,

  // Vận hành
  multi_branch: true,                   // FitPro là chuỗi nhiều trạm
  shift_management: false,              // Chỉ 6-9h sáng, ko cần ca
  accommodation_enabled: false,         // Không có lưu trú

  // FitPro modules bật mặc định
  fp_network_tree_enabled: true,
  fp_journey_tracker_enabled: true,
  fp_body_metrics_enabled: true,
  fp_sop_compliance_enabled: true,
  fp_cross_station_card: true,
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
