import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  ISubsystemAdministrationFilterRequest,
  IAddModuleResourceRequest,
  ISubsystemAdministrationRequest,
} from "model/subsystemAdministration/SubsystemAdministrationRequest";

export default {
  list: (params?: ISubsystemAdministrationFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.subsystemAdministration.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ISubsystemAdministrationRequest) => {
    return fetch(urlsApi.subsystemAdministration.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.subsystemAdministration.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.subsystemAdministration.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // thêm mới một tài nguyên vào phân hệ
  addModuleResource: (body: IAddModuleResourceRequest) => {
    return fetch(urlsApi.subsystemAdministration.addModuleResource, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // xóa một tài nguyên hỏi phân hệ
  removeModuleResource: (moduleId: number, resourceId: number) => {
    return fetch(`${urlsApi.subsystemAdministration.removeModuleResource}?moduleId=${moduleId}&resourceId=${resourceId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
