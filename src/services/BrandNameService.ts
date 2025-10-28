import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IBrandNameFilterRequest, IBrandNameRequestModel } from "model/brandName/BrandNameRequestModel";

export default {
  list: (params?: IBrandNameFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.brandName.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IBrandNameRequestModel) => {
    return fetch(urlsApi.brandName.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.brandName.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.brandName.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listWhiteList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.brandName.listWhiteList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateWhiteList: (body: any) => {
    return fetch(urlsApi.brandName.updateWhiteList, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
 
  deleteWhiteList: (id: number) => {
    return fetch(`${urlsApi.brandName.deleteWhiteList}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  changeStatusWhiteList: (body: any) => {
    return fetch(urlsApi.brandName.changeStatusWhiteList, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
