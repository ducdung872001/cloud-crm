import { urlsApi } from "configs/urls";
import { ICashbookFilterRequest, ICashbookRequest } from "model/cashbook/CashbookRequestModel";
import { convertParamsToString } from "reborn-util";

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

  /**
   * Xuất sổ thu chi ra file Excel (.xlsx).
   * Backend: GET /billing/cashbook/export-file
   * Trả về XSSFWorkbook stream → lưu blob và trigger download trực tiếp trên browser.
   *
   * @param params  fromTime, toTime, type (1=thu/2=chi), branchId, projectId
   * @param signal  AbortController signal
   */
  exportFile: async (
    params?: ICashbookFilterRequest & {
      fromTime?: string;
      toTime?: string;
      type?: number;
      branchId?: number;
      projectId?: number;
    },
    signal?: AbortSignal
  ): Promise<void> => {
    const qs = convertParamsToString(params ?? {});
    const res = await fetch(`${urlsApi.cashbook.exportFile}${qs}`, {
      method: "GET",
      signal,
    });

    if (!res.ok) {
      throw new Error(`Export thất bại (HTTP ${res.status})`);
    }

    const blob = await res.blob();
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");

    // Lấy tên file từ header Content-Disposition nếu có, fallback tên mặc định
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match       = disposition.match(/filename[^;=\n]*=['"]?([^'";\n]+)['"]?/i);
    const now         = new Date();
    const stamp       = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    a.download = match?.[1] ?? `SoThuChi_${stamp}.xlsx`;

    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};