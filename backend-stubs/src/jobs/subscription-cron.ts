import { runLifecycleTick, drainLifecycleEvents } from "../services/subscription-lifecycle.js";
import { runReminderTick, drainReminderEvents } from "../services/pre-class-reminder.js";
import { checkMcpHealth, isMcpEnabled } from "../services/mcp-client.js";
import { runPoolScanner } from "../services/zoom-pool.js";

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
    if (isMcpEnabled()) void checkMcpHealth(); // fire-and-forget, không block tick
    const lifecycle = runLifecycleTick();
    const reminder = runReminderTick();
    const pool = runPoolScanner();
    if (pool.expired > 0 || pool.released > 0) {
      console.log(`[cron] pool: expired=${pool.expired} released=${pool.released}`);
    }
    const lifecycleEvents = drainLifecycleEvents();
    const reminderEvents = drainReminderEvents();
    const totalEvents = lifecycleEvents.length + reminderEvents.length;
    if (lifecycle.events > 0 || reminder.events > 0 || totalEvents > 0) {
      console.log(`[cron] tick ${Date.now() - start}ms · lifecycle=${lifecycle.events} · reminder=${reminder.events} · events=${totalEvents}`);
      for (const ev of lifecycleEvents) {
        console.log(`[cron]   - ${ev.type} mentor=${ev.mentorId}${ev.invoiceId ? ` invoice=${ev.invoiceId}` : ""}${ev.days != null ? ` days=${ev.days}` : ""}`);
      }
      for (const ev of reminderEvents) {
        console.log(`[cron]   - ${ev.type} ${ev.trigger} session=${ev.sessionId} audience=${ev.audience} mins=${ev.minutesUntilStart}`);
      }
      // TODO: POST sang notification service (reborn-notihub) — sẽ handoff Phase 4
    }
  } catch (e) {
    console.error("[cron] tick failed", e);
  }
}
