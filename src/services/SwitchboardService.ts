import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ISwitchboardFilterRequest, ISwitchboardRequestModel } from "model/switchboard/SwitchboardRequestModel";

export default {
  list: (params?: ISwitchboardFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.switchboard.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ISwitchboardRequestModel) => {
    return fetch(urlsApi.switchboard.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.switchboard.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.switchboard.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },  

  updateStatus: (body: any) => {
    return fetch(urlsApi.switchboard.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
