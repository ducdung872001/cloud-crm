import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (productId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.productExtraInfo.list}?productId=${productId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  }
};
