// Settings cho portal sự kiện public (/crm/events) — banner ảnh, ...
//
// Yc tester 2026-05-06: trước đây chỉ lưu localStorage theo hostname → admin
// sửa banner máy A, máy B/admin khác không thấy. BE-1 đã thêm endpoint
// `/market/community-hub/portal-config/{public,upsert}` ở cloud-market-master
// → swap sang API-first, giữ LS làm cache (đọc nhanh khi load page +
// fallback offline).

import EventService from "services/EventService";
import { apiPost, apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

const KEY_PREFIX = "community-hub:events-portal:";

function tenantKey(): string {
  if (typeof window === "undefined") return "default";
  const host = window.location.hostname || "default";
  return host;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${tenantKey()}:${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, val: T | null): void {
  try {
    const k = `${KEY_PREFIX}${tenantKey()}:${key}`;
    if (val == null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(val));
  } catch { /* ignore quota errors */ }
}

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

/**
 * Parse `config` JSON string từ BE response thành PortalSettings.
 * BE schema loose — FE tự define key.
 */
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
  /** Đọc từ LS (sync, dùng cho first paint). Caller nên gọi getAsync để sync với BE. */
  get(): PortalSettings {
    return readJson<PortalSettings>("settings") ?? {};
  },

  /** Set local + push lên BE (best-effort, fail vẫn giữ LS). */
  set(s: PortalSettings): void {
    writeJson("settings", s);
    // Fire-and-forget upsert — admin context (cần JWT). Public page không
    // gọi set(), chỉ admin EventListPage.
    apiPost(urlsApi.communityHubPortalConfig.upsert, { config: JSON.stringify(s) })
      .catch((err) => console.warn("[portalSettings] BE upsert fail, LS giữ làm cache:", err));
  },

  patch(p: Partial<PortalSettings>): void {
    const next = { ...this.get(), ...p };
    this.set(next);
  },

  /**
   * Fetch BE → cache LS → return. Public page (anonymous) gọi để hiển thị
   * banner mới nhất từ BE. Fail → fallback LS (đỡ trống).
   */
  async getAsync(): Promise<PortalSettings> {
    try {
      const res = await apiGet(urlsApi.communityHubPortalConfig.getPublic, {});
      if (isApiOk(res)) {
        const parsed = parseConfig(res?.result ?? res);
        writeJson("settings", parsed);
        return parsed;
      }
    } catch { /* fallback LS */ }
    return this.get();
  },
};
