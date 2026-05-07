import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { EmbedWhitelistEntry } from "../db/types.js";

/**
 * Embed external content whitelist — chống XSS / leak.
 *
 * Pattern matching: `domainPattern` hỗ trợ:
 *   - exact: "notion.so"
 *   - subdomain wildcard: "*.notion.site"  (match a.notion.site nhưng không match notion.site)
 *
 * Resolve order khi validate URL:
 *   1. Tenant-specific whitelist nếu có
 *   2. Platform global whitelist
 */

export function listEntries(tenantId: string): EmbedWhitelistEntry[] {
  return Array.from(db.embedWhitelist.values())
    .filter((e) => e.tenantId === tenantId || e.tenantId === "PLATFORM")
    .filter((e) => e.enabled);
}

export function createEntry(input: Omit<EmbedWhitelistEntry, "id" | "createdAt">): EmbedWhitelistEntry {
  const id = "EMW-" + uuid().slice(0, 8);
  const entry: EmbedWhitelistEntry = { id, createdAt: new Date().toISOString(), ...input };
  db.embedWhitelist.set(id, entry);
  return entry;
}

export function deleteEntry(id: string): boolean {
  const e = db.embedWhitelist.get(id);
  if (!e) return false;
  if (e.tenantId === "PLATFORM") throw new Error("[embed] không xoá platform default");
  return db.embedWhitelist.delete(id);
}

export interface ValidateResult {
  allowed: boolean;
  matched?: EmbedWhitelistEntry;
  hostname: string;
  reason?: string;
}

export function validateUrl(url: string, tenantId: string): ValidateResult {
  let hostname = "";
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return { allowed: false, hostname: "", reason: "invalid URL" };
  }
  if (!hostname) return { allowed: false, hostname, reason: "missing hostname" };

  const entries = listEntries(tenantId);
  for (const e of entries) {
    if (matchPattern(hostname, e.domainPattern.toLowerCase())) {
      return { allowed: true, matched: e, hostname };
    }
  }
  return { allowed: false, hostname, reason: "domain không trong whitelist" };
}

function matchPattern(hostname: string, pattern: string): boolean {
  if (pattern === hostname) return true;
  if (pattern.startsWith("*.")) {
    const base = pattern.slice(2);
    return hostname.endsWith(`.${base}`);
  }
  return false;
}

export interface OEmbedMetadata {
  url: string;
  hostname: string;
  provider: EmbedWhitelistEntry["provider"];
  /** Thumbnail nếu detect được */
  thumbnailUrl?: string;
  /** Title parse được */
  title?: string;
  /** Đã verify Iframe-able */
  iframeAllowed: boolean;
}

/**
 * Extract metadata stub — production: gọi OEmbed endpoint của provider.
 * Stub: trả minimal info dựa pattern URL.
 */
export function extractOEmbed(url: string, tenantId: string): OEmbedMetadata | null {
  const r = validateUrl(url, tenantId);
  if (!r.allowed || !r.matched) return null;
  return {
    url,
    hostname: r.hostname,
    provider: r.matched.provider,
    iframeAllowed: r.matched.allowIframe,
    title: `(stub title from ${r.matched.provider})`,
    thumbnailUrl: r.matched.provider === "youtube" ? `https://img.youtube.com/vi/${extractYoutubeId(url)}/hqdefault.jpg` : undefined,
  };
}

function extractYoutubeId(url: string): string {
  const m = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return m ? m[1]! : "unknown";
}
