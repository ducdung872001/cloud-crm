import { urlsApi } from "configs/urls";
import { IContactStatusRequest } from "model/contactStatus/ContactStatusRequestModel";

export default {
  list: (pipelineId: number) => {
    return fetch(`${urlsApi.contactStatus.list}?pipelineId=${pipelineId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContactStatusRequest) => {
    return fetch(urlsApi.contactStatus.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contactStatus.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contactStatus.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
