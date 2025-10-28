export interface IContractPipelineFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IContractPipelineRequest {
  id: number;
  name: string;  
  position: number | string;  
}
