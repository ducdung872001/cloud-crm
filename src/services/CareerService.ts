import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICareerFilterRequest, ICareerRequest } from "model/career/CareerRequest";

export default {
  list: (params?: ICareerFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.career.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICareerRequest) => {
    return fetch(urlsApi.career.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.career.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
