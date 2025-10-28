import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IPartnerEmailFilterRequest, IPartnerEmailRequestModel } from "model/partnerEmail/PartnerEmailRequestModel";

export default {
  list: (params?: IPartnerEmailFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.partnerEmail.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IPartnerEmailRequestModel) => {
    return fetch(urlsApi.partnerEmail.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.partnerEmail.delete}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.partnerEmail.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
