import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITipGroupConfigFilterRequest, ITipGroupConfigRequest } from "model/tipGroupConfig/TipGroupConfigRequestModel";

export default {
  list: (params: ITipGroupConfigFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.tipGroupConfig.list, params, signal);
  },
  update: (body: ITipGroupConfigRequest) => {
    return apiPost(urlsApi.tipGroupConfig.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.tipGroupConfig.delete}?id=${id}`);
  },
};
