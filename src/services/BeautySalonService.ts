import { apiDelete } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.beautySalon.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "true", // Header tùy chỉnh (nếu có)
      },
    }).then((res) => res.json());
  },
  approve: (id: number) => {
    return fetch(`${urlsApi.beautySalon.approve}?id=${id}`, {
      method: "POST",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.beautySalon.delete}?id=${id}`);
  },
};
