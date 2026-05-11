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
import { isLoggedInAdmin } from "./shared";

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

/**
 * Trước đây auto-seed MOCK_EVENTS khi localStorage rỗng — gây hiểu lầm
 * tenant mới đã có sẵn sự kiện. Bây giờ KHÔNG auto-seed: tenant mới = rỗng.
 * Khi user muốn xem giao diện có data → dùng chế độ "Xem trước" (tạm inject
 * MOCK vào React state, không ghi localStorage).
 */
function ensureSeed(): void {
  // no-op — giữ hàm để tương thích call site cũ, nhưng không làm gì.
}

/** Kiểm tra response API hợp lệ (code === 0 hoặc có result) */
function isApiOk(res: any): boolean {
  return res && (res.code === 0 || res.result !== undefined || res.ok === true);
}

/** Chuẩn hoá datetime từ BE: thêm `Z` (UTC) nếu BE trả naive ISO không có TZ
 *  marker — tránh JS coi là local time và lệch giờ khi hiển thị.
 *  - "2026-04-25T07:00:00.000Z"  → giữ nguyên
 *  - "2026-04-25T07:00:00+07:00" → giữ nguyên
 *  - "2026-04-25T07:00:00"       → "2026-04-25T07:00:00Z" (assume UTC, vì FE gửi `.toISOString()`)
 *  - "2026-04-25 07:00:00"       → "2026-04-25T07:00:00Z"
 */
function normalizeBeDate<T extends string | undefined | null>(s: T): T {
  if (!s || typeof s !== "string") return s;
  // Đã có TZ marker (Z hoặc +/-HH:MM offset)
  if (/[Zz]$|[+-]\d{2}:?\d{2}$/.test(s)) return s as T;
  // Phải có dạng datetime (chữ T hoặc dấu cách giữa date và time)
  if (!/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s)) return s as T;
  return (s.replace(" ", "T") + "Z") as T;
}

/** Trích result từ API response */
function unwrap<T>(res: any): T {
  return res.result ?? res.data ?? res;
}

/** Normalize event từ API — parse JSON string fields nếu BE trả string thay vì object */
export function normalizeEvent(e: any): EventEntity {
  if (!e) return e;
  // BE đôi khi double-stringify field JSON (vd `selectedAddOns` là
  // `"\"[{...}]\""` — JSON.stringify áp 2 lần). parseJson lặp tới khi
  // không còn là string hoặc parse fail.
  const parseJson = (v: any) => {
    let cur = v;
    for (let i = 0; i < 3 && typeof cur === "string"; i++) {
      try { cur = JSON.parse(cur); } catch { return cur; }
    }
    return cur;
  };
  // Một số field BE đôi khi trả về string không parse được hoặc null → ép về [] để
  // FE map/find không crash. Trước đây registrants tab bị "Đã xảy ra lỗi" do
  // gọi .find/.map trên string khi BE trả selectedAddOns/addOnItems sai shape.
  const parseJsonArr = (v: any): any[] => {
    const parsed = parseJson(v);
    return Array.isArray(parsed) ? parsed : [];
  };
  return {
    ...e,
    tags: parseJsonArr(e.tags),
    dynamicFields: parseJson(e.dynamicFields),
    addOnItems: parseJsonArr(e.addOnItems),
    galleryImageUrls: parseJsonArr(e.galleryImageUrls),
    selectableDates: parseJsonArr(e.selectableDates),
    venue: typeof e.venue === "string" ? JSON.parse(e.venue) : (e.venue ?? {
      name: e.venueName ?? e.venue_name ?? "",
      address: e.venueAddress ?? e.venue_address ?? "",
      city: e.venueCity ?? e.venue_city,
      isOnline: e.venueIsOnline ?? e.venue_is_online ?? false,
      onlineUrl: e.venueOnlineUrl ?? e.venue_online_url,
    }),
    additionalVenues: parseJsonArr(e.additionalVenues ?? e.additional_venues),
    contactPerson: typeof e.contactPerson === "string" ? JSON.parse(e.contactPerson) : (e.contactPerson ?? {
      name: e.contactName ?? e.contact_name ?? "",
      phone: e.contactPhone ?? e.contact_phone ?? "",
      email: e.contactEmail ?? e.contact_email,
      role: e.contactRole ?? e.contact_role,
    }),
    // BE đôi khi trả JSON string (bank|accountNumber|holder|phone|qrImageUrl).
    // Nếu không parse → bank.qrImageUrl truy cập trên string → undefined → QR
    // upload không hiển thị dù admin đã upload.
    bankAccountOverride: parseJson(e.bankAccountOverride ?? e.bank_account_override) || undefined,
    // snake_case → camelCase fallback
    coverImageUrl: e.coverImageUrl ?? e.cover_image_url,
    startDate: normalizeBeDate(e.startDate ?? e.start_date),
    endDate: normalizeBeDate(e.endDate ?? e.end_date),
    registrationOpenDate: normalizeBeDate(e.registrationOpenDate ?? e.registration_open_date),
    registrationCloseDate: normalizeBeDate(e.registrationCloseDate ?? e.registration_close_date),
    maxAttendees: e.maxAttendees ?? e.max_attendees,
    ticketPrice: e.ticketPrice ?? e.ticket_price ?? 0,
    publishedAt: normalizeBeDate(e.publishedAt ?? e.published_at),
    createdAt: normalizeBeDate(e.createdAt ?? e.created_at),
    updatedAt: normalizeBeDate(e.updatedAt ?? e.updated_at),
    createdBy: e.createdBy ?? e.created_by,
    // BE trả int 0/1 → coerce về boolean để dùng đúng trong {X && <JSX />}.
    requirePaymentProof: Boolean(e.requirePaymentProof ?? e.require_payment_proof ?? false),
    // BE-2 yc tester 2026-05-06: count slot tử cloud-market public response
    activeRegistrations: e.activeRegistrations ?? e.active_registrations,
    // Yc 7/5 bug 2: contentBlocks BE trả JSON string giống tags/dynamicFields.
    // Check `event.contentBlocks?.length > 0` ở ShareEventPage match độ dài
    // chuỗi (truthy) → nhánh `<ContentBlocksRenderer blocks={string}/>` được
    // chọn nhưng renderer iterate ký tự rỗng → "Nội dung chi tiết" trống dù
    // API có data. Parse về array để fallback HTML hoạt động đúng.
    contentBlocks: parseJsonArr(e.contentBlocks ?? e.content_blocks),
    // registrationFlows cũng dạng JSON array — check `?.length` false-positive
    // sẽ bật RegistrationFlowSwitcher với shape sai.
    registrationFlows: parseJsonArr(e.registrationFlows ?? e.registration_flows),
    isTest: Boolean(e.isTest ?? e.is_test ?? false),
    // Recap (sau sự kiện) — BE lưu JSON-string giống contentBlocks. parseJson lặp
    // tới khi ra object hoặc undefined nếu rỗng/lỗi.
    recap: (() => {
      const raw = e.recap;
      if (raw == null || raw === "") return undefined;
      const parsed = parseJson(raw);
      return (parsed && typeof parsed === "object") ? parsed : undefined;
    })(),
  } as EventEntity;
}

function normalizeReg(r: any): EventRegistration {
  if (!r) return r;
  // Double-stringify guard — xem comment ở normalizeEvent.parseJson
  const parseJson = (v: any) => {
    let cur = v;
    for (let i = 0; i < 3 && typeof cur === "string"; i++) {
      try { cur = JSON.parse(cur); } catch { return cur; }
    }
    return cur;
  };
  const parseJsonArr = (v: any): any[] => {
    const parsed = parseJson(v);
    return Array.isArray(parsed) ? parsed : [];
  };
  // checkInOutRecords có 2 field datetime nested → normalize sau khi parse JSON
  const rawCheckInOut = parseJson(r.checkInOutRecords ?? r.check_in_out_records);
  const checkInOutRecords = Array.isArray(rawCheckInOut)
    ? rawCheckInOut.map((rec: any) => ({
        ...rec,
        checkedInAt: normalizeBeDate(rec?.checkedInAt),
        checkedOutAt: normalizeBeDate(rec?.checkedOutAt),
      }))
    : rawCheckInOut;

  // paymentProofs cũng có submittedAt + reviewedAt → normalize
  const rawProofs = parseJson(r.paymentProofs ?? r.payment_proofs);
  const paymentProofs = Array.isArray(rawProofs)
    ? rawProofs.map((p: any) =>
        p && typeof p === "object"
          ? {
              ...p,
              submittedAt: normalizeBeDate(p.submittedAt),
              reviewedAt: normalizeBeDate(p.reviewedAt),
            }
          : p,
      )
    : rawProofs;

  return {
    ...r,
    dynamicFieldValues: parseJson(r.dynamicFieldValues ?? r.dynamic_field_values),
    selectedAddOns: parseJsonArr(r.selectedAddOns ?? r.selected_add_ons),
    selectedDates: parseJsonArr(r.selectedDates ?? r.selected_dates),
    checkInOutRecords,
    totalAmount: r.totalAmount ?? r.total_amount,
    eventSlug: r.eventSlug ?? r.event_slug,
    eventId: r.eventId ?? r.event_id,
    fullName: r.fullName ?? r.full_name,
    registeredAt: normalizeBeDate(r.registeredAt ?? r.registered_at ?? r.created_at),
    confirmedAt: normalizeBeDate(r.confirmedAt ?? r.confirmed_at),
    checkedInAt: normalizeBeDate(r.checkedInAt ?? r.checked_in_at),
    ticketCode: r.ticketCode ?? r.ticket_code,
    convertedToCustomerId: r.convertedToCustomerId ?? r.converted_to_customer_id,
    convertedAt: normalizeBeDate(r.convertedAt ?? r.converted_at),
    utmSource: r.utmSource ?? r.utm_source,
    utmCampaign: r.utmCampaign ?? r.utm_campaign,
    // BE thực tế trả field tên `paymentProofs` (số nhiều, array) — 1 reg có thể
    // có nhiều lần upload. Fallback cho các shape khác:
    //  1) `paymentProofs` array (BE hiện tại) → lấy phần tử cuối (mới nhất)
    //  2) `paymentProof` / `payment_proof` object hoặc JSON string
    //  3) Flatten fields (`payment_proof_url`, `payment_proof_status`, ...)
    // Nếu chỉ có URL mà status null/empty → coi là "submitted" để cột
    // "Thanh toán" không báo sai là "Chưa upload".
    paymentProofs,
    paymentProof: (() => {
      if (Array.isArray(paymentProofs) && paymentProofs.length > 0) {
        const last = paymentProofs[paymentProofs.length - 1];
        return typeof last === "object" ? last : undefined;
      }
      const parsedObj = parseJson(r.paymentProof ?? r.payment_proof);
      if (parsedObj && typeof parsedObj === "object") {
        return {
          ...parsedObj,
          submittedAt: normalizeBeDate(parsedObj.submittedAt),
          reviewedAt: normalizeBeDate(parsedObj.reviewedAt),
        };
      }
      const url = r.payment_proof_url ?? r.paymentProofUrl;
      const status = r.payment_proof_status ?? r.paymentProofStatus;
      if (status && status !== "not_required") {
        return {
          imageUrl: url ?? "",
          submittedAt: normalizeBeDate(r.payment_proof_submitted_at ?? ""),
          status,
          reviewedAt: normalizeBeDate(r.payment_proof_reviewed_at),
          reviewedBy: r.payment_proof_reviewed_by,
          rejectReason: r.payment_proof_reject_reason,
        };
      }
      if (url) {
        return {
          imageUrl: url,
          submittedAt: normalizeBeDate(r.payment_proof_submitted_at ?? ""),
          status: "submitted",
        };
      }
      return undefined;
    })(),
  } as EventRegistration;
}

export const eventStorage = {
  // ═══ Events ═══════════════════════════════════════════════════════════
  async listEventsAsync(params?: Record<string, unknown>): Promise<EventEntity[]> {
    try {
      const res = await EventService.list(params);
      if (isApiOk(res)) {
        apiAvailable = true;
        const raw = unwrap<any>(res);
        const items: any[] = raw.items ?? (Array.isArray(raw) ? raw : []);
        return items.map(normalizeEvent);
      }
    } catch { /* fallback */ }
    return this.listEvents();
  },

  /** Sync version — dùng localStorage (backward-compatible với code hiện tại).
   * Nếu phát hiện localStorage đúng là MOCK_EVENTS auto-seed trước đây
   * (IDs match hoàn toàn với MOCK_EVENTS) → dọn sạch để tenant mới không
   * thấy data ảo. User-created events được giữ nguyên. */
  listEvents(): EventEntity[] {
    const existing = readLS<EventEntity[]>(KEY_EVENTS, []);
    if (existing.length > 0 && existing.length === MOCK_EVENTS.length) {
      const existingIds = new Set(existing.map((e) => e.id));
      const allFromMock = MOCK_EVENTS.every((m) => existingIds.has(m.id));
      if (allFromMock) {
        writeLS<EventEntity[]>(KEY_EVENTS, []);
        return [];
      }
    }
    return existing;
  },

  async getEventAsync(id: string): Promise<EventEntity | null> {
    try {
      const res = await EventService.get(id);
      if (isApiOk(res)) {
        apiAvailable = true;
        return normalizeEvent(unwrap<any>(res));
      }
    } catch { /* fallback */ }
    return this.getEvent(id);
  },

  getEvent(id: string): EventEntity | null {
    return this.listEvents().find((e) => e.id === id) ?? null;
  },

  async getEventBySlugAsync(slug: string): Promise<EventEntity | null> {
    let publicFailed = false;
    try {
      const res = await EventService.getPublic(slug);
      if (isApiOk(res)) {
        apiAvailable = true;
        return normalizeEvent(unwrap<any>(res));
      }
      publicFailed = true;
      console.warn("[EventStorage] getPublic failed for slug:", slug, res);
    } catch (err) {
      publicFailed = true;
      console.warn("[EventStorage] getPublic error:", err);
    }
    // Admin preview: public endpoint chỉ trả event published (draft/test → 400/404).
    // Admin đã login → có quyền xem tất cả → fallback admin list endpoint để
    // tìm theo slug. Visitor (không login) → bỏ qua, return null.
    if (publicFailed && isLoggedInAdmin()) {
      try {
        const all = await this.listEventsAsync();
        const found = all.find((e) => e.slug === slug);
        if (found) return found;
      } catch (err) {
        console.warn("[EventStorage] admin list fallback error:", err);
      }
    }
    return this.getEventBySlug(slug);
  },

  getEventBySlug(slug: string): EventEntity | null {
    return this.listEvents().find((e) => e.slug === slug) ?? null;
  },

  async createEventAsync(
    data: Omit<EventEntity, "id" | "slug" | "createdAt" | "updatedAt">,
  ): Promise<EventEntity> {
    let beErrorMsg: string | null = null;
    try {
      const res = await EventService.create(data as any);
      if (isApiOk(res)) {
        apiAvailable = true;
        return normalizeEvent(unwrap<any>(res));
      }
      // BE trả response có nội dung lỗi → ném lên để UI báo rõ, không fallback ngầm.
      beErrorMsg = (res && (res.error || res.message)) || null;
    } catch { /* true network error → fallback localStorage bên dưới */ }
    if (beErrorMsg) {
      throw new Error(beErrorMsg);
    }
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
    let beErrorMsg: string | null = null;
    try {
      const res = await EventService.update(id, patch as any);
      if (isApiOk(res)) {
        apiAvailable = true;
        return normalizeEvent(unwrap<any>(res));
      }
      beErrorMsg = (res && (res.error || res.message)) || null;
    } catch { /* network fallback */ }
    if (beErrorMsg) {
      throw new Error(beErrorMsg);
    }
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
      if (isApiOk(res)) { apiAvailable = true; return normalizeEvent(unwrap<any>(res)); }
    } catch { /* fallback */ }
    return this.publishEvent(id);
  },

  publishEvent(id: string): EventEntity | null {
    return this.updateEvent(id, { status: "published", publishedAt: new Date().toISOString() });
  },

  async unpublishEventAsync(id: string): Promise<EventEntity | null> {
    try {
      const res = await EventService.unpublish(id);
      if (isApiOk(res)) { apiAvailable = true; return normalizeEvent(unwrap<any>(res)); }
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
        const items: any[] = data.items ?? (Array.isArray(data) ? data : []);
        return items.map(normalizeReg);
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
    // Chuẩn hoá dynamicFieldValues: lọc bỏ key rỗng, trim, không gửi object rỗng
    const cleanDynamic = data.dynamicFieldValues
      ? Object.fromEntries(
          Object.entries(data.dynamicFieldValues).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== ""),
        )
      : undefined;
    const payload = {
      ...data,
      dynamicFieldValues: cleanDynamic && Object.keys(cleanDynamic).length > 0 ? cleanDynamic : undefined,
    };

    // Gọi BE. Lỗi BE (HTTP non-2xx / code !== 0) phải báo cho user,
    // KHÔNG silent-fallback localStorage — nếu không tester sẽ nhận ticket ảo mà BE chưa lưu.
    try {
      const res = await EventService.registerPublic(eventSlug, payload as any);
      if (isApiOk(res)) {
        apiAvailable = true;
        return { ok: true, registration: normalizeReg(unwrap<any>(res)) };
      }
      // Response parse được nhưng không OK → đẩy error thật của BE lên UI
      apiAvailable = true;
      const errMsg = res?.error || res?.message || res?.errorMessage || "Đăng ký thất bại, vui lòng thử lại";
      console.warn("[registerPublic] BE rejected:", res);
      return { ok: false, error: String(errMsg) };
    } catch (err) {
      // Thực sự không tới được BE (network error / CORS / HTML non-JSON)
      console.warn("[registerPublic] network/parse error:", err);
      // Chỉ fallback localStorage khi API CHƯA BAO GIỜ thành công (dev/prototype)
      if (!apiAvailable) {
        return this.registerForEvent(eventSlug, payload);
      }
      return { ok: false, error: "Máy chủ đang bận, vui lòng thử lại sau ít phút" };
    }
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
      if (isApiOk(res)) { apiAvailable = true; return normalizeReg(unwrap<any>(res)); }
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

  async markConvertedToMemberAsync(
    regId: string,
  ): Promise<{ ok: true; registration: EventRegistration | null } | { ok: false; error: string }> {
    let beErrorMsg: string | null = null;
    try {
      const res = await EventService.convertToMember(regId);
      if (isApiOk(res)) {
        apiAvailable = true;
        return { ok: true, registration: normalizeReg(unwrap<any>(res)) };
      }
      // BE trả response có nội dung lỗi (VD `{code:500, message:"Lỗi hệ thống"}`)
      // → ném lỗi cho UI hiển thị, KHÔNG fallback localStorage ngầm (tránh
      // tester tưởng đã tạo hội viên thật mà thực ra chỉ ghi local).
      beErrorMsg = (res && (res.error || res.message)) || `Mã lỗi ${res?.code ?? "?"}`;
    } catch (err: any) {
      // Network error thật sự → fallback localStorage
      const mockCustomerId = `cust-${Date.now()}`;
      return { ok: true, registration: this.markConvertedToMember(regId, mockCustomerId) };
    }
    return { ok: false, error: beErrorMsg ?? "Không thể tạo hội viên" };
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
      if (isApiOk(res)) { apiAvailable = true; return normalizeReg(unwrap<any>(res)); }
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
      if (isApiOk(res)) { apiAvailable = true; return normalizeReg(unwrap<any>(res)); }
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
      if (isApiOk(res)) { apiAvailable = true; return normalizeReg(unwrap<any>(res)); }
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
      if (isApiOk(res)) { apiAvailable = true; return normalizeReg(unwrap<any>(res)); }
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
  /** Tính stats từ regs + event đã có sẵn (ưu tiên data API caller vừa fetch).
   *  Nếu không truyền tham số → fallback đọc localStorage (backward-compat).
   *  Lý do tách: trước đây fn đọc thẳng localStorage trong khi caller đang
   *  hiển thị data từ API → con số stats KHÔNG khớp data thực tế trên màn hình.
   */
  getEventStats(eventId: string, opts?: { regs?: EventRegistration[]; event?: EventEntity | null }): EventStats {
    const event = opts?.event ?? this.getEvent(eventId);
    const regs = opts?.regs ?? this.listRegistrationsByEvent(eventId);
    const pending = regs.filter((r) => r.status === "pending").length;
    const confirmed = regs.filter((r) => r.status === "confirmed").length;
    const checkedIn = regs.filter((r) => r.status === "checked_in").length;
    const cancelled = regs.filter((r) => r.status === "cancelled").length;
    const converted = regs.filter((r) => r.convertedToCustomerId).length;
    const activeRegs = regs.filter((r) => r.status !== "cancelled");
    const activeCount = activeRegs.length;
    const fillRate = event?.maxAttendees ? Math.min(1, activeCount / event.maxAttendees) : 0;
    const conversionRate = regs.length ? converted / regs.length : 0;

    // Helper: lấy totalAmount đáng tin — nếu BE không trả, fallback compute từ
    // ticketPrice + sum(addOns × qty) để stats không lệch về 0.
    const totalOf = (r: EventRegistration): number => {
      if (typeof r.totalAmount === "number" && r.totalAmount > 0) return r.totalAmount;
      if (!event) return 0;
      const ticket = event.ticketPrice ?? 0;
      const addons = (r.selectedAddOns ?? []).reduce((acc, sel) => {
        const item = (event.addOnItems ?? []).find((i) => i.id === sel.addOnId);
        return acc + (item ? item.unitPrice * sel.qty : 0);
      }, 0);
      return ticket + addons;
    };

    // Dự thu: tổng tiền của đăng ký chưa huỷ (bao gồm pending chưa duyệt thanh toán).
    const expectedRevenue = activeRegs.reduce((s, r) => s + totalOf(r), 0);
    // Đã thu: chỉ tính reg có bằng chứng thanh toán đã duyệt.
    const collectedRevenue = activeRegs
      .filter((r) => r.paymentProof?.status === "approved")
      .reduce((s, r) => s + totalOf(r), 0);
    const paymentPendingCount = regs.filter((r) => r.paymentProof?.status === "submitted").length;
    const paymentApprovedCount = regs.filter((r) => r.paymentProof?.status === "approved").length;

    return {
      totalRegistrations: regs.length,
      activeRegistrations: activeCount,
      pendingCount: pending,
      confirmedCount: confirmed,
      checkedInCount: checkedIn,
      cancelledCount: cancelled,
      convertedToMemberCount: converted,
      fillRate,
      conversionRate,
      expectedRevenue,
      collectedRevenue,
      totalRevenue: collectedRevenue, // legacy alias
      paymentPendingCount,
      paymentApprovedCount,
    };
  },
};
