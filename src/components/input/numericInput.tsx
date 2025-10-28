import React, { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import NumberFormat from "react-number-format";
import Button from "components/button/button";
import Icon from "components/icon";
import RadioList from "components/radio/radioList";
import { IOption } from "model/OtherModel";
import Tippy from "@tippyjs/react";
interface NumericInputProps {
  id?: string;
  value?: string | number;
  name?: string;
  className?: string;
  placeholder?: string;
  onChange?: any;
  onValueChange?: any;
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
  onKeyPress?: any;
  readOnly?: boolean;
  defaultValue?: string | number;
  suffixes?: string;
  currency?: string;
  thousandSeparator?: boolean;
  maxValue?: number;
  minValue?: number;
  regex?: RegExp;
  allowNegative?: boolean;
  allowLeadingZeros?: boolean;
  icon?: React.ReactElement;
  iconPosition?: "left" | "right";
  iconClickEvent?: React.ReactEventHandler;
  refInput?: any;
  required?: boolean;
  disabled?: boolean;
  isButton?: boolean;
  nameOptions?: string;
  valueOptions?: string | number;
  options?: IOption[];
  optionsPosition?: "left" | "right";
  onChangeValueOptions?: any;
  decimalScale?: number;
  isDecimalScale?: boolean;
  warningHistory?: boolean;
  onWarningHistory?: any;
}
export default function NummericInput(props: NumericInputProps) {
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
    suffixes,
    onValueChange,
    currency,
    thousandSeparator,
    maxValue,
    minValue,
    regex,
    allowNegative,
    allowLeadingZeros,
    icon,
    iconPosition,
    iconClickEvent,
    refInput,
    required,
    isButton,
    nameOptions,
    options,
    optionsPosition,
    valueOptions,
    onChangeValueOptions,
    decimalScale,
    isDecimalScale = true,
    warningHistory,
    onWarningHistory
  } = props;

  let positionSuffixes = "right";
  if (currency && currency !== "VND" && currency !== "THB" && currency !== "SEK" && currency !== "HUF") {
    positionSuffixes = "left";
  }

  const refSuffixes = useRef<HTMLDivElement>();
  const [styleNumberFormat, setStyleNumberFormat] = useState<any>(null);
  useEffect(() => {
    if (refSuffixes.current && suffixes) {
      setStyleNumberFormat({
        ...(positionSuffixes === "right" ? { paddingRight: refSuffixes.current.getBoundingClientRect().width } : {}),
        ...(positionSuffixes === "left" ? { paddingLeft: refSuffixes.current.getBoundingClientRect().width } : {}),
      });
    }
  }, [refSuffixes]);

  const iconComponent = () => {
    return (
      icon && (
        <span
          onClick={iconClickEvent ? iconClickEvent : undefined}
          className={`icon d-flex align-items-center justify-content-center${iconClickEvent ? " has-event" : ""}`}
        >
          {icon}
        </span>
      )
    );
  };

  const numberFormatComponent = () => {
    return (
      <Fragment>
        <NumberFormat
          readOnly={readOnly}
          autoComplete="off"
          name={name}
          id={id}
          onBlur={onBlur}
          onChange={onChange}
          onValueChange={onValueChange}
          onKeyPress={onKeyPress}
          onKeyUp={onKeyUp}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          onClick={onClick}
          disabled={disabled ? true : false}
          onFocus={onFocus}
          defaultValue={defaultValue}
          thousandSeparator={thousandSeparator}
          allowLeadingZeros={allowLeadingZeros ? true : false}
          allowNegative={allowNegative ? true : false}
          required={required}
          decimalScale={isDecimalScale ? decimalScale || 0 : undefined} // đoạn này thêm vào với mục đích là không cho phép nhập số thập phân
          style={styleNumberFormat}
          isAllowed={(values) => {
            const { formattedValue, floatValue } = values;
            if (formattedValue && regex && !formattedValue.match(regex)) {
              return false;
            }
            if (maxValue) {
              return formattedValue === "" || floatValue <= maxValue;
            } else if (maxValue && minValue) {
              return formattedValue === "" || (floatValue <= maxValue && floatValue >= minValue);
            } else {
              return true;
            }
          }}
          getInputRef={refInput}
        />
        {error && message && <div className="has-error">{message}</div>}
        {warning && messageWarning && <div className="has-warning">{messageWarning}</div>}
      </Fragment>
    );
  };

  const buttonComponent = () => {
    return (
      isButton && (
        <Fragment>
          <Button
            type="button"
            hasIcon={true}
            onlyIcon={true}
            color="transparent"
            className="button-number button-minus"
            onClick={() =>
              ((!allowNegative && value > 0) || allowNegative) && ((minValue && value > minValue) || !minValue)
                ? onValueChange({ value: parseInt(value.toString()) - 1 })
                : undefined
            }
          >
            <Icon name="Minus" />
          </Button>
          <Button
            type="button"
            hasIcon={true}
            onlyIcon={true}
            color="transparent"
            className="button-number button-plus"
            onClick={() => ((maxValue && value < maxValue) || !maxValue ? onValueChange({ value: parseInt(value.toString()) + 1 }) : undefined)}
          >
            <Icon name="Plus" />
          </Button>
        </Fragment>
      )
    );
  };

  const suffixesComponent = () => {
    return (
      suffixes && (
        <span className="suffixes" ref={refSuffixes}>
          {suffixes}
        </span>
      )
    );
  };

  const suffixesIconButtonInputComponent = () => {
    return (
      <div
        className={`base-input__input${suffixes ? " base-input__suffixes" : ""}${
          suffixes && positionSuffixes ? " base-input__suffixes--" + positionSuffixes : ""
        }${icon ? " base-input__icon" : ""}${isButton ? " base-input__button" : ""}`}
      >
        {suffixesComponent()}
        {buttonComponent()}
        {iconComponent()}
        {numberFormatComponent()}
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
        {suffixesIconButtonInputComponent()}
      </div>
    );
  };

  return (
    <div
      className={`base-input base-input__nummeric${fill ? " base-input-fill" : ""}${error ? " invalid" : ""}${warning ? " warning" : ""}${
        icon ? " has-icon" : ""
      }${icon ? ` has-icon__${iconPosition ?? "left"}` : ""}${label ? " has-label" : ""}${
        label && labelPosition ? ` has-label__${labelPosition}` : ""
      }${isButton ? " has-button" : ""}${disabled ? " has-disabled" : ""}${className ? " " + className : ""}${value ? " has-value" : ""}`}
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
          {nameOptions && options && options.length > 0 ? optionsComponent() : suffixesIconButtonInputComponent()}
        </div>
      ) : (
        <label>{nameOptions && options && options.length > 0 ? optionsComponent() : suffixesIconButtonInputComponent()}</label>
      )}
    </div>
  );
}
