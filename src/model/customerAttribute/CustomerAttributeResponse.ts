export interface ICustomerAttributeResponse {
  id: number;
  custType: number;
  bsnId: number;
  parentId?: number;
  parentName?: string;
  name: string;
  fieldName: string;
  required: number | string;
  readonly: number | string;
  uniqued: number | string;
  datatype: string;
  attributes?: string; 
  position: number;  
}