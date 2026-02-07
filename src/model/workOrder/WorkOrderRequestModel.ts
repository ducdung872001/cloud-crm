import { PlotIkhDataLabelsAnimationOptions } from "highcharts";
import { IWorkExchangeResponseModal } from "./WorkOrderResponseModel";

export interface IWorkOrderFilterRequest {
  departmentId?: number;
  workType?: string;
  opportunityId?: number;
  projectId?: number;
  status?: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  type?: number;
  page?: number;
  limit?: number;
  potId?: number;
  processId?: number;
  employeeId?: number;
  participantId?: number;
  isPriority?: number;
  biddingName?: any;
  filters?: any;
}
export interface IGroupsFilterRequest {
  groupBy?: string;
  projectId?: number;
  employeeId?: number;
  participantId?: number;
}

export interface IWorkOrderRequestModel {
  id?: number;
  name: string;
  content: string;
  contentDelta: string;
  startTime: string;
  endTime: string;
  workLoad: number;
  workLoadUnit?: string;
  wteId: number;
  docLink: string;
  projectId: number;
  opportunityId: number;
  managerId: number;
  employeeId: number;
  participants: string;
  customers: string;
  status: number;
  percent: number;
  priorityLevel: string | number;
  notification: string;
  creatorId?: number;
}

export interface IUpdateParticipantRequestModel {
  id: number;
  participants: string;
}

export interface IUpdateRelatedCustomerRequestModel {
  id: number;
  customers: string;
}

export interface IUpdateRelatedWorkRequestModel {
  id: number;
  otherWorkOrders: string;
}

export interface IUpdateWorkInprogressModel {
  percent: string | number;
  note: string;
  employeeId: number;
  worId: number;
}

export interface IWorkInprogressFilterRequest {
  worId?: number;
  page?: number;
  limit?: number;
}

export interface IUpdateStatusRequest {
  id: number;
  status: number;
}

// trao đổi công việc
export interface IWorkExchangeFilterRequest {
  worId?: number;
  page?: number;
  limit?: number;
}

export interface IMessageChatWorkProps {
  dataMessage: IWorkExchangeResponseModal;
  worId: number;
  employeeId: number;
  takeHeightTextarea: (height: number) => void;
  onHide: (reload: boolean) => void;
}

export interface IMessageChatWorkRequestModal {
  content: string;
  worId: number;
  employeeId?: number;
  id?: number;
}

export interface IEmojiChatProps {
  onShow: boolean;
  dataMessage: any;
  setDataMessage: any;
  onHide: (reload: boolean) => void;
}

export interface IUpdateRatingRequestModal {
  worId: number;
  mark: number;
  content: string;
}

export interface IUpdatePriorityLevelRequestModal {
  id: number;
  priorityLevel: number;
}

export interface IAssignNegotiationWorkRequestModal {
  potId: number;
  employeeId: number;
  managerId: number;
  responseTimeDay: number;
  responseTimeHour: number;
  responseTimeMinute: number;
  processingTimeDay: number;
  processingTimeHour: number;
  processingTimeMinute: number;
  packageId: number;
  organizationId: number;
  roundEvaluation: number;
  negotiationId: number;
  note: string;
  attachments: string;
}
