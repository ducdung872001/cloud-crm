import { IBoughtServiceResponse } from "./BoughtServiceResponseModel";

export interface AddBoughtServiceProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idCustomer: number;
  invoiceId: number;
  data: IBoughtServiceResponse;
}
