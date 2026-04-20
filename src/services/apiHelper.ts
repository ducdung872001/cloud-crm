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

export function apiGet(url: string, params?: Record<string, unknown>, signal?: AbortSignal) {
  return fetch(`${url}${convertParamsToString(params)}`, {
    signal,
    method: "GET",
  }).then((res) => res.json());
}

export function apiPost(url: string, body?: Record<string, unknown>, signal?: AbortSignal) {
  return fetch(url, {
    signal,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json());
}

export function apiPut(url: string, body?: Record<string, unknown>, signal?: AbortSignal) {
  return fetch(url, {
    signal,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json());
}

export function apiDelete(url: string, params?: Record<string, unknown>, signal?: AbortSignal) {
  return fetch(`${url}${convertParamsToString(params)}`, {
    signal,
    method: "DELETE",
  }).then((res) => res.json());
}

export function apiDeleteWithBody(url: string, body?: Record<string, unknown>, signal?: AbortSignal) {
  return fetch(url, {
    signal,
    method: "DELETE",
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json());
}
