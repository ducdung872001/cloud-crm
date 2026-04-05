export interface AddProductProps {
  onShow: boolean;
  idProduct: number;
  onHide: (reload: boolean) => void;
  data?: Record<string, unknown>;
}

export interface IProductListProps {
  onBackProps: (isBack: boolean) => void;
}
