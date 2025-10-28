import { ICashBookResponse } from "model/cashbook/CashbookResponseModel";

export interface AddCashBookModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  dataCashBook?: ICashBookResponse;
  type: number;
  dataContractPayment?: any;
}
