import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IUnitFilterRequest, IUnitRequest } from "model/unit/UnitRequestModel";

export default {
  list: (params: IUnitFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.unit.list, params, signal);
  },
  update: (body: IUnitRequest) => {
    return apiPost(urlsApi.unit.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.unit.delete}?id=${id}`);
  },
};
