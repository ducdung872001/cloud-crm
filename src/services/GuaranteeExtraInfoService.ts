import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (guaranteeId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.guaranteeExtraInfo.list}?guaranteeId=${guaranteeId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  }
};
