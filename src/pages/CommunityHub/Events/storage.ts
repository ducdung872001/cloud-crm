// Event storage — localStorage cho MVP prototype.
// Khi BE sẵn sàng, thay implementation bên dưới bằng API calls nhưng giữ signature.

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

const KEY_EVENTS = "reborn.events";
const KEY_REGISTRATIONS = "reborn.event_registrations";

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

// Seed mock data nếu localStorage trống (dev first-time load)
function ensureSeed(): void {
  const existing = readLS<EventEntity[] | null>(KEY_EVENTS, null);
  if (!existing) {
    writeLS(KEY_EVENTS, MOCK_EVENTS);
  }
}

export const eventStorage = {
  // ═══ Events ═══════════════════════════════════════════════════════════
  listEvents(): EventEntity[] {
    ensureSeed();
    return readLS<EventEntity[]>(KEY_EVENTS, []);
  },

  getEvent(id: string): EventEntity | null {
    return this.listEvents().find((e) => e.id === id) ?? null;
  },

  getEventBySlug(slug: string): EventEntity | null {
    return this.listEvents().find((e) => e.slug === slug) ?? null;
  },

  createEvent(data: Omit<EventEntity, "id" | "slug" | "createdAt" | "updatedAt">): EventEntity {
    const now = new Date().toISOString();
    const id = `evt-${Date.now()}`;
    const slug = generateSlug(data.title);
    const entity: EventEntity = {
      ...data,
      id,
      slug,
      createdAt: now,
      updatedAt: now,
    };
    const all = this.listEvents();
    all.unshift(entity);
    writeLS(KEY_EVENTS, all);
    return entity;
  },

  updateEvent(id: string, patch: Partial<EventEntity>): EventEntity | null {
    const all = this.listEvents();
    const idx = all.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    const updated: EventEntity = {
      ...all[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    writeLS(KEY_EVENTS, all);
    return updated;
  },

  publishEvent(id: string): EventEntity | null {
    return this.updateEvent(id, {
      status: "published",
      publishedAt: new Date().toISOString(),
    });
  },

  unpublishEvent(id: string): EventEntity | null {
    return this.updateEvent(id, { status: "draft" });
  },

  deleteEvent(id: string): void {
    const all = this.listEvents().filter((e) => e.id !== id);
    writeLS(KEY_EVENTS, all);
    // Xoá luôn registrations liên quan
    const regs = this.listRegistrations().filter((r) => r.eventId !== id);
    writeLS(KEY_REGISTRATIONS, regs);
  },

  // ═══ Registrations ════════════════════════════════════════════════════
  listRegistrations(): EventRegistration[] {
    return readLS<EventRegistration[]>(KEY_REGISTRATIONS, []);
  },

  listRegistrationsByEvent(eventId: string): EventRegistration[] {
    return this.listRegistrations().filter((r) => r.eventId === eventId);
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
      // ── CHUNG: Mở rộng ──
      dynamicFieldValues?: Record<string, string>;
      selectedAddOns?: SelectedAddOn[];
      totalAmount?: number;
      selectedDates?: string[];
      paymentProof?: PaymentProof;
    }
  ): { ok: boolean; registration?: EventRegistration; error?: string } {
    const event = this.getEventBySlug(eventSlug);
    if (!event) return { ok: false, error: "Không tìm thấy sự kiện" };
    if (event.status !== "published" && event.status !== "ongoing") {
      return { ok: false, error: "Sự kiện chưa được công bố" };
    }
    const now = new Date();
    if (new Date(event.registrationOpenDate) > now) {
      return { ok: false, error: "Chưa đến thời gian mở đăng ký" };
    }
    if (new Date(event.registrationCloseDate) < now) {
      return { ok: false, error: "Đã hết hạn đăng ký" };
    }
    if (event.maxAttendees) {
      const current = this.listRegistrationsByEvent(event.id).filter(
        (r) => r.status !== "cancelled"
      ).length;
      if (current >= event.maxAttendees) {
        return { ok: false, error: "Sự kiện đã đủ chỗ" };
      }
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
      // ── CHUNG: Mở rộng ──
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

  updateRegistrationStatus(
    regId: string,
    status: RegistrationStatus
  ): EventRegistration | null {
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

  /** Ghi nhận đã chuyển thành customer/member. Thực tế sẽ gọi CustomerService. */
  markConvertedToMember(regId: string, customerId: string): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0) return null;
    all[idx] = {
      ...all[idx],
      convertedToCustomerId: customerId,
      convertedAt: new Date().toISOString(),
    };
    writeLS(KEY_REGISTRATIONS, all);
    return all[idx];
  },

  deleteRegistration(regId: string): void {
    const all = this.listRegistrations().filter((r) => r.id !== regId);
    writeLS(KEY_REGISTRATIONS, all);
  },

  // ═══ Payment Proof ═════════════════════════════════════════════════════
  submitPaymentProof(regId: string, imageDataUrl: string): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0) return null;
    all[idx] = {
      ...all[idx],
      paymentProof: {
        imageUrl: imageDataUrl,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      },
    };
    writeLS(KEY_REGISTRATIONS, all);
    return all[idx];
  },

  reviewPaymentProof(
    regId: string,
    approved: boolean,
    rejectReason?: string,
  ): EventRegistration | null {
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
  checkInRegistrant(
    regId: string,
    selectedDate?: string,
    adminName?: string,
  ): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0) return null;
    const record: CheckInOutRecord = {
      checkedInAt: new Date().toISOString(),
      checkedInBy: adminName ?? "Admin",
      selectedDate,
    };
    const records = [...(all[idx].checkInOutRecords ?? []), record];
    all[idx] = {
      ...all[idx],
      status: "checked_in",
      checkedInAt: record.checkedInAt,
      checkInOutRecords: records,
    };
    writeLS(KEY_REGISTRATIONS, all);
    return all[idx];
  },

  checkOutRegistrant(regId: string): EventRegistration | null {
    const all = this.listRegistrations();
    const idx = all.findIndex((r) => r.id === regId);
    if (idx < 0) return null;
    const records = [...(all[idx].checkInOutRecords ?? [])];
    // Check-out record cuối cùng chưa có checkedOutAt
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
    const fillRate = event?.maxAttendees
      ? Math.min(1, activeCount / event.maxAttendees)
      : 0;
    const conversionRate = regs.length ? converted / regs.length : 0;

    // ── CHUNG: Mở rộng ──
    const activeRegs = regs.filter((r) => r.status !== "cancelled");
    const totalRevenue = activeRegs.reduce((s, r) => s + (r.totalAmount ?? 0), 0);
    const paymentPendingCount = regs.filter(
      (r) => r.paymentProof?.status === "submitted",
    ).length;
    const paymentApprovedCount = regs.filter(
      (r) => r.paymentProof?.status === "approved",
    ).length;

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
