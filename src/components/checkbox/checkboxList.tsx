import React, { ReactElement } from "react";
import Checkbox, { CheckboxProps } from "./checkbox";
import "./checkboxList.scss";

interface CheckboxListProps {
  title: string | ReactElement;
  titlePosition?: "left";
  options: CheckboxProps[];
  required?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  error?: boolean;
  message?: string;
  warning?: boolean;
  messageWarning?: string;
  onChange?: any;
  onClick?: any;
}
export default function CheckboxList(props: CheckboxListProps) {
  const { title, titlePosition, options, disabled, required, value, defaultValue, error, message, warning, messageWarning, onChange, onClick } =
    props;

  const onChangeValue = (e) => {
    const values = value.split(",").filter((value) => value);
    if (e.target.checked) {
      !values.includes(e.target.value) ? values.push(e.target.value) : "";
      onChange(values.toString());
    } else {
      onChange(values.filter((value) => value !== e.target.value).toString());
    }
  };

  return (
    <div
      className={`radio-list${title ? " has-title" : ""}${error ? " invalid" : ""}${warning ? " warning" : ""}${
        title && titlePosition ? ` has-title__${titlePosition}` : ""
      }`}
    >
      {title && (
        <span className="radio-list__title">
          {title}
          {required && <span className="required"> * </span>}
        </span>
      )}
      <div className="form-group">
        {options.map((option, index) => (
          <Checkbox
            key={index}
            label={option.label}
            value={option.value}
            checked={value && value.split(",").includes(option.value.toString())}
            defaultChecked={defaultValue && defaultValue.split(",").includes(option.value.toString())}
            disabled={disabled || option.disabled}
            onChange={(e) => {
              option.onChange ? option.onChange(e) : undefined;
              onChange ? onChangeValue(e) : undefined;
            }}
            onClick={(e) => {
              option.onClick ? option.onClick(e) : undefined;
              onClick ? onClick(e) : undefined;
            }}
          />
        ))}
      </div>
      {error && message && <div className="has-error">{message}</div>}
      {warning && messageWarning && <div className="has-warning">{messageWarning}</div>}
    </div>
  );
}
