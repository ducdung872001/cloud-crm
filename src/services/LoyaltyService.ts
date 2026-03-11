import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IProgramRoyaltyRequest } from "@/model/loyalty/RoyaltyRequest";
import { ILoyaltyPointLedgerRequest } from "@/model/loyalty/RoyaltyRequest";
import { ILoyaltyRewardRequest, ILoyaltySegmentRequest, ILoyaltyWalletRequest } from "@/model/loyalty/RoyaltyRequest";



export default {
  //chương trình khách hàng thân thiết
  list: (params: IProgramRoyaltyRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyProgram}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IProgramRoyaltyRequest) => {
    return fetch(urlsApi.ma.updateLoyaltyProgram, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltyProgram}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // Danh sách hội viên
  listLoyaltyPointLedger: (params: ILoyaltyPointLedgerRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyPointLedger}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateLoyaltyPointLedger: (body: ILoyaltyPointLedgerRequest) => {
    return fetch(urlsApi.ma.updateLoyaltyPointLedger, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLoyaltyPointLedger: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltyPointLedger}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //danh sách đổi thưởng 
  listLoyaltyReward: (params: ILoyaltyRewardRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyReward}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateLoyaltyReward: (body: ILoyaltyRewardRequest) => {
    return fetch(urlsApi.ma.updateLoyaltyReward, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLoyaltyReward: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltyReward}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //phân hạng hội viên
  listLoyaltySegment: (params: ILoyaltySegmentRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltySegment}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateLoyaltySegment: (body: ILoyaltySegmentRequest) => {
    return fetch(urlsApi.ma.updateLoyaltySegment, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  deleteLoyaltySegment: (id: number) => {
    return fetch(`${urlsApi.ma.deleteLoyaltySegment}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  //ví hội viên
  listLoyaltyWallet: (params: ILoyaltyWalletRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.ma.listLoyaltyWallet}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
