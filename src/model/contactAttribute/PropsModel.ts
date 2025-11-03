import { IContactAttributeResponse } from "./ContactAttributeResponse";

export interface AddContactAttributeModalProps {
  onShow: boolean;
  dataContactAttribute?: IContactAttributeResponse;
  onHide: (reload: boolean) => void;
}

export interface IContactAttributeListProps {
  onBackProps: (isBack: boolean) => void;
}
