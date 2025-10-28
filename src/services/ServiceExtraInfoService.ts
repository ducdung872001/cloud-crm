import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (serviceId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.serviceExtraInfo.list}?serviceId=${serviceId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  }
};
