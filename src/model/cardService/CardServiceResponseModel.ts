export interface ICardServiceResponse {
  id: number;
  name: string;
  code?: string;
  avatar?: string;
  cash: number | string;
  account: number | string;
  note?: string;
  bsnId?: number;
  multiPurpose: number;
  serviceId: number;
  serviceCombo: string;
  treatmentNum?: number;
}
