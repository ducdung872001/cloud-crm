import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.grid.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //Thêm cột
  update: (body: any) => {
    return fetch(urlsApi.grid.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (params: any) => {
    return fetch(`${urlsApi.grid.detail}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (params: any) => {
    return fetch(`${urlsApi.grid.delete}${convertParamsToString(params)}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //Thêm hàng
  updateRow: (body: any) => {
    return fetch(urlsApi.grid.updateRow, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailRow: (params: any) => {
    return fetch(`${urlsApi.grid.detailRow}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  deleteRow: (params: any) => {
    return fetch(`${urlsApi.grid.deleteRow}${convertParamsToString(params)}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  importFile: (body: any) => {
    return fetch(urlsApi.grid.importFile, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  getRowsUpload: (params: any) => {
    return fetch(`${urlsApi.grid.getRowsUpload}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //Thêm comment
  updateComment: (body: any) => {
    return fetch(urlsApi.grid.updateComment, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  listComment: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.grid.listComment}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
