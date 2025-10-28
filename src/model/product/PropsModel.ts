export interface AddProductProps {
  onShow: boolean;
  idProduct: number;
  onHide: (reload: boolean) => void;
  data?: any;
}

export interface IProductListProps {
  onBackProps: (isBack: boolean) => void;
}
