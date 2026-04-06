import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";


/**
 * Lịch sử phê duyệt hồ sơ
 */
export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.approvedObjectLog.lst, params, signal);
  },  
};
