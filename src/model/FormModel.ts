import { ReactElement } from "react";
import { IOption } from "./OtherModel";

export interface IFieldCustomize {
  label: string | ReactElement;
  labelPosition?: "left";
  labelHidden?: boolean;
  fill?: boolean;
  type: "select" | "date" | "checkbox" | "radio" | "tags" | "number" | "text" | "password" | "textarea" | "editor" | "custom";
  name: string;
  disabled?: boolean;
  placeholder?: string;
  onFocus?: any;
  value?: string;
  onChange?: any;
  onChangeContent?: any;
  onClick?: any;
  onBlur?: any;
  onKeyDown?: any;
  onKeyUp?: any;
  onKeyPress?: any;
  className?: string;
  required?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  refElement?: any;
  autoComplete?: string;
  regex?: RegExp;
  isMaxDate?: boolean;
  isMinDate?: boolean;
  isFmtText?: boolean;

  //Dành cho input có lựa chọn
  nameOptions?: string;
  onChangeValueOptions?: any;

  // Number
  suffixes?: string;
  currency?: string;
  thousandSeparator?: boolean;
  maxValue?: number;
  minValue?: number;
  allowNegative?: boolean;
  allowLeadingZeros?: boolean;
  isButton?: boolean;
  isDecimalScale?: boolean;
  // Select, checkbox, radio
  options?: IOption[];
  // Select
  isLoading?: boolean;
  isSearchable?: boolean;
  onMenuOpen?: any;
  isFormatOptionLabel?: boolean;
  formatOptionLabel?: any;
  // Tags
  tagsData?: string[];
  acceptPaste?: boolean;

  isWarning?: boolean;
  messageWarning?: string;

  // Dành cho validate theo regex
  messageErrorRegex?: string;

  isAsync?: boolean;
  loadOptions?: () => void;

  icon?: React.ReactElement;
  iconPosition?: "left" | "right";
  iconClickEvent?: React.ReactEventHandler;

  // Date
  hasSelectTime?: boolean;
  calculatorTime?: boolean;
  minDate?: any;
  maxDate?: any;

  // Textarea
  fillColor?: boolean;

  //Truyền trực tiếp 1 component tùy chỉnh vào để hiển thị
  snippet?: React.ReactElement;

  //Lưu lại editor (trường hợp là trường soạn thảo)
  saveEditor?: any;
}

export interface IValidation {
  name: string;
  rules: string;
  message?: Record<string, string>;
}
export interface IFormData {
  values: Record<string, any>;
  errors?: Record<string, any>;
}
