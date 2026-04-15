// Persistence layer — localStorage cho MVP. Khi có BE: thay bằng API calls,
// giữ nguyên signature các hàm export bên dưới.

import type { TaxpayerProfile, TaxDeclaration } from "../domain/types";

const KEY_PROFILE = "reborn.tax.profile";
const KEY_DECLARATIONS = "reborn.tax.declarations";

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

// ═══ Taxpayer profile ═════════════════════════════════════════════════════
export const taxStorage = {
  getProfile(): TaxpayerProfile | null {
    return readLS<TaxpayerProfile | null>(KEY_PROFILE, null);
  },

  saveProfile(profile: TaxpayerProfile): TaxpayerProfile {
    const now = new Date().toISOString();
    const saved: TaxpayerProfile = {
      ...profile,
      id: profile.id || `tp-${Date.now()}`,
      createdAt: profile.createdAt || now,
      updatedAt: now,
    };
    writeLS(KEY_PROFILE, saved);
    return saved;
  },

  clearProfile(): void {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(KEY_PROFILE);
    }
  },

  // ═══ Declarations ════════════════════════════════════════════════════════
  listDeclarations(): TaxDeclaration[] {
    return readLS<TaxDeclaration[]>(KEY_DECLARATIONS, []);
  },

  getDeclaration(id: string): TaxDeclaration | null {
    return this.listDeclarations().find((d) => d.id === id) ?? null;
  },

  saveDeclaration(decl: TaxDeclaration): TaxDeclaration {
    const all = this.listDeclarations();
    const idx = all.findIndex((d) => d.id === decl.id);
    const updated: TaxDeclaration = { ...decl, updatedAt: new Date().toISOString() };
    if (idx >= 0) all[idx] = updated;
    else all.unshift(updated);
    writeLS(KEY_DECLARATIONS, all);
    return updated;
  },

  deleteDeclaration(id: string): void {
    const all = this.listDeclarations().filter((d) => d.id !== id);
    writeLS(KEY_DECLARATIONS, all);
  },
};
