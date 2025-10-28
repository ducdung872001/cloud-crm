import React, { Fragment, ReactElement } from "react";
import "./textarea.scss";
interface TextareaProps {
  id?: string;
  value?: string | number;
  name?: string;
  className?: string;
  placeholder?: string;
  onChange?: any;
  autoFocus?: boolean;
  onFocus?: any;
  onBlur?: any;
  error?: boolean;
  message?: string;
  warning?: boolean;
  messageWarning?: string;
  onKeyDown?: any;
  onKeyUp?: any;
  onClick?: any;
  label?: string | ReactElement;
  labelPosition?: "left";
  fill?: boolean;
  fillColor?: boolean;
  disabled?: boolean;
  onKeyPress?: any;
  readOnly?: boolean;
  maxLength?: number;
  refInput?: any;
  required?: boolean;
  row?: number;
}
export default function TextArea(props: TextareaProps) {
  const {
    id,
    value,
    name,
    className,
    placeholder,
    autoFocus,
    error,
    message,
    warning,
    messageWarning,
    disabled,
    readOnly,
    label,
    labelPosition,
    fill,
    fillColor,
    onFocus,
    onBlur,
    onKeyPress,
    onKeyDown,
    onKeyUp,
    onClick,
    onChange,
    maxLength,
    refInput,
    required,
    row
  } = props;

  const textareaComponent = () => {
    return (
      <Fragment>
        <textarea
          readOnly={readOnly}
          autoComplete="off"
          name={name}
          id={id}
          onBlur={onBlur}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onKeyUp={onKeyUp}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          onClick={onClick}
          disabled={disabled ? true : false}
          onFocus={onFocus}
          maxLength={maxLength ? maxLength : undefined}
          value={value}
          required={required ?? false}
          ref={refInput ?? null}
        ></textarea>
        {error && message && <div className="has-error">{message}</div>}
        {warning && messageWarning && <div className="has-warning">{messageWarning}</div>}
      </Fragment>
    );
  };
  return (
    <div
      className={`base-textarea${fill ? " base-textarea-fill" : ""}${error ? " invalid" : ""}${warning ? " warning" : ""}${
        value ? " has-value" : ""
      }${label ? " has-label" : ""}${label && labelPosition ? ` has-label__${labelPosition}` : ""}${fillColor ? " base-textarea--fill-color" : ""}${
        disabled ? " has-disabled" : ""
      }${className ? " " + className : ""}${row ? ` base-textarea-row` : ''}`}
    >
      {label ? (
        <div className="base-textarea__wrapper">
          <label htmlFor={name}>
            {label}
            {required && <span className="required"> * </span>}
          </label>
          {textareaComponent()}
        </div>
      ) : (
        <label>{textareaComponent()}</label>
      )}
    </div>
  );
}
