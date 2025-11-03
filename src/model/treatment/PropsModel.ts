import { ITreamentResponse, ITreamentSchedulerResponse } from "./TreamentResponseModel";

export interface AddHistoryCallCustomerProps {
  onShow: boolean;
  data?: ITreamentResponse;
  onHide: (reload: boolean) => void;
}

export interface ExtendTimeScheduleProps {
  onShow: boolean;
  data?: ITreamentResponse;
  onHide: (reload: boolean) => void;
}

export interface AddCaringEmployeeProps {
  idScheduleNext: number;
  idEmployee: number;
  onShow: boolean;
  data?: ITreamentResponse;
  onHide: (reload: boolean) => void;
}

export interface ShowCallHistoryProps {
  onShow: boolean;
  data?: ITreamentResponse;
  onHide: (reload: boolean) => void;
  customerId: number;
  employeeId: number;
  idScheduleNext: number;
}

export interface ShowServiceTreatmentProps {
  onShow: boolean;
  data?: ITreamentSchedulerResponse;
  onHide: (reload: boolean) => void;
}

export interface UpdateTreatmentHistoryProps {
  onShow: boolean;
  data?: ITreamentResponse;
  onHide: (reload: boolean) => void;
}
