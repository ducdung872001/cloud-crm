import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICrmCareHistoryFilterRequest, ICrmCareHistoryRequest } from "model/crmCareHistory/CrmCareHistoryRequestModel";

export default {
  list: (params: ICrmCareHistoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.crmCareHistory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICrmCareHistoryRequest) => {
    return fetch(urlsApi.crmCareHistory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.crmCareHistory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
