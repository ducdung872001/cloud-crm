export interface ITemplateZaloFilterRequest {
    name: string;
    type?: number;
    tcyId?: number;
    page?: number;
    limit?: number;
  }
  
  export interface ITemplateZaloRequestModel {
    title: string;
    content: string;
    initialContent?: string;
    contentDelta: string;
    type: string;
    tcyId: number;
    placeholder: string;
  }
  