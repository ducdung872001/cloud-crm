import { ICategoryServiceResponseModel } from "./CategoryServiceResponseModel";

export interface IAddCategoryServiceModelProps {
  onShow: boolean;
  data?: ICategoryServiceResponseModel;
  onHide: (reload: boolean) => void;
}

export interface ICategoryServiceListProps {
  onBackProps: (isBack: boolean) => void;
}
