// Event Service — API calls cho phân hệ Sự kiện (Market microservice).
// Prefix: /bizapi/market/events/...

import { apiGet, apiPost, apiDelete } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export default {
  // ═══ Public (no auth) ═══════════════════════════════════════════════════
  getPublic: (slug: string, signal?: AbortSignal) => {
    return apiGet(urlsApi.events.getPublic, { slug }, signal);
  },

  // Public list — không cần auth, tự động bỏ token header (vì URL chứa /public/)
  listPublic: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.events.listPublic, params, signal);
  },

  registerPublic: (slug: string, body: Record<string, unknown>) => {
    return apiPost(`${urlsApi.events.registerPublic}?slug=${slug}`, body);
  },

  checkTicket: (slug: string, body: { ticketCode: string }) => {
    return apiPost(`${urlsApi.events.checkTicket}?slug=${slug}`, body);
  },

  // ═══ Admin — Events CRUD ════════════════════════════════════════════════
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.events.list, params, signal);
  },

  get: (id: string, signal?: AbortSignal) => {
    return apiGet(urlsApi.events.get, { id }, signal);
  },

  create: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.events.create, body);
  },

  update: (id: string, body: Record<string, unknown>) => {
    return apiPost(`${urlsApi.events.update}?id=${id}`, body);
  },

  delete: (id: string) => {
    return apiDelete(urlsApi.events.delete, { id });
  },

  publish: (id: string) => {
    return apiPost(`${urlsApi.events.publish}?id=${id}`);
  },

  unpublish: (id: string) => {
    return apiPost(`${urlsApi.events.unpublish}?id=${id}`);
  },

  cancel: (id: string) => {
    return apiPost(`${urlsApi.events.cancel}?id=${id}`);
  },

  // ═══ Admin — Registrations ══════════════════════════════════════════════
  listRegistrations: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.events.registrations, params, signal);
  },

  updateRegistration: (regId: string, body: Record<string, unknown>) => {
    return apiPost(`${urlsApi.events.updateRegistration}?id=${regId}`, body);
  },

  issueTicket: (regId: string) => {
    return apiPost(`${urlsApi.events.issueTicket}?id=${regId}`);
  },

  convertToMember: (regId: string, body?: Record<string, unknown>) => {
    return apiPost(`${urlsApi.events.convertToMember}?id=${regId}`, body);
  },

  importRegistrations: (eventId: string, formData: FormData) => {
    return fetch(`${urlsApi.events.importRegistrations}?eventId=${eventId}`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  },

  // ═══ Payment Proof ══════════════════════════════════════════════════════
  submitPaymentProof: (regId: string, body: { imageUrl: string }) => {
    return apiPost(`${urlsApi.events.submitPaymentProof}?id=${regId}`, body);
  },

  reviewPaymentProof: (regId: string, body: { approved: boolean; rejectReason?: string }) => {
    return apiPost(`${urlsApi.events.reviewPaymentProof}?id=${regId}`, body);
  },

  // ═══ Check-in / Check-out ══════════════════════════════════════════════
  checkIn: (regId: string, body?: { selectedDate?: string }) => {
    return apiPost(`${urlsApi.events.checkIn}?id=${regId}`, body);
  },

  checkOut: (regId: string) => {
    return apiPost(`${urlsApi.events.checkOut}?id=${regId}`);
  },

  // ═══ Service Usage (đặc thù) ═══════════════════════════════════════════
  listServiceUsage: (registrationId: string, signal?: AbortSignal) => {
    return apiGet(urlsApi.events.listServiceUsage, { registrationId }, signal);
  },

  addServiceUsage: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.events.addServiceUsage, body);
  },

  removeServiceUsage: (id: string) => {
    return apiDelete(urlsApi.events.removeServiceUsage, { id });
  },

  // ═══ Comments (yc tester 2026-05-06 — swap LS → API) ═══════════════════
  listCommentsPublic: (
    eventId: string | number,
    params?: { includeHidden?: boolean; status?: string },
    signal?: AbortSignal,
  ) => {
    return apiGet(
      urlsApi.events.listCommentsPublic,
      { eventId, ...(params ?? {}) },
      signal,
    );
  },

  createCommentPublic: (eventId: string | number, body: Record<string, unknown>) => {
    return apiPost(`${urlsApi.events.createCommentPublic}?eventId=${eventId}`, body);
  },

  hideComment: (id: string | number, body?: { hidden_reason?: string }) => {
    return apiPost(`${urlsApi.events.hideComment}?id=${id}`, body ?? {});
  },

  unhideComment: (id: string | number) => {
    return apiPost(`${urlsApi.events.unhideComment}?id=${id}`, {});
  },

  approveComment: (id: string | number) => {
    return apiPost(`${urlsApi.events.approveComment}?id=${id}`, {});
  },

  rejectComment: (id: string | number) => {
    return apiPost(`${urlsApi.events.rejectComment}?id=${id}`, {});
  },
};
