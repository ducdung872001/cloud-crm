import { IReportTemplateResponse } from "./ReportTemplateResponseModel";

export interface AddReportTemplateModalProps {
  onShow: boolean;
  data?: IReportTemplateResponse;
  onHide: (reload: boolean) => void;
}

export interface IProductReportTemplateListProps {
  onBackProps: (isBack: boolean) => void;
}
