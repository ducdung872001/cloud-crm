import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ITipUserConfigFilterRequest, ITipUserConfigRequest } from "model/tipUserConfig/TipUserConfigRequestModel";

export default {
  list: (params: ITipUserConfigFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tipUserConfig.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITipUserConfigRequest) => {
    return fetch(urlsApi.tipUserConfig.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.tipUserConfig.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
