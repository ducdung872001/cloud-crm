import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db/store.js";
import { config } from "../config.js";
import { queueTranscribeJob } from "../jobs/transcribe.js";

const router = Router();

// GET /zoom/oauth/status
router.get("/oauth/status", (req, res) => {
  const conn = db.zoomConnections.get(req.mentorId);
  if (!conn) return res.json({ connected: false });
  res.json({
    connected: conn.connected,
    status: conn.status,
    zoomEmail: conn.zoomEmail,
    zoomDisplayName: conn.zoomDisplayName,
    zoomAccountType: conn.zoomAccountType,
    connectedAt: conn.connectedAt,
  });
});

// GET /zoom/oauth/authorize — trả authorizeUrl để FE redirect
router.get("/oauth/authorize", (req, res) => {
  const redirectAfter = z.string().url().parse(req.query.redirectAfter);
  const state = Buffer.from(JSON.stringify({ mentorId: req.mentorId, redirectAfter })).toString("base64");
  const authorizeUrl =
    `https://zoom.us/oauth/authorize?response_type=code` +
    `&client_id=${encodeURIComponent(config.zoom.clientId)}` +
    `&redirect_uri=${encodeURIComponent(config.zoom.redirectUri)}` +
    `&state=${encodeURIComponent(state)}`;
  res.json({ authorizeUrl });
});

// GET /zoom/oauth/callback — Zoom redirect về đây sau khi user authorize
router.get("/oauth/callback", async (req, res) => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    const { mentorId, redirectAfter } = JSON.parse(Buffer.from(state, "base64").toString());

    // TODO: exchange code for access_token tại https://zoom.us/oauth/token
    // const tokenRes = await fetch("https://zoom.us/oauth/token", { method: "POST", ... });
    // Mock:
    const mockZoom = { email: "mentor@mentorhub.vn", displayName: "Nguyễn Trọng Khoa", accountType: "licensed" as const };

    db.zoomConnections.set(mentorId, {
      mentorId,
      connected: true,
      status: "active",
      zoomEmail: mockZoom.email,
      zoomDisplayName: mockZoom.displayName,
      zoomAccountType: mockZoom.accountType,
      accessToken: "mock_access_" + code.slice(0, 8),
      refreshToken: "mock_refresh",
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      connectedAt: new Date().toISOString(),
    });

    const url = new URL(redirectAfter);
    url.searchParams.set("zoom", "connected");
    url.searchParams.set("email", mockZoom.email);
    res.redirect(url.toString());
  } catch (e) {
    res.redirect(`http://localhost:4000/crm/mh/settings?zoom=error&reason=${encodeURIComponent(String(e))}`);
  }
});

// DELETE /zoom/oauth/disconnect
router.delete("/oauth/disconnect", (req, res) => {
  db.zoomConnections.delete(req.mentorId);
  res.status(204).end();
});

// ── Webhook (mounted at /webhook/zoom, không phải /api/v1) ──────────────────
export async function zoomWebhookHandler(req: Request, res: Response) {
  const { event, payload } = req.body;

  // 1. Endpoint validation (Zoom gửi khi đăng ký webhook URL)
  if (event === "endpoint.url_validation") {
    const crypto = await import("node:crypto");
    const hashForValidate = crypto
      .createHmac("sha256", config.zoom.webhookSecret)
      .update(payload.plainToken)
      .digest("hex");
    return res.json({ plainToken: payload.plainToken, encryptedToken: hashForValidate });
  }

  // 2. Recording completed → trigger pipeline
  if (event === "recording.completed") {
    const zoomUserId = payload.object.host_id;
    const mentorId = findMentorByZoomUserId(zoomUserId) ?? "MT-001";
    const recordingFiles = payload.object.recording_files ?? [];
    const mp4 = recordingFiles.find((f: { file_type: string }) => f.file_type === "MP4");
    if (!mp4) return res.status(200).json({ ok: true, skipped: "no MP4" });

    // Queue job: download + transcribe + summarize
    queueTranscribeJob({
      mentorId,
      zoomMeetingId: String(payload.object.id),
      downloadUrl: mp4.download_url,
      downloadToken: payload.download_token, // hiệu lực 7 ngày
      recordingStart: mp4.recording_start,
    });

    return res.json({ ok: true, queued: true });
  }

  // 3. meeting.started / meeting.ended → có thể dùng cho live attendance
  res.json({ ok: true });
}

function findMentorByZoomUserId(zoomUserId: string): string | null {
  for (const [mentorId, conn] of db.zoomConnections) {
    if (conn.zoomUserId === zoomUserId) return mentorId;
  }
  return null;
}

export default router;
