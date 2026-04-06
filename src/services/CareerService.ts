import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICareerFilterRequest, ICareerRequest } from "model/career/CareerRequest";

export default {
  list: (params?: ICareerFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.career.list, params, signal);
  },
  update: (body: ICareerRequest) => {
    return apiPost(urlsApi.career.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.career.delete}?id=${id}`);
  },
};
