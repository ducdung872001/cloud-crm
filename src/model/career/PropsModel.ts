import { ICareerResponse } from "./CareerResponse";

export interface AddCareerModalProps {
  onShow: boolean;
  data?: ICareerResponse;
  onHide: (reload: boolean) => void;
  custType?: string | number;
}

export interface ICustomerCareerListProps {
  onBackProps: (isBack: boolean) => void;
}
