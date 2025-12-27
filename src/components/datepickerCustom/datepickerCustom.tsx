/* eslint-disable prefer-const */
import React, { Fragment, ReactElement, useRef, useState } from "react";
import vi from "date-fns/locale/vi";
import { Portal } from "react-overlays";
import DatePicker from "react-datepicker";
import moment from "moment";
import MaskedInput from "react-text-mask";
import createAutoCorrectedDatePipe from "text-mask-addons/dist/createAutoCorrectedDatePipe";
import { useOnClickOutside } from "utils/hookCustom";
import "react-datepicker/dist/react-datepicker.css";
import "./datepickerCustom.scss";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";

interface DatePickerCustomProps {
  id?: string;
  value?: any;
  name?: string;
  className?: string;
  onChange?: any;
  onFocus?: any;
  onBlur?: any;
  error?: boolean;
  message?: string;
  warning?: boolean;
  messageWarning?: string;
  onClick?: any;
  label?: string | ReactElement;
  labelPosition?: "left";
  fill?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactElement;
  iconPosition?: "left" | "right";
  iconClickEvent?: any;
  hasSelectTime?: boolean;
  calculatorTime?: boolean;
  isMinDate?: boolean;
  isMaxDate?: boolean;
  minDate?: any;
  maxDate?: any;
  isFmtText?: boolean;
  readOnly?: boolean;
  warningHistory?: boolean;
  onWarningHistory?: any;
}
export default function DatePickerCustom(props: DatePickerCustomProps) {
  const {
    id,
    value,
    name,
    className,
    error,
    message,
    warning,
    messageWarning,
    disabled,
    label,
    labelPosition,
    fill,
    onFocus,
    onBlur,
    onClick,
    onChange,
    required,
    placeholder,
    icon,
    iconPosition,
    hasSelectTime,
    calculatorTime,
    isMinDate,
    isMaxDate,
    minDate,
    maxDate,
    isFmtText,
    iconClickEvent,
    readOnly,
    warningHistory,
    onWarningHistory,
  } = props;
  const [onFocusInput, setOnFocusInput] = useState<boolean>(false);

  const refPicker = useRef();

  const fmtValue = hasSelectTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY";

  const autoCorrectedDatePipe = createAutoCorrectedDatePipe(hasSelectTime ? "dd/mm/yyyy HH:MM" : "dd/mm/yyyy");

  useOnClickOutside(refPicker, () => setOnFocusInput(false), ["base-datepicker", "react-datepicker-popper", "base-datepicker__icon"]);

  const refInput = useRef<HTMLInputElement>();

  const timeMask = (valueMask) => {
    const chars = valueMask.split("");

    const minutes: Array<any> = [/[0-5]/, /[0-9]/];
    const date: Array<any> = [/[0-3]/, /\d/, "/", /[0-1]/, /\d/, "/", /[1-2]/, /\d/, /\d/, /\d/, " "];
    if (hasSelectTime) {
      let arr = valueMask.split(" ");
      const hours: Array<any> = [/[0-2]/, arr && arr.length > 1 && arr[1][0] == "2" ? /[0-3]/ : /[0-9]/, ":"];
      return date.concat(hours.concat(minutes));
    } else {
      return date;
    }
  };

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return calculatorTime ? currentDate.getTime() < selectedDate.getTime() : currentDate.getTime();
  };

  function parseDateString(dateStr: string): Date | null {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12) return null;
    return new Date(year, month - 1, day);
  }

  const inputComponent = () => {
    return (
      <Fragment>
        <DatePicker
          id={id}
          name={name}
          locale={vi}
          autoComplete="off"
          dateFormat={hasSelectTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
          placeholderText={placeholder}
          popperContainer={CalendarContainer}
          customInput={
            <MaskedInput
              pipe={autoCorrectedDatePipe}
              mask={timeMask}
              render={(textMaskRef, props) => (
                <input
                  {...props}
                  ref={(node) => {
                    textMaskRef(node);
                    refInput.current = node;
                  }}
                />
              )}
              keepCharPositions={true}
              guide={true}
            />
          }
          selected={
            value &&
            value.length !== 0 &&
            moment(value, hasSelectTime ? "HH:mm DD/MM/yyyy" : "DD/MM/yyyy", true).isValid() &&
            moment(value, hasSelectTime ? "HH:mm DD/MM/yyyy" : "DD/MM/yyyy", true).toDate()
          }
          // value={value ? (isFmtText ? value : moment(value).format(fmtValue)) : ""}
          value={value ? (isFmtText ? value : moment(parseDateString(value)).format(fmtValue)) : ""}
          showYearDropdown
          showMonthDropdown
          showTimeSelect={hasSelectTime}
          filterTime={filterPassedTime}
          timeCaption="Thời gian"
          onChange={(date) => {
            onChange(date || "");
          }}
          onClick={onClick}
          disabled={disabled}
          onFocus={(e) => {
            setOnFocusInput(true);
            if (onFocus) {
              onFocus(e);
            }
          }}
          onBlur={(e) => {
            setOnFocusInput(false);
            if (onBlur) {
              onBlur(e);
            }
          }}
          onCalendarClose={() => setOnFocusInput(false)}
          minDate={isMinDate ? new Date() : minDate ? minDate : false}
          maxDate={isMaxDate ? new Date() : maxDate ? maxDate : false}
          readOnly={readOnly}
        />
        {error && message && <div className="has-error">{message}</div>}
        {warning && messageWarning && <div className="has-warning">{messageWarning}</div>}
      </Fragment>
    );
  };

  return (
    <div
      className={`base-datepicker${fill ? " base-datepicker-fill" : ""}${error ? " invalid" : ""}${warning ? " warning" : ""}${
        value ? " has-value" : ""
      }${icon ? " has-icon" : ""}${onFocusInput ? " on-focus" : ""}${icon && iconPosition ? ` has-icon__${iconPosition}` : ""}${
        label ? " has-label" : ""
      }${label && labelPosition ? ` has-label__${labelPosition}` : ""}${hasSelectTime ? " has-time-select" : ""}${disabled ? " has-disabled" : ""}${
        className ? " " + className : ""
      }`}
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
          {icon ? (
            <div className="base-datepicker__icon">
              {icon && (
                <span
                  className={`icon ${iconClickEvent ? "icon-action" : ""} d-flex align-items-center justify-content-center`}
                  onClick={
                    iconClickEvent
                      ? iconClickEvent
                      : () => {
                          if (!onFocusInput) {
                            setOnFocusInput(true);
                            refInput.current.focus();
                            iconClickEvent ? iconClickEvent : undefined;
                          }
                        }
                  }
                >
                  {icon}
                </span>
              )}
              {inputComponent()}
            </div>
          ) : (
            inputComponent()
          )}
        </Fragment>
      ) : (
        <label>
          {icon && <span className="icon d-flex align-items-center justify-content-center">{icon}</span>}
          {inputComponent()}
        </label>
      )}
    </div>
  );
}

const CalendarContainer = ({ children }) => {
  const el = document.getElementsByTagName("body")[0];
  return <Portal container={el}>{children}</Portal>;
};
