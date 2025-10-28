import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  ICampaignOpportunityFilterRequest,
  ICampaignOpportunityRequestModel,
  IOpportunityProcessUpdateRequestModel,
  IChangeEmployeeRequestModel,
  IOpportunityExchangeFilterRequest,
} from "model/campaignOpportunity/CampaignOpportunityRequestModel";

export default {
  list: (params?: ICampaignOpportunityFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaignOpportunity.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listViewSale: (params?: ICampaignOpportunityFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaignOpportunity.listViewSale}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICampaignOpportunityRequestModel) => {
    return fetch(urlsApi.campaignOpportunity.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  //Thêm nhanh khách hàng vào chiến dịch bán hàng
  updateBatch: (body: ICampaignOpportunityRequestModel) => {
    return fetch(urlsApi.campaignOpportunity.updateBatch, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  opportunityProcessUpdate: (body: IOpportunityProcessUpdateRequestModel) => {
    return fetch(`${urlsApi.campaignOpportunity.opportunityProcessUpdate}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  opportunityProcessDelete: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.opportunityProcessDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  changeEmployee: (body: IChangeEmployeeRequestModel) => {
    return fetch(`${urlsApi.campaignOpportunity.changeEmployee}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  opportunityExchange: (params: IOpportunityExchangeFilterRequest) => {
    return fetch(`${urlsApi.campaignOpportunity.opportunityExchange}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 trao đổi
  deleteOpportunityExchange: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.deleteOpportunityExchange}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // thêm mới trao đổi
  addOpportunityExchange: (body) => {
    return fetch(urlsApi.campaignOpportunity.addOpportunityExchange, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // cập nhật lại trao đổi
  updateOpportunityExchange: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.updateOpportunityExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //lấy danh sách cơ hội dành cho chiến dịch doanh nghiệp
  listOpportunity: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaignOpportunity.listOpportunity}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  opportunityCheck: (params: any) => {
    return fetch(`${urlsApi.campaignOpportunity.opportunityCheck}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  sendEmail: (body: any) => {
    return fetch(urlsApi.campaignOpportunity.sendEmail, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  opportunityContact: (body: any) => {
    return fetch(urlsApi.campaignOpportunity.opportunityContact, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detailOpportunityContact: (params: any) => {
    return fetch(`${urlsApi.campaignOpportunity.detailOpportunityContact}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  ///eform thu thập thông tin

  OpportunityEformUpdate: (body: any) => {
    return fetch(urlsApi.campaignOpportunity.opportunityEformUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  OpportunityEformDetail: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.campaignOpportunity.opportunityEformDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // thêm mới nhiều người xem cho 1 khách hàng
  addCoyViewer: (body: any) => {
    return fetch(urlsApi.campaignOpportunity.addCoyViewer, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // lấy về danh sách người xem
  lstCoyViewer: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.lstCoyViewer}?campaignOpportunityId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 người xem
  deleteCoyViewer: (id: number) => {
    return fetch(`${urlsApi.campaignOpportunity.deleteCoyViewer}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
