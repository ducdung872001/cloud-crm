import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { IPartnerCallFilterRequest, IPartnerCallRequestModel } from "model/partnerCall/PartnerCallRequestModel";

export default {
  list: (params?: IPartnerCallFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.partnerCall.list, params, signal);
  },
  update: (body: IPartnerCallRequestModel) => {
    return apiPost(urlsApi.partnerCall.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.partnerCall.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.partnerCall.delete}?id=${id}`);
  },
};
