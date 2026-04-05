import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.dataSupplySource.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  
};
