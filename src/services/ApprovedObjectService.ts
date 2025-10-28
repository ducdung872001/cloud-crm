import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

/**
 * Lịch sử phê duyệt hồ sơ
 */
export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.approvedObjectLog.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },  
};
