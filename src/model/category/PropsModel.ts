import { ICategoryResponse } from "./CategoryResponse";

export interface AddCategoryModalProps {
  onShow: boolean;
  data?: ICategoryResponse;
  tab?: number;
  onHide: (reload: boolean) => void;
}
