import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IBrandNameFilterRequest, IBrandNameRequestModel } from "model/brandName/BrandNameRequestModel";

export default {
  list: (params?: IBrandNameFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.brandName.list, params, signal);
  },
  update: (body: IBrandNameRequestModel) => {
    return apiPost(urlsApi.brandName.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.brandName.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.brandName.delete}?id=${id}`);
  },

  listWhiteList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.brandName.listWhiteList, params, signal);
  },
  updateWhiteList: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.brandName.updateWhiteList, body);
  },
 
  deleteWhiteList: (id: number) => {
    return apiDelete(`${urlsApi.brandName.deleteWhiteList}?id=${id}`);
  },

  changeStatusWhiteList: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.brandName.changeStatusWhiteList, body);
  },
};
