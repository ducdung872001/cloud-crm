export interface IServiceRespone {
  id: number;
  avatar?: string;
  name: string;
  intro?: string;
  price?: number;
  discount?: number;
  retail?: number;
  retailPrice?: number;
  parentId?: number;
  totalTime?: number;
  createdTime?: string;
  active: number;
  orderedNum?: number;
  position?: number;
  diaryNum?: number;
  featured?: number;
  youngAge?: number;
  middleAge?: number;
  oldAge?: number;
  treatmentNum?: number;
  categoryId?: number;
  categoryName?: string;
  servicePreviews?: string;
  strServiceProcs?: string;
  strServicePricelists?: string;
  strServicePreviews?: string;
  content?: string;
  hashedLink?: string;
  isRedirect?: string;
  pageTitle?: string;
  pageDescription?: string;
  pageKeyword?: string;
  isCombo?: number;
  priceVariation: string;
  documents?: any;
  code?: string;
}

export interface IPriceVariationResponse {
  priceId: string;
  price: number;
  name: string;
  discount: number;
  treatmentNum: number;
}
