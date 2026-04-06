import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICrmCareHistoryFilterRequest, ICrmCareHistoryRequest } from "model/crmCareHistory/CrmCareHistoryRequestModel";

export default {
  list: (params: ICrmCareHistoryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.crmCareHistory.list, params, signal);
  },
  update: (body: ICrmCareHistoryRequest) => {
    return apiPost(urlsApi.crmCareHistory.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.crmCareHistory.delete}?id=${id}`);
  },
};
