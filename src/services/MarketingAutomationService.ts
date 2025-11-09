import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IKpiFilterRequest, IKpiRequest } from "model/kpi/KpiRequestModel";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.ma.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.ma.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.ma.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  addNode: (body: any) => {
    return fetch(urlsApi.ma.addNode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  deleteNode: (id: number) => {
    return fetch(`${urlsApi.ma.deleteNode}?nodeId=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  updateNode: (body: any) => {
    return fetch(urlsApi.ma.updateNode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailConfigMA: (id: number) => {
    return fetch(`${urlsApi.ma.detailConfigMA}?maId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  detailMA: (id: number) => {
    return fetch(`${urlsApi.ma.detailMA}?maId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  updateConfigNode: (body: any) => {
    return fetch(urlsApi.ma.updateConfigNode, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  approveMA: (body: any) => {
    return fetch(urlsApi.ma.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  listCustomer: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listCustomer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listCustomerByType: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listCustomerByType}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listCustomerByCareer: (params: any, signal?: AbortSignal) => {
    //Phân bổ gửi email theo nghề nghiệp khách hàng
    return fetch(`${urlsApi.ma.listCustomerByCareer}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listCustomerByCustCard: (params: any, signal?: AbortSignal) => {
    //Phân bổ gửi email theo nhóm khách hàng
    return fetch(`${urlsApi.ma.listCustomerByCustCard}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listCustomerByCustGroup: (params: any, signal?: AbortSignal) => {
    //Tỉ lệ tương tác theo nhóm khách hàng
    return fetch(`${urlsApi.ma.listCustomerByCustGroup}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listCustomerByDate: (params: any, signal?: AbortSignal) => {
    //Tỉ lệ tương theo từng ngày trong chiến dịch
    return fetch(`${urlsApi.ma.listCustomerByDate}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  detailCustomer: (params: any) => {
    return fetch(`${urlsApi.ma.detailCustomer}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  deleteCustomer: (id: number) => {
    return fetch(`${urlsApi.ma.deleteCustomer}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  updateMapping: (body: any) => {
    return fetch(urlsApi.ma.updateMapping, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailMapping: (id: number) => {
    return fetch(`${urlsApi.ma.detailMapping}?maId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

};
