// Notification bulk send client — wires `/notification/{email,zns,inapp}/sendBulk` + status.
// Per cloud-crm#211 / reborn-notihub#2 reply (commit 60e71b3, master).
//
// Templates đã seeded: MH_ENROLLMENT_CONFIRM, MH_SESSION_REMINDER_24H,
// MH_SESSION_REMINDER_1H, MH_SESSION_RECAP, MH_NPS_REQUEST, MH_ANNOUNCE_GENERIC,
// MH_CHAT_NOTIFY (Mustache placeholder {{var}}).
//
// Constraint: recipients.length <= 1000 per request.
import { apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export type BulkChannel = "email" | "zns" | "inapp";

export type BulkRecipient = {
  customerId: number;
  targetAddress?: string;        // email | zaloUserId — FE resolve trước (inapp KHÔNG cần)
  channel?: BulkChannel[];        // optional filter
  vars?: Record<string, unknown>; // template variables
};

export type BulkSendBody = {
  templateId?: string;            // optional nếu có subject+body override
  recipients: BulkRecipient[];
  subject?: string;
  body?: string;                  // Mustache support
  scheduledAt?: string | null;    // ISO; null = gửi ngay
  metadata?: Record<string, unknown>;
};

export type BulkSendResult = {
  batchId: string;
  queued: number;
  scheduled: number;
  preview?: Array<{
    customerId: number;
    channels: string[];
    status: string;
  }>;
};

export type RecipientStatus = {
  customerId: number;
  channel: string;
  // QUEUED | SCHEDULED | SENDING | SENT | DELIVERED | BOUNCED | FAILED | CANCELLED | SKIPPED
  status: string;
  sentAt?: string | null;
  errorMessage?: string | null;
  providerMessageId?: string | null;
};

export type ApiEnvelope<T> = {
  code: number;
  message?: string;
  result?: T;
};

const BULK_LIMIT = 1000;

function urlFor(channel: BulkChannel, kind: "send" | "status"): string {
  if (kind === "send") {
    return channel === "email"
      ? urlsApi.notificationBulk.emailSendBulk
      : channel === "zns"
      ? urlsApi.notificationBulk.znsSendBulk
      : urlsApi.notificationBulk.inappSendBulk;
  }
  return channel === "email"
    ? urlsApi.notificationBulk.emailStatus
    : channel === "zns"
    ? urlsApi.notificationBulk.znsStatus
    : urlsApi.notificationBulk.inappStatus;
}

export default {
  sendBulk: (channel: BulkChannel, body: BulkSendBody) => {
    if (body.recipients.length > BULK_LIMIT) {
      return Promise.resolve<ApiEnvelope<BulkSendResult>>({
        code: 400,
        message: `Số người nhận vượt giới hạn ${BULK_LIMIT} — chia batch nhỏ`,
      });
    }
    return apiPost(urlFor(channel, "send"), body as unknown as Record<string, unknown>) as Promise<
      ApiEnvelope<BulkSendResult>
    >;
  },
  status: (channel: BulkChannel, batchId: string, signal?: AbortSignal) =>
    apiGet(urlFor(channel, "status"), { batchId }, signal) as Promise<
      ApiEnvelope<RecipientStatus[]>
    >,
  fcmSendToCustomer: (body: {
    customerId: number;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) =>
    apiPost(urlsApi.notificationBulk.fcmSendToCustomer, body as unknown as Record<string, unknown>) as Promise<
      ApiEnvelope<string>
    >,
};

// Helper: poll status mỗi `intervalMs` until tất cả recipient có status terminal,
// hoặc timeout sau `timeoutMs`. Callback `onTick` để FE update progress UI.
export const TERMINAL_STATUSES = new Set(["SENT", "DELIVERED", "BOUNCED", "FAILED", "CANCELLED", "SKIPPED"]);

export async function pollUntilDone(
  channel: BulkChannel,
  batchId: string,
  options: {
    intervalMs?: number;
    timeoutMs?: number;
    onTick?: (statuses: RecipientStatus[]) => void;
    signal?: AbortSignal;
  } = {},
): Promise<RecipientStatus[]> {
  const intervalMs = options.intervalMs ?? 3000;
  const timeoutMs = options.timeoutMs ?? 120000;
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const res = await apiGet(
      urlFor(channel, "status"),
      { batchId },
      options.signal,
    ) as ApiEnvelope<RecipientStatus[]>;
    const items = res?.result ?? [];
    options.onTick?.(items);
    const allDone = items.length > 0 && items.every((r) => TERMINAL_STATUSES.has(r.status));
    if (allDone) return items;
    if (Date.now() - start > timeoutMs) return items;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
