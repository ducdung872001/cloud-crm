import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ISwitchboardFilterRequest, ISwitchboardRequestModel } from "model/switchboard/SwitchboardRequestModel";

export default {
  list: (params?: ISwitchboardFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.switchboard.list, params, signal);
  },
  update: (body: ISwitchboardRequestModel) => {
    return apiPost(urlsApi.switchboard.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.switchboard.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.switchboard.delete}?id=${id}`);
  },  

  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.switchboard.updateStatus, body);
  },
};
