export interface IContactAttributeFilterRequest {
    name?: string;
    isParent?: number;
    page?: number;
    limit?: number;
  }
  
  export interface IContactAttributeRequest {
    id: number;
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
  