// Select
export interface IOption {
  value: string | number;
  label: string | number;
  type?: "number" | "amount";
  disabled?: boolean;
  onChange?: any;
  onClick?: any;
}

// Notification
export interface INotification {
  total: number;
  unread: number;
  list_noti: INotificationItem[];
}
export interface INotificationItem {
  id: number;
  title: string;
  content: string;
  url: string;
  type: string;
  is_read?: boolean;
  created_at: any;
  phone?: string;
}

// Filter
export interface IFilterItem {
  key: string;
  name: string;
  type: "radio" | "select" | "date" | "date-two" | "input";
  list?: IValueFilter[];
  is_featured?: boolean;
  value: string | number;
  value_extra?: string | number; // Chỉ dành cho lọc date from -> to
  label_1?: string; // Chỉ dành cho lọc date from -> to
  label_2?: string; // Chỉ dành cho lọc date from -> to
  params?: any; // Chỉ dành cho select lấy dữ liệu từ server
  isAsync?: boolean; // Chỉ dành cho select muốn search từ serve
  disabledDelete?: boolean;
}

export interface IValueFilter {
  value: string | number | boolean;
  label: string;
}

// Sort
export interface ISortItem {
  value: string | number;
  label: string;
}

// Save search
export interface ISaveSearch {
  key: string | number;
  name: string;
  type?: string;
  is_active?: boolean;
  params?: ISaveSearchParam[];
}

export interface ISaveSearchParam {
  key: string;
  value: string | number;
  value_extra?: string | number;
}

// Tabcontent
export interface ITabContent {
  value: string;
  label: string;
  show?: boolean;
  active: boolean;
}

// Validate
export interface IValidate {
  key: string;
  message: string;
}

// Menu
export interface IMenuItem {
  title: string;
  path: string;
  icon?: any;
  action?: any;
  target?: string;
  is_active?: boolean;
  children?: IMenuItem[];
  is_show_children?: boolean;
  permission?: string[];
}

// Router
export interface IRouter {
  path: string;
  component: any;
  permission?: string[];
}

// Action
export interface IAction {
  title?: string;
  icon?: React.ReactElement;
  color?: "primary" | "destroy" | "success" | "warning" | "transparent" | "link" | "secondary";
  variant?: "outline";
  disabled?: boolean;
  is_loading?: boolean;
  data_tip?: any;
  type?: "submit" | "button";
  callback?: () => void;
}

export interface IActionModal {
  actions_left?: {
    text?: React.ReactElement;
    buttons?: IAction[];
  };
  actions_right?: {
    text?: React.ReactElement;
    buttons?: IAction[];
  };
}

// lst tab
export interface ILstDataTab {
  key: string;
  name: string;
}
