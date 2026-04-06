import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ISendSMSFilterRequest, ISendSMSRequestModel } from "model/sendSMS/SendSMSRequest";

export default {
  // SMS
  listSendSMS: (params?: ISendSMSFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.sendSMS.listSMS, params, signal);
  },
  sendSMS: (body: ISendSMSRequestModel) => {
    return apiPost(urlsApi.sendSMS.updateSMS, body);
  },
  detailSendSMS: (id: number) => {
    return fetch(`${urlsApi.sendSMS.detailSMS}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteSendSMS: (id: number) => {
    return apiDelete(`${urlsApi.sendSMS.deleteSMS}?id=${id}`);
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
