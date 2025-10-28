import { IBrandNameResponseModel } from "./BrandNameResponseModel";

export interface IAddBrandNameModelProps {
  onShow: boolean;
  data?: IBrandNameResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IBrandNameListProps {
  onBackProps: (isBack: boolean) => void;
}
