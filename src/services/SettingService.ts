import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ISettingFilterRequest, ISettingRequest } from "model/setting/SettingRequestModel";

export default {
  list: (params: ISettingFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.setting.list, params, signal);
  },
  update: (body: ISettingRequest) => {
    return apiPost(urlsApi.setting.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.setting.delete}?id=${id}`);
  },
};
