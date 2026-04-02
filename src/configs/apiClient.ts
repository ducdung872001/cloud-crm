// ═══════════════════════════════════════════════════════════════════════
// CRM BANKING – API Client (fetch interceptor)
// Port từ retail fetchConfig.ts: inject Bearer token, route URL prefix
// ═══════════════════════════════════════════════════════════════════════

const prefixAdmin = "/adminapi";
const prefixBiz   = "/bizapi";
const prefixAuth  = "/authenticator";
const prefixBpm   = "/bpmapi";  // sẽ được replace bởi APP_BPM_URL

/** Đọc token từ cookie (giống getCookie trong reborn-util) */
function getToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Đọc selected role từ localStorage */
function getSelectedRole(): string | null {
  return localStorage.getItem("SelectedRole");
}

/** Helper: chuyển object params → query string */
export function toQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!filtered.length) return "";
  return "?" + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

/** Resolve relative URL → absolute, inject correct base URL per prefix */
function resolveUrl(url: string): string {
  if (url.startsWith("http")) return url;

  const appApiUrl   = process.env.APP_API_URL   || "";
  const appAdminUrl = process.env.APP_ADMIN_URL  || appApiUrl;
  const appBizUrl   = process.env.APP_BIZ_URL    || appApiUrl;
  const appBpmUrl   = process.env.APP_BPM_URL    || "";
  const appAuthUrl  = process.env.APP_AUTHENTICATOR_URL || appApiUrl;

  if (url.startsWith(prefixBiz))   return appBizUrl  + url.replace(prefixBiz, "");
  if (url.startsWith(prefixAdmin)) return appAdminUrl + url;
  if (url.startsWith(prefixBpm))   return appBpmUrl   + url;
  if (url.startsWith(prefixAuth))  return appAuthUrl  + url;
  return appApiUrl + url;
}

/** Core fetch wrapper with auth headers injected */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token       = getToken();
  const role        = getSelectedRole();
  const isPublic    = url.includes("/public/");
  const isFormData  = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !isPublic) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (token && role && !isPublic) {
    headers["Selectedrole"] = role;
  }

  // Hostname header (như retail)
  headers["Hostname"] = window.location.hostname || "";

  const resolvedUrl = resolveUrl(url);

  const response = await fetch(resolvedUrl, {
    ...options,
    headers,
  });

  // 401 → clear session
  if (response.status === 401) {
    document.cookie = "token=; Max-Age=0; path=/";
    document.cookie = "user=; Max-Age=0; path=/";
    localStorage.removeItem("permissions");
    window.location.href = "/login";
  }

  if (!response.ok && response.status !== 200) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err?.message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/** GET helper */
export const apiGet = <T = any>(url: string, params?: Record<string, any>, signal?: AbortSignal) =>
  apiFetch<T>(url + toQueryString(params), { method: "GET", signal });

/** POST helper */
export const apiPost = <T = any>(url: string, body?: any) =>
  apiFetch<T>(url, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) });

/** DELETE helper */
export const apiDelete = <T = any>(url: string, params?: Record<string, any>) =>
  apiFetch<T>(url + toQueryString(params), { method: "DELETE" });
