import { ITemplateSMSResponse } from "./TemplateSMSResponse";

export interface AddTemplateSMSModalProps {
  onShow: boolean;
  data: ITemplateSMSResponse;
  onHide: (reload: boolean) => void;
}

export interface ITemplateSMSListProps {
  onBackProps: (isBack: boolean) => void;
}
