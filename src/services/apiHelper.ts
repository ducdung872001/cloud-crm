import { convertParamsToString } from "reborn-util";

/**
 * DRY API helpers — eliminates repeated fetch + JSON.stringify + .then(res => res.json()) pattern.
 *
 * Usage:
 *   import { apiGet, apiPost, apiPut, apiDelete } from "services/apiHelper";
 *
 *   // Before (repeated 1,879 times):
 *   filter: (params) => fetch(`${url}${convertParamsToString(params)}`, { signal, method: "GET" }).then(res => res.json())
 *
 *   // After:
 *   filter: (params, signal?) => apiGet(url, params, signal)
 */

const DEFAULT_TIMEOUT = 15_000; // 15 giây

/**
 * Fetch với timeout — nếu server không phản hồi trong thời gian cho phép,
 * tự động abort request và throw error thay vì treo vô hạn.
 */
function fetchWithTimeout(
  url: string,
  options?: RequestInit & { timeout?: number }
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, signal: externalSignal, ...fetchOptions } = options ?? {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Nếu caller đã truyền signal (AbortController riêng), lắng nghe cả 2
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  return fetch(url, { ...fetchOptions, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
}

export function apiGet(url: string, params?: Record<string, unknown>, signal?: AbortSignal) {
  return fetchWithTimeout(`${url}${convertParamsToString(params)}`, {
    signal,
    method: "GET",
  }).then((res) => res.json());
}

export function apiPost(url: string, body?: Record<string, unknown>, signal?: AbortSignal) {
  return fetchWithTimeout(url, {
    signal,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json());
}

export function apiPut(url: string, body?: Record<string, unknown>, signal?: AbortSignal) {
  return fetchWithTimeout(url, {
    signal,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json());
}

export function apiDelete(url: string, params?: Record<string, unknown>, signal?: AbortSignal) {
  return fetchWithTimeout(`${url}${convertParamsToString(params)}`, {
    signal,
    method: "DELETE",
  }).then((res) => res.json());
}

export function apiDeleteWithBody(url: string, body?: Record<string, unknown>, signal?: AbortSignal) {
  return fetchWithTimeout(url, {
    signal,
    method: "DELETE",
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json());
}
