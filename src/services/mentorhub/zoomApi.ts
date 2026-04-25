// [MH] MentorHub - Zoom integration API client
// Calls reborn-mentorhub-be endpoints under /api/v1/zoom/oauth/*

import axios from "axios";

// Base URL resolves from APP_API_URL env at build time (see vite.config)
const API_BASE = (import.meta as any).env?.APP_API_URL || "";

export interface ZoomConnectionStatus {
  connected: boolean;
  zoomEmail?: string;
  zoomDisplayName?: string;
  accountType?: string; // Basic / Licensed / On-prem
  pmi?: string;
  connectedAt?: string;
  lastRefreshedAt?: string;
  status?: "active" | "expired" | "revoked" | "error";
  lastError?: string;
}

export interface AuthorizeUrlResponse {
  authorizeUrl: string;
}

/**
 * Get the current mentor's Zoom connection status (shown in Settings UI).
 */
export async function getZoomStatus(mentorId: number): Promise<ZoomConnectionStatus> {
  const { data } = await axios.get<ZoomConnectionStatus>(
    `${API_BASE}/api/v1/zoom/oauth/status`,
    { params: { mentorId } }
  );
  return data;
}

/**
 * Start the OAuth flow: ask backend for the authorize URL, then redirect the browser there.
 * After the user grants access, Zoom will redirect to the backend /callback endpoint,
 * which will then redirect back to our frontend with ?zoom=connected or ?zoom=error.
 */
export async function connectZoom(mentorId: number, redirectAfter?: string): Promise<void> {
  const { data } = await axios.get<AuthorizeUrlResponse>(
    `${API_BASE}/api/v1/zoom/oauth/authorize`,
    { params: { mentorId, redirectAfter } }
  );
  window.location.href = data.authorizeUrl;
}

/**
 * Revoke tokens on Zoom side and remove local record.
 */
export async function disconnectZoom(mentorId: number): Promise<void> {
  await axios.delete(`${API_BASE}/api/v1/zoom/oauth/disconnect`, {
    params: { mentorId },
  });
}

/**
 * Check the URL query string for callback outcome. Returns one of:
 *   - "connected" (success)
 *   - "error" + reason/detail
 *   - null (not a callback)
 */
export function readZoomCallbackStatus(): { ok: boolean; reason?: string; detail?: string } | null {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("zoom");
  if (!status) return null;
  if (status === "connected") return { ok: true };
  if (status === "error") {
    return {
      ok: false,
      reason: params.get("reason") || "unknown",
      detail: params.get("detail") || undefined,
    };
  }
  return null;
}
