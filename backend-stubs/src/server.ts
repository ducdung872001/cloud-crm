import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error.js";
import { attachMentor } from "./middleware/auth.js";
import zoomRouter from "./routes/zoom.js";
import meetingNotesRouter from "./routes/meeting-notes.js";
import subscriptionRouter from "./routes/subscription.js";
import usageRouter from "./routes/usage.js";
import adminRouter from "./routes/admin.js";
import zaloRouter from "./routes/zalo.js";

const app = express();

app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan(config.env === "development" ? "dev" : "combined"));
app.use(attachMentor); // mock auth — gắn req.mentorId từ header x-mentor-id hoặc query

// Health check
app.get("/health", (_req, res) => res.json({ ok: true, env: config.env, ts: new Date().toISOString() }));

// API routes
app.use(`${config.apiBase}/zoom`, zoomRouter);
app.use(`${config.apiBase}/meeting-notes`, meetingNotesRouter);
app.use(`${config.apiBase}/subscription`, subscriptionRouter);
app.use(`${config.apiBase}/usage`, usageRouter);
app.use(`${config.apiBase}/admin`, adminRouter);
app.use(`${config.apiBase}/zalo`, zaloRouter);

// Webhook routes (không có /api/v1 prefix — Zoom/VNPay gọi trực tiếp)
app.post("/webhook/zoom", (await import("./routes/zoom.js")).zoomWebhookHandler);
app.post("/webhook/vnpay", (await import("./routes/subscription.js")).vnpayWebhookHandler);
app.post("/webhook/zalo", (await import("./routes/zalo.js")).zaloWebhookHandler);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`\n🚀 MentorHub BE stubs listening on http://localhost:${config.port}`);
  console.log(`   API base:  ${config.apiBase}`);
  console.log(`   Env:       ${config.env}`);
  console.log(`   CORS:      ${config.cors.origins.join(", ")}`);
  console.log(`   Health:    http://localhost:${config.port}/health\n`);
});
