import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractGuarantee.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.contractGuarantee.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractGuarantee.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contractGuarantee.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },


  guaranteeTypeList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractGuarantee.guaranteeTypeList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  guaranteeTypeUpdate: (body: any) => {
    return fetch(urlsApi.contractGuarantee.guaranteeTypeUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  guaranteeTypeDelete: (id: number) => {
    return fetch(`${urlsApi.contractGuarantee.guaranteeTypeDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  competencyGuaranteeList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractGuarantee.competencyList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  competencyGuaranteeUpdate: (body: any) => {
    return fetch(urlsApi.contractGuarantee.competencyUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  competencyGuaranteeDelete: (id: number) => {
    return fetch(`${urlsApi.contractGuarantee.competencyDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  bankList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractGuarantee.bankList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  bankUpdate: (body: any) => {
    return fetch(urlsApi.contractGuarantee.bankUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  bankDelete: (id: number) => {
    return fetch(`${urlsApi.contractGuarantee.bankDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  ///lấy danh sách các trường chọn để import

  exAttributes: (params) => {
    return fetch(`${urlsApi.contractGuarantee.exAttributes}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
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
  autoProcess: (body: any) => {
    return fetch(urlsApi.contractGuarantee.autoProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.contractGuarantee.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  

};
