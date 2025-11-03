import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {

    guaranteeAttachmentList: (params?: any, signal?: AbortSignal) => {
        return fetch(`${urlsApi.guaranteeAttachment.guaranteeAttachmentList}${convertParamsToString(params)}`, {
            signal,
            method: "GET",
        }).then((res) => res.json());
    },

  guaranteeAttachmentUpdate: (body: any) => {
    return fetch(urlsApi.guaranteeAttachment.guaranteeAttachmentUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  guaranteeAttachmentDelete: (id: number) => {
    return fetch(`${urlsApi.guaranteeAttachment.guaranteeAttachmentDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
