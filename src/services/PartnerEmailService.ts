import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IPartnerEmailFilterRequest, IPartnerEmailRequestModel } from "model/partnerEmail/PartnerEmailRequestModel";

export default {
  list: (params?: IPartnerEmailFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.partnerEmail.list, params, signal);
  },
  update: (body: IPartnerEmailRequestModel) => {
    return apiPost(urlsApi.partnerEmail.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.partnerEmail.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.partnerEmail.delete}?id=${id}`);
  },
};
