import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IKpiFilterRequest, IKpiRequest } from "model/kpi/KpiRequestModel";

export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.ma.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.ma.update, body);
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.ma.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.ma.delete}?id=${id}`);
  },

  addNode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.ma.addNode, body);
  },

  deleteNode: (id: number) => {
    return apiDelete(`${urlsApi.ma.deleteNode}?nodeId=${id}`);
  },

  updateNode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.ma.updateNode, body);
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

  updateConfigNode: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.ma.updateConfigNode, body);
  },

  approveMA: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.ma.updateStatus, body);
  },

  listCustomer: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.ma.listCustomer, params, signal);
  },
  listCustomerByType: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.ma.listCustomerByType, params, signal);
  },
  listCustomerByCareer: (params: Record<string, unknown>, signal?: AbortSignal) => {
    //Phân bổ gửi email theo nghề nghiệp khách hàng
    return apiGet(urlsApi.ma.listCustomerByCareer, params, signal);
  },
  listCustomerByCustCard: (params: Record<string, unknown>, signal?: AbortSignal) => {
    //Phân bổ gửi email theo nhóm khách hàng
    return apiGet(urlsApi.ma.listCustomerByCustCard, params, signal);
  },
  listCustomerByCustGroup: (params: Record<string, unknown>, signal?: AbortSignal) => {
    //Tỉ lệ tương tác theo nhóm khách hàng
    return apiGet(urlsApi.ma.listCustomerByCustGroup, params, signal);
  },
  listCustomerByDate: (params: Record<string, unknown>, signal?: AbortSignal) => {
    //Tỉ lệ tương theo từng ngày trong chiến dịch
    return apiGet(urlsApi.ma.listCustomerByDate, params, signal);
  },

  detailCustomer: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.ma.detailCustomer, params);
  },

  deleteCustomer: (id: number) => {
    return apiDelete(`${urlsApi.ma.deleteCustomer}?id=${id}`);
  },
  updateMapping: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.ma.updateMapping, body);
  },

  detailMapping: (id: number) => {
    return fetch(`${urlsApi.ma.detailMapping}?maId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

};
