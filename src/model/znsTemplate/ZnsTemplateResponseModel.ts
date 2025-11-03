export interface IZnsTemplateResponse {
  id: number;
  templateId: number;
  templateName: string;  
  status: string;
  templateQuality: string;
  oaId: string;
  createdTime: number | string;  
  bsnId?: number;
}
