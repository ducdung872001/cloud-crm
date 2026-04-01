import { urlsApi } from "configs/urls";
import { ICashbookFilterRequest, ICashbookRequest } from "model/cashbook/CashbookRequestModel";
import { convertParamsToString } from "reborn-util";

// ── Helpers (giống MaterialService) ────────────────────────────────────────────

function triggerDownload(base64: string, filename: string) {
  const binaryStr = atob(base64);
  const bytes     = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildFilename(prefix: string) {
  const d   = new Date();
  const dd  = String(d.getDate()).padStart(2, "0");
  const mm  = String(d.getMonth() + 1).padStart(2, "0");
  const hh  = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${prefix}_${dd}${mm}${d.getFullYear()}_${hh}${min}.xlsx`;
}

// ── Service ────────────────────────────────────────────────────────────────────

export default {
  list: (params?: ICashbookFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.cashbook.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICashbookRequest) => {
    return fetch(urlsApi.cashbook.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.cashbook.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.cashbook.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  export: (params?: ICashbookFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.cashbook.export}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  exportFile: async (
    params?: { fromTime?: string; toTime?: string; branchId?: number; projectId?: number },
    signal?: AbortSignal
  ): Promise<void> => {
    const qs  = convertParamsToString(params ?? {});
    const res = await fetch(`${urlsApi.cashbook.exportSimple}${qs}`, {
      method: "GET",
      signal,
    });
    const json = await res.json();

    if (!res.ok || json.code !== 0) {
      throw new Error(json.message || `Xuất Excel thất bại (HTTP ${res.status})`);
    }

    triggerDownload(json.result, buildFilename("SoThuChi"));
  },
};