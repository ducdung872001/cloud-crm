import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IPomRequest } from "model/pom/PomRequestModel";

export default {
  list: (serviceId: number) => {
    return fetch(`${urlsApi.pom.list}?serviceId=${serviceId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IPomRequest) => {
    return apiPost(urlsApi.pom.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.pom.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.pom.delete}?id=${id}`);
  },
  lstPomSales: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.pom.lstPomSales, params);
  },
};
