import { urlsApi } from "configs/urls";
import {
  ICustomerFilterRequest,
  IListByIdFilterRequest,
  ICustomerRequest,
  IUpdateCustomerGroupRequest,
  IUpdateCustomeRelationshipRequest,
  IUpdateCustomerEmployeeRequest,
  IUpdateCustomerSourceRequest,
  ICustomerSchedulerFilterRequest,
  ICustomerSchedulerRequest,
  IUpdateOneRelationshipRequest,
  ICustomerExchangeFilterRequest,
  ICustomerExchangeUpdateRequestModel,
  ICustomerSendSMSRequestModel,
  ICustomerSendEmailRequestModel,
  IAddCustomerViewerRequestModel,
  IAutoProcessModalProps,
  ICustomerReportProps,
  IDetailCustomerReportProps,
  ILstAttachmentsFilterRequest,
  IDescCustomerReportFilterRequest,
  ICustomerSendZaloRequestModel,
  IFieldCustomerFilterRequest,
} from "model/customer/CustomerRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  //? thêm mới, cập nhập, xem, xem chi tiết khách hàng
  filter: (params?: ICustomerFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customer.filter}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  ///list khách hàng của đối tác
  listshared: (params?: ICustomerFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customer.listshared}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.customer.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICustomerRequest) => {
    return fetch(urlsApi.customer.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  telesaleCallList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customer.telesaleCallList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  telesaleCallUpdate: (body: any) => {
    return fetch(urlsApi.customer.telesaleCallUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateByField: (body: any) => {
    return fetch(urlsApi.customer.updateByField, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.customer.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  deleteAll: (body) => {
    return fetch(`${urlsApi.customer.delete}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  checkInProcess: (body) => {
    return fetch(`${urlsApi.customer.checkInProcess}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  addOther: (body) => {
    return fetch(urlsApi.customer.addOther, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //* Lấy ra danh sách khách hàng dự vào lstId
  listById: (params?: IListByIdFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customer.listById}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  //? cập nhật hàng loạt
  updateCustomerGroup: (body: IUpdateCustomerGroupRequest) => {
    return fetch(urlsApi.customer.updateCustomerGroup, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateOneRelationship: (body: IUpdateOneRelationshipRequest) => {
    return fetch(urlsApi.customer.updateOneRelationship, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateCustomeRelationship: (body: IUpdateCustomeRelationshipRequest) => {
    return fetch(urlsApi.customer.updateCustomeRelationship, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateCustomerSource: (body: IUpdateCustomerSourceRequest) => {
    return fetch(urlsApi.customer.updateCustomerSource, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateCustomerEmployee: (body: IUpdateCustomerEmployeeRequest) => {
    return fetch(urlsApi.customer.updateCustomerEmployee, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //? thêm mới, cập nhật, xem, xem chi tiết lịch điều trị
  linkUser: (id: number, userId: number) => {
    return fetch(urlsApi.customer.link, {
      method: "POST",
      body: JSON.stringify({ id, userId }),
    }).then((res) => res.json());
  },
  filterScheduler: (params: ICustomerSchedulerFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customer.filterScheduler}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateScheduler: (body: ICustomerSchedulerRequest) => {
    return fetch(urlsApi.customer.updateScheduler, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  cancelScheduler: (id: number) => {
    return fetch(`${urlsApi.customer.cancelScheduler}?id=${id}`, {
      method: "POST",
    }).then((res) => res.json());
  },
  detailScheduler: (id: number) => {
    return fetch(`${urlsApi.customer.detailScheduler}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //* Thêm mới, cập nhật xóa một trao đổi
  customerExchangeList: (params: ICustomerExchangeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customer.customerExchangeList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  customerExchangeUpdate: (body: ICustomerExchangeUpdateRequestModel) => {
    return fetch(urlsApi.customer.customerExchangeUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  customerExchangeDelete: (id: number) => {
    return fetch(`${urlsApi.customer.customerExchangeDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //* Gửi sms, gửi email
  // customerSendSMS: (body: ICustomerSendSMSRequestModel) => {
  //   return fetch(`${urlsApi.customer.customerSendSMS}?templateId=${body.templateId}&customerId=${body.customerId}`, {
  //     method: "GET",
  //   }).then((res) => res.json());
  // },
  customerSendSMS: (body: ICustomerSendSMSRequestModel) => {
    return fetch(urlsApi.customer.customerSendSMS, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  customerSendEmail: (body: ICustomerSendEmailRequestModel) => {
    return fetch(urlsApi.customer.customerSendEmail, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  customerSendZalo: (body: ICustomerSendZaloRequestModel) => {
    return fetch(urlsApi.customer.customerSendZalo, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //? Lấy số điện thoại, email bị che
  viewPhone: (id: number) => {
    return fetch(`${urlsApi.customer.viewPhone}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  viewFullPhone: (params: any) => {
    return fetch(`${urlsApi.customer.viewFullPhone}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  viewEmail: (id: number) => {
    return fetch(`${urlsApi.customer.viewEmail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  parserSms: (templateId: number) => {
    return fetch(`${urlsApi.customer.parserSms}?templateId=${templateId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  parserEmail: (templateId: number) => {
    return fetch(`${urlsApi.customer.parserEmail}?templateId=${templateId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  parserZalo: (templateId: number) => {
    return fetch(`${urlsApi.customer.parserZalo}?templateId=${templateId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // thêm mới nhiều người xem cho 1 khách hàng
  addCustomerViewer: (body: IAddCustomerViewerRequestModel) => {
    return fetch(urlsApi.customer.addCustomerViewer, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // lấy về danh sách người xem
  lstCustomerViewer: (id: number) => {
    return fetch(`${urlsApi.customer.lstCustomerViewer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 người xem
  deleteCustomerViewer: (id: number) => {
    return fetch(`${urlsApi.customer.deleteCustomerViewer}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // thêm khách hàng vào chương trình MA
  addCustomerMA: (body: any) => {
    return fetch(urlsApi.customer.addCustomerMA, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Danh sách tỉnh/thành phố
  areaList: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customer.area}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // import khách hàng b2
  autoProcess: (body: IAutoProcessModalProps) => {
    return fetch(urlsApi.customer.autoProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.customer.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },
  // tương tác khách hàng
  customerReport: (params: ICustomerReportProps) => {
    return fetch(`${urlsApi.customer.customerReport}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  detailCustomerReport: (params: IDetailCustomerReportProps) => {
    return fetch(`${urlsApi.customer.detailCustomerReport}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // danh sách các file đã tải
  lstAttachments: (params: ILstAttachmentsFilterRequest) => {
    return fetch(`${urlsApi.customer.lstAttachments}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // chi tiết tương tác từng khách hàng trong mục chi tiết khách hàng
  descCustomerReport: (params: IDescCustomerReportFilterRequest) => {
    return fetch(`${urlsApi.customer.descCustomerReport}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //khách hàng theo doi tk Zalo nào
  customerZaloOA: (params: any) => {
    return fetch(`${urlsApi.customer.customerZaloOA}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // đoạn này là api bộ lọc nâng cao
  filterAdvanced: (params) => {
    return fetch(`${urlsApi.customer.filterAdvanced}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  createFilterAdvanced: (body) => {
    return fetch(urlsApi.customer.createFilterAdvanced, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  deleteFilterAdvanced: (id: number) => {
    return fetch(`${urlsApi.customer.deleteFilterAdvanced}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  customerAttributes: () => {
    return fetch(`${urlsApi.customer.customerAttributes}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  filterLstCustomer: (id: number, params: any) => {
    return fetch(`${urlsApi.customer.filterLstCustomer}/${id}/customers${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // lấy ra các trường trong table
  filterTable: (params?: IFieldCustomerFilterRequest) => {
    return fetch(`${urlsApi.customer.filterTable}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  numberFieldCustomer: (body, params) => {
    return fetch(`${urlsApi.customer.numberFieldCustomer}${convertParamsToString(params)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => {
      if (res.ok) {
        return res.arrayBuffer();
      } else {
        return res.json().then((error) => Promise.reject(error));
      }
    });
  },

  exAttributes: (params) => {
    return fetch(`${urlsApi.customer.exAttributes}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  createOpportunity: (body) => {
    return fetch(urlsApi.customer.createOpportunity, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  lstOpportunity: (params) => {
    return fetch(`${urlsApi.customer.lstOpportunity}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  deleteOpportunity: (id) => {
    return fetch(`${urlsApi.customer.deleteOpportunity}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  detailOpportunity: (id) => {
    return fetch(`${urlsApi.customer.detailOpportunity}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  lstUpload: (params) => {
    return fetch(`${urlsApi.customer.lstUpload}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // api phân tích chân dung khách hàng
  classifyAge: (params) => {
    return fetch(`${urlsApi.customer.classifyAge}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyGender: (params) => {
    return fetch(`${urlsApi.customer.classifyGender}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyIdentify: (params) => {
    return fetch(`${urlsApi.customer.classifyIdentify}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyTopRevenue: (params) => {
    return fetch(`${urlsApi.customer.classifyTopRevenue}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyTopBought: (params) => {
    return fetch(`${urlsApi.customer.classifyTopBought}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyTopValueInvoice: (params) => {
    return fetch(`${urlsApi.customer.classifyTopValueInvoice}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyNotInteractDay: (params) => {
    return fetch(`${urlsApi.customer.classifyNotInteractDay}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyTopInteract: (params) => {
    return fetch(`${urlsApi.customer.classifyTopInteract}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyCampaignJoined: (params) => {
    return fetch(`${urlsApi.customer.classifyCampaignJoined}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyCustType: (params) => {
    return fetch(`${urlsApi.customer.classifyCustType}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyCustGroup: (params) => {
    return fetch(`${urlsApi.customer.classifyCustGroup}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyCustSource: (params) => {
    return fetch(`${urlsApi.customer.classifyCustSource}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyCustCareer: (params) => {
    return fetch(`${urlsApi.customer.classifyCustCareer}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyCustArea: (params) => {
    return fetch(`${urlsApi.customer.classifyCustArea}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyCustomerCard: (params) => {
    return fetch(`${urlsApi.customer.classifyCustomerCard}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  classifyInteractTimes: (params) => {
    return fetch(`${urlsApi.customer.classifyInteractTimes}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // gợi ý các sản phẩm/dịch vụ cho khách hàng
  serviceSuggestions: (params) => {
    return fetch(`${urlsApi.customer.serviceSuggestions}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // phiên bản v2
  serviceSuggestionsv2: (params) => {
    return fetch(`${urlsApi.customer.serviceSuggestionsv2}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // lấy ra các field động view nên chart
  fieldChart: () => {
    return fetch(`${urlsApi.customer.fieldChart}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  lstChartDynamicChart: () => {
    return fetch(`${urlsApi.customer.lstChartDynamicChart}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  updateChartDynamicChart: (body) => {
    return fetch(urlsApi.customer.updateChartDynamicChart, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteChartDynamicChart: (id: number) => {
    return fetch(`${urlsApi.customer.deleteChartDynamicChart}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  detailChartDynamicChart: (id: number) => {
    return fetch(`${urlsApi.customer.detailChartDynamicChart}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  viewChartDynamicChart: (id: number) => {
    return fetch(`${urlsApi.customer.viewChartDynamicChart}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  exportMulti: (body) => {
    return fetch(urlsApi.customer.exportMulti, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res);
  },

  //create call TNEX-Athena
  loginAccountAthena: (body: any) => {
    return fetch(urlsApi.customer.loginAccountAthena, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  createCall: (body: any) => {
    return fetch(urlsApi.customer.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  getAccountCall: () => {
    return fetch(`${urlsApi.customer.getAccountCall}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
