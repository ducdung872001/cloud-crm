import { apiDelete, apiGet, apiPost } from "services/apiHelper";
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

// Bug E.1.1: BE filter chỉ lọc theo tên qua `keyword`, KHÔNG lọc SĐT/email.
// Workaround FE:
// - Keyword là email (chứa "@")  → fetch rộng rồi filter client-side theo email
// - Keyword là số điện thoại (toàn số, ≥6 ký tự) → gửi thêm field `phone` +
//   filter client-side khi BE trả về (phòng khi BE không đọc field `phone`)
// - Keyword thường (tên)         → pass-through qua BE
function isEmailLike(s: string) {
  return /@/.test(s);
}
function isPhoneLike(s: string) {
  return /^[0-9+][0-9\s.-]{5,}$/.test(s);
}

// Adapter: FE convention là page 1-based + `limit`; list_paid/basic của BE
// dùng page 0-based + `size` và yêu cầu cả 2 param (thiếu → 400). Chuyển đổi
// request/response để call site và consumer (useCustomerList, pagination
// component) không phải biết khác biệt này.
function toBePaging(params?: Record<string, unknown>) {
  const src = params ?? {};
  const { page, limit, ...rest } = src;
  const pageFE = page !== undefined && page !== null ? Number(page) : 1;
  const limitFE = limit !== undefined && limit !== null ? Number(limit) : 20;
  return {
    ...rest,
    page: Math.max(pageFE - 1, 0),
    size: limitFE,
  };
}

function fromBePaging(res: unknown) {
  if (!res || typeof res !== "object") return res;
  const r = res as Record<string, unknown>;
  const result = r.result as Record<string, unknown> | undefined;
  if (!result) return res;
  const normalized: Record<string, unknown> = { ...result };
  if (result.page !== undefined && result.page !== null) {
    normalized.page = Number(result.page) + 1;
  }
  if (result.size !== undefined && normalized.limit === undefined) {
    normalized.limit = result.size;
  }
  return { ...r, result: normalized };
}

async function filterCustomerSmart(
  endpoint: string,
  params?: ICustomerFilterRequest,
  signal?: AbortSignal
) {
  const kw = String(params?.keyword ?? "").trim();
  if (!kw) return fromBePaging(await apiGet(endpoint, toBePaging(params), signal));

  const email = isEmailLike(kw);
  const phone = !email && isPhoneLike(kw);
  if (!email && !phone) {
    // Tên bình thường — gửi thẳng
    return fromBePaging(await apiGet(endpoint, toBePaging(params), signal));
  }

  // Fetch rộng (bỏ keyword, nâng limit) rồi lọc client-side.
  const broadParams: Record<string, unknown> = {
    ...params,
    keyword: "",
    limit: Math.max(Number(params?.limit ?? 20), 200),
    page: 1,
  };
  if (phone) broadParams.phone = kw.replace(/[^0-9+]/g, ""); // BE nếu có support sẽ filter sẵn
  if (email) broadParams.email = kw;

  const res = fromBePaging(await apiGet(endpoint, toBePaging(broadParams), signal));
  if (res?.code !== 0 || !res?.result?.items) return res;

  const kwLower = kw.toLowerCase();
  const normalizedPhone = kw.replace(/[^0-9+]/g, "");
  const filtered = (res.result.items as Record<string, unknown>[]).filter((c) => {
    if (email) {
      const emails: string[] = [
        String(c.email ?? ""),
        String(c.customerEmail ?? ""),
        String(c.emailAddress ?? ""),
      ];
      return emails.some((e) => e.toLowerCase().includes(kwLower));
    }
    // phone
    const phones: string[] = [
      String(c.phone ?? ""),
      String(c.number_phone ?? ""),
      String(c.phoneNumber ?? ""),
      String(c.customerPhone ?? ""),
    ].map((p) => p.replace(/[^0-9+]/g, ""));
    return phones.some((p) => p && p.includes(normalizedPhone));
  });

  return {
    ...res,
    result: {
      ...res.result,
      items: filtered,
      total: filtered.length,
      loadMoreAble: false,
    },
  };
}

export default {
  //? thêm mới, cập nhập, xem, xem chi tiết khách hàng
  filter: (params?: ICustomerFilterRequest, signal?: AbortSignal) => {
    return filterCustomerSmart(urlsApi.customer.filter, params, signal);
  },

  ///list khách hàng của đối tác
  listshared: (params?: ICustomerFilterRequest, signal?: AbortSignal) => {
    return filterCustomerSmart(urlsApi.customer.listshared, params, signal);
  },

  detail: (id: number) => {
    return fetch(`${urlsApi.customer.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICustomerRequest) => {
    return apiPost(urlsApi.customer.update, body);
  },
  telesaleCallList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.customer.telesaleCallList, params, signal);
  },
  telesaleCallUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.customer.telesaleCallUpdate, body);
  },
  updateByField: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.customer.updateByField, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.customer.delete}?id=${id}`);
  },
  deleteAll: (body) => {
    return apiPost(`${urlsApi.customer.delete}`, body);
  },
  checkInProcess: (body) => {
    return apiPost(`${urlsApi.customer.checkInProcess}`, body);
  },
  addOther: (body) => {
    return apiPost(urlsApi.customer.addOther, body);
  },
  //* Lấy ra danh sách khách hàng dự vào lstId
  listById: (params?: IListByIdFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.customer.listById, params, signal);
  },
  //? cập nhật hàng loạt
  updateCustomerGroup: (body: IUpdateCustomerGroupRequest) => {
    return apiPost(urlsApi.customer.updateCustomerGroup, body);
  },
  updateOneRelationship: (body: IUpdateOneRelationshipRequest) => {
    return apiPost(urlsApi.customer.updateOneRelationship, body);
  },
  updateCustomeRelationship: (body: IUpdateCustomeRelationshipRequest) => {
    return apiPost(urlsApi.customer.updateCustomeRelationship, body);
  },
  updateCustomerSource: (body: IUpdateCustomerSourceRequest) => {
    return apiPost(urlsApi.customer.updateCustomerSource, body);
  },
  updateCustomerEmployee: (body: IUpdateCustomerEmployeeRequest) => {
    return apiPost(urlsApi.customer.updateCustomerEmployee, body);
  },
  //? thêm mới, cập nhật, xem, xem chi tiết lịch điều trị
  linkUser: (id: number, userId: number) => {
    return fetch(urlsApi.customer.link, {
      method: "POST",
      body: JSON.stringify({ id, userId }),
    }).then((res) => res.json());
  },
  filterScheduler: (params: ICustomerSchedulerFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.customer.filterScheduler, params, signal);
  },
  updateScheduler: (body: ICustomerSchedulerRequest) => {
    return apiPost(urlsApi.customer.updateScheduler, body);
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
    return apiGet(urlsApi.customer.customerExchangeList, params, signal);
  },
  customerExchangeUpdate: (body: ICustomerExchangeUpdateRequestModel) => {
    return apiPost(urlsApi.customer.customerExchangeUpdate, body);
  },
  customerExchangeDelete: (id: number) => {
    return apiDelete(`${urlsApi.customer.customerExchangeDelete}?id=${id}`);
  },
  //* Gửi sms, gửi email
  // customerSendSMS: (body: ICustomerSendSMSRequestModel) => {
  //   return fetch(`${urlsApi.customer.customerSendSMS}?templateId=${body.templateId}&customerId=${body.customerId}`, {
  //     method: "GET",
  //   }).then((res) => res.json());
  // },
  customerSendSMS: (body: ICustomerSendSMSRequestModel) => {
    return apiPost(urlsApi.customer.customerSendSMS, body);
  },
  customerSendEmail: (body: ICustomerSendEmailRequestModel) => {
    return apiPost(urlsApi.customer.customerSendEmail, body);
  },
  customerSendZalo: (body: ICustomerSendZaloRequestModel) => {
    return apiPost(urlsApi.customer.customerSendZalo, body);
  },
  //? Lấy số điện thoại, email bị che
  viewPhone: (id: number) => {
    return fetch(`${urlsApi.customer.viewPhone}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  viewFullPhone: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.customer.viewFullPhone, params);
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
    return apiPost(urlsApi.customer.addCustomerViewer, body);
  },
  // lấy về danh sách người xem
  lstCustomerViewer: (id: number) => {
    return fetch(`${urlsApi.customer.lstCustomerViewer}?customerId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 người xem
  deleteCustomerViewer: (id: number) => {
    return apiDelete(`${urlsApi.customer.deleteCustomerViewer}?id=${id}`);
  },

  // thêm khách hàng vào chương trình MA
  addCustomerMA: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.customer.addCustomerMA, body);
  },

  //Danh sách tỉnh/thành phố
  areaList: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.customer.area, params, signal);
  },

  // import khách hàng b2
  autoProcess: (body: IAutoProcessModalProps) => {
    return apiPost(urlsApi.customer.autoProcess, body);
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.customer.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },
  // tương tác khách hàng
  customerReport: (params: ICustomerReportProps) => {
    return apiGet(urlsApi.customer.customerReport, params);
  },
  detailCustomerReport: (params: IDetailCustomerReportProps) => {
    return apiGet(urlsApi.customer.detailCustomerReport, params);
  },
  // danh sách các file đã tải
  lstAttachments: (params: ILstAttachmentsFilterRequest) => {
    return apiGet(urlsApi.customer.lstAttachments, params);
  },
  // chi tiết tương tác từng khách hàng trong mục chi tiết khách hàng
  descCustomerReport: (params: IDescCustomerReportFilterRequest) => {
    return apiGet(urlsApi.customer.descCustomerReport, params);
  },

  //khách hàng theo doi tk Zalo nào
  customerZaloOA: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.customer.customerZaloOA, params);
  },

  // đoạn này là api bộ lọc nâng cao
  filterAdvanced: (params) => {
    return apiGet(urlsApi.customer.filterAdvanced, params);
  },

  createFilterAdvanced: (body) => {
    return apiPost(urlsApi.customer.createFilterAdvanced, body);
  },

  deleteFilterAdvanced: (id: number) => {
    return apiDelete(`${urlsApi.customer.deleteFilterAdvanced}?id=${id}`);
  },

  customerAttributes: () => {
    return fetch(`${urlsApi.customer.customerAttributes}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  filterLstCustomer: (id: number, params: Record<string, unknown>) => {
    return fetch(`${urlsApi.customer.filterLstCustomer}/${id}/customers${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // lấy ra các trường trong table
  filterTable: (params?: IFieldCustomerFilterRequest) => {
    return apiGet(urlsApi.customer.filterTable, params);
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
    return apiGet(urlsApi.customer.exAttributes, params);
  },

  createOpportunity: (body) => {
    return apiPost(urlsApi.customer.createOpportunity, body);
  },
  lstOpportunity: (params) => {
    return apiGet(urlsApi.customer.lstOpportunity, params);
  },
  deleteOpportunity: (id) => {
    return apiDelete(`${urlsApi.customer.deleteOpportunity}?id=${id}`);
  },
  detailOpportunity: (id) => {
    return fetch(`${urlsApi.customer.detailOpportunity}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  lstUpload: (params) => {
    return apiGet(urlsApi.customer.lstUpload, params);
  },

  // api phân tích chân dung khách hàng
  classifyAge: (params) => {
    return apiGet(urlsApi.customer.classifyAge, params);
  },

  classifyGender: (params) => {
    return apiGet(urlsApi.customer.classifyGender, params);
  },

  classifyIdentify: (params) => {
    return apiGet(urlsApi.customer.classifyIdentify, params);
  },

  classifyTopRevenue: (params) => {
    return apiGet(urlsApi.customer.classifyTopRevenue, params);
  },

  classifyTopBought: (params) => {
    return apiGet(urlsApi.customer.classifyTopBought, params);
  },

  classifyTopValueInvoice: (params) => {
    return apiGet(urlsApi.customer.classifyTopValueInvoice, params);
  },

  classifyNotInteractDay: (params) => {
    return apiGet(urlsApi.customer.classifyNotInteractDay, params);
  },

  classifyTopInteract: (params) => {
    return apiGet(urlsApi.customer.classifyTopInteract, params);
  },

  classifyCampaignJoined: (params) => {
    return apiGet(urlsApi.customer.classifyCampaignJoined, params);
  },

  classifyCustType: (params) => {
    return apiGet(urlsApi.customer.classifyCustType, params);
  },

  classifyCustGroup: (params) => {
    return apiGet(urlsApi.customer.classifyCustGroup, params);
  },

  classifyCustSource: (params) => {
    return apiGet(urlsApi.customer.classifyCustSource, params);
  },

  classifyCustCareer: (params) => {
    return apiGet(urlsApi.customer.classifyCustCareer, params);
  },

  classifyCustArea: (params) => {
    return apiGet(urlsApi.customer.classifyCustArea, params);
  },

  classifyCustomerCard: (params) => {
    return apiGet(urlsApi.customer.classifyCustomerCard, params);
  },

  classifyInteractTimes: (params) => {
    return apiGet(urlsApi.customer.classifyInteractTimes, params);
  },

  // gợi ý các sản phẩm/dịch vụ cho khách hàng
  serviceSuggestions: (params) => {
    return apiGet(urlsApi.customer.serviceSuggestions, params);
  },
  // phiên bản v2
  serviceSuggestionsv2: (params) => {
    return apiGet(urlsApi.customer.serviceSuggestionsv2, params);
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
    return apiPost(urlsApi.customer.updateChartDynamicChart, body);
  },
  deleteChartDynamicChart: (id: number) => {
    return apiDelete(`${urlsApi.customer.deleteChartDynamicChart}?id=${id}`);
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

  export: (params?: { unitCode: string; month: number; year: number }) => {
    return fetch(`${urlsApi.payroll.export}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res);
  },

  //create call TNEX-Athena
  loginAccountAthena: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.customer.loginAccountAthena, body);
  },
  createCall: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.customer.update, body);
  },
  getAccountCall: () => {
    return fetch(`${urlsApi.customer.getAccountCall}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //Chạy lại dữ liệu
  reloadData: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.customer.reloadData, body);
  },

  // chia data khách hàng Tnex
  customerAssign: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.customer.customerAssign, body);
  },

};
