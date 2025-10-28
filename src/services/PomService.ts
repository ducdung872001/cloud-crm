import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IPomRequest } from "model/pom/PomRequestModel";

export default {
  list: (serviceId: number) => {
    return fetch(`${urlsApi.pom.list}?serviceId=${serviceId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IPomRequest) => {
    return fetch(urlsApi.pom.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.pom.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.pom.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  lstPomSales: (params: any) => {
    return fetch(`${urlsApi.pom.lstPomSales}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
