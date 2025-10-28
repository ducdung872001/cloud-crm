import { ITreatmentHistoryResponseModel } from "./TreatmentHistoryResponseModel";

export interface IAddTreatmentHistoryModelProps {
  onShow: boolean;
  idCustomer?: number;
  data?: ITreatmentHistoryResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IViewDetailTreamentHistoryModalProps {
  onShow: boolean;
  data?: ITreatmentHistoryResponseModel;
  onHide: () => void;
}
