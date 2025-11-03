import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.partner.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.partner.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.partner.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.partner.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.partner.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  //? Lấy số điện thoại, email bị che
  viewPhone: (id: number) => {
    return fetch(`${urlsApi.partner.viewPhone}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  viewEmail: (id: number) => {
    return fetch(`${urlsApi.partner.viewEmail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  numberFieldPartner: (body) => {
    return fetch(`${urlsApi.partner.numberFieldPartner}`, {
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

  autoProcess: (body: any) => {
    return fetch(urlsApi.partner.autoProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  exAttributes: () => {
    return fetch(`${urlsApi.partner.exAttributes}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // lấy ra các trường trong table
  filterTable: (params?: any) => {
    return fetch(`${urlsApi.partner.filterTable}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  partnerExchangeList: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.partner.partnerExchangeList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  partnerExchangeUpdate: (body: any) => {
    return fetch(urlsApi.partner.partnerExchangeUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  partnerExchangeDelete: (id: number) => {
    return fetch(`${urlsApi.partner.partnerExchangeDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
