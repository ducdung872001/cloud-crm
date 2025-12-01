import React, { Fragment, ReactElement, useRef, useState } from "react";
import Select, { components } from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";
import AsyncSelect from "react-select/async";
import { IOption } from "model/OtherModel";
import "./selectCustom.scss";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
interface SelectCustomProps {
  id?: string;
  value?: any; //string | number
  defaultValue?: any;
  name?: string;
  className?: string;
  placeholder?: string;
  onChange?: any;
  autoFocus?: boolean;
  onFocus?: (e) => void;
  onBlur?: (e) => void;
  error?: boolean;
  message?: string;
  warning?: boolean;
  messageWarning?: string;
  label?: string | ReactElement;
  labelPosition?: "left";
  fill?: boolean;
  required?: boolean;
  warningHistory?: boolean;
  onWarningHistory?: any;
  disabled?: boolean;
  readOnly?: boolean;
  isSearchable?: boolean;
  options: IOption[];
  isLoading?: boolean;
  onMenuOpen?: () => void;
  refSelect?: any;
  special?: boolean;

  //Async
  isAsync?: boolean;
  loadOptions?: (inputValue: string, callback: any) => void;

  //Hiển thị hình ảnh người dùng
  isFormatOptionLabel?: boolean;
  formatOptionLabel?: any;

  //đoạn này hiển thị phân trang khi cuộn xuống
  isAsyncPaginate?: boolean;
  loadOptionsPaginate?: any;
  additional?: any;
  isMulti?: boolean;
  isClearable?: boolean;

  // icon
  isShowIcon?: boolean;
  icon?: React.ReactElement;
  iconClickEvent?: React.ReactEventHandler;
  isShowDropdownIcon?: boolean;
  styleCustom?: any;
}

export default function SelectCustom(props: SelectCustomProps) {
  const {
    id,
    value,
    defaultValue,
    name,
    className,
    placeholder,
    autoFocus,
    error,
    message,
    warning,
    messageWarning,
    onFocus,
    onBlur,
    disabled,
    readOnly,
    required,
    warningHistory,
    onWarningHistory,
    label,
    labelPosition,
    fill,
    onChange,
    isSearchable,
    options,
    isLoading,
    onMenuOpen,
    refSelect,
    isAsync,
    loadOptions,
    isFormatOptionLabel,
    formatOptionLabel,

    isAsyncPaginate,
    loadOptionsPaginate,
    additional,
    isMulti = false,
    special = false,
    isClearable = false,
    isShowIcon,
    icon,
    iconClickEvent,
    isShowDropdownIcon = true,
  } = props;
  const [onFocusSelect, setOnFocusSelect] = useState<boolean>(false);
  const [onHasValue, setOnHasValue] = useState<boolean>(options.find((o) => o.value === value) ? true : false);
  const refSelectDefault = useRef(null);

  const CustomDropdownIndicator = (props) => {
    return isShowDropdownIcon ? <components.DropdownIndicator {...props} /> : null;
  };

  const selectComponent = () => {
    if (isAsync) {
      return (
        <AsyncSelect
          id={id}
          autoFocus={autoFocus}
          name={name}
          className={`select-custom ${isFormatOptionLabel ? "select__custom-label" : ""}`}
          isSearchable={isSearchable ?? !readOnly ?? false}
          defaultValue={options.find((o) => o.value === defaultValue) ?? null}
          value={options.find((o) => o.value === value) ?? null}
          defaultOptions={options}
          placeholder={placeholder ?? " "}
          isLoading={isLoading}
          loadingMessage={() => "Đang tải"}
          loadOptions={loadOptions}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#015aa4",
              primary25: "#e9eaeb",
              primary50: "#e9eaeb",
              neutral0: "#ffffff",
              neutral70: "#015aa4",
            },
          })}
          onChange={(e) => {
            setOnHasValue(e.value !== null && e.value !== undefined && e.value !== "");
            if (refSelect && refSelectDefault.current) {
              refSelect.current.blur();
            }
            if (refSelectDefault && refSelectDefault.current) {
              refSelectDefault.current.blur();
            }
            if (onChange) {
              onChange(e);
            }
          }}
          onFocus={(e) => {
            setOnFocusSelect(true);
            if (onFocus) {
              onFocus(e);
            }
          }}
          onBlur={(e) => {
            setOnFocusSelect(false);
            if (onBlur) {
              onBlur(e);
            }
          }}
          isDisabled={disabled}
          openMenuOnClick={!readOnly}
          ref={refSelect ?? refSelectDefault}
          noOptionsMessage={() => "Không tìm thấy lựa chọn"}
          onMenuOpen={onMenuOpen}
          formatOptionLabel={formatOptionLabel}
        />
      );
    } else if (isAsyncPaginate) {
      return (
        <AsyncPaginate
          id={id}
          autoFocus={autoFocus}
          name={name}
          className={`select-custom ${isFormatOptionLabel ? "select__custom-label" : ""} ${isMulti ? "select__custom-multi" : ""}`}
          isSearchable={isSearchable ?? !readOnly ?? false}
          defaultValue={defaultValue ?? null}
          value={value ?? null}
          loadOptions={loadOptionsPaginate}
          placeholder={placeholder ?? " "}
          isLoading={isLoading}
          loadingMessage={() => "Đang tải"}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#015aa4",
              primary25: "#e9eaeb",
              primary50: "#e9eaeb",
              neutral0: "#ffffff",
              neutral70: "#015aa4",
            },
          })}
          onChange={(e) => {
            setOnHasValue(e?.value !== null && e?.value !== undefined && e?.value !== "");
            if (refSelect) {
              refSelect.current.blur();
            }
            if (onChange) {
              onChange(e);
            }
          }}
          onFocus={(e) => {
            setOnFocusSelect(true);
            if (onFocus) {
              onFocus(e);
            }
          }}
          onBlur={(e) => {
            setOnFocusSelect(false);
            if (onBlur) {
              onBlur(e);
            }
          }}
          isDisabled={disabled}
          openMenuOnClick={!readOnly}
          noOptionsMessage={() => "Không tìm thấy lựa chọn"}
          formatOptionLabel={formatOptionLabel}
          additional={additional}
          isMulti={isMulti}
          isClearable={isClearable}
          components={{ DropdownIndicator: CustomDropdownIndicator }} //
        />
      );
    } else {
      return (
        <Select
          id={id}
          autoFocus={autoFocus}
          name={name}
          className={`select-custom ${isFormatOptionLabel ? "select__custom-label" : ""} ${isMulti ? "select__custom-multi" : ""} ${
            isClearable ? "select__custom--clearable" : ""
          }`}
          isSearchable={isSearchable ?? !readOnly ?? false}
          defaultValue={(special ? defaultValue : options.find((o) => o.value === defaultValue)) ?? null}
          value={(special ? value : options.find((o) => o.value === value)) ?? null}
          options={options}
          placeholder={placeholder ?? " "}
          isLoading={isLoading}
          loadingMessage={() => "Đang tải"}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#015aa4",
              primary25: "#e9eaeb",
              primary50: "#e9eaeb",
              neutral0: "#ffffff",
              neutral70: "#015aa4",
            },
          })}
          onChange={(e) => {
            setOnHasValue(e.value !== null && e.value !== undefined && e.value !== "");
            if (refSelect) {
              refSelect.current.blur();
            }
            if (onChange) {
              onChange(e);
            }
          }}
          onFocus={(e) => {
            setOnFocusSelect(true);
            if (onFocus) {
              onFocus(e);
            }
          }}
          onBlur={(e) => {
            setOnFocusSelect(false);
            if (onBlur) {
              onBlur(e);
            }
          }}
          isDisabled={disabled}
          openMenuOnClick={!readOnly}
          ref={refSelect ?? refSelectDefault}
          noOptionsMessage={() => "Không tìm thấy lựa chọn"}
          onMenuOpen={onMenuOpen}
          isMulti={isMulti}
          formatOptionLabel={formatOptionLabel}
        />
      );
    }
  };

  return (
    <div
      className={`base-select${fill ? " base-select-fill" : ""}${onFocusSelect ? " on-focus" : ""}${error ? " invalid" : ""}${
        warning ? " warning" : ""
      }${onHasValue ? " has-value" : ""}${label ? " has-label" : ""}${label && labelPosition ? ` has-label__${labelPosition}` : ""}${
        className ? " " + className : ""
      }${disabled ? " has-disabled" : ""} ${icon ? "base-select-icon" : ""}`}
    >
      {label ? (
        <Fragment>
          <div style={{ display: "flex" }}>
            <label htmlFor={name}>
              {label}
              {required && <span className="required"> * </span>}
            </label>
            {warningHistory && (
              <Tippy content={"Lịch sử thay đổi"}>
                <div style={{ alignItems: "center", display: "flex", marginLeft: 5, marginBottom: 5, cursor: "pointer" }} onClick={onWarningHistory}>
                  <Icon name="WarningCircle" style={{ width: "1.5rem", height: "1.5rem", fill: "var(--warning-color)" }} />
                </div>
              </Tippy>
            )}
          </div>

          {selectComponent()}
        </Fragment>
      ) : (
        <Fragment>{selectComponent()}</Fragment>
      )}
      {icon && isShowIcon && (
        <span onClick={iconClickEvent ? iconClickEvent : undefined} className={`icon${iconClickEvent ? " has-event" : ""}`}>
          {icon}
        </span>
      )}
      {error && message && <div className="has-error">{message}</div>}
      {warning && messageWarning && <div className="has-warning">{messageWarning}</div>}
    </div>
  );
}
