import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (objectId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.objectExtraInfo.list}?objectId=${objectId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  }
};
