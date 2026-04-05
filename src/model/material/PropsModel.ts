export interface AddMaterialProps {
  onShow: boolean;
  idMaterial: number;
  onHide: (reload: boolean) => void;
  data?: Record<string, unknown>;
}

export interface IMaterialListProps {
  onBackProps: (isBack: boolean) => void;
}
