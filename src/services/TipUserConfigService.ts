import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITipUserConfigFilterRequest, ITipUserConfigRequest } from "model/tipUserConfig/TipUserConfigRequestModel";

export default {
  list: (params: ITipUserConfigFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.tipUserConfig.list, params, signal);
  },
  update: (body: ITipUserConfigRequest) => {
    return apiPost(urlsApi.tipUserConfig.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.tipUserConfig.delete}?id=${id}`);
  },
};
