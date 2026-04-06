import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.partner.list, params, signal);
  },
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.partner.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.partner.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.partner.delete}?id=${id}`);
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

  numberFieldPartner: (body: Record<string, unknown>) => {
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

  autoProcess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.partner.autoProcess, body);
  },

  exAttributes: () => {
    return fetch(`${urlsApi.partner.exAttributes}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // lấy ra các trường trong table
  filterTable: (params?: Record<string, unknown>) => {
    return apiGet(urlsApi.partner.filterTable, params);
  },

  partnerExchangeList: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.partner.partnerExchangeList, params, signal);
  },

  partnerExchangeUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.partner.partnerExchangeUpdate, body);
  },
  partnerExchangeDelete: (id: number) => {
    return apiDelete(`${urlsApi.partner.partnerExchangeDelete}?id=${id}`);
  },
};
