import { IRelationShipResposne } from "./RelationShipResposne";

export interface AddRelationShipModalProps {
  onShow: boolean;
  data?: IRelationShipResposne;
  onHide: (reload: boolean) => void;
}

export interface ICustomerRelationshipListProps {
  onBackProps: (isBack: boolean) => void;
}
