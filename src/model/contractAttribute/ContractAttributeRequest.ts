export interface IContractAttributeFilterRequest {
  name?: string;
  isParent?: number;
  page?: number;
  limit?: number;
}

export interface IContractAttributeRequest {
  id: number;
  categoryId: number;
  name: string;
  fieldName: string;
  required: number | string;
  readonly: number | string;
  uniqued: number | string;
  datatype: string;
  attributes?: string;
  position: number;
  bsnId: number;
  parentId?: number;
  numberFormat: string;
}
