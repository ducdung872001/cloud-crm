import { apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.commission.list, params, signal);
  },
  recompute: (orderId: number) => {
    return apiPost(`${urlsApi.commission.recompute}?orderId=${orderId}`);
  },
};
