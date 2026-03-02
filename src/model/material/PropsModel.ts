export interface AddMaterialProps {
  onShow: boolean;
  idMaterial: number;
  onHide: (reload: boolean) => void;
  data?: any;
}

export interface IMaterialListProps {
  onBackProps: (isBack: boolean) => void;
}
