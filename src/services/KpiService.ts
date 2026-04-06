import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IKpiFilterRequest, IKpiRequest } from "model/kpi/KpiRequestModel";

export default {
  list: (params: IKpiFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.kpi.list, params, signal);
  },
  update: (body: IKpiRequest) => {
    return apiPost(urlsApi.kpi.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.kpi.delete}?id=${id}`);
  },

  checkKpiCampaign: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.kpi.checkKpiCampaign, params, signal);
  },

  updateKpi: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.kpi.updateKpi, body);
  },

  listEmployeeKpi: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.kpi.listEmployeeKpi, params, signal);
  },

  addEmployeeToKpi: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.kpi.addEmployeeToKpi, params, signal);
  },

  listGoalKpiEmployee: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.kpi.listGoalKpiEmployee, params, signal);
  },

  saveKpiEmployee: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.kpi.saveKpiEmployee, body);
  },

  deleteEmployeeKpi: (id: number) => {
    return apiDelete(`${urlsApi.kpi.deleteEmployeeKpi}?id=${id}`);
  },

  addEmployeeToKpiContact: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.kpi.addEmployeeToKpiContact, params, signal);
  },

  saveKpiContactEmployee: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.kpi.saveKpiContactEmployee, body);
  },

  listEmployeeKpiContact: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.kpi.listEmployeeKpiContact, params, signal);
  },

  deleteEmployeeKpiContact: (employeeId: number, campaignId: number) => {
    return apiDelete(`${urlsApi.kpi.deleteEmployeeKpiContact}?employeeId=${employeeId}&campaignId=${campaignId}`);
  },
};
