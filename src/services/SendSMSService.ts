import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ISendSMSFilterRequest, ISendSMSRequestModel } from "model/sendSMS/SendSMSRequest";

export default {
  // SMS
  listSendSMS: (params?: ISendSMSFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.sendSMS.listSMS}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  sendSMS: (body: ISendSMSRequestModel) => {
    return fetch(urlsApi.sendSMS.updateSMS, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailSendSMS: (id: number) => {
    return fetch(`${urlsApi.sendSMS.detailSMS}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteSendSMS: (id: number) => {
    return fetch(`${urlsApi.sendSMS.deleteSMS}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  approveSMS: (id: number) => {
    return fetch(`${urlsApi.sendSMS.approveSMS}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cancelSMS: (id: number) => {
    return fetch(`${urlsApi.sendSMS.cancelSMS}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
