import { ITemplateCategoryResponseModel } from "./TemplateCategoryResponst";

export interface AddTemplateCategoryModalProps {
  onShow: boolean;
  nameChange: string;
  data: ITemplateCategoryResponseModel;
  onHide: (reload: boolean) => void;
}

export interface ITemplateCategoryListProps {
  titleProps: string;
  nameProps: string;
  typeProps: string;
  onBackProps: (isBack: boolean) => void;
}
