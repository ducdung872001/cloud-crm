// [MH] MentorHub - Zoom credit pool + peer-borrow API client
// Calls reborn-mentorhub-be endpoints under /api/v1/zoom-pool/* + /api/v1/credit/*
// USP feature: chia sẻ Zoom giữa mentor — auto-pool và peer-to-peer.
import axios, { AxiosRequestConfig } from "axios";

const API_BASE = (import.meta as any).env?.APP_API_URL || "";
const MOCK_MENTOR_ID = "MT-001"; // FE stub mentorId — production lấy từ session

function authHeaders(): AxiosRequestConfig["headers"] {
  return { "x-mentor-id": MOCK_MENTOR_ID };
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

export async function listFreeSlots(opts?: { notBefore?: string; notAfter?: string; preferLicensed?: boolean }): Promise<FreeSlot[]> {
  const params = new URLSearchParams();
  if (opts?.notBefore) params.set("notBefore", opts.notBefore);
  if (opts?.notAfter) params.set("notAfter", opts.notAfter);
  if (opts?.preferLicensed) params.set("preferLicensed", "true");
  const r = await axios.get(`${API_BASE}/api/v1/zoom-pool/slots?${params.toString()}`, { headers: authHeaders() });
  return r.data;
}

export async function listPoolAccounts(): Promise<PoolAccount[]> {
  const r = await axios.get(`${API_BASE}/api/v1/zoom-pool/accounts`, { headers: authHeaders() });
  return r.data;
}

export async function bookFromPool(input: {
  sessionId: string;
  startsAt: string;
  durationMin?: number;
  needLicensed?: boolean;
}): Promise<{ booking: ZoomBooking; slot: FreeSlot }> {
  const r = await axios.post(`${API_BASE}/api/v1/zoom-pool/book`, input, { headers: authHeaders() });
  return r.data;
}

export async function listMyBookings(status?: ZoomBooking["status"]): Promise<ZoomBooking[]> {
  const params = status ? `?status=${status}` : "";
  const r = await axios.get(`${API_BASE}/api/v1/zoom-pool/bookings${params}`, { headers: authHeaders() });
  return r.data;
}

export async function cancelBooking(id: string, reason?: string): Promise<{ booking: ZoomBooking; refunded: number }> {
  const r = await axios.delete(`${API_BASE}/api/v1/zoom-pool/bookings/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`, { headers: authHeaders() });
  return r.data;
}

// ── My accounts (mentor góp Zoom lên pool) ─────────────────────────────────

export async function listMyAccounts(): Promise<MyPoolAccount[]> {
  const r = await axios.get(`${API_BASE}/api/v1/zoom-pool/my-accounts`, { headers: authHeaders() });
  return r.data;
}

export async function publishMyAccount(input: {
  zoomEmail?: string;
  zoomDisplayName?: string;
  licensed: boolean;
  maxConcurrent?: number;
  contributorEarnRatePct: number;
}): Promise<MyPoolAccount> {
  const r = await axios.post(`${API_BASE}/api/v1/zoom-pool/my-accounts`, input, { headers: authHeaders() });
  return r.data;
}

export async function patchMyAccount(id: string, input: {
  contributorEarnRatePct?: number;
  status?: PoolAccount["status"];
  zoomDisplayName?: string;
  licensed?: boolean;
}): Promise<MyPoolAccount> {
  const r = await axios.patch(`${API_BASE}/api/v1/zoom-pool/my-accounts/${id}`, input, { headers: authHeaders() });
  return r.data;
}

export async function listMyAccountSlots(id: string): Promise<FreeSlot[]> {
  const r = await axios.get(`${API_BASE}/api/v1/zoom-pool/my-accounts/${id}/slots`, { headers: authHeaders() });
  return r.data;
}

export async function addMyAccountSlot(id: string, input: { startsAt: string; endsAt: string }): Promise<FreeSlot> {
  const r = await axios.post(`${API_BASE}/api/v1/zoom-pool/my-accounts/${id}/slots`, input, { headers: authHeaders() });
  return r.data;
}

// ── Peer-to-peer borrow request ────────────────────────────────────────────

export async function createBorrowRequest(input: {
  toMentorId: string;
  slotId?: string;
  proposedStartsAt?: string;
  durationMin?: number;
  courseTitle?: string;
  reason?: string;
  offeredCredits?: number;
  message?: string;
}): Promise<BorrowRequest> {
  const r = await axios.post(`${API_BASE}/api/v1/zoom-pool/borrow`, input, { headers: authHeaders() });
  return r.data;
}

export async function listInboxRequests(): Promise<BorrowRequest[]> {
  const r = await axios.get(`${API_BASE}/api/v1/zoom-pool/borrow/inbox`, { headers: authHeaders() });
  return r.data;
}

export async function listSentRequests(): Promise<BorrowRequest[]> {
  const r = await axios.get(`${API_BASE}/api/v1/zoom-pool/borrow/sent`, { headers: authHeaders() });
  return r.data;
}

export async function approveBorrowRequest(id: string, responseMessage?: string): Promise<{ request: BorrowRequest; bookingId: string }> {
  const r = await axios.post(`${API_BASE}/api/v1/zoom-pool/borrow/${id}/approve`, { responseMessage }, { headers: authHeaders() });
  return r.data;
}

export async function declineBorrowRequest(id: string, responseMessage?: string): Promise<BorrowRequest> {
  const r = await axios.post(`${API_BASE}/api/v1/zoom-pool/borrow/${id}/decline`, { responseMessage }, { headers: authHeaders() });
  return r.data;
}

export async function counterBorrowRequest(id: string, input: {
  counterCredits?: number;
  counterStartsAt?: string;
  counterEndsAt?: string;
  responseMessage?: string;
}): Promise<BorrowRequest> {
  const r = await axios.post(`${API_BASE}/api/v1/zoom-pool/borrow/${id}/counter`, input, { headers: authHeaders() });
  return r.data;
}

export async function cancelBorrowRequest(id: string): Promise<BorrowRequest> {
  const r = await axios.post(`${API_BASE}/api/v1/zoom-pool/borrow/${id}/cancel`, {}, { headers: authHeaders() });
  return r.data;
}

// ── Wallet / credits ────────────────────────────────────────────────────────

export async function getWallet(): Promise<Wallet> {
  const r = await axios.get(`${API_BASE}/api/v1/credit/wallet`, { headers: authHeaders() });
  return r.data;
}

export async function listTransactions(opts?: { type?: CreditTransaction["type"]; limit?: number }): Promise<CreditTransaction[]> {
  const params = new URLSearchParams();
  if (opts?.type) params.set("type", opts.type);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const r = await axios.get(`${API_BASE}/api/v1/credit/transactions?${params.toString()}`, { headers: authHeaders() });
  return r.data;
}
