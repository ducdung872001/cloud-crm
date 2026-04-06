import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IListRelatedToCustomerCommonFilterRequest, IScheduleCommonFilterRequest } from "model/scheduleCommon/ScheduleCommonRequestModal";

export default {
  listCommon: (params?: IScheduleCommonFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.scheduleCommon.list, params, signal);
  },
  listRelatedToCustomer: (params?: IListRelatedToCustomerCommonFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.scheduleCommon.listRelatedToCustomer, params, signal);
  },
};
