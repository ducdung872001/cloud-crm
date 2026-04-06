import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  ICampaignOpportunityFilterRequest,
  ICampaignOpportunityRequestModel,
  IOpportunityProcessUpdateRequestModel,
  IChangeEmployeeRequestModel,
  IOpportunityExchangeFilterRequest,
  IChangeSaleRequestModel,
} from "model/campaignOpportunity/CampaignOpportunityRequestModel";

export default {
  list: (params?: ICampaignOpportunityFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaignOpportunity.list, params, signal);
  },
  listViewSale: (params?: ICampaignOpportunityFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaignOpportunity.listViewSale, params, signal);
  },
  update: (body: ICampaignOpportunityRequestModel) => {
    return apiPost(urlsApi.campaignOpportunity.update, body);
  },
  //Thêm nhanh khách hàng vào chiến dịch bán hàng
  updateBatch: (body: ICampaignOpportunityRequestModel) => {
    return apiPost(urlsApi.campaignOpportunity.updateBatch, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.campaignOpportunity.delete}?id=${id}`);
  },
  opportunityProcessUpdate: (body: IOpportunityProcessUpdateRequestModel) => {
    return apiPost(`${urlsApi.campaignOpportunity.opportunityProcessUpdate}`, body);
  },
  opportunityProcessDelete: (id: number) => {
    return apiDelete(`${urlsApi.campaignOpportunity.opportunityProcessDelete}?id=${id}`);
  },
  changeEmployee: (body: IChangeEmployeeRequestModel) => {
    return apiPost(`${urlsApi.campaignOpportunity.changeEmployee}`, body);
  },
  changeSale: (body: IChangeSaleRequestModel) => {
    return apiPost(`${urlsApi.campaignOpportunity.changeSale}`, body);
  },

  opportunityExchange: (params: IOpportunityExchangeFilterRequest) => {
    return apiGet(urlsApi.campaignOpportunity.opportunityExchange, params);
  },
  // xóa đi 1 trao đổi
  deleteOpportunityExchange: (id: number) => {
    return apiDelete(`${urlsApi.campaignOpportunity.deleteOpportunityExchange}?id=${id}`);
  },
  // thêm mới trao đổi
  addOpportunityExchange: (body) => {
    return apiPost(urlsApi.campaignOpportunity.addOpportunityExchange, body);
  },

  // cập nhật lại trao đổi
  updateOpportunityExchange: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.updateOpportunityExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy danh sách cơ hội dành cho chiến dịch doanh nghiệp
  listOpportunity: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaignOpportunity.listOpportunity, params, signal);
  },

  opportunityCheck: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.campaignOpportunity.opportunityCheck, params);
  },

  sendEmail: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaignOpportunity.sendEmail, body);
  },

  opportunityContact: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaignOpportunity.opportunityContact, body);
  },

  detailOpportunityContact: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.campaignOpportunity.detailOpportunityContact, params);
  },

  ///eform thu thập thông tin

  OpportunityEformUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaignOpportunity.opportunityEformUpdate, body);
  },

  OpportunityEformDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.campaignOpportunity.opportunityEformDetail, params, signal);
  },

  // thêm mới nhiều người xem cho 1 khách hàng
  addCoyViewer: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.campaignOpportunity.addCoyViewer, body);
  },
  // lấy về danh sách người xem
  lstCoyViewer: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.lstCoyViewer}?campaignOpportunityId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 người xem
  deleteCoyViewer: (id: number) => {
    return apiDelete(`${urlsApi.campaignOpportunity.deleteCoyViewer}?id=${id}`);
  },
};
