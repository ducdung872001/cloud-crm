import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  detail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.dashboard.detail, params, signal);
  },
};
