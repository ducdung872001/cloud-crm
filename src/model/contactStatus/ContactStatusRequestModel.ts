export interface IContactStatusFilterRequest {
    pipelineId?: number;
    page?: number;
    limit?: number;
  }
  
  export interface IContactStatusRequest {
    pipelineId: number;
    name: string;
    position: number; 
  }
  