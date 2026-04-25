import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db/store.js";
import { config } from "../config.js";
import { sendZaloPush, ZALO_TEMPLATES } from "../services/zalo.js";

const router = Router();

// GET /zalo/oauth/login — redirect mentor sang Zalo OAuth
router.get("/oauth/login", (req, res) => {
  const redirectAfter = (req.query.redirectAfter as string) ?? "http://localhost:4000/crm/mh/dashboard";
  const state = Buffer.from(JSON.stringify({ redirectAfter })).toString("base64");
  const url =
    `https://oauth.zaloapp.com/v4/permission?app_id=${config.zalo.appId}` +
    `&redirect_uri=${encodeURIComponent("http://localhost:8080/api/v1/zalo/oauth/callback")}` +
    `&state=${state}`;
  res.json({ authorizeUrl: url });
});

// GET /zalo/oauth/callback
router.get("/oauth/callback", async (req, res) => {
  // TODO: exchange code → token → fetch /v2.0/me
  // Mock:
  const mockZaloUser = { id: "zalo_" + Date.now(), displayName: "Mentor Zalo Demo", phone: null, avatar: null };
  const mentorId = "MT-001"; // trong production: create hoặc map mentor từ zaloUserId

  db.zaloMappings.set(mentorId, {
    mentorId,
    zaloUserId: mockZaloUser.id,
    displayName: mockZaloUser.displayName,
    oaFollowed: false,
    linkedAt: new Date().toISOString(),
  });

  const { redirectAfter } = JSON.parse(Buffer.from((req.query.state as string) ?? "", "base64").toString() || "{}");
  res.redirect((redirectAfter ?? "http://localhost:4000/crm/mh/dashboard") + "?zalo=linked");
});

// POST /zalo/oa/push — gửi push notification tới mentor qua OA
const pushSchema = z.object({
  template: z.enum(Object.keys(ZALO_TEMPLATES) as [string, ...string[]]),
  params: z.record(z.unknown()),
});
router.post("/oa/push", async (req, res) => {
  const body = pushSchema.parse(req.body);
  const mapping = db.zaloMappings.get(req.mentorId);
  if (!mapping) return res.status(400).json({ error: "Mentor chưa liên kết Zalo" });
  if (!mapping.oaFollowed) return res.status(400).json({ error: "Mentor chưa kết bạn OA MentorHub" });

  const result = await sendZaloPush({
    zaloUserId: mapping.zaloUserId,
    template: body.template,
    params: body.params,
  });
  res.json(result);
});

// GET /zalo/mini-app/session — endpoint Mini App gọi để lấy session/auth context
router.get("/mini-app/session", (req, res) => {
  const mapping = db.zaloMappings.get(req.mentorId);
  const sub = db.subscriptions.get(req.mentorId);
  res.json({
    mentorId: req.mentorId,
    zaloLinked: !!mapping,
    oaFollowed: mapping?.oaFollowed ?? false,
    subscription: sub ? { plan: sub.plan, status: sub.status } : null,
  });
});

// ── Webhook Zalo OA (mounted /webhook/zalo) ──────────────────────────────────
export async function zaloWebhookHandler(req: Request, res: Response) {
  const event = req.body;
  // event_name: user_send_text, user_send_image, follow, unfollow, ...
  switch (event.event_name) {
    case "follow":
      // user kết bạn OA → cập nhật oaFollowed
      updateOaFollowed(event.follower?.id, true);
      break;
    case "unfollow":
      updateOaFollowed(event.follower?.id, false);
      break;
    case "user_send_text":
      // TODO: parse command hoặc gọi Claude để xử lý natural language
      // await handleChatbotCommand(event.sender.id, event.message.text);
      break;
  }
  res.json({ ok: true });
}

function updateOaFollowed(zaloUserId: string | undefined, followed: boolean) {
  if (!zaloUserId) return;
  for (const mapping of db.zaloMappings.values()) {
    if (mapping.zaloUserId === zaloUserId) {
      mapping.oaFollowed = followed;
      return;
    }
  }
}

export default router;
