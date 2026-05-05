// Settings cho portal sự kiện public (/crm/events) — banner ảnh, ...
// Lưu vào localStorage theo bsnId / hostname. Khi BE có endpoint riêng cho
// tenant settings thì migrate sang đó.

const KEY_PREFIX = "community-hub:events-portal:";

function tenantKey(): string {
  // bsnId có thể chưa load lúc gọi → fallback hostname (đủ unique cho W.HOUSE
  // hub.reborn.vn vs các tenant khác)
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

export const portalSettings = {
  get(): PortalSettings {
    return readJson<PortalSettings>("settings") ?? {};
  },
  set(s: PortalSettings): void {
    writeJson("settings", s);
  },
  patch(p: Partial<PortalSettings>): void {
    const next = { ...this.get(), ...p };
    this.set(next);
  },
};
