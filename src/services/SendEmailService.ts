import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ISendEmailFilterRequest, ISendEmailRequestModel } from "model/sendEmail/SendEmailRequest";

export default {
  listSendEmail: (params?: ISendEmailFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.sendEmail.listEmail, params, signal);
  },
  sendEmail: (body: ISendEmailRequestModel) => {
    return apiPost(urlsApi.sendEmail.updateEmail, body);
  },
  detailSendEmail: (id: number) => {
    return fetch(`${urlsApi.sendEmail.detailEmail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteSendEmail: (id: number) => {
    return apiDelete(`${urlsApi.sendEmail.deleteEmail}?id=${id}`);
  },
  approveEmail: (id: number) => {
    return fetch(`${urlsApi.sendEmail.approveEmail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cancelEmail: (id: number) => {
    return fetch(`${urlsApi.sendEmail.cancelEmail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
