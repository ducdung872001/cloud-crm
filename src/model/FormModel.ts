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
  onFocus?: (e: React.FocusEvent) => void;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onChangeContent?: (content: string) => void;
  onClick?: (e: React.MouseEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onKeyUp?: (e: React.KeyboardEvent) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  className?: string;
  required?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  refElement?: React.RefObject<HTMLElement>;
  autoComplete?: string;
  regex?: RegExp;
  isMaxDate?: boolean;
  isMinDate?: boolean;
  isFmtText?: boolean;

  //Dành cho input có lựa chọn
  nameOptions?: string;
  onChangeValueOptions?: (value: string | number) => void;

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
  onMenuOpen?: () => void;
  isFormatOptionLabel?: boolean;
  formatOptionLabel?: (option: IOption) => React.ReactNode;
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
  minDate?: Date | string;
  maxDate?: Date | string;

  // Textarea
  fillColor?: boolean;

  //Truyền trực tiếp 1 component tùy chỉnh vào để hiển thị
  snippet?: React.ReactElement;

  //Lưu lại editor (trường hợp là trường soạn thảo)
  saveEditor?: (content: string) => void;
}

export interface IValidation {
  name: string;
  rules: string;
}
export interface IFormData {
  values: Record<string, unknown>;
  errors?: Record<string, unknown>;
}
