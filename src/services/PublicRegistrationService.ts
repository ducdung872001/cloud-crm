// Public Registration Service — endpoints cho luồng khách vãng lai tự sửa
// thông tin đăng ký sự kiện (handoff issue #23).
//
// Auth: KHÔNG dùng JWT admin. User verify SĐT qua Firebase Phone OTP → idToken
// gửi qua header X-Firebase-Id-Token. BE verify token + match phone → list/edit.
//
// IMPORTANT: BE chưa deploy 2 endpoint này (issue #23). FE wire sẵn nhưng
// PUBLIC_MY_REGISTRATIONS_READY = false → entry button bị ẩn. Sau khi BE up
// + test khớp response shape, flip flag → release.

import { urlsApi } from "configs/urls";

/** Feature flag — flip true sau khi BE deploy + test issue #23 endpoints.
 *  Giữ OFF trên prod (anh Lợi đã preview UI 2026-05-12 OK). Khi BE up + test
 *  shape thực OK rồi flip TRUE trong 1 commit nhỏ. */
export const PUBLIC_MY_REGISTRATIONS_READY = false;

const HEADER_ID_TOKEN = "X-Firebase-Id-Token";

export interface MyRegistrationItem {
  regId: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventStartAt?: string;
  eventEndAt?: string;
  status: "pending" | "approved" | "checked_in" | "completed" | "cancelled" | string;
  totalAmount?: number;
  paymentStatus?: "unpaid" | "pending_verify" | "paid" | string;
  canEdit: boolean;
  canEditReason?: "checked_in" | "event_ended" | "cancelled" | null;
  values: {
    fullName: string;
    email?: string;
    company?: string;
    note?: string;
    selectedDates?: string[];
  };
  lockedSummary?: {
    phone: string;
    dynamicValuesCount: number;
    selectedAddOnsCount: number;
    hasPaymentProof: boolean;
  };
}

export interface UpdateRegistrationInfoBody {
  fullName?: string;
  email?: string;
  company?: string;
  note?: string;
  selectedDates?: string[];
}

export default {
  /** GET /events/public/my-registrations — list toàn bộ registrations của
   *  SĐT trong idToken. Trả [] nếu không có. */
  listMine: async (idToken: string, signal?: AbortSignal): Promise<any> => {
    const res = await fetch(urlsApi.events.myRegistrations, {
      method: "GET",
      signal,
      headers: { [HEADER_ID_TOKEN]: idToken },
    });
    return res.json();
  },

  /** PUT /events/public/registrations/info?id={regId} — sửa Lớp 1 fields.
   *  BE whitelist body, ignore field ngoài Lớp 1. */
  updateInfo: async (
    regId: string,
    idToken: string,
    body: UpdateRegistrationInfoBody,
    signal?: AbortSignal,
  ): Promise<any> => {
    const url = `${urlsApi.events.updateMyRegistrationInfo}?id=${encodeURIComponent(regId)}`;
    const res = await fetch(url, {
      method: "PUT",
      signal,
      headers: {
        [HEADER_ID_TOKEN]: idToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },
};
