import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ISendEmailFilterRequest, ISendEmailRequestModel } from "model/sendEmail/SendEmailRequest";

export default {
  listSendEmail: (params?: ISendEmailFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.sendEmail.listEmail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  sendEmail: (body: ISendEmailRequestModel) => {
    return fetch(urlsApi.sendEmail.updateEmail, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailSendEmail: (id: number) => {
    return fetch(`${urlsApi.sendEmail.detailEmail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteSendEmail: (id: number) => {
    return fetch(`${urlsApi.sendEmail.deleteEmail}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
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
