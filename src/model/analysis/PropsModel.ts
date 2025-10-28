export interface ShowDetailPostModalProps {
  onShow: boolean;
  idPost?: number;
  onHide: (reload: boolean) => void;
}
