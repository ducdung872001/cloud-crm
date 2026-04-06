import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IPartnerSMSFilterRequest, IPartnerSMSRequestModel } from "model/partnerSMS/PartnerSMSRequestModel";

export default {
  list: (params?: IPartnerSMSFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.partnerSMS.list, params, signal);
  },
  update: (body: IPartnerSMSRequestModel) => {
    return apiPost(urlsApi.partnerSMS.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.partnerSMS.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.partnerSMS.delete}?id=${id}`);
  },
};
