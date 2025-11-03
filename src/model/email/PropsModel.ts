import { IEmailResponse } from "model/email/EmailResponseModel";

export interface IEmailListProps {
  data: IEmailResponse;
}

export interface IAddEmailModelProps {
  onShow: boolean;
  data?: any;
  emailOrg?: string;
  bsnId?: number;
  onHide: (reload: boolean) => void;
  callback?: (codes: object) => void;
}
