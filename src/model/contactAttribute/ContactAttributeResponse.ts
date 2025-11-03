export interface IContactAttributeResponse {
    id: number;
    name: string;
    required: number | string;
    readonly: number | string;
    uniqued: number | string;
    datatype: string;
    attributes?: string;
    position: number;
    bsnId: number;
    parentId?: number;
    parentName?: string;  
  }
  