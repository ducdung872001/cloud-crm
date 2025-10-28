import { urlsApi } from "configs/urls";
import { IPermissionDepartmentAddRequest, IPermissionCloneRequest } from "model/permission/PermissionRequestModel";
import { convertParamsToString } from "reborn-util";

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
    return fetch(urlsApi.permission.permissionDepartmentAdd, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
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
    return fetch(urlsApi.permission.permissionClone, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
  requestPermissionSource: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.permission.requestPermissionSource}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //gửi yêu cầu xin phê duyệt
  updateRequestPermission: (body: any) => {
    return fetch(urlsApi.permission.updateRequestPermission, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //API xóa qyêu cầu xin phê duyệt
  deleteRequestPermission: (id: number) => {
    return fetch(`${urlsApi.permission.deleteRequestPermission}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //danh sách cấp quyền truy cập (đối tác xin quyền)
  requestPermissionTarget: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.permission.requestPermissionTarget}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //phê duyệt yêu cầu truy cập
  updateApprovePermission: (body: any) => {
    return fetch(urlsApi.permission.updateApprovePermission, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //từ chối yêu cầu truy cập
  updateRejectPermission: (body: any) => {
    return fetch(urlsApi.permission.updateRejectPermission, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
