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
  IAssignNegotiationWorkRequestModal,
  IGroupsFilterRequest,
} from "model/workOrder/WorkOrderRequestModel";

export default {
  list: (params: IWorkOrderFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.workOrder.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  groups: (params: IGroupsFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.workOrder.groups}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listBpmWorkOrder: (body: IWorkOrderRequestModel) => {
    return fetch(urlsApi.workOrder.listBpmWorkOrder, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // list: (body: any) => {
  //   return fetch(urlsApi.workOrder.list, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  update: (body: IWorkOrderRequestModel) => {
    return fetch(urlsApi.workOrder.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateEmployee: (body: any) => {
    return fetch(urlsApi.workOrder.updateEmployee, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  ///Tạm dừng xử lý công việc
  updatePause: (body: IWorkOrderRequestModel) => {
    return fetch(urlsApi.workOrder.updatePause, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  listPause: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.workOrder.listPause}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //

  //Từ chối xử lý công việc
  updateReject: (body: any) => {
    return fetch(urlsApi.workOrder.updateReject, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.workOrder.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.workOrder.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // lấy thông tin người liên quan
  relatedPeople: (id: number) => {
    return fetch(`${urlsApi.workOrder.relatedPeople}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật thêm mới người liên quan
  updateParticipant: (body: IUpdateParticipantRequestModel) => {
    return fetch(urlsApi.workOrder.updateParticipant, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Cập nhật thêm mới khách hàng liên quan
  updateRelatedCustomer: (body: IUpdateRelatedCustomerRequestModel) => {
    return fetch(urlsApi.workOrder.updateCustomer, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Cập nhật thông tin công việc liên quan
  updateOtherWorkOrder: (body: IUpdateRelatedWorkRequestModel) => {
    return fetch(urlsApi.workOrder.updateOtherWorkOrder, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Lấy danh sách công việc liên quan
  getOtherWorkOrder: (id: number) => {
    return fetch(`${urlsApi.workOrder.getOtherWorkOrder}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật tiến độ công việc
  updateWorkInprogress: (body: IUpdateWorkInprogressModel) => {
    return fetch(urlsApi.workOrder.updateWorkInprogress, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // lấy chi tiết tiến độ công việc
  getWorkInprogress: (id: number) => {
    return fetch(`${urlsApi.workOrder.getWorkInprogress}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Lấy danh sách cập nhật tiến độ công việc
  getWorkInprogressList: (params: IWorkInprogressFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.workOrder.getWorkInprogressList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật trạng thái công việc
  updateStatus: (body: IUpdateStatusRequest) => {
    return fetch(urlsApi.workOrder.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // Lấy danh sách người giao việc
  employeeManagers: () => {
    return fetch(urlsApi.workOrder.employeeManagers, {
      method: "GET",
    }).then((res) => res.json());
  },
  // lấy danh sách người nhận việc
  employeeAssignees: () => {
    return fetch(urlsApi.workOrder.employeeAssignees, {
      method: "GET",
    }).then((res) => res.json());
  },
  // danh sách trao đổi trong công việc
  workExchange: (params: IWorkExchangeFilterRequest) => {
    return fetch(`${urlsApi.workOrder.workExchange}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 trao đổi công việc
  deleteWorkExchange: (id: number) => {
    return fetch(`${urlsApi.workOrder.deleteWorkExchange}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // thêm mới trao đổi công việc
  addWorkExchange: (body) => {
    return fetch(urlsApi.workOrder.addWorkExchange, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // cập nhật lại trao đổi công việc
  updateWorkExchange: (id: number) => {
    return fetch(`${urlsApi.workOrder.updateWorkExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // cập nhật đánh giá chất lượng công việc
  updateRating: (body: IUpdateRatingRequestModal) => {
    return fetch(urlsApi.workOrder.updateRating, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // cập nhật mức độ ưu tiên công việc
  updateLevelStatus: (body: IUpdatePriorityLevelRequestModal) => {
    return fetch(urlsApi.workOrder.updatePriorityLevel, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //export OLA
  exportOLA: (params: any) => {
    return fetch(`${urlsApi.workOrder.exportOLA}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //export SLA
  exportSLA: (params: any) => {
    return fetch(`${urlsApi.workOrder.exportSLA}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // Giao công việc đàm phán, thương thảo hợp đồng mẫu
  assignNegotiationWork: (body: IAssignNegotiationWorkRequestModal) => {
    return fetch(urlsApi.workOrder.assignNegotiationWork, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Lấy thông tin chi tiết công việc đàm phán, thương thảo hợp đồng mẫu
  getNegotiationWork: (id: number) => {
    return fetch(`${urlsApi.workOrder.getNegotiationWork}?workId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // Giao công việc đàm phán, thương thảo hợp đồng mẫu
  saveNegotiationWork: (body: any) => {
    return fetch(urlsApi.workOrder.saveNegotiationWork, {
      method: "PUT",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // hoàn thành công việc đàm phán, thương thảo hợp đồng mẫu
  completeNegotiationWork: (body: any) => {
    return fetch(urlsApi.workOrder.completeNegotiationWork, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
