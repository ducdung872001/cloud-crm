import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (contractId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractExtraInfo.list}?contractId=${contractId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  }
};
