import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IMaterialFilterRequest, IMaterialRequest } from "model/material/MaterialRequestModel";
import { IMaterialImportRequest } from "model/material/MaterialImportModel";
import { IBomUpsertRequest } from "model/material/BomModel";

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
};

// ── Material Import ───────────────────────────────────────────
export const MaterialImportService = {
  list: (params: { status?: number; keyword?: string; page?: number; limit?: number }, signal?: AbortSignal) =>
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
    fetch(`${urlsApi.materialNvl.importConfirm}?id=${id}`, { method: "POST" }).then((r) => r.json()),

  cancel: (id: number) =>
    fetch(`${urlsApi.materialNvl.importCancel}?id=${id}`, { method: "POST" }).then((r) => r.json()),
};

// ── BOM ───────────────────────────────────────────────────────
export const BomService = {
  list: (params: { status?: number; keyword?: string; page?: number; limit?: number }, signal?: AbortSignal) =>
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