export interface ICustomerAttributeFilterRequest {
  name?: string;
  isParent?: number;
  page?: number;
  limit?: number;
}

export interface ICustomerAttributeRequest {
  id: number;
  custType?: number | string;
  bsnId: number;
  parentId?: number;
  name: string;
  fieldName: string;  
  required: number | string;
  readonly: number | string;
  uniqued: number | string;
  datatype: string;
  attributes?: string;
  position: number;
}
