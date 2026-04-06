import { apiDelete, apiGet, apiPost, apiPut } from "services/apiHelper";
import { urlsApi } from "configs/urls";

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
    return apiGet(urlsApi.workOrder.list, params, signal);
  },
  listV2: (params: IWorkOrderFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.workOrder.listV2, params, signal);
  },
  groups: (params: IGroupsFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.workOrder.groups, params, signal);
  },
  groupsV2: (params: IGroupsFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.workOrder.groupsV2, params, signal);
  },
  listBpmWorkOrder: (body: IWorkOrderRequestModel) => {
    return apiPost(urlsApi.workOrder.listBpmWorkOrder, body);
  },
  // list: (body: any) => {
  //   return fetch(urlsApi.workOrder.list, {
  //     method: "POST",
  //     body: JSON.stringify(body),
  //   }).then((res) => res.json());
  // },

  update: (body: IWorkOrderRequestModel) => {
    return apiPost(urlsApi.workOrder.update, body);
  },
  updateAndInit: (body: IWorkOrderRequestModel) => {
    return apiPost(urlsApi.workOrder.updateAndInit, body);
  },
  updateInitProcess: (body: IWorkOrderRequestModel) => {
    return apiPost(urlsApi.workOrder.updateInitProcess, body);
  },

  updateEmployee: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.workOrder.updateEmployee, body);
  },

  ///Tạm dừng xử lý công việc
  updatePause: (body: IWorkOrderRequestModel) => {
    return apiPost(urlsApi.workOrder.updatePause, body);
  },
  listPause: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.workOrder.listPause, params, signal);
  },
  //

  //Từ chối xử lý công việc
  updateReject: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.workOrder.updateReject, body);
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.workOrder.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.workOrder.delete}?id=${id}`);
  },
  // lấy thông tin người liên quan
  relatedPeople: (id: number) => {
    return fetch(`${urlsApi.workOrder.relatedPeople}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật thêm mới người liên quan
  updateParticipant: (body: IUpdateParticipantRequestModel) => {
    return apiPost(urlsApi.workOrder.updateParticipant, body);
  },
  // Cập nhật thêm mới khách hàng liên quan
  updateRelatedCustomer: (body: IUpdateRelatedCustomerRequestModel) => {
    return apiPost(urlsApi.workOrder.updateCustomer, body);
  },
  // Cập nhật thông tin công việc liên quan
  updateOtherWorkOrder: (body: IUpdateRelatedWorkRequestModel) => {
    return apiPost(urlsApi.workOrder.updateOtherWorkOrder, body);
  },
  // Lấy danh sách công việc liên quan
  getOtherWorkOrder: (id: number) => {
    return fetch(`${urlsApi.workOrder.getOtherWorkOrder}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật tiến độ công việc
  updateWorkInprogress: (body: IUpdateWorkInprogressModel) => {
    return apiPost(urlsApi.workOrder.updateWorkInprogress, body);
  },
  // lấy chi tiết tiến độ công việc
  getWorkInprogress: (id: number) => {
    return fetch(`${urlsApi.workOrder.getWorkInprogress}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Lấy danh sách cập nhật tiến độ công việc
  getWorkInprogressList: (params: IWorkInprogressFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.workOrder.getWorkInprogressList, params, signal);
  },
  // Cập nhật trạng thái công việc
  updateStatus: (body: IUpdateStatusRequest) => {
    return apiPost(urlsApi.workOrder.updateStatus, body);
  },
  // Lấy danh sách người giao việc
  employeeManagers: () => {
    return apiGet(urlsApi.workOrder.employeeManagers);
  },
  // lấy danh sách người nhận việc
  employeeAssignees: () => {
    return apiGet(urlsApi.workOrder.employeeAssignees);
  },
  // lấy danh sách người nhận việc trong dự án
  projectEmployeeAssignees: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.workOrder.projectEmployeeAssignees, params);
  },
  // danh sách trao đổi trong công việc
  workExchange: (params: IWorkExchangeFilterRequest) => {
    return apiGet(urlsApi.workOrder.workExchange, params);
  },
  // xóa đi 1 trao đổi công việc
  deleteWorkExchange: (id: number) => {
    return apiDelete(`${urlsApi.workOrder.deleteWorkExchange}?id=${id}`);
  },
  // thêm mới trao đổi công việc
  addWorkExchange: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.workOrder.addWorkExchange, body);
  },
  // cập nhật lại trao đổi công việc
  updateWorkExchange: (id: number) => {
    return fetch(`${urlsApi.workOrder.updateWorkExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // cập nhật đánh giá chất lượng công việc
  updateRating: (body: IUpdateRatingRequestModal) => {
    return apiPost(urlsApi.workOrder.updateRating, body);
  },
  // cập nhật mức độ ưu tiên công việc
  updateLevelStatus: (body: IUpdatePriorityLevelRequestModal) => {
    return apiPost(urlsApi.workOrder.updatePriorityLevel, body);
  },

  //export OLA
  exportOLA: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.workOrder.exportOLA, params);
  },

  //export SLA
  exportSLA: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.workOrder.exportSLA, params);
  },

  // Giao công việc đàm phán, thương thảo hợp đồng mẫu
  assignNegotiationWork: (body: IAssignNegotiationWorkRequestModal) => {
    return apiPost(urlsApi.workOrder.assignNegotiationWork, body);
  },

  // Lấy thông tin chi tiết công việc đàm phán, thương thảo hợp đồng mẫu
  getNegotiationWork: (id: number) => {
    return fetch(`${urlsApi.workOrder.getNegotiationWork}?workId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // Giao công việc đàm phán, thương thảo hợp đồng mẫu
  saveNegotiationWork: (body: Record<string, unknown>) => {
    return apiPut(urlsApi.workOrder.saveNegotiationWork, body);
  },

  // hoàn thành công việc đàm phán, thương thảo hợp đồng mẫu
  completeNegotiationWork: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.workOrder.completeNegotiationWork, body);
  },
};
