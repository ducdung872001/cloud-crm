// ĐẶC THÙ: Storage cho service usage tracking (fitness/spa/community hub).
// API-first, fallback localStorage. Xoá file này không ảnh hưởng module chung.

import type { ServiceUsageRecord } from "./types.industry";
import EventService from "services/EventService";

const KEY_SERVICE_USAGE = "reborn.event_service_usage";

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
    /* ignore */
  }
}

function isApiOk(res: any): boolean {
  return res && (res.code === 0 || res.result !== undefined || res.ok === true);
}

function unwrap<T>(res: any): T {
  return res.result ?? res.data ?? res;
}

export const industryEventStorage = {
  // ── Async (API-first) ──
  async listServiceUsageAsync(registrationId: string): Promise<ServiceUsageRecord[]> {
    try {
      const res = await EventService.listServiceUsage(registrationId);
      if (isApiOk(res)) {
        const data = unwrap<any>(res);
        return data.items ?? data;
      }
    } catch { /* fallback */ }
    return this.listServiceUsage(registrationId);
  },

  async addServiceUsageAsync(
    record: Omit<ServiceUsageRecord, "id" | "recordedAt">,
  ): Promise<ServiceUsageRecord> {
    try {
      const res = await EventService.addServiceUsage(record as any);
      if (isApiOk(res)) return unwrap<ServiceUsageRecord>(res);
    } catch { /* fallback */ }
    return this.addServiceUsage(record);
  },

  async removeServiceUsageAsync(id: string): Promise<void> {
    try {
      const res = await EventService.removeServiceUsage(id);
      if (isApiOk(res)) return;
    } catch { /* fallback */ }
    this.removeServiceUsage(id);
  },

  // ── Sync (localStorage fallback) ──
  listServiceUsage(registrationId: string): ServiceUsageRecord[] {
    return readLS<ServiceUsageRecord[]>(KEY_SERVICE_USAGE, []).filter(
      (r) => r.registrationId === registrationId,
    );
  },

  listServiceUsageByEvent(registrationIds: string[]): ServiceUsageRecord[] {
    const idSet = new Set(registrationIds);
    return readLS<ServiceUsageRecord[]>(KEY_SERVICE_USAGE, []).filter((r) =>
      idSet.has(r.registrationId),
    );
  },

  addServiceUsage(
    record: Omit<ServiceUsageRecord, "id" | "recordedAt">,
  ): ServiceUsageRecord {
    const full: ServiceUsageRecord = {
      ...record,
      id: `su-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      recordedAt: new Date().toISOString(),
    };
    const all = readLS<ServiceUsageRecord[]>(KEY_SERVICE_USAGE, []);
    all.unshift(full);
    writeLS(KEY_SERVICE_USAGE, all);
    return full;
  },

  removeServiceUsage(id: string): void {
    const all = readLS<ServiceUsageRecord[]>(KEY_SERVICE_USAGE, []).filter(
      (r) => r.id !== id,
    );
    writeLS(KEY_SERVICE_USAGE, all);
  },

  getTotalByRegistration(registrationId: string): number {
    return this.listServiceUsage(registrationId).reduce(
      (sum, r) => sum + r.qty * r.unitPrice,
      0,
    );
  },
};
