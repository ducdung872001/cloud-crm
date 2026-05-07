import { db } from "../db/store.js";
import type { Course, SessionEntity } from "../db/types.js";

/**
 * Per-course + per-student journey reports.
 *
 * Per-course: aggregate stats — attendance %, avg engagement, completion rate, NPS
 * Per-student: timeline events — enrolled, attended sessions, AI breakdowns gửi, ZNS sent, payment status
 */

export interface CourseReport {
  courseId: string;
  courseName: string;
  studentsTotal: number;
  sessionsTotal: number;
  sessionsCompleted: number;
  /** % attendance trung bình across sessions */
  avgAttendancePct: number;
  /** Engagement score trung bình */
  avgEngagementScore: number;
  /** Completion rate: số HV xem ≥80% session / total */
  completionRatePct: number;
  /** NPS từ feedback */
  npsScore: number;
  /** Status break breakdown */
  statusBreakdown: { status: string; count: number }[];
  generatedAt: string;
}

export function reportCourse(courseId: string): CourseReport | null {
  const course = db.courses.get(courseId);
  if (!course) return null;

  const sessions = Array.from(db.sessions.values()).filter((s) => s.courseId === courseId);
  const sessionsCompleted = sessions.filter((s) => s.status === "ended").length;

  // Stub stats — production tính từ attendance log + meeting note
  const meetingNotes = Array.from(db.meetingNotes.values()).filter((n) => n.courseId === courseId);
  const attendances = meetingNotes
    .map((n) => n.attendance)
    .filter((a): a is NonNullable<typeof a> => a != null);
  const avgAttendancePct = attendances.length > 0
    ? attendances.reduce((s, a) => s + (a.present / Math.max(a.total, 1)) * 100, 0) / attendances.length
    : 0;

  // Status histogram
  const statusMap = new Map<string, number>();
  for (const s of sessions) {
    statusMap.set(s.status, (statusMap.get(s.status) ?? 0) + 1);
  }

  return {
    courseId,
    courseName: course.name,
    studentsTotal: course.studentIds.length,
    sessionsTotal: sessions.length,
    sessionsCompleted,
    avgAttendancePct: Math.round(avgAttendancePct * 10) / 10,
    avgEngagementScore: meetingNotes.length > 0 ? 75 : 0,    // stub — production: compute từ per-student data
    completionRatePct: sessionsCompleted > 0 ? Math.round((sessionsCompleted / Math.max(sessions.length, 1)) * 100) : 0,
    npsScore: 4.7,                                            // stub — production: từ feedback
    statusBreakdown: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
    generatedAt: new Date().toISOString(),
  };
}

export interface StudentJourneyEvent {
  type:
    | "enrolled"
    | "session_attended"
    | "session_missed"
    | "ai_breakdown_received"
    | "zalo_msg_sent"
    | "payment_received"
    | "feedback_submitted";
  occurredAt: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface StudentJourney {
  studentId: string;
  courseIds: string[];
  totalSessions: number;
  attended: number;
  missed: number;
  events: StudentJourneyEvent[];
  /** Last touch timestamp */
  lastEngagedAt?: string;
  /** Sentiment trung bình từ AI breakdown */
  sentimentAvg: "positive" | "neutral" | "negative";
  generatedAt: string;
}

export function reportStudent(studentId: string, tenantId: string): StudentJourney | null {
  // Find courses include student
  const courses = Array.from(db.courses.values())
    .filter((c) => c.tenantId === tenantId && c.studentIds.includes(studentId));
  if (courses.length === 0) return null;

  const courseIds = courses.map((c) => c.id);
  const sessions = Array.from(db.sessions.values()).filter((s) => courseIds.includes(s.courseId));

  // Build events timeline
  const events: StudentJourneyEvent[] = [];

  // Enrolled events: synthesize from course createdAt
  for (const c of courses) {
    events.push({
      type: "enrolled",
      occurredAt: c.createdAt,
      description: `Đăng ký khoá "${c.name}"`,
      metadata: { courseId: c.id },
    });
  }

  // Session-related events from meeting notes
  const meetingNotes = Array.from(db.meetingNotes.values())
    .filter((n) => courseIds.includes(n.courseId));
  for (const note of meetingNotes) {
    // Simplified: assume student attended (real impl: per-student attendance row)
    events.push({
      type: "session_attended",
      occurredAt: note.createdAt,
      description: `Tham gia buổi ${note.sessionNumber}: ${note.sessionTitle}`,
      metadata: { sessionId: note.id, courseId: note.courseId },
    });
  }

  // Sort by occurredAt asc
  events.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const lastEngagedAt = events[events.length - 1]?.occurredAt;

  return {
    studentId,
    courseIds,
    totalSessions: sessions.length,
    attended: events.filter((e) => e.type === "session_attended").length,
    missed: events.filter((e) => e.type === "session_missed").length,
    events,
    lastEngagedAt,
    sentimentAvg: "positive", // stub
    generatedAt: new Date().toISOString(),
  };
}
