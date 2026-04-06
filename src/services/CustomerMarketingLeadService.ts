import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICustomerSourceFilterRequest, ICustomerSourceRequest } from "model/customerSource/CustomerSourceRequest";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.customerMarketingLead.list, params, signal);
  },
  update: (body: ICustomerSourceRequest) => {
    return apiPost(urlsApi.customerMarketingLead.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.customerMarketingLead.delete}?id=${id}`);
  },
};
