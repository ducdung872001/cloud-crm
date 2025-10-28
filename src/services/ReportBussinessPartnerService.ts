import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IAnalysisFilterRequest } from "model/analysis/AnalysisRequestModel";

export default {
  reportBussinessParner: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportBussinessParner.report}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Chi tiết báo cáo đối tác
  reportDetail: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportBussinessParner.reportDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
