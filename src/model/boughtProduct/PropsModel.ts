import { IBoughtProductResponse } from "./BoughtProductResponseModel";

export interface AddBoughtProductModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idCustomer: number;
  invoiceId: number;
  data: IBoughtProductResponse;
  dataSuggestedProduct: any;
}
