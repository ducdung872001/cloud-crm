export interface IModalAddImageProps {
  onShow: boolean;
  onHide: () => void;
  callback?: (lstUrl: string[]) => void;
}

export interface IModalAddVideoProps {
  onShow: boolean;
  onHide: () => void;
  callback?: (url: string, thumbnail?: string) => void;
}

// interface chỉnh sửa chi tiết 1 ảnh
export interface IEditImageModal {
  onShow: boolean;
  image: string;
  width?: number | string;
  height?: number | string;
  desc?: string;
  link?: string;
  imgAlign?: string;
  onHide: () => void;
  onUpdate: (newUrl, link, width, height, desc, imgAlign) => void;
}

export interface IColorPickerModal {
  onShow: boolean;
  color?: string;
  onHide: () => void;
  callback?: (color: string) => void;
}