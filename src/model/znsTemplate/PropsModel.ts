import { IZnsTemplateResponse } from "./ZnsTemplateResponseModel";

export interface AddZnsTemplateModalProps {
  onShow: boolean;
  data?: IZnsTemplateResponse;
  onHide: (reload: boolean) => void;
  zaloOa: any;
}

export interface IZnsTemplateListProps {
  onBackProps: (isBack: boolean) => void;
}
