import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IProgramRoyaltyRequest } from "@/model/loyalty/RoyaltyRequest";
import { ILoyaltyPointLedgerRequest } from "@/model/loyalty/RoyaltyRequest";
import { ILoyaltyRewardRequest, ILoyaltySegmentRequest, ILoyaltyWalletRequest } from "@/model/loyalty/RoyaltyRequest";

/** Loại bỏ các field undefined / null / "" trước khi build query string */
function cleanParams<T extends Record<string, any>>(p: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as Partial<T>;
}

export default {
  // ── Chương trình khách hàng thân thiết ─────────────────────────────────
  list: (params: IProgramRoyaltyRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyProgram}${convertParamsToString(params)}`, {
      signal, method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IProgramRoyaltyRequest) => {
    return fetch(urlsApi.ma.updateLoyaltyProgram, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltyProgram}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // ── Lịch sử điểm ────────────────────────────────────────────────────────
  listLoyaltyPointLedger: (params: ILoyaltyPointLedgerRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyPointLedger}${convertParamsToString(cleanParams(params))}`, {
      signal, method: "GET",
    }).then((res) => res.json());
  },
  updateLoyaltyPointLedger: (body: ILoyaltyPointLedgerRequest) => {
    return fetch(urlsApi.ma.updateLoyaltyPointLedger, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLoyaltyPointLedger: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltyPointLedger}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // ── Phần thưởng & đổi điểm ──────────────────────────────────────────────
  listLoyaltyReward: (params: ILoyaltyRewardRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyReward}${convertParamsToString(params)}`, {
      signal, method: "GET",
    }).then((res) => res.json());
  },
  getLoyaltyReward: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.getLoyaltyReward}?id=${id}`, {
      signal, method: "GET",
    }).then((res) => res.json());
  },
  updateLoyaltyReward: (body: ILoyaltyRewardRequest) => {
    return fetch(urlsApi.ma.updateLoyaltyReward, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLoyaltyReward: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltyReward}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // ── Phân hạng hội viên ──────────────────────────────────────────────────
  listLoyaltySegment: (params: ILoyaltySegmentRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltySegment}${convertParamsToString(params)}`, {
      signal, method: "GET",
    }).then((res) => res.json());
  },
  updateLoyaltySegment: (body: ILoyaltySegmentRequest) => {
    return fetch(urlsApi.ma.updateLoyaltySegment, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLoyaltySegment: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltySegment}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // ── Ví hội viên ─────────────────────────────────────────────────────────
  listLoyaltyWallet: (params: ILoyaltyWalletRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyWallet}${convertParamsToString(params)}`, {
      signal, method: "GET",
    }).then((res) => res.json());
  },

  // ── Điều chỉnh điểm thủ công (tăng/giảm) ───────────────────────────────
  // point: số dương = tăng, số âm = giảm
  // description sẽ được ghi nhận vào loyalty_point_ledger
  adjustPoint: (body: { customerId: number; point: number; description: string }) => {
    return fetch(urlsApi.ma.fluctuatePoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  consumePoint: (body: { customerId: number; point: number; description: string }) => {
    return fetch(urlsApi.ma.consumePoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // ── Cấu hình tỷ lệ quy đổi điểm ────────────────────────────────────────
  getConfig: (signal?: AbortSignal) => {
    return fetch(urlsApi.ma.getLoyaltyConfig, { signal, method: "GET" })
      .then((res) => res.json());
  },
  saveConfig: (body: { exchangeRate: number }) => {
    return fetch(urlsApi.ma.updateLoyaltyConfig, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};