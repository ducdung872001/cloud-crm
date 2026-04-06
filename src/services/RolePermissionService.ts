import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { IPermissionDepartmentAddRequest, IPermissionCloneRequest } from "model/permission/PermissionRequestModel";


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
  packagePermissionAdd: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.rolePermission.packagePermissionAdd, body);
  },
  //API thêm quyền cho nhóm quyền
  permissionRoleAdd: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.rolePermission.permissionRoleAdd, body);
  },
  //API xóa quyền cho nhóm quyền
  permissionRoleDelete: (body: Record<string, unknown>) => {
    return fetch(urlsApi.rolePermission.permissionRoleDelete, {
      method: "DELETE",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //Sao quyền đã có cho một đối tượng muốn sao chép
  permissionClone: (body: IPermissionCloneRequest) => {
    return apiPost(urlsApi.rolePermission.permissionClone, body);
  },

  //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
  requestPermissionSource: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.rolePermission.requestPermissionSource, params, signal);
  },

  //gửi yêu cầu xin phê duyệt
  updateRequestPermission: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.rolePermission.updateRequestPermission, body);
  },

  //API xóa qyêu cầu xin phê duyệt
  deleteRequestPermission: (id: number) => {
    return apiDelete(`${urlsApi.rolePermission.deleteRequestPermission}?id=${id}`);
  },

  //danh sách cấp quyền truy cập (đối tác xin quyền)
  requestPermissionTarget: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.rolePermission.requestPermissionTarget, params, signal);
  },

  //phê duyệt yêu cầu truy cập
  updateApprovePermission: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.rolePermission.updateApprovePermission, body);
  },

  //từ chối yêu cầu truy cập
  updateRejectPermission: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.rolePermission.updateRejectPermission, body);
  },
};
