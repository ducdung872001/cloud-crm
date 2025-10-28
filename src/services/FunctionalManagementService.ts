import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IFunctionalManagementFilterRequest,
  IFreeResourceFilterRequest,
  IFunctionalManagementRequest,
} from "model/functionalManagement/FunctionalManagementRequest";

export default {
  list: (params?: IFunctionalManagementFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.functionalManagement.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IFunctionalManagementRequest) => {
    return fetch(urlsApi.functionalManagement.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.functionalManagement.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.functionalManagement.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // lấy ra danh sách tài nguyên chưa thuộc phân hệ nào
  freeResource: (params?: IFreeResourceFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.functionalManagement.freeResource}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
