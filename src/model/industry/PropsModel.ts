import { IIndustryResponseModel } from "./IndustryResponseModel";

export interface IAddKeyWordIndustryModalProps {
  onShow: boolean;
  data?: IIndustryResponseModel;
  onHide: (reload: boolean) => void;
}

export interface IKeywordIndustryListProps {
  onBackProps: (isBack: boolean) => void;
}
