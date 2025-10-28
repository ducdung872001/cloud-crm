export interface IServiceFilterRequest {
  name?: string;
  categoryId?: number;
  isCombo?: number;
  page?: number;
  limit?: number;
}

export interface IServiceRequestModel {
  categoryId: number;
  avatar: string;
  name: string;
  intro: string;
  price: number;
  discount: number;
  priceVariation: string;
  retail: number;
  retailPrice: number;
  totalTime: number;
  position: number | string;
  isCombo: number | string;
  featured: number | string;
  treatmentNum: number;
  parentId: number;
  active: number;
  syncStatus: number;
  serviceExtraInfos?: any;
  documents?: any;
}
