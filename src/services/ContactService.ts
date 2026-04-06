import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IContactFilterRequest, IContactRequest, IContactFieldFilterRequest } from "model/contact/ContactRequestModel";

export default {
  list: (params: IContactFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.contact.list, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contact.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContactRequest) => {
    return apiPost(urlsApi.contact.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contact.delete}?id=${id}`);
  },
  fieldTable: (params: IContactFieldFilterRequest) => {
    return apiGet(urlsApi.contact.fieldTable, params);
  },

  contactExchange: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.contact.contactExchange, params);
  },
  // xóa đi 1 trao đổi 
  deleteContactExchange: (id: number) => {
    return apiDelete(`${urlsApi.contact.deleteContactExchange}?id=${id}`);
  },
  // thêm mới trao đổi 
  addContactExchange: (body) => {
    return apiPost(urlsApi.contact.addContactExchange, body);
  },

  // cập nhật lại trao đổi 
  updateContactExchange: (id: number) => {
    return fetch(`${urlsApi.contact.updateContactExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  
  ///lấy danh sách các trường chọn để import

  exAttributes: (params) => {
    return apiGet(urlsApi.contact.exAttributes, params);
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
  autoProcess: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contact.autoProcess, body);
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.contact.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  }
};
