import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICustomerGroupFilterRequest, ICustomerGroupRequest } from "model/customerGroup/CustomerGroupRequestModel";

export default {
  list: (params?: ICustomerGroupFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.customerGroup.list, params, signal);
  },
  update: (body: ICustomerGroupRequest) => {
    return apiPost(urlsApi.customerGroup.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.customerGroup.delete}?id=${id}`);
  },
};
