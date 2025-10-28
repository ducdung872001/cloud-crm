import { IKpiExchangeResponseModal } from "./KpiObjectResponseModel";

export interface IKpiObjectFilterRequest {
  name?: string; //Tên phiếu giao KPI
  kpiId?: number;
  page?: number;
  limit?: number;
}

export interface IKpiObjectRequest {
  id?: number;
  kpiId?: number;
  goalId?: number;
  threshold?: number;
  weight?: number;  
}

// trao đổi kpi
export interface IKpiExchangeFilterRequest {
  kotId?: number;
  page?: number;
  limit?: number;
}

export interface IMessageChatKpiProps {
  dataMessage: IKpiExchangeResponseModal;
  kotId: number;
  employeeId: number;
  takeHeightTextarea: (height: number) => void;
  onHide: (reload: boolean) => void;
}

export interface IMessageChatkpiRequestModal {
  content: string;
  kotId: number;
  employeeId?: number;
  id?: number;
}
