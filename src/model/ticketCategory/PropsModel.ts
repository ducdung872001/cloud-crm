import { ITicketCategoryResponse } from "./TicketCategoryResponseModel";

export interface IAddTicketCategoryModalProps {
  onShow: boolean;  
  data?: ITicketCategoryResponse;
  onHide: (reload: boolean) => void;
}
