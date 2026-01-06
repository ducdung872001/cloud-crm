import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ISettingFilterRequest, ISettingRequest } from "model/setting/SettingRequestModel";

export default {
  list: (params: ISettingFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.setting.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ISettingRequest) => {
    return fetch(urlsApi.setting.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.setting.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
