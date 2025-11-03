import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IIndustryFilterRequest, IIndustryRequestModel } from "model/industry/IndustryRequestModel";

export default {
  list: (params?: IIndustryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.industry.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IIndustryRequestModel) => {
    return fetch(urlsApi.industry.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.industry.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.industry.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
