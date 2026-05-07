import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { PreClassChecklist, PreClassChecklistItem, ChecklistItemKey } from "../db/types.js";

/**
 * Pre-class checklist — 6 item chuẩn cho mỗi session sắp tới.
 *
 * Auto-rules:
 *   - Khi session được tạo → ensureChecklist() tạo bộ checklist mặc định.
 *   - Khi event "zoom_meeting_created" / "payment_webhook" / "invite_sent" xảy ra
 *     → autoTickItem() set done=true.
 *   - Mentor có thể manual tick các item còn lại (talking_points, slide).
 */

const DEFAULT_ITEMS: { key: ChecklistItemKey; label: string }[] = [
  { key: "zoom_link_created",   label: "Tạo link Zoom + gửi đến HV" },
  { key: "payment_received",    label: "HV đã thanh toán đầy đủ" },
  { key: "invite_sent",         label: "Đã gửi lời mời tham gia + lịch" },
  { key: "oa_optin",            label: "HV đã follow OA Zalo (để nhận ZNS)" },
  { key: "talking_points_ready",label: "Talking points / outline buổi học" },
  { key: "slide_uploaded",      label: "Slide / tài liệu đã upload" },
];

export function ensureChecklist(sessionId: string): PreClassChecklist {
  const existing = db.preClassChecklists.get(sessionId);
  if (existing) return existing;

  const session = db.sessions.get(sessionId);
  if (!session) throw new Error(`[checklist] Session ${sessionId} not found`);

  const course = db.courses.get(session.courseId);
  const studentsTotal = course?.studentIds.length ?? 0;

  const items: PreClassChecklistItem[] = DEFAULT_ITEMS.map((d) => ({
    key: d.key,
    label: d.label,
    done: false,
    studentsTotal: ["payment_received", "invite_sent", "oa_optin"].includes(d.key) ? studentsTotal : undefined,
    studentsDone: ["payment_received", "invite_sent", "oa_optin"].includes(d.key) ? 0 : undefined,
  }));

  const checklist: PreClassChecklist = {
    id: "CHK-" + uuid().slice(0, 8),
    tenantId: session.tenantId,
    sessionId,
    courseId: session.courseId,
    mentorId: session.mentorId,
    items,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.preClassChecklists.set(sessionId, checklist);
  return checklist;
}

export function autoTickItem(
  sessionId: string,
  key: ChecklistItemKey,
  source: "zoom_meeting_created" | "payment_webhook" | "invite_sent_event" | "manual",
  studentsDoneDelta = 0,
): PreClassChecklist {
  const checklist = ensureChecklist(sessionId);
  const item = checklist.items.find((i) => i.key === key);
  if (!item) return checklist;

  if (item.studentsTotal != null) {
    item.studentsDone = Math.min((item.studentsDone ?? 0) + studentsDoneDelta, item.studentsTotal);
    item.done = item.studentsDone >= item.studentsTotal;
  } else {
    item.done = true;
  }
  if (item.done) {
    item.doneAt = new Date().toISOString();
    item.autoTickedBy = source;
  }
  recomputeProgress(checklist);
  return checklist;
}

export function manualToggle(sessionId: string, key: ChecklistItemKey, done: boolean): PreClassChecklist {
  const checklist = ensureChecklist(sessionId);
  const item = checklist.items.find((i) => i.key === key);
  if (!item) return checklist;
  item.done = done;
  item.autoTickedBy = "manual";
  item.doneAt = done ? new Date().toISOString() : undefined;
  recomputeProgress(checklist);
  return checklist;
}

function recomputeProgress(checklist: PreClassChecklist) {
  const total = checklist.items.length;
  const done = checklist.items.filter((i) => i.done).length;
  checklist.progress = total === 0 ? 0 : done / total;
  checklist.updatedAt = new Date().toISOString();
}

export function getChecklist(sessionId: string): PreClassChecklist | undefined {
  return db.preClassChecklists.get(sessionId);
}

export function listChecklistsForMentor(mentorId: string): PreClassChecklist[] {
  return Array.from(db.preClassChecklists.values()).filter((c) => c.mentorId === mentorId);
}
