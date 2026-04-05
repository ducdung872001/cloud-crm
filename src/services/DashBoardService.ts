import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  detail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.dashboard.detail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
