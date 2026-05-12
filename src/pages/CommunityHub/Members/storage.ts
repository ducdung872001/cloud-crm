// Members storage — API-first, fallback localStorage khi BE chưa sẵn sàng.
//
// BE handoff: docs/handoff/20260508-1100-community-hub-member-flows.md.
// API methods (postfix Async) gọi BE trước, throw lỗi nếu BE trả non-zero;
// catch network thì fallback LS để dev local vẫn dùng được.

import type {
  MemberEntity,
  MemberSignupRequest,
  MemberHistoryItem,
  MemberStats,
  MemberGroup,
} from "./types";
import { buildMasterCode, buildMemberCode, deriveGroupSeqFromPersonal } from "./codeUtils";
import MemberService from "services/MemberService";

/** BE community-hub mix `code: 0` (Vert.x style) và `code: 200` (HTTP style) tuỳ
 *  endpoint. Helper unify check 1 chỗ. */
function isOk(res: any): boolean {
  return !!res && (res.code === 0 || res.code === 200);
}
/** Lấy payload — BE dùng `result` hoặc `data` tuỳ endpoint. */
function unwrap(res: any): any {
  return res?.result ?? res?.data ?? res;
}

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

  /** Admin: list signup requests qua BE, fallback LS nếu lỗi mạng. */
  async listRequestsAsync(params?: { status?: string; page?: number; limit?: number }): Promise<MemberSignupRequest[]> {
    try {
      const res: any = await MemberService.listSignupRequests(params as Record<string, unknown>);
      if (isOk(res)) {
        const payload = unwrap(res);
        const items = payload?.items ?? payload ?? [];
        return Array.isArray(items) ? items : [];
      }
    } catch { /* fallback */ }
    return this.listRequests();
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

  /** Public: gửi yêu cầu cấp mã. Phase 2 OTP-first: body có thêm `firebaseIdToken`
   *  (BE verify qua Auth → extract phone từ token, set phone_verified=true).
   *  Phase 1 (firebaseIdToken=undefined): BE giữ phone từ body, phoneVerified=false. */
  async createRequestAsync(
    input: Omit<MemberSignupRequest, "id" | "createdAt" | "status" | "phoneVerified" | "firebaseUid"> & {
      firebaseIdToken?: string;
    },
  ): Promise<MemberSignupRequest> {
    try {
      const res: any = await MemberService.createSignupRequest(input as Record<string, unknown>);
      if (isOk(res) && unwrap(res)) {
        const req = res.result as MemberSignupRequest;
        // Cache nhẹ vào LS để admin xem được lần đầu khi BE chưa list endpoint.
        const all = this.listRequests();
        all.push(req);
        writeLS(KEY_REQUESTS, all);
        return req;
      }
      const msg = res?.message || res?.error || "Không gửi được yêu cầu cấp mã";
      throw new Error(msg);
    } catch (e: any) {
      // Network error → fallback LS để dev không bị block.
      if (e?.name === "TypeError" || /Failed to fetch|Network/i.test(String(e?.message))) {
        const { firebaseIdToken: _ignored, ...lsInput } = input;
        return this.createRequest(lsInput);
      }
      throw e;
    }
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

  /** Admin: approve qua BE → BE sinh memberCode + tạo MemberEntity. */
  async approveRequestAsync(reqId: string, override?: Partial<MemberSignupRequest>): Promise<MemberEntity | null> {
    try {
      const res: any = await MemberService.approveSignupRequest(reqId, override as Record<string, unknown>);
      if (isOk(res)) {
        const payload = unwrap(res);
        if (payload) return payload as MemberEntity;
      }
      const msg = res?.message || "Approve thất bại";
      throw new Error(msg);
    } catch (e: any) {
      if (e?.name === "TypeError" || /Failed to fetch|Network/i.test(String(e?.message))) {
        return this.approveRequest(reqId, "admin");
      }
      throw e;
    }
  },

  rejectRequest(reqId: string, by: string, reason: string): MemberSignupRequest | null {
    const all = this.listRequests();
    const idx = all.findIndex((r) => r.id === reqId);
    if (idx < 0 || all[idx].status !== "pending") return null;
    all[idx] = { ...all[idx], status: "rejected", reviewedBy: by, reviewedAt: new Date().toISOString(), rejectReason: reason };
    writeLS(KEY_REQUESTS, all);
    return all[idx];
  },

  async rejectRequestAsync(reqId: string, reason: string): Promise<MemberSignupRequest | null> {
    try {
      const res: any = await MemberService.rejectSignupRequest(reqId, { reason });
      if (isOk(res)) return (unwrap(res) as MemberSignupRequest) ?? null;
      throw new Error(res?.message || "Reject thất bại");
    } catch (e: any) {
      if (e?.name === "TypeError" || /Failed to fetch|Network/i.test(String(e?.message))) {
        return this.rejectRequest(reqId, "admin", reason);
      }
      throw e;
    }
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

  /** Public: verify qua BE bcrypt. Trả {ok, member, token?, reason}. */
  async loginByCodeAsync(memberCode: string, password: string): Promise<{ ok: boolean; member?: MemberEntity; token?: string; reason?: string }> {
    try {
      const res: any = await MemberService.loginByCode({ memberCode, password });
      if (isOk(res)) {
        const payload = unwrap(res);
        if (payload?.member) {
          return { ok: true, member: payload.member as MemberEntity, token: payload.token };
        }
      }
      return { ok: false, reason: res?.message || res?.error || "Đăng nhập thất bại" };
    } catch (e: any) {
      // Network → fallback LS để dev local vẫn login được.
      if (e?.name === "TypeError" || /Failed to fetch|Network/i.test(String(e?.message))) {
        return this.loginByCode(memberCode, password);
      }
      return { ok: false, reason: e?.message || "Lỗi kết nối máy chủ" };
    }
  },

  /** User self-reset pwd qua OTP Firebase (yc BE 2026-05-12).
   *  Body: { memberCode, firebaseIdToken, newPassword }. BE call Auth verify
   *  idToken → match phone với members.phone (lookup theo memberCode) → bcrypt+update.
   *  Fallback LS chỉ khi network lỗi (dev local), KHÔNG fallback khi BE reject. */
  async setPasswordAsync(args: {
    memberCode: string;
    firebaseIdToken: string;
    newPassword: string;
  }): Promise<{ ok: boolean; reason?: string }> {
    try {
      const res: any = await MemberService.setPassword(args);
      if (isOk(res)) return { ok: true };
      return { ok: false, reason: res?.message || "Đặt mật khẩu thất bại" };
    } catch (e: any) {
      if (e?.name === "TypeError" || /Failed to fetch|Network/i.test(String(e?.message))) {
        // LS fallback (dev local) — bỏ qua idToken, dùng raw pwd.
        const m = this.getByCode(args.memberCode);
        if (!m) return { ok: false, reason: "Mã không tồn tại (LS fallback)" };
        const ok = this.setPassword(m.id, args.newPassword);
        return { ok, reason: ok ? undefined : "Lỗi LS" };
      }
      return { ok: false, reason: e?.message || "Lỗi kết nối" };
    }
  },

  /** Admin override set pwd qua BE — KHÔNG cần Firebase OTP. Dùng khi admin
   *  duyệt signup-request cấp pwd tạm, hoặc reset pwd cho member quên. */
  async adminSetPasswordAsync(memberId: string, newPassword: string): Promise<{ ok: boolean; reason?: string }> {
    try {
      const res: any = await MemberService.adminSetMemberPassword(memberId, { password: newPassword });
      if (isOk(res)) return { ok: true };
      return { ok: false, reason: res?.message || "Đặt mật khẩu thất bại" };
    } catch (e: any) {
      if (e?.name === "TypeError" || /Failed to fetch|Network/i.test(String(e?.message))) {
        const ok = this.setPassword(memberId, newPassword);
        return { ok, reason: ok ? undefined : "Lỗi LS" };
      }
      return { ok: false, reason: e?.message || "Lỗi kết nối" };
    }
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
