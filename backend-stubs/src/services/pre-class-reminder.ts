import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { ReminderTrigger, SentReminder } from "../db/types.js";

/**
 * Auto-reminder service: quét sessions sắp tới + emit reminder events tại
 * các mốc D-3, D-1, H-2.
 *
 * Idempotent qua `db.sentReminders` log: cùng (sessionId, trigger) chỉ fire 1 lần.
 *
 * Audience:
 *   D-3 → mentor (chuẩn bị sớm)
 *   D-1 → both (mentor + students)
 *   H-2 → both (last-call)
 */

export interface ReminderEvent {
  type: "pre_class_reminder";
  trigger: ReminderTrigger;
  sessionId: string;
  courseId: string;
  mentorId: string;
  tenantId: string;
  audience: "mentor" | "students" | "both";
  scheduledAt: string;
  /** Phút tới session (negative = đã qua) */
  minutesUntilStart: number;
  occurredAt: string;
}

const eventQueue: ReminderEvent[] = [];

function emit(event: Omit<ReminderEvent, "occurredAt">) {
  eventQueue.push({ ...event, occurredAt: new Date().toISOString() });
}

export function drainReminderEvents(): ReminderEvent[] {
  return eventQueue.splice(0, eventQueue.length);
}

/** ±15 phút cho mỗi mốc — match với tick interval 15p để không miss. */
const TRIGGER_WINDOWS: { trigger: ReminderTrigger; minMin: number; maxMin: number; audience: ReminderEvent["audience"] }[] = [
  { trigger: "D-3", minMin: 3 * 24 * 60 - 15, maxMin: 3 * 24 * 60 + 15, audience: "mentor" },
  { trigger: "D-1", minMin: 1 * 24 * 60 - 15, maxMin: 1 * 24 * 60 + 15, audience: "both" },
  { trigger: "H-2", minMin: 2 * 60 - 15,      maxMin: 2 * 60 + 15,      audience: "both" },
];

function alreadySent(sessionId: string, trigger: ReminderTrigger): boolean {
  return db.sentReminders.some((r) => r.sessionId === sessionId && r.trigger === trigger);
}

export function runReminderTick(now = new Date()): { events: number } {
  let count = 0;
  for (const session of db.sessions.values()) {
    if (session.status !== "scheduled") continue;
    const minutes = (new Date(session.scheduledAt).getTime() - now.getTime()) / 60_000;
    if (minutes < 0) continue;

    for (const w of TRIGGER_WINDOWS) {
      if (minutes < w.minMin || minutes > w.maxMin) continue;
      if (alreadySent(session.id, w.trigger)) continue;

      // Record + emit
      const log: SentReminder = {
        id: "RMD-" + uuid().slice(0, 8),
        tenantId: session.tenantId,
        sessionId: session.id,
        trigger: w.trigger,
        audience: w.audience,
        sentAt: new Date().toISOString(),
      };
      db.sentReminders.push(log);
      emit({
        type: "pre_class_reminder",
        trigger: w.trigger,
        sessionId: session.id,
        courseId: session.courseId,
        mentorId: session.mentorId,
        tenantId: session.tenantId,
        audience: w.audience,
        scheduledAt: session.scheduledAt,
        minutesUntilStart: Math.round(minutes),
      });
      count++;
    }
  }
  return { events: count };
}
