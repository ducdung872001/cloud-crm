import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IContactFilterRequest, IContactRequest, IContactFieldFilterRequest } from "model/contact/ContactRequestModel";

export default {
  list: (params: IContactFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contact.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contact.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContactRequest) => {
    return fetch(urlsApi.contact.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contact.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  fieldTable: (params: IContactFieldFilterRequest) => {
    return fetch(`${urlsApi.contact.fieldTable}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  contactExchange: (params: any) => {
    return fetch(`${urlsApi.contact.contactExchange}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 trao đổi 
  deleteContactExchange: (id: number) => {
    return fetch(`${urlsApi.contact.deleteContactExchange}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // thêm mới trao đổi 
  addContactExchange: (body) => {
    return fetch(urlsApi.contact.addContactExchange, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // cập nhật lại trao đổi 
  updateContactExchange: (id: number) => {
    return fetch(`${urlsApi.contact.updateContactExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  
  ///lấy danh sách các trường chọn để import

  exAttributes: (params) => {
    return fetch(`${urlsApi.contact.exAttributes}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  numberFieldContact: (body, params) => {
    return fetch(`${urlsApi.contact.numberFieldContact}${convertParamsToString(params)}`, {
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
    return fetch(urlsApi.contact.autoProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.contact.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  }
};
