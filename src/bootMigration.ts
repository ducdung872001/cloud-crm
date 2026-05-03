// Boot migration — chạy 1 lần/browser để dọn state stale từ phiên cũ.
// Trigger: nhánh mentorhub gặp 401 loop sau SSO ở browser thông thường (incognito ok)
// — chỉ rã bằng cách xoá triệt để cookies + localStorage + service workers.
// Bump MIGRATION_VERSION khi cần force reset cho toàn bộ user.

const MIGRATION_VERSION = "2026-05-03-mentorhub-401-reset";
const FLAG_KEY = "bootMigrationVersion";

function getRootDomain(): string {
  const host = location.hostname;
  if (host === "localhost") return "localhost";
  // *.reborn.vn → .reborn.vn ; fallback giữ nguyên
  const parts = host.split(".");
  if (parts.length >= 2) return "." + parts.slice(-2).join(".");
  return host;
}

function clearCookie(name: string, domain: string) {
  // Xoá cookie trên cả path / và mọi domain candidate (root + current host).
  const expire = "expires=Thu, 01 Jan 1970 00:00:01 GMT";
  document.cookie = `${name}=; ${expire}; path=/; domain=${domain}`;
  document.cookie = `${name}=; ${expire}; path=/; domain=${location.hostname}`;
  document.cookie = `${name}=; ${expire}; path=/`;
}

export function runBootMigration(): void {
  try {
    if (localStorage.getItem(FLAG_KEY) === MIGRATION_VERSION) return;

    // 1. Dọn localStorage stale (SelectedRole, permissions từ tenant cũ).
    const stale = ["SelectedRole", "permissions", "user.root", "isBeauty", "logoOrganization"];
    for (const k of stale) localStorage.removeItem(k);

    // 2. Xoá cookies auth — buộc SSO re-login với token mới.
    const rootDomain = getRootDomain();
    clearCookie("token", rootDomain);
    clearCookie("user", rootDomain);

    // 3. Unregister mọi service worker (firebase-messaging-sw + bất kỳ SW cũ nào).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
    }

    localStorage.setItem(FLAG_KEY, MIGRATION_VERSION);
  } catch {
    // Best-effort — nếu localStorage bị block (private mode hiếm) thì bỏ qua.
  }
}
