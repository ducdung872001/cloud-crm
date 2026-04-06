import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  guarantee: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.placeholder.guarantee, params, signal);
  },
  contractWarranty: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.placeholder.contractWarranty, params, signal);
  },
  contract: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.placeholder.contract, params, signal);
  },
  customer: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.placeholder.customer, params, signal);
  },
  contact: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.placeholder.contact, params, signal);
  },
};
