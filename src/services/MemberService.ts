// Member Service — API calls cho Community Hub members (luồng B + C).
// Prefix: /bizapi/market/community-hub/members/...
// Handoff: docs/handoff/20260508-1100-community-hub-member-flows.md
//
// Public endpoints (no auth): createSignupRequest, loginByCode, setPassword, forgotPassword.
// Admin endpoints (Authorization Bearer + Hostname tenant): list/approve/reject signup-request,
// listMembers, getMember.

import { apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export default {
  // ═══ Signup request (luồng B) ═══════════════════════════════════════════
  /** Public: tạo yêu cầu cấp mã. Body: { fullName, phone, email?, occupation?, fromEventId?, fromRegistrationId? } */
  createSignupRequest: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.communityHubMembers.createSignupRequest, body);
  },

  /** Admin: list signup requests. */
  listSignupRequests: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.communityHubMembers.listSignupRequests, params, signal);
  },

  /** Admin: approve. Tạo MemberEntity + sinh memberCode. */
  approveSignupRequest: (reqId: string, body?: Record<string, unknown>) => {
    return apiPost(`${urlsApi.communityHubMembers.approveSignupRequest}?id=${reqId}`, body ?? {});
  },

  /** Admin: reject. Body: { reason } */
  rejectSignupRequest: (reqId: string, body: { reason: string }) => {
    return apiPost(`${urlsApi.communityHubMembers.rejectSignupRequest}?id=${reqId}`, body);
  },

  // ═══ Member auth (luồng C) ═══════════════════════════════════════════════
  /** Public: verify memberCode + password. Response: { code:0, result: { member, token? } } */
  loginByCode: (body: { memberCode: string; password: string }) => {
    return apiPost(urlsApi.communityHubMembers.loginByCode, body);
  },

  setPassword: (body: { memberCode: string; otpCode?: string; resetToken?: string; newPassword: string }) => {
    return apiPost(urlsApi.communityHubMembers.setPassword, body);
  },

  forgotPassword: (body: { memberCode: string; phoneOrEmail: string }) => {
    return apiPost(urlsApi.communityHubMembers.forgotPassword, body);
  },

  // ═══ Member CRUD (admin) ═══════════════════════════════════════════════
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.communityHubMembers.listMembers, params, signal);
  },

  get: (id: string, signal?: AbortSignal) => {
    return apiGet(urlsApi.communityHubMembers.getMember, { id }, signal);
  },

  getByCode: (code: string, signal?: AbortSignal) => {
    return apiGet(urlsApi.communityHubMembers.getMemberByCode, { code }, signal);
  },
};
