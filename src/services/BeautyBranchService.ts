import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IBeautyBranchFilterRequest, IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";

export default {
  list: (params: IBeautyBranchFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.beautyBranch.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  childList: (params: IBeautyBranchFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.beautyBranch.childList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IBeautyBranchRequest) => {
    return fetch(urlsApi.beautyBranch.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.beautyBranch.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
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
  getBeautyBranchByCode: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.beautyBranch.getBeautyBranchByCode}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // thay đổi trạng thái chi nhánh
  unActivate: (body: any) => {
    return fetch(urlsApi.beautyBranch.unActivate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  activate: (body: any) => {
    return fetch(urlsApi.beautyBranch.activate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
