// [MH] MentorHub - Zoom credit pool + peer-borrow API client
// Calls reborn-mentorhub-be endpoints under /api/v1/zoom-pool/* + /api/v1/credit/*
// USP feature: chia sẻ Zoom giữa mentor — auto-pool và peer-to-peer.

const API_BASE = (import.meta as any).env?.APP_API_URL || "";
const MOCK_MENTOR_ID = "MT-001"; // FE stub mentorId — production lấy từ session

async function req<T>(method: string, path: string, body?: any): Promise<T> {
  const r = await fetch(`${API_BASE}/api/v1${path}`, {
    method,
    headers: { "x-mentor-id": MOCK_MENTOR_ID, "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) {
    const msg = data?.error || `HTTP ${r.status}`;
    const err = new Error(msg) as Error & { response?: any };
    err.response = { data, status: r.status };
    throw err;
  }
  return data as T;
}

// ── Domain types ────────────────────────────────────────────────────────────

export interface PoolAccount {
  id: string;
  ownerType: "mentor" | "wit" | "platform";
  ownerId: string;
  licensed: boolean;
  status: "available" | "in_use" | "blocked" | "expired";
  contributorEarnRatePct: number;
  joinedPoolAt: string;
  zoomDisplayName?: string;
}

export interface MyPoolAccount extends PoolAccount {
  zoomEmail: string;
  zoomUserId: string;
  maxConcurrent: number;
}

export interface FreeSlot {
  id: string;
  accountId: string;
  startsAt: string;
  endsAt: string;
  status: "free";
  account: {
    id: string;
    ownerType: PoolAccount["ownerType"];
    ownerId: string;
    licensed: boolean;
    contributorEarnRatePct: number;
    zoomDisplayName?: string;
  } | null;
}

export interface ZoomBooking {
  id: string;
  tenantId: string;
  sessionId: string;
  slotId: string;
  accountId: string;
  startsAt: string;
  endsAt: string;
  creditCost: number;
  status: "active" | "cancelled" | "completed";
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  fromBorrowRequestId?: string;
}

export interface BorrowRequest {
  id: string;
  fromTenantId: string;
  fromMentorId: string;
  toTenantId: string;
  toMentorId: string;
  accountId?: string;
  slotId?: string;
  proposedStartsAt: string;
  proposedEndsAt: string;
  courseTitle?: string;
  reason?: string;
  offeredCredits: number;
  counterCredits?: number;
  counterStartsAt?: string;
  counterEndsAt?: string;
  message?: string;
  responseMessage?: string;
  status: "pending" | "approved" | "declined" | "expired" | "booked" | "cancelled";
  expiresAt: string;
  createdAt: string;
  respondedAt?: string;
  bookingId?: string;
}

export interface Wallet {
  tenantId: string;
  balance: number;
  earnedThisPeriod: number;
  spentThisPeriod: number;
  rules: {
    monthlyGrant: number;
    swapRatePct: number;
    rolloverEnabled: boolean;
    rolloverCap: number;
  };
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  tenantId: string;
  type: "grant" | "spend" | "earn" | "swap" | "adjust" | "refund";
  amount: number;
  balanceAfter: number;
  reason: string;
  sessionId?: string;
  bookingId?: string;
  createdBy: string;
  createdAt: string;
}

// ── Pool browse + book ──────────────────────────────────────────────────────

export function listFreeSlots(opts?: { notBefore?: string; notAfter?: string; preferLicensed?: boolean }): Promise<FreeSlot[]> {
  const params = new URLSearchParams();
  if (opts?.notBefore) params.set("notBefore", opts.notBefore);
  if (opts?.notAfter) params.set("notAfter", opts.notAfter);
  if (opts?.preferLicensed) params.set("preferLicensed", "true");
  return req("GET", `/zoom-pool/slots?${params.toString()}`);
}

export function listPoolAccounts(): Promise<PoolAccount[]> {
  return req("GET", `/zoom-pool/accounts`);
}

export function bookFromPool(input: {
  sessionId: string;
  startsAt: string;
  durationMin?: number;
  needLicensed?: boolean;
}): Promise<{ booking: ZoomBooking; slot: FreeSlot }> {
  return req("POST", `/zoom-pool/book`, input);
}

export function listMyBookings(status?: ZoomBooking["status"]): Promise<ZoomBooking[]> {
  const q = status ? `?status=${status}` : "";
  return req("GET", `/zoom-pool/bookings${q}`);
}

export function cancelBooking(id: string, reason?: string): Promise<{ booking: ZoomBooking; refunded: number }> {
  const q = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return req("DELETE", `/zoom-pool/bookings/${id}${q}`);
}

// ── My accounts (mentor góp Zoom lên pool) ─────────────────────────────────

export function listMyAccounts(): Promise<MyPoolAccount[]> {
  return req("GET", `/zoom-pool/my-accounts`);
}

export function publishMyAccount(input: {
  zoomEmail?: string;
  zoomDisplayName?: string;
  licensed: boolean;
  maxConcurrent?: number;
  contributorEarnRatePct: number;
}): Promise<MyPoolAccount> {
  return req("POST", `/zoom-pool/my-accounts`, input);
}

export function patchMyAccount(id: string, input: {
  contributorEarnRatePct?: number;
  status?: PoolAccount["status"];
  zoomDisplayName?: string;
  licensed?: boolean;
}): Promise<MyPoolAccount> {
  return req("PATCH", `/zoom-pool/my-accounts/${id}`, input);
}

export function listMyAccountSlots(id: string): Promise<FreeSlot[]> {
  return req("GET", `/zoom-pool/my-accounts/${id}/slots`);
}

export function addMyAccountSlot(id: string, input: { startsAt: string; endsAt: string }): Promise<FreeSlot> {
  return req("POST", `/zoom-pool/my-accounts/${id}/slots`, input);
}

// ── Peer-to-peer borrow request ────────────────────────────────────────────

export function createBorrowRequest(input: {
  toMentorId: string;
  slotId?: string;
  proposedStartsAt?: string;
  durationMin?: number;
  courseTitle?: string;
  reason?: string;
  offeredCredits?: number;
  message?: string;
}): Promise<BorrowRequest> {
  return req("POST", `/zoom-pool/borrow`, input);
}

export function listInboxRequests(): Promise<BorrowRequest[]> {
  return req("GET", `/zoom-pool/borrow/inbox`);
}

export function listSentRequests(): Promise<BorrowRequest[]> {
  return req("GET", `/zoom-pool/borrow/sent`);
}

export function approveBorrowRequest(id: string, responseMessage?: string): Promise<{ request: BorrowRequest; bookingId: string }> {
  return req("POST", `/zoom-pool/borrow/${id}/approve`, { responseMessage });
}

export function declineBorrowRequest(id: string, responseMessage?: string): Promise<BorrowRequest> {
  return req("POST", `/zoom-pool/borrow/${id}/decline`, { responseMessage });
}

export function counterBorrowRequest(id: string, input: {
  counterCredits?: number;
  counterStartsAt?: string;
  counterEndsAt?: string;
  responseMessage?: string;
}): Promise<BorrowRequest> {
  return req("POST", `/zoom-pool/borrow/${id}/counter`, input);
}

export function cancelBorrowRequest(id: string): Promise<BorrowRequest> {
  return req("POST", `/zoom-pool/borrow/${id}/cancel`, {});
}

// ── Wallet / credits ────────────────────────────────────────────────────────

export function getWallet(): Promise<Wallet> {
  return req("GET", `/credit/wallet`);
}

export function listTransactions(opts?: { type?: CreditTransaction["type"]; limit?: number }): Promise<CreditTransaction[]> {
  const params = new URLSearchParams();
  if (opts?.type) params.set("type", opts.type);
  if (opts?.limit) params.set("limit", String(opts.limit));
  return req("GET", `/credit/transactions?${params.toString()}`);
}
