import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractGuarantee.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractGuarantee.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractGuarantee.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contractGuarantee.delete}?id=${id}`);
  },


  guaranteeTypeList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractGuarantee.guaranteeTypeList, params, signal);
  },

  guaranteeTypeUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractGuarantee.guaranteeTypeUpdate, body);
  },
  guaranteeTypeDelete: (id: number) => {
    return apiDelete(`${urlsApi.contractGuarantee.guaranteeTypeDelete}?id=${id}`);
  },

  competencyGuaranteeList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractGuarantee.competencyList, params, signal);
  },

  competencyGuaranteeUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractGuarantee.competencyUpdate, body);
  },
  competencyGuaranteeDelete: (id: number) => {
    return apiDelete(`${urlsApi.contractGuarantee.competencyDelete}?id=${id}`);
  },

  bankList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contractGuarantee.bankList, params, signal);
  },

  bankUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractGuarantee.bankUpdate, body);
  },
  bankDelete: (id: number) => {
    return apiDelete(`${urlsApi.contractGuarantee.bankDelete}?id=${id}`);
  },

  ///lấy danh sách các trường chọn để import

  exAttributes: (params) => {
    return apiGet(urlsApi.contractGuarantee.exAttributes, params);
  },

  numberFieldGuarantee: (body, params) => {
    return fetch(`${urlsApi.contractGuarantee.numberFieldGuarantee}${convertParamsToString(params)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => {
      if (res.ok) {
        return res.arrayBuffer();
      } else {
        return res.json().then((error) => Promise.reject(error));
      }
    });
  },

  // import khách hàng b2
  autoProcess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contractGuarantee.autoProcess, body);
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.contractGuarantee.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  

};
