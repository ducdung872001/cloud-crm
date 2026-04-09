export interface IProductResponse {
  id: number;
  name: string;
  avatar?: string;
  code?: string;
  productLine?: string;
  position?: number;
  status: number;
  unitId?: number;
  unitName?: string;
  price?: number;
  originalPrice?: number;      // Giá bán lẻ — từ wList API (inventory/product/list)
  priceWholesale?: number;     // Giá sỉ — từ wList API
  pricePromo?: number;
  costPrice?: number;
  type?: number;
  otherUnits: string;
  exchange?: number;
  description?: string;
  supplierId?: number | null;
  categoryId?: number | null;
  categoryName?: string;
  trackStock?: boolean;
  stock?: number;
  stockQuantity?: number;      // Tồn kho — từ wList API (inventory/product/list)
  stockWarning?: number;
  minStock?: number;
  maxStock?: number;
  showOnWeb?: boolean;
  showOnWebsite?: boolean | number;
  showImage?: boolean | number;
  showUnit?: boolean | number;
  showDescription?: boolean | number;
  showPromotionPrice?: boolean | number;
  showWholesalePrice?: boolean | number;
  showInventory?: boolean | number;
  showBarcode?: boolean | number;
  showVariant?: boolean | number;
  hideWhenOutOfStock?: boolean | number;
  // Legacy aliases vẫn giữ để tương thích với UI cũ
  showDesc?: boolean;
  showPromoPrice?: boolean;
  showStock?: boolean;
  showCategory?: boolean;
  defaultVariantId?: number;
  variantCount?: number;
  variantGroupCount?: number;
  variantGroups?: Record<string, unknown>[];
  variants?: Record<string, unknown>[];
  bsnId?: number;
  hashedLink?: string;
  pageTitle?: string;
  pageDescription?: string;
  pageKeyword?: string;
  expiredPeriod?: number;
  minQuantity?: number;
  documents?: Record<string, unknown>[];
}
