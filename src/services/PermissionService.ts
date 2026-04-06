import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { IPermissionDepartmentAddRequest, IPermissionCloneRequest } from "model/permission/PermissionRequestModel";


export default {
  getPermissionResources: () => {
    return fetch(`${urlsApi.permission.getPermissionResources}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //API phân quyền theo phòng ban
  permissionDepartment: (id: number, name: string) => {
    return fetch(`${urlsApi.permission.permissionDepartment}?departmentId=${id}&name=${name}&app=crm`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //API thêm quyền cho phòng ban
  permissionDepartmentAdd: (body: IPermissionDepartmentAddRequest) => {
    return apiPost(urlsApi.permission.permissionDepartmentAdd, body);
  },
  //API xóa quyền cho phòng ban
  permissionDepartmentDelete: (body: IPermissionDepartmentAddRequest) => {
    return fetch(urlsApi.permission.permissionDepartmentDelete, {
      method: "DELETE",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //Sao quyền đã có cho một đối tượng muốn sao chép
  permissionClone: (body: IPermissionCloneRequest) => {
    return apiPost(urlsApi.permission.permissionClone, body);
  },

  //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
  requestPermissionSource: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.permission.requestPermissionSource, params, signal);
  },

  //gửi yêu cầu xin phê duyệt
  updateRequestPermission: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.permission.updateRequestPermission, body);
  },

  //API xóa qyêu cầu xin phê duyệt
  deleteRequestPermission: (id: number) => {
    return apiDelete(`${urlsApi.permission.deleteRequestPermission}?id=${id}`);
  },

  //danh sách cấp quyền truy cập (đối tác xin quyền)
  requestPermissionTarget: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.permission.requestPermissionTarget, params, signal);
  },

  //phê duyệt yêu cầu truy cập
  updateApprovePermission: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.permission.updateApprovePermission, body);
  },

  //từ chối yêu cầu truy cập
  updateRejectPermission: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.permission.updateRejectPermission, body);
  },
};
