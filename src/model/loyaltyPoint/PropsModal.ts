import { IRoyaltyPointResposne } from "./RoyaltyPointResposne";

export interface AddRoyaltyPointModalProps {
  onShow: boolean;
  data?: IRoyaltyPointResposne;
  onHide: (reload: boolean) => void;
}

export interface ICustomerRoyaltyPointListProps {
  onBackProps: (isBack: boolean) => void;
}
