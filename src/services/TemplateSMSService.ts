import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITemplateSMSFilterRequest, ITemplateSMSRequest } from "model/templateSMS/TemplateSMSRequest";

export default {
  list: (params?: ITemplateSMSFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.templateSMS.list, params, signal);
  },
  update: (body: ITemplateSMSRequest) => {
    return apiPost(urlsApi.templateSMS.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.templateSMS.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.templateSMS.delete}?id=${id}`);
  },
};
