import { IBoughtCustomerCardResponse } from "./BoughtCustomerCardResponse";

export interface AddBoughtCustomerCardModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idCustomer: number;
  invoiceId: number;
  data: IBoughtCustomerCardResponse;
}
