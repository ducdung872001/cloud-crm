import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.fs.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.fs.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateAndInit: (body: any) => {
    return fetch(urlsApi.fs.updateAndInit, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateStatus: (body: any) => {
    return fetch(urlsApi.fs.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  resetSignature: (params: any) => {
    return fetch(`${urlsApi.fs.resetSignal}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.fs.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.fs.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  cloneFs: (body: any) => {
    return fetch(urlsApi.fs.cloneFs, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  fsFormLst: (params?: any) => {
    return fetch(`${urlsApi.fs.fsFormLst}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  fsFormUpdate: (body: any) => {
    return fetch(`${urlsApi.fs.fsFormUpdate}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  fsFormDelete: (id: number) => {
    return fetch(`${urlsApi.fs.fsFormDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  fsFormUpdatePostion: (body) => {
    return fetch(urlsApi.fs.fsFormUpdatePostion, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
