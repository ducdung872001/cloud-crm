import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  listReportArtifact: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportChart.listReportArtifact}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateReportArtifact: (body: any) => {
    return fetch(urlsApi.reportChart.updateReportArtifact, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteReportArtifact: (id: number) => {
    return fetch(`${urlsApi.reportChart.deleteReportArtifact}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listReportDashboard: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportChart.listReportDashboard}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateReportDashboard: (body: any) => {
    return fetch(urlsApi.reportChart.updateReportDashboard, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteReportDashboard: (id: number) => {
    return fetch(`${urlsApi.reportChart.deleteReportDashboard}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // detail: (id: number) => {
  //   return fetch(`${urlsApi.rentalType.detail}?id=${id}`, {
  //     method: "GET",
  //   }).then((res) => res.json());
  // },

  listArtifactByDashboard: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportChart.listArtifactByDashboard}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  listArtifactByEmployee: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportChart.listArtifactByEmployee}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  updateReportConfig: (body: any) => {
    return fetch(urlsApi.reportChart.updateReportConfig, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteReportConfig: (id: number) => {
    return fetch(`${urlsApi.reportChart.deleteReportConfig}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  listReportRole: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.reportChart.listReportRole}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateReportRole: (body: any) => {
    return fetch(urlsApi.reportChart.updateReportRole, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteReportRole: (id: number) => {
    return fetch(`${urlsApi.reportChart.deleteReportRole}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

};
