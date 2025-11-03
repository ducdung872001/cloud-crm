import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractWarranty.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.contractWarranty.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractWarranty.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contractWarranty.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  warrantyTypeList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractWarranty.warrantyTypeList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  warrantyTypeUpdate: (body: any) => {
    return fetch(urlsApi.contractWarranty.warrantyTypeUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  warrantyTypeDelete: (id: number) => {
    return fetch(`${urlsApi.contractWarranty.warrantyTypeDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  competencyWarrantyList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractWarranty.competencyList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  competencyWarrantyUpdate: (body: any) => {
    return fetch(urlsApi.contractWarranty.competencyUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  competencyWarrantyDelete: (id: number) => {
    return fetch(`${urlsApi.contractWarranty.competencyDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  bankList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractWarranty.bankList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  bankUpdate: (body: any) => {
    return fetch(urlsApi.contractWarranty.bankUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  bankDelete: (id: number) => {
    return fetch(`${urlsApi.contractWarranty.bankDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  ///lấy danh sách các trường chọn để import

  exAttributes: (params) => {
    return fetch(`${urlsApi.contractWarranty.exAttributes}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  numberFieldWarranty: (body, params) => {
    return fetch(`${urlsApi.contractWarranty.numberFieldWarranty}${convertParamsToString(params)}`, {
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
    return fetch(urlsApi.contractWarranty.autoProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.contractWarranty.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },
};
