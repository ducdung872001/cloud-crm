// Zoom OAuth + meeting client — wires /integration/zoom/*.
// Per cloud-crm#212 / cloud-integration-master#10 reply (commits b4a3712..c06175b, master).
//
// Tenant gating: BE check tenants.zoom_enabled = 1 trước khi cho phép. Nếu = 0 → 403.
// Token security: BE store access/refresh AES-256-GCM encrypted. Refresh scheduler 30min cron.
// Webhook (recording.completed): BE auto-publish cloud-bpm-trigger với processCode=ai-lecture-pipeline.
import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export type ZoomAccountStatus = {
  linked: boolean;
  zoomEmail?: string;
  zoomUserId?: string;
  scope?: string;
  status?: string;
  linkedAt?: string;
};

export type ZoomMeetingSettings = {
  autoRecord?: "local" | "cloud" | "none";
  joinBeforeHost?: boolean;
  muteOnEntry?: boolean;
  waitingRoom?: boolean;
};

export type ZoomMeetingCreateRequest = {
  mentorEmployeeId: number;
  topic: string;
  agenda?: string;
  startAt: string;          // ISO with offset
  durationMin: number;
  settings?: ZoomMeetingSettings;
  metadataOrderId?: number;
  metadataCourseId: number;
  metadataSessionIndex: number;
};

export type ZoomMeetingResult = {
  zoomMeetingId: string;
  joinUrl: string;
  startUrl: string;
  password?: string;
  topic?: string;
  startAt?: string;
  durationMin?: number;
  recordingStatus?: string;
};

export type ApiEnvelope<T> = {
  code: number;
  message?: string;
  result?: T;
};

export default {
  // Mentor click "Connect Zoom" → redirect to this URL → BE returns Zoom consent URL → window.location = it
  // Pattern: window.location.href = urlsApi.integrationZoom.oauthAuthorize + "?returnUrl=" + ...
  oauthAuthorizeUrl: (returnUrl: string) =>
    `${urlsApi.integrationZoom.oauthAuthorize}?returnUrl=${encodeURIComponent(returnUrl)}`,

  accountGet: (signal?: AbortSignal) =>
    apiGet(urlsApi.integrationZoom.accountGet, undefined, signal) as Promise<
      ApiEnvelope<ZoomAccountStatus>
    >,

  accountDisconnect: () =>
    apiPost(urlsApi.integrationZoom.accountDisconnect, {}) as Promise<
      ApiEnvelope<{ disconnected: boolean }>
    >,

  meetingCreate: (req: ZoomMeetingCreateRequest) =>
    apiPost(urlsApi.integrationZoom.meetingCreate, req as unknown as Record<string, unknown>) as Promise<
      ApiEnvelope<ZoomMeetingResult>
    >,

  meetingGetById: (zoomMeetingId: string, signal?: AbortSignal) =>
    apiGet(urlsApi.integrationZoom.meetingGet, { zoomMeetingId }, signal) as Promise<
      ApiEnvelope<ZoomMeetingResult>
    >,

  meetingGetBySession: (orderId: number, sessionIndex: number, signal?: AbortSignal) =>
    apiGet(urlsApi.integrationZoom.meetingGet, { orderId, sessionIndex }, signal) as Promise<
      ApiEnvelope<ZoomMeetingResult>
    >,

  meetingCancel: (zoomMeetingId: string, mentorEmployeeId: number) =>
    apiDelete(urlsApi.integrationZoom.meetingCancel, { zoomMeetingId, mentorEmployeeId }) as Promise<
      ApiEnvelope<{ cancelled: boolean }>
    >,
};
