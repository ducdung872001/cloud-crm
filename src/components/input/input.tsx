import RadioList from "components/radio/radioList";
import { IOption } from "model/OtherModel";
import React, { Fragment, ReactElement } from "react";
import Icon from "components/icon";

import "./input.scss";
import Tippy from "@tippyjs/react";
interface InputProps {
  id?: string;
  value?: string | number;
  type?: string;
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
  disabled?: boolean;
  onKeyPress?: any;
  readOnly?: boolean;
  defaultValue?: string | number;
  maxLength?: number;
  accept?: string;
  icon?: React.ReactElement;
  icons?: {
    name: string;
    clickEvent: React.ReactEventHandler;
  }[];
  iconPosition?: "left" | "right";
  iconClickEvent?: React.ReactEventHandler;
  refInput?: any;
  required?: boolean;
  autoComplete?: string;
  nameOptions?: string;
  valueOptions?: string | number;
  options?: IOption[];
  optionsPosition?: "left" | "right";
  onChangeValueOptions?: any;
  warningHistory?: boolean;
  onWarningHistory?: any;
}
export default function Input(props: InputProps) {
  const {
    id,
    value,
    name,
    className,
    defaultValue,
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
    onFocus,
    onBlur,
    onKeyPress,
    onKeyDown,
    onKeyUp,
    onClick,
    onChange,
    maxLength,
    accept,
    icon,
    icons,
    type,
    iconPosition,
    iconClickEvent,
    refInput,
    required,
    autoComplete,
    nameOptions,
    options,
    optionsPosition,
    valueOptions,
    onChangeValueOptions,
    warningHistory,
    onWarningHistory
  } = props;

  const iconComponent = () => {
    return (
      <Fragment>
        {icon && (
          <span onClick={iconClickEvent ? iconClickEvent : undefined} className={`icon${iconClickEvent ? " has-event" : ""}`}>
            {icon}
          </span>
        )}
        {icons && (
          <div className="lst__icons">
            {icons.map((icon, index) => (
              <span key={index} onClick={icon.clickEvent} className={`icon${icon.clickEvent ? " has-event" : ""}`}>
                <Icon name={icon.name} />
              </span>
            ))}
          </div>
        )}
      </Fragment>
    );
  };

  const inputComponent = () => {
    return (
      <div className="base-input__input">
        <input
          readOnly={readOnly}
          type={type ? type : "text"}
          name={name}
          id={id}
          onBlur={onBlur}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onKeyUp={onKeyUp}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          onClick={onClick}
          disabled={disabled}
          onFocus={onFocus}
          defaultValue={defaultValue}
          maxLength={maxLength ? maxLength : undefined}
          required={required ?? false}
          ref={refInput ?? null}
          autoComplete={autoComplete}
          accept={accept}
        />
        {error && message && <div className="has-error">{message}</div>}
        {warning && messageWarning && <div className="has-warning">{messageWarning}</div>}
      </div>
    );
  };

  const iconInputComponent = () => {
    return (
      <div className={`base-input__input${icon ? " base-input__icon" : ""}`}>
        {iconComponent()}
        {inputComponent()}
      </div>
    );
  };

  const optionsComponent = () => {
    return (
      <div className={`base-input__options${optionsPosition ? ` base-input__options--${optionsPosition} ` : ""}`}>
        <RadioList
          options={options}
          value={valueOptions ?? ""}
          disabled={disabled}
          name={nameOptions}
          onChange={(e) => {
            onChangeValueOptions(e.target.value);
          }}
        />
        {iconInputComponent()}
      </div>
    );
  };

  return (
    <div
      className={`base-input${fill ? " base-input-fill" : ""}${error ? " invalid" : ""}${warning ? " warning" : ""}${value ? " has-value" : ""}${
        icon ? " has-icon" : ""
      }${icon ? ` has-icon__${iconPosition ?? "left"}` : ""}${icons ? ` has-icons__${iconPosition ?? "left"}` : ""}${label ? " has-label" : ""}${
        label && labelPosition ? ` has-label__${labelPosition}` : ""
      }${disabled ? " has-disabled" : ""}${className ? " " + className : ""}`}
    >
      {label ? (
        <div className="base-input__wrapper">
          <div style={{display:'flex'}}>
            <label htmlFor={name}>
              {label}
              {required && <span className="required"> * </span>}
            </label>
            {warningHistory && 
              <Tippy content={'Lịch sử thay đổi'}>
                <div 
                  style={{ alignItems:'center', display:'flex', marginLeft: 5, marginBottom: 5, cursor:'pointer'}}
                  onClick={onWarningHistory}
                >
                  <Icon name="WarningCircle" style={{width:'1.5rem', height:'1.5rem', fill: 'var(--warning-color)'}}/>
                </div>
              </Tippy>
            }
          </div>
          {icon || (nameOptions && options && options.length > 0) ? (
            <Fragment>{nameOptions && options && options.length > 0 ? optionsComponent() : iconInputComponent()}</Fragment>
          ) : (
            iconInputComponent()
          )}
        </div>
      ) : (
        <label>{nameOptions && options && options.length > 0 ? optionsComponent() : iconInputComponent()}</label>
      )}
    </div>
  );
}
