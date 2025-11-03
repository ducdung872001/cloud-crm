import { IPaymentHistoryResponse } from "./PaymentHistoryResponseModel";

export interface AddPaymentHistoryModalProps {
  onShow: boolean;
  data?: IPaymentHistoryResponse;
  onHide: (reload: boolean) => void;
}
