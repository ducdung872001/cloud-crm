import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IPartnerCallFilterRequest, IPartnerCallRequestModel } from "model/partnerCall/PartnerCallRequestModel";

export default {
  list: (params?: IPartnerCallFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.partnerCall.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IPartnerCallRequestModel) => {
    return fetch(urlsApi.partnerCall.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.partnerCall.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.partnerCall.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
