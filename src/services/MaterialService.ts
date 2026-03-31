import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IMaterialFilterRequest, IMaterialRequest } from "model/material/MaterialRequestModel";
import { IMaterialImportRequest } from "model/material/MaterialImportModel";
import { IBomUpsertRequest } from "model/material/BomModel";

// ── Helpers ───────────────────────────────────────────────────
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
  const d    = new Date();
  const dd   = String(d.getDate()).padStart(2, "0");
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh   = String(d.getHours()).padStart(2, "0");
  const min  = String(d.getMinutes()).padStart(2, "0");
  return `${prefix}_${dd}${mm}${yyyy}_${hh}${min}.xlsx`;
}

// ── Material ──────────────────────────────────────────────────
const MaterialService = {
  list: (params: IMaterialFilterRequest, signal?: AbortSignal) =>
    fetch(`${urlsApi.materialNvl.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((r) => r.json()),

  summary: (signal?: AbortSignal) =>
    fetch(urlsApi.materialNvl.summary, { signal, method: "GET" }).then((r) => r.json()),

  get: (id: number) =>
    fetch(`${urlsApi.materialNvl.get}?id=${id}`, { method: "GET" }).then((r) => r.json()),

  update: (body: Partial<IMaterialRequest>) =>
    fetch(urlsApi.materialNvl.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  delete: (id: number) =>
    fetch(`${urlsApi.materialNvl.delete}?id=${id}`, { method: "DELETE" }).then((r) => r.json()),

  updateStatus: (id: number, status: number) =>
    fetch(`${urlsApi.materialNvl.updateStatus}?id=${id}&status=${status}`, {
      method: "POST",
    }).then((r) => r.json()),

  /**
   * Xuất danh sách NVL ra Excel.
   * Truyền filter hiện tại để export đúng dữ liệu đang xem.
   *
   * @returns Promise<void> — tự động trigger download
   * @throws Error nếu API lỗi
   */
  exportExcel: async (
    params: Pick<IMaterialFilterRequest, "keyword" | "categoryId" | "status">,
    signal?: AbortSignal
  ): Promise<void> => {
    const exportParams = {
      keyword:    params.keyword    ?? "",
      categoryId: params.categoryId ?? -1,
      status:     params.status     ?? -1,
    };

    const res  = await fetch(
      `${urlsApi.materialNvl.export}${convertParamsToString(exportParams)}`,
      { signal, method: "GET" }
    );
    const json = await res.json();

    if (!res.ok || json.code !== 0) {
      throw new Error(json.message || `Xuất Excel thất bại (HTTP ${res.status})`);
    }

    triggerDownload(json.result, buildFilename("NVL_DanhSach"));
  },
};

// ── Material Import ───────────────────────────────────────────
export const MaterialImportService = {
  list: (
    params: { status?: number; keyword?: string; page?: number; limit?: number },
    signal?: AbortSignal
  ) =>
    fetch(`${urlsApi.materialNvl.importList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((r) => r.json()),

  get: (id: number) =>
    fetch(`${urlsApi.materialNvl.importGet}?id=${id}`, { method: "GET" }).then((r) => r.json()),

  create: (body: IMaterialImportRequest) =>
    fetch(urlsApi.materialNvl.importCreate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  confirm: (id: number) =>
    fetch(`${urlsApi.materialNvl.importConfirm}?id=${id}`, { method: "POST" }).then((r) =>
      r.json()
    ),

  cancel: (id: number) =>
    fetch(`${urlsApi.materialNvl.importCancel}?id=${id}`, { method: "POST" }).then((r) =>
      r.json()
    ),
};

// ── BOM ───────────────────────────────────────────────────────
export const BomService = {
  list: (
    params: { status?: number; keyword?: string; page?: number; limit?: number },
    signal?: AbortSignal
  ) =>
    fetch(`${urlsApi.materialNvl.bomList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((r) => r.json()),

  summary: (signal?: AbortSignal) =>
    fetch(urlsApi.materialNvl.bomSummary, { signal, method: "GET" }).then((r) => r.json()),

  get: (id: number) =>
    fetch(`${urlsApi.materialNvl.bomGet}?id=${id}`, { method: "GET" }).then((r) => r.json()),

  update: (body: IBomUpsertRequest) =>
    fetch(urlsApi.materialNvl.bomUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  updateStatus: (id: number, status: number) =>
    fetch(`${urlsApi.materialNvl.bomUpdateStatus}?id=${id}&status=${status}`, {
      method: "POST",
    }).then((r) => r.json()),

  delete: (id: number) =>
    fetch(`${urlsApi.materialNvl.bomDelete}?id=${id}`, { method: "DELETE" }).then((r) => r.json()),
};

export default MaterialService;