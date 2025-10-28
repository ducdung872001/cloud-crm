import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKpiFilterRequest, IKpiRequest } from "model/kpi/KpiRequestModel";

export default {
  list: (params: IKpiFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpi.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IKpiRequest) => {
    return fetch(urlsApi.kpi.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.kpi.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  checkKpiCampaign: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpi.checkKpiCampaign}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateKpi: (body: any) => {
    return fetch(urlsApi.kpi.updateKpi, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listEmployeeKpi: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpi.listEmployeeKpi}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  addEmployeeToKpi: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpi.addEmployeeToKpi}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  listGoalKpiEmployee: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpi.listGoalKpiEmployee}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  saveKpiEmployee: (body: any) => {
    return fetch(urlsApi.kpi.saveKpiEmployee, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  deleteEmployeeKpi: (id: number) => {
    return fetch(`${urlsApi.kpi.deleteEmployeeKpi}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  addEmployeeToKpiContact: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpi.addEmployeeToKpiContact}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  saveKpiContactEmployee: (body: any) => {
    return fetch(urlsApi.kpi.saveKpiContactEmployee, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listEmployeeKpiContact: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpi.listEmployeeKpiContact}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  deleteEmployeeKpiContact: (employeeId: number, campaignId: number) => {
    return fetch(`${urlsApi.kpi.deleteEmployeeKpiContact}?employeeId=${employeeId}&campaignId=${campaignId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
