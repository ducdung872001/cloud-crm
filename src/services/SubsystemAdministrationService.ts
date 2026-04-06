import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  ISubsystemAdministrationFilterRequest,
  IAddModuleResourceRequest,
  ISubsystemAdministrationRequest,
} from "model/subsystemAdministration/SubsystemAdministrationRequest";

export default {
  list: (params?: ISubsystemAdministrationFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.subsystemAdministration.list, params, signal);
  },
  update: (body: ISubsystemAdministrationRequest) => {
    return apiPost(urlsApi.subsystemAdministration.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.subsystemAdministration.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.subsystemAdministration.delete}?id=${id}`);
  },
  // thêm mới một tài nguyên vào phân hệ
  addModuleResource: (body: IAddModuleResourceRequest) => {
    return apiPost(urlsApi.subsystemAdministration.addModuleResource, body);
  },
  // xóa một tài nguyên hỏi phân hệ
  removeModuleResource: (moduleId: number, resourceId: number) => {
    return apiDelete(`${urlsApi.subsystemAdministration.removeModuleResource}?moduleId=${moduleId}&resourceId=${resourceId}`);
  },
};
