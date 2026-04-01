// Đặt tại: src/services/PaymentMethodService.ts
import { convertParamsToString } from "reborn-util";
import {
  IPaymentTemplateRequest,
  IStorePaymentConfigRequest,
} from "model/paymentMethod/PaymentMethodModel";

const BASE = "/bizapi/sales";

/**
 * Lọc bỏ undefined/null/"" trước khi build query string.
 * convertParamsToString serialize undefined thành chuỗi "undefined" nên phải clean trước.
 */
const cleanParams = (params: Record<string, any>): Record<string, any> =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

// ── Tầng 1: System Admin ──────────────────────────────────────────────────
export const PaymentTemplateService = {
  list: (params?: { keyword?: string; isActive?: boolean }, signal?: AbortSignal) =>
    fetch(
      `${BASE}/payment-template/list${convertParamsToString(cleanParams(params ?? {}))}`,
      { signal, method: "GET" }
    ).then((r) => r.json()),

  update: (body: IPaymentTemplateRequest) =>
    fetch(`${BASE}/payment-template/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  toggle: (id: number, isActive: boolean) =>
    fetch(`${BASE}/payment-template/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    }).then((r) => r.json()),

  delete: (id: number) =>
    fetch(`${BASE}/payment-template/delete?id=${id}`, { method: "DELETE" })
      .then((r) => r.json()),
};

// ── Tầng 2: Store Admin ───────────────────────────────────────────────────
export const StorePaymentConfigService = {
  list: (branchId?: number, signal?: AbortSignal) =>
    fetch(
      `${BASE}/store-payment-config/list${convertParamsToString(cleanParams({ branchId }))}`,
      { signal, method: "GET" }
    ).then((r) => r.json()),

  availableTemplates: (branchId?: number) =>
    fetch(
      `${BASE}/store-payment-config/available-templates${convertParamsToString(cleanParams({ branchId }))}`,
      { method: "GET" }
    ).then((r) => r.json()),

  update: (body: IStorePaymentConfigRequest, branchId?: number) =>
    fetch(
      `${BASE}/store-payment-config/update${convertParamsToString(cleanParams({ branchId }))}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    ).then((r) => r.json()),

  toggle: (id: number, isActive: boolean) =>
    fetch(`${BASE}/store-payment-config/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    }).then((r) => r.json()),

  setDefault: (id: number, branchId?: number) =>
    fetch(
      `${BASE}/store-payment-config/set-default${convertParamsToString(cleanParams({ id, branchId }))}`,
      { method: "POST" }
    ).then((r) => r.json()),

  delete: (id: number) =>
    fetch(`${BASE}/store-payment-config/delete?id=${id}`, { method: "DELETE" })
      .then((r) => r.json()),
};