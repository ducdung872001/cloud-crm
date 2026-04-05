import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  guarantee: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.placeholder.guarantee}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  contractWarranty: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.placeholder.contractWarranty}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  contract: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.placeholder.contract}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  customer: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.placeholder.customer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  contact: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.placeholder.contact}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
