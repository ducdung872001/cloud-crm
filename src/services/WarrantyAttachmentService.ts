import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  warrantyAttachmentList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warrantyAttachment.warrantyAttachmentList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  warrantyAttachmentUpdate: (body: any) => {
    return fetch(urlsApi.warrantyAttachment.warrantyAttachmentUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  warrantyAttachmentDelete: (id: number) => {
    return fetch(`${urlsApi.warrantyAttachment.warrantyAttachmentDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
