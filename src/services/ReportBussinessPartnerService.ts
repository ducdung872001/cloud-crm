import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IAnalysisFilterRequest } from "model/analysis/AnalysisRequestModel";

export default {
  reportBussinessParner: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportBussinessParner.report, params, signal);
  },
  // Chi tiết báo cáo đối tác
  reportDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportBussinessParner.reportDetail, params, signal);
  },
};
