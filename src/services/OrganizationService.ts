import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.organization.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  customerUploadList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.organization.customerUploadList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  customerUploadDelete: (id: number) => {
    return fetch(`${urlsApi.organization.customerUploadDelete}?uploadId=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // customerUploadDelete: (body: any, id: NumberConstructor) => {
  //   return fetch(`${urlsApi.organization.customerUploadDelete}?uploadId=${id}`, {
  //     method: "DELETE",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },
};
