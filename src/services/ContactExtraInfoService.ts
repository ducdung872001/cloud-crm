import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (contactId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contactExtraInfo.list}?contactId=${contactId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  }
};
