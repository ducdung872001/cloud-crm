import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IWorkOrderFilterRequest,
  IWorkOrderRequestModel,
  IUpdateRelatedWorkRequestModel,
  IUpdateParticipantRequestModel,
  IUpdateRelatedCustomerRequestModel,
  IUpdateWorkInprogressModel,
  IWorkInprogressFilterRequest,
  IUpdateStatusRequest,
  IWorkExchangeFilterRequest,
  IUpdateRatingRequestModal,
  IUpdatePriorityLevelRequestModal,
} from "model/workOrder/WorkOrderRequestModel";

export default {
  // list: (params: IWorkOrderFilterRequest, signal?: AbortSignal) => {
  //   return fetch(`${urlsApi.userTask.list}${convertParamsToString(params)}`, {
  //     signal,
  //     method: "GET",
  //   }).then((res) => res.json());
  // },
  list: (body: any) => {
    return fetch(urlsApi.userTask.list, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  update: (body: IWorkOrderRequestModel) => {
    return fetch(urlsApi.userTask.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.userTask.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.userTask.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // lấy thông tin người liên quan
  relatedPeople: (id: number) => {
    return fetch(`${urlsApi.userTask.relatedPeople}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật thêm mới người liên quan
  updateParticipant: (body: IUpdateParticipantRequestModel) => {
    return fetch(urlsApi.userTask.updateParticipant, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Cập nhật thêm mới khách hàng liên quan
  updateRelatedCustomer: (body: IUpdateRelatedCustomerRequestModel) => {
    return fetch(urlsApi.userTask.updateCustomer, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Cập nhật thông tin công việc liên quan
  updateOtherWorkOrder: (body: IUpdateRelatedWorkRequestModel) => {
    return fetch(urlsApi.userTask.updateOtherWorkOrder, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Lấy danh sách công việc liên quan
  getOtherWorkOrder: (id: number) => {
    return fetch(`${urlsApi.userTask.getOtherWorkOrder}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật tiến độ công việc
  updateWorkInprogress: (body: IUpdateWorkInprogressModel) => {
    return fetch(urlsApi.userTask.updateWorkInprogress, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // lấy chi tiết tiến độ công việc
  getWorkInprogress: (id: number) => {
    return fetch(`${urlsApi.userTask.getWorkInprogress}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Lấy danh sách cập nhật tiến độ công việc
  getWorkInprogressList: (params: IWorkInprogressFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.userTask.getWorkInprogressList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật trạng thái công việc
  updateStatus: (body: IUpdateStatusRequest) => {
    return fetch(urlsApi.userTask.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Lấy danh sách người giao việc
  employeeManagers: () => {
    return fetch(urlsApi.userTask.employeeManagers, {
      method: "GET",
    }).then((res) => res.json());
  },
  // lấy danh sách người nhận việc
  employeeAssignees: () => {
    return fetch(urlsApi.userTask.employeeAssignees, {
      method: "GET",
    }).then((res) => res.json());
  },
  // danh sách trao đổi trong công việc
  workExchange: (params: IWorkExchangeFilterRequest) => {
    return fetch(`${urlsApi.userTask.workExchange}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 trao đổi công việc
  deleteWorkExchange: (id: number) => {
    return fetch(`${urlsApi.userTask.deleteWorkExchange}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // thêm mới trao đổi công việc
  addWorkExchange: (body) => {
    return fetch(urlsApi.userTask.addWorkExchange, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // cập nhật lại trao đổi công việc
  updateWorkExchange: (id: number) => {
    return fetch(`${urlsApi.userTask.updateWorkExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // cập nhật đánh giá chất lượng công việc
  updateRating: (body: IUpdateRatingRequestModal) => {
    return fetch(urlsApi.userTask.updateRating, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // cập nhật mức độ ưu tiên công việc
  updateLevelStatus: (body: IUpdatePriorityLevelRequestModal) => {
    return fetch(urlsApi.userTask.updatePriorityLevel, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Báo cáo công việc
  workReport: (params: any) => {
    return fetch(`${urlsApi.userTask.workReport}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  ///Tạm dừng xử lý công việc
  updatePause: (body: IWorkOrderRequestModel) => {
    return fetch(urlsApi.userTask.updatePause, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  listPause: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.userTask.listPause}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //

  //export OLA
  exportOLA: (params: any) => {
    return fetch(`${urlsApi.userTask.exportOLA}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //export SLA
  exportSLA: (params: any) => {
    return fetch(`${urlsApi.userTask.exportSLA}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
