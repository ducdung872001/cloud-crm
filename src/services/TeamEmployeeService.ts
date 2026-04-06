import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ISwitchboardFilterRequest, ISwitchboardRequestModel } from "model/switchboard/SwitchboardRequestModel";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.teamEmployee.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.teamEmployee.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.teamEmployee.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.teamEmployee.delete}?id=${id}`);
  },  

  listEmployee: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.teamEmployee.listEmployee, params, signal);
  },

  updateEmployee: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.teamEmployee.updateEmployee, body);
  },

  deleteEmployee: (id: number) => {
    return apiDelete(`${urlsApi.teamEmployee.deleteEmployee}?id=${id}`);
  },  

};
