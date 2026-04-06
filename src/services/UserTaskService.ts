import { apiDelete, apiGet, apiPost } from "services/apiHelper";
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
  list: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.userTask.list, body);
  },
  update: (body: IWorkOrderRequestModel) => {
    return apiPost(urlsApi.userTask.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.userTask.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.userTask.delete}?id=${id}`);
  },
  // lấy thông tin người liên quan
  relatedPeople: (id: number) => {
    return fetch(`${urlsApi.userTask.relatedPeople}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật thêm mới người liên quan
  updateParticipant: (body: IUpdateParticipantRequestModel) => {
    return apiPost(urlsApi.userTask.updateParticipant, body);
  },
  // Cập nhật thêm mới khách hàng liên quan
  updateRelatedCustomer: (body: IUpdateRelatedCustomerRequestModel) => {
    return apiPost(urlsApi.userTask.updateCustomer, body);
  },
  // Cập nhật thông tin công việc liên quan
  updateOtherWorkOrder: (body: IUpdateRelatedWorkRequestModel) => {
    return apiPost(urlsApi.userTask.updateOtherWorkOrder, body);
  },
  // Lấy danh sách công việc liên quan
  getOtherWorkOrder: (id: number) => {
    return fetch(`${urlsApi.userTask.getOtherWorkOrder}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Cập nhật tiến độ công việc
  updateWorkInprogress: (body: IUpdateWorkInprogressModel) => {
    return apiPost(urlsApi.userTask.updateWorkInprogress, body);
  },
  // lấy chi tiết tiến độ công việc
  getWorkInprogress: (id: number) => {
    return fetch(`${urlsApi.userTask.getWorkInprogress}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Lấy danh sách cập nhật tiến độ công việc
  getWorkInprogressList: (params: IWorkInprogressFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.userTask.getWorkInprogressList, params, signal);
  },
  // Cập nhật trạng thái công việc
  updateStatus: (body: IUpdateStatusRequest) => {
    return apiPost(urlsApi.userTask.updateStatus, body);
  },
  // Lấy danh sách người giao việc
  employeeManagers: () => {
    return apiGet(urlsApi.userTask.employeeManagers);
  },
  // lấy danh sách người nhận việc
  employeeAssignees: () => {
    return apiGet(urlsApi.userTask.employeeAssignees);
  },
  // danh sách trao đổi trong công việc
  workExchange: (params: IWorkExchangeFilterRequest) => {
    return apiGet(urlsApi.userTask.workExchange, params);
  },
  // xóa đi 1 trao đổi công việc
  deleteWorkExchange: (id: number) => {
    return apiDelete(`${urlsApi.userTask.deleteWorkExchange}?id=${id}`);
  },
  // thêm mới trao đổi công việc
  addWorkExchange: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.userTask.addWorkExchange, body);
  },
  // cập nhật lại trao đổi công việc
  updateWorkExchange: (id: number) => {
    return fetch(`${urlsApi.userTask.updateWorkExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // cập nhật đánh giá chất lượng công việc
  updateRating: (body: IUpdateRatingRequestModal) => {
    return apiPost(urlsApi.userTask.updateRating, body);
  },
  // cập nhật mức độ ưu tiên công việc
  updateLevelStatus: (body: IUpdatePriorityLevelRequestModal) => {
    return apiPost(urlsApi.userTask.updatePriorityLevel, body);
  },
  // Báo cáo công việc
  workReport: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.userTask.workReport, params);
  },

  ///Tạm dừng xử lý công việc
  updatePause: (body: IWorkOrderRequestModel) => {
    return apiPost(urlsApi.userTask.updatePause, body);
  },
  listPause: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.userTask.listPause, params, signal);
  },
  //

  //export OLA
  exportOLA: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.userTask.exportOLA, params);
  },

  //export SLA
  exportSLA: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.userTask.exportSLA, params);
  },
};
