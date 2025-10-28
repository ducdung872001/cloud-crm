import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ISwitchboardFilterRequest, ISwitchboardRequestModel } from "model/switchboard/SwitchboardRequestModel";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.teamEmployee.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.teamEmployee.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.teamEmployee.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.teamEmployee.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },  

  listEmployee: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.teamEmployee.listEmployee}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateEmployee: (body: any) => {
    return fetch(urlsApi.teamEmployee.updateEmployee, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  deleteEmployee: (id: number) => {
    return fetch(`${urlsApi.teamEmployee.deleteEmployee}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },  

};
