export interface IZnsTemplateFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
}

export interface IZnsTemplateRequest {
  id: number;
  name: string;  
  position: number | string;  
  oaId?: string;
}
