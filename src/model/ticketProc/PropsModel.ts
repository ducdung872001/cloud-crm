import { ITicketProcResponse } from "./TicketProcResponseModel";

export interface IAddTicketProcModalProps {
  onShow: boolean;  
  data?: ITicketProcResponse;
  onHide: (reload: boolean) => void;
}
