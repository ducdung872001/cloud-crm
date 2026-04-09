import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  lst: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.document.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.document.update, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (nodeId: string, processId: number, potId: number, fieldName: string, workId: number, documentType: string) => {
    return fetch(
      `${urlsApi.document.detail}?nodeId=${nodeId}&processId=${processId}&workId=${workId}&potId=${potId}&fieldName=${fieldName}&documentType=${documentType}`,
      {
        method: "GET",
      }
    ).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.document.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  deleteByUrl: (nodeId: string, processId: number, potId: number, fieldName: string, fileUrl: string, documentType: string) => {
    return fetch(
      `${urlsApi.document.deleteByUrl}?nodeId=${nodeId}&processId=${processId}&potId=${potId}&fieldName=${fieldName}&fileUrl=${fileUrl}&documentType=${documentType}`,
      {
        method: "DELETE",
      }
    ).then((res) => res.json());
  },
};
