import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ITipGroupConfigFilterRequest, ITipGroupConfigRequest } from "model/tipGroupConfig/TipGroupConfigRequestModel";

export default {
  list: (params: ITipGroupConfigFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tipGroupConfig.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITipGroupConfigRequest) => {
    return fetch(urlsApi.tipGroupConfig.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.tipGroupConfig.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
