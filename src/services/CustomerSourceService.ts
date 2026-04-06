import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICustomerSourceFilterRequest, ICustomerSourceRequest } from "model/customerSource/CustomerSourceRequest";

export default {
  list: (params?: ICustomerSourceFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.customerSource.list, params, signal);
  },
  update: (body: ICustomerSourceRequest) => {
    return apiPost(urlsApi.customerSource.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.customerSource.delete}?id=${id}`);
  },
};
