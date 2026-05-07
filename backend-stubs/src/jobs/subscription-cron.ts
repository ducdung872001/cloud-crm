import { runLifecycleTick, drainLifecycleEvents } from "../services/subscription-lifecycle.js";

/**
 * Lifecycle cron — chạy mỗi 15 phút.
 *
 * Production: chuyển sang BullMQ schedule hoặc cron deploy ở K8s CronJob.
 * Stub: setInterval đơn giản, start cùng server.
 *
 * Mỗi tick:
 *   1. runLifecycleTick() — process trial expire, renewal, reminder
 *   2. drainLifecycleEvents() — push event sang notification (TODO)
 *      Hiện chỉ console.log để observe.
 */

const TICK_MS = 15 * 60 * 1000;

let timer: NodeJS.Timeout | null = null;

export function startSubscriptionCron() {
  if (timer) return;
  // Chạy 1 lần ngay sau boot để xử lý events backlog
  setTimeout(tick, 5_000).unref();
  timer = setInterval(tick, TICK_MS);
  timer.unref();
  console.log(`[cron] Subscription lifecycle started — tick mỗi ${TICK_MS / 60_000} phút`);
}

export function stopSubscriptionCron() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function tick() {
  try {
    const start = Date.now();
    const result = runLifecycleTick();
    const events = drainLifecycleEvents();
    if (result.events > 0 || events.length > 0) {
      console.log(`[cron] tick ${Date.now() - start}ms · processed=${result.events} · events=${events.length}`);
      for (const ev of events) {
        console.log(`[cron]   - ${ev.type} mentor=${ev.mentorId}${ev.invoiceId ? ` invoice=${ev.invoiceId}` : ""}${ev.days != null ? ` days=${ev.days}` : ""}`);
        // TODO: POST tới notification service (reborn-notihub) — handoff Phase 3
      }
    }
  } catch (e) {
    console.error("[cron] tick failed", e);
  }
}
