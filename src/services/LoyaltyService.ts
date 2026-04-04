import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

// Giữ nguyên toàn bộ các interface + method hiện có, chỉ thêm 2 method export

const cleanParams = (params: any) => {
  const result: any = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      result[key] = params[key];
    }
  });
  return result;
};

// ─── Helper download Base64 xlsx ──────────────────────────────────────────────
async function downloadBase64Xlsx(url: string, filename: string, signal?: AbortSignal): Promise<void> {
  const res  = await fetch(url, { method: "GET", signal });
  const json = await res.json();

  if (!res.ok || json.code !== 0) {
    throw new Error(json.message || `Export thất bại (HTTP ${res.status})`);
  }

  const base64: string = json.result;
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = filename;
  a.href = objUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objUrl);
}

function todayStr(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}${String(d.getMonth()+1).padStart(2,"0")}${d.getFullYear()}`;
}

export default {
  // ─── Loyalty Program ──────────────────────────────────────────────────────
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyProgram}${convertParamsToString(params)}`, {
      method: "GET", signal,
    }).then((r) => r.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.ma.updateLoyaltyProgram, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltyProgram}?id=${id}`, {
      method: "DELETE",
    }).then((r) => r.json());
  },

  // ─── Point Ledger ─────────────────────────────────────────────────────────
  listLoyaltyPointLedger: (params: any, signal?: AbortSignal) => {
    return fetch(
      `${urlsApi.ma.listLoyaltyPointLedger}${convertParamsToString(cleanParams(params))}`,
      { method: "GET", signal }
    ).then((r) => r.json());
  },
  updateLoyaltyPointLedger: (body: any) => {
    return fetch(urlsApi.ma.updateLoyaltyPointLedger, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },
  deleteLoyaltyPointLedger: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltyPointLedger}?id=${id}`, {
      method: "DELETE",
    }).then((r) => r.json());
  },

  // ─── Reward ───────────────────────────────────────────────────────────────
  listLoyaltyReward: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyReward}${convertParamsToString(params)}`, {
      method: "GET", signal,
    }).then((r) => r.json());
  },
  getLoyaltyReward: (id: number) => {
    return fetch(`${urlsApi.ma.getLoyaltyReward}?id=${id}`, {
      method: "GET",
    }).then((r) => r.json());
  },
  updateLoyaltyReward: (body: any) => {
    return fetch(urlsApi.ma.updateLoyaltyReward, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },
  deleteLoyaltyReward: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltyReward}?id=${id}`, {
      method: "DELETE",
    }).then((r) => r.json());
  },

  // ─── Segment ──────────────────────────────────────────────────────────────
  listLoyaltySegment: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltySegment}${convertParamsToString(params)}`, {
      method: "GET", signal,
    }).then((r) => r.json());
  },
  updateLoyaltySegment: (body: any) => {
    return fetch(urlsApi.ma.updateLoyaltySegment, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },
  deleteLoyaltySegment: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltySegment}?id=${id}`, {
      method: "DELETE",
    }).then((r) => r.json());
  },

  // ─── Wallet ───────────────────────────────────────────────────────────────
  listLoyaltyWallet: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyWallet}${convertParamsToString(params)}`, {
      method: "GET", signal,
    }).then((r) => r.json());
  },
  getWalletByCustomer: (customerId: number) => {
    return fetch(`${urlsApi.ma.getWalletByCustomer}?customerId=${customerId}`, {
      method: "GET",
    }).then((r) => r.json());
  },
  createLoyaltyWallet: (body: any) => {
    return fetch(urlsApi.ma.createLoyaltyWallet, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },
  fluctuatePoint: (body: any) => {
    return fetch(urlsApi.ma.fluctuatePoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },
  getLoyaltyConfig: () => {
    return fetch(urlsApi.ma.getLoyaltyConfig, { method: "GET" }).then((r) => r.json());
  },
  updateLoyaltyConfig: (body: any) => {
    return fetch(urlsApi.ma.updateLoyaltyConfig, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },
  consumePoint: (body: any) => {
    return fetch(urlsApi.ma.consumePoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },

  // ─── Export: Danh sách hội viên ───────────────────────────────────────────
  /**
   * GET /market/loyaltyWallet/export
   * Server build Excel (Base64) → decode → download.
   * @param customerId  0 hoặc undefined = tất cả hội viên
   */
  exportLoyaltyWallet: async (customerId?: number, signal?: AbortSignal): Promise<void> => {
    const qs = customerId ? `?customerId=${customerId}` : "";
    await downloadBase64Xlsx(
      `${urlsApi.ma.exportLoyaltyWallet}${qs}`,
      `DanhSachHoiVien_${todayStr()}.xlsx`,
      signal
    );
  },

  // ─── Export: Lịch sử điểm ─────────────────────────────────────────────────
  /**
   * GET /market/loyaltyPointLedger/export
   * Server build Excel (Base64) → decode → download.
   * @param customerId   0 hoặc undefined = tất cả
   * @param description  tìm theo lý do
   */
  exportLoyaltyPointLedger: async (
    customerId?: number,
    description?: string,
    signal?: AbortSignal
  ): Promise<void> => {
    const params: Record<string, any> = {};
    if (customerId)  params.customerId  = customerId;
    if (description) params.description = description;
    const qs = convertParamsToString(params);
    await downloadBase64Xlsx(
      `${urlsApi.ma.exportLoyaltyPointLedger}${qs}`,
      `LichSuDiem_${todayStr()}.xlsx`,
      signal
    );
  },
};