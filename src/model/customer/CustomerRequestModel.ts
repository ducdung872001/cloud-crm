import { ICustomerResponse } from "./CustomerResponseModel";

export interface ICustomerRequest {
  id?: number;
  sourceId?: number;
  name: string;
  code?: string;
  profileLink?: string;
  recommenderPhone?: string;
  gender?: string;
  address?: string;
  phone?: string;
  birthday?: string;
  branchId?: number;
  careers?: any;
  careerId: number;
  employeeId?: number;
  cgpId?: number;
  avatar: string;
  email?: string;
  emailMasked?: string;
  firstCall: string;
  height: string;
  weight: string;
  profileStatus?: string;
  secondProfileLink?: string;
  secondProfileStatus?: string;
  custType: number | string;
  trademark: string;
  taxCode: string;
  contactId?: number;
  employeeTitle?: string;
  customerExtraInfos: any; //Thuộc tính thêm
  zaloUserId?: number | string;
  // tình trạng hôn nhân
  maritalStatus: number;
  isExternal: number | string;
  relationIds: any;
}

export interface ICustomerLinkUserRequest {
  id: number;
  userId: number;
}

export interface IListByIdFilterRequest {
  lstId: string;
  page?: number;
  limit?: number;
}

export interface ICustomerFilterRequest {
  keyword?: string;
  fmtStartOrderDate?: string;
  fmtEndOrderDate?: string;
  checkDebt?: number;
  page?: number;
  limit?: number;
  branchId?: number;
  custType?: number;
}

export interface ICustomerSchedulerRequest {
  name: string;
  address?: string;
  customerId: number;
  consultantId: number;
  fmtScheduleDate: string;
  content?: string;
  note?: string;
  status: string;
}

export interface ICustomerSchedulerFilterRequest {
  keyword?: string;
  fromTime?: string;
  toTime?: string;
  status?: number;
  page?: number;
  limit?: number;
  contactType?: number;
  relationshipId?: number;
  branchId?: number;
  targetBsnId?: number;
  sourceIds?: any
  employeeIds?: any;
  callStatuses?: any;
  customerExtraInfo?: any;
}

export interface IUpdateCustomerGroupRequest {
  lstId: string;
  cgpId: number;
}

export interface IUpdateOneRelationshipRequest {
  id: number;
  relationshipId: number;
}

export interface IUpdateCustomeRelationshipRequest {
  lstId: string;
  relationshipId: number;
}

export interface IUpdateCustomerSourceRequest {
  lstId: string;
  sourceId: number;
}

export interface IUpdateCustomerEmployeeRequest {
  lstId: string;
  employeeId: number;
}

export interface IUpdateCommonRequest {
  lstId: string;
  cgpId: number;
  relationshipId: number;
  sourceId: number;
  employeeId: number;
}

export interface ICustomerExchangeFilterRequest {
  customerId: number;
  type: number;
  page: number;
  limit: number;
}

export interface ICustomerFeedbackFilterRequest {
  customerId: number;
  type: number;
  page: number;
  limit: number;
}

export interface ICustomerExchangeUpdateRequestModel {
  id?: number;
  content: string;
  contentDelta?: string;
  employeeId?: number;
  type: number;
  media?: any;
  customerId: number;
}

export interface ICustomerFeedbackUpdateRequestModel {
  id?: number;
  content: string;
  contentDelta?: string;
  employeeId?: number;
  type: number;
  media?: string;
  customerId: number;
}

export interface ICustomerSendSMSRequestModel {
  templateId: number;
  customerId: number;
  mapCustomPlaceholder?: any;
}

export interface ICustomerSendEmailRequestModel {
  templateId: number;
  customerId: number;
  mapCustomPlaceholder?: any;
}

export interface ICustomerSendZaloRequestModel {
  templateId: number;
  customerId: number;
  mapCustomPlaceholder?: any;
}

export interface IAddCustomerViewerRequestModel {
  id: number;
  customerId: number;
  employeeId: number;
}

export interface IAddCustomerViewerModalProps {
  onShow: boolean;
  onHide: () => void;
  dataCustomer: ICustomerResponse;
}

export interface IAutoProcessModalProps {
  uploadId?: number;
  fileName: string;
  processErrorCode: string;
  processDuplicateCode: string;
}

// tương tác khách hàng
export interface ICustomerReportProps {
  startTime?: string;
  endTime?: string;
  limit?: number;
  branchId?: number;
}

export interface IDetailCustomerReportProps {
  keyword?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
  page?: number;
  customerId?: number;
  employeeId?: number;
}

export interface ILstAttachmentsFilterRequest {
  customerId?: number;
  page?: number;
  limit?: number;
}

export interface IDescCustomerReportFilterRequest {
  customerId?: number;
  page?: number;
  limit?: number;
}

export interface IFieldCustomerFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}
