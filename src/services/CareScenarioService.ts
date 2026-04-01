// src/services/CareScenarioService.ts

import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export interface ICareScenario {
  id?: number;
  bsnId?: number;
  branchId?: number;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig?: string;   // JSON string
  actions: string;          // JSON array string: '["sms","email"]'
  actionConfig?: string;    // JSON object string
  isActive?: number;        // 1=on, 0=off
  employeeId?: number;
  runCount?: number;
  lastRunTime?: string;
  createdTime?: string;
}

export interface ICareScenarioStats {
  active:      number;
  paused:      number;
  total:       number;
  todayRuns:   number;
  successRate: number;
}

export interface ICareScenarioListResult {
  items:     ICareScenario[];
  total:     number;
  page:      number;
  sizeLimit: number;
}

export interface ICareScenarioListParams {
  name?:        string;
  isActive?:    number;   // -1=tất cả, 1=đang chạy, 0=tạm dừng
  triggerType?: string;
  page?:        number;
  sizeLimit?:   number;
}

function clean<T extends Record<string, any>>(p: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as Partial<T>;
}

const CareScenarioService = {
  list: (params: ICareScenarioListParams, signal?: AbortSignal) =>
    fetch(`${urlsApi.careScenario.list}${convertParamsToString(clean(params))}`, {
      signal, method: "GET",
    }).then((r) => r.json()) as Promise<{ code: number; result: ICareScenarioListResult }>,

  stats: (signal?: AbortSignal) =>
    fetch(urlsApi.careScenario.stats, { signal, method: "GET" })
      .then((r) => r.json()) as Promise<{ code: number; result: ICareScenarioStats }>,

  get: (id: number) =>
    fetch(`${urlsApi.careScenario.get}?id=${id}`, { method: "GET" })
      .then((r) => r.json()) as Promise<{ code: number; result: ICareScenario }>,

  update: (body: ICareScenario) =>
    fetch(urlsApi.careScenario.update, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()) as Promise<{ code: number; result: ICareScenario; message?: string }>,

  toggleActive: (id: number, isActive: number) =>
    fetch(urlsApi.careScenario.toggleActive, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    }).then((r) => r.json()) as Promise<{ code: number; result: number }>,

  delete: (id: number) =>
    fetch(`${urlsApi.careScenario.delete}?id=${id}`, { method: "DELETE" })
      .then((r) => r.json()) as Promise<{ code: number; result: number }>,
};

export default CareScenarioService;
