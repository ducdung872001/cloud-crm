import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKpiExchangeFilterRequest, IKpiObjectFilterRequest, IKpiObjectRequest } from "model/kpiObject/KpiObjectRequestModel";

export default {
  list: (params: IKpiObjectFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpiObject.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IKpiObjectRequest) => {
    return fetch(urlsApi.kpiObject.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.kpiObject.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.kpiObject.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  detailKpiEmployee: (params: any) => {
    return fetch(`${urlsApi.kpiObject.detailKpiEmployee}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  exchangelist: (params: IKpiExchangeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.kpiObject.exchangeList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // xóa đi 1 trao đổi 
  deleteKpiExchange: (id: number) => {
    return fetch(`${urlsApi.kpiObject.deleteKpiExchange}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // thêm mới trao đổi 
  addKpiExchange: (body) => {
    return fetch(urlsApi.kpiObject.addKpiExchange, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // cập nhật lại trao đổi 
  updateKpiExchange: (id: number) => {
    return fetch(`${urlsApi.kpiObject.updateKpiExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
