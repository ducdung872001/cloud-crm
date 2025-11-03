import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IListRelatedToCustomerCommonFilterRequest, IScheduleCommonFilterRequest } from "model/scheduleCommon/ScheduleCommonRequestModal";

export default {
  listCommon: (params?: IScheduleCommonFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.scheduleCommon.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listRelatedToCustomer: (params?: IListRelatedToCustomerCommonFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.scheduleCommon.listRelatedToCustomer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
