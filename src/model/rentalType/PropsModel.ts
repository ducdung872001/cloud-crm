import { IRentalTypeResponse } from "./RentalTypeResponseModel";

export interface IAddRentalTypeModalProps {
  onShow: boolean;
  data?: IRentalTypeResponse;
  onHide: (reload: boolean) => void;
}

export interface IRentalTypeListProps {
  onBackProps: (isBack: boolean) => void;
}
