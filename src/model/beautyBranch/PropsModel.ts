import { IBeautyBranchResponse } from "./BeautyBranchResponseModel";

export interface AddBeautyBranchModalProps {
  onShow: boolean;
  data?: IBeautyBranchResponse;
  onHide: (reload: boolean) => void;
}

export interface IBranchListProps {
  onBackProps: (isBack: boolean) => void;
}
