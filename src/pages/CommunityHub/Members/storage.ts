// Members storage — API-first, fallback localStorage khi BE chưa sẵn sàng.
//
// BE handoff: xem docs/backend-tasks/community-hub/REQUIREMENTS-2026-05-05.md.

import type {
  MemberEntity,
  MemberSignupRequest,
  MemberHistoryItem,
  MemberStats,
  MemberGroup,
} from "./types";
import { buildMasterCode, buildMemberCode, deriveGroupSeqFromPersonal } from "./codeUtils";

const KEY_MEMBERS = "reborn.community_hub.members";
const KEY_GROUPS = "reborn.community_hub.member_groups";
const KEY_REQUESTS = "reborn.community_hub.member_signup_requests";
const KEY_HISTORY = "reborn.community_hub.member_history";

function readLS<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = window.localStorage.getItem(key); return r ? JSON.parse(r) as T : fb; } catch { return fb; }
}
function writeLS<T>(key: string, v: T): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(v)); } catch { /* */ }
}

function genId(prefix = "m"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Helper: tìm STT cá nhân tiếp theo. Local storage chỉ là prototype.
 *  Production BE sẽ dùng SEQUENCE / counter. */
function nextPersonalSeq(): number {
  const all = readLS<MemberEntity[]>(KEY_MEMBERS, []);
  if (!all.length) return 6001; // mặc định lên đầu 6, tiếp sau seed ~6000 hiện có
  const max = all.reduce((m, x) => Math.max(m, parseInt(x.identity.personalSeq, 10) || 0), 0);
  return max + 1;
}

export const memberStorage = {
  // ── Members ───────────────────────────────────────
  list(): MemberEntity[] {
    return readLS<MemberEntity[]>(KEY_MEMBERS, []);
  },

  get(id: string): MemberEntity | null {
    return this.list().find((m) => m.id === id) ?? null;
  },

  getByCode(memberCode: string): MemberEntity | null {
    return this.list().find((m) => m.memberCode === memberCode) ?? null;
  },

  /** Cấp mã định danh mới — dùng khi admin approve MemberSignupRequest hoặc tạo thủ công. */
  create(input: Omit<MemberEntity, "id" | "memberCode" | "identity" | "joinedAt" | "createdAt" | "updatedAt" | "passwordSet" | "status" | "roleCodes"> & {
    masterOfGroup?: number; // nếu user này là trưởng nhóm cho group N
  }): MemberEntity {
    const personalSeqNum = nextPersonalSeq();
    const groupSeq = deriveGroupSeqFromPersonal(personalSeqNum);
    const personalSeq = String(personalSeqNum);
    const masterCode = input.masterOfGroup ? buildMasterCode(input.masterOfGroup) : undefined;

    const member: MemberEntity = {
      id: genId("mem"),
      identity: { personalSeq, groupSeq, rank: personalSeq.charAt(0) },
      memberCode: buildMemberCode(personalSeq, groupSeq),
      masterCode,
      roleCodes: [],
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      occupation: input.occupation,
      avatarUrl: input.avatarUrl,
      birthday: input.birthday,
      gender: input.gender,
      address: input.address,
      passwordSet: false,
      status: "active",
      joinedAt: new Date().toISOString(),
      source: input.source ?? "manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const all = this.list();
    all.push(member);
    writeLS(KEY_MEMBERS, all);

    // Cập nhật / tạo group
    this.upsertGroup(groupSeq, member.id, masterCode);

    return member;
  },

  upsertGroup(groupSeq: number, memberId: string, masterCode?: string): MemberGroup {
    const groups = readLS<MemberGroup[]>(KEY_GROUPS, []);
    let g = groups.find((x) => x.groupSeq === groupSeq);
    if (!g) {
      g = {
        id: genId("grp"),
        groupSeq,
        memberIds: [],
        createdAt: new Date().toISOString(),
      };
      groups.push(g);
    }
    if (!g.memberIds.includes(memberId)) g.memberIds.push(memberId);
    if (masterCode) {
      g.masterCode = masterCode;
      g.leaderMemberId = memberId;
    }
    writeLS(KEY_GROUPS, groups);
    return g;
  },

  listGroups(): MemberGroup[] {
    return readLS<MemberGroup[]>(KEY_GROUPS, []);
  },

  // ── Signup requests (luồng B) ──────────────────────
  listRequests(): MemberSignupRequest[] {
    return readLS<MemberSignupRequest[]>(KEY_REQUESTS, []);
  },

  createRequest(input: Omit<MemberSignupRequest, "id" | "createdAt" | "status">): MemberSignupRequest {
    const req: MemberSignupRequest = {
      ...input,
      id: genId("req"),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const all = this.listRequests();
    all.push(req);
    writeLS(KEY_REQUESTS, all);
    return req;
  },

  approveRequest(reqId: string, by: string): MemberEntity | null {
    const all = this.listRequests();
    const idx = all.findIndex((r) => r.id === reqId);
    if (idx < 0 || all[idx].status !== "pending") return null;
    const r = all[idx];
    const member = this.create({
      fullName: r.fullName,
      phone: r.phone,
      email: r.email,
      occupation: r.occupation,
      source: "event_signup",
    });
    r.status = "approved";
    r.reviewedBy = by;
    r.reviewedAt = new Date().toISOString();
    r.issuedMemberCode = member.memberCode;
    all[idx] = r;
    writeLS(KEY_REQUESTS, all);
    return member;
  },

  rejectRequest(reqId: string, by: string, reason: string): MemberSignupRequest | null {
    const all = this.listRequests();
    const idx = all.findIndex((r) => r.id === reqId);
    if (idx < 0 || all[idx].status !== "pending") return null;
    all[idx] = { ...all[idx], status: "rejected", reviewedBy: by, reviewedAt: new Date().toISOString(), rejectReason: reason };
    writeLS(KEY_REQUESTS, all);
    return all[idx];
  },

  // ── Login luồng C ─────────────────────────────────
  /** Verify mã + pwd. Prototype: nếu memberCode tồn tại + passwordSet=true → check pwd field
   *  trong localStorage entry (đơn giản, KHÔNG dùng cho production). */
  loginByCode(memberCode: string, password: string): { ok: boolean; member?: MemberEntity; reason?: string } {
    const m = this.getByCode(memberCode);
    if (!m) return { ok: false, reason: "Mã không tồn tại" };
    if (!m.passwordSet) return { ok: false, reason: "Mật khẩu chưa được khởi tạo. Vui lòng liên hệ admin." };
    // localStorage prototype only: lưu pwd raw vào field tạm. Production: BE bcrypt + JWT.
    const pwdMap = readLS<Record<string, string>>("reborn.ch_member_pwd", {});
    if (pwdMap[m.memberCode] !== password) return { ok: false, reason: "Sai mật khẩu" };
    m.lastLoginAt = new Date().toISOString();
    const all = this.list();
    const i = all.findIndex((x) => x.id === m.id);
    if (i >= 0) { all[i] = m; writeLS(KEY_MEMBERS, all); }
    return { ok: true, member: m };
  },

  /** Admin set password. */
  setPassword(memberId: string, password: string): boolean {
    const all = this.list();
    const i = all.findIndex((m) => m.id === memberId);
    if (i < 0) return false;
    all[i].passwordSet = true;
    all[i].updatedAt = new Date().toISOString();
    writeLS(KEY_MEMBERS, all);
    const pwdMap = readLS<Record<string, string>>("reborn.ch_member_pwd", {});
    pwdMap[all[i].memberCode] = password;
    writeLS("reborn.ch_member_pwd", pwdMap);
    return true;
  },

  // ── History (timeline) ────────────────────────────
  appendHistory(item: Omit<MemberHistoryItem, "id" | "createdAt">): MemberHistoryItem {
    const all = readLS<MemberHistoryItem[]>(KEY_HISTORY, []);
    const h: MemberHistoryItem = {
      ...item,
      id: genId("hist"),
      createdAt: new Date().toISOString(),
    };
    all.push(h);
    writeLS(KEY_HISTORY, all);
    return h;
  },

  listHistory(memberId: string): MemberHistoryItem[] {
    const all = readLS<MemberHistoryItem[]>(KEY_HISTORY, []);
    return all
      .filter((h) => h.memberId === memberId)
      .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1)); // mới nhất trước
  },

  computeStats(memberId: string): MemberStats {
    const m = this.get(memberId);
    const items = this.listHistory(memberId);
    const totalEvents = items.filter((x) => x.kind === "event_checkin").length;
    const totalSpent = items.filter((x) => x.kind === "payment_in" || x.kind === "product_bought")
      .reduce((s, x) => s + (x.amountVnd ?? 0), 0);
    const debt = items.filter((x) => x.kind === "debt_recorded").reduce((s, x) => s + (x.amountVnd ?? 0), 0)
      - items.filter((x) => x.kind === "debt_settled").reduce((s, x) => s + (x.amountVnd ?? 0), 0);
    const totalServices = items.filter((x) => x.kind === "service_used").length;
    const ratings = items.filter((x) => typeof x.rating === "number").map((x) => x.rating!) as number[];
    const avg = ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : undefined;
    return {
      totalEvents,
      totalSpent,
      totalDebt: debt,
      totalServices,
      averageRating: avg,
      memberSince: m?.joinedAt ?? "",
    };
  },
};
