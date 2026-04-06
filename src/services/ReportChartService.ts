import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  listReportArtifact: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportChart.listReportArtifact, params, signal);
  },
  updateReportArtifact: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.reportChart.updateReportArtifact, body);
  },
  deleteReportArtifact: (id: number) => {
    return apiDelete(`${urlsApi.reportChart.deleteReportArtifact}?id=${id}`);
  },

  listReportDashboard: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportChart.listReportDashboard, params, signal);
  },
  updateReportDashboard: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.reportChart.updateReportDashboard, body);
  },
  deleteReportDashboard: (id: number) => {
    return apiDelete(`${urlsApi.reportChart.deleteReportDashboard}?id=${id}`);
  },

  // detail: (id: number) => {
  //   return fetch(`${urlsApi.rentalType.detail}?id=${id}`, {
  //     method: "GET",
  //   }).then((res) => res.json());
  // },

  listArtifactByDashboard: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportChart.listArtifactByDashboard, params, signal);
  },

  listArtifactByEmployee: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportChart.listArtifactByEmployee, params, signal);
  },

  updateReportConfig: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.reportChart.updateReportConfig, body);
  },
  deleteReportConfig: (id: number) => {
    return apiDelete(`${urlsApi.reportChart.deleteReportConfig}?id=${id}`);
  },

  listReportRole: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.reportChart.listReportRole, params, signal);
  },
  updateReportRole: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.reportChart.updateReportRole, body);
  },
  deleteReportRole: (id: number) => {
    return apiDelete(`${urlsApi.reportChart.deleteReportRole}?id=${id}`);
  },

};
