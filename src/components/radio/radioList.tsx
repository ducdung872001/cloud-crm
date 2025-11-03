import React, { ReactElement } from "react";
import Radio, { RadioProps } from "./radio";
import "./radioList.scss";

interface RadioListProps {
  title?: string | ReactElement;
  titlePosition?: "left";
  icon?: React.ReactElement;
  iconClickEvent?: React.ReactEventHandler;
  className?: string;
  name: string;
  options: RadioProps[];
  required?: boolean;
  disabled?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  error?: boolean;
  message?: string;
  warning?: boolean;
  messageWarning?: string;
  onChange?: any;
  onClick?: any;
}
export default function RadioList(props: RadioListProps) {
  const {
    title,
    titlePosition,
    className,
    name,
    options,
    disabled,
    required,
    value,
    defaultValue,
    error,
    message,
    warning,
    messageWarning,
    onChange,
    onClick,
    icon,
    iconClickEvent,
  } = props;

  return (
    <div
      className={`radio-list${className ? ` ${className}` : ""}${error ? " invalid" : ""}${warning ? " warning" : ""}${title ? " has-title" : ""}${
        title && titlePosition ? ` has-title__${titlePosition}` : ""
      }`}
    >
      {title && icon ? (
        <div className="radio-title-icon">
          <span className="title-radio">
            {title}
            {required && <span className="required"> * </span>}
          </span>
          <span className="icon-radio" onClick={iconClickEvent ? iconClickEvent : undefined}>
            {icon}
          </span>
        </div>
      ) : title ? (
        <span className={`radio-list__title ${disabled ? "disabled__radio--title" : ""}`}>
          {title}
          {required && <span className="required"> * </span>}
        </span>
      ) : null}
      <div className="form-group">
        {options.map((option, index) => (
          <Radio
            key={index}
            label={option.label}
            value={option.value}
            checked={value && value === option.value}
            defaultChecked={defaultValue && defaultValue === option.value}
            name={name}
            disabled={disabled || option.disabled}
            onChange={(e) => {
              option.onChange ? option.onChange(e) : undefined;
              onChange ? onChange(e) : undefined;
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
