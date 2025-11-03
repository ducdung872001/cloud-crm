import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  ITipGroupFilterRequest,
  ITipGroupRequest,
  ITipGroupToTipGroupEmployeeFilterRequest,
  ITipGroupToTipGroupEmployeeRequest,
} from "model/tipGroup/TipGroupRequestModel";

export default {
  list: (params: ITipGroupFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tipGroup.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITipGroupRequest) => {
    return fetch(urlsApi.tipGroup.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.tipGroup.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  listGroupTipEmloyee: (params?: ITipGroupToTipGroupEmployeeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.tipGroup.listTipGroupEmloyee}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateGroupTipEmloyee: (body: ITipGroupToTipGroupEmployeeRequest) => {
    return fetch(urlsApi.tipGroup.updateTipGroupEmloyee, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteGroupTipEmloyee: (id: number) => {
    return fetch(`${urlsApi.tipGroup.deleteTipGroupEmloyee}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
