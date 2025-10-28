export interface IContactPipelineFilterRequest {
    name?: string;
    page?: number;
    limit?: number;
  }
  
  export interface IContactPipelineRequest {
    id: number;
    name: string;  
    position: number | string;  
  }
  