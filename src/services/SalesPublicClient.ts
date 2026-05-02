// Public student enrollment client — calls /sales/public/* (JWT exempt, HMAC-SHA256 signed).
// Per cloud-sales-master#14 / cloud-crm#210 reply (commit 5749210):
//   - Auth: HMAC-SHA256 over raw request body, secret per tenant
//   - Tenant: resolved from Hostname header OR tenantHint body field
//   - Hostname header: not settable from browser → use tenantHint
//   - Free course (price=0) → status=PAID + workflowTriggered=true (publish cloud-bpm-trigger)
//   - Paid course → status=PENDING_PAYMENT + paymentUrl (Phase 2)
import { urlsApi } from "configs/urls";

// Vite injects VITE_PORTAL_SECRET_MENTORHUB at build time.
// Production secret comes from devops env. Dev fallback empty → BE returns 403 unless
// APP_PORTAL_SIGNATURE_REQUIRED=false on BE side.
//
// SECURITY NOTE: Client-side HMAC is anti-bot soft auth, not strong security — secret
// leaks via bundle. Real protection lies in BE-side: tenant validation, idempotency
// (customerId+courseId), rate limit (recommend Phase 2). Acceptable threat model for
// student enrollment per BE handoff design choice.
const PORTAL_SECRET = (process.env.VITE_PORTAL_SECRET_MENTORHUB as string | undefined) || "";

const TENANT_HINT = "mentorhub";

export type PublicOrderRegisterRequest = {
  courseId: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCompany?: string;
  studentRole?: string;
  goal?: string;
  hearAbout?: string;
  subscribe?: boolean;
  utmSource?: string;
  tenantHint?: string;
};

export type PublicOrderRegisterResult = {
  orderId: number;
  orderCode: string;
  status: "PAID" | "PENDING_PAYMENT" | "CANCELED" | string;
  customerId: number;
  courseId: number;
  courseName: string;
  totalAmount: number;
  paymentUrl: string | null;
  sourceEventId: string;
  workflowTriggered: boolean;
};

export type ApiResponse<T> = {
  code: number;
  message: string;
  result?: T;
};

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function postSigned<T>(url: string, body: object): Promise<ApiResponse<T>> {
  const raw = JSON.stringify(body);
  const sig = PORTAL_SECRET ? await hmacSha256Hex(PORTAL_SECRET, raw) : "";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sig ? { "X-Portal-Signature": sig } : {}),
    },
    body: raw,
  });
  return res.json();
}

export default {
  register: (req: PublicOrderRegisterRequest) => {
    const body: PublicOrderRegisterRequest = {
      tenantHint: TENANT_HINT,
      ...req,
    };
    return postSigned<PublicOrderRegisterResult>(urlsApi.salesPublic.orderRegister, body);
  },
  status: async (orderCode: string) => {
    const params = new URLSearchParams({ orderCode, tenantHint: TENANT_HINT });
    const res = await fetch(`${urlsApi.salesPublic.orderStatus}?${params}`);
    return (await res.json()) as ApiResponse<{
      orderCode: string;
      status: string;
      paymentStatus: string;
      paymentUrl: string | null;
    }>;
  },
};
