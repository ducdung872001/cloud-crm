import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IPartnerSMSFilterRequest, IPartnerSMSRequestModel } from "model/partnerSMS/PartnerSMSRequestModel";

export default {
  list: (params?: IPartnerSMSFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.partnerSMS.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IPartnerSMSRequestModel) => {
    return fetch(urlsApi.partnerSMS.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.partnerSMS.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.partnerSMS.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
