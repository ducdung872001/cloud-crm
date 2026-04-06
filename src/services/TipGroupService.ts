import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  ITipGroupFilterRequest,
  ITipGroupRequest,
  ITipGroupToTipGroupEmployeeFilterRequest,
  ITipGroupToTipGroupEmployeeRequest,
} from "model/tipGroup/TipGroupRequestModel";

export default {
  list: (params: ITipGroupFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.tipGroup.list, params, signal);
  },
  update: (body: ITipGroupRequest) => {
    return apiPost(urlsApi.tipGroup.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.tipGroup.delete}?id=${id}`);
  },
  listGroupTipEmloyee: (params?: ITipGroupToTipGroupEmployeeFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.tipGroup.listTipGroupEmloyee, params, signal);
  },
  updateGroupTipEmloyee: (body: ITipGroupToTipGroupEmployeeRequest) => {
    return apiPost(urlsApi.tipGroup.updateTipGroupEmloyee, body);
  },
  deleteGroupTipEmloyee: (id: number) => {
    return apiDelete(`${urlsApi.tipGroup.deleteTipGroupEmloyee}?id=${id}`);
  },
};
