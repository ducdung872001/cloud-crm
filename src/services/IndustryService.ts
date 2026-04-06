import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IIndustryFilterRequest, IIndustryRequestModel } from "model/industry/IndustryRequestModel";

export default {
  list: (params?: IIndustryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.industry.list, params, signal);
  },
  update: (body: IIndustryRequestModel) => {
    return apiPost(urlsApi.industry.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.industry.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.industry.delete}?id=${id}`);
  },
};
