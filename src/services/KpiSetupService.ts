import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IKpiSetupFilterRequest, IKpiSetupRequest } from "model/kpiSetup/KpiSetupRequestModel";

export default {
  list: (params: IKpiSetupFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.kpiSetup.list, params, signal);
  },
  update: (body: IKpiSetupRequest) => {
    return apiPost(urlsApi.kpiSetup.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.kpiSetup.delete}?id=${id}`);
  },
};
