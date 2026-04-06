import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.grid.list, params, signal);
  },

  //Thêm cột
  update: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.grid.update, body);
  },
  detail: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.grid.detail, params);
  },
  delete: (params: Record<string, unknown>) => {
    return apiDelete(`${urlsApi.grid.delete}${convertParamsToString(params)}`);
  },

  //Thêm hàng
  updateRow: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.grid.updateRow, body);
  },

  detailRow: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.grid.detailRow, params);
  },

  deleteRow: (params: Record<string, unknown>) => {
    return apiDelete(`${urlsApi.grid.deleteRow}${convertParamsToString(params)}`);
  },

  importFile: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.grid.importFile, body);
  },

  getRowsUpload: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.grid.getRowsUpload, params);
  },

  //Thêm comment
  updateComment: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.grid.updateComment, body);
  },
  listComment: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.grid.listComment, params, signal);
  },
};
