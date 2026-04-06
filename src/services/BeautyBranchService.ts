import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IBeautyBranchFilterRequest, IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";

export default {
  list: (params: IBeautyBranchFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.beautyBranch.list, params, signal);
  },

  childList: (params: IBeautyBranchFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.beautyBranch.childList, params, signal);
  },
  update: (body: IBeautyBranchRequest) => {
    return apiPost(urlsApi.beautyBranch.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.beautyBranch.delete}?id=${id}`);
  },
  getByBeauty: (token: string) => {
    return fetch(urlsApi.beautyBranch.getByBeauty, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.beautyBranch.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //tìm đối tác (chi nhánh) bằng mã
  getBeautyBranchByCode: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.beautyBranch.getBeautyBranchByCode, params, signal);
  },

  // thay đổi trạng thái chi nhánh
  unActivate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.beautyBranch.unActivate, body);
  },

  activate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.beautyBranch.activate, body);
  },
};
