import { ICareerResponse } from "./CareerResponse";

export interface AddCareerModalProps {
  onShow: boolean;
  data?: ICareerResponse;
  onHide: (reload: boolean) => void;
  custType?: any;
}

export interface ICustomerCareerListProps {
  onBackProps: (isBack: boolean) => void;
}
