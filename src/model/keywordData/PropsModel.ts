import { IKeyWordDataResponse } from "./KeywordDataResponse";

export interface AddDataKeywordModalProps {
  onShow: boolean;
  data?: IKeyWordDataResponse;
  onHide: (reload: boolean) => void;
}

export interface IKeywordDataListProps {
  onBackProps: (isBack: boolean) => void;
}
