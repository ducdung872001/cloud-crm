import { db } from "../db/store.js";
import type { MentorOnboardingState } from "../db/types.js";

/**
 * Mentor onboarding state machine — 5 step linear:
 *   1. zoom_connected
 *   2. zalo_connected
 *   3. first_course_created
 *   4. first_student_invited
 *   5. first_session_scheduled
 *
 * `completedAt` set khi tất cả 5 step done. Không có rollback — onboard 1 lần.
 */

const STEP_KEYS: (keyof MentorOnboardingState["steps"])[] = [
  "zoom_connected",
  "zalo_connected",
  "first_course_created",
  "first_student_invited",
  "first_session_scheduled",
];

export function getOrInitState(mentorId: string, tenantId?: string): MentorOnboardingState {
  let state = db.mentorOnboarding.get(mentorId);
  if (!state) {
    state = {
      mentorId,
      tenantId: tenantId ?? `TENANT-${mentorId}`,
      steps: {
        zoom_connected: false,
        zalo_connected: false,
        first_course_created: false,
        first_student_invited: false,
        first_session_scheduled: false,
      },
      updatedAt: new Date().toISOString(),
    };
    db.mentorOnboarding.set(mentorId, state);
  }
  return state;
}

export function markStep(
  mentorId: string,
  step: keyof MentorOnboardingState["steps"],
  done: boolean,
): MentorOnboardingState {
  const state = getOrInitState(mentorId);
  state.steps[step] = done;
  state.updatedAt = new Date().toISOString();
  if (STEP_KEYS.every((k) => state.steps[k]) && !state.completedAt) {
    state.completedAt = new Date().toISOString();
  } else if (!STEP_KEYS.every((k) => state.steps[k])) {
    state.completedAt = undefined;
  }
  return state;
}

export interface OnboardingProgress {
  mentorId: string;
  steps: { key: keyof MentorOnboardingState["steps"]; done: boolean; order: number; label: string }[];
  completedSteps: number;
  totalSteps: number;
  /** Step kế tiếp cần làm (key) hoặc null nếu xong hết */
  nextStep: keyof MentorOnboardingState["steps"] | null;
  completedAt?: string;
  progressPct: number;
}

const STEP_LABELS: Record<keyof MentorOnboardingState["steps"], string> = {
  zoom_connected: "Kết nối tài khoản Zoom",
  zalo_connected: "Kết nối Zalo OA",
  first_course_created: "Tạo khoá học đầu tiên",
  first_student_invited: "Mời học viên đầu tiên",
  first_session_scheduled: "Lên lịch buổi học đầu tiên",
};

export function progressFor(mentorId: string): OnboardingProgress {
  const state = getOrInitState(mentorId);
  const steps = STEP_KEYS.map((k, i) => ({
    key: k,
    order: i + 1,
    done: state.steps[k],
    label: STEP_LABELS[k],
  }));
  const done = steps.filter((s) => s.done).length;
  const next = STEP_KEYS.find((k) => !state.steps[k]) ?? null;
  return {
    mentorId,
    steps,
    completedSteps: done,
    totalSteps: STEP_KEYS.length,
    nextStep: next,
    completedAt: state.completedAt,
    progressPct: Math.round((done / STEP_KEYS.length) * 100),
  };
}

/**
 * Auto-advance: gọi từ các handler khác khi event xảy ra (Zoom OAuth callback,
 * course CRUD, etc.) → set step done thay vì FE phải PATCH thủ công.
 */
export function autoAdvance(mentorId: string, step: keyof MentorOnboardingState["steps"]): MentorOnboardingState {
  return markStep(mentorId, step, true);
}
