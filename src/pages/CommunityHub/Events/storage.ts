// Event storage — API-first, fallback localStorage khi BE chưa sẵn sàng.
//
// Pattern: mỗi method gọi API trước. Nếu API lỗi (network, 404, BE chưa deploy)
// → fallback sang localStorage (prototype). Khi BE ready, localStorage code tự vô hiệu.

import type {
  EventEntity,
  EventRegistration,
  EventStats,
  EventStatus,
  PaymentProof,
  RegistrationStatus,
  SelectedAddOn,
  CheckInOutRecord,
} from "./types";
import { MOCK_EVENTS } from "@/mocks/community-hub/events";
import EventService from "services/EventService";

const KEY_EVENTS = "reborn.events";
const KEY_REGISTRATIONS = "reborn.event_registrations";

// ── Flag: set true khi API trả về thành công lần đầu → tắt fallback ──
let apiAvailable = false;

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

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  const suffix = Date.now().toString(36).slice(-4);
  return `${base || "event"}-${suffix}`;
}

function generateTicketCode(eventSlug: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${eventSlug.slice(0, 8).toUpperCase()}-${rand}`;
}

function ensureSeed(): void {
  const existing = readLS<EventEntity[] | null>(KEY_EVENTS, null);
  if (!existing) {
    writeLS(KEY_EVENTS, MOCK_EVENTS);
  }
}

/** Kiểm tra response API hợp lệ (code === 0 hoặc có result) */
function isApiOk(res: any): boolean {
  return res && (res.code === 0 || res.result !== undefined || res.ok === true);
}

/** Trích result từ API response */
function unwrap<T>(res: any): T {
  return res.result ?? res.data ?? res;
}

export const eventStorage = {
  // ═══ Events ═══════════════════════════════════════════════════════════
  async listEventsAsync(params?: Record<string, unknown>): Promise<EventEntity[]> {
    try {
      const res = await EventService.list(params);
      if (isApiOk(res)) {
        apiAvailable = true;
        return unwrap<{ items: EventEntity[] }>(res).items ?? unwrap<EventEntity[]>(res);
      }
    } catch { /* fallback */ }
    return this.listEvents();
  },

  /** Sync version — dùng localStorage (backward-compatible với code hiện tại) */
  listEvents(): EventEntity[] {
    ensureSeed();
    return readLS<EventEntity[]>(KEY_EVENTS, []);
  },

  async getEventAsync(id: string): Promise<EventEntity | null> {
    try {
      const res = await EventService.get(id);
      if (isApiOk(res)) {
        apiAvailable = true;
        return unwrap<EventEntity>(res);
      }
    } catch { /* fallback */ }
    return this.getEvent(id);
  },

  getEvent(id: string): EventEntity | null {
    return this.listEvents().find((e) => e.id === id) ?? null;
  },

  async getEventBySlugAsync(slug: string): Promise<EventEntity | null> {
    try {
      const res = await EventService.getPublic(slug);
      if (isApiOk(res)) {
        apiAvailable = true;
        return unwrap<EventEntity>(res);
      }
    } catch { /* fallback */ }
    return this.getEventBySlug(slug);
  },

  getEventBySlug(slug: string): EventEntity | null {
    return this.listEvents().find((e) => e.slug === slug) ?? null;
  },

  async createEventAsync(
    data: Omit<EventEntity, "id" | "slug" | "createdAt" | "updatedAt">,
  ): Promise<EventEntity> {
    try {
      const res = await EventService.create(data as any);
      if (isApiOk(res)) {
        apiAvailable = true;
        return unwrap<EventEntity>(res);
      }
    } catch { /* fallback */ }
    return this.createEvent(data);
  },

  createEvent(data: Omit<EventEntity, "id" | "slug" | "createdAt" | "updatedAt">): EventEntity {
    const now = new Date().toISOString();
    const id = `evt-${Date.now()}`;
    const slug = generateSlug(data.title);
    const entity: EventEntity = { ...data, id, slug, createdAt: now, updatedAt: now };
    const all = this.listEvents();
    all.unshift(entity);
    writeLS(KEY_EVENTS, all);
    return entity;
  },

  async updateEventAsync(id: string, patch: Partial<EventEntity>): Promise<EventEntity | null> {
    try {
      const res = await EventService.update(id, patch as any);
      if (isApiOk(res)) {
        apiAvailable = true;
        return unwrap<EventEntity>(res);
      }
    } catch { /* fallback */ }
    return this.updateEvent(id, patch);
  },

  updateEvent(id: string, patch: Partial<EventEntity>): EventEntity | null {
    const all = this.listEvents();
    const idx = all.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    const updated: EventEntity = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    writeLS(KEY_EVENTS, all);
    return updated;
  },

  async publishEventAsync(id: string): Promise<EventEntity | null> {
    try {
      const res = await EventService.publish(id);
      if (isApiOk(res)) { apiAvailable = true; return unwrap<EventEntity>(res); }
    } catch { /* fallback */ }
    return this.publishEvent(id);
  },

  publishEvent(id: string): EventEntity | null {
    return this.updateEvent(id, { status: "published", publishedAt: new Date().toISOString() });
  },

  async unpublishEventAsync(id: string): Promise<EventEntity | null> {
    try {
      const res = await EventService.unpublish(id);
      if (isApiOk(res)) { apiAvailable = true; return unwrap<EventEntity>(res); }
    } catch { /* fallback */ }
    return this.unpublishEvent(id);
  },

  unpublishEvent(id: string): EventEntity | null {
    return this.updateEvent(id, { status: "draft" });
  },

  async deleteEventAsync(id: string): Promise<void> {
    try {
      const res = await EventService.delete(id);
      if (isApiOk(res)) { apiAvailable = true; return; }
    } catch { /* fallback */ }
    this.deleteEvent(id);
  },

  deleteEvent(id: string): void {
    const all = this.listEvents().filter((e) => e.id !== id);
    writeLS(KEY_EVENTS, all);
    const regs = this.listRegistrations().filter((r) => r.eventId !== id);
    writeLS(KEY_REGISTRATIONS, regs);
  },

  // ═══ Registrations ════════════════════════════════════════════════════
  async listRegistrationsByEventAsync(
    eventId: string,
    params?: Record<string, unknown>,
  ): Promise<EventRegistration[]> {
    try {
      const res = await EventService.listRegistrations({ eventId, ...params });
      if (isApiOk(res)) {
        apiAvailable = true;
        const data = unwrap<any>(res);
        return data.items ?? data;
      }
    } catch { /* fallback */ }
    return this.listRegistrationsByEvent(eventId);
  },

  listRegistrations(): EventRegistration[] {
    return readLS<EventRegistration[]>(KEY_REGISTRATIONS, []);
  },

  listRegistrationsByEvent(eventId: string): EventRegistration[] {
    return this.listRegistrations().filter((r) => r.eventId === eventId);
  },

  async registerForEventAsync(
    eventSlug: string,
    data: {
      fullName: string;
      phone: string;
      email?: string;
      company?: string;
      note?: string;
      source?: "public_portal" | "manual" | "import";
      utmSource?: string;
      utmCampaign?: string;
      dynamicFieldValues?: Record<string, string>;
      selectedAddOns?: SelectedAddOn[];
      totalAmount?: number;
      selectedDates?: string[];
      paymentProof?: PaymentProof;
    },
  ): Promise<{ ok: boolean; registration?: EventRegistration; error?: string }> {
    try {
      const res = await EventService.registerPublic(eventSlug, data as any);
      if (isApiOk(res)) {
        apiAvailable = true;
        return { ok: true, registration: unwrap<EventRegistration>(res) };
      }
      if (res?.error || res?.message) {
        return { ok: false, error: res.error ?? res.message };
      }
    } catch { /* fallback */ }
    return this.registerForEvent(eventSlug, data);
  },

  registerForEvent(
    eventSlug: string,
    data: {
      fullName: string;
      phone: string;
      email?: string;
      company?: string;
      note?: string;
      source?: "public_portal" | "manual" | "import";
      utmSource?: string;
      utmCampaign?: string;
      dynamicFieldValues?: Record<string, string>;
      selectedAddOns?: SelectedAddOn[];
      totalAmount?: number;
      selectedDates?: string[];
      paymentProof?: PaymentProof;
    },
  ): { ok: boolean; registration?: EventRegistration; error?: string } {
    const event = this.getEventBySlug(eventSlug);
    if (!event) return { ok: false, error: "Không tìm thấy sự kiện" };
    if (event.status !== "published" && event.status !== "ongoing") {
      return { ok: false, error: "Sự kiện chưa được công bố" };
    }
    const now = new Date();
    if (new Date(event.registrationOpenDate) > now) return { ok: false, error: "Chưa đến thời gian mở đăng ký" };
    if (new Date(event.registrationCloseDate) < now) return { ok: false, error: "Đã hết hạn đăng ký" };
    if (event.maxAttendees) {
      const current = this.listRegistrationsByEvent(event.id).filter((r) => r.status !== "cancelled").length;
      if (current >= event.maxAttendees) return { ok: false, error: "Sự kiện đã đủ chỗ" };
    }

    const registration: EventRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventId: event.id,
      eventSlug: event.slug,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      company: data.company,
      note: data.note,
      status: "pending",
      registeredAt: now.toISOString(),
      source: data.source ?? "public_portal",
      utmSource: data.utmSource,
      utmCampaign: data.utmCampaign,
      dynamicFieldValues: data.dynamicFieldValues,
      selectedAddOns: data.selectedAddOns,
      totalAmount: data.totalAmount,
      selectedDates: data.selectedDates,
      paymentProof: data.paymentProof,
    };
    const all = this.listRegistrations();
    all.unshift(registration);
    writeLS(KEY_REGISTRATIONS, all);
    return { ok: true, registration };
  },

  async updateRegistrationStatusAsync(
    regId: string,
    status: RegistrationStatus,
  ): Promise<EventRegistration | null> {
    try {
      const res = await EventService.updateRegistration(regId, { status });
      if (isApiOk(res)) { apiAvailable = true; return unwrap<EventRegistration>(res); }
    } catch { /* fallback */ }
    return this.updateRegistrationStatus(regId, status);
  },

  updateRegistrationStatus(regId: string, status: RegistrationStatus): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0) return null;
    const updated: EventRegistration = { ...all[idx] };
    updated.status = status;
    if (status === "confirmed" && !updated.ticketCode) {
      updated.ticketCode = generateTicketCode(updated.eventSlug);
      updated.confirmedAt = new Date().toISOString();
    }
    if (status === "checked_in") {
      updated.checkedInAt = new Date().toISOString();
    }
    all[idx] = updated;
    writeLS(KEY_REGISTRATIONS, all);
    return updated;
  },

  async markConvertedToMemberAsync(regId: string): Promise<EventRegistration | null> {
    try {
      const res = await EventService.convertToMember(regId);
      if (isApiOk(res)) { apiAvailable = true; return unwrap<EventRegistration>(res); }
    } catch { /* fallback */ }
    const mockCustomerId = `cust-${Date.now()}`;
    return this.markConvertedToMember(regId, mockCustomerId);
  },

  markConvertedToMember(regId: string, customerId: string): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0) return null;
    all[idx] = { ...all[idx], convertedToCustomerId: customerId, convertedAt: new Date().toISOString() };
    writeLS(KEY_REGISTRATIONS, all);
    return all[idx];
  },

  deleteRegistration(regId: string): void {
    const all = this.listRegistrations().filter((r) => r.id !== regId);
    writeLS(KEY_REGISTRATIONS, all);
  },

  // ═══ Payment Proof ═════════════════════════════════════════════════════
  async submitPaymentProofAsync(regId: string, imageDataUrl: string): Promise<EventRegistration | null> {
    try {
      const res = await EventService.submitPaymentProof(regId, { imageUrl: imageDataUrl });
      if (isApiOk(res)) { apiAvailable = true; return unwrap<EventRegistration>(res); }
    } catch { /* fallback */ }
    return this.submitPaymentProof(regId, imageDataUrl);
  },

  submitPaymentProof(regId: string, imageDataUrl: string): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0) return null;
    all[idx] = {
      ...all[idx],
      paymentProof: { imageUrl: imageDataUrl, submittedAt: new Date().toISOString(), status: "submitted" },
    };
    writeLS(KEY_REGISTRATIONS, all);
    return all[idx];
  },

  async reviewPaymentProofAsync(
    regId: string,
    approved: boolean,
    rejectReason?: string,
  ): Promise<EventRegistration | null> {
    try {
      const res = await EventService.reviewPaymentProof(regId, { approved, rejectReason });
      if (isApiOk(res)) { apiAvailable = true; return unwrap<EventRegistration>(res); }
    } catch { /* fallback */ }
    return this.reviewPaymentProof(regId, approved, rejectReason);
  },

  reviewPaymentProof(regId: string, approved: boolean, rejectReason?: string): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0 || !all[idx].paymentProof) return null;
    const proof = { ...all[idx].paymentProof! };
    proof.status = approved ? "approved" : "rejected";
    proof.reviewedAt = new Date().toISOString();
    proof.reviewedBy = "Admin";
    if (!approved && rejectReason) proof.rejectReason = rejectReason;
    all[idx] = { ...all[idx], paymentProof: proof };
    writeLS(KEY_REGISTRATIONS, all);
    return all[idx];
  },

  // ═══ Check-in / Check-out ═════════════════════════════════════════════
  async checkInRegistrantAsync(
    regId: string,
    selectedDate?: string,
    adminName?: string,
  ): Promise<EventRegistration | null> {
    try {
      const res = await EventService.checkIn(regId, { selectedDate });
      if (isApiOk(res)) { apiAvailable = true; return unwrap<EventRegistration>(res); }
    } catch { /* fallback */ }
    return this.checkInRegistrant(regId, selectedDate, adminName);
  },

  checkInRegistrant(regId: string, selectedDate?: string, adminName?: string): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0) return null;
    const record: CheckInOutRecord = {
      checkedInAt: new Date().toISOString(),
      checkedInBy: adminName ?? "Admin",
      selectedDate,
    };
    const records = [...(all[idx].checkInOutRecords ?? []), record];
    all[idx] = { ...all[idx], status: "checked_in", checkedInAt: record.checkedInAt, checkInOutRecords: records };
    writeLS(KEY_REGISTRATIONS, all);
    return all[idx];
  },

  async checkOutRegistrantAsync(regId: string): Promise<EventRegistration | null> {
    try {
      const res = await EventService.checkOut(regId);
      if (isApiOk(res)) { apiAvailable = true; return unwrap<EventRegistration>(res); }
    } catch { /* fallback */ }
    return this.checkOutRegistrant(regId);
  },

  checkOutRegistrant(regId: string): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0) return null;
    const records = [...(all[idx].checkInOutRecords ?? [])];
    const lastOpen = records.findIndex((r) => !r.checkedOutAt);
    if (lastOpen >= 0) {
      records[lastOpen] = { ...records[lastOpen], checkedOutAt: new Date().toISOString() };
    }
    all[idx] = { ...all[idx], checkInOutRecords: records };
    writeLS(KEY_REGISTRATIONS, all);
    return all[idx];
  },

  // ═══ Stats ════════════════════════════════════════════════════════════
  getEventStats(eventId: string): EventStats {
    const event = this.getEvent(eventId);
    const regs = this.listRegistrationsByEvent(eventId);
    const pending = regs.filter((r) => r.status === "pending").length;
    const confirmed = regs.filter((r) => r.status === "confirmed").length;
    const checkedIn = regs.filter((r) => r.status === "checked_in").length;
    const cancelled = regs.filter((r) => r.status === "cancelled").length;
    const converted = regs.filter((r) => r.convertedToCustomerId).length;
    const activeCount = regs.filter((r) => r.status !== "cancelled").length;
    const fillRate = event?.maxAttendees ? Math.min(1, activeCount / event.maxAttendees) : 0;
    const conversionRate = regs.length ? converted / regs.length : 0;
    const activeRegs = regs.filter((r) => r.status !== "cancelled");
    const totalRevenue = activeRegs.reduce((s, r) => s + (r.totalAmount ?? 0), 0);
    const paymentPendingCount = regs.filter((r) => r.paymentProof?.status === "submitted").length;
    const paymentApprovedCount = regs.filter((r) => r.paymentProof?.status === "approved").length;

    return {
      totalRegistrations: regs.length,
      pendingCount: pending,
      confirmedCount: confirmed,
      checkedInCount: checkedIn,
      cancelledCount: cancelled,
      convertedToMemberCount: converted,
      fillRate,
      conversionRate,
      totalRevenue,
      paymentPendingCount,
      paymentApprovedCount,
    };
  },
};
