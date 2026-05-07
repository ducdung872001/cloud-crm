import { db } from "../db/store.js";
import { ensureChecklist } from "./pre-class-checklist.js";
import type { SessionEntity } from "../db/types.js";

/**
 * Pre-class digest: 1 mentor → tổng quan các session sắp tới.
 *
 * Cấu trúc trả về tối ưu cho dashboard "Hôm nay / 24h / 7 ngày" + flag bottlenecks
 * (checklist chưa xong, payment outstanding).
 */

export interface DigestSession {
  sessionId: string;
  courseId: string;
  courseName: string;
  sessionNumber: number;
  title: string;
  scheduledAt: string;
  durationMin: number;
  studentsTotal: number;
  /** Progress checklist 0..1 */
  checklistProgress: number;
  /** Item nào còn thiếu (key) — top 3 */
  blockingItems: string[];
  paymentOutstandingCount: number;
  zoomConnected: boolean;
  /** Số giờ tới session (negative = đã qua) */
  hoursUntilStart: number;
}

export interface DigestBucket {
  label: string;
  sessions: DigestSession[];
}

export interface PreClassDigest {
  mentorId: string;
  generatedAt: string;
  /** Tổng số session sắp tới (chưa qua) */
  upcomingTotal: number;
  buckets: {
    next24h: DigestBucket;
    next48h: DigestBucket;
    next7d: DigestBucket;
    later: DigestBucket;
  };
  /** Tổng số HV chưa thanh toán across all upcoming sessions */
  paymentOutstandingTotal: number;
  /** Mentor stats nhanh */
  mentorStats: {
    totalCourses: number;
    activeCourses: number;
    upcomingSessions7d: number;
  };
}

const HOUR = 60 * 60_000;

export function buildDigest(mentorId: string, now = new Date()): PreClassDigest {
  const sessions = Array.from(db.sessions.values())
    .filter((s) => s.mentorId === mentorId && s.status === "scheduled")
    .filter((s) => new Date(s.scheduledAt).getTime() >= now.getTime() - HOUR) // include session đang chuẩn bị bắt đầu
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const buckets: PreClassDigest["buckets"] = {
    next24h: { label: "Trong 24h", sessions: [] },
    next48h: { label: "24h–48h", sessions: [] },
    next7d:  { label: "2–7 ngày", sessions: [] },
    later:   { label: "Sau 7 ngày", sessions: [] },
  };

  let paymentOutstandingTotal = 0;
  for (const s of sessions) {
    const ds = projectSession(s, now);
    paymentOutstandingTotal += ds.paymentOutstandingCount;
    if (ds.hoursUntilStart < 24) buckets.next24h.sessions.push(ds);
    else if (ds.hoursUntilStart < 48) buckets.next48h.sessions.push(ds);
    else if (ds.hoursUntilStart < 24 * 7) buckets.next7d.sessions.push(ds);
    else buckets.later.sessions.push(ds);
  }

  const courses = Array.from(db.courses.values()).filter((c) => c.ownerMentorId === mentorId);
  return {
    mentorId,
    generatedAt: now.toISOString(),
    upcomingTotal: sessions.length,
    buckets,
    paymentOutstandingTotal,
    mentorStats: {
      totalCourses: courses.length,
      activeCourses: courses.filter((c) => c.status === "active").length,
      upcomingSessions7d: sessions.filter((s) => {
        const h = (new Date(s.scheduledAt).getTime() - now.getTime()) / HOUR;
        return h < 24 * 7;
      }).length,
    },
  };
}

function projectSession(s: SessionEntity, now: Date): DigestSession {
  const checklist = ensureChecklist(s.id);
  const blocking = checklist.items.filter((i) => !i.done).slice(0, 3).map((i) => i.key);
  const paymentItem = checklist.items.find((i) => i.key === "payment_received");
  const paymentOutstandingCount = paymentItem
    ? Math.max((paymentItem.studentsTotal ?? 0) - (paymentItem.studentsDone ?? 0), 0)
    : 0;
  const course = db.courses.get(s.courseId);
  const zoom = db.zoomConnections.get(s.mentorId);
  return {
    sessionId: s.id,
    courseId: s.courseId,
    courseName: course?.name ?? s.courseId,
    sessionNumber: s.sessionNumber,
    title: s.title,
    scheduledAt: s.scheduledAt,
    durationMin: s.durationMin ?? 90,
    studentsTotal: course?.studentIds.length ?? 0,
    checklistProgress: checklist.progress,
    blockingItems: blocking,
    paymentOutstandingCount,
    zoomConnected: zoom?.connected ?? false,
    hoursUntilStart: (new Date(s.scheduledAt).getTime() - now.getTime()) / HOUR,
  };
}
