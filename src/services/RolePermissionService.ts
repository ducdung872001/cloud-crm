import { urlsApi } from "configs/urls";
import { IPermissionDepartmentAddRequest, IPermissionCloneRequest } from "model/permission/PermissionRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  getPermissionResources: () => {
    return fetch(`${urlsApi.rolePermission.getPermissionResources}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //API phân quyền theo nhóm quyền
  rolePermission: (id: number, name: string) => {
    return fetch(`${urlsApi.rolePermission.rolePermission}?roleId=${id}&name=${name}&app=crm`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //API phân quyền theo gói
  packagePermission: (id: number, name: string) => {
    return fetch(`${urlsApi.rolePermission.packagePermission}?packageId=${id}&name=${name}&app=crm`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //API thêm quyền cho gói
  packagePermissionAdd: (body: any) => {
    return fetch(urlsApi.rolePermission.packagePermissionAdd, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //API thêm quyền cho nhóm quyền
  permissionRoleAdd: (body: any) => {
    return fetch(urlsApi.rolePermission.permissionRoleAdd, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //API xóa quyền cho nhóm quyền
  permissionRoleDelete: (body: any) => {
    return fetch(urlsApi.rolePermission.permissionRoleDelete, {
      method: "DELETE",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //Sao quyền đã có cho một đối tượng muốn sao chép
  permissionClone: (body: IPermissionCloneRequest) => {
    return fetch(urlsApi.rolePermission.permissionClone, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
  requestPermissionSource: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.rolePermission.requestPermissionSource}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //gửi yêu cầu xin phê duyệt
  updateRequestPermission: (body: any) => {
    return fetch(urlsApi.rolePermission.updateRequestPermission, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //API xóa qyêu cầu xin phê duyệt
  deleteRequestPermission: (id: number) => {
    return fetch(`${urlsApi.rolePermission.deleteRequestPermission}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  //danh sách cấp quyền truy cập (đối tác xin quyền)
  requestPermissionTarget: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.rolePermission.requestPermissionTarget}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //phê duyệt yêu cầu truy cập
  updateApprovePermission: (body: any) => {
    return fetch(urlsApi.rolePermission.updateApprovePermission, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //từ chối yêu cầu truy cập
  updateRejectPermission: (body: any) => {
    return fetch(urlsApi.rolePermission.updateRejectPermission, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
