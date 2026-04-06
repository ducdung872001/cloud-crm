import { apiDelete, apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.organization.list, params, signal);
  },
  customerUploadList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.organization.customerUploadList, params, signal);
  },

  customerUploadDelete: (id: number) => {
    return apiDelete(`${urlsApi.organization.customerUploadDelete}?uploadId=${id}`);
  },

  // customerUploadDelete: (body: any, id: NumberConstructor) => {
  //   return fetch(`${urlsApi.organization.customerUploadDelete}?uploadId=${id}`, {
  //     method: "DELETE",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },
};
