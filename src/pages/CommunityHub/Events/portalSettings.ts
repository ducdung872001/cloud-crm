// Portal config cho trang public /crm/events — banner ảnh, link click, ...
// Single source of truth: BE `/market/community-hub/portal-config` (admin POST
// upsert, anonymous GET đọc theo Hostname). Không cache LS — gọi API như mọi
// chức năng khác.

import { apiPost, apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export interface PortalSettings {
  /** URL ảnh banner hiển thị đầu trang /crm/events. Để trống → dùng hero
   *  default. Ảnh nên có text branding (VD "W.HOUSE — NÂNG TẦM GIÁ TRỊ SỐNG")
   *  để tránh trình duyệt auto-translate. */
  bannerImageUrl?: string;
  /** Link click vào banner — optional, để trống = không clickable. */
  bannerLinkUrl?: string;
}

function isApiOk(res: any): boolean {
  if (!res) return false;
  if (res.code === 0 || res.code === 200) return true;
  if (res.result !== undefined) return true;
  return false;
}

/** Parse `config` JSON string từ BE response thành PortalSettings. */
function parseConfig(raw: any): PortalSettings {
  if (!raw) return {};
  const cfg = raw.config ?? raw;
  if (typeof cfg === "string") {
    try { return JSON.parse(cfg) as PortalSettings; } catch { return {}; }
  }
  if (cfg && typeof cfg === "object") return cfg as PortalSettings;
  return {};
}

export const portalSettings = {
  /** Đọc config tenant hiện tại từ BE. */
  async getAsync(): Promise<PortalSettings> {
    try {
      const res = await apiGet(urlsApi.communityHubPortalConfig.getPublic, {});
      if (isApiOk(res)) return parseConfig(res?.result ?? res);
    } catch { /* ignore */ }
    return {};
  },

  /** Upsert config tenant (admin only). Trả ok/error để UI surface toast. */
  async setAsync(s: PortalSettings): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await apiPost(urlsApi.communityHubPortalConfig.upsert, {
        config: JSON.stringify(s),
      });
      if (isApiOk(res)) return { ok: true };
      const errMsg = (res && (res.error || res.message)) || "Máy chủ từ chối lưu cấu hình portal";
      return { ok: false, error: String(errMsg) };
    } catch {
      return { ok: false, error: "Không kết nối được máy chủ, vui lòng thử lại" };
    }
  },
};
