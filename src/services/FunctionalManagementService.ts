import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  IFunctionalManagementFilterRequest,
  IFreeResourceFilterRequest,
  IFunctionalManagementRequest,
} from "model/functionalManagement/FunctionalManagementRequest";

export default {
  list: (params?: IFunctionalManagementFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.functionalManagement.list, params, signal);
  },
  update: (body: IFunctionalManagementRequest) => {
    return apiPost(urlsApi.functionalManagement.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.functionalManagement.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.functionalManagement.delete}?id=${id}`);
  },
  // lấy ra danh sách tài nguyên chưa thuộc phân hệ nào
  freeResource: (params?: IFreeResourceFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.functionalManagement.freeResource, params, signal);
  },
};
